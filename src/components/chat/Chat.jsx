import React from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef } from 'react';
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
const Chat = () => {
    const [chat, setChat] = React.useState();
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [img, setImg] = React.useState({
        file: null,
        url: ""
    });
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, } = useChatStore();
    const { currentUser } = useUserStore();

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])


    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());

        });
        return () => {
            unSub();
        }
    }, [chatId])

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
    }, [chatId]);


    console.log(chat);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false)
    }

    const handleImg = (e) => {
        if (e.target.files[0]) {

            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleSend = async () => {
        if (text == "") return;

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

            userIDs.forEach(async (id) => {

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
            })

        } catch (err) {
            console.log(err);

        }

        setImg({
            file: null,
            url: ""
        });
        setText("");
    }



    return (
        <div className="chat">

            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <h2>{user?.username}</h2>
                        {/* <p>Lorem, ipsum dolor sit amet. </p> */}
                    </div>
                    <div className="icons">
                        {/* <img src="./phone.png" alt="" />
                        <img src="./video.png" alt="" />
                        <img src="./info.png" alt="" /> */}
                    </div>
                </div>

            </div>
            <div className="center">
                {chat?.messages.map((message, index) => {
                    const isOwnMessage = message.senderId === currentUser.id;
                    return (
                        <div className={isOwnMessage ? "message own" : "message"} key={index}>
                            <div className="texts">
                                {message.img && (
                                    <div className="image-wrapper">
                                        <img src={message.img} alt="" />
                                        <a
                                            href={message.img}
                                            download={`image_${message.createdAt?.seconds || Date.now()}.jpg`}
                                            className="download-btn"
                                        >
                                            ⬇
                                        </a>
                                    </div>
                                )}
                                {message.text && <p>{message.text}</p>}
                                {message.createdAt?.seconds && (
                                    <span className="time-seen">
                                        {new Date(message.createdAt?.seconds * 1000).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        {message.senderId === currentUser.id && (
                                            <span className={`ticks ${message.isSeen ? 'seen' : ''}`}>
                                                {message.isSeen ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </span>

                                )}
                            </div>
                        </div>
                    );
                })}



                {img.url && <div className="message own ">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}





                <div ref={endRef}></div>

            </div>
            <div className="bottom">

                <div className="icons">

                    <label htmlFor="file">


                        <img src="./img.png" alt="" />
                    </label>

                    <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
                    {/* <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" /> */}
                </div>

                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't send message" : 'Type your message...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked} />
                <div className="emoji">
                    <img src="./emoji.png" alt=""
                        onClick={() => setOpen((prev) => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>

                </div>

                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>




            </div>
        </div>
    );
}

export default Chat;