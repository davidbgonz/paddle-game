// Variables for Pong Game
var width = 700, height = 600, pi = Math.PI;
var canvas, context, keystate;
var player, ai, ball;
var upArrow = 38, downArrow = 40;

// Player Data
player = {
  x: null,
  y: null,
  width: 20,
  height: 100,
  score: 0,

  // Set player move speed and boundaries
  update: function() {
    if (keystate[upArrow] && this.y >= 0)
      this.y -= 7;
    if (keystate[downArrow] && this.y + this.height <= height)
      this.y += 7;
  },
  draw: function() {
    context.fillRect(this.x, this.y, this.width, this.height);
    context.font = '150px Monospace';
    context.fillText(this.score, (this.score > 9 ? 150 : 235), 120);
  }
};

// Computer Data
ai = {
  x: null,
  y: null,
  width: 20,
  height: 100,
  skill: 0.1,
  score: 0,

  update: function() {
    // Set computer to follow ball
      var followBall = ball.y - (this.height - ball.side) / 2;
    // Set computer difficulty
      this.y += (followBall - this.y) * this.skill;
  },

  draw: function() {
    context.fillRect(this.x, this.y, this.width, this.height);
    context.font = '150px Monospace';
    context.fillText(this.score, 380, 120);
  }
};

// Ball Data
ball = {
  x: null,
  y: null,
  velocity: null,
  speed: 7,
  side: 20,

  // Determine side which ball should be served and randomize serve angle
  serve: function(direction) {
    this.x = direction == 1 ? player.x : ai.x - this.side;
    this.y = direction == 1 ? player.y : ai.y;

    var randomAngle = pi * (1 - 2 * Math.random()) / 10;
    this.velocity = {
      x: direction * this.speed * Math.cos(randomAngle),
      y: this.speed * Math.sin(randomAngle)
    };
  },

  update: function() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Set ball to bounce when hitting top and bottom of screen
    if (this.y < 0 || this.y + this.side > height) {
      // Set y-axis offset for ball size
      var offset = this.velocity.y < 0 ? 0 - this.y : height - (this.y + this.side);
      this.y += 2 * offset;

      // Change y direction of ball
      this.velocity.y *= -1;
    };

    // Return if ball hits paddle
    var ballToPaddle = function(paddleX, paddleY, paddleWidth, 
      paddleHeight, ballX, ballY, ballWidth, ballHeight) {
      return paddleX < ballX + ballWidth && 
        paddleY < ballY + ballHeight &&
        ballX < paddleX + paddleWidth &&
        ballY < paddleY + paddleHeight;
    };

    // Set which paddle is being hit
    var paddle = this.velocity.x < 0 ? player : ai;
    // Set ball to bounce on paddle
    if (ballToPaddle(paddle.x, paddle.y, paddle.width, paddle.height,
          this.x, this.y, this.side, this.side)) {
      // Set x-axis offset for ball size
      this.x = paddle === player ? player.x + player.width : ai.x - this.side;

      // Where on paddle the ball is hitting
      var touchLocation = (this.y + this.side - paddle.y) / (paddle.height + this.side);

      // Set deflection angle depending where ball hits paddle
      var deflectionAngle = pi * (2 * touchLocation - 1) / 4;

      // Increase speed of ball if hit on edge of paddle
      var spikeBall = Math.abs(deflectionAngle) > pi / 5 ? 1.5 : 1;

      // Change direction of ball depending on which paddle is being hit
      this.velocity.x = spikeBall * ((paddle === player ? 1 : -1) * this.speed * Math.cos(deflectionAngle));
      this.velocity.y = spikeBall * (this.speed * Math.sin(deflectionAngle));
    };

    // Reset ball position if ball is out of bounds
    if (this.x + this.side < 0 || this.x > width) {
      // Increment score for winner
      paddle === player ? ai.score++ : player.score++;

      // Serve ball towards last winner
      this.serve(paddle === player ? 1 : -1);
    };
  },

  draw: function() {
    context.fillRect(this.x, this.y, this.side, this.side);
  }
};

function main() {
  // Create and attach play field to body
  canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  document.body.appendChild(canvas);

  // Set up and down keys for player paddle
  keystate = {};
  document.addEventListener('keydown', function(event) {
    keystate[event.keyCode] = true;
  });
  document.addEventListener('keyup', function(event) {
    delete keystate[event.keyCode];
  });

  // Create initial game state
  initialize();

  var loop = function() {
    update();
    draw();

    window.requestAnimationFrame(loop, canvas);
  };
  window.requestAnimationFrame(loop, canvas);
};

// Function to set game to initial state
function initialize() {
  // Set initial position of player
  player.x = player.width;
  player.y = (height - player.height) / 2;

  // Set initial position of computer
  ai.x = width - (player.width + ai.width);
  ai.y = (height - ai.height) / 2;

  // Set initial position of ball and serve it towards player
  ball.serve(1);
};

// Update players and ball
function update() {
  ball.update();
  player.update();
  ai.update();
};

// Function to draw game field on screen
function draw() {
  // Draw field
  context.fillRect(0, 0, width, height);

  context.save();
  // Set field color
  context.fillStyle = '#FFF';

  // Draw ball, player, and computer on field
  ball.draw();
  player.draw();
  ai.draw();

  // Draw net in middle of field
  var netWidth = 15;                        // Net thickness
  var netX = (width - netWidth) / 2;
  var netY =  0;
  var stepHeight = height / 20;             // Net dash density
  while (netY < height) {
    context.fillRect(netX, netY+stepHeight/4, netWidth, stepHeight/2);
    netY += stepHeight;
  }

  context.restore();
};

// Selection for Difficulty
function difficultySelect() {
  do {
  var difficulty = prompt('Choose a difficulty (Easy, Medium, Hard)', '');
  difficulty = difficulty.toLowerCase();
  } while (difficulty != 'easy' && difficulty != 'medium' && difficulty != 'hard');
  switch(difficulty) {
    case 'easy':
      ball.speed = 5;
      ai.skill = 0.05;
      break;
    case 'medium':
      ball.speed = 8;
      ai.skill = 0.115;
      break;
    case 'hard':
      ball.speed = 12;
      ai.skill = 0.2;
      break;
  };
};

// Run game
main();
