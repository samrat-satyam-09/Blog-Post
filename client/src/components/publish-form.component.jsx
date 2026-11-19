import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { Close } from "@mui/icons-material";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from '../components/tags.component'
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

const PublishForm = () => {

   const characterLimit = 250;
   const tagLimit = 10;
   const navigate = useNavigate();

   let { blog, blog: { banner, title, tags, desc, content }, setEditorState, setBlog } = useContext(EditorContext);

   let { userAuth: { access_token } } = useContext(UserContext)
   let { blog_id } = useParams();

   const handleCloseEvent = () => {
      setEditorState("editor")
   }

   const handleBlogTitleChange = (e) => {
      let input = e.target;
      setBlog({ ...blog, title: input.value });
   }

   const handleBlogDescChange = (e) => {
      let input = e.target;
      setBlog({ ...blog, desc: input.value });
   }

   const handleTitleKeyDown = (e) => {
      if (e.keyCode === 13) { // Means that User pressed enter key 
         e.preventDefault();
      }
   };

   const handleKeyDown = (e) => {
      if (e.keyCode == 13 || e.keyCode == 188) { // means that User pressed
         e.preventDefault();
         let tag = e.target.value;

         if (tags.length < tagLimit) {
            if (!tags.includes(tag) && tag.length) {
               setBlog({ ...blog, tags: [...tags, tag] });
            }
         }
         else {
            toast.error(`Maximum number of tags reached!`);
         }
         e.target.value = "";
      };
   }

   const publishBlog = (e) => {

      if (e.target.className.includes('disable')) {
         return;
      };

      if (!title.length) {
         return toast.error("You must provide a title to publish this blog");
      }

      if (!desc.length) {
         return toast.error("You must provide a description to publish this blog");
      }

      if (desc.length > characterLimit) {
         return toast.error(`Description should not exceed ${characterLimit} characters`);
      }

      if (!tags.length) {
         return toast.error("You must add at least one TAG to publish this blog");
      }

      let lodingToast = toast.loading('Publishing...');

      e.target.classList.add('disable');

      const blogObjects = {
         title,
         desc,
         banner,
         content,
         tags,
         draft: false,
      }

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObjects, id: blog_id }, {

         headers: {
            'Authorization': `Bearer ${access_token}`
         },
      })
         .then(() => {
            e.target.classList.remove('disable');
            toast.dismiss(lodingToast);
            toast.success("Blog published successfully");

            setTimeout(() => {
               navigate("/dashboard/blogs");
            }, 2000)
         })
         .catch(({ response }) => {
            e.target.classList.remove('disable');
            toast.dismiss(lodingToast);
            return toast.error(response.data.message);
         });
   };

   return (
      <AnimationWrapper>
         <section
            className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
            <Toaster />
            <button
               title="Back to editor"
               className="w-6 h-6 absolute right-[5vw] z-10 top-[5%] hover:bg-red/80 bg-red rounded-full flex items-center justify-center transition-all duration-200 lg:top-[8%]"
               onClick={handleCloseEvent}
            >
               <Close />
            </button>
            <div
               className="max-w-[550px] center">
               <h2
                  className="text-text shadow-sm text-center">Preview</h2>
               <div
                  className="w-full aspect-video rounded-md bg-border mt-5">
                  <img
                     src={banner} alt="banner"
                     className="rounded-md object-cover" />
               </div>
               <h1
                  className="text-text text-3xl sm:text-4xl  font-medium mt-2 leading-tight line-clamp-2">{title}</h1>
               <p
                  className="text-text font-gelasio line-clamp-3 text-xl leading-7 mt-5">{desc}</p>
            </div>
            <div
               className="border-border lg:border-1 lg:pl-10">
               <p
                  className="text-text mb-2 mt-9">Blog title:</p>

               <input
                  onChange={handleBlogTitleChange}
                  type="text"
                  placeholder="Blog title"
                  defaultValue={title}
                  className="input-box pl-4" />

               <p
                  className="text-text mb-2 mt-9">Short description of your blog:</p>
               <textarea
                  placeholder="Write your blog description..."
                  maxLength={characterLimit}
                  defaultValue={desc}
                  onChange={handleBlogDescChange}
                  onKeyDown={handleTitleKeyDown}
                  className="h-40 resize-none leading-7 input-box pl-4" />
               <p
                  className="text-[10px] text-right text-red mt-1">{characterLimit - desc.length} Characters left</p>

               <p
                  className="flex gap-2 items-center mb-2 mt-9 text-text text-sm">
                  <span
                     className="text-xl font-semibold">Topics:</span>
                  [This will help you to finding and ranking your blog posts]</p>

               <div className="relative tag-box">
                  <input
                     onKeyDown={handleKeyDown}
                     type="text"
                     placeholder="Add tags"
                     className="sticky input-box top-0 left-0 pl-4 mb-3 focus:placeholder:text-grey/60" />

                  {
                     tags.map((tag, index) => {
                        return <Tag key={index} tagIndex={index} tag={tag} />
                     })
                  }

               </div>
               <p
                  className="text-[10px] text-right text-red mt-1">{tagLimit - tags.length} Tags left</p>
               <div className="flex items-center justify-center">
                  <button
                     onClick={publishBlog}
                     className="btn-dark md:py-4 py-2 w-1/2 mt-4 lg:w-[60%]">
                     Publish
                  </button>
               </div>
            </div>
         </section>
      </AnimationWrapper>
   )
}

export default PublishForm;