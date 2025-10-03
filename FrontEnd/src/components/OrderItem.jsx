import { PlusCircle } from "lucide-react";
import React from 'react'
import FormComponent from "./AddProductForm";

export default function MyProduct() {
    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 m-5">
                <h1 className="text-2xl font-bold">My Shop</h1>
                <FormComponent></FormComponent>
            </div>

            {/* Product List Table */}
            <div className="bg-white rounded-lg shadow p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Inventory</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b hover:bg-gray-50">
                            <td className="p-3 flex items-center space-x-3">
                                <img
                                    src="https://i.pinimg.com/736x/23/ce/34/23ce34eafe553b94f40bb67139abb923.jpg"
                                    alt="product"
                                    className="w-12 h-12 rounded object-cover"
                                />
                                <span>This is a very cute Furina</span>
                            </td>
                            <td className="p-3">Car</td>
                            <td className="p-3">1020 pcs</td>
                            <td className="p-3">$180.00</td>
                            <td className="p-3">
                                <span className="text-green-600 font-medium">Active</span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                                <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
                                    Edit
                                </button>
                                <button className="px-3 py-1 border rounded text-red-600 hover:bg-red-50">
                                    Delete
                                </button>
                            </td>
                        </tr>

                        <tr className="hover:bg-gray-50">
                            <td className="p-3 flex items-center space-x-3">
                                <img
                                    src="https://i.pinimg.com/1200x/3e/1c/fe/3e1cfe84b4876b5c724975669adc220d.jpg"
                                    alt="product"
                                    className="w-12 h-12 rounded object-cover"
                                />
                                <span>This is a Hug</span>
                            </td>
                            <td className="p-3">Battery</td>
                            <td className="p-3">450 pcs</td>
                            <td className="p-3">$25.00</td>
                            <td className="p-3">
                                <span className="text-yellow-600 font-medium">Draft</span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                                <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
                                    Edit
                                </button>
                                <button className="px-3 py-1 border rounded text-red-600 hover:bg-red-50">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
