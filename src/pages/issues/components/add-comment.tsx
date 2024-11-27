import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CommentData, ExtendedIssueData } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AddCommentProps {
  owner: string;
  repo: string;
  issueNumber: number;
  onCommentAdded: (newComment: ExtendedIssueData) => void;
}

const formSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issueNumber: z.number(),
  body: z.string(),
});

const AddCommentForm = ({
  owner,
  repo,
  issueNumber,
  onCommentAdded,
}: AddCommentProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: owner,
      repo: repo,
      issueNumber: issueNumber,
      body: "",
    },
  });

  const submitComment = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const updatedIssue = await invoke<ExtendedIssueData>(
        "add_issue_comment",
        values
      );

      onCommentAdded(updatedIssue);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      form.reset?.();
    }
  };

  return (
    <Form {...form}>
      <form className="mt-4" onSubmit={form.handleSubmit(submitComment)}>
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add a Comment</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="bg-zinc-900 p-3 rounded-xs border border-transparent transition hover:border-zinc-600"
                  placeholder="Add a comment"
                  disabled={isLoading}
                  {...field}
                ></Textarea>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="my-2 pt-2 flex align-center justify-end">
          <Button className="" variant="default" disabled={isLoading}>
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCommentForm;
