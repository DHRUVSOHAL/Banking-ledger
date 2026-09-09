import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import About from '../components/About';
import Login from '../components/Login';
import Register from '../components/Register';
import Sidebar from '../components/Sidebar';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('about');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      default:
        return <About />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-[30%]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div
        className="w-full md:w-[70%] flex-1 flex items-center justify-center relative bg-cover bg-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}