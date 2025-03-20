document.addEventListener('DOMContentLoaded', () => {
    const woodfish = document.querySelector('.woodfish');
    const container = document.querySelector('.container');
    const countDisplay = document.getElementById('count');
    const soundToggle = document.getElementById('soundToggle');
    const woodfishSound = document.getElementById('woodfishSound');
    let count = 0;
    let isAnimating = false;
    let isSoundEnabled = true;

    // 从 localStorage 读取音效状态
    if (localStorage.getItem('woodfishSoundEnabled') === 'false') {
        isSoundEnabled = false;
        soundToggle.textContent = '🔇';
        soundToggle.classList.add('muted');
    }

    function playSound() {
        if (isSoundEnabled) {
            // 重置音频播放位置
            woodfishSound.currentTime = 0;
            woodfishSound.play().catch(error => console.log('播放失败:', error));
        }
    }

    // 创建点击动画元素
    function createCountAnimation(x, y) {
        const element = document.createElement('div');
        element.className = 'count-animation';
        element.textContent = '+1';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        container.appendChild(element);

        // 动画结束后移除元素
        element.addEventListener('animationend', () => {
            element.remove();
        });
    }

    // 处理点击/触摸事件
    function handleTap(event) {
        if (isAnimating) return;
        isAnimating = true;

        // 播放音效
        playSound();

        // 增加计数
        count++;
        countDisplay.textContent = count;

        // 添加动画类
        woodfish.classList.add('active');

        // 计算动画位置
        const rect = woodfish.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - 14; // 14px 是数字宽度的一半
        const y = rect.top + rect.height / 2;

        // 创建动画元素
        createCountAnimation(x, y);

        // 移除动画类
        setTimeout(() => {
            woodfish.classList.remove('active');
            isAnimating = false;
        }, 150);
    }

    // 添加事件监听器
    woodfish.addEventListener('click', handleTap);
    woodfish.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap(e);
    }, { passive: false });

    // 音效开关功能
    soundToggle.addEventListener('click', function() {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('woodfishSoundEnabled', isSoundEnabled);
        
        if (isSoundEnabled) {
            soundToggle.textContent = '🔊';
            soundToggle.classList.remove('muted');
        } else {
            soundToggle.textContent = '🔇';
            soundToggle.classList.add('muted');
        }
    });
}); 