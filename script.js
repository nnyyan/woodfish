document.addEventListener('DOMContentLoaded', () => {
    const woodfish = document.querySelector('.woodfish');
    const container = document.querySelector('.container');
    const countDisplay = document.getElementById('count');
    const soundToggle = document.getElementById('soundToggle');
    const woodfishSound = document.getElementById('woodfishSound');
    const modeSelect = document.getElementById('modeSelect');
    
    let count = 0;
    let isAnimating = false;
    let isSoundEnabled = true;
    let currentMode = 'simple';
    
    // 词语列表
    const emotionWords = [
        '别生气', '随它去', '放一放', '算了吧', '看开点',
        '有啥大不了', '开心活', '不内耗', '无所谓啦', '放轻松点'
    ];
    
    const socialistWords = [
        '富强', '民主', '文明', '和谐', '自由',
        '平等', '公正', '法治', '爱国', '敬业',
        '诚信', '友善'
    ];

    // 音频对象池
    const AUDIO_POOL_SIZE = 4;
    const audioPool = [];
    
    // 初始化音频池
    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
        const audio = new Audio('knock-woodfish.mp3');
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
                preloadAudio();
            });
        }

        currentAudioIndex = (currentAudioIndex + 1) % AUDIO_POOL_SIZE;
    }

    // 获取随机词语
    function getRandomWord(mode) {
        const words = mode === 'emotion' ? emotionWords : socialistWords;
        return words[Math.floor(Math.random() * words.length)];
    }

    // 创建浮动文字
    function createFloatingText(x, y) {
        const element = document.createElement('div');
        element.className = 'count-animation';
        
        // 根据模式选择显示内容
        switch (currentMode) {
            case 'simple':
                element.textContent = '+1';
                break;
            case 'emotion':
            case 'socialist':
                element.textContent = '+' + getRandomWord(currentMode);
                break;
        }

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        container.appendChild(element);

        // 动画结束后移除元素
        element.addEventListener('animationend', () => {
            element.remove();
        });
    }

    // 处理点击事件
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
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // 创建动画元素
        createFloatingText(x, y);

        // 移除动画类
        setTimeout(() => {
            woodfish.classList.remove('active');
            isAnimating = false;
        }, 150);
    }

    // 监听模式选择变化
    modeSelect.addEventListener('change', (e) => {
        currentMode = e.target.value;
        localStorage.setItem('woodfishMode', currentMode);
    });

    // 从 localStorage 读取上次选择的模式
    const savedMode = localStorage.getItem('woodfishMode');
    if (savedMode) {
        currentMode = savedMode;
        modeSelect.value = savedMode;
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
            preloadAudio();
        } else {
            soundToggle.classList.add('muted');
        }
    });

    // 处理页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
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