import React from 'react';
import './chatlist.css';
import Adduser from './addUser/Adduser';

const Chatlist = () => {
    const [addMode, setAddMode] = React.useState(false);
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


            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            <div className="items">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>John Doe</span>
                    <p>hello</p>
                </div>
            </div>
            {addMode && <Adduser />}

        </div>
    );
}

export default Chatlist;