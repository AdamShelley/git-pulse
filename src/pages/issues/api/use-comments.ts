import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExtendedIssueData } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";
import { useIssue } from "@/hooks/use-issue";

export const useComments = (
  owner: string,
  repo: string,
  issueNumber: number
) => {
  const queryClient = useQueryClient();

  const issueQuery = useIssue(owner, repo, issueNumber);

  const mutation = useMutation({
    mutationFn: (values: { body: string }) =>
      invoke<ExtendedIssueData>("add_issue_comment", {
        owner,
        repo,
        issueNumber,
        body: values.body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issue", owner, repo, issueNumber],
      });
    },
  });

  return {
    issue: issueQuery.data,
    isLoading: issueQuery.isLoading,
    addComment: mutation.mutate,
    isCommenting: mutation.isPending,
  };
};
