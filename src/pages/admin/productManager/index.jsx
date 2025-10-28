import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Modal,
  Button,
  Form,
  notification,
  Popconfirm,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useToggle } from "@/hooks/useToggle";
import { ProductForm } from "./productForm";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getColumns } from "./columns.jsx";
import baseUrl from "@/api/instance";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProductManager() {
  return (
    <>
      <ProductManagerLayout />
    </>
  );
}

function ProductManagerLayout() {
  const [globalParams, setGlobalParams] = useState(
    () => new URLSearchParams(window.location.search),
  );
  const [pagination, setPagination] = useState({
    pageNumber: Number(globalParams.get("PageNumber")) || 1,
    pageSize: Number(globalParams.get("PageSize")) || 10,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const { value: isModalOpen, toggle: toggleModal } = useToggle();
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: [
      "products",
      pagination.pageNumber,
      pagination.pageSize,
      globalParams.toString(),
    ],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!globalParams.toString()) {
        globalParams.set("PageNumber", pagination.pageNumber);
        globalParams.set("PageSize", pagination.pageSize);
      }
      console.log(globalParams.toString());

      const res = await baseUrl.get(`/product?${globalParams}`);
      return res.data;
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageNumber = Number(params.get("PageNumber")) || 1;
    const pageSize = Number(params.get("PageSize")) || 10;
    console.log("OK");
    setPagination({ pageNumber: pageNumber, pageSize: pageSize });
    setGlobalParams(params);
  }, [location.search]);

  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      const res = await baseUrl.delete(`/product/${productId}`);
      return res.data;
    },
    onError: (err) => {
      console.log(err);
      notification.error({ message: "Lỗi khi xoa sản phẩm" });
    },
  });

  const addFormProps = {
    name: "Add Form",
    type: "ADD",
    data: products,
  };

  const editFormProps = {
    name: `Edit Form`,
    type: "EDIT",
    isModalOpen,
    toggleModal,
    product: editingProduct,
  };

  const searchFormProps = {
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
  };

  const handlePageChange = (page, pageSize) => {
    const filteredParams = new URLSearchParams();
    for (let [key, value] of globalParams.entries()) {
      if (key !== "PageNumber" && key !== "PageSize") {
        filteredParams.set(key, value);
      }
    }

    filteredParams.set("PageNumber", page);
    filteredParams.set("PageSize", pageSize);

    navigate(`?${filteredParams}`);
  };

  const handleDelete = async (id) => {
    console.log(id);
    deleteProduct.mutate(id, {
      onSuccess: (res) => {
        notification.success({ message: res?.message });
        queryClient.invalidateQueries(["products"]);

        if (products?.content.length === 1 && pagination.pageNumber > 1) {
          const prevPage = pagination.pageNumber - 1;
          const newParams = new URLSearchParams(window.location.search);
          newParams.set("PageNumber", prevPage);
          navigate(`?${newParams.toString()}`);
        }
      },
    });
  };

  const columns = getColumns({
    products,
    setEditingProduct,
    toggleModal,
    handleDelete,
  });

  return (
    <>
      <SearchForm {...searchFormProps} />
      <AddForm {...addFormProps} />
      <Table
        columns={columns}
        dataSource={products?.content}
        rowKey="productId"
        pagination={{
          current: products?.metadata?.pageNumber,
          pageSize: products?.metadata?.pageSize,
          total: products?.metadata?.totalPages,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        loading={isLoading}
      />
      <EditForm {...editFormProps} />
    </>
  );
}

export function SearchForm(props) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (values) => {
    const params = new URLSearchParams(location.search);
    Object.entries(values).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });
    params.set("PageNumber", "1");
    navigate(`?${params.toString()}`);
  };

  return (
    <Form
      form={form}
      layout="inline"
      name="searchForm"
      onFinish={handleSearch}
      className="mb-4"
    >
      <Form.Item label="Tên sản phẩm" name="ProductName">
        <Input
          placeholder="Nhập tên sản phẩm..."
          allowClear
          prefix={<SearchOutlined />}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
          {/* <Button onClick={handleReset}>Reset</Button>*/}
        </Space>
      </Form.Item>
    </Form>
  );
}

export function AddForm(props) {
  const { value: isModalOpen, toggle: toggleModal } = useToggle();

  const productFormProps = {
    ...props,
    toggleModal,
  };

  return (
    <>
      <>
        <Button type="primary" onClick={toggleModal}>
          Add product
        </Button>
      </>

      <Modal
        title="Add Product"
        open={isModalOpen}
        onCancel={toggleModal}
        footer={null}
      >
        <ProductForm {...productFormProps} />
      </Modal>
    </>
  );
}

export function EditForm(props) {
  return (
    <>
      <Modal
        title="Edit Product"
        open={props.isModalOpen}
        onCancel={props.toggleModal}
        footer={null}
      >
        <ProductForm {...props} />
      </Modal>
    </>
  );
}
