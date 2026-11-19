import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from 'axios';
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/minimal-blog-post.component";
import TrendingUp from '@mui/icons-material/TrendingUp';
import { Categories } from "../components/categories.component";
import FilterIcon from '@mui/icons-material/Filter';
import { activeTab } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPeginationData } from "../common/filter-pagination-data";
import LoadMoreData from "../components/load-more.component";

const HomePage = () => {

   let [blogs, setBlogs] = useState(null);
   let [trendingBlogs, setTrendingBlogs] = useState(null);
   let [pageState, setPageState] = useState("home");


   // Fetching Latest blogs on page load
   const fetchLatestBlogs = ({ page = 1 }) => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
         .then(async ({ data }) => {
            let formatedData = await filterPeginationData({
               state: blogs,
               data: data.blogs,
               page,
               countRoute: "/all-latest-blogs-count"
            })
            setBlogs(formatedData);
         })
         .catch(error => {
            console.log(error.message)
         });
   }


   // Fetching blogs search by category
   const fetchBlogsByCategory = ({ page = 1 }) => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
         .then(async ({ data }) => {
            let formatedData = await filterPeginationData({
               state: blogs,
               data: data.blogs,
               page,
               countRoute: "/search-blogs-count",
               data_to_send: { tag: pageState }
            })
            setBlogs(formatedData);
         })
         .catch(error => {
            console.log(error.message)
         });
   }

   // Fetching Trending blogs on page load
   const fetchTrendingBlogs = () => {
      axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs",)
         .then(({ data }) => {
            setTrendingBlogs(data.blogs);
         })
         .catch(error => {
            console.log(error.message)
         });
   }

   // Fetching blogs by category
   const loadBlogByCategory = (e) => {

      let category = e.target.innerText.toLowerCase();

      setBlogs(null);

      if (pageState == category) {
         setPageState("home");
         return;
      }

      setPageState(category);
   };

   useEffect(() => {

      activeTab.current.click();

      if (pageState == "home") {
         fetchLatestBlogs({ page: 1 });
      }
      else {
         fetchBlogsByCategory({ page: 1 });
      }
      if (!trendingBlogs) {
         fetchTrendingBlogs();
      }
   }, [pageState]);


   return (
      <AnimationWrapper>
         <section className="h-cover flex justify-center gap-10 md:px-20">
            {/* For Latest Blogs */}
            <div className="w-full -mt-[1.1rem]">
               <InPageNavigation
                  routes={[pageState, "trending blogs"]}
                  defaultHidden={["trending blogs"]}>

                  <>
                     {
                        blogs == null ? (<Loader />
                        ) : (
                           blogs.results.length ?
                              blogs.results.map((blog, i) => {
                                 return (
                                    <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                       <BlogPostCard contant={blog} author={blog.author.personal_info} />
                                    </AnimationWrapper>
                                 );
                              })
                              :
                              <NoDataMessage message={
                                 "No blogs found in this category, Please check the available categories."
                              } />
                        )}
                     <LoadMoreData state={blogs}
                        fetchDataFun={(pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory)} />
                  </>

                  {
                     trendingBlogs == null ? (<Loader />
                     ) : (
                        trendingBlogs.length ?
                           trendingBlogs.map((blog, i) => {
                              return (
                                 <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>

                                    <MinimalBlogPost blog={blog} index={i} />
                                 </AnimationWrapper>
                              )
                           })
                           :
                           <NoDataMessage message={
                              "No Trending blogs found. Please check back later."
                           } />
                     )}

               </InPageNavigation>
            </div>

            {/* For Filter and Trending Blogs */}
            <div className="min-w-[40%] lg:min-w-[300px] max-w-min border-l border-border pl-8 pt-3 max-md:hidden top-0 sticky">

               <div className="flex flex-col gap-10">
                  <h1 className="font-medium text-text text-xl flex gap-4 items-center hover-button border-b-2 border-border pb-1">
                     <span className="btn-dark rounded-md p-1 px-2 search-hover">
                        <FilterIcon className="w-10 h-10" />
                     </span> Filter based on your interest
                  </h1>
                  <div className="flex gap-3 flex-wrap">
                     {
                        Categories.map((category, i) => {
                           return (
                              <button
                                 onClick={loadBlogByCategory}
                                 key={i} className={"btn-dark py-2 mb-1 " + (pageState == category ? " bg-grey text-dark hover:text-border" : " ")}>
                                 {category}
                              </button>
                           )
                        })
                     }
                  </div>
               </div>

               <div className="font-semibold text-xl lg:text-2xl mt-10">
                  <h1 className="font-medium text-text text-xl flex gap-4 items-center hover-button border-b-2 border-border pb-1">
                     <span className="btn-dark rounded-md p-1 px-2 search-hover">
                        <TrendingUp className="w-10 h-10" />
                     </span> Recommended blogs Based on your interest</h1>

                  {
                     trendingBlogs == null ? (""
                     ) : (
                        trendingBlogs.length ?
                           trendingBlogs.map((blog, i) => {
                              return (
                                 <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>

                                    <MinimalBlogPost blog={blog} index={i} />
                                 </AnimationWrapper>
                              )
                           })
                           :
                           <NoDataMessage message={
                              "No Trending blogs found. Please check back later."
                           } />
                     )}
               </div>
            </div>
         </section>
      </AnimationWrapper>
   )
}

export default HomePage;