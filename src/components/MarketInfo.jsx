import React, { useState } from 'react';
import { Button, Form, Input, Modal, notification, Select } from 'antd';
import {
  FaTwitter,
  FaTelegram,
  FaCopy,
  FaSearch,
  FaCheck,
  FaInfo,
  FaFire,
  FaFlag,
  FaPoop,
  FaArrowCircleUp,
  FaArrowCircleDown,
  FaTelegramPlane,
  FaBullhorn,
} from 'react-icons/fa';
import { SwapOutlined } from '@ant-design/icons';
import { AiOutlineBell } from 'react-icons/ai';
import tokenImage from '../assets/wof.webp';
import tokenprofile from '../assets/token.webp';
import { CiStar } from 'react-icons/ci';
import { marketData } from '../utils/dummyData';

import { RiArrowDropDownLine, RiRocketFill } from 'react-icons/ri';

import {
  PiArrowSquareOutDuotone,
  PiXLogoBold,
  PiInfoBold,
} from 'react-icons/pi';
import { GrDown } from 'react-icons/gr';
import { PowerIcon, ProgressIcon, EyesIcon } from '../assets/icons/Icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL; // Replace with your API URL

// Candle generation function

const MarketSidebar = ({ token }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);
  const [toggleClicked, setToggleClicked] = useState(false);
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('0.0005517');
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState('');
  const [form] = Form.useForm();
  const { pairAddress } = useParams();

  // Correct dummy data initialization
  const [randomData] = useState(() => {
    const randomIndex = Math.floor(Math.random() * marketData.length);
    return marketData[randomIndex];
  });

  function generateCandle(basePrice) {
    let fluctuation = basePrice * 0.05; // 5% fluctuation range
    const isBearish = Math.random() < 0.6; // 60% chance of a bearish candle

    let open = (
      basePrice +
      (Math.random() * fluctuation - fluctuation / 2)
    ).toFixed(2);
    let high, low, close;

    if (isBearish) {
      // Bearish scenario: close lower than open
      high = (parseFloat(open) + Math.random() * (fluctuation * 2)).toFixed(2); // Increased range
      low = (parseFloat(high) - Math.random() * (fluctuation * 2)).toFixed(2); // Increased range
      close = (
        parseFloat(low) +
        Math.random() * (parseFloat(open) - parseFloat(low))
      ).toFixed(2);
    } else {
      // Bullish scenario: close higher than open
      low = (parseFloat(open) - Math.random() * (fluctuation * 7)).toFixed(2); // Increased range
      high = (parseFloat(open) + Math.random() * (fluctuation * 7.5)).toFixed(
        2
      ); // Increased range
      close = (
        parseFloat(low) +
        Math.random() * (parseFloat(high) - parseFloat(low))
      ).toFixed(2);
    }

    console.log('========', open, high, low, close, isBearish);
    return { open, high, low, close, isBearish };
  }

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggelClick = () => {
    setToggleClicked(toggleClicked ? false : true);
  };

  const formatTimeAgo = (isoDate) => {
    if (!isoDate) return 'N/A';

    const createdAt = new Date(isoDate).getTime();
    const now = new Date().getTime();

    const diffInMs = now - createdAt;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m ago`;
  };

  const handleSave = async (type, price) => {
    try {
      // Generate candle data using the entered price
      const candleData = generateCandle(price);

      // Prepare values to save
      const values = {
        tokenId: pairAddress,
        volume: randomData.volume,
        // priceUSD: randomData.priceUSD,
        // priceSOL: randomData.priceSOL,
        // pnl: randomData.pnl,
        // unrealized: randomData.unrealized,
        type: type,
        // Add candle data to the transaction
        priceSOL: candleData.open,
        priceUSD: candleData.high,
        pnl: candleData.low,
        unrealized: candleData.close,
        // candleIsBearish: candleData.isBearish
      };

      await create(values); // Save to backend
      setModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Error saving candle data',
      });
      console.error('Error:', error);
    }
  };

  const create = async (values) => {
    try {
      await axios.post(`${API_URL}/transactions`, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      notification.success({ message: `${values.type} created successfully.` });
    } catch (error) {
      notification.error({ message: `Error creating ${values.type}.` });
      console.error('Error creating:', error);
    }
  };

  const handleCreate = (type) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (role === 'user' && token) {
      setType(type);
      form.resetFields();
      setModalVisible(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-full text-white rounded-lg">
      <div className="items-center space-x-2">
        <div className=" flex space-x-2 p-2 fixed bg-black w-[330px]">
          <img
            src={token?.logo || tokenImage}
            alt={token?.logo}
            className="w-8 h-8 rounded"
          />
          <h2 className="text-lg font-bold">{token?.mintA?.name}</h2>
        </div>
        <div className="flex flex-col items-center justify-center pt-12">
          <span className="flex gap-2">
            {token?.mintA?.name}
            <FaCopy
              onClick={() => handleCopy(token?.mintA?.name)}
              size={16}
              className={`cursor-pointer
                ${
                  copied === token?.mintA?.name
                    ? 'text-green-400'
                    : 'text-white'
                }
              `}
            />
            / {token?.mintB?.name} #29 100
          </span>
          <span>Solana Raydium via Pump.fun</span>
        </div>
      </div>
      <div className="relative">
        <img
          src={token?.logo || tokenImage}
          alt={token?.logo}
          className="w-full pt-2 rounded "
        />
        <div className="flex absolute w-full -bottom-3.5  px-4 !rounded-lg">
          <Button
            icon={<FaTwitter />}
            aria-label="Share on Twitter"
            className="!bg-[#2e2e33] !text-white w-1/2 !border-gray-300 !rounded-e-sm"
          >
            Twitter
          </Button>
          <Button
            icon={<FaTelegram />}
            aria-label="Share on Telegram"
            className="!bg-[#2e2e33] !text-white w-1/2 !border-gray-300 !rounded-none"
          >
            Telegram
          </Button>
          <Button
            icon={<RiArrowDropDownLine size={32} />}
            className="!bg-[#2e2e33] !text-white w-1/2 !border-gray-300 !rounded-none"
          ></Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mt-2 text-center ">
          <div className="px-2 py-1 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">PRICE USD</p>
            <p className="text-sm font-bold">${token?.priceUSD}</p>
          </div>
          <div className="px-2 py-1 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">PRICE</p>
            <p className="text-sm font-bold">
              {token?.priceSol} {token?.priceSOL}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2 text-center">
          <div className="px-2 py-1 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">LIQUIDITY</p>
            <p className="flex flex-row justify-center gap-2 text-sm font-bold">
              ${token?.liquidity} <ProgressIcon />
            </p>
          </div>
          <div className="px-2 py-1 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">FDV</p>
            <p className="text-sm font-bold">${token?.fdv}</p>
          </div>
          <div className="px-2 py-1 border border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">MKT CAP</p>
            <p className="text-sm font-bold">${token?.mktCap}</p>
          </div>
        </div>

        <div className="flex w-full gap-1 mt-2 border border-gray-600 rounded">
          <div className="grid gap-3 mt-4 text-center grid-row-3">
            <div className="px-2 py-1 rounded-lg ">
              <p className="text-xs text-gray-400">TXNS</p>
              <p className="text-sm font-bold">{token?.txns}</p>
            </div>
            <div className="px-2 py-1 rounded-lg ">
              <p className="text-xs text-gray-400">VOLUME</p>
              <p className="text-sm font-bold">{token?.volume}</p>
            </div>
            <div className="px-2 py-1 rounded-lg ">
              <p className="text-xs text-gray-400">MAKERS</p>
              <p className="text-sm font-bold">{token?.ownerToken}</p>
            </div>
          </div>
          <div className="my-4 border border-gray-600"></div>
          <div className="flex w-full mb-2">
            <div className="flex flex-col w-full gap-3 mt-4 text-left ">
              <div className="py-1 pl-2 rounded-lg ">
                <p className="text-xs text-gray-400">BUYS</p>
                <p className="text-sm font-bold">{token?.buys}</p>
                <p className="border-b-2 border-green-400"></p>
              </div>
              <div className="py-1 pl-2 rounded-lg ">
                <p className="text-xs text-gray-400">BUYS VOl</p>
                <p className="text-sm font-bold">${token?.buyVol}</p>
                <p className="border-b-2 border-green-400"></p>
              </div>
              <div className="py-1 pl-2 rounded-lg ">
                <p className="text-xs text-gray-400">BUYERS</p>
                <p className="text-sm font-bold">{token?.buyers}</p>
                <p className="border-b-2 border-green-400"></p>
              </div>
            </div>
            <div className="flex flex-col w-full gap-3 mt-4 text-end">
              <div className="py-1 pl-1 pr-2 rounded-lg ">
                <p className="text-xs text-gray-400">SELLS</p>
                <p className="text-sm font-bold">{token?.sells}</p>
                <p className="border-b-2 border-red-400"></p>
              </div>
              <div className="py-1 pl-1 pr-2 rounded-lg ">
                <p className="text-xs text-gray-400">SELLS VOL</p>
                <p className="text-sm font-bold">${token?.sellVol}</p>
                <p className="border-b-2 border-red-400"></p>
              </div>
              <div className="py-1 pl-1 pr-2 rounded-lg ">
                <p className="text-xs text-gray-400">SELLERS</p>
                <p className="text-sm font-bold">{token?.sellers}</p>
                <p className="border-b-2 border-red-400"></p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <Button className="!bg-[#2e2e33] !text-white !border-none w-1/2 mr-2 !py-4 !cursor-pointer">
            <CiStar size="18px" /> Watchlist
          </Button>
          <Button className="!bg-[#2e2e33] !text-white !border-none w-1/2 !py-4 !cursor-pointer">
            <AiOutlineBell size="18px" />
            Alerts
          </Button>
        </div>
        <div className="flex justify-between mt-2">
          <Button
            className="!bg-[#2e2e33] !text-white !border-none w-1/2 mr-2 !py-4 !cursor-pointer"
            onClick={() => handleCreate('buy')}
          >
            <FaArrowCircleUp color="green" size="18px" /> Buy
          </Button>
          <Button
            className="!bg-[#2e2e33] !text-white !border-none w-1/2 !py-4 !cursor-pointer"
            onClick={() => handleCreate('sell')}
          >
            <FaArrowCircleDown color="red" size="18px" /> Sell
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="flex justify-between border-b border-gray-600 ">
          <span className="mb-2">Pair created</span>
          {formatTimeAgo(token?.createdAt)}
        </div>
        <div className="flex justify-between border-b border-gray-600 ">
          <span className="mb-2">Pooled {token?.mintA?.name}</span>
          {token?.mintA?.pool}
        </div>
        <div className="flex justify-between border-b border-gray-600 ">
          <span className="mb-2">Pooled {token?.mintB?.name}</span>
          <div className="flex gap-2">
            <span>{token?.mintB?.pool}</span> ${token?.mintB?.price}
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-gray-600">
          <span className="mb-2">Pair</span>
          <div className="flex gap-2">
            <span
              className="flex items-center justify-center px-2 mb-2 bg-gray-700 border rounded cursor-pointer"
              onClick={() => handleCopy(token?.pairAddress)}
            >
              <FaCopy
                size={16}
                className={`cursor-pointer
                ${
                  copied === token?.pairAddress
                    ? 'text-green-400'
                    : 'text-white'
                }
              `}
              />
              {token?.pairAddress?.length > 10
                ? `${token?.pairAddress?.slice(
                    0,
                    5
                  )}...${token?.pairAddress?.slice(-5)}`
                : token?.pairAddress}
            </span>
            <span className="flex items-center gap-2 mb-2 ">
              EXP <PiArrowSquareOutDuotone className="cursor-pointer" />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-gray-600">
          <span className="mb-2">{token?.mintA?.name}</span>
          <div className="flex gap-2">
            <span
              className="flex items-center justify-center px-2 mb-2 bg-gray-700 border rounded cursor-pointer"
              onClick={() => handleCopy(token?.minA?.address)}
            >
              <FaCopy
                size={16}
                className={`
                ${
                  copied === token?.minA?.address
                    ? 'text-green-400'
                    : 'text-white'
                }
              `}
              />
              {token?.mintA?.address.length > 10
                ? `${token?.mintA?.address.slice(
                    0,
                    5
                  )}...${token?.mintA?.address.slice(-5)}`
                : token?.mintA?.address}
            </span>
            <span className="flex items-center gap-2 mb-2 ">
              EXP <PiArrowSquareOutDuotone className="cursor-pointer" />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-gray-600">
          <span className="mb-2">{token?.mintB?.name}</span>
          <div className="flex gap-2">
            <span
              className="flex items-center justify-center px-2 mb-2 bg-gray-700 border rounded cursor-pointer"
              onClick={() => handleCopy(token?.mintB?.address)}
            >
              <FaCopy
                size={16}
                className={`
                ${
                  copied === token?.mintB?.address
                    ? 'text-green-400'
                    : 'text-white'
                }
              `}
              />
              {token?.mintB?.address.length > 10
                ? `${token?.mintB?.address.slice(
                    0,
                    5
                  )}...${token?.mintB?.address.slice(-5)}`
                : token?.mintB?.address}
            </span>
            <span className="flex items-center gap-2 mb-2 ">
              EXP <PiArrowSquareOutDuotone className="cursor-pointer" />
            </span>
          </div>
        </div>
        <div className="flex w-full -bottom-3.5 gap-2 rounded-lg">
          <Button
            icon={<FaTwitter />}
            className="!bg-[#17171c] !text-white w-1/2 !border-gray-300 !rounded-e-sm"
          >
            Search on Twitter
          </Button>
          <Button
            icon={<FaSearch />}
            className="!bg-[#17171c] !text-white w-1/2 !border-gray-300 !rounded-e-sm"
          >
            Other Points
          </Button>
        </div>
        <div className="!w-full border border-gray-600 rounded px-2">
          <div
            className="!w-full flex gap-4 cursor-pointer hover:bg-gray-900 py-2"
            onClick={toggelClick}
          >
            <span className="w-full">Audit</span>
            <span className="flex items-center justify-end w-full gap-2">
              No Issue{' '}
              <FaCheck className="rounded-full bg-green-700 p-0.5 cursor-pointer" />{' '}
            </span>
            <span className={`border-l flex items-center justify-center`}>
              <GrDown
                size={20}
                className={`${toggleClicked ? 'rotate-180 pr-2' : 'pl-2'}`}
              />
            </span>
          </div>
          {toggleClicked && (
            <div className="border-t border-gray-600">
              <span className="flex items-center justify-between my-1 border-b border-gray-600">
                <div className="flex items-center gap-2 ">
                  <FaInfo className="rounded-full bg-white text-gray-600 p-0.5 cursor-pointer" />{' '}
                  Mintable
                </div>
                <span className="flex items-center gap-2">
                  <FaCheck className="rounded-full bg-green-700 p-0.5 cursor-pointer" />{' '}
                  No
                </span>
              </span>
              <span className="flex items-center justify-between my-1 border-b border-gray-600">
                <div className="flex items-center gap-2">
                  <FaInfo className="rounded-full bg-white text-gray-600 p-0.5 cursor-pointer" />{' '}
                  Freezable
                </div>
                <span className="flex items-center gap-2">
                  <FaCheck className="rounded-full bg-green-700 p-0.5 cursor-pointer" />
                  No
                </span>
              </span>
              <GrDown
                size={18}
                onClick={toggelClick}
                className="flex items-center justify-between w-full my-2 rotate-180 cursor-pointer"
              />
            </div>
          )}
        </div>
        <div className="text-[12px] my-2 text-gray-400">
          Warning! Audits may not be 100% accurate! More.
        </div>
        <Button className="flex border !font-bold !bg-transparent !border-yellow-400 !text-yellow-500 ">
          <PowerIcon />
          Boost
        </Button>
        <div className="flex items-center justify-between gap-2">
          <span className="flex flex-col items-center justify-center w-full p-2 border border-gray-500 rounded cursor-pointer">
            <RiRocketFill className="text-red-400" />
            3909
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-gray-500 rounded cursor-pointer">
            <FaFire className="text-orange-400" />
            166
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-gray-500 rounded cursor-pointer">
            <FaPoop className="text-amber-700" />
            50
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-gray-500 rounded cursor-pointer">
            <FaFlag className="text-red-700" />
            111
          </span>
        </div>
        <div className=" bg-gradient-to-b  from-transparent from-70% to-[#3C3C40] rounded-b-2xl">
          <div className="relative bg-gradient-to-b from-[#1D2B23] to-[#020303] text-center p-6 rounded-2xl shadow-md max-w-md mx-auto text-white mt-10">
            <img
              src={token?.logo || tokenprofile}
              alt={token?.logo}
              className="absolute w-20 h-20 mx-[28%] border-4 border-gray-800 rounded-md -mt-14"
            />
            <h2 className="mt-10 text-xl font-bold">{token?.mintA?.name}</h2>
            <div className="flex items-center justify-center gap-3 my-3">
              <button className="flex flex-row items-center justify-center gap-2 p-2 bg-gray-800 rounded-md cursor-pointer">
                <PiXLogoBold className="" /> Twitter
              </button>
              <button className="flex flex-row items-center justify-center gap-2 p-2 bg-gray-800 rounded-md cursor-pointer">
                <FaTelegramPlane className="" /> Telegram
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-1 mx-auto font-semibold text-black rounded-md bg-[#A4CF5E]">
              <FaBullhorn />
              <span>Marketing Boost</span>
              <PiInfoBold />
            </button>
            <p className="mt-3 text-sm text-white">Dog Wof Autism !</p>
          </div>
          <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-white cursor-pointer ">
            <EyesIcon />
            <span>Claim Your DEX Screener Token Profile</span>
          </div>
        </div>

        {/* last */}
        <div className="mx-auto mt-4 text-white rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border border-gray-700 rounded-md bg-[#333333]">
              <Input
                className="!text-white !bg-[#17171C] !border-none"
                value={fromValue}
                onChange={(e) => {
                  setFromValue(e.target.value);
                  // Calculate and set the toValue when fromValue changes
                  const inputValue = parseFloat(e.target.value) || 0;
                  setToValue((inputValue * 0.0005517).toString());
                }}
              />
              <span className="text-gray-400">{token?.mintB?.name}</span>
            </div>

            <div className="flex justify-center my-2">
              <SwapOutlined className="text-xl text-gray-400" />
            </div>

            <div className="flex items-center p-2 border border-gray-700 rounded-md bg-[#333333]">
              <Input
                className="!text-white !bg-[#17171C] !border-none"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                readOnly // Make this input read-only if you only want one-way calculation
              />
              <div className="flex">
                <Button type="text" className="px-2 !text-white">
                  USD
                </Button>
                <Button type="text" className="!text-white">
                  SOL
                </Button>
              </div>
            </div>
          </div>

          <Button className="w-full font-bold py-2 mt-4 !text-white !bg-transparent rounded-md !border-gray-600">
            Embed this chart
          </Button>

          <p className="m-3 text-sm text-center text-gray-500 hover:underline">
            Crypto charts by TradingView
          </p>
        </div>
      </div>
      <Modal
        title={type === 'buy' ? 'Buy Token' : 'Sell Token'}
        open={modalVisible}
        centered
        onOk={() => {
          const price = parseFloat(form.getFieldValue('price')); // Get price from form
          if (!price || price <= 0) {
            notification.error({ message: 'Invalid price entered' });
            return;
          }
          handleSave(type, price);
        }}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tokenId: pairAddress,
          }}
        >
          <Form.Item name="_id" label="_id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="tokenId"
            label="Token ID"
            rules={[{ required: true, message: 'Token ID is required' }]}
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketSidebar;
