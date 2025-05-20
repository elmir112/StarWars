const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bullets = [], meteors = [], score = 0, isShooting = false, shootInterval, gameRunning = false;
let player = { x: canvas.width / 2, y: canvas.height - 100, width: 40, height: 40, name: "" };
let highScore = localStorage.getItem("highScore") || 0;
let highScoreName = localStorage.getItem("highScoreName") || "Heç kim";
const shootSound = document.getElementById("shootSound");

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "yellow";
  ctx.font = "16px Arial";
  ctx.fillText(player.name, player.x - 10, player.y - 10);
}

function drawBullets() {
  ctx.fillStyle = "red";
  bullets.forEach((b, i) => {
    b.y -= 10;
    ctx.fillRect(b.x, b.y, 5, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });
}

function drawMeteors() {
  meteors.forEach((m, i) => {
    m.y += m.speed;
    ctx.fillStyle = m.color;
    if (m.shape === "circle") {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(m.x, m.y, m.size, m.size);
    }

    bullets.forEach((b, j) => {
      if (b.x > m.x - m.size && b.x < m.x + m.size &&
          b.y > m.y - m.size && b.y < m.y + m.size) {
        score += m.points;
        meteors.splice(i, 1);
        bullets.splice(j, 1);
      }
    });

    if (m.y + m.size > player.y && m.x > player.x && m.x < player.x + player.width) {
      gameOver();
    }

    if (m.y > canvas.height) meteors.splice(i, 1);
  });
}

function spawnMeteor() {
  const shapes = ["circle", "square"];
  const colors = ["gray", "red", "orange", "purple"];
  const pointsOptions = [1, 2, 3, 5];
  meteors.push({
    x: Math.random() * canvas.width,
    y: -20,
    size: 20 + Math.random() * 20,
    speed: 1 + Math.random() * 4,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    points: pointsOptions[Math.floor(Math.random() * pointsOptions.length)]
  });
}

function gameLoop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawMeteors();
  ctx.fillStyle = "white";
  ctx.fillText("Xal: " + score, 20, 30);
  requestAnimationFrame(gameLoop);
}

function startGame() {
  const name = document.getElementById("username").value.trim();
  if (name) {
    player.name = name;
    document.getElementById("usernameInput").style.display = "none";
    setInterval(spawnMeteor, 1000);
    gameRunning = true;
    gameLoop();
  }
}

function gameOver() {
  gameRunning = false;
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("finalScoreText").textContent = "Sənin xalin: " + score;
  if (score > highScore) {
    highScore = score;
    highScoreName = player.name;
    localStorage.setItem("highScore", highScore);
    localStorage.setItem("highScoreName", highScoreName);
  }
  document.getElementById("highScoreText").textContent = "Ən yüksək xal: " + highScore + " (" + highScoreName + ")";
}

function restartGame() {
  location.reload();
}

function toggleSettings() {
  const panel = document.getElementById("settingsPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

canvas.addEventListener("touchstart", () => {
  isShooting = true;
  shootInterval = setInterval(() => {
    bullets.push({ x: player.x + player.width / 2, y: player.y });
    if (document.getElementById("soundToggle").checked) {
      shootSound.currentTime = 0;
      shootSound.play();
    }
  }, 200);
});

canvas.addEventListener("touchend", () => {
  clearInterval(shootInterval);
  isShooting = false;
});

canvas.addEventListener("touchmove", (e) => {
  const sensitivity = document.getElementById("sensitivity").value;
  player.x = e.touches[0].clientX - player.width / 2;
});
