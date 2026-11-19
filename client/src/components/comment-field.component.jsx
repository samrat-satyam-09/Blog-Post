import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {

   let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);

   let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLodded } = useContext(BlogContext)

   const [comment, setComment] = useState("");

   const handleComment = () => {

      if (!access_token) {
         return toast.error("Please login before comment")
      }
      if (!comment.length) {
         return toast.error("Write something...")
      }
      if (comment.length > 250) {
         return toast.error("Comment should be less than 250 characters...")
      }

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comments", {
         _id, blog_author, comment, replying_to: replyingTo
      }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(({ data }) => {
            setComment("")
            data.commented_by = { personal_info: { username, profile_img, fullname } }

            let newCommentArr;

            if (replyingTo) {
               commentsArr[index].children.push(data._id);

               data.childrenLevel = commentsArr[index].childrenLevel + 1;
               data.parentIndex = index;

               commentsArr[index].isReplyLoded = true;

               commentsArr.splice(index + 1, 0, data);

               newCommentArr = commentsArr
               setReplying(false);

            }
            else {
               data.childrenLevel = 0;

               newCommentArr = [data, ...commentsArr];
            }

            let parentCommentIncrementVal = replyingTo ? 0 : 1;

            setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } })

            setTotalParentCommentsLodded(preVal => preVal + parentCommentIncrementVal)

         })
         .catch(error => {
            console.log(error.message)
         });
   }
   return (
      <>
         <Toaster />
         <textarea value={comment} placeholder="Leave a comment..."
            onChange={(e) => setComment(e.target.value)}
            className="input-box pl-5 placeholder:text-dark-grey pt-1 pb-4 -mx-2 mt-4 resize-none overflow-auto" />

         <button
            onClick={handleComment}
            className="bg-white/20 hover:bg-white/10 shadow-md font-medium duration-200 px-10 py-2 mt-3 rounded-md text-center">{action}</button>
      </>
   )
}

export default CommentField;