// KycManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import kycApi from '../../api/kycApi';
import PermissionChecker from '../../components/Manager/PermissionChecker';

const ImageModal = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <img
        src={url}
        alt="Zoomed"
        className="max-h-3/4 max-w-3/4 object-contain rounded shadow-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const KycDocumentCard = ({ document, onApprove, onReject }) => {
  let idCardImages = [];

  if (document.idCardUrl) {
    try {
      const parsed = JSON.parse(document.idCardUrl);

      if (parsed.front) idCardImages.push(parsed.front);
      if (parsed.back) idCardImages.push(parsed.back);
    } catch {
      // fallback if data is old format ("url1,url2")
      idCardImages = document.idCardUrl.split(',');
    }
  }
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [message, setMessage] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const handleRejectClick = async () => {
    if (!rejectNote.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập lý do từ chối.' });
      return;
    }
    try {
      await onReject(document.docId, rejectNote);
      setMessage({ type: 'success', text: `Đã từ chối tài liệu #${document.docId}` });
      setShowRejectInput(false);
      setRejectNote('');
    } catch {
      setMessage({ type: 'error', text: `Không thể từ chối tài liệu #${document.docId}` });
    }
  };

  return (
    <div className="border w-64 rounded-lg shadow p-3 flex flex-col bg-white mb-4 text-sm">
      {/* Header */}
      <div className="mb-1 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Người dùng #{document.userId}</h3>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded ${document.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-800'
            : document.status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}
        >
          {document.status === 'Pending'
            ? 'CHỜ DUYỆT'
            : document.status === 'Approved'
              ? 'ĐÃ DUYỆT'
              : 'BỊ TỪ CHỐI'}
        </span>
      </div>

      <p className="text-gray-500 mb-1 text-xs">
        Ngày nộp: {new Date(document.submittedAt).toLocaleString()}
      </p>

      {/* Store info */}
      {document.storeName && (
        <p className="text-gray-600 mb-1 text-xs">
          Tên cửa hàng: {document.storeName}
        </p>
      )}
      {document.storePhone && (
        <p className="text-gray-600 mb-1 text-xs">SĐT cửa hàng: {document.storePhone}</p>
      )}
      {document.storeLogoUrl && (
        <img
          src={document.storeLogoUrl}
          alt="Logo cửa hàng"
          className="w-full h-16 object-contain rounded border mb-1 cursor-pointer"
          onClick={() => setZoomImage(document.storeLogoUrl)}
        />
      )}

      {/* ID Card images */}
      {idCardImages.length > 0 && (
        <div className="flex gap-1 mb-1 flex-wrap">
          {idCardImages.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`CMND ${idx + 1}`}
              className="w-1/2 h-16 object-cover rounded border cursor-pointer"
              onClick={() => setZoomImage(url)}
            />
          ))}
        </div>
      )}

      {/* Vehicle registration */}
      {document.vehicleRegistrationUrl && (
        <div className="mb-1">
          <h4 className="font-medium text-xs">Đăng ký xe</h4>
          <img
            src={document.vehicleRegistrationUrl}
            alt="Đăng ký xe"
            className="w-full h-16 object-cover rounded border mt-1 cursor-pointer"
            onClick={() => setZoomImage(document.vehicleRegistrationUrl)}
          />
        </div>
      )}

      {/* Selfie */}
      {document.selfieUrl && (
        <div className="mb-1">
          <h4 className="font-medium text-xs">Ảnh Selfie</h4>
          <img
            src={document.selfieUrl}
            alt="Selfie"
            className="w-full h-20 object-cover rounded border mt-1 cursor-pointer"
            onClick={() => setZoomImage(document.selfieUrl)}
          />
        </div>
      )}

      {/* Document URL */}
      {document.docUrl && (
        <div className="mb-1">
          <h4 className="font-medium text-xs">Tài liệu</h4>
          <img
            src={document.docUrl}
            alt="Tài liệu"
            className="w-full h-16 object-cover rounded border mt-1 cursor-pointer"
            onClick={() => setZoomImage(document.docUrl)}
          />
        </div>
      )}

      {/* Note */}
      {document.note && (
        <p className="text-gray-600 mb-1 text-xs">Ghi chú: {document.note}</p>
      )}

      {/* Action buttons */}
      {document.status === 'Pending' && (
        <div className="mt-1 flex flex-col gap-1">
          <PermissionChecker permissionId={3}>
            <button
              onClick={() => onApprove(document.docId, 'Đã duyệt')}
              className="bg-green-500 text-white py-1 rounded hover:bg-green-600 transition text-sm"
            >
              Duyệt
            </button>
          </PermissionChecker>

          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            className="bg-red-500 text-white py-1 rounded hover:bg-red-600 transition text-sm"
          >
            Từ chối
          </button>

          {showRejectInput && (
            <div className="mt-1 flex flex-col gap-1">
              <input
                type="text"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="border rounded px-2 py-1 w-full text-sm"
              />
              <button
                onClick={handleRejectClick}
                className="bg-red-600 text-white py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Gửi từ chối
              </button>
            </div>
          )}

          {message && (
            <p
              className={`text-sm mt-1 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}

      {zoomImage && <ImageModal url={zoomImage} onClose={() => setZoomImage(null)} />}
    </div>
  );
};

const KycManagementPage = () => {
  const [currentTab, setCurrentTab] = useState('Pending');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDocuments([]);
    try {
      let response;
      if (currentTab === 'Pending') {
        response = await kycApi.getPendingKYC();
      } else if (currentTab === 'Approved') {
        response = await kycApi.getApprovedKYC();
      } else if (currentTab === 'Rejected') {
        response = await kycApi.getRejectedKYC();
      }
      console.log('KYC Documents:', response);
      setDocuments(response);
    } catch (err) {
      console.error('Lỗi tải KYC:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleApprove = async (docId, note) => {
    const payload = {
      note: note || 'Đã duyệt',
      verifiedAt: new Date().toISOString(),
      verifiedBy: localStorage.getItem('userId'),
    };
    try {
      await kycApi.putApprovedKYC(docId, payload);
      setStatusMessage({ type: 'success', text: `Đã duyệt tài liệu #${docId}` });
      fetchDocuments();
    } catch {
      setStatusMessage({ type: 'error', text: `Không thể duyệt tài liệu #${docId}` });
    }
  };

  const handleReject = async (docId, note) => {
    if (!note || note.trim() === '') {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập lý do từ chối.' });
      return;
    }
    const payload = {
      note,
      verifiedAt: new Date().toISOString(),
      verifiedBy: localStorage.getItem('userId'),
    };
    try {
      await kycApi.putRejectedKYC(docId, payload);
      setStatusMessage({ type: 'success', text: `Đã từ chối tài liệu #${docId}` });
      fetchDocuments();
    } catch {
      setStatusMessage({ type: 'error', text: `Không thể từ chối tài liệu #${docId}` });
    }
  };

  const getTabClass = (tabName) =>
    currentTab === tabName
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý KYC</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setCurrentTab('Pending')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${getTabClass(
              'Pending'
            )}`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setCurrentTab('Approved')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${getTabClass(
              'Approved'
            )}`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setCurrentTab('Rejected')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${getTabClass(
              'Rejected'
            )}`}
          >
            Bị từ chối
          </button>
        </nav>
      </div>

      {statusMessage && (
        <p
          className={`mb-2 text-center font-medium ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {statusMessage.text}
        </p>
      )}

      {/* Content */}
      <div className="flex flex-wrap gap-4">
        {loading && <p className="text-center text-gray-500 w-full">Đang tải...</p>}
        {error && <p className="text-center text-red-500 w-full">{error}</p>}
        {!loading && !error && documents.length === 0 && (
          <p className="text-center text-gray-500 w-full">Không có tài liệu nào.</p>
        )}

        {!loading &&
          !error &&
          documents.map((doc) => (
            <KycDocumentCard
              key={doc.docId}
              document={doc}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
      </div>
    </div>
  );
};

export default KycManagementPage;
