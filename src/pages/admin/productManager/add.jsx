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
import { useNavigate } from "react-router-dom";

export function AddForm(props) {
  const { value: isModalOpen, toggle: toggleModal } = useToggle();
  const [form] = Form.useForm();
  const { loading, error, api: useProduct } = useAPI();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const dataToSubmit = { ...values, productImg: "null" };
    try {
      const result = await useProduct("post", "/product", dataToSubmit);
      console.log(result);
      notification.success({
        message: "Thêm sản phẩm thành công!",
        description: result?.message,
      });
      toggleModal();
      form.resetFields();
      console.log(props.data);
      const metadata = props.data?.metadata;
      if (props.data?.content?.length === metadata?.pageSize) {
        console.log("OK");
        navigate(
          `?page=${Math.floor(metadata?.totalPages / metadata?.pageSize) + 1}`,
        );
      }
      navigate(0);
    } catch (error) {
      console.error("Thêm sản phẩm thất bại!", error);
      notification.error({
        message: "Lỗi khi thêm sản phẩm!",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={toggleModal}>
        Add product
      </Button>

      <Modal
        title="Add Product"
        open={isModalOpen}
        onCancel={toggleModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          name="addProductForm"
          onFinish={onFinish}
          validateTrigger="onSubmit"
        >
          {/* --- Product Fields --- */}
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              {
                min: 3,
                max: 255,
                message: "Tên sản phẩm phải từ 3 đến 255 ký tự",
              },
            ]}
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
            rules={[
              { required: true, message: "Vui lòng nhập mã vạch" },
              { min: 3, max: 255, message: "Mã vạch phải từ 3 đến 255 ký tự" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* --- Category Selection --- */}
          {/* <Form.Item label="Chọn danh mục (Category)">
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              size="small"
              pagination={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys: others.selectedCategory
                  ? [others.selectedCategory.id]
                  : [],
                onChange: (_, selectedRows) =>
                  setOthers((prev) => ({
                    ...prev,
                    selectedCategory: selectedRows[0],
                  })),
              }}
            />
            <Pagination
              current={others.currentPage}
              total={categories.length}
              pageSize={pageSize}
              onChange={(page) =>
                setOthers((prev) => ({ ...prev, currentPage: page }))
              }
              style={{ marginTop: 8, textAlign: "center" }}
              size="small"
            />

            {others.selectedCategory && (
              <p style={{ marginTop: 8 }}>
                ✅ Đã chọn: <b>{others.selectedCategory.name}</b>
              </p>
            )}
          </Form.Item>*/}

          {/* --- Image Upload --- */}
          {/* <Form.Item
            label="Ảnh sản phẩm"
            name="productImg"
            rules={[{ required: true, message: "Vui lòng chọn ảnh sản phẩm" }]}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {others.preview && (
              <img
                src={others.preview}
                alt="Preview"
                style={{
                  marginTop: 10,
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            )}
          </Form.Item>*/}

          {/* --- Buttons --- */}
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button className="ml-2" onClick={toggleModal}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
