import React from 'react';
import { Job, SystemStatus } from '../types';
import { Database, TrendingUp, Cpu, Flame, PowerOff, Sparkles, RefreshCcw } from 'lucide-react';

interface DashboardStatsProps {
  jobs: Job[];
  systemStatus: SystemStatus | null;
  onReset: () => Promise<void>;
}

export default function DashboardStats({ jobs, systemStatus, onReset }: DashboardStatsProps) {
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
  const failedJobs = jobs.filter(j => j.status === 'FAILED').length;
  const activeJobs = jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'FAILED' && j.status !== 'QUEUED').length;

  const successRate = totalJobs > 0 
    ? Math.round((completedJobs / (totalJobs - activeJobs || 1)) * 100)
    : 100;

  // Calculate Average Engineering review iterations
  const completedWithIterations = jobs.filter(j => j.status === 'COMPLETED');
  const totalIterations = completedWithIterations.reduce((acc, curr) => acc + (curr.iterationCount || 1), 0);
  const avgIterations = completedWithIterations.length > 0
    ? (totalIterations / completedWithIterations.length).toFixed(1)
    : "1.2";

  return (
    <div className="space-y-4">
      {/* 1. Global Metrics KPI widgets */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Jobs</span>
            <Flame className={`w-4 h-4 text-amber-500 ${activeJobs > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            {activeJobs}
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Success Rt</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            {totalJobs > 0 ? `${successRate}%` : '100%'}
          </span>
        </div>
      </div>

      {/* 2. System Status Diagnostic Widget */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left">
        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Orchestrator Diagnostics
        </span>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span>Channel Engine</span>
            <span className="text-slate-800 font-mono font-bold text-[11px]">Virtual BandRoom</span>
          </div>
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span>Engine Version</span>
            <span className="text-slate-800 font-mono font-bold text-[11px]">{systemStatus?.engineVersion || '1.0.4-LTS'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span>Gemini LLM Channel</span>
            {systemStatus?.geminiEnabled ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> LIVE
              </span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-1 text-[11px]" title="Demo mode utilizing pre-designed technical code assets. Connect API key to toggle live GPT behaviors.">
                SIMULATION
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pb-1">
            <span>Avg Review Cycles</span>
            <span className="text-slate-800 font-bold text-[11px]">{avgIterations}x / job</span>
          </div>
        </div>
      </div>

      {/* API Key Notice */}
      {!systemStatus?.geminiEnabled && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left">
          <span className="font-extrabold text-amber-800 text-[11px] block uppercase tracking-wide">💡 Demo Mode Active</span>
          <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
            To query Gemini API models live, add your <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">GEMINI_API_KEY</code> in <strong>Settings &gt; Secrets</strong>.
          </p>
        </div>
      )}

      {/* History Actions */}
      <button
        onClick={onReset}
        disabled={totalJobs === 0}
        className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 rounded-lg text-xs font-bold text-slate-700 uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        <span>Reset Pipeline History</span>
      </button>
    </div>
  );
}
