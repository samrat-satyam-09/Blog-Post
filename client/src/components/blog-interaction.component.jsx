import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Comment, Facebook, Favorite, FavoriteBorder } from "@mui/icons-material";
import XIcon from '@mui/icons-material/X';
import { Link } from "react-router-dom";
import { UserContext } from '../App';
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogIntrection = () => {

   let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, islikedByUser, setLikedByUser, setCommentsWrapper } =
      useContext(BlogContext);

   let { userAuth: { username, access_token } } = useContext(UserContext);

   useEffect(() => {
      if (access_token) {
         // Make request to server to get Like Information
         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
            headers: {
               'Authorization': `Bearer ${access_token}`
            }
         })
            .then(({ data: { result } }) => {
               setLikedByUser(Boolean(result))
            })
            .catch(error => {
               console.log(error.message)
            });
      }
   }, [])

   const handleLike = () => {
      if (access_token) {
         // Like the blog
         setLikedByUser(preVal => !preVal);

         !islikedByUser ? total_likes++
            : total_likes--;
         setBlog({ ...blog, activity: { ...activity, total_likes } })

         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", {
            _id, islikedByUser
         }, {
            headers: {
               'Authorization': `Bearer ${access_token}`
            }
         })
            .then(({ data }) => {
               console.log("")
            })
            .catch(error => {
               console.log(error.message)
            });
      }
      else {
         // Not Logged in
         toast.error("Please login to like this blog")
      }
   }

   return (
      <>
         <Toaster />
         <hr className="border-border my-2" />

         <div className="flex gap-6 justify-between px-5">
            <div className="flex items-center justify-center gap-4">
               {/* For Likes... */}
               <div className=" flex items-center Hover-Text-Shadow hover-button text-text hover:text-light">
                  <button
                     onClick={handleLike}
                     className="w-10 h-10 flex items-center justify-center hover-button">
                     {
                        islikedByUser ?
                           <Favorite className="search-hover text-red" />
                           : <FavoriteBorder className="search-hover" />
                     }
                  </button>
                  <p
                     onClick={handleLike}
                     className="text-sm font-medium cursor-pointer">{total_likes} likes</p>
               </div>
               {/* For Comments... */}
               <div className="flex items-center justify-center Hover-Text-Shadow text-text hover:text-light hover-button">
                  <button
                     onClick={() => setCommentsWrapper(preVal => !preVal)}
                     className="w-10 h-10 flex items-center justify-center hover-button">
                     <Comment className="search-hover" />
                  </button>
                  <p
                     onClick={() => setCommentsWrapper(preVal => !preVal)}
                     className="text-sm font-medium cursor-pointer">{total_comments} comments</p>
               </div>
            </div>

            <div className="flex gap-5 items-center">
               {
                  username == author_username ?
                     <Link to={`/editor/${blog_id}`} className="text-text hover:text-light Hover-Text-Shadow">Edit</Link>
                     : ""
               }
               <Link
                  title="share to twitter"
                  target="_blank" to={`https://twitter.com/intent/tweet?text=Blog-Post ${title}&url=${location.href}`}>
                  <XIcon className="Hover-Text-Shadow hover:scale-105 hover:text-light" />
               </Link>
               <Link title="share to facebook"
                  className="max-sm:hidden"
                  target="_blank" to={`https://www.facebook.com/sharer/sharer.php?u=${title}&url=${location.href}`}>
                  <Facebook className="Hover-Text-Shadow hover:scale-105 hover:text-light text-twitter" />
               </Link>
            </div>
         </div>

         <hr className="border-border my-2" />
      </>
   )
}

export default BlogIntrection;