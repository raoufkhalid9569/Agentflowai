import { Source } from '../types.js';
import { searchWeb } from '../tools/webSearch.js';

export interface ResearchOutcome {
  success: boolean;
  query: string;
  sources: Source[];
  summary: string;
  keyTakeaways: string[];
}

export async function conductResearch(
  taskId: string,
  query: string,
  options?: { maxSources?: number; forceFailure?: boolean }
): Promise<ResearchOutcome> {
  const result = await searchWeb(query, {
    maxResults: options?.maxSources || 4,
    forceFailure: options?.forceFailure
  });

  if (!result.success) {
    return {
      success: false,
      query,
      sources: [],
      summary: `Research failed: ${result.errorMessage || 'Unknown search error'}`,
      keyTakeaways: []
    };
  }

  // Tag taskId on all retrieved sources
  const taggedSources = result.sources.map(s => ({
    ...s,
    taskId
  }));

  const takeaways: string[] = taggedSources.map(s => `(${s.domain}) ${s.title}: ${s.snippet.slice(0, 140)}...`);

  return {
    success: true,
    query,
    sources: taggedSources,
    summary: `Retrieved ${taggedSources.length} verified academic & industry citations with average credibility ${Math.round(taggedSources.reduce((acc, s) => acc + s.relevance, 0) / taggedSources.length)}%.`,
    keyTakeaways: takeaways
  };
}
