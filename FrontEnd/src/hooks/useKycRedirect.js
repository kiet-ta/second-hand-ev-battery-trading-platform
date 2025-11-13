import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import userApi from "../api/userApi";

export default function useKycRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const checkKyc = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const user = await userApi.getUserByID(userId);
      const kycStatus = user.kycStatus || "Not_Submitted";
      const role = user.role || "user";

      if (role === "Seller") {
        if (location.pathname === "/seller-registration" || location.pathname === "/pending-review") {
          navigate("/");
        }
        return;
      }

      if (location.pathname === "/pending-review" && kycStatus === "Not_Submitted") {
        navigate("/seller-registration");
      } else if (location.pathname === "/seller-registration" && kycStatus === "pending") {
        navigate("/pending-review");
      } else if (location.pathname === "/seller-form" && kycStatus === "pending") {
        navigate("/pending-review");
      }

    } catch (error) {
      console.error("KYC check failed:", error);
    }
  };

  checkKyc();
}, [location.pathname, navigate]);
}
