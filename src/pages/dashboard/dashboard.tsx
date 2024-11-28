import RepoTabs from "./components/repo-tabs";
import { ExtendedIssueData } from "@/types/types";
import {
  useFetchIssues,
  useRefreshIssues,
} from "@/hooks/use-create-fetch-issues";
import { Loader2, RefreshCcw } from "lucide-react";

const IssuesDashboard = () => {
  const repoNames = ["git-pulse", "test-repo"];

  const { mutate: refreshIssues, isPending } = useRefreshIssues();
  const { data, isLoading, error } = useFetchIssues({
    repos: repoNames,
    forceRefresh: false,
  });

  const { issues, lastUpdated } = data || {};

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading issues</div>;

  const handleRefresh = () => {
    refreshIssues({ repos: repoNames });
  };

  return (
    <div className="p-1 max-w-4xl mx-auto mt-4">
      <div className="space-y-4">
        <RepoTabs
          issues={issues as ExtendedIssueData[]}
          repoNames={repoNames}
          loading={isPending}
        />
      </div>
      <div className="mt-5 p-1">
        {lastUpdated && (
          <div className="text-sm text-gray-500 flex justify-between">
            <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            <RefreshCcw
              className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
              onClick={handleRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesDashboard;
