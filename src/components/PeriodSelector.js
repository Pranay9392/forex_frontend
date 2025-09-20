import React from 'react';

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: '1w', label: 'Last Week' },
    { value: '1m', label: 'Last Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
  ];

  return (
    <div className="period-selector">
      <label htmlFor="period" className="block text-sm font-medium text-gray-700">
        Select Time Period:
      </label>
      <select
        id="period"
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="mt-1 block w-full rounded-md bg-gray-200 border-gray-300 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;