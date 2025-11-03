import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Wrench,
  CheckCircle,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { Spin, Select } from "antd";
import { motion } from "framer-motion";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const staffList = useMemo(
    () => [
      { id: 11, name: "Nguyen Van Staff" },
      { id: 12, name: "Tran Thi Support" },
      { id: 13, name: "Le Van Helpdesk" },
    ],
    []
  );

  // ✅ Fetch complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}complaint/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setComplaints(sorted);
    } catch (err) {
      console.error("Lỗi tải complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [baseURL, token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ✅ Derived filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchLevel = levelFilter === "all" || c.severityLevel === levelFilter;
      const matchSearch =
        !q ||
        c.reason?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      return matchStatus && matchLevel && matchSearch;
    });
  }, [complaints, statusFilter, levelFilter, search]);

  // ✅ View details (inline, not popup)
  const viewComplaintDetail = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${baseURL}complaint/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load detail");
        const data = await res.json();
        setSelectedComplaint(data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết complaint:", err);
        setSelectedComplaint(null);
      }
    },
    [baseURL, token]
  );

  // ✅ Update status with validation and optimistic UI
  const updateStatus = useCallback(
    async (id, newStatus) => {
      if (!["pending", "in_review", "resolved"].includes(newStatus)) return;
      try {
        await fetch(`${baseURL}complaint/${id}/status?status=${newStatus}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });

        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === id ? { ...c, status: newStatus } : c
          )
        );

        if (selectedComplaint?.complaintId === id) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus });
        }
      } catch (err) {
        console.error("Cập nhật trạng thái thất bại:", err);
      }
    },
    [baseURL, token, selectedComplaint]
  );

  // ✅ Update level (validated)
  const updateLevel = useCallback(
    async (id, newLevel) => {
      if (!["low", "medium", "high"].includes(newLevel)) return;
      try {
        await fetch(`${baseURL}complaint/${id}/level`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ level: newLevel }),
        });

        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === id ? { ...c, severityLevel: newLevel } : c
          )
        );

        if (selectedComplaint?.complaintId === id) {
          setSelectedComplaint({ ...selectedComplaint, severityLevel: newLevel });
        }
      } catch (err) {
        console.error("Cập nhật mức độ thất bại:", err);
      }
    },
    [baseURL, token, selectedComplaint]
  );

  // ✅ Assign staff (validated)
  const assignToStaff = useCallback(
    async (id, staffId) => {
      if (!staffId) return;
      try {
        await fetch(`${baseURL}complaint/assignee/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedComplaint((prev) =>
          prev ? { ...prev, assignedStaff: staffId } : prev
        );
      } catch (err) {
        console.error("Không thể giao nhân viên:", err);
      }
    },
    [baseURL, token]
  );

  const statusBadge = useCallback((status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in_review":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-gray-50">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">📋 Quản lý khiếu nại</h1>
        <button
          onClick={fetchComplaints}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo lý do hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="in_review">Đang xem xét</option>
            <option value="resolved">Đã xử lý</option>
          </select>
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Người dùng</th>
              <th className="p-3">Lý do</th>
              <th className="p-3">Mức độ</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <motion.tr
                key={c.complaintId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-b hover:bg-gray-50 ${
                  selectedComplaint?.complaintId === c.complaintId
                    ? "bg-indigo-50"
                    : ""
                }`}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{c.userId}</td>
                <td className="p-3">{c.reason}</td>
                <td className="p-3 capitalize">{c.severityLevel}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(
                      c.status
                    )}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => viewComplaintDetail(c.complaintId)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline Detail View */}
      {selectedComplaint && (
        <motion.div
          key={selectedComplaint.complaintId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-white rounded-xl shadow border space-y-3"
        >
          <h3 className="text-lg font-semibold mb-2">
            🧾 Chi tiết khiếu nại #{selectedComplaint.complaintId}
          </h3>
          <p><b>User ID:</b> {selectedComplaint.userId}</p>
          <p><b>Lý do:</b> {selectedComplaint.reason}</p>
          <p><b>Mô tả:</b> {selectedComplaint.description}</p>

          <div className="flex items-center gap-3">
            <b>Mức độ:</b>
            <Select
              value={selectedComplaint.severityLevel}
              style={{ width: 140 }}
              onChange={(val) => updateLevel(selectedComplaint.complaintId, val)}
              options={[
                { value: "low", label: "Thấp" },
                { value: "medium", label: "Trung bình" },
                { value: "high", label: "Cao" },
              ]}
            />
          </div>

          <p>
            <b>Trạng thái:</b>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(
                selectedComplaint.status
              )}`}
            >
              {selectedComplaint.status}
            </span>
          </p>

          <div className="flex gap-3 mt-4 flex-wrap">
            {selectedComplaint.status === "pending" && (
              <button
                onClick={() =>
                  updateStatus(selectedComplaint.complaintId, "in_review")
                }
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
              >
                <Wrench size={16} /> Đang xem xét
              </button>
            )}
            {selectedComplaint.status !== "resolved" && (
              <button
                onClick={() =>
                  updateStatus(selectedComplaint.complaintId, "resolved")
                }
                className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg"
              >
                <CheckCircle size={16} /> Đã xử lý
              </button>
            )}
            <Select
              placeholder="Giao cho staff..."
              style={{ width: 200 }}
              onChange={(staffId) =>
                assignToStaff(selectedComplaint.complaintId, staffId)
              }
              options={staffList.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              suffixIcon={<UserCheck size={16} />}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
