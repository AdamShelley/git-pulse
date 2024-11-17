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
