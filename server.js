const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Разрешить CORS
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Разрешить все домены
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('Пользователь подключен:', socket.id);

    // Создание комнаты
    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 8);
        rooms[roomId] = { players: [socket.id], board: Array(9).fill(null), turn: 'X' };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
    });

    // Присоединение к комнате
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            io.to(roomId).emit('gameStarted', rooms[roomId]);
        } else {
            socket.emit('roomFull');
        }
    });

    // Обработка хода
    socket.on('makeMove', (roomId, index) => {
        const room = rooms[roomId];
        if (room && room.players.includes(socket.id)) {
            if (room.board[index] === null) {
                room.board[index] = room.turn;
                room.turn = room.turn === 'X' ? 'O' : 'X';
                io.to(roomId).emit('moveMade', room.board, room.turn);
            }
        }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        console.log('Пользователь отключен:', socket.id);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players.includes(socket.id)) {
                room.players = room.players.filter(player => player !== socket.id);
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('playerLeft');
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});