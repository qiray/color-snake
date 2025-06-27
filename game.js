const BOARD_SIZE = 20;
const CELL_SIZE = 15;
const COLORS = {
    RED: { emoji: '🔴', effect: 'speed' },
    BLUE: { emoji: '🔵', effect: 'health' },
    GREEN: { emoji: '🟢', effect: 'growth' },
    YELLOW: { emoji: '🟡', effect: 'invincible' }
};

let snake = [{ x: 10, y: 10 }];
let food = spawnFood();
let direction = 'RIGHT';
let gameInterval;
let snakeColor = COLORS.GREEN;
let hp = 5;   
let invincible = false;

// Инициализация игры
function init() {
    document.addEventListener('keydown', handleKeyPress);
    gameInterval = setInterval(gameLoop, 200);
    updateStats();

    // Обработчик кнопки рестарта
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        resetGame();
    });
}
    
// Главный цикл
function gameLoop() {
    moveSnake();
    checkCollision();
    checkFood();
    applyColorEffect();
    render();
}

// Движение змейки
function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }

    snake.unshift(head);
    snake.pop();
}

// Проверка столкновений
function checkCollision() {
    const head = snake[0];

    // Стены
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        gameOver();
    }

    // Сама в себя
    if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        if (!invincible) gameOver();
    }
}

// Проверка еды
function checkFood() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        snake.push({ ...snake[snake.length - 1] }); // Рост
        snakeColor = food.color;
        food = spawnFood();
        updateStats();
    }
}

// Эффекты цвета
function applyColorEffect() {
    switch (snakeColor.effect) {
        case 'speed':
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 100);
            hp -= 1;
            break;
        case 'health':
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 300);
            hp += 1;
            break;
        case 'invincible':
            invincible = true;
            setTimeout(() => invincible = false, 5000);
            break;
    }
    if (hp <= 0) gameOver();
}

// Генерация еды
function spawnFood() {
    const colors = Object.values(COLORS);
    const color = colors[Math.floor(Math.random() * colors.length)];
    let foodPos;
    do {
        foodPos = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
            color: color
        };
    } while (snake.some(segment => segment.x === foodPos.x && segment.y === foodPos.y));
    return foodPos;
}

// Отрисовка
function render() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // Змейка
    snake.forEach((segment, index) => {
        const cell = document.createElement('div');
        cell.className = 'cell snake';
        cell.style.backgroundColor = getColorHex(snakeColor.emoji);
        cell.style.gridColumnStart = segment.x + 1;
        cell.style.gridRowStart = segment.y + 1;
        board.appendChild(cell);
    });

    // Еда
    const foodCell = document.createElement('div');
    foodCell.className = 'cell food';
    foodCell.style.backgroundColor = getColorHex(food.color.emoji);
    foodCell.style.gridColumnStart = food.x + 1;
    foodCell.style.gridRowStart = food.y + 1;
    board.appendChild(foodCell);
}

// Управление
function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') direction = 'UP'; break;
        case 'ArrowDown': if (direction !== 'UP') direction = 'DOWN'; break;
        case 'ArrowLeft': if (direction !== 'RIGHT') direction = 'LEFT'; break;
        case 'ArrowRight': if (direction !== 'LEFT') direction = 'RIGHT'; break;
    }
}

// Статистика
function updateStats() {
    document.getElementById('length').textContent = snake.length;
    document.getElementById('hp').textContent = hp;
    document.getElementById('color').textContent = snakeColor.emoji;
}

// Конец игры
function gameOver() {
    clearInterval(gameInterval);
    
    // Показываем кастомное окно
    document.getElementById('final-score').textContent = `Длина: ${snake.length}`;
    document.getElementById('final-color').style.backgroundColor = getColorHex(snakeColor.emoji);
    document.getElementById('game-over-modal').classList.remove('hidden');
}

// Сброс
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'RIGHT';
    hp = 5;
    snakeColor = COLORS.GREEN;
    food = spawnFood();
    gameInterval = setInterval(gameLoop, 200);
    updateStats();
}

// Цвет в HEX (упрощенно)
function getColorHex(emoji) {
    const colors = {
        '🔴': '#ff0000',
        '🔵': '#0000ff',
        '🟢': '#00ff00',
        '🟡': '#ffff00'
    };
    return colors[emoji];
}

// Старт
init();
