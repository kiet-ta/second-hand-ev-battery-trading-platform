// src/components/KycRouteGuard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../api/userApi"; 
import { Spin } from "antd";

const KycRouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const user = await userApi.getUserByID(userId);

        if (!user || !user.kycStatus) {
          navigate("/seller-register");
          return;
        }

        switch (user.kycStatus) {
          case "Not_Submitted":
            navigate("/seller-registration");
            break;
          case "Pending":
            navigate("/pending-review");
            break;
          case "Approved'":
          default:
            setLoading(false);
            break;
        }
      } catch (error) {
        console.error("Error checking KYC:", error);
        navigate("/seller-registration");
      }
    };

    checkKycStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return children;
};

export default KycRouteGuard;
