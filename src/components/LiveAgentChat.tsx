import React, { useEffect, useRef, useState } from 'react';
import { AgentLog } from '../types';
import { MessageSquare, Users, Sparkles, Hash, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface LiveAgentChatProps {
  logs: AgentLog[];
  activeJobTitle?: string;
}

export default function LiveAgentChat({ logs, activeJobTitle }: LiveAgentChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);



  const getAgentStyles = (agent: string) => {
    switch (agent) {
      case 'PLANNER':
        return {
          bg: 'bg-indigo-50/50 border-indigo-150 text-indigo-900',
          badge: 'bg-indigo-100 border-indigo-200 text-indigo-700',
          avatar: '🧠',
          accent: 'border-l-[3px] border-l-indigo-500'
        };
      case 'ENGINEER':
        return {
          bg: 'bg-blue-50/50 border-blue-150 text-blue-900',
          badge: 'bg-blue-100 border-blue-200 text-blue-700',
          avatar: '💻',
          accent: 'border-l-[3px] border-l-blue-500'
        };
      case 'REVIEWER':
        return {
          bg: 'bg-amber-50/50 border-amber-150 text-slate-900',
          badge: 'bg-amber-100 border-amber-250 text-amber-800',
          avatar: '🔍',
          accent: 'border-l-[3px] border-l-amber-500'
        };
      case 'TESTER':
        return {
          bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-900',
          badge: 'bg-emerald-100 border-emerald-200 text-emerald-700',
          avatar: '🧪',
          accent: 'border-l-[3px] border-l-emerald-500'
        };
      case 'DOCWRITER':
        return {
          bg: 'bg-pink-50/50 border-pink-150 text-pink-900',
          badge: 'bg-pink-100 border-pink-200 text-pink-700',
          avatar: '📝',
          accent: 'border-l-[3px] border-l-pink-500'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-150 text-slate-900',
          badge: 'bg-slate-100 border-slate-200 text-slate-700',
          avatar: '🤖',
          accent: 'border-l-[3px] border-l-slate-400'
        };
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-sm shadow-slate-100 overflow-hidden">
      {/* Band Room Header */}
      <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">virtual-band-collab-room</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
            <span title="Planner Agent" className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] cursor-help shadow-sm">🧠</span>
            <span title="Engineer Agent" className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] cursor-help shadow-sm">💻</span>
            <span title="Reviewer Agent" className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] cursor-help shadow-sm">🔍</span>
            <span title="Tester Agent" className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] cursor-help shadow-sm">🧪</span>
            <span title="DocWriter Agent" className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] cursor-help shadow-sm">📝</span>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-250 px-2 py-0.5 rounded-full uppercase">
            Active
          </span>
        </div>
      </div>

      {/* Sub header for Current run context */}
      {activeJobTitle && (
        <div className="bg-[#fbfbfb] px-4 py-2 text-slate-600 text-xs border-b border-slate-200 truncate flex items-center gap-1.5 text-left">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Active Run:</span>
          <span className="text-slate-800 font-extrabold truncate">"{activeJobTitle}"</span>
        </div>
      )}

      {/* Message Feed Canvas */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]/50 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 bg-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="max-w-xs">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Empty Collab Channel</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Submit a feature request to activate the orchestrator workflow and monitor discussions between the 5 specialised agents.
              </p>
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const style = getAgentStyles(log.agent);
            const isBandMsg = log.messageType === 'BAND_MESSAGE' || log.messageType === 'CODE_OUTPUT' || log.messageType === 'TEST_RESULT';
            const isExpanded = expandedLogId === log.id;

            return (
              <div 
                key={log.id} 
                className={`flex gap-3 p-3 rounded-lg border text-sm transition-all text-left bg-white border-slate-200/80 shadow-sm ${style.accent}`}
              >
                {/* Avatar Icon */}
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-xs shrink-0 select-none shadow-sm">
                  {style.avatar}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs tracking-wide">
                      {log.agentName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 border rounded font-extrabold uppercase tracking-wider ${style.badge}`}>
                      {log.agent}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono ml-auto">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Standard Text or Collapsible Payload Output */}
                  <div className="mt-1.5 text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                    {isBandMsg ? (
                      <div className="border border-slate-200 bg-[#0f172a] text-slate-100 rounded-lg overflow-hidden mt-1.5 shadow-inner">
                        <div 
                          onClick={(e) => toggleExpand(log.id, e)}
                          className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-950 cursor-pointer hover:bg-slate-950 transition-colors select-none text-[10px]"
                        >
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <Code className="w-3.5 h-3.5" /> 
                            {log.agent === 'PLANNER' ? 'Execution Spec Document' :
                             log.agent === 'ENGINEER' ? 'Source File Draft' :
                             log.agent === 'REVIEWER' ? 'QA Audit Report' :
                             log.agent === 'TESTER' ? 'Test Docker Logs' : 'Compiled PR docs'}
                          </span>
                          <span className="text-slate-450 font-bold hover:text-slate-200">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        
                        <div className={`overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300 bg-black/40 transition-all duration-300 ${
                          isExpanded ? 'p-3 max-h-[350px]' : 'max-h-0'
                        }`}>
                          {log.message}
                        </div>
                        
                        {!isExpanded && (
                          <div 
                            onClick={(e) => toggleExpand(log.id, e)}
                            className="text-center py-2 text-[10px] text-slate-400 bg-slate-950 hover:text-emerald-400 cursor-pointer font-bold uppercase tracking-wider select-none"
                          >
                            Click to expand content details
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium text-slate-700">{log.message}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
