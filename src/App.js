import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnimatePresence, motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Tailwind CSS is pre-configured, so we can use its classes directly.
// The app uses a dark theme with custom colors.

// A central data store for all app state
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

const TradingDashboard = ({
  liveData,
  sma,
  bollinger,
  trades,
  volumeLimit,
  isAutoTradeActive,
  setIsAutoTradeActive,
  onPlaceOrder,
  totalVolume,
  notification
}) => {
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [currencyPair, setCurrencyPair] = useState('USD/INR');

  const handlePlaceOrder = (action) => {
    onPlaceOrder({ action, currencyPair, quantity: orderQuantity });
  };

  const chartData = {
    labels: liveData.map((d, i) => i + 1),
    datasets: [
      {
        label: 'Live Price',
        data: liveData.map((d) => d.rate),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'SMA',
        data: sma.map((s) => s.rate),
        borderColor: '#fcd34d',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderDash: [5, 5],
      },
      {
        label: 'Bollinger Bands (Upper)',
        data: bollinger.map((b) => b.upper),
        borderColor: '#60a5fa',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Bollinger Bands (Lower)',
        data: bollinger.map((b) => b.lower),
        borderColor: '#60a5fa',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

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
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Live Market Data Section */}
        <div className="col-span-1 md:col-span-2 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Live Market Data</h2>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Trading Action Panel */}
        <div className="col-span-1 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Trading Action Panel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Currency Pair</label>
              <select
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
                value={currencyPair}
                onChange={(e) => setCurrencyPair(e.target.value)}
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
            </div>
            <div className="flex space-x-4">
              <motion.button
                onClick={() => handlePlaceOrder('Buy')}
                className="flex-1 py-3 px-4 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Buy
              </motion.button>
              <motion.button
                onClick={() => handlePlaceOrder('Sell')}
                className="flex-1 py-3 px-4 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sell
              </motion.button>
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
          </div>
        </div>
      </div>

      {/* Trade Blotter */}
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
    return (
        <div className="p-8 text-white min-h-screen bg-gray-900">
            <h1 className="text-3xl font-bold text-green-400 mb-6">Trading Strategies</h1>
            <p className="text-gray-400 mb-8">
                This page showcases various trading algorithms. You can backtest them with historical data to compare their performance and optimize your trading approach.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-green-400 mb-4">SMA Crossover</h2>
                    <p className="text-gray-300">
                        The Simple Moving Average (SMA) crossover strategy generates a buy signal when a short-term moving average crosses above a long-term moving average.
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-green-400 mb-4">Bollinger Bands</h2>
                    <p className="text-gray-300">
                        Bollinger Bands are a momentum-based indicator that identifies overbought or oversold conditions. It typically generates buy signals when the price touches the lower band.
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-green-400 mb-4">RSI Strategy</h2>
                    <p className="text-gray-300">
                        The Relative Strength Index (RSI) is an oscillator that measures the speed and change of price movements. A reading above 70 is often considered overbought, and below 30 is oversold.
                    </p>
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 mt-8 border border-gray-700 shadow-xl">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Backtesting Panel</h2>
                <div className="text-gray-400 text-center py-10">
                    <p>Backtesting functionality to be implemented. Please use the dashboard for live simulation.</p>
                </div>
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
                  <td colSpan="7" className="text-center py-8 text-gray-400">No trades found.</td>
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

const SettingsPage = ({ volumeLimit, setVolumeLimit, dataRefreshInterval, setDataRefreshInterval }) => {
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data Refresh Interval (seconds)</label>
            <input
              type="number"
              value={dataRefreshInterval / 1000}
              onChange={(e) => setDataRefreshInterval(Number(e.target.value) * 1000)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              min="1"
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
      const response = await fetch(`http://localhost:3000${endpoint}`, {
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
  const [trades, setTrades] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [volumeLimit, setVolumeLimit] = useState(10000000);
  const [isAutoTradeActive, setIsAutoTradeActive] = useState(false);
  const [dataRefreshInterval, setDataRefreshInterval] = useState(3000);
  const [notification, setNotification] = useState('');

  // Trading logic state
  const smaPeriod = 14;
  const smaHistory = liveData.slice(-smaPeriod);
  const sma = smaHistory.length === smaPeriod
    ? [{ rate: smaHistory.reduce((sum, d) => sum + d.rate, 0) / smaPeriod }]
    : [];

  const bollingerPeriod = 20;
  const bollingerHistory = liveData.slice(-bollingerPeriod);
  const bollinger = bollingerHistory.length === bollingerPeriod ? (() => {
    const prices = bollingerHistory.map(d => d.rate);
    const mean = prices.reduce((sum, p) => sum + p, 0) / bollingerPeriod;
    const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + (p - mean) ** 2, 0) / bollingerPeriod);
    return [{
      upper: mean + (2 * stdDev),
      lower: mean - (2 * stdDev)
    }];
  })() : [{ upper: 0, lower: 0 }];

  // Auth check on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // For a real app, you would verify the token with the backend
      // For this simulation, we assume it's valid if it exists
      const usernameFromToken = localStorage.getItem('username'); // Storing username for display
      setIsAuthenticated(true);
      setUsername(usernameFromToken);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('username', user);
    setNotification('Login successful!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setNotification('Logged out successfully.');
  };

  // Fetching data from the backend
  const fetchTrades = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/api/trades', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setTrades(data);

        // Calculate total volume
        const currentTotalVolume = data.reduce((sum, trade) => sum + trade.quantity, 0);
        setTotalVolume(currentTotalVolume);
    } catch (e) {
        console.error("Error fetching trades:", e);
        setNotification('Failed to fetch trades from backend. Please log in again.');
    }
  };
  
  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/api/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        // The analytics data will be used to update the AnalyticsPage
    } catch (e) {
        console.error("Error fetching analytics:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchTrades();
    }
  }, [isAuthenticated]);

  // Simulate real-time data from API and auto-trade
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const rate = data.rates['INR'];
        setLiveData(prevData => {
          const newRate = { rate: rate + (Math.random() - 0.5) * 0.1, timestamp: Date.now() };
          const updatedData = [...prevData, newRate];
          if (updatedData.length > 50) updatedData.shift(); // Keep last 50 data points
          return updatedData;
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(() => {
      fetchData();
    }, dataRefreshInterval);

    return () => clearInterval(interval);
  }, [dataRefreshInterval, isAuthenticated]);

  // Trading algorithm for auto-trading
  useEffect(() => {
    if (!isAutoTradeActive || liveData.length < bollingerPeriod) return;

    const lastPrice = liveData[liveData.length - 1].rate;
    const { upper, lower } = bollinger[0];

    // Simple Bollinger Bands logic for trading
    if (lastPrice < lower) {
      handlePlaceOrder({ action: 'Buy', currencyPair: 'USD/INR', quantity: 1 });
    } else if (lastPrice > upper) {
      handlePlaceOrder({ action: 'Sell', currencyPair: 'USD/INR', quantity: 1 });
    }

  }, [liveData, isAutoTradeActive, bollinger]);

  const handlePlaceOrder = async ({ action, currencyPair, quantity }) => {
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
      const response = await fetch('http://localhost:3000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tradePayload),
      });

      if (response.ok) {
        setNotification(`${action} order placed successfully!`);
        await fetchTrades(); // Refresh the trade list after a successful trade
      } else {
        const errorData = await response.json();
        setNotification(`Failed to place ${action} order: ${errorData.error}`);
      }
    } catch (e) {
      console.error("Error sending trade to backend:", e);
      setNotification(`Failed to connect to backend.`);
    }
  };

  const renderPage = () => {
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} setNotification={setNotification} />;
    }

    switch (activePage) {
      case AppState.HOME:
        return (
          <TradingDashboard
            liveData={liveData}
            sma={sma}
            bollinger={bollinger}
            trades={trades}
            volumeLimit={volumeLimit}
            isAutoTradeActive={isAutoTradeActive}
            setIsAutoTradeActive={setIsAutoTradeActive}
            onPlaceOrder={handlePlaceOrder}
            totalVolume={totalVolume}
            notification={notification}
          />
        );
      case AppState.STRATEGIES:
        return <StrategiesPage />;
      case AppState.HISTORY:
        return <HistoryPage trades={trades} />;
      case AppState.ANALYTICS:
        return <AnalyticsPage trades={trades} />;
      case AppState.SETTINGS:
        return <SettingsPage volumeLimit={volumeLimit} setVolumeLimit={setVolumeLimit} dataRefreshInterval={dataRefreshInterval} setDataRefreshInterval={setDataRefreshInterval} />;
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
