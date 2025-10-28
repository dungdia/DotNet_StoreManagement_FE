import React, { useEffect, useState, useRef } from "react";
import { Input, Table, Tag, Modal, Button, Form, notification } from "antd";
import baseUrl from "@/api/instance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

async function fetchSuppliers() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const res = await baseUrl.get("/suppliers");
  return res.data;
}

export function ProductForm(props) {
  const [form] = Form.useForm();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();
  const supplierColumns = [
    { title: "ID công ty", dataIndex: "supplierId", key: "supplierId" },
    { title: "Tên công ty", dataIndex: "name", key: "name" },
  ];

  let product = props.product;
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        productName: product.productName,
        price: product.price,
        unit: product.unit,
        barcode: product.barcode,
      });
    }
  }, [props.product, form]);

  /* --- QUERY --- */
  const queryClient = useQueryClient();

  const {
    data: suppliers,
    isLoading,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const addProduct = useMutation({
    mutationFn: async (productDTO) => {
      const res = await baseUrl.post("/product", productDTO);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["products"]);
      notification.success({
        message: res?.message,
      });
      props.toggleModal();
    },
    onError: (err) => {
      console.log(err);
      notification.error({ message: "Lỗi khi thêm sản phẩm" });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, productDTO }) => {
      const res = await baseUrl.put(`/product/${productId}`, productDTO);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["products"]);
      notification.success({
        message: res?.message,
      });
      props.toggleModal();
    },
    onError: (err) => {
      console.log(err);
      notification.error({ message: "Lỗi khi sua sản phẩm" });
    },
  });
  /* --- HANDLER --- */
  const onFinish = async (values) => {
    const productDTO = {
      ...values,
      productImg: null,
      supplierId: selectedSupplier
        ? selectedSupplier.selectedSupplier
        : product.supplierId,
    };

    if (props.type === "ADD") {
      addProduct.mutate(productDTO);
    }
    if (props.type === "EDIT") {
      console.log(product.productId, productDTO);
      updateProduct.mutate({ productId: product.productId, productDTO });
    }
  };

  const handleSelectedSupplier = () => {
    if (selectedSupplier) return [selectedSupplier.supplierId];
    if (product) return [product.supplierId];
    return [];
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name={props.name}
      onFinish={onFinish}
      validateTrigger="onSubmit"
    >
      {product && (
        <>
          <label>Id: {product.productId}</label>
        </>
      )}

      {/* --- Product Fields --- */}
      <Form.Item
        label="Tên sản phẩm"
        name="productName"
        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Giá" name="price">
        <Input type="number" />
      </Form.Item>

      <Form.Item label="Đơn vị" name="unit">
        <Input />
      </Form.Item>

      <Form.Item label="Mã vạch" name="barcode">
        <Input />
      </Form.Item>

      {/* --- Supplier --- */}
      <Form.Item label="Chọn nhà cung cấp">
        <Table
          columns={supplierColumns}
          dataSource={suppliers?.content}
          rowKey="supplierId"
          size="small"
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: handleSelectedSupplier(),
            onChange: (_, rows) => setSelectedSupplier(rows[0]),
          }}
          loading={isLoading}
        />
        {selectedSupplier && (
          <p>
            Đã chọn: <b>{selectedSupplier.name}</b>
          </p>
        )}
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
