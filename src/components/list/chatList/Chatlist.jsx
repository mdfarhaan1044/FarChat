import React, { useEffect } from 'react';
import './chatlist.css';
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

        const userChats = chats.map((items) => {
            const { user, ...rest } = items;
            return rest;

        });
        const chatIndex = userChats.findIndex((items) => items.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userChats", currentUser.id);
        try {

            await updateDoc(userChatsRef, { chats: userChats });

            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);

        }


    }

    const filteredChats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder='Search' onChange={(e) => setInput(e.target.value)} />

                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className='add'
                    onClick={() => setAddMode((prev) => !prev)} />

            </div>


            {filteredChats.map((chat) => (

                <div className="items" key={chat.chatId} onClick={() => handleSelect(chat)}
                    style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
                >
                    <img src={chat.user.avatar || "./avatar.png"} alt="" key={chat.chatId} />
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage.text}</p>
                    </div>
                </div>
            ))}

            {addMode && <Adduser />}




        </div>
    );
}


export default Chatlist;