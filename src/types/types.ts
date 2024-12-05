export interface Repository {
  full_name: string;
  name: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  visibility: string;
  stargazers_count: number;
  language: string;
}

export interface Issue {
  id: number;
  title: string;
  body: string;
  state: "open" | "closed";
  created_at: string;
  html_url: string;
  comments: number;
  tags: string[];
  user: string | User;
  comments_list?: Array<{
    id: number;
    user: string;
    body: string;
  }>;
  creator: string;
}
export interface Label {
  name: string;
}

export interface User {
  login: string;
}

export interface Comment {
  id: number;
  user: User;
  body: string;
}

// For components
export interface IssueProps {
  issue: Issue;
}

export interface CommentData {
  id: number;
  body: string;
  created_at: string;
  updated_at?: string;
  author: string;
}

export interface IssueData {
  number: number;
  title: string;
  state: string;
  created_at: string;
  body: string | null;
  labels: string[];
  assignees: string[];
  comments: CommentData[];
  creator: string;
  id?: number | string;
}

export interface ExtendedIssueData extends IssueData {
  repoName: string;
}
