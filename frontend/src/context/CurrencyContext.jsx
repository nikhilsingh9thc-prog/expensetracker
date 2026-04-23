import { createContext, useContext, useState, useCallback } from 'react';

const CurrencyContext = createContext(null);

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
];

// Exchange rates relative to 1 INR
const RATES_FROM_INR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.78,
};

function getRate(from, to) {
  if (from === to) return 1;
  const fromToINR = 1 / RATES_FROM_INR[from];
  return fromToINR * RATES_FROM_INR[to];
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem('app_currency') || 'INR'
  );

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    localStorage.setItem('app_currency', code);
  }, []);

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatCurrency = useCallback(
    (amount) => {
      const converted = Number(amount || 0) * getRate('INR', currency);
      const locale = currency === 'INR' ? 'en-IN' : currency === 'JPY' ? 'ja-JP' : 'en-US';
      return currencyInfo.symbol + converted.toLocaleString(locale, {
        minimumFractionDigits: currency === 'JPY' ? 0 : 0,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
      });
    },
    [currency, currencyInfo.symbol]
  );

  const convertAmount = useCallback((amount, from, to) => {
    return Number(amount || 0) * getRate(from, to);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatCurrency, convertAmount, CURRENCIES, RATES_FROM_INR, currencyInfo }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export { CURRENCIES, RATES_FROM_INR };
