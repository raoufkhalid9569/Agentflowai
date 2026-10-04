import React, { useState } from 'react';
import {
  X,
  Wrench,
  Search,
  Calculator,
  Code2,
  Table2,
  FileSearch,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import {
  directSearch,
  directCalculate,
  directAnalyzeFile,
  directCode,
  directStructuredData
} from '../services/api';

interface ToolExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolExplorerModal: React.FC<ToolExplorerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('web_search');
  const [query, setQuery] = useState('university study assistant');
  const [calcExpr, setCalcExpr] = useState('budget for AI study assistant monthly cost');
  const [fileContent, setFileContent] = useState(`# CS101: Introduction to Computer Science
Grading: Midterm 30%, Final 40%, Assignments 30%
Schedule: Week 1 to 6 Algorithms & Databases`);
  const [codeReq, setCodeReq] = useState('Design production TypeScript architecture for student RAG assistant');
  const [structTopic, setStructTopic] = useState('ai study assistant tech stack');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let res;
      switch (selectedTool) {
        case 'web_search':
          res = await directSearch(query);
          break;
        case 'calculator':
          res = await directCalculate(calcExpr);
          break;
        case 'file_analyzer':
          res = await directAnalyzeFile('syllabus_sample.md', fileContent, 'md');
          break;
        case 'code_tool':
          res = await directCode('generate', codeReq);
          break;
        case 'structured_data':
          res = await directStructuredData(structTopic);
          break;
      }
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Tool execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl shadow-slate-950/60 flex flex-col overflow-hidden bg-slate-950">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Direct Inspection
              </span>
              <h3 className="text-base font-bold text-slate-100">
                Agent Tool System Sandbox (5 Real Tools)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tool Navigation */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-900/40 text-xs font-mono">
          {[
            { id: 'web_search', label: 'Web Search', icon: Search },
            { id: 'calculator', label: 'Calculator', icon: Calculator },
            { id: 'file_analyzer', label: 'File Analyzer', icon: FileSearch },
            { id: 'code_tool', label: 'Code Tool', icon: Code2 },
            { id: 'structured_data', label: 'Structured Data', icon: Table2 }
          ].map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  setResult(null);
                  setError(null);
                }}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/80'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input & Execution Form */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {selectedTool === 'web_search' && (
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {selectedTool === 'calculator' && (
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Calculation Expression or Budget Prompt</label>
              <input
                type="text"
                value={calcExpr}
                onChange={(e) => setCalcExpr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {selectedTool === 'file_analyzer' && (
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Document Content to Parse (Markdown / CSV / Syllabus)</label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {selectedTool === 'code_tool' && (
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Architecture Specification or Code Generation Requirement</label>
              <input
                type="text"
                value={codeReq}
                onChange={(e) => setCodeReq(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {selectedTool === 'structured_data' && (
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Comparison Topic</label>
              <input
                type="text"
                value={structTopic}
                onChange={(e) => setStructTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Executes isolated on backend server via typed RPC protocol
            </span>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="py-2 px-5 rounded-xl text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{loading ? 'Executing Tool...' : 'Execute Tool'}</span>
            </button>
          </div>

          {/* Results Output */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Live Output:
              </span>
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto whitespace-pre-wrap max-h-72">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-900/60">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close Sandbox
          </button>
        </div>

      </div>
    </div>
  );
};
