import React from 'react';

function SuccessPage() {
  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-10 rounded-2xl shadow-xl">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Đăng ký thành công!</h1>
              <p className="text-gray-600 mt-2">Hồ sơ của bạn đã được gửi. Chúng tôi sẽ liên hệ với bạn sau khi xét duyệt.</p>
          </div>
      </div>
  );
}

export default SuccessPage;
