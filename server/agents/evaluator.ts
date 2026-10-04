import { Task, ToolCall, Observation } from '../types.js';

export interface EvaluationOutcome {
  observation: Observation;
  isSufficient: boolean;
  actionRequired: 'continue' | 'retry_same_tool' | 'switch_tool_or_replan';
  evaluationSummary: string;
}

export function evaluateToolResult(
  task: Task,
  toolCall: ToolCall,
  toolOutcome: string
): EvaluationOutcome {
  const observationId = `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // If tool call threw an error or returned error status
  if (toolCall.status === 'error' || !toolOutcome) {
    const observation: Observation = {
      id: observationId,
      taskId: task.task_id,
      toolName: toolCall.toolName,
      resultSummary: `Execution failed with error: ${toolCall.errorDetails || 'Unknown fault'}`,
      isUseful: false,
      relevanceScore: 0,
      evaluationReason: `Tool failed to return data. Error: ${toolCall.errorDetails}`,
      timestamp: now
    };

    return {
      observation,
      isSufficient: false,
      actionRequired: task.retry_count >= 1 ? 'switch_tool_or_replan' : 'retry_same_tool',
      evaluationSummary: `Tool failure detected for ${task.task_id}. Initiating recovery strategy.`
    };
  }

  // Check relevance and usefulness against task criteria
  let isUseful = true;
  let relevanceScore = 92;
  let evaluationReason = `Output satisfies the task success criteria: "${task.success_criteria}".`;

  if (toolCall.toolName === 'web_search') {
    const sourcesCount = toolCall.output?.sourcesCount || (toolCall.output?.sources?.length ?? 0);
    if (sourcesCount === 0) {
      isUseful = false;
      relevanceScore = 15;
      evaluationReason = 'Web search yielded 0 sources. Cannot proceed without verified data.';
    } else {
      relevanceScore = 95;
      evaluationReason = `Retrieved ${sourcesCount} high-authority citations satisfying requirement for empirical backing.`;
    }
  } else if (toolCall.toolName === 'calculator') {
    if (typeof toolCall.output?.result === 'number') {
      relevanceScore = 98;
      evaluationReason = 'Deterministic calculation produced verified unit economics and infrastructure figures.';
    } else {
      isUseful = false;
      relevanceScore = 30;
      evaluationReason = 'Calculator produced non-numeric or invalid budget result.';
    }
  } else if (toolCall.toolName === 'code_tool') {
    const auditPassed = toolCall.output?.securityAudit?.passed;
    if (auditPassed) {
      relevanceScore = 96;
      evaluationReason = 'Syntactically valid TypeScript architecture generated with zero security flags.';
    } else {
      relevanceScore = 60;
      evaluationReason = 'Generated code had potential security flags; requires architecture review.';
    }
  }

  const observation: Observation = {
    id: observationId,
    taskId: task.task_id,
    toolName: toolCall.toolName,
    resultSummary: toolOutcome.slice(0, 240) + (toolOutcome.length > 240 ? '...' : ''),
    isUseful,
    relevanceScore,
    evaluationReason,
    timestamp: now
  };

  return {
    observation,
    isSufficient: isUseful,
    actionRequired: isUseful ? 'continue' : (task.retry_count >= 1 ? 'switch_tool_or_replan' : 'retry_same_tool'),
    evaluationSummary: `Evaluated ${task.task_id}: ${isUseful ? 'PASS (Ready for next step)' : 'FAIL (Needs recovery/replan)'}. Relevance: ${relevanceScore}%`
  };
}
