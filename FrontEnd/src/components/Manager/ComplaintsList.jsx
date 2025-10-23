import React, { useEffect, useState } from "react";
import { Search, Filter, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ComplaintsList() {
    const [complaints, setComplaints] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Fake API dữ liệu mẫu
    useEffect(() => {
        const fakeData = [
            {
                id: 1,
                senderName: "Nguyen Van A",
                senderRole: "Buyer",
                type: "Complaint",
                title: "Product not delivered on time",
                message: "I bought an EV but it's still not delivered after 7 days.",
                date: "2025-10-15",
                status: "Pending",
            },
            {
                id: 2,
                senderName: "Tran Thi B",
                senderRole: "Seller",
                type: "Feedback",
                title: "Feature suggestion",
                message: "It would be great to have automatic reply to buyers.",
                date: "2025-10-16",
                status: "Resolved",
            },
            {
                id: 3,
                senderName: "Le Van C",
                senderRole: "Buyer",
                type: "Complaint",
                title: "Staff didn’t respond",
                message: "No response after I reported a scam.",
                date: "2025-10-17",
                status: "In Review",
            },
        ];
        setComplaints(fakeData);
        setFiltered(fakeData);
    }, []);

    // Lọc theo trạng thái + tìm kiếm
    useEffect(() => {
        let data = [...complaints];
        if (statusFilter !== "all") {
            data = data.filter((c) => c.status === statusFilter);
        }
        if (search.trim()) {
            data = data.filter((c) =>
                c.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFiltered(data);
    }, [search, statusFilter, complaints]);

    const handleResolve = (id) => {
        const updated = complaints.map((c) =>
            c.id === id ? { ...c, status: "Resolved" } : c
        );
        setComplaints(updated);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold mb-6">📋 User Complaints & Feedback</h1>

            {/* Bộ lọc & tìm kiếm */}
            <div className="flex flex-wrap gap-3 items-center mb-5">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Bảng complaints */}
            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                        <tr>
                            <th className="p-3">Sender</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((c) => (
                                <motion.tr
                                    key={c.id}
                                    className="border-b hover:bg-gray-50"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <td className="p-3">{c.senderName}</td>
                                    <td className="p-3">{c.senderRole}</td>
                                    <td className="p-3">{c.type}</td>
                                    <td className="p-3">{c.title}</td>
                                    <td className="p-3">{c.date}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${c.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : c.status === "In Review"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2 justify-center">
                                        <button
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                            onClick={() => alert(`View detail of #${c.id}`)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {c.status !== "Resolved" && (
                                            <button
                                                className="p-2 bg-green-100 hover:bg-green-200 rounded-lg"
                                                onClick={() => handleResolve(c.id)}
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td className="p-4 text-center text-gray-500" colSpan="7">
                                    No complaints found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
