import React, { useState, useEffect } from "react";
import { Table, Button, ConfigProvider, Modal, Input, DatePicker } from "antd";
import { PiArrowSquareOutDuotone } from "react-icons/pi";
import { GrFilter } from "react-icons/gr";
import { CalendarOutlined } from "@ant-design/icons";
import { TbCoin } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { fetchTransactions } from "../utils/api";
import { BsCoin } from "react-icons/bs";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);
const TransactionTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [loading, setLoading] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);
  const [showRelativeDate, setShowRelativeDate] = useState(true);
  const { pairAddress } = useParams();

  const navigate = useNavigate();

  const getTradersData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      // Process the data to ensure PnL and unrealized values are properly formatted
      const processedData = data.map(item => ({
        ...item,
        pnl: item.pnl || item.tokenId?.pnl || 0,
        unrealized: item.unrealized || item.tokenId?.unrealized || 0,
        priceUSD: item.priceUSD || item.tokenId?.priceUSD || 0
      }));
      setFilteredData(processedData);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTradersData();
    socket.on("transaction", (newTransaction) => {
      // console.log("Received new transaction:", newTransaction);
      if (newTransaction.pairAddress === pairAddress) {
        // Process new transaction to ensure proper fields
        const processedTransaction = {
          ...newTransaction,
          pnl: newTransaction.pnl || newTransaction.tokenId?.pnl || 0,
          unrealized: newTransaction.unrealized || newTransaction.tokenId?.unrealized || 0,
          priceUSD: newTransaction.priceUSD || newTransaction.tokenId?.priceUSD || 0
        };
        setFilteredData((prevData) => [processedTransaction, ...prevData]);
      }
    });

    return () => {
      socket.off("transaction");
    };
  }, [pairAddress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFilteredData((prevData) => {
        return prevData?.map((item) => {
          const timeDifferenceInSeconds = moment().diff(
            moment(item.date),
            "seconds"
          );
          return {
            ...item,
            formattedDate: moment(item.date).format("MMM DD hh:mm:ss A"),
            relativeDate:
              timeDifferenceInSeconds > 0
                ? `${timeDifferenceInSeconds} seconds ago`
                : "Just now",
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFilterClick = (column) => {
    setModalContent(column);
    setIsModalVisible(true);
  };

  const handleFilterChange = (value) => {
    setFilterValue(value);
  };

  const handleDateFilterChange = (date) => {
    setFilterDate(date);
  };

  const handleDateRangeChange = (dates) => {
    setFilterDateRange(dates);
  };

  const handleTxnRedirect = (txnValue) => {
    navigate(`/txn/${txnValue}`);
  };

  const closeFilterModal = () => {
    setIsModalVisible(false);
    setFilterValue("");
    setFilterDate(null);
    setFilterDateRange([null, null]);
    filterTable();
  };

  const filterTable = () => {
    let filtered = [...filteredData];

    if (modalContent === "price" && filterValue) {
      filtered = filtered.filter((item) => item.price.includes(filterValue));
    } else if (modalContent === "type" && filterValue) {
      filtered = filtered.filter((item) =>
        item.type.toLowerCase().includes(filterValue.toLowerCase())
      );
    } else if (modalContent === "date" && filterDate) {
      const selectedDate = filterDate.format("YYYY-MM-DD");
      filtered = filtered.filter((item) => item.date.includes(selectedDate));
    } else if (
      modalContent === "date-range" &&
      filterDateRange[0] &&
      filterDateRange[1]
    ) {
      const startDate = filterDateRange[0].startOf("day");
      const endDate = filterDateRange[1].endOf("day");
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.date);
        return itemDate.isBetween(startDate, endDate, null, "[]");
      });
    }

    setFilteredData(filtered);
  };

  const dynamicColumns = (data) => {
    const sampleRecord = data?.[0] || {};
    return [
      {
        dataIndex: "createdAt",
        key: "createdAt",
        title: (
          <div className="flex justify-between">
            <div
              className="flex justify-start items-center cursor-pointer gap-2"
              onClick={() => handleFilterClick("date-range")}
            >
              Date
              <GrFilter style={{ fontSize: 14, color: "#ffffff" }} />
            </div>
            <CalendarOutlined
              style={{ fontSize: 14, color: "#ffffff" }}
              className="cursor-pointer"
              onClick={() => setShowRelativeDate(!showRelativeDate)}
            />
          </div>
        ),
        render: (text, record) => {
          const formattedDate = moment(record.createdAt).format(
            "MMM DD, YYYY hh:mm:ss A"
          );
          const relativeDate = moment(record.createdAt).fromNow();
          return (
            <div className="text-gray-400">
              {showRelativeDate ? relativeDate : formattedDate}
            </div>
          );
        },
      },
      {
        dataIndex: "type",
        key: "type",
        title: (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleFilterClick("type")}
          >
            Type
            <GrFilter style={{ fontSize: 14, color: "#ffffff" }} />
          </div>
        ),
        render: (text) => (
          <div
            className={`flex items-center ${
              text === "sell"
                ? "text-red-500"
                : text === "buy"
                ? "text-green-500"
                : ""
            }`}
          >
            {text}
          </div>
        ),
      },
      {
        title: "Price (USD)",
        dataIndex: "priceUSD",
        key: "priceUSD",
        render: (text, record) => (
          <div
            className={`flex items-center ${
              record.type === "sell"
                ? "text-red-500"
                : record.type === "buy"
                ? "text-green-500"
                : ""
            }`}
          >
            ${text ? Number(text).toFixed(2) : '0.00'}
          </div>
        ),
      },
      {
        title: "PnL",
        dataIndex: "pnl",
        key: "pnl",
        render: (text) => (
          <div
            className={`flex items-center ${
              Number(text) > 0
                ? "text-green-500"
                : Number(text) < 0
                ? "text-red-500"
                : ""
            }`}
          >
            ${text ? Number(text).toFixed(2) : '0.00'}
          </div>
        ),
      },
      {
        title: "Unrealized",
        dataIndex: "unrealized",
        key: "unrealized",
        render: (text) => (
          <div
            className={`flex items-center ${
              Number(text) > 0
                ? "text-green-500"
                : Number(text) < 0
                ? "text-red-500"
                : ""
            }`}
          >
            ${text ? Number(text).toFixed(2) : '0.00'}
          </div>
        ),
      },
      {
        title: sampleRecord.tokenId?.mintA?.name || "Token A",
        dataIndex: "tokenId.mintA.price",
        key: "mintA_price",
        render: (_, record) => (
          <span
            className={`flex items-center ${
              record.type === "sell"
                ? "text-red-500"
                : record.type === "buy"
                ? "text-green-500"
                : ""
            }`}
          >
            ${record.tokenId?.mintA?.price ? Number(record.tokenId.mintA.price).toFixed(2) : '0.00'}
          </span>
        ),
      },
      {
        title: sampleRecord.tokenId?.mintB?.name || "Token B",
        dataIndex: "tokenId.mintB.price",
        key: "mintB_price",
        render: (_, record) => (
          <span
            className={`flex items-center ${
              record.type === "sell"
                ? "text-red-500"
                : record.type === "buy"
                ? "text-green-500"
                : ""
            }`}
          >
            ${record.tokenId?.mintB?.price ? Number(record.tokenId.mintB.price).toFixed(2) : '0.00'}
          </span>
        ),
      },
      {
        title: "Maker",
        dataIndex: "maker.username",
        key: "maker",
        render: (_, record) => (
          <div className="flex gap-2 items-center">
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
        title: "Txn",
        dataIndex: "tokenId.txns",
        key: "txn",
        render: (_, record) => (
          <Button
            icon={
              <PiArrowSquareOutDuotone
                style={{ fontSize: 20, color: "#ffffff" }}
              />
            }
            onClick={() => handleTxnRedirect(record.tokenId?.txns)}
            type="link"
          />
        ),
      },
    ];
  };

  const columnsWithFilters = dynamicColumns(filteredData);

  const renderFilterModal = () => {
    if (!modalContent) return null;

    switch (modalContent) {
      case "price":
        return (
          <Modal
            title="Filter by Price"
            open={isModalVisible}
            onCancel={closeFilterModal}
            footer={null}
          >
            <Input
              placeholder="Enter price"
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
            />
            <Button type="primary" onClick={closeFilterModal}>
              Apply
            </Button>
          </Modal>
        );
      case "date":
        return (
          <Modal
            title="Filter by Date"
            open={isModalVisible}
            onCancel={closeFilterModal}
            footer={null}
          >
            <DatePicker
              value={filterDate}
              onChange={handleDateFilterChange}
              showTime
              format="YYYY-MM-DD hh:mm:ss A"
            />
            <Button type="primary" onClick={closeFilterModal}>
              Apply
            </Button>
          </Modal>
        );
      case "date-range":
        return (
          <Modal
            title="Filter by Date Range"
            open={isModalVisible}
            onCancel={closeFilterModal}
            footer={null}
          >
            <DatePicker.RangePicker
              value={filterDateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Button type="primary" onClick={closeFilterModal}>
              Apply
            </Button>
          </Modal>
        );
      case "type":
        return (
          <Modal
            title="Filter by Type"
            open={isModalVisible}
            onCancel={closeFilterModal}
            footer={null}
          >
            <Input
              placeholder="Enter type (buy/sell)"
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
            />
            <Button type="primary" onClick={closeFilterModal}>
              Apply
            </Button>
          </Modal>
        );
      default:
        return null;
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            colorBgContainer: "#1d1d22",
            headerColor: "white",
            headerBg: "#2e2e33",
            colorText: "#ffffff",
            colorBorder: "#374151",
            fontSize: 14,
          },
        },
      }}
    >
      <Table
        columns={columnsWithFilters}
        dataSource={filteredData?.map((item) => ({
          ...item,
          key: item.id || item.transactionId || item.createdAt,
        }))}
        pagination={false}
        loading={loading}
        scroll={{ x: true }}
      />
      {renderFilterModal()}
    </ConfigProvider>
  );
};

export default TransactionTable;