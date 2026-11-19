import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, disabled = false }) => {

   const [PassVisible, setPassVisible] = useState(false);

   return (
      <div className="input-div relative w-full mb-10 px-5 md:px-20">
         <input
            name={name}
            type={type === "password" ? PassVisible ? "text" : "password" : type}
            id={id}
            defaultValue={value}
            placeholder={placeholder}
            className="input-box"
            disabled = {disabled}
         />
         <i className={"fi " + icon + " input-icon"} />
         {
            type === "password" ? <i
               onClick={() => setPassVisible(currentVal => !currentVal)}
               className={"fi fi-rr-eye" + (!PassVisible ? "-crossed" : "") + " input-icon left-auto right-8 md:right-24 cursor-pointer"}></i> : ""
         }
      </div>
   )
};

export default InputBox;