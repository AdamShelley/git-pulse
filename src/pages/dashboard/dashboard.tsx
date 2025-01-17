import RepoTabs from "./components/repo-tabs";
import { ExtendedIssueData } from "@/types/types";
import {
  useFetchIssues,
  useRefreshIssues,
} from "@/hooks/use-create-fetch-issues";
import { FolderGit, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import AnimatedContainer from "@/components/animation-wrapper";
import { useAuthStore } from "@/stores/auth-store";

const IssuesDashboard = () => {
  const [repoNames, setRepoNames] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { mutate: refreshIssues, isPending } = useRefreshIssues();
  const { username } = useAuthStore();

  const { data, isLoading, error } = useFetchIssues({
    owner: username,
    repos: repoNames,
    forceRefresh: false,
  });

  const { issues, lastUpdated } = data || {};

  if (error) return <div>Error loading issues</div>;

  const handleRefresh = () => {
    setIsRefreshing(true);
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

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        setInitialLoad(false);
        setIsRefreshing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  return (
    <AnimatedContainer type="fadeSlide">
      <div className="flex flex-col p-1 mx-auto min-h-screen">
        <div className="flex-1 min-h-0 overflow-auto">
          {repoNames.length === 0 ? (
            <div className="flex flex-col gap-4 items-center justify-center h-64 text-muted-foreground">
              <FolderGit className="size-12" /> <p>No repositories selected</p>
              <p className="text-sm">
                Select repositories to view their issues
              </p>
            </div>
          ) : issues ? (
            <>
              <RepoTabs
                issues={issues as ExtendedIssueData[]}
                repoNames={repoNames}
                loading={isPending || isLoading}
                animate={initialLoad || isRefreshing}
              />
              {lastUpdated && (
                <div className="text-sm text-gray-500 flex justify-between mt-3 mt">
                  <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                  <RefreshCcw
                    className="size-4 text-muted-foreground cursor-pointer hover:text-foreground transition"
                    onClick={handleRefresh}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="size-8 text-muted-foreground animate animate-spin" />
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default IssuesDashboard;
