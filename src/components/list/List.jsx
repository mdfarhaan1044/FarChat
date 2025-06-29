import React from 'react';
import { motion } from 'framer-motion';
import Chatlist from './chatList/Chatlist';
import Userinfo from './userInfo/Userinfo';

const List = () => {
    const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, type: "spring" }
        }
    };

    return (
        <motion.div 
            className="flex flex-col justify-center flex-1 no-scrollbar overflow-hidden glass rounded-3xl m-4 backdrop-blur-xl border border-white/20 shadow-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <Userinfo />
            </motion.div>
            <motion.div variants={itemVariants}>
                <Chatlist />
            </motion.div>
        </motion.div>
    );
}

export default List;
