import React from "react";
// REMOVED: import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import Card from "./Card";
import CardHeader from "./CardHeader";

/**
 * TransactionsContent component displays the transaction list.
 * All necessary data and utilities must be passed directly as props.
 */
export default function TransactionsContent({ transactions = [], currencyVND }) {

    return (
        <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
        >
            <Card>
                <CardHeader title="Transaction Monitor" icon={<ClipboardList size={18} />} />
                <div className="p-4 overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-2">Code</th>
                                <th className="py-2">Item</th>
                                <th className="py-2">Buyer</th>
                                <th className="py-2">Seller</th>
                                <th className="py-2">Price</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, idx) => (
                                <tr key={t.paymentId || idx} className="border-b last:border-0">
                                    <td className="py-2 font-medium text-slate-700">#{t.paymentId}</td>
                                    <td className="py-2">{t.items?.[0]?.title || "—"}</td>
                                    <td className="py-2">{t.buyerName}</td>
                                    <td className="py-2">{t.sellerName}</td>
                                    <td className="py-2">{currencyVND(t.totalAmount)}</td>
                                    <td className="py-2 capitalize">{t.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}
