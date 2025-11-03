import React from "react";
import { BarChart3 } from "lucide-react";
import Card from "./Card";
import CardHeader from "./CardHeader";

export default function ReportsContent() {
    return (
        <Card>
            <CardHeader title="Reports & Analytics" icon={<BarChart3 size={18} />} />
            <div className="p-6 text-sm text-slate-600">
                Coming soon — export CSV/PDF, custom charts, cohort analysis...
            </div>
        </Card>
    );
}