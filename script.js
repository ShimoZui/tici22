const socket = io('https://your-server-url'); // Замените на URL вашего сервера

const menu = document.getElementById('menu');
const game = document.getElementById('game');
const boardDiv = document.querySelector('.board');
const turnText = document.getElementById('turn');
const roomIdInput = document.getElementById('roomId');

let roomId;
let currentTurn = 'X';

// Создание комнаты
document.getElementById('createRoom').addEventListener('click', () => {
    socket.emit('createRoom');
});

// Присоединение к комнате
document.getElementById('joinRoom').addEventListener('click', () => {
    const roomId = roomIdInput.value;
    if (roomId) {
        socket.emit('joinRoom', roomId);
    }
});

// Обработка событий
socket.on('roomCreated', (id) => {
    roomId = id;
    alert(`Комната создана! Код комнаты: ${id}`);
    menu.style.display = 'none';
    game.style.display = 'block';
    initBoard();
});

socket.on('gameStarted', (room) => {
    menu.style.display = 'none';
    game.style.display = 'block';
    initBoard();
    updateBoard(room.board);
    updateTurn(room.turn);
});

socket.on('moveMade', (board, turn) => {
    updateBoard(board);
    updateTurn(turn);
});

socket.on('roomFull', () => {
    alert('Комната заполнена!');
});

socket.on('playerLeft', () => {
    alert('Соперник вышел из игры!');
    resetGame();
});

// Инициализация доски
function initBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.addEventListener('click', () => makeMove(i));
        boardDiv.appendChild(cell);
    }
}

// Обновление доски
function updateBoard(board) {
    board.forEach((value, index) => {
        boardDiv.children[index].textContent = value;
    });
}

// Обновление хода
function updateTurn(turn) {
    currentTurn = turn;
    turnText.textContent = `Сейчас ходит: ${turn}`;
}

// Сделать ход
function makeMove(index) {
    socket.emit('makeMove', roomId, index);
}

// Сброс игры
function resetGame() {
    menu.style.display = 'block';
    game.style.display = 'none';
    boardDiv.innerHTML = '';
    turnText.textContent = '';
}