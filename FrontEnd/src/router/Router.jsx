import HomePage from "../pages/HomePage";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import EVDetails from "../pages/EVDetails";
import BatteryDetails from "../pages/BatteryDetails";
import SearchPage from "../pages/SearchPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfileContent from "../pages/ProfileContent";
import SellerDashboard from "../pages/DashboardSeller";
import PurchaseHistory from "../components/HistoryBought";
import SellerHistory from "../components/HistorySold";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentFailPage from "../pages/PaymentFailPage";
import PurchasePage from "../pages/PurchasePage";
import DetailedCheckoutPage from '../pages/DetailCheckout';
import BlogList from "../pages/BlogList";
import BlogDetail from "../pages/BlogDetail";
import AuctionMainPage from "../pages/Auctions/AuctionMainPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import AuctionDetailPage from "../pages/Auctions/AuctionDetailPage";
import ComparePage from "../pages/ComparePage";
import BuyerViewSeller from '../pages/BuyerViewSeller';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        index: true,
      },
      {
        path: "/ev/:id",
        element: <EVDetails />,
      },
      {
        path: "/battery/:id",
        element: <BatteryDetails />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/purchase",
        element: <PurchasePage />
      },
      {
        path: "/auctions",
        element: <AuctionMainPage />
      }
      ,{
        path:"/auction/:id",
        element: <AuctionDetailPage/>
      },
      {
        path: "/compare",
        element: <ComparePage/>
      }
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/profile",
    element: <ProfileContent />,
  },
  {
    path: "/seller",
    element: <SellerDashboard />,
  },
  {
    path: "/bought",
    element: <PurchaseHistory />,
  },
  {
    path: "/sold",
    element: <SellerHistory />,
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/fail",
    element: <PaymentFailPage />,
  },
  {
    path: "/detailcheckout",
    element: <DetailedCheckoutPage />
  },
  {
    path: "/blog",
    element: <BlogList />
  },
  {
    path: "/blog/:id",
    element: <BlogDetail />
  },
   {
    path: "/manage",
    element: <ManagerDashboard />
  },   {
        path: "/seller/:sellerId",
        element: <BuyerViewSeller />
    }
])
