import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createAndRunAgent,
  getRun,
  getAllRuns,
  registerSSEListener,
  handleHumanApproval,
  abortAgentRun
} from './server/agents/orchestrator.js';
import { searchWeb } from './server/tools/webSearch.js';
import { executeCalculator } from './server/tools/calculator.js';
import { analyzeFile } from './server/tools/fileAnalyzer.js';
import { executeCodeTool } from './server/tools/codeTool.js';
import { executeStructuredDataTool } from './server/tools/structuredDataTool.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AgentFlow AI',
    tagline: 'Give AgentFlow a goal, not instructions.',
    version: '1.0.0',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
    agents: [
      'Orchestrator',
      'Planner Agent',
      'Research Agent',
      'Execution Agent',
      'Evaluator Agent',
      'Verification Agent'
    ],
    tools: [
      'web_search',
      'calculator',
      'file_analyzer',
      'code_tool',
      'structured_data'
    ],
    features: {
      autonomousPlanning: true,
      failureRecovery: true,
      dynamicReplanning: true,
      independentVerification: true,
      humanApprovalSupport: true,
      demoModeDeterministic: true
    }
  });
});

// List recent runs
app.get('/api/agent/runs', (req, res) => {
  const runs = getAllRuns();
  res.json({ runs });
});

// Start an agent run
app.post('/api/agent/run', async (req, res) => {
  try {
    const { goal, mode, constraints, forceDemoFailure } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'A valid goal string is required.' });
    }

    const state = await createAndRunAgent({
      goal: goal.trim(),
      mode: mode || 'autonomous',
      constraints: Array.isArray(constraints) ? constraints : [],
      forceDemoFailure: !!forceDemoFailure
    });

    res.json({
      success: true,
      runId: state.id,
      state
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize agent run' });
  }
});

// Get state of a run
app.get('/api/agent/run/:id', (req, res) => {
  const state = getRun(req.params.id);
  if (!state) {
    return res.status(404).json({ error: 'Run not found' });
  }
  res.json({ state });
});

// Real-Time Server-Sent Events (SSE) stream for an active run
app.get('/api/agent/stream/:id', (req, res) => {
  const runId = req.params.id;
  const state = getRun(runId);
  if (!state) {
    return res.status(404).json({ error: 'Run not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial snapshot
  res.write(`event: snapshot\ndata: ${JSON.stringify(state)}\n\n`);

  // Subscribe to live events
  const unsubscribe = registerSSEListener(runId, (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// Stop / Abort a run
app.post('/api/agent/stop', (req, res) => {
  const { runId } = req.body;
  if (!runId) return res.status(400).json({ error: 'runId is required' });

  const success = abortAgentRun(runId);
  res.json({ success });
});

// Human Approval resolution
app.post('/api/agent/approve', (req, res) => {
  const { runId, decision, userNote } = req.body;
  if (!runId || !decision) {
    return res.status(400).json({ error: 'runId and decision are required' });
  }

  const success = handleHumanApproval(runId, decision, userNote);
  res.json({ success });
});

// Tool Endpoints for direct testing & agent inspection
app.post('/api/tools/search', async (req, res) => {
  try {
    const { query, maxResults, forceFailure } = req.body;
    const result = await searchWeb(query || 'AI study assistant', { maxResults, forceFailure });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tools/calculate', (req, res) => {
  try {
    const { expression, context } = req.body;
    const result = executeCalculator(expression || '2500 * 12 * 30', context);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tools/analyze-file', (req, res) => {
  try {
    const { fileName, content, fileType } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    const result = analyzeFile(fileName || 'document.txt', content, fileType);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tools/code', (req, res) => {
  try {
    const { operation, language, codeSnippet, requirement } = req.body;
    const result = executeCodeTool({ operation, language, codeSnippet, requirement });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tools/structured-data', (req, res) => {
  try {
    const { topic, format, customColumns, customRows } = req.body;
    const result = executeStructuredDataTool({ topic, format, customColumns, customRows });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgentFlow AI full-stack server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error in AgentFlow server:', err);
  process.exit(1);
});
