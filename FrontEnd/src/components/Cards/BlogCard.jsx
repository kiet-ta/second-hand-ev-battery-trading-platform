import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";


export default function BlogCard({ post }) {
    return (
        <Link
            to={`/blog/${post.id}`}
            className="group block rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
            <div className="relative">
                <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {post.summary}
                </p>
                <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </p>
            </div>
        </Link>
    );
}
BlogCard.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        thumbnailUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
        summary: PropTypes.string,
        createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};
