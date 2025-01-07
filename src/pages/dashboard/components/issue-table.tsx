import { ExtendedIssueData } from "@/types/types";
import { Loader2 } from "lucide-react";
import { DataTable } from "./issue-table/data-table";
import { columns } from "./issue-table/columns";

type Props = {
  issues: any;
  loading: boolean;
  handleUnpin?: (issue: ExtendedIssueData) => void;
  handlePin?: (issue: ExtendedIssueData) => void;
  animate?: boolean;
};

const IssueTable = ({ issues, loading }: Props) => {
  return (
    <>
      <DataTable columns={columns} data={issues} />
      {loading && <Loader2 className="animate animate-spin w-5 h-5" />}
    </>
  );
};

export default IssueTable;
