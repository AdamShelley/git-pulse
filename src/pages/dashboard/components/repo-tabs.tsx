import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedIssueData } from "@/types/types";
import { IssueCard } from "./issue-card";

interface RepoTabsProps {
  issues: ExtendedIssueData[];
  repoNames: string[];
}

const RepoTabs = ({ issues, repoNames }: RepoTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-2">
        <TabsTrigger value="all">All</TabsTrigger>
        {repoNames.map((repo) => (
          <TabsTrigger key={repo} value={repo} className="bg-background">
            {repo}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="space-y-2">
        {issues.map((issue) => (
          <IssueCard key={`${issue.repoName}-${issue.title}`} issue={issue} />
        ))}
      </TabsContent>

      {issues.map((issue) => (
        <TabsContent
          value={issue.repoName}
          key={issue.title}
          className="space-y-2"
        >
          <IssueCard issue={issue as ExtendedIssueData} key={issue.title} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default RepoTabs;
