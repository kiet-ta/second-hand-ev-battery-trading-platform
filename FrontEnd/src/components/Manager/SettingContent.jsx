// src/components/Manager/SettingsContent.jsx
import React from "react";
import { Settings } from "lucide-react";
import Card from "./Card";
import CardHeader from "./CardHeader";

export default function SettingsContent() {
    return (
        <Card>
            <CardHeader title="Settings" icon={<Settings size={18} />} />
            <div className="p-6 text-sm text-slate-600">
                Coming soon — configuration options for managers.
            </div>
        </Card>
    );
}