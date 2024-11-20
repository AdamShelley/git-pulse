import { useState, useEffect } from "react";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { IssueData } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";

const IssuesDashboard = () => {
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        let owner = "AdamShelley";
        let repo = "git-pulse";

        console.log("FETCHING DATA");

        const issues: IssueData[] = await invoke("fetch_issues", {
          owner,
          repo,
        });

        setIssues(issues);

        setLoading(false);
      } catch (err) {
        console.log("Failed to fetch issues", err);
        setError(`Failed to fetch issues ${err}`);
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

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
      <div className="space-y-4">
        {issues.map((issue, index) => (
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
            {/* <CardContent>
              <p className="text-sm">{issue.body}</p>
            </CardContent> */}
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
