import { Activity, AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFetchIssues } from "@/hooks/use-create-fetch-issues";
import RepoTabs from "./components/repo-tabs";
import { ExtendedIssueData } from "@/types/types";

const IssuesDashboard = () => {
  const repoNames = ["git-pulse", "test-repo"];

  const { issues, loading, lastUpdated, error, refetch } = useFetchIssues({
    repos: repoNames,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-1 max-w-4xl mx-auto mt-4">
      <div className="space-y-4">
        <RepoTabs
          issues={issues as ExtendedIssueData[]}
          repoNames={repoNames}
        />
      </div>
      <div className="mt-5 p-1">
        {lastUpdated && (
          <div className="text-sm text-gray-500 flex justify-between">
            <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            <RefreshCcw
              className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
              onClick={refetch}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesDashboard;
