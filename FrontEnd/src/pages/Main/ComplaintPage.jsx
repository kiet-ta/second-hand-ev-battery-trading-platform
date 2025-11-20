import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Spin, Tag } from "antd";
import { Send, AlertCircle, Clock, Search } from "lucide-react";

export default function ComplaintPage() {
  const [form, setForm] = useState({
    reason: "",
    description: "",
    severityLevel: "Low",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [fetching, setFetching] = useState(true);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Validation logic
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.reason.trim()) newErrors.reason = "Vui lòng nhập lý do khiếu nại.";
    if (!form.description.trim())
      newErrors.description = "Vui lòng mô tả chi tiết vấn đề.";
    if (!["Low", "Medium", "High"].includes(form.severityLevel))
      newErrors.severityLevel = "Mức độ không hợp lệ.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Fetch complaints (memoized)
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(`${baseURL}complaints/me?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch {
      setComplaints([]);
    } finally {
      setFetching(false);
    }
  }, [baseURL, token, userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          reason: form.reason.trim(),
          description: form.description.trim(),
          status: "Pending",
          severityLevel: form.severityLevel,
          isDeleted: false,
        }),
      });

      if (res.ok) {
        setForm({ reason: "", description: "", severityLevel: "Low" });
        fetchComplaints();
      }
    } finally {
      setLoading(false);
    }
  };

  const statusTag = useMemo(
    () => (status) => {
      switch (status) {
        case "Pending":
          return <Tag color="gold">Đang chờ</Tag>;
        case "In_Review":
          return <Tag color="blue">Đang xem xét</Tag>;
        case "Resolved":
          return <Tag color="green">Đã xử lý</Tag>;
        default:
          return <Tag>Không xác định</Tag>;
      }
    },
    []
  );

  return (
    <main className="min-h-[80vh] bg-[#FAF9F6] py-12 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white shadow-md border border-[#E5E4E2] rounded-2xl p-8 mb-12">
        <h1 className="text-3xl font-semibold text-[#4B3F2F] mb-8 flex items-center gap-2">
          <AlertCircle className="text-[#D4A017]" />
          Gửi Khiếu Nại
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-[#4B3F2F] mb-2">
              Lý do khiếu nại
            </label>
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ví dụ: Lỗi thanh toán, giao hàng trễ..."
              className={`w-full border rounded-lg p-3 bg-[#FCFCFA] focus:ring-2 focus:ring-[#D4A017] ${
                errors.reason ? "border-red-400" : "border-[#E0DFDB]"
              }`}
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#4B3F2F] mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              placeholder="Hãy mô tả chi tiết vấn đề bạn gặp phải..."
              className={`w-full border rounded-lg p-3 bg-[#FCFCFA] resize-none focus:ring-2 focus:ring-[#D4A017] ${
                errors.description ? "border-red-400" : "border-[#E0DFDB]"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-[#4B3F2F] mb-2">
              Mức độ nghiêm trọng
            </label>
            <select
              name="severityLevel"
              value={form.severityLevel}
              onChange={(e) =>
                setForm({ ...form, severityLevel: e.target.value })
              }
              className={`w-full border rounded-lg p-3 bg-[#FCFCFA] focus:ring-2 focus:ring-[#D4A017] ${
                errors.severityLevel ? "border-red-400" : "border-[#E0DFDB]"
              }`}
            >
              <option value="Low">Thấp</option>
              <option value="Medium">Trung bình</option>
              <option value="High">Cao</option>
            </select>
            {errors.severityLevel && (
              <p className="text-red-500 text-sm mt-1">
                {errors.severityLevel}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-white bg-[#D4A017] hover:bg-[#b88e0f] transition-all disabled:opacity-60"
          >
            <Send className="w-5 h-5" />
            {loading ? "Đang gửi..." : "Gửi khiếu nại"}
          </button>
        </form>
      </div>

      {/* Complaint list */}
      <div className="max-w-5xl w-full bg-white shadow-sm border border-[#E5E4E2] rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-[#4B3F2F]">
          <Clock className="text-[#D4A017]" />
          Lịch sử khiếu nại của tôi
        </h2>

        {fetching ? (
          <div className="flex justify-center py-10">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center text-slate-500 py-6">
            <Search className="inline w-5 h-5 mr-1" />
            Bạn chưa gửi khiếu nại nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] text-[#4B3F2F]">
                  <th className="py-3 px-4 border-b">#</th>
                  <th className="py-3 px-4 border-b">Lý do</th>
                  <th className="py-3 px-4 border-b">Mức độ</th>
                  <th className="py-3 px-4 border-b">Trạng thái</th>
                  <th className="py-3 px-4 border-b">Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c.complaintId} className="hover:bg-[#FAFAF8]">
                    <td className="py-3 px-4 border-b text-slate-700">{i + 1}</td>
                    <td className="py-3 px-4 border-b">{c.reason}</td>
                    <td className="py-3 px-4 border-b capitalize">{c.severityLevel}</td>
                    <td className="py-3 px-4 border-b">{statusTag(c.status)}</td>
                    <td className="py-3 px-4 border-b text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
