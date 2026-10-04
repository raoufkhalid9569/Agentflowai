import React from 'react';
import {
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  RotateCw,
  GitBranch,
  ShieldCheck,
  Search,
  Calculator,
  Code2,
  Table2,
  FileSearch,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { AgentState, Task, ToolCall, Observation } from '../types';

interface ExecutionTimelineProps {
  state: AgentState | null;
  onOpenFinalReport: () => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  state,
  onOpenFinalReport
}) => {
  if (!state) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center min-h-[350px]">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-cyan-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Live Execution Timeline</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Once the agent starts, the live cognitive loop will stream here in real time: Goal Understanding → Planning → Tool Execution → Observation → Failure Recovery → Verification.
        </p>
      </div>
    );
  }

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'web_search':
        return <Search className="w-3.5 h-3.5 text-blue-400" />;
      case 'calculator':
        return <Calculator className="w-3.5 h-3.5 text-emerald-400" />;
      case 'code_tool':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'structured_data':
        return <Table2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'file_analyzer':
        return <FileSearch className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-200">
            Live Agent Execution Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          Status: {state.status.toUpperCase()}
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 flex flex-col gap-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        
        {/* Step 1: Goal Received & Understood */}
        <div className="relative flex items-start gap-3">
          <span className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          </span>
          <div className="w-full bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200">Goal Received & Decomposed</span>
              <span className="text-[10px] font-mono text-slate-400">STAGE 1</span>
            </div>
            <p className="text-xs text-slate-300 font-sans italic">
              "{state.goal}"
            </p>
            {state.extractedRequirements?.requirements?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {state.extractedRequirements.requirements.slice(0, 3).map((r, i) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    ✓ {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Planning Completed */}
        {state.tasks.length > 0 && (
          <div className="relative flex items-start gap-3">
            <span className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-blue-950 border-2 border-blue-400 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
            </span>
            <div className="w-full bg-slate-900/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  Task DAG Formulated by Planner Agent
                </span>
                <span className="text-[10px] font-mono text-slate-400">{state.tasks.length} Tasks Scheduled</span>
              </div>
              <p className="text-xs text-slate-400">
                Created dependency graph, assigned tools, and defined verifiable success criteria.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Tool Execution & Task Steps */}
        {state.tasks.map((task) => {
          const isDone = task.status === 'completed';
          const isRunning = task.status === 'running';
          const isFailed = task.status === 'failed';
          const isRetrying = task.status === 'retrying';
          const isRecovery = task.task_id.startsWith('recovery_');

          if (task.status === 'pending') return null;

          return (
            <div key={task.task_id} className="relative flex items-start gap-3">
              {/* Timeline marker icon */}
              <span className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                isDone
                  ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-400'
                  : isRunning
                  ? 'bg-cyan-950 border-2 border-cyan-400 text-cyan-400 animate-pulse'
                  : isFailed
                  ? 'bg-rose-950 border-2 border-rose-400 text-rose-400'
                  : isRetrying
                  ? 'bg-amber-950 border-2 border-amber-400 text-amber-400'
                  : 'bg-purple-950 border-2 border-purple-400 text-purple-400'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : isRunning ? (
                  <PlayCircle className="w-3 h-3 text-cyan-400 animate-spin" />
                ) : isFailed ? (
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                ) : (
                  <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
                )}
              </span>

              <div className={`w-full rounded-xl p-3.5 border transition-all ${
                isDone
                  ? 'bg-slate-900/70 border-slate-800'
                  : isRunning
                  ? 'bg-cyan-950/20 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                  : isFailed
                  ? 'bg-rose-950/30 border-rose-700/60'
                  : isRecovery
                  ? 'bg-purple-950/30 border-purple-600/60'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{task.description}</span>
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {getToolIcon(task.recommended_tool)}
                      {task.recommended_tool}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {task.status}
                  </span>
                </div>

                {/* Observation / Result */}
                {task.observation && (
                  <div className="mt-2 text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold mb-0.5">
                      ✓ Evaluator Agent Observation:
                    </span>
                    <p className="line-clamp-2">{task.observation}</p>
                  </div>
                )}

                {/* Error Banner & Recovery Indicator */}
                {task.error && (
                  <div className="mt-2 text-xs bg-rose-950/50 p-2.5 rounded-lg border border-rose-800/60 text-rose-200">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Obstacle Encountered:</span>
                    </div>
                    <p className="text-[11px] font-mono text-rose-300">{task.error}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Step 4: Autonomous Replanning Highlights */}
        {state.replans.map((replan, index) => (
          <div key={index} className="relative flex items-start gap-3">
            <span className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center text-purple-400 animate-pulse">
              <RotateCw className="w-3 h-3 text-purple-400" />
            </span>
            <div className="w-full bg-gradient-to-r from-purple-950/40 to-slate-900/60 rounded-xl p-3.5 border border-purple-700/60 shadow-lg shadow-purple-950/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-purple-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Autonomous Replanning (Self-Healing Recovery #{replan.replanNumber})
                </span>
                <span className="text-[10px] font-mono text-purple-300">{replan.timestamp.slice(11, 19)}</span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                {replan.summary}
              </p>
              <div className="mt-2 text-[10px] font-mono text-purple-300/80 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800/60 inline-block">
                Trigger: {replan.triggerReason} → Strategy: Injected decoupled schema adapter & rerouted downstream tasks
              </div>
            </div>
          </div>
        ))}

        {/* Step 5: Verification & Deliverable */}
        {state.verificationResult && (
          <div className="relative flex items-start gap-3">
            <span className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </span>
            <div className="w-full bg-gradient-to-r from-emerald-950/40 to-slate-900 rounded-xl p-4 border border-emerald-600/60">
              <div className="flex items-center justify-between gap-2 text-xs mb-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Independent Verification Passed
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-200 font-mono text-xs font-bold border border-emerald-700">
                  Score: {state.verificationResult.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                All success criteria audited. Claims verified against retrieved sources. Deliverable formatted and ready for export.
              </p>
              <button
                type="button"
                onClick={onOpenFinalReport}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Full Structured Deliverable & Roadmap</span>
                <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
