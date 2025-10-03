import React, { useState } from 'react';
import { Calendar, Car, DollarSign, User, Phone, MapPin, TrendingUp, Eye, Download, Package } from 'lucide-react';

export default function SellerHistory() {
    const [filter, setFilter] = useState('all');
    const [selectedSale, setSelectedSale] = useState(null);

    // Mock data - trong thực tế sẽ fetch từ API
    const [sales] = useState([
        {
            id: 'SALE-2024-001',
            car: {
                name: 'Honda City 2020',
                image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
                brand: 'Honda',
                year: 2020,
                odometer: '45,000 km',
                color: 'Trắng',
                licensePlate: '51A-12345'
            },
            originalPrice: 550000000,
            soldPrice: 520000000,
            listedDate: '01/01/2024',
            soldDate: '15/01/2024',
            status: 'completed',
            buyer: {
                name: 'Nguyễn Văn A',
                phone: '0901234567',
                address: 'Quận 1, TP.HCM'
            },
            commission: 26000000,
            paymentMethod: 'Chuyển khoản ngân hàng',
            daysToSell: 14
        },
        {
            id: 'SALE-2024-002',
            car: {
                name: 'Toyota Vios 2019',
                image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
                brand: 'Toyota',
                year: 2019,
                odometer: '62,000 km',
                color: 'Bạc',
                licensePlate: '59B-67890'
            },
            originalPrice: 500000000,
            soldPrice: 480000000,
            listedDate: '10/02/2024',
            soldDate: '28/02/2024',
            status: 'processing',
            buyer: {
                name: 'Trần Thị B',
                phone: '0912345678',
                address: 'Quận 7, TP.HCM'
            },
            commission: 24000000,
            paymentMethod: 'Chuyển khoản ngân hàng',
            daysToSell: 18
        },
        {
            id: 'SALE-2023-045',
            car: {
                name: 'Mazda CX-5 2018',
                image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400',
                brand: 'Mazda',
                year: 2018,
                odometer: '78,000 km',
                color: 'Đỏ',
                licensePlate: '50C-11111'
            },
            originalPrice: 800000000,
            soldPrice: 750000000,
            listedDate: '25/11/2023',
            soldDate: '10/12/2023',
            status: 'completed',
            buyer: {
                name: 'Lê Văn C',
                phone: '0923456789',
                address: 'Bình Thạnh, TP.HCM'
            },
            commission: 37500000,
            paymentMethod: 'Tiền mặt',
            daysToSell: 15
        },
        {
            id: 'SALE-2024-003',
            car: {
                name: 'Hyundai Accent 2021',
                image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400',
                brand: 'Hyundai',
                year: 2021,
                odometer: '25,000 km',
                color: 'Đen',
                licensePlate: '51D-22222'
            },
            originalPrice: 530000000,
            soldPrice: 510000000,
            listedDate: '20/02/2024',
            soldDate: '05/03/2024',
            status: 'pending_payment',
            buyer: {
                name: 'Phạm Thị D',
                phone: '0934567890',
                address: 'Quận 3, TP.HCM'
            },
            commission: 25500000,
            paymentMethod: 'Chuyển khoản ngân hàng',
            daysToSell: 14
        },
        {
            id: 'SALE-2024-004',
            car: {
                name: 'Kia Morning 2020',
                image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
                brand: 'Kia',
                year: 2020,
                odometer: '35,000 km',
                color: 'Xanh',
                licensePlate: '51E-33333'
            },
            originalPrice: 350000000,
            soldPrice: 320000000,
            listedDate: '01/03/2024',
            soldDate: '15/03/2024',
            status: 'completed',
            buyer: {
                name: 'Hoàng Văn E',
                phone: '0945678901',
                address: 'Quận 10, TP.HCM'
            },
            commission: 16000000,
            paymentMethod: 'Chuyển khoản ngân hàng',
            daysToSell: 14
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Hoàn thành';
            case 'processing': return 'Đang xử lý';
            case 'pending_payment': return 'Chờ thanh toán';
            default: return 'Không xác định';
        }
    };

    const filteredSales = filter === 'all'
        ? sales
        : sales.filter(sale => sale.status === filter);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const totalRevenue = sales
        .filter(s => s.status === 'completed')
        .reduce((sum, sale) => sum + sale.soldPrice, 0);

    const totalCommission = sales
        .filter(s => s.status === 'completed')
        .reduce((sum, sale) => sum + sale.commission, 0);

    const totalSold = sales.filter(s => s.status === 'completed').length;

    const avgDaysToSell = sales
        .filter(s => s.status === 'completed')
        .reduce((sum, sale) => sum + sale.daysToSell, 0) / totalSold || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Sử Bán Xe</h1>
                    <p className="text-gray-600">Quản lý và theo dõi các xe đã bán</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatPrice(totalRevenue)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Hoa hồng nhận được</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatPrice(totalCommission)}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Số xe đã bán</p>
                                <p className="text-2xl font-bold text-purple-600">{totalSold}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Car className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">TB ngày bán</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {Math.round(avgDaysToSell)} ngày
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tất cả ({sales.length})
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Hoàn thành ({sales.filter(s => s.status === 'completed').length})
                            </button>
                            <button
                                onClick={() => setFilter('processing')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'processing'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Đang xử lý ({sales.filter(s => s.status === 'processing').length})
                            </button>
                            <button
                                onClick={() => setFilter('pending_payment')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending_payment'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Chờ thanh toán ({sales.filter(s => s.status === 'pending_payment').length})
                            </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-4 h-4" />
                            Xuất báo cáo
                        </button>
                    </div>
                </div>

                {/* Sales List */}
                <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                        </div>
                    ) : (
                        filteredSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Sale Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    Mã GD: {sale.id}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sale.status)}`}>
                                                    {getStatusText(sale.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Đăng: {sale.listedDate}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Bán: {sale.soldDate}
                                                </div>
                                                <div className="text-blue-600 font-medium">
                                                    {sale.daysToSell} ngày
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Car and Buyer Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                        {/* Car Info */}
                                        <div className="flex gap-4">
                                            <img
                                                src={sale.car.image}
                                                alt={sale.car.name}
                                                className="w-32 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {sale.car.name}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                                                    <div>Biển số: {sale.car.licensePlate}</div>
                                                    <div>Năm: {sale.car.year}</div>
                                                    <div>ODO: {sale.car.odometer}</div>
                                                    <div>Màu: {sale.car.color}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buyer Info */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Thông tin người mua
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <User className="w-4 h-4 mr-2" />
                                                    {sale.buyer.name}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    {sale.buyer.phone}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    {sale.buyer.address}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Details */}
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Giá niêm yết</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {formatPrice(sale.originalPrice)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Giá bán thực tế</div>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {formatPrice(sale.soldPrice)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Hoa hồng (5%)</div>
                                                <div className="text-lg font-semibold text-blue-600">
                                                    {formatPrice(sale.commission)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Thanh toán</div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {sale.paymentMethod}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t mt-4 pt-4 flex gap-3">
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Hóa đơn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Chi tiết giao dịch</h2>
                                    <p className="text-gray-600 mt-1">Mã: {selectedSale.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Trạng thái giao dịch:</span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedSale.status)}`}>
                                        {getStatusText(selectedSale.status)}
                                    </span>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Thời gian</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Ngày đăng tin:</span>
                                            <span className="font-medium">{selectedSale.listedDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Ngày bán được:</span>
                                            <span className="font-medium">{selectedSale.soldDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Thời gian bán:</span>
                                            <span className="font-medium text-blue-600">{selectedSale.daysToSell} ngày</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Car Details */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin xe</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <img
                                            src={selectedSale.car.image}
                                            alt={selectedSale.car.name}
                                            className="w-full h-56 object-cover rounded-lg mb-4"
                                        />
                                        <h4 className="text-lg font-semibold mb-3">{selectedSale.car.name}</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Biển số:</span>
                                                <span className="ml-2 font-medium">{selectedSale.car.licensePlate}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Hãng xe:</span>
                                                <span className="ml-2 font-medium">{selectedSale.car.brand}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Năm sản xuất:</span>
                                                <span className="ml-2 font-medium">{selectedSale.car.year}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Số km:</span>
                                                <span className="ml-2 font-medium">{selectedSale.car.odometer}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Màu sắc:</span>
                                                <span className="ml-2 font-medium">{selectedSale.car.color}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buyer Info */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-600 w-32">Họ tên:</span>
                                            <span className="font-medium">{selectedSale.buyer.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-600 w-32">Số điện thoại:</span>
                                            <span className="font-medium">{selectedSale.buyer.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-600 w-32">Địa chỉ:</span>
                                            <span className="font-medium">{selectedSale.buyer.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Chi tiết tài chính</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Giá niêm yết:</span>
                                            <span className="font-medium">{formatPrice(selectedSale.originalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Giá bán thực tế:</span>
                                            <span className="font-medium text-green-600">{formatPrice(selectedSale.soldPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hoa hồng (5%):</span>
                                            <span className="font-medium text-blue-600">{formatPrice(selectedSale.commission)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-3">
                                            <span className="text-gray-600">Phương thức thanh toán:</span>
                                            <span className="font-medium">{selectedSale.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-3">
                                            <span>Bạn nhận được:</span>
                                            <span className="text-green-600">
                                                {formatPrice(selectedSale.soldPrice - selectedSale.commission)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Đóng
                                </button>
                                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Tải hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}