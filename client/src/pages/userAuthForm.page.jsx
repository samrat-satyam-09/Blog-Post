import InputBox from "../components/input.component";
import GoogleIcon from '../assets/google.png'
import { Link, Navigate, useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext, useEffect, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import axios from "axios";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";

const UserAuthForm = ({ type }) => {

   const authForm = useRef();
   const [searchParams] = useSearchParams();
   let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)

   useEffect(() => {
      const error = searchParams.get("error");
      if (error) {
         toast.error(decodeURIComponent(error));
      }
   }, [searchParams]);

   // An API call to send the form data to the server.
   const userAuthThrouthServer = (serverRoute, formData) => {

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
         .then(({ data }) => {
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
         })
         .catch(({ response }) => {
            toast.error(response.data.message)
         });

   }

   // Your form submission logic goes here
   const handleSubmit = (e) => {
      e.preventDefault();

      const serverRoute = type === "sign-in" ? "/signin" : "/signup";

      // Form data
      const form = new FormData(trackForm)
      const formData = {};
      for (let [key, value] of form.entries()) {
         formData[key] = value;
      }

      // Regex for email, and password validation.
      let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

      // Form validation logic
      const { fullname, email, password } = formData;
      if (fullname) {
         if (fullname.length < 3) {
            return toast.error("Fullname must be at least 3 characters long.");
         }
      }
      if (!email.length) {
         return toast.error("Enter your email");
      }
      if (!emailRegex.test(email)) {
         return toast.error("Enter a valid email");
      }
      if (!passwordRegex.test(password)) {
         return toast.error("Password must be at least 6 characters long, contain at least 1 uppercase, 1 lowercase, and 1 number.");
      }
      // An API call to send the form data to the server.
      userAuthThrouthServer(serverRoute, formData)
   }


   // Google OAuth login functionality.
   const handleGoogleAuth = (e) => {
      e.preventDefault();

      const serverDomain = import.meta.env.VITE_SERVER_DOMAIN || "http://localhost:3000";
      const currentOrigin = window.location.origin;

      window.location.href = `${serverDomain}/auth/google?from=${encodeURIComponent(currentOrigin)}`;
   };


   return (
      access_token ?
         <Navigate to="/" />
         :

         <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
               <Toaster />
               <form id="trackForm" className="Box-Shadow w-full max-w-[50rem] rounded-lg">
                  <h1 className="text-3xl md:text-4xl font-gelasio capitalize text-text text-center font-medium my-16">{type === "sign-in" ? "Welcome back !" : "Join us Today ?"}</h1>
                  {
                     type !== "sign-in" ?
                        <InputBox
                           name="fullname"
                           type="text"
                           placeholder="Full Name"
                           icon="fi-sr-user"
                        /> : ""

                  }
                  <InputBox
                     name="email"
                     type="email"
                     placeholder="Enter your Email"
                     icon="fi-sr-envelope-open"
                  />

                  <InputBox
                     name="password"
                     type="password"
                     placeholder="Enter your Password"
                     icon="fi-sr-lock"
                  />

                  <button
                     onClick={handleSubmit}
                     type="submit"
                     className="btn-dark w-1/2 font-medium center my-10">
                     {type.replace("-", " ")}
                  </button>

                  <div className="relative w-full flex items-center gap-2 my-10 opacity-50 px-5 md:px-20 uppercase text-text font-medium">
                     <hr className="w-1/2 border-text" />
                     <p> OR </p>
                     <hr className="w-1/2 border-text" />
                  </div>

                  <div className="md:px-20 my-10 px-5">
                     <button
                        onClick={handleGoogleAuth}
                        className="Continue-with-google w-full flex items-center justify-center gap-2">
                        <img src={GoogleIcon} className="w-6" alt="Continue-with-google" />
                        Continue with Google
                     </button>

                     {
                        type === "sign-in" ?
                           <p className="mt-6 text-text text-xl text-center">Don't have an account?
                              <Link className="underline hover:no-underline text-grey text-xl hover:opacity-80 ml-1" to="/sign-up">Join us today</Link>
                           </p>
                           :
                           <p className="mt-6 text-text text-xl text-center">Already have an account?
                              <Link className="underline hover:no-underline text-grey text-xl hover:opacity-80 ml-1" to="/sign-in">Sign In</Link>
                           </p>
                     }
                  </div>
               </form>
            </section>
         </AnimationWrapper>

   )
};

export default UserAuthForm;