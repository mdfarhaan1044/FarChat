import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Adduser from './addUser/Adduser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const Chatlist = () => {
    const [chats, setChats] = React.useState([]);
    const [addMode, setAddMode] = React.useState(false);
    const [input, setInput] = React.useState("");

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();
    const navigate = useNavigate();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
            const items = res.data().chats;

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
                const user = userDocSnap.data();

                return { ...item, user };
            });

            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        changeChat(chat.chatId, chat.user);
        const userChats = chats.map((items) => {
            const { user, ...rest } = items;
            return rest;
        });
        const chatIndex = userChats.findIndex((items) => items.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userChats", currentUser.id);
        try {
            await updateDoc(userChatsRef, { chats: userChats });
        } catch (err) {
            console.log(err);
        }
    };

    const filteredChats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-700 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg border border-white/10">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Chat List</h1>
                    <p className="text-white/70 text-sm mt-1">Select a chat to start messaging</p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 pl-10"
                        />
                        <svg
                            className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <button
                        onClick={() => setAddMode((prev) => !prev)}
                        className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200"
                    >
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={addMode ? "M18 6L6 18M6 6l12 12" : "M12 4v16m8-8H4"}
                            />
                        </svg>
                    </button>
                </div>

                {/* Chat Items */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.chatId}
                            onClick={() => handleSelect(chat)}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${chat?.isSeen ? 'bg-white/5' : 'bg-blue-500/50'
                                } hover:bg-white/10`}
                        >
                            <img
                                src={chat.user.avatar || "./avatar.png"}
                                alt="user avatar"
                                className="w-12 h-12 rounded-full border-2 border-white/20 object-cover mr-3"
                            />
                            <div className="flex-1">
                                <span className="text-white font-medium">{chat.user.username}</span>
                                <p className="text-white/70 text-sm truncate">{chat.lastMessage?.text || 'No messages yet'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add User Component */}
                {addMode && (
                    <div className="mt-6 border-t border-white/20 pt-4">
                        <Adduser onClose={() => setAddMode(false)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chatlist;