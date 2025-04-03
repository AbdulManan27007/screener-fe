import React, { useState, useEffect } from "react";
import { Table, ConfigProvider, Tooltip } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { fetchTopTraders } from "../utils/api";

const TopTraderTable = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const getMarketData = async () => {
      setLoading(true);
      try {
        const data = await fetchTopTraders();
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };
    getMarketData();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const columns = [
    {
      title: "RANK",
      dataIndex: "rank",
      key: "rank",
      width: 70,
      render: (text, record, index) => (
        <div className="flex items-center px-2">
          <span
            className={`${
              index === 1 ? "text-blue-400 font-bold" : "text-blue-400"
            }`}
          >
            #{index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "MAKER",
      dataIndex: "makerUsername",
      key: "makerUsername",
      render: (text, record) => (
        <div
          className="flex items-center text-blue-400 cursor-pointer hover:underline"
          onClick={() => handleNavigate(`/trader/${record.makerId}`)}
        >
          <span className="mr-1">✓</span>
          {text ||
            `${record?.makerId?.slice(0, 6)}...${record?.makerId?.slice(-4)}`}
        </div>
      ),
    },
    {
      title: "MAKER EMAIL",
      dataIndex: "makerEmail",
      key: "makerEmail",
      render: (text) => <div className="text-gray-400">{text || "-"}</div>,
    },
    {
      title: "BOUGHT",
      dataIndex: "totalBuyVol",
      key: "totalBuyVol",
      render: (text) =>
        text ? (
          <div className="flex flex-col">
            <span className="text-red-500">
              ${parseFloat(text.amount || 0)?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(text.volume || 0).toFixed(1)}M / {text.items || 0}{" "}
              {text.items === 1 ? "item" : "items"}
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "SOLD",
      dataIndex: "totalSellVol",
      key: "totalSellVol",
      render: (text) =>
        text ? (
          <div className="flex flex-col">
            <span className="text-green-500">
              ${parseFloat(text.amount || 0)?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(text.volume || 0).toFixed(1)}M / {text.items || 0}{" "}
              {text.items === 1 ? "item" : "items"}
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "PNL",
      dataIndex: "totalCumulativePNL",
      key: "totalCumulativePNL",
      render: (text) => {
        const pnl = parseFloat(text || 0);
        return (
          <div className={`${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
            ${Math.abs(pnl)?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "UNREALIZED",
      dataIndex: "totalUnrealized",
      key: "totalUnrealized",
      render: (text) => (
        <div className="text-gray-400">
          {text !== null && text !== undefined
            ? `$${parseFloat(text)?.toLocaleString()}`
            : "-"}
        </div>
      ),
    },
    {
      title: "BALANCE",
      dataIndex: "totalBalance",
      key: "totalBalance",
      render: (text) => (
        <div className="text-gray-400">
          {text !== null && text !== undefined ? text : "Unknown"}
        </div>
      ),
    },
    {
      title: "TXNS",
      dataIndex: "totalTxns",
      key: "totalTxns",
      render: (text, record) => (
        <div
          className="flex justify-center items-center gap-1 cursor-pointer"
          onClick={() => handleNavigate(`/transactions/${record.makerId}`)}
        >
          {text}
          <BsFilter style={{ color: "#6b7280" }} />
        </div>
      ),
    },
    {
      title: "EXP",
      dataIndex: "exp",
      key: "exp",
      render: (text, record) => (
        <div
          className="flex justify-center cursor-pointer"
          onClick={() => handleNavigate(`/trader-details/${record.makerId}`)}
        >
          <FiExternalLink style={{ color: "#6b7280" }} />
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            colorBgContainer: "#121212",
            headerColor: "rgba(255, 255, 255, 0.85)",
            headerBg: "#1a1a1a",
            colorText: "#ffffff",
            colorBorder: "#2e2e2e",
            fontSize: 14,
            rowHoverBg: "#1f1f1f",
          },
        },
      }}
    >
      <div className="h-full ">
        <Table
          columns={columns}
          dataSource={filteredData?.map((item, index) => ({
            ...item,
            key: item.makerId || index,
          }))}
          pagination={false}
          size="small"
          loading={loading}
          className="trader-performance-table"
        />
      </div>
    </ConfigProvider>
  );
};

export default TopTraderTable;
