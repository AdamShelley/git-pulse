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

  const addMutation = useMutation({
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

  const editMutation = useMutation({
    mutationFn: (values: { commentId: number; body: string }) =>
      invoke<ExtendedIssueData>("edit_issue_comment", {
        repo,
        issueNumber,
        commentId: values.commentId,
        body: values.body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issue", owner, repo, issueNumber],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (values: { commentId: number }) => {
      return invoke("delete_issue_comment", {
        repo: repo,
        commentNumber: values.commentId,
      });
    },
    onError: (error) => {
      console.error("Mutation error handler:", error);
    },
  });

  return {
    issue: issueQuery.data,
    isLoading: issueQuery.isLoading,
    addComment: addMutation.mutate,
    isCommenting: addMutation.isPending,
    editComment: editMutation.mutate,
    isEditing: editMutation.isPending,
    deleteComment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
