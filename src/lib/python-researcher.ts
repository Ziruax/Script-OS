import { spawn } from 'child_process';
import path from 'path';

export interface PythonResearchOutput {
  topic: string;
  details: string;
  wikipedia_articles: Array<{
    title: string;
    url: string;
    summary: string;
    source_type: string;
  }>;
  reddit_threads: Array<{
    title: string;
    subreddit: string;
    url: string;
    snippet: string;
    source_type: string;
  }>;
  web_research: Array<{
    title: string;
    url: string;
    snippet: string;
    source_type: string;
  }>;
  facts: Array<{
    fact: string;
    source: string;
    provider: string;
  }>;
  human_stories: Array<{
    story: string;
    source: string;
    subreddit: string;
  }>;
  sources: string[];
  metrics: {
    wikipedia_count: number;
    reddit_count: number;
    web_count: number;
    engine: string;
  };
}

/**
 * Executes the Python Multi-Source Research Engine (Wikipedia + Google Search + Reddit).
 * Safe timeout of 8 seconds with automatic fallback.
 */
export async function executePythonResearch(
  topic: string,
  details: string = ''
): Promise<PythonResearchOutput | null> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'research_engine.py');
      const pythonProcess = spawn('python3', [scriptPath, topic, details], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
      });

      let stdout = '';
      let stderr = '';
      let isResolved = false;

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          try {
            pythonProcess.kill('SIGKILL');
          } catch {
            // Ignore kill errors
          }
          console.warn('[ScriptOS Python Researcher] Process timed out after 8s, proceeding with available data');
          if (stdout.trim()) {
            try {
              const data = JSON.parse(stdout);
              resolve(data);
              return;
            } catch {
              // Ignore parse error on timeout
            }
          }
          resolve(null);
        }
      }, 8000);

      pythonProcess.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      pythonProcess.on('close', (code) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timer);

        if (code === 0 && stdout.trim()) {
          try {
            const parsed: PythonResearchOutput = JSON.parse(stdout);
            resolve(parsed);
          } catch (parseErr) {
            console.warn('[ScriptOS Python Researcher] JSON parse warning:', parseErr, stdout.slice(0, 200));
            resolve(null);
          }
        } else {
          console.warn(`[ScriptOS Python Researcher] Exited with code ${code}. Stderr: ${stderr.slice(0, 200)}`);
          resolve(null);
        }
      });

      pythonProcess.on('error', (err) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timer);
        console.warn('[ScriptOS Python Researcher] Spawn error:', err.message);
        resolve(null);
      });
    } catch (err: any) {
      console.warn('[ScriptOS Python Researcher] Unexpected exception:', err.message);
      resolve(null);
    }
  });
}
