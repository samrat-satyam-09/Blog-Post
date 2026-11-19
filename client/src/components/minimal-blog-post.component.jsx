import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {

   let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

   return (
      <Link to={`blog/${id}`} className="flex gap-5 pb-8 items-center border-b border-border">
         <h1 className="blog-index">{index < 9 ? "0" + (index + 1) : index + 1}</h1>

         <div className="mt-8">
            <div className="flex gap-2 items-center mb-2">
               <img src={profile_img} alt={title} className="w-6 h-6 rounded-full shadow-sm" />
               <p
                  className="text-text line-clamp-1 text-sm">{fullname}</p>
               <p
                  className="text-text text-sm hidden lg:flex hover:underline">
                  @{username}</p>
               <p className="min-w-fit text-sm">{getDay(publishedAt)}</p>
            </div>
            <h1 className="blog-title mb-3 leading-9">{title}</h1>
         </div>
      </Link>
   )
}

export default MinimalBlogPost;