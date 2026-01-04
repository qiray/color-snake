
/**
 * Chameleon Snake Game - Score Logic
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */

// Формула для комбо (плавный рост)
function getComboBonus(combo) {
    if (combo < comboBonuses.length)
        return comboBonuses[combo];
    
    return comboBonuses[comboBonuses.length - 1] + 250 * (combo - comboBonuses.length);
}

// Загрузка рекордов из localStorage
function loadRecords() {
    const savedScore = localStorage.getItem('snake_best_score');
    const savedCombo = localStorage.getItem('snake_best_combo');
    
    bestScore = savedScore ? parseInt(savedScore) : 0;
    bestCombo = savedCombo ? parseInt(savedCombo) : 0;
    
    updateBestScore();
}

// Сохранение рекордов в localStorage
function saveRecords() {
    bestScore = Math.max(bestScore, score);
    bestCombo = Math.max(bestCombo, combo);
    localStorage.setItem('snake_best_score', bestScore);
    localStorage.setItem('snake_best_combo', bestCombo);
    updateBestScore();
}

function clearRecords() {
    localStorage.removeItem('snake_best_score');
    localStorage.removeItem('snake_best_combo');
    bestScore = bestCombo = 0;
    updateBestScore();
}

// Обновление счета
function updateScore() {
    scoreElement.textContent = score;
    comboElement.textContent = combo;
    saveRecords();
}

function updateBestScore() {
    bestScoreElement.textContent = bestScore;
    bestComboElement.textContent = bestCombo;
}
