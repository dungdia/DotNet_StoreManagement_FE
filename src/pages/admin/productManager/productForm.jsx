import React, { useEffect, useState, useRef } from "react";
import { Input, Table, Tag, Modal, Button, Form, notification } from "antd";
import { useAPI } from "./useAPI";
import { useNavigate } from "react-router-dom";

export function ProductForm(props) {
  const [form] = Form.useForm();
  const { api, loading } = useAPI();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const fileInputRef = useRef(null);

  let product = props.product;

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await api("get", "/suppliers");
        setSupplier(data?.content || []);
      } catch (error) {
        notification.error({
          message: "Lỗi tải nhà cung cấp",
          description:
            error?.response?.data?.message || "Không thể tải danh sách NCC.",
        });
      }
    };
    fetchSupplier();
  }, [api]);

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

  useEffect(() => {
    if (props.type === "EDIT") {
      setImageFile(null);
      setPreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [props.type]);

  const columns = [
    { title: "ID công ty", dataIndex: "supplierId", key: "supplierId" },
    { title: "Tên công ty", dataIndex: "name", key: "name" },
  ];

  const productImgFn = () => {
    return localStorage.getItem("productImg") || product?.productImg || null;
  };

  const selectedSupplierFn = () => {
    if (selectedSupplier) return [selectedSupplier.supplierId];
    if (product) return [product.supplierId];
    return [];
  };

  const onFinish = async (values) => {
    const dataToSubmit = {
      ...values,
      productImg: productImgFn(),
      supplierId: selectedSupplier
        ? selectedSupplier.supplierId
        : product?.supplierId,
    };

    try {
      let result;
      if (props.type === "ADD") {
        result = await api("post", "/product", dataToSubmit);
      } else {
        result = await api(
          "put",
          `/product/${product.productId}`,
          dataToSubmit,
        );
      }

      if (
        !result?.statusCode ||
        result.statusCode < 200 ||
        result.statusCode >= 300
      ) {
        throw new Error(result?.message || "Unknown error");
      }

      notification.success({
        message: "Thành công",
        description: result?.message || "Đã lưu sản phẩm",
      });

      props.toggleModal();
      form.resetFields();
      localStorage.removeItem("productImg");

      props.onSuccess();

      if (props.type === "ADD") {
        const data = await api("get", "/product?PageNumber=1&PageSize=1");
        const lastPage =
          Math.ceil(data?.metadata?.totalPages / data?.metadata?.pageSize) || 1;
        navigate(`?page=${lastPage}`);
      }
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Lỗi khi lưu sản phẩm",
        description:
          err?.response?.data?.message || err.message || "Vui lòng thử lại.",
      });
    }
  };

  // 🧩 Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🧩 Upload image
  const onSaveImage = async () => {
    if (!imageFile) {
      notification.warning({ message: "Vui lòng chọn ảnh trước khi lưu" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const data = await api("post", "/image", formData);

      if (data.statusCode < 200 || data.statusCode >= 300) {
        notification.error({ message: data?.message || "Lỗi upload ảnh" });
        return;
      }

      notification.success({
        message: data?.message || "Đã lưu ảnh thành công",
      });
      localStorage.setItem("productImg", data?.content);
      setImageFile(null);
    } catch (error) {
      notification.error({
        message: "Upload thất bại",
        description:
          error?.response?.data?.message ||
          "Không thể tải ảnh, vui lòng thử lại.",
      });
    }
  };

  // 🧩 Remove selected image
  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    localStorage.removeItem("productImg");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name={props.name}
      onFinish={onFinish}
      validateTrigger="onSubmit"
    >
      {/* --- Product Fields --- */}
      <Form.Item
        label="Tên sản phẩm"
        name="productName"
        rules={[
          { required: true, message: "Vui lòng nhập tên sản phẩm" },
          { min: 3, max: 255, message: "Tên sản phẩm phải từ 3 đến 255 ký tự" },
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

      {/* --- Supplier --- */}
      <Form.Item label="Chọn nhà cung cấp">
        <Table
          columns={columns}
          dataSource={supplier}
          rowKey="supplierId"
          size="small"
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedSupplierFn(),
            onChange: (_, rows) => setSelectedSupplier(rows[0]),
          }}
        />
        {selectedSupplier && (
          <p>
            Đã chọn: <b>{selectedSupplier.name}</b>
          </p>
        )}
      </Form.Item>

      {/* --- Image Upload --- */}
      <Form.Item label="Ảnh sản phẩm" name="productImg">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {(preview || localStorage.getItem("productImg")) && (
            <img
              src={preview || localStorage.getItem("productImg")}
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

          {!localStorage.getItem("productImg") && (
            <Button onClick={onSaveImage} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu ảnh"}
            </Button>
          )}

          <Button onClick={clearImage} className="ml-2">
            Xoá ảnh
          </Button>
        </div>
      </Form.Item>

      {/* --- Action Buttons --- */}
      <Form.Item className="text-right">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button className="ml-2" onClick={props.toggleModal}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
}
