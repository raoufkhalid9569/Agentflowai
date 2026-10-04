import React, { useState } from 'react';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  GitBranch,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskGraphProps {
  tasks: Task[];
  currentTaskId?: string;
  onSelectTask?: (task: Task) => void;
}

export const TaskGraph: React.FC<TaskGraphProps> = ({
  tasks,
  currentTaskId,
  onSelectTask
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60 font-semibold animate-pulse">
            <PlayCircle className="w-3 h-3 text-cyan-400 animate-spin" />
            RUNNING
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
            <XCircle className="w-3 h-3 text-rose-400" />
            FAULT DETECTED
          </span>
        );
      case 'retrying':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-semibold animate-pulse">
            <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
            RETRYING
          </span>
        );
      case 'replanned':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60 font-semibold">
            <GitBranch className="w-3 h-3 text-purple-400" />
            REPLANNED
          </span>
        );
      case 'skipped':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            SKIPPED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
    }
  };

  const getToolBadge = (tool: string) => {
    const colors: Record<string, string> = {
      web_search: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      calculator: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      code_tool: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      structured_data: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      file_analyzer: 'bg-rose-950/80 text-rose-300 border-rose-800/60'
    };
    return (
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium uppercase ${colors[tool] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        tool: {tool.replace('_', ' ')}
      </span>
    );
  };

  const handleTaskClick = (t: Task) => {
    setSelectedTask(t);
    if (onSelectTask) onSelectTask(t);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
          <GitBranch className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Visual Task DAG Standby</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Enter a goal and launch the agent. The Planner Agent will decompose requirements into an executable dependency graph.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-200">
            Autonomous Task DAG Graph
          </h3>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            {tasks.length} Nodes
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Interactive: Click any node to inspect tool output
        </div>
      </div>

      {/* Task Graph Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task, index) => {
          const isCurrent = task.task_id === currentTaskId;
          const isSelected = selectedTask?.task_id === task.task_id;
          const isRecovery = task.task_id.startsWith('recovery_');

          return (
            <div
              key={task.task_id}
              onClick={() => handleTaskClick(task)}
              className={`relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'ring-2 ring-cyan-500 bg-slate-900/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : isCurrent
                  ? 'border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                  : isRecovery
                  ? 'border-purple-500/50 bg-purple-950/20 hover:border-purple-400'
                  : 'border-slate-800/90 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Node Top bar */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {task.task_id}
                  </span>
                </div>
                {getStatusBadge(task.status)}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                {task.description}
              </p>

              {/* Dependencies & Tool info */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                {getToolBadge(task.recommended_tool)}

                {task.dependencies && task.dependencies.length > 0 ? (
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <ArrowRight className="w-2.5 h-2.5" />
                    deps: {task.dependencies.length}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">
                    root task
                  </span>
                )}
              </div>

              {/* Recovery indicator if task was dynamically injected */}
              {isRecovery && (
                <div className="text-[10px] text-purple-300 font-mono flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Self-Healing Dynamic Insertion
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Inspection Drawer */}
      {selectedTask && (
        <div className="mt-2 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3 transition-all">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Node Inspector: {selectedTask.task_id}
                </span>
                {getStatusBadge(selectedTask.status)}
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mt-1">
                {selectedTask.description}
              </h4>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-xs text-slate-400 hover:text-slate-200 font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Objective
              </span>
              <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {selectedTask.objective || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Success Criteria
              </span>
              <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {selectedTask.success_criteria}
              </p>
            </div>
          </div>

          {selectedTask.result && (
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Task Tool Output
              </span>
              <pre className="text-xs font-mono text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                {selectedTask.result}
              </pre>
            </div>
          )}

          {selectedTask.observation && (
            <div>
              <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-1">
                Evaluator Observation
              </span>
              <p className="text-xs text-slate-300 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                {selectedTask.observation}
              </p>
            </div>
          )}

          {selectedTask.error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              <span className="font-bold block mb-0.5">Recorded Error / Obstacle:</span>
              {selectedTask.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
