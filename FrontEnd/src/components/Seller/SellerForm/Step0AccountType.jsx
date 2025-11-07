import React from "react";
import { Button, Modal, Table, Divider } from "antd";
import { UserOutlined, ShopOutlined } from "@ant-design/icons";

const Step0AccountType = ({ formData, setFormData, nextStep }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (type) => {
    setFormData((prev) => ({ ...prev, accountType: type }));
  };

  const columns = [
    { title: "Tiêu chí", dataIndex: "criteria", key: "criteria", width: "40%" },
    { title: "Cá nhân", dataIndex: "personal", key: "personal" },
    { title: "Cửa hàng", dataIndex: "store", key: "store" },
  ];

  const data = [
    {
      key: "1",
      criteria: "Phí đăng ký",
      personal: "Miễn phí",
      store: "469.000đ/năm (bao gồm phí duy trì)",
    },
    {
      key: "2",
      criteria: "Phí duy trì tài khoản",
      personal: "Không có",
      store: "469.000đ/năm",
    },
    {
      key: "3",
      criteria: "Đăng bài",
      personal:
        "Lần đầu đăng bài miễn phí. Sau đó, đăng không giới hạn nhưng bị trừ phí từ ngưỡng doanh thu xuống 2%.",
      store: "Đăng không giới hạn, trừ phí từ ngưỡng doanh thu xuống 2%.",
    },
    {
      key: "4",
      criteria: "Thống kê doanh thu",
      personal: "Không cần (không có xuất dữ liệu, ...)",
      store: "Có thống kê doanh thu đầy đủ (có thể export dữ liệu, ...)",
    },
    {
      key: "5",
      criteria: "Hỗ trợ kỹ thuật",
      personal: "Qua email (phản hồi trong 48h)",
      store: "Trong 24h (nhắn tin từ hệ thống, ...)",
    },
  ];

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold">Bạn muốn đăng ký loại tài khoản nào?</h2>

      <div className="flex justify-center gap-6">
        <Button
          size="large"
          type={formData.accountType === "personal" ? "primary" : "default"}
          icon={<UserOutlined />}
          onClick={() => handleSelect("personal")}
        >
          Cá nhân
        </Button>
        <Button
          size="large"
          type={formData.accountType === "store" ? "primary" : "default"}
          icon={<ShopOutlined />}
          onClick={() => handleSelect("store")}
        >
          Cửa hàng
        </Button>
      </div>

      <Button type="link" onClick={() => setOpen(true)}>
        Xem quyền lợi và phí
      </Button>

      <Modal
        title="So sánh quyền lợi và phí"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={900}
      >
        <Table columns={columns} dataSource={data} pagination={false} bordered size="small" />

        <Divider />

        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <b>Nâng cấp từ Cá nhân → Cửa hàng:</b>
          </p>
          <ul className="list-disc ml-5">
            <li>Xác minh danh tính đầy đủ (CMND/CCCD, email, số điện thoại).</li>
            <li>Gửi yêu cầu nâng cấp qua giao diện (phản hồi trong 24h).</li>
            <li>Phí nâng cấp: 69.000đ/lần.</li>
          </ul>
        </div>

        <Divider />

        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <b>Giảm phần trăm theo ngưỡng doanh thu:</b>
          </p>
          <table className="w-full text-left border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Doanh thu (VNĐ)</th>
                <th className="p-2 border">Phí</th>
                <th className="p-2 border">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">0 – 300 triệu</td>
                <td className="p-2 border">10%</td>
                <td className="p-2 border">
                  Mức khởi điểm, áp dụng cho cá nhân hoặc người mới
                </td>
              </tr>
              <tr>
                <td className="p-2 border">300 – 800 triệu</td>
                <td className="p-2 border">6%</td>
                <td className="p-2 border">Khuyến khích bán nhiều hơn</td>
              </tr>
              <tr>
                <td className="p-2 border">800 triệu – 1.5 tỷ</td>
                <td className="p-2 border">5%</td>
                <td className="p-2 border">Dành cho cửa hàng hoạt động ổn định</td>
              </tr>
              <tr>
                <td className="p-2 border">&gt; 1.5 tỷ</td>
                <td className="p-2 border">3%</td>
                <td className="p-2 border">VIP Seller, có thể kèm ưu đãi khác</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>

      <div className="flex justify-center">
        <Button
          type="primary"
          disabled={!formData.accountType}
          onClick={nextStep}
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step0AccountType;
