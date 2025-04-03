import React, { useState } from 'react';
import {
  Button,
  Input,
  Row,
  Col,
  Typography,
  Card,
  Switch,
  Upload,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/icon.jpeg';
import 'animate.css';

const { Paragraph } = Typography;

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fileList, setFileList] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setLogoUrl(response.data.files[0].url);
        alert('Logo uploaded successfully!');
      }
    } catch (error) {
      alert('Error uploading logo!');
      console.error('Error During Signup', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        'Password must be at least 8 characters long and contain both letters and numbers.'
      );
      return;
    }
    if (password !== confirmPassword && password.length) {
      alert('Passwords do not match!');
      return;
    }

    const newUser = {
      username,
      email,
      password,
      role: isAdmin ? 'admin' : 'user',
      logo: logoUrl,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/register`, // Corrected URL
        newUser
      );

      const data = response.data;

      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);

        alert('Signup successful!');
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert(error?.response?.data?.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 to-gray-500">
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
              Please create an account to get started
            </Paragraph>

            <form onSubmit={handleSubmit} noValidate={false}>
              <Input
                className="mb-4"
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                className="mb-4"
                prefix={<MailOutlined />}
                placeholder="Email address"
                type="email"
                required
                size="large"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input.Password
                className="mb-4"
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input.Password
                className="mb-4"
                prefix={<LockOutlined />}
                required
                placeholder="Confirm Password"
                size="large"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="mb-4 flex gap-4">
                <Paragraph className="!text-gray-200">Select Role:</Paragraph>
                <Switch
                  checked={isAdmin}
                  onChange={() => setIsAdmin(!isAdmin)}
                  checkedChildren="Admin"
                  unCheckedChildren="User"
                />
              </div>

              <div className="mb-4">
                <Upload
                  beforeUpload={(file) => {
                    handleImageUpload(file);
                    return false;
                  }}
                  fileList={fileList}
                  onChange={handleFileChange}
                  showUploadList={false}
                  maxCount={1}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
              </div>

              <div className="text-center pt-1 mb-5">
                <Button
                  type="primary"
                  className="mb-4 w-full"
                  size="large"
                  htmlType="submit"
                >
                  Sign Up
                </Button>
              </div>
            </form>

            <div className="flex flex-col items-center justify-center pb-4 mb-4">
              <Paragraph className="mb-0 !text-gray-200">
                Already have an account?
              </Paragraph>
              <Button
                type="default"
                className="mx-2"
                onClick={() => navigate('/login')}
                size="large"
                style={{
                  background: 'linear-gradient(45deg, #ff6ec7, #7851a9)',
                  borderColor: 'transparent',
                  color: '#fff',
                }}
              >
                Login
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Signup;
