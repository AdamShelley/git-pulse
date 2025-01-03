import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle } from "lucide-react";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
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
      return (
        <div className="flex text-sm font-medium items-center justify-start gap-3">
          <p>{title}</p>
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
