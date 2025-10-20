import React, { useState, useRef } from 'react';

// --- Cloudinary Configuration ---
// These are now used for direct API calls instead of the widget.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ImageUploadField = ({ label, onUpload, imageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Function to trigger the hidden file input
  const handleUploadClick = () => {
    // Clear any previous errors when the user tries again
    setError(null);
    fileInputRef.current?.click();
  };

  // Function to handle the file selection and upload process
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error.message || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.secure_url);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError('Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      // Reset file input value to allow re-uploading the same file
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 ${error ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
        {imageUrl && !error ? (
          <div className="text-center">
            <img src={imageUrl} alt="Preview" className="mx-auto h-32 rounded-md object-contain" />
            <button type="button" onClick={handleUploadClick} disabled={isUploading} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed">
              {isUploading ? 'Đang tải...' : 'Tải ảnh khác'}
            </button>
          </div>
        ) : (
          <div className="space-y-1 text-center">
             {isUploading ? (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-sm text-gray-600">Đang tải lên...</p>
                </>
             ) : (
                <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>Nhấn để tải ảnh lên</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                </>
             )}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploadField;

