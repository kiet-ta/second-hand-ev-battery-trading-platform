import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Tag, Button, Spin } from "antd";
import { RefreshCcw, Power } from "lucide-react";

export default function CommissionSettings() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // ✅ Safe fetch wrapper
  const fetchRules = useCallback(async () => {
    if (!BASE_URL || !token) return console.error("Missing API config or token");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}commission/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error loading rules:", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // ✅ Toggle active status safely
  const handleToggle = useCallback(
    async (record) => {
      if (!BASE_URL || !token) return;
      if (!record?.feeCode) return console.warn("Invalid rule record.");

      // Prevent rapid toggles
      if (loading) return;

      const updatedRule = {
        ...record,
        isActive: !record.isActive,
      };

      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}commission/${record.feeCode}/toggle`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedRule),
        });

        if (!res.ok) {
          console.error("❌ Toggle failed:", await res.text());
        } else {
          // Update local state instantly for responsiveness
          setRules((prev) =>
            prev.map((r) =>
              r.ruleId === record.ruleId ? { ...r, isActive: !r.isActive } : r
            )
          );
        }
      } catch (err) {
        console.error("❌ Toggle error:", err);
      } finally {
        setLoading(false);
      }
    },
    [BASE_URL, token, loading]
  );

  // ✅ Memoized columns for performance
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
          const color =
            role === "Seller" ? "purple" : role === "Buyer" ? "blue" : "cyan";
          return <Tag color={color}>{role?.toUpperCase() || "N/A"}</Tag>;
        },
      },
      {
        title: "Loại phí",
        dataIndex: "feeType",
        key: "feeType",
        render: (type) => (
          <Tag color={type === "Percentage" ? "green" : "orange"}>
            {type === "Percentage" ? "Phần trăm (%)" : "Cố định (VND)"}
          </Tag>
        ),
      },
      {
        title: "Giá trị",
        dataIndex: "feeValue",
        key: "feeValue",
        render: (v, r) =>
          r.feeType === "Percentage"
            ? `${v ?? 0}%`
            : `${(v ?? 0).toLocaleString("vi-VN")}₫`,
      },
      {
        title: "Hiệu lực",
        dataIndex: "isActive",
        key: "isActive",
        render: (active) => (
          <Tag color={active ? "green" : "volcano"}>
            {active ? "Đang áp dụng" : "Ngưng"}
          </Tag>
        ),
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
        <h2 className="text-xl font-semibold">
          ⚙️ Quản lý quy định & phí hoa hồng
        </h2>
        <Button icon={<RefreshCcw size={16} />} onClick={fetchRules} disabled={loading}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          rowKey="ruleId"
          columns={columns}
          dataSource={rules}
          pagination={{ pageSize: 8 }}
        />
      )}
    </div>
  );
}
