// StepIndicator.js
import React from 'react';

const StepIndicator = ({ currentStep }) => {
  const steps = ["Thông tin cá nhân", "Xác minh ID", "Thông tin cửa hàng"];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${
                currentStep >= index + 1 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {index + 1}
            </div>
            <p className={`mt-2 text-xs text-center md:text-sm ${currentStep >= index + 1 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${currentStep > index + 1 ? 'border-green-500' : 'border-gray-300'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;