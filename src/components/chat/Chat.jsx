import React from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef } from 'react';
const Chat = () => {

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false)
    }



    return (
        <div className="chat">

            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <h2>John Doe</h2>
                        <p>Lorem, ipsum dolor sit amet. </p>
                    </div>
                    <div className="icons">
                        <img src="./phone.png" alt="" />
                        <img src="./video.png" alt="" />
                        <img src="./info.png" alt="" />
                    </div>
                </div>

            </div>
            <div className="center">
                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quis quia quos blanditiis quod voluptatibus, veniam nulla accusantium cupiditate omnis at eos ratione, nostrum id. Aspernatur suscipit molestias labore tempore.

                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>

                <div className="message own">


                    <div className="texts">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUPIfiGgUML8G3ZqsNLHfaCnZK3I5g4tJabQ&s" alt="" />
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quis quia quos blanditiis quod voluptatibus, veniam nulla accusantium cupiditate omnis at eos ratione, nostrum id. Aspernatur suscipit molestias labore tempore.

                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>

                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quis quia quos blanditiis quod voluptatibus, veniam nulla accusantium cupiditate omnis at eos ratione, nostrum id. Aspernatur suscipit molestias labore tempore.

                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>

                <div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quis quia quos blanditiis quod voluptatibus, veniam nulla accusantium cupiditate omnis at eos ratione, nostrum id. Aspernatur suscipit molestias labore tempore.

                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>

                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quis quia quos blanditiis quod voluptatibus, veniam nulla accusantium cupiditate omnis at eos ratione, nostrum id. Aspernatur suscipit molestias labore tempore.

                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>

                <div ref={endRef}></div>

            </div>
            <div className="bottom">

                <div className="icons">
                    <img src="./img.png" alt="" />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>

                <input type="text" placeholder='Type your message...'
                    value={text}
                    onChange={(e) => setText(e.target.value)} />
                <div className="emoji">
                    <img src="./emoji.png" alt=""
                        onClick={() => setOpen((prev) => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>

                </div>

                <button className='sendButton'>Send</button>




            </div>
        </div>
    );
}

export default Chat;