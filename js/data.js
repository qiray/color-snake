
/**
 * Chameleon Snake Game - Game Data
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */


// Конфигурация игры
const config = {
    initialSnakeLength: 4,
    foodCount: 7,
    baseSpeed: 150
};

let rafId = null;                // идентификатор requestAnimationFrame
let lastTimestamp = 0;           // время предыдущего кадра
let accumulator = 0;             // накопитель времени
let timeStep = config.baseSpeed; // фиксированный шаг (в мс), совпадает с gameSpeed

let cellSize;

// Игровые переменные
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');
const bestScoreElement = document.getElementById('best-score');
const bestComboElement = document.getElementById('best-combo');
const comboLabel = document.getElementById('combo-label');
const startScreen = document.getElementById('start-screen');
const gameOverlay = document.getElementById('game-overlay');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const maxComboElement = document.getElementById('max-combo');
const popupElement = document.getElementById('popup');
const popupHeaderElement = document.getElementById('popup-header');
const popupMessageElement = document.getElementById('popup-message');

let snake = [];
let direction = 'right';
let nextDirection = 'right';
let foods = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let currentColor = '#00FF7F';
let gameActive = false;
let gameSpeed = config.baseSpeed;

// Цвета для фруктов
const colors = [
    '#FF5252', // красный
    '#FFD740', // жёлтый
    '#7C4DFF', // фиолетовый
    '#69F0AE', // зелёный
    '#40C4FF'  // голубой
];

const comboBonuses = [
    0,   // Базовый счет без бонуса
    15,  // Первое комбо
    25,  // Мини-бонус
    50,  // Значительный скачок
    75,  // 
    100, // 
    150, // 
    200, // 
    300, // 
    500, // Юбилейное 10-е комбо
    650, // 
    850, //
    1000, // 
    1250, // 
    1500  // Максимальный бонус
];

let gamePaused = false;
let cachedGridSize = 20;    // значение по умолчанию
let cachedCellSize = 20;    // будет пересчитано при первом запуске

// Конфигурация уровней
const levelConfig = {
    segmentThreshold: 14, // Количество сегментов для перехода на следующий уровень
    segmentThresholdIncrease: 2, // Увеличение максимальной длины на каждом уровне 
    speedIncrease: 5,    // Увеличение скорости на каждом уровне (в мс)
    maxSpeed: 50          // Минимальная скорость (максимальная сложность)
};

// Переменные уровня
let currentLevel = 1;
let segmentThreshold = levelConfig.segmentThreshold;
