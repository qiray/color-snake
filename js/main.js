
/**
 * Chameleon Snake Game - Core Logic
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */

function initGame() {
    updateCachedGrid()
    segmentThreshold = levelConfig.segmentThreshold;
    currentLevel = 1;
    initLevel();

    score = 0;
    combo = 0;
    gameSpeed = config.baseSpeed;
    timeStep = gameSpeed;          // синхронизируем шаг с текущей скоростью
    currentColor = '#00FF7F';
    loadRecords();
    updateScore();

    // Останавливаем предыдущий цикл, если был
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    gameActive = true;
    lastTimestamp = 0;
    accumulator = 0;
    rafId = requestAnimationFrame(gameLoopRAF);

    updateComboElementStyle("#ffcc00", '0 0 8px rgba(255, 204, 0, 0.8)');

    document.getElementById('resume-button').style.display = 'none';
    document.getElementById('start-button').style.display = 'inline-block';
}

// Генерация еды
function addNewFood(count) {
    const { gridSize } = getCachedGrid();

    for (let i = 0; i < count; i++) {
        let newFood;
        let overlapping;
        let attempts = 0;

        do {
            overlapping = false;
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize),
                color: colors[Math.floor(Math.random() * colors.length)]
            };

            // Проверка на змейку
            for (const segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    overlapping = true;
                    break;
                }
            }

            // Проверка на другие фрукты
            if (!overlapping) {
                for (const food of foods) {
                    if (food.x === newFood.x && food.y === newFood.y) {
                        overlapping = true;
                        break;
                    }
                }
            }

            attempts++;
            if (attempts > 100) {
                console.log("Не удалось разместить новый фрукт");
                break;
            }
        } while (overlapping);

        if (!overlapping) {
            foods.push(newFood);
        }
    }
}

// Игровой цикл
function gameLoopRAF(timestamp) {
    if (!gameActive) {
        // Если игра не активна, не продолжаем цикл
        rafId = null;
        return;
    }

    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        rafId = requestAnimationFrame(gameLoopRAF);
        return;
    }

    let delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Ограничиваем дельту, чтобы избежать слишком большого шага при долгой паузе
    if (delta > 200) delta = timeStep; // если вкладка была неактивна, пропускаем рывок

    accumulator += delta;

    // Фиксированный шаг: пока накоплено достаточно времени, двигаем змейку
    while (accumulator >= timeStep) {
        moveSnake();
        checkCollisions();
        accumulator -= timeStep;
    }

    // Отрисовываем всегда (можно оптимизировать, но для простоты оставим)
    drawGame();

    // Запрашиваем следующий кадр
    rafId = requestAnimationFrame(gameLoopRAF);
}

// Движение змейки
function moveSnake() {
    direction = nextDirection;
    const { gridSize, cellSize } = getCachedGrid();

    // Копируем голову
    const head = { ...snake[0] };

    // Двигаем голову
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Телепортация через стены
    if (head.x < 0) head.x = gridSize - 1;
    if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    if (head.y >= gridSize) head.y = 0;

    // Добавляем новую голову
    snake.unshift(head);

    // Проверяем, съели ли еду
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            handleFoodEaten(foods[i]);
            foods.splice(i, 1);
            const newFoodCount = 1 + Math.floor(Math.random() * 2);
            addNewFood(newFoodCount);
            foodEaten = true;
            break;
        }
    }

    if (!foodEaten) {
        snake.pop();
    }
}

// Обработка съедения еды
function handleFoodEaten(food) {
    // Проверка комбо
    if (food.color === currentColor) {
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        // Бонус за комбо
        const comboBonus = getComboBonus(combo);
        score += comboBonus;

        // Показ сообщения о комбо
        // showComboMessage(food.x, food.y, comboBonus, food.color);

        playSound("combo")
    } else {
        combo = 1;
        score += 10;
        playSound("eat")
    }

    // Обновляем текущий цвет
    currentColor = food.color;
    updateComboElementStyle(currentColor, `0 0 10px ${currentColor}`);
    updateScore();
    checkLevelUp();
}

// Проверка столкновений
function checkCollisions() {
    const head = snake[0];

    // Проверка столкновения с собой
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
}

// Отрисовка игры
function drawGame() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рассчитываем размеры
    const { gridSize, cellSize } = getCachedGrid();

    // Отрисовка сетки
    drawGrid(gridSize, cellSize);

    // Отрисовка змейки с новыми размерами
    for (let i = 0; i < snake.length; i++) {
        const color = i === 0 ? '#FFFFFF' : currentColor;
        const radius = cellSize / 2 - 1;

        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(
            snake[i].x * cellSize + cellSize / 2,
            snake[i].y * cellSize + cellSize / 2,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Глаза у головы
        if (i === 0) {
            ctx.fillStyle = '#000';
            let eyeOffsetX = 0;
            let eyeOffsetY = 0;

            switch (direction) {
                case 'up': eyeOffsetY = -3; break;
                case 'down': eyeOffsetY = 3; break;
                case 'left': eyeOffsetX = -3; break;
                case 'right': eyeOffsetX = 3; break;
            }

            ctx.beginPath();
            ctx.arc(
                snake[i].x * cellSize + cellSize / 2 + eyeOffsetX,
                snake[i].y * cellSize + cellSize / 2 + eyeOffsetY,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Отрисовка еды с новыми размерами
    for (const food of foods) {
        const radius = cellSize / 2 - 2;

        ctx.fillStyle = food.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Блик на фрукте
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(
            food.x * cellSize + cellSize / 2 - 3,
            food.y * cellSize + cellSize / 2 - 3,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Отрисовка сетки
function drawGrid(gridSize, cellSize) {
    ctx.strokeStyle = 'rgba(0, 100, 200, 0.2)';
    ctx.lineWidth = 0.5;

    // Вертикальные линии одним путем
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    ctx.stroke();

    // Горизонтальные линии
    ctx.beginPath();
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

// Показать сообщение о комбо
function showComboMessage(x, y, bonus, color) {
    const { cellSize } = getCachedGrid();
    const message = document.getElementById('combo-message');
    if (!message)
        return;
    // Останавливаем текущую анимацию и скрываем элемент
    message.classList.add('hidden');

    message.className = 'combo-message';
    message.textContent = `+${bonus} ${getTranslation("combo_message")} x${combo}!`;
    message.style.left = `${x * cellSize}px`;
    message.style.top = `${canvas.offsetTop + y * cellSize}px`;
    message.style.color = color;
    message.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

    message.classList.remove('hidden');

    setTimeout(() => {
        message.classList.add('hidden');
    }, 1500);
}

// Конец игры
function endGame() {
    playSound("gameOver");
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    gameActive = false;

    finalScoreElement.textContent = score;
    maxComboElement.textContent = maxCombo;

    gameOverScreen.classList.remove('hidden');
    gameOverlay.classList.remove('hidden');
    startScreen.classList.add('hidden');

    updateComboElementStyle("#ffcc00", '0 0 8px rgba(255, 204, 0, 0.8)');
}

function updateComboElementStyle(color, shadow) {
    comboElement.style.color = comboLabel.style.color = color;
    comboElement.style.textShadow = comboLabel.style.textShadow = shadow;
}

function showPopupMessage(title, message) {
    startScreen.classList.add('hidden');
    popupElement.classList.remove('hidden');
    popupHeaderElement.textContent = title;
    popupMessageElement.textContent = message;
}

// Новая функция паузы
function pauseGame() {
    if (gameActive) {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        gameActive = false;
        gameOverlay.classList.remove('hidden');
        startScreen.classList.remove('hidden');
        document.getElementById('resume-button').style.display = 'inline-block';
        document.getElementById('start-button').style.display = 'none';
    }
}

function resumeGame() {
    if (!gameActive) {
        gameOverlay.classList.add('hidden');
        startScreen.classList.add('hidden');
        gameActive = true;
        lastTimestamp = 0;           // сброс времени
        accumulator = 0;
        rafId = requestAnimationFrame(gameLoopRAF);
        document.getElementById('resume-button').style.display = 'none';
        document.getElementById('start-button').style.display = 'inline-block';
    }
}

function increaseSpeed(increase) {
    if (gameSpeed > levelConfig.maxSpeed) {
        gameSpeed = Math.max(levelConfig.maxSpeed, gameSpeed - increase);
        timeStep = gameSpeed;        // синхронизируем шаг с новой скоростью
        // Интервал больше не нужен, RAF сам подстроится
    }
}

// Проверка и переход на новый уровень
function checkLevelUp() {
    if (snake.length >= segmentThreshold) {
        levelUp();
    }
}

// Обработка перехода на новый уровень
function levelUp() {
    currentLevel++;
    // Показываем сообщение о новом уровне
    showLevelUpMessage();
    initLevel()
    updateScore()
    // Обновляем отображение уровня
    updateLevelDisplay();
    segmentThreshold += levelConfig.segmentThresholdIncrease
    increaseSpeed(levelConfig.speedIncrease);
}

// Показать сообщение о новом уровне
function showLevelUpMessage() {
    const head = snake[0];
    const { cellSize } = getCachedGrid();
    const x = head.x * cellSize;
    const y = head.y * cellSize;

    const message = document.createElement('div');
    message.className = 'combo-message';
    message.textContent = `${getTranslation("level_up")} ${currentLevel}!`;
    message.style.left = `${x}px`;
    message.style.top = `${y}px`;
    message.style.color = '#FFD700';
    message.style.textShadow = '0 0 10px #FFD700, 0 0 20px #FFD700';

    document.getElementById('game-container').appendChild(message);

    const levelContainer = document.getElementById('level-container');
    levelContainer.classList.add('level-up-animation');

    playSound("levelUp");

    setTimeout(() => {
        message.remove();
        levelContainer.classList.remove('level-up-animation');
    }, 1500);
}

// Обновить отображение уровня
function updateLevelDisplay() {
    const levelElement = document.getElementById('current-level');
    if (levelElement) {
        levelElement.textContent = currentLevel;
    }
}

// Инициализация уровня
function initLevel() {
    // Создаем змейку
    snake = [];
    for (let i = config.initialSnakeLength - 1; i >= 0; i--) {
        snake.push({ x: i, y: 10 });
    }

    // Начальное направление
    direction = 'right';
    nextDirection = 'right';

    updateLevelDisplay();

    // Создаем еду
    foods = [];
    addNewFood(config.foodCount);

    combo = 0;
}

function updateCachedGrid() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    
    // Размер canvas уже должен быть установлен (например, в resize)
    const canvasSize = Math.min(canvas.width, canvas.height);
    
    if (canvasSize <= 400) {
        cachedGridSize = 15;
    } else if (canvasSize <= 500) {
        cachedGridSize = 20;
    } else {
        cachedGridSize = 25;
    }
    
    cachedCellSize = canvasSize / cachedGridSize;
}

// Геттер для удобства
function getCachedGrid() {
    return { gridSize: cachedGridSize, cellSize: cachedCellSize };
}
