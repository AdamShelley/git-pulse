import React, { useState, useEffect } from "react";
import {
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { Issue } from "@/types/types";

const IssuesDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock data - replace with actual GitHub API calls in Tauri
  const mockIssues: Issue[] = [
    {
      id: 1,
      title: "Bug in authentication flow",
      state: "open" as "open",
      comments: 3,
      user: "johndoe",
      created_at: "2024-03-15T10:00:00Z",
      body: "Users are getting logged out randomly...",
      tags: ["bug", "authentication"],
      comments_list: [
        { id: 1, user: "maintainer", body: "Can you provide more details?" },
        {
          id: 2,
          user: "johndoe",
          body: "It happens after 30 minutes of inactivity",
        },
      ],
    },
    {
      id: 2,
      title: "Feature request: Dark mode",
      state: "closed" as "closed",
      comments: 5,
      user: "janesmith",
      created_at: "2024-03-14T15:30:00Z",
      body: "Would be great to have dark mode support",
      tags: ["Design"],
      comments_list: [
        {
          id: 3,
          user: "maintainer",
          body: "Good idea, we'll add it to the roadmap",
        },
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchIssues = async () => {
      try {
        // Replace with actual GitHub API call using Tauri
        setIssues(mockIssues);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch issues");
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
      {/* <h1 className="text-xl font-semibold mb-4 text-center">Issues</h1> */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="bg-zinc-800/30 border-zinc-700 ">
            <CardHeader>
              <CardTitle
                className="flex text-md font-medium items-center gap-2 cursor-pointer m-0"
                onClick={() => navigateToIssueDetail(issue)}
              >
                {issue.state === "open" ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {issue.title}
              </CardTitle>
              <div className="text-sm text-gray-500">
                Opened by {issue.user} on{" "}
                {new Date(issue.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            {/* <CardContent>
              <p className="text-sm">{issue.body}</p>
            </CardContent> */}
            <CardFooter className="flex gap-2">
              {issue.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-sm border border-teal-700 bg-zinc-800 text-zinc-200"
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
