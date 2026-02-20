/**
 * Chameleon Snake Game - Sounds (Web Audio API version)
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * 
 * MIT Licensed
 */

/**
 * sfx.js – Воспроизведение звуков через Web Audio API (предзагрузка, переиспользование)
 */

// Глобальный аудиоконтекст (один на всю игру)
let audioContext = null;

// Хранилище декодированных буферов
const buffers = {};

// Очередь звуков, которые запросили до активации контекста (опционально)
const pendingSounds = [];

// Предзагрузка всех звуков при загрузке страницы
function initSounds() {
    if (audioContext)
        return
    // Создаём контекст сразу (он будет в состоянии suspended)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Загружаем и декодируем звуки
    preloadSound('eat', './SFX/mixkit-game-success-alert-2039.wav');
    preloadSound('combo', './SFX/mixkit-player-recharging-in-video-game-2041.wav');
    preloadSound('gameOver', './SFX/mixkit-player-losing-or-failing-2042.wav');
    preloadSound('levelUp', './SFX/mixkit-game-success-alert-2039.wav');

    // Устанавливаем обработчик первого касания для активации контекста
    setupFirstGesture();
};

/**
 * Устанавливает обработчик первого пользовательского жеста
 */
function setupFirstGesture() {
    const gestureEvents = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    const handler = async () => {
        // Удаляем все обработчики после первого срабатывания
        for (const event of gestureEvents) {
            document.removeEventListener(event, handler);
        }
        // Активируем контекст
        if (audioContext && audioContext.state === 'suspended') {
            try {
                await audioContext.resume();
                console.log('AudioContext активирован по жесту');
                // Воспроизводим звуки из очереди, если хотим
                playPendingSounds();
            } catch (error) {
                console.error('Ошибка активации AudioContext:', error);
            }
        }
    };
    for (const event of gestureEvents) {
        document.addEventListener(event, handler, { once: false }); // once:false, но мы удалим вручную
    }
}

/**
 * Воспроизводит звуки, которые были запрошены до активации
 */
function playPendingSounds() {
    while (pendingSounds.length) {
        const key = pendingSounds.shift();
        actuallyPlaySound(key);
    }
}

/**
 * Загружает и декодирует аудиофайл, сохраняет буфер
 */
async function preloadSound(key, url) {
    if (!audioContext) return;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers[key] = audioBuffer;
        console.log(`Звук "${key}" загружен и декодирован`);
    } catch (error) {
        console.error(`Ошибка загрузки звука "${key}":`, error);
    }
}

/**
 * Воспроизвести звук по ключу
 */
function playSound(key) {
    // Если контекст ещё не активирован, добавляем в очередь (опционально)
    if (!audioContext || audioContext.state !== 'running') {
        // Можно либо игнорировать, либо сохранить для воспроизведения позже
        pendingSounds.push(key);
        return;
    }
    actuallyPlaySound(key);
}

/**
 * Реальная функция воспроизведения (вызывается только при активном контексте)
 */
function actuallyPlaySound(key) {
    const buffer = buffers[key];
    if (!buffer) {
        console.warn(`Буфер для ключа "${key}" не найден`);
        return;
    }
    try {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (error) {
        console.error(`Ошибка воспроизведения звука "${key}":`, error);
    }
}
