import React, { useEffect, useState } from 'react';
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
  Slider,
  Spin,
  DatePicker,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useToggle } from '@/hooks/useToggle';
import { ProductForm } from './productForm';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getColumns } from './columns.jsx';
import baseUrl from '@/api/instance';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchForm } from './searchForm';
import dayjs from 'dayjs';

export default function ProductManager() {
  return (
    <>
      <ProductManagerLayout />
    </>
  );
}

/*
  author:
  description: kéo dữ liệu từ server
*/
export async function fetchProducts(globalParams, pagination) {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!globalParams.toString()) {
    globalParams.set('PageNumber', pagination.pageNumber);
    globalParams.set('PageSize', pagination.pageSize);
  }
  console.log(globalParams.toString());

  const res = await baseUrl.get(`/product?${globalParams}`);
  return res.data;
}

/**
 * author:
 * description:
 */
function ProductManagerLayout() {
  const [globalParams, setGlobalParams] = useState(
    () => new URLSearchParams(window.location.search),
  );
  const [pagination, setPagination] = useState({
    pageNumber: Number(globalParams.get('PageNumber')) || 1,
    pageSize: Number(globalParams.get('PageSize')) || 10,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const navigate = useNavigate();

  const { value: isEditModalOpen, toggle: toggleEditModal } = useToggle();
  const { value: isViewModalOpen, toggle: toggleViewModal } = useToggle();

  /**
   * author:
   * description:
   */
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: [
      'products',
      pagination.pageNumber,
      pagination.pageSize,
      globalParams.toString(),
    ],
    queryFn: () => fetchProducts(globalParams, pagination),
  });

  /**
   * author:
   * description:
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageNumber = Number(params.get('PageNumber')) || 1;
    const pageSize = Number(params.get('PageSize')) || 10;
    console.log('OK');
    setPagination({ pageNumber: pageNumber, pageSize: pageSize });
    setGlobalParams(params);
  }, [location.search]);

  /**
   * author:
   * description:
   */
  const handlePageChange = (page, pageSize) => {
    const filteredParams = new URLSearchParams();
    for (let [key, value] of globalParams.entries()) {
      if (key !== 'PageNumber' && key !== 'PageSize') {
        filteredParams.set(key, value);
      }
    }

    filteredParams.set('PageNumber', page);
    filteredParams.set('PageSize', pageSize);

    navigate(`?${filteredParams}`);
  };

  const handleDelete = async id => {
    console.log(id);
    deleteProduct.mutate(id);
  };

  const deleteProduct = useMutation({
    mutationFn: async productId => {
      const res = await baseUrl.delete(`/product/${productId}`);
      return res.data;
    },
    onSuccess: res => {
      notification.success({ message: res?.message });
      queryClient.invalidateQueries(['products']);

      if (products?.content.length === 1 && pagination.pageNumber > 1) {
        const prevPage = pagination.pageNumber - 1;
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('PageNumber', prevPage);
        navigate(`?${newParams.toString()}`);
      }
    },
    onError: err => {
      console.log(err);
      notification.error({ message: 'Lỗi khi xoa sản phẩm' });
    },
  });

  // Init props
  const searchFormProps = {
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
  };

  const addFormProps = {
    name: 'Add Form',
    type: 'ADD',
    data: products,
  };

  const editFormProps = {
    name: `Edit Form`,
    type: 'EDIT',
    isEditModalOpen,
    toggleEditModal,
    product: editingProduct,
  };

  const viewFormProps = {
    name: `View Form`,
    type: 'VIEW',
    productId: productId,
    isViewModalOpen,
    toggleViewModal,
  };

  const columns = getColumns({
    products,
    setEditingProduct,
    setProductId,
    toggleEditModal,
    toggleViewModal,
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
          pageSizeOptions: ['5', '10', '20', '50'],
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        loading={isLoading}
      />
      <ViewForm {...viewFormProps} />
      <EditForm {...editFormProps} />
    </>
  );
}

export function ViewForm(props) {
  return (
    <>
      <Modal
        width={1200}
        title={props.name}
        open={props.isViewModalOpen}
        onCancel={props.toggleViewModal}
        footer={null}
      >
        <ViewProduct {...props} />
      </Modal>
    </>
  );
}

async function fetchProductDetail(productId) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const res = await baseUrl.get(`/product/${productId}`);
  return res.data;
}

function ViewProduct(props) {
  const [form] = Form.useForm();
  const [date, setDate] = useState(null);

  const { data, isLoading: isLoading } = useQuery({
    queryKey: ['productsDetail', props.productId],
    queryFn: () => fetchProductDetail(props.productId),
  });

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center">
          <Spin className="" />;
        </div>
      </>
    );
  }

  console.log(data);

  return (
    <>
      <Table dataSource={[data?.content]} rowKey="productId" pagination={false}>
        <Table.Column
          title="Tên sản phẩm"
          key="productName"
          dataIndex="productName"
        />
        <Table.Column title="Giá" key="price" dataIndex="price" />
        <Table.Column title="Đơn vị" key="unit" dataIndex="unit" />
        <Table.Column title="Mã vạch" key="barcode" dataIndex="barcode" />
        <Table.Column title="Ngày tạo" key="createdAt" dataIndex="createdAt" />
        <Table.Column
          title="Tên nhà cung cấp"
          key="supplierName"
          dataIndex={['supplier', 'name']}
        />
        <Table.Column
          title="Tên nhà cung cấp"
          key="supplierAdress"
          dataIndex={['supplier', 'address']}
        />
      </Table>
    </>
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
        open={props.isEditModalOpen}
        onCancel={props.toggleEditModal}
        footer={null}
      >
        <ProductForm {...props} />
      </Modal>
    </>
  );
}
