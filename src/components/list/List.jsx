import React from 'react';

import Chatlist from './chatList/Chatlist';
import Userinfo from './userInfo/Userinfo';

const List = () => {
    return (
        <div className="flex flex-col justify-center  flex-1 no-scrollbar overflow-hidden ">
            <Userinfo />
            <Chatlist />
        </div>
    );
}

export default List;
