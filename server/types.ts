export type AgentMode = 'autonomous' | 'supervised' | 'demo';

export type AgentStatus =
  | 'idle'
  | 'planning'
  | 'running'
  | 'waiting_approval'
  | 'replanning'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'aborted';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'replanned'
  | 'skipped';

export type AgentName =
  | 'Orchestrator'
  | 'Planner Agent'
  | 'Research Agent'
  | 'Execution Agent'
  | 'Evaluator Agent'
  | 'Verification Agent';

export interface Task {
  task_id: string;
  description: string;
  objective: string;
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
  recommended_tool: 'web_search' | 'calculator' | 'file_analyzer' | 'code_tool' | 'structured_data';
  expected_output: string;
  success_criteria: string;
  status: TaskStatus;
  retry_count: number;
  result?: string;
  error?: string;
  tool_used?: string;
  observation?: string;
  duration_ms?: number;
}

export interface ToolCall {
  id: string;
  taskId: string;
  toolName: string;
  input: Record<string, any>;
  output: any;
  status: 'success' | 'error';
  errorDetails?: string;
  durationMs: number;
  timestamp: string;
}

export interface Observation {
  id: string;
  taskId: string;
  toolName: string;
  resultSummary: string;
  isUseful: boolean;
  relevanceScore: number; // 0 - 100
  evaluationReason: string;
  timestamp: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  relevance: number; // 0 - 100
  taskId: string;
  snippet: string;
  timestamp: string;
}

export interface AgentTraceEvent {
  id: string;
  timestamp: string;
  agent: AgentName;
  action: string;
  tool?: string;
  input?: string;
  observation?: string;
  decision: string;
  details?: Record<string, any>;
}

export interface VerificationScorecard {
  passed: boolean;
  score: number; // 0 - 100
  breakdown: {
    goalSatisfaction: number;
    taskCompletion: number;
    sourceQuality: number;
    verification: number;
    reliability: number;
  };
  issues: string[];
  recommendations: string[];
  evaluatedAt: string;
}

export interface FinalDeliverable {
  executiveSummary: string;
  goal: string;
  approach: string;
  keyFindings: string[];
  completedTasks: Array<{ taskId: string; title: string; outcome: string }>;
  toolsUsed: Array<{ name: string; count: number; purpose: string }>;
  sources: Source[];
  decisions: string[];
  problemsEncountered: Array<{ problem: string; recoveryAction: string; outcome: string }>;
  verification: VerificationScorecard;
  recommendations: string[];
  nextSteps: string[];
  generatedAt: string;
}

export interface HumanApprovalRequest {
  id: string;
  taskId: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    label: string;
    description: string;
    recommended?: boolean;
  }>;
  requiresReason?: boolean;
}

export interface AgentExecutionStats {
  llmCalls: number;
  toolCalls: number;
  searchCalls: number;
  retries: number;
  replans: number;
  iterationCount: number;
  executionTimeMs: number;
  estimatedCostUsd: number;
}

export interface AgentState {
  id: string;
  goal: string;
  mode: AgentMode;
  status: AgentStatus;
  currentTask?: string;
  extractedRequirements: {
    objective: string;
    requirements: string[];
    constraints: string[];
    expectedOutput: string;
    missingInformation: string[];
  };
  tasks: Task[];
  completedTasks: string[];
  failedTasks: string[];
  observations: Observation[];
  toolCalls: ToolCall[];
  sources: Source[];
  replans: Array<{
    replanNumber: number;
    triggerReason: string;
    previousTaskCount: number;
    newTaskCount: number;
    summary: string;
    timestamp: string;
  }>;
  memory: {
    discoveredInsights: string[];
    knownFailures: string[];
    activeDecisions: string[];
  };
  trace: AgentTraceEvent[];
  approvalRequest?: HumanApprovalRequest;
  verificationResult?: VerificationScorecard;
  finalDeliverable?: FinalDeliverable;
  stats: AgentExecutionStats;
  createdAt: string;
  updatedAt: string;
}
