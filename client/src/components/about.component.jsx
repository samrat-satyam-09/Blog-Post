import { Link } from "react-router-dom";
import YouTubeIcon from '@mui/icons-material/YouTube';
import { getDay } from "../common/date";

const AboutUser = ({ className, bio, social_links, createdAt }) => {
   return (
      <div className={"md:-w[90%] md:mt-5 " + className}>
         <p className="text-text md:line-clamp-3 lg:line-clamp-none font-gelasio">{bio.length ? bio : "Nothing in your Bios"}</p>

         <div className="flex gap-x-5 gap-y-2 flex-nowrap my-5 mt-7 items-center text-grey/75">
            {
               Object.keys(social_links).map((key) => {

                  let link = social_links[key];

                  return link ?
                     <Link to={link} key={key}
                        className="duration-300 p-[2px] scale-125 hover:scale-[1.40] Hover-Text-Shadow"
                        target="_blank">
                        <i className={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe") + " flex items-center justify-center"} />
                     </Link>
                     : ""
               })
            }
         </div>
         <p className="font-mono text-text/90 text-center text-[14px] leading-7">
            <span className="Text-shadow text-xl font-serif">Joined At : &nbsp;</span>
            {getDay(createdAt)}</p>
      </div>
   )
}

export default AboutUser;