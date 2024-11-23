import { Activity, AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IssueCard } from "./components/issue-card";
import { useFetchIssues } from "@/hooks/use-create-fetch-issues";

const IssuesDashboard = () => {
  const { issues, loading, lastUpdated, error, refetch } = useFetchIssues({
    repos: ["git-pulse", "test-repo"],
  });

  console.log(issues, loading, lastUpdated, error, refetch);

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
      <div className="p-1 max-w-4xl mx-auto mt-4">
        {lastUpdated && (
          <div className="text-sm text-gray-500 mb-4 flex justify-between">
            <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            <RefreshCcw
              className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
              onClick={refetch}
            />
          </div>
        )}
      </div>
      <div className="space-y-4">
        {issues.map((issue) => (
          <IssueCard issue={issue} key={issue.title} />
        ))}
      </div>
    </div>
  );
};

export default IssuesDashboard;
