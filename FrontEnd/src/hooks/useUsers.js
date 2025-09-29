import { useState } from 'react';

export const useUsers = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'vana@email.com',
            phone: '0123456789',
            address: 'Hà Nội',
            joinDate: '2024-01-15',
            status: 'active',
            role: 'buyer',
            carsPosted: 3,
            avatar: null
        },
        {
            id: 2,
            name: 'Trần Thị B',
            email: 'thib@email.com',
            phone: '0987654321',
            address: 'TP.HCM',
            joinDate: '2024-02-20',
            status: 'active',
            role: 'seller',
            carsPosted: 8,
            avatar: null
        },
        {
            id: 3,
            name: 'Lê Minh C',
            email: 'minhc@email.com',
            phone: '0369852147',
            address: 'Đà Nẵng',
            joinDate: '2024-03-10',
            status: 'inactive',
            role: 'buyer',
            carsPosted: 0,
            avatar: null
        }
    ]);

    const addUser = (userData) => {
        const newUser = {
            ...userData,
            id: Math.max(...users.map(u => u.id), 0) + 1,
            joinDate: new Date().toISOString().split('T')[0],
            carsPosted: 0,
            avatar: null
        };
        setUsers(prev => [...prev, newUser]);
    };

    const updateUser = (userId, userData) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, ...userData } : user
        ));
    };

    const deleteUser = (userId) => {
        setUsers(prev => prev.filter(user => user.id !== userId));
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === userId);
    };

    return {
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserById
    };
};