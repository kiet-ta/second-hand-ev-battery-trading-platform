import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Wrench,
  CheckCircle,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { message, Spin, Modal, Select } from "antd";
import { motion } from "framer-motion";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [staffList] = useState([
    { id: 11, name: "Nguyen Van Staff" },
    { id: 12, name: "Tran Thi Support" },
    { id: 13, name: "Le Van Helpdesk" },
  ]);

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  //  Lấy danh sách complaint
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}complaints/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải complaint");
      const data = await res.json();

      // Sắp xếp complaint mới nhất lên đầu
      const sorted = (data || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setComplaints(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi load trang
  useEffect(() => {
    fetchComplaints();
  }, []);

  //  Lọc và tìm kiếm
  useEffect(() => {
    let list = [...complaints];
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (levelFilter !== "all") list = list.filter((c) => c.severityLevel === levelFilter);
    if (search.trim()) {
      const q = search;
      list = list.filter(
        (c) =>
          c.reason?.includes(q) ||
          c.description?.includes(q)
      );
    }
    setFiltered(list);
  }, [complaints, search, statusFilter, levelFilter]);

  //  Xem chi tiết complaint
  const openDetailModal = async (id) => {
    setModalVisible(true);
    setModalLoading(true);
    try {
      const res = await fetch(`${baseURL}complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể lấy chi tiết complaint");
      const data = await res.json();
      setSelectedComplaint(data);
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi tải chi tiết complaint.");
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  //  Cập nhật trạng thái
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${baseURL}complaints/${id}/status?status=${newStatus}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success(` Trạng thái chuyển sang "${newStatus}".`);
      setModalVisible(false);
      fetchComplaints();
    } catch {
      message.error("❌ Không thể cập nhật trạng thái.");
    }
  };

  //  Cập nhật mức độ nghiêm trọng
  const updateLevel = async (id, newLevel) => {
    try {
      const res = await fetch(`${baseURL}complaints/${id}/level`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ level: newLevel }),
      });
      if (!res.ok) throw new Error();
      message.success(`⚡ Mức độ thay đổi thành "${newLevel}".`);
      setSelectedComplaint({ ...selectedComplaint, severityLevel: newLevel });
    } catch {
      message.error("Không thể thay đổi mức độ.");
    }
  };

  //  Giao staff xử lý
  const assignToStaff = async (id, staffId) => {
    try {
      const res = await fetch(`${baseURL}complaints/assignee/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("👤 Đã giao khiếu nại cho nhân viên xử lý.");
      setModalVisible(false);
    } catch {
      message.error("Không thể giao nhân viên.");
    }
  };


  const translateStatus = (status) => {
    switch (status) {
      case "Pending":
        return "Đang chờ xử lý";
      case "In_Review":
        return "Đang xem xét";
      case "Resolved":
        return "Đã giải quyết";
      default:
        return status;
    }
  };

  const translateLevel = (level) => {
    switch (level) {
      case "Low":
        return "Thấp";
      case "Medium":
        return "Trung bình";
      case "High":
        return "Cao";
      default:
        return level;
    }
  };



  // Badge màu trạng thái
  const statusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "In_Review":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-gray-50">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"> Quản lý khiếu nại</h1>
        <button
          onClick={fetchComplaints}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
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
            <option value="Pending">Đang chờ</option>
            <option value="In_Review">Đang xem xét</option>
            <option value="Resolved">Đã xử lý</option>
          </select>
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="Low">Thấp</option>
          <option value="Medium">Trung bình</option>
          <option value="High">Cao</option>
        </select>
      </div>

      {/* Bảng khiếu nại */}
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
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{c.userId}</td>
                <td className="p-3">{c.reason}</td>
                <td className="p-3 capitalize">{translateLevel(c.severityLevel)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(
                      c.status
                    )}`}
                  >
                    {translateStatus(c.status)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => openDetailModal(c.complaintId)}
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

      {/* Modal chi tiết */}
      <Modal
        title=" Chi tiết khiếu nại"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        width={650}
      >
        {modalLoading ? (
          <div className="flex justify-center py-10">
            <Spin tip="Đang tải..." />
          </div>
        ) : selectedComplaint ? (
          <div className="space-y-3 text-[15px]">
            <p><b>ID:</b> {selectedComplaint.complaintId}</p>
            <p><b>User ID:</b> {selectedComplaint.userId}</p>
            <p><b>Lý do:</b> {selectedComplaint.reason}</p>
            <p><b>Mô tả:</b> {selectedComplaint.description}</p>

            <div className="flex gap-3 items-center">
              <b>Mức độ:</b>
              <Select
                defaultValue={selectedComplaint.severityLevel}
                style={{ width: 130 }}
                onChange={(val) => updateLevel(selectedComplaint.complaintId, val)}
                options={[
                  { value: "Low", label: "Thấp" },
                  { value: "Medium", label: "Trung bình" },
                  { value: "High", label: "Cao" },
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

            <div className="flex gap-3 mt-5 flex-wrap">
              {selectedComplaint.status === "Pending" && (
                <button
                  onClick={() =>
                    updateStatus(selectedComplaint.complaintId, "In_Review")
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
                >
                  <Wrench size={16} /> Đang xem xét
                </button>
              )}
              {selectedComplaint.status !== "Resolved" && (
                <button
                  onClick={() =>
                    updateStatus(selectedComplaint.complaintId, "Resolved")
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg"
                >
                  <CheckCircle size={16} /> Đã xử lý
                </button>
              )}
              <Select
                placeholder="Giao cho staff..."
                style={{ width: 180 }}
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
          </div>
        ) : (
          <p>Không tìm thấy complaint.</p>
        )}
      </Modal>
    </div>
  );
}
