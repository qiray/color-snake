
/**
 * Chameleon Snake Game - Handlers Logic
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */

// Обработка нажатий клавиш
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case 'p':
        case 'P':
        case 'з':
        case 'З':
            pauseGame();
            break;
    }
});

// Кнопки управления
document.getElementById('start-button').addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameOverlay.classList.add('hidden');
    initGame();
});

document.getElementById('restart-button').addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    gameOverlay.classList.add('hidden');
    initGame();
});

document.getElementById('how-to-play-button').addEventListener('click', () => {
    document.getElementById('instructions').classList.remove('hidden');
});

document.getElementById('instructions-ok-button').addEventListener('click', () => {
    document.getElementById('instructions').classList.add('hidden');
});

document.getElementById('clear-progress-button').addEventListener('click', () => {
    showPopupMessage(getTranslation("clear_progress"), getTranslation("clear_progress_question"));
});

document.getElementById('about-button').addEventListener('click', () => {
    document.getElementById('about').classList.remove('hidden');
});

document.getElementById('about-ok-button').addEventListener('click', () => {
    document.getElementById('about').classList.add('hidden');
});

document.getElementById("popup-yes-button").addEventListener('click', () => {
    clearRecords();
    popupElement.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

document.getElementById("popup-no-button").addEventListener('click', () => {
    popupElement.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Обработчик кнопки продолжения
document.getElementById('resume-button').addEventListener('click', () => resumeGame());

window.addEventListener('load', function () {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    
    // Устанавливаем размер canvas равным размеру контейнера
    canvas.width = container.clientWidth;
    canvas.height = container.clientWidth; // Квадратный canvas
    
    // Инициализируем игру если нужно
    if (!gameActive) {
        drawGame();
    }
});

window.addEventListener('resize', handleResize);

function handleResize() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    
    // Сохраняем текущее состояние игры
    const wasActive = gameActive;
    const oldInterval = gameInterval;
    
    if (wasActive) {
        clearInterval(oldInterval);
        gameActive = false;
    }
    
    // Принудительная перерисовка
    setTimeout(() => {
        if (wasActive) {
            gameActive = true;
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        drawGame();
    }, 100);
}
