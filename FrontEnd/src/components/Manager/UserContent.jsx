import React from "react";
// REMOVED: import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, MoreHorizontal, UserCheck, ShieldAlert, Ban } from "lucide-react";
import { Menu } from "@headlessui/react";
import Card from "./Card";
import CardHeader from "./CardHeader";

/**
 * UsersContent component displays the user list and status management actions.
 * All necessary data and handlers must be passed directly as props.
 */
export default function UsersContent({ 
    users = [], 
    handleStatusChange, 
    currentUserId, 
    userPage, 
    setUserPage, 
    userTotalPages 
}) {

    return (
        <motion.div
            key="users"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader title="User Management" icon={<Users size={18} />} />
                <div className="p-4 overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-2">ID</th>
                                <th className="py-2">Name</th>
                                <th className="py-2">Email</th>
                                <th className="py-2">Phone</th>
                                <th className="py-2">Role</th>
                                <th className="py-2">Status</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, idx) => (
                                <tr key={u.userId || `user-${idx}`} className="border-b last:border-0">
                                    <td className="py-2">{u.userId}</td>
                                    <td className="py-2">{u.fullName}</td>
                                    <td className="py-2">{u.email}</td>
                                    <td className="py-2">{u.phone}</td>
                                    <td className="py-2 capitalize">{u.role}</td>
                                    <td className="py-2">
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.accountStatus === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : u.accountStatus === "warning1" ? "bg-amber-50 text-amber-600 border border-amber-200" : u.accountStatus === "warning2" ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}
                                        >
                                            {u.accountStatus}
                                        </span>
                                    </td>
                                    <td className="py-2 text-right">
                                        {u.userId !== Number(currentUserId) ? (
                                            <Menu as="div" className="relative inline-block text-left">
                                                <Menu.Button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
                                                    <MoreHorizontal size={16} />
                                                </Menu.Button>
                                                <Menu.Items
                                                    className={`absolute right-0 ${idx > users.length - 3 ? "bottom-full mb-2 origin-bottom-right" : "mt-1 origin-top-right"} w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50`}
                                                >
                                                    {[
                                                        { label: "Set Active", value: "active", icon: <UserCheck size={14} className="text-emerald-600" /> },
                                                        { label: "Warn 1", value: "warning1", icon: <ShieldAlert size={14} className="text-amber-600" /> },
                                                        { label: "Warn 2", value: "warning2", icon: <ShieldAlert size={14} className="text-orange-600" /> },
                                                        { label: "Ban", value: "ban", icon: <Ban size={14} className="text-rose-600" /> },
                                                    ].map((action) => (
                                                        <Menu.Item key={action.value}>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleStatusChange(u.userId, action.value)}
                                                                    className={`${active ? "bg-slate-50" : ""} flex items-center gap-2 w-full text-left px-3 py-2 text-sm`}
                                                                >
                                                                    {action.icon}
                                                                    <span>{action.label}</span>
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu.Items>
                                            </Menu>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">— self —</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t">
                    <p className="text-sm text-slate-500">
                        Page {userPage} / {userTotalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                            disabled={userPage === 1}
                            className="px-3 py-1 border rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setUserPage((p) => p + 1)}
                            disabled={userPage === userTotalPages}
                            className="px-3 py-1 border rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
