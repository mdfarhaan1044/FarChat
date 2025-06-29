import React from 'react';
import { db } from '../../../../lib/firebase';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useUserStore } from '../../../../lib/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, User, Check } from 'lucide-react';

const Adduser = ({ onClose }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const username = formData.get('username');

        try {
            const userRef = collection(db, 'users');
            const q = query(userRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            } else {
                setUser(null); // Reset user if no match is found
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userChats");

        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            });

            // Close the dialog after adding the user
            if (onClose) onClose();
        } catch (err) {
            console.log(err);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, type: "spring" }
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div 
                    className="glass rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 relative mt-24 backdrop-blur-xl"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Close Button */}
                    <motion.button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-white/10"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X className="w-6 h-6" />
                    </motion.button>

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
                            className="text-3xl font-bold text-white mb-2 neon-text"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Add a User
                        </motion.h1>
                        <p className="text-white/70 text-lg">Search for a user to start chatting</p>
                    </motion.div>

                    {/* Search Form */}
                    <motion.form onSubmit={handleSearch} className="space-y-6" variants={itemVariants}>
                        <motion.div
                            className="relative group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter username..."
                                name="username"
                                className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                            />
                        </motion.div>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Searching...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Search className="w-5 h-5 mr-2" />
                                    Search
                                </div>
                            )}
                        </motion.button>
                    </motion.form>

                    {/* User Result */}
                    <AnimatePresence>
                        {user && (
                            <motion.div 
                                className="mt-8 border-t border-white/20 pt-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <motion.div 
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            className="relative"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <img
                                                src={user.avatar || "./avatar.png"}
                                                alt="user avatar"
                                                className="w-14 h-14 rounded-full border-2 border-white/20 object-cover shadow-lg"
                                            />
                                            <motion.div
                                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>
                                        <div>
                                            <motion.span 
                                                className="text-white font-semibold text-lg block"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {user.username}
                                            </motion.span>
                                            <span className="text-white/60 text-sm">Available for chat</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={handleAdd}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 btn-glow flex items-center space-x-2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Check className="w-5 h-5" />
                                        <span>Add</span>
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* No User Found */}
                    {user === null && (
                        <motion.div 
                            className="mt-8 text-center text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <User className="w-8 h-8 text-white/50" />
                            </motion.div>
                            <p className="text-lg">No user found</p>
                            <p className="text-sm mt-2">Try searching with a different username</p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Adduser;