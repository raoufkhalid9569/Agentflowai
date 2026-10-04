import React from 'react';
import {
  X,
  Sparkles,
  Bot,
  Cpu,
  CheckCircle2,
  XCircle,
  GitBranch,
  Wrench,
  Activity,
  RotateCw,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface WhyAgenticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPARISON_DIMENSIONS = [
  {
    title: '1. Autonomous Planning',
    icon: GitBranch,
    chatbot: 'Linear, single-shot completion. Generates text without structuring a task dependency graph or identifying missing data.',
    agentflow: 'Decomposes complex goals into multi-stage DAGs with dependencies, priorities, expected outputs, and quantitative success criteria.',
    highlight: 'Dynamic Task DAG'
  },
  {
    title: '2. Autonomous Tool Selection',
    icon: Wrench,
    chatbot: 'No tools, or rigid hardcoded sequence (e.g. search then summarize every time).',
    agentflow: 'Reasons at each task boundary: chooses Web Search, Calculator, Code Generator, File Analyzer, or Structured Data matrix based on criteria.',
    highlight: 'Reasoned Tool Dispatch'
  },
  {
    title: '3. Multi-Step Stateful Execution',
    icon: Activity,
    chatbot: 'Stops after first turn. Cannot execute multiple chained subtasks independently.',
    agentflow: 'Maintains stateful short-term memory, loop control (max 25 iterations), and executes chained tasks across minutes without user intervention.',
    highlight: 'Stateful Execution Loop'
  },
  {
    title: '4. Observation & Evaluation',
    icon: Zap,
    chatbot: 'Blindly returns raw model outputs. Never inspects whether a result was useful or relevant.',
    agentflow: 'Evaluator Agent inspects tool outputs, computes relevance scores (0-100), and validates against specific task success criteria before advancing.',
    highlight: 'Independent Evaluator'
  },
  {
    title: '5. Self-Healing & Dynamic Replanning',
    icon: RotateCw,
    chatbot: 'Crashes on tool failure or prints error trace directly to user.',
    agentflow: 'Detects faults, analyzes errors, attempts alternate strategies, injects self-healing recovery tasks, and reroutes downstream dependencies.',
    highlight: 'Autonomous Recovery'
  },
  {
    title: '6. Independent Verification',
    icon: ShieldCheck,
    chatbot: 'Never audits its own claims. Prone to silent hallucinations and unsupported statements.',
    agentflow: 'Verification Agent evaluates final deliverable across 5 empirical criteria (Goal Satisfaction, Task Completion, Source Quality, Reliability).',
    highlight: 'Empirical Verification Audit'
  }
];

export const WhyAgenticModal: React.FC<WhyAgenticModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/50 shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden bg-slate-950">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Architecture Constitution
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Why AgentFlow AI is Truly Agentic (Not a Chatbot)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Tagline & Comparison Table */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-200">
          
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-cyan-200 text-xs flex flex-col gap-1">
            <span className="font-bold text-sm text-cyan-300">
              "Give AgentFlow a goal, not instructions."
            </span>
            <p className="text-slate-300">
              Traditional chatbots produce text in response to prompt queries. AgentFlow AI receives a high-level outcome, plans a sequence of operations, selects tools, checks observations, adapts to failures, and verifies completion autonomously.
            </p>
          </div>

          {/* Side by Side Grid */}
          <div className="space-y-4">
            {COMPARISON_DIMENSIONS.map((dim, idx) => {
              const Icon = dim.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                        {dim.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {dim.highlight}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Conventional Chatbot */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Conventional LLM Chatbot</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {dim.chatbot}
                      </p>
                    </div>

                    {/* AgentFlow AI */}
                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>AgentFlow AI Autonomous Engine</span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        {dim.agentflow}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loop Flow Diagram */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              The Agentic Cognitive Loop
            </span>
            <div className="flex items-center justify-center flex-wrap gap-2 text-[11px] font-mono font-bold text-cyan-300 py-2">
              <span className="px-2 py-1 rounded bg-slate-800">GOAL</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800">PLAN</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800">DECIDE</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800">TOOL</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800">OBSERVE</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800">EVALUATE</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">REPLAN / ADAPT</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">VERIFY</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-white">FINISH</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-900/60">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
