import { Input, Pagination, Select, Space, Table, Tag, Button, message, Popconfirm } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./customerManager.css";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from "@/services/customerService";
import CustomerForm from "./CustomerForm";

export default function CustomerManager() {
   const queryClient = useQueryClient();
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(3);
   const [messageApi, contextHolder] = message.useMessage();

   // Tìm kiếm 1 ô duy nhất, áp dụng cho 5 trường: ID, Tên, SĐT, Địa chỉ, Email
   const [searchText, setSearchText] = useState("");
   const [appliedSearch, setAppliedSearch] = useState("");

   // Trình lấy dữ liệu tìm kiếm: thử tuần tự các field (tránh AND trên backend)
   const fetchSearchSequential = async (kw, pageNum, size) => {
      const keyword = (kw || "").trim();
      if (!keyword) return getCustomers({ PageNumber: pageNum, PageSize: size });

      const isDigits = /^\d+$/.test(keyword);

      // Helper thử một lần theo field
      const tryField = (field) => searchCustomers({ [field]: keyword, PageNumber: pageNum, PageSize: size });

      if (isDigits) {
         // Ưu tiên SĐT (thường 10 số). Nếu không có kết quả, fallback sang CustomerId
         const primary = keyword.length >= 9 ? "Phone" : "CustomerId";
         const secondary = primary === "Phone" ? "CustomerId" : "Phone";
         let res = await tryField(primary);
         if (!res?.total) {
            res = await tryField(secondary);
         }
         return res;
      }

      // Không phải số: ưu tiên heuristics -> Email nếu có '@', còn lại thử Name rồi Address
      const candidates = keyword.includes("@")
         ? ["Email", "Name", "Address"]
         : ["Name", "Email", "Address"];

      for (const field of candidates) {
         const res = await tryField(field);
         if (res?.total) return res;
      }
      // Không có gì khớp, trả về kết quả cuối cùng (rỗng)
      return tryField(candidates[candidates.length - 1]);
   };

   const { data, isLoading, isError } = useQuery({
      queryKey: ["customers", { page, pageSize, q: appliedSearch }],
      queryFn: () => fetchSearchSequential(appliedSearch, page, pageSize),
      keepPreviousData: true,
   });

   if (isError) {
      messageApi.error("Không thể tải danh sách khách hàng");
   }

   // Modal state cho Form thêm/sửa/xem
   const [formOpen, setFormOpen] = useState(false);
   const [formMode, setFormMode] = useState("create"); // 'create' | 'edit' | 'view'
   const [currentRecord, setCurrentRecord] = useState(null);

   // Tạo khách hàng
   const createMutation = useMutation({
      mutationFn: (values) => createCustomer(values),
      onSuccess: (data) => {
         messageApi.success(
            (data && (data.message || data?.statusMessage)) || "Thêm khách hàng thành công"
         );
         // Làm mới danh sách
         queryClient.invalidateQueries({ queryKey: ["customers"] });
         // Đóng form và reset state
         setFormOpen(false);
         setCurrentRecord(null);
         setFormMode("create");
      },
      onError: (err) => {
         const msg = err?.response?.data?.message || err?.message || "Thêm khách hàng thất bại";
         messageApi.error(msg);
      },
   });
   // Sửa thông tin khách hàng
   const updateMutation = useMutation({
      mutationFn: ({ id, values }) => updateCustomer(id, values),
      onSuccess: (data) => {
         messageApi.success(
            (data && (data.message || data?.statusMessage)) || "Cập nhật thông tin khách hàng thành công"
         );
         queryClient.invalidateQueries({ queryKey: ["customers"] });
         setFormOpen(false);
         setCurrentRecord(null);
         setFormMode("create");
      },
      onError: (err) => {
         const msg = err?.response?.data?.message || err?.message || "Cập nhật thông tin khách hàng thất bại";
         messageApi.error(msg);
      },
   });

   // Xoá khách hàng
   const [deletingId, setDeletingId] = useState(null);
   const deleteMutation = useMutation({
      mutationFn: (id) => deleteCustomer(id),
      onSuccess: (data) => {
         messageApi.success(
            (data && (data.message || data?.statusMessage)) || "Xoá khách hàng thành công"
         );
         queryClient.invalidateQueries({ queryKey: ["customers"] });
      },
      onError: (err) => {
         const msg = err?.response?.data?.message || err?.message || "Xoá khách hàng thất bại";
         messageApi.error(msg);
      },
      onSettled: () => setDeletingId(null),
   });
   // Handlers cho các nút hành động
   const handleView = (record) => {
      setCurrentRecord(record);
      setFormMode("view");
      setFormOpen(true);
   };
   const handleEdit = (record) => {
      setCurrentRecord(record);
      setFormMode("edit");
      setFormOpen(true);
   };
   const handleDelete = (record) => {
      const id = record?.customerId;
      if (!id) return;
      setDeletingId(id);
      deleteMutation.mutate(id);
   };
   const columns = [
      {
         title: "ID",
         dataIndex: "customerId",
         key: "customerId",
      },
      {
         title: "Tên khách hàng",
         dataIndex: "name",
         key: "name",
         // render: (text) => <a>{text}</a>,
      },
      {
         title: "Số điện thoại",
         dataIndex: "phone",
         key: "phone",
      },
      {
         title: "Địa chỉ",
         dataIndex: "address",
         key: "address",
      },
      {
         title: "Email",
         key: "email",
         dataIndex: "email",
         render: (email) => <a>{email}</a>,
      },
      {
         title: "Thao tác",
         key: "action",
         render: (_, record) => (
            <Space size="middle">
               <Button type="link" 
                  className="!text-black hover:!text-blue-500 p-0"
                  // style={{ color: "#000000", padding: 0 }}
                  icon={<EyeOutlined style={{ color: "#000000" }} />} 
                  onClick={() => handleView(record)}>
                  Chi tiết
               </Button>
               <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                  Sửa
               </Button>
               <Popconfirm
                  title="Bạn có chắc muốn xoá khách hàng này?"
                  okText="Xoá"
                  cancelText="Huỷ"
                  placement="topRight"
                  onConfirm={() => handleDelete(record)}
                  okButtonProps={{ loading: deleteMutation.isPending && deletingId === record.customerId }}
               >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                     Xoá
                  </Button>
               </Popconfirm>
            </Space>
         ),
      },
   ];
   const dataSource = useMemo(() => {
      const items = data?.items || [];
      return items.map((it) => ({ key: it.customerId, ...it }));
   }, [data]);
   const total = data?.total ?? dataSource.length;

   // Gom dữ liệu cache để kiểm tra xem SĐT/Email có trùng hay không
   const allCachedCustomers = useMemo(() => {
      const entries = queryClient.getQueriesData({ queryKey: ["customers"] });
      const merged = [];
      entries.forEach(([, val]) => {
         if (val?.items?.length) merged.push(...val.items);
      });
      return merged;
   }, [queryClient, data]);

   const existingPhones = useMemo(() => {
      const set = new Set();
      const currentId = currentRecord?.customerId ?? null;
      allCachedCustomers
         .filter((c) => c.customerId !== currentId)
         .forEach((c) => {
            const v = (c?.phone ?? "").toString().trim();
            if (v) set.add(v);
         });
      return set;
   }, [allCachedCustomers, currentRecord]);

   const existingEmails = useMemo(() => {
      const set = new Set();
      const currentId = currentRecord?.customerId ?? null;
      allCachedCustomers
         .filter((c) => c.customerId !== currentId)
         .forEach((c) => {
            const v = (c?.email ?? "").toString().trim().toLowerCase();
            if (v) set.add(v);
         });
      return set;
   }, [allCachedCustomers, currentRecord]);
   return (
      <>
         <div className="flex items-center justify-between mb-5">
            <h3 className="text-[24px] font-semibold">Khách hàng</h3>
         </div>

         {/* Tìm kiếm (1 ô) và thêm khách hàng */}
         <div id="search-customer" className="flex gap-3 items-center justify-start mb-3">
            <Input.Search
               allowClear
               placeholder="Tìm theo ID / Tên / SĐT / Địa chỉ / Email"
               className="w-[350px]"
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
               onSearch={(val) => {
                  setAppliedSearch(val || "");
                  setPage(1);
               }}
            />
            <Button type="primary" onClick={() => { setFormMode("create"); setCurrentRecord(null); setFormOpen(true); }}>
               Thêm khách hàng
            </Button>
         </div>

         {/* Bảng dữ liệu của khách hàng */}
         <div className="mb-4">
            {contextHolder}
            <Table
               rowKey="customerId"
               loading={isLoading}
               pagination={false}
               columns={columns}
               dataSource={dataSource}
            />
         </div>

         {/* Phân trang */}
         <div className="page">
            <Pagination
               showSizeChanger
               current={page}
               pageSize={pageSize}
               total={total}
               onChange={(p, ps) => {
                  setPage(p);
                  setPageSize(ps);
               }}
               showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} khách hàng`
               }
               pageSizeOptions={[3, 5, 10, 20, 50, 100]}
            />
         </div>

         {/* Modal Form: dùng cho thêm/sửa/xem */}
         <CustomerForm
            key={`${formMode}-${currentRecord?.customerId ?? 'new'}`}
            open={formOpen}
            mode={formMode}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            initialValues={formMode === "create" ? undefined : (currentRecord || undefined)}
            existingPhones={existingPhones}
            existingEmails={existingEmails}
            onCancel={() => {
               setFormOpen(false);
               // Clear state để lần mở thêm mới không bị dính dữ liệu cũ
               setCurrentRecord(null);
               setFormMode("create");
            }}
            onSubmit={(values) => {
               // Gọi API create/update theo formMode
               if (formMode === "create") {
                  createMutation.mutate(values);
               } else {
                  const id = currentRecord?.customerId;
                  if (!id) {
                     messageApi.error("Không tìm thấy ID khách hàng để cập nhật thông tin");
                     return;
                  }
                  updateMutation.mutate({ id, values });
               }
            }}
         />
      </>
   );
}
