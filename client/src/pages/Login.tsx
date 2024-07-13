import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, getPublicKey } from '../auth/slice'
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn } = useSelector((state: RootState) => state.auth);

    if (isLoggedIn) {
        navigate('/dashboard');
    }

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        dispatch(login({ username, password }));
    }

    useEffect(() => {
        dispatch(getPublicKey());
    }, [dispatch]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-96 bg-white p-4 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-500 text-white p-2 rounded"
                    onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}