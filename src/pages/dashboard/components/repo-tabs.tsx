import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedIssueData } from "@/types/types";
import { IssueCard } from "./issue-card";

interface RepoTabsProps {
  issues: ExtendedIssueData[];
  repoNames: string[];
}

const RepoTabs = ({ issues, repoNames }: RepoTabsProps) => {
  return (
    <Tabs defaultValue="all" className="">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        {repoNames.map((repo) => (
          <TabsTrigger key={repo} value={repo} className="bg-background">
            {repo}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all">
        <div className="space-y-2">
          {issues.map((issue) => (
            <IssueCard key={`${issue.repoName}-${issue.title}`} issue={issue} />
          ))}
        </div>
      </TabsContent>

      {issues.map((issue) => (
        <TabsContent value={issue.repoName}>
          <IssueCard issue={issue as ExtendedIssueData} key={issue.title} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default RepoTabs;
