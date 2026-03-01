'use client';

import { createChart, ColorType, IChartApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface StockChartProps {
  data: ChartData[];
  comparisonData?: { symbol: string, points: ChartData[] } | null;
  showSMA20?: boolean;
  showSMA50?: boolean;
  showEMA9?: boolean;
  showEMA21?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  showVolume?: boolean;
  isDark?: boolean;
}

const calculateSMA = (data: ChartData[], period: number) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
};

const calculateEMA = (data: ChartData[], period: number) => {
  const k = 2 / (period + 1);
  const ema = [];
  if (data.length === 0) return [];
  let prevEma = data[0].close;
  for (let i = 0; i < data.length; i++) {
    const value = (data[i].close - prevEma) * k + prevEma;
    ema.push({ time: data[i].time, value: value });
    prevEma = value;
  }
  return ema;
};

const calculateRSI = (data: ChartData[], period: number = 14) => {
    if (data.length <= period) return [];
    const rsi = [];
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff; else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
    }
    return rsi;
};

const calculateMACD = (data: ChartData[]) => {
    if (data.length < 26) return { macd: [], signal: [], hist: [] };
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    const macdLine = [];
    for (let i = 0; i < data.length; i++) {
        macdLine.push({ time: data[i].time, value: ema12[i].value - ema26[i].value });
    }
    
    // Signal line: 9-day EMA of MACD Line
    const k = 2 / (9 + 1);
    const signalLine = [];
    let prevSignal = macdLine[0].value;
    for (let i = 0; i < macdLine.length; i++) {
        const val = (macdLine[i].value - prevSignal) * k + prevSignal;
        signalLine.push({ time: macdLine[i].time, value: val });
        prevSignal = val;
    }
    
    const histogram = [];
    for (let i = 0; i < macdLine.length; i++) {
        histogram.push({ 
            time: macdLine[i].time, 
            value: macdLine[i].value - signalLine[i].value,
            color: (macdLine[i].value - signalLine[i].value) >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'
        });
    }
    
    return { macd: macdLine.slice(26), signal: signalLine.slice(26), hist: histogram.slice(26) };
};

export const StockChart = ({ data, comparisonData, showSMA20 = false, showSMA50 = false, showEMA9 = false, showEMA21 = false, showRSI = false, showMACD = false, showVolume = true, isDark = false }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const handleResize = () => { chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth }); };
    const isMobile = window.innerWidth < 768;
    const chartHeight = (showRSI || showMACD || showVolume) ? (isMobile ? 450 : 600) : (isMobile ? 300 : 400);

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: isDark ? '#0a0a0a' : '#ffffff' }, textColor: isDark ? '#94a3b8' : '#64748b' },
      grid: { vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' }, horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, { upColor: '#10b981', downColor: '#f43f5e', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#f43f5e' });
    candlestickSeries.setData(data);

    if (showSMA20 && data.length >= 20) { const s = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'SMA 20' }); s.setData(calculateSMA(data, 20)); }
    if (showSMA50 && data.length >= 50) { const s = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'SMA 50' }); s.setData(calculateSMA(data, 50)); }
    if (showEMA9 && data.length >= 9) { const s = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, title: 'EMA 9' }); s.setData(calculateEMA(data, 9).slice(8)); }
    if (showEMA21 && data.length >= 21) { const s = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, title: 'EMA 21' }); s.setData(calculateEMA(data, 21).slice(20)); }

    if (comparisonData && comparisonData.points.length > 0) {
        const compSeries = chart.addSeries(LineSeries, { color: '#6366f1', lineWidth: 2, title: comparisonData.symbol, priceScaleId: 'comparison' });
        chart.priceScale('comparison').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
        compSeries.setData(comparisonData.points.map(p => ({ time: p.time, value: p.close })));
    }

    if (showVolume) {
        const volumeSeries = chart.addSeries(HistogramSeries, { color: '#26a69a', priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
        chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        volumeSeries.setData(data.map(d => ({ time: d.time, value: d.volume || 0, color: d.close >= d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' })));
    }

    if (showRSI && data.length > 14) {
        const rsiSeries = chart.addSeries(LineSeries, { color: '#6366f1', lineWidth: 2, title: 'RSI 14', priceScaleId: 'rsi' });
        chart.priceScale('rsi').applyOptions({ mode: 0, autoScale: false, scaleMargins: { top: 0.1, bottom: 0.7 } });
        rsiSeries.setData(calculateRSI(data));
    }

    if (showMACD && data.length > 26) {
        const { macd, signal, hist } = calculateMACD(data);
        const macdSeries = chart.addSeries(LineSeries, { color: '#2563eb', lineWidth: 2, title: 'MACD', priceScaleId: 'macd' });
        const signalSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'Signal', priceScaleId: 'macd' });
        const histSeries = chart.addSeries(HistogramSeries, { priceScaleId: 'macd' });
        
        chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.7, bottom: 0.1 } });
        macdSeries.setData(macd);
        signalSeries.setData(signal);
        histSeries.setData(hist);
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [data, comparisonData, showSMA20, showSMA50, showEMA9, showEMA21, showRSI, showMACD, showVolume, isDark]);

  return <div className="w-full mt-6"><div ref={chartContainerRef} className="w-full" /></div>;
};
