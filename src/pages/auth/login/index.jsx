import { Checkbox, Form, Input, Button, message } from "antd";
import "./login.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logged } from "@/services/authService";

export default function Login() {
   const navigate = useNavigate();
   // Tạo message API của Ant Design để hiển thị popup
   const [messageApi, contextHolder] = message.useMessage();

   const onFinish = async (values) => {
      try {
         const response = await Logged(values);
         console.log("Success:", response?.content?.access_token);

         // Hiển thị thông báo thành công rồi mới điều hướng
         messageApi.success({
            content: "Đăng nhập thành công",
            duration: 1.5,
            onClose: () => navigate("/admin"),
         });
      } catch (err) {
         messageApi.error({
            content: "Đăng nhập thất bại. Vui lòng thử lại!",
         });
      }
   };

   return (
      <>
         {contextHolder}
         <div
            id="auth-login"
            className="h-screen flex justify-center items-center"
         >
            <div className="w-[450px] border px-6 py-5 rounded-lg shadow-sm mb-[300px]">
               <header className="text-center font-semibold text-[24px] mb-6">
                  <h3>Đăng nhập để sử dụng hệ thống</h3>
               </header>

               <Form
                  onFinish={onFinish}
                  name="basic"
                  layout="vertical"
                  initialValues={{ remember: true }}
                  autoComplete="off"
               >
                  <Form.Item
                     hasFeedback
                     required={false}
                     label={
                        <span className="font-semibold">Tên người dùng</span>
                     }
                     name="Username"
                     rules={[
                        {
                           required: true,
                           message: "Tên người dùng không được để trống!",
                        },
                     ]}
                  >
                     <Input className="h-10" />
                  </Form.Item>

                  <Form.Item
                     hasFeedback
                     required={false}
                     label={<span className="font-semibold">Mật khẩu</span>}
                     name="password"
                     rules={[
                        {
                           regexp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                           message:
                              "Mật khẩu tối thiểu 6 ký tự, bao gồm chữ cái và số.",
                        },
                        {
                           required: true,
                           message: "Password không được để trống!",
                        },
                     ]}
                  >
                     <Input.Password className="h-10" />
                  </Form.Item>

                  <Form.Item>
                     <div className="text-center flex justify-between">
                        <Link className="text-[15px]">Quên mật khẩu</Link>
                        <div>
                           <Checkbox className="italic">Nhớ mật khẩu</Checkbox>
                        </div>
                     </div>
                  </Form.Item>

                  <Form.Item label={null}>
                     <Button
                        className="w-full h-10"
                        type="primary"
                        htmlType="submit"
                     >
                        Đăng nhập
                     </Button>
                  </Form.Item>
                  {/* <div className="flex justify-center">
                     <Link className="underline text-[16 px] font-semibold">
                        Đăng ký tài khoản
                     </Link>
                  </div> */}
               </Form>
            </div>
         </div>
      </>
   );
}
