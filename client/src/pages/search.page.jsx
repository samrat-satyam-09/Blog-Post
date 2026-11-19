import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreData from "../components/load-more.component";
import axios from "axios";
import { filterPeginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

const SearchPage = () => {

   let { query } = useParams();

   const [blogs, setBlogs] = useState(null);
   const [users, setUsers] = useState(null);

   const searchBlogs = ({ page = 1, create_new_arr = false }) => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })
         .then(async ({ data }) => {
            let formatedData = await filterPeginationData({
               state: blogs,
               data: data.blogs,
               page,
               countRoute: "/search-blogs-count",
               data_to_send: { query },
               create_new_arr
            })
            setBlogs(formatedData);
         })
         .catch(error => {
            console.log(error.message)
         });
   }


   const fetchUsers = () => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
         .then(({ data: { users } }) => {
            setUsers(users);
         })
   };


   useEffect(() => {

      resetState();

      searchBlogs({ page: 1, create_new_arr: true });

      fetchUsers();

   }, [query]);

   const resetState = () => {
      setBlogs(null);
      setUsers(null);
   };


   const UserCardWrapper = () => {
      return (
         <>
            {
               users == null ? <Loader />
                  :
                  users.length ?
                     users.map((user, i) => {
                        return (
                           <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.4 }}>

                              <UserCard user={user} />

                           </AnimationWrapper>
                        )
                     })
                     :
                     <NoDataMessage message={
                        "No Accounts found?"
                     } />
            }
         </>
      )
   };

   return (
      <section className="h-cover flex justify-center gap-10 md:px-20">

         {/* Search result Section... */}
         <div className="w-full">
            <InPageNavigation
               routes={[`Search Results from: "${query}"`, "Account Matched"]} defaultHidden={["Account Matched"]}>

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
                              "No blogs found?"
                           } />
                     )}
                  <LoadMoreData state={blogs} fetchDataFun={searchBlogs} />
               </>

               <UserCardWrapper />

            </InPageNavigation>
         </div>

         {/* Search result User Section... */}
         <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-border pl-8 pt-3 max-md:hidden">

            <h1 className="font-medium text-text text-xl flex gap-4 items-center mb-5 hover-button border-b-2 border-border pb-1">
               <span className="btn-dark rounded-full p-1 px-2.5 search-hover">
                  <i className="fi fi-sr-user w-10 h-10" />
               </span> Users related to your search
            </h1>

            <UserCardWrapper />

         </div>

      </section>
   )
}

export default SearchPage;