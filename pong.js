/**
 * pong.js
 *
 * by Kirk Thompson
 *
 * This file turns a canvas into a simple pong clone. It expects that the canvas
 * that it is being applied to is a 800x600 in size.  
 */

var game = { 
	showTitle: function(canvas) {
		context = canvas.getContext("2d");
		context.fillRect(0,0,canvas.width, canvas.height);
		context.fillStyle = '#fff';
		context.font = '72pt Arial';
		context.textAlign = 'center';
		context.fillText('Pong', canvas.width/2, canvas.height/2);
	},

	runGame: function(canvas, gameOverCallback) {	
		var context = canvas.getContext("2d");		// get the context
		var count = 0;								// tracks ticks since game start
		
		var settings = {
			refreshRate: 33,
			computerSpeed: 15,
			maxScore: 7,
			paddle: {height: 100, width: 25},
			ball: {
				radius: 10,
				color: '#0f0',
				bounds: {
					maxY: canvas.height,
					minY: 0
				}, 
				maxVelocity: 10
			}
		};
		
		var util = {
			randomDirection: function() {
				return (Math.floor(Math.random() * 2) == 0) ? 1 : -1;
			},
			
			getRandomVelocity: function() {
				return {
					x: this.randomDirection() * (Math.random() + 1) * settings.ball.maxVelocity,
					y: this.randomDirection() * (Math.random() + 1) * settings.ball.maxVelocity
				};
			}
		};
		
		/** Paddle **/
		function Paddle(x, y, color) {
			this.x = x;
			this.y = y;
			this.color = color;
			
			this.width = settings.paddle.width;
			this.height = settings.paddle.height;
		}
		Paddle.prototype.draw = function(ctx) {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
		Paddle.prototype.hitBall = function(ball) {
			ball.velocity.x *= -1;
				
			if ((ball.y + ball.radius/2) > (this.y + this.height/2)) {
				ball.velocity.y += 7;
			}
			else {
				ball.velocity.y -= 7;
			}
		};
		/** End Paddle **/
		
		/** Ball **/
		function Ball() {
			this.x = canvas.width/2;
			this.y = canvas.height/2;
		
			this.radius = settings.ball.radius;
			this.color = settings.ball.color;
			
			this.velocity = util.getRandomVelocity();
		};
		Ball.prototype.animate = function() {
			this.x += this.velocity.x;
			this.y += this.velocity.y;
			
			// top and lower bounds
			if (this.y >= settings.ball.bounds.maxY) {
				this.velocity.y *= -1;
				this.y = settings.ball.bounds.maxY;
			}
			if (this.y <= settings.ball.bounds.minY) {
				this.velocity.y *= -1;
				this.y = settings.ball.bounds.minY;
			}
			
			
			// rebounds
			// player rebound
			if (this.x < settings.paddle.width && this.x > 0 &&
				this.y <= player.y + player.height &&
				this.y + this.radius >= player.y) {
				
				player.hitBall(this);
			}
			// computer rebound
			if (this.x + this.radius > canvas.width - settings.paddle.width && 
				this.x + this.radius < canvas.width &&
				this.y <= enemy.y + enemy.height &&
				this.y + this.radius >= enemy.y) {
				
				enemy.hitBall(this);
			}
			
			// scoring
			if (this.x > canvas.width + settings.ball.radius) {
				this.x = canvas.width/2;
				this.y = canvas.height/2;
				this.velocity = util.getRandomVelocity();
				gameState.live = false;
				gameState.score.player++;
				gameState.check();
			}
			
			if (this.x < 0 - settings.ball.radius) {
				this.x = canvas.width/2;
				this.y = canvas.height/2;
				this.velocity = util.getRandomVelocity();
				gameState.live = false;
				gameState.score.enemy++;
				gameState.check();
			}
		};
		Ball.prototype.draw = function(ctx) {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		};
		/** End Ball **/
		
		// create objects...
		ball = new Ball((canvas.width/2), (canvas.height/2));
		player = new Paddle(0, (canvas.height/2) - (settings.paddle.height/2), '#f00');		
		enemy = new Paddle((canvas.width - settings.paddle.width), 
			(canvas.height/2) - (settings.paddle.height/2), '#00f');
		enemy.animate = function() {
			var midPoint = this.y + (this.height/2);
			
			if (midPoint < ball.y) {
				this.y += settings.computerSpeed;
			}
			else if (midPoint > ball.y) {
				this.y -= settings.computerSpeed;
			}
		};

		var gameState = {
			live: false,
			score: {
				player: 0,
				enemy: 0
			},
			check: function() {
				if (this.score.player === settings.maxScore) {
					clearInterval(gameLoopHandle);
					this.winner = 'Player';
					gameOverCallback();
				}
				else if (this.score.enemy === settings.maxScore) {
					clearInterval(gameLoopHandle);
					this.winner = 'Computer';
					gameOverCallback();
				}
			}
		};
		
		function gameLoop() {
			
			// update positions
			if (gameState.live) {
				ball.animate();
			}	
			enemy.animate();
			
			// draw
			canvas.width = canvas.width;
			context.fillRect(0,0,canvas.width, canvas.height);
			
			ball.draw(context);		
			player.draw(context);
			enemy.draw(context);

			// overlay header
			context.fillStyle = '#fff';
			context.font = '22pt Arial';
			context.fontWeight = 'bold';
			context.fillText(gameState.score.player, canvas.width/4, 22);
			context.fillText(gameState.score.enemy, (3*canvas.width)/4, 22);
			if (gameState.winner) {
				context.textAlign = 'center';
				context.fillText(gameState.winner + ' Wins!', canvas.width/2, canvas.height/2 - 50);
			}
		}
		
		/** user input **/
		canvas.onclick = function() {
			gameState.live = true;
		};		
		
		canvas.onmousemove = function(args) {
			player.y = args.clientY - (canvas.offsetTop + player.height/2);
		};
		
		/** end user input **/
		
		
		// start game loop!
		var gameLoopHandle = setInterval(gameLoop, settings.refreshRate);
	}
}