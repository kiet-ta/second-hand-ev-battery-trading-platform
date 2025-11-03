import axios from "axios";

const GHN_API = import.meta.env.VITE_GHN_API;
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;

// ====================== GHN API ======================
export const ghnApi = {


    // 💰 2️⃣ Tính phí GHN
    async calcFee({ toDistrictId, toWardCode, weight = 2000 }) {
        try {
            const payload = {
                service_type_id: 2,
                from_district_id: 1454, // Quận 9 (ví dụ)
                from_ward_code: "21307", // Phường Tân Phú
                to_district_id: Number(toDistrictId),
                to_ward_code: String(toWardCode),
                weight: Number(weight),
                items: [{ weight: Number(weight) }],
            };

            console.log("📦 Gửi yêu cầu GHN:", payload);

            const res = await axios.post(
                `${GHN_API}/shipping-order/fee`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Token: GHN_TOKEN,
                        ShopId: GHN_SHOP_ID,
                    },
                }
            );

            console.log("✅ Phản hồi GHN:", res.data);
            return res.data?.data?.total || 0;
        } catch (err) {
            console.error("❌ Lỗi tính phí GHN chi tiết:");

            if (err.response) {
                console.log("🧾 Status:", err.response.status);
                console.log("🧾 Data:", err.response.data);
                console.log("🧾 Headers:", err.response.headers);

                //  Trả thông báo rõ ràng cho UI
                if (err.response?.data?.code_message === "RECEIVE_DISTRICT_IS_INVALID") {
                    return {
                        error: true,
                        message:
                            "GHN hiện chưa hỗ trợ giao hàng tới khu vực này. Vui lòng chọn địa chỉ khác.",
                    };
                }

                if (
                    err.response?.data?.message?.includes("route not found service")
                ) {
                    return {
                        error: true,
                        message:
                            "Không tìm thấy tuyến GHN cho khu vực này. Vui lòng thử dịch vụ khác hoặc địa chỉ khác.",
                    };
                }
            } else {
                console.log("🔴 Error:", err.message);
            }

            return { error: true, message: "Không thể tính phí GHN. Vui lòng thử lại sau." };
        }
    },
};
