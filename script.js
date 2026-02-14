/* =====================================================================
   FaceRead — Face & Emotion Detector
   Uses: face-api.js (TensorFlow.js backend)
   Models are loaded from CDN — no local download needed!
   ===================================================================== */

// ── Model source (CDN — no download needed!) ──────────────────────────
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// ── DOM refs ──────────────────────────────────────────────────────────
const video         = document.getElementById('video');
const canvas        = document.getElementById('overlay');
const startBtn      = document.getElementById('startBtn');
const stopBtn       = document.getElementById('stopBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const faceCountEl   = document.getElementById('faceCount');
const fpsEl         = document.getElementById('fpsDisplay');
const dominantEl    = document.getElementById('dominantEmotion');
const dominantConf  = document.getElementById('dominantConf');
const ageEl         = document.getElementById('ageDisplay');
const genderEl      = document.getElementById('genderDisplay');
const emotionBars   = document.getElementById('emotionBars');
const noFaceMsg     = document.getElementById('noFaceMsg');
const detectionData = document.getElementById('detectionData');
const logBox        = document.getElementById('log');

// ── State ─────────────────────────────────────────────────────────────
let stream         = null;
let animFrameId    = null;
let modelsLoaded   = false;
let lastFrameTime  = performance.now();
let frameCount     = 0;
let fps            = 0;

// ── Emotion colour palette ─────────────────────────────────────────────
const EMOTION_COLORS = {
  happy:     '#00ff9d',
  surprised: '#00e5ff',
  neutral:   '#7ec8e3',
  sad:       '#4a90d9',
  fearful:   '#9b59b6',
  disgusted: '#e67e22',
  angry:     '#ff6b35',
};

const EMOTION_ORDER = ['happy','surprised','neutral','sad','fearful','disgusted','angry'];

// ── Log helper ────────────────────────────────────────────────────────
function log(msg, type = '') {
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${ts}] ${msg}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

// ── Status helpers ────────────────────────────────────────────────────
function setStatus(text, state) {
  statusText.textContent = text;
  statusDot.className    = `dot ${state}`;
}

// ── Load Models ───────────────────────────────────────────────────────
async function loadModels() {
  setStatus('LOADING MODELS...', '');
  log('Loading neural network models from CDN...');
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    setStatus('MODELS READY', 'ready');
    startBtn.disabled = false;
    log('All models loaded successfully.', 'ok');
    log('Click ▶ START CAMERA to begin.', 'info');
  } catch (err) {
    setStatus('MODEL LOAD ERROR', 'error');
    log(`ERROR: ${err.message}`, 'warn');
    log('Check your internet connection and refresh.', 'warn');
    console.error(err);
  }
}

// ── Start Camera ──────────────────────────────────────────────────────
async function startCamera() {
  if (!modelsLoaded) { log('Models not ready yet.', 'warn'); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    });
    video.srcObject = stream;
    await new Promise(res => (video.onloadedmetadata = res));
    // Sync canvas size to video
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    setStatus('SCANNING...', 'active');
    startBtn.disabled      = true;
    stopBtn.disabled       = false;
    screenshotBtn.disabled = false;
    log('Camera started.', 'ok');
    log(`Resolution: ${video.videoWidth}×${video.videoHeight}`, 'info');
    detectLoop();
  } catch (err) {
    setStatus('CAMERA ERROR', 'error');
    const msg = err.name === 'NotAllowedError'
      ? 'Camera permission denied. Please allow camera access.'
      : err.message;
    log(`CAMERA ERROR: ${msg}`, 'warn');
  }
}

// ── Stop Camera ───────────────────────────────────────────────────────
function stopCamera() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = animFrameId = null;
  video.srcObject = null;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  resetDataPanel();
  setStatus('MODELS READY', 'ready');
  startBtn.disabled      = false;
  stopBtn.disabled       = true;
  screenshotBtn.disabled = true;
  log('Camera stopped.', 'warn');
}

// ── Main detection loop ───────────────────────────────────────────────
async function detectLoop() {
  if (!stream) return;

  const now = performance.now();
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
    fpsEl.textContent = `${fps} fps`;
    frameCount = 0;
    lastFrameTime = now;
  }

  // Run detection every frame (TinyFaceDetector is lightweight)
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
    .withFaceExpressions()
    .withAgeAndGender();

  drawOverlay(detections);
  updateDataPanel(detections);

  animFrameId = requestAnimationFrame(detectLoop);
}

// ── Draw overlay ──────────────────────────────────────────────────────
function drawOverlay(detections) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detections || detections.length === 0) return;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  const resized = faceapi.resizeResults(detections, displaySize);

  resized.forEach(det => {
    const { x, y, width, height } = det.detection.box;
    const expressions  = det.expressions;
    const topEmotion   = getTopEmotion(expressions);
    const color        = EMOTION_COLORS[topEmotion.name] || '#00e5ff';
    const conf         = Math.round(det.detection.score * 100);
    const age          = Math.round(det.age);
    const gender       = det.gender;

    // ── Bounding box ──
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 14;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur  = 0;

    // Corner ticks
    const tk = 14; // tick length
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3;
    [[x,y],[x+width,y],[x,y+height],[x+width,y+height]].forEach(([cx,cy]) => {
      const dx = cx === x ? 1 : -1;
      const dy = cy === y ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * tk); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * tk, cy);
      ctx.stroke();
    });

    // ── Label background ──
    const label    = `${topEmotion.name.toUpperCase()} ${Math.round(topEmotion.score*100)}%`;
    const subLabel = `${gender} · ~${age}yr · det:${conf}%`;
    ctx.font       = 'bold 13px "Share Tech Mono", monospace';
    const lw       = Math.max(ctx.measureText(label).width, ctx.measureText(subLabel).width) + 16;
    const lx       = x;
    const ly       = y > 40 ? y - 40 : y + height + 4;

    ctx.fillStyle  = 'rgba(0,0,0,.75)';
    ctx.fillRect(lx, ly, lw, 36);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.strokeRect(lx, ly, lw, 36);

    // Label text
    ctx.shadowColor = color; ctx.shadowBlur = 6;
    ctx.fillStyle   = color;
    ctx.fillText(label, lx + 8, ly + 15);
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = '#7ec8e3';
    ctx.font        = '11px "Share Tech Mono", monospace';
    ctx.fillText(subLabel, lx + 8, ly + 30);

    // ── Mini emotion bars under face ──
    const barW = width;
    const barY = y + height + (y > 40 ? 6 : 46);
    const barH = 5;
    EMOTION_ORDER.forEach((emo, i) => {
      const val  = expressions[emo] || 0;
      const bx   = x + (barW / EMOTION_ORDER.length) * i;
      const bw   = barW / EMOTION_ORDER.length - 1;
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect(bx, barY, bw, barH + 20);
      ctx.fillStyle = EMOTION_COLORS[emo];
      ctx.fillRect(bx, barY + barH + 20 - (barH + 20) * val, bw, (barH + 20) * val);
    });
  });
}

// ── Update data panel ─────────────────────────────────────────────────
function updateDataPanel(detections) {
  if (!detections || detections.length === 0) {
    noFaceMsg.style.display    = '';
    detectionData.style.display = 'none';
    faceCountEl.textContent    = '0';
    fpsEl.textContent          = `${fps} fps`;
    return;
  }

  noFaceMsg.style.display    = 'none';
  detectionData.style.display = '';

  faceCountEl.textContent = detections.length;

  // Use first detected face for the sidebar
  const det       = detections[0];
  const topEmotion = getTopEmotion(det.expressions);
  const age        = Math.round(det.age);
  const gender     = det.gender;
  const genderConf = Math.round(det.genderProbability * 100);

  dominantEl.textContent   = topEmotion.name;
  dominantEl.style.color   = EMOTION_COLORS[topEmotion.name] || 'var(--accent2)';
  dominantEl.style.textShadow = `0 0 20px ${EMOTION_COLORS[topEmotion.name] || 'var(--accent2)'}`;
  dominantConf.textContent = `${Math.round(topEmotion.score * 100)}% confidence`;

  ageEl.textContent    = `~${age} yrs`;
  genderEl.textContent = `${gender} (${genderConf}%)`;

  // Emotion bars
  emotionBars.innerHTML = '';
  const sorted = EMOTION_ORDER
    .map(name => ({ name, score: det.expressions[name] || 0 }))
    .sort((a, b) => b.score - a.score);

  sorted.forEach(({ name, score }) => {
    const pct   = Math.round(score * 100);
    const color = EMOTION_COLORS[name] || '#fff';
    const row   = document.createElement('div');
    row.className = 'emotion-row';
    row.innerHTML = `
      <div class="emotion-header">
        <span class="emotion-name">${name}</span>
        <span class="emotion-pct">${pct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;background:${color};box-shadow: 0 0 6px ${color}"></div>
      </div>`;
    emotionBars.appendChild(row);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────
function getTopEmotion(expressions) {
  let top = { name: 'neutral', score: 0 };
  for (const [name, score] of Object.entries(expressions)) {
    if (score > top.score) top = { name, score };
  }
  return top;
}

function resetDataPanel() {
  noFaceMsg.style.display    = '';
  detectionData.style.display = 'none';
  faceCountEl.textContent    = '0';
  fpsEl.textContent          = '—';
  dominantEl.textContent     = '—';
  dominantConf.textContent   = '';
  ageEl.textContent          = '—';
  genderEl.textContent       = '—';
  emotionBars.innerHTML      = '';
}

// ── Screenshot ────────────────────────────────────────────────────────
function takeScreenshot() {
  const tmp = document.createElement('canvas');
  tmp.width  = video.videoWidth;
  tmp.height = video.videoHeight;
  const ctx = tmp.getContext('2d');
  // Draw mirrored video
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -tmp.width, 0, tmp.width, tmp.height);
  ctx.restore();
  // Overlay detections
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, -tmp.width, 0, tmp.width, tmp.height);
  ctx.restore();

  const link = document.createElement('a');
  link.download = `faceread-${Date.now()}.png`;
  link.href      = tmp.toDataURL('image/png');
  link.click();
  log('Screenshot saved!', 'ok');
}

// ── Event listeners ───────────────────────────────────────────────────
startBtn.addEventListener('click',      startCamera);
stopBtn.addEventListener('click',       stopCamera);
screenshotBtn.addEventListener('click', takeScreenshot);

// ── Boot ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  startBtn.disabled = true; // until models are loaded
  loadModels();
});
