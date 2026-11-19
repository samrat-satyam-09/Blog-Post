import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotifocationCommentFeild = ({ _id, blog_author, index = undefined, replyingTo = undefined, setIsReplying, notification_id, notificationData }) => {

   let [comment, setComment] = useState('');

   let { _id: user_id } = blog_author;

   let { userAuth: { access_token } } = useContext(UserContext);

   let { notifications, notifications: { results }, setNotifications } = notificationData;

   const handleComment = () => {

      if (!comment.length) {
         return toast.error("Write something...")
      }
      if (comment.length > 250) {
         return toast.error("Comment should be less than 250 characters...")
      }

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comments", {
         _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id
      }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(({ data }) => {
            
            setIsReplying(false)

            results[index].reply = { comment, _id: data._id }
            setNotifications({ ...notifications, results })
         })
         .catch(error => {
            console.log(error.message)
         });
   }

   return (
      <>
         <Toaster />
         <textarea value={comment} placeholder="write a reply..."
            onChange={(e) => setComment(e.target.value)}
            className="input-box pl-5 placeholder:text-dark-grey pt-1 pb-4 -mx-2 resize-none overflow-auto" />

         <button
            onClick={handleComment}
            className="bg-white/20 hover:bg-white/10 shadow-md font-medium duration-200 px-10 py-2 mt-3 rounded-md text-center">Reply</button>
      </>
   )
};

export default NotifocationCommentFeild;