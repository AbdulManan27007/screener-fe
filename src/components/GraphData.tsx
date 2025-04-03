import { useState, useEffect } from "react";
import api from "../utils/axios";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

interface StockData {
  date: Date;
  formattedDate: string; // This will hold the "MMDD" format
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  type: 'buy' | 'sell'; // Add type field
  color: string; // Add color field
}

const useGetData = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [filteredData, setFilteredData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date as "MMDD"
  const formatDateToMMDD = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${month}${day}`;
    console.log("Formatted Date:", formattedDate); // Log the formatted date
    
    return formattedDate;
  };
  
  
  // Process incoming transaction to match StockData interface
  const processTransaction = (transaction: any): StockData => {
    const date = new Date(transaction.createdAt || transaction.date || Date.now());
    const type = transaction.type || (transaction.priceSOL > 0 ? 'buy' : 'sell');
    const color = type === 'buy' ? 'green' : 'red';

    let open = Number(transaction.priceSOL || transaction.open || 0);
    let close = Number(transaction.unrealized || transaction.close || 0);
    let high = Math.max(open, close) + Math.random() * 5; // Ensure high > open, close
    let low = Math.min(open, close) - Math.random() * 5;  // Ensure low < open, close

    return {
      date: date,  
      formattedDate: formatDateToMMDD(date),
      open,
      high,
      low,
      close,
      volume: Number(transaction.volume || 0),
      type: type,
      color: color
    };
  };

  // Fetch data from API
  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/api/transactions/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch transactions");
    }
  };

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      const transactions = await fetchTransactions();

      // Format the data with both Date object and MMDD string
      const formattedData = transactions.map((item: any) => processTransaction(item));

      setData(formattedData);
      setFilteredData(formattedData);
    } catch (err: any) {
      console.error("Error fetching market data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();

    // Set up socket listener
    socket.on("transaction", (newTransaction) => {
      // console.log("Received new transaction:", newTransaction);
      
      // Process the new transaction to match our data format
      const processedTransaction = processTransaction(newTransaction);
      
      setData(prevData => [processedTransaction, ...prevData]);
      setFilteredData(prevData => [processedTransaction, ...prevData]);
    });

    return () => {
      socket.off("transaction");
    };
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // console.log("API Data:", data);
    }
  }, [data]);

  return {
    data,
    filteredData,
    loading,
    error,
    setFilteredData,
    refresh: getData, 
  };
};

export default useGetData;