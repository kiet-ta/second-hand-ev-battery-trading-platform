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
import PurchaseHistory from "../components/HistoryBought";
import NewsPage from "../components/CreateNews";

// --- Profile (Router-Based SPA) ---
import ProfileLayout from "../pages/Profile/ProfileLayout";
import ProfileMain from "../pages/Profile/ProfileMain";
import AccountSetting from "../pages/Profile/AccountSetting";
import AddressSetting from "../pages/Profile/AddressSetting";
import NotificationSetting from "../pages/Profile/NotificationSetting";
import SecuritySetting from "../pages/Profile/SecuritySetting";
import PurchaseSection from "../pages/Profile/PurchaseSection";
import SettingsSection from "../pages/Profile/SettingsSection";

// --- Seller (Router-Based SPA) ---
import SellerDashboardLayout from "../pages/Seller/SellerDashboardLayout";
import SellerDashboardContent from "../pages/Seller/SellerDashboardContent";
import SellerBiddingPage from "../pages/Seller/SellerBiddingPage";
import SellerOrdersPage from "../pages/Seller/SellerOrdersPage";
import SellerHistoryPage from "../pages/Seller/SellerHistoryPage";
import SellerSettingsPage from "../pages/Seller/SellerSettingsPage";
import ChatRoomWrapper from "../components/Chats/ChatRoomWrapper";

// Manager Components
import DashboardContent from "../components/Manager/DashboardContent";
import UsersContent from "../components/Manager/UserContent";
import TransactionsContent from "../components/Manager/TransactionContent";
import SellerApprovalsContent from "../components/Manager/SellerApprovalContent";
import ReportsContent from "../components/Manager/ReportContent";
import SettingsContent from "../components/Manager/SettingContent";
import ProductModeration from "../components/Manager/ProductModeration";
import NotificationCreator from "../components/Notifications/NotificationCreation";
import ProtectedRoute from "../components/ProtectedRoute";
import KycManagementPage from "../pages/KYCManagementPage";
import AboutPage from "../pages/AboutPage";
import CareersPage from "../pages/CareerPage";
import PressPage from "../pages/PressPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfService";
import FaqPage from "../pages/FaqPage";
import BuyingGuidePage from "../pages/BuyingGuidePage";
import ContactPage from "../pages/ContactPage";

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
      { path: "favourite", element: <FavouritePage /> },
      { path: "/seller-registration", element: <SellerOnBoard /> },
      { path: "/seller-form", element: <SellerForm /> },
      { path: "/success", element: <SuccessPage /> },
      { path: "/blog", element: <BlogList /> },
      { path: "/blog/:id", element: <BlogDetail /> },
      { path: "/about", element: <AboutPage/>},
      { path: "/careers", element: <CareersPage/>},
      { path: "/press", element: <PressPage/>},
      { path: "/privacy-policy", element: <PrivacyPolicyPage/>},
      { path: "/terms-of-service", element: <TermsOfServicePage/>},
      { path: "/faq", element: <FaqPage/>},
      { path: "/buying-guide", element: <BuyingGuidePage/>},
      { path: "/contact", element: <ContactPage/>},
      
    ],
  },
  // --- AUTHENTICATION ROUTES ---
  { path: "/login", element: <LoginPage />, },
  { path: "/register", element: <RegisterPage />, },

  // --- PROFILE DASHBOARD (SPA Router-based) ---
  {
    path: "/profile",
    element: <ProfileLayout />,
    children: [
      {
        path: "",
        element: <ProfileMain />, // layout con cho 4 card
        children: [
          { index: true, element: <AccountSetting /> },
          { path: "account", element: <AccountSetting /> },
          { path: "address", element: <AddressSetting /> },
          { path: "notification", element: <NotificationSetting /> },
          { path: "security", element: <SecuritySetting /> },
        ],
      },
      { path: "purchase", element: <PurchaseSection /> },
      { path: "settings", element: <SettingsSection /> },
      { path: "chats", element: <ChatRoomWrapper /> }
    ],
  },


  // --- SELLER DASHBOARD NESTED ROUTING (Cleaned) ---
  {
    path: "/seller",
    element: <ProtectedRoute allowedRoles={["seller"]} />,
    children: [
      {
        element: <SellerDashboardLayout />,
        children: [
          { index: true, element: <SellerDashboardContent /> },
          { path: "bidding", element: <SellerBiddingPage /> },
          { path: "orders", element: <SellerOrdersPage /> },
          { path: "history", element: <SellerHistoryPage /> },
          { path: "chat", element: <ChatRoomWrapper /> },
          { path: "settings", element: <SellerSettingsPage /> },
        ],
      },
    ],
  },



  // --- MANAGER DASHBOARD NESTED ROUTING (Cleaned) ---
  {
    path: "/manage",
    // Cho phép cả manager và staff đăng nhập
    element: <ProtectedRoute allowedRoles={['manager', 'staff']} />,
    children: [
      {
        element: <ManagerDashboard />,
        children: [
          { index: true, element: <DashboardContent /> },
          { path: "approvals", element: <SellerApprovalsContent /> },
          { path: "kyc_management", element: <KycManagementPage /> },
          { path: "users", element: <UsersContent /> },
          { path: "products", element: <ProductModeration /> },
          { path: "complaints", element: <ComplaintsList /> },
          { path: "transactions", element: <TransactionsContent /> },
          { path: "notifications", element: <NotificationCreator /> },
          { path: "news", element: <NewsPage /> },
          { path: "reports", element: <ReportsContent /> },
          { path: "settings", element: <SettingsContent /> },
        ],
      },
    ],
  },


  // --- STANDALONE ROUTES (Outside Main Layout) ---
  { path: "/bought", element: <PurchaseHistory /> },
  { path: "/payment/success", element: <PaymentSuccessPage /> },
  { path: "/payment/fail", element: <PaymentFailPage /> },
  { path: "/detailcheckout", element: <DetailedCheckoutPage /> },
]);
