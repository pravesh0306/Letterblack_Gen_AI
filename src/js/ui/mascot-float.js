// mascot-float.js
// Handles floating mascot functionality

document.addEventListener('DOMContentLoaded', function() {
    const floatingMascot = document.getElementById('floating-mascot');
    let clickCount = 0;
    function handleFloatingMascotClick() {
        clickCount++;
        if (clickCount % 3 === 0) {
            floatingMascot.classList.add('animate-spin');
            setTimeout(() => floatingMascot.classList.remove('animate-spin'), 1200);
        } else {
            floatingMascot.classList.add('animate-bounce');
            setTimeout(() => floatingMascot.classList.remove('animate-bounce'), 800);
        }
    }
    if (floatingMascot) {
        floatingMascot.addEventListener('click', handleFloatingMascotClick);
        floatingMascot.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.08)';
        });
        floatingMascot.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        function randomGentleAnimation() {
            if (Math.random() < 0.4) {
                const gentleAnims = ['animate-pulse', 'animate-bounce'];
                const randomAnim = gentleAnims[Math.floor(Math.random() * gentleAnims.length)];
                floatingMascot.classList.add(randomAnim);
                setTimeout(() => {
                    floatingMascot.classList.remove(randomAnim);
                }, 1000);
            }
        }
        function scheduleNextAnimation() {
            const delay = 8000 + Math.random() * 4000;
            setTimeout(() => {
                randomGentleAnimation();
                scheduleNextAnimation();
            }, delay);
        }
        scheduleNextAnimation();
        function scheduleTooltipUpdate() {
            const delay = 6000 + Math.random() * 4000;
            setTimeout(() => {
                if (typeof updateTooltip === 'function') updateTooltip();
                scheduleTooltipUpdate();
            }, delay);
        }
        scheduleTooltipUpdate();
    }
});

// Drag-and-drop functionality for floating mascot
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const mascot = document.getElementById('floating-mascot');
        if (!mascot) return;
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        mascot.addEventListener('mousedown', function(e) {
            isDragging = true;
            mascot.classList.add('dragging');
            const rect = mascot.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            mascot.style.position = 'fixed';
            mascot.style.left = (e.clientX - offsetX) + 'px';
            mascot.style.top = (e.clientY - offsetY) + 'px';
            mascot.style.right = '';
            mascot.style.bottom = '';
        });
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                mascot.classList.remove('dragging');
                document.body.style.userSelect = '';
            }
        });
    });
})();
