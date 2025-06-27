// Константы игры
const BOARD_SIZE = 20;
const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    PORTAL: 2
};

const FOOD_TYPES = {
    RED: { class: 'food-red', effect: 'shorten' },
    BLUE: { class: 'food-blue', effect: 'freeze' },
    GREEN: { class: 'food-green', effect: 'grow' },
    YELLOW: { class: 'food-yellow', effect: 'teleport' }
};

// Состояние игры
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let map = [];
let foods = [];
let level = 1;
let score = 0;
let gameInterval;
let isPaused = false;
let frozenWalls = false;

// Инициализация игры
function init() {
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('restart-button').addEventListener('click', startNewGame);
    startNewGame();
}

// Новая игра
function startNewGame() {
    level = 1;
    score = 0;
    document.getElementById('game-over-modal').classList.add('hidden');
    startLevel();
}

// Запуск уровня
function startLevel() {
    clearInterval(gameInterval);
    
    // Генерация лабиринта
    map = generateMaze();
    
    // Размещение змейки
    snake = [{x: 1, y: 1}];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    
    // Размещение фруктов
    const foodCount = 3 + Math.floor(level * 0.5);
    spawnFood(foodCount);
    
    // Размещение портала
    placePortal();
    
    updateStats();
    render();
    
    // Запуск игрового цикла
    gameInterval = setInterval(gameLoop, 150);
}

// Генерация лабиринта
function generateMaze() {
    return Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(CELL_TYPES.EMPTY));
    const maze = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(CELL_TYPES.WALL));
    
    // Алгоритм Prim's для генерации лабиринта
    const walls = [];
    const start = {x: 1, y: 1};
    maze[start.y][start.x] = CELL_TYPES.EMPTY;
    
    function addWalls(x, y) {
        const directions = [[0,2],[2,0],[0,-2],[-2,0]];
        directions.forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < BOARD_SIZE-1 && ny > 0 && ny < BOARD_SIZE-1 && maze[ny][nx] === CELL_TYPES.WALL) {
                walls.push({x: x + dx/2, y: y + dy/2, nx, ny});
            }
        });
    }
    
    addWalls(start.x, start.y);
    
    while (walls.length > 0) {
        const randomIdx = Math.floor(Math.random() * walls.length);
        const wall = walls.splice(randomIdx, 1)[0];
        
        if (maze[wall.ny][wall.nx] === CELL_TYPES.WALL) {
            maze[wall.y][wall.x] = CELL_TYPES.EMPTY;
            maze[wall.ny][wall.nx] = CELL_TYPES.EMPTY;
            addWalls(wall.nx, wall.ny);
        }
    }
    
    return maze;
}

// Размещение фруктов
function spawnFood(count) {
    for (let i = 0; i < count; i++) {
        const foodTypes = Object.values(FOOD_TYPES);
        const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        
        let x, y;
        do {
            x = Math.floor(Math.random() * BOARD_SIZE);
            y = Math.floor(Math.random() * BOARD_SIZE);
        } while (
            snake.some(segment => segment.x === x && segment.y === y) ||
            foods.some(food => food.x === x && food.y === y)
        );
        
        foods.push({ x, y, type });
    }
    updateFruitsLeft();
}

// Размещение портала
function placePortal() {
    // Удаляем старый портал
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (map[y][x] === CELL_TYPES.PORTAL) {
                map[y][x] = CELL_TYPES.EMPTY;
            }
        }
    }
    
    // Ищем место для портала (в дальнем углу)
    let x = BOARD_SIZE - 2;
    let y = BOARD_SIZE - 2;
    
    // Проверяем, что клетка свободна
    if (map[y][x] === CELL_TYPES.EMPTY && !foods.some(f => f.x === x && f.y === y)) {
        map[y][x] = CELL_TYPES.PORTAL;
    } else {
        // Если угол занят, ищем ближайшую свободную клетку
        let placed = false;
        for (let radius = 1; radius < 5 && !placed; radius++) {
            for (let dy = -radius; dy <= radius && !placed; dy++) {
                for (let dx = -radius; dx <= radius && !placed; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx > 0 && nx < BOARD_SIZE-1 && ny > 0 && ny < BOARD_SIZE-1 && 
                        map[ny][nx] === CELL_TYPES.EMPTY && 
                        !foods.some(f => f.x === nx && f.y === ny)) {
                        map[ny][nx] = CELL_TYPES.PORTAL;
                        placed = true;
                    }
                }
            }
        }
    }
}

// Игровой цикл
function gameLoop() {
    if (isPaused) return;
    
    direction = nextDirection;
    moveSnake();
    
    if (checkCollision()) {
        return gameOver();
    }
    
    checkFood();
    checkPortal();
    render();
}

// Движение змейки
function moveSnake() {
    const head = {...snake[0]};
    
    switch (direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }
    
    snake.unshift(head);
    
    // Проверяем, съели ли фрукт (хвост не удаляем если съели фрукт)
    const ateFood = foods.some((food, index) => {
        if (food.x === head.x && food.y === head.y) {
            applyFoodEffect(food.type);
            foods.splice(index, 1);
            updateFruitsLeft();
            return true;
        }
        return false;
    });
    
    if (!ateFood) {
        snake.pop();
    }
}

// Проверка столкновений
function checkCollision() {
    const head = snake[0];
    
    // Стены
    if (map[head.y][head.x] === CELL_TYPES.WALL && !frozenWalls) {
        return true;
    }
    
    // Сама в себя
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    // Границы
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        return true;
    }
    
    return false;
}

// Проверка портала
function checkPortal() {
    if (foods.length > 0) return;
    
    const head = snake[0];
    if (map[head.y][head.x] === CELL_TYPES.PORTAL) {
        level++;
        score += level * snake.length * 10;
        startLevel();
    }
}

// Применение эффектов фруктов
function applyFoodEffect(type) {
    score += 10 * level;
    
    switch(type.effect) {
        case 'shorten':
            if (snake.length > 2) {
                snake.pop();
                updateStats();
            }
            break;
            
        case 'freeze':
            frozenWalls = true;
            setTimeout(() => {
                frozenWalls = false;
                addLog("Стены снова твердые!");
            }, 5000);
            addLog("Стены заморожены!");
            break;
            
        case 'grow':
            snake.push({...snake[snake.length-1]});
            break;
            
        case 'teleport':
            const head = snake[0];
            let newX, newY;
            do {
                newX = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;
                newY = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;
            } while (
                map[newY][newX] === CELL_TYPES.WALL || 
                snake.some(seg => seg.x === newX && seg.y === newY)
            );
            
            snake[0].x = newX;
            snake[0].y = newY;
            addLog("Телепорт!");
            break;
    }
    
    updateStats();
}

// Отрисовка игры
function render() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Отрисовка карты
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.gridColumnStart = x + 1;
            cell.style.gridRowStart = y + 1;
            
            if (map[y][x] === CELL_TYPES.WALL) {
                cell.classList.add('wall');
                if (frozenWalls) cell.style.opacity = '0.5';
            } else if (map[y][x] === CELL_TYPES.PORTAL) {
                cell.classList.add('portal');
            }
            
            board.appendChild(cell);
        }
    }
    
    // Отрисовка фруктов
    foods.forEach(food => {
        const cell = document.createElement('div');
        cell.className = `cell ${food.type.class}`;
        cell.style.gridColumnStart = food.x + 1;
        cell.style.gridRowStart = food.y + 1;
        board.appendChild(cell);
    });
    
    // Отрисовка змейки
    snake.forEach((segment, index) => {
        const cell = document.createElement('div');
        cell.className = 'cell snake';
        if (index === 0) cell.classList.add('snake-head');
        cell.style.gridColumnStart = segment.x + 1;
        cell.style.gridRowStart = segment.y + 1;
        board.appendChild(cell);
    });
}

// Управление
function handleKeyPress(e) {
    if (e.key === ' ' && !isPaused) {
        isPaused = true;
        addLog("Игра на паузе");
        return;
    } else if (e.key === ' ' && isPaused) {
        isPaused = false;
        addLog("Игра продолжается");
        return;
    }
    
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') nextDirection = 'UP'; break;
        case 'ArrowDown': if (direction !== 'UP') nextDirection = 'DOWN'; break;
        case 'ArrowLeft': if (direction !== 'RIGHT') nextDirection = 'LEFT'; break;
        case 'ArrowRight': if (direction !== 'LEFT') nextDirection = 'RIGHT'; break;
    }
}

// Обновление статистики
function updateStats() {
    document.getElementById('level').textContent = level;
    document.getElementById('length').textContent = snake.length;
    document.getElementById('score').textContent = score;
}

function updateFruitsLeft() {
    document.getElementById('fruits-left').textContent = foods.length;
}

// Конец игры
function gameOver() {
    clearInterval(gameInterval);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

// Логирование
function addLog(message) {
    console.log(message); // Можно заменить на отображение в UI
}

// Запуск игры
init();
