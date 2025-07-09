(() => {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    let isPainting = false, activeTool = 'brush', strokeColor = '#000', strokeWidth = 5;
    let startX, startY, snapshot;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const start = e => {
        isPainting = true;
        [startX, startY] = [e.offsetX, e.offsetY];
        ctx.beginPath();
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    const end = () => (isPainting = false, ctx.beginPath());

    const draw = e => {
        if (!isPainting) return;
        const [x, y] = [e.offsetX, e.offsetY];
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = activeTool === 'eraser' ? '#fff' : strokeColor;
        ctx.lineCap = ctx.lineJoin = 'round';
        if (['line', 'rectangle', 'circle'].includes(activeTool)) ctx.putImageData(snapshot, 0, 0);

        const tools = {
            brush: () => (ctx.lineTo(x, y), ctx.stroke()),
            eraser: () => (ctx.lineTo(x, y), ctx.stroke()),
            line: () => { ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke(); },
            rectangle: () => ctx.strokeRect(startX, startY, x - startX, y - startY),
            circle: () => {
                const r = Math.hypot(x - startX, y - startY);
                ctx.beginPath(); ctx.arc(startX, startY, r, 0, 2 * Math.PI); ctx.stroke();
            }
        };

        tools[activeTool]?.();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('mousemove', draw);

    const setActive = (els, cls, cb) => els.forEach(el => {
        el.addEventListener('click', () => {
            document.querySelector(`.${cls}.active`)?.classList.remove('active');
            el.classList.add('active');
            cb(el);
        });
    });

    setActive(document.querySelectorAll('.tool'), 'tool', el => {
        activeTool = el.dataset.tool;
        updateCursor();
    });

    setActive(document.querySelectorAll('.color-box'), 'color-box', el => {
        strokeColor = el.dataset.color;
    });

    document.getElementById('clear-canvas').addEventListener('click', () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById('save-image').addEventListener('click', e => {
        e.currentTarget.href = canvas.toDataURL('image/png');
    });

    const cursors = {
        brush: 'crosshair',
        eraser: 'cell',
        line: 'cell',
        rectangle: 'cell',
        circle: 'cell'
    };

    function updateCursor() {
        canvas.style.cursor = cursors[activeTool] || 'default';
    }

    updateCursor();
})();
