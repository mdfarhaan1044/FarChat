import React, { useEffect } from 'react';
import './chatlist.css';
import Adduser from './addUser/Adduser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const Chatlist = () => {
    const [chats, setChats] = React.useState([]);
    const [addMode, setAddMode] = React.useState(false);

    const { currentUser } = useUserStore();
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

    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder='Search' />

                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className='add'
                    onClick={() => setAddMode((prev) => !prev)} />

            </div>


            {chats.map((chat) => (

                <div className="items">
                    <img src="./avatar.png" alt="" key={chat.chatId} />
                    <div className="texts">
                        <span>john doe</span>
                        <p>{chat.lastMessage?.text}</p>
                    </div>
                </div>
            ))}

            {addMode && <Adduser />}

        </div>
    );
}


export default Chatlist;