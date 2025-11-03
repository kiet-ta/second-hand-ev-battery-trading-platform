import React, { useState, useEffect, useMemo } from "react";
import walletApi from "../../api/walletApi";
import { Link } from "react-router-dom";

const formatCurrency = (amount) => {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatTime = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString("vi-VN", { hour12: false });
};

const WalletTransactionPage = () => {
  const userId = localStorage.getItem("userId");
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!userId) return;

    const fetchWallet = async () => {
      try {
        const data = await walletApi.getWalletByUser(userId);
        setWallet(data);
        const txs = await walletApi.getWalletTransactions(data.walletId);
        setTransactions(txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ví:", error);
      }
    };

    fetchWallet();
  }, [userId]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return transactions.slice(start, end);
  }, [transactions, currentPage]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-[#FFF8F0] min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-[#B8860B] mb-6">Ví của tôi</h1>

      {/* Wallet Balance */}
      <div className="bg-[#FAF0E6] p-6 rounded-xl shadow-md flex justify-between items-center mb-8">
        <div>
          <p className="text-sm text-gray-600">Số dư hiện tại</p>
          <h2 className="text-2xl font-bold text-[#B8860B]">
            {wallet ? formatCurrency(wallet.balance) : "Đang tải..."}
          </h2>
        </div>
        <button
          className="px-4 py-2 bg-[#FFD700] text-white font-medium rounded-lg shadow hover:bg-[#FFC107] transition"
        >
          <Link to="/recharge" className="text-white no-underline">
            Nạp tiền
          </Link>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FAF0E6] p-4 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-[#B8860B] mb-4">Giao dịch gần đây</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#FFF8F0]">
            <thead>
              <tr className="bg-[#FFE4B5] text-left text-sm font-medium text-gray-700">
                <th className="px-4 py-2 rounded-tl-lg">ID Giao Dịch</th>
                <th className="px-4 py-2">Loại</th>
                <th className="px-4 py-2">Số tiền</th>
                <th className="px-4 py-2 rounded-tr-lg">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map(tx => (
                <tr key={tx.transactionId} className="border-b border-[#FFDAB9] hover:bg-[#FFF5E1]">
                  <td className="px-4 py-2">{tx.transactionId}</td>
                  <td className="px-4 py-2 capitalize">{tx.type}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-2">{formatTime(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-[#FFEBCD] disabled:opacity-50"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 border rounded ${currentPage === idx + 1
                  ? "bg-[#FFD700] text-white"
                  : "hover:bg-[#FFEBCD]"
                  }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-[#FFEBCD] disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletTransactionPage;
