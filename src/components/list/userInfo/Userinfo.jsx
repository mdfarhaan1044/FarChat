import React from 'react';
import './userinfo.css';
import { useUserStore } from '../../../lib/userStore';
import { auth, db } from '../../../lib/firebase';


const UserInfo = () => {

    const { currentUser } = useUserStore();
    return (
        <div className="userinfo">
            <div className='user'>

                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
                <div className='icons'>

                    <button className='logout' onClick={() => auth.signOut()}>Logout</button>

                    {/* <img src="./more.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./edit.png" alt="" /> */}
                </div>
            </div>
        </div>
    );
}

export default UserInfo;