import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddIssue } from "@/hooks/use-add-issue";
import { useRefreshIssues } from "@/hooks/use-create-fetch-issues";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AddNewRepoProps {
  repoName: any;
}

const formSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
});

export const AddNewRepoButton = ({ repoName }: AddNewRepoProps) => {
  const addIssue = useAddIssue();
  const { mutate: refreshIssues, isPending } = useRefreshIssues();
  const { username } = useAuthStore();

  console.log(repoName);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: username,
      repo: repoName,
      title: "",
      body: "",
    },
  });

  const addNewRepo = async (values: z.infer<typeof formSchema>) => {
    await addIssue.mutateAsync(values);

    // handleRefresh();
  };

  return (
    <div className="flex-shrink-0 mt-1 pt-2 flex flex-col">
      <Dialog>
        <DialogTrigger>Add New Issue</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new Issue</DialogTitle>
            <DialogDescription>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(addNewRepo)}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Title"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Body"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="py-2">
                    <strong>Repository:</strong> {repoName}
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
