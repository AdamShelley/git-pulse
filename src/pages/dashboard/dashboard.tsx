import RepoTabs from "./components/repo-tabs";
import { ExtendedIssueData } from "@/types/types";
import {
  useFetchIssues,
  useRefreshIssues,
} from "@/hooks/use-create-fetch-issues";
import { FolderGit, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAddIssue } from "@/hooks/use-add-issue";
import { AnimatedPage } from "@/components/animation-wrapper";

const formSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
});

const IssuesDashboard = () => {
  const [repoNames, setRepoNames] = useState<string[]>([]);
  const { mutate: refreshIssues, isPending } = useRefreshIssues();
  const addIssue = useAddIssue();

  const { data, isLoading, error } = useFetchIssues({
    repos: repoNames,
    forceRefresh: false,
  });

  const { issues, lastUpdated } = data || {};
  console.log(issues);

  if (error) return <div>Error loading issues</div>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: "AdamShelley",
      repo: "test-repo",
      title: "",
      body: "",
    },
  });

  const handleRefresh = () => {
    refreshIssues({ repos: repoNames });
  };

  const addNewRepo = async (values: z.infer<typeof formSchema>) => {
    await addIssue.mutateAsync(values);

    handleRefresh();
  };

  useEffect(() => {
    const fetchStoredRepos = async () => {
      try {
        const storedRepos = await invoke<string[]>("get_repos_from_store");
        setRepoNames(storedRepos);
      } catch (error) {
        console.error("Failed to fetch stored repos:", error);
      }
    };
    fetchStoredRepos();
  }, []);

  return (
    <AnimatedPage>
      <div className="flex flex-col p-1 mx-auto">
        <div className="flex-1 min-h-0 overflow-auto">
          {repoNames.length === 0 ? (
            <div className="flex flex-col gap-4 items-center justify-center h-64 text-muted-foreground">
              <FolderGit className="size-12" /> <p>No repositories selected</p>
              <p className="text-sm">
                Select repositories to view their issues
              </p>
            </div>
          ) : issues ? (
            <>
              <RepoTabs
                issues={issues as ExtendedIssueData[]}
                repoNames={repoNames}
                loading={isPending}
              />
              {/* Move to own component */}
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
                                    <Input placeholder="Title" {...field} />
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
                                    <Textarea placeholder="Body" {...field} />
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
                    <p>
                      Last updated: {new Date(lastUpdated).toLocaleString()}
                    </p>
                    <RefreshCcw
                      className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
                      onClick={handleRefresh}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="size-8 text-muted-foreground animate animate-spin" />
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default IssuesDashboard;
