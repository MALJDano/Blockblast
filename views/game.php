<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Block Blast Web</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="stylesheet" href="public/css/style.css" />
</head>
<body>
  <header>
    <h1>🧱 Block Blast</h1>
    <div class="header-actions">
      <button onclick="resetGame()">Reset</button>
      <button onclick="openLeaderboard()">Leaderboard</button>
    </div>
  </header>

  <main>
    <div class="toolbox">
      <h2>Blocks</h2>
      <div id="block-container"></div>
    </div>

    <div class="game-section">
      <div id="game-board"></div>
      <div class="score-panel">Score: <span id="score">0</span></div>
    </div>
  </main>

  <!-- Game Over Modal -->
  <div id="game-over-modal" class="modal hidden">
    <div class="modal-content">
      <h2>Game Over</h2>
      <p>Your Score: <span id="final-score"></span></p>
      <input type="text" id="player-name" placeholder="Enter your name" />
      <div class="modal-actions">
        <button onclick="submitScore()">Submit</button>
        <button onclick="restartGame()">Play Again</button>
      </div>
    </div>
  </div>

  <!-- Leaderboard Modal -->
  <div id="leaderboard" class="modal hidden">
    <div class="modal-content">
      <h2>Leaderboard</h2>
      <ol id="leaderboard-list"></ol>
      <div class="modal-actions">
        <button onclick="closeLeaderboard()">Close</button>
      </div>
    </div>
  </div>

  <script src="public/js/game.js"></script>
</body>
</html>
