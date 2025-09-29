import { NavLink, Outlet } from "react-router-dom";
import { Home, Package, ShoppingCart, Users, BarChart2, Megaphone, MessageSquare, Settings } from "lucide-react";

export default function SellerLayout() {
    return (
        <div className="flex h-screen bg-maincolor-50">
            <aside className="w-64 bg-maincolor border-r border-gray-200 flex flex-col">
                <div className="p-6 font-bold text-xl">Seller Page</div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavLink to="/seller/products" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <Package className="w-5 h-5 mr-3" /> My shop
                    </NavLink>
                    <NavLink to="seller/orders" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <ShoppingCart className="w-5 h-5 mr-3" /> Orders
                    </NavLink>
                    <NavLink to="seller/customers" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <Users className="w-5 h-5 mr-3" /> Customers
                    </NavLink>
                    <NavLink to="seller/analytics" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <BarChart2 className="w-5 h-5 mr-3" /> Business analytics
                    </NavLink>
                    <NavLink to="seller/promotion" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <Megaphone className="w-5 h-5 mr-3" /> Promotion
                    </NavLink>
                    <NavLink to="seller/messages" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <MessageSquare className="w-5 h-5 mr-3" /> Message
                    </NavLink>
                    <NavLink to="seller/settings" className="flex items-center p-2 bg-maincolor-darker text-gray-700 hover:bg-gray-100 rounded">
                        <Settings className="w-5 h-5 mr-3" /> Settings
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img
                            src="https://i.pinimg.com/736x/b7/32/58/b732581f55552ba7575ed2cfae859b35.jpg"
                            alt="profile"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-medium text-gray-800">Lady Cerydra</p>
                            <p className="text-sm text-gray-500">example@gmail.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}
