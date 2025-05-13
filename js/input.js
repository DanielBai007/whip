// 粒子背景配置
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#00f3ff'
        },
        shape: {
            type: 'circle',
            stroke: {
                width: 0,
                color: '#000000'
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.5,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ff00ff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 1
                }
            },
            bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3
            },
            repulse: {
                distance: 200,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            },
            remove: {
                particles_nb: 2
            }
        }
    },
    retina_detect: true
});

// 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 工作天数滑块的实时更新
    const workingDaysSlider = document.getElementById('working-days');
    const daysValueSpan = document.getElementById('days-value');
    
    workingDaysSlider.addEventListener('input', function() {
        daysValueSpan.textContent = this.value;
    });
    
    // 上下班时间验证
    const workStartTime = document.getElementById('work-start-time');
    const workEndTime = document.getElementById('work-end-time');
    
    // 验证结束时间必须晚于开始时间
    workEndTime.addEventListener('change', function() {
        if (workStartTime.value >= workEndTime.value) {
            alert('下班时间必须晚于上班时间！');
            // 默认设置为上班时间后8小时
            const startDate = new Date(`2000-01-01T${workStartTime.value}`);
            startDate.setHours(startDate.getHours() + 8);
            const hours = String(startDate.getHours()).padStart(2, '0');
            const minutes = String(startDate.getMinutes()).padStart(2, '0');
            workEndTime.value = `${hours}:${minutes}`;
        }
    });
    
    workStartTime.addEventListener('change', function() {
        if (workStartTime.value >= workEndTime.value) {
            // 默认设置为开始时间后8小时
            const startDate = new Date(`2000-01-01T${workStartTime.value}`);
            startDate.setHours(startDate.getHours() + 8);
            const hours = String(startDate.getHours()).padStart(2, '0');
            const minutes = String(startDate.getMinutes()).padStart(2, '0');
            workEndTime.value = `${hours}:${minutes}`;
        }
    });
    
    // 主题切换
    const themeSelect = document.getElementById('theme');
    
    themeSelect.addEventListener('change', function() {
        document.body.classList.remove('theme-cyberpunk', 'theme-minimal', 'theme-neon');
        
        switch(this.value) {
            case 'cyberpunk':
                document.body.classList.add('theme-cyberpunk');
                break;
            case 'minimal':
                document.body.classList.add('theme-minimal');
                break;
            case 'neon':
                document.body.classList.add('theme-neon');
                break;
        }
    });
    
    // 表单提交处理
    const salaryForm = document.getElementById('salary-form');
    
    salaryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const monthlySalary = document.getElementById('monthly-salary').value;
        const workingDays = document.getElementById('working-days').value;
        const workStartTime = document.getElementById('work-start-time').value;
        const workEndTime = document.getElementById('work-end-time').value;
        const currency = document.getElementById('currency').value;
        const theme = document.getElementById('theme').value;
        
        // 验证输入
        if (!monthlySalary || monthlySalary <= 0) {
            alert('请输入有效的月薪！');
            return;
        }
        
        // 计算每日工作时长（小时）
        const startTimeParts = workStartTime.split(':');
        const endTimeParts = workEndTime.split(':');
        const startHours = parseInt(startTimeParts[0]) + parseInt(startTimeParts[1])/60;
        const endHours = parseInt(endTimeParts[0]) + parseInt(endTimeParts[1])/60;
        const workHoursPerDay = endHours - startHours;
        
        if (workHoursPerDay <= 0) {
            alert('工作时间设置有误，下班时间必须晚于上班时间！');
            return;
        }
        
        // 按钮动画效果
        const startButton = document.getElementById('start-button');
        startButton.classList.add('active');
        
        // 保存数据到localStorage - 确保使用最新的时间戳
        const userData = {
            monthlySalary: parseFloat(monthlySalary),
            workingDays: parseInt(workingDays),
            workStartTime: workStartTime,
            workEndTime: workEndTime,
            workHoursPerDay: workHoursPerDay,
            currency: currency,
            theme: theme,
            startTime: new Date().getTime() // 使用最新的时间戳
        };
        
        // 清除上次仪表板访问的记录，确保重新计算
        localStorage.removeItem('lastDashboardVisit');
        
        localStorage.setItem('salaryData', JSON.stringify(userData));
        
        // 添加延迟，展示按钮动画效果
        setTimeout(function() {
            // 跳转到看板页面
            window.location.href = 'dashboard.html';
        }, 500);
    });
    
    // 检查是否有之前的数据，如果有则自动填充
    const savedData = localStorage.getItem('salaryData');
    if (savedData) {
        const userData = JSON.parse(savedData);
        
        document.getElementById('monthly-salary').value = userData.monthlySalary;
        document.getElementById('working-days').value = userData.workingDays;
        daysValueSpan.textContent = userData.workingDays;
        
        // 填充工作时间
        if (userData.workStartTime) {
            document.getElementById('work-start-time').value = userData.workStartTime;
        }
        if (userData.workEndTime) {
            document.getElementById('work-end-time').value = userData.workEndTime;
        }
        
        document.getElementById('currency').value = userData.currency;
        document.getElementById('theme').value = userData.theme;
        
        // 应用主题
        document.body.classList.add('theme-' + userData.theme);
    }
}); 