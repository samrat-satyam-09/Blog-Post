import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPeginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreData from "../components/load-more.component";
import PageNotFound from "./404.page";

export const profileDs = {
   personal_info: {
      "fullname": "",
      "username": "",
      "profile_img": "",
      "bio": "",
   },
   account_info: {
      "total_posts": 0,
      "total_reads": 0
   },
   social_links: {},
   createdAt: ""
}

const ProfilePage = () => {

   let { id: profileId } = useParams();

   let [profile, setProfile] = useState(profileDs);
   let [isLoading, setIsLoading] = useState(true);
   const [blogs, setblogs] = useState(null);
   const [profileLoded, setProfileLoded] = useState("");

   const { userAuth: { username } } = useContext(UserContext)

   let { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, createdAt } = profile;

   const fetchUserProfile = () => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
         .then(({ data: user }) => {
            if(user != null){
               setProfile(user);
            }
            setProfileLoded(profileId);
            getBlogs({ user_id: user._id });
            setIsLoading(false);
         })
         .catch(error => {
            console.log(error.message);
            setIsLoading(false);
         })
   };

   // Get Blogs in Profile section...
   const getBlogs = ({ page = 1, user_id }) => {

      user_id = user_id == undefined ? blogs.user_id : user_id;
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { author: user_id, page })
         .then(async ({ data }) => {

            let formatedData = await filterPeginationData({
               state: blogs,
               data: data.blogs,
               page,
               countRoute: "/search-blogs-count",
               data_to_send: { author: user_id }
            })
            formatedData.user_id = user_id;
            setblogs(formatedData);
         })
   }


   useEffect(() => {

      if (profileId != profileLoded) {
         setblogs(null);
      }
      if (blogs == null) {
         resetStates();
         fetchUserProfile();
      }

   }, [profileId, blogs])

   const resetStates = () => {
      setProfile(profileDs);
      setIsLoading(true);
      setProfileLoded("");
   };

   return (
      <AnimationWrapper>
         {
            isLoading ? <Loader />
               :
               profile_username.length ?
                  <section className="h-cover md:flex flex-row items-start gap-5 min-[1100px]:gap-12 lg:px-20 md:relative">
                     <div className="flex flex-col items-center max-md:items-center gap-5 min-w-[250px] bg-border py-5 px-10 md:top-20 md:sticky rounded-r-md">
                        <img src={profile_img} alt={fullname} className="w-32 h-32 bg-border object-cover rounded-full" />
                        <h1 className="text-text text-2xl text-center font-medium">{fullname}</h1>
                        <p className="text-text/75 text-xl font-medium -mt-5 hover:underline">@{profile_username}</p>
                        <p className="text-grey/75 text-sm font-medium capitalize text-center">
                           {total_posts.toLocaleString()} Blogs &nbsp;&nbsp; {total_reads.toLocaleString()} Reads</p>

                        <div className="flex gap-4">
                           {
                              profileId == username ?
                                 <Link
                                    to="/settings/edit-profile"
                                    className="btn-light py-2 rounded-md hover:bg-light/90 hover:text-dark font-medium text-base"
                                 >Edit Profile</Link>
                                 : ""
                           }
                        </div>
                        <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} createdAt={createdAt} />
                     </div>

                     <div className="max-md:mt-10 w-full">
                        <InPageNavigation
                           routes={["Published Blogs", "User Info"]}
                           defaultHidden={["User Info"]}>

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
                                          "No blogs found. Please check while available."
                                       } />
                                 )}
                              <LoadMoreData state={blogs}
                                 fetchDataFun={getBlogs} />
                           </>

                           <AboutUser bio={bio} social_links={social_links} createdAt={createdAt} />

                        </InPageNavigation>
                     </div>

                  </section>
                  : <PageNotFound />
         }
      </AnimationWrapper>

   )
};

export default ProfilePage;