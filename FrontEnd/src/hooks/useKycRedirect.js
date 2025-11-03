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
        console.log(user)
        const kycStatus = user.kycStatus || "not_submitted";
        console.log("KYC Status:", kycStatus);

        if (location.pathname === "/pending-review" && kycStatus == "not_submitted") {
          navigate("/seller-registration");
        } else if (location.pathname === "/seller-registration" && kycStatus == "pending") {
          navigate("/pending-review");
        } else if (location.pathname === "/seller-form" && kycStatus == "pending") {
          navigate("/pending-review")
        }
      } catch (error) {
        console.error("KYC check failed:", error);
      }
    };

    checkKyc();
  }, [location.pathname, navigate]);
}
