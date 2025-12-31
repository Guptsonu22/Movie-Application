import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // We might want to fetch full user details here if needed, 
                // but for now relying on what's in token or basic persistence
                // Ideally the token has role info.
                // If the initial login response has role, we should store it or token should have it.
                // Let's assume decoding gives us expiration and id. 
                // We'll trust the token presence for now but ideally verify with backend.
                setUser({ token, ...decoded });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const { data } = await axios.post('/api/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        // decode to check role immediately if needed or just use data
        const decoded = jwtDecode(data.token);
        setUser({ ...data, ...decoded });
    };

    const register = async (username, password) => {
        const { data } = await axios.post('/api/auth/register', { username, password });
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser({ ...data, ...decoded });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
