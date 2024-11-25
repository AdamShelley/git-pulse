import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { ExtendedIssueData } from "@/types/types";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const IssueCard = ({ issue }: { issue: ExtendedIssueData }) => {
  const navigate = useNavigate();

  const navigateToIssueDetail = (issue: any) => {
    useRecentlyViewedStore.getState().addItem({
      id: issue.id,
      name: issue.title,
    });

    navigate(`/issues/${issue.id}`, { state: { issue } });
  };

  return (
    <Card
      key={issue.title}
      onClick={() => navigateToIssueDetail(issue)}
      className="bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between"
    >
      <CardHeader>
        <CardTitle className="flex text-sm font-medium items-center justify-start gap-3  ">
          {issue.state === "open" ? (
            <AlertCircle className="w-5 h-5 min-w-5 text-red-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="line-clamp-1">{issue.title}</span>
        </CardTitle>
        <div className="text-sm text-gray-500 flex align-center">
          {/* <p className="mr-2 underline text-slate-300">{issue.repoName}</p> */}
          <p>
            Opened by {issue?.creator} on{" "}
            {new Date(issue.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>

      <CardFooter className="flex gap-2">
        {issue.labels?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded-sm border border-teal-700 bg-zinc-800 text-zinc-200 capitalize"
          >
            {tag}
          </span>
        ))}
      </CardFooter>
    </Card>
  );
};
