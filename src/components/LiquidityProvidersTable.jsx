import React from "react";
import { Table, ConfigProvider } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const LiquidityProvidersTable = ({ data, loading }) => {
  const navigate = useNavigate();

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
              index <= 3 ? "text-blue-400 font-bold" : "text-gray-400"
            }`}
          >
            #{index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "ADDRESS",
      dataIndex: "pairAddress",
      key: "pairAddress",
      render: (text) => (
        <div
          className="flex items-center text-gray-200 cursor-pointer hover:underline"
          onClick={() => handleNavigate(`/holder/${text}`)}
        >
          {text?.length > 10
            ? `${text?.slice(0, 5)}...${text?.slice(-5)}`
            : text}
          <span className="ml-2 text-green-500">✓</span>
        </div>
      ),
    },
    {
      title: "%",
      dataIndex: "profitPercentage",
      key: "profitPercentage",
      render: (text) => (
        <div className="text-gray-200">{parseFloat(text).toFixed(2)}%</div>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "profit",
      key: "profit",
      render: (text) => {
        const totalAmount = 996.3; // total in millions
        const rawValue = parseFloat(text) || 0;
        const amountInMillions = rawValue / 1000000; // convert to millions
        const percentage = totalAmount > 0 ? (amountInMillions / totalAmount) * 100 : 0;
        
        return (
          <div className="flex items-center">
            <span className="mr-2 text-gray-300">{amountInMillions.toFixed(1)}M</span>
            <div className="w-64 h-2 bg-gray-800 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${Math.min(percentage, 100)}%` }} // Cap at 100%
              />
            </div>
            <span className="ml-2 text-gray-300">{totalAmount.toFixed(1)}M</span>
          </div>
        );
      },
    },
    {
      title: "TXNS",
      dataIndex: "transactions",
      key: "transactions",
      render: (text, record) => (
        <div
          className="flex justify-center cursor-pointer"
          onClick={() =>
            handleNavigate(`/transactions/${record?.tokenId?.pairAddress}`)
          }
        >
          <BsFilter className="text-gray-500" />
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
          onClick={() =>
            handleNavigate(`/holder-details/${record?.tokenId?.pairAddress}`)
          }
        >
          <FiExternalLink className="text-gray-500" />
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
      <div className="h-full">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          loading={loading}
          className="holder-table"
        />
      </div>
    </ConfigProvider>
  );
};

export default LiquidityProvidersTable;
