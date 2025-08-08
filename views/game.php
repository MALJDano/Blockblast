<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Block Blast Web</title>
  <link rel="stylesheet" href="public/css/style.css" />
</head>
<body>
  <header>
    <h1>🧱 Block Blast</h1>
    <button onclick="resetGame()">Reset</button>
  </header>

  <main>
    <div class="toolbox">
      <h2>Blocks</h2>
      <div id="block-container"></div>
    </div>

    <div class="game-section">
      <div id="game-board"></div>
      <div class="score-panel">
        Score: <span id="score">0</span>
      </div>
    </div>
  </main>

  <script src="public/js/game.js"></script>
</body>
</html>
