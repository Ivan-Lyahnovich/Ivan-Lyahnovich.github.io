/* Был перемещен объект мира в собственный класс, также создан класс Player внутри Game.Wpord.
Это сделано для более точного разделения объекта. 
Player не используеться за пределами World, в свою очередь Мировоц класс не используется за пределами Game/.
Game -> Game.World -> Game.World.Player*/

const Game = function() {

  /* Собственный клас объекта мира */
  this.world = new Game.World();

  /* Функция Game.update функционирует как во второй программе*/
  this.update = function() {

    this.world.update();

  };

};

Game.prototype = { constructor : Game };

/* Мир имеет свой новый класс */
Game.World = function(friction = 0.9, gravity = 3) {

  this.friction = friction;
  this.gravity  = gravity;

  /* Player собственный класс внутри объекта Game.World. */
  this.player   = new Game.World.Player();

  /* Данные карты. Позже будут загружены из файла JSON. */
  this.columns   = 12; //столбцы
  this.rows      = 9; //строки
  this.tile_size = 16;//пиксели 
  this.map = [02,29,29,29,29,01,02,29,29,29,01,28,
              10,27,27,27,27,09,10,27,27,27,17,01,
              10,27,27,35,35,09,10,27,35,35,27,09,
              20,22,35,27,37,38,39,40,27,35,05,19,
              02,30,27,35,35,27,35,27,35,03,19,42,
              10,27,27,26,35,27,35,35,26,17,29,01,
              10,27,27,27,27,35,25,27,27,27,35,11,
              20,22,35,35,41,35,41,27,25,35,35,11,
              42,20,21,21,21,21,21,21,21,21,21,19];
 
  /* Высота и ширина имеют зависимость от размера карты. */
  this.height   = this.tile_size * this.rows;
  this.width    = this.tile_size * this.columns;

};

/* Из-за того что мир это класс, он был перенесен с более общией функцией в его прототип. */
Game.World.prototype = {

  constructor: Game.World,

  collideObject:function(object) {// оналог второй программы.

    if (object.x < 0) { object.x = 0; object.velocity_x = 0; }
    else if (object.x + object.width > this.width) { object.x = this.width - object.width; object.velocity_x = 0; }
    if (object.y < 0) { object.y = 0; object.velocity_y = 0; }
    else if (object.y + object.height > this.height) { object.jumping = false; object.y = this.height - object.height; object.velocity_y = 0; }

  },

  update:function() {

    this.player.velocity_y += this.gravity;
    this.player.update();

    this.player.velocity_x *= this.friction;
    this.player.velocity_y *= this.friction;

    this.collideObject(this.player);

  }

};

/* Класс игрока. Он определен в контексте Game.World. */
Game.World.Player = function(x, y) {

  this.color1     = "#404040";
  this.color2     = "#f0f0f0";
  this.height     = 12;
  this.jumping    = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.width      = 12;
  this.x          = 100;
  this.y          = 50;

};

Game.World.Player.prototype = {

  constructor : Game.World.Player,

  jump:function() {

    if (!this.jumping) {

      this.jumping     = true;
      this.velocity_y -= 20;

    }

  },

  moveLeft:function()  { this.velocity_x -= 0.5; },
  moveRight:function() { this.velocity_x += 0.5; },

  update:function() {

    this.x += this.velocity_x;
    this.y += this.velocity_y;

  }

};
