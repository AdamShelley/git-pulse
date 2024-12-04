import { useParams } from "react-router-dom";

type Props = {};

const CommentPage = (props: Props) => {
  const state = useParams();
  console.log(state);
  return <div>Comment Page</div>;
};

export default CommentPage;
