import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedIssueData } from "@/types/types";
import { IssueCard } from "./issue-card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pin } from "lucide-react";
import { useState } from "react";

interface RepoTabsProps {
  issues: ExtendedIssueData[];
  repoNames: string[];
}

const RepoTabs = ({ issues, repoNames }: RepoTabsProps) => {
  const [pinnedRepos, setPinnedRepos] = useState<ExtendedIssueData[]>([]);

  return (
    <Tabs defaultValue="all">
      {pinnedRepos.map((issue) => (
        <p key={issue.title}>{issue.title}</p>
      ))}
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
          <div>
            <ContextMenu>
              <ContextMenuTrigger>
                <IssueCard
                  key={`${issue.repoName}-${issue.title}`}
                  issue={issue}
                />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  className="text-primary"
                  onClick={() => setPinnedRepos((prev) => [...prev, issue])}
                >
                  <Pin className="size-3 mr-2 text-primary-muted" />
                  Pin
                </ContextMenuItem>
                <ContextMenuItem>Hide</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ))}
      </TabsContent>

      {issues.map((issue) => (
        <TabsContent
          value={issue.repoName}
          key={issue.title}
          className="space-y-2"
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <IssueCard issue={issue as ExtendedIssueData} key={issue.title} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className="text-primary"
                onClick={() => setPinnedRepos((prev) => [...prev, issue])}
              >
                <Pin className="size-3 mr-2 text-primary-muted" />
                Pin
              </ContextMenuItem>
              <ContextMenuItem>Hide</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default RepoTabs;
