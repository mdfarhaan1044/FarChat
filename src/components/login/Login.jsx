import React from 'react'
import './login.css'
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from "../../lib/firebase.js";
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload.js';



const Login = () => {
    const [avatar, setAvatar] = React.useState({

        file: null,
        url: "",
    });

    const [loading, setLoading] = React.useState(false);


    const handleAvatar = (e) => {
        if (e.target.files[0]) {

            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {

            await signInWithEmailAndPassword(auth, email, password);

        } catch (err) {
            console.log(err);
            toast.error(err.message);

        } finally {
            setLoading(false);
        }


    }
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);


        try {

            const res = await createUserWithEmailAndPassword(auth, email, password);

            let imgUrl = "";
            if (avatar.file) {
                imgUrl = await upload(avatar.file);
            }



            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userChats", res.user.uid), {
                chats: [],
            });

            toast.success("Account created successfully! You can login now.");


        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }

    }
    return (
        <div className="login">

            <div className="item">
                <h2>
                    Welcome Back,

                </h2>
                <form onSubmit={handleLogin} >
                    <input type="text" placeholder='email' name='email' />
                    <input type="password" placeholder='password' name='password' />
                    <button disabled={loading}> {loading ? "loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>
                    Create a new account,

                </h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an image</label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='username' name='username' />
                    <input type="text" placeholder='email' name='email' />
                    <input type="password" placeholder='password' name='password' />
                    <button disabled={loading} > {loading ? "loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login