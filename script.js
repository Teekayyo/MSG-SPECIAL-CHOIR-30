const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas internal resolution
canvas.width = 1080;
canvas.height = 1350;

// Make canvas responsive
function resizeCanvas() {
    const container = canvas.parentElement || document.body;
    const containerWidth = container.clientWidth || window.innerWidth;
    const containerHeight = container.clientHeight || window.innerHeight;
    
    // Calculate the scale to fit the canvas in the viewport
    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY, 0.95);
    
    // Apply the scale
    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
}

// Call resize on load and window resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', function() {
    resizeCanvas();
    draw();
});

const template = new Image();
template.src = "template.png";

const nameInput = document.getElementById("nameInput");
const photoInput = document.getElementById("photoInput");
const positionInput = document.getElementById("positionInput");
const zoomSlider = document.getElementById("zoom");
const zoomValue = document.getElementById("zoomValue");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const FRAME = {
    x: 315,
    y: 250,
    width: 450,
    height: 520
};

const NAME_BOX = {
    x: 160,
    y: 705,
    width: 760,
    height: 80
};

// Position box - positioned below the name box
const POSITION_BOX = {
    x: 160,
    y: 795,
    width: 760,
    height: 45
};

let photo = null;

let state = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0
};

template.onload = draw;

photoInput.addEventListener("change", loadPhoto);

nameInput.addEventListener("input", draw);
positionInput.addEventListener("input", draw);

zoomSlider.addEventListener("input", function() {
    if (!photo) return;
    
    const newZoom = Number(this.value);
    zoomValue.textContent = newZoom.toFixed(1);
    
    const centreX = state.x + (state.width * state.zoom) / 2;
    const centreY = state.y + (state.height * state.zoom) / 2;
    
    state.zoom = newZoom;
    state.x = centreX - (state.width * newZoom) / 2;
    state.y = centreY - (state.height * newZoom) / 2;
    
    draw();
});

resetBtn.addEventListener("click", function() {
    if (!photo) return;
    fitPhoto();
    zoomSlider.value = 1;
    zoomValue.textContent = "1.0";
    state.zoom = 1;
    draw();
});

downloadBtn.addEventListener("click", downloadFlyer);

function loadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(ev) {
        photo = new Image();
        photo.onload = function() {
            fitPhoto();
            draw();
        };
        photo.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function fitPhoto() {
    const scale = Math.max(
        FRAME.width / photo.width,
        FRAME.height / photo.height
    );
    state.width = photo.width * scale;
    state.height = photo.height * scale;
    state.x = FRAME.x + (FRAME.width - state.width) / 2;
    state.y = FRAME.y + (FRAME.height - state.height) / 2;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
    
    if (photo) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            FRAME.x,
            FRAME.y,
            FRAME.width,
            FRAME.height
        );
        ctx.clip();
        ctx.drawImage(
            photo,
            state.x,
            state.y,
            state.width * state.zoom,
            state.height * state.zoom
        );
        ctx.restore();
    }
    
    drawName();
    drawPosition();
}

function drawName() {
    const text = nameInput.value.trim();
    if (text === "") return;

    // Calculate smaller dimensions (10% less from each side)
    const paddingReduction = 0.10;
    const reducedWidth = NAME_BOX.width * (1 - paddingReduction * 2);
    const reducedHeight = NAME_BOX.height * (1 - paddingReduction * 2);
    const offsetX = NAME_BOX.width * paddingReduction;
    const offsetY = NAME_BOX.height * paddingReduction;

    const rectX = NAME_BOX.x + offsetX;
    const rectY = NAME_BOX.y + offsetY;
    const rectWidth = reducedWidth;
    const rectHeight = reducedHeight;

    // Create irregular rectangular shape with cut corners
    ctx.save();
    ctx.beginPath();

    const cutSize = 15;

    ctx.moveTo(rectX + cutSize, rectY);
    ctx.lineTo(rectX + rectWidth - cutSize, rectY);
    ctx.lineTo(rectX + rectWidth, rectY + cutSize);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cutSize);
    ctx.lineTo(rectX + rectWidth - cutSize, rectY + rectHeight);
    ctx.lineTo(rectX + cutSize, rectY + rectHeight);
    ctx.lineTo(rectX, rectY + rectHeight - cutSize);
    ctx.lineTo(rectX, rectY + cutSize);
    ctx.closePath();

    ctx.fillStyle = "#FFFFFF"; // White overlay
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Draw text
    let size = 50;
    ctx.font = "bold " + size + "px Arial";

    while (ctx.measureText(text).width > reducedWidth - 40 && size > 20) {
        size--;
        ctx.font = "bold " + size + "px Arial";
    }

    ctx.fillStyle = "#000080"; // Navy blue
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        text,
        rectX + rectWidth / 2,
        rectY + rectHeight / 2
    );
}

function drawPosition() {
    const position = positionInput.value.trim();
    if (position === "") return;

    // Format: Add brackets around the position
    const formattedText = `(${position})`;

    const rectX = POSITION_BOX.x;
    const rectY = POSITION_BOX.y;
    const rectWidth = POSITION_BOX.width;
    const rectHeight = POSITION_BOX.height;

    // Create irregular rectangular shape with cut corners
    ctx.save();
    ctx.beginPath();

    const cutSize = 10;

    ctx.moveTo(rectX + cutSize, rectY);
    ctx.lineTo(rectX + rectWidth - cutSize, rectY);
    ctx.lineTo(rectX + rectWidth, rectY + cutSize);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cutSize);
    ctx.lineTo(rectX + rectWidth - cutSize, rectY + rectHeight);
    ctx.lineTo(rectX + cutSize, rectY + rectHeight);
    ctx.lineTo(rectX, rectY + rectHeight - cutSize);
    ctx.lineTo(rectX, rectY + cutSize);
    ctx.closePath();

    ctx.fillStyle = "#FFFFFF"; // White overlay
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Draw position text - SMALLER than name
    let size = 28;
    ctx.font = "bold " + size + "px Arial";

    while (ctx.measureText(formattedText).width > rectWidth - 40 && size > 16) {
        size--;
        ctx.font = "bold " + size + "px Arial";
    }

    ctx.fillStyle = "#000080"; // Navy blue
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        formattedText,
        rectX + rectWidth / 2,
        rectY + rectHeight / 2
    );
}

canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

function startDrag(e) {
    if (!photo) return;
    e.preventDefault();
    state.dragging = true;
    state.lastX = e.offsetX;
    state.lastY = e.offsetY;
}

function drag(e) {
    if (!state.dragging || !photo) return;
    e.preventDefault();

    const dx = e.offsetX - state.lastX;
    const dy = e.offsetY - state.lastY;

    state.x += dx;
    state.y += dy;

    const drawWidth = state.width * state.zoom;
    const drawHeight = state.height * state.zoom;

    const minX = FRAME.x + FRAME.width - drawWidth;
    const maxX = FRAME.x;
    const minY = FRAME.y + FRAME.height - drawHeight;
    const maxY = FRAME.y;

    state.x = Math.max(minX, Math.min(maxX, state.x));
    state.y = Math.max(minY, Math.min(maxY, state.y));

    state.lastX = e.offsetX;
    state.lastY = e.offsetY;

    draw();
}

function stopDrag() {
    state.dragging = false;
}

canvas.addEventListener("touchstart", touchStart, { passive: false });
canvas.addEventListener("touchmove", touchMove, { passive: false });
canvas.addEventListener("touchend", touchEnd);

function touchStart(e) {
    if (!photo) return;
    e.preventDefault();
    state.dragging = true;

    const rect = canvas.getBoundingClientRect();
    state.lastX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    state.lastY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
}

function touchMove(e) {
    if (!state.dragging) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);

    state.x += x - state.lastX;
    state.y += y - state.lastY;

    const drawWidth = state.width * state.zoom;
    const drawHeight = state.height * state.zoom;

    const minX = FRAME.x + FRAME.width - drawWidth;
    const maxX = FRAME.x;
    const minY = FRAME.y + FRAME.height - drawHeight;
    const maxY = FRAME.y;

    state.x = Math.min(maxX, Math.max(minX, state.x));
    state.y = Math.min(maxY, Math.max(minY, state.y));

    state.lastX = x;
    state.lastY = y;

    draw();
}

function touchEnd() {
    state.dragging = false;
}

function downloadFlyer() {
    draw();
    const link = document.createElement("a");
    link.download = "flyer.png";
    link.href = canvas.toDataURL("image/png", 1);
    link.click();
}
