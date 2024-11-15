import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Issue } from "@/types/types";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface IssuePageProps {
  issue: Issue;
}

const IssuePage = () => {
  const { state } = useLocation();
  const { issue } = state as IssuePageProps;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Issues Dashboard</h1>
      <div className="space-y-4">
        <Button asChild>
          <Link to="/">Go Back</Link>
        </Button>
        <Card key={issue.id} className="bg-zinc-950 border-zinc-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cursor-pointer">
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
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Comments ({issue.comments})</span>
              </div>
              <div className="space-y-2">
                {issue.comments_list.map((comment) => (
                  <div key={comment.id} className="bg-slate-800 p-3 rounded-lg">
                    <div className="font-medium text-sm mb-1">
                      {comment.user}
                    </div>
                    <div className="text-sm">{comment.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssuePage;
