import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useComments } from "../../../hooks/use-comments";

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
  const { addComment, isCommenting } = useComments(owner, repo, issueNumber);

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
    addComment(values, {
      onSuccess: () => {
        form.reset();
      },
      onError: (error) => {
        console.error(error);
      },
    });
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
                  className="dark:bg-zinc-900 p-3 rounded-xs border border-slate-500 dark:border-transparent transition hover:border-zinc-600"
                  placeholder="Add a comment"
                  disabled={isCommenting}
                  {...field}
                ></Textarea>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="my-2 pt-2 flex align-center justify-end">
          <Button className="" variant="default" disabled={isCommenting}>
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCommentForm;
