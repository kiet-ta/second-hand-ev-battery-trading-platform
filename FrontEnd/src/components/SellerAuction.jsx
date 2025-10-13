import React, { useState } from "react";
import { Upload, Clock, Tag } from "lucide-react";

export default function SellerAuctionPage({ onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        startPrice: "",
        bidStep: "",
        buyNowPrice: "", // ✅ Thêm buyNowPrice
        startTime: "",
        endTime: "",
        image: null,
        imagePreview: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file),
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Auction created successfully!");
        onClose();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Create New Auction</h1>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-700" /> Product Information
                            </h2>

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Product Name
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-orange-500"
                                placeholder="Enter product name"
                                required
                            />

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 h-24 focus:ring-1 focus:ring-orange-500"
                                placeholder="Enter short description..."
                                required
                            />

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-orange-500"
                                required
                            >
                                <option value="">Select category</option>
                                <option value="ev">Electric Vehicle</option>
                                <option value="battery">Battery</option>
                                <option value="accessory">Accessory</option>
                            </select>

                            {/* Image upload */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Product Image
                                </label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-400">
                                    <Upload className="w-6 h-6 text-gray-500" />
                                    <span className="text-gray-500 text-sm mt-1">
                                        Click to upload
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {formData.imagePreview && (
                                    <img
                                        src={formData.imagePreview}
                                        alt="Preview"
                                        className="mt-3 rounded border w-full h-48 object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-700" /> Auction Details
                            </h2>

                            {/* Starting Price */}
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Starting Price (₫)
                            </label>
                            <input
                                name="startPrice"
                                value={formData.startPrice}
                                onChange={handleChange}
                                type="number"
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                required
                            />

                            {/* Bid Step */}
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Bid Increment (₫)
                            </label>
                            <input
                                name="bidStep"
                                value={formData.bidStep}
                                onChange={handleChange}
                                type="number"
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                required
                            />

                            {/* ✅ Buy Now Price */}
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Buy Now Price (₫)
                            </label>
                            <input
                                name="buyNowPrice"
                                value={formData.buyNowPrice}
                                onChange={handleChange}
                                type="number"
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                placeholder="Optional — user can buy instantly at this price"
                            />

                            {/* Start Time */}
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Start Time
                            </label>
                            <input
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                type="datetime-local"
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                required
                            />

                            {/* End Time */}
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                End Time
                            </label>
                            <input
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                type="datetime-local"
                                className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-gray-800"
                                required
                            />
                        </div>

                        {/* Preview */}
                        {formData.name && (
                            <div className="border rounded-lg p-4 bg-orange-50">
                                <h3 className="text-gray-700 font-medium mb-2">
                                    Product Preview
                                </h3>
                                <div className="flex gap-3">
                                    {formData.imagePreview ? (
                                        <img
                                            src={formData.imagePreview}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 rounded"></div>
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-800">
                                            {formData.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {formData.description}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Starting at{" "}
                                            <span className="text-orange-600 font-semibold">
                                                {formData.startPrice
                                                    ? new Intl.NumberFormat("vi-VN").format(
                                                        formData.startPrice
                                                    )
                                                    : "—"}₫
                                            </span>
                                        </p>
                                        {formData.buyNowPrice && (
                                            <p className="text-sm text-green-600 font-medium mt-1">
                                                Buy Now:{" "}
                                                {new Intl.NumberFormat("vi-VN").format(
                                                    formData.buyNowPrice
                                                )}
                                                ₫
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                            >
                                Create Auction
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
