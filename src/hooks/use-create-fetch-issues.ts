import { ExtendedIssueData, IssueData } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const CACHE_CHECK_INTERVAL = 30000;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

export const useFetchIssues = ({
  repos,
  forceRefresh = false,
}: {
  repos: string[];
  forceRefresh?: boolean;
}) => {
  const owner = "AdamShelley";

  const query = useQuery({
    queryKey: ["issues", owner, repos, forceRefresh],
    queryFn: async () => {
      const allIssues = await Promise.all(
        repos.map((repo) => fetchIssuesForRepo(owner, repo, forceRefresh))
      );

      return {
        issues: allIssues
          .flat()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ),
        lastUpdated: new Date().toISOString(),
      };
    },
    refetchInterval: CACHE_CHECK_INTERVAL,
    staleTime: CACHE_EXPIRY_TIME,
  });

  return query;
};

const fetchIssuesForRepo = async (
  owner: string,
  repo: string,
  forceRefresh: boolean
): Promise<ExtendedIssueData[]> => {
  const cacheStatus = await invoke<{ cached: boolean; last_updated: string }>(
    "check_cache_status",
    {
      owner,
      repo,
    }
  );

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

export const useRefreshIssues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repos }: { repos: string[] }) => {
      const owner = "AdamShelley";
      const allIssues = await Promise.all(
        repos.map((repo) => fetchIssuesForRepo(owner, repo, true))
      );
      return {
        issues: allIssues.flat(),
        lastUpdated: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};
