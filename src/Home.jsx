import React ,{ useState }from 'react'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'


const Home = () => {        
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid()
    
    setRoomId(id);
    toast.success('New room created');

    };
    const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId || !username) {
        toast.error('Room ID and username are required');
        return;
    }

    navigate(`/editor/${roomId}`, {
        state: {
            username,
        },
    });

};
const handleInput = (e) => {
    if (e.code === 'Enter') {
        joinRoom(e);
    }
};



  return (
    <div className="homePagewrapper">
        <div className="fromwrapper">
            <img className='logo' src="/code-sync.png" alt="code-sync-logo" />
            <h4 className='mainLabel'>Paste invitation ROOM ID</h4>

            <div className='inputGroup'>
                <input 
                type="text" 
                placeholder="Room ID" 
                className='inputBox' 
                value={roomId}
                onKeyUp={handleInput}
                onChange={(e) => setRoomId(e.target.value)}
                />
                <input 
                type="text" 
                placeholder="USERNAME" 
                className='inputBox'
                value={username}
                onKeyUp={handleInput}
                onChange={(e) => setUsername(e.target.value)}
                 />
                <button className='joinBtn ' onClick={joinRoom}>Join</button>
                <span className='createInfo'>
                    If you don't have an invite then create a &nbsp;
                    <a onClick={createNewRoom} href="/editor" className='createNewBtn'>new room</a>
                </span>
            </div>
        </div>

        <footer>
            <h4>built with ❤️  &nbsp by  &nbsp {''}
                <a href="https://github.com/mahendra-chaudhary"> coder's gyan</a>

            </h4>
        </footer>
    </div>
  )
}

export default Home
