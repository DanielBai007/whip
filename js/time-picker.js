/**
 * 时间轮盘选择器组件
 * 提供直观的时钟式时间选择功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 时间选择器DOM元素
    const timePickerContainer = document.getElementById('time-picker-container');
    const timePickerBackdrop = document.querySelector('.time-picker-backdrop');
    const timePickerCloseBtn = document.querySelector('.time-picker-close');
    const hourDisplay = document.querySelector('.time-picker-hour');
    const minuteDisplay = document.querySelector('.time-picker-minute');
    const clockHoursContainer = document.querySelector('.time-picker-clock-hours');
    const clockMinutesContainer = document.querySelector('.time-picker-clock-minutes');
    const clockHand = document.querySelector('.time-picker-clock-hand');
    const confirmButton = document.getElementById('time-picker-confirm');
    const cancelButton = document.getElementById('time-picker-cancel');
    
    // 时间输入相关元素
    const startTimeInput = document.getElementById('work-start-time');
    const endTimeInput = document.getElementById('work-end-time');
    const startTimeToggle = document.getElementById('start-time-picker-toggle');
    const endTimeToggle = document.getElementById('end-time-picker-toggle');
    
    // 当前活动的输入框和选择模式
    let activeInput = null;
    let isHourMode = true; // true表示选择小时，false表示选择分钟
    
    // 初始化时钟刻度
    initClock();
    
    // 打开时间选择器
    function openTimePicker(inputElement) {
        activeInput = inputElement;
        
        // 解析当前输入框的时间值
        let timeValue = inputElement.value || '00:00';
        let [hours, minutes] = timeValue.split(':').map(Number);
        
        // 更新显示的时间
        updateDisplayTime(hours, minutes);
        
        // 默认从小时开始选择
        switchToHourMode();
        
        // 显示时间选择器
        timePickerContainer.classList.add('active');
        
        // 根据当前小时设置时钟指针位置
        setClockHandPosition(hours * 30); // 每小时30度
    }
    
    // 关闭时间选择器
    function closeTimePicker() {
        timePickerContainer.classList.remove('active');
        activeInput = null;
    }
    
    // 更新显示的时间
    function updateDisplayTime(hours, minutes) {
        hourDisplay.textContent = hours.toString().padStart(2, '0');
        minuteDisplay.textContent = minutes.toString().padStart(2, '0');
    }
    
    // 切换到小时选择模式
    function switchToHourMode() {
        isHourMode = true;
        hourDisplay.classList.add('active');
        minuteDisplay.classList.remove('active');
        clockHoursContainer.classList.remove('hide');
        clockMinutesContainer.classList.add('hide');
        
        // 更新小时刻度的激活状态
        updateHourNumbers();
    }
    
    // 切换到分钟选择模式
    function switchToMinuteMode() {
        isHourMode = false;
        hourDisplay.classList.remove('active');
        minuteDisplay.classList.add('active');
        clockHoursContainer.classList.add('hide');
        clockMinutesContainer.classList.remove('hide');
        
        // 更新分钟刻度的激活状态
        updateMinuteNumbers();
    }
    
    // 初始化时钟刻度
    function initClock() {
        // 生成小时刻度 (1-12)
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30) - 90; // 每小时30度，从12点钟方向开始(-90度)
            const x = 110 * Math.cos(angle * Math.PI / 180) + 120; // 半径为110
            const y = 110 * Math.sin(angle * Math.PI / 180) + 120;
            
            const hourNumber = document.createElement('div');
            hourNumber.className = 'time-picker-clock-number hour-number';
            hourNumber.textContent = i;
            hourNumber.dataset.value = i;
            hourNumber.style.left = `${x}px`;
            hourNumber.style.top = `${y}px`;
            
            hourNumber.addEventListener('click', function() {
                const hour = parseInt(this.dataset.value);
                selectHour(hour);
            });
            
            clockHoursContainer.appendChild(hourNumber);
        }
        
        // 生成分钟刻度 (0, 5, 10, 15, ..., 55)
        for (let i = 0; i < 12; i++) {
            const minute = i * 5;
            const angle = (i * 30) - 90; // 每5分钟30度
            const x = 110 * Math.cos(angle * Math.PI / 180) + 120;
            const y = 110 * Math.sin(angle * Math.PI / 180) + 120;
            
            const minuteNumber = document.createElement('div');
            minuteNumber.className = 'time-picker-clock-number minute-number';
            minuteNumber.textContent = minute.toString().padStart(2, '0');
            minuteNumber.dataset.value = minute;
            minuteNumber.style.left = `${x}px`;
            minuteNumber.style.top = `${y}px`;
            
            minuteNumber.addEventListener('click', function() {
                const minute = parseInt(this.dataset.value);
                selectMinute(minute);
            });
            
            clockMinutesContainer.appendChild(minuteNumber);
        }
    }
    
    // 更新小时刻度的激活状态
    function updateHourNumbers() {
        const selectedHour = parseInt(hourDisplay.textContent);
        
        // 移除所有激活状态
        document.querySelectorAll('.hour-number').forEach(el => {
            el.classList.remove('active');
        });
        
        // 添加当前选中小时的激活状态
        document.querySelectorAll('.hour-number').forEach(el => {
            if (parseInt(el.dataset.value) === selectedHour) {
                el.classList.add('active');
            }
        });
        
        // 设置时钟指针的位置
        const hourAngle = ((selectedHour % 12) * 30) || 360; // 12点时为360度，而不是0度
        setClockHandPosition(hourAngle);
    }
    
    // 更新分钟刻度的激活状态
    function updateMinuteNumbers() {
        const selectedMinute = parseInt(minuteDisplay.textContent);
        const closestFiveMin = Math.round(selectedMinute / 5) * 5; // 找到最接近的5的倍数
        
        // 移除所有激活状态
        document.querySelectorAll('.minute-number').forEach(el => {
            el.classList.remove('active');
        });
        
        // 添加当前选中分钟的激活状态
        document.querySelectorAll('.minute-number').forEach(el => {
            if (parseInt(el.dataset.value) === closestFiveMin || 
                (closestFiveMin === 60 && parseInt(el.dataset.value) === 0)) {
                el.classList.add('active');
            }
        });
        
        // 设置时钟指针的位置
        const minuteAngle = selectedMinute * 6; // 每分钟6度
        setClockHandPosition(minuteAngle);
    }
    
    // 设置时钟指针的位置
    function setClockHandPosition(angle) {
        clockHand.style.transform = `translateY(-50%) rotate(${angle}deg)`;
    }
    
    // 选择小时
    function selectHour(hour) {
        hourDisplay.textContent = hour.toString().padStart(2, '0');
        updateHourNumbers();
        
        // 选择小时后自动切换到分钟选择
        setTimeout(() => {
            switchToMinuteMode();
        }, 300);
    }
    
    // 选择分钟
    function selectMinute(minute) {
        minuteDisplay.textContent = minute.toString().padStart(2, '0');
        updateMinuteNumbers();
    }
    
    // 确认选择的时间
    function confirmTime() {
        if (activeInput) {
            const selectedHour = hourDisplay.textContent;
            const selectedMinute = minuteDisplay.textContent;
            activeInput.value = `${selectedHour}:${selectedMinute}`;
            
            // 如果改变了上班时间或下班时间，检查时间逻辑
            validateWorkTimes();
            
            closeTimePicker();
        }
    }
    
    // 验证上班和下班时间的逻辑关系
    function validateWorkTimes() {
        if (startTimeInput.value >= endTimeInput.value) {
            alert('下班时间必须晚于上班时间！');
            
            // 如果是调整上班时间导致的问题，自动调整下班时间
            if (activeInput === startTimeInput) {
                // 将下班时间设置为上班时间后8小时
                const startDate = new Date(`2000-01-01T${startTimeInput.value}`);
                startDate.setHours(startDate.getHours() + 8);
                const hours = String(startDate.getHours()).padStart(2, '0');
                const minutes = String(startDate.getMinutes()).padStart(2, '0');
                endTimeInput.value = `${hours}:${minutes}`;
            }
            // 如果是调整下班时间导致的问题，重置为上班时间后8小时
            else if (activeInput === endTimeInput) {
                const startDate = new Date(`2000-01-01T${startTimeInput.value}`);
                startDate.setHours(startDate.getHours() + 8);
                const hours = String(startDate.getHours()).padStart(2, '0');
                const minutes = String(startDate.getMinutes()).padStart(2, '0');
                endTimeInput.value = `${hours}:${minutes}`;
            }
        }
    }
    
    // 事件监听
    // 时间选择器切换开关
    startTimeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        openTimePicker(startTimeInput);
    });
    
    endTimeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        openTimePicker(endTimeInput);
    });
    
    // 添加对整个输入框的点击事件监听
    startTimeInput.addEventListener('click', function(e) {
        e.preventDefault();
        openTimePicker(startTimeInput);
    });
    
    endTimeInput.addEventListener('click', function(e) {
        e.preventDefault();
        openTimePicker(endTimeInput);
    });
    
    // 点击小时和分钟显示，切换选择模式
    hourDisplay.addEventListener('click', switchToHourMode);
    minuteDisplay.addEventListener('click', switchToMinuteMode);
    
    // 确认和取消按钮
    confirmButton.addEventListener('click', confirmTime);
    cancelButton.addEventListener('click', closeTimePicker);
    
    // 点击背景或关闭按钮关闭时间选择器
    timePickerBackdrop.addEventListener('click', closeTimePicker);
    timePickerCloseBtn.addEventListener('click', closeTimePicker);
    
    // 时钟面板拖动选择功能
    const clockElement = document.querySelector('.time-picker-clock');
    
    function handleClockInteraction(event) {
        // 获取鼠标相对于时钟中心的位置
        const rect = clockElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // 计算坐标，兼容触摸和鼠标事件
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        if (!clientX || !clientY) return;
        
        const x = clientX - rect.left - centerX;
        const y = clientY - rect.top - centerY;
        
        // 计算角度（弧度）
        let angle = Math.atan2(y, x);
        
        // 将弧度转换为度数，并调整以使12点钟方向为0度
        let degrees = angle * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        
        if (isHourMode) {
            // 计算小时（1-12）
            let hour = Math.round(degrees / 30);
            if (hour === 0) hour = 12;
            if (hour === 12 && degrees < 15) hour = 12;
            selectHour(hour);
        } else {
            // 计算分钟（0-55，步长为5）
            let minute = Math.round(degrees / 6);
            if (minute >= 60) minute = 0;
            // 将分钟舍入到最接近的5的倍数
            minute = Math.round(minute / 5) * 5;
            selectMinute(minute);
        }
    }
    
    // 鼠标和触摸事件
    let isDragging = false;
    
    clockElement.addEventListener('mousedown', function(e) {
        isDragging = true;
        handleClockInteraction(e);
    });
    
    clockElement.addEventListener('touchstart', function(e) {
        isDragging = true;
        handleClockInteraction(e);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            handleClockInteraction(e);
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault(); // 防止页面滚动
            handleClockInteraction(e);
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            if (isHourMode) {
                // 选择小时后自动切换到分钟选择
                setTimeout(() => {
                    switchToMinuteMode();
                }, 300);
            }
        }
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            if (isHourMode) {
                // 选择小时后自动切换到分钟选择
                setTimeout(() => {
                    switchToMinuteMode();
                }, 300);
            }
        }
    });
    
    // 初始化时即设置默认模式
    switchToHourMode();
}); 