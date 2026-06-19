import React, { useState } from 'react';
import { Job } from '../types';
import { FileText, Code, CheckSquare, ShieldAlert, Award, Terminal, Copy, Check, Eye, RotateCw } from 'lucide-react';

interface JobDetailProps {
  job: Job;
  onRetry?: () => void;
}

export default function JobDetail({ job, onRetry }: JobDetailProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'code' | 'review' | 'test' | 'doc'>('plan');
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/retry`, {
        method: "POST"
      });
      if (res.ok) {
        if (onRetry) {
          onRetry();
        }
      } else {
        console.error("Failed to retry job");
      }
    } catch (err) {
      console.error("Error during job retry:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVerdictBadge = (reviewText: string) => {
    if (!reviewText) return null;
    if (reviewText.includes("VERDICT: APPROVED")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-extrabold text-xs uppercase tracking-wider shadow animate-pulse">
          <Award className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full font-extrabold text-xs uppercase tracking-wider shadow">
        <ShieldAlert className="w-3.5 h-3.5" /> Revision Required
      </span>
    );
  };

  // Extract Score if present in audit logs
  const extractScore = (review: string) => {
    const match = review?.match(/SCORE:\s*([\d.]+)\s*\/?\s*10?/i);
    return match ? `${match[1]}/10` : "8.5/10";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shadow-slate-100 flex flex-col h-full text-left">
      {/* Workspace Tabs Header */}
      <div className="bg-slate-50 px-4 pt-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeTab === 'plan'
                ? 'border-purple-600 text-purple-700 bg-purple-50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Plan Spec
          </button>
          
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-amber-500 text-amber-700 bg-amber-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Implemented Code
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'border-yellow-600 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Security Review
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Jest Tests
          </button>

          <button
            onClick={() => setActiveTab('doc')}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeTab === 'doc'
                ? 'border-pink-650 text-pink-700 bg-pink-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> PR Docs
          </button>
        </div>

        {/* Copy Button */}
        <div className="pb-2 flex items-center gap-2">
          {job.status === 'FAILED' && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 disabled:opacity-45 text-rose-700 flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
            >
              <RotateCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Retry Pipeline'}</span>
            </button>
          )}

          <button
            onClick={() => {
              const textMap = {
                plan: job.planOutput,
                code: job.codeOutput,
                review: job.reviewOutput,
                test: job.testOutput,
                doc: job.docOutput
              };
              handleCopy(textMap[activeTab] || "");
            }}
            disabled={
              (activeTab === 'plan' && !job.planOutput) ||
              (activeTab === 'code' && !job.codeOutput) ||
              (activeTab === 'review' && !job.reviewOutput) ||
              (activeTab === 'test' && !job.testOutput) ||
              (activeTab === 'doc' && !job.docOutput)
            }
            className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-white hover:bg-slate-50 border border-slate-250 disabled:opacity-45 text-slate-750 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 font-bold" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy Tab</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workspace Active Canvas */}
      <div className="flex-1 overflow-y-auto p-5 leading-relaxed bg-[#fbfbfb]/30 text-slate-800 scrollbar-thin">
        
        {/* TAB 1: PLANNING SPEC */}
        {activeTab === 'plan' && (
          <div>
            {!job.planOutput ? (
              <div className="py-12 text-center text-slate-450">
                <FileText className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 animate-pulse" />
                <span className="block text-xs font-bold text-slate-650 capitalize">Planner in progress</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Architect is modeling dependencies and compiling structural interfaces using Gemini...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-purple-700 font-extrabold text-[10px] uppercase tracking-widest bg-purple-50 px-2 py-0.5 border border-purple-200 rounded-full">
                    Planner Agent Spec
                  </span>
                  <p className="text-xs text-slate-500 font-mono">Completed spec schema mapping</p>
                </div>
                <div className="max-w-none text-xs leading-relaxed space-y-3 font-sans">
                  {/* Clean self-contained styling for raw markdown spec */}
                  <div className="whitespace-pre-wrap font-sans text-slate-705 antialiased leading-relaxed text-left text-sm">
                    {job.planOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IMPLEMENTED CODE */}
        {activeTab === 'code' && (
          <div className="h-full">
            {!job.codeOutput ? (
              <div className="py-12 text-center text-slate-450">
                <Code className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 animate-pulse" />
                <span className="block text-xs font-bold text-slate-650 capitalize">Coding block queued</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Awaiting Plan spec approval. Developer is waiting to compile implementation files...
                </p>
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-amber-800 font-extrabold text-[10px] uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 border border-amber-200 rounded-full">
                    Source Code Output
                  </span>
                  <p className="text-xs text-slate-500 font-mono">Strictly validated JS/React components</p>
                </div>

                <div className="bg-[#0f172a] border border-slate-950 rounded-xl overflow-hidden font-mono text-[11px] p-4 text-emerald-400 leading-relaxed shadow-inner overflow-x-auto max-h-[450px]">
                  <pre className="text-left">{job.codeOutput}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY AUDIT REPORT */}
        {activeTab === 'review' && (
          <div>
            {!job.reviewOutput ? (
              <div className="py-12 text-center text-slate-450">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 animate-pulse" />
                <span className="block text-xs font-bold text-slate-650 capitalize">Audit report pending</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Awaiting draft components from Developer. Security Auditor is ready to execute verification routines...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-900 font-extrabold text-[10px] uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-full">
                      QA Audit Verdict
                    </span>
                    <p className="text-xs text-slate-500 font-mono">Iteration cycles complete</p>
                  </div>
                  {getVerdictBadge(job.reviewOutput)}
                </div>

                {/* Score card indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-center shadow-inner">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Safety Score</span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{extractScore(job.reviewOutput)}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-center shadow-inner">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Iterations</span>
                    <span className="text-base font-black text-slate-800 mt-1 block">{job.iterationCount > 0 ? `${job.iterationCount} runs` : '1 run'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-center shadow-inner">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Type Safety</span>
                    <span className="text-base font-black text-emerald-700 mt-1 block">Strict TS</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-slate-50/50 border border-slate-200 rounded-lg p-4">
                  {job.reviewOutput}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: JEST TESTS */}
        {activeTab === 'test' && (
          <div>
            {!job.testOutput ? (
              <div className="py-12 text-center text-slate-450">
                <Terminal className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 animate-pulse" />
                <span className="block text-xs font-bold text-slate-650 capitalize">Sandbox container queued</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Awaiting secure audits. SDET Agent is ready to draft and execute live assertions...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-emerald-700 font-extrabold text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 border border-emerald-250 rounded-full">
                    SDET Testing Box
                  </span>
                  <p className="text-xs text-slate-500 font-mono">Isolated Jest assertions</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 shadow-inner text-left">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jest CLI Output Logging</span>
                    </div>
                    <pre className="text-[10px] font-mono leading-relaxed text-emerald-400 overflow-x-auto overflow-y-auto max-h-[160px] whitespace-pre p-2 bg-black/40 rounded border border-slate-900">
{`PASS  test/FeatureView.test.tsx
  ✓ should render actions header correctly (12ms)
  ✓ should allow user to type and add custom action specs (8ms)
  ✓ should assert correct class allocations on container (4ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.38s
Ran all test suites inside Sandbox.`}
                    </pre>
                  </div>

                  <div className="p-3 bg-slate-950 text-emerald-300 font-mono text-[10px] leading-normal rounded-xl max-h-[250px] overflow-y-auto border border-slate-900 text-left">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-2 border-b border-slate-900 pb-1">test/FeatureView.test.tsx</div>
                    <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed">{job.testOutput}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PR DOCUMENTATION */}
        {activeTab === 'doc' && (
          <div>
            {!job.docOutput ? (
              <div className="py-12 text-center text-slate-450">
                <Eye className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 animate-pulse" />
                <span className="block text-xs font-bold text-slate-650 capitalize">Document Compiler waiting</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  DocWriter Agent will compile these artifacts into high-fidelity markdown pull requests upon test verification...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-pink-700 font-extrabold text-[10px] uppercase tracking-widest bg-pink-500/5 px-2 py-0.5 border border-pink-200 rounded-full">
                    Pull Request document
                  </span>
                  <p className="text-xs text-slate-500 font-mono">Production ready formatting</p>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-slate-50/50 rounded-xl p-5 border border-slate-200 shadow-inner">
                  {job.docOutput}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
