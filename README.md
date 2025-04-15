Space Shooter Deluxe


Abstract

Space Shooter Deluxe is an advanced 2D shooting game featuring dynamic gameplay, multiple difficulty levels, ship selection, and special abilities. Built with HTML, CSS, and JavaScript on the front end, and Python (Flask) on the back end, this version enhances user experience with server-based logic, high score persistence, and advanced game mechanics like bosses, power-ups, and real-time UI updates.


Introduction

The Space Shooter Deluxe project demonstrates a modern approach to 2D game development by combining browser technology and backend APIs. Unlike typical browser games, it offloads core game logic to a Python server, making it scalable and state-persistent. The game involves navigating a spaceship, shooting enemies, collecting power-ups, and surviving waves of alien invaders. It integrates a fully responsive UI, animated elements, and audio-visual feedback.


Aim of the Project
To create a browser-based arcade shooter with backend integration.
To allow real-time gameplay across difficulty levels.
To offer ship customization and special abilities.
To persist high scores and handle game state server-side.


Advantages

🎮 Backend-powered game logic for consistent gameplay.

🚀 Multiple ships with unique abilities.

🧠 Smart difficulty scaling and boss mechanics.

🧩 Clean, scalable frontend architecture.

💾 High score saving with persistent storage.

🧪 Testable backend for gameplay logic.


Disadvantages

❌ Requires backend server to be always running.

❌ No multiplayer or cloud sync support yet.

❌ Complex debugging between client and server.

❌ Performance bottlenecks if server is overloaded.


Future Implementation

🌐 Multiplayer support via WebSockets.

📱 Mobile version via PWA or Cordova.

🔊 Advanced audio support and background music.

🧠 AI-based enemies with adaptive behavior.

☁️ Cloud-hosted high scores and leaderboards.

🧭 Story mode and missions.


System Requirements
Hardware:
Quad-core processor
8GB RAM recommended
Basic GPU for rendering (WebGL)

Software:

Frontend:
Modern browser (Chrome, Firefox, Edge)
HTML5, CSS3, JavaScript (Canvas API)

Backend:
Python 3.x
Flask
pip install flask

Flow Chart

![image](https://github.com/user-attachments/assets/b5730eb7-8cdf-4e8e-a14a-f39f853c452b)


Algorithm Overview
1. Game Start
Show start screen.
Choose difficulty and ship.
Send settings to backend via /api/game/start.

2. Main Loop
Capture key events (movement, shoot, special).
Send input + deltaTime to /api/game/<id>/update.
Server computes new state:
Player/enemy movement
Projectile collisions
Power-ups and level ups
Client draws updated state on <canvas>.

3. Game Over
If lives ≤ 0 → game ends.
Show score and prompt to save high score.
Call /api/game/<id>/end with final score.
Implementation Details

Frontend
index.html: Main structure and interface.
styles.css: Custom styling, animated HUD, ship selector, and effects.
game.js:
Manages game loop, animation, canvas drawing.
Handles sound, player input, and score tracking.
Interacts with Python backend through fetch().

Backend
game_server.py (Flask):
Handles /start, /update, and /end API calls.
Manages game state in memory per session.
Spawns enemies, handles collisions, bosses, and score logic.
Periodically cleans up inactive games.
Stores high scores in high_scores.json.
