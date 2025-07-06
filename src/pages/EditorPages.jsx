
import React, { useEffect, useState, useRef } from 'react';
import Client from '../components/Client';
import { toast } from 'react-hot-toast';
import Editor from '../components/Editor.jsx';
import { initSocket } from '../socket';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import ACTIONS from '../Actions';

const EditorPages = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const codeRef = useRef(null);
  const { roomId } = useParams();
  const reactNavigate = useNavigate();
  const [clients, setClients] = useState([]);
//   const username = location.state?.username || localStorage.getItem('username');




  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', handleError);
      socketRef.current.on('connect_failed', handleError);

      function handleError(e) {
        console.error('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigate('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} has joined the room.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.error(`${username} has left the room.`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  const leaveRoom = () => {
    reactNavigate('/');
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy Room ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPages;
