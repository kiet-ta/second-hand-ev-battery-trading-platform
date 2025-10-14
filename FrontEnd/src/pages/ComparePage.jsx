import React, { useState, useEffect, useMemo } from 'react';
import { useCompare } from '../hooks/useCompare';
import itemApi from '../api/itemApi';
import { Modal, Spin, Table, Image, Button } from 'antd';
import { FiX } from 'react-icons/fi';

export default function ComparePopup() {
    const { compareIds, toggleCompare, clearCompare } = useCompare();
    const [comparedItems, setComparedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Determine if the modal should be visible
    const isVisible = compareIds.length >= 2;

    useEffect(() => {
        if (isVisible) {
            const fetchItems = async () => {
                setIsLoading(true);
                try {
                    const itemPromises = compareIds.map(id => itemApi.getItemDetailByID(id));
                    const items = await Promise.all(itemPromises);
                    setComparedItems(items.filter(Boolean));
                } catch (error) {
                    console.error("Failed to fetch compare items", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchItems();
        }
    }, [compareIds, isVisible]);

    // Define the structure for the comparison table
    const comparisonFeatures = useMemo(() => [
        { key: 'imageUrl', title: 'Image', render: (item) => <Image width={100} src={item.imageUrl || "https://placehold.co/200x200"} /> },
        { key: 'title', title: 'Product', render: (item) => <a className="font-bold">{item.title}</a> },
        { key: 'price', title: 'Price', render: (item) => `${item.price.toLocaleString('vi-VN')} VND` },
        { key: 'type', title: 'Type', render: (item) => item.itemType === 'ev' ? 'Vehicle' : 'Battery' },
        { key: 'brand', title: 'Brand', render: (item) => item.evDetail?.brand || item.batteryDetail?.brand || 'N/A' },
        { key: 'year', title: 'Year', render: (item) => item.evDetail?.year || 'N/A' },
        { key: 'mileage', title: 'Mileage', render: (item) => item.evDetail ? `${item.evDetail.mileage.toLocaleString()} km` : 'N/A' },
        { key: 'capacity', title: 'Capacity (kWh)', render: (item) => item.batteryDetail?.capacity || 'N/A' },
        { key: 'voltage', title: 'Voltage (V)', render: (item) => item.batteryDetail?.voltage || 'N/A' },
    ], []);

    const handleClose = () => {
        clearCompare();
    };

    // Transform data for Ant Design's Table component
    const tableData = comparisonFeatures.map(feature => {
        const row = { feature: feature.title };
        comparedItems.forEach((item, index) => {
            row[`item${index}`] = feature.render(item);
        });
        return row;
    });

    const columns = [
        { title: 'Feature', dataIndex: 'feature', key: 'feature', fixed: 'left', width: 150, className: 'font-semibold bg-gray-50' },
        ...comparedItems.map((item, index) => ({
            title: (
                <div className="flex justify-between items-center">
                    <span>{item.title}</span>
                    <Button type="text" shape="circle" icon={<FiX />} onClick={() => toggleCompare(item.itemId)} />
                </div>
            ),
            dataIndex: `item${index}`,
            key: `item${index}`,
            width: 250,
        }))
    ];

    return (
        <Modal
            title={`Comparing ${compareIds.length} Items`}
            open={isVisible}
            onCancel={handleClose}
            footer={[
                <Button key="close" onClick={handleClose}>
                    Close and Clear List
                </Button>,
            ]}
            width="80%"
            centered
        >
            <Spin spinning={isLoading}>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    bordered
                />
            </Spin>
        </Modal>
    );
}