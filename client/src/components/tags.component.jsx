import { Close } from "@mui/icons-material";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, tagIndex }) => {

   let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

   const handleTagDelete = () => {
      tags = tags.filter(t => t != tag);
      setBlog({ ...blog, tags });
   };

   const addEditable = (e) => {
      e.target.setAttribute("contentEditable", true);
      e.target.focus();

   };

   const handleTagEditDown = (e) => {
      // Means that User pressed enter key 
      if (e.keyCode == 13 || e.keyCode == 188) {

         e.preventDefault();
         let currentTag = e.target.innerText;
         tags[tagIndex] = currentTag;
         setBlog({ ...blog, tags });
         e.target.setAttribute("contentEditable", false);
      }
   };

   return (
      <div className="relative p-2 mt-2 mr-2 px-4 bg-header/60  hover:bg-header/40 transition duration-200 rounded-full inline-block text-text pr-8">
         <p
            className="outline-none px-[2px]"
            onClick={addEditable}
            onKeyDown={handleTagEditDown}
         >{tag}</p>
         <button
            onClick={handleTagDelete}
            className="rounded-full absolute right-2 top-1/2 -translate-y-1/2">
            <Close
               className="!text-[17px] pointer-events-none" />
         </button>
      </div>
   )
}

export default Tag;