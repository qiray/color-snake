
/**
 * Chameleon Snake Game - Handlers Logic
 * 
 * Created: 2025
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
