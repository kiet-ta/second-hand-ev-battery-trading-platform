import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud } from "lucide-react";

// --- IMPORTANT: REPLACE WITH YOUR CLOUDINARY DETAILS ---
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
// ---------------------------------------------------------

// Spinner for loading states, kept with the component that uses it
const Spinner = () => (
    <div className="flex justify-center items-center my-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

// The self-contained ImageUploader component
export default function ImageUploader({ onUploadSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setError('');
        setIsLoading(true);
        setPreviewUrl(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        if (CLOUDINARY_CLOUD_NAME === "your_cloud_name_here" || CLOUDINARY_UPLOAD_PRESET === "your_upload_preset_here") {
            setError("Please configure Cloudinary credentials.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );
            
            const finalUrl = response.data.secure_url;

            if (response.data.eager && Array.isArray(response.data.eager)) {
                const transformedUrls = response.data.eager.map(t => t.secure_url);
                console.log('Found transformed URLs:', transformedUrls);
            }
            console.log(finalUrl)
            onUploadSuccess(finalUrl);
            setPreviewUrl(finalUrl);
        } catch (err) {
            console.error('Error uploading to Cloudinary:', err);
            setError('Upload failed. Please check settings.');
            setPreviewUrl('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="font-medium text-sm text-slate-700">Thumbnail</label>
            <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-1">
                {isLoading ? <Spinner /> : 
                 previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" /> :
                 <p className="text-slate-500 text-sm text-center">Select an image to upload</p>
                }
            </div>
            <div>
                <label htmlFor="file-upload" className={`inline-block py-2 px-4 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ''}`}>
                    {isLoading ? 'Uploading...' : 'Select Image'}
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} disabled={isLoading} className="hidden" />
            </div>
            {error && <p className="text-red-500 text-sm font-semibold mt-2">{error}</p>}
        </div>
    );
}

