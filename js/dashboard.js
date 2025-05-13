// 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 从localStorage获取用户数据
    const savedData = localStorage.getItem('salaryData');
    if (!savedData) {
        // 如果没有数据，跳转回输入页面
        window.location.href = 'index.html';
        return;
    }
    
    const userData = JSON.parse(savedData);
    
    // 应用主题
    document.body.classList.add('theme-' + userData.theme);
    
    // 初始化各元素
    const currentTimeElement = document.getElementById('current-time');
    const timerElement = document.getElementById('timer');
    const incomeValueElement = document.getElementById('income-value');
    const currencySymbolElement = document.getElementById('currency-symbol');
    const progressBarElement = document.getElementById('progress-bar');
    const progressPercentageElement = document.getElementById('progress-percentage');
    const perSecondValueElement = document.getElementById('per-second-value');
    const workStatusElement = document.getElementById('work-status');
    
    // 立即更新当前时间
    updateCurrentTime();
    
    // 设置货币符号
    currencySymbolElement.textContent = userData.currency;
    
    // 汇率换算表 (相对于人民币)，如果用户数据中没有保存汇率，则使用默认值
    const exchangeRates = {
        '¥': 1,      // 人民币
        '$': 0.14,   // 美元
        '€': 0.13,   // 欧元
        '£': 0.11    // 英镑
    };
    
    // 获取当前货币的汇率因子，优先使用保存的汇率
    const currencyRate = userData.exchangeRate || exchangeRates[userData.currency] || 1;
    
    // 获取工作时间设置
    const workStartTime = userData.workStartTime || "09:00";
    const workEndTime = userData.workEndTime || "18:00";
    const workHoursPerDay = userData.workHoursPerDay || 8;
    
    // 计算每秒收入
    const secondsPerWorkingHour = 60 * 60; // 每小时的秒数
    const totalWorkSeconds = workHoursPerDay * secondsPerWorkingHour; // 每天工作总秒数
    
    // 每秒收入 = 月薪 / 工作天数 / 每天工作秒数 * 汇率因子
    // 如果是人民币，直接计算；如果是其他货币，需要根据汇率转换
    let incomePerSecond;
    if (userData.currency === '¥') {
        // 人民币直接计算
        incomePerSecond = userData.monthlySalary / userData.workingDays / totalWorkSeconds;
    } else {
        // 其他货币需要转换
        incomePerSecond = (userData.monthlySalary / userData.workingDays / totalWorkSeconds) / currencyRate;
    }
    
    // 显示每秒收入率 - 显示4位小数
    perSecondValueElement.textContent = incomePerSecond.toFixed(4);
    
    // 强制设置开始时间为当前时间
    const startTime = new Date().getTime();
    userData.startTime = startTime;
    localStorage.setItem('salaryData', JSON.stringify(userData));
    
    let hasShownEndNotification = false; // 是否已显示下班提醒
    
    // 初始收入金额
    let currentIncome = 0;
    
    // 创建下班提醒通知
    function createNotification(title, message, duration = 10000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        notification.innerHTML = `
            <div>
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 500);
        });
        
        // 自动关闭
        if (duration) {
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.classList.add('hide');
                    setTimeout(() => {
                        notification.remove();
                    }, 500);
                }
            }, duration);
        }
        
        return notification;
    }
    
    // 更新当前时间的函数
    function updateCurrentTime() {
        const now = new Date();
        currentTimeElement.textContent = now.toLocaleTimeString();
    }
    
    // 获取工作状态
    function getWorkStatus() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeValue = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
        
        if (currentTimeValue < workStartTime) {
            return {
                status: 'before',
                message: `还未到上班时间 (${workStartTime})，请耐心等待`
            };
        } else if (currentTimeValue > workEndTime) {
            return {
                status: 'after',
                message: `已经下班了 (${workEndTime})，辛苦了！`
            };
        } else {
            return {
                status: 'during',
                message: ''
            };
        }
    }
    
    // 获取今天的工作计时（毫秒）
    function getWorkDuration() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        const currentMs = now.getMilliseconds();
        const currentTimeValue = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
        
        // 解析上班时间
        const startParts = workStartTime.split(':');
        const startHour = parseInt(startParts[0]);
        const startMinute = parseInt(startParts[1]);
        
        // 如果当前时间早于上班时间，返回0
        if (currentTimeValue < workStartTime) {
            return 0;
        }
        
        // 解析下班时间
        const endParts = workEndTime.split(':');
        const endHour = parseInt(endParts[0]);
        const endMinute = parseInt(endParts[1]);
        
        // 创建表示今天上班时间的日期对象
        const workStartDate = new Date(now);
        workStartDate.setHours(startHour, startMinute, 0, 0);
        
        // 如果当前时间晚于下班时间，返回全天工作时间（毫秒）
        if (currentTimeValue >= workEndTime) {
            const workEndDate = new Date(now);
            workEndDate.setHours(endHour, endMinute, 0, 0);
            return workEndDate - workStartDate;
        }
        
        // 当前在工作时间内，计算从上班到现在的毫秒数
        const currentDate = new Date(now);
        return currentDate - workStartDate;
    }
    
    // 更新计时器的函数
    function updateTimer() {
        const workDurationMs = getWorkDuration();
        
        if (workDurationMs <= 0) {
            timerElement.textContent = "00:00:00.000";
            return;
        }
        
        const hours = Math.floor(workDurationMs / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((workDurationMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((workDurationMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
        const milliseconds = Math.floor((workDurationMs % 1000) / 10).toString().padStart(2, '0');
        
        timerElement.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    
    // 获取今天的已工作时间（秒）
    function getWorkedSecondsToday() {
        return Math.floor(getWorkDuration() / 1000);
    }
    
    // 更新工作状态提示
    function updateWorkStatus() {
        const workStatus = getWorkStatus();
        
        if (workStatus.status === 'before') {
            workStatusElement.textContent = workStatus.message;
            workStatusElement.style.color = 'var(--accent-color)';
        } else if (workStatus.status === 'after') {
            workStatusElement.textContent = workStatus.message;
            workStatusElement.style.color = 'var(--secondary-color)';
        } else {
            workStatusElement.textContent = '';
        }
    }
    
    // 更新收入金额的函数
    function updateIncome() {
        const workedSeconds = getWorkedSecondsToday();
        currentIncome = workedSeconds * incomePerSecond;
        
        // 获取旧值以检测变化
        const oldValue = incomeValueElement.textContent;
        const newValue = currentIncome.toFixed(4); // 从8位改为4位
        
        // 设置新值
        incomeValueElement.textContent = newValue;
        
        // 如果值发生变化，添加震动动画
        if (oldValue !== newValue) {
            incomeValueElement.classList.remove('number-changed');
            // 触发重绘
            void incomeValueElement.offsetWidth;
            incomeValueElement.classList.add('number-changed');
        }
        
        // 检查是否是下班时间，并显示通知
        const workStatus = getWorkStatus();
        
        // 检查是否达到下班时间且尚未显示提醒
        if (workStatus.status === 'after' && !hasShownEndNotification) {
            createNotification(
                '下班提醒', 
                `已经${workEndTime}了，今天你已经赚了${userData.currency}${currentIncome.toFixed(2)}，辛苦了！`,
                0 // 不自动关闭
            );
            hasShownEndNotification = true;
            
            // 播放提示音（如果可用）
            try {
                const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
                audio.play();
            } catch (e) {
                console.error('无法播放提示音:', e);
            }
        }
    }
    
    // 更新进度条的函数
    function updateProgressBar() {
        // 根据用户设置的上下班时间计算工作进度
        const workedSeconds = getWorkedSecondsToday();
        const progressPercentage = (workedSeconds / totalWorkSeconds) * 100;
        
        // 限制在0-100范围内
        const limitedPercentage = Math.min(100, Math.max(0, progressPercentage));
        
        // 更新进度条UI
        progressBarElement.style.height = limitedPercentage + '%';
        progressPercentageElement.textContent = Math.round(limitedPercentage) + '%';
    }
    
    // 立即更新各项数据1
    updateWorkStatus();
    updateTimer();
    updateIncome();
    updateProgressBar();
    
    // 设置定时更新
    setInterval(updateCurrentTime, 1000); // 每秒更新当前时间
    setInterval(updateWorkStatus, 1000); // 每秒更新工作状态
    setInterval(updateTimer, 10); // 每10毫秒更新计时器
    setInterval(updateIncome, 100); // 每100毫秒更新收入
    setInterval(updateProgressBar, 1000); // 每秒更新进度条
    
    // 返回按钮事件
    document.getElementById('back-button').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}); 
