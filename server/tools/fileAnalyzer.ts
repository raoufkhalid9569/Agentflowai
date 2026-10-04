export interface FileAnalysisResult {
  success: boolean;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  lineCount: number;
  wordCount: number;
  structure: {
    format: string;
    detectedSectionsOrColumns: string[];
    sampleRecordOrHeading?: string;
  };
  summary: string;
  keyEntities: string[];
  extractedInsights: string[];
}

export function analyzeFile(fileName: string, content: string, fileType?: string): FileAnalysisResult {
  try {
    const lines = content.split('\n');
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const sizeBytes = Buffer.byteLength(content, 'utf8');

    const ext = (fileType || fileName.split('.').pop() || 'txt').toLowerCase();
    const detectedSections: string[] = [];
    const extractedInsights: string[] = [];
    const keyEntities: string[] = [];

    // Analyze CSV
    if (ext === 'csv') {
      const headerLine = lines[0] || '';
      const columns = headerLine.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      detectedSections.push(...columns);
      extractedInsights.push(`Detected CSV table with ${columns.length} columns and ${Math.max(0, lines.length - 1)} rows.`);
      if (lines.length > 1) {
        extractedInsights.push(`Column headers: ${columns.join(', ')}`);
      }
    }
    // Analyze JSON
    else if (ext === 'json') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          detectedSections.push(`Array of ${parsed.length} objects`);
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            detectedSections.push(...Object.keys(parsed[0]));
          }
        } else if (typeof parsed === 'object') {
          detectedSections.push(...Object.keys(parsed));
        }
        extractedInsights.push(`Valid JSON parsed with ${detectedSections.length} top-level fields.`);
      } catch (e) {
        extractedInsights.push('Warning: JSON payload had minor syntax anomalies or partial formatting.');
      }
    }
    // Markdown or Plain Text / Syllabus / Document
    else {
      const headers = lines.filter(l => l.startsWith('#') || l.endsWith(':'));
      detectedSections.push(...headers.slice(0, 8).map(h => h.replace(/^#+\s*/, '').trim()));
      
      // Extract keywords/entities
      const syllabusMatches = content.match(/(syllabus|grading|prerequisites|exam|assignment|schedule|week\s+\d+|lecture)/gi);
      if (syllabusMatches) {
        keyEntities.push(...Array.from(new Set(syllabusMatches.map(m => m.toLowerCase()))));
        extractedInsights.push('Identified academic syllabus or course structure patterns.');
      }

      const techMatches = content.match(/(react|typescript|python|postgresql|docker|fastapi|gemini|cloud run|rag)/gi);
      if (techMatches) {
        keyEntities.push(...Array.from(new Set(techMatches.map(m => m.toLowerCase()))));
        extractedInsights.push(`Extracted technology references: ${keyEntities.slice(0, 5).join(', ')}`);
      }
    }

    const summary = `Document "${fileName}" (${ext.toUpperCase()}, ${sizeBytes} bytes, ${lines.length} lines, ${wordCount} words) successfully parsed. Detected key structure: ${detectedSections.slice(0, 4).join(', ') || 'General documentation'}.`;

    return {
      success: true,
      fileName,
      fileType: ext,
      fileSizeBytes: sizeBytes,
      lineCount: lines.length,
      wordCount,
      structure: {
        format: ext.toUpperCase(),
        detectedSectionsOrColumns: detectedSections,
        sampleRecordOrHeading: detectedSections[0] || 'Section 1'
      },
      summary,
      keyEntities: Array.from(new Set(keyEntities)),
      extractedInsights
    };
  } catch (err: any) {
    return {
      success: false,
      fileName,
      fileType: fileType || 'unknown',
      fileSizeBytes: 0,
      lineCount: 0,
      wordCount: 0,
      structure: {
        format: 'UNKNOWN',
        detectedSectionsOrColumns: []
      },
      summary: `Failed to analyze file: ${err.message}`,
      keyEntities: [],
      extractedInsights: [`Error parsing content: ${err.message}`]
    };
  }
}
