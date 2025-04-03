import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spin } from 'antd';
import { fetchTokens } from '../utils/api';

const Home = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const getMarketData = async () => {
      setLoading(true);
      try {
        const data = await fetchTokens();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };
    getMarketData();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'mintA',
      key: 'name',
      render: (_, record) => `${record.mintA?.name}/${record.mintB?.name}`,
    },
    {
      title: 'Token',
      dataIndex: 'pairAddress',
      key: 'pairAddress',
    },
    {
      title: 'Price (USD)',
      dataIndex: 'priceUSD',
      key: 'priceUSD',
      render: (text) => `$${text}`,
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      render: (text) => `$${text?.toLocaleString()}`,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (text) => `$${text?.toLocaleString()}`,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tokens</h2>
      <Table
        columns={columns}
        dataSource={tokens}
        rowKey="_id"
        onRow={(record) => ({
          onClick: () => navigate(`token/${record.pairAddress}`),
        })}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
    </div>
  );
};

export default Home;
