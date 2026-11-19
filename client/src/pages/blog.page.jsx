import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogIntrection from "../components/blog-interaction.component";
import { createContext } from "react";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, { fetchComments } from "../components/comments.component";

export const blogStructure = {
   title: '',
   desc: '',
   content: [],
   banner: '',
   author: { personal_info: {} },
   publishedAt: ''
}

export const BlogContext = createContext({});

const BlogPage = () => {

   let { blog_id } = useParams()

   const [blog, setBlog] = useState(blogStructure);
   const [similerBlogs, setSimilerBlogs] = useState(null);
   const [loading, setLoading] = useState(true);
   const [islikedByUser, setLikedByUser] = useState(false);
   const [commentsWrapper, setCommentsWrapper] = useState(false);
   const [totalParentCommentsLodded, setTotalParentCommentsLodded] = useState(0);

   let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;

   const fetchBlog = () => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
         .then(async ({ data: { blog } }) => {
            blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLodded })

            setBlog(blog)

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
               .then(({ data }) => {

                  setSimilerBlogs(data.blogs);
               })

            setBlog(blog);
            setLoading(false);
         })
         .catch(error => {
            console.log(error.message)
            setLoading(false);
         })
   }

   useEffect(() => {

      resetStates();

      fetchBlog();

   }, [blog_id]);

   const resetStates = () => {
      setBlog(blogStructure);
      setSimilerBlogs(null);
      setLoading(true);
      setLikedByUser(false);
      setCommentsWrapper(false);
      setTotalParentCommentsLodded(0);
   }

   return (
      <AnimationWrapper>
         {
            loading ? <Loader />
               :
               <BlogContext.Provider value={{ blog, setBlog, islikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLodded, setTotalParentCommentsLodded }}>

                  <CommentsContainer />

                  <div className="max-w-[1000px] center py-10 max-lg:px-[5vw]">
                     <img src={banner} alt={title} className="aspect-video rounded-t-md bg-border" />

                     <div className="mt-10">
                        <h2 className="Text-shadow">{title}</h2>

                        <div className="flex max-sm:flex-col justify-between my-8">
                           <div className="flex gap-5 items-center">
                              <img src={profile_img} alt={fullname} className="w-10 h-10 rounded-full" />
                              <p className="text-text font-semibold capitalize">{fullname}
                                 <br />
                                 <Link className="hover:underline-offset-1 hover:underline text-text/75 hover:text-text/90 font-normal lowercase hover:duration-300" to={`/user/${author_username}`}>@{author_username}</Link>
                              </p>
                           </div>

                           <p className="font-mono text-text/90 text-start text-[14px] leading-7 max-sm:mt-5 max-sm:mx-auto max-sm:pl-5 max-sm:text-[10px]">
                              <span className="Text-shadow text-xl font-serif">Published At: &nbsp;</span>
                              {getDay(publishedAt)}</p>
                        </div>
                     </div>

                     <BlogIntrection />

                     <div className="my-12 font-gelasio blog-page-content">
                        {
                           content[0].blocks.map((block, i) => {
                              return (
                                 <div key={i} className="my-4 md:my-8">
                                    <BlogContent block={block} />
                                 </div>
                              )
                           })
                        }
                     </div>

                     <BlogIntrection />
                     {
                        similerBlogs != null && similerBlogs.length ?
                           <>
                              <h1 className="Text-shadow my-10 text-3xl font-medium capitalize">similer blogs</h1>

                              {
                                 similerBlogs.map((blog, i) => {
                                    let { author: { personal_info } } = blog;

                                    return (
                                       <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.4 }}>
                                          <BlogPostCard contant={blog} author={personal_info} />
                                       </AnimationWrapper>
                                    )
                                 })
                              }
                           </>
                           : ""
                     }

                  </div>
               </BlogContext.Provider>
         }
      </AnimationWrapper>
   )
}

export default BlogPage;