import { useQuery } from "@tanstack/react-query";
import { ExtendedIssueData } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";

export const useIssue = (owner: string, repo: string, issueNumber: number) => {
  return useQuery({
    queryKey: ["issue", owner, repo, issueNumber],
    queryFn: async () => {
      // Try cached first
      const cachedIssue = await invoke<ExtendedIssueData | null>(
        "get_cached_issue",
        {
          owner,
          repo,
          issueNumber,
        }
      );

      if (cachedIssue) return cachedIssue;

      // If no cached issue, fetch fresh
      return invoke<ExtendedIssueData>("fetch_single_issue", {
        owner,
        repo,
        issueNumber,
      });
    },
    refetchInterval: 30000,
  });
};
