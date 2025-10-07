import { Modal, Rate, Input } from "antd";
import { useState, useEffect } from "react";

export default function RatingModal({ visible, onCancel, onSubmit, order }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // reset values when modal opens with a new order
  useEffect(() => {
    if (order) {
      setRating(order.rating || 0);
      setComment(order.comment || "");
    }
  }, [order]);

  const handleSubmit = () => {
    if (order) {
      onSubmit(order.id, rating, comment);
    }
  };

  return (
    <Modal
      title={`Rate ${order?.title}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Submit"
      cancelText="Cancel"
      centered
    >
      <div className="space-y-4">
        {/* Rating Stars */}
        <Rate value={rating} onChange={setRating} />

        {/* Comment Box */}
        <Input.TextArea
          rows={4}
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}
