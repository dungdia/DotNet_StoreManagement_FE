import baseUrl from "@/api/instance";

// Gọi API lấy danh sách khách hàng
export const getCustomers = async ({ PageNumber = 1, PageSize = 10 } = {}) => {
  const res = await baseUrl.get("/Customer", { params: { PageNumber, PageSize } });
  const data = res?.data ?? {};

  // Mảng dữ liệu khách hàng
  const items = Array.isArray(data?.content) ? data.content : [];

  // Metadata phân trang từ backend
  const meta = data?.metadata ?? {};
  const pageSize = Number(meta.pageSize ?? PageSize) || PageSize;

  // AntD Pagination cần 'total' = tổng số bản ghi thực tế.
  let total = Number(
    data?.total ?? meta.total ?? meta.totalCount ?? meta.totalItems ?? meta.totalPages
  );
  if (!Number.isFinite(total)) {
    total = items.length;
  }

  return { items, total, meta, raw: data };
};

// Tạo khách hàng
export const createCustomer = async (values) => {
  const res = await baseUrl.post("/Customer", values);
  return res?.data ?? null;
};

// Cập nhật khách hàng
export const updateCustomer = async (id, values) => {
  const body = {
    name: values?.name,
    phone: values?.phone,
    email: values?.email,
    address: values?.address,
  };
  const res = await baseUrl.put(`/Customer/${id}`, body);
  return res?.data ?? null;
};

export const deleteCustomer = async (id) => {
  const res = await baseUrl.delete(`/Customer/${id}`);
  return res?.data ?? null;
}

// Tìm kiếm khách hàng với nhiều tham số (tất cả đều optional)
export const searchCustomers = async (params = {}) => {
  const {
    CustomerId,
    Name,
    Phone,
    Email,
    Address,
    CreatedAt,
    OrderBy,
    SortBy,
    PageNumber = 1,
    PageSize = 10,
  } = params;

  // Chỉ gửi các tham số có giá trị (loại bỏ rỗng/undefined)
  const query = {};
  if (CustomerId) query.CustomerId = CustomerId;
  if (Name) query.Name = Name;
  if (Phone) query.Phone = Phone;
  if (Email) query.Email = Email;
  if (Address) query.Address = Address;
  if (CreatedAt) query.CreatedAt = CreatedAt;
  if (OrderBy) query.OrderBy = OrderBy;
  if (SortBy) query.SortBy = SortBy;
  query.PageNumber = PageNumber;
  query.PageSize = PageSize;

  const res = await baseUrl.get("/Customer/Search", { params: query });
  const data = res?.data ?? {};
  const items = Array.isArray(data?.content) ? data.content : [];
  const meta = data?.metadata ?? {};
  let total = Number(
    data?.total ?? meta.total ?? meta.totalCount ?? meta.totalItems ?? meta.totalPages
  );
  if (!Number.isFinite(total)) total = items.length;
  return { items, total, meta, raw: data };
};

export default { getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers };
