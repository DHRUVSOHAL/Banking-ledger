import React from 'react';
import logo from '../../../assets/logo.png';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { key: 'about', label: 'About Us' },
        { key: 'login', label: 'Login' },
        { key: 'register', label: 'Register' },
    ];

    return (
        <div className="w-full h-full bg-zinc-900  text-white flex flex-col p-6 gap-2">
            <h2 className="text-xl flex justify-center font-bold mb-2 tracking-tight">Banking Ledger</h2>
            {/* logo */}
            
            {menuItems.map((item) => (
                <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`text-left px-4 py-2.5 rounded-md transition-colors font-medium ${
                        activeTab === item.key
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                >
                    {item.label}
                </button>
            ))}

            
        </div>
    );
}