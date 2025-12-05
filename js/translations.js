

/**
 * Chameleon Snake Game - Translations Logic
 * 
 * Created: 2025
 * Author: Yaroslav Zotov
 * AI-Assisted Development: Code generation
 * 
 * MIT Licensed
 */

const translations = {
    ru: {
        title: "Хамелеон-змейка",
        subtitle: "Съедай фрукты своего цвета!",
        game_description: "Собери комбо из фруктов одного цвета, чтобы получить больше очков!",
        start_button: "Начать игру",
        how_to_play: "Как играть",
        about_button: "Об авторах",
        ok_button: "ОК",
        yes_button: "Да",
        no_button: "Нет",
        control_instruction: "Управляй змейкой с помощью клавиш ",
        pause_instruction: "Пауза на клавише ",
        eat_instruction: "Съедай фрукты, чтобы расти и получать очки",
        color_change_instruction: "При съедании фрукта змейка меняет цвет на цвет фрукта",
        combo_instruction: "Съедай несколько фруктов одного цвета подряд для комбо",
        avoid_instruction: "Избегай столкновений с собой!",
        game_over: "Конец игры!",
        final_score: "Ваш счёт:",
        max_combo: "Самое длинное комбо:",
        restart_button: "Играть снова",
        score_label: "Очки:",
        combo_label: "Комбо:",
        combo_message: "КОМБО",
        best_score_label: "Рекорд очков:",
        best_combo_label: "Рекордное комбо:",
        clear_progress: "Сбросить прогресс",
        clear_progress_question: "Вы уверены, что хотите сбросить прогресс? Это действие нельзя отменить.",
        resume_button: "Продолжить"
    },
    en: {
        title: "Chameleon snake",
        subtitle: "Eat fruits of your color!",
        game_description: "Collect a combo of fruits of the same color to get more points!",
        start_button: "Start game",
        how_to_play: "How to play",
        about_button: "About",
        ok_button: "OK",
        yes_button: "Yes",
        no_button: "No",
        control_instruction: "Control the snake using arrow keys ",
        pause_instruction: "Pause on key ",
        eat_instruction: "Eat fruits to grow and score points",
        color_change_instruction: "When eating a fruit, the snake changes to the fruit's color",
        combo_instruction: "Eat several fruits of the same color in a row for a combo",
        avoid_instruction: "Avoid collisions with yourself!",
        game_over: "Game Over!",
        final_score: "Your score:",
        max_combo: "Longest combo:",
        restart_button: "Play again",
        score_label: "Score:",
        combo_label: "Combo:",
        combo_message: "COMBO",
        best_score_label: "Max score:",
        best_combo_label: "Longest combo:",
        clear_progress: "Clear progress",
        clear_progress_question: "Are you sure you want to reset your progress? This action cannot be undone.",
        resume_button: "Resume"
    }
};

let currentLang = localStorage.getItem('userLanguage') || 'en';

function applyTranslations(lang) {
    // Обновляем атрибут lang у HTML
    document.documentElement.lang = lang;
    
    // Ищем все элементы с атрибутом data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Обновляем активную кнопку языка
    document.querySelectorAll('#language-switcher .language-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Сохраняем выбор языка
    localStorage.setItem('userLanguage', lang);
}

function getTranslation(key) {
    return translations[currentLang][key] || key;
}

// Обработчики кнопок переключения языка
document.querySelectorAll('#language-switcher .language-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang !== currentLang) {
            currentLang = lang;
            applyTranslations(lang);
        }
    });
});

applyTranslations(currentLang); // Инициализация
