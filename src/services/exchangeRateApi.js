import axios from 'axios';

const API_BASE_URL = 'https://v6.exchangerate-api.com/v4';

export const fetchLatestRates = async (baseCurrency) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/latest/${baseCurrency}`);
        return response.data.conversion_rates;
    } catch (error) {
        console.error('Error fetching latest exchange rates:', error);
        throw error;
    }
};

export const fetchHistoricalRates = async (baseCurrency, startDate, endDate) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/history/${baseCurrency}`, {
            params: {
                start_date: startDate,
                end_date: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching historical exchange rates:', error);
        throw error;
    }
};


export const fetchAvailableCurrencies = async () => {
    try {
        const response = await axios.get('https://v6.exchangerate-api.com/v4/codes');
        // The API returns { supported_codes: [[code, name], ...] }
        return response.data.supported_codes;
    } catch (error) {
        console.error('Error fetching available currencies:', error);
        throw error;
    }
};