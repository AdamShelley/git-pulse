import { useState, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Settings,
  File,
  MessageSquare,
  Bookmark,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useFetchIssues } from "@/hooks/use-create-fetch-issues";
import { invoke } from "@tauri-apps/api/core";
import { ExtendedIssueData } from "@/types/types";
import { useNavigate } from "react-router-dom";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { usePinnedReposStore } from "@/stores/pinned-repo-store";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPalette = ({ open, setOpen }: CommandPaletteProps) => {
  const [search, setSearch] = useState("");
  const [repos, setRepoNames] = useState<string[]>([]);
  const navigate = useNavigate();
  const { addItem } = useRecentlyViewedStore();
  const { pinnedIds, setPinnedIds } = usePinnedReposStore();

  const { data } = useFetchIssues({
    repos,
  });
  const issues = data?.issues ?? [];

  const pinnedIssues = issues.filter((issue) =>
    pinnedIds.includes(String(issue.id))
  );

  const groupedAndFilteredIssues = Object.entries(
    issues
      .filter((issue) => !pinnedIds.includes(String(issue.id)))
      .reduce((acc, issue) => {
        if (!acc[issue.repoName]) {
          acc[issue.repoName] = [];
        }
        if (
          issue.title.toLowerCase().includes(search.toLowerCase()) ||
          issue.labels?.some((label) =>
            label.toLowerCase().includes(search.toLowerCase())
          )
        ) {
          acc[issue.repoName].push(issue);
        }
        return acc;
      }, {} as Record<string, ExtendedIssueData[]>)
  ).map(([repoName, repoIssues]) => ({
    repoName,
    issues: repoIssues.slice(0, 5),
  }));

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

  const commands = [
    {
      category: "Actions",
      items: [
        {
          id: 1,
          name: "Home",
          icon: <MessageSquare className="w-4 h-4 mr-2" />,
        },
        {
          id: 2,
          name: "Settings",
          icon: <Settings className="w-4 h-4 mr-2" />,
        },
        {
          id: 3,
          name: "Create a new issue for this repo",
          icon: <Bookmark className="w-4 h-4 mr-2" />,
        },
      ],
    },
  ];

  const navigateToIssue = (issue: ExtendedIssueData) => {
    addItem({
      id: String(issue.id || ""),
      name: issue.title,
    });
    navigate(`/issues/${issue.id}`, { state: { issue } });
    setOpen(false);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (id: number) => {
    switch (id) {
      case 1:
        navigate("/");
        break;
      case 2:
        navigate("/settings");
        break;
      case 3:
        break;
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No issues found.</CommandEmpty>
            {commands.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {group.items
                  .filter((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => onSelect(item.id)}
                      className="flex items-center py-2"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
            {pinnedIssues.length > 0 && (
              <CommandGroup heading="Pinned Issues">
                {pinnedIssues.map((issue) => (
                  <CommandItem
                    key={issue.id}
                    onSelect={() => navigateToIssue(issue)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2">
                      {issue.state === "open" ? (
                        <AlertCircle className="w-4 h-4 text-red-700/90" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.labels?.map((label) => (
                        <span
                          key={label}
                          className="text-xs bg-accent px-2 py-0.5 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {groupedAndFilteredIssues.map(({ repoName, issues }) => (
              <CommandGroup key={repoName} heading={repoName}>
                {issues.map((issue) => (
                  <CommandItem
                    key={issue.id}
                    onSelect={() => navigateToIssue(issue)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2">
                      {issue.state === "open" ? (
                        <AlertCircle className="w-4 h-4 text-red-700/90" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.labels?.map((label) => (
                        <span
                          key={label}
                          className="text-xs bg-accent px-2 py-0.5 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
