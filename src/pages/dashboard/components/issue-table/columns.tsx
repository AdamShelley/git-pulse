import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle } from "lucide-react";

export type Payment = {};

export const columns: ColumnDef<any>[] = [
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
        <div className="flex flex-col text-sm font-medium items-start justify-start">
          <p>{title}</p>
          <div className="flex items-center justify-start gap-3">
            <p className="text-gray-500">{username}</p>
            <p className="text-gray-500">{createdAt}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "comments.length",
    header: "",
  },
  {
    accessorKey: "labels",
    header: "",
  },
];
