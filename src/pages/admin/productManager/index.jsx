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
import { EditForm } from "./edit";
import { AddForm } from "./add";
import { useToggle } from "@/hooks/useToggle";
import { useNavigate } from "react-router-dom";

export default function ProductManager() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  const { data, loading, error, api: useProduct } = useAPI();
  const [request, setRequest] = useState({
    PageNumber: !isNaN(page) && page > 0 ? page : 1,
    PageSize: 10,
  });
  console.log(request);
  const [editingProduct, setEditingProduct] = useState(null);
  const { value: isModalOpen, toggle: toggleModal } = useToggle();
  const columns = [
    {
      title: "ID sản phẩm",
      dataIndex: "productId",
      key: "productId",
      sorter: (a, b) => a.productId - b.productId,
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
            onConfirm={() => handleDelete(data, record.productId)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const navigate = useNavigate();
  const handleDelete = async (data, id) => {
    try {
      const result = await useProduct("delete", `/product/${id}`);
      notification.success({
        message: result?.message,
      });
      const metadata = data?.metadata;
      console.log(metadata, id);
      const res = await useProduct(
        "get",
        `/product?PageNumber=${metadata?.pageNumber}&PageSize=${metadata?.pageSize}`,
      );
      console.log(res);
      if (res?.content?.length === 0) {
        navigate(`?page=${metadata?.pageNumber - 1}`);
      }
      navigate(0);
    } catch {
      console.error("Cập nhật thất bại:", error);
      notification.error({
        message: "Lỗi khi cập nhật sản phẩm!",
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  useEffect(() => {
    useProduct(
      "get",
      `/product?PageNumber=${request.PageNumber}&PageSize=${request.PageSize}`,
    );
  }, [useProduct, request]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", request.PageNumber.toString());

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [request]);

  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
    console.error(error);
  }

  const dataSource = Array.isArray(data?.content) ? data.content : [];

  const handlePageChange = (page, pageSize) => {
    setRequest((prev) => ({
      ...prev,
      PageNumber: page,
      PageSize: pageSize,
    }));
  };

  return (
    <>
      <AddForm data={data} />
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
      <EditForm
        open={isModalOpen}
        onClose={() => {
          toggleModal();
        }}
        product={editingProduct}
        onSuccess={() =>
          useProduct(
            "get",
            `/product?PageNumber=${request.PageNumber}&PageSize=${request.PageSize}`,
          )
        }
      />
    </>
  );
}
