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
}

// Simple Moving Average Calculation
const calculateSMA = (data: ChartData[], period: number) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
};

export const StockChart = ({ data, showSMA20 = false, showSMA50 = false }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const isMobile = window.innerWidth < 768;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
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

    // Add SMA 20
    if (showSMA20 && data.length >= 20) {
        const sma20Data = calculateSMA(data, 20);
        const sma20Series = chart.addSeries(LineSeries, {
            color: '#3b82f6',
            lineWidth: 2,
            title: 'SMA 20',
        });
        sma20Series.setData(sma20Data);
    }

    // Add SMA 50
    if (showSMA50 && data.length >= 50) {
        const sma50Data = calculateSMA(data, 50);
        const sma50Series = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            title: 'SMA 50',
        });
        sma50Series.setData(sma50Data);
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, showSMA20, showSMA50]);

  return (
    <div className="w-full mt-6">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
