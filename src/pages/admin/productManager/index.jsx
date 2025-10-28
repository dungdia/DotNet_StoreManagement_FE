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
import { useAPI } from "./useAPI";
import { useToggle } from "@/hooks/useToggle";
import { ProductForm } from "./productForm";
import { useNavigate } from "react-router-dom";
import coca from "@/../public/coca.png";

export default function ProductManager() {
  const [params, setParams] = useState(
    () => new URLSearchParams(window.location.search),
  );
  const page = Number(params.get("page"));
  const { data, loading, error, api, setData } = useAPI();
  const [request, setRequest] = useState({
    PageNumber: !isNaN(page) && page > 0 ? page : 1,
    PageSize: 10,
  });
  console.log(request);
  const [editingProduct, setEditingProduct] = useState(null);
  const { value: isModalOpen, toggle: toggleModal } = useToggle();
  const navigate = useNavigate();
  const columns = [
    {
      title: "ID sản phẩm",
      dataIndex: "productId",
      key: "productId",
      sorter: (a, b) => a.productId - b.productId,
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "productImg",
      key: "imageUrl",
      render: (text, record) => (
        <img
          src={text ? text : coca}
          alt={record.productName}
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => price.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Mã vạch",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button>Xem</Button>

          <Button
            type="link"
            onClick={() => {
              setEditingProduct(record);
              toggleModal();
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc muốn xóa sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(data, record.productId, onSuccess)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [window.location.search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", request.PageNumber.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [request.PageNumber]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const page = Number(queryParams.get("page")) || 1;
    const pageSize = Number(queryParams.get("pageSize")) || 10;

    const fetchProducts = async () => {
      try {
        const queryString = queryParams.toString();
        const result = await api(
          "get",
          `/product?${queryString}&PageNumber=${page}&PageSize=${pageSize}`,
        );
        setData(result);
      } catch (err) {
        notification.error({
          message: "Lỗi tải sản phẩm",
          description: err?.response?.data?.message || "Vui lòng thử lại sau.",
        });
      }
    };

    fetchProducts();
  }, [request]);

  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">{error.message}</div>;
  }

  const dataSource = data?.content || [];

  const handlePageChange = (page, pageSize) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("page", page);
    newParams.set("pageSize", pageSize);
    window.history.replaceState(null, "", `?${newParams.toString()}`);

    setRequest({
      PageNumber: page,
      PageSize: pageSize,
    });
  };

  const handleDelete = async (data, id, onSuccess) => {
    try {
      const result = await api("delete", `/product/${id}`);
      notification.success({
        message: result?.message || "Xóa sản phẩm thành công!",
      });

      await onSuccess();

      const params = new URLSearchParams(window.location.search);
      const currentPage = Number(params.get("page")) || 1;
      const pageSize = Number(params.get("pageSize")) || 10;
      const totalPages = data?.metadata?.totalPages || 0;

      const prevPage = Math.ceil(totalPages / pageSize) - 1;
      if (currentPage > prevPage && prevPage > 0) {
        const newPage = Math.max(prevPage, 1);
        const newParams = new URLSearchParams(params);
        newParams.set("page", newPage);

        window.history.replaceState(null, "", `?${newParams.toString()}`);

        const queryString = newParams.toString();
        const refreshedData = await api(
          "get",
          `/product?${queryString}&PageNumber=${newPage}&PageSize=${pageSize}`,
        );
        setData(refreshedData);
      } else {
        await onSuccess();
      }
    } catch (error) {
      console.error("Xóa thất bại:", error);
      notification.error({
        message: "Lỗi khi xóa sản phẩm!",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  const onSuccess = async () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");

    const queryParams = new URLSearchParams();
    for (let [key, value] of params.entries()) {
      if (key !== "page") {
        queryParams.set(key, value);
      }
    }

    const data = await api(
      "get",
      `/product?${queryParams}&PageNumber=${page}&PageSize=${request.PageSize}`,
    );
    console.log(data);
    setData(data);
  };

  const addFormProps = {
    name: "Add Form",
    type: "ADD",
    data: data,
    onSuccess,
  };

  const editFormProps = {
    name: "Edit Form",
    type: "EDIT",
    isModalOpen,
    toggleModal,
    product: editingProduct,
    onSuccess,
  };

  const searchFormProps = {
    PageNumber: request.PageNumber,
    PageSize: request.PageSize,
    setData,
  };

  console.log("Debug", data);

  return (
    <>
      <div className="">
        <SearchForm {...searchFormProps} />
        <AddForm {...addFormProps} />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="productId"
        pagination={{
          current: data?.metadata?.pageNumber,
          pageSize: data?.metadata?.pageSize,
          total: data?.metadata?.totalPages,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        loading={loading}
      />
      <EditForm {...editFormProps} />
    </>
  );
}

export function SearchForm(props) {
  const [form] = Form.useForm();
  const { api, loading } = useAPI();

  const handleSearch = async (values) => {
    try {
      const params = new URLSearchParams(window.location.search);
      Object.entries(values).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.set(key, value.trim());
        } else {
          params.delete(key);
        }
      });
      params.set("page", 1);

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      window.history.replaceState(null, "", newUrl);

      const query = `/product?${params.toString()}&PageNumber=1&PageSize=10`;
      const result = await api("get", query);

      if (result?.content?.length === 0) {
        notification.info({
          message: "Không tìm thấy sản phẩm",
        });
      } else {
        notification.success({
          message: "Tìm kiếm thành công",
        });
      }

      props.setData(result);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Lỗi tìm kiếm",
        description:
          error?.response?.data?.message ||
          "Không thể tải dữ liệu, vui lòng thử lại.",
      });
    }
  };

  const handleReset = async () => {
    form.resetFields();

    const params = new URLSearchParams(window.location.search);
    const currentPage = Number(params.get("page")) || 1;

    const newParams = new URLSearchParams();
    newParams.set("page", currentPage);

    window.history.replaceState(null, "", `?${newParams.toString()}`);

    try {
      const result = await api(
        "get",
        `/product?PageNumber=${currentPage}&PageSize=10`,
      );

      props.setData(result);
      notification.info({
        message: `Đã hiển thị toàn bộ sản phẩm (trang ${currentPage})`,
      });
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    }
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset}>Reset</Button>
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
