import { useParams } from "react-router-dom";

type Props = {};

const CommentPage = (props: Props) => {
  const state = useParams();
  console.log(state);
  return (
    <div>
      <p>Comment</p>
    </div>
  );
};

export default CommentPage;
