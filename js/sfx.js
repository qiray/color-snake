
/**
 * Chameleon Snake Game - Sounds
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * 
 * MIT Licensed
 */

/**
 * sfx.js – Оптимизированное воспроизведение звуков (предзагрузка, переиспользование)
 */

// Хранилище предзагруженных звуков
const sounds = {};

// Предзагрузка всех звуков при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    preloadSound('eat', './SFX/mixkit-game-success-alert-2039.wav');
    preloadSound('combo', './SFX/mixkit-player-recharging-in-video-game-2041.wav');
    preloadSound('gameOver', './SFX/mixkit-player-losing-or-failing-2042.wav');
    preloadSound('levelUp', './SFX/mixkit-game-success-alert-2039.wav'); // можно отдельный файл
});

function preloadSound(key, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();            // начинаем загрузку сразу
    sounds[key] = audio;
}

/**
 * Воспроизвести звук по ключу
 * @param {string} key - один из: 'eat', 'combo', 'gameOver', 'levelUp'
 */
function playSound(key) {
    return; //TODO:
    const audio = sounds[key];
    if (!audio) {
        console.warn(`Звук с ключом "${key}" не найден`);
        return;
    }

    // Сбрасываем время, если звук уже играл
    audio.currentTime = 0;

    // Пытаемся воспроизвести
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // На мобильных автовоспроизведение может быть заблокировано до первого жеста.
            // Игра продолжит работать без звука – это некритично.
            console.log('Воспроизведение звука заблокировано браузером:', error);
        });
    }
}