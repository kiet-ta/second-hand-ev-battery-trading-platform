import React, { useState } from 'react';
import {
    LayoutDashboard,
    Image,
    ShoppingBag,
    MessageSquare,
    Settings,
    Car,
    Clock,
    Star,
    XCircle,
    CheckCircle,
    User
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HistorySold from '../components/HistorySold'; // ✅ thêm HistorySold
import MyProduct from '../components/OrderItem';

export default function SellerDashboard() {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    // Dữ liệu cho biểu đồ
    const revenueData = [
        { month: 'Jan', value: 350 },
        { month: 'Feb', value: 1200 },
        { month: 'Mar', value: 700 },
        { month: 'Apr', value: 450 },
        { month: 'May', value: 1100 },
        { month: 'Jun', value: 800 },
        { month: 'Jul', value: 550 },
        { month: 'Aug', value: 1400 }
    ];

    const orderStatusData = [
        { month: 'Jan', value: 4 },
        { month: 'Feb', value: 5 },
        { month: 'Mar', value: 7 },
        { month: 'Apr', value: 9 },
        { month: 'May', value: 8 },
        { month: 'Jun', value: 11 },
        { month: 'Jul', value: 10 },
        { month: 'Aug', value: 10 }
    ];

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'listings', icon: Image, label: 'Listings' },
        { id: 'orders', icon: ShoppingBag, label: 'Orders' },
        { id: 'history', icon: Clock, label: 'History Sold' }, // ✅ thêm menu History Sold
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-sm font-bold text-gray-900">Seller Dashboard</h1>
                </div>

                <nav className="flex-1 p-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveMenu(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeMenu === item.id
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {activeMenu === "history" ? (
                    <HistorySold />
                ) : activeMenu == "orders" ? (
                    <MyProduct/>
                ) : 
                (
                    <div className="p-8">
                        {/* Header with Avatar */}
                        <div className="flex justify-end mb-8">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User size={20} className="text-gray-600" />
                            </div>
                        </div>

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <LayoutDashboard size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">25</div>
                                        <div className="text-sm text-gray-500">Listings</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <ShoppingBag size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">12</div>
                                        <div className="text-sm text-gray-500">Orders</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">8</div>
                                        <div className="text-sm text-gray-500">Sold</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">$</span>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">$1,250</div>
                                        <div className="text-sm text-gray-500">Revenue</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* Product Statistics */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Statistics</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Car size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">16</div>
                                            <div className="text-sm text-gray-500">Active</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Clock size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">3</div>
                                            <div className="text-sm text-gray-500">Pending</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <XCircle size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">6</div>
                                            <div className="text-sm text-gray-500">Inactive</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Star size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">5</div>
                                            <div className="text-sm text-gray-500">Featured</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Statistics */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Statistics</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ShoppingBag size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">3</div>
                                            <div className="text-sm text-gray-500">New</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">4</div>
                                            <div className="text-sm text-gray-500">Processing</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">4</div>
                                            <div className="text-sm text-gray-500">Completed</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <XCircle size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">1</div>
                                            <div className="text-sm text-gray-500">Cancelled</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`$${value}`, 'Revenue']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Order Status Chart */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={orderStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value) => [value, 'Orders']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
