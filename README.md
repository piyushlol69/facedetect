# 🤖 FaceRead — Real-Time Face & Emotion Detector

> A browser-based app that uses your webcam to detect faces and read emotions in real time.
> **No installation, no Python, no complicated setup.** Just open a file!

---

## 📸 What Does This App Do?

- 📷 **Activates your webcam** — no data ever leaves your computer
- 🧠 **Detects all faces** in frame using a pre-trained neural network
- 😊 **Reads 7 emotions** — Happy, Sad, Angry, Fearful, Disgusted, Surprised, Neutral
- 🧓 **Estimates age and gender** for each face
- 📊 **Shows live emotion bars** with confidence percentages
- 📸 **Screenshot button** to save a captured frame

---

## 📁 File Structure (What Each File Does)

```
face-emotion-detector/
│
├── index.html      ← The main page (your app's "front door")
├── style.css       ← All the visual styling (colors, layout, fonts)
├── script.js       ← The brain — all the face-detection logic
└── README.md       ← This file you're reading right now!
```

> 🔑 **That's it — just 3 files!** The AI models are loaded automatically from the
> internet (CDN), so you don't need to download anything extra.

---

## 🚀 How to Run It (Super Easy — 3 Ways)

### ✅ Way 1 — Simplest: Open with VS Code Live Server (Recommended)

> ⚠️ You **cannot** just double-click `index.html` in your file explorer —
> browsers block webcam access for files opened that way.
> You need a tiny local server. Here's the easiest way:

**Step 1 — Install VS Code** (if you don't have it)
- Go to: https://code.visualstudio.com/
- Download and install it (it's free!)

**Step 2 — Install the "Live Server" extension**
- Open VS Code
- Click the 4-square icon on the left sidebar (Extensions)
- Search for `Live Server` (by Ritwick Dey)
- Click **Install**

**Step 3 — Open the project folder**
- In VS Code, click **File → Open Folder**
- Select the `face-emotion-detector` folder

**Step 4 — Launch!**
- Right-click on `index.html` in the left file panel
- Click **"Open with Live Server"**
- Your browser opens automatically at `http://127.0.0.1:5500`
- Click **▶ START CAMERA** — done! 🎉

---

### ✅ Way 2 — Use Python (if you have it installed)

**Check if Python is installed:**
Open your terminal / command prompt and type:
```
python --version
```
If you see a version number, Python is installed!

**Run a local server:**
```bash
# Navigate to the project folder
cd path/to/face-emotion-detector

# Python 3
python -m http.server 8080

# Python 2 (older computers)
python -m SimpleHTTPServer 8080
```

Then open your browser and go to: **http://localhost:8080**

---

### ✅ Way 3 — Use GitHub Pages (Put it on the Internet!)

> See the full GitHub section below ↓

---

## 🌐 How to Put This on GitHub & Share With Anyone

Follow every step carefully. You only need to do this once!

### 🔷 Step 1 — Create a GitHub Account

- Go to: https://github.com/
- Click **Sign up** and create a free account
- Verify your email

---

### 🔷 Step 2 — Install Git (the tool that uploads your code)

- **Windows:** Download from https://git-scm.com/download/win → install with default settings
- **Mac:** Open Terminal and type `git --version` — if not installed, it will prompt you to install
- **Linux:** `sudo apt install git`

To check it worked, open Terminal/Command Prompt:
```bash
git --version
# Should show something like: git version 2.x.x
```

---

### 🔷 Step 3 — Create a New Repository on GitHub

1. Log in to GitHub
2. Click the **+** button (top right) → **New repository**
3. Name it: `face-emotion-detector`
4. Make sure it's set to **Public**
5. ❌ Do NOT check "Add a README" (we already have one)
6. Click **Create repository**

You'll see a page with setup instructions — keep it open.

---

### 🔷 Step 4 — Upload Your Files Using Git

Open your Terminal (Mac/Linux) or Git Bash (Windows):

```bash
# 1. Go into your project folder
cd path/to/face-emotion-detector
# Example: cd C:/Users/YourName/Downloads/face-emotion-detector

# 2. Tell git who you are (one time setup)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 3. Start a git project in this folder
git init

# 4. Add all your files
git add .

# 5. Save them with a message
git commit -m "Initial commit: Face emotion detector app"

# 6. Connect to your GitHub repository
#    (Replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/face-emotion-detector.git

# 7. Upload!
git push -u origin main
```

> 🔐 GitHub will ask for your username and password. For the password, you need
> a **Personal Access Token** (not your regular password).
> Get one here: https://github.com/settings/tokens → Generate new token (classic)
> → Check "repo" scope → Copy the token and paste it as your password.

---

### 🔷 Step 5 — Enable GitHub Pages (Make It Live Online!)

1. Go to your repository on GitHub
2. Click the **Settings** tab (top of the page)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Branch: choose `main`, folder: `/ (root)`
6. Click **Save**
7. Wait 1–2 minutes, then your app is live at:

```
https://YOUR_USERNAME.github.io/face-emotion-detector/
```

> 🎉 **Share that link with anyone!** It works on any device with a webcam and a browser.

---

### 🔷 Step 6 — How to Update Your Code Later

Whenever you make changes to the files:

```bash
cd path/to/face-emotion-detector
git add .
git commit -m "Updated something"
git push
```

GitHub Pages updates automatically within a minute or two.

---

## 🧠 How Does the AI Work? (Simple Explanation)

This app uses **face-api.js**, a JavaScript library built on top of **TensorFlow.js**.

When you click START CAMERA:
1. **Models load** from the internet — these are small neural networks (~5 MB total) that were trained on millions of face photos
2. Every frame from your webcam is run through:
   - `TinyFaceDetector` — finds where faces are in the image
   - `FaceExpressionNet` — reads the facial muscles to detect emotion
   - `AgeGenderNet` — estimates age and gender
3. Results are drawn on a transparent canvas over your video

Your **face images never leave your device** — all processing happens 100% in your browser.

---

## 🎭 The 7 Emotions Detected

| Emotion     | What Triggers It |
|-------------|-----------------|
| 😊 Happy    | Smiling, raised cheeks |
| 😮 Surprised| Wide eyes, open mouth |
| 😐 Neutral  | Relaxed face, no strong expression |
| 😢 Sad      | Downturned mouth, furrowed brows |
| 😨 Fearful  | Wide eyes, raised brows, tension |
| 🤢 Disgusted| Nose wrinkle, upper lip raised |
| 😠 Angry    | Furrowed brows, tight lips |

---

## ❓ Troubleshooting

### "Camera won't start" or black screen
- Make sure you opened the app through **Live Server** or `localhost`, NOT by double-clicking the file
- Check that you clicked **Allow** when the browser asked for camera access
- Try a different browser (Chrome and Edge work best)

### "Models loading..." stuck for a long time
- Check your internet connection — the AI models (~5 MB) are downloaded from the internet on first load
- Try refreshing the page

### "Permission denied" camera error
- Click the camera icon in your browser's address bar and allow access
- In Chrome: Settings → Privacy and Security → Site Settings → Camera

### App is slow / low FPS
- Make sure no other app is using your camera
- Close extra browser tabs
- The app works best on Chrome or Edge on a desktop/laptop

### Git says "rejected" when pushing
- Make sure you're using a **Personal Access Token** as your password, not your GitHub password
- Regenerate one at: https://github.com/settings/tokens

---

## 🛠️ Technologies Used

| Technology | What It Does |
|------------|-------------|
| `face-api.js` | JavaScript library for face detection & emotion recognition |
| `TensorFlow.js` | The AI engine that runs neural networks in the browser |
| `HTML5 Canvas API` | Draws the bounding boxes and labels over the video |
| `getUserMedia API` | Accesses the webcam |
| `Orbitron font` | The cool sci-fi headers |
| `Share Tech Mono font` | The monospace data font |

---

## 📝 License

This project is free to use for learning and personal projects.
Face detection models are from [face-api.js](https://github.com/justadudewhohacks/face-api.js) by Vincent Mühler and [@vladmandic](https://github.com/vladmandic/face-api).

---

*Made with ❤️ for learning AI in the browser.*
