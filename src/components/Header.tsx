import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  Play,
  Wrench,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AgentState, AgentName } from '../types';

interface HeaderProps {
  state: AgentState | null;
  onOpenWhyAgentic: () => void;
  onOpenTools: () => void;
  onTriggerDemo: () => void;
  activeAgent: AgentName;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenWhyAgentic,
  onOpenTools,
  onTriggerDemo,
  activeAgent
}) => {
  const getStatusBadge = () => {
    if (!state) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          System Ready
        </span>
      );
    }

    switch (state.status) {
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Planner Active
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Autonomous Loop Running
          </span>
        );
      case 'replanning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Autonomous Replanning
          </span>
        );
      case 'waiting_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-800/60 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Awaiting Human Approval
          </span>
        );
      case 'verifying':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Verification Audit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified & Completed ({state.verificationResult?.score ?? 94}/100)
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/60">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Execution Halt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {state.status}
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AgentFlow AI
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold uppercase">
                Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Give AgentFlow a goal, not instructions.
            </p>
          </div>
        </div>

        {/* Center: Live Status & Active Agent */}
        <div className="flex items-center gap-3 flex-wrap">
          {getStatusBadge()}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-400">Agent:</span>
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              {activeAgent}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
            title="Launch Deterministic Demo Mode"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />
            <span className="font-semibold">Deterministic Demo</span>
          </button>

          <button
            onClick={onOpenWhyAgentic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Why This is Agentic
          </button>

          <button
            onClick={onOpenTools}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            title="Test the 5 real tools"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            Tools Sandbox
          </button>
        </div>
      </div>
    </header>
  );
};
