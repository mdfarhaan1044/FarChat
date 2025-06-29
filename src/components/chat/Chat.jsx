import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Smile, ArrowLeft, Download } from 'lucide-react';

const Chat = () => {
    const setChatId = useChatStore((state) => state.setChatId);
    const [chat, setChat] = React.useState();
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [img, setImg] = React.useState({
        file: null,
        url: ""
    });
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => {
            unSub();
        };
    }, [chatId]);

    useEffect(() => {
        const markSeen = async () => {
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) return;

            const data = chatSnap.data();
            let updated = false;

            const updatedMessages = data.messages.map((m) => {
                if (!m.isSeen && m.senderId !== currentUser.id) {
                    updated = true;
                    return { ...m, isSeen: true };
                }
                return m;
            });

            if (updated) {
                await updateDoc(chatRef, { messages: updatedMessages });
            }
        };

        if (chatId) markSeen();
    }, [chatId, currentUser.id]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    isSeen: false,
                    ...(imgUrl && { img: imgUrl }),
                })
            });

            if (!user || !user.id) {
                console.error("User is undefined or missing ID.");
                return;
            }

            const userIDs = [currentUser.id, user.id];

            for (const id of userIDs) {
                const userChatsRef = doc(db, "userChats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = {
                        text: text,
                        senderId: currentUser.id,
                    };
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            }
        } catch (err) {
            console.log(err);
        }

        setImg({
            file: null,
            url: ""
        });
        setText("");
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
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
            className="min-h-screen animated-bg flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="glass rounded-3xl w-full mx-4 shadow-2xl border border-white/20 flex flex-col h-[94vh] backdrop-blur-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
            >
                {/* Top Section: User Info */}
                <motion.div 
                    className="p-6 border-b border-white/20"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <motion.button
                            onClick={() => setChatId(null)}
                            className="md:hidden flex items-center text-white/70 hover:text-white transition-all duration-200 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </motion.button>
                        <motion.div 
                            className="flex items-center space-x-4"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <motion.div
                                className="relative avatar-pulse"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img
                                    src={user?.avatar || "./avatar.png"}
                                    alt="user avatar"
                                    className="w-14 h-14 rounded-full border-2 border-white/20 object-cover shadow-lg"
                                />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold text-white neon-text">{user?.username}</h2>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-white/60 text-sm">Online</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Center Section: Messages */}
                <motion.div 
                    className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <AnimatePresence>
                        {chat?.messages?.map((message, index) => {
                            const isOwnMessage = message.senderId === currentUser.id;
                            return (
                                <motion.div
                                    key={index}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    layout
                                >
                                    <motion.div
                                        className={`max-w-[70%] p-4 rounded-2xl message-bubble ${
                                            isOwnMessage
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                                : 'bg-white/20 text-white backdrop-blur-sm shadow-lg'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {message.img && (
                                            <motion.div 
                                                className="relative mb-3"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <img
                                                    src={message.img}
                                                    alt="chat image"
                                                    className="max-w-full rounded-xl shadow-md"
                                                />
                                                <motion.a
                                                    href={message.img}
                                                    download={`image_${message.createdAt?.seconds || Date.now()}.jpg`}
                                                    className="absolute bottom-3 right-3 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full text-sm transition-all duration-200 backdrop-blur-sm"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </motion.a>
                                            </motion.div>
                                        )}
                                        {message.text && (
                                            <motion.p 
                                                className="text-sm leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                            >
                                                {message.text}
                                            </motion.p>
                                        )}
                                        {message.createdAt?.seconds && (
                                            <motion.div 
                                                className="flex items-center justify-end mt-2 space-x-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.2 }}
                                            >
                                                <span className="text-xs text-white/70">
                                                    {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {isOwnMessage && (
                                                    <motion.span 
                                                        className={`text-xs ${message.isSeen ? 'text-blue-300' : 'text-white/50'}`}
                                                        animate={message.isSeen ? { scale: [1, 1.2, 1] } : {}}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {message.isSeen ? '✓✓' : '✓'}
                                                    </motion.span>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {img.url && (
                        <motion.div 
                            className="flex justify-end"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="max-w-[70%] p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
                                <img src={img.url} alt="preview" className="max-w-full rounded-xl" />
                            </div>
                        </motion.div>
                    )}

                    <div ref={endRef}></div>
                </motion.div>

                {/* Bottom Section: Input */}
                <motion.div 
                    className="p-6 border-t border-white/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="flex items-center space-x-4">
                        <motion.label 
                            htmlFor="file" 
                            className="cursor-pointer"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Image className="w-6 h-6 text-white/70 hover:text-white transition-all duration-200" />
                        </motion.label>
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleImg}
                        />

                        <div className="flex-1 relative">
                            <motion.input
                                type="text"
                                placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't send a message" : 'Type your message...'}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isCurrentUserBlocked || isReceiverBlocked}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 backdrop-blur-sm"
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>

                        <motion.div className="relative">
                            <motion.button
                                onClick={() => setOpen((prev) => !prev)}
                                className="text-white/70 hover:text-white transition-all duration-200"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Smile className="w-6 h-6" />
                            </motion.button>
                            <AnimatePresence>
                                {open && (
                                    <motion.div 
                                        className="absolute bottom-12 right-0"
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.button
                            onClick={handleSend}
                            disabled={isCurrentUserBlocked || isReceiverBlocked}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Chat;