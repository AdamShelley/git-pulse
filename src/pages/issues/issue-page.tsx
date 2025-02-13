import { AlertCircle, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import SaveToObsidianButton from "./components/save-to-obsidian-button";
import { extractIssueDetails } from "./components/extract-issue-details";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AddCommentForm from "./components/add-comment";
import CommentSection from "./components/comments";

import { useIssue } from "@/hooks/use-issue";
import AnimatedContainer from "@/components/animation-wrapper";
import FileAnalyzer from "./components/file-analyzer";
import useSettingsStore from "@/stores/settings-store";

const IssuePage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Issue not found</div>;

  const { owner, repo, issueNumber } = extractIssueDetails(id);
  const { data: issue, isLoading, error } = useIssue(owner, repo, issueNumber);
  const apiKey = useSettingsStore((state) => state.api_key);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading issue</div>;
  if (!issue) return <div>Issue not found</div>;

  return (
    <AnimatedContainer type="fadeSlide">
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
              <div className="text-sm dark:text-gray-500">
                Opened by {issue.creator} on
                {new Date(issue.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-[70px] pb-10 mb-4 prose prose-invert max-w-none  dark:prose-pre:bg-zinc-800 dark:prose-pre:border dark:prose-pre:border-zinc-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="mb-4 text-sm text-gray-800 dark:text-zinc-200"
              >
                {issue.body || ""}
              </ReactMarkdown>
              <div className="mb-4 mt-10">
                <SaveToObsidianButton issue={issue} />
                {apiKey && (
                  <FileAnalyzer repoName={repo} issueNumber={issueNumber} />
                )}
              </div>
              <CommentSection issue={issue} repo={repo} />
              <AddCommentForm
                owner={owner}
                repo={repo}
                issueNumber={issueNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default IssuePage;
