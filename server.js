import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ACTIONS from './src/Actions.js';


// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

// Serve static React files from build folder
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ All routes should go to React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// app.use(express.static(path.resolve("./pages")));
// app.get('/editor/:roomId',(req,res)=>{
//   return res.sendFile("/realtimecode/src/pages/EditorPages.jsx");
// });


// app.get('/',(req,res)=>{
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Get all connected clients in a room
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnect', () => {
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

    rooms.forEach((roomId) => {
      const clients = getAllConnectedClients(roomId);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id],
          clients,
        });
      });
    });

    delete userSocketMap[socket.id];
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
