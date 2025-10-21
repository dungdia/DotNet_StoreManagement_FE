import { NavLink, useLocation } from "react-router-dom";
import "./menu.css";
import { useState } from "react";
import {
   CarOutlined,
   ControlOutlined,
   CreditCardOutlined,
   CustomerServiceOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   OrderedListOutlined,
   PercentageOutlined,
   ProductOutlined,
   ShopOutlined,
   SolutionOutlined,
   StockOutlined,
   UsergroupAddOutlined,
   UserOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";

export default function MenuAdmin() {
   const [collapsed, setCollapsed] = useState(false);
   const location = useLocation();
   const items = [
      {
         key: "1",
         icon: <ControlOutlined />,
         label: (
            <NavLink end to="/admin">
               <span>Thống kê</span>
            </NavLink>
         ),
      },
      {
         key: "2",
         icon: <UsergroupAddOutlined />,
         label: (
            <NavLink to="/admin/account-manager">
               <span> Quản lý tài khoản</span>
            </NavLink>
         ),
      },
      {
         key: "3",
         icon: <ProductOutlined />,

         label: (
            <NavLink to="/admin/product-manager">
               <span> Quản lý sản phẩm</span>
            </NavLink>
         ),
      },
      {
         key: "4",
         icon: <UserOutlined />,
         label: (
            <NavLink to="/admin/customer-manager">
               <span> Quản lý khách hàng</span>
            </NavLink>
         ),
      },
      {
         key: "5",
         icon: <ShopOutlined />,
         label: (
            <NavLink to="/admin/supplier-manager">
               <span> Quản lý nhà cung cấp</span>
            </NavLink>
         ),
      },
      {
         key: "6",
         icon: <OrderedListOutlined />,
         label: (
            <NavLink to="/admin/order-manager">
               <span> Quản lý đơn hàng</span>
            </NavLink>
         ),
      },
      {
         key: "7",
         icon: <StockOutlined />,
         label: (
            <NavLink to="/admin/inventory-manager">
               <span> Quản lý hàng tồn kho</span>
            </NavLink>
         ),
      },
      {
         key: "8",
         icon: <PercentageOutlined />,
         label: (
            <NavLink to="/admin/promotion-manager">
               <span> Quản lý khuyến mãi</span>
            </NavLink>
         ),
      },
      {
         key: "9",
         icon: <CreditCardOutlined />,
         label: (
            <NavLink to="/admin/payment-manager">
               <span> Quản lý thanh toán</span>
            </NavLink>
         ),
      },
   ];

   const toggleCollapsed = () => {
      setCollapsed(!collapsed);
   };
   const menuWidth = collapsed ? "80px" : "241px";

   // Xác định khóa được chọn mặc định dựa trên đường dẫn hiện tại
   const getDefaultKey = () => {
      const routeToKeyMap = {
         "/admin": "1",
         "/admin/account-manager": "2",
         "/admin/product-manager": "3",
         "/admin/customer-manager": "4",
         "/admin/supplier-manager": "5",
         "/admin/order-manager": "6",
         "/admin/inventory-manager": "7",
         "/admin/promotion-manager": "8",
         "/admin/payment-manager": "9",
      };
      return routeToKeyMap[location.pathname] || "1";
   };

   return (
      <>
         <menu
            id="admin-menu"
            style={{ width: menuWidth }}
            className="w-fit bg-[#001529] min-h-screen text-white flex flex-col items-start transition-all duration-300 ease-out"
         >
            <div className="mb-3">
               <Menu
                  className="custom-admin-menu "
                  defaultSelectedKeys={[getDefaultKey()]}
                  mode="inline"
                  theme="dark"
                  inlineCollapsed={collapsed}
                  items={items}
               />
            </div>
            <Button
               className="bottom-4 left-4 z-20"
               type="primary"
               onClick={toggleCollapsed}
               style={{
                  marginBottom: 16,
               }}
            >
               {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
         </menu>
      </>
   );
}
