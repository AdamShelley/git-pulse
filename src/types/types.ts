export type Issue = {
  id: number;
  title: string;
  body: string;
  state: "open" | "closed";
  user: string;
  created_at: string;
  comments: number;
  comments_list: Comment[];
};

export type Comment = {
  id: number;
  user: string;
  body: string;
};
