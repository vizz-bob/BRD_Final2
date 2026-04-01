import React from 'react';

const PageHeading = ({ title, actions }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
      {actions && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-white transition-transform duration-150 
                transform hover:-translate-y-0.5 active:translate-y-0 text-sm
                ${action.primary ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}
                shadow-lg hover:shadow-xl`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeading;