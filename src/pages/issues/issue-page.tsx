import { ExtendedIssueData } from "@/types/types";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import SaveToObsidianButton from "./components/save-to-obsidian-button";
import { useFetchIssues } from "@/hooks/use-create-fetch-issues";
import { useEffect, useState } from "react";
import { extractIssueDetails } from "./components/extract-issue-details";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

  return (
    <div className="p-1 max-w-4xl mx-auto w-full">
      <div className="space-y-4">
        <div key={issue.number} className="">
          <div className="mb-6">
            <h2 className="text-md font-semibold flex items-center gap-2 ">
              {issue.state === "open" ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {issue.title}
              <p className="text-sm text-slate-400 border p-1 border-slate-500 rounded-sm">
                {issue.repoName}
              </p>
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
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="mb-4 text-sm">
              {issue.body || ""}
            </ReactMarkdown>

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
                    <div className="text-sm">
                      {" "}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuePage;
