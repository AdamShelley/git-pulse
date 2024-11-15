import React, { useState, useEffect } from "react";
import {
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";

const IssuesDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mock data - replace with actual GitHub API calls in Tauri
  const mockIssues = [
    {
      id: 1,
      title: "Bug in authentication flow",
      state: "open",
      comments: 3,
      user: "johndoe",
      created_at: "2024-03-15T10:00:00Z",
      body: "Users are getting logged out randomly...",
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
      state: "closed",
      comments: 5,
      user: "janesmith",
      created_at: "2024-03-14T15:30:00Z",
      body: "Would be great to have dark mode support",
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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Issues Dashboard</h1>
      <div className="space-y-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="bg-zinc-950 border-zinc-600">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 cursor-pointer"
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
            <CardContent>
              <p className="mb-4">{issue.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IssuesDashboard;
