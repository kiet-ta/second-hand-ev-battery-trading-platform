import React, { useState } from "react";
import { ghnApi } from "../hooks/services/ghnApi";

export default function TestGHN() {
    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCalc = async () => {
        try {
            setLoading(true);
            const total = await ghnApi.calcFee({
                toDistrictId: 1451, // Quận 1
                toWardCode: "21211", // Phường Bến Nghé
                weight: 1200, // gram
            });
            setFee(total);
        } catch {
            alert("Lỗi khi tính phí GHN!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">🧾 Test tính phí GHN</h2>
            <button
                onClick={handleCalc}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
            >
                {loading ? "Đang tính..." : "Tính phí GHN"}
            </button>

            {fee !== null && (
                <p className="mt-4 text-lg">
                    📦 Phí giao hàng:{" "}
                    <strong>{fee.toLocaleString("vi-VN")} ₫</strong>
                </p>
            )}
        </div>
    );
}
