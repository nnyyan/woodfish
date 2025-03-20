document.addEventListener('DOMContentLoaded', () => {
    const woodfish = document.querySelector('.woodfish');
    const container = document.querySelector('.container');
    const countDisplay = document.getElementById('count');
    const soundToggle = document.getElementById('soundToggle');
    const woodfishSound = document.getElementById('woodfishSound');
    let count = 0;
    let isAnimating = false;
    let isSoundEnabled = true;
    
    // 音频对象池
    const AUDIO_POOL_SIZE = 4;
    const audioPool = [];
    
    // 初始化音频池
    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
        const audio = new Audio('coconut-pop.mp3');
        audio.preload = 'auto';
        audioPool.push(audio);
    }
    let currentAudioIndex = 0;

    // 从 localStorage 读取音效状态
    if (localStorage.getItem('woodfishSoundEnabled') === 'false') {
        isSoundEnabled = false;
        soundToggle.classList.add('muted');
    }

    // 预加载音频
    function preloadAudio() {
        audioPool.forEach(audio => {
            audio.load();
            // 在iOS上触发一次播放以解锁音频
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(() => {});
            }
        });
    }

    // 尝试预加载音频
    preloadAudio();

    // 优化的播放声音函数
    function playSound() {
        if (!isSoundEnabled) return;

        const audio = audioPool[currentAudioIndex];
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('播放失败:', error);
                // 如果播放失败，重新尝试预加载
                preloadAudio();
            });
        }

        // 循环使用音频池
        currentAudioIndex = (currentAudioIndex + 1) % AUDIO_POOL_SIZE;
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
        const x = rect.left + rect.width / 2 - 14;
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
            soundToggle.classList.remove('muted');
            // 重新预加载音频
            preloadAudio();
        } else {
            soundToggle.classList.add('muted');
        }
    });

    // 处理页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 页面变为可见时重新预加载音频
            preloadAudio();
        }
    });

    // 处理触摸开始事件，用于iOS设备解锁音频
    document.addEventListener('touchstart', () => {
        if (isSoundEnabled) {
            preloadAudio();
        }
    }, { once: true });
}); 