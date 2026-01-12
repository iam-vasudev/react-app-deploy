import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../lib/keycloak';
import { supabase } from '../lib/supabase';

type AuthProvider = 'keycloak' | 'supabase' | null;

let didInit = false;

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    provider: AuthProvider;
    loginWithKeycloak: () => void;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [provider, setProvider] = useState<AuthProvider>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (didInit) {
            // If already initialized, just sync state if needed
            if (keycloak.authenticated) {
                setIsAuthenticated(true);
                setUser(keycloak.tokenParsed);
                setProvider('keycloak');
            }
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            didInit = true;

            try {
                const keycloakAuthenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false // Optional: disable iframe check if it causes issues locally
                });

                if (keycloakAuthenticated) {
                    setIsAuthenticated(true);
                    setUser(keycloak.tokenParsed);
                    setProvider('keycloak');
                }
            } catch (err: any) {
                console.error("Keycloak init failed", err);
                setError(err?.message || "Failed to initialize Keycloak");
            }

            // Check Supabase regardless of Keycloak result (unless we want to stop on error?)
            // If Keycloak failed, we might still want to allow Supabase login
            if (!keycloak.authenticated) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setIsAuthenticated(true);
                    setUser(session.user);
                    setProvider('supabase');
                }
            }

            setLoading(false);
        };

        initAuth();

        // Supabase listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && provider !== 'keycloak') {
                setIsAuthenticated(true);
                setUser(session.user);
                setProvider('supabase');
            } else if (!session && provider === 'supabase') {
                setIsAuthenticated(false);
                setUser(null);
                setProvider(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [provider]);

    const loginWithKeycloak = async () => {
        try {
            await keycloak.login();
        } catch (err: any) {
            console.error("Keycloak login failed", err);
            setError(err?.message || "Failed to start login flow");
        }
    };

    const logout = () => {
        if (provider === 'keycloak') {
            keycloak.logout();
        } else if (provider === 'supabase') {
            supabase.auth.signOut();
        }
        setIsAuthenticated(false);
        setUser(null);
        setProvider(null);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, provider, loginWithKeycloak, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
