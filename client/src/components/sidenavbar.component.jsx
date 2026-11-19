import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App"
import { Navigate, NavLink, Outlet } from "react-router-dom";
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Menu, Notifications, NotificationsActive, Password, Person } from "@mui/icons-material";

const SideNavbar = () => {

   let { userAuth: { access_token, new_notification_available } } = useContext(UserContext)

   let page = location.pathname.split('/')[2];

   let [pageState, setPageState] = useState(page.replace('-', ' '));
   let [showSideNav, setShowSideNav] = useState(false);

   let activeTabLine = useRef();
   let sideBarIconTab = useRef();
   let pageStateTab = useRef();

   const changePageState = (e) => {

      let { offsetWidth, offsetLeft } = e.target;

      activeTabLine.current.style.width = offsetWidth + "px";
      activeTabLine.current.style.left = offsetLeft + "px";

      if (e.target == sideBarIconTab.current) {
         setShowSideNav(true);
      } else {
         setShowSideNav(false);
      }

   }

   useEffect(() => {
      setShowSideNav(false);
      pageStateTab.current.click();
   }, [pageState])

   return (
      access_token === null ? <Navigate to="/sign-in" /> :
         <>
            <section className="relative flex gap-10 py-0 px-0 max-md:px-10 m-0 max-md:flex-col">

               <div className="sticky top-[80px] md:border-r md:border-border z-20">

                  {/* For Mobile screen tab start */}
                  <div className="md:hidden border-b border-border flex flex-nowrap overflow-x-auto">

                     <button onClick={changePageState} ref={sideBarIconTab} className="p-5">
                        <Menu className="pointer-events-none" />
                     </button>

                     <button onClick={changePageState} ref={pageStateTab} className="p-5 Text-shadow capitalize">
                        {pageState}
                     </button>
                     <hr ref={activeTabLine} className="absolute bottom-0 duration-500 Text-shadow" />
                  </div>
                  {/* End here */}

                  <div className={"min-w-[250px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 bg-dark overflow-y-auto p-[22px] md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] max-md:w-[calc(100%+80px)] max-md:pl-2 max-md:pr-0 max-md:-ml-7 duration-500 " + (!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto")}>
                     <h1 className="text-[24px] Text-shadow">Dashboard</h1>
                     <hr className="text-dark-grey/20 -ml-6 mb-8 mt-1" />

                     <NavLink
                        className="sidebar-link hover-button"
                        to="/dashboard/blogs"
                        onClick={(e) => setPageState(e.target.innerText)}>
                        <DescriptionIcon className="search-hover" />Blogs
                     </NavLink>

                     <NavLink
                        className="sidebar-link hover-button"
                        to="/dashboard/notifications"
                        onClick={(e) => setPageState(e.target.innerText)}>
                        {

                           new_notification_available ?
                              <>
                                 <NotificationsActive />
                                 <span className='bg-red w-[0.5rem] h-[0.5rem] rounded-full absolute md:left-[2.05rem] top-[11.3rem] z-10 left-2'></span>
                              </>
                              :
                              <Notifications className="search-hover" />
                        }Notifications
                     </NavLink>

                     <NavLink
                        className="sidebar-link hover-button"
                        to="/editor"
                        onClick={(e) => setPageState(e.target.innerText)}>
                        <i className="fi fi-sr-file-edit search-hover" />Write
                     </NavLink>

                     <h1 className="mt-10 text-[24px] Text-shadow">Settings</h1>
                     <hr className="text-dark-grey/20 mt-1 -ml-6 mb-8" />

                     <NavLink
                        className="sidebar-link hover-button"
                        to="/settings/edit-profile"
                        onClick={(e) => setPageState(e.target.innerText)}>
                        <Person className="search-hover" />Edit Profile
                     </NavLink>

                     <NavLink
                        className="sidebar-link hover-button"
                        to="/settings/change-password"
                        onClick={(e) => setPageState(e.target.innerText)}>
                        <Password className="search-hover" />Change Password
                     </NavLink>
                  </div>
               </div>

               <div className="max-md:-mt-7 mt-5 w-full">
                  <Outlet />
               </div>
            </section>
         </>
   )
}

export default SideNavbar;