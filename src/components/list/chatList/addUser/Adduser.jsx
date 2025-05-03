import './addUser.css';
import { db } from '../../../../lib/firebase';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import React from 'react';
import { useUserStore } from '../../../../lib/userStore';


const Adduser = () => {
    const [user, setUser] = React.useState(null);

    const { currentUser } = useUserStore();


    const handleSearch = async (e) => {
        e.preventDefault();
        const fromData = new FormData(e.target);
        const username = fromData.get('username');

        try {
            const userRef = collection(db, 'users');

            const q = query(userRef, where('username', '==', username));

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            }
        } catch (err) {
            console.log(err);
        }
    }


    const handleAdd = async () => {

        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userChats");


        try {

            const newChartRef = doc(chatRef);

            await setDoc(newChartRef, {
                createdAt: serverTimestamp(),
                messages: [],

            })


            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChartRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })

            })
            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChartRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })

            })
        } catch (err) {
            console.log(err);

        }
    }
    return (
        <div className="adduser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name='username' />
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>

                </div>
                <button onClick={handleAdd}>
                    Add user
                </button>
            </div>}

        </div>
    )
}

export default Adduser