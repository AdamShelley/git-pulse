import { Repository } from "@/types/types";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRefreshIssues } from "@/hooks/use-create-fetch-issues";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SelectRepos = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const refreshIssues = useRefreshIssues();

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRepos: Repository[] = await invoke("fetch_repos");

      fetchedRepos.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      setRepos(fetchedRepos);

      const fetchSelectedRepos: string[] = await invoke("get_repos_from_store");

      setSelectedRepos(fetchSelectedRepos);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRepos = async () => {
    await invoke("add_repos_to_store", {
      selectedRepos,
    });

    refreshIssues.mutate({ repos: selectedRepos });
    toast.success("Updated");
  };

  const handleCheckboxChange = (repoName: string, checked: boolean) => {
    setSelectedRepos((prev) =>
      checked ? [...prev, repoName] : prev.filter((name) => name !== repoName)
    );
  };

  const selectAll = () => {
    setSelectedRepos(repos.map((repo) => repo.name));
  };

  const deselectAll = () => {
    setSelectedRepos([]);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <div>
      <div className="flex justify-center gap-4">
        <div className="mb-4 flex-1">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="card-foreground" onClick={submitRepos}>
          Save Selected Repos
        </Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll}>
          Deselect All
        </Button>
        <span className="ml-auto">
          {selectedRepos.length} of {repos.length} selected
        </span>
      </div>
      <Table>
        <TableCaption>
          {loading && <Loader2 className="animate animate-spin w-5 h-5" />}
          {!loading && "Select repositories to monitor"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Check</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Language</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repos
            .filter(
              (repo) =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (repo.description?.toLowerCase() || "").includes(
                  searchQuery.toLowerCase()
                ) ||
                (repo.language?.toLowerCase() || "").includes(
                  searchQuery.toLowerCase()
                )
            )
            .map((repo) => (
              <TableRow key={repo.name}>
                <TableCell>
                  <Checkbox
                    checked={selectedRepos.includes(repo.name)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(repo.name, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{repo.name}</TableCell>
                <TableCell>
                  {new Date(repo.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{repo.description || "-"}</TableCell>
                <TableCell>{repo.language || "-"}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectRepos;
