import { createBrowserRouter } from "react-router-dom";

/* ---------------------------
   Public / Main (Buyer) Pages
   --------------------------- */
import MainLayout from "../layout/MainLayout";
import HomePage from "../pages/Main/HomePage";
import EVDetails from "../pages/Main/EVDetails";
import BatteryDetails from "../pages/Main/BatteryDetails";
import SearchPage from "../pages/Main/SearchPage";
import CartPage from "../pages/Main/CartPage";
import CheckoutPage from "../pages/Main/CheckoutPage";
import AuctionMainPage from "../pages/Auctions/AuctionMainPage";
import AuctionDetailPage from "../pages/Auctions/AuctionDetailPage";
import FavouritePage from "../pages/Main/FavouritePage";
import BlogList from "../pages/Footers/BlogList";
import BlogDetail from "../pages/Footers/BlogDetail";
import AboutPage from "../pages/Footers/AboutPage";
import CareersPage from "../pages/Footers/CareerPage";
import PressPage from "../pages/Footers/PressPage";
import PrivacyPolicyPage from "../pages/Footers/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/Footers/TermsOfService";
import FaqPage from "../pages/Footers/FaqPage";
import BuyingGuidePage from "../pages/Footers/BuyingGuidePage";
import ContactPage from "../pages/Footers/ContactPage";
import BuyerViewSeller from "../pages/Seller/BuyerViewSeller";
import SellerOnBoard from "../pages/SellerOnBoard";
import SellerForm from "../pages/SellerRegistration";
import SuccessPage from "../pages/SellerSuccess";
import CompareEVPage from "../pages/CompareEVPage"

/* ---------------------------
   Auth Pages
   --------------------------- */
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

/* ---------------------------
   Checkout / Payment Pages (Standalone)
   --------------------------- */
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentFailPage from "../pages/PaymentFailPage";
import DetailedCheckoutPage from "../pages/DetailCheckout";

/* ---------------------------
   Profile (Router-based SPA) - Buyer account area
   --------------------------- */
import ProfileLayout from "../pages/Profile/ProfileLayout";
import ProfileMain from "../pages/Profile/ProfileMain";
import AccountSetting from "../pages/Profile/AccountSetting";
import AddressSetting from "../pages/Profile/AddressSetting";
import NotificationSetting from "../pages/Profile/NotificationSetting";
import SecuritySetting from "../pages/Profile/SecuritySetting";
import PurchaseSection from "../pages/Profile/PurchaseSection";
import SettingsSection from "../pages/Profile/SettingsSection";
import WalletTransactionPage from "../pages/Profile/WalletTransactionPage";

/* ---------------------------
   Seller dashboard (Protected - seller)
   --------------------------- */
import SellerDashboardLayout from "../pages/Seller/SellerDashboardLayout";
import SellerDashboardContent from "../pages/Seller/SellerDashboardContent";
import SellerBiddingPage from "../pages/Seller/SellerBiddingPage";
import SellerOrdersPage from "../pages/Seller/SellerOrdersPage";
import SellerHistoryPage from "../pages/Seller/SellerHistoryPage";
import SellerSettingsPage from "../pages/Seller/SellerSettingsPage";

/* ---------------------------
   Manager / Admin (Protected - manager/staff)
   --------------------------- */
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import DashboardContent from "../components/Manager/DashboardContent";
import UsersContent from "../components/Manager/UserContent";
import TransactionsContent from "../components/Manager/TransactionContent";
import SellerApprovalsContent from "../components/Manager/SellerApprovalContent";
import ProductModeration from "../components/Manager/ProductModeration";
import ComplaintsList from "../components/Manager/ComplaintsList";
import NotificationCreator from "../components/Notifications/NotificationCreation";
import ReportsContent from "../components/Manager/ReportContent";
import SettingsContent from "../components/Manager/SettingContent";
import KycManagementPage from "../pages/Manager/KYCManagementPage";
import NewsPage from "../components/Manager/CreateNews";


/* ---------------------------
   Other components used in routes
   --------------------------- */
import PurchaseHistory from "../components/Profile/HistoryBought";
import ChatRoomWrapper from "../components/Chats/ChatRoomWrapper";

/* ---------------------------
   Utilities / Guards
   --------------------------- */
import ProtectedRoute from "../components/ProtectedRoute";
import ComplaintPage from "../pages/Main/ComplaintPage";
import OrderPage from "../pages/Profile/MyOrderHistory";
import RechargePage from "../pages/RechargePage";

/* ---------------------------
   Router definition
   --------------------------- */
const ProfileNestedFormsPlaceholder = () => (
  <div className="profile-main">
    {/* Profile index placeholder (ProfileMain handles nested rendering) */}
    <div>Profile/Account Forms Placeholder</div>
  </div>
);

export const router = createBrowserRouter([
  // MAIN LAYOUT (Public / Buyer)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, path: "/", element: <HomePage /> },
      { path: "ev/:id", element: <EVDetails /> },
      { path: "battery/:id", element: <BatteryDetails /> },
      { path: "search", element: <SearchPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "auctions", element: <AuctionMainPage /> },
      { path: "auction/:id", element: <AuctionDetailPage /> },
      { path: "seller/:sellerId", element: <BuyerViewSeller /> },
      { path: "favourite", element: <FavouritePage /> },
      { path: "seller-registration", element: <SellerOnBoard /> },
      { path: "seller-form", element: <SellerForm /> },
      { path: "success", element: <SuccessPage /> },
      { path: "blog", element: <BlogList /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "about", element: <AboutPage /> },
      { path: "careers", element: <CareersPage /> },
      { path: "press", element: <PressPage /> },
      { path: "privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "terms-of-service", element: <TermsOfServicePage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "buying-guide", element: <BuyingGuidePage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "wallet", element: <WalletTransactionPage /> },
      { path: "complaint", element: <ComplaintPage /> },
      { path: "compare", element: <CompareEVPage /> },
      { path: "order-history", element: <OrderPage /> },
      { path: "recharge", element: <RechargePage /> },
    ],
  },

  // AUTH ROUTES
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },

  // PROFILE (Buyer account area) - router-based SPA
  {
    path: "/profile",
    element: <ProfileLayout />,
    children: [
      {
        path: "",
        element: <ProfileMain />,
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
      { path: "chats", element: <ChatRoomWrapper /> },
    ],
  },

  // SELLER DASHBOARD (Protected)
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

  // MANAGER / ADMIN DASHBOARD (Protected)
  {
    path: "/manage",
    element: <ProtectedRoute allowedRoles={["manager", "staff"]} />,
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

  // STANDALONE ROUTES (outside main layout)
  { path: "/bought", element: <PurchaseHistory /> },
  { path: "/payment/success", element: <PaymentSuccessPage /> },
  { path: "/payment/fail", element: <PaymentFailPage /> },
  { path: "/detailcheckout", element: <DetailedCheckoutPage /> },
]);