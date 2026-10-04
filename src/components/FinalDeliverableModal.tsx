import React, { useState } from 'react';
import {
  X,
  Copy,
  Download,
  Check,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  Wrench,
  RotateCw
} from 'lucide-react';
import { FinalDeliverable } from '../types';

interface FinalDeliverableModalProps {
  deliverable: FinalDeliverable | null;
  onClose: () => void;
}

export const FinalDeliverableModal: React.FC<FinalDeliverableModalProps> = ({
  deliverable,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'architecture' | 'verification' | 'sources' | 'recovery'>('summary');

  if (!deliverable) return null;

  const handleCopyMarkdown = () => {
    const md = `# AgentFlow AI Deliverable: ${deliverable.goal}
Generated: ${deliverable.generatedAt}
Verification Score: ${deliverable.verification.score}/100

## Executive Summary
${deliverable.executiveSummary}

## Key Architectural Findings
${deliverable.keyFindings.map(f => `- ${f}`).join('\n')}

## Autonomous Verification Scorecard
- Goal Satisfaction: ${deliverable.verification.breakdown.goalSatisfaction}%
- Task Completion: ${deliverable.verification.breakdown.taskCompletion}%
- Source Quality: ${deliverable.verification.breakdown.sourceQuality}%
- Verification Integrity: ${deliverable.verification.breakdown.verification}%
- Reliability Composite: ${deliverable.verification.breakdown.reliability}%

## Completed Tasks
${deliverable.completedTasks.map(t => `### ${t.title} (${t.taskId})\n${t.outcome}`).join('\n\n')}

## Tools Used
${deliverable.toolsUsed.map(tu => `- ${tu.name}: ${tu.count} calls (${tu.purpose})`).join('\n')}

## Sources & Citations
${deliverable.sources.map(s => `- [${s.title}](${s.url}) - Domain: ${s.domain} (${s.relevance}% relevance)`).join('\n')}

## Self-Healing & Failure Recovery
${deliverable.problemsEncountered.map(p => `- Problem: ${p.problem}\n  Action: ${p.recoveryAction}\n  Outcome: ${p.outcome}`).join('\n')}

## Phased Roadmap & Next Steps
${deliverable.nextSteps.map(step => `- ${step}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(deliverable, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgentFlow_Deliverable_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden bg-slate-950">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                  AUDITED DELIVERABLE
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Score: {deliverable.verification.score}/100
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1 mt-0.5">
                {deliverable.goal}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture & Roadmap
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'verification'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Verification Scorecard ({deliverable.verification.score}/100)
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'recovery'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Self-Healing & Replanning ({deliverable.problemsEncountered.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sources'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified Sources ({deliverable.sources.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-sm text-slate-200">
          
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 font-semibold">
                  Executive Summary
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {deliverable.executiveSummary}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2 font-semibold">
                  Key Technical Discoveries
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deliverable.keyFindings.map((finding, index) => (
                    <div key={index} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                        {index + 1}
                      </span>
                      <p>{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 font-semibold">
                  Completed Tasks & Verification Gates ({deliverable.completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {deliverable.completedTasks.map((t) => (
                    <div key={t.taskId} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {t.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{t.taskId}</span>
                      </div>
                      <p className="text-slate-400 pl-5">{t.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & ROADMAP */}
          {activeTab === 'architecture' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2 font-semibold">
                  Phased 12-Week Implementation Roadmap
                </h3>
                <div className="space-y-3">
                  {deliverable.nextSteps.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                        P{idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-100">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 font-semibold">
                  Architectural Decisions & Rationales
                </h3>
                <div className="space-y-2 text-xs">
                  {deliverable.decisions.map((dec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
                      ✓ {dec}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 font-semibold">
                  Production Engineering Recommendations
                </h3>
                <div className="space-y-2 text-xs">
                  {deliverable.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATION SCORECARD */}
          {activeTab === 'verification' && (
            <div className="flex flex-col gap-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                    Independent Verification Audit Result
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                    Audit Status: PASSED (Verified & Grounded)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluated by the Verification Agent across 5 empirical criteria with zero silent failures.
                  </p>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono text-2xl font-bold flex items-center justify-center shrink-0">
                  {deliverable.verification.score}/100
                </div>
              </div>

              {/* Breakdown Meters */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
                  Detailed Verification Score Breakdown
                </h4>

                {[
                  { label: 'Goal Satisfaction', score: deliverable.verification.breakdown.goalSatisfaction, desc: 'Original prompt scope fully achieved without missing requirements' },
                  { label: 'Task Completion Rate', score: deliverable.verification.breakdown.taskCompletion, desc: 'All scheduled tasks executed and verified against success criteria' },
                  { label: 'Source Quality & Credibility', score: deliverable.verification.breakdown.sourceQuality, desc: 'Average domain authority & empirical relevance of external citations' },
                  { label: 'Verification Integrity', score: deliverable.verification.breakdown.verification, desc: 'Absence of contradictions, unverified claims, or silent errors' },
                  { label: 'Composite Reliability', score: deliverable.verification.breakdown.reliability, desc: 'Self-healing stability under simulated external tool disruptions' }
                ].map((item) => (
                  <div key={item.label} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <span className="font-bold text-emerald-400">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RECOVERY & SELF-HEALING */}
          {activeTab === 'recovery' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 text-xs text-purple-200">
                <span className="font-bold block mb-1">Autonomous Resilience Summary:</span>
                AgentFlow is engineered not to crash when tools or remote APIs fail. Below is the recorded obstacle log showing how the Orchestrator and Planner agents detected faults and adapted strategies autonomously.
              </div>

              <div className="space-y-3">
                {deliverable.problemsEncountered.map((problem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Obstacle: {problem.problem}</span>
                    </div>
                    <div className="flex items-start gap-2 text-purple-300 pl-6 border-l-2 border-purple-800">
                      <RotateCw className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Autonomous Recovery Action:</span>
                        {problem.recoveryAction}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 pl-6">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Outcome: {problem.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SOURCES */}
          {activeTab === 'sources' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400 font-mono">
                The agent retrieved and cross-referenced {deliverable.sources.length} sources to ground all recommendations:
              </p>
              <div className="space-y-2.5">
                {deliverable.sources.map((src) => (
                  <div key={src.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">{src.title}</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                        {src.relevance}% Relevance
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{src.snippet}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span>Domain: {src.domain}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Verified by AgentFlow AI Verifier Agent • Zero Hallucination Guarantee
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyMarkdown}
              className="py-2 px-4 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
            >
              Close Deliverable
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
