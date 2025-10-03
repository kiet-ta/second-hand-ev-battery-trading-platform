import React, { useState } from 'react';
import { Calendar, Car, Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function PurchaseHistory() {
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Mock data - trong thực tế sẽ fetch từ API
    const [orders] = useState([
        {
            id: 'ORD-2024-001',
            car: {
                name: 'Honda City 2020',
                image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
                brand: 'Honda',
                year: 2020,
                odometer: '45,000 km',
                color: 'Trắng'
            },
            price: 520000000,
            purchaseDate: '15/01/2024',
            status: 'completed',
            deliveryDate: '20/01/2024',
            paymentMethod: 'Chuyển khoản ngân hàng'
        },
        {
            id: 'ORD-2024-002',
            car: {
                name: 'Toyota Vios 2019',
                image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
                brand: 'Toyota',
                year: 2019,
                odometer: '62,000 km',
                color: 'Bạc'
            },
            price: 480000000,
            purchaseDate: '28/02/2024',
            status: 'processing',
            deliveryDate: '05/03/2024',
            paymentMethod: 'Chuyển khoản ngân hàng'
        },
        {
            id: 'ORD-2023-045',
            car: {
                name: 'Mazda CX-5 2018',
                image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400',
                brand: 'Mazda',
                year: 2018,
                odometer: '78,000 km',
                color: 'Đỏ'
            },
            price: 750000000,
            purchaseDate: '10/12/2023',
            status: 'completed',
            deliveryDate: '15/12/2023',
            paymentMethod: 'Tiền mặt'
        },
        {
            id: 'ORD-2024-003',
            car: {
                name: 'Hyundai Accent 2021',
                image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400',
                brand: 'Hyundai',
                year: 2021,
                odometer: '25,000 km',
                color: 'Đen'
            },
            price: 510000000,
            purchaseDate: '05/03/2024',
            status: 'cancelled',
            deliveryDate: '-',
            paymentMethod: 'Chuyển khoản ngân hàng'
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Hoàn thành';
            case 'processing': return 'Đang xử lý';
            case 'cancelled': return 'Đã hủy';
            default: return 'Không xác định';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5" />;
            case 'processing': return <Clock className="w-5 h-5" />;
            case 'cancelled': return <XCircle className="w-5 h-5" />;
            default: return null;
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Sử Mua Xe</h1>
                    <p className="text-gray-600">Quản lý và theo dõi các đơn hàng của bạn</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả ({orders.length})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Hoàn thành ({orders.filter(o => o.status === 'completed').length})
                        </button>
                        <button
                            onClick={() => setFilter('processing')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'processing'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đang xử lý ({orders.filter(o => o.status === 'processing').length})
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'cancelled'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã hủy ({orders.filter(o => o.status === 'cancelled').length})
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    Mã đơn: {order.id}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Ngày mua: {order.purchaseDate}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Car Info */}
                                    <div className="flex gap-4 mb-4">
                                        <img
                                            src={order.car.image}
                                            alt={order.car.name}
                                            className="w-32 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {order.car.name}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Car className="w-4 h-4 mr-1" />
                                                    Hãng: {order.car.brand}
                                                </div>
                                                <div>Năm: {order.car.year}</div>
                                                <div>ODO: {order.car.odometer}</div>
                                                <div>Màu: {order.car.color}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-600">
                                                    Phương thức thanh toán: <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Ngày giao xe: <span className="font-medium text-gray-900">{order.deliveryDate}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600 mb-1">Tổng tiền</div>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {formatPrice(order.price)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t mt-4 pt-4 flex gap-3">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                        {order.status === 'completed' && (
                                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                Mua lại
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Thông tin đơn hàng</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mã đơn hàng:</span>
                                            <span className="font-medium">{selectedOrder.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày mua:</span>
                                            <span className="font-medium">{selectedOrder.purchaseDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày giao xe:</span>
                                            <span className="font-medium">{selectedOrder.deliveryDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Thông tin xe</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <img
                                            src={selectedOrder.car.image}
                                            alt={selectedOrder.car.name}
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                        <h4 className="text-lg font-semibold mb-3">{selectedOrder.car.name}</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Hãng xe:</span>
                                                <span className="ml-2 font-medium">{selectedOrder.car.brand}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Năm sản xuất:</span>
                                                <span className="ml-2 font-medium">{selectedOrder.car.year}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Số km đã đi:</span>
                                                <span className="ml-2 font-medium">{selectedOrder.car.odometer}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Màu sắc:</span>
                                                <span className="ml-2 font-medium">{selectedOrder.car.color}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Thanh toán</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phương thức:</span>
                                            <span className="font-medium">{selectedOrder.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Tổng tiền:</span>
                                            <span className="text-blue-600">{formatPrice(selectedOrder.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full mt-6 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}