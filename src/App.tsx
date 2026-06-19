import React, { useState, useEffect } from 'react';
import { Job, AgentLog, SystemStatus } from './types';
import JobSubmitForm from './components/JobSubmitForm';
import AgentPipeline from './components/AgentPipeline';
import LiveAgentChat from './components/LiveAgentChat';
import JobDetail from './components/JobDetail';
import DashboardStats from './components/DashboardStats';
import { Layers, Terminal, Server, Flame, Sparkles, FolderLock, Plus, Compass } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync general database stats and specific active job logs
  const fetchState = async () => {
    try {
      // 1. Fetch system parameter states
      const systemRes = await fetch("/api/system/status");
      if (systemRes.ok) {
        const data = await systemRes.json();
        setSystemStatus(data);
      }

      // 2. Fetch list of recent pipeline runs
      const jobsRes = await fetch("/api/jobs");
      if (jobsRes.ok) {
        const jobsData: Job[] = await jobsRes.json();
        setJobs(jobsData);
        
        // Auto-select the first job if none selected yet
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching general database state", err);
    }
  };

  // Sync selected job details and its custom logs
  const fetchSelectedJobDetails = async () => {
    if (!selectedJob) return;
    try {
      const detailRes = await fetch(`/api/jobs/${selectedJob.id}`);
      if (detailRes.ok) {
        const data = await detailRes.json();
        // Update both the selected job and the matching logs array
        setSelectedJob(data.job);
        setLogs(data.logs);
        
        // Update in list
        setJobs(prevJobs => prevJobs.map(j => j.id === data.job.id ? data.job : j));
      }
    } catch (err) {
      console.error("Error fetching job logs", err);
    }
  };

  // Poll database high-frequency for immediate visual state adjustments
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [selectedJob]);

  // Poll active logs faster when selecting an active progressing job
  useEffect(() => {
    fetchSelectedJobDetails();
    let logPollInterval: any = null;
    
    // Poll faster when job is actively planning, writing, reviewing, testing, or documenting
    if (selectedJob && selectedJob.status !== 'COMPLETED' && selectedJob.status !== 'FAILED') {
      logPollInterval = setInterval(fetchSelectedJobDetails, 1500);
    } else {
      logPollInterval = setInterval(fetchSelectedJobDetails, 4000);
    }
    
    return () => clearInterval(logPollInterval);
  }, [selectedJob?.id, selectedJob?.status]);

  // Handle Submission of New Agent Job
  const handleJobSubmit = async (title: string, specDetails: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, featureRequest: specDetails }),
      });
      if (response.ok) {
        const newJob = await response.json();
        setSelectedJob(newJob);
        setLogs([]); // Reset conversation pane for immediate progress mapping
        await fetchState();
      }
    } catch (err) {
      console.error("Error submitting job request", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear Database History logs
  const handleReset = async () => {
    if (confirm("Are you sure you want to absolute reset the multi-agent job history?")) {
      try {
        const response = await fetch("/api/reset", { method: "POST" });
        if (response.ok) {
          setJobs([]);
          setSelectedJob(null);
          setLogs([]);
          await fetchState();
        }
      } catch (err) {
        console.error("Error resetting database", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Dynamic Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold tracking-tight shrink-0 shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-sky-100" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-md font-extrabold text-slate-100 tracking-tight">AgentFlow CI</span>
              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Virtual SDK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Multi-Agent Continuous software delivery platform</p>
          </div>
        </div>

        {/* Diagnostic capabilities banner */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">5 Agents Live</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-bold uppercase font-mono text-[11px]">Port 3000 Ingress</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Left Column: Job submission & historical run lists (col-span-3) */}
        <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6 overflow-y-auto">
          {/*提交表单*/}
          <JobSubmitForm onSubmit={handleJobSubmit} isSubmitting={isSubmitting} />
          
          {/* Dashboard Stats Panel */}
          <DashboardStats jobs={jobs} systemStatus={systemStatus} onReset={handleReset} />

          {/* Recent sessions tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-left">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recent Pipeline Sessions
              </span>
              <span className="text-[10px] bg-slate-950 font-bold px-2 py-0.5 border border-slate-800 rounded-full text-slate-500">
                {jobs.length}
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-xs">
                No active session records found. Create one.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                {jobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isActive = job.status !== 'COMPLETED' && job.status !== 'FAILED';

                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between gap-2.5 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/10 text-white' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold truncate ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                          {job.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="font-semibold">{job.id.split('-')[1] ? `Run #${job.id.split('-')[1].slice(-4)}` : job.id}</span>
                          <span>•</span>
                          <span>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 border ${
                        job.status === 'COMPLETED' 
                          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                          : job.status === 'FAILED'
                          ? 'bg-rose-500/15 border-rose-500/35 text-rose-400'
                          : 'bg-blue-500/15 border-blue-500/35 text-blue-400 animate-pulse'
                      }`}>
                        {job.status === 'PLANNING' ? 'Design' :
                         job.status === 'ENGINEERING' ? 'Dev' :
                         job.status === 'REVIEWING' ? 'Audit' :
                         job.status === 'TESTING' ? 'QA' :
                         job.status === 'DOCUMENTING' ? 'Release' :
                         job.status === 'QUEUED' ? 'Queue' : job.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Grid Panel: Interactive Agent Pipeline Map & Output Tab Workspace (col-span-5) */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
          
          {/* Pipeline flow tracker (xl-span-5) */}
          <div className="xl:col-span-5 h-full">
            <AgentPipeline activeJob={selectedJob} />
          </div>

          {/* Code Workspaces & Output Tabs (xl-span-7) */}
          <div className="xl:col-span-7 flex flex-col h-full space-y-6">
            
            {/* selected run summary card if ready */}
            {selectedJob ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 text-left">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">
                      Current Feature spec
                    </span>
                    <h2 className="text-md font-extrabold text-slate-100 tracking-tight truncate mt-0.5">
                      {selectedJob.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                    <span>Task Status:</span>
                    <span className={`px-2.5 py-0.5 border rounded-full uppercase tracking-wider text-[10px] font-extrabold ${
                      selectedJob.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : selectedJob.status === 'FAILED'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-950">
                  {selectedJob.featureRequest}
                </p>
              </div>
            ) : (
              <div className="p-8 bg-slate-900/40 border border-slate-805 rounded-xl border-dashed text-slate-500 text-xs text-center flex flex-col items-center justify-center gap-2">
                <Compass className="w-8 h-8 text-slate-700 animate-spin" />
                <span className="font-semibold block uppercase text-[11px] text-slate-400">Waiting For Orchestration</span>
                <p className="text-[11px] text-slate-600 max-w-xs leading-normal">
                  Submit a new feature proposal on the left pane to activate the continuous integration pipeline modules.
                </p>
              </div>
            )}

            {/* Render Workspace code details when a job is active */}
            {selectedJob && (
              <div className="flex-1 min-h-0">
                <JobDetail job={selectedJob} onRetry={async () => {
                  await fetchSelectedJobDetails();
                  await fetchState();
                }} />
              </div>
            )}
          </div>

          {/* Chat Pane Virtual Band Room (xl-span-12 spanning full base row on wider displays) */}
          <div className="col-span-1 xl:col-span-12 h-[380px] xl:h-[350px]">
            <LiveAgentChat logs={logs} activeJobTitle={selectedJob?.title} />
          </div>

        </div>

      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3.5 text-center text-slate-500 text-[11px]">
        AgentFlow CI — Multi-Agent Software Development Hackathon Track 2 Entry | Built with Band SDK & Gemini API.
      </footer>

    </div>
  );
}
