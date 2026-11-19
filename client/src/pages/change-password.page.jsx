import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from '../App'
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {

   const Navigate = useNavigate();

   const { userAuth: { access_token } } = useContext(UserContext);

   let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
   let changePasswordForm = useRef();

   const handleSubmit = (e) => {
      e.preventDefault();
      // Make API call to change password here.

      let form = new FormData(changePasswordForm.current);
      let formData = {};

      for (let [key, value] of form.entries()) {
         formData[key] = value;
      }

      let { currentPassword, newPassword } = formData;

      if (!currentPassword.length || !newPassword.length) {
         return toast.error('All fields are required')
      }

      if (currentPassword === newPassword) {
         return toast.error('New password cannot be the same as current password')
      }

      // Validate password strength here.

      if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
         return toast.error('Password must be at least 6 characters long, contain at least 1 uppercase, 1 lowercase, and 1 number.')
      }

      e.target.setAttribute("disabled", true)

      let loadingToast = toast.loading("Updating...")

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })

         .then(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Password updated successfully")
            setTimeout(() => {
               Navigate("/")
            }, 2000);

         })
         .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response.data.error)
         })
   }

   return (
      <AnimationWrapper>
         <Toaster />
         <form ref={changePasswordForm}>
            <h1 className="text-3xl max-md:hidden font-gelasio capitalize text-text text-center font-medium my-2">Change Password</h1>
            <div className="py-10 w-full lg:px-32">
               <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Current Password" icon="fi-rr-unlock" />

               <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New Password" icon="fi-rr-lock" />

               <div className="flex justify-center lg:justify-end md:justify-center mr-20">
                  <button onClick={handleSubmit} type="submit" className="btn-dark px-7">Change Password</button>
               </div>
            </div>
         </form>

      </AnimationWrapper>
   )
}

export default ChangePassword;