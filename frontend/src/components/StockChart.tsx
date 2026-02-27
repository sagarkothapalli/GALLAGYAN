'use client';

import { createChart, ColorType, IChartApi, CandlestickSeries, LineSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockChartProps {
  data: ChartData[];
  showSMA20?: boolean;
  showSMA50?: boolean;
  showEMA9?: boolean;
  showEMA21?: boolean;
  showRSI?: boolean;
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
  let prevEma = data[0].close;
  for (let i = 0; i < data.length; i++) {
    const value = (data[i].close - prevEma) * k + prevEma;
    ema.push({ time: data[i].time, value: value });
    prevEma = value;
  }
  return ema.slice(period - 1);
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

export const StockChart = ({ data, showSMA20 = false, showSMA50 = false, showEMA9 = false, showEMA21 = false, showRSI = false }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const isMobile = window.innerWidth < 768;
    const chartHeight = showRSI ? (isMobile ? 400 : 500) : (isMobile ? 300 : 400);

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#64748b' },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#f43f5e', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });
    candlestickSeries.setData(data);

    if (showSMA20 && data.length >= 20) {
        const s = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'SMA 20' });
        s.setData(calculateSMA(data, 20));
    }
    if (showSMA50 && data.length >= 50) {
        const s = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'SMA 50' });
        s.setData(calculateSMA(data, 50));
    }
    if (showEMA9 && data.length >= 9) {
        const s = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, title: 'EMA 9' });
        s.setData(calculateEMA(data, 9));
    }
    if (showEMA21 && data.length >= 21) {
        const s = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, title: 'EMA 21' });
        s.setData(calculateEMA(data, 21));
    }

    if (showRSI && data.length > 14) {
        const rsiData = calculateRSI(data);
        const rsiSeries = chart.addSeries(LineSeries, { 
            color: '#6366f1', 
            lineWidth: 2, 
            title: 'RSI 14',
            priceScaleId: 'rsi',
        });
        
        chart.priceScale('rsi').applyOptions({
            position: 'right',
            mode: 0,
            autoScale: false,
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        rsiSeries.setData(rsiData);
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [data, showSMA20, showSMA50, showEMA9, showEMA21, showRSI]);

  return <div className="w-full mt-6"><div ref={chartContainerRef} className="w-full" /></div>;
};
