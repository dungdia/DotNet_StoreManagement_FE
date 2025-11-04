import React, { useEffect, useState, useRef } from 'react';
import { Input, Table, Tag, Modal, Button, Form, notification } from 'antd';
import baseUrl from '@/api/instance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

async function fetchSuppliers() {
  await new Promise(resolve => setTimeout(resolve, 500));
  const res = await baseUrl.get('/suppliers');
  return res.data;
}

export function ProductForm(props) {
  const [form] = Form.useForm();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();
  const supplierColumns = [
    { title: 'ID công ty', dataIndex: 'supplierId', key: 'supplierId' },
    { title: 'Tên công ty', dataIndex: 'name', key: 'name' },
  ];

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    localStorage.removeItem('productImg');
  };

  /* --- QUERY --- */
  const queryClient = useQueryClient();

  const {
    data: suppliers,
    isLoading,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });

  const addProduct = useMutation({
    mutationFn: async productDTO => {
      const res = await baseUrl.post('/product', productDTO);
      return res.data;
    },
    onSuccess: res => {
      queryClient.invalidateQueries(['products']);
      notification.success({
        message: res?.message,
      });
      props.toggleModal();
      form.resetFields();
      clearImage();
      setSelectedSupplier(null);
    },
    onError: err => {
      console.log(err.response.data.message);
      notification.error({
        message: err.response.data.message,
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, productDTO }) => {
      const res = await baseUrl.put(`/product/${productId}`, productDTO);
      return res.data;
    },
    onSuccess: res => {
      queryClient.invalidateQueries(['products']);
      notification.success({
        message: res?.message,
      });
      props.toggleEditModal();
      clearImage();
    },
    onError: err => {
      console.log(err);
      notification.error({ message: 'Lỗi khi sua sản phẩm' });
    },
  });
  /* --- HANDLER --- */
  // const handleImage = () => {
  //   return localStorage.getItem('productImg') || null;
  // };

  const onFinish = async values => {
    const productDTO = {
      ...values,
      productImg: localStorage.getItem('productImg') || null,
      supplierId: selectedSupplier
        ? selectedSupplier.supplierId
        : product.supplierId,
    };

    console.log(productDTO, selectedSupplier);

    if (props.type === 'ADD') {
      addProduct.mutate(productDTO);
    }
    if (props.type === 'EDIT') {
      console.log(product.productId, productDTO);
      updateProduct.mutate({ productId: product.productId, productDTO });
    }
  };

  const handleSelectedSupplier = () => {
    if (selectedSupplier) return [selectedSupplier.supplierId];
    if (product) return [product.supplierId];
    return [];
  };

  /* --- IMAGE --- */
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = useMutation({
    mutationFn: async ({ formData }) => {
      const res = await baseUrl.post('/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: res => {
      notification.success({
        message: res?.message,
      });
      localStorage.setItem('productImg', res?.content);
      setImageFile(null);
    },
    onError: err => {
      console.log(err);
      notification.error({ message: 'Lỗi khi sua sản phẩm' });
    },
  });
  const { isPending, isSuccess, isError } = uploadImage;

  const onSaveImage = async () => {
    if (!imageFile) {
      notification.warning({ message: 'Vui lòng chọn ảnh trước khi lưu' });
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    uploadImage.mutate({ formData });
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
        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
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
            type: 'radio',
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

      {/* --- Image Upload --- */}
      <Form.Item label="Ảnh sản phẩm" name="productImg">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {(preview || localStorage.getItem('productImg')) && (
            <img
              src={preview || localStorage.getItem('productImg')}
              alt="Preview"
              style={{
                marginTop: 10,
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #ddd',
              }}
            />
          )}

          {!localStorage.getItem('productImg') && (
            <Button onClick={onSaveImage} loading={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu ảnh'}
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
        <Button className="ml-2" onClick={props.toggleViewModal}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
}
