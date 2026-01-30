
/**
 * Chameleon Snake Game - Core Logic
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */

// Инициализация игры
function initGame() {
    currentLevel = 1
    // Инициализация уровня
    initLevel();

    // Сброс очков
    score = 0;
    combo = 0;
    gameSpeed = config.baseSpeed;
    currentColor = '#00FF7F';
    loadRecords();
    updateScore();

    // Начинаем игровой цикл
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    gameActive = true;

    updateComboElementStyle("#ffcc00", '0 0 8px rgba(255, 204, 0, 0.8)');

    // Скрываем кнопку продолжения, показываем стартовую
    document.getElementById('resume-button').style.display = 'none';
    document.getElementById('start-button').style.display = 'inline-block';
}

// Генерация еды
function addNewFood(count) {
    for (let i = 0; i < count; i++) {
        let newFood;
        let overlapping;
        let attempts = 0;

        do {
            overlapping = false;
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / config.gridSize)),
                y: Math.floor(Math.random() * (canvas.height / config.gridSize)),
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

            // Защита от бесконечного цикла
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
function gameLoop() {
    moveSnake();
    checkCollisions();
    drawGame();
}

// Движение змейки
function moveSnake() {
    direction = nextDirection;

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
    if (head.x < 0) head.x = (canvas.width / config.gridSize) - 1;
    if (head.x >= canvas.width / config.gridSize) head.x = 0;
    if (head.y < 0) head.y = (canvas.height / config.gridSize) - 1;
    if (head.y >= canvas.height / config.gridSize) head.y = 0;

    // Добавляем новую голову
    snake.unshift(head);

    // Проверяем, съели ли еду
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            // Обработка съедения еды
            handleFoodEaten(foods[i]);
            foods.splice(i, 1);
            const newFoodCount = 1 + Math.floor(Math.random() * 2); // Добавляем 1 или 2 новых фрукта
            addNewFood(newFoodCount);
            foodEaten = true;
            break;
        }
    }

    // Если еда не была съедена, удаляем хвост
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
        showComboMessage(food.x * config.gridSize, food.y * config.gridSize, comboBonus, food.color);

        playSound("./SFX/mixkit-player-recharging-in-video-game-2041.wav")
    } else {
        combo = 1;
        score += 10;
        playSound("./SFX/mixkit-game-success-alert-2039.wav")
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

    // Отрисовка сетки
    drawGrid();

    // Отрисовка змейки
    for (let i = 0; i < snake.length; i++) {
        // Голова другого цвета
        const color = i === 0 ? '#FFFFFF' : currentColor;

        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(
            snake[i].x * config.gridSize + config.gridSize / 2,
            snake[i].y * config.gridSize + config.gridSize / 2,
            config.gridSize / 2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Глаза у головы
        if (i === 0) {
            ctx.fillStyle = '#000';

            // Позиция глаз в зависимости от направления
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
                snake[i].x * config.gridSize + config.gridSize / 2 + eyeOffsetX,
                snake[i].y * config.gridSize + config.gridSize / 2 + eyeOffsetY,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Отрисовка еды
    for (const food of foods) {
        ctx.fillStyle = food.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // Рисуем фрукты в виде кружков с эффектом блика
        ctx.beginPath();
        ctx.arc(
            food.x * config.gridSize + config.gridSize / 2,
            food.y * config.gridSize + config.gridSize / 2,
            config.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Блик на фрукте
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(
            food.x * config.gridSize + config.gridSize / 2 - 3,
            food.y * config.gridSize + config.gridSize / 2 - 3,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Отрисовка сетки
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 100, 200, 0.2)';
    ctx.lineWidth = 0.5;

    // Вертикальные линии
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Показать сообщение о комбо
function showComboMessage(x, y, bonus, color) {
    const message = document.createElement('div');
    message.className = 'combo-message';
    message.textContent = `+${bonus} ${getTranslation("combo_message")} x${combo}!`;
    message.style.left = `${x}px`;
    message.style.top = `${y}px`;

    // Устанавливаем цвет из параметра
    message.style.color = color;
    message.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

    document.getElementById('game-container').appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1500);
}

// Конец игры
function endGame() {
    playSound("./SFX/mixkit-player-losing-or-failing-2042.wav")
    clearInterval(gameInterval);
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
        clearInterval(gameInterval);
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
        gameInterval = setInterval(gameLoop, gameSpeed);
        gameActive = true;
        document.getElementById('resume-button').style.display = 'none';
        document.getElementById('start-button').style.display = 'inline-block';
    }
}

function increaseSpeed(increase) {
    // Увеличиваем скорость
    if (gameSpeed > levelConfig.maxSpeed) {
        gameSpeed = Math.max(levelConfig.maxSpeed, gameSpeed - increase);
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
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
function showLevelUpMessage() { //TODO: play sound
    const head = snake[0];
    const x = head.x * config.gridSize;
    const y = head.y * config.gridSize;
    
    const message = document.createElement('div');
    message.className = 'combo-message';
    message.textContent = `${getTranslation("level_up")} ${currentLevel}!`;
    message.style.left = `${x}px`;
    message.style.top = `${y}px`;
    message.style.color = '#FFD700';
    message.style.textShadow = '0 0 10px #FFD700, 0 0 20px #FFD700';
    
    document.getElementById('game-container').appendChild(message);
    
    // Добавляем анимацию к контейнеру уровня
    const levelContainer = document.getElementById('level-container');
    levelContainer.classList.add('level-up-animation');
    
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
