import baseUrl from "@/api/instance";

const Logged = async (values) => {
   const response = await baseUrl.post("/login", values);
   return response.data;
};



export { Logged };
