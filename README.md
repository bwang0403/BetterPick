# ⚡ BetterPick – Smart Comparison Tool

BetterPick is a hackathon project that lets users compare items (phones, laptops, cars, etc.) with AI assistance.  
It generates **pros, cons, summaries, and recommendations** automatically, and lets you save your picks for later.

---

## 🚀 Live Demo

- **Frontend (GitHub Pages)**:[ [https://bwang0403.github.io/BetterPick/](https://bwang0403.github.io/BetterPick/)  ](https://bwang0403.github.io/BetterPick/)
- **Backend (Render API)**: [https://betterpick1.onrender.com](https://betterpick1.onrender.com)  

👉 Try it now: open the frontend link, enter items (e.g., *iPhone 15, Samsung S24*), and see instant AI comparison.

---

## 🛠 Features
- 📝 Enter names or URLs to compare items  
- 🤖 AI generates **pros, cons, summary, price, size, weight, popularity, rating**  
- 🏆 Automatic recommendation of the best choice  
- 💾 Save your picks locally and view them later in *Your Picks*  
- 🎨 Smooth animations, responsive UI  

---

## ⚙️ Tech Stack
- **Frontend**: HTML, CSS, Vanilla JS (GitHub Pages hosting)  
- **Backend**: Node.js + Express (deployed on Render)  
- **AI Engine**: Groq API (LLaMA 3.1 8B Instant model)  

---

## 📦 Local Development
If judges want to run locally:

```bash
# clone repo
git clone https://github.com/bwang0403/BetterPick1.git
cd BetterPick1/server

# install dependencies
npm install

# create .env file in /server
echo "GROQ_API_KEY=your_api_key_here" > .env

# start backend
npm start
