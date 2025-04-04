import React, { useEffect, useState } from "react";
import TransactionTable from "../components/TransactionsTable";
import TabbedTables from "../components/TabbedTables";
import MarketInfo from "../components/MarketInfo";
import ChartExample from "../components/TradingViewWidget"; 
import { fetchSingleToken } from "../utils/api";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import io from "socket.io-client";
// import { mapToTradingViewSymbol } from "../utils/symbolMapper"; 

const socket = io(import.meta.env.VITE_API_URL);

const TradingChart = () => {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);
  const { pairAddress } = useParams();

  const getTokenData = async () => {
    setLoading(true);
    try {
      const data = await fetchSingleToken(pairAddress);
      setToken(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTokenData();

    socket.on("token", (updatedToken) => {
      if (updatedToken.pairAddress === pairAddress) {
        // console.log("Received updated token data:", updatedToken);
        setToken(updatedToken);
      }
    });

    return () => {
      socket.off("token");
    };
  }, [pairAddress]);

  // Map the token symbol to a valid TradingView symbol
  // const tradingViewSymbol = token ? mapToTradingViewSymbol(token.symbol) : "BINANCE:BTCUSDT"; // Default to BTCUSDT if no token is loaded

  return (
    <div className="flex h-screen overflow-hidden text-black">
      <div className="flex-1 flex flex-col">
        {/* Pass transactions to TradingViewWidget */}
        <ChartExample  />
        <div className="overflow-y-auto max-h-[48vh]">
          <TabbedTables />
        </div>
      </div>
      <div className="overflow-y-auto bg-[#17171c] rounded-lg !w-[350px]">
        {loading ? (
          <Spin size="large" className="flex justify-center w-full !mt-24" />
        ) : (
          <MarketInfo token={token} />
        )}
      </div>
    </div>
  );
};

export default TradingChart;