import { Link } from "react-router-dom";
import { getDay } from "../common/date"
import { Reply } from "@mui/icons-material";
import ForwardIcon from '@mui/icons-material/Forward';
import { useContext, useState } from "react";
import NotifocationCommentFeild from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {

   let [isReplying, setIsReplying] = useState(false);

   let { seen, type, comment, reply, createdAt, replied_on_comment, user, user: { personal_info: { profile_img, fullname, username } }, blog: { _id, blog_id, title }, _id: notification_id } = data;

   let { userAuth: { username: author_username, profile_img: author_profile_img, access_token } } = useContext(UserContext);

   let { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

   const handleReplyClick = () => {
      setIsReplying(preVal => !preVal)
   };

   const handleDelete = (comment_id, type, target) => {

      target.setAttribute("disabled", true);

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id: comment_id }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(() => {
            if (type == 'comment') {
               results.splice(index, 1);
            }
            else {
               delete results[index].reply;
            }
            target.removeAttribute("disabled");
            setNotifications({ ...notifications, results, totalDocs: totalDocs - 1, deletedDocCount: notifications.deletedDocCount + 1 });
         })
         .catch(err => {
            console.log(err);
         });

   }

   return (
      <div className={"p-6 border-b border-border hover:bg-border md:hover:rounded-l-md md:rounded-l-md relative border-l-grey/30 " + (!seen ? "border-l-4" : "")}>
         <div className="flex gap-5">

            <p className="absolute right-5 top-2 text-dark-grey font-semibold font-emoji text-[13px] max-md:hidden">{getDay(createdAt)}</p>

            <img src={profile_img} alt={fullname} className="w-10 h-10 rounded-full shadow-md" />
            <div className="w-full">
               <h1 className="font-medium text-xl">
                  <span className="lg:inline-block hidden capitalize Text-shadow font-medium">{fullname} &nbsp;&nbsp;</span>
                  <Link className="text-grey/95 underline transition-all duration-300 hover:no-underline underline-offset-1 font-medium decoration-grey/50 decoration-1" to={`/user/${username}`}> @{username} </Link>
                  <span className="text-grey/70">
                     {
                        type == 'like' ? "liked your blog" :
                           type == 'comment' ? "commented on your blog" :
                              "replied on your post"
                     }
                  </span>
               </h1>
               <div className=" text-text/75">
                  {
                     type == 'reply' ?
                        <div className="my-2 py-1 pl-4">
                           <p>{replied_on_comment.comment}</p>
                        </div>
                        :
                        <Link className="my-2 py-1 hover:underline line-clamp-1" to={`/blog/${blog_id}`}>{`"${title}"`}</Link>
                  }
               </div>
            </div>
         </div>
         {
            type != 'like' ?
               <p className="ml-14 md:pl-4 lg:px-4 text-base font-emoji md:text-[17px] first-letter line-clamp-3 max-sm:line-clamp-2">{comment.comment}</p>
               : ""
         }
         <div className="ml-14 max-md:ml-12 pl-5 mt-3 text-dark-grey flex gap-8">

            <p className="md:hidden">{getDay(createdAt)}</p>
            {
               type != 'like' ?
                  <>
                     {
                        !reply ?

                           <button
                              onClick={handleReplyClick}
                              className="text-[13px] text-dark-grey hover:text-light underline underline-offset-1 hover:no-underline duration-200">Reply<Reply className="max-md:!hidden" /></button>
                           : ""
                     }
                     <button
                        onClick={(e) => handleDelete(comment._id, 'comment', e.target)}
                        className="font-[400] hover:font-[500] text-red text-[13px]">Delete</button>
                  </>
                  : ""
            }
         </div>
         {
            isReplying &&
            <div className="mt-5 pl-5 ml-14">
               <NotifocationCommentFeild _id={_id} blog_author={user} index={index} replyingTo={comment._id} setIsReplying={setIsReplying} notification_id={notification_id} notificationData={notificationState} />
            </div>
         }
         {
            reply ?
               <div className="ml-20 lg:ml-24 max-sm:ml-10 mt-4">
                  <div className="flex gap-3">
                     <Link className="underline hover:no-underline transition-all decoration-1 decoration-grey/50 duration-300 underline-offset-1 flex gap-3" to={`/user/${author_username}`}>
                        <img
                           className="w-8 h-8 rounded-full shadow-inner"
                           src={author_profile_img} alt={author_username} />
                        <div>
                           <h1 className="text-grey/95 font-medium">
                              {author_username}

                           </h1>
                        </div>
                     </Link>
                     <span className="font-normal text-dark-grey text-[13px]"> replied to <ForwardIcon className=" float-right max-sm:!hidden" />
                     </span>
                     <Link className="text-grey/95 font-medium underline hover:no-underline transition-all decoration-1 decoration-grey/50 duration-300 underline-offset-1 flex gap-3" to={`/user/${username}`}>@{username}</Link>
                  </div>
                  <p className="ml-14 md:pl-4 lg:px-4 text-base font-emoji md:text-[17px] first-letter line-clamp-2">{reply.comment}</p>
                  <button
                     onClick={(e) => handleDelete(reply._id, 'reply', e.target)}
                     className="ml-52 max-md:ml-48 font-[400] hover:font-[500] text-red text-[13px]">Delete</button>
               </div>
               : ""
         }
      </div>
   )
}

export default NotificationCard;