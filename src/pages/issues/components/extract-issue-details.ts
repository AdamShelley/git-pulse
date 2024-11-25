export const extractIssueDetails = (id: string) => {
  const idParts = id.split("-");
  const issueNumber = parseInt(idParts.pop() || "");
  const [owner, ...repoParts] = idParts;
  const repo = repoParts.join("-");

  return { owner, repo, issueNumber };
};
