import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Table,
  Button,
  Popconfirm,
  Spin,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  notification,
  Card,
  Col,
  Upload,
} from "antd";
import { LogoutOutlined, UploadOutlined } from "@ant-design/icons";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const API_URL = "http://localhost:8000/api";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          setIsLoggedIn(true);
          setIsAdmin(response.data.role === "admin");
        })
        .catch(() => setIsLoggedIn(false))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const fetch = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/tokens`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => setTokens(response.data))
      .catch(() => {
        notification.error({ message: "Failed to load tokens." });
      });
    axios
      .get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => setTransactions(response.data))
      .catch(() => {
        notification.error({ message: "Failed to load transactions." });
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (isAdmin) {
     fetch();
    }
  }, [isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`${API_URL}/${type}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (type === "tokens") {
        setTokens(tokens.filter((token) => token._id !== id));
      } else {
        setTransactions(
          transactions.filter((transaction) => transaction._id !== id)
        );
      }
      fetch()
    } catch (error) {
      notification.error({ message: "Error deleting item." });
      console.error("Error deleting:", error);
    }
  };

  const edit = async (type, values) => {
    try {
      await axios.put(
        `${API_URL}/${type}/${
          values.pairAddress ? values.pairAddress : values._id
        }`,
        values,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (type === "tokens") {
        setTokens(
          tokens.filter((token) => token.pairAddress !== values.pairAddress)
        );
      } else {
        setTransactions(
          transactions.filter(
            (transaction) => transaction.pairAddress !== values.pairAddress
          )
        );
      }
      notification.success({ message: `${type} updated successfully.` });
    } catch (error) {
      notification.error({ message: `Error updating ${type}.` });
      console.error("Error updating:", error);
    }
  };

  const create = async (type, values) => {
    try {
      const resp = await axios.post(`${API_URL}/${type}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (type === "tokens") {
        setTokens([...tokens, resp.data]);
      } else {
        setTransactions([...transactions, resp.data]);
      }
      notification.success({ message: `${type} created successfully.` });
    } catch (error) {
      notification.error({ message: `Error creating ${type}.` });
      console.error("Error creating:", error);
    }
  };

  const handleEdit = async (type, record) => {
    setModalType(type);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleCreate = (type) => {
    setModalType(type);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async (type) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (values._id) {
        await edit(type, values);
      } else {
        await create(type, { ...values, logo: logoUrl });
      }

      setModalVisible(false);
    } catch (error) {
      notification.error({
        message: "Validation failed. Please check the inputs.",
      });
      console.error("Validation Failed:", error);
    }
  };
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setLogoUrl(response.data.files[0].url);
        alert("Logo uploaded successfully!");
      }
    } catch (error) {
      alert("Error uploading logo!");
      console.error("Error During Signup", error);
    }
  };
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Function to validate Ethereum address format
  const validateEthereumAddress = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please input the pair address!'));
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return Promise.reject(new Error('Invalid Ethereum address format!'));
    }
    return Promise.resolve();
  };

  const columnsTokens = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (text) => <img src={text} alt="Logo" className="w-10" />,
    },
    { 
      title: "Pair Address", 
      dataIndex: "pairAddress", 
      key: "pairAddress",
      render: (text) => (
        <a 
          href={`https://etherscan.io/address/${text}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {text}
        </a>
      )
    },
    { title: "Price USD", dataIndex: "priceUSD", key: "priceUSD" },
    { title: "Liquidity", dataIndex: "liquidity", key: "liquidity" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="!w-[20px] flex">
          <Button onClick={() => handleEdit("tokens", record)}>Edit</Button>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete("tokens", record.pairAddress)}
          >
            <Button className="!border !border-gray-600 ml-2" type="danger">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const columnsTransactions = [
    {
      title: "Pair Address",
      dataIndex: "pairAddress",
      key: "pairAddress",
      render: (_, record) => (
        <a 
          href={`https://etherscan.io/address/${record.tokenId?.pairAddress}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {record.tokenId?.pairAddress}
        </a>
      ),
    },
    { title: "Transaction Type", dataIndex: "type", key: "type" },
    { title: "Volume", dataIndex: "volume", key: "volume" },
    { title: "Price (USD)", dataIndex: "priceUSD", key: "priceUSD" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete("transactions", record._id)}
          >
            <Button className="!border !border-gray-600" type="danger">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <Spin
        size="large"
        className="w-screen h-screen !flex bg-white items-center justify-center"
      />
    );
  if (!isLoggedIn) return <Login />;
  if (!isAdmin) {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "0 24px", minHeight: 280 }}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Tokens" key="1">
            <Button className="mb-2" onClick={() => handleCreate("tokens")}>
              Create Token
            </Button>
            <Table dataSource={tokens} columns={columnsTokens} rowKey="_id" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Transactions" key="2">
            <Button
              className="mb-2"
              onClick={() => handleCreate("transactions")}
            >
              Create Transaction
            </Button>
            <Table
              dataSource={transactions}
              columns={columnsTransactions}
              rowKey="_id"
            />
          </Tabs.TabPane>
        </Tabs>
      </Content>
      <Button
        className="!absolute !right-4 !top-12"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      >
        Logout
      </Button>
      <Modal
        title={modalType === "tokens" ? "Token Details" : "Transaction Details"}
        open={modalVisible}
        centered
        width={1000}
        onOk={() => handleSave(modalType)}
        onCancel={() => setModalVisible(false)}
      >
        {modalType === "tokens" ? (
          <Form form={form} layout="vertical">
            <Form.Item className="hidden" name="_id" label="_id">
              <Input />
            </Form.Item>
            <Col className="flex w-full gap-4">
              <Form.Item
                name="priceUSD"
                label="Token Logo"
                rules={[{ required: true }]}
              >
                <Upload
                  beforeUpload={handleImageUpload}
                  fileList={fileList}
                  onChange={handleFileChange}
                  showUploadList={false}
                  maxCount={1}
                  className="w-full"
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="pairAddress"
                label="Pair Address"
                className="w-full"
                rules={[
                  { required: true, message: 'Please input the pair address!' },
                  { validator: validateEthereumAddress }
                ]}
              >
                <Input placeholder="0x..." />
              </Form.Item>

              <Form.Item
                name="priceUSD"
                className="w-full"
                label="Price USD"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col className="flex w-full gap-4">
              <Form.Item
                name="priceSOL"
                label="Price SOL"
                className="w-full"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="liquidity"
                className="w-full"
                label="Liquidity"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                className="w-full"
                name="fdv"
                label="FDV"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <div className="font-bold text-lg mb-2"> Volume</div>
            <Col className="flex w-full gap-4">
              <Form.Item
                name="mktCap"
                className="w-full"
                label="Market Cap"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="volume"
                className="w-full"
                label="Volume"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="buys"
                className="w-full"
                label="Buys"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="sells"
                className="w-full"
                label="Sells"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col className="flex w-full gap-4">
              <Form.Item
                name="buyVol"
                className="w-full"
                label="Buy Volume"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="sellVol"
                className="w-full"
                label="Sell Volume"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="buyers"
                className="w-full"
                label="Buyers"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="sellers"
                className="w-full"
                label="Sellers"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <div className="font-bold text-lg mb-2"> Mint A</div>
            <Col className="flex w-full gap-4">
              <Form.Item
                name={["mintA", "address"]}
                className="w-full"
                label="Mint A Address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                className="w-full"
                name={["mintA", "name"]}
                label="Mint A Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              {/* <Form.Item
                name={["mintA", "symbol"]}
                label="Mint A Symbol"
              >
                <Input />
              </Form.Item> */}
              <Form.Item
                name={["mintA", "price"]}
                className="w-full"
                label="Mint A Price"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["mintA", "pool"]}
                className="w-full"
                label="Mint A Pool"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <div className="font-bold text-lg mb-2"> Mint B</div>
            <Col className="flex w-full gap-4">
              <Form.Item
                name={["mintB", "address"]}
                className="w-full"
                label="Mint B Address"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["mintB", "name"]}
                className="w-full"
                label="Mint B Name"
              >
                <Input />
              </Form.Item>

              {/* <Form.Item
                name={["mintB", "symbol"]}
                label="Mint B Symbol"
              >
                <Input />
              </Form.Item> */}
              <Form.Item
                name={["mintB", "price"]}
                className="w-full"
                label="Mint B Price"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["mintB", "pool"]}
                className="w-full"
                label="Mint B Pool"
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <div className="font-bold text-lg mb-2"> Price</div>
            <Col className="flex w-full gap-4">
              <Form.Item
                name={["bought", "priceUSD"]}
                className="w-full"
                label="Bought Price USD"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["bought", "volume"]}
                className="w-full"
                label="Bought Volume"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["bought", "txns"]}
                className="w-full"
                label="Bought Transactions"
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col className="flex w-full gap-4">
              <Form.Item
                name={["sold", "priceUSD"]}
                className="w-full"
                label="Sold Price USD"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["sold", "volume"]}
                className="w-full"
                label="Sold Volume"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name={["sold", "txns"]}
                className="w-full"
                label="Sold Transactions"
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col className="flex w-full gap-4">
              <Form.Item
                name="cumulativePNL"
                className="w-full"
                label="Cumulative PNL"
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="cumulativeUnrealized"
                className="w-full"
                label="Cumulative Unrealized"
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            </Form>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item name="_id" label="_id" className="hidden">
              <Input />
            </Form.Item>
            <Form.Item
              name="tokenId"
              label="Token ID"
              className="w-full"
              rules={[{ required: true, message: "Token ID is required" }]}
            >
              <Input />
            </Form.Item>

            <Col className="flex w-full gap-4">
              <Form.Item
                name="type"
                className="w-full"
                label="Type"
                rules={[{ required: true, message: "Type is required" }]}
              >
                <Select>
                  <Select.Option value="buy">Buy</Select.Option>
                  <Select.Option value="sell">Sell</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="volume"
                label="Volume"
                className="w-full"
                rules={[{ required: true, message: "Volume is required" }]}
              >
                <Input type="number" />
              </Form.Item>``
              <Form.Item
                name="priceUSD"
                className="w-full"
                label="Price USD"
                rules={[{ required: true, message: "Price USD is required" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col className="flex w-full gap-4">
              <Form.Item
                name="priceSOL"
                label="Price SOL"
                className="w-full"
                rules={[{ required: true, message: "Price SOL is required" }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="pnl"
                className="w-full"
                label="PnL"
                initialValue={0}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="unrealized"
                className="w-full"
                label="Unrealized"
                initialValue={0}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Form>
        )}
      </Modal>
    </Layout>
  );
}
