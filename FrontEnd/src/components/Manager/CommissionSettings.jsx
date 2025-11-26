import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Tag, Button, Spin, Modal, Input, Select, InputNumber } from "antd";
import { RefreshCcw, Power, Plus } from "lucide-react";

const { Option } = Select;

export default function CommissionSettings() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFee, setNewFee] = useState({
    feeName: "",
    targetRole: "Buyer",
    feeType: "Percentage",
    feeValue: 0,
    feeCategory: "personalListing",
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Fetch rules
  const fetchRules = useCallback(async () => {
    if (!BASE_URL || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}commission/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setRules(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Toggle active status
  const handleToggle = useCallback(
    async (record) => {
      if (!BASE_URL || !token || loading) return;

      try {
        setLoading(true);
        const updated = { ...record, isActive: record.isActive };
        const res = await fetch(`${BASE_URL}commission/${record.feeCode}/toggle`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
        if (res.ok) {
          setRules((prev) =>
            prev.map((r) => (r.ruleId === record.ruleId ? { ...r, isActive: !r.isActive } : r))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [BASE_URL, token, loading]
  );

  // Generate fee code
  const generateFeeCode = (prefix) => {
    const filtered = rules.filter((r) => r.feeCode.startsWith(prefix));
    const maxNumber = filtered
      .map((r) => parseInt(r.feeCode.replace(prefix, "")) || 0)
      .reduce((a, b) => Math.max(a, b), 0);
    return prefix + String(maxNumber + 1).padStart(3, "0");
  };

  // Create new fee
  const handleCreateFee = async () => {
    if (!BASE_URL || !token) return;

    const prefixMap = {
      personalListing: "FEEPL",
      storeListing: "FEESL",
      personalRegistration: "FEEPR",
      storeRegistration: "FEESR",
      personalModeration: "FEEPM",
      storeModeration: "FEESM",
    };
    const prefix = prefixMap[newFee.feeCategory];
    if (!prefix) return;

    // Disable old active rules of same type
    const sameType = rules.filter((r) => r.feeCode.startsWith(prefix) && r.isActive);
    for (const r of sameType) {
      await fetch(`${BASE_URL}commission/${r.feeCode}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...r, isActive: false }),
      });
    }

    const rule = {
      ...newFee,
      ruleId: 0,
      feeCode: generateFeeCode(prefix),
      effectiveFrom: new Date().toISOString(),
      effectiveTo: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}commission/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rule),
      });

      if (res.ok) {
        setModalVisible(false);
        setNewFee({
          feeName: "",
          targetRole: "Buyer",
          feeType: "Percentage",
          feeValue: 0,
          feeCategory: "personalListing",
        });
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Mã phí",
        dataIndex: "feeCode",
        key: "feeCode",
        width: 100,
      },
      {
        title: "Tên quy định",
        dataIndex: "feeName",
        key: "feeName",
      },
      {
        title: "Đối tượng",
        dataIndex: "targetRole",
        key: "targetRole",
        render: (role) => {
          const color = role === "Seller" ? "purple" : role === "Buyer" ? "blue" : "cyan";
          return <Tag color={color}>{role?.toUpperCase() || "N/A"}</Tag>;
        },
      },
      {
        title: "Loại phí",
        dataIndex: "feeType",
        key: "feeType",
        render: (type) => <Tag color={type === "Percentage" ? "green" : "orange"}>{type === "Percentage" ? "Phần trăm (%)" : "Cố định (VND)"}</Tag>,
      },
      {
        title: "Giá trị",
        dataIndex: "feeValue",
        key: "feeValue",
        render: (v, r) => (r.feeType === "Percentage" ? `${v ?? 0}%` : `${(v ?? 0).toLocaleString("vi-VN")}₫`),
      },
      {
        title: "Hiệu lực",
        dataIndex: "isActive",
        key: "isActive",
        render: (active) => <Tag color={active ? "green" : "volcano"}>{active ? "Đang áp dụng" : "Ngưng"}</Tag>,
      },
      {
        title: "Thao tác",
        key: "actions",
        align: "center",
        render: (_, record) => (
          <Button
            icon={<Power size={16} />}
            danger={record.isActive}
            type={record.isActive ? "default" : "primary"}
            onClick={() => handleToggle(record)}
            disabled={loading}
          >
            {record.isActive ? "Tắt hiệu lực" : "Bật hiệu lực"}
          </Button>
        ),
      },
    ],
    [handleToggle, loading]
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm min-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">⚙️ Quản lý quy định & phí hoa hồng</h2>
        <div className="flex gap-2">
          <Button icon={<Plus size={16} />} type="primary" onClick={() => setModalVisible(true)}>
            Thêm phí mới
          </Button>
          <Button icon={<RefreshCcw size={16} />} onClick={fetchRules} disabled={loading}>
            Làm mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Spin size="large" />
        </div>
      ) : (
        <Table rowKey="ruleId" columns={columns} dataSource={rules} pagination={{ pageSize: 8 }} />
      )}

      <Modal
        title="Tạo phí hoa hồng mới"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateFee}
        okText="Tạo"
        cancelText="Hủy"
        centered
        width={500}
        bodyStyle={{ padding: "24px" }}
        okButtonProps={{ type: "primary" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            placeholder="Tên phí"
            value={newFee.feeName}
            onChange={(e) => setNewFee({ ...newFee, feeName: e.target.value })}
          />

          <Select
            value={newFee.targetRole}
            onChange={(val) => setNewFee({ ...newFee, targetRole: val })}
            style={{ width: "100%" }}
            placeholder="Đối tượng áp dụng"
          >
            <Option value="Buyer">Buyer</Option>
            <Option value="Seller">Seller</Option>
          </Select>

          <Select
            value={newFee.feeType}
            onChange={(val) => setNewFee({ ...newFee, feeType: val })}
            style={{ width: "100%" }}
            placeholder="Loại phí"
          >
            <Option value="Percentage">Phần trăm (%)</Option>
            <Option value="Fixed">Cố định (VND)</Option>
          </Select>

          <InputNumber
            value={newFee.feeValue}
            onChange={(val) => setNewFee({ ...newFee, feeValue: val })}
            style={{ width: "100%" }}
            placeholder="Giá trị"
            min={0}
            formatter={(value) =>
              newFee.feeType === "Percentage" ? `${value}%` : `${value?.toLocaleString("vi-VN")}₫`
            }
          />

          <Select
            value={newFee.feeCategory}
            onChange={(val) => setNewFee({ ...newFee, feeCategory: val })}
            style={{ width: "100%" }}
            placeholder="Chọn loại phí"
          >
            <Option value="personalListing">Personal Listing</Option>
            <Option value="storeListing">Store Listing</Option>
            <Option value="personalRegistration">Personal Registration</Option>
            <Option value="storeRegistration">Store Registration</Option>
            <Option value="personalModeration">Personal Moderation</Option>
            <Option value="storeModeration">Store Moderation</Option>
          </Select>
        </div>
      </Modal>    </div>
  );
}
