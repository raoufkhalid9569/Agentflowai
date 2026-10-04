# AgentFlow AI
### Autonomous Goal-to-Action Agent Platform

> **"Give AgentFlow a goal, not instructions."**

---

## 1. Problem

Most current AI chatbots stop after generating text. When a user asks a complex question like *"Research the best technology stack for my AI project and create a complete development plan"*, a standard chatbot generates static prose, but it cannot:
- Dynamically formulate an executable task dependency graph (DAG)
- Autonomously select, invoke, and chain external tools
- Evaluate whether intermediate tool observations meet success criteria
- Recover from upstream API or tool failures
- Adapt its strategy or dynamically replan downstream dependencies
- Independently audit and verify the factual integrity of its final deliverable
- Maintain short-term execution memory across multiple iterations

---

## 2. Solution

**AgentFlow AI** transforms high-level goals into multi-stage autonomous workflows. Instead of blindly executing predetermined scripts or conversational turns, AgentFlow orchestrates a 5-agent team through a continuous cognitive loop:

```
GOAL → PLAN → DECIDE → TOOL → OBSERVE → EVALUATE → REPLAN/CONTINUE → VERIFY → FINISH
```

The platform autonomously:
1. Decomposes high-level goals into structured task DAGs with dependencies and quantitative success criteria.
2. Selects appropriate tools based on task requirements (Web Search, Calculator, File Analyzer, Code Tool, Structured Data Matrix).
3. Evaluates observations against empirical thresholds.
4. Detects failures, triggers self-healing replanning, and reroutes dependencies.
5. Employs an independent Verification Agent that scores the final deliverable across 5 objective dimensions before producing a structured executive deliverable.

---

## 3. Why It Is Agentic (Not a Chatbot)

| Dimension | Conventional Chatbot | AgentFlow AI Autonomous Platform |
|---|---|---|
| **1. Planning** | Linear, single-shot prose generation | Dynamic task DAG with priorities, dependencies, and success criteria |
| **2. Tool Selection** | None or hardcoded rigid sequence | Reasoned tool selection based on task objective and output schema |
| **3. Execution** | Stops after 1 turn | Stateful multi-iteration execution loop with loop limits (max 25 iterations) |
| **4. Observation** | Never evaluates output usefulness | Evaluator Agent inspects outputs and computes relevance scores (0-100) |
| **5. Failure Recovery** | Crashes or prints raw stack traces | Self-healing: detects faults, analyzes errors, injects recovery tasks, and replans |
| **6. Verification** | No verification; prone to silent hallucination | Independent Verification Agent audits deliverable with quantitative scorecard |

---

## 4. Architecture

AgentFlow AI is structured into a clean multi-agent architecture:

```
                           USER GOAL
                               |
                               v
                     GOAL UNDERSTANDING
                               |
                               v
                      ORCHESTRATOR AGENT
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
       PLANNER AGENT    RESEARCH AGENT     EXECUTION AGENT
            |                  |                  |
            +------------------+------------------+
                               |
                               v
                          TOOL SYSTEM
          [Search | Calc | Code | Struct | File]
                               |
                               v
                        EVALUATOR AGENT
                               |
                     +---------+---------+
                     |                   |
                   PASS                 FAIL
                     |                   |
                     v                   v
                 NEXT TASK      AUTONOMOUS REPLANNING
                     |                   |
                     +---------+---------+
                               |
                               v
                       VERIFICATION AGENT
                               |
                               v
                   STRUCTURED FINAL DELIVERABLE
```

---

## 5. Agents

1. **Orchestrator Agent**: Manages global execution state, loop control (`MAX_AGENT_ITERATIONS = 25`, `MAX_TASK_RETRIES = 3`, `MAX_REPLANS = 5`), human-in-the-loop gates, and coordinates sub-agents.
2. **Planner Agent**: Analyzes objectives, constraints, and missing information. Constructs task dependency graphs (DAG) and executes dynamic replanning.
3. **Research Agent**: Conducts multi-query web search, extracts source citations, verifies domains, and computes credibility scores.
4. **Execution Agent**: Dispatches tasks to appropriate tools and captures execution timing and error states.
5. **Evaluator Agent**: Evaluates tool outputs against task success criteria (`isUseful`, relevance score 0-100).
6. **Verification Agent**: Audits deliverable completion across 5 criteria (Goal Satisfaction, Task Completion, Source Quality, Verification, Reliability) and generates an audited completion score (0-100).

---

## 6. Real Tools Implemented

AgentFlow AI features 5 production-ready tools:

1. **Web Search (`webSearch.ts`)**: Retrieves verified citations with title, domain, URL, snippet, and relevance rating.
2. **Calculator (`calculator.ts`)**: Safe arithmetic evaluator supporting percentage calculations, cloud infrastructure projections, and unit economics.
3. **File Analyzer (`fileAnalyzer.ts`)**: Inspects text, Markdown, CSV, and syllabus documents, extracting schemas, entities, and summaries.
4. **Code Tool (`codeTool.ts`)**: Generates and inspects TypeScript architecture code, performs security audits, and estimates cyclomatic complexity.
5. **Structured Data Tool (`structuredDataTool.ts`)**: Produces multi-attribute comparison matrices, Markdown tables, and structured JSON schemas.

---

## 7. Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Motion, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **AI Model**: Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK)
- **Streaming**: Server-Sent Events (SSE) for sub-50ms real-time event updates
- **Testing**: Native TypeScript test runner (`npm test`)

---

## 8. Running Locally

### Prerequisites
- Node.js 20+ installed
- npm or yarn

### Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd agentflow-ai

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY if testing with live Gemini API

# 4. Start full-stack dev server (Vite + Express)
npm run dev

# 5. Run automated test suite
npm test
```

The application runs on `http://localhost:3000`.

---

## 9. Preconfigured Master Demo

To demonstrate the agent during judging or presentations:
1. Click the **"Deterministic Demo"** button in the header or **"Master Demo"** preset on the left.
2. The agent executes the master objective:
   *"Research the best technology stack for building an AI-powered university study assistant and create a development roadmap."*
3. Watch the live agent loop:
   - **Stage 1**: Goal decomposition & requirement extraction
   - **Stage 2**: 6-task dependency DAG created
   - **Stage 3**: Web search & technology matrix generation
   - **Stage 4**: Infrastructure budget calculation for 2,500 students
   - **Stage 5**: Simulated external LMS tool failure detected
   - **Stage 6**: Autonomous error analysis & dynamic replanning to bypass the failure
   - **Stage 7**: Architecture TypeScript code generation & security audit
   - **Stage 8**: Independent verification score (94/100) & structured executive report

---

## 10. API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/agent/run` | `POST` | Initiates an autonomous agent run with goal and mode |
| `/api/agent/run/:id` | `GET` | Fetches the current state of an agent run |
| `/api/agent/stream/:id` | `GET` | Server-Sent Events (SSE) real-time stream of agent events |
| `/api/agent/stop` | `POST` | Aborts an active agent run |
| `/api/agent/approve` | `POST` | Resolves human-in-the-loop approval in Supervised mode |
| `/api/tools/search` | `POST` | Standalone Web Search tool endpoint |
| `/api/tools/calculate` | `POST` | Standalone Calculator tool endpoint |
| `/api/tools/analyze-file` | `POST` | Standalone File Analyzer tool endpoint |
| `/api/tools/code` | `POST` | Standalone Code Analysis/Generation endpoint |
| `/api/tools/structured-data` | `POST` | Standalone Structured Data comparison matrix endpoint |
| `/api/health` | `GET` | Returns system health, available agents, and tools |

---

## 11. Security & Cost Controls

- **Prompt Injection Defense**: External web and file content is treated as untrusted data and isolated from system instructions.
- **Loop Limits**: Strict upper bounds prevent infinite loops (`MAX_AGENT_ITERATIONS = 25`, `MAX_TASK_RETRIES = 3`, `MAX_REPLANS = 5`).
- **Cost Tracking**: Real-time counter tracks LLM calls, tool calls, and calculates estimated inference costs.
- **Safe Sandboxing**: No untrusted `eval()` execution; mathematical expressions are verified through strict token parsers.

---

## 12. Devpost Summary

### What did you build?
AgentFlow AI is an autonomous goal-to-action platform that converts high-level objectives into multi-step executed workflows with dynamic planning, tool selection, error recovery, replanning, and verification.

### Why is it agentic?
Because it independently plans tasks, selects tools, executes actions, observes results, evaluates outcomes, retries failures, replans when obstacles occur, and verifies completion against quantitative benchmarks.

### What tools did you use?
5 real tools: Web Search, Safe Calculator, Document & File Analyzer, TypeScript Code Generator & Security Auditor, and Structured Comparison Data Matrix Generator.
