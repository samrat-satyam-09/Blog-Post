import { useContext, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { Close } from "@mui/icons-material";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
   // Fetch comments from server here

   let res;

   await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", { blog_id, skip })
      .then(({ data }) => {

         data.map(comment => {
            comment.childrenLevel = 0;
         })

         setParentCommentCountFun(perVal => perVal + data.length)
         if (comment_array == null) {
            res = { results: data }
         }
         else {
            res = { results: [...comment_array, ...data] }
         }
      })

   return res;
}

const CommentsContainer = () => {

   let { blog, blog: { _id, title, comments: { results: commentsArr }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalParentCommentsLodded, setTotalParentCommentsLodded, setBlog } = useContext(BlogContext)

   const loadMoreComments = async () => {

      let newCommentsArr = await fetchComments({ skip: totalParentCommentsLodded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLodded, comment_array: commentsArr })

      setBlog({ ...blog, comments: newCommentsArr })

   }


   return (
      <div 
      className={"max-sm:w-full fixed " + (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") + " duration-700 max-sm:right-0 righ sm:top-0 w-[30%] min-w-[350px] h-full bg-border2 shadow-2xl p-8 pr-0 max-sm:px-16 overflow-auto overflow-x-hidden z-50 md:rounded-l-sm"}>

         <div className="relative">

            <h1 className="text-3xl max-sm:text-2xl text-light shadow-sm font-medium max-sm:flex max-sm:justify-center">Comments</h1>
            <hr className="text-dark-grey/50 shadow-md my-[10px] w-[120%] max-sm:w-[152%] max-sm:-ml-20 -ml-10" />

            <p className="text-xl max-sm:text-[14px] mt-4 capitalize w-[90%] text-grey line-clamp-1">{title}</p>

            <button
               onClick={() => setCommentsWrapper(preVal => !preVal)}
               title="close" className="absolute w-6 h-6 flex items-center justify-center max-sm:-right-10 -top-2 right-5 bg-red p-1 hover:bg-red/80 duration-200 rounded-full"><Close className="font-semibold" /></button>
         </div>

         <CommentField action="Post" />

         {
            commentsArr && commentsArr.length ?
               commentsArr.map((comment, i) => {
                  return (
                     <AnimationWrapper key={i}>
                        <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
                     </AnimationWrapper>
                  )
               })
               : <NoDataMessage message="No Comments yet" />
         }
         <div className="max-sm:text-center max-sm:flex max-sm:items-center max-sm:justify-center">
            {
               total_parent_comments > totalParentCommentsLodded ?

                  <button
                     onClick={loadMoreComments}
                     className="text-sm text-red hover:text-red/50 duration-200 p-1">
                     Load more
                  </button>

                  : ""
            }
         </div>
      </div>
   )
}

export default CommentsContainer;