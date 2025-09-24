import React from 'react'
import HomePage from '../pages/HomePage'
import { createBrowserRouter } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import ProductDetail from '../pages/ProductDetail';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                path: "/",
                element: <HomePage/>,
                index:true,
            },
            {
                path: "/product/:id",
                element: <ProductDetail/>,
                index:true,
            }
        ],
    },
]);