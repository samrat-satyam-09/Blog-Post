import { Link, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from './../App';
import { ArrowDropDown, ArrowDropUp, Notifications, NotificationsActive } from '@mui/icons-material';
import UserNavigationPanel from './user-navigation.component';
import AnimationWrapper from '../common/page-animation';
import axios from 'axios';

const Navbar = () => {

   const navigate = useNavigate();

   const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

   const { userAuth, userAuth: { access_token, profile_img, new_notification_available }, setUserAuth } = useContext(UserContext)

   const [showUserNavPanel, setShowUserNavPanel] = useState(false);

   const handleUserNavPanel = () => {
      setShowUserNavPanel(currentVal => !currentVal);
   }

   useEffect(() => {

      if (access_token) {
         axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
            headers: {
               'Authorization': `Bearer ${access_token}`
            }
         })
            .then(({ data }) => {
               setUserAuth({ ...userAuth, ...data })
            })
            .catch(err => {
               console.log(err)
            })
      }

   }, [access_token])

   const handleBlur = () => {
      setTimeout(() => {
         setShowUserNavPanel(false);
      }, 300);
   };

   const handleSearch = (e) => {
      let query = e.target.value;
      if (e.keyCode == 13 && query.length) {
         navigate(`/search/${query}`);
      }
   };

   const handlePageSearch = () => {
      let query = document.querySelector('.navbar input[type="search"]').value;
      navigate(`/search/${query}`);
   };

   return (
      <>
         <nav className="navbar">
            <Link to="/" className='flex-none'>
               <img src={Logo} alt="logo" className='w-[7.3rem] shadow-light drop-shadow-md object-cover' />
            </Link>

            {new_notification_available}

            <div className={"absolute bg-border md:bg-transparent w-full left-0 top-full border-b border-header md:border-0 md:py-4 p-2 md:px-[5vw] md:block md:relative md:inset-0 md:p-0 md:show " + (searchBoxVisibility ? "show" : "hide")}>
               <input
                  type='search'
                  placeholder='Search...'
                  className='w-full md:w-[90%] lg:w-[70%] bg-light focus-within:bg-grey focus:outline-0 p-3 pl-6 pr-[12%] md:pr-12 rounded-full placeholder:text-dark-grey placeholder:font-normal text-header font-medium'
                  onKeyDown={handleSearch}
               />
               <button onClick={handlePageSearch}>
                  <i
                     title='search' className="fi fi-br-search absolute right-7 md:right-[25%] lg:right-[36%] top-1/2 -translate-y-1/2 text-dark-grey !font-bold cursor-pointer text-xl" />
               </button>
            </div>
            <div className='flex items-center gap-3 md:gap-6 ml-auto'>

               <button
                  onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
                  title='search' className="hover-button md:hidden bg-border w-12 h-12 shadow-md rounded-full flex justify-center items-center">

                  <i className="fi fi-br-search search-hover text-light !font-bold text-xl" />
               </button>

               <Link title='write blogs' to="/editor" className='hover-button hidden md:flex gap-2 link'>
                  <i className="fi fi-sr-file-edit search-hover" />
                  <p>Write </p>
               </Link>
               {
                  access_token ?
                     <>
                        <Link title='notification' to="/dashboard/notifications">
                           <button className='w-10 h-10 rounded-full bg-border relative hover:bg-border/50 hover:text-text'>

                              {

                                 new_notification_available ?
                                    <>
                                       <NotificationsActive />
                                       <span className='bg-red w-[0.70rem] h-[0.70rem] rounded-full absolute top-[10px] right-[0.56rem]'></span>
                                    </>
                                    :
                                    <Notifications />
                              }
                           </button>
                        </Link>
                        <div
                           onBlur={handleBlur}
                           onClick={handleUserNavPanel}
                           className='relative flex items-center gap-1 transition-all duration-300'>
                           <button title='user' className='w-10 h-10'>
                              <img src={profile_img} alt="profile" className='w-full h-full rounded-full object-cover' />
                           </button>
                           {
                              showUserNavPanel ?
                                 <UserNavigationPanel />
                                 : ""
                           }
                           <AnimationWrapper
                              transition={{ duration: 0.9 }}
                           >
                              <span title='user' className='cursor-pointer'>
                                 {
                                    showUserNavPanel ?
                                       <ArrowDropUp />
                                       : <ArrowDropDown />
                                 }
                              </span>
                           </AnimationWrapper>
                        </div>

                     </>
                     :
                     <>
                        <Link to="/sign-in" className='btn-dark py-2'>Sign In</Link>
                        <Link to="/sign-up" className='btn-dark py-2 hidden md:flex'>SignUp</Link>
                     </>
               }
            </div>
         </nav>
         <Outlet />
      </>
   )
}

export default Navbar;
