import React from 'react';
import { Form, InputNumber, DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default function Step2AuctionDetails({ form, onFinish }) {
    return (
        <Form form={form} name="step2" onFinish={onFinish} layout="vertical">
            <Form.Item
                name="startingPrice"
                label="Starting Price (VND)"
                rules={[{ required: true, message: 'Please enter the starting price.' }]}>
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
                rules={[{ required: true, message: 'Please select the auction duration.' }]}>
                <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: '100%' }}
                />
            </Form.Item>
        </Form>
    );
}

