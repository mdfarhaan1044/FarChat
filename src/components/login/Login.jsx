import React from 'react';
import './login.css';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase.js';
import { Link } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="item">
                <h2>Welcome Back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" name="email" required />
                    <input type="password" placeholder="Password" name="password" required />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Sign In'}</button>
                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
