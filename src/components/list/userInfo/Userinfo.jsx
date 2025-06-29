import React from 'react';
import { useUserStore } from '../../../lib/userStore';
import { auth } from '../../../lib/firebase';
import { motion } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';

const UserInfo = () => {
    const { currentUser } = useUserStore();

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, type: "spring" }
        }
    };

    return (
        <motion.div 
            className="w-full flex justify-center p-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full mx-4 shadow-2xl border border-white/20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* User Info */}
                <div className="flex items-center justify-between mb-6">
                    <motion.div 
                        className="flex items-center space-x-4"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="relative avatar-pulse"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <img
                                src={currentUser.avatar || "./avatar.png"}
                                alt="user avatar"
                                className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shadow-lg"
                            />
                            <motion.div
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                        <div>
                            <motion.h2 
                                className="text-2xl font-bold text-white neon-text"
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                {currentUser.username}
                            </motion.h2>
                            <motion.div 
                                className="flex items-center space-x-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-white/60 text-sm">Online</span>
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="flex items-center space-x-3"
                        variants={itemVariants}
                    >
                        <motion.button
                            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Settings className="w-5 h-5 text-white/70" />
                        </motion.button>
                        <motion.button
                            onClick={() => auth.signOut()}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 btn-glow flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </motion.button>
                    </motion.div>
                </div>

                {/* User Stats */}
                <motion.div 
                    className="grid grid-cols-3 gap-4"
                    variants={itemVariants}
                >
                    <motion.div 
                        className="bg-white/5 rounded-xl p-4 text-center backdrop-blur-sm border border-white/10"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="text-2xl font-bold text-white mb-1"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            12
                        </motion.div>
                        <div className="text-white/60 text-sm">Chats</div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/5 rounded-xl p-4 text-center backdrop-blur-sm border border-white/10"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="text-2xl font-bold text-white mb-1"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            156
                        </motion.div>
                        <div className="text-white/60 text-sm">Messages</div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/5 rounded-xl p-4 text-center backdrop-blur-sm border border-white/10"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="text-2xl font-bold text-white mb-1"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                            8
                        </motion.div>
                        <div className="text-white/60 text-sm">Online</div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default UserInfo;