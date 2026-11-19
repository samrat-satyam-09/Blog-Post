import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";
import axios from "axios";

const AuthSuccess = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const { setUserAuth } = useContext(UserContext);

   useEffect(() => {
      const dataParam = searchParams.get("data");
      const tokenParam = searchParams.get("token");

      if (dataParam) {
         try {
            const userData = JSON.parse(decodeURIComponent(dataParam));
            storeInSession("user", JSON.stringify(userData));
            setUserAuth(userData);
            navigate("/");
            return;
         } catch (error) {
            console.error("Failed to parse user data from Google auth:", error);
         }
      }

      if (tokenParam) {
         // Fallback: fetch complete profile if only token is passed
         axios.get((import.meta.env.VITE_SERVER_DOMAIN || "") + "/get-current-user", {
            headers: {
               Authorization: `Bearer ${tokenParam}`
            }
         })
            .then(({ data }) => {
               storeInSession("user", JSON.stringify(data));
               setUserAuth(data);
               navigate("/");
            })
            .catch(() => {
               const userData = { access_token: tokenParam };
               storeInSession("user", JSON.stringify(userData));
               setUserAuth(userData);
               navigate("/");
            });
         return;
      }

      navigate("/sign-in");
   }, [searchParams, navigate, setUserAuth]);

   return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
         <div className="w-10 h-10 border-4 border-grey border-t-dark-grey rounded-full animate-spin"></div>
         <p className="text-dark-grey font-medium text-lg">Logging you in...</p>
      </div>
   );
};

export default AuthSuccess;
