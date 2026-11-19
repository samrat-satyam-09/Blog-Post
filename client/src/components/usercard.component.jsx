import { Link } from "react-router-dom";

const UserCard = ({ user }) => {

   let { personal_info: { fullname, username, profile_img } } = user;

   return (
      <Link to={`/user/${username}`} className="when-hover flex gap-5 items-center mb-6 bg-border rounded-md p-3 px-4">
         <img src={profile_img} alt={fullname} className="w-14 h-14 rounded-full object-cover" />
         <div className="">
            <h1 className="font-medium text-xl line-clamp-2">
               {fullname}
            </h1>
            <p className="text-text text-[12px] line-clamp-2 duration-200 hover-underline">@{username}</p>
         </div>
      </Link>
   )
}

export default UserCard;