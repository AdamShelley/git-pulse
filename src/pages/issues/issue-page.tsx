import { ExtendedIssueData } from "@/types/types";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import SaveToObsidianButton from "./components/save-to-obsidian-button";
import { useFetchIssues } from "@/hooks/use-create-fetch-issues";
import { useEffect, useState } from "react";
import { extractIssueDetails } from "./components/extract-issue-details";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AddCommentForm from "./components/add-comment";
import CommentSection from "./components/comments";

const IssuePage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Issue not found</div>;
  }

  const { owner, repo, issueNumber } = extractIssueDetails(id);

  const [issue, setIssue] = useState<ExtendedIssueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCachedIssue } = useFetchIssues({ repos: [repo] });

  useEffect(() => {
    const fetchIssue = async () => {
      const cachedIssue = await fetchCachedIssue(owner, repo, issueNumber);
      setIssue(cachedIssue as ExtendedIssueData);
      setIsLoading(false);
    };

    fetchIssue();
  }, [owner, repo, issueNumber, fetchCachedIssue]);

  const newCommentAddedToIssue = (updatedIssue: ExtendedIssueData) => {
    setIssue(updatedIssue);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

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
              onCommentAdded={newCommentAddedToIssue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuePage;
