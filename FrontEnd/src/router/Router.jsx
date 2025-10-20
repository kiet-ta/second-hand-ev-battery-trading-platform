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
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentFailPage from "../pages/PaymentFailPage";
import DetailedCheckoutPage from '../pages/DetailCheckout';
import BlogList from "../pages/BlogList";
import BlogDetail from "../pages/BlogDetail";
import AuctionMainPage from "../pages/Auctions/AuctionMainPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import AuctionDetailPage from "../pages/Auctions/AuctionDetailPage";
import ComparePage from "../pages/ComparePage";
import BuyerViewSeller from '../pages/BuyerViewSeller';
import ComplaintsList from "../components/ComplaintsList";
import FavouritePage from "../pages/FavouritePage";
import SellerOnBoard from "../pages/SellerOnBoard";
import SellerForm from "../pages/SellerRegistration";
import SuccessPage from "../pages/SellerSuccess";

// Components used in the sub-routes
import HistorySold from "../components/HistorySold";
import PurchaseHistory from "../components/HistoryBought"; 
import SellerAuctionListPage from "../pages/SellerAuctionListPage";
import MyProduct from "../components/ItemForm/AddProductForm";
import NewsPage from "../components/CreateNews";
import ChatRoom from "../components/Chats/ChatRoom";

// Manager Components
import DashboardContent from "../components/Manager/DashboardContent";
import UsersContent from "../components/Manager/UserContent";
import TransactionsContent from "../components/Manager/TransactionContent";
import SellerApprovalsContent from "../components/Manager/SellerApprovalContent";
import ReportsContent from "../components/Manager/ReportContent";
import SettingsContent from "../components/Manager/SettingContent";
import ProductModeration from "../components/ProductModeration";
import NotificationCreator from "../components/Notifications/NotificationCreation";

// Placeholder component for Profile Index Route content (since complex state was removed)
const ProfileNestedFormsPlaceholder = () => (
  <div className="profile-main">
    {/* ProfileContent handles which form is shown here */}
    <div>Profile/Account Forms Placeholder</div> 
  </div>
);


export const router = createBrowserRouter([
  // --- MAIN LAYOUT (Public/Buyer Routes) ---
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage />, index: true, },
      { path: "/ev/:id", element: <EVDetails />, },
      { path: "/battery/:id", element: <BatteryDetails />, },
      { path: "/search", element: <SearchPage />, },
      { path: "/cart", element: <CartPage />, },
      { path: "/checkout", element: <CheckoutPage />, },
      { path: "/auctions", element: <AuctionMainPage /> },
      { path: "/auction/:id", element: <AuctionDetailPage /> },
      { path: "/compare", element: <ComparePage /> },
      { path: "/seller/:sellerId", element: <BuyerViewSeller /> },
      { path: "favourite", element: <FavouritePage/> },
      { path: "/seller-registration", element: <SellerOnBoard/> },
      { path: "/seller-form", element: <SellerForm/> },
      { path: "/success", element: <SuccessPage/> },
      { path: "/blog", element: <BlogList /> },
      { path: "/blog/:id", element: <BlogDetail /> },
    ],
  },
  
  // --- AUTHENTICATION ROUTES ---
  { path: "/login", element: <LoginPage />, },
  { path: "/register", element: <RegisterPage />, },

  // --- PROFILE DASHBOARD NESTED ROUTING (Cleaned) ---
  {
    path: "/profile",
    element: <ProfileContent />, // Layout component
    children: [
      // Default route for /profile
      { index: true, element: <ProfileNestedFormsPlaceholder /> }, 
      
      // My Purchase 
      { path: "purchase", element: <div className="profile-main"><PurchaseHistory /></div> },
      
      // Chat
      { path: "chat", element: <div className="profile-main"><ChatRoom /></div> }, 
      
      // Settings
      { path: "settings", element: <SettingsContent /> } 
    ]
  },

  // --- SELLER DASHBOARD NESTED ROUTING (Cleaned) ---
  {
    path: "/seller",
    element: <SellerDashboard />, // Layout component
    children: [
      { path: "bidding", element: <SellerAuctionListPage /> },
      { path: "products", element: <MyProduct /> },
      { path: "history", element: <HistorySold /> },
      { path: "news", element: <NewsPage /> },
      { path: "settings", element: <div>Seller Settings Content</div> }
    ]
  },

  // --- MANAGER DASHBOARD NESTED ROUTING (Cleaned) ---
  {
    path: "/manage",
    element: <ManagerDashboard />, // Layout/Data component
    children: [
      { index: true, element: <DashboardContent /> }, 
      { path: "approvals", element: <SellerApprovalsContent /> },
      { path: "users", element: <UsersContent /> },
      { path: "products", element: <ProductModeration /> },
      { path: "complaints", element: <ComplaintsList /> },
      { path: "transactions", element: <TransactionsContent /> },
      { path: "notifications", element: <NotificationCreator /> },
      { path: "news", element: <NewsPage /> },
      { path: "reports", element: <ReportsContent /> },
      { path: "settings", element: <SettingsContent /> }, 
    ]
  },

  // --- STANDALONE ROUTES (Outside Main Layout) ---
  { path: "/bought", element: <PurchaseHistory /> },
  { path: "/payment/success", element: <PaymentSuccessPage /> },
  { path: "/payment/fail", element: <PaymentFailPage /> },
  { path: "/detailcheckout", element: <DetailedCheckoutPage /> },
]);
