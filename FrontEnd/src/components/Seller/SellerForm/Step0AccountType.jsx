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
      personal: "120.000đ",
      store: "300.000đ",
    },
    {
      key: "2",
      criteria: "Phí sản phẩm",
      personal: "150.000đ/sản phẩm",
      store: "50.000đ/sản phẩm",
    },
    {
      key: "3",
      criteria: "Phí kiểm duyệt",
      personal: "100.000đ/sản phẩm",
      store: "50.000đ/sản phẩm",
    }
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
