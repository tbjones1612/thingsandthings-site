const uploadInput = document.getElementById("diced-upload");
const scaleInput = document.getElementById("diced-scale");
const scaleValue = document.getElementById("diced-scale-value");
const bgInput = document.getElementById("diced-bg");
const contrastButton = document.getElementById("diced-contrast");
const downloadButton = document.getElementById("diced-download");
const canvas = document.getElementById("diced-canvas");
const emptyState = document.getElementById("diced-empty");
const preview = document.getElementById("diced-preview");
const previewImage = document.getElementById("diced-preview-image");
const previewClose = document.getElementById("diced-preview-close");
const ctx = canvas.getContext("2d");

const sampleCanvas = document.createElement("canvas");
const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

let sourceImage = null;
let contrastMode = "MD";
const contrastModes = ["MD", "HI", "LO"];
const defaultScale = 17;
const uploadScale = Math.round((Number(scaleInput.min) + Number(scaleInput.max)) / 2);
const contrastFactors = {
    LO: 0.72,
    MD: 1,
    HI: 1.35,
};

const diceGradient = [
    { value: 1, fill: "#000", pip: "#fff" },
    { value: 2, fill: "#000", pip: "#fff" },
    { value: 3, fill: "#000", pip: "#fff" },
    { value: 4, fill: "#000", pip: "#fff" },
    { value: 5, fill: "#000", pip: "#fff" },
    { value: 6, fill: "#000", pip: "#fff" },
    { value: 6, fill: "#fff", pip: "#000" },
    { value: 5, fill: "#fff", pip: "#000" },
    { value: 4, fill: "#fff", pip: "#000" },
    { value: 3, fill: "#fff", pip: "#000" },
    { value: 2, fill: "#fff", pip: "#000" },
    { value: 1, fill: "#fff", pip: "#000" },
];

const pipLayouts = {
    1: [[0.5, 0.5]],
    2: [[0.3, 0.3], [0.7, 0.7]],
    3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]],
    4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
    5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]],
    6: [[0.3, 0.25], [0.7, 0.25], [0.3, 0.5], [0.7, 0.5], [0.3, 0.75], [0.7, 0.75]],
};

function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
}

function drawDie(x, y, size, die) {
    const gap = Math.max(1, size * 0.08);
    const dieSize = size - gap;
    const radius = Math.max(2, dieSize * 0.14);
    const pipRadius = Math.max(1.15, dieSize * 0.085);

    roundedRect(ctx, x + gap / 2, y + gap / 2, dieSize, dieSize, radius);
    ctx.fillStyle = die.fill;
    ctx.fill();

    ctx.fillStyle = die.pip;
    for (const [px, py] of pipLayouts[die.value]) {
        ctx.beginPath();
        ctx.arc(x + gap / 2 + dieSize * px, y + gap / 2 + dieSize * py, pipRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function applyContrast(brightness) {
    const factor = contrastFactors[contrastMode];
    return Math.max(0, Math.min(255, 128 + (brightness - 128) * factor));
}

function brightnessToDie(brightness) {
    const adjustedBrightness = applyContrast(brightness);
    const index = Math.min(diceGradient.length - 1, Math.floor((adjustedBrightness / 256) * diceGradient.length));
    return diceGradient[index];
}

function renderDicedImage() {
    scaleValue.value = scaleInput.value;

    if (!sourceImage) {
        return;
    }

    const dieSize = Number(scaleInput.value);
    let columns = Math.max(1, Math.floor(sourceImage.naturalWidth / dieSize));
    let rows = Math.max(1, Math.floor(sourceImage.naturalHeight / dieSize));
    const gridLimit = Math.min(1, 220 / columns, 220 / rows);

    columns = Math.max(1, Math.floor(columns * gridLimit));
    rows = Math.max(1, Math.floor(rows * gridLimit));

    sampleCanvas.width = columns;
    sampleCanvas.height = rows;
    sampleCtx.drawImage(sourceImage, 0, 0, columns, rows);

    let pixels;

    try {
        pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
    } catch (error) {
        emptyState.textContent = "Choose an image";
        canvas.hidden = true;
        emptyState.hidden = false;
        downloadButton.disabled = true;
        return;
    }
    canvas.width = columns * dieSize;
    canvas.height = rows * dieSize;

    ctx.fillStyle = bgInput.checked ? "#fff" : "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            const index = (row * columns + column) * 4;
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const alpha = pixels[index + 3] / 255;
            const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) * alpha + 255 * (1 - alpha);
            drawDie(column * dieSize, row * dieSize, dieSize, brightnessToDie(brightness));
        }
    }

    canvas.hidden = false;
    emptyState.hidden = true;
    downloadButton.disabled = false;
}

uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];

    if (!file) {
        return;
    }

    const image = new Image();
    image.addEventListener("load", () => {
        sourceImage = image;
        scaleInput.value = uploadScale;
        bgInput.checked = false;
        URL.revokeObjectURL(image.src);
        renderDicedImage();
    });
    image.src = URL.createObjectURL(file);
});

scaleInput.addEventListener("input", renderDicedImage);
bgInput.addEventListener("change", renderDicedImage);

contrastButton.addEventListener("click", () => {
    const nextIndex = (contrastModes.indexOf(contrastMode) + 1) % contrastModes.length;
    contrastMode = contrastModes[nextIndex];
    contrastButton.textContent = contrastMode;
    contrastButton.setAttribute("aria-label", `Contrast: ${contrastMode.toLowerCase()}`);
    renderDicedImage();
});

downloadButton.addEventListener("click", () => {
    if (!sourceImage) {
        return;
    }

    const link = document.createElement("a");
    link.download = "diced-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

function openPreview() {
    if (!sourceImage) {
        return;
    }

    previewImage.src = canvas.toDataURL("image/png");
    preview.setAttribute("aria-hidden", "false");
    document.body.classList.add("diced-preview-open");
}

function closePreview() {
    preview.setAttribute("aria-hidden", "true");
    document.body.classList.remove("diced-preview-open");
}

canvas.addEventListener("click", openPreview);

preview.addEventListener("click", (event) => {
    if (event.target === preview) {
        closePreview();
    }
});

previewClose.addEventListener("click", closePreview);
previewImage.addEventListener("click", closePreview);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closePreview();
    }
});

function loadDefaultImage() {
    scaleInput.value = defaultScale;
    scaleValue.value = defaultScale;
    bgInput.checked = false;

    const image = new Image();
    image.addEventListener("load", () => {
        sourceImage = image;
        renderDicedImage();
    });
    image.src = typeof DEFAULT_DICE_IMAGE_SRC === "string" ? DEFAULT_DICE_IMAGE_SRC : "./diced/test_dice.png";
}

loadDefaultImage();
