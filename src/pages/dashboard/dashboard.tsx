import { useState, useEffect, useCallback } from "react";
import { Activity, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { IssueData } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";

const CACHE_CHECK_INTERVAL = 30000;

const IssuesDashboard = () => {
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchIssues = useCallback(async (forceRefresh = false) => {
    try {
      let owner = "AdamShelley";
      let repo = "git-pulse";

      // Fetch cache
      const cacheStatus = await invoke<{
        cached: boolean;
        last_updated: string;
      }>("check_cache_status", { owner, repo });
      if (cacheStatus.cached && !forceRefresh) {
        const cachedIssues = await invoke<IssueData[]>("fetch_issues", {
          owner,
          repo,
          forceRefresh: false,
        });

        setIssues(cachedIssues);
        const date = new Date(cacheStatus.last_updated);
        // setLastUpdated(date.toISOString());
      } else {
        // fresh data
        const issues: IssueData[] = await invoke("fetch_issues", {
          owner,
          repo,
          forceRefresh: true,
        });

        setIssues(issues);

        setLastUpdated(new Date().toISOString());
      }

      setLoading(false);
    } catch (err) {
      console.log("Failed to fetch issues", err);
      setError(`Failed to fetch issues ${err}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();

    const intervalId = setInterval(async () => {
      try {
        const owner = "AdamShelley";
        const repo = "git-pulse";

        const cacheStatus = await invoke<{
          cached: boolean;
          last_updated: string;
        }>("check_cache_status", { owner, repo });
        if (
          cacheStatus.cached ||
          new Date(cacheStatus.last_updated) <
            new Date(Date.now() - 5 * 60 * 1000)
        ) {
          fetchIssues(true);
        }
      } catch (error) {
        console.error("error checking cache:", error);
      }
    }, CACHE_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchIssues]);

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

  const navigateToIssueDetail = (issue: any) => {
    navigate(`/issues/${issue.id}`, { state: { issue } });
  };

  return (
    <div className="p-1 max-w-4xl mx-auto mt-4">
      <div className="p-1 max-w-4xl mx-auto mt-4">
        {lastUpdated && (
          <div className="text-sm text-gray-500 mb-4 flex justify-between">
            <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            <RefreshCcw
              className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
              onClick={() => fetchIssues(true)}
            />
          </div>
        )}
      </div>
      <div className="space-y-4">
        {issues.map((issue) => (
          <Card
            key={issue.title}
            onClick={() => navigateToIssueDetail(issue)}
            className="bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between"
          >
            <CardHeader>
              <CardTitle className="flex text-md font-medium items-center gap-2  m-0">
                {issue.state === "open" ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {issue.title}
              </CardTitle>
              <div className="text-sm text-gray-500">
                Opened by {issue?.creator} on{" "}
                {new Date(issue.created_at).toLocaleDateString()}
              </div>
            </CardHeader>

            <CardFooter className="flex gap-2">
              {issue.labels?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-sm border border-teal-700 bg-zinc-800 text-zinc-200 capitalize"
                >
                  {tag}
                </span>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IssuesDashboard;
