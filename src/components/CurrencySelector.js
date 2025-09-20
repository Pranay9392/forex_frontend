import React, { useEffect, useState } from 'react';
import { fetchAvailableCurrencies } from '../services/exchangeRateApi';

const CurrencySelector = ({ selectedCurrency, onCurrencyChange }) => {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const loadCurrencies = async () => {
      const availableCurrencies = await fetchAvailableCurrencies();
      setCurrencies(availableCurrencies);
    };

    loadCurrencies();
  }, []);

  return (
    <div className="currency-selector">
      <label htmlFor="currency">Select Base Currency:</label>
      <select
        id="currency"
        value={selectedCurrency}
        onChange={(e) => onCurrencyChange(e.target.value)}
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;