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

export const StockChart = ({ data, showSMA20 = false, showSMA50 = false, showEMA9 = false, showEMA21 = false }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const isMobile = window.innerWidth < 768;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#64748b' },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      width: chartContainerRef.current.clientWidth,
      height: isMobile ? 300 : 400,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    candlestickSeries.setData(data);

    if (showSMA20 && data.length >= 20) {
        const sma20Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'SMA 20' });
        sma20Series.setData(calculateSMA(data, 20));
    }
    if (showSMA50 && data.length >= 50) {
        const sma50Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'SMA 50' });
        sma50Series.setData(calculateSMA(data, 50));
    }
    if (showEMA9 && data.length >= 9) {
        const ema9Series = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, title: 'EMA 9' });
        ema9Series.setData(calculateEMA(data, 9));
    }
    if (showEMA21 && data.length >= 21) {
        const ema21Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, title: 'EMA 21' });
        ema21Series.setData(calculateEMA(data, 21));
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [data, showSMA20, showSMA50, showEMA9, showEMA21]);

  return <div className="w-full mt-6"><div ref={chartContainerRef} className="w-full" /></div>;
};
