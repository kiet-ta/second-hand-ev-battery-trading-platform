import React from 'react';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
const handleLogout = async () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
}
const ProfileDropDown = ({users}) => (
    <Dropdown menu={{
        items:[
            {key: '1', label: (<a href="/profile">{users.fullName}</a>)
            },
            {type: 'divider'},
            {
                key: '2', label: (<a href="/settings">Settings</a>)
            },
            {key: '3', label: (<a href="/login" onClick={handleLogout}>Logout</a>)
            }
        ]
}}>
        <a onClick={e => e.preventDefault()}>
            <Space>
                <div>
                    <img
                        src={users.avatarProfile}
                        alt={users.fullName}
                        className="w-10 h-10 rounded-full object-contain shadow-md" />
                </div>
    
                <DownOutlined />
            </Space>
        </a>
    </Dropdown>
);
export default ProfileDropDown;