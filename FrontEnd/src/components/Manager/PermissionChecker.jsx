import React, { useState } from "react";
import { Modal } from "antd";
import staffManagementApi from "../../api/staffPermissionApi"; // adjust path

const PermissionChecker = ({ permissionId, children }) => {
  const [noPermissionInfo, setNoPermissionInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cache all permissions in memory
  let allPermissionsCache = null;

  const parseJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleClick = async (originalOnClick) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const decoded = parseJwt(token);
      if (!decoded) {
        setNoPermissionInfo({
          permissionName: `ID ${permissionId}`,
          description: "Không thể đọc token",
        });
        return;
      }

      // Managers bypass all permission checks
      if (decoded.role === "Manager") {
        originalOnClick?.();
        return;
      }

      if (decoded.role !== "Staff") {
        setNoPermissionInfo({
          permissionName: `ID ${permissionId}`,
          description: "Bạn không phải nhân viên",
        });
        return;
      }

      // 1. Get all permissions (cached)
      if (!allPermissionsCache) {
        allPermissionsCache = await staffManagementApi.getPermission();
      }

      // 2. Get staff permissions
      const staffPermissions = await staffManagementApi.getPermissionByStaffId(localStorage.getItem("userId"));

      // 3. Find required permission details from allPermissions
      const requiredPermission = allPermissionsCache.find(p => p.permissionId === permissionId);
      if (!requiredPermission) {
        setNoPermissionInfo({
          permissionName: `ID ${permissionId}`,
          description: "Quyền này không tồn tại",
        });
        return;
      }

      // 4. Check if staff has it
      const hasPermission = staffPermissions.some(p => p.permissionId === permissionId);
      if (!hasPermission) {
        setNoPermissionInfo({
          permissionName: requiredPermission.permissionName,
          description: requiredPermission.description,
        });
        return;
      }

      // Staff has permission → run original click
      originalOnClick?.();
    } catch (error) {
      console.error(error);
      setNoPermissionInfo({
        permissionName: `ID ${permissionId}`,
        description: "Không thể kiểm tra quyền",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => handleClick(children.props.onClick),
        disabled: loading,
      })}

      {noPermissionInfo && (
        <Modal
          open={true}
          title={`Bạn không có quyền "${noPermissionInfo.permissionName}"`}
          onOk={() => setNoPermissionInfo(null)}
          onCancel={() => setNoPermissionInfo(null)}
          okText="Đóng"
        >
          <p>{noPermissionInfo.description}</p>
        </Modal>
      )}
    </>
  );
};

export default PermissionChecker;
