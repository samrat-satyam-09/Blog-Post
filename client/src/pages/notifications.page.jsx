import { useContext, useEffect, useState } from "react";
import axios from "axios"
import { UserContext } from '../App'
import { filterPeginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreData from "../components/load-more.component";
import toast, { Toaster } from "react-hot-toast";

const Notifications = () => {

   let { userAuth, userAuth: { access_token, new_notification_available }, setUserAuth } = useContext(UserContext)

   const [filter, setFilter] = useState('all');
   const [notifications, setNotifications] = useState(null);

   let filters = ['all', 'like', 'comment', 'reply'];

   const fetchNotifications = ({ page, deletedDocCount = 0 }) => {

      axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/notifications', {
         page, filter, deletedDocCount
      }, {
         headers: {
            'Authorization': `Bearer ${access_token}`
         }
      })
         .then(async ({ data: { notifications: data } }) => {

            if (new_notification_available) {
               toast('Good Job!', {
                  icon: '🔔 New Notification',
               });
               // Notify user about new notification
               setUserAuth({ ...userAuth, new_notification_available: false })

            }

            let formatedData = await filterPeginationData({
               state: notifications,
               data, page,
               countRoute: "/all-notifications-count",
               data_to_send: { filter },
               user: access_token
            })

            setNotifications(formatedData);

         })
         .catch(error => {
            console.log(error.message)
         });
   }

   useEffect(() => {
      if (access_token) {
         fetchNotifications({ page: 1 });
      }
   }, [access_token, filter])



   const handleFilter = (e) => {
      let btn = e.target;
      setFilter(btn.innerHTML);

      setNotifications(null)
   }

   return (
      <>
         <Toaster />
         <div>
            <h1 className="max-md:hidden text-[18px] Text-shadow">Recent Notifications</h1>

            <div className="my-5 flex gap-6 max-md:gap-3 max-md:grid max-md:grid-cols-2">
               {
                  filters.map((filterName, i) => {
                     return (
                        <button onClick={handleFilter}
                           className={"py-1 px-5 Hover-Text-Shadow hover:opacity-80 " + (filter == filterName ? "btn-light hover:bg-grey/80 text-header hover:text-dark font-medium" : "btn-dark")} key={i}>{filterName}
                        </button>)
                  })
               }
            </div>

            {
               notifications == null ? <Loader /> :
                  <>
                     {
                        notifications.results.length ?
                           notifications.results.map((notification, i) => {
                              return (
                                 <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>

                                    {/* Notification Card */}
                                    <NotificationCard data={notification} index={i} notificationState={{ notifications, setNotifications }} />
                                    {/* End of Notification Card */}
                                 </AnimationWrapper>
                              )
                           }) : <NoDataMessage
                              message="No Notifications yet." />
                     }
                     <div className="mb-3">
                        <LoadMoreData
                           state={notifications}
                           fetchDataFun={fetchNotifications}
                           additionalParam={{ deletedDocCount: notifications.deletedDocCount }} />
                     </div>
                  </>
            }

         </div>
      </>
   )
}

export default Notifications;
