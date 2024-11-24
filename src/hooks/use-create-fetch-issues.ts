import { ExtendedIssueData, IssueData } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

const CACHE_CHECK_INTERVAL = 30000;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

export const useFetchIssues = ({ repos }: { repos: string[] }) => {
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(false);
  const intervalRef = useRef<NodeJS.Timer>();

  const fetchIssuesForRepo = async (
    owner: string,
    repo: string,
    forceRefresh: boolean
  ): Promise<ExtendedIssueData[]> => {
    console.log("Attempting fetching repo");

    const cacheStatus = await invoke<{
      cached: boolean;
      last_updated: string;
    }>("check_cache_status", {
      owner,
      repo,
    });

    const issues = await invoke<IssueData[]>("fetch_issues", {
      owner,
      repo,
      forceRefresh: !cacheStatus || forceRefresh,
    });

    return issues.map((issue) => ({
      ...issue,
      repoName: repo,
      id: `${owner}-${repo}-${issue.number}`,
    }));
  };

  const fetchIssues = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        let owner = "AdamShelley";

        const allIssues = await Promise.all(
          repos.map(async (repo) => {
            const repoIssues = await fetchIssuesForRepo(
              owner,
              repo,
              forceRefresh
            );
            return repoIssues;
          })
        );

        const flattenedIssues = allIssues.flat();

        setIssues(flattenedIssues);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.log("Failed to fetch issues", err);
        setError(`Failed to fetch issues ${err}`);
      } finally {
        setLoading(false);
      }
    },
    [repos]
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchIssues(false);
    }
  }, [fetchIssues]);

  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        const owner = "AdamShelley";

        const firstRepo = repos[0];
        if (!firstRepo) return;

        const cacheStatus = await invoke<{
          cached: boolean;
          last_updated: string;
        }>("check_cache_status", { owner, repo: firstRepo });

        const cacheExpired =
          new Date(cacheStatus.last_updated).getTime() <
          Date.now() - CACHE_EXPIRY_TIME;

        if (cacheStatus.cached && cacheExpired) {
          fetchIssues(true);
        }
      } catch (error) {
        console.error("error checking cache:", error);
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(checkAndFetch, CACHE_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchIssues, repos]);

  const refetch = useCallback(() => fetchIssues(true), [fetchIssues]);

  return { issues, loading, lastUpdated, error, refetch };
};
