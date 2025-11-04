import { SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import {
  Input,
  Table,
  Tag,
  Modal,
  Button,
  Form,
  notification,
  Slider,
  Space,
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

export function SearchForm(props) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [price, setPrice] = useState([1000, 1000]);

  const handleSearch = values => {
    const [min, max] = price;

    const params = new URLSearchParams(location.search);

    params.set('PageNumber', '1');
    params.set('PageSize', '10');

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim() !== '') {
        params.set(key, value.trim());
      } else if (key === 'PriceRange') {
        if (min === 1000 && max === 1000) {
          params.delete('MinPrice');
          params.delete('MaxPrice');
        } else {
          params.set('MinPrice', min);
          params.set('MaxPrice', max);
        }
      } else {
        params.delete(key);
      }
    });

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

      <Form.Item label="Khoảng giá" name="PriceRange">
        <Slider
          range
          value={price}
          onChange={val => setPrice(val)}
          min={1000}
          max={500000}
          style={{ width: 200 }}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
