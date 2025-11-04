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
import coca from "@/../public/coca.png";

export const getColumns = (props) => [
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
        src={text || coca}
        alt={record.productName}
        style={{ width: 100, height: 100, objectFit: "cover" }}
      />
    ),
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "productName",
    key: "productName",
  },
  {
    title: "Giá",
    dataIndex: "price",
    key: "price",
    render: (price) => price.toLocaleString("vi-VN") + " VND",
  },
  {
    title: "Thao tác",
    key: "actions",
    fixed: "right",
    render: (_, record) => (
      <Space>
        <Button
          onClick={() => {
            props.setProductId(record.productId);
            props.toggleViewModal();
          }}
        >
          Xem
        </Button>

        <Button
          type="link"
          onClick={() => {
            props.setEditingProduct(record);
            props.toggleEditModal();
          }}
        >
          Sửa
        </Button>

        <Popconfirm
          title="Xóa sản phẩm?"
          description="Bạn có chắc muốn xóa sản phẩm này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => props.handleDelete(record.productId)}
        >
          <Button type="link" danger>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
