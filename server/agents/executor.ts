import { Task, ToolCall } from '../types.js';
import { conductResearch } from './researcher.js';
import { executeCalculator } from '../tools/calculator.js';
import { analyzeFile } from '../tools/fileAnalyzer.js';
import { executeCodeTool } from '../tools/codeTool.js';
import { executeStructuredDataTool } from '../tools/structuredDataTool.js';

export interface ExecutionResult {
  toolCall: ToolCall;
  taskOutcome: string;
  success: boolean;
  error?: string;
}

export async function executeTask(
  task: Task,
  context?: {
    goal: string;
    previousResults?: Record<string, any>;
    forceFailureOnTool?: string;
  }
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const toolName = task.recommended_tool;
  const toolCallId = `tc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Controlled failure trigger for demonstrating failure recovery in demo/testing
  if (context?.forceFailureOnTool && (toolName === context.forceFailureOnTool || task.task_id === context.forceFailureOnTool)) {
    const durationMs = Date.now() - startTime;
    const errorDetails = `Tool Execution Fault: Remote upstream connection refused for [${toolName}] during task "${task.description}". Rate limit 429 / Gateway Timeout.`;
    return {
      toolCall: {
        id: toolCallId,
        taskId: task.task_id,
        toolName,
        input: { objective: task.objective, description: task.description },
        output: null,
        status: 'error',
        errorDetails,
        durationMs,
        timestamp: new Date().toISOString()
      },
      taskOutcome: `Tool execution failed: ${errorDetails}`,
      success: false,
      error: errorDetails
    };
  }

  try {
    switch (toolName) {
      case 'web_search': {
        const query = task.objective || task.description;
        const research = await conductResearch(task.task_id, query);
        const durationMs = Date.now() - startTime;

        if (!research.success) {
          throw new Error(research.summary);
        }

        return {
          toolCall: {
            id: toolCallId,
            taskId: task.task_id,
            toolName,
            input: { query, maxSources: 4 },
            output: {
              sourcesCount: research.sources.length,
              sources: research.sources,
              summary: research.summary,
              takeaways: research.keyTakeaways
            },
            status: 'success',
            durationMs,
            timestamp: new Date().toISOString()
          },
          taskOutcome: `${research.summary}\n\nKey Findings:\n${research.keyTakeaways.join('\n')}`,
          success: true
        };
      }

      case 'calculator': {
        const expression = 'budget for AI study assistant monthly cost';
        const calc = executeCalculator(expression, {
          activeUsers: 2500,
          queriesPerUser: 12
        });
        const durationMs = Date.now() - startTime;

        if (!calc.success) {
          throw new Error(calc.explanation);
        }

        return {
          toolCall: {
            id: toolCallId,
            taskId: task.task_id,
            toolName,
            input: { expression, activeUsers: 2500, queriesPerUser: 12 },
            output: calc,
            status: 'success',
            durationMs,
            timestamp: new Date().toISOString()
          },
          taskOutcome: `${calc.formattedResult}\n${calc.explanation}\n\nCalculation Steps:\n${calc.steps.join('\n')}`,
          success: true
        };
      }

      case 'code_tool': {
        const codeResult = executeCodeTool({
          operation: 'generate',
          language: 'typescript',
          requirement: task.objective
        });
        const durationMs = Date.now() - startTime;

        return {
          toolCall: {
            id: toolCallId,
            taskId: task.task_id,
            toolName,
            input: { operation: 'generate', language: 'typescript', requirement: task.objective },
            output: codeResult,
            status: 'success',
            durationMs,
            timestamp: new Date().toISOString()
          },
          taskOutcome: `${codeResult.summary}\nSecurity Audit Passed: ${codeResult.securityAudit.passed}\nMetrics: ${codeResult.metrics.linesOfCode} LOC, Complexity ${codeResult.metrics.estimatedCyclomaticComplexity}\n\nCode Preview:\n\`\`\`typescript\n${codeResult.code.slice(0, 320)}...\n\`\`\``,
          success: true
        };
      }

      case 'structured_data': {
        const structured = executeStructuredDataTool({
          topic: task.objective || task.description,
          format: 'matrix'
        });
        const durationMs = Date.now() - startTime;

        return {
          toolCall: {
            id: toolCallId,
            taskId: task.task_id,
            toolName,
            input: { topic: task.objective, format: 'matrix' },
            output: structured,
            status: 'success',
            durationMs,
            timestamp: new Date().toISOString()
          },
          taskOutcome: `${structured.summary}\n\n${structured.markdownTable}`,
          success: true
        };
      }

      case 'file_analyzer': {
        const sampleSyllabus = `# CS101: Introduction to Computer Science
Instructor: Dr. E. Martinez | Office Hours: Tue/Thu 2-4 PM
Prerequisites: None | Corequisite: CS101L

## Course Description
Fundamental principles of algorithm design, computational thinking, and software engineering.

## Grading Distribution
- Assignments (6): 30%
- Midterm Exam: 25%
- Final Project (AI Assisted Study App): 30%
- Participation & Quizzes: 15%

## Schedule
- Week 1: Algorithm Fundamentals & Python Syntax
- Week 2: Data Structures (Arrays, Linked Lists)
- Week 3: Recursion & Divide-and-Conquer
- Week 4: Graph Algorithms & Dijkstra Optimization
- Week 5: Relational Databases & SQL
- Week 6: Web APIs & REST Architecture`;

        const fileResult = analyzeFile('CS101_Syllabus_2026.md', sampleSyllabus, 'md');
        const durationMs = Date.now() - startTime;

        return {
          toolCall: {
            id: toolCallId,
            taskId: task.task_id,
            toolName,
            input: { fileName: 'CS101_Syllabus_2026.md', format: 'markdown' },
            output: fileResult,
            status: 'success',
            durationMs,
            timestamp: new Date().toISOString()
          },
          taskOutcome: `${fileResult.summary}\n\nExtracted Insights:\n${fileResult.extractedInsights.join('\n')}`,
          success: true
        };
      }

      default:
        throw new Error(`Unsupported tool: ${toolName}`);
    }
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorDetails = err?.message || 'Tool execution encountered an unhandled exception';

    return {
      toolCall: {
        id: toolCallId,
        taskId: task.task_id,
        toolName,
        input: { task_id: task.task_id },
        output: null,
        status: 'error',
        errorDetails,
        durationMs,
        timestamp: new Date().toISOString()
      },
      taskOutcome: `Task execution failed: ${errorDetails}`,
      success: false,
      error: errorDetails
    };
  }
}
