/**
 * Chameleon Snake Game - Resize Handler
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * 
 * MIT Licensed
 */

// Функция для обработки изменения размера
function setupResponsiveGame() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    
    function updateCanvasSize() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Устанавливаем квадратный canvas
        const size = Math.min(containerWidth, containerHeight);
        canvas.width = size;
        canvas.height = size;
        
        // Принудительная перерисовка если игра активна
        if (gameActive) {
            drawGame();
        }
    }
    
    // Инициализация при загрузке
    updateCanvasSize();
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', updateCanvasSize);
    
    // Обработчик изменения ориентации
    window.addEventListener('orientationchange', () => {
        setTimeout(updateCanvasSize, 100);
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', setupResponsiveGame);

var viewportWidth = window.innerWidth;
var viewportHeight = window.innerHeight;

// Example of displaying the values
console.log("Viewport Width: " + viewportWidth + "px");
console.log("Viewport Height: " + viewportHeight + "px");