import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  RepoAnalysis, 
  emptyAnalysis, 
  deriveNiche 
} from '@/types/repoAnalysis';
import type { RepoAnalysisResult, AnalysisResponse } from '@/lib/types';

const ANALYSIS_CACHE_KEY = 'current-repo-analysis';

/**
 * Hook to manage repo analysis state with React Query cache
 * Ensures analysis data persists across route changes
 */
export function useRepoAnalysis() {
  const queryClient = useQueryClient();

  // Get current analysis from cache (with safe defaults)
  const getAnalysis = useCallback((): RepoAnalysis => {
    const cached = queryClient.getQueryData<RepoAnalysis>([ANALYSIS_CACHE_KEY]);
    return cached ?? emptyAnalysis();
  }, [queryClient]);

  // Set analysis in cache
  const setAnalysis = useCallback((analysis: RepoAnalysis) => {
    queryClient.setQueryData([ANALYSIS_CACHE_KEY], analysis);
  }, [queryClient]);

  // Clear analysis from cache
  const clearAnalysis = useCallback(() => {
    queryClient.removeQueries({ queryKey: [ANALYSIS_CACHE_KEY] });
  }, [queryClient]);

  // Transform backend response to our strict RepoAnalysis type
  const transformBackendResponse = useCallback((
    response: AnalysisResponse,
    repoUrl: string
  ): RepoAnalysis => {
    const result = response.result;
    if (!result) {
      return {
        ...emptyAnalysis(repoUrl),
        status: 'error',
        errors: ['No result in response'],
      };
    }

    // Parse repo URL for owner/name
    const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    const owner = urlMatch?.[1] ?? '';
    const name = urlMatch?.[2]?.replace(/\.git$/, '') ?? '';

    // Derive niche from available data
    const topics = result.grantFit?.signals ?? [];
    const niche = deriveNiche(topics, result.languages ?? {}, name);

    // Calculate match score from code quality or grant fit
    const matchScore = result.codeQuality?.score ?? 0;
    
    // Find primary language
    const langEntries = Object.entries(result.languages ?? {});
    const primaryLanguage = langEntries.sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Unknown';

    // Build the strict analysis object
    const analysis: RepoAnalysis = {
      status: 'complete',
      repoUrl,
      summary: {
        niche,
        oneLiner: result.grantFit?.recommendations?.[0] ?? '',
        matchScore,
        confidence: matchScore > 0 ? Math.min(matchScore / 100, 1) : 0,
      },
      repo: {
        owner,
        name,
        stars: result.stars ?? 0,
        forks: result.forks ?? 0,
        watchers: result.stars ?? 0, // Use stars as proxy if watchers not available
        openIssues: result.issues?.open ?? 0,
        closedIssues: result.issues?.closed ?? 0,
        topics,
        homepage: null,
        lastPush: result.activity?.lastCommit ?? null,
      },
      activity: {
        commits30d: result.activity?.commits30d ?? 0,
        commits90d: (result.activity as any)?.commits90d ?? 0,
        contributors: (result.activity as any)?.contributors ?? 0,
        lastCommitDate: result.activity?.lastCommit ?? null,
      },
      stack: {
        primaryLanguage,
        languages: result.languages ?? {},
        frameworks: [],
      },
      quality: {
        hasReadme: (result.codeQuality?.notes ?? []).some(n => 
          n.toLowerCase().includes('readme')
        ),
        hasLicense: (result.codeQuality?.notes ?? []).some(n => 
          n.toLowerCase().includes('license')
        ),
        hasTests: (result.codeQuality?.notes ?? []).some(n => 
          n.toLowerCase().includes('test')
        ),
        hasCI: (result.codeQuality?.notes ?? []).some(n => 
          n.toLowerCase().includes('ci') || n.toLowerCase().includes('workflow')
        ),
        documentationScore: matchScore,
        codeHealthScore: result.codeQuality?.score ?? 0,
      },
      recommendations: {
        nextSteps: result.grantFit?.recommendations ?? [],
        missingPieces: [],
      },
      grantMatches: (result.grantFit?.matches ?? []).map(m => ({
        program: m.program,
        ecosystem: m.ecosystem,
        fitScore: m.fitScore,
        why: m.why ?? [],
        url: m.url,
      })),
      errors: [],
    };

    return analysis;
  }, []);

  // Mark as paid and update status
  const markAsPaid = useCallback((repoUrl: string) => {
    const current = getAnalysis();
    setAnalysis({
      ...current,
      repoUrl,
      status: 'paid',
    });
  }, [getAnalysis, setAnalysis]);

  // Mark as processing
  const markAsProcessing = useCallback((repoUrl: string) => {
    const current = getAnalysis();
    setAnalysis({
      ...current,
      repoUrl,
      status: 'processing',
    });
  }, [getAnalysis, setAnalysis]);

  // Complete analysis with backend response
  const completeAnalysis = useCallback((
    response: AnalysisResponse,
    repoUrl: string
  ) => {
    const analysis = transformBackendResponse(response, repoUrl);
    setAnalysis(analysis);
    return analysis;
  }, [transformBackendResponse, setAnalysis]);

  // Set error state
  const setAnalysisError = useCallback((repoUrl: string, error: string) => {
    const current = getAnalysis();
    setAnalysis({
      ...current,
      repoUrl,
      status: 'error',
      errors: [error],
    });
  }, [getAnalysis, setAnalysis]);

  return {
    getAnalysis,
    setAnalysis,
    clearAnalysis,
    markAsPaid,
    markAsProcessing,
    completeAnalysis,
    setAnalysisError,
    transformBackendResponse,
  };
}

// Helper to safely access score (NEVER crashes)
export function getSafeMatchScore(analysis: RepoAnalysis | null | undefined): number {
  return analysis?.summary?.matchScore ?? 0;
}

// Helper to check if analysis is complete
export function isAnalysisComplete(analysis: RepoAnalysis | null | undefined): boolean {
  return analysis?.status === 'complete';
}

// Helper to check if analysis is loading
export function isAnalysisLoading(analysis: RepoAnalysis | null | undefined): boolean {
  return analysis?.status === 'processing' || analysis?.status === 'paid';
}
