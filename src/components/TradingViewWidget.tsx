import React, { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-enterprise";
import useGetData from "./GraphData"; // Import the custom hook
import "ag-charts-enterprise";

const ChartExample = () => {
  const { data, loading, error } = useGetData(); // Fetch data using the hook
  const [options, setOptions] = useState<AgChartOptions | null>(null);

  useEffect(() => {
    const modifiedData = data.map((item) => ({
      ...item,
      high: Math.max(item.open, item.close, item.high), // High should be max of all
      low: Math.min(item.open, item.close, item.low),   // Low should be min of all
    }));

    if (data.length > 0) {
      setOptions({
        data: modifiedData,
        title: {
          text: "Screener Clone",
          color: "white",
        },
        subtitle: {
          text: "Daily High and Low Prices",
          color: "#ccc",
        },
        background: {
          fill: "#1E1E1E",
        },
        series: [
          {
            type: "candlestick",
            xKey: "date",   // Ensure date is formatted correctly in data
            xName: "Date",
            lowKey: "low",
            highKey: "high",
            openKey: "open",
            closeKey: "close",
            strokeWidth: 1.5,
            fillOpacity: 1,
            strokeOpacity: 1,
            fill: ({ datum }) => datum.type === 'buy' ? 'green' : 'red', 
            stroke: ({ datum }) => datum.type === 'buy' ? 'green' : 'red',
          },
        ],
      });
    }
  }, [data]);

  if (loading) return <p style={{ color: "white" }}>Loading chart...</p>;
  if (error) return <p style={{ color: "red" }}>Error loading data</p>;

  return (
    <div style={{ width: "100%", height: "50vh" }}>
      {options ? (
        <AgCharts options={options as any} style={{ width: "100%", height: "100%" }} />
      ) : (
        <p style={{ color: "white" }}>No data available</p>
      )}
    </div>
  );
};

export default ChartExample;
