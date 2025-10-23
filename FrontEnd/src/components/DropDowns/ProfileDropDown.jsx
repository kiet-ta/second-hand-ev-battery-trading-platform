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
            key: '2', label: (<a href='/wallet' className="flex gap-2">Ví:<div className='font-semibold'>{walletBalance} VND</div> </a>)
            },
            {
                key: '3', label: (<a href="/profile">Profile</a>)
            },
                        {
                key: '4', label: (<a href="/complaint"> Gửi yêu cầu</a>)
            },
            {key: '5', label: (<a href="/login" onClick={handleLogout}>Đăng xuất</a>)
            }

        ]
}}>
        <a onClick={e => e.preventDefault()}>
            <Space>
                <div>
                    <img
                        src={users.avatarProfile || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                        alt={users.fullName}
                        className="w-10 h-10 rounded-full object-contain shadow-md" />
                </div>
    
                <DownOutlined />
            </Space>
        </a>
    </Dropdown>
);
export default ProfileDropDown;