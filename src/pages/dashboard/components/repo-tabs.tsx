import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedIssueData } from "@/types/types";
import { IssueCard } from "./issue-card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Loader2, Pin, PinIcon } from "lucide-react";
import { useState } from "react";

interface RepoTabsProps {
  issues: ExtendedIssueData[];
  repoNames: string[];
  loading: boolean;
}

const RepoTabs = ({ issues, repoNames, loading }: RepoTabsProps) => {
  const [pinnedRepos, setPinnedRepos] = useState<ExtendedIssueData[]>([]);

  if (loading) {
    return (
      <Loader2 className="size-8 text-primary-muted mx-auto mt-8 animate animate-spin" />
    );
  }

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
        {issues.map((issue) => (
          <div key={issue.title}>
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

      <TabsContent value="pinned" className="space-y-2">
        {pinnedRepos.map((issue) => (
          <ContextMenu>
            <ContextMenuTrigger>
              <IssueCard issue={issue} key={issue.title} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className="text-primary"
                onClick={() =>
                  setPinnedRepos((prev) =>
                    prev.filter((pinnedIssue) => pinnedIssue !== issue)
                  )
                }
              >
                <Pin className="size-3 mr-2 text-primary-muted" />
                Unpin
              </ContextMenuItem>
              <ContextMenuItem>Hide</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
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
