import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Spin, Tag, Select } from "antd";
import { Send, AlertCircle, Clock, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function ComplaintPage() {
  // Danh sách lý do cố định
  const complaintReasons = [
    { reason: "Lỗi thanh toán", level: "High" },
    { reason: "Giao hàng chậm", level: "Medium" },
    { reason: "Không nhận được hàng", level: "High" },
    { reason: "Sản phẩm không đúng mô tả", level: "High" },
    { reason: "Nhân viên hỗ trợ chậm", level: "Low" },
    { reason: "Lỗi hiển thị", level: "Low" },
    { reason: "Lỗi reset mật khẩu", level: "Medium" },
    { reason: "Lỗi đăng ký", level: "High" },
    { reason: "Khác", level: "Medium" },
  ];

  const [form, setForm] = useState({
    reason: "",
    description: "",
    severityLevel: "Low",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [customReason, setCustomReason] = useState("");

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.reason) newErrors.reason = "Vui lòng chọn lý do khiếu nại.";
    if (!form.description.trim())
      newErrors.description = "Vui lòng mô tả chi tiết vấn đề.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Fetch complaints
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

  // Submit complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Vui lòng nhập đầy đủ thông tin trước khi gửi.");
      return;
    }


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
          reason: form.reason || customReason,
          description: form.description.trim(),
          status: "Pending",
          severityLevel: form.severityLevel,
          isDeleted: false,
        }),
      });

      if (res.ok) {
        setForm({ reason: "", description: "", severityLevel: "Low" });
        fetchComplaints();
        toast.success(" Gửi khiếu nại thành công!");
      } else {
        toast.error(" Gửi thất bại, thử lại sau!");
      }
    } catch (error) {
      toast.error(" Lỗi hệ thống, thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // Render trạng thái
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
      {/* FORM */}
      <div className="max-w-2xl w-full bg-white shadow-md border border-[#E5E4E2] rounded-2xl p-8 mb-12">
        <h1 className="text-3xl font-semibold text-[#4B3F2F] mb-8 flex items-center gap-2">
          <AlertCircle className="text-[#D4A017]" />
          Gửi Khiếu Nại
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-[#4B3F2F] mb-2">
              Lý do khiếu nại
            </label>
            <Select
              value={form.reason}
              placeholder="Chọn lý do khiếu nại"
              className="w-full"
              onChange={(value) => {
                const selected = complaintReasons.find((r) => r.reason === value);

                if (value === "Khác") {
                  setForm({
                    ...form,
                    reason: "Khác",
                    severityLevel: "Medium",
                  });
                } else {
                  setForm({
                    ...form,
                    reason: value,
                    severityLevel: selected?.level || "Low",
                  });
                  setCustomReason("");
                }
              }}
              options={complaintReasons.map((r) => ({
                value: r.reason,
                label: r.reason,
              }))}
            />
            {form.reason === "Khác" && (
              <input
                type="text"
                placeholder="Nhập lý do khác..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-3 w-full border rounded-lg p-3 bg-[#FCFCFA] focus:ring-2 focus:ring-[#D4A017]"
              />
            )}
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>



          {/* Mô tả */}
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
              className={`w-full border rounded-lg p-3 bg-[#FCFCFA] resize-none focus:ring-2 focus:ring-[#D4A017] ${errors.description ? "border-red-400" : "border-[#E0DFDB]"
                }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description}
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

      {/* LIST HISTORY */}
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
          <p className="text-center text-slate-500 py-6 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Bạn chưa gửi khiếu nại nào.
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
                    <td className="py-3 px-4 border-b">
                      {c.severityLevel === "Low"
                        ? "Thấp"
                        : c.severityLevel === "Medium"
                          ? "Trung bình"
                          : "Cao"}
                    </td>
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
      <ToastContainer position="top-right" autoClose={2500} />
    </main>
  );
}
