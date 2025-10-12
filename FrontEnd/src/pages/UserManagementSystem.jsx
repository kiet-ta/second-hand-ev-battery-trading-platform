import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useUserForm } from "../hooks/useUserForm";
import '../index.css'
import UsersListView from "../components/UsersListView";
import UserForm from "../components/UserForm";
import UserDetail from "../components/UserDetail";
import "../assets/styles/UserManagementSystem.css"

const UserManagementSystem = () => {
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const {
        formData,
        errors,
        validateForm,
        resetForm,
        setFormDataFromUser,
        updateFormData,
    } = useUserForm();

    // View control
    const [currentView, setCurrentView] = useState("list"); // list | create | edit | view
    const [selectedUser, setSelectedUser] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterRole, setFilterRole] = useState("all");

    // Filtered list
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);

        const matchesStatus = filterStatus === "all" || user.status === filterStatus;
        const matchesRole = filterRole === "all" || user.role === filterRole;

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (currentView === "create") {
            addUser(formData);
        } else if (currentView === "edit" && selectedUser) {
            updateUser(selectedUser.id, formData);
        }

        resetForm();
        setCurrentView("list");
        setSelectedUser(null);
    };

    const handleCreateNew = () => {
        resetForm();
        setSelectedUser(null);
        setCurrentView("create");
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormDataFromUser(user);
        setCurrentView("edit");
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setCurrentView("view");
    };

    const handleDelete = (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            deleteUser(userId);
        }
    };

    const handleCancel = () => {
        resetForm();
        setSelectedUser(null);
        setCurrentView("list");
    };

    const handleBack = () => {
        setCurrentView("list");
        setSelectedUser(null);
    };

    return (
        <div className="user-management">
            {currentView === "list" && (
                <UsersListView
                    users={users}
                    filteredUsers={filteredUsers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filterRole={filterRole}
                    setFilterRole={setFilterRole}
                    handleCreateNew={handleCreateNew}
                    handleView={handleView}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                />
            )}

            {(currentView === "create" || currentView === "edit") && (
                <UserForm
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    currentView={currentView}
                />
            )}

            {currentView === "view" && (
                <UserDetail
                    user={selectedUser}
                    handleBack={handleBack}
                    handleEdit={handleEdit}
                />
            )}
        </div>
    );
};

export default UserManagementSystem;
