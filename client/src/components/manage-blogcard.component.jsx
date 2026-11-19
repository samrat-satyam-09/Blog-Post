import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
   return (
      <div className="flex gap-10 max-md:gap-4 xl:ml-28 max-lg:mb-5">
         {Object.keys(stats).map((info, i) => {
            return !info.includes("parent") ? (
               <div
                  key={i}
                  className={
                     "flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
                     (i != 0 ? "border-primary border-l" : "")
                  }
               >
                  <h1 className="Text-shadow text-primary max-sm:text-base">
                     {stats[info].toLocaleString()}
                  </h1>
                  <p className="capitalize text-primary max-sm:text-base">
                     {info.split("_")[1]}
                  </p>
               </div>
            ) : (
               ""
            );
         })}
      </div>
   );
};
// Manage Published Blog code here...
export const ManagePublishedBlog = ({ blog }) => {
   let { banner, blog_id, title, desc, publishedAt, activity } = blog;

   let { userAuth: { access_token } } = useContext(UserContext);

   const [showStat, setShowStat] = useState(false);

   return (
      <>
         <div className="flex gap-10 border-b mb-6 max-md:px-4 border-border hover:bg-border md:rounded-l-sm md:p-6 items-center relative">
            <img
               src={banner}
               alt="banner"
               className="max-md:hidden lg:block w-28 h-28 flex-none bg-border object-cover rounded-sm"
            />

            <p className="line-clamp-1 text-dark-grey absolute right-5 top-0 max-md:hidden py-2">
               <span className="font-medium text-grey/40">Published on:</span>{" "}
               {getDay(publishedAt)}
            </p>

            <div className="flex flex-col justify-between py-2 w-full max-sm:min-w-[240px] min-w-[300px] max-sm:text-base">
               <Link
                  to={`/blog/${blog_id}`}
                  className="blog-title mb-4 hover:underline underline-offset-1 max-md:line-clamp-2"
               >
                  {title}
               </Link>

               <p className="line-clamp-1 text-dark-grey md:hidden">
                  <span className="font-medium text-grey/40">Published on:</span>{" "}
                  {getDay(publishedAt)}
               </p>

               <p className="line-clamp-2 max-md:hidden">{desc}</p>

               <div className="flex gap-6 mt-5 items-center">
                  <Link
                     to={`/editor/${blog_id}`}
                     className="hover:Text-shadow hover:text-primary text-white font-medium Hover-Text-Shadow underline hover:no-underline text-xl p-2"
                  >
                     Edit
                  </Link>

                  <button onClick={(e) => deleteBlog(blog, access_token, e.target)} className="text-red/75 hover:text-red font-medium underline hover:no-underline text-xl p-2">
                     Delete
                  </button>

                  <button
                     onClick={() => setShowStat((preVal) => !preVal)}
                     className="lg:hidden hover:Text-shadow hover:text-light font-medium Hover-Text-Shadow underline hover:no-underline text-xl p-2"
                  >
                     Stats
                  </button>
                  <div className="max-lg:hidden">
                     <BlogStats stats={activity} />
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center justify-center">
            {showStat ? (
               <div className="lg:hidden">
                  <BlogStats stats={activity} />
               </div>
            ) : (
               ""
            )}
         </div>
      </>
   );
};

// Manage Draft Blog code here...
export const ManageDraftBlog = ({ blog }) => {
   let { blog_id, title, desc, publishedAt, index } = blog;

   let { userAuth: { access_token } } = useContext(UserContext);

   index++;

   return (
      <div className="flex gap-5 lg:gap-10 pb-6 border-border border-b mb-6 relative">
         <h1 className="blog-index">{index < 10 ? "0" + index : index}</h1>
         <p className="line-clamp-1 text-dark-grey absolute right-5 top-0 max-md:hidden -my-5">
            <span className="font-medium text-grey/40">Saved At:</span>{" "}
            {getDay(publishedAt)}
         </p>
         <div className="">
            <h1 className="blog-title mb-3">{title}</h1>
            <p className="line-clamp-2">{desc.length ? desc : "No Description"}</p>

            <div className="flex gap-6 mt-3">
               <Link
                  to={`/editor/${blog_id}`}
                  className="hover:Text-shadow hover:text-primary text-white font-medium Hover-Text-Shadow underline hover:no-underline text-xl p-2"
               >
                  Edit
               </Link>

               <button onClick={(e) => deleteBlog(blog, access_token, e.target)} className="text-red/75 hover:text-red font-medium underline hover:no-underline text-xl p-2">
                  Delete
               </button>
            </div>
         </div>
      </div>
   );
};


const deleteBlog = (blog, access_token, target) => {

   let { index, blog_id, setStateFunc } = blog;

   target.setAttribute("disabled", true);

   axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog", { blog_id }, {
      headers: {
         'Authorization': `Bearer ${access_token}`
      }
   })
      .then(({ data }) => {
         target.removeAttribute("disabled");

         setStateFunc(prevState => {
            let { deletedDocCount, totalDocs, results } = prevState;

            results.splice(index, 1);

            if (!results.length && totalDocs - 1 > 0) {
               return null;
            }
            return {
               ...prevState,
               totalDocs: totalDocs - 1,
               deletedDocCount: deletedDocCount + 1
            };
         });
      })
      .catch(err => {
         console.log(err);
         target.removeAttribute("disabled");
      });
}