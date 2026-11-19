import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { ArrowDropUp, Dashboard, Logout, Settings } from "@mui/icons-material";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {

   const { userAuth: { username }, setUserAuth } = useContext(UserContext);

   const signOutUser = () => {
      removeFromSession("user");
      setUserAuth({ access_token: null });
   }

   return (
      <AnimationWrapper
         className="absolute right-0 z-50 -bottom-4"
         transition={{ duration: 0.3 }}
      >
         <span className="absolute -bottom-[1.27rem] z-40 right-5 text-light">
            <ArrowDropUp className="!w-12 !h-12" />
         </span>
         <div className="bg-light absolute right-0 border border-grey w-60 duration-200 rounded-sm">
            <Link to={`/user/${username}`} className="hover-button gap-2 progile_link flex pl-8 py-3">
               <i className="fi fi-sr-user search-hover" />
               <p>Profile</p>
            </Link>
            <Link to="/editor" className="hover-button gap-2 progile_link flex pl-8 py-3">
               <i className="fi fi-sr-file-edit search-hover" />
               <p>Write</p>
            </Link>
            <Link to="/dashboard/blogs" className="hover-button gap-2 progile_link flex pl-8 py-3">
               <Dashboard className="search-hover" />
               <p>Dashboard</p>
            </Link>
            <Link to="/settings/edit-profile" className="hover-button gap-2 progile_link flex pl-8 py-3">
               <Settings className="search-hover" />
               <p>Settings</p>
            </Link>
            <span className="absolute border-t border-text w-[100%]"></span>
            <button
               onClick={signOutUser}
               className="hover-button progile_link pl-8 w-full">
               <span className="flex gap-2 font-bold">
                  <Logout />
                  <p>Logout</p>
               </span>
               <p  className=" truncate">@{username}</p>
            </button>
         </div>
      </AnimationWrapper>
   )
}

export default UserNavigationPanel;