import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedIssueData } from "@/types/types";
import { Loader2, PinIcon } from "lucide-react";
import { usePinnedReposStore } from "@/stores/pinned-repo-store";
import IssueTable from "./issue-table";
import { AddNewRepoButton } from "./add-new-repo";

interface RepoTabsProps {
  issues: ExtendedIssueData[];
  repoNames: string[];
  loading: boolean;
  animate: boolean;
}

const RepoTabs = ({ issues, repoNames, loading, animate }: RepoTabsProps) => {
  const { pinnedIds } = usePinnedReposStore();

  if (loading) {
    return (
      <Loader2 className="size-8 text-muted-foreground mx-auto mt-8 animate animate-spin" />
    );
  }

  const pinnedIssues = issues.filter((issue) =>
    pinnedIds.includes(String(issue.id))
  );

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-2">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="pinned">
          <PinIcon className="text- size-3 mr-1 text-foreground-muted" /> Pinned
        </TabsTrigger>
        {repoNames.map((repo) => (
          <TabsTrigger key={repo} value={repo} className="bg-background">
            {repo}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="space-y-2">
        <IssueTable issues={issues} loading={loading} animate={animate} />
      </TabsContent>

      <TabsContent value="pinned" className="space-y-2">
        <IssueTable issues={pinnedIssues} loading={false} />
      </TabsContent>

      {repoNames.map((repoName) => {
        const repoIssues = issues.filter(
          (issue) => issue.repoName === repoName
        );
        return (
          <TabsContent value={repoName} key={repoName} className="space-y-2">
            <IssueTable issues={repoIssues} loading={false} />
            <AddNewRepoButton repoName={repoName} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default RepoTabs;
