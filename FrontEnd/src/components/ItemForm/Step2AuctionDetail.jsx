import React from 'react';
import { Form, InputNumber, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function Step2AuctionDetails({ form, onFinish, initialValues }) {
  const handleFinish = (values) => {
    const [start, end] = values.auctionTime || [];
    onFinish({
      ...values,
      auctionTime: [
        start ? dayjs(start).format('YYYY-MM-DDTHH:mm:ss') : null,
        end ? dayjs(end).format('YYYY-MM-DDTHH:mm:ss') : null,
      ],
    });
  };

  return (
    <Form
      form={form}
      name="step2"
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{
        ...initialValues,
        auctionTime: initialValues?.auctionTime
          ? [dayjs(initialValues.auctionTime[0]), dayjs(initialValues.auctionTime[1])]
          : undefined,
      }}
    >
      <Form.Item
        name="startingPrice"
        label="Starting Price (VND)"
        rules={[{ required: true, message: 'Please enter the starting price.' }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\D/g, '')}
        />
      </Form.Item>

      <Form.Item
        name="auctionTime"
        label="Auction Start & End Time"
        rules={[{ required: true, message: 'Please select the auction duration.' }]}
      >
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">Next</Button>
      </Form.Item>
    </Form>
  );
}
