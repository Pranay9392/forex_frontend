import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchHistoricalRates } from '../services/exchangeRateApi';

const CurrencyComparisonChart = ({ baseCurrency, period }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistoricalRates(baseCurrency, period);
        const labels = Object.keys(data.rates);
        const datasets = Object.keys(data.rates[labels[0]]).map(currency => ({
          label: currency,
          data: labels.map(label => data.rates[label][currency]),
          borderColor: getRandomColor(),
          fill: false,
        }));

        setChartData({
          labels,
          datasets,
        });
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseCurrency, period]);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Currency Comparison Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default CurrencyComparisonChart;