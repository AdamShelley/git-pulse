import { useParams } from "react-router-dom";

const CommentPage = () => {
  const state = useParams();
  console.log(state);
  return (
    <div>
      <p>Comment</p>
    </div>
  );
};

export default CommentPage;
