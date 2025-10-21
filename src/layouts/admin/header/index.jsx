import { Avatar, Dropdown} from "antd";
import { Bell } from "lucide-react";
import "./header.css";

export default function Header() {
   const items = [
      {
         label: (
            <a
               href="https://www.antgroup.com"
               target="_blank"
               rel="noopener noreferrer"
            >
               1st menu item
            </a>
         ),
         key: "0",
      },
      {
         label: (
            <a
               href="https://www.aliyun.com"
               target="_blank"
               rel="noopener noreferrer"
            >
               2nd menu item
            </a>
         ),
         key: "1",
      },
      {
         type: "divider",
      },
      {
         label: "3rd menu item",
         key: "3",
      },
   ];
   return (
      <>
         {/* Giao diện chính */}
         <header
            id="admin-header"
            className="w-full h-16 bg-slate-400 flex justify-between items-center px-12"
         >
            <h2>Logo</h2>
            <div className="flex items-center gap-5">
               <Bell className="cursor-pointer text-white" />
               <Dropdown
                  className="cursor-pointer"
                  placement="bottomLeft"
                  arrow={{ pointAtCenter: false }}
                  menu={{
                     items,
                  }}
                  trigger={["click"]}
               >
                  <Avatar className="ant-avatar">CC</Avatar>
               </Dropdown>
            </div>
         </header>
      </>
   );
}
