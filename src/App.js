import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnimatePresence, motion } from 'framer-motion';
import io from 'socket.io-client';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AppState = {
  HOME: 'home',
  STRATEGIES: 'strategies',
  HISTORY: 'history',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  PROFILE: 'profile'
};

const Navbar = ({ activePage, setActivePage, username, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', page: AppState.HOME },
    { name: 'Strategies', page: AppState.STRATEGIES },
    { name: 'History', page: AppState.HISTORY },
    { name: 'Analytics', page: AppState.ANALYTICS },
    { name: 'Settings', page: AppState.SETTINGS },
    { name: 'Profile', page: AppState.PROFILE },
  ];

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-500 mr-2">
                <path d="M11.25 4.5A.75.75 0 0 1 12 3.75h1.378a3.375 3.375 0 0 1 2.723 1.125l2.247 2.664A3.375 3.375 0 0 1 21 9.626V16.5a3.75 3.75 0 0 1-3.75 3.75H15A2.25 2.25 0 0 1 12.75 22v-4.125c0-.621-.504-1.125-1.125-1.125H9.375c-.621 0-1.125.504-1.125 1.125V22A2.25 2.25 0 0 1 6 19.5H3.75A3.75 3.75 0 0 1 0 15.75V9.626a3.375 3.375 0 0 1 1.652-2.837l2.247-2.664A3.375 3.375 0 0 1 7.622 3.75H9A.75.75 0 0 1 9.75 4.5v15a.75.75 0 0 0 1.5 0v-15Z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">AlphaFxTrader</h1>
        </div>
        <div className="flex ml-8 space-x-4">
          {navItems.map((item) => (
            <motion.button
              key={item.name}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activePage === item.page
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setActivePage(item.page)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.name}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-400">
          <span className="font-semibold text-gray-200">Logged in as:</span> {username}
        </span>
        <motion.button
            onClick={onLogout}
            className="px-3 py-2 text-sm font-medium rounded-md text-red-400 border border-red-400 hover:bg-red-800 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            Logout
        </motion.button>
      </div>
    </nav>
  );
};

const CurrencyComparisonChart = ({ exchangeRates }) => {
    const labels = Object.keys(exchangeRates);
    const chartData = {
        labels: labels,
        datasets: [{
            label: `USD Exchange Rates`,
            data: Object.values(exchangeRates),
            borderColor: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.2)',
            tension: 0.4,
            fill: false,
        }],
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw.toFixed(4)}`;
                    }
                }
            },
        },
        scales: {
            x: { 
                title: { display: true, text: 'Currency', color: '#94a3b8' },
                ticks: { color: '#94a3b8' }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            },
            y: { 
                title: { display: true, text: 'Exchange Rate', color: '#94a3b8' },
                ticks: { color: '#94a3b8' }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            }
        },
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-green-400">All Currency Exchange Rates</h2>
            <div className="h-96">
                {exchangeRates && Object.keys(exchangeRates).length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div className="text-center text-gray-500 py-20">No data available for comparison.</div>
                )}
            </div>
        </div>
    );
};

const TradingDashboard = ({
  liveData,
  ema,
  trades,
  volumeLimit,
  isAutoTradeActive,
  setIsAutoTradeActive,
  onPlaceOrder,
  totalVolume,
  exchangeRates,
  isDataReady,
  wallet,
  mlRecommendation
}) => {
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [currencyPair1, setCurrencyPair1] = useState('USD');
  const [currencyPair2, setCurrencyPair2] = useState('INR');
  const [secondCurrency, setSecondCurrency] = useState('None');

  const handlePlaceOrder = (action) => {
    onPlaceOrder({ action, currencyPair: `${currencyPair1}/${currencyPair2}`, quantity: orderQuantity });
  };
  
  const livePrice1 = liveData.length > 0 ? liveData[liveData.length - 1]?.rate : 0;

  const chartData = {
    labels: liveData.map((d, i) => i + 1),
    datasets: [
      {
        label: `Live Price (${currencyPair1}/${currencyPair2})`,
        data: liveData.map((d) => d.rate),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: `EMA (5 min) for (${currencyPair1}/${currencyPair2})`,
        data: liveData.map(d => d.ema5),
        borderColor: '#fcd34d',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  if (secondCurrency !== 'None' && exchangeRates[secondCurrency]) {
    chartData.datasets.push({
      label: `Live Price (USD/${secondCurrency})`,
      data: liveData.map(d => exchangeRates[secondCurrency]),
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96, 165, 250, 0.2)',
      tension: 0.4,
      fill: false,
    });
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (Data Points)',
          color: '#94a3b8'
        },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        title: {
          display: true,
          text: 'Exchange Rate',
          color: '#94a3b8'
        },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD'];

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
              Live Market Data
          </h2>
          <div className="flex items-center space-x-4 mb-4">
              <label className="block text-sm font-medium text-gray-300">Primary Pair:</label>
              <select
                  className="rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={currencyPair1}
                  onChange={(e) => setCurrencyPair1(e.target.value)}
              >
                  {currencyOptions.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                  ))}
              </select>
              <span>/</span>
              <select
                  className="rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={currencyPair2}
                  onChange={(e) => setCurrencyPair2(e.target.value)}
              >
                  {currencyOptions.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                  ))}
              </select>
          </div>
          <div className="flex items-center space-x-4 mb-4">
              <label className="block text-sm font-medium text-gray-300">Compare with:</label>
              <select
                  className="rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={secondCurrency}
                  onChange={(e) => setSecondCurrency(e.target.value)}
              >
                  <option value="None">None</option>
                  {currencyOptions.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                  ))}
              </select>
          </div>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="col-span-1 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Trading Action Panel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Currency Pair</label>
              <select
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                value={`${currencyPair1}/${currencyPair2}`}
                onChange={(e) => {
                  const [pair1, pair2] = e.target.value.split('/');
                  setCurrencyPair1(pair1);
                  setCurrencyPair2(pair2);
                }}
              >
                <option value="USD/INR">USD/INR</option>
                <option value="USD/EUR">USD/EUR</option>
                <option value="GBP/USD">GBP/USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Order Quantity</label>
              <input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                min="1"
              />
              <p className="text-xs text-gray-400 mt-1">
                You will exchange `1` {currencyPair1} for approximately `80.00` {currencyPair2}
              </p>
            </div>
            <div className="flex space-x-4">
              <motion.button
                onClick={() => handlePlaceOrder('Buy')}
                className="flex-1 py-3 px-4 rounded-lg font-bold bg-green-600 text-white transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isDataReady}
              >
                Buy
              </motion.button>
              <motion.button
                onClick={() => handlePlaceOrder('Sell')}
                className="flex-1 py-3 px-4 rounded-lg font-bold bg-red-600 text-white transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isDataReady}
              >
                Sell
              </motion.button>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 mt-4 text-center">
                <h3 className="text-sm font-semibold text-gray-300 mb-1">ML Prediction: <span className={`font-bold ${mlRecommendation === 'Buy' ? 'text-green-400' : mlRecommendation === 'Sell' ? 'text-red-400' : 'text-gray-400'}`}>{mlRecommendation}</span></h3>
            </div>
            <motion.button
              onClick={() => setIsAutoTradeActive(!isAutoTradeActive)}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors duration-200 ${
                isAutoTradeActive
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAutoTradeActive ? 'Stop Auto-Trade' : 'Start Auto-Trade'}
            </motion.button>
            <div className="mt-4 text-center text-sm font-medium text-gray-400">
              Total Auto-Trade Volume: ${totalVolume.toLocaleString()} / ${volumeLimit.toLocaleString()}
            </div>
            {!isDataReady && (
              <div className="text-center text-sm text-yellow-400 mt-2">
                Loading live data... Please wait.
              </div>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Wallet</h3>
            <div className="grid grid-cols-2 gap-4">
                {Object.keys(wallet).map(currency => (
                    <div key={currency} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-gray-300">{currency}</span>
                        <span className="font-bold text-white">{wallet[currency].toFixed(2)}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    
      <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400">All Currency Exchange Rates</h2>
          <div className="h-96">
            <CurrencyComparisonChart exchangeRates={exchangeRates} />
          </div>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Trade Blotter (Executed Trades)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pair</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {trades.length > 0 ? (
                trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{trade.currencyPair}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${trade.action === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{trade.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${trade.price.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{trade.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(trade.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">No trades executed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StrategiesPage = () => {
    const [backtestData, setBacktestData] = useState(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('ema');
    const [backtestMetrics, setBacktestMetrics] = useState(null);

    const generateMockData = () => {
        const data = [];
        let price = 75 + Math.random() * 5;
        for (let i = 0; i < 100; i++) {
            price += (Math.random() - 0.5) * 0.2;
            data.push(price);
        }
        return data;
    };

    const calculateSMA = (prices, period) => {
        const sma = [];
        for (let i = 0; i < prices.length; i++) {
            const start = Math.max(0, i - period + 1);
            const slice = prices.slice(start, i + 1);
            const sum = slice.reduce((a, b) => a + b, 0);
            sma.push(sum / slice.length);
        }
        return sma;
    };

    const calculateEMA = (prices, period) => {
        const ema = [];
        const k = 2 / (period + 1);
        ema[0] = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema[i] = prices[i] * k + ema[i-1] * (1-k);
        }
        return ema;
    };

    const calculateRSI = (prices, period = 14) => {
      if (prices.length < period + 1) return [];

      let gains = 0, losses = 0;
      for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;
      const rsi = new Array(period).fill(null);

      for (let i = period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) {
          avgGain = (avgGain * (period - 1) + diff) / period;
          avgLoss = (avgLoss * (period - 1)) / period;
        } else {
          avgGain = (avgGain * (period - 1)) / period;
          avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
      return rsi;
    };

    const calculateBollingerBands = (prices, period=20, stdDev=2) => {
      const bands = [];
      const sma = calculateSMA(prices, period);
      for(let i=0; i<prices.length; i++){
        const slice = prices.slice(Math.max(0, i - period + 1), i + 1);
        const mean = sma[i];
        const sumOfSquares = slice.reduce((sum, p) => sum + (p - mean)**2, 0);
        const stdev = Math.sqrt(sumOfSquares / slice.length);
        bands.push({
          upper: mean + stdev * stdDev,
          lower: mean - stdev * stdDev,
        });
      }
      return bands;
    };

    const runBacktest = () => {
        const mockData = generateMockData();
        let trades = [];
        let pnl = 0;
        let lastAction = null;
        let entryPrice = 0;
        let winningTrades = 0;
        let totalTrades = 0;

        if (selectedAlgorithm === 'ema') {
            const ema5 = calculateEMA(mockData, 5);
            for(let i = 1; i < mockData.length; i++) {
                if (mockData[i] > ema5[i] && mockData[i-1] <= ema5[i-1] && lastAction !== 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'buy' });
                    entryPrice = mockData[i];
                    lastAction = 'buy';
                    totalTrades++;
                } else if (mockData[i] < ema5[i] && mockData[i-1] >= ema5[i-1] && lastAction === 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'sell' });
                    pnl += mockData[i] - entryPrice;
                    if(mockData[i] > entryPrice) winningTrades++;
                    lastAction = 'sell';
                }
            }
        } else if (selectedAlgorithm === 'rsi') {
            const rsi = calculateRSI(mockData);
            for(let i = 1; i < mockData.length; i++) {
                if (rsi[i] < 30 && lastAction !== 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'buy' });
                    entryPrice = mockData[i];
                    lastAction = 'buy';
                    totalTrades++;
                } else if (rsi[i] > 70 && lastAction === 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'sell' });
                    pnl += mockData[i] - entryPrice;
                    if(mockData[i] > entryPrice) winningTrades++;
                    lastAction = 'sell';
                }
            }
        } else if (selectedAlgorithm === 'bollinger') {
            const bands = calculateBollingerBands(mockData);
            for(let i = 1; i < mockData.length; i++) {
                if (mockData[i] < bands[i].lower && lastAction !== 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'buy' });
                    entryPrice = mockData[i];
                    lastAction = 'buy';
                    totalTrades++;
                } else if (mockData[i] > bands[i].upper && lastAction === 'buy') {
                    trades.push({ point: i, price: mockData[i], action: 'sell' });
                    pnl += mockData[i] - entryPrice;
                    if(mockData[i] > entryPrice) winningTrades++;
                    lastAction = 'sell';
                }
            }
        }

        setBacktestData({
            prices: mockData,
            trades: trades,
        });

        setBacktestMetrics({
            total_profit: pnl,
            total_trades: totalTrades,
            win_rate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
        });
    };

    const backtestChartData = useMemo(() => {
        if (!backtestData) return null;
        
        const buyPoints = backtestData.trades.filter(t => t.action === 'buy').map(t => ({ x: t.point, y: t.price }));
        const sellPoints = backtestData.trades.filter(t => t.action === 'sell').map(t => ({ x: t.point, y: t.price }));

        return {
            labels: backtestData.prices.map((_, i) => i),
            datasets: [
                {
                    label: 'Price',
                    data: backtestData.prices,
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    tension: 0.4,
                    pointRadius: 0,
                    fill: false,
                },
                {
                    label: 'Buy Signal',
                    data: buyPoints,
                    borderColor: 'rgba(52, 211, 153, 1)',
                    backgroundColor: 'rgba(52, 211, 153, 1)',
                    pointRadius: 5,
                    type: 'scatter',
                },
                {
                    label: 'Sell Signal',
                    data: sellPoints,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 1)',
                    pointRadius: 5,
                    type: 'scatter',
                },
            ],
        };
    }, [backtestData]);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: {
              labels: { color: '#e2e8f0' },
          },
          tooltip: { mode: 'index', intersect: false },
      },
      scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
  };

  const algorithmSuggestions = useMemo(() => {
    const algorithms = ['ema', 'rsi', 'bollinger'];
    const results = {};

    algorithms.forEach(algo => {
      let trades = [];
      let pnl = 0;
      let lastAction = null;
      let entryPrice = 0;
      let winningTrades = 0;
      let totalTrades = 0;
      const mockData = generateMockData();

      if (algo === 'ema') {
          const ema5 = calculateEMA(mockData, 5);
          for(let i = 1; i < mockData.length; i++) {
              if (mockData[i] > ema5[i] && mockData[i-1] <= ema5[i-1] && lastAction !== 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'buy' });
                  entryPrice = mockData[i];
                  lastAction = 'buy';
                  totalTrades++;
              } else if (mockData[i] < ema5[i] && mockData[i-1] >= ema5[i-1] && lastAction === 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'sell' });
                  pnl += mockData[i] - entryPrice;
                  if(mockData[i] > entryPrice) winningTrades++;
                  lastAction = 'sell';
              }
          }
      } else if (algo === 'rsi') {
          const rsi = calculateRSI(mockData);
          for(let i = 1; i < mockData.length; i++) {
              if (rsi[i] < 30 && lastAction !== 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'buy' });
                  entryPrice = mockData[i];
                  lastAction = 'buy';
                  totalTrades++;
              } else if (rsi[i] > 70 && lastAction === 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'sell' });
                  pnl += mockData[i] - entryPrice;
                  if(mockData[i] > entryPrice) winningTrades++;
                  lastAction = 'sell';
              }
          }
      } else if (algo === 'bollinger') {
          const bands = calculateBollingerBands(mockData);
          for(let i = 1; i < mockData.length; i++) {
              if (mockData[i] < bands[i].lower && lastAction !== 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'buy' });
                  entryPrice = mockData[i];
                  lastAction = 'buy';
                  totalTrades++;
              } else if (mockData[i] > bands[i].upper && lastAction === 'buy') {
                  trades.push({ point: i, price: mockData[i], action: 'sell' });
                  pnl += mockData[i] - entryPrice;
                  if(mockData[i] > entryPrice) winningTrades++;
                  lastAction = 'sell';
              }
          }
      }

      results[algo] = {
        total_profit: pnl,
        total_trades: totalTrades,
        win_rate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
      };
    });

    return results;
  }, []);

  const bestAlgorithm = useMemo(() => {
    if (!backtestMetrics) return null;
    let best = null;
    let maxProfit = -Infinity;

    for (const algo in algorithmSuggestions) {
      if (algorithmSuggestions[algo].total_profit > maxProfit) {
        maxProfit = algorithmSuggestions[algo].total_profit;
        best = algo;
      }
    }
    return best;
  }, [backtestMetrics, algorithmSuggestions]);

    return (
        <div className="p-8 text-white min-h-screen bg-gray-900">
            <h1 className="text-3xl font-bold text-green-400 mb-6">Trading Strategies</h1>
            <p className="text-gray-400 mb-8">
                This panel allows you to backtest different trading algorithms on a simulated historical dataset to evaluate their performance.
            </p>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Backtesting Panel</h2>
                <div className="flex items-center space-x-4 mb-4">
                    <label className="block text-sm font-medium text-gray-300">Select Algorithm</label>
                    <select
                        className="rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    >
                        <option value="ema">EMA Crossover</option>
                        <option value="rsi">RSI Strategy</option>
                        <option value="bollinger">Bollinger Bands</option>
                    </select>
                    <motion.button
                        onClick={runBacktest}
                        className="py-2 px-4 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Run Backtest
                    </motion.button>
                </div>
                {backtestData && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Backtest Results for {selectedAlgorithm.toUpperCase()}</h3>
                        <div className="h-96 mb-6">
                            <Line data={backtestChartData} options={chartOptions} />
                        </div>
                        {backtestMetrics && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-700 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-400">Total P/L</h4>
                                  <p className={`text-xl font-bold ${backtestMetrics.total_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      ${backtestMetrics.total_profit.toFixed(2)}
                                  </p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-400">Total Trades</h4>
                                  <p className="text-xl font-bold text-white">{backtestMetrics.total_trades}</p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-400">Win Rate</h4>
                                  <p className="text-xl font-bold text-white">{backtestMetrics.win_rate.toFixed(2)}%</p>
                              </div>
                          </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl mt-8">
              <h2 className="text-xl font-semibold text-green-400 mb-4">Algorithm Comparison</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Algorithm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total P/L</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Trades</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {Object.keys(algorithmSuggestions).map(algo => (
                        <tr key={algo} className="hover:bg-gray-700 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{algo.toUpperCase()}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${algorithmSuggestions[algo].total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${algorithmSuggestions[algo].total_profit.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{algorithmSuggestions[algo].total_trades}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{algorithmSuggestions[algo].win_rate.toFixed(2)}%</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bestAlgorithm && (
                  <div className="mt-6 p-4 rounded-lg bg-green-900 bg-opacity-30 border border-green-700 text-green-400">
                      <h3 className="text-lg font-semibold">Best Suggestion:</h3>
                      <p>Based on the backtesting results, the **{bestAlgorithm.toUpperCase()}** algorithm achieved the highest profit. Consider using this strategy for your trades.</p>
                  </div>
              )}
            </div>
        </div>
    );
};

const HistoryPage = ({ trades }) => {
  return (
    <div className="p-8 text-white min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Trade History</h1>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Historical Trades</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pair</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {trades.length > 0 ? (
                trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{trade.currencyPair}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${trade.action === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{trade.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${trade.price.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{trade.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(trade.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">No trades executed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AnalyticsPage = ({ trades }) => {
    const totalTrades = trades.length;
    const totalProfit = trades.reduce((acc, trade) => acc + trade.profit, 0);
    const totalVolume = trades.reduce((acc, trade) => acc + trade.quantity, 0);

    const profitLabels = trades.map((_, i) => `Trade ${i + 1}`);
    const profitData = {
        labels: profitLabels,
        datasets: [
            {
                label: 'Profit/Loss',
                data: trades.map(trade => trade.profit),
                borderColor: totalProfit >= 0 ? '#34d399' : '#ef4444',
                backgroundColor: totalProfit >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const profitOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#e2e8f0' }
            },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-gray-900">
            <h1 className="text-3xl font-bold text-green-400 mb-6">Analytics & Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Trades</h2>
                    <p className="text-3xl font-bold text-white">{totalTrades}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Volume</h2>
                    <p className="text-3xl font-bold text-white">${totalVolume.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Total P/L</h2>
                    <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${totalProfit.toFixed(2)}
                    </p>
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-green-400">Profit & Loss Chart</h2>
                <div className="h-96">
                    <Line data={profitData} options={profitOptions} />
                </div>
            </div>
        </div>
    );
};

const SettingsPage = ({ volumeLimit, setVolumeLimit }) => {
  return (
    <div className="p-8 text-white min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Settings</h1>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-green-400">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Auto-Trade Volume Limit ($)</label>
            <input
              type="number"
              value={volumeLimit}
              onChange={(e) => setVolumeLimit(Number(e.target.value))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              min="1000"
              step="1000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ username, trades }) => {
  const totalTradesCount = trades.length;
  const totalProfit = trades.reduce((acc, trade) => acc + trade.profit, 0);

  return (
    <div className="p-8 text-white min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-4">Trader Profile</h1>
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-24 h-24 text-gray-400 mx-auto">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.38 0 2.5 1.12 2.5 2.5S13.38 10 12 10s-2.5-1.12-2.5-2.5S10.62 5 12 5zm0 14.2c-2.68 0-5.2-1.2-6.9-3.2l-.1-0.1c-1.3-1.6-2-3.6-2-5.7V8.5C5 7.6 8.1 7.4 12 7.4s7 0.2 7 1.1v1.7c0 2.1-.7 4.1-2 5.7L18.9 16c-1.7 2-4.2 3.2-6.9 3.2z"/>
          </svg>
        </div>
        <div className="space-y-4 text-left">
          <p className="text-lg text-gray-300">
            <span className="font-semibold text-white">Username:</span> <span className="text-green-400 break-words">{username}</span>
          </p>
          <p className="text-lg text-gray-300">
            <span className="font-semibold text-white">Total Trades Executed:</span> {totalTradesCount}
          </p>
          <p className="text-lg text-gray-300">
            <span className="font-semibold text-white">Total Profit/Loss:</span> <span className={`${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${totalProfit.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLoginSuccess, setNotification }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/signup';
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          onLoginSuccess(data.username);
        } else {
          setNotification('Signup successful. Please log in.');
          setIsLogin(true);
        }
      } else {
        setNotification(data.error || 'An error occurred.');
      }
    } catch (e) {
      setNotification('Failed to connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-green-400 mb-6">
          {isLogin ? 'Login to AlphaFxTrader' : 'Create an Account'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Signup')}
          </motion.button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-center text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </motion.div>
    </div>
  );
};

const App = () => {
  const [activePage, setActivePage] = useState(AppState.HOME);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [liveData, setLiveData] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState('USD');
  const [trades, setTrades] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [volumeLimit, setVolumeLimit] = useState(10000000);
  const [notification, setNotification] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [wallet, setWallet] = useState({});
  const [socket, setSocket] = useState(null);
  const [mlRecommendation, setMlRecommendation] = useState('Hold');

  const emaPeriod = 5;
  const ema = useMemo(() => {
    if (liveData.length === 0) return 0;
    let prices = liveData.map(d => d.rate);
    const k = 2 / (emaPeriod + 1);
    let emaVal = prices[0];
    for (let i = 1; i < prices.length; i++) {
        emaVal = (prices[i] * k) + (emaVal * (1 - k));
    }
    return emaVal;
  }, [liveData, emaPeriod]);

  const fetchTrades = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setNotification('Authentication failed. Please log in again.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/trades', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setTrades(data);
        const currentTotalVolume = data.reduce((sum, trade) => sum + trade.quantity, 0);
        setTotalVolume(currentTotalVolume);
    } catch (e) {
        console.error("Error fetching trades:", e);
        setNotification('Failed to fetch trades from backend. Please log in again.');
    }
  }, [setNotification, setTrades, setTotalVolume]);

  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/wallet', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setWallet(data);
    } catch (e) {
        console.error("Error fetching wallet:", e);
        setNotification('Failed to fetch wallet from backend. Please log in again.');
    }
  }, [setWallet, setNotification]);

  const handlePlaceOrder = useCallback(async ({ action, currencyPair, quantity }) => {
    if (!isAuthenticated) {
      setNotification('Please log in to place an order.');
      return;
    }
    const token = localStorage.getItem('token');
    const currentPrice = liveData.length > 0 ? liveData[liveData.length - 1].rate : null;
    if (!currentPrice) {
      setNotification('Cannot place order. No live price data.');
      return;
    }

    const tradePayload = {
      currencyPair,
      action,
      price: currentPrice,
      quantity,
    };

    try {
      const response = await fetch('http://localhost:5000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tradePayload),
      });

      if (response.ok) {
        setNotification(`${action} order placed successfully!`);
        await fetchTrades();
        await fetchWallet();
      } else {
        const errorData = await response.json();
        setNotification(`Failed to place ${action} order: ${errorData.error}`);
      }
    } catch (e) {
      console.error("Error sending trade to backend:", e);
      setNotification(`Failed to connect to backend.`);
    }
  }, [isAuthenticated, liveData, setNotification, fetchTrades, fetchWallet]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('username', user);
    localStorage.setItem('isAuthenticated', 'true');
    setNotification('Login successful!');
    fetchWallet();
    fetchTrades();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthenticated');
    if (socket) {
      socket.disconnect();
    }
    setNotification('Logged out successfully.');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchTrades();
        fetchWallet();
    }
  }, [fetchTrades, fetchWallet]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('latest_rates_update', (data) => {
      console.log('Received real-time data:', data);
      if (data.base === 'USD' && data.conversion_rates.INR) {
        const newRate = { rate: data.conversion_rates.INR, ema5: data.ema5, timestamp: Date.now() };
        setLiveData(prevData => {
          const updatedData = [...prevData, newRate];
          if (updatedData.length > 50) updatedData.shift();
          return updatedData;
        });
      }
      setExchangeRates(data.conversion_rates);
      setMlRecommendation(data.ml_recommendation);
      setIsDataReady(true);
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      newSocket.emit('request_latest_rates', selectedBaseCurrency);
    });
    
    newSocket.on('error', (message) => {
        setNotification(`WebSocket error: ${message}`);
        setIsDataReady(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const [isAutoTradeActive, setIsAutoTradeActive] = useState(false);
  const handleAutoTrade = useCallback(() => {
    setIsAutoTradeActive(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isAutoTradeActive || !isDataReady || liveData.length === 0 || mlRecommendation === 'Hold') return;
    
    const lastPrice = liveData[liveData.length - 1].rate;
    
    if (mlRecommendation === 'Buy') {
      handlePlaceOrder({ action: 'Buy', currencyPair: 'USD/INR', quantity: 1 });
    } else if (mlRecommendation === 'Sell') {
      handlePlaceOrder({ action: 'Sell', currencyPair: 'USD/INR', quantity: 1 });
    }

  }, [isAutoTradeActive, isDataReady, mlRecommendation, liveData, handlePlaceOrder]);

  const renderPage = () => {
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} setNotification={setNotification} />;
    }

    switch (activePage) {
      case AppState.HOME:
        return (
          <TradingDashboard
            liveData={liveData}
            ema={ema}
            trades={trades}
            volumeLimit={volumeLimit}
            isAutoTradeActive={isAutoTradeActive}
            setIsAutoTradeActive={handleAutoTrade}
            onPlaceOrder={handlePlaceOrder}
            totalVolume={totalVolume}
            exchangeRates={exchangeRates}
            selectedBaseCurrency={selectedBaseCurrency}
            setSelectedBaseCurrency={setSelectedBaseCurrency}
            socket={socket}
            isDataReady={isDataReady}
            wallet={wallet}
            mlRecommendation={mlRecommendation}
          />
        );
      case AppState.STRATEGIES:
        return <StrategiesPage />;
      case AppState.HISTORY:
        return <HistoryPage trades={trades} />;
      case AppState.ANALYTICS:
        return <AnalyticsPage trades={trades} />;
      case AppState.SETTINGS:
        return <SettingsPage volumeLimit={volumeLimit} setVolumeLimit={setVolumeLimit} />;
      case AppState.PROFILE:
        return <ProfilePage username={username} trades={trades} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans">
      {isAuthenticated && (
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          username={username || 'N/A'} 
          onLogout={handleLogout}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {notification && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 right-4 bg-gray-800 text-white py-3 px-6 rounded-lg shadow-xl border border-gray-700 max-w-sm z-50"
            >
                {notification}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
