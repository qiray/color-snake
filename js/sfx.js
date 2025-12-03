
async function playSound(url) {
    try {
        const audio = new Audio(url);
        await audio.play();
    } catch (error) {
        console.error('Ошибка воспроизведения:', error);
    }
}
