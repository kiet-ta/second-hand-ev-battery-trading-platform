// KycDocumentCard.js
import React, { useState } from 'react';

// Component con để hiển thị ảnh an toàn
const DocImage = ({ label, url }) => {
  if (!url) return null; // Không hiển thị gì nếu URL là null

  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-gray-600">{label}:</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        <img src={url} alt={label} className="mt-1 w-full h-40 object-cover rounded-md border border-gray-200" />
      </a>
    </div>
  );
};

const KycDocumentCard = ({ document, onApprove, onReject }) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    docId,
    userId,
    idCardUrl,
    vehicleRegistrationUrl,
    selfieUrl,
    docUrl,
    submittedAt,
    status,
    verifiedBy,
    verifiedAt,
    note: verificationNote // Đổi tên để tránh xung đột với state 'note'
  } = document;

  const handleSubmitApprove = async () => {
    setIsProcessing(true);
    await onApprove(docId, note || 'Tài liệu hợp lệ'); // Dùng ghi chú nếu có, nếu không thì dùng mặc định
    setIsProcessing(false);
  };

  const handleSubmitReject = async () => {
    if (note.trim() === '') {
        alert("Vui lòng nhập lý do từ chối vào ô Ghi chú.");
        return;
    }
    setIsProcessing(true);
    await onReject(docId, note);
    setIsProcessing(false);
  };

  const formattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 flex flex-col">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Hồ sơ #{docId}</h3>
        <p className="text-sm text-gray-500">User ID: {userId}</p>
        <p className="text-sm text-gray-500">Nộp lúc: {formattedDate(submittedAt)}</p>
      </div>

      <div className="p-4 space-y-4 flex-grow">
        <DocImage label="CMND/CCCD" url={idCardUrl} />
        <DocImage label="Ảnh chân dung (Selfie)" url={selfieUrl} />
        <DocImage label="Đăng ký xe" url={vehicleRegistrationUrl} />
        <DocImage label="Tài liệu khác" url={docUrl} />
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        {status === 'pending' && (
          <div className="space-y-3">
            <div>
              <label htmlFor={`note-${docId}`} className="block text-sm font-medium text-gray-700">
                Ghi chú (Bắt buộc nếu Từ chối)
              </label>
              <textarea
                id={`note-${docId}`}
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nhập lý do nếu từ chối..."
                disabled={isProcessing}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReject}
                disabled={isProcessing}
                className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Từ chối'}
              </button>
              <button
                onClick={handleSubmitApprove}
                disabled={isProcessing}
                className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Duyệt'}
              </button>
            </div>
          </div>
        )}

        {status !== 'pending' && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Trạng thái: 
              <span className={`font-bold ${status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                {status === 'approved' ? ' Đã duyệt' : ' Bị từ chối'}
              </span>
            </p>
            <p className="text-sm text-gray-700">Người duyệt: <span className="font-medium">ID {verifiedBy}</span></p>
            <p className="text-sm text-gray-700">Ngày duyệt: <span className="font-medium">{formattedDate(verifiedAt)}</span></p>
            <p className="text-sm text-gray-700">Ghi chú: <span className="italic">"{verificationNote || 'N/A'}"</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycDocumentCard;