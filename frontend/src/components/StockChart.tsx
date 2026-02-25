'use client';

import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const StockChart = ({ data }: { data: ChartData[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const isMobile = window.innerWidth < 768;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: isMobile ? 300 : 400,
      handleScale: {
        // @ts-ignore - Ignore type error as this property might be from an older version
        touchAttributes: {
          disableScroll: true,
        }
      }
    });

    // Use addSeries with CandlestickSeries to avoid the "not a function" error
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full mt-6">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
