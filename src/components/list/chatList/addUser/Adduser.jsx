import React from 'react';
import { db } from '../../../../lib/firebase';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useUserStore } from '../../../../lib/userStore';

const Adduser = ({ onClose }) => {
    const [user, setUser] = React.useState(null);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg border border-teal-500/20 relative mt-24">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-teal-300 hover:text-teal-200 transition-all duration-200"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Add a User</h1>
                    <p className="text-teal-200 text-sm mt-1">Search for a user to start chatting</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-teal-500/30 text-white placeholder-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                    >
                        Search
                    </button>
                </form>

                {/* User Result */}
                {user && (
                    <div className="mt-6 border-t border-teal-500/20 pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.avatar || "./avatar.png"}
                                    alt="user avatar"
                                    className="w-12 h-12 rounded-full border-2 border-teal-500/20 object-cover"
                                />
                                <span className="text-white font-medium">{user.username}</span>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Adduser;