import List from "./components/list/list"
import Detail from "./components/detail/detail"
import Chat from "./components/chat/Chat"
import Login from "./components/login/Login";
import Notification from "./components/notifications/Notifications";

const App = () => {

  const user = false;
  return (
    <div className='container'>

      {user ? (
        <>
          <List />
          <Chat />
          <Detail />


        </>



      ) : <Login />}
      <Notification />
    </div>

  )
}

export default App