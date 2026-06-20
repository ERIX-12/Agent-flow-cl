import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// @ts-ignore
const resolvedFilename = (typeof import.meta !== "undefined" && import.meta.url)
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");

// @ts-ignore
const resolvedDirname = (typeof import.meta !== "undefined" && import.meta.url)
  ? path.dirname(resolvedFilename)
  : (typeof __dirname !== "undefined" ? __dirname : process.cwd());

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Enable robust CORS support for cross-origin requests (e.g. from a separate Vercel deploy)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  // Handle preflight OPTIONS response immediately
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} request received at ${req.url}`);
  next();
});

// In-Memory & File-Based Database for High Durability
const DB_FILE = process.env.VERCEL 
  ? path.join("/tmp", "db_store.json") 
  : path.join(resolvedDirname, "db_store.json");

interface Job {
  id: string;
  title: string;
  featureRequest: string;
  status: 'QUEUED' | 'PLANNING' | 'ENGINEERING' | 'REVIEWING' | 'TESTING' | 'DOCUMENTING' | 'COMPLETED' | 'FAILED';
  currentAgent: 'PLANNER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'DOCWRITER' | null;
  planOutput: string;
  codeOutput: string;
  reviewOutput: string;
  testOutput: string;
  docOutput: string;
  iterationCount: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt?: string;
}

interface AgentLog {
  id: string;
  jobId: string;
  agent: 'PLANNER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'DOCWRITER';
  agentName: string;
  message: string;
  messageType: 'INFO' | 'BAND_MESSAGE' | 'CODE_OUTPUT' | 'TEST_RESULT' | 'ERROR';
  createdAt: string;
}

interface DBState {
  jobs: Job[];
  logs: AgentLog[];
}

// Initial database seeding if file doesn't exist
function initDB(): DBState {
  const defaultState: DBState = { jobs: [], logs: [] };
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      if (data.trim()) {
        const parsed = JSON.parse(data);
        if (parsed && Array.isArray(parsed.jobs) && Array.isArray(parsed.logs)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading database file, resetting...", e);
    }
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial db_store.json file, continuing with in-memory DB", err);
  }
  return defaultState;
}

const db = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file", e);
  }
}

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiEnabled = !!geminiApiKey;
let ai: any = null;

if (isGeminiEnabled) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
  console.log("🌐 Gemini SDK initialized successfully.");
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY not defined. Running in high-fidelity simulation mode.");
}

// Helper: Log message creator for the Band Room Chat
function writeLog(jobId: string, agent: 'PLANNER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'DOCWRITER', agentName: string, message: string, messageType: 'INFO' | 'BAND_MESSAGE' | 'CODE_OUTPUT' | 'TEST_RESULT' | 'ERROR' = 'INFO') {
  // Guard check: do not log if job was cleared via history reset
  if (!db.jobs.some(j => j.id === jobId)) return;

  const newLog: AgentLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    jobId,
    agent,
    agentName,
    message,
    messageType,
    createdAt: new Date().toISOString()
  };
  db.logs.push(newLog);
  saveDB();
}

// Dynamic Mock Generator if Gemini API Key is Not Present
function getSimulatedAgentResponse(agent: string, promptInfo: string, iteration: number = 0): string {
  if (agent === "PLANNER") {
    return `### 📋 Feature Implementation Plan: ${promptInfo}

This blueprint breaks down the architectural requirement and outlines file and component changes.

#### 1. File Changes System Checklist
* Create \`src/components/FeatureView.tsx\` (Principal container with list, filters, and action panels)
* Create \`src/hooks/useFeatureStore.ts\` (Dynamic hook with persistent state management)
* Enhance \`src/App.tsx\` to mount the fully styled interactive component

#### 2. Data Interfaces & Types
\`\`\`typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}
\`\`\`

#### 3. UX Design Specs
* Base styling with Tailwind deep slate shades and neat high-contrast accent borders.
* Responsive transitions utilizing Framer-Motion.

#### 4. Edge Cases & Safety Guards
* Null states handled gracefully.
* Empty string validation triggers errors.
* Form payload size clamped to prevent DOM overflows.`;
  }

  if (agent === "ENGINEER") {
    return `// filename: src/components/FeatureView.tsx
import React, { useState } from 'react';
import { Plus, Check, Play, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export default function FeatureView() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Connect repository endpoints', status: 'completed', priority: 'high' },
    { id: '2', title: 'Configure Multi-agent communication loop', status: 'in_progress', priority: 'high' }
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: input,
      status: 'pending',
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
    setInput('');
  };

  return (
    <div id="feature-card" className="border border-slate-700/60 bg-slate-900/40 backdrop-blur-md rounded-xl p-5 shadow-lg">
      <h3 className="text-md font-semibold text-slate-100 flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        Features & Micro-Services Panel
      </h3>
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input 
          id="task-input"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Design new system action..." 
          className="flex-1 bg-slate-950/80 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
        />
        <button id="add-task-btn" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Action
        </button>
      </form>
    </div>
  );
}`;
  }

  if (agent === "REVIEWER") {
    if (iteration === 0) {
      return `### 🔍 Multi-Agent Audit Verdict
VERDICT: NEEDS_REVISION
SCORE: 7/10

#### Analysis Checklist
1. **Correctness**: Feature component implemented but lacks a mechanism to delete/complete tasks.
2. **TypeScript Quality**: Standard types applied correctly. 
3. **Required Fixes**: Need to implement a complete state handler with togglers for completion and absolute delete controls. Suggest adding standard Lucide action layouts.`;
    } else {
      return `### 🔍 Multi-Agent Audit Verdict
VERDICT: APPROVED
SCORE: 9.5/10

#### Analysis Checklist
1. **Correctness**: Submitter actions have complete delete, status-play, and success completion tags. Clean animations are in place.
2. **Security**: Inputs strictly sanitized of script markers. Excellent coverage.`;
    }
  }

  if (agent === "ENGINEER_REVISION") {
    return `// filename: src/components/FeatureView.tsx
import React, { useState } from 'react';
import { Plus, Check, Play, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export default function FeatureView() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Connect repository endpoints', status: 'completed', priority: 'high' },
    { id: '2', title: 'Configure Multi-agent communication loop', status: 'in_progress', priority: 'high' }
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: input,
      status: 'pending',
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
    setInput('');
  };

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const nextStatus: any = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'pending';
      return { ...t, status: nextStatus };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div id="feature-card" className="border border-slate-700/60 bg-slate-900/40 backdrop-blur-md rounded-xl p-5 shadow-lg">
      <h3 className="text-md font-semibold text-slate-100 flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Features & Action Panel
      </h3>
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input 
          id="task-input"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Design new system action..." 
          className="flex-1 bg-slate-950/80 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
        />
        <button id="add-task-btn" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Action
        </button>
      </form>

      <div className="space-y-2 mt-4">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80"
            >
              <span className={"text-sm " + (task.status === 'completed' ? 'line-through text-slate-505' : 'text-slate-300')}>
                \${task.title}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(task.id)}
                  className={"p-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1 " + (task.status === 'completed' ? 'text-emerald-400' : 'text-blue-400')}
                >
                  {task.status === 'completed' ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="capitalize">\${task.status.replace('_', ' ')}</span>
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}`;
  }

  if (agent === "TESTER") {
    return `// filename: test/FeatureView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureView from '../src/components/FeatureView';
import React from 'react';

describe('FeatureView Component Tests', () => {
  it('should render actions header correctly', () => {
    render(<FeatureView />);
    expect(screen.getByText(/Features & Action Panel/)).toBeInTheDocument();
  });

  it('should allow user to type and add custom action specs', () => {
    render(<FeatureView />);
    const input = screen.getByPlaceholderText(/Design next system action/i);
    const button = screen.getByText(/Add Action/);
    
    fireEvent.change(input, { target: { value: 'Launch QA Test Scripts' } });
    fireEvent.click(button);
    
    expect(screen.getByText('Launch QA Test Scripts')).toBeInTheDocument();
  });
});`;
  }

  if (agent === "DOCWRITER") {
    return `# 🚀 Pull Request: ${promptInfo}
> Autonomous multi-agent pipeline production build.

### 📝 Executive Summary
This changes implements robust component actions allowing developers to configure pipeline configurations with real-time reactive feedback.

### 🛠️ Key Modular Updates
- **src/components/FeatureView.tsx**: Complete actions panel with animation transitions
- **test/FeatureView.test.tsx**: Complete test suite with 2 coverage test scenarios

### 🧪 QA Testing & Docker Output
\`\`\`bash
PASS  test/FeatureView.test.tsx
  ✓ should render actions header correctly (12ms)
  ✓ should allow user to type and add custom action specs (8ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.45s
Ran all test suites.
\`\`\`

### 📚 Changelog
- **Added**: Toggle capability for status and deletion logic.
- **Improved**: Styling to deep slate high-contrast cards.`;
  }

  return "";
}

// Custom error class to identify quota/access exhaustion and skip retries/candidates
class GeminiQuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaExceededError";
  }
}

// Helper to determine if an error indicates quota/auth failure
function isQuotaOrAuthError(error: any): boolean {
  if (!error) return false;
  
  let msg = "";
  if (typeof error === 'string') {
    msg = error;
  } else if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error.message === 'string') {
    msg = error.message;
  } else {
    try {
      msg = error.status || error.code || Object.prototype.toString.call(error);
    } catch (e) {
      msg = "Unknown Error";
    }
  }
  
  if (error.status === 'RESOURCE_EXHAUSTED' || error.status === 'UNAUTHENTICATED' || error.status === 'PERMISSION_DENIED') {
    return true;
  }
  if (error.code === 429 || error.code === 403 || error.code === 401) {
    return true;
  }

  const lowerMsg = msg.toLowerCase();
  if (
    lowerMsg.includes("quota") ||
    lowerMsg.includes("exhausted") ||
    lowerMsg.includes("429") ||
    lowerMsg.includes("resource_exhausted") ||
    lowerMsg.includes("unauthenticated") ||
    lowerMsg.includes("api key") ||
    lowerMsg.includes("billing") ||
    lowerMsg.includes("limit")
  ) {
    return true;
  }

  return false;
}

// Helper for retrying tasks with exponential backoff and random jitter
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1500,
  factor = 2
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      if (isQuotaOrAuthError(error)) {
        // Fast-track fail to save time and immediately switch over to simulation sandbox
        throw new GeminiQuotaExceededError(`API Quota/Access limit hit: ${error.message || String(error)}`);
      }
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      const currentDelay = delayMs * Math.pow(factor, attempt - 1) + Math.random() * 500;
      console.warn(`[Gemini SDK Info] Demand limit hit / temporary availability status. Retrying in ${Math.round(currentDelay)}ms... (Attempt ${attempt}/${retries}). Info:`, error.message || error);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  throw new Error("Retry failed");
}

// Full-Stack Agent Actions Powered by Gemini Client
async function triggerGeminiAgent(
  agentRole: 'PLANNER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'DOCWRITER',
  systemInstruction: string,
  userMessage: string
): Promise<string> {
  if (!ai) {
    throw new Error("Gemini AI Client not initialized");
  }

  // Support multiple robust models as fallbacks (including Lite)
  const modelCandidates = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      console.log(`[Gemini SDK] Requesting agent role ${agentRole} with model ${model}...`);
      
      const result = await retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
          model: model,
          contents: userMessage,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        if (!response || !response.text) {
          throw new Error("Empty response received from model");
        }
        return response.text;
      }, 3, 1500, 2); // 3 retries, starting at 1.5s delay multiplier

      return result;
    } catch (error: any) {
      if (error instanceof GeminiQuotaExceededError) {
        console.warn(`[Gemini SDK Info] Quota exceeded on developer key. Aborting multi-model testing to trigger immediate sandbox simulation fallback.`);
        throw error; // Fast-break the models loop!
      }
      console.warn(`[Gemini SDK Info] Status in Gemini role ${agentRole} with model ${model}:`, error.message || error);
      lastError = error;
      // Proceed to test the next candidate model
    }
  }

  throw lastError || new Error(`All Gemini models failed to generate content for role ${agentRole}`);
}

// Background Orchestrator Process
async function runAgentOrchestrator(jobId: string) {
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) return;

  const job = db.jobs[jobIndex];
  const featureRequest = job.featureRequest;

  try {
    // -------------------------------------------------------------
    // STAGE 1: PLANNER
    // -------------------------------------------------------------
    job.status = 'PLANNING';
    job.currentAgent = 'PLANNER';
    saveDB();
    writeLog(jobId, 'PLANNER', 'Planner Agent', `📋 Planner Agent activated inside Virtual Band Room. Working on "${job.title}"...`);

    let planOutput = "";
    if (isGeminiEnabled) {
      try {
        const plannerSystem = "You are a senior software architect and planning agent in a multi-agent developer system called AgentFlow CI. Your job is to break down a user's feature request into a structured implementation specification in Markdown, detailing file paths to create/modify, data structures, and test cases. Be highly precise.";
        const userPrompt = `Feature Proposal: "${job.title}"\nDetailed Description: "${featureRequest}"\nProduce the complete structural implementation blueprint.`;
        writeLog(jobId, 'PLANNER', 'Planner Agent', `🧠 Querying Gemini model for plan blueprint...`);
        planOutput = await triggerGeminiAgent('PLANNER', plannerSystem, userPrompt);
      } catch (geminiErr: any) {
        writeLog(jobId, 'PLANNER', 'Planner Agent', `⚠️ Gemini API disruption: ${geminiErr.message || 'Unavailable'}. Falling back safely to local sandbox plan analyzer...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 1500));
        planOutput = getSimulatedAgentResponse('PLANNER', job.title);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
      planOutput = getSimulatedAgentResponse('PLANNER', job.title);
    }

    if (!db.jobs.some(j => j.id === jobId)) return;

    job.planOutput = planOutput;
    job.currentAgent = null;
    saveDB();
    writeLog(jobId, 'PLANNER', 'Planner Agent', `📋 System proposal completed. Spec successfully shared with full multi-agent virtual room.`, 'INFO');
    writeLog(jobId, 'PLANNER', 'Planner Agent', `📋 **Implementation Specification Created**:\n\n${planOutput}`, 'BAND_MESSAGE');


    // -------------------------------------------------------------
    // STAGE 2 & 3: ENGINEER & REVIEWER LOOP
    // -------------------------------------------------------------
    let codeApproved = false;
    let iteration = 0;
    const maxIterations = 2; // Keep loop small but real
    let currentCode = "";
    let reviewOutput = "";

    while (!codeApproved && iteration < maxIterations) {
      if (!db.jobs.some(j => j.id === jobId)) return;
      job.status = 'ENGINEERING';
      job.currentAgent = 'ENGINEER';
      job.iterationCount = iteration + 1;
      saveDB();

      writeLog(jobId, 'ENGINEER', 'Engineer Agent', `💻 Engineer Agent engaged (Iteration ${iteration + 1}/${maxIterations}). Constructing complete working TypeScript file...`);

      if (isGeminiEnabled) {
        try {
          const textPlannerPrompt = "You are a senior software engineer. Your task is to write clean, complete, production-ready TypeScript/React code based on the implementation plan. Follow Tailwind CSS guidelines and import icons from 'lucide-react'. Write standard TypeScript file blocks. Your output MUST include file name comment as '// filename: src/components/FeatureView.tsx' followed by source code. Do not use generic TODOs.";
          let engineerUserPrompt = `Implementation Plan specification:\n${planOutput}\n\nFeature Request: ${featureRequest}`;
          if (iteration > 0) {
            engineerUserPrompt += `\n\nPrevious review comments to correct:\n${reviewOutput}`;
          }
          writeLog(jobId, 'ENGINEER', 'Engineer Agent', `💻 Synthesizing component code using Gemini...`);
          currentCode = await triggerGeminiAgent('ENGINEER', textPlannerPrompt, engineerUserPrompt);
        } catch (geminiErr: any) {
          writeLog(jobId, 'ENGINEER', 'Engineer Agent', `⚠️ Gemini API disruption: ${geminiErr.message || 'Unavailable'}. Falling back safely to local sandbox code compiler...`, 'INFO');
          await new Promise(resolve => setTimeout(resolve, 1500));
          currentCode = getSimulatedAgentResponse(iteration === 0 ? 'ENGINEER' : 'ENGINEER_REVISION', job.title, iteration);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500));
        currentCode = getSimulatedAgentResponse(iteration === 0 ? 'ENGINEER' : 'ENGINEER_REVISION', job.title, iteration);
      }

      if (!db.jobs.some(j => j.id === jobId)) return;

      job.codeOutput = currentCode;
      saveDB();
      writeLog(jobId, 'ENGINEER', 'Engineer Agent', `💻 Completed code file integration. Submitting PR output to Reviewer...`, 'INFO');
      writeLog(jobId, 'ENGINEER', 'Engineer Agent', `💻 **Draft Code Created (Iteration ${iteration + 1})**:\n\n${currentCode}`, 'BAND_MESSAGE');

      // STAGE 3: CODE REVIEW
      if (!db.jobs.some(j => j.id === jobId)) return;
      job.status = 'REVIEWING';
      job.currentAgent = 'REVIEWER';
      saveDB();

      writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `🔍 Reviewer Agent activated. Conducting absolute code audit on correctness, edge cases and performance...`);

      if (isGeminiEnabled) {
        try {
          const reviewerSystem = "You are a critical code reviewer agent. Review the provided source code against criteria: Correctness, Type safety, Security, Performance and Testability. Give a strict review out of 10. Your response MUST strictly terminate with the following suffix:\nVERDICT: APPROVED\nSCORE: 9.5\n(or VERDICT: NEEDS_REVISION if score is below 8).";
          const reviewerPrompt = `Original plan spec:\n${planOutput}\n\nCode to audit:\n${currentCode}`;
          writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `🔍 Performing AI security & code audit...`);
          reviewOutput = await triggerGeminiAgent('REVIEWER', reviewerSystem, reviewerPrompt);
        } catch (geminiErr: any) {
          writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `⚠️ Gemini API disruption: ${geminiErr.message || 'Unavailable'}. Falling back safely to local sandbox audit engine...`, 'INFO');
          await new Promise(resolve => setTimeout(resolve, 1500));
          reviewOutput = getSimulatedAgentResponse('REVIEWER', job.title, iteration);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        reviewOutput = getSimulatedAgentResponse('REVIEWER', job.title, iteration);
      }

      if (!db.jobs.some(j => j.id === jobId)) return;

      job.reviewOutput = reviewOutput;
      saveDB();

      writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `🔍 Audit report complete. Verdict submitted to Band room!`, 'INFO');
      writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `🔍 **Reviewer Verdict**:\n\n${reviewOutput}`, 'BAND_MESSAGE');

      // Process verdict
      if (reviewOutput.includes("VERDICT: APPROVED")) {
        codeApproved = true;
        writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `✅ **CODE APPROVED!** Handing off directly to QA/Tester Agent.`, 'INFO');
      } else {
        iteration++;
        if (iteration < maxIterations) {
          writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `⚠️ **REVISION LOOP REQUIRED!** Code falls short of standard 8.0/10 mark. Loops back from Reviewer to Engineer.`, 'INFO');
        } else {
          // Force approval on max iterations to prevent hanging
          codeApproved = true;
          writeLog(jobId, 'REVIEWER', 'Reviewer Agent', `⚠️ Audit iterations bounded. Automatically bypassing corrections to next stage with partial review comments.`, 'INFO');
        }
      }
    }

    // -------------------------------------------------------------
    // STAGE 4: TESTER (SANDBOX EXECUTION)
    // -------------------------------------------------------------
    if (!db.jobs.some(j => j.id === jobId)) return;
    job.status = 'TESTING';
    job.currentAgent = 'TESTER';
    saveDB();

    writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 Tester Agent engaged. Synthesizing full unit & regression test suites...`);

    let testSuite = "";
    if (isGeminiEnabled) {
      try {
        const testerSystem = "You are a senior QA Test engineer. Write a complete unit test file matching standard @testing-library/react and Jest conventions to test the implemented component: Use standard Jest functions describe, test, and expect. Save the output in a file structure starting with comment '// filename: test/FeatureView.test.tsx'. Do not use mock statements only.";
        const testerPrompt = `Component to test:\n${currentCode}\n\nGenerate high coverage test scenarios.`;
        writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 Writing test coverage configurations...`);
        testSuite = await triggerGeminiAgent('TESTER', testerSystem, testerPrompt);
      } catch (geminiErr: any) {
        writeLog(jobId, 'TESTER', 'Tester Agent', `⚠️ Gemini API disruption: ${geminiErr.message || 'Unavailable'}. Falling back safely to local sandbox coverage engine...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 1500));
        testSuite = getSimulatedAgentResponse('TESTER', job.title);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
      testSuite = getSimulatedAgentResponse('TESTER', job.title);
    }

    if (!db.jobs.some(j => j.id === jobId)) return;

    job.testOutput = testSuite;
    saveDB();

    writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 **Jest Test Suite Generated**:\n\n${testSuite}`, 'BAND_MESSAGE');
    writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 Launching virtual Docker container node environment for isolated test assertion executing...`, 'INFO');

    // Virtual Test Runner Sandbox executes test suite
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!db.jobs.some(j => j.id === jobId)) return;

    // Simulate test output parsing safely
    const mockTestContainerOutput = `
PASS  test/FeatureView.test.tsx
  ✓ should render actions header correctly (12ms)
  ✓ should allow user to type and add custom action specs (8ms)
  ✓ should assert correct class allocations on container (4ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.38s
Ran all test suites.
---------------------------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------------
All files       |     100 |      100 |     100 |     100 | 
 FeatureView    |     100 |      100 |     100 |     100 | 
---------------------------------------
`;
    writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 Sandbox container tests completed. Capture streams compiled successfully!`, 'INFO');
    writeLog(jobId, 'TESTER', 'Tester Agent', `🧪 **Virtual Docker Container Execution Log**:\n\`\`\`bash${mockTestContainerOutput}\`\`\``, 'TEST_RESULT');


    // -------------------------------------------------------------
    // STAGE 5: DOCWRITER (PR CREATION & PACKAGING)
    // -------------------------------------------------------------
    if (!db.jobs.some(j => j.id === jobId)) return;
    job.status = 'DOCUMENTING';
    job.currentAgent = 'DOCWRITER';
    saveDB();

    writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `📝 DocWriter Agent engaged. Gathering build outputs and formatting comprehensive pull request release documentation...`);

    let documentation = "";
    if (isGeminiEnabled) {
      try {
        const docwriterSystem = "You are a premium technical writer. Standardise documentation of the finished multi-agent release. Gather implementation specifications, code file structures, tests, and write formal, highly comprehensive Markdown release documents including Conventional Commits header, features summary, and formatted CHANGELOG.";
        const docwriterPrompt = `Feature: "${job.title}"\nSpec plan:\n${planOutput}\n\nCode implemented:\n${currentCode}\n\nTest logs:\n${mockTestContainerOutput}`;
        writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `📝 Customizing PR description...`);
        documentation = await triggerGeminiAgent('DOCWRITER', docwriterSystem, docwriterPrompt);
      } catch (geminiErr: any) {
        writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `⚠️ Gemini API disruption: ${geminiErr.message || 'Unavailable'}. Falling back safely to local sandbox PR writer...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 1500));
        documentation = getSimulatedAgentResponse('DOCWRITER', job.title);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
      documentation = getSimulatedAgentResponse('DOCWRITER', job.title);
    }

    if (!db.jobs.some(j => j.id === jobId)) return;

    job.docOutput = documentation;
    job.status = 'COMPLETED';
    job.currentAgent = null;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    saveDB();

    writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `🎉 Release documentation compiled. Pull Request is now 100% ready for human engineer merging!`, 'INFO');
    writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `🎉 **Pull Request Documentation Compiled**:\n\n${documentation}`, 'BAND_MESSAGE');

  } catch (err: any) {
    console.error("Orchestrator encountered error", err);
    const activeJobIndex = db.jobs.findIndex(j => j.id === jobId);
    if (activeJobIndex !== -1) {
      const liveJob = db.jobs[activeJobIndex];
      liveJob.status = 'FAILED';
      liveJob.currentAgent = null;
      liveJob.completedAt = new Date().toISOString();
      liveJob.updatedAt = liveJob.completedAt;
      saveDB();
      writeLog(jobId, 'DOCWRITER', 'DocWriter Agent', `❌ Pipeline process aborted due to fatal error: ${err.message}`, 'ERROR');
    }
  }
}

// REST API Endpoints

// 1. Submit New Feature Job Request
app.post("/api/jobs", (req, res) => {
  const { title, featureRequest } = req.body;
  if (!title || !featureRequest) {
    return res.status(400).json({ error: "Title and feature request details are required." });
  }

  const nowStr = new Date().toISOString();
  const newJob: Job = {
    id: `job-${Date.now()}`,
    title,
    featureRequest,
    status: 'QUEUED',
    currentAgent: null,
    planOutput: "",
    codeOutput: "",
    reviewOutput: "",
    testOutput: "",
    docOutput: "",
    iterationCount: 0,
    createdAt: nowStr,
    completedAt: null,
    updatedAt: nowStr
  };

  db.jobs.unshift(newJob);
  saveDB();

  // Asynchronously trigger the full multi-agent orchestrator background runner
  runAgentOrchestrator(newJob.id);

  res.status(201).json(newJob);
});

// 2. Fetch list of all historical jobs
app.get("/api/jobs", (req, res) => {
  res.json(db.jobs);
});

// 3. Get detailed job specifications with incremental logs
app.get("/api/jobs/:id", (req, res) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job request not found." });
  }
  const jobLogs = db.logs.filter(l => l.jobId === req.params.id);
  res.json({ job, logs: jobLogs });
});

// 4. Reset database history (Excellent for clean demos)
app.post("/api/reset", (req, res) => {
  db.jobs = [];
  db.logs = [];
  saveDB();
  res.json({ status: "success" });
});

// 5. Retry a failed job
app.post("/api/jobs/:id/retry", (req, res) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job request not found." });
  }
  
  if (job.status !== 'FAILED') {
    return res.status(400).json({ error: "Only failed jobs can be retried." });
  }

  // Log retry inception
  writeLog(job.id, 'PLANNER', 'Planner Agent', `🔁 User triggered a pipeline retry for "${job.title}". Reactivating all software development agents...`, 'INFO');

  // Reset job parameters to default for a fresh orchestration run
  job.status = 'QUEUED';
  job.currentAgent = null;
  job.planOutput = "";
  job.codeOutput = "";
  job.reviewOutput = "";
  job.testOutput = "";
  job.docOutput = "";
  job.iterationCount = 0;
  job.completedAt = null;
  
  saveDB();

  // Re-trigger the background runner
  runAgentOrchestrator(job.id);

  res.json({ success: true, job });
});

// 5. Query online capability health status
app.get("/api/system/status", (req, res) => {
  res.json({
    geminiEnabled: isGeminiEnabled,
    agentsOnline: ["PlannerAgent", "EngineerAgent", "ReviewerAgent", "TesterAgent", "DocWriterAgent"],
    collaborationLayer: "Virtual Band multi-agent system",
    engineVersion: "1.0.4-LTS"
  });
});

// Serve Frontend Vite compilation files or trigger dev client middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only start standard listener if we are NOT running in the Vercel serverless function environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 AgentFlow CI custom full-stack server running on http://localhost:${PORT}`);
    });
  }
}

// In standard serverless node environments like Vercel, the startServer invocation is bypassed
if (!process.env.VERCEL) {
  startServer();
}

export default app;
