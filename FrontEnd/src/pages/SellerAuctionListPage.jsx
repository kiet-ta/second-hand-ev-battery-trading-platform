import React, { useEffect, useState } from "react";
import { Clock, Eye, Edit, Trash2 } from "lucide-react";
import SellerAuction from "../components/SellerAuction";

export default function SellerAuctionListPage() {
    const [auctions, setAuctions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fadeState, setFadeState] = useState("in");

    useEffect(() => {
        if (showModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
    }, [showModal]);

    const openModal = () => {
        setShowModal(true);
        setFadeState("in");
    };

    const closeModal = () => {
        setFadeState("out");
        setTimeout(() => setShowModal(false), 200);
    };

    useEffect(() => {
        const dummy = [
            {
                id: 1,
                name: "Tesla Model 3 Battery Pack 60kWh",
                image:
                    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500",
                startPrice: 12000000,
                highestBid: 15000000,
                bidsCount: 7,
                status: "ongoing",
                endTime: "2025-10-10T15:00:00Z",
            },
            {
                id: 2,
                name: "VinFast VF9 2024 Premium EV",
                image:
                    "https://images.unsplash.com/photo-1600523119184-2c9c3fda35d1?w=500",
                startPrice: 800000000,
                highestBid: 810000000,
                bidsCount: 3,
                status: "upcoming",
                endTime: "2025-10-12T12:00:00Z",
            },
            {
                id: 3,
                name: "Used Nissan Leaf Battery 40kWh",
                image:
                    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=500",
                startPrice: 5000000,
                highestBid: 5200000,
                bidsCount: 11,
                status: "ended",
                endTime: "2025-10-02T08:00:00Z",
            },
        ];
        setAuctions(dummy);
    }, []);

    const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

    const getStatusColor = (status) => {
        switch (status) {
            case "upcoming":
                return "bg-yellow-100 text-yellow-700";
            case "ongoing":
                return "bg-green-100 text-green-700";
            case "ended":
                return "bg-gray-100 text-gray-500";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-6">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        My Auction Listings
                    </h1>
                    <button
                        onClick={openModal}
                        className="px-5 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 transition"
                    >
                        + Create New Auction
                    </button>
                </div>

                {/* Auction List */}
                <div className="space-y-4">
                    {auctions.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center bg-white rounded-lg border border-gray-200 hover:shadow-sm transition overflow-hidden"
                        >
                            <div className="w-48 h-36 flex-shrink-0">
                                <img
                                    src={a.image}
                                    alt={a.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 px-6 py-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {a.name}
                                    </h3>
                                    <span
                                        className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                                            a.status
                                        )}`}
                                    >
                                        {a.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                                    <div>
                                        <p>
                                            Start:{" "}
                                            <span className="font-medium">
                                                {formatPrice(a.startPrice)}
                                            </span>
                                        </p>
                                        <p>
                                            Current Bid:{" "}
                                            <span className="text-gray-900 font-semibold">
                                                {formatPrice(a.highestBid)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p>
                                            Bids:{" "}
                                            <span className="font-medium">{a.bidsCount}</span>
                                        </p>
                                        <p className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            Ends: {new Date(a.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center gap-4 mt-3 text-sm">
                                    <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                                        <Eye className="w-4 h-4 text-gray-600" /> View
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                                        <Edit className="w-4 h-4 text-gray-600" /> Edit
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                                        <Trash2 className="w-4 h-4 text-gray-600" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 ${fadeState === "in" ? "animate-fadeIn" : "animate-fadeOut"
                        }`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <SellerAuction onClose={closeModal} />
                </div>
            )}
        </div>
    );
}
