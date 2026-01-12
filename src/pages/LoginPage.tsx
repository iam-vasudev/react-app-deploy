import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Key } from 'lucide-react';

export const LoginPage = () => {
    const { loginWithKeycloak, error: authError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSupabaseLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setError(error.message);
        }
        // AuthContext will auto-detect session change and redirect
        setLoading(false);
    };

    return (
        <div className="page-container">
            <div className="glass-panel">
                <h1 className="title">
                    <Lock size={28} /> Welcome Back
                </h1>

                <button onClick={loginWithKeycloak} className="primary btn-block">
                    <Key size={20} /> Login with Keycloak
                </button>
                {authError && <p className="error-text mt-2 text-center text-sm">{authError}</p>}

                <div className="divider">
                    <span>Or login with email</span>
                </div>

                <form onSubmit={handleSupabaseLogin} className="login-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-block">
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};
