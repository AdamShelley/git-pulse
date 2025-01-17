import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { IssueData } from "@/types/types";
import { toast } from "sonner";
import { useState } from "react";
import { Download, SeparatorVerticalIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useSettingsStore from "@/stores/settings-store";

interface IssueProps {
  issue: IssueData;
}

const SaveToObsidianButton = ({ issue }: IssueProps) => {
  const [issues] = useState([issue]);
  const [_error, setError] = useState("");
  const [_loading, setLoading] = useState(false);
  const [_success, setSuccess] = useState("");

  const { file_directory: vaultPath } = useSettingsStore();

  const validateAndFormatIssue = (rawIssue: IssueData) => {
    // Format the issue with correct field names to match Rust struct
    const formattedIssue = {
      id: rawIssue.number,
      title: rawIssue.title,
      body: rawIssue.body,
      state: rawIssue.state,
      created_at: rawIssue.created_at,
      html_url: "",
      comments: rawIssue.comments,
      // Change tags to labels and ensure correct format
      labels: Array.isArray(rawIssue.labels)
        ? rawIssue.labels.map((tag: any) => ({
            name: typeof tag === "string" ? tag : tag.name,
          }))
        : [],
      creator: rawIssue.creator,
    };

    return formattedIssue;
  };

  const saveToObsidian = async () => {
    try {
      setLoading(true);

      const formattedIssue = validateAndFormatIssue(issue);

      const result = await invoke("save_to_obsidian", {
        issues: [formattedIssue],
        vaultPath,
        filename: `issues.md`,
      });

      setSuccess(result as string);
      toast.success("Saved to Obsidian");
    } catch (err) {
      const errorMessage = `Failed to save: ${err}`;
      console.error("Error details:", err);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateChangelog = async () => {
    try {
      const formattedIssue = {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        created_at: issue.created_at,
        labels: issue.labels,
        creator: issue.creator,
      };

      const result = await invoke("generate_and_save_changelog", {
        issue: formattedIssue,
        vaultPath,
      });
      console.log("Changelog generated:", result);
      toast.success("Changelog entry generated");
    } catch (e) {
      console.error("Failed to generate changelog:", e);
      toast.error("Failed to generate changelog entry");
    }
  };

  return (
    <div className="mt-4 w-full flex justify-end">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={saveToObsidian}
              disabled={issues.length === 0 || !vaultPath}
              className="flex-1 mr-2"
              variant="outline"
            >
              <SeparatorVerticalIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save to changelog</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={generateChangelog}
              disabled={issues.length === 0 || !vaultPath}
              className="flex-1 mr-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Summarise for changelog</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SaveToObsidianButton;
