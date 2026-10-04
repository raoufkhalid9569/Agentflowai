import React, { useState } from 'react';
import { ShieldAlert, Check, X, Sliders, MessageSquare } from 'lucide-react';
import { HumanApprovalRequest } from '../types';

interface HumanApprovalModalProps {
  request: HumanApprovalRequest | null;
  onResolve: (decision: 'approve' | 'reject_retry' | 'modify_plan', note?: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  request,
  onResolve
}) => {
  const [selectedDecision, setSelectedDecision] = useState<'approve' | 'reject_retry' | 'modify_plan'>('approve');
  const [userNote, setUserNote] = useState('');

  if (!request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(selectedDecision, userNote.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-purple-500/50 p-6 shadow-2xl shadow-purple-950/50 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/60 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
              Supervised Mode • Human-in-the-Loop Gate
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">
              {request.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          {request.description}
        </p>

        {/* Decision Options */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {request.options.map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  selectedDecision === opt.id
                    ? 'bg-purple-950/40 border-purple-500 text-purple-100 ring-1 ring-purple-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="approvalDecision"
                  value={opt.id}
                  checked={selectedDecision === opt.id}
                  onChange={() => setSelectedDecision(opt.id as any)}
                  className="mt-0.5 text-purple-500 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>{opt.label}</span>
                    {opt.recommended && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* User Feedback / Guidance */}
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Optional Guidance or Constraints for Agent</span>
            </label>
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="e.g. Ensure strict adherence to sub-$0.15/1M token costs"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono bg-purple-500 hover:bg-purple-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit Decision & Resume Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
