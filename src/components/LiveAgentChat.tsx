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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentStyles = (agent: string) => {
    switch (agent) {
      case 'PLANNER':
        return {
          bg: 'bg-purple-950/20 border-purple-800/40 text-purple-300',
          badge: 'bg-purple-500/15 border-purple-500/35 text-purple-400',
          avatar: '🧠',
          accent: 'border-l-2 border-l-purple-500'
        };
      case 'ENGINEER':
        return {
          bg: 'bg-blue-950/20 border-blue-800/40 text-blue-300',
          badge: 'bg-blue-500/15 border-blue-500/35 text-blue-400',
          avatar: '💻',
          accent: 'border-l-2 border-l-blue-500'
        };
      case 'REVIEWER':
        return {
          bg: 'bg-yellow-950/20 border-yellow-800/40 text-yellow-300',
          badge: 'bg-yellow-500/15 border-yellow-500/35 text-yellow-400',
          avatar: '🔍',
          accent: 'border-l-2 border-l-yellow-500'
        };
      case 'TESTER':
        return {
          bg: 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300',
          badge: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400',
          avatar: '🧪',
          accent: 'border-l-2 border-l-emerald-500'
        };
      case 'DOCWRITER':
        return {
          bg: 'bg-pink-950/20 border-pink-800/40 text-pink-300',
          badge: 'bg-pink-500/15 border-pink-500/35 text-pink-400',
          avatar: '📝',
          accent: 'border-l-2 border-l-pink-500'
        };
      default:
        return {
          bg: 'bg-slate-950/40 border-slate-800/60 text-slate-300',
          badge: 'bg-slate-800 border-slate-700 text-slate-400',
          avatar: '🤖',
          accent: 'border-l-2 border-l-slate-700'
        };
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-xl overflow-hidden">
      {/* Band Room Header */}
      <div className="bg-slate-950/80 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-200 text-sm tracking-wide">virtual-band-collab-room</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
            <span title="Planner Agent" className="w-5.5 h-5.5 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-[10px] cursor-help">🧠</span>
            <span title="Engineer Agent" className="w-5.5 h-5.5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-[10px] cursor-help">💻</span>
            <span title="Reviewer Agent" className="w-5.5 h-5.5 rounded-full bg-yellow-950 border border-yellow-800 flex items-center justify-center text-[10px] cursor-help">🔍</span>
            <span title="Tester Agent" className="w-5.5 h-5.5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] cursor-help">🧪</span>
            <span title="DocWriter Agent" className="w-5.5 h-5.5 rounded-full bg-pink-950 border border-pink-800 flex items-center justify-center text-[10px] cursor-help">📝</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse uppercase">
            Active
          </span>
        </div>
      </div>

      {/* Sub header for Current run context */}
      {activeJobTitle && (
        <div className="bg-slate-950/40 px-4 py-2 text-slate-400 text-xs border-b border-slate-800/60 truncate flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-medium text-slate-300">Active Pipeline Session:</span>
          <span className="text-blue-400 font-semibold truncate">"{activeJobTitle}"</span>
        </div>
      )}

      {/* Message Feed Canvas */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-600 bg-slate-950/40">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="max-w-xs">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Empty Band channel</span>
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
                className={`flex gap-3 p-3 rounded-lg border text-sm transition-all text-left ${style.bg} ${style.accent}`}
              >
                {/* Avatar Icon */}
                <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-center text-xs shrink-0 select-none shadow">
                  {style.avatar}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-200 text-xs tracking-wide">
                      {log.agentName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 border rounded font-semibold uppercase tracking-wider ${style.badge}`}>
                      {log.agent}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono ml-auto">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Standard Text or Collapsible Payload Output */}
                  <div className="mt-1.5 text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                    {isBandMsg ? (
                      <div className="border border-slate-800/80 bg-slate-950/80 rounded-lg overflow-hidden mt-1.5 shadow-inner">
                        <div 
                          onClick={(e) => toggleExpand(log.id, e)}
                          className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-900 cursor-pointer hover:bg-slate-950/80 transition-colors select-none text-[10px]"
                        >
                          <span className="font-semibold text-blue-400 flex items-center gap-1">
                            <Code className="w-3.5 h-3.5" /> 
                            {log.agent === 'PLANNER' ? 'Execution Spec Document' :
                             log.agent === 'ENGINEER' ? 'Source File Draft' :
                             log.agent === 'REVIEWER' ? 'QA Audit Report' :
                             log.agent === 'TESTER' ? 'Test Docker Logs' : 'Compiled PR docs'}
                          </span>
                          <span className="text-slate-500 font-bold hover:text-slate-300">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        
                        <div className={`overflow-x-auto text-[11px] font-mono leading-relaxed transition-all duration-300 ${
                          isExpanded ? 'p-3 max-h-[350px]' : 'max-h-0'
                        }`}>
                          {log.message}
                        </div>
                        
                        {!isExpanded && (
                          <div 
                            onClick={(e) => toggleExpand(log.id, e)}
                            className="text-center py-2 text-[10px] text-slate-500 bg-slate-950/30 hover:text-slate-400 cursor-pointer font-semibold"
                          >
                            Click to expand content details
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{log.message}</p>
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
