import { IssueData } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useAddIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      title,
      body,
      repo,
    }: {
      owner: string;
      title: string;
      body: string;
      repo: string;
    }) => {
      return await invoke<IssueData>("create_new_issue", {
        owner,
        repo,
        title,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};
