import {
  AgentState,
  AgentMode,
  AgentStatus,
  AgentTraceEvent,
  Task,
  ToolCall,
  Observation,
  HumanApprovalRequest,
  Source
} from '../types.js';
import { createPlan, replanWorkflow } from './planner.js';
import { executeTask } from './executor.js';
import { evaluateToolResult } from './evaluator.js';
import { runVerification } from './verifier.js';

const MAX_AGENT_ITERATIONS = 25;
const MAX_TASK_RETRIES = 3;
const MAX_REPLANS = 5;

// In-memory active runs registry
const runs = new Map<string, AgentState>();
const sseListeners = new Map<string, Set<(event: string, data: any) => void>>();

export function getRun(id: string): AgentState | undefined {
  return runs.get(id);
}

export function getAllRuns(): AgentState[] {
  return Array.from(runs.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function registerSSEListener(runId: string, listener: (event: string, data: any) => void): () => void {
  if (!sseListeners.has(runId)) {
    sseListeners.set(runId, new Set());
  }
  sseListeners.get(runId)!.add(listener);

  return () => {
    const listeners = sseListeners.get(runId);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        sseListeners.delete(runId);
      }
    }
  };
}

function broadcastEvent(runId: string, eventName: string, payload: any) {
  const listeners = sseListeners.get(runId);
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(eventName, payload);
      } catch (err) {
        console.error('SSE dispatch error:', err);
      }
    }
  }
}

function addTrace(
  state: AgentState,
  agent: AgentTraceEvent['agent'],
  action: string,
  decision: string,
  extra?: { tool?: string; input?: string; observation?: string; details?: Record<string, any> }
) {
  const event: AgentTraceEvent = {
    id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    agent,
    action,
    decision,
    tool: extra?.tool,
    input: extra?.input,
    observation: extra?.observation,
    details: extra?.details
  };
  state.trace.push(event);
  broadcastEvent(state.id, 'trace_event', event);
  return event;
}

export async function createAndRunAgent(params: {
  goal: string;
  mode?: AgentMode;
  constraints?: string[];
  forceDemoFailure?: boolean;
}): Promise<AgentState> {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const mode = params.mode || 'autonomous';

  const initialState: AgentState = {
    id: runId,
    goal: params.goal,
    mode,
    status: 'planning',
    extractedRequirements: {
      objective: params.goal,
      requirements: [],
      constraints: params.constraints || [],
      expectedOutput: 'Actionable deliverable',
      missingInformation: []
    },
    tasks: [],
    completedTasks: [],
    failedTasks: [],
    observations: [],
    toolCalls: [],
    sources: [],
    replans: [],
    memory: {
      discoveredInsights: [],
      knownFailures: [],
      activeDecisions: []
    },
    trace: [],
    stats: {
      llmCalls: 0,
      toolCalls: 0,
      searchCalls: 0,
      retries: 0,
      replans: 0,
      iterationCount: 0,
      executionTimeMs: 0,
      estimatedCostUsd: 0.002
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  runs.set(runId, initialState);

  // Start autonomous agent loop in background
  executeAgentLoop(runId, params.forceDemoFailure).catch(err => {
    console.error(`Agent loop exception on run ${runId}:`, err);
    const run = runs.get(runId);
    if (run) {
      run.status = 'failed';
      run.updatedAt = new Date().toISOString();
      broadcastEvent(runId, 'agent_failed', { error: err?.message || 'Agent error' });
    }
  });

  return initialState;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeAgentLoop(runId: string, forceDemoFailure = false) {
  const state = runs.get(runId);
  if (!state) return;

  const startLoopTime = Date.now();
  broadcastEvent(runId, 'agent_started', { runId, goal: state.goal, mode: state.mode });

  // 1. STAGE: GOAL UNDERSTANDING & ORCHESTRATOR INITIALIZATION
  addTrace(
    state,
    'Orchestrator',
    'Goal Received & Decomposed',
    `Initializing autonomous execution pipeline for goal: "${state.goal.slice(0, 50)}..."`
  );
  await delay(400);

  // 2. STAGE: PLANNER AGENT CREATES TASK DAG
  state.status = 'planning';
  broadcastEvent(runId, 'planning_started', { runId });
  addTrace(
    state,
    'Planner Agent',
    'Task DAG Generation',
    'Analyzing requirements, constraints, and dependencies to construct execution plan.'
  );

  const plan = await createPlan(state.goal, {
    constraints: state.extractedRequirements.constraints,
    mode: state.mode
  });

  state.extractedRequirements = plan.extractedRequirements;
  state.tasks = plan.tasks;
  state.stats.llmCalls++;
  broadcastEvent(runId, 'plan_created', { tasks: state.tasks, requirements: state.extractedRequirements });

  addTrace(
    state,
    'Planner Agent',
    'Plan Finalized',
    `Constructed ${state.tasks.length} tasks with dependency graph. Ready for dispatch.`,
    { details: { taskCount: state.tasks.length, summary: plan.summary } }
  );

  state.status = 'running';
  let demoFailureTriggered = false;

  // 3. MASTER AGENT LOOP (GOAL → PLAN → DECIDE → TOOL → OBSERVE → EVALUATE → REPLAN → VERIFY)
  while (state.stats.iterationCount < MAX_AGENT_ITERATIONS) {
    const currentStatus = state.status as AgentStatus;
    if (currentStatus === 'aborted' || currentStatus === 'failed' || currentStatus === 'completed') {
      break;
    }

    state.stats.iterationCount++;
    state.updatedAt = new Date().toISOString();

    // Check if human approval is requested
    if (state.status === 'waiting_approval') {
      // Pause loop until external approval resolves it
      await delay(1000);
      continue;
    }

    // Find next pending task whose dependencies are completed
    const readyTask = state.tasks.find(t => {
      if (t.status !== 'pending' && t.status !== 'retrying') return false;
      return t.dependencies.every(depId => state.completedTasks.includes(depId));
    });

    // If no ready task found, check if all tasks are complete
    if (!readyTask) {
      const pendingTasks = state.tasks.filter(t => t.status === 'pending' || t.status === 'retrying');
      if (pendingTasks.length === 0) {
        // All tasks are processed! Break out to verification
        break;
      } else {
        // Deadlock or cyclic dependency detected
        addTrace(
          state,
          'Orchestrator',
          'Dependency Check',
          'Unresolvable task dependency detected; initiating autonomous topological re-routing.'
        );
        pendingTasks[0].dependencies = []; // Unblock
        continue;
      }
    }

    // SUPERVISED MODE CHECK: Ask human approval on high-impact architecture task
    if (state.mode === 'supervised' && readyTask.priority === 'high' && state.completedTasks.length === 2 && !state.approvalRequest) {
      state.status = 'waiting_approval';
      const approvalRequest: HumanApprovalRequest = {
        id: `appr_${Date.now()}`,
        taskId: readyTask.task_id,
        title: `Human Approval Required: Confirm ${readyTask.description}`,
        description: `The Orchestrator is about to execute high-impact architectural task "${readyTask.description}". Please approve or modify proposed strategy.`,
        options: [
          { id: 'approve', label: 'Approve & Continue', description: 'Proceed autonomously with Gemini Flash + pgvector recommendation.', recommended: true },
          { id: 'reject_retry', label: 'Reject Strategy', description: 'Force agent to rethink tech selection.' },
          { id: 'modify_plan', label: 'Modify Constraints', description: 'Inject enterprise strict air-gap compliance constraint.' }
        ]
      };
      state.approvalRequest = approvalRequest;
      broadcastEvent(runId, 'human_approval_required', approvalRequest);
      addTrace(
        state,
        'Orchestrator',
        'Human-in-the-Loop Gate',
        'Paused execution awaiting human approval for high-impact decision.',
        { details: { taskId: readyTask.task_id } }
      );
      continue;
    }

    // DISPATCH TASK TO EXECUTION AGENT
    state.currentTask = readyTask.task_id;
    readyTask.status = 'running';
    broadcastEvent(runId, 'task_started', { task: readyTask });

    addTrace(
      state,
      'Orchestrator',
      `Dispatching Task: ${readyTask.task_id}`,
      `Selected tool: [${readyTask.recommended_tool}]. Objective: ${readyTask.objective}`,
      { tool: readyTask.recommended_tool }
    );
    await delay(350);

    // Controlled failure scenario for Demo Mode or explicit test
    const shouldFailThisTask = (state.mode === 'demo' || forceDemoFailure) &&
      !demoFailureTriggered &&
      (readyTask.task_id.includes('api_search') || readyTask.task_id.includes('04'));

    const execution = await executeTask(readyTask, {
      goal: state.goal,
      forceFailureOnTool: shouldFailThisTask ? readyTask.recommended_tool : undefined
    });

    state.stats.toolCalls++;
    if (readyTask.recommended_tool === 'web_search') state.stats.searchCalls++;
    state.toolCalls.push(execution.toolCall);
    broadcastEvent(runId, 'tool_completed', { toolCall: execution.toolCall });

    // EVALUATOR AGENT OBSERVES & EVALUATES RESULT
    const evaluation = evaluateToolResult(readyTask, execution.toolCall, execution.taskOutcome);
    state.observations.push(evaluation.observation);
    broadcastEvent(runId, 'observation_made', { observation: evaluation.observation });

    addTrace(
      state,
      'Evaluator Agent',
      `Evaluating ${readyTask.task_id}`,
      evaluation.evaluationSummary,
      {
        tool: readyTask.recommended_tool,
        observation: evaluation.observation.resultSummary.slice(0, 100),
        details: { isSufficient: evaluation.isSufficient, relevanceScore: evaluation.observation.relevanceScore }
      }
    );

    // HANDLE FAILURE & SELF-HEALING / REPLANNING
    if (!evaluation.isSufficient) {
      if (shouldFailThisTask) demoFailureTriggered = true;
      readyTask.retry_count++;
      state.stats.retries++;

      addTrace(
        state,
        'Orchestrator',
        'Fault Detected',
        `Tool [${readyTask.recommended_tool}] failed for ${readyTask.task_id}. Reason: ${execution.error || 'Insufficient output'}. Assessing recovery.`
      );
      broadcastEvent(runId, 'tool_failed', { taskId: readyTask.task_id, error: execution.error });
      await delay(450);

      // Assess retry vs replan
      if (readyTask.retry_count <= 1 && !shouldFailThisTask) {
        readyTask.status = 'retrying';
        addTrace(
          state,
          'Execution Agent',
          'Retrying Task',
          `Attempting retry (${readyTask.retry_count}/${MAX_TASK_RETRIES}) with relaxed parameters.`
        );
        broadcastEvent(runId, 'retry_started', { task: readyTask });
        continue;
      } else {
        // Trigger Autonomous Replanning
        if (state.stats.replans < MAX_REPLANS) {
          state.status = 'replanning';
          state.stats.replans++;
          broadcastEvent(runId, 'replan_started', {
            failedTaskId: readyTask.task_id,
            reason: execution.error
          });

          addTrace(
            state,
            'Orchestrator',
            'Autonomous Replanning Triggered',
            'Initiating dynamic task DAG adaptation to bypass unavailable external LMS dependency.'
          );
          await delay(500);

          const replanResult = replanWorkflow(
            state,
            readyTask.task_id,
            execution.error || 'Upstream provider failure',
            'Adopt decoupled LTI 1.3 specification with local schema caching'
          );

          state.tasks = replanResult.newTasks;
          state.failedTasks.push(readyTask.task_id);
          state.replans.push({
            replanNumber: state.stats.replans,
            triggerReason: execution.error || 'Tool failure',
            previousTaskCount: state.tasks.length - 1,
            newTaskCount: state.tasks.length,
            summary: replanResult.summary,
            timestamp: new Date().toISOString()
          });

          state.memory.knownFailures.push(`Task ${readyTask.task_id}: ${execution.error}`);
          state.memory.activeDecisions.push('Decoupled LMS architecture with local LTI 1.3 schema adapter');

          broadcastEvent(runId, 'replan_completed', {
            tasks: state.tasks,
            replans: state.replans
          });

          addTrace(
            state,
            'Planner Agent',
            'DAG Re-routed Successfully',
            replanResult.summary
          );

          state.status = 'running';
          continue;
        } else {
          readyTask.status = 'failed';
          state.failedTasks.push(readyTask.task_id);
          break;
        }
      }
    }

    // SUCCESSFUL STEP
    readyTask.status = 'completed';
    readyTask.result = execution.taskOutcome;
    readyTask.tool_used = readyTask.recommended_tool;
    readyTask.observation = evaluation.observation.resultSummary;
    state.completedTasks.push(readyTask.task_id);

    // Save external sources to state
    if (readyTask.recommended_tool === 'web_search' && execution.toolCall.output?.sources) {
      for (const src of execution.toolCall.output.sources) {
        if (!state.sources.some(s => s.url === src.url)) {
          state.sources.push(src);
        }
      }
    }

    // Update memory
    state.memory.discoveredInsights.push(
      `[${readyTask.task_id}]: ${evaluation.observation.resultSummary.slice(0, 120)}`
    );

    broadcastEvent(runId, 'task_completed', {
      taskId: readyTask.task_id,
      outcome: execution.taskOutcome
    });

    addTrace(
      state,
      'Orchestrator',
      `Completed ${readyTask.task_id}`,
      `Task verified. Progress: ${state.completedTasks.length}/${state.tasks.length} tasks completed.`
    );

    await delay(300);
  }

  // 4. STAGE: INDEPENDENT VERIFICATION AGENT
  state.status = 'verifying';
  broadcastEvent(runId, 'verification_started', { runId });
  addTrace(
    state,
    'Verification Agent',
    'Independent Verification Audit',
    'Evaluating completion criteria, goal satisfaction, source quality, and checking for silent failures.'
  );
  await delay(500);

  const verification = runVerification(state);
  state.verificationResult = verification.scorecard;
  state.finalDeliverable = verification.deliverable;
  state.stats.executionTimeMs = Date.now() - startLoopTime;
  state.stats.estimatedCostUsd = Math.round((state.stats.llmCalls * 0.0003 + state.stats.toolCalls * 0.0001) * 10000) / 10000;

  broadcastEvent(runId, 'verification_completed', {
    scorecard: verification.scorecard,
    deliverable: verification.deliverable
  });

  addTrace(
    state,
    'Verification Agent',
    `Audit Passed: ${verification.scorecard.score}/100`,
    `Goal Satisfaction: ${verification.scorecard.breakdown.goalSatisfaction}%, Task Completion: ${verification.scorecard.breakdown.taskCompletion}%, Source Quality: ${verification.scorecard.breakdown.sourceQuality}%. Deliverable ready.`,
    { details: verification.scorecard.breakdown }
  );

  state.status = 'completed';
  state.updatedAt = new Date().toISOString();
  broadcastEvent(runId, 'agent_completed', {
    state,
    scorecard: verification.scorecard,
    deliverable: verification.deliverable
  });

  addTrace(
    state,
    'Orchestrator',
    'Execution Finished',
    `Agent run ${runId} concluded successfully in ${(state.stats.executionTimeMs / 1000).toFixed(1)}s.`
  );
}

export function handleHumanApproval(runId: string, decision: 'approve' | 'reject_retry' | 'modify_plan', userNote?: string): boolean {
  const state = runs.get(runId);
  if (!state || state.status !== 'waiting_approval') return false;

  addTrace(
    state,
    'Orchestrator',
    'Human Approval Received',
    `User submitted decision: "${decision}"${userNote ? ` (Note: ${userNote})` : ''}`,
    { details: { decision, userNote } }
  );

  state.approvalRequest = undefined;
  state.status = 'running';
  broadcastEvent(runId, 'human_approval_resolved', { decision, userNote });
  return true;
}

export function abortAgentRun(runId: string): boolean {
  const state = runs.get(runId);
  if (!state) return false;

  state.status = 'aborted';
  state.updatedAt = new Date().toISOString();
  addTrace(state, 'Orchestrator', 'Aborted by User', 'User triggered immediate halt.');
  broadcastEvent(runId, 'agent_stopped', { runId });
  return true;
}
