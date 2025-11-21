import React from "react";
import { Button, Modal } from "antd";

const Step0AccountType = ({ formData, setFormData, nextStep }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (type) => {
    setFormData({ ...formData, accountType: type });
    nextStep();
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold">Bạn muốn đăng ký loại tài khoản nào?</h2>

      <div className="flex justify-center gap-6">
        <Button
          size="large"
          type={formData.accountType === "personal" ? "primary" : "default"}
          onClick={() => handleSelect("personal")}
        >
          Cá nhân
        </Button>
        <Button
          size="large"
          type={formData.accountType === "store" ? "primary" : "default"}
          onClick={() => handleSelect("store")}
        >
          Cửa hàng
        </Button>
      </div>

      <Button type="link" onClick={() => setOpen(true)}>
        Xem quyền lợi từng loại
      </Button>

      <Modal
        title="So sánh quyền lợi"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <div className="space-y-2">
          <p><b>Cá nhân:</b> Dành cho người dùng bán nhỏ lẻ.</p>
          <p><b>Cửa hàng:</b> Có trang quản lý sản phẩm, thương hiệu và doanh thu.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Step0AccountType;
