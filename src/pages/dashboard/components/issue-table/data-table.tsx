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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  console.log(data);

  const navigate = useNavigate();
  const { pinnedIds } = usePinnedReposStore();

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

  return (
    <div>
      <div className="rounded-md cursor-pointer">
        <Table>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => navigateToIssueDetail(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
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

{
  /* {issues.map((issue: ExtendedIssueData) => (
        <ContextMenu key={issue.id}>
          <ContextMenuTrigger>
            <Table>
              <TableBody>
                <TableRow
                  className="cursor-pointer flex items-center justify-between active:scale-[0.99] transition-transform duration-100"
                  onClick={() => navigateToIssueDetail(issue)}
                >
                  
                  <TableCell className="flex gap-2">
                    <div className="flex items-center justify-center ">
                      {issue.comments.length > 0 && (
                        <>
                          <span className="mr-2 text-muted-foreground">
                            {issue.comments.length}
                          </span>
                          <MessageCircle className="size-3 text-muted-foreground" />
                        </>
                      )}
                    </div>
                    {issue.labels?.map((tag, index) => (
                      <span
                        key={index}
                        className={cn(
                          "px-3 py-1 text-xs rounded-lg capitalize",
                          {
                            "bg-green-500 text-zinc-100":
                              tag === "good first issue",
                            "bg-red-700/50 text-zinc-100": tag === "bug",
                            "bg-secondary text-zinc-100": tag === "enhancement",
                          }
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </TableCell>
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
      ))} */
}
