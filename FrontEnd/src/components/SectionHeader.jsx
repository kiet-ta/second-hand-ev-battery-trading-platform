import React from 'react';

const SectionHeader = ({ title, icon: Icon, description }) => (
    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-8 pt-10 border-b-2 border-[#C4B5A0] pb-4"> 
        <Icon className="w-9 h-9 text-[#B8860B] stroke-2 flex-shrink-0" /> 
        <div className="flex-grow">
            <h2 className="text-4xl font-roboto font-bold text-[#2C2C2C] tracking-wider">
                {title}
            </h2>
            {description && (
                <p className="text-gray-600 text-sm mt-1 max-w-2xl">
                    {description}
                </p>
            )}
        </div>
    </div>
);

export default SectionHeader;