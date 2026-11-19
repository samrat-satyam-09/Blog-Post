import { getDay } from "../common/date";
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ contant, author }) => {

   let { publishedAt, tags, title, desc, banner, activity: { total_likes }, blog_id: id } = contant;

   let { fullname, profile_img, username } = author;


   return (
      <Link to={`/blog/${id}`} className="flex gap-8 items-center border-b border-border mb-10 pb-5 when-hover">
         <div className="w-full">
            <div className="flex gap-2 items-center mb-7">
               <img src={profile_img} alt={title} className="w-6 h-6 rounded-full shadow-sm" />
               <p
                  className="text-text line-clamp-1">{fullname}</p>
               <p
                  className="text-text hidden sm:flex">
                  @{username}</p>
               <p className="min-w-fit">{getDay(publishedAt)}</p>
            </div>

            <h1 className="blog-title pb-1 hover-underline">{title}</h1>
            <p className="text-text text-xl font-gelasio leading-7 max-sm:hidden line-clamp-2">{desc}</p>

            <div className="flex gap-2 md:gap-4 items-center mt-4 mb-2">

               <span className="btn-tags py-1 px-4 text-sm">{tags[0]}</span>
               <span className="btn-tags py-1 px-4 text-sm hidden md:flex">{tags[1]}</span>
               <span className="flex items-center ml-3 gap-2 text-text">
                  <FavoriteBorder />
                  {total_likes} Likes</span>

            </div>
         </div>

         <div className="h-28 aspect-square bg-border rounded-sm">
            <img src={banner} alt={title} className="object-cover w-full h-full aspect-square rounded-sm" />
         </div>
      </Link>
   )
}

export default BlogPostCard;