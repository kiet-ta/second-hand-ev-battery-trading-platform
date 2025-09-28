
import HomePage from '../pages/HomePage'
import { createBrowserRouter } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import EVDetails from '../pages/EVDetails';
import BatteryDetails from '../pages/BatteryDetails';
import SearchPage from '../pages/SearchPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';

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
                path: "/vehicle/:id",
                element: <EVDetails/>
            },
            {
                path: "/battery/:id",
                element: <BatteryDetails/>
            },
            {
                path: "/search",
                element: <SearchPage/>
            },
            {
                path: "/cart",
                element: <CartPage/>
            },
            {
                path: "/checkout",
                element: <CheckoutPage/>
            }
        
        ],
    },
]);