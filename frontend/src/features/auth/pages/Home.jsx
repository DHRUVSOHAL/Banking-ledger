import React, { useState } from 'react';
import About from '../components/About';
import Login from '../components/Login';
import Register from '../components/Register';
import Sidebar from '../components/Sidebar';
import hero from '../../../assets/hero.png';

export default function Home() {
    // 'about' by default khulega
    const [activeTab, setActiveTab] = useState('about');

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
        <div className="flex  w-full">
            {/* Sidebar - 30% width on desktop */}
            <div className="w-[30%] hidden md:block">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Mobile sidebar - full width top bar, optional */}
            <div className="w-full md:hidden">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Content area - remaining 70% */}
           <div 
    className="w-full md:w-[70%] min-h-screen flex items-center justify-center relative bg-cover bg-center"
    style={{
        backgroundColor: 'black'
        , 
        backgroundImage: `url(${hero})` }}
>
                {renderContent()}
            </div>
        </div>
    );
}