import React from 'react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
    const { user, logout, provider } = useAuth();

    return (
        <div className="page-container">
            <div className="glass-panel text-center">
                <h1 className="title">Hello World</h1>
                <div className="mb-6">
                    <p className="text-gray-300">Logged in via <strong>{provider?.toUpperCase()}</strong></p>
                    {/* Displaying minimal user info to verify auth context */}
                    <div className="mt-4 p-4 bg-black/20 rounded-lg text-left overflow-auto max-h-60 text-xs font-mono text-gray-400">
                        {user?.email || user?.preferred_username || "User ID: " + (user?.id || user?.sub)}
                    </div>
                </div>
                <button onClick={logout} className="primary btn-block">
                    Logout
                </button>
            </div>
        </div>
    );
};
