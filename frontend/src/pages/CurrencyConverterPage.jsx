import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencyConverterPage() {
  const { t } = useLanguage();
  const { CURRENCIES, convertAmount } = useCurrency();

  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000');

  const converted = convertAmount(Number(amount) || 0, fromCurrency, toCurrency);
  const rate = convertAmount(1, fromCurrency, toCurrency);
  const fromInfo = CURRENCIES.find((c) => c.code === fromCurrency);
  const toInfo = CURRENCIES.find((c) => c.code === toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">💱 {t('currencyConverter')}</h1>
          <p className="page-description">{t('convertBetween')}</p>
        </div>
      </div>

      <div className="converter-layout">
        {/* Main Converter Card */}
        <div className="card converter-card">
          <div className="converter-row">
            {/* From */}
            <div className="converter-col">
              <label className="form-label">{t('from')}</label>
              <select
                className="form-select"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <input
                className="form-input converter-amount-input"
                type="number"
                min="0"
                step="any"
                placeholder={t('enterAmount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="converter-symbol">{fromInfo?.symbol}</div>
            </div>

            {/* Swap Button */}
            <button className="converter-swap-btn" onClick={handleSwap} title={t('swap')}>
              ↔
            </button>

            {/* To */}
            <div className="converter-col">
              <label className="form-label">{t('to')}</label>
              <select
                className="form-select"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <div className="converter-result">
                <span className="converter-result-value">
                  {toInfo?.symbol}{converted.toLocaleString('en-US', {
                    minimumFractionDigits: toCurrency === 'JPY' ? 0 : 2,
                    maximumFractionDigits: toCurrency === 'JPY' ? 0 : 2,
                  })}
                </span>
              </div>
              <div className="converter-symbol">{toInfo?.symbol}</div>
            </div>
          </div>

          {/* Exchange Rate Display */}
          <div className="converter-rate">
            {t('exchangeRate')}: 1 {fromCurrency} = {rate.toFixed(
              toCurrency === 'JPY' ? 2 : 4
            )} {toCurrency}
          </div>
        </div>

        {/* Popular Rates Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 {t('popularRates')}</div>
          </div>
          <div className="popular-rates-grid">
            {CURRENCIES.filter((c) => c.code !== fromCurrency).map((c) => {
              const r = convertAmount(1, fromCurrency, c.code);
              return (
                <div
                  key={c.code}
                  className="rate-card"
                  onClick={() => setToCurrency(c.code)}
                >
                  <div className="rate-card-flag">{c.flag}</div>
                  <div className="rate-card-info">
                    <div className="rate-card-code">{fromCurrency} → {c.code}</div>
                    <div className="rate-card-value">
                      {c.symbol}{r.toLocaleString('en-US', {
                        minimumFractionDigits: c.code === 'JPY' ? 2 : 4,
                        maximumFractionDigits: c.code === 'JPY' ? 2 : 4,
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
