import React from 'react';
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
        <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-700 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg border border-white/10">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Create a new account</h1>
                    <p className="text-white/70 text-sm mt-1">Sign up to get started</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <label htmlFor="file" className="cursor-pointer">
                            <img
                                src={avatar.url || '/avatar.png'}
                                alt="avatar"
                                className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                            />
                            <p className="text-center text-white/70 text-sm mt-2">Upload an image</p>
                        </label>
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleAvatar}
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                                Signing Up...
                            </div>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-4 text-white/70 text-sm">
                    <p className="inline">Already have an account? </p>
                    <Link
                        to="/"
                        className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;