import React, { useState } from 'react';
import { Button, Input, Row, Col, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import logo from '../assets/icon.jpeg';
import { useNavigate } from 'react-router-dom';
import 'animate.css';
import axios from 'axios';

const { Paragraph } = Typography;

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const user = {
      email,
      password,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`, // Corrected URL
        user
      );
      const data = response.data;

      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);

        alert('Login successful!');
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(
        error?.response?.data?.error || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-500 to-gray-950">
      <Row gutter={[16, 16]} justify="center">
        <Col>
          <Card
            className="p-8 rounded-lg shadow-lg !bg-transparent bg-opacity-80"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <div className="text-center flex flex-col items-center animate__animated animate__fadeIn">
              <img
                src={logo}
                alt="logo"
                className="w-32 mb-6 animate__animated animate__zoomIn"
              />
            </div>

            <Paragraph className="text-center !text-gray-200 mb-4">
              Please login to your account
            </Paragraph>

            <Input
              className="mb-4"
              prefix={<UserOutlined />}
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="large"
            />
            <Input.Password
              className="mb-4"
              prefix={<LockOutlined />}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
            />

            <div className="text-center pt-1 mb-5">
              <Button
                type="primary"
                className="mb-4 w-full"
                size="large"
                onClick={handleSubmit}
                loading={loading}
              >
                Sign in
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center pb-4 mb-4">
              <Paragraph className="mb-0 !text-gray-200">
                Don't have an account?
              </Paragraph>
              <Button
                type="default"
                className="mx-2"
                onClick={() => navigate('/signup')}
                size="large"
                style={{
                  background: 'linear-gradient(45deg, #ff6ec7, #7851a9)',
                  borderColor: 'transparent',
                  color: '#fff',
                }}
              >
                Sign Up
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
