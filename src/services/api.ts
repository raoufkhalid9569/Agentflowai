import { AgentState } from '../types';

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function startAgentRun(params: {
  goal: string;
  mode?: 'autonomous' | 'supervised' | 'demo';
  constraints?: string[];
  forceDemoFailure?: boolean;
}): Promise<{ success: boolean; runId: string; state: AgentState }> {
  const res = await fetch('/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(errorData.error || `Failed to start agent: ${res.statusText}`);
  }

  return res.json();
}

export async function getAgentRun(runId: string): Promise<{ state: AgentState }> {
  const res = await fetch(`/api/agent/run/${runId}`);
  if (!res.ok) throw new Error(`Failed to fetch run: ${res.statusText}`);
  return res.json();
}

export async function stopAgentRun(runId: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/agent/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId })
  });
  if (!res.ok) throw new Error(`Failed to stop run: ${res.statusText}`);
  return res.json();
}

export async function submitHumanApproval(params: {
  runId: string;
  decision: 'approve' | 'reject_retry' | 'modify_plan';
  userNote?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch('/api/agent/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Failed to submit approval: ${res.statusText}`);
  return res.json();
}

export function subscribeToAgentStream(
  runId: string,
  onEvent: (event: string, data: any) => void,
  onError?: (err: any) => void
): () => void {
  const eventSource = new EventSource(`/api/agent/stream/${runId}`);

  const eventNames = [
    'snapshot',
    'agent_started',
    'planning_started',
    'plan_created',
    'task_started',
    'tool_completed',
    'observation_made',
    'tool_failed',
    'retry_started',
    'replan_started',
    'replan_completed',
    'human_approval_required',
    'human_approval_resolved',
    'task_completed',
    'verification_started',
    'verification_completed',
    'agent_completed',
    'agent_failed',
    'agent_stopped',
    'trace_event'
  ];

  for (const name of eventNames) {
    eventSource.addEventListener(name, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(name, parsed);
      } catch (err) {
        onEvent(name, e.data);
      }
    });
  }

  eventSource.onerror = (e) => {
    if (onError) onError(e);
  };

  return () => {
    eventSource.close();
  };
}

// Tool direct callers for direct testing in UI
export async function directSearch(query: string, forceFailure = false) {
  const res = await fetch('/api/tools/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, forceFailure })
  });
  return res.json();
}

export async function directCalculate(expression: string, context?: any) {
  const res = await fetch('/api/tools/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression, context })
  });
  return res.json();
}

export async function directAnalyzeFile(fileName: string, content: string, fileType?: string) {
  const res = await fetch('/api/tools/analyze-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, content, fileType })
  });
  return res.json();
}

export async function directCode(operation: string, requirement: string, codeSnippet?: string) {
  const res = await fetch('/api/tools/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, requirement, codeSnippet })
  });
  return res.json();
}

export async function directStructuredData(topic: string, format = 'matrix') {
  const res = await fetch('/api/tools/structured-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, format })
  });
  return res.json();
}
