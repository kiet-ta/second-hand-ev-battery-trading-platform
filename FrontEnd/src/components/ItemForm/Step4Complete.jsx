import React from 'react';
import { Result, Button } from 'antd';

export default function Step4Complete({ onReset, onDone }) {
    return (
        <Result
            status="success"
            title="Product Listing Created Successfully!"
            subTitle="Your item is now being processed. You can manage it from your dashboard once it's live."
            extra={[
                <Button type="primary" key="create" onClick={onReset}>
                    Create Another Product
                </Button>,
                <Button key="done" onClick={onDone}>
                    Done
                </Button>,
            ]}
        />
    );
}

