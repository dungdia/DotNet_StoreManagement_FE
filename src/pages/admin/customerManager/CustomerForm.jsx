import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

/**
 * Props:
 * - open: boolean
 * - mode: 'create' | 'edit' | 'view'
 * - title?: string (fallback computed by mode)
 * - initialValues?: { customerId?, name, phone, email, address, createdAt? }
 * - onCancel?: () => void
 * - onSubmit?: (values) => void
 * - confirmLoading?: boolean // hiển thị trạng thái loading khi nhấn nút submit để tránh spam
 */
export default function CustomerForm({
  open,
  mode = "create",
  title,
  initialValues,
  onCancel,
  onSubmit,
  confirmLoading,
  existingPhones = new Set(),
  existingEmails = new Set(),
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  const isView = mode === "view";
    // Định dạng "giờ:phút:giây ngày/tháng/năm" cho ngày tạo khách hàng
    const formatDateTime = (input) => {
      if (!input) return "";
      const d = new Date(input);
      if (isNaN(d)) return String(input);
      const pad = (n) => String(n).padStart(2, "0");
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      const DD = pad(d.getDate());
      const MM = pad(d.getMonth() + 1);
      const YYYY = d.getFullYear();
      return `${hh}:${mm}:${ss} ${DD}/${MM}/${YYYY}`;
    };
  const computedTitle =
    title || (mode === "create" ? "Thêm khách hàng mới" : mode === "edit" ? "Sửa thông tin khách hàng" : "Chi tiết khách hàng");

  const handleOk = async () => {
    if (isView) {
      onCancel?.();
      return;
    }
    try {
      const values = await form.validateFields();
      onSubmit?.(values);
    } catch (_) {
      // antd shows validation errors
    }
  };

  return (
    <Modal
      open={open}
      title={computedTitle}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={!!confirmLoading} // Prop confirmLoading của Ant Design Modal cần trả về boolean
      // !! đảm bảo chỉ có true hoặc false được truyền vào.
      okText={isView ? "Đóng" : "Lưu"}
      cancelButtonProps={{ style: { display: isView ? "none" : undefined } }}
      destroyOnClose
      maskClosable={!isView}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {/* ID hiển thị khi xem/sửa */}
        {(initialValues?.customerId || mode !== "create") && (
          <Form.Item label="ID" name="customerId">
            <Input disabled />
          </Form.Item>
        )}

        {/* Ngày tạo chỉ hiển thị ở chế độ xem chi tiết */}
        {mode !== "create" && (
          <Form.Item label="Ngày tạo">
            <Input disabled value={formatDateTime(initialValues?.createdAt)} />
          </Form.Item>
        )}

        <Form.Item
          label={<span className="font-semibold">Tên khách hàng</span>}
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên khách hàng" },
            { min: 3, message: "Tên khách hàng phải có ít nhất 3 ký tự" },
          ]}
        >
          <Input disabled={isView} placeholder="Nhập tên khách hàng" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">Số điện thoại</span>}
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { pattern: /^\d{9,11}$/, message: "Số điện thoại không hợp lệ" },
            () => ({
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const v = String(value).trim();
                if (!v) return Promise.resolve();
                if (existingPhones && existingPhones.has(v)) {
                  return Promise.reject(new Error("Số điện thoại đã tồn tại"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input disabled={isView} placeholder="VD: 0909xxxxxx" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">Email</span>}
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
            () => ({
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const v = String(value).trim().toLowerCase();
                if (!v) return Promise.resolve();
                if (existingEmails && existingEmails.has(v)) {
                  return Promise.reject(new Error("Email đã tồn tại"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input disabled={isView} placeholder="name@example.com" />
        </Form.Item>

        <Form.Item  
            label={<span className="font-semibold">Địa chỉ</span>}
            name="address"
            rules={[
                { required: true, message: "Vui lòng nhập địa chỉ" },
                { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự" },
            ]}
            >
          <Input disabled={isView} placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
