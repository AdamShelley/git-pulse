import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Issue } from "@/types/types";
import { toast } from "sonner";
import { useState } from "react";
import { Download, FolderOpen } from "lucide-react";

interface IssueProps {
  issue: Issue;
}

const SaveToObsidianButton = ({ issue }: IssueProps) => {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [issues, setIssues] = useState([issue]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vaultPath, setVaultPath] = useState("");
  const [success, setSuccess] = useState("");

  const validateAndFormatIssue = (rawIssue: Issue) => {
    // Format the issue with correct field names to match Rust struct
    const formattedIssue = {
      id: rawIssue.id,
      title: rawIssue.title,
      body: rawIssue.body,
      state: rawIssue.state,
      created_at: rawIssue.created_at,
      html_url: rawIssue.html_url,
      comments: rawIssue.comments,
      // Change tags to labels and ensure correct format
      labels: Array.isArray(rawIssue.tags)
        ? rawIssue.tags.map((tag: any) => ({
            name: typeof tag === "string" ? tag : tag.name,
          }))
        : [],
      user: {
        login:
          typeof rawIssue.user === "string"
            ? rawIssue.user
            : rawIssue.user.login,
      },
    };

    console.log("Formatted issue:", formattedIssue);
    return formattedIssue;
  };

  const saveToObsidian = async () => {
    try {
      setLoading(true);

      const formattedIssue = validateAndFormatIssue(issue);

      const result = await invoke("save_to_obsidian", {
        issues: [formattedIssue],
        vaultPath,
        filename: `${repo}-issues.md`,
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

  const selectVaultPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Obsidian Vault Directory",
      });
      if (selected) {
        setVaultPath(selected);
      }
    } catch (err) {
      setError("Failed to select directory");
    }
  };

  return (
    <div className="flex gap-4 mt-5">
      <Button onClick={selectVaultPath} variant="outline" className="flex-1">
        <FolderOpen className="mr-2 h-4 w-4" />
        Select Vault Directory
      </Button>

      <Button
        onClick={saveToObsidian}
        disabled={issues.length === 0 || !vaultPath}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        Save to Obsidian
      </Button>
    </div>
  );
};

export default SaveToObsidianButton;
