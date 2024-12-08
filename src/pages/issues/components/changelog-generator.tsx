import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

interface Issue {
  number: number;
  title: string;
  body: string;
  tags: Array<{ name: string }>;
}

export const ChangelogGenerator = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummaries = async () => {
    setIsGenerating(true);
    const newSummaries: Record<number, string> = {};

    for (const issue of issues) {
      try {
        const summary = await invoke<string>("generate_ai_summary", { issue });
        newSummaries[issue.number] = summary;
      } catch (e) {
        console.error(
          `Failed to generate summary for issue ${issue.number}:`,
          e
        );
      }
    }

    setSummaries(newSummaries);
    setIsGenerating(false);
  };

  const saveChangelog = async () => {
    try {
      const result = await invoke("save_to_changelog", {
        issues,
        vaultPath: "/",
      });
      console.log("Changelog saved:", result);
    } catch (e) {
      console.error("Failed to save changelog:", e);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Changelog Generator</h2>

      <Button
        onClick={generateSummaries}
        disabled={isGenerating || issues.length === 0}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isGenerating ? "Generating..." : "Generate Summaries"}
      </Button>

      <Button
        onClick={saveChangelog}
        disabled={Object.keys(summaries).length === 0}
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Save Changelog
      </Button>

      <div className="mt-4">
        {issues.map((issue) => (
          <div key={issue.number} className="mb-4 p-4 border rounded">
            <h3 className="font-bold">
              #{issue.number} {issue.title}
            </h3>
            {summaries[issue.number] && (
              <div className="mt-2">
                <h4 className="font-semibold">AI Summary:</h4>
                <p>{summaries[issue.number]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
