import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

const IssueAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [issueNumber, setIssueNumber] = useState("");

  const analyzeIssue = async () => {
    setIsLoading(true);
    try {
      const relevantFiles = await invoke("get_relevant_files", {
        input: {
          repo_owner: "owner",
          repo_name: "repo",
          issue_number: parseInt(issueNumber),
        },
      });

      // Then get full analysis with those files
      const analysis = await invoke("analyze_with_files", {
        github_token: "your_token_here",
        input: {
          repo_owner: "owner",
          repo_name: "repo",
          issue_number: parseInt(issueNumber),
        },
        files: relevantFiles,
      });

      setAnalysis(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="number"
        value={issueNumber}
        onChange={(e) => setIssueNumber(e.target.value)}
        placeholder="Issue Number"
        className="border p-2 mr-2"
      />
      <button
        onClick={analyzeIssue}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? "Analyzing..." : "Analyze Issue"}
      </button>

      {/* Rest of your display logic */}
    </div>
  );
};

export default IssueAnalyzer;
