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
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AddNewRepoProps {
  lastUpdated: string;
  repoNames: string[];
}

const formSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
});

export const AddNewRepoButton = ({
  lastUpdated,
  repoNames,
}: AddNewRepoProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const addIssue = useAddIssue();
  const { mutate: refreshIssues, isPending } = useRefreshIssues();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: "AdamShelley",
      repo: "test-repo",
      title: "",
      body: "",
    },
  });

  const addNewRepo = async (values: z.infer<typeof formSchema>) => {
    await addIssue.mutateAsync(values);

    handleRefresh();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshIssues({ repos: repoNames });
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
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {lastUpdated && (
        <div className="text-sm text-gray-500 flex justify-between mt-3">
          <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          <RefreshCcw
            className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
            onClick={handleRefresh}
          />
        </div>
      )}
    </div>
  );
};
