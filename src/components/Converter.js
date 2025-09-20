import React, { useState, useEffect } from 'react';
import CurrencyComparisonChart from './CurrencyComparisonChart';
import CurrencySelector from './CurrencySelector';
import PeriodSelector from './PeriodSelector';
import { fetchLatestRates, fetchHistoricalRates } from '../services/exchangeRateApi';

const Converter = () => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [selectedPeriod, setSelectedPeriod] = useState('lastWeek');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistoricalRates(baseCurrency, selectedPeriod);
        setHistoricalData(data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseCurrency, selectedPeriod]);

  return (
    <div className="app">
      <h1>Currency Comparison App</h1>
      <CurrencySelector baseCurrency={baseCurrency} setBaseCurrency={setBaseCurrency} />
      <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <CurrencyComparisonChart historicalData={historicalData} baseCurrency={baseCurrency} />
    </div>
  );
};

export default Converter;