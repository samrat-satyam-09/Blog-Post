import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDs } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfile = () => {

   let bioLength = 200;

   let profileImgFile = useRef();
   let editProfileForm = useRef();

   const [charactersLeft, setCharactersLeft] = useState(bioLength)

   let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext)

   const [profile, setProfile] = useState(profileDs);

   const [loading, setLoading] = useState(true);

   const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

   let { personal_info: { fullname, email, username: profile_username, profile_img, bio }, social_links } = profile;

   useEffect(() => {

      if (access_token) {
         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: userAuth.username })
            .then(({ data }) => {
               setProfile(data);
               setLoading(false);
            })
            .catch(err => {
               console.log(err)
            })
      }

   }, [access_token])

   const handleCharacterChange = (e) => {
      setCharactersLeft(bioLength - e.target.value.length)
   }

   const handleImagePrivew = (e) => {
      let img = e.target.files[0];

      profileImgFile.current.src = URL.createObjectURL(img);

      setUpdatedProfileImg(img);

   }

   const handleImageUpload = (e) => {
      e.preventDefault();

      if (updatedProfileImg) {

         let loadingToast = toast.loading("Uploading...")

         e.target.setAttribute("disabled", true);

         uploadImage(updatedProfileImg).then(url => {
            if (url) {
               axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img", { url: url }, {
                  headers: {
                     'Authorization': `Bearer ${access_token}`
                  }
               })
                  .then(({ data }) => {
                     let newUserAuth = { ...userAuth, profile_img: data.profile_img }

                     storeInSession("user", JSON.stringify(newUserAuth));

                     setUserAuth(newUserAuth)

                     setUpdatedProfileImg(null);

                     toast.dismiss(loadingToast);
                     e.target.removeAttribute("disabled");
                     toast.success("Profile image updated successfully")
                  })
            }
         })
            .catch(({ response }) => {
               toast.dismiss(loadingToast);
               e.target.removeAttribute("disabled");
               toast.error(response.data.error);
            })
      }
   }

   const handleSubmit = (e) => {
      e.preventDefault();

      let form = new FormData(editProfileForm.current);

      let formData = {};
      for (let [key, value] of form.entries()) {
         formData[key] = value;
      }

      let { username, bio, youtube, facebook, instagram, twitter, github, linkedin, website } = formData;

      if (username.length < 3) {
         return toast.error("Username should be at least 3 characters long.")
      }
      if (bio.length > bioLength) {
         return toast.error(`Bio should not exceed ${bioLength} characters`)
      }

      let loadingToast = toast.loading("Updating...");
      e.target.setAttribute("disabled", true);

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {

         username, bio, social_links: { youtube, facebook, instagram, twitter, github, linkedin, website }

      }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(({ data }) => {

            if (userAuth.username != data.username) {
               let newUserAuth = { ...userAuth, username: data.username };
               storeInSession("user", JSON.stringify(newUserAuth));
               setUserAuth(newUserAuth)
            }

            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Profile updated successfully")

         })
         .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
         })
   }

   return (
      <AnimationWrapper>
         {
            loading ? <Loader /> :
               <form ref={editProfileForm}>
                  <Toaster />
                  <h1 className="text-3xl max-md:hidden font-gelasio capitalize text-text text-center font-medium my-2">Edit Profile</h1>
                  <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

                     <div className="max-lg:center mb-5">
                        <label htmlFor="uploadImg" id="profileImgLabel"
                           className="relative block w-40 h-40 bg-border rounded-full overflow-hidden"
                        >
                           <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center bg-border2/50 opacity-0 hover:opacity-100 font-sans font-medium duration-300 hover:text-white/50 cursor-crosshair" >
                              Upload Image
                           </div>

                           <img ref={profileImgFile} src={profile_img} />
                        </label>

                        <input onChange={handleImagePrivew} type="file" id="uploadImg" accept=".jpeg, .jpg, .png" hidden />

                        <button onClick={handleImageUpload} type="submit" className="btn-dark px-10 mt-5 max-lg:center lg:w-full">Upload</button>

                     </div>

                     <div className="w-full">

                        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-5 my-5">
                           <div className="relative">
                              <span className="absolute -top-6 left-[5.2rem] max-md:left-10 Text-shadow">Name</span>
                              <InputBox name="fullname" type="text" value={fullname} placeholder="Full Name" disabled={true} icon="fi-sr-user" />
                           </div>
                           <div className="relative">
                              <span className="absolute -top-6 left-[5.2rem] max-md:left-10 Text-shadow">Email</span>
                              <InputBox name="email" type="email" value={email} placeholder="Email" disabled={true} icon="fi-sr-envelope-open" />
                           </div>
                        </div>
                        <div className="relative">
                           <span className="absolute -top-6 left-[5.2rem] max-md:left-10 Text-shadow">Username</span>

                           <InputBox name="username" type="text" value={profile_username} placeholder="Username" icon="fi-br-at" />

                           <p className="-mt-7 text-sm text-grey ml-5 md:ml-20 line-clamp-1">
                              Username will use to search user and will visible to all users!
                           </p>
                        </div>
                        <textarea onChange={handleCharacterChange} name="bio" maxLength={bioLength} defaultValue={bio} className="input-box mt-7 ml-5 md:ml-20 resize-none h-64 lg:h-40 md:w-[80%] lg:w-[83%] pl-5 leading-7" placeholder="Bios"></textarea>
                        <p className="flex justify-center md:justify-end md:mr-10 lg:mr-[5rem] text-base lg:text-[10px] text-Red">{charactersLeft} Characters Left</p>

                        <h3 className="!text-2xl flex justify-center mt-5 underline Text-shadow">Add your social media links below</h3>

                        <div className="lg:grid lg:grid-cols-2 gap-x-6 mt-5">

                           {
                              Object.keys(social_links).map((key, i) => {
                                 let link = social_links[key];

                                 return <InputBox key={i} name={key} type="text" value={link} placeholder="https://www.example.com" icon={"pl-1 fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe")} />

                              })
                           }
                        </div>

                        <div className="flex justify-center">
                           <button onClick={handleSubmit} className="btn-light border-2 px-10 text-center">Update</button>
                        </div>
                     </div>
                  </div>
               </form>
         }
      </AnimationWrapper>
   )
}

export default EditProfile;