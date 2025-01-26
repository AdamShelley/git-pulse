import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePinnedReposStore } from "@/stores/pinned-repo-store";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pin } from "lucide-react";
import { ExtendedIssueData } from "@/types/types";

interface DataTableProps {
  columns: ColumnDef<ExtendedIssueData, any>[];
  data: ExtendedIssueData[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const navigate = useNavigate();
  const { pinnedIds, setPinnedIds } = usePinnedReposStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const navigateToIssueDetail = (issue: any) => {
    console.log(issue);
    useRecentlyViewedStore.getState().addItem({
      id: issue.id,
      name: issue.title,
    });

    navigate(`/issues/${issue.id}`, { state: { issue } });
  };

  const handlePin = async (e: any, issue: ExtendedIssueData) => {
    e.stopPropagation();
    await setPinnedIds((prev) => [...prev, String(issue.id)]);
  };

  const handleUnpin = async (e: any, issue: ExtendedIssueData) => {
    e.stopPropagation();
    await setPinnedIds((prev) => prev.filter((id) => id !== issue.id));
  };

  return (
    <div>
      <div className="rounded-md cursor-pointer">
        <Table>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild data-shadcn-contextmenu>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => navigateToIssueDetail(row.original)}
                      className="hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer active:scale-[0.99] transition-transform duration-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "labels"
                              ? "flex justify-end"
                              : ""
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuContent>
                      {!pinnedIds.includes(String(row.original.id)) &&
                        handlePin && (
                          <ContextMenuItem
                            className="text-primary"
                            onClick={(e) => handlePin(e, row.original)}
                          >
                            <Pin className="size-3 mr-2 dark:text-primary-muted" />
                            Pin
                          </ContextMenuItem>
                        )}
                      {pinnedIds.includes(String(row.original.id)) &&
                        handleUnpin && (
                          <ContextMenuItem
                            className="text-primary"
                            onClick={(e) => handleUnpin(e, row.original)}
                          >
                            <Pin className="size-3 mr-2 dark:text-primary-muted" />
                            Unpin
                          </ContextMenuItem>
                        )}
                      <ContextMenuItem>Hide</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
