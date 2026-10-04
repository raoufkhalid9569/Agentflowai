import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { GoalInputPanel } from './components/GoalInputPanel';
import { TaskGraph } from './components/TaskGraph';
import { ExecutionTimeline } from './components/ExecutionTimeline';
import { AgentTraceView } from './components/AgentTraceView';
import { AgentTelemetryPanel } from './components/AgentTelemetryPanel';
import { FinalDeliverableModal } from './components/FinalDeliverableModal';
import { WhyAgenticModal } from './components/WhyAgenticModal';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { ToolExplorerModal } from './components/ToolExplorerModal';
import {
  AgentState,
  AgentMode,
  AgentName,
  Task
} from './types';
import {
  startAgentRun,
  stopAgentRun,
  submitHumanApproval,
  subscribeToAgentStream
} from './services/api';
import {
  GitBranch,
  PlayCircle,
  Terminal,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AgentState | null>(null);
  const [activeCenterTab, setActiveCenterTab] = useState<'timeline' | 'graph' | 'trace'>('timeline');
  const [activeAgent, setActiveAgent] = useState<AgentName>('Orchestrator');
  
  // Modals
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [showWhyAgentic, setShowWhyAgentic] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Clean up SSE stream on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Update active agent based on run status
  useEffect(() => {
    if (!state) {
      setActiveAgent('Orchestrator');
      return;
    }

    if (state.status === 'planning') {
      setActiveAgent('Planner Agent');
    } else if (state.status === 'replanning') {
      setActiveAgent('Planner Agent');
    } else if (state.status === 'verifying') {
      setActiveAgent('Verification Agent');
    } else if (state.status === 'running') {
      const currentTask = state.tasks.find(t => t.task_id === state.currentTask);
      if (currentTask?.recommended_tool === 'web_search') {
        setActiveAgent('Research Agent');
      } else {
        setActiveAgent('Execution Agent');
      }
    } else {
      setActiveAgent('Orchestrator');
    }
  }, [state?.status, state?.currentTask, state?.tasks]);

  const handleStartAgent = async (
    goal: string,
    mode: AgentMode = 'autonomous',
    constraints: string[] = [],
    forceDemoFailure = false
  ) => {
    // Clean previous stream
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const { runId, state: initialState } = await startAgentRun({
        goal,
        mode,
        constraints,
        forceDemoFailure
      });

      setState(initialState);
      setActiveCenterTab('timeline');

      // Subscribe to real-time events via Server-Sent Events (SSE)
      unsubscribeRef.current = subscribeToAgentStream(runId, (event, data) => {
        if (event === 'snapshot') {
          setState(data);
        } else if (event === 'plan_created') {
          setState(prev => prev ? { ...prev, tasks: data.tasks, extractedRequirements: data.requirements } : prev);
        } else if (event === 'task_started') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              currentTask: data.task.task_id,
              tasks: prev.tasks.map(t => t.task_id === data.task.task_id ? { ...t, status: 'running' } : t)
            };
          });
        } else if (event === 'task_completed') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              completedTasks: Array.from(new Set([...prev.completedTasks, data.taskId])),
              tasks: prev.tasks.map(t => t.task_id === data.taskId ? { ...t, status: 'completed', result: data.outcome } : t)
            };
          });
        } else if (event === 'tool_completed') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              toolCalls: [...prev.toolCalls, data.toolCall]
            };
          });
        } else if (event === 'observation_made') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              observations: [...prev.observations, data.observation],
              tasks: prev.tasks.map(t => t.task_id === data.observation.taskId ? { ...t, observation: data.observation.resultSummary } : t)
            };
          });
        } else if (event === 'replan_started') {
          setState(prev => prev ? { ...prev, status: 'replanning' } : prev);
        } else if (event === 'replan_completed') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              tasks: data.tasks,
              replans: data.replans,
              status: 'running'
            };
          });
        } else if (event === 'human_approval_required') {
          setState(prev => prev ? { ...prev, status: 'waiting_approval', approvalRequest: data } : prev);
        } else if (event === 'human_approval_resolved') {
          setState(prev => prev ? { ...prev, status: 'running', approvalRequest: undefined } : prev);
        } else if (event === 'verification_started') {
          setState(prev => prev ? { ...prev, status: 'verifying' } : prev);
        } else if (event === 'verification_completed') {
          setState(prev => prev ? { ...prev, verificationResult: data.scorecard, finalDeliverable: data.deliverable } : prev);
        } else if (event === 'agent_completed') {
          setState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              status: 'completed',
              verificationResult: data.scorecard,
              finalDeliverable: data.deliverable
            };
          });
        } else if (event === 'trace_event') {
          setState(prev => {
            if (!prev) return prev;
            // Avoid duplicate trace IDs
            if (prev.trace.some(t => t.id === data.id)) return prev;
            return {
              ...prev,
              trace: [...prev.trace, data]
            };
          });
        }
      });
    } catch (err: any) {
      console.error('Failed to launch agent:', err);
      alert(`Agent dispatch error: ${err?.message || 'Server connection failed'}`);
    }
  };

  const handleStopAgent = async () => {
    if (!state) return;
    try {
      await stopAgentRun(state.id);
      setState(prev => prev ? { ...prev, status: 'aborted' } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprovalResolution = async (decision: 'approve' | 'reject_retry' | 'modify_plan', note?: string) => {
    if (!state) return;
    try {
      await submitHumanApproval({
        runId: state.id,
        decision,
        userNote: note
      });
      setState(prev => prev ? { ...prev, status: 'running', approvalRequest: undefined } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchMasterDemo = () => {
    const demoGoal = 'Research the best technology stack for building an AI-powered university study assistant and create a development roadmap.';
    handleStartAgent(demoGoal, 'demo', ['Budget under $350/mo', 'FERPA compliance'], true);
  };

  const isRunning = state?.status === 'running' || state?.status === 'planning' || state?.status === 'replanning' || state?.status === 'verifying';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Top Header */}
      <Header
        state={state}
        onOpenWhyAgentic={() => setShowWhyAgentic(true)}
        onOpenTools={() => setShowTools(true)}
        onTriggerDemo={handleLaunchMasterDemo}
        activeAgent={activeAgent}
      />

      {/* Main Command Center Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Goal Dispatcher (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-5 h-full">
          <GoalInputPanel
            onStartAgent={handleStartAgent}
            onStopAgent={handleStopAgent}
            isRunning={isRunning}
            state={state}
            onTriggerDemo={handleLaunchMasterDemo}
          />
        </section>

        {/* CENTER COLUMN: Interactive Task DAG, Timeline & Trace (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Center View Selector Tabs */}
          <div className="flex items-center justify-between p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveCenterTab('timeline')}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCenterTab === 'timeline'
                    ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Execution Timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCenterTab('graph')}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCenterTab === 'graph'
                    ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Task DAG Graph</span>
                {state?.tasks?.length ? (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-bold">
                    {state.tasks.length}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setActiveCenterTab('trace')}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCenterTab === 'trace'
                    ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Agent Trace</span>
                {state?.trace?.length ? (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-bold">
                    {state.trace.length}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Center Views */}
          {activeCenterTab === 'timeline' && (
            <ExecutionTimeline
              state={state}
              onOpenFinalReport={() => setShowFinalReport(true)}
            />
          )}

          {activeCenterTab === 'graph' && (
            <TaskGraph
              tasks={state?.tasks || []}
              currentTaskId={state?.currentTask}
            />
          )}

          {activeCenterTab === 'trace' && (
            <AgentTraceView
              trace={state?.trace || []}
            />
          )}
        </section>

        {/* RIGHT COLUMN: Telemetry, Memory & Sources (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <AgentTelemetryPanel
            state={state}
            onOpenFinalReport={() => setShowFinalReport(true)}
          />
        </section>

      </main>

      {/* MODALS */}
      {/* 1. Final Deliverable & Verification Report */}
      <FinalDeliverableModal
        deliverable={state?.finalDeliverable || null}
        onClose={() => setShowFinalReport(false)}
      />

      {/* 2. Why This is Agentic Differentiator Matrix */}
      <WhyAgenticModal
        isOpen={showWhyAgentic}
        onClose={() => setShowWhyAgentic(false)}
      />

      {/* 3. Human Approval Gate (Supervised Mode) */}
      <HumanApprovalModal
        request={state?.approvalRequest || null}
        onResolve={handleApprovalResolution}
      />

      {/* 4. Tools Sandbox Explorer */}
      <ToolExplorerModal
        isOpen={showTools}
        onClose={() => setShowTools(false)}
      />

      {/* Floating Deliverable Quick Trigger if run is completed */}
      {state?.status === 'completed' && !showFinalReport && (
        <div className="fixed bottom-6 right-6 z-30 animate-bounce">
          <button
            onClick={() => setShowFinalReport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition cursor-pointer border border-emerald-300/40"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>View Verified Deliverable ({state.verificationResult?.score ?? 94}/100)</span>
          </button>
        </div>
      )}

    </div>
  );
}
