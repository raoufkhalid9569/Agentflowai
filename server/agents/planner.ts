import { Task, AgentState, AgentTraceEvent } from '../types.js';
import { callGemini } from '../gemini.js';

export interface PlanOutput {
  extractedRequirements: {
    objective: string;
    requirements: string[];
    constraints: string[];
    expectedOutput: string;
    missingInformation: string[];
  };
  tasks: Task[];
  summary: string;
}

export async function createPlan(goal: string, options?: { constraints?: string[]; mode?: string }): Promise<PlanOutput> {
  const g = goal.toLowerCase();

  // In demo mode or if explicitly requested, utilize deterministic planner heuristics immediately
  if (options?.mode !== 'demo') {
    // Try real Gemini call if available
    const prompt = `Analyze this user goal for an autonomous agentic platform:
Goal: "${goal}"
Constraints: ${options?.constraints?.join(', ') || 'Standard production standards, low latency, cost efficiency'}

Return a valid JSON object matching this schema:
{
  "extractedRequirements": {
    "objective": "High-level primary objective",
    "requirements": ["req 1", "req 2", "req 3"],
    "constraints": ["constraint 1", "constraint 2"],
    "expectedOutput": "Description of final deliverable",
    "missingInformation": ["missing detail if any"]
  },
  "tasks": [
    {
      "task_id": "task_1",
      "description": "Short action name",
      "objective": "Detailed goal of this task",
      "dependencies": [],
      "priority": "high",
      "recommended_tool": "web_search | calculator | file_analyzer | code_tool | structured_data",
      "expected_output": "What this task should yield",
      "success_criteria": "How to verify success"
    }
  ],
  "summary": "Short explanation of the plan"
}`;

    const geminiResponse = await callGemini({
      prompt,
      systemInstruction: 'You are the Planner Agent in an autonomous agentic architecture. Create structured, modular task DAGs with clear dependencies and tool assignments. Output valid JSON only.',
      jsonMode: true
    });

    if (geminiResponse) {
      try {
        const parsed = JSON.parse(geminiResponse);
        if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          const tasks: Task[] = parsed.tasks.map((t: any, index: number) => ({
            task_id: t.task_id || `task_${index + 1}`,
            description: t.description || `Task ${index + 1}`,
            objective: t.objective || '',
            dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
            priority: t.priority || 'medium',
            recommended_tool: t.recommended_tool || 'web_search',
            expected_output: t.expected_output || '',
            success_criteria: t.success_criteria || 'Output is verified and complete',
            status: 'pending',
            retry_count: 0
          }));

          return {
            extractedRequirements: parsed.extractedRequirements || {
              objective: goal,
              requirements: ['Autonomous execution', 'Multi-tool reasoning', 'Verification'],
              constraints: options?.constraints || [],
              expectedOutput: 'Structured deliverable with architecture and roadmap',
              missingInformation: []
            },
            tasks,
            summary: parsed.summary || `Autonomous plan generated with ${tasks.length} tasks.`
          };
        }
      } catch (e) {
        console.warn('Failed to parse Gemini planner JSON, falling back to autonomous planner heuristics');
      }
    }
  }

  // Robust domain-aware Autonomous Planning Heuristics
  // Tailored to study assistant, AI frameworks, competitor analysis, or general goal
  if (g.includes('study assistant') || g.includes('university') || g.includes('roadmap') || g.includes('tech stack')) {
    const tasks: Task[] = [
      {
        task_id: 'task_01_research',
        description: 'Research existing AI study assistant benchmarks & architectures',
        objective: 'Survey current academic RAG implementations, pedagogy guidelines, and student privacy requirements',
        dependencies: [],
        priority: 'high',
        recommended_tool: 'web_search',
        expected_output: 'Curated list of real academic RAG benchmarks and Stanford HAI pedagogical guidelines',
        success_criteria: 'At least 3 high-relevance academic/industry citations with URLs and key findings',
        status: 'pending',
        retry_count: 0
      },
      {
        task_id: 'task_02_tech_eval',
        description: 'Evaluate & compare LLM, vector database, and framework options',
        objective: 'Generate a structured decision matrix comparing Gemini 3.8 Flash, pgvector, Claude, React 19, and Express',
        dependencies: ['task_01_research'],
        priority: 'high',
        recommended_tool: 'structured_data',
        expected_output: 'Tabular trade-off comparison matrix covering context window, latency, cost, and developer velocity',
        success_criteria: 'Clear matrix with concrete latency and pricing data for all key architectural layers',
        status: 'pending',
        retry_count: 0
      },
      {
        task_id: 'task_03_cost_proj',
        description: 'Calculate monthly infrastructure & inference budget for 2,500 students',
        objective: 'Accurately compute total operational expenses, token volume, and per-student monthly cost',
        dependencies: ['task_02_tech_eval'],
        priority: 'medium',
        recommended_tool: 'calculator',
        expected_output: 'Itemized calculation breakdown including LLM inference, pgvector hosting, and bandwidth',
        success_criteria: 'Mathematically verified monthly cost with per-student unit economics',
        status: 'pending',
        retry_count: 0
      },
      {
        task_id: 'task_04_api_search',
        description: 'Query external university API integration documentation',
        objective: 'Retrieve official university LMS (Canvas/Blackboard) API specifications for calendar & gradebook sync',
        dependencies: ['task_01_research'],
        priority: 'medium',
        recommended_tool: 'web_search',
        expected_output: 'Authentication requirements (OAuth 2.0 / LTI 1.3) and syllabus ingestion schemas',
        success_criteria: 'Verified LMS API endpoints and rate limit constraints',
        status: 'pending',
        retry_count: 0
      },
      {
        task_id: 'task_05_architecture',
        description: 'Design system architecture & TypeScript orchestrator scaffold',
        objective: 'Produce production-grade TypeScript system architecture module with RAG pipeline and error recovery',
        dependencies: ['task_02_tech_eval', 'task_03_cost_proj'],
        priority: 'high',
        recommended_tool: 'code_tool',
        expected_output: 'Syntactically valid TypeScript architecture scaffold with security auditing and complexity metrics',
        success_criteria: 'Zero security vulnerabilities detected and strict typing applied',
        status: 'pending',
        retry_count: 0
      },
      {
        task_id: 'task_06_verify_roadmap',
        description: 'Formulate phased engineering roadmap & risk mitigation plan',
        objective: 'Construct milestone-based roadmap (MVP, Beta, Campus Launch) with security & FERPA compliance controls',
        dependencies: ['task_05_architecture'],
        priority: 'high',
        recommended_tool: 'structured_data',
        expected_output: 'Phased development timeline with milestones, deliverables, and risk mitigation strategies',
        success_criteria: 'Concrete timeline covering Weeks 1 through 12 with specific deliverable gates',
        status: 'pending',
        retry_count: 0
      }
    ];

    return {
      extractedRequirements: {
        objective: 'Build an autonomous, production-ready development roadmap and technology stack evaluation for a university AI study assistant',
        requirements: [
          'Support syllabus and lecture slide RAG ingestion',
          'Pedagogical Socratic dialogue rather than direct answer regurgitation',
          'Scalable to 2,500+ concurrent university students',
          'Strict FERPA student data privacy compliance',
          'Low latency (< 500ms TTFT) and low unit operating cost'
        ],
        constraints: [
          'Budget under $350/month for initial pilot phase',
          'Zero hardcoded credentials or unverified external dependencies',
          'Graceful degradation when external LMS APIs fail'
        ],
        expectedOutput: 'Comprehensive technical blueprint, architecture code scaffold, cost projections, and phased 12-week roadmap',
        missingInformation: ['Specific target LMS (Canvas vs Blackboard vs Moodle) - agent will design protocol-agnostic LTI 1.3 adapter']
      },
      tasks,
      summary: 'Formulated a 6-stage DAG execution plan covering external research, technology trade-offs, financial modeling, system architecture, and compliance.'
    };
  }

  // Default generic goal decomposition
  const defaultTasks: Task[] = [
    {
      task_id: 'task_01_survey',
      description: `Investigate background & best practices for: ${goal.slice(0, 40)}`,
      objective: `Perform comprehensive information retrieval and domain discovery for "${goal}"`,
      dependencies: [],
      priority: 'high',
      recommended_tool: 'web_search',
      expected_output: 'Verified external insights, industry benchmarks, and source citations',
      success_criteria: 'Credible sources retrieved and verified',
      status: 'pending',
      retry_count: 0
    },
    {
      task_id: 'task_02_structure',
      description: 'Synthesize comparative requirements & structured evaluation matrix',
      objective: 'Generate multi-dimensional comparative breakdown of solutions and approaches',
      dependencies: ['task_01_survey'],
      priority: 'high',
      recommended_tool: 'structured_data',
      expected_output: 'Structured decision table with trade-offs and recommendations',
      success_criteria: 'Comprehensive comparative matrix with justification',
      status: 'pending',
      retry_count: 0
    },
    {
      task_id: 'task_03_quantitative',
      description: 'Model resource requirements, metrics, and quantitative projections',
      objective: 'Calculate execution metrics, budgets, throughput, or capacity requirements',
      dependencies: ['task_02_structure'],
      priority: 'medium',
      recommended_tool: 'calculator',
      expected_output: 'Itemized calculations with step-by-step arithmetic verification',
      success_criteria: 'Accurate quantitative figures and cost breakdowns',
      status: 'pending',
      retry_count: 0
    },
    {
      task_id: 'task_04_implementation',
      description: 'Draft technical blueprint, architecture scaffold, or code utility',
      objective: 'Formulate concrete implementation assets, verified code, or execution schema',
      dependencies: ['task_02_structure', 'task_03_quantitative'],
      priority: 'high',
      recommended_tool: 'code_tool',
      expected_output: 'Validated implementation blueprint with security review',
      success_criteria: 'Executable or verifiable specification with clean architecture',
      status: 'pending',
      retry_count: 0
    }
  ];

  return {
    extractedRequirements: {
      objective: goal,
      requirements: ['Comprehensive research', 'Structured trade-off analysis', 'Quantitative validation', 'Execution blueprint'],
      constraints: options?.constraints || ['Production standards', 'Data integrity'],
      expectedOutput: 'Actionable executive deliverable with verifiable sources and recommendations',
      missingInformation: []
    },
    tasks: defaultTasks,
    summary: `Structured execution plan generated with ${defaultTasks.length} sequential and parallel tasks.`
  };
}

/**
 * Dynamically replans the workflow when an obstacle, failure, or new requirement arises
 */
export function replanWorkflow(
  currentState: AgentState,
  failedTaskId: string,
  failureReason: string,
  alternativeStrategy: string
): {
  newTasks: Task[];
  summary: string;
} {
  const existingTasks = currentState.tasks.map(t => ({ ...t }));
  const failedTask = existingTasks.find(t => t.task_id === failedTaskId);

  if (failedTask) {
    failedTask.status = 'failed';
    failedTask.error = failureReason;
  }

  // Create adaptive recovery tasks
  const recoveryTaskId = `recovery_${Date.now().toString().slice(-4)}`;
  const recoveryTask: Task = {
    task_id: recoveryTaskId,
    description: `Adaptive Strategy: ${alternativeStrategy}`,
    objective: `Overcome previous failure (${failureReason.slice(0, 60)}) by pivoting to decoupled architecture & local schema caching`,
    dependencies: [],
    priority: 'high',
    recommended_tool: 'structured_data',
    expected_output: 'Robust fallback protocol and decoupled architectural contract',
    success_criteria: 'Self-healing strategy verified and dependencies redirected',
    status: 'pending',
    retry_count: 0
  };

  // Re-route downstream tasks that depended on the failed task
  for (const t of existingTasks) {
    if (t.dependencies.includes(failedTaskId)) {
      t.dependencies = t.dependencies.filter(id => id !== failedTaskId).concat(recoveryTaskId);
      t.status = 'pending';
    }
  }

  // Insert recovery task right after the failed task
  const failedIdx = existingTasks.findIndex(t => t.task_id === failedTaskId);
  if (failedIdx >= 0) {
    existingTasks.splice(failedIdx + 1, 0, recoveryTask);
  } else {
    existingTasks.push(recoveryTask);
  }

  return {
    newTasks: existingTasks,
    summary: `Autonomous replanning initiated: Injected recovery task [${recoveryTaskId}] to execute alternative strategy "${alternativeStrategy}" due to: ${failureReason}`
  };
}
