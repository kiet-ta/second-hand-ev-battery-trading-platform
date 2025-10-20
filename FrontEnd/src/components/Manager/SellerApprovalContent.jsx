// src/components/Manager/SellerApprovalsContent.jsx

import React from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCog } from "lucide-react";
import Card from "./Card";
import CardHeader from "./CardHeader";

export default function SellerApprovalsContent() {
    const { approvals, handleApprovalAction } = useOutletContext();

    return (
        <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader title="New Seller Approvals" icon={<UserCog size={18} />} />
                <div className="p-4 overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-2">ID</th>
                                <th className="py-2">Seller</th>
                                <th className="py-2">Region</th>
                                <th className="py-2">Submitted</th>
                                <th className="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvals.map((a, idx) => (
                                <tr key={a.id || `appr-${idx}`} className="border-b last:border-0">
                                    <td className="py-2 font-medium text-slate-700">{a.id}</td>
                                    <td className="py-2">{a.seller}</td>
                                    <td className="py-2">{a.region}</td>
                                    <td className="py-2">
                                        {new Date(a.submittedAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprovalAction(a.id, 'approve')}
                                                className="px-2.5 py-1 rounded-lg text-xs border border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApprovalAction(a.id, 'reject')}
                                                className="px-2.5 py-1 rounded-lg text-xs border border-rose-400 text-rose-600 hover:bg-rose-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}