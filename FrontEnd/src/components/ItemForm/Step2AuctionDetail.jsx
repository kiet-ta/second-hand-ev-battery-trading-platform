import React, { useState } from 'react';
import { Form, InputNumber, DatePicker, Button, Checkbox, Typography } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function Step2AuctionDetails({ form, onFinish, initialValues, buyNowPrice }) {
  const [isBuyNow, setIsBuyNow] = useState(initialValues?.isBuyNow || false);

  const handleFinish = (values) => {
    const [start, end] = values.auctionTime || [];

    // ---- VALIDATION ----
    const now = dayjs();

    // Start cannot be in the past
    if (start && dayjs(start).isBefore(now)) {
      form.setFields([
        {
          name: "auctionTime",
          errors: ["Thời gian bắt đầu không được ở quá khứ."]
        }
      ]);
      return;
    }

    // End cannot be more than 2 weeks from start
    if (start && end && dayjs(end).diff(dayjs(start), "day") > 14) {
      form.setFields([
        {
          name: "auctionTime",
          errors: ["Thời gian kết thúc tối đa là 14 ngày kể từ lúc bắt đầu."]
        }
      ]);
      return;
    }

    // Everything OK → pass formatted data upward
    onFinish({
      ...values,
      auctionTime: [
        start ? dayjs(start).format("YYYY-MM-DDTHH:mm:ss") : null,
        end ? dayjs(end).format("YYYY-MM-DDTHH:mm:ss") : null
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
      {/* Starting Price */}
      <Form.Item
        name="startingPrice"
        label="Giá bước đầu (VND)"
        rules={[{ required: true, message: "Vui lòng nhập giá bước đầu." }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\D/g, "")}
        />
      </Form.Item>

      {/* Auction Time */}
      <Form.Item
        name="auctionTime"
        label="Thời gian đấu giá"
        rules={[{ required: true, message: "Vui lòng nhập thời gian đấu giá." }]}
      >
        <RangePicker
          showTime={{ format: "HH:mm" }}
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Step Price */}
      <Form.Item name="stepPrice" label="Bước giá (VND)">
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\D/g, "")}
        />
      </Form.Item>

      {/* Buy Now */}
      <Form.Item name="isBuyNow" valuePropName="checked">
        <Checkbox onChange={(e) => setIsBuyNow(e.target.checked)}>
          Có mua ngay
        </Checkbox>
      </Form.Item>

      {/* Buy Now Warning */}
      {isBuyNow && (
        <Typography.Paragraph type="secondary" style={{ marginTop: -10 }}>
          ⚠ Giá mua ngay sẽ sử dụng <b>giá bạn đã nhập ở bước 1</b>:{" "}
          <b>{buyNowPrice?.toLocaleString()} VND</b>.
          <br />
          Giá mua ngay phải luôn <b>cao hơn giá bước đầu</b>.
        </Typography.Paragraph>
      )}
    </Form>
  );
}
