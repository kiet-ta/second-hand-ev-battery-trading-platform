import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadCloud } from "lucide-react";

export default function Step3ImageUploader({ onSubmit }) {
    const [fileList, setFileList] = useState([]);

    const handleRemove = (file) => {
        const newFileList = fileList.filter(item => item.uid !== file.uid);
        setFileList(newFileList);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG, PNG, or WEBP files!');
            return Upload.LIST_IGNORE;
        }
        setFileList(prevList => [...prevList, file]);
        return false; // Prevent automatic upload
    };

    const handleSubmit = () => {
        const filesToUpload = fileList.map(file => file.originFileObj || file);
        onSubmit(filesToUpload);
    };

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Upload Product Images</h3>
            <p className="text-sm text-gray-500 mb-4">Select all the images for your product. They will be sent to the server for processing.</p>

            <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                multiple
                accept=".png,.jpg,.jpeg,.webp"
            >
                {fileList.length >= 8 ? null : (
                    <div>
                        <UploadCloud />
                        <div style={{ marginTop: 8 }}>Select</div>
                    </div>
                )}
            </Upload>

            <div className="mt-6 text-right">
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={fileList.length === 0}
                >
                    Upload & Finish
                </Button>
            </div>
        </div>
    );
}

