import React from "react";

export default function StatTile({ icon, label, value, hint, trend }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow transition">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                {icon}
            </div>

            <div className="flex-1">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-800 mt-0.5">{value}</p>
                {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>

            {typeof trend === "number" && (
                <div
                    className={`text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                >
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                </div>
            )}
        </div>
    );
}
