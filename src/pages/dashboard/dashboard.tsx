import RepoTabs from "./components/repo-tabs";
import { ExtendedIssueData } from "@/types/types";
import {
  useFetchIssues,
  useRefreshIssues,
} from "@/hooks/use-create-fetch-issues";
import { Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const IssuesDashboard = () => {
  const [repoNames, setRepoNames] = useState<string[]>([]);
  const { mutate: refreshIssues, isPending } = useRefreshIssues();

  const { data, isLoading, error } = useFetchIssues({
    repos: repoNames,
    forceRefresh: false,
  });

  const { issues, lastUpdated } = data || {};

  if (error) return <div>Error loading issues</div>;

  const handleRefresh = () => {
    refreshIssues({ repos: repoNames });
  };

  useEffect(() => {
    const fetchStoredRepos = async () => {
      try {
        const storedRepos = await invoke<string[]>("get_repos_from_store");
        setRepoNames(storedRepos);
      } catch (error) {
        console.error("Failed to fetch stored repos:", error);
      }
    };
    fetchStoredRepos();
  }, []);

  return (
    <div className="flex flex-col p-1 mx-auto">
      <div className="flex-1 min-h-0 overflow-auto">
        {issues ? (
          <RepoTabs
            issues={issues as ExtendedIssueData[]}
            repoNames={repoNames}
            loading={isPending}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-shrink-0 mt-1 pt-2 p-1">
        {lastUpdated && (
          <div className="text-sm text-gray-500 flex justify-between">
            <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            <RefreshCcw
              className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
              onClick={handleRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesDashboard;
