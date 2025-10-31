// KycManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import kycApi from '../../api/kycApi'; 
import KycDocumentCard from '../../components/Cards/KYCCard'; 

const KycManagementPage = () => {
  const [currentTab, setCurrentTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDocuments([]); 
    try {
      let response;
      if (currentTab === 'pending') {
        response = await kycApi.getPendingKYC();
      } else if (currentTab === 'approved') {
        response = await kycApi.getApprovedKYC();
      } else if (currentTab === 'rejected') {
        response = await kycApi.getRejectedKYC();
      }
      setDocuments(response);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu:", err);
      setError("Không thể tải danh sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleApprove = async (docId, note) => {
    const payload = {
      note: note || "Tài liệu hợp lệ.", 
      verifiedAt: new Date().toISOString(),
      verifiedBy: localStorage.getItem("userId")
    };

    try {
      await kycApi.putApprovedKYC(docId, payload);
      alert(`Đã duyệt thành công tài liệu #${docId}`);

      fetchDocuments();

    } catch (err) {
      console.error("Lỗi khi duyệt:", err);
      alert("Đã xảy ra lỗi khi duyệt.");
    }
  };

  const handleReject = async (docId, note) => {
    if (!note || note.trim() === '') {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    const payload = {
      note: note, 
      verifiedAt: new Date().toISOString(),
      verifiedBy: localStorage.getItem("userId")
    };

    try {
      await kycApi.putRejectedKYC(docId, payload);
      alert(`Đã từ chối tài liệu #${docId}`);

      fetchDocuments();

    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      alert("Đã xảy ra lỗi khi từ chối.");
    }
  };

  const getTabClass = (tabName) => {
    return currentTab === tabName
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý duyệt KYC</h1>

      {/* Thanh Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setCurrentTab('pending')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('pending')}`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setCurrentTab('approved')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('approved')}`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setCurrentTab('rejected')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('rejected')}`}
          >
            Bị từ chối
          </button>
        </nav>
      </div>

      {/* Vùng nội dung */}
      <div>
        {loading && <p className="text-center text-gray-500">Đang tải...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && documents.length === 0 && (
          <p className="text-center text-gray-500">Không có tài liệu nào.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && documents.map(doc => (
            <KycDocumentCard
              key={doc.docId}
              document={doc}
              onApprove={handleApprove} 
              onReject={handleReject}   
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KycManagementPage;