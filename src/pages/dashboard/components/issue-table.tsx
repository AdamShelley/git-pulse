import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { usePinnedReposStore } from "@/stores/pinned-repo-store";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { ExtendedIssueData } from "@/types/types";
import { AlertCircle, CheckCircle, Loader2, Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  issues: any;
  loading: boolean;
  handleUnpin?: (issue: ExtendedIssueData) => void;
  handlePin?: (issue: ExtendedIssueData) => void;
};

const IssueTable = ({ issues, loading, handleUnpin, handlePin }: Props) => {
  const navigate = useNavigate();
  const { pinnedIds } = usePinnedReposStore();

  const navigateToIssueDetail = (issue: any) => {
    useRecentlyViewedStore.getState().addItem({
      id: issue.id,
      name: issue.title,
    });

    navigate(`/issues/${issue.id}`, { state: { issue } });
  };

  return (
    <>
      {issues.map((issue: ExtendedIssueData) => (
        <ContextMenu key={issue.id}>
          <ContextMenuTrigger>
            <Table>
              <TableBody>
                <TableRow
                  className="cursor-pointer flex items-center justify-between"
                  onClick={() => navigateToIssueDetail(issue)}
                >
                  <TableCell>
                    <div className="flex text-sm font-medium items-center justify-start gap-3">
                      {issue.state === "open" ? (
                        <AlertCircle className="w-5 h-5 min-w-5 text-red-500/60" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <span className="line-clamp-1">{issue.title}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex align-center">
                      <p>
                        Opened by {issue.creator} on{" "}
                        {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{issue.labels}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {!pinnedIds.includes(String(issue.id)) && handlePin && (
              <ContextMenuItem
                className="text-primary"
                onClick={() => handlePin(issue)}
              >
                <Pin className="size-3 mr-2 text-primary-muted" />
                Pin
              </ContextMenuItem>
            )}
            {pinnedIds.includes(String(issue.id)) && handleUnpin && (
              <ContextMenuItem
                className="text-primary"
                onClick={() => handleUnpin(issue)}
              >
                <Pin className="size-3 mr-2 text-primary-muted" />
                Unpin
              </ContextMenuItem>
            )}
            <ContextMenuItem>Hide</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      {loading && <Loader2 className="animate animate-spin w-5 h-5" />}
    </>
  );
};

export default IssueTable;