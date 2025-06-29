import React from 'react';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Camera, Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
    const [avatar, setAvatar] = React.useState({ file: null, url: '' });
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

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

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring" }
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating elements */}
            <motion.div
                className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
                animate={{
                    x: [0, 20, 0],
                    y: [0, -20, 0],
                    scale: [1, 0.8, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="glass rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 backdrop-blur-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                    >
                        <UserPlus className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h1 
                        className="text-4xl font-bold text-white mb-2 neon-text"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Create Account
                    </motion.h1>
                    <p className="text-white/70 text-lg">Sign up to get started</p>
                </motion.div>

                {/* Avatar Upload */}
                <motion.div className="flex justify-center mb-6" variants={itemVariants}>
                    <motion.label 
                        htmlFor="file" 
                        className="cursor-pointer group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="relative">
                            <motion.img
                                src={avatar.url || '/avatar.png'}
                                alt="avatar"
                                className="w-20 h-20 rounded-full border-2 border-white/20 object-cover shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            />
                            <motion.div
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                whileHover={{ scale: 1.1 }}
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </motion.div>
                        </div>
                        <motion.p 
                            className="text-center text-white/70 text-sm mt-2"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Upload an image
                        </motion.p>
                    </motion.label>
                    <input
                        type="file"
                        id="file"
                        className="hidden"
                        onChange={handleAvatar}
                    />
                </motion.div>

                {/* Form */}
                <motion.form onSubmit={handleRegister} className="space-y-6" variants={itemVariants}>
                    <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                            required
                            className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        />
                    </motion.div>

                    <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            required
                            className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        />
                    </motion.div>

                    <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            required
                            className="w-full pl-10 pr-12 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-glow relative overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Signing Up...
                            </div>
                        ) : (
                            <span className="relative z-10">Sign Up</span>
                        )}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    </motion.button>
                </motion.form>

                {/* Sign In Link */}
                <motion.div 
                    className="text-center mt-8 text-white/70 text-lg"
                    variants={itemVariants}
                >
                    <p className="inline">Already have an account? </p>
                    <Link
                        to="/login"
                        className="text-pink-300 hover:text-pink-200 transition-colors font-medium relative group"
                    >
                        <span className="relative z-10">Sign In</span>
                        <motion.span
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-300"
                            whileHover={{ width: "100%" }}
                        />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;