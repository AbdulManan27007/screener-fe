import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { io } from 'socket.io-client';
import TradingChart from './pages/TradingChart';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('token', (tokenData) => {
      console.log('Received token data:', tokenData);
    });

    socket.on('transaction', (transaction) => {
      console.log('Received transaction data:', transaction);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="token/:pairAddress" element={<TradingChart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
