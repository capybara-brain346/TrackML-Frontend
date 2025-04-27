import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await authApi.getCurrentUser();
                if (response?.user) {
                    setUser(response.user);
                } else {
                    // Clear invalid token
                    localStorage.removeItem('auth_token');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('auth_token');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authApi.login(credentials);
            if (response?.token && response?.user) {
                localStorage.setItem('auth_token', response.token);
                setUser(response.user);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            const response = await authApi.register(credentials);
            if (response?.token && response?.user) {
                localStorage.setItem('auth_token', response.token);
                setUser(response.user);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}