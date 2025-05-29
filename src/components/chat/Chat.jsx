import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';


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

    return (
        <div className=" min-h-screen bg-gradient-to-r from-pink-700 to-purple-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl w-full mx-4 shadow-lg border border-white/10 flex flex-col h-[94vh]">
                {/* Top Section: User Info */}
                <div className="p-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setChatId(null)}
                            className="md:hidden flex items-center text-white/70 hover:text-white transition-all duration-200"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back
                        </button>
                        <div className="flex items-center space-x-3">
                            <img
                                src={user?.avatar || "./avatar.png"}
                                alt="user avatar"
                                className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Section: Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                    {chat?.messages?.map((message, index) => {
                        const isOwnMessage = message.senderId === currentUser.id;
                        return (
                            <div
                                key={index}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${isOwnMessage
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                        : 'bg-white/20 text-white'
                                        }`}
                                >
                                    {message.img && (
                                        <div className="relative mb-2">
                                            <img
                                                src={message.img}
                                                alt="chat image"
                                                className="max-w-full rounded-lg"
                                            />
                                            <a
                                                href={message.img}
                                                download={`image_${message.createdAt?.seconds || Date.now()}.jpg`}
                                                className="absolute bottom-2 right-2 bg-white/30 hover:bg-white/50 text-white p-1 rounded-full text-sm transition-all duration-200"
                                            >
                                                ⬇
                                            </a>
                                        </div>
                                    )}
                                    {message.text && <p className="text-sm">{message.text}</p>}
                                    {message.createdAt?.seconds && (
                                        <div className="flex items-center justify-end mt-1 space-x-1">
                                            <span className="text-xs text-white/70">
                                                {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {isOwnMessage && (
                                                <span className={`text-xs ${message.isSeen ? 'text-blue-300' : 'text-white/50'}`}>
                                                    {message.isSeen ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {img.url && (
                        <div className="flex justify-end">
                            <div className="max-w-[70%] p-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                                <img src={img.url} alt="preview" className="max-w-full rounded-lg" />
                            </div>
                        </div>
                    )}

                    <div ref={endRef}></div>
                </div>

                {/* Bottom Section: Input */}
                <div className="p-4 border-t border-white/20">
                    <div className="flex items-center space-x-3">
                        <label htmlFor="file" className="cursor-pointer">
                            <svg
                                className="w-6 h-6 text-white/70 hover:text-white transition-all duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L17 10.828V15m0 0H9m6-8V3H3v18h18V7h-6z"
                                />
                            </svg>
                        </label>
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleImg}
                        />

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't send a message" : 'Type your message...'}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isCurrentUserBlocked || isReceiverBlocked}
                                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50"
                            />
                        </div>

                        <div className="relative">
                            <svg
                                onClick={() => setOpen((prev) => !prev)}
                                className="w-6 h-6 text-white/70 hover:text-white cursor-pointer transition-all duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="absolute bottom-12 right-0">
                                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={isCurrentUserBlocked || isReceiverBlocked}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;