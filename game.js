// Game elements
const startScreen = document.getElementById("start-screen")
const gameScreen = document.getElementById("game-screen")
const gameOverScreen = document.getElementById("game-over-screen")
const pauseScreen = document.getElementById("pause-screen")
const highScoresScreen = document.getElementById("high-scores-screen")
const startButton = document.getElementById("start-button")
const restartButton = document.getElementById("restart-button")
const resumeButton = document.getElementById("resume-button")
const quitButton = document.getElementById("quit-button")
const mainMenuButton = document.getElementById("main-menu-button")
const highScoresButton = document.getElementById("high-scores-button")
const backButton = document.getElementById("back-button")
const saveScoreButton = document.getElementById("save-score-button")
const playerNameInput = document.getElementById("player-name")
const newHighScoreDiv = document.getElementById("new-high-score")
const scoresList = document.getElementById("scores-list")
const scoreElement = document.getElementById("score")
const levelElement = document.getElementById("level")
const livesElement = document.getElementById("lives")
const powerLevelElement = document.getElementById("power-level")
const finalScoreElement = document.getElementById("final-score")
const canvas = document.getElementById("game-canvas")
const ctx = canvas.getContext("2d")

// Difficulty buttons
const easyButton = document.getElementById("easy-button")
const mediumButton = document.getElementById("medium-button")
const hardButton = document.getElementById("hard-button")

// Ship selection
const shipOptions = document.querySelectorAll(".ship-option")

// Game state
let gameId = null
let score = 0
let level = 1
let lives = 3
let powerLevel = 0
let gameOver = false
let isPaused = false
let animationFrameId = null
let lastFrameTime = 0
let difficulty = "easy"
let selectedShip = "blue"
let highScores = []

// Player state
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  isShooting: false,
  isUsingSpecial: false,
  specialCooldown: 0,
  specialDuration: 0,
  hasShield: false,
  shieldDuration: 0,
  color: "#88f",
}

// Game objects
let enemies = []
let projectiles = []
let powerUps = []
let particles = []
const stars = []
let bosses = []

// Input handling
const keys = {}

// Backend API URL
const API_URL = "http://localhost:5000/api/game"

// Sound effects
const sounds = {
  shoot: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACAgICAgICAgICAgICAgICAgICAgICBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG",
  ),
  explosion: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=",
  ),
  powerUp: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=",
  ),
}

// Initialize stars
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    opacity: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.5 + 0.1,
  })
}

// Event listeners
startButton.addEventListener("click", startGame)
restartButton.addEventListener("click", startGame)
resumeButton.addEventListener("click", resumeGame)
quitButton.addEventListener("click", quitGame)
mainMenuButton.addEventListener("click", goToMainMenu)
highScoresButton.addEventListener("click", showHighScores)
backButton.addEventListener("click", goToMainMenu)
saveScoreButton.addEventListener("click", saveHighScore)

// Difficulty selection
easyButton.addEventListener("click", () => setDifficulty("easy"))
mediumButton.addEventListener("click", () => setDifficulty("medium"))
hardButton.addEventListener("click", () => setDifficulty("hard"))

// Ship selection
shipOptions.forEach((option) => {
  option.addEventListener("click", () => {
    shipOptions.forEach((opt) => opt.classList.remove("selected"))
    option.classList.add("selected")
    selectedShip = option.getAttribute("data-ship")

    // Update player ship color
    switch (selectedShip) {
      case "blue":
        player.color = "#88f"
        break
      case "red":
        player.color = "#f55"
        break
      case "green":
        player.color = "#5f5"
        break
    }
  })
})

window.addEventListener("keydown", (e) => {
  keys[e.key] = true

  // Shooting
  if (e.key === " ") {
    player.isShooting = true
  }

  // Special ability
  if (e.key === "e" || e.key === "E" || e.key === "Shift") {
    player.isUsingSpecial = true
  }

  // Pause game
  if (
    (e.key === "p" || e.key === "P" || e.key === "Escape") &&
    !gameOver &&
    !startScreen.classList.contains("hidden")
  ) {
    togglePause()
  }

  // Prevent scrolling with arrow keys and WASD
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
      "p",
      "P",
      "Escape",
      "e",
      "E",
      "Shift",
    ].includes(e.key)
  ) {
    e.preventDefault()
  }
})

window.addEventListener("keyup", (e) => {
  keys[e.key] = false

  if (e.key === " ") {
    player.isShooting = false
  }

  if (e.key === "e" || e.key === "E" || e.key === "Shift") {
    player.isUsingSpecial = false
  }
})

// Load high scores from local storage
function loadHighScores() {
  const savedScores = localStorage.getItem("spaceShooterHighScores")
  if (savedScores) {
    highScores = JSON.parse(savedScores)
  } else {
    // Default high scores
    highScores = [
      { name: "AAA", score: 5000 },
      { name: "BBB", score: 4000 },
      { name: "CCC", score: 3000 },
      { name: "DDD", score: 2000 },
      { name: "EEE", score: 1000 },
    ]
    localStorage.setItem("spaceShooterHighScores", JSON.stringify(highScores))
  }
}

// Save high scores to local storage
function saveHighScores() {
  localStorage.setItem("spaceShooterHighScores", JSON.stringify(highScores))
}

// Display high scores
function displayHighScores() {
  scoresList.innerHTML = ""
  highScores.sort((a, b) => b.score - a.score)

  highScores.forEach((score, index) => {
    const scoreItem = document.createElement("div")
    scoreItem.className = "score-item"

    const rankSpan = document.createElement("span")
    rankSpan.className = "score-rank"
    rankSpan.textContent = `${index + 1}.`

    const nameSpan = document.createElement("span")
    nameSpan.className = "score-name"
    nameSpan.textContent = score.name

    const valueSpan = document.createElement("span")
    valueSpan.className = "score-value"
    valueSpan.textContent = score.score

    scoreItem.appendChild(rankSpan)
    scoreItem.appendChild(nameSpan)
    scoreItem.appendChild(valueSpan)

    scoresList.appendChild(scoreItem)
  })
}

// Check if score is a high score
function isHighScore(score) {
  return highScores.some((hs) => score > hs.score) || highScores.length < 5
}

// Save high score
function saveHighScore() {
  const playerName = playerNameInput.value.trim() || "Anonymous"

  highScores.push({ name: playerName, score: score })
  highScores.sort((a, b) => b.score - a.score)

  if (highScores.length > 10) {
    highScores = highScores.slice(0, 10)
  }

  saveHighScores()
  newHighScoreDiv.classList.add("hidden")
  showHighScores()
}

// Set difficulty
function setDifficulty(level) {
  difficulty = level

  // Update UI
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("selected")
  })

  document.getElementById(`${level}-button`).classList.add("selected")

  // Adjust game parameters based on difficulty
  switch (level) {
    case "easy":
      player.speed = 5
      break
    case "medium":
      player.speed = 6
      break
    case "hard":
      player.speed = 7
      break
  }
}

// Show high scores screen
function showHighScores() {
  startScreen.classList.add("hidden")
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.remove("hidden")

  loadHighScores()
  displayHighScores()
}

// Go to main menu
function goToMainMenu() {
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.add("hidden")
  pauseScreen.classList.add("hidden")
  startScreen.classList.remove("hidden")

  // Reset game state
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Toggle pause
function togglePause() {
  isPaused = !isPaused

  if (isPaused) {
    pauseScreen.classList.remove("hidden")
  } else {
    pauseScreen.classList.add("hidden")
    gameLoop(performance.now())
  }
}

// Resume game
function resumeGame() {
  isPaused = false
  pauseScreen.classList.add("hidden")
  gameLoop(performance.now())
}

// Quit game
function quitGame() {
  isPaused = false
  pauseScreen.classList.add("hidden")
  endGame()
}

// Game functions
async function startGame() {
  // Reset game state
  score = 0
  level = 1
  lives = 3
  powerLevel = 0
  gameOver = false
  isPaused = false
  enemies = []
  projectiles = []
  powerUps = []
  particles = []
  bosses = []

  // Reset player position
  player.x = canvas.width / 2 - 20
  player.y = canvas.height - 60
  player.hasShield = false
  player.shieldDuration = 0
  player.specialCooldown = 0
  player.specialDuration = 0

  // Update UI
  scoreElement.textContent = score
  levelElement.textContent = level
  livesElement.textContent = lives
  powerLevelElement.textContent = powerLevel

  // Show game screen
  startScreen.classList.add("hidden")
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.add("hidden")
  gameScreen.classList.remove("hidden")

  // Initialize game on server
  try {
    const response = await fetch(`${API_URL}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        difficulty: difficulty,
        ship: selectedShip,
      }),
    })

    const data = await response.json()
    gameId = data.game_id

    // Start game loop
    lastFrameTime = performance.now()
    gameLoop(lastFrameTime)
  } catch (error) {
    console.error("Failed to start game:", error)
    // Fallback to client-side game if server is unavailable
    gameId = "local-" + Date.now()
    lastFrameTime = performance.now()
    gameLoop(lastFrameTime)
  }
}

function endGame() {
  gameOver = true
  finalScoreElement.textContent = score
  gameScreen.classList.add("hidden")
  gameOverScreen.classList.remove("hidden")

  // Check for high score
  loadHighScores()
  if (isHighScore(score)) {
    newHighScoreDiv.classList.remove("hidden")
  } else {
    newHighScoreDiv.classList.add("hidden")
  }

  // End game on server
  if (gameId && gameId.startsWith("local-") === false) {
    fetch(`${API_URL}/${gameId}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        score: score,
        level: level,
      }),
    }).catch((error) => {
      console.error("Failed to end game on server:", error)
    })
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

async function gameLoop(timestamp) {
  if (gameOver || isPaused) return

  // Calculate delta time
  const deltaTime = timestamp - lastFrameTime
  lastFrameTime = timestamp

  // Clear canvas
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw stars (background)
  updateStars(deltaTime)
  drawStars()

  // Update game state
  if (gameId && gameId.startsWith("local-") === false) {
    // Server-side game logic
    try {
      const response = await fetch(`${API_URL}/${gameId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            keys,
            isShooting: player.isShooting,
            isUsingSpecial: player.isUsingSpecial,
          },
          deltaTime: deltaTime,
        }),
      })

      const gameState = await response.json()

      // Update local state from server
      if (gameState.game_over) {
        endGame()
        return
      }

      // Update player position
      player.x = gameState.player.x
      player.y = gameState.player.y
      player.hasShield = gameState.player.hasShield
      player.shieldDuration = gameState.player.shieldDuration

      // Update game objects
      enemies = gameState.enemies
      projectiles = gameState.projectiles
      powerUps = gameState.powerUps
      particles = gameState.particles
      bosses = gameState.bosses

      // Update game stats
      score = gameState.score
      level = gameState.level
      lives = gameState.player.lives
      powerLevel = gameState.player.powerLevel

      scoreElement.textContent = score
      levelElement.textContent = level
      livesElement.textContent = lives
      powerLevelElement.textContent = powerLevel
    } catch (error) {
      console.error("Failed to update game state:", error)
      // Switch to client-side game logic if server is unavailable
      gameId = "local-" + Date.now()
      updateGameLocally(deltaTime)
    }
  } else {
    // Client-side game logic (fallback)
    updateGameLocally(deltaTime)
  }

  // Draw game objects
  drawPlayer()
  drawEnemies()
  drawProjectiles()
  drawPowerUps()
  drawParticles()
  drawBosses()

  // Continue game loop
  animationFrameId = requestAnimationFrame(gameLoop)
}

function updateGameLocally(deltaTime) {
  // Update player position based on key presses (Arrow keys and WASD)
  if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && player.x > 0) {
    player.x -= player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowRight"] || keys["d"] || keys["D"]) && player.x < canvas.width - player.width) {
    player.x += player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowUp"] || keys["w"] || keys["W"]) && player.y > 0) {
    player.y -= player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowDown"] || keys["s"] || keys["S"]) && player.y < canvas.height - player.height) {
    player.y += player.speed * (deltaTime / 16)
  }

  // Handle shooting
  if (player.isShooting) {
    const now = performance.now()
    if (!player.lastShot || now - player.lastShot > 300) {
      // Create projectile
      const projectile = {
        x: player.x + player.width / 2 - 2,
        y: player.y - 10,
        width: 4,
        height: 15,
        speed: 10,
        isPlayerProjectile: true,
        damage: 1 + Math.floor(powerLevel / 3),
      }

      projectiles.push(projectile)

      // Add side projectiles if power level is high enough
      if (powerLevel >= 2) {
        projectiles.push({
          x: player.x + 5,
          y: player.y,
          width: 3,
          height: 10,
          speed: 9,
          isPlayerProjectile: true,
          damage: 1,
        })

        projectiles.push({
          x: player.x + player.width - 8,
          y: player.y,
          width: 3,
          height: 10,
          speed: 9,
          isPlayerProjectile: true,
          damage: 1,
        })
      }

      // Play sound
      sounds.shoot.currentTime = 0
      sounds.shoot.play().catch((e) => console.log("Audio play error:", e))

      player.lastShot = now
    }
  }

  // Handle special ability
  if (player.isUsingSpecial && powerLevel >= 5 && player.specialCooldown <= 0) {
    // Activate special ability based on ship type
    switch (selectedShip) {
      case "blue":
        // Shield
        player.hasShield = true
        player.shieldDuration = 5000
        break
      case "red":
        // Screen clearing explosion
        for (let i = 0; i < enemies.length; i++) {
          createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2)
          score += enemies[i].points || 10
        }
        enemies = []
        break
      case "green":
        // Rapid fire mode
        player.specialDuration = 3000
        break
    }

    // Reset power level and set cooldown
    powerLevel = 0
    player.specialCooldown = 10000
    powerLevelElement.textContent = powerLevel
  }

  // Update special ability timers
  if (player.specialCooldown > 0) {
    player.specialCooldown -= deltaTime
  }

  if (player.specialDuration > 0) {
    player.specialDuration -= deltaTime

    // Special effects for duration-based abilities
    if (selectedShip === "green") {
      // Rapid fire for green ship
      if (player.isShooting) {
        const now = performance.now()
        if (!player.lastSpecialShot || now - player.lastSpecialShot > 100) {
          for (let i = 0; i < 3; i++) {
            projectiles.push({
              x: player.x + player.width / 2 - 2 + (i - 1) * 10,
              y: player.y - 5,
              width: 3,
              height: 10,
              speed: 12,
              isPlayerProjectile: true,
              damage: 1,
            })
          }
          player.lastSpecialShot = now
        }
      }
    }
  }

  // Update shield duration
  if (player.hasShield) {
    player.shieldDuration -= deltaTime
    if (player.shieldDuration <= 0) {
      player.hasShield = false
    }
  }

  // Spawn enemies
  const enemySpawnRate = 0.02 + level * 0.005
  const adjustedSpawnRate = enemySpawnRate * (deltaTime / 16)

  if (Math.random() < adjustedSpawnRate) {
    const enemy = {
      x: Math.random() * (canvas.width - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 2 + level * 0.5,
      points: 10 * level,
      health: 1 + Math.floor(level / 3),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }

    enemies.push(enemy)

    // Random enemy shooting
    if (Math.random() > 0.7) {
      projectiles.push({
        x: enemy.x + enemy.width / 2 - 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 15,
        speed: 5,
        isPlayerProjectile: false,
      })
    }
  }

  // Spawn boss every 5 levels
  if (level % 5 === 0 && bosses.length === 0 && Math.random() < 0.005) {
    bosses.push({
      x: canvas.width / 2 - 75,
      y: -100,
      width: 150,
      height: 100,
      speed: 1,
      health: 20 * Math.floor(level / 5),
      maxHealth: 20 * Math.floor(level / 5),
      points: 500 * Math.floor(level / 5),
      shootTimer: 0,
      moveDirection: 1,
    })
  }

  // Spawn power-ups
  if (Math.random() < 0.001 * (deltaTime / 16)) {
    powerUps.push({
      x: Math.random() * (canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      speed: 2,
      type: Math.random() < 0.7 ? "power" : "life",
    })
  }

  // Update projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      p.y -= p.speed * (deltaTime / 16)
      if (p.y < -p.height) {
        projectiles.splice(i, 1)
      }
    } else {
      p.y += p.speed * (deltaTime / 16)
      if (p.y > canvas.height) {
        projectiles.splice(i, 1)
      }
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    e.y += e.speed * (deltaTime / 16)

    // Random movement for some enemies
    if (Math.random() < 0.01) {
      e.x += (Math.random() - 0.5) * 5
    }

    // Keep enemies within bounds
    if (e.x < 0) e.x = 0
    if (e.x > canvas.width - e.width) e.x = canvas.width - e.width

    if (e.y > canvas.height) {
      enemies.splice(i, 1)
    }
  }

  // Update bosses
  for (let i = bosses.length - 1; i >= 0; i--) {
    const boss = bosses[i]

    // Move boss down until it reaches a certain position
    if (boss.y < 50) {
      boss.y += boss.speed * (deltaTime / 16)
    } else {
      // Side-to-side movement
      boss.x += boss.speed * boss.moveDirection * (deltaTime / 16)

      // Change direction at edges
      if (boss.x <= 0) {
        boss.moveDirection = 1
      } else if (boss.x + boss.width >= canvas.width) {
        boss.moveDirection = -1
      }

      // Boss shooting
      boss.shootTimer += deltaTime
      if (boss.shootTimer > 1000) {
        // Pattern shooting
        for (let j = 0; j < 5; j++) {
          projectiles.push({
            x: boss.x + (boss.width / 5) * j + 10,
            y: boss.y + boss.height,
            width: 6,
            height: 15,
            speed: 4,
            isPlayerProjectile: false,
          })
        }
        boss.shootTimer = 0
      }
    }
  }

  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i]
    p.y += p.speed * (deltaTime / 16)

    if (p.y > canvas.height) {
      powerUps.splice(i, 1)
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx * (deltaTime / 16)
    p.y += p.vy * (deltaTime / 16)
    p.life -= deltaTime

    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }

  // Check collisions
  checkCollisions()

  // Update score display
  scoreElement.textContent = score
  levelElement.textContent = level
  livesElement.textContent = lives
  powerLevelElement.textContent = powerLevel

  // Check for level up
  if (Math.floor(score / 500) > level - 1) {
    level = Math.floor(score / 500) + 1
  }
}

function checkCollisions() {
  // Player projectiles hitting enemies
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      // Check collision with regular enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j]

        if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
          // Collision detected
          projectiles.splice(i, 1)

          // Reduce enemy health
          e.health -= p.damage || 1

          if (e.health <= 0) {
            // Enemy destroyed
            enemies.splice(j, 1)
            score += e.points
            createExplosion(e.x + e.width / 2, e.y + e.height / 2)
          }
          break
        }
      }

      // Check collision with bosses
      for (let j = bosses.length - 1; j >= 0; j--) {
        const boss = bosses[j]

        if (
          p.x < boss.x + boss.width &&
          p.x + p.width > boss.x &&
          p.y < boss.y + boss.height &&
          p.y + p.height > boss.y
        ) {
          // Collision detected
          projectiles.splice(i, 1)

          // Reduce boss health
          boss.health -= p.damage || 1

          // Create hit effect
          for (let k = 0; k < 5; k++) {
            particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: Math.random() * 3 + 1,
              color: "#ff0",
              life: 300,
            })
          }

          if (boss.health <= 0) {
            // Boss destroyed
            bosses.splice(j, 1)
            score += boss.points

            // Big explosion for boss
            for (let k = 0; k < 30; k++) {
              createExplosion(boss.x + Math.random() * boss.width, boss.y + Math.random() * boss.height)
            }

            // Drop power-ups
            for (let k = 0; k < 3; k++) {
              powerUps.push({
                x: boss.x + Math.random() * boss.width,
                y: boss.y + Math.random() * boss.height,
                width: 20,
                height: 20,
                speed: 2,
                type: Math.random() < 0.7 ? "power" : "life",
              })
            }
          }
          break
        }
      }
    } else {
      // Enemy projectiles hitting player
      if (!player.hasShield && !gameOver) {
        if (
          p.x < player.x + player.width &&
          p.x + p.width > player.x &&
          p.y < player.y + player.height &&
          p.y + p.height > player.y
        ) {
          // Collision detected
          projectiles.splice(i, 1)

          // Reduce player lives
          lives--

          // Create hit effect
          createExplosion(player.x + player.width / 2, player.y + player.height / 2)

          // Check game over
          if (lives <= 0) {
            endGame()
          }
        }
      }
    }
  }

  // Enemies hitting player
  if (!player.hasShield && !gameOver) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i]

      if (
        e.x < player.x + player.width &&
        e.x + e.width > player.x &&
        e.y < player.y + player.height &&
        e.y + e.height > player.y
      ) {
        // Collision detected
        enemies.splice(i, 1)

        // Reduce player lives
        lives--

        // Create explosion
        createExplosion(e.x + e.width / 2, e.y + e.height / 2)

        // Check game over
        if (lives <= 0) {
          endGame()
        }
      }
    }
  }

  // Player collecting power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i]

    if (
      p.x < player.x + player.width &&
      p.x + p.width > player.x &&
      p.y < player.y + player.height &&
      p.y + p.height > player.y
    ) {
      // Collision detected
      powerUps.splice(i, 1)

      // Apply power-up effect
      if (p.type === "power") {
        powerLevel = Math.min(10, powerLevel + 1)
        powerLevelElement.textContent = powerLevel
      } else if (p.type === "life") {
        lives = Math.min(5, lives + 1)
        livesElement.textContent = lives
      }

      // Play sound
      sounds.powerUp.currentTime = 0
      sounds.powerUp.play().catch((e) => console.log("Audio play error:", e))

      // Create collection effect
      for (let j = 0; j < 10; j++) {
        particles.push({
          x: p.x + p.width / 2,
          y: p.y + p.height / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 3 + 1,
          color: p.type === "power" ? "#5f5" : "#f55",
          life: 500,
        })
      }
    }
  }
}

// Create explosion particles
function createExplosion(x, y) {
  // Play explosion sound
  sounds.explosion.currentTime = 0
  sounds.explosion.play().catch((e) => console.log("Audio play error:", e))

  // Create particles
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      radius: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 60}, 100%, 50%)`,
      life: 500,
    })
  }
}

// Update stars
function updateStars(deltaTime) {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    star.y += star.speed * (deltaTime / 16)

    if (star.y > canvas.height) {
      star.y = 0
      star.x = Math.random() * canvas.width
    }
  }
}

// Draw functions
function drawStars() {
  ctx.save()

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawPlayer() {
  ctx.save()

  // Draw player ship
  ctx.fillStyle = player.color

  // Ship shape based on selected ship
  switch (selectedShip) {
    case "blue":
      // Blue ship (triangle)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x, player.y + player.height)
      ctx.lineTo(player.x + player.width, player.y + player.height)
      ctx.closePath()
      ctx.fill()
      break
    case "red":
      // Red ship (diamond)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x + player.width, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width / 2, player.y + player.height)
      ctx.lineTo(player.x, player.y + player.height / 2)
      ctx.closePath()
      ctx.fill()
      break
    case "green":
      // Green ship (arrow)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x + player.width, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width * 0.8, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width * 0.8, player.y + player.height)
      ctx.lineTo(player.x + player.width * 0.2, player.y + player.height)
      ctx.lineTo(player.x + player.width * 0.2, player.y + player.height / 2)
      ctx.lineTo(player.x, player.y + player.height / 2)
      ctx.closePath()
      ctx.fill()
      break
  }

  // Draw engine flame
  ctx.fillStyle = "#ff6"
  ctx.beginPath()
  ctx.moveTo(player.x + player.width * 0.3, player.y + player.height)
  ctx.lineTo(player.x + player.width * 0.5, player.y + player.height + 10 + Math.random() * 5)
  ctx.lineTo(player.x + player.width * 0.7, player.y + player.height)
  ctx.closePath()
  ctx.fill()

  // Draw shield if active
  if (player.hasShield) {
    ctx.strokeStyle = "#88f"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 200) * 0.2
    ctx.beginPath()
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function drawEnemies() {
  ctx.save()

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i]

    // Draw enemy ship
    ctx.fillStyle = enemy.color || "#f55"

    // Enemy shape (inverted triangle)
    ctx.beginPath()
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height)
    ctx.lineTo(enemy.x, enemy.y)
    ctx.lineTo(enemy.x + enemy.width, enemy.y)
    ctx.closePath()
    ctx.fill()

    // Draw enemy health bar if damaged
    if (enemy.health < enemy.maxHealth || enemy.health < 1 + Math.floor(level / 3)) {
      const healthPercent = enemy.health / (enemy.maxHealth || 1 + Math.floor(level / 3))
      const barWidth = enemy.width * 0.8

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(enemy.x + enemy.width * 0.1, enemy.y - 8, barWidth, 4)

      ctx.fillStyle = healthPercent > 0.6 ? "#5f5" : healthPercent > 0.3 ? "#ff5" : "#f55"
      ctx.fillRect(enemy.x + enemy.width * 0.1, enemy.y - 8, barWidth * healthPercent, 4)
    }
  }

  ctx.restore()
}

function drawBosses() {
  ctx.save()

  for (let i = 0; i < bosses.length; i++) {
    const boss = bosses[i]

    // Draw boss ship
    ctx.fillStyle = `hsl(${(performance.now() / 50) % 360}, 70%, 50%)`

    // Boss shape
    ctx.beginPath()
    ctx.moveTo(boss.x + boss.width / 2, boss.y)
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height * 0.3)
    ctx.lineTo(boss.x + boss.width * 0.8, boss.y + boss.height * 0.3)
    ctx.lineTo(boss.x + boss.width * 0.9, boss.y + boss.height * 0.7)
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height)
    ctx.lineTo(boss.x, boss.y + boss.height)
    ctx.lineTo(boss.x + boss.width * 0.1, boss.y + boss.height * 0.7)
    ctx.lineTo(boss.x + boss.width * 0.2, boss.y + boss.height * 0.3)
    ctx.lineTo(boss.x, boss.y + boss.height * 0.3)
    ctx.closePath()
    ctx.fill()

    // Draw boss details
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(boss.x + boss.width * 0.3, boss.y + boss.height * 0.4, boss.width * 0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(boss.x + boss.width * 0.7, boss.y + boss.height * 0.4, boss.width * 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Draw boss health bar
    const healthPercent = boss.health / boss.maxHealth
    const barWidth = boss.width

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(boss.x, boss.y - 15, barWidth, 10)

    ctx.fillStyle = healthPercent > 0.6 ? "#5f5" : healthPercent > 0.3 ? "#ff5" : "#f55"
    ctx.fillRect(boss.x, boss.y - 15, barWidth * healthPercent, 10)
  }

  ctx.restore()
}

function drawProjectiles() {
  ctx.save()

  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      // Player projectile
      ctx.fillStyle = selectedShip === "blue" ? "#88f" : selectedShip === "red" ? "#f55" : "#5f5"
      ctx.fillRect(p.x, p.y, p.width, p.height)

      // Projectile glow
      ctx.globalAlpha = 0.5
      ctx.fillStyle = "#fff"
      ctx.fillRect(p.x - 1, p.y - 2, p.width + 2, p.height + 2)
      ctx.globalAlpha = 1
    } else {
      // Enemy projectile
      ctx.fillStyle = "#f55"
      ctx.fillRect(p.x, p.y, p.width, p.height)

      // Projectile glow
      ctx.globalAlpha = 0.5
      ctx.fillStyle = "#f00"
      ctx.fillRect(p.x - 1, p.y - 2, p.width + 2, p.height + 2)
      ctx.globalAlpha = 1
    }
  }

  ctx.restore()
}

function drawPowerUps() {
  ctx.save()

  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i]

    // Power-up glow
    ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 200) * 0.2
    ctx.fillStyle = p.type === "power" ? "#5f5" : "#f55"
    ctx.beginPath()
    ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Power-up icon
    ctx.fillStyle = "#fff"
    if (p.type === "power") {
      // Power icon (lightning bolt)
      ctx.beginPath()
      ctx.moveTo(p.x + p.width * 0.4, p.y + p.height * 0.2)
      ctx.lineTo(p.x + p.width * 0.7, p.y + p.height * 0.4)
      ctx.lineTo(p.x + p.width * 0.5, p.y + p.height * 0.5)
      ctx.lineTo(p.x + p.width * 0.7, p.y + p.height * 0.8)
      ctx.lineTo(p.x + p.width * 0.3, p.y + p.height * 0.5)
      ctx.lineTo(p.x + p.width * 0.5, p.y + p.height * 0.4)
      ctx.closePath()
      ctx.fill()
    } else {
      // Life icon (heart)
      ctx.beginPath()
      ctx.moveTo(p.x + p.width * 0.5, p.y + p.height * 0.7)
      ctx.bezierCurveTo(
        p.x + p.width * 0.5,
        p.y + p.height * 0.7,
        p.x + p.width * 0.2,
        p.y + p.height * 0.4,
        p.x + p.width * 0.5,
        p.y + p.height * 0.3,
      )
      ctx.bezierCurveTo(
        p.x + p.width * 0.8,
        p.y + p.height * 0.4,
        p.x + p.width * 0.5,
        p.y + p.height * 0.7,
        p.x + p.width * 0.5,
        p.y + p.height * 0.7,
      )
      ctx.fill()
    }
  }

  ctx.restore()
}

function drawParticles() {
  ctx.save()

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    ctx.globalAlpha = Math.min(1, p.life / 300)
    ctx.fillStyle = p.color || "#fff"
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

// Initialize game
loadHighScores()
