// const express = require('express');

// const app = express();
// const http = require('http');
// const {Server} = require('socket.io') ;
// const server  = http.createServer(app);

// const io = new Server(server);
// const ACTIONS = require('./Actions');


// const userSocketMap = {};
// function getAllConnectedClients(roomId) {
//     Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
//         return {
//             socketId,
//             username: userSocketMap[socketId]
//         };
//     }); 
// }

// io.on('connection', (socket) => {
//     console.log('socket connected',socket.id);

//     socket.on(ACTIONS.JOIN, ({roomId, username}) => {
//         userSocketMap[socket.id] = username;
//         socket.join(roomId);
//         const clients  =  getAllConnectedClients(roomId);
//         clients.forEach(({socketId}) => {
//             io.to(socketId).emit(ACTIONS.JOINED, {
//                 clients,
//                 username,
//                 socketId: socket.id
//             });
//         });

//     });

//     socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
//         socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//     });
//     socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
//         socket.in(socketId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on('disconnect', () => {
//         const rooms = socket.rooms;
//         Array.from(rooms).forEach((roomId) => {
//             const clients = getAllConnectedClients(roomId);
//             clients.forEach(({socketId}) => {
//                 io.to(socketId).emit(ACTIONS.DISCONNECTED, {
//                     socketId: socket.id,
//                     username: userSocketMap[socket.id],
//                     clients
//                 });
//             });
//         });
//         delete userSocketMap[socket.id];
        
//     });

// });


// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ACTIONS from './src/Actions.js'; // Note: include `.js`
// if using ES modules
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build')); // Serve static files from the build directory'
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build','index.html'));
    
    });
const userSocketMap = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
        socketId,
        username: userSocketMap[socketId],
    }));
}

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
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
