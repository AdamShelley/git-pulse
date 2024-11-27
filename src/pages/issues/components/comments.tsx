import { ExtendedIssueData } from "@/types/types";
import { MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface IssueProps {
  issue: ExtendedIssueData;
}

const CommentSection = ({ issue }: IssueProps) => {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4" />
        <span className="font-medium">Comments ({issue.comments.length})</span>
      </div>
      <div className="space-y-2">
        {issue.comments?.map((comment) => (
          <div
            key={comment.id}
            className="bg-zinc-900 p-3 rounded-xs border border-transparent transition hover:border-zinc-600 cursor-pointer"
          >
            <div className="font-medium text-sm mb-1">{comment.author}</div>
            <div className="mb-4 prose prose-invert max-w-none prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-p:text-white">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="mb-4 text-sm"
              >
                {comment.body || ""}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
