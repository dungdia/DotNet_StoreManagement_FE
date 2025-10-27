import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Modal,
  Button,
  Form,
  notification,
  Popconfirm,
} from "antd";
import { useAPI } from "./useAPI";
import { useToggle } from "@/hooks/useToggle";

export function EditForm({ open, onClose, product, onSuccess }) {
  const [form] = Form.useForm();
  const { api: useProduct } = useAPI();

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        productName: product.productName,
        price: product.price,
        unit: product.unit,
        barcode: product.barcode,
      });
    }
  }, [product, form]);

  const onFinish = async (values) => {
    const dataToSubmit = { ...values, productImg: "null" };
    try {
      const result = await useProduct(
        "put",
        `/product/${product.productId}`,
        dataToSubmit,
      );
      notification.success({
        message: result?.message,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      notification.error({
        message: "Lỗi khi cập nhật sản phẩm!",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa sản phẩm: ${product?.productId}`}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        validateTrigger="onSubmit"
      >
        <Form.Item
          label="Tên sản phẩm"
          name="productName"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Đơn vị"
          name="unit"
          rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã vạch"
          name="barcode"
          rules={[{ required: true, message: "Vui lòng nhập mã vạch" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit">
            Lưu thay đổi
          </Button>
          <Button className="ml-2" onClick={onClose}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
