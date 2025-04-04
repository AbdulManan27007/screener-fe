import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import TransactionTable from "./TransactionsTable";
import TopTraderTable from "./TopTraderTable";
import SnipersTable from "./SnipersTable";
import HolderTable from "./HoldersTable";
import LiquidityProvidersTable from "./LiquidityProvidersTable";
import BubblemapsTable from "./BubblemapsTable";
import "./TabbedTables.css";
import {
  TopTradersIcon,
  TransactionIcon,
  SniperIcon,
  HolderIcon,
  LiquidityIcon,
  BubblemapsIcon,
} from "../assets/icons/Icons";
import { fetchTokens, fetchTransactions } from "../utils/api";

const TabbedTables = () => {
  const [count, setCount] = useState(0);

  const [tokenData, setTokenData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLiquidityData = async () => {
    setLoading(true);
    try {
      const data = await fetchTokens();
      const sortedData = data.sort((a, b) => b.profit - a.profit);
      const rankedData = sortedData.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
      setTokenData(rankedData);
      setCount(rankedData.length);
    } catch (error) {
      console.error("Error fetching liquidity data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchTransactionData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactionData(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiquidityData();
    fetchTransactionData();
  }, []);

  const handleTabChange = (key) => {
    if (key === "3") {
      fetchTransactionData();
    }
    if (key === "5" || key === "4") {
      fetchLiquidityData();
    }
  };

  const tabData = [
    {
      key: "1",
      label: `Transactions`,
      icon: <TransactionIcon />,
      children: <TransactionTable />,
    },
    {
      key: "2",
      label: `Top Traders`,
      icon: <TopTradersIcon />,
      children: <TopTraderTable />,
    },
    {
      key: "3",
      label: `Snipers`,
      icon: <SniperIcon />,
      children: <SnipersTable data={transactionData} loading={loading} />,
    },
    {
      key: "4",
      label: `Holders (${count})`,
      icon: <HolderIcon />,
      children: <HolderTable data={tokenData} loading={loading} />,
    },
    {
      key: "5",
      label: `Liquidity Providers (${count})`,
      icon: <LiquidityIcon />,
      children: <LiquidityProvidersTable data={tokenData} loading={loading} />,
    },
    {
      key: "6",
      label: `Bubblemaps`,
      icon: <BubblemapsIcon />,
      children: <BubblemapsTable />,
    },
  ];

  return (
    <div className="tabbed-tables-container">
      <Tabs
        defaultActiveKey="1"
        className="custom-tabs"
        tabBarStyle={{
          background: '#1d1d22',
          borderBottom: '1px solid #374151',
        }}
        onChange={handleTabChange}
        items={tabData.map((tab) => ({
          key: tab.key,
          label: (
            <span className="custom-tab-label ml-4">
              {tab.icon} {tab.label}
            </span>
          ),
          children: <div className="tab-content-container">{tab.children}</div>,
        }))}
      />
    </div>
  );
};

export default TabbedTables;
