import React, { useState } from 'react';
import {
  Terminal,
  Search,
  Filter,
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AgentTraceEvent, AgentName } from '../types';

interface AgentTraceViewProps {
  trace: AgentTraceEvent[];
}

export const AgentTraceView: React.FC<AgentTraceViewProps> = ({ trace }) => {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getAgentColor = (agent: AgentName) => {
    switch (agent) {
      case 'Orchestrator':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-800/60';
      case 'Planner Agent':
        return 'text-blue-400 bg-blue-950/70 border-blue-800/60';
      case 'Research Agent':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60';
      case 'Execution Agent':
        return 'text-purple-400 bg-purple-950/70 border-purple-800/60';
      case 'Evaluator Agent':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/60';
      case 'Verification Agent':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/60';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const filteredEvents = trace.filter(event => {
    if (filterAgent !== 'all' && event.agent !== filterAgent) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        event.action.toLowerCase().includes(q) ||
        event.decision.toLowerCase().includes(q) ||
        event.agent.toLowerCase().includes(q) ||
        (event.tool && event.tool.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
      {/* Trace Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-200">
            Agent Execution Trace & Decision Log
          </h3>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            {trace.length} Events
          </span>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search trace..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-48 font-mono"
            />
          </div>

          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Agents</option>
            <option value="Orchestrator">Orchestrator</option>
            <option value="Planner Agent">Planner</option>
            <option value="Research Agent">Researcher</option>
            <option value="Execution Agent">Executor</option>
            <option value="Evaluator Agent">Evaluator</option>
            <option value="Verification Agent">Verifier</option>
          </select>
        </div>
      </div>

      {/* Trace Table / Stream */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 font-mono text-xs max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No trace events recorded yet. Trace logs appear in real time during agent execution.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 hover:bg-slate-900/60 transition flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{event.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getAgentColor(event.agent)}`}>
                      {event.agent}
                    </span>
                    {event.tool && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                        tool: {event.tool}
                      </span>
                    )}
                  </div>
                  <span className="text-cyan-400/90 font-medium">
                    {event.action}
                  </span>
                </div>

                <div className="text-slate-200 text-xs pl-2 border-l-2 border-slate-700/80 mt-0.5">
                  <span className="text-slate-400 uppercase text-[10px] mr-1">Decision:</span>
                  {event.decision}
                </div>

                {event.observation && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/30 px-2.5 py-1 rounded border border-amber-900/40">
                    <span className="font-semibold text-amber-400 mr-1">Observed:</span>
                    {event.observation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
