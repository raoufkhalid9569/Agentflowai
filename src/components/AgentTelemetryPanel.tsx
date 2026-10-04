import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Repeat,
  RotateCw,
  GitBranch,
  ShieldCheck,
  Search,
  ExternalLink,
  Brain,
  DollarSign,
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { AgentState, Source } from '../types';

interface AgentTelemetryPanelProps {
  state: AgentState | null;
  onOpenFinalReport: () => void;
}

export const AgentTelemetryPanel: React.FC<AgentTelemetryPanelProps> = ({
  state,
  onOpenFinalReport
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'memory' | 'sources'>('telemetry');

  if (!state) {
    return (
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center min-h-[350px]">
        <Activity className="w-8 h-8 text-slate-500 mb-2" />
        <h4 className="text-xs font-semibold text-slate-300">Agent Telemetry Standby</h4>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Launch an autonomous run to view real-time memory, iteration metrics, sources, and verification.
        </p>
      </div>
    );
  }

  const completedCount = state.completedTasks.length;
  const totalTasks = state.tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Memory ({state.memory?.discoveredInsights?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-blue-950 text-blue-300 font-semibold border border-blue-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sources ({state.sources?.length ?? 0})
          </button>
        </div>
      </div>

      {/* TAB 1: TELEMETRY & STATS */}
      {activeTab === 'telemetry' && (
        <div className="flex flex-col gap-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Workflow Progress</span>
              <span className="font-bold text-cyan-400">{progressPct}% ({completedCount}/{totalTasks} tasks)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Loop Limits & Control Counters */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 mb-0.5">
                <Repeat className="w-3 h-3 text-cyan-400" />
                <span>Iterations</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {state.stats.iterationCount} <span className="text-[10px] text-slate-400 font-normal">/ 25</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 mb-0.5">
                <RotateCw className="w-3 h-3 text-amber-400" />
                <span>Retries</span>
              </div>
              <div className="text-sm font-bold font-mono text-amber-300">
                {state.stats.retries} <span className="text-[10px] text-slate-400 font-normal">/ 3</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 mb-0.5">
                <GitBranch className="w-3 h-3 text-purple-400" />
                <span>Replans</span>
              </div>
              <div className="text-sm font-bold font-mono text-purple-300">
                {state.stats.replans} <span className="text-[10px] text-slate-400 font-normal">/ 5</span>
              </div>
            </div>
          </div>

          {/* Verification Scorecard Widget */}
          {state.verificationResult ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-600/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Agent Verification Score</span>
                </div>
                <span className="text-base font-bold font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                  {state.verificationResult.score}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 pt-1">
                <div>Goal Sat: {state.verificationResult.breakdown.goalSatisfaction}%</div>
                <div>Task Comp: {state.verificationResult.breakdown.taskCompletion}%</div>
                <div>Sources: {state.verificationResult.breakdown.sourceQuality}%</div>
                <div>Reliability: {state.verificationResult.breakdown.reliability}%</div>
              </div>

              <button
                type="button"
                onClick={onOpenFinalReport}
                className="mt-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1 cursor-pointer font-mono"
              >
                <span>Inspect Deliverable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Verification Audit triggers automatically upon loop completion</span>
            </div>
          )}

          {/* Tools Invocations Breakdown */}
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
              Tool System Utilization ({state.toolCalls.length} calls)
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {['web_search', 'calculator', 'code_tool', 'structured_data', 'file_analyzer'].map((tool) => {
                const count = state.toolCalls.filter(tc => tc.toolName === tool).length;
                return (
                  <div key={tool} className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{tool.replace('_', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      count > 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {count} calls
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Cost & Timing */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-500">Run Duration</div>
                <div className="font-bold text-slate-200">
                  {state.stats.executionTimeMs > 0 ? `${(state.stats.executionTimeMs / 1000).toFixed(1)}s` : 'Active'}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500">Est. API Cost</div>
                <div className="font-bold text-emerald-300">
                  ${state.stats.estimatedCostUsd.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHORT-TERM MEMORY */}
      {activeTab === 'memory' && (
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Discovered Insights ({state.memory?.discoveredInsights?.length ?? 0})
            </span>
            {state.memory?.discoveredInsights?.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No insights indexed yet.</p>
            ) : (
              <div className="space-y-1.5">
                {state.memory.discoveredInsights.map((insight, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-sans">
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1 font-semibold">
              Active Strategy Decisions
            </span>
            {state.memory?.activeDecisions?.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">Dynamic decisions record here.</p>
            ) : (
              <div className="space-y-1.5">
                {state.memory.activeDecisions.map((dec, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                    ✓ {dec}
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.memory?.knownFailures?.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1 font-semibold">
                Recorded Obstacles & Self-Healing
              </span>
              <div className="space-y-1.5">
                {state.memory.knownFailures.map((fail, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200">
                    ⚠ {fail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SOURCES TRANSPARENCY */}
      {activeTab === 'sources' && (
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          <div className="text-[10px] text-slate-400 font-mono mb-1">
            Real external citations retrieved and verified by the Research Agent:
          </div>

          {state.sources?.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No external sources queried yet.</p>
          ) : (
            state.sources.map((src) => (
              <div key={src.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200 line-clamp-1">{src.title}</span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/60 font-bold">
                    {src.relevance}% rel
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{src.snippet}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <span>{src.domain}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
