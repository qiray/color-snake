
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
    canvas.width = window.innerHeight > smallScreen ? 600 : 400;
    canvas.height = window.innerHeight > smallScreen ? 600 : 400;
});
