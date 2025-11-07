import { Avatar, Button, Dropdown, Modal, message } from "antd";
import { Bell } from "lucide-react";
import { Logout } from "@/services/authService";
import "./header.css";
import { useNavigate } from "react-router-dom";

export default function Header() {
   const navigate = useNavigate();

   const confirmLogout = () => {
      Modal.confirm({
         title: "Xác nhận đăng xuất",
         content: "Bạn có chắc chắn muốn đăng xuất không?",
         okText: "Đăng xuất",
         cancelText: "Hủy",
         okType: "danger",
         onOk: async () => {
            await Logout();
            message.success("Đăng xuất thành công");
            navigate("/login");
         }
      })
   }
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
         label: (
            <Button type="link" onClick={confirmLogout}>Đăng xuất</Button>
         ),
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
