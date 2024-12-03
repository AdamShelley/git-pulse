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

const SelectRepos = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRepos, setSelectedRepos] = useState([]);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRepos: Repository[] = await invoke("fetch_repos", {
        username: "AdamShelley",
      });
      console.log(fetchedRepos);
      fetchedRepos.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      setRepos(fetchedRepos);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRepos = () => {
    console.log("Selected repos:", selectedRepos);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <div>
      <Button onClick={submitRepos}>Select Repos</Button>
      <Table>
        <TableCaption>
          {loading && <Loader2 className="animate animate-spin w-5 h-5" />}
          {!loading && "Select repositories to monitor"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Check</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repos.map((repo) => (
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>{repo.name}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectRepos;
