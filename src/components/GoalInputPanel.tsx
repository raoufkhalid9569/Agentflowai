import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Square,
  Shield,
  Bot,
  SlidersHorizontal,
  Flame,
  BookOpen,
  Boxes,
  Briefcase,
  FileText,
  RotateCw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AgentMode, AgentState } from '../types';

interface GoalInputPanelProps {
  onStartAgent: (goal: string, mode: AgentMode, constraints: string[], forceFailure: boolean) => void;
  onStopAgent: () => void;
  isRunning: boolean;
  state: AgentState | null;
  onTriggerDemo: () => void;
}

const PRESET_GOALS = [
  {
    id: 'study-assistant',
    title: 'University Study Assistant',
    badge: 'Master Demo',
    icon: BookOpen,
    goal: 'Research the best technology stack for building an AI-powered university study assistant and create a development roadmap.',
    constraints: ['Budget under $350/mo', 'FERPA compliance', 'Support lecture slides RAG']
  },
  {
    id: 'agent-frameworks',
    title: 'AI Agent Frameworks',
    badge: 'Deep Research',
    icon: Boxes,
    goal: 'Research the latest autonomous AI agent frameworks (LangGraph, CrewAI, AutoGen) and compare architectural trade-offs.',
    constraints: ['Focus on cyclic state machines', 'Evaluate error recovery']
  },
  {
    id: 'saas-roadmap',
    title: 'SaaS Software Roadmap',
    badge: 'Architecture',
    icon: Flame,
    goal: 'Create a complete full-stack development blueprint and phased 12-week roadmap for a real-time collaborative workspace.',
    constraints: ['PostgreSQL & WebSockets', 'Zero server hydration stalls']
  },
  {
    id: 'business-risks',
    title: 'Business & Competitors',
    badge: 'Market Intel',
    icon: Briefcase,
    goal: 'Analyze market competitors and identify technical and operational risks for an autonomous customer support agent.',
    constraints: ['Identify top 3 moat vulnerabilities', 'Cost projection per 10k tickets']
  },
  {
    id: 'syllabus-doc',
    title: 'Syllabus & File Inspector',
    badge: 'File Analyzer',
    icon: FileText,
    goal: 'Analyze the CS101 university syllabus document, extract grading distribution, and generate an AI-assisted tutoring plan.',
    constraints: ['Inspect grading weights', 'Synthesize study milestones']
  }
];

export const GoalInputPanel: React.FC<GoalInputPanelProps> = ({
  onStartAgent,
  onStopAgent,
  isRunning,
  state,
  onTriggerDemo
}) => {
  const [goal, setGoal] = useState(PRESET_GOALS[0].goal);
  const [mode, setMode] = useState<AgentMode>('autonomous');
  const [constraintsText, setConstraintsText] = useState('Production standards, FERPA compliance, Low latency');
  const [simulateFailure, setSimulateFailure] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isRunning) return;
    const constraints = constraintsText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    onStartAgent(goal.trim(), mode, constraints, simulateFailure);
  };

  const handleSelectPreset = (preset: typeof PRESET_GOALS[0]) => {
    setGoal(preset.goal);
    setConstraintsText(preset.constraints.join(', '));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-5 h-full">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Agent Goal Dispatcher
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            Goal → Action
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Enter a high-level goal. The agent autonomously plans, selects tools, handles errors, and verifies results.
        </p>
      </div>

      {/* Preset Goal Selector */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 block font-mono">
          Curated Objectives
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {PRESET_GOALS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = goal === preset.goal;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold truncate">{preset.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-cyan-800 text-cyan-200 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.goal}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div>
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
            <span>Primary Objective / Goal</span>
            <span className="text-[10px] text-slate-400 font-normal">Give a goal, not commands</span>
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isRunning}
            rows={4}
            placeholder="e.g. Research and create a complete development plan for an AI university study assistant..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none disabled:opacity-50 font-sans"
          />
        </div>

        {/* Mode Selector */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block font-mono">
            Autonomy Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('autonomous')}
              className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer ${
                mode === 'autonomous'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs">Full Autonomy</div>
                <div className="text-[10px] text-slate-400 font-normal">Self-directed loop</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('supervised')}
              className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer ${
                mode === 'supervised'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs">Supervised</div>
                <div className="text-[10px] text-slate-400 font-normal">Human-in-the-loop gates</div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 font-mono transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span>{showAdvanced ? 'Hide Constraints & Recovery Options' : 'Configure Constraints & Failure Recovery'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Constraints (Comma separated)
                </label>
                <input
                  type="text"
                  value={constraintsText}
                  onChange={(e) => setConstraintsText(e.target.value)}
                  placeholder="e.g. Budget under $300, FERPA compliance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    Simulate External Tool Failure
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                      Tests Self-Healing
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Triggers simulated API timeout to demonstrate autonomous replanning & recovery
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit / Controls */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {!isRunning ? (
            <button
              type="submit"
              disabled={!goal.trim()}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Autonomous Agent</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopAgent}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Square className="w-4 h-4 fill-red-300" />
              <span>Abort Agent Execution</span>
            </button>
          )}

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={onTriggerDemo}
            className="w-full py-2 px-3 rounded-lg text-xs font-mono text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>Launch Preconfigured Master Demo</span>
          </button>
        </div>
      </form>
    </div>
  );
};
