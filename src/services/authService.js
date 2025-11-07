import baseUrl from "@/api/instance";
import Cookies from "js-cookie";

const Logged = async (values) => {
   const response = await baseUrl.post("/login", values);
   return response.data;
};

const Logout = async () => {
   Cookies.remove("accessToken");
   return true;
}

export { Logged, Logout };
