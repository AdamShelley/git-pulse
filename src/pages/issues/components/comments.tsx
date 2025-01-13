import { useAuthStore } from "@/stores/auth-store";
import { ExtendedIssueData } from "@/types/types";
import { Edit, MessageSquare, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DrawerHelper from "./drawer-helper";
import { useComments } from "@/hooks/use-comments";

interface IssueProps {
  issue: ExtendedIssueData;
  repo: string;
}

const CommentSection = ({ issue, repo }: IssueProps) => {
  const { username } = useAuthStore();
  const { editComment, deleteComment } = useComments(
    username,
    repo,
    issue.number
  );

  const isCurrentUser = () => {
    return username === issue.creator;
  };

  const deleteCommentHandler = async (comment: any) => {
    console.log("Delete handler called with comment:", comment);
    try {
      await deleteComment({ commentId: comment.id });
    } catch (error) {
      console.error("Error in delete handler:", error);
    }
  };

  const editCommentHandler = (comment: any) => {
    editComment({ commentId: comment.id, body: comment.body });
  };

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
            className="dark:bg-zinc-900 p-3 rounded-xs border border-slate-500 dark:border-transparent transition dark:hover:border-zinc-600 cursor-pointer relative group"
          >
            {isCurrentUser() && (
              <div className="flex align-end gap-2 absolute top-2 right-2">
                <DrawerHelper
                  trigger={
                    <Edit className="w-4 h-4 text-gray-400 hover:text-gray-500 transition" />
                  }
                  title="Edit Comment"
                  description="Make changes to your comment"
                  submitCallback={() => editCommentHandler(comment)}
                >
                  {/* EDIT FORM */}
                  <div className="p-4">
                    <textarea
                      className="w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded"
                      defaultValue={comment.body}
                    />
                  </div>
                </DrawerHelper>
                <DrawerHelper
                  trigger={
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-500 transition" />
                  }
                  title="Delete Comment"
                  description="This action cannot be undone"
                  submitCallback={() => deleteCommentHandler(comment)}
                >
                  <div className="p-4">
                    Are you sure you want to delete this comment?
                  </div>
                </DrawerHelper>
              </div>
            )}
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
