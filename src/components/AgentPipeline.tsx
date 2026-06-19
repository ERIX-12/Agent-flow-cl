import React from 'react';
import { Brain, Code, Eye, ShieldCheck, FileCheck, HelpCircle, Loader, RefreshCw, Layers } from 'lucide-react';
import { Job } from '../types';

interface AgentPipelineProps {
  activeJob: Job | null;
}

const AGENT_STEPS = [
  {
    id: 'PLANNER',
    name: 'Architect & Planner',
    role: 'SYSTEM_PLANNER',
    emoji: <Brain className="w-5 h-5 text-purple-400" />,
    color: 'border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 text-purple-400',
    description: 'Deconstructs request into modules, interfaces, and architecture plans.'
  },
  {
    id: 'ENGINEER',
    name: 'Lead Developer',
    role: 'SYSTEM_ENGINEER',
    emoji: <Code className="w-5 h-5 text-blue-400" />,
    color: 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 text-blue-400',
    description: 'Writes safe, pristine Typescript components incorporating strict type interfaces.'
  },
  {
    id: 'REVIEWER',
    name: 'Security & QA Auditor',
    role: 'SYSTEM_REVIEWER',
    emoji: <Eye className="w-5 h-5 text-yellow-400" />,
    color: 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40 text-yellow-400',
    description: 'Validates structure for injection attacks, edge defects, and performance.'
  },
  {
    id: 'TESTER',
    name: 'SDET Sandbox Test Engine',
    role: 'SYSTEM_TESTER',
    emoji: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    color: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 text-emerald-400',
    description: 'Spins up clean isolated test assertions to ensure 100% build validity.'
  },
  {
    id: 'DOCWRITER',
    name: 'Release Doc Synthesizer',
    role: 'SYSTEM_DOCWRITER',
    emoji: <FileCheck className="w-5 h-5 text-pink-400" />,
    color: 'border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40 text-pink-400',
    description: 'Assembles markdown PR release guides, conventional titles, and changelogs.'
  }
];

export default function AgentPipeline({ activeJob }: { activeJob: Job | null }) {
  const getAgentStatus = (agentId: string): 'waiting' | 'active' | 'completed' | 'failed' => {
    if (!activeJob) return 'waiting';
    if (activeJob.status === 'FAILED') {
      if (activeJob.currentAgent === agentId) return 'failed';
    }

    const currentIdx = getStatusOrderIndex(activeJob.status);
    const stepIdx = getStepOrderIndex(agentId);

    if (currentIdx === stepIdx) return 'active';
    if (currentIdx > stepIdx) return 'completed';
    return 'waiting';
  };

  const getStatusOrderIndex = (status: string): number => {
    switch (status) {
      case 'QUEUED': return -1;
      case 'PLANNING': return 0;
      case 'ENGINEERING': return 1;
      case 'REVIEWING': return 2;
      case 'TESTING': return 3;
      case 'DOCUMENTING': return 4;
      case 'COMPLETED': return 5;
      default: return -1;
    }
  };

  const getStepOrderIndex = (agentId: string): number => {
    switch (agentId) {
      case 'PLANNER': return 0;
      case 'ENGINEER': return 1;
      case 'REVIEWER': return 2;
      case 'TESTER': return 3;
      case 'DOCWRITER': return 4;
      default: return -1;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-slate-100 text-sm tracking-wide uppercase">Pipeline Pipeline Map</span>
          </div>
          {activeJob && (
            <div className="text-[11px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
              Run: {activeJob.id}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {AGENT_STEPS.map((step, index) => {
            const status = getAgentStatus(step.id);
            const isLast = index === AGENT_STEPS.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 -ml-[1px] bg-slate-800">
                    <div 
                      className={`h-full w-full transition-all duration-700 ${
                        status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'
                      }`}
                    />
                  </div>
                )}

                {/* Agent Card */}
                <div 
                  className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                    status === 'active' 
                      ? 'border-blue-500/80 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : status === 'failed'
                      ? 'border-rose-500 bg-rose-500/5'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  {/* Status Node Icon */}
                  <div className={`p-2 rounded-lg shrink-0 ${
                    status === 'active' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : status === 'failed'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}>
                    {step.emoji}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold tracking-wide ${status === 'active' ? 'text-blue-400 font-bold' : status === 'completed' ? 'text-slate-300' : status === 'failed' ? 'text-rose-400' : 'text-slate-500'}`}>
                        {step.name}
                      </span>
                      
                      {/* Sub-status Labels */}
                      <div className="flex items-center gap-1.5">
                        {status === 'active' && (
                          <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">
                            <Loader className="w-3 h-3 animate-spin" /> Active
                          </span>
                        )}
                        {status === 'completed' && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                            Passed
                          </span>
                        )}
                        {status === 'failed' && (
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                            Aborted
                          </span>
                        )}
                        {status === 'waiting' && (
                          <span className="text-[10px] bg-slate-900 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${status === 'active' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {step.description}
                    </p>

                    {/* Show iteration count when looping between Dev and QA Auditor */}
                    {status === 'active' && step.id === 'ENGINEER' && activeJob && activeJob.iterationCount > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                        <span className="font-semibold">Review Hand-off: Iteration {activeJob.iterationCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual active Loop Indicator Banner */}
      {activeJob && (activeJob.status === 'ENGINEERING' || activeJob.status === 'REVIEWING') && (
        <div className="mt-4 p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-yellow-500 spin shrink-0" />
          <div className="text-left">
            <div className="font-bold text-yellow-400 text-xs uppercase tracking-wider">
              Lead Dev ↔ QA Auditor Iteration Loop
            </div>
            <div className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
              Refining code file syntax based on automatic static analysis and review verdicts.
            </div>
          </div>
        </div>
      )}

      {/* Finished Summary Ticket Banner */}
      {activeJob?.status === 'COMPLETED' && (
        <div className="mt-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
          <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
            🎉 Continuous Delivery Ready
          </p>
          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
            All 5 agents have executed and committed the tasks. Build verification PASSED inside sandbox.
          </p>
        </div>
      )}
    </div>
  );
}
