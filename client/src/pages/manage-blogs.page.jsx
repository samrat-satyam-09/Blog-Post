import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPeginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManagePublishedBlog, ManageDraftBlog } from "../components/manage-blogcard.component";
import LoadMoreData from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

const ManageBlogs = () => {

   const [blogs, setBlogs] = useState(null);
   const [drafts, setDrafts] = useState(null);
   const [query, setQuery] = useState("");

   let activeTab = useSearchParams()[0].get("tab");

   let { userAuth: { access_token } } = useContext(UserContext)

   const getBlogs = ({ page, draft, deleted, deletedDocCount = 0 }) => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs", {
         page, draft, deleted, deletedDocCount, query
      }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(async ({ data }) => {

            let formatedData = await filterPeginationData({
               state: draft ? drafts : blogs,
               data: data.blogs,
               page,
               user: access_token,
               countRoute: "/user-written-blogs-count",
               data_to_send: { query, draft }
            })
            if (draft) {
               setDrafts(formatedData);
            } else {
               setBlogs(formatedData);
            }
         })
         .catch(error => {
            console.log(error.message)
         });
   }

   useEffect(() => {

      if (access_token) {
         if (blogs == null) {
            getBlogs({ page: 1, draft: false });
         }
         if (drafts == null) {
            getBlogs({ page: 1, draft: true });
         }
      }
   }, [access_token, blogs, drafts, query])

   const handleSearch = (e) => {

      let searchQuery = e.target.value;
      setQuery(searchQuery);

      if (e.keyCode == 13 && searchQuery.length) {
         setBlogs(null);
         setDrafts(null);
      }
   }

   const handleChange = (e) => {
      if (!e.target.value.length) {
         setQuery("");
         setBlogs(null);
         setDrafts(null);
      }
   }


   return (
      <>
         <h1 className="max-md:hidden text-[18px] Text-shadow">Manage Blogs</h1>
         <Toaster />
         <div className="relative max-md:mt-5 md:mt-8 mb-10 md:mr-8">

            <input onKeyDown={handleSearch}
               onChange={handleChange}
               type="search" placeholder="Search your post..." className="w-full bg-grey p-[0.80rem] max-md:pl-6 pl-12 pr-8 rounded-full placeholder:text-dark-grey placeholder:font-normal text-header font-medium focus-within:bg-grey focus:outline-0" />

            <i className="fi fi-br-search absolute right-5 md:left-5 top-1/2 -translate-y-1/2 text-dark-grey !font-bold cursor-pointer md:pointer-events-none text-xl" />
         </div>
         <InPageNavigation routes={["Published Blogs", "Drafts"]} defaultActiveIndex={activeTab != 'draft' ? 0 : 1}>
            { // Published Blogs
               blogs == null ? <Loader /> :
                  blogs.results.length ?
                     <>
                        {
                           blogs.results.map((blog, i) => {
                              return (
                                 <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                                    <ManagePublishedBlog blog={{ ...blog, index: i, setStateFunc: setBlogs }} />
                                 </AnimationWrapper>
                              )
                           })
                        }
                        <div className="mb-5">
                           <LoadMoreData state={blogs} fetchDataFun={getBlogs} additionalParam={{ draft: false, deletedDocCount: blogs.deletedDocCount }} />
                        </div>
                     </>
                     : <NoDataMessage message="No publish blogs yet" />
            }

            { // Draft Blogs
               drafts == null ? <Loader /> :
                  drafts.results.length ?
                     <>
                        {
                           drafts.results.map((blog, i) => {
                              return (
                                 <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                                    <ManageDraftBlog blog={{ ...blog, index: i, setStateFunc: setDrafts }} />
                                 </AnimationWrapper>
                              )
                           })
                        }
                        <div className="mb-5">
                           <LoadMoreData state={drafts} fetchDataFun={getBlogs} additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount }} />
                        </div>
                     </>
                     : <NoDataMessage message="No any blogs in Draft" />
            }
         </InPageNavigation>
      </>
   )
}

export default ManageBlogs;