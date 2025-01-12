import { ExtendedIssueData } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, MessageCircleCode } from "lucide-react";

export const columns: ColumnDef<ExtendedIssueData>[] = [
  {
    accessorKey: "state",
    cell: ({ row }) => {
      const state = row.getValue("state");
      return (
        <div className="flex text-sm font-medium items-center justify-start gap-3">
          {state === "open" ? (
            <AlertCircle className="w-5 h-5 min-w-5 text-red-500/60" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const username = row.original.creator;
      const createdAt = row.original.created_at;

      return (
        <div>
          <div className="flex font-medium items-center justify-start gap-3">
            <span className="line-clamp-1">{title}</span>
          </div>
          <div className="mt-1 dark:text-gray-500 flex align-center">
            <p>
              Opened by {username} on {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "comments.length",
    header: "",
    cell: ({ row }) => {
      const comments = row.original.comments.length;

      if (comments === 0) {
        return null;
      }

      return (
        <div className="flex dark:text-gray-400 line-clamp-1">
          <p className="flex items-center gap-1">
            <MessageCircleCode className="text-gray-400 size-3" />
            {comments}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "labels",
    header: "",
  },
];
