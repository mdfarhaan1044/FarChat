import React from 'react';
import { useUserStore } from '../../../lib/userStore';
import { auth } from '../../../lib/firebase';

const UserInfo = () => {
    const { currentUser } = useUserStore();

    return (
        <div className=" w-full h-full bg-gradient-to-r from-purple-900 to-pink-700 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg border border-white/10">
                {/* User Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <img
                            src={currentUser.avatar || "./avatar.png"}
                            alt="user avatar"
                            className="w-14 h-14 rounded-full border-2 border-white/20 object-cover"
                        />
                        <h2 className="text-2xl font-semibold text-white">{currentUser.username}</h2>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;