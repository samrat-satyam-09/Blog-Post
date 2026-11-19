import { Link, useNavigate, useParams } from "react-router-dom";
import Logo from '../assets/Logo.png';
import AnimationWrapper from "../common/page-animation";
import DefaultBanner from '../../src/assets/blog banner.png'
import { uploadImage } from "../common/aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from "../pages/editor.pages";
import EditorJs from '@editorjs/editorjs'
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {

   const navigate = useNavigate();

   let { blog, blog: { title, banner, content, tags, desc }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);

   let { userAuth: { access_token } } = useContext(UserContext)
   let { blog_id } = useParams();

   // Editor useEffects hooks
   useEffect(() => {
      if (!textEditor.isReady) {
         setTextEditor(new EditorJs({
            holderId: 'textEditor',
            data: Array.isArray(content) ? content[0] : content,
            tools: tools,
            placeholder: 'Write your thrad or idea and thinking,  to share it with the world...',
         }))
      }

   }, []);

   const handleBannerChange = (e) => {
      // code for handling banner file upload

      let img = e.target.files[0];
      if (img) {
         let loadingToast = toast.loading("This will take a few sec, Please wait...");

         uploadImage(img).then((url) => {
            if (url) {
               setBlog({ ...blog, banner: url });
               toast.dismiss(loadingToast);
               toast.success("Image uploaded successfully!");

            }
         })
            .catch((err) => {
               toast.dismiss(loadingToast);
               toast.error("Failed to upload image. Please try again.");
               console.error(err);
            })
      }
   };

   const handleTitleKeyDown = (event) => {
      if (event.keyCode === 13) { // Means that User pressed enter key 
         event.preventDefault();
      }
   };

   const handleTitleChange = (e) => {
      // code for handling Title content area
      let input = e.target;
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;

      setBlog({ ...blog, title: input.value });
   };

   const handleChangeError = (e) => {
      const img = e.target;
      img.src = DefaultBanner;
   };

   const handlePublishEvent = () => {

      // if (!banner.length) {
      //    return toast.error("Please upload a banner image.");
      // }
      if (!title.length) {
         return toast.error("Please enter a title for your blog.");
      }
      if (textEditor.isReady) {
         textEditor.save().then(data => {
            if (data.blocks.length) {
               setBlog({ ...blog, content: data });
               setEditorState("publish");
            }
            else {
               return toast.error("Please write something in your blog.");
            }
         })
            .catch((error) => {
               console.error(error);
               toast.error("Failed to save blog. Please try again.");
            })
      }
   };

   const handleSaveDraft = (e) => {
      if (e.target.className.includes('disable')) {
         return;
      };

      if (!title.length) {
         return toast.error("You must provide a title to save in Draft.");
      }

      let lodingToast = toast.loading('Saving Draft...');

      e.target.classList.add('disable');

      if (textEditor.isReady) {
         textEditor.save().then(content => {

            let blogObjects = {
               title,
               desc,
               banner,
               content,
               tags,
               draft: true,
            }

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObjects, id: blog_id }, {

               headers: {
                  'Authorization': `Bearer ${access_token}`
               },
            })
               .then(() => {
                  e.target.classList.remove('disable');
                  toast.dismiss(lodingToast);
                  toast.success("Blog saved on Draft");

                  setTimeout(() => {
                     navigate("/dashboard/blogs?tab=draft");
                  }, 2000)
               })
               .catch(({ response }) => {
                  e.target.classList.remove('disable');
                  toast.dismiss(lodingToast);
                  return toast.error(response.data.message);
               });
         })
      }
   };

   return (
      <>
         <nav className="navbar">
            <Link to="/" className='flex-none'>
               <img src={Logo} alt="logo" className='w-[7.3rem] drop-shadow-md object-cover' />
            </Link>
            <p className="max-md:hidden text-text line-clamp-1 w-full">
               {title.length ? title : "New Blog"}
            </p>
            <div className="flex gap-4 ml-auto">
               <button
                  onClick={handlePublishEvent}
                  className="btn-dark py-2">
                  Preview
               </button>
               <button
                  onClick={handleSaveDraft}
                  className="btn-light py-2">
                  Save Draft
               </button>
            </div>
         </nav>
         <Toaster />
         {/* Blog Banner section... */}
         <AnimationWrapper>
            <section>
               <div className="mx-auto max-w-[900px] w-full mt-2">

                  <div className="relative aspect-video bg-light/50 bottom-4 border-grey hover:opacity-80 duration-300 rounded-sm shadow-sm">
                     <label htmlFor="uploadBanner">
                        <img
                           onError={handleChangeError}
                           src={banner} alt="blog-banner" className="z-20 cursor-pointer" />
                        <input
                           id="uploadBanner"
                           type="file"
                           accept=".png, .jpg, .jpeg, .gif, webp"
                           hidden
                           onChange={handleBannerChange}
                        />
                     </label>
                  </div>
                  {/* Blog Title Section... */}
                  <textarea placeholder="Blog title" className="text-4xl font-medium w-full h-20 outline-0 focus:bg-grey rounded-[3px] pl-8 placeholder:pl-2 text-border resize-none mt-5 placeholder:opacity-70 focus:placeholder:opacity-95 shadow-sm"
                     onKeyDown={handleTitleKeyDown}
                     onChange={handleTitleChange}
                     defaultValue={title}
                  />

                  <hr className="w-full opacity-10 my-5" />

                  {/* Blog Content Editor section... */}
                  <div id="textEditor" className="font-gelasio w-full bg-light px-5 font-medium text-header rounded-sm shadow-sm">
                  </div>
               </div>
            </section>
         </AnimationWrapper>
      </>
   )
}

export default BlogEditor;