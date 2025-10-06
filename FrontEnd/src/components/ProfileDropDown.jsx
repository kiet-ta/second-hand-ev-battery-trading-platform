import React from 'react';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
const ProfileDropDown = ({users}) => (
    
    <Dropdown menu={{
        items:[
            {key: '1', label: (<a href="/profile">{users.name}</a>),  disabled: true
            },
            {type: 'divider'},
            {
                key: '2', label: (<a href="/settings">Settings</a>)
            },
            {key: '3', label: (<a href="/logout">Logout</a>)
            }
        ]
}}>
        <a onClick={e => e.preventDefault()}>
            <Space>
                <div>
                    <img
                        src={users.picture}
                        alt={users.name}
                        className="w-10 h-10 rounded-full object-contain shadow-md" />
                </div>
    
                <DownOutlined />
            </Space>
        </a>
    </Dropdown>
);
export default ProfileDropDown;