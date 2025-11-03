import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, message, Spin } from "antd";
import "ckeditor5/ckeditor5.css";

async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const response = await fetch(url, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.secure_url;
}

export default function NewsEditor({ initialData, onDataChange }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      category: "",
      summary: "",
      authorId: 0,
      thumbnailUrl: "",
      content: "",
      tags: "",
    }
  );
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        content: initialData.content || "",
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    const updated = { ...formData, content: data };
    setFormData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      const updated = { ...formData, thumbnailUrl: url };
      setFormData(updated);
      if (onDataChange) onDataChange(updated);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    const updated = { ...formData, thumbnailUrl: "" };
    setFormData(updated);
    if (onDataChange) onDataChange(updated);
  };

  return (
    <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
      <input
        type="text"
        name="title"
        placeholder="News title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded-lg"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="p-2 border border-slate-300 rounded-lg"
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
          className="p-2 border border-slate-300 rounded-lg"
        />
      </div>
      <textarea
        name="summary"
        placeholder="Short summary..."
        value={formData.summary}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded-lg min-h-[80px]"
      />
      <div className="space-y-2">
        <label className="font-medium text-slate-700">Thumbnail</label>
        {!formData.thumbnailUrl ? (
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <Spin size="small" />}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail preview"
              className="w-32 h-20 object-cover rounded-lg border"
            />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemoveThumbnail}>
              Remove
            </Button>
          </div>
        )}
      </div>
      <CKEditor
        editor={ClassicEditor}
        data={formData.content}
        onReady={(editor) => (editorRef.current = editor)}
        onChange={handleEditorChange}
      />
    </div>
  );
}
