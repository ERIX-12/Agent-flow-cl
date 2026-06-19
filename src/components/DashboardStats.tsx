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
        <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Jobs</span>
            <Flame className={`w-4 h-4 text-orange-400 ${activeJobs > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <span className="text-xl font-extrabold text-slate-200 mt-1 block">
            {activeJobs}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success Rt</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-slate-200 mt-1 block">
            {totalJobs > 0 ? `${successRate}%` : '100%'}
          </span>
        </div>
      </div>

      {/* 2. System Status Diagnostic Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-left">
        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Orchestrator Diagnostics
        </span>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span>Channel Engine</span>
            <span className="text-slate-300 font-mono font-medium text-[11px]">Virtual BandRoom</span>
          </div>
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span>Engine Version</span>
            <span className="text-slate-300 font-mono font-medium text-[11px]">{systemStatus?.engineVersion || '1.0.4-LTS'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span>Gemini LLM Channel</span>
            {systemStatus?.geminiEnabled ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> LIVE
              </span>
            ) : (
              <span className="text-blue-400 font-semibold flex items-center gap-1 text-[11px]" title="Demo mode utilizing pre-designed technical code assets. Connect API key to toggle live GPT behaviors.">
                SIMULATION
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pb-1">
            <span>Avg Review Cycles</span>
            <span className="text-slate-350 font-semibold text-[11px]">{avgIterations}x / job</span>
          </div>
        </div>
      </div>

      {/* API Key Notice */}
      {!systemStatus?.geminiEnabled && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
          <span className="font-bold text-blue-400 text-[11px] block uppercase tracking-wide">💡 Demo Mode Active</span>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
            To query Gemini API models live, add your <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300">GEMINI_API_KEY</code> in <strong>Settings &gt; Secrets</strong>.
          </p>
        </div>
      )}

      {/* History Actions */}
      <button
        onClick={onReset}
        disabled={totalJobs === 0}
        className="w-full py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/20 disabled:border-slate-850 disabled:text-slate-600 rounded-lg text-xs font-bold text-slate-400 uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        <span>Reset Pipeline History</span>
      </button>
    </div>
  );
}
