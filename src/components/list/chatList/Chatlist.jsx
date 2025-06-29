import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Adduser from './addUser/Adduser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, MessageCircle, User } from 'lucide-react';

const Chatlist = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();
    const navigate = useNavigate();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
            const items = res.data()?.chats || [];

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
                const user = userDocSnap.data();

                return { ...item, user };
            });

            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => unSub();
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        changeChat(chat.chatId, chat.user);
        const userChats = chats.map(({ user, ...rest }) => rest);
        const chatIndex = userChats.findIndex((items) => items.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userChats", currentUser.id);
        try {
            await updateDoc(userChatsRef, { chats: userChats });
        } catch (err) {
            console.log(err);
        }
    };

    const filteredChats = chats.filter((c) =>
        c.user?.username?.toLowerCase().includes(input.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                type: "spring",
                stiffness: 200
            }
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
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full h-[75.7vh] overflow-y-auto custom-scrollbar mx-4 shadow-2xl border border-white/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
            >
                {/* Header */}
                <motion.div 
                    className="text-center mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MessageCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h1 
                        className="text-3xl font-bold text-white mb-2 neon-text"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Chat List
                    </motion.h1>
                    <p className="text-white/70 text-lg">Select a chat to start messaging</p>
                </motion.div>

                {/* Search Bar */}
                <motion.div 
                    className="flex items-center space-x-4 mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div 
                        className="flex-1 relative group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 pl-12 backdrop-blur-sm"
                        />
                        <Search className="w-5 h-5 text-white/50 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-pink-400 transition-colors" />
                    </motion.div>
                    <motion.button
                        onClick={() => setAddMode((prev) => !prev)}
                        className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 btn-glow"
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <AnimatePresence mode="wait">
                            {addMode ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-6 h-6 text-white" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Plus className="w-6 h-6 text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

                {/* Chat List */}
                <motion.div 
                    className="flex-1 space-y-3 overflow-y-auto pr-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {filteredChats.length === 0 ? (
                            <motion.div 
                                className="text-center text-white/70 mt-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <User className="w-10 h-10 text-white/50" />
                                </motion.div>
                                <p className="text-lg">No chats found.</p>
                                <p className="text-sm mt-2">Click <span className="text-pink-300 font-semibold">+</span> to add user and start chatting.</p>
                            </motion.div>
                        ) : (
                            filteredChats.map((chat, index) => (
                                <motion.div
                                    key={chat.chatId}
                                    onClick={() => handleSelect(chat)}
                                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                                        chat?.isSeen 
                                            ? 'bg-white/5 hover:bg-white/10' 
                                            : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40'
                                    }`}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                >
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <img
                                            src={chat.user?.avatar || "./avatar.png"}
                                            alt="user avatar"
                                            className="w-14 h-14 rounded-full border-2 border-white/20 object-cover mr-4 shadow-lg"
                                        />
                                        {!chat?.isSeen && (
                                            <motion.div
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, type: "spring" }}
                                            />
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <motion.span 
                                            className="text-white font-semibold text-lg block"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            {chat.user?.username}
                                        </motion.span>
                                        <motion.p 
                                            className="text-white/70 text-sm truncate"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                                        >
                                            {chat.lastMessage?.text || 'No messages yet'}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Add User */}
                <AnimatePresence>
                    {addMode && (
                        <motion.div 
                            className="mt-6 border-t border-white/20 pt-6"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Adduser onClose={() => setAddMode(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Chatlist;
