import React, { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import { Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function AdminLayout() {
   return (
      <div>
         <Header />
         <div className="flex ">
            <Menu />
            <div className="flex-1 p-6">
               <Outlet />
            </div>
         </div>
      </div>
   );
}
