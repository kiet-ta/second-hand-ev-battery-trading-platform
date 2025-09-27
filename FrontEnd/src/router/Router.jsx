import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailPage from '../pages/PaymentFailPage';
export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                path: "/payment/success",
                element: <PaymentSuccessPage/>,
            },
            {
                path: "/payment/fail",
                element: <PaymentFailPage/>,
            }
        ],
    },
]);