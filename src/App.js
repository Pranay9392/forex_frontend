import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Constants and global variables
// We're simulating the backend environment, so the Mongo URI is not used directly.
const MONGO_URI = 'mongodb+srv://aletipranaypranay_db_user:Pranay123@practice.9vjd7ao.mongodb.net/?retryWrites=true&w=majority&appName=practice';

// The main App component that represents our single-file application
const App = () => {
    // State variables for application data and UI
    const [livePrice, setLivePrice] = useState(null);
    const [smaValue, setSmaValue] = useState(null);
    const [tradingVolume, setTradingVolume] = useState(0);
    const [isAutoTradingEnabled, setIsAutoTradingEnabled] = useState(true);
    const [userId, setUserId] = useState('aletipranay');
    const [tradeHistory, setTradeHistory] = useState([]);
    const [popup, setPopup] = useState({ visible: false, message: '' });

    // Refs to hold mutable data that won't trigger re-renders
    const pricesRef = useRef([]);
    const smaDataRef = useRef([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const simulatedTradeDB = useRef([]);

    // This function simulates a WebSocket connection from a backend server.
    const simulateLiveRates = (onMessageCallback) => {
        setInterval(() => {
            const latestPrice = pricesRef.current.length > 0 ? pricesRef.current[pricesRef.current.length - 1].y : 1.0800;
            const newPrice = latestPrice + (Math.random() - 0.5) * 0.001;
            const timestamp = new Date().toLocaleTimeString();
            const data = {
                currencyPair: 'EUR/USD',
                rate: newPrice,
                timestamp: timestamp,
            };
            if (onMessageCallback) {
              onMessageCallback(JSON.stringify(data));
            }
        }, 1000);
    };

    // This function simulates a POST request to a backend for executing a trade.
    // It now saves to our local, in-memory database.
    const postTradeToBackend = async (trade) => {
        try {
            // Simulate adding a new trade to the MongoDB database
            const tradeWithId = { ...trade, id: Date.now() };
            simulatedTradeDB.current.unshift(tradeWithId);
            
            // Update the React state to reflect the new trade
            setTradeHistory(simulatedTradeDB.current);

            // Update the trading volume state
            setTradingVolume(prevVolume => prevVolume + tradeWithId.amount);

            console.log("Trade saved to simulated database:", tradeWithId);
        } catch (error) {
            console.error("Error saving trade to simulated database:", error);
            setPopup({ visible: true, message: `Error saving trade: ${error.message}` });
        }
    };

    // Utility to show a popup
    const showPopup = (message) => {
        setPopup({ visible: true, message });
    };

    // Simple Moving Average calculation
    const calculateSMA = (data, period) => {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    };

    // Main real-time data and trading logic handler
    const handleRealtimeData = (data) => {
        try {
            const parsedData = JSON.parse(data);
            const { rate, timestamp } = parsedData;

            setLivePrice(rate.toFixed(4));

            const newDataPoint = { x: timestamp, y: rate };
            pricesRef.current.push(newDataPoint);
            const maxPoints = 50;
            if (pricesRef.current.length > maxPoints) {
                pricesRef.current.shift();
            }

            const currentPrices = pricesRef.current.map(p => p.y);
            const sma = calculateSMA(currentPrices, 10);
            setSmaValue(sma?.toFixed(4));
            
            if (chartInstanceRef.current) {
                const chartData = chartInstanceRef.current.data;
                chartData.datasets[0].data = pricesRef.current;
                if (sma) {
                    const newSmaDataPoint = { x: timestamp, y: sma };
                    smaDataRef.current.push(newSmaDataPoint);
                    if (smaDataRef.current.length > maxPoints) {
                        smaDataRef.current.shift();
                    }
                    chartData.datasets[1].data = smaDataRef.current;
                }
                chartInstanceRef.current.update();
            }

            if (isAutoTradingEnabled && currentPrices.length >= 10) {
                const lastPrice = currentPrices[currentPrices.length - 1];
                const prevPrice = currentPrices[currentPrices.length - 2];
                const lastSMA = smaDataRef.current[smaDataRef.current.length - 1]?.y;
                const prevSMA = smaDataRef.current[smaDataRef.current.length - 2]?.y;

                if (prevSMA && lastSMA) {
                    if (lastPrice > lastSMA && prevPrice < prevSMA) {
                        executeTrade('buy', rate);
                    } else if (lastPrice < lastSMA && prevPrice > prevSMA) {
                        executeTrade('sell', rate);
                    }
                }
            }
        } catch (error) {
            console.error("Error in handleRealtimeData:", error);
            setPopup({ visible: true, message: `Error processing real-time data: ${error.message}` });
        }
    };

    const executeTrade = (type, price, isManual = false) => {
        const maxVolume = 10000000;
        if (tradingVolume >= maxVolume) {
            if (isAutoTradingEnabled) {
                setIsAutoTradingEnabled(false);
                setPopup({ visible: true, message: `Trading volume limit of $${(maxVolume/1000000).toFixed(0)}M reached. Auto-trading is now disabled.` });
            }
            if (!isManual) return;
        }

        const trade = {
            type,
            currencyPair: 'EUR/USD',
            price,
            amount: Math.floor(Math.random() * 500000) + 100000,
            isManual,
            timestamp: new Date()
        };
        postTradeToBackend(trade);
    };

    useEffect(() => {
      // Cleanup function to destroy the chart instance
      if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
      }

      if (chartRef.current) {
        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'EUR/USD Live Rate',
                    borderColor: 'rgb(54, 162, 235)',
                    data: [],
                    tension: 0.1,
                    fill: false
                }, {
                    label: '10-period SMA',
                    borderColor: 'rgb(255, 99, 132)',
                    data: [],
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'FX Rate'
                        }
                    }
                }
            }
        });
        
        simulateLiveRates(handleRealtimeData);
      }
      
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, []);

    return (
        <div className="bg-gray-900 text-gray-100 font-sans p-6 min-h-screen">
            {popup.visible && (
                <>
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40"></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-lg shadow-2xl p-6 z-50 max-w-sm w-full border border-gray-700">
                        <p className="text-white text-center text-lg font-medium">{popup.message}</p>
                        <button onClick={() => setPopup({ visible: false, message: '' })} className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">Close</button>
                    </div>
                </>
            )}

            <div className="container mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">AlphaFxTrader</h1>
                    <p className="text-sm text-gray-400 mt-2">User ID: {userId}</p>
                </header>

                <section className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-center items-center">
                        <p className="text-lg font-semibold text-gray-400">Live EUR/USD Price</p>
                        <p className="text-4xl font-bold text-green-400 mt-2">{livePrice || '--'}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-center items-center">
                        <p className="text-lg font-semibold text-gray-400">SMA (10-period)</p>
                        <p className="text-4xl font-bold text-red-400 mt-2">{smaValue || '--'}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-center items-center">
                        <p className="text-lg font-semibold text-gray-400">Trading Volume</p>
                        <p className="text-4xl font-bold text-yellow-400 mt-2">Volume: ${ (tradingVolume / 1000000).toFixed(2) }M</p>
                    </div>
                </section>

                <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Live Price & SMA Chart</h2>
                    </div>
                    <div className="h-96">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>

                <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Trading Controls</h2>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => livePrice && executeTrade('buy', parseFloat(livePrice), true)}
                                className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition duration-300"
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => livePrice && executeTrade('sell', parseFloat(livePrice), true)}
                                className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transition duration-300"
                            >
                                Sell
                            </button>
                        </div>
                        <div className="flex-1 text-center md:text-right">
                            <p className="text-lg font-semibold text-gray-300">{isAutoTradingEnabled ? 'Auto-Trading: On' : 'Auto-Trading: Off'}</p>
                            <button
                                onClick={() => {
                                    if (tradingVolume >= 10000000 && !isAutoTradingEnabled) {
                                        showPopup("Cannot re-enable auto-trading. The volume limit has been reached.");
                                        return;
                                    }
                                    setIsAutoTradingEnabled(!isAutoTradingEnabled);
                                }}
                                className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                            >
                                {isAutoTradingEnabled ? 'Disable Auto-Trading' : 'Enable Auto-Trading'}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Trade Blotter (Live Trades)</h2>
                    <div className="overflow-x-auto rounded-lg">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Type</th>
                                    <th scope="col" className="px-6 py-3">Currency Pair</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {tradeHistory.map((trade) => (
                                    <tr key={trade.id} className="bg-gray-800 border-b border-gray-700">
                                        <td className="px-6 py-4">{trade.type.toUpperCase()}</td>
                                        <td className="px-6 py-4">{trade.currencyPair}</td>
                                        <td className="px-6 py-4">{trade.price.toFixed(4)}</td>
                                        <td className="px-6 py-4">${trade.amount}</td>
                                        <td className="px-6 py-4">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-gray-500 mt-4 text-sm">Trade history is fetched and updated in real-time from a simulated backend.</p>
                </section>
            </div>
        </div>
    );
};

export default App;
