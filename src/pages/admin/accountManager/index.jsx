import { Input, Pagination, Select, Space, Table, Tag } from "antd";
import React from "react";
import "./accountManager.css";

export default function AccountManager() {
   const columns = [
      {
         title: "Name",
         dataIndex: "name",
         key: "name",
         render: (text) => <a>{text}</a>,
      },
      {
         title: "Age",
         dataIndex: "age",
         key: "age",
      },
      {
         title: "Address",
         dataIndex: "address",
         key: "address",
      },
      {
         title: "Tags",
         key: "tags",
         dataIndex: "tags",
         render: (tags) => (
            <span>
               {tags.map((tag) => {
                  let color = tag.length > 5 ? "geekblue" : "green";
                  if (tag === "loser") {
                     color = "volcano";
                  }
                  return (
                     <Tag color={color} key={tag}>
                        {tag.toUpperCase()}
                     </Tag>
                  );
               })}
            </span>
         ),
      },
      {
         title: "Action",
         key: "action",
         render: (_, record) => (
            <Space size="middle">
               <a>Invite {record.name}</a>
               <a>Delete</a>
            </Space>
         ),
      },
   ];
   const data = [
      {
         key: "1",
         name: "John Brown",
         age: 32,
         address: "New York No. 1 Lake Park",
         tags: ["nice", "developer"],
      },
      {
         key: "2",
         name: "Jim Green",
         age: 42,
         address: "London No. 1 Lake Park",
         tags: ["loser"],
      },
      {
         key: "3",
         name: "Joe Black",
         age: 32,
         address: "Sydney No. 1 Lake Park",
         tags: ["cool", "teacher"],
      },
   ];
   return (
      <>
         {/* Tiêu đề và nút thêm tài khoản */}
         <div className="flex items-center justify-between mb-5">
            <h3 className="text-[24px] font-semibold">Tài khoản</h3>
         </div>

         {/* Tìm kiếm tài khoản */}
         <div
            id="search-account"
            className="flex gap-5 items-center justify-start mb-3"
         >
            <div className="flex gap-2 items-center">
               <p>Trạng thái</p>
               <Select
                  defaultValue="all"
                  style={{ width: 160 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },
                     {
                        value: true,
                        label: "Hoạt động",
                     },
                     {
                        value: false,
                        label: "Không hoạt động",
                     },
                  ]}
               />
            </div>
            <div className="flex gap-2 items-center">
               <p>Giới tính</p>
               <Select
                  defaultValue="all"
                  style={{ width: 100 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },
                     {
                        value: "MALE",
                        label: "Nam",
                     },
                     {
                        value: "FEMALE",
                        label: "Nữ",
                     },
                     {
                        value: "OTHER",
                        label: "Khác",
                     },
                  ]}
               />
            </div>
            <div>
               <Input.Search
                  placeholder="Tìm kiếm tài khoản"
                  className="w-[350px]"
               />
            </div>
         </div>

         {/* Bảng dữ liệu của tài khoản */}
         <div className="mb-4">
            <Table pagination={false} columns={columns} dataSource={data} />
         </div>

         {/* Phân trang */}
         <div className="page">
            <Pagination
               showSizeChanger
               showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
               }
               pageSizeOptions={[5, 10, 20, 50, 100]}
            />
         </div>
      </>
   );
}
