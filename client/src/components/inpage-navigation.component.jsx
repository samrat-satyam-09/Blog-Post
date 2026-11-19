import { useEffect, useRef, useState } from "react";

export let activeTab;
export let activeTabLineRef;

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) => {

   let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);

   let [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

   let [width, setWidth] = useState(window.innerWidth);

   activeTab = useRef();
   activeTabLineRef = useRef();

   const changePageState = (btn, i) => {

      let { offsetWidth, offsetLeft } = btn;

      activeTabLineRef.current.style.width = offsetWidth + "px";
      activeTabLineRef.current.style.left = offsetLeft + "px";
      setInPageNavIndex(i);
   }

   useEffect(() => {

      if (width > 767 && inPageNavIndex != defaultActiveIndex) {

         changePageState(activeTabLineRef.current, defaultActiveIndex);
      }

      changePageState(activeTab.current, defaultActiveIndex)

      if (!isResizeEventAdded) {
         window.addEventListener('resize', () => {
            if (!isResizeEventAdded) {
               setIsResizeEventAdded(true);
            }
            setWidth(window.innerWidth);
         });
      }
   }, [width]);

   return (
      <>
         <div className="relative mb-8 bg-header border-b border-border flex flex-nowrap overscroll-x-auto">
            {
               routes.map((route, index) => {
                  return (
                     <button
                        ref={index == defaultActiveIndex ? activeTab : null}
                        key={index}
                        className={"p-4 px-4 lg:px-10 capitalize hover:text-grey Hover-Text-Shadow " + (inPageNavIndex == index ? "text-grey Text-shadow font-medium" : "text-text ") + (defaultHidden.includes(route) ? " md:hidden " : " ")}
                        onClick={(e) => { changePageState(e.target, index) }}
                     >
                        {route}
                     </button>
                  )
               })
            }

            <hr ref={activeTabLineRef} className={`absolute -bottom-[0.5px] duration-300 ${activeTab ? "Text-shadow text-grey" : ""}`} />
         </div>

         {Array.isArray(children) ? children[inPageNavIndex] : children}
      </>
   )
};

export default InPageNavigation;