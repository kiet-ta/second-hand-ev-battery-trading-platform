import React from 'react';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
const handleLogout = async () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
}
const ProfileDropDown = ({users,walletBalance}) => (
    <Dropdown menu={{
        items:[
            {key: '1', label: (<a href="/profile">{users.fullName}</a>)
            },
            {type: 'divider'},
            {
            key: '2', label: (<div className="flex gap-2">Wallet:<div className='font-semibold'>{walletBalance} VND</div> </div>)
            },
            {
                key: '3', label: (<a href="/profile">Profile</a>)
            },
            {key: '4', label: (<a href="/login" onClick={handleLogout}>Logout</a>)
            }
        ]
}}>
        <a onClick={e => e.preventDefault()}>
            <Space>
                <div>
                    <img
                        src={users.avatarProfile}
                        alt={users.fullName}
                        className="w-15 h-15 rounded-full object-contain shadow-md" />
                </div>
    
                <DownOutlined />
            </Space>
        </a>
    </Dropdown>
);
export default ProfileDropDown;