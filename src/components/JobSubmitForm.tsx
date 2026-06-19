import React, { useState } from 'react';
import { Send, Sparkles, Terminal, FileText } from 'lucide-react';

interface JobSubmitFormProps {
  onSubmit: (title: string, specName: string) => Promise<void>;
  isSubmitting: boolean;
}

const TEMPLATE_SUGGESTIONS = [
  {
    title: "Dynamic Activity Heatmap",
    desc: "Build a responsive D3-based component representing git-style commits with sleek cursor popups."
  },
  {
    title: "Multi-factor OTP Authenticator",
    desc: "Create an isolated server schema validating strict numeric validation tokens with JWT fallback guards."
  },
  {
    title: "Real-time Weather Forecast View",
    desc: "Design an elegant high-contrast weather layout rendering current forecast modules with state triggers."
  }
];

export default function JobSubmitForm({ onSubmit, isSubmitting }: JobSubmitFormProps) {
  const [title, setTitle] = useState('');
  const [request, setRequest] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !request.trim() || isSubmitting) return;
    await onSubmit(title, request);
    setTitle('');
    setRequest('');
  };

  const applyTemplate = (item: typeof TEMPLATE_SUGGESTIONS[0]) => {
    setTitle(item.title);
    setRequest(item.desc);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">New Agent Task</h3>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Feature Title
          </label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. D3 commit visualizer module"
            className="w-full bg-[#fafafa]/80 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Feature Request Specifications
          </label>
          <textarea
            required
            rows={4}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            disabled={isSubmitting}
            placeholder="Describe the technical requirements, components, models, and outputs for the autonomous agents to build..."
            className="w-full bg-[#fafafa]/80 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !request.trim() || isSubmitting}
          className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 font-extrabold text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Terminal className="w-4 h-4 animate-spin text-black" />
              <span>Orchestrator Triggered...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-black" />
              <span>Deploy Multi-Agent Pipeline</span>
            </>
          )}
        </button>
      </form>

      {/* Showcase Suggestions */}
      {!isSubmitting && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
            Suggested Blueprint Templates
          </span>
          <div className="space-y-2">
            {TEMPLATE_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => applyTemplate(item)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/50 border border-slate-150 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-xs group"
              >
                <div className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </div>
                <div className="text-slate-500 leading-normal mt-0.5 truncate">
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
