import { createBrowserRouter, Navigate } from "react-router-dom";

import React from "react";
import LazyLoadComponent from "@/components/base/LazyLoadComponent";

// Tải bằng lazy load
// Các route liên quan tới trang admin
const AdminLayout = React.lazy(() => import("@/layouts/admin/AdminLayout"));
const StatisticManager = React.lazy(() =>
   import("@/pages/admin/statisticManager")
);
const AccountManager = React.lazy(() => import("@/pages/admin/accountManager"));
const ProductManager = React.lazy(() => import("@/pages/admin/productManager"));
const CustomerManager = React.lazy(() =>
   import("@/pages/admin/customerManager")
);
const SupplierManager = React.lazy(() =>
   import("@/pages/admin/supplierManager")
);
const OrderManager = React.lazy(() => import("@/pages/admin/orderManager"));
const InventoryManager = React.lazy(() =>
   import("@/pages/admin/inventoryManager")
);
const PromotionManager = React.lazy(() =>
   import("@/pages/admin/promotionManager")
);
const PaymentManager = React.lazy(() => import("@/pages/admin/paymentManager"));
const NotFound = React.lazy(() => import("@/pages/admin/notFound"));

// Các route liên quan tới trang user
const UserLayout = React.lazy(() => import("@/layouts/user/UserLayout"));

// Các route liên quan tới đăng nhập và đăng xuất
const Login = React.lazy(() => import("@/pages/auth/login"));
const Register = React.lazy(() => import("@/pages/auth/register"));

const routes = createBrowserRouter([
   {
      path: "/",
      element: <Navigate to="/login" />, // Khi truy cập vào URL gốc, chuyển hướng đến trang login
   },
   {
      path: "/login",
      element: (
         <LazyLoadComponent>
            <Login />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/register",
      element: (
         <LazyLoadComponent>
            <Register />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/user",
      element: (
         <LazyLoadComponent>
            <UserLayout />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/admin",
      element: (
         <LazyLoadComponent>
            <AdminLayout />
         </LazyLoadComponent>
      ),
      children: [
         {
            // path: "statistic-manager",
            index: true, // mặc định khi vào /admin sẽ hiển thị trang thống kê
            element: (
               <LazyLoadComponent>
                  <StatisticManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "account-manager",
            element: (
               <LazyLoadComponent>
                  <AccountManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "product-manager",
            element: (
               <LazyLoadComponent>
                  <ProductManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "customer-manager",
            element: (
               <LazyLoadComponent>
                  <CustomerManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "supplier-manager",
            element: (
               <LazyLoadComponent>
                  <SupplierManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "order-manager",
            element: (
               <LazyLoadComponent>
                  <OrderManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "inventory-manager",
            element: (
               <LazyLoadComponent>
                  <InventoryManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "promotion-manager",
            element: (
               <LazyLoadComponent>
                  <PromotionManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "payment-manager",
            element: (
               <LazyLoadComponent>
                  <PaymentManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "*",
            element: (
               <LazyLoadComponent>
                  <NotFound />
               </LazyLoadComponent>
            ),
         },
      ],
   },
]);

export default routes;
