export interface Job {
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
}

export interface AgentLog {
  id: string;
  jobId: string;
  agent: 'PLANNER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'DOCWRITER';
  agentName: string;
  message: string;
  messageType: 'INFO' | 'BAND_MESSAGE' | 'CODE_OUTPUT' | 'TEST_RESULT' | 'ERROR';
  createdAt: string;
}

export interface SystemStatus {
  geminiEnabled: boolean;
  agentsOnline: string[];
  collaborationLayer: string;
  engineVersion: string;
}
