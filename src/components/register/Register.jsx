import React from 'react';
import './register.css';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';
import { Link } from 'react-router-dom';

const Register = () => {
    const [avatar, setAvatar] = React.useState({ file: null, url: '' });
    const [loading, setLoading] = React.useState(false);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            let imgUrl = '';
            if (avatar.file) {
                imgUrl = await upload(avatar.file);
            }

            await setDoc(doc(db, 'users', res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, 'userChats', res.user.uid), { chats: [] });
            toast.success('Account created successfully! You can login now.');
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
                <h2>Create a new account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || '/avatar.png'} alt="avatar" />
                        Upload an image
                    </label>
                    <input type="file" id="file" style={{ display: 'none' }} onChange={handleAvatar} />
                    <input type="text" placeholder="Username" name="username" required />
                    <input type="email" placeholder="Email" name="email" required />
                    <input type="password" placeholder="Password" name="password" required />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</button>
                    <p className="auth-footer">
                        Already have an account? <Link to="/">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
