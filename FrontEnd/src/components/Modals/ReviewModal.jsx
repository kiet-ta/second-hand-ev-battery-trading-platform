import React, { useState } from "react";
import StarRating from "../StarRatting"; // Import the star component
import ImageUploader from "../ImageUploader"; // Assuming this is your uploader component's path
import { X } from "lucide-react";
import reviewApi from "../../api/reviewApi";

export default function ReviewModal({ order, isOpen, onClose, onReviewSubmit }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewImages, setReviewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleImageUpload = (url) => {
        if (reviewImages.length < 5) { // Limit to 5 images
            setReviewImages((prevImages) => [...prevImages, url]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá.");
            return;
        }
        setError("");
        setIsSubmitting(true);

        const reviewData = {
            reviewerId: localStorage.getItem("userId"),
            targetUserId: 1, // ASSUMPTION: Your order object has a 'sellerId'
            itemId: order.itemId,
            rating: rating,
            comment: comment,
            reviewDate: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            reviewImages: reviewImages.map(url => ({ imageUrl: url })),
        };

        try {
            console.log(reviewData)
            await reviewApi.postReview(reviewData)
            await onReviewSubmit(reviewData);
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi gửi đánh giá.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h2>
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <img src={order.image} alt={order.title} className="w-20 h-20 rounded-md object-cover" />
                    <div>
                        <h3 className="font-semibold text-lg">{order.title}</h3>
                        <p className="text-sm text-gray-500">Mã đơn hàng: #{order.orderCode}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Chất lượng sản phẩm</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">Bình luận</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé!"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Thêm hình ảnh ({reviewImages.length}/5)</label>
                        <ImageUploader onUploadSuccess={handleImageUpload} />
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {reviewImages.map((url, index) => (
                                <img key={index} src={url} alt={`review-img-${index}`} className="w-20 h-20 rounded-md object-cover border" />
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? "Đang gửi..." : "Hoàn thành"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}