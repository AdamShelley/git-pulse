import { AlertCircle, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import SaveToObsidianButton from "./components/save-to-obsidian-button";
import { extractIssueDetails } from "./components/extract-issue-details";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AddCommentForm from "./components/add-comment";
import CommentSection from "./components/comments";

import { useIssue } from "@/hooks/use-issue";

const IssuePage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Issue not found</div>;

  const { owner, repo, issueNumber } = extractIssueDetails(id);
  const { data: issue, isLoading, error } = useIssue(owner, repo, issueNumber);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading issue</div>;
  if (!issue) return <div>Issue not found</div>;

  return (
    <div className="p-2 max-w-4xl mx-auto w-full h-full">
      <div className="space-y-4">
        <div key={issue.number} className="">
          <div className="mb-6">
            <h2 className="text-md font-semibold flex items-center justify-between mb-1">
              <div className="flex items-center justify-center gap-2">
                {issue.state === "open" ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <span>{issue.title}</span>
              </div>
              <p className="text-sm font-semibold">{repo}</p>
            </h2>
            <div className="text-sm text-gray-500">
              Opened by {issue.creator} on
              {new Date(issue.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="pb-10 mb-4 prose prose-invert max-w-none prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="mb-4 text-sm">
              {issue.body || ""}
            </ReactMarkdown>
            <div className="mb-4">
              <SaveToObsidianButton issue={issue} />
            </div>
            <CommentSection issue={issue} />
            <AddCommentForm
              owner={owner}
              repo={repo}
              issueNumber={issueNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuePage;
