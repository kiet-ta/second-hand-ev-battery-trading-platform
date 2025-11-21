import React, { useState, useEffect } from "react";
import { Form, Input, Button, Radio } from "antd";

const Step1PersonalInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  const [form] = Form.useForm();
  const [updateChoice, setUpdateChoice] = useState(null);
  const user = formData.user || {};

  useEffect(() => {
    form.setFieldsValue({
      fullName: user.fullName || "",
      phone: user.phone || "",
      bio: formData.personalInfo?.bio || user.bio || "",
    });
  }, [user, formData.personalInfo, form]);

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      if (updateChoice === "no") {
        // Only update bio
        setFormData((prev) => ({
          ...prev,
          personalInfo: {
            fullName: user.fullName,
            phone: user.phone,
            bio: values.bio,
          },
        }));
      } else {
        // Update all
        setFormData((prev) => ({
          ...prev,
          personalInfo: values,
        }));
      }

      nextStep();
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Thông tin cá nhân
      </h2>

      <p className="text-gray-500">
        Hãy xác nhận hoặc cập nhật thông tin cá nhân của bạn.
      </p>

      <div>
        <p className="font-medium mb-2">
          Bạn có muốn cập nhật thông tin cá nhân không?
        </p>
        <Radio.Group
          onChange={(e) => setUpdateChoice(e.target.value)}
          value={updateChoice}
        >
          <Radio value="yes">Có</Radio>
          <Radio value="no">Không</Radio>
        </Radio.Group>
      </div>

      {updateChoice && (
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            fullName: user.fullName,
            phone: user.phone,
            bio: formData.personalInfo?.bio || "",
          }}
          // ❌ prevent default submit behavior
          onFinish={(e) => e.preventDefault()}
        >
          {updateChoice === "yes" && (
            <>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{9,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="0901234567" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Giới thiệu ngắn"
            name="bio"
            rules={[{ max: 300, message: "Giới thiệu tối đa 300 ký tự" }]}
          >
            <Input.TextArea
              placeholder="Giới thiệu ngắn về bạn hoặc lĩnh vực bạn hoạt động..."
              rows={3}
              maxLength={300}
            />
          </Form.Item>
        </Form>
      )}

      {/* ✅ Only one control bar */}
      <div className="flex justify-between mt-6">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={handleNext} disabled={!updateChoice}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
