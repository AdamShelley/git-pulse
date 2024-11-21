import { Issue, IssueData } from "@/types/types";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import SaveToObsidianButton from "./components/save-to-obsidian-button";

interface IssuePageProps {
  issue: IssueData;
}

const IssuePage = () => {
  const { state } = useLocation();
  const { issue } = state as IssuePageProps;

  return (
    <div className="p-1 max-w-4xl mx-auto w-full">
      <div className="space-y-4">
        <div key={issue.number} className="">
          <div className="mb-6">
            <h2 className="text-md font-semibold flex items-center gap-2 cursor-pointer">
              {issue.state === "open" ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {issue.title}
            </h2>
            <div className="text-sm text-gray-500">
              Opened by {issue.creator} on
              {new Date(issue.created_at).toLocaleDateString()}
            </div>
            <div>
              <SaveToObsidianButton issue={issue} />
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm">{issue.body}</p>
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">
                  Comments ({issue.comments.length})
                </span>
              </div>
              <div className="space-y-2">
                {issue.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-zinc-800 p-3 rounded-lg border border-transparent transition hover:border-zinc-600 cursor-pointer"
                  >
                    <div className="font-medium text-sm mb-1">
                      {comment.author}
                    </div>
                    <div className="text-sm">{comment.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuePage;
