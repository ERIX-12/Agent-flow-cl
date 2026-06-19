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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase">New Agent Job</h3>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Feature Title
          </label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. D3 commit visualizer module"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Feature Request Specifications
          </label>
          <textarea
            required
            rows={4}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            disabled={isSubmitting}
            placeholder="Describe the technical requirements, components, models, and outputs for the autonomous agents to build..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !request.trim() || isSubmitting}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 font-medium text-sm text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          {isSubmitting ? (
            <>
              <Terminal className="w-4 h-4 animate-spin text-blue-300" />
              <span>Orchestrator Triggered...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Deploy Multi-Agent Pipeline</span>
            </>
          )}
        </button>
      </form>

      {/* Showcase Suggestions */}
      {!isSubmitting && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Blueprint Templates
          </span>
          <div className="space-y-2">
            {TEMPLATE_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => applyTemplate(item)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/90 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
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
