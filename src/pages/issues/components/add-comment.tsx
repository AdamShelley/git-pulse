import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invoke } from "@tauri-apps/api/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface AddCommentProps {
  owner: string;
  repo: string;
  issueNumber: number;
}

const formSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issueNumber: z.number(),
  body: z.string(),
});

const AddCommentForm = ({ owner, repo, issueNumber }: AddCommentProps) => {
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
    const newComment = await invoke("add_issue_comment", values);

    console.log(newComment);
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
                  className="w-full bg-zinc-800 border border-transparent rounded-lg p-3 focus:ring focus:ring-slate-500 focus:outline-none"
                  placeholder="Add a comment"
                  {...field}
                ></Textarea>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="my-2 pt-2 flex align-center justify-end">
          <Button className="" variant="default">
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCommentForm;
