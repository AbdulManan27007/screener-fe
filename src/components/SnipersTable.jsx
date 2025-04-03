import React from "react";
import { Table, ConfigProvider, Tooltip } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { GrFilter } from "react-icons/gr";
import moment from "moment";

const SnipersTable = ({ data, loading }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const columns = [
    {
      title: "STATUS",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (text) => (
        <div className="flex items-center px-2">
          <span className="text-blue-400">{text}</span>
        </div>
      ),
    },
    {
      title: "MAKER",
      dataIndex: "maker",
      key: "maker",
      render: (text, record) => (
        <div
          className="flex items-center text-red-400 font-semibold text-[14px] leading-[21px] cursor-pointer hover:underline"
          onClick={() => handleNavigate(`/sniper/${text}`)}
        >
          <img src={record.maker?.logo} alt="user" className="w-8" />
          <div className="flex flex-col items-center justify-center">
            <span>{record.maker?.username}</span>
            <div className="border px-4"></div>
          </div>
          <GrFilter className="cursor-pointer" />
        </div>
      ),
    },
    {
      title: "TIME",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        const relativeDate = moment(text).fromNow();
        return <div className="text-gray-400">{relativeDate}</div>;
      },
    },
    {
      title: "BOUGHT",
      dataIndex: "bought",
      key: "bought",
      render: (text, record) =>
        record?.tokenId ? (
          <div className="flex flex-col">
            <span className="text-red-500 font-bold text-[14px] leading-[21px]">
              ${record?.tokenId?.bought?.priceUSD || 0}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(record?.tokenId?.bought?.volume || 0).toFixed(1)}M /{" "}
              {record?.tokenId?.bought?.txns || 0}{" "}
              {record?.tokenId?.bought?.txns === 1 ? "item" : "items"}
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "SOLD",
      dataIndex: "sold",
      key: "sold",
      render: (text, record) =>
        record?.tokenId ? (
          <div className="flex flex-col">
            <span className="text-red-500 font-bold text-[14px] leading-[21px]">
              $
              {parseFloat(
                record?.tokenId?.sold?.priceUSD || 0
              )?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(record?.tokenId?.sold?.volume || 0).toFixed(1)}M /{" "}
              {record?.tokenId?.sold?.txns || 0}{" "}
              {record?.tokenId?.sold?.txns === 1 ? "item" : "items"}
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "PNL",
      dataIndex: "pnl",
      key: "pnl",
      render: (text) => {
        const pnl = parseFloat(text || 0);
        return (
          <div
            className={`${
              pnl >= 0 ? "text-green-500" : "text-red-500"
            } font-bold text-[14px] leading-[21px]`}
          >
            ${Math?.abs(pnl)?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "UNREALIZED",
      dataIndex: "unrealized",
      key: "unrealized",
      render: (text) => {
        return (
          <div className="text-white font-bold text-[14px] leading-[21px]">
            {!isNaN(text) ? `< ${text?.toLocaleString()}` : "-"}
          </div>
        );
      },
    },
    {
      title: "BALANCE",
      dataIndex: "balance",
      key: "balance",
      render: (text, record) => (
        <div className="text-gray-400">
          ${" "}
          {record?.tokenId?.priceUSD !== null &&
          record?.tokenId?.priceUSD !== undefined
            ? record?.tokenId?.priceUSD
            : "Unknown"}
        </div>
      ),
    },
    {
      title: "TXNS",
      dataIndex: "transactions",
      key: "transactions",
      render: (text, record) => (
        <div
          className="flex justify-center cursor-pointer items-center"
          onClick={() =>
            handleNavigate(`/transactions/${record?.tokenId?.pairAddress}`)
          }
        >
          {record?.tokenId?.txns} <BsFilter style={{ color: "#6b7280" }} />
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
            handleNavigate(`/sniper-details/${record?.tokenId?.pairAddress}`)
          }
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
      <div className="h-full">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          loading={loading}
          className="sniper-performance-table"
        />
      </div>
    </ConfigProvider>
  );
};

export default SnipersTable;
