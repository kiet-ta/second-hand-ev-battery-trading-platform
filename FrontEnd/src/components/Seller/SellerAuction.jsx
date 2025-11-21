import React, { useState } from "react";
import { Upload, Clock, Tag } from "lucide-react";

export default function SellerAuctionPage({ onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        startPrice: "",
        startTime: "",
        endTime: "",
        image: null,
        imagePreview: null,
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const today = new Date().toISOString().split("T")[0];

            const itemBody = {
                itemId: 0,
                itemType: "Ev",
                categoryId: 1,
                title: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: 1,
                createdAt: today,
                updatedAt: today,
            };

            const itemRes = await fetch(`${baseURL}item`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemBody),
            });

            const text = await itemRes.text();

            if (!itemRes.ok) throw new Error("Không thể tạo xe mới! " + text);

            let itemData;
            try {
                itemData = JSON.parse(text);
            } catch (e) {
                console.error("❌ Không parse được JSON:", e);
            }


            const auctionBody = {
                itemId: itemData.itemId, // ✅ Lấy ID thật
                startingPrice: parseFloat(formData.startPrice),
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
            };


            const auctionRes = await fetch(`${baseURL}/auction`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(auctionBody),
            });

            if (!auctionRes.ok) {
                const errText = await auctionRes.text();
                throw new Error("Không thể tạo đấu giá! " + errText);
            }

            const auctionData = await auctionRes.json();
            console.log("✅ Auction created:", auctionData);

            alert("🎉 Tạo đấu giá thành công!");
            onClose();
        } catch (err) {
            console.error("❌ Lỗi khi tạo đấu giá:", err);
            alert("❌ " + err.message);
        }
    };



    return (
        <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Create EV Auction</h1>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
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
                                <Tag className="w-5 h-5 text-gray-700" /> Vehicle Information
                            </h2>

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Vehicle Name
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-orange-500"
                                placeholder="Enter EV name"
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
                                placeholder="Short description..."
                                required
                            />

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Base Price (₫)
                            </label>
                            <input
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-orange-500"
                                required
                            />

                            {/* Image upload */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Vehicle Image
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

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Starting Price (₫)
                            </label>
                            <input
                                name="startPrice"
                                type="number"
                                value={formData.startPrice}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                required
                            />

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Start Time
                            </label>
                            <input
                                name="startTime"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 mb-3 focus:ring-1 focus:ring-gray-800"
                                required
                            />

                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                End Time
                            </label>
                            <input
                                name="endTime"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-gray-800"
                                required
                            />
                        </div>

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
