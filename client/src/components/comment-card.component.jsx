import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { Reply } from "@mui/icons-material";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import DeleteIcon from "../../src/assets/icons/bin.gif"

const CommentCard = ({ index, leftVal, commentData }) => {

   let { commented_by: { personal_info: { profile_img, fullname, username: commented_by_username, } }, commentedAt, comment, _id, children } = commentData

   let { blog, blog: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: blog_author } } }, setBlog, setTotalParentCommentsLodded } = useContext(BlogContext)

   let { userAuth: { access_token, username } } = useContext(UserContext);

   const [isrReplying, setReplying] = useState(false);

   const getParentIndex = () => {
      let startingPoint = index - 1;

      try {
         while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
            startingPoint--;
         }
      }
      catch {
         startingPoint = undefined;
      }
      return startingPoint;
   }

   const handleReplyClick = () => {
      // add reply functionality here
      if (!access_token) {
         return toast.error("Please login to reply")
      }

      setReplying(preVal => !preVal);
   };

   const removeCommentsCard = (startingPoint, isDelete = false) => {
      // remove comment card and Delete Card functionality here
      if (commentsArr[startingPoint]) {
         while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
            commentsArr.splice(startingPoint, 1);

            if (!commentsArr[startingPoint]) {
               break;
            }
         }

      }
      if (isDelete) {
         let parentIndex = getParentIndex();
         if (parentIndex != undefined) {
            commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child != _id)

            if (commentsArr[parentIndex].children.length) {
               commentsArr[parentIndex].isReplyLoded = false;
            }
         }

         commentsArr.splice(index, 1);
      }
      if (commentData.childrenLevel == 0 && isDelete) {
         setTotalParentCommentsLodded(preVal => preVal - 1)
      }

      setBlog({ ...blog, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0) } })
   };

   const DeleteComment = (e) => {
      // delete comment functionality here

      e.target.setAttribute("disabled", true);

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/delete-comment', { _id }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(() => {
            toast.success("Comment deleted");
            removeCommentsCard(index + 1, true);
            e.target.removeAttribute("disabled");
         })
         .catch(err => {
            console.log(err)
         });

   };

   const hideReplies = () => {
      // hide replies functionality here
      commentData.isReplyLoded = false;

      removeCommentsCard(index + 1)
   };

   const loadReplies = ({ skip = 0, currentIndex = index }) => {

      if (commentsArr[currentIndex].children.length) {

         hideReplies();

         axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-replies-to-comment', { _id: commentsArr[currentIndex]._id, skip })
            .then(({ data: { replies } }) => {

               commentsArr[currentIndex].isReplyLoded = true;

               for (let i = 0; i < replies.length; i++) {
                  replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;

                  commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i])

               }

               setBlog({ ...blog, comments: { ...comments, results: commentsArr } })

            })
            .catch(error => {
               console.error(error);
            })
      }
   };

   const LoadMoreRepliesButton = () => {

      let parentIndex = getParentIndex();

      let Button = <button
         onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })}
         className="flex items-center border-r-2 border-purple/70 gap-2 text-[10px] bg-grey/10 hover:bg-grey/20 py-1 px-2 rounded-s-[3.5px] rounded-e-sm mt-2 duration-300 ease-in-out">More Replies...</button>

      if (commentsArr[index + 1]) {
         if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
            if ((index - parentIndex) < commentsArr[parentIndex].children.length){
               return Button;
            }
         }
      }
      else{
         if(parentIndex){
            if ((index - parentIndex) < commentsArr[parentIndex].children.length){
               return Button;
            }
         }
      }
   }

   return (
      <div className="w-full my-4 -ml-3 "
         style={{ paddingLeft: `${leftVal * 10}px` }}>
         <div className="p-5 border-2 Box-Shadow border-grey/30 rounded-md border-b-border border-t-border">
            <div className="flex gap-3 items-center mb-8">

               <img src={profile_img} alt="user-img" className="w-6 h-6 rounded-full shadow-sm" />

               <p className="text-text font-medium text-sm capitalize line-clamp-1 Text-shadow">{fullname}

                  <span className="text-sm text-grey/50 min-w-fit"> {getDay(commentedAt)}</span>
                  <Link className="flex flex-col hover:underline-offset-1 hover:underline text-text/40 hover:text-text/90 font-normal lowercase hover:duration-300 text-[10px]" to={`/user/${username}`}> @{commented_by_username}</Link>
               </p>
            </div>
            <p className="font-[montserrat] text-[17px] ml-3">{comment}</p>

            <div className="flex items-center mt-5 ml-2 gap-5">
               {
                  commentData.isReplyLoded ?
                     <button title="Show less"
                        onClick={hideReplies}
                        className="text-purple text-sm">Hide Reply</button>
                     :
                     <button title="Show more"
                        onClick={loadReplies}
                        className="text-purple text-sm">{children.length} Reply</button>
               }
               <button
                  onClick={handleReplyClick}
                  className="text-[10px] text-text/70 hover:text-light underline underline-offset-1 hover:no-underline duration-200">Reply<Reply /></button>

               {
                  username == commented_by_username || username == blog_author ?
                     <button
                        onClick={DeleteComment}
                        className="flex items-center font-[900] text-red text-[11.5px]">
                        <img src={DeleteIcon} className="w-7 h-7 object-cover" />Delete</button>
                     : ""
               }
            </div>
            {
               isrReplying ?
                  <div className="mt-4">
                     <CommentField action="Reply" index={index} replyingTo={_id} setReplying={setReplying} />
                  </div>
                  : ""
            }
         </div>

         <LoadMoreRepliesButton />

      </div>
   )
}

export default CommentCard;