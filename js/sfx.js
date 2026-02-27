
/**
 * Chameleon Snake Game - Sounds
 * 
 * Created: 2025-2026
 * Author: Yaroslav Zotov
 * 
 * MIT Licensed
 */

/**
 * sfx.js – Воспроизведение звуков с автоопределением протокола
 * (Web Audio API для http/https, Audio-элементы для file://)
 */

// Определяем протокол загрузки страницы
const isFileProtocol = window.location.protocol === 'file:';

// ========== Режим для file:// (старая логика) ==========
if (isFileProtocol) {
    // Хранилище предзагруженных Audio-элементов
    const sounds = {};

    function preloadSound(key, url) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.load();
        sounds[key] = audio;
    }

    // Предзагрузка звуков
    document.addEventListener('DOMContentLoaded', () => {
        preloadSound('eat', './SFX/mixkit-game-success-alert-2039.mp3');
        preloadSound('combo', './SFX/mixkit-player-recharging-in-video-game-2041.mp3');
        preloadSound('gameOver', './SFX/mixkit-player-losing-or-failing-2042.mp3');
        preloadSound('levelUp', './SFX/mixkit-game-success-alert-2039.mp3');
    });

    // Глобальная функция playSound для file://
    window.playSound = function(key) {
        const audio = sounds[key];
        if (!audio) {
            console.warn(`Звук "${key}" не найден`);
            return;
        }
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log('Воспроизведение заблокировано:', e));
        }
    };
}
// ========== Режим для http/https (Web Audio API) ==========
else {
    let audioContext = null;
    const soundBuffers = {};

    function initAudioContext() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Загружаем все звуки сразу после активации контекста
        loadSound('eat', './SFX/mixkit-game-success-alert-2039.mp3');
        loadSound('combo', './SFX/mixkit-player-recharging-in-video-game-2041.mp3');
        loadSound('gameOver', './SFX/mixkit-player-losing-or-failing-2042.mp3');
        loadSound('levelUp', './SFX/mixkit-game-success-alert-2039.mp3');
    }

    async function loadSound(key, url) {
        if (!audioContext) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            soundBuffers[key] = audioBuffer;
        } catch (e) {
            console.warn(`Не удалось загрузить звук ${key}:`, e);
        }
    }

    function playBuffer(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }

    function playSound(key) {
        if (!audioContext) {
            initAudioContext();
            if (!audioContext) return;
        }

        const buffer = soundBuffers[key];
        if (!buffer) {
            console.warn(`Буфер для звука "${key}" ещё не загружен`);
            return;
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => playBuffer(buffer))
                .catch(e => console.log('Не удалось возобновить AudioContext:', e));
            return;
        }

        playBuffer(buffer);
    }

    // Активация контекста при первом жесте пользователя
    function activateAudioOnUserGesture() {
        initAudioContext();
        document.removeEventListener('touchstart', activateAudioOnUserGesture);
        document.removeEventListener('touchend', activateAudioOnUserGesture);
        document.removeEventListener('keydown', activateAudioOnUserGesture);
        document.removeEventListener('click', activateAudioOnUserGesture);
    }

    document.addEventListener('touchstart', activateAudioOnUserGesture, { once: true });
    document.addEventListener('touchend', activateAudioOnUserGesture, { once: true });
    document.addEventListener('keydown', activateAudioOnUserGesture, { once: true });
    document.addEventListener('click', activateAudioOnUserGesture, { once: true });

    // Глобальная функция playSound для http/https
    window.playSound = playSound;
}
