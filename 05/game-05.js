/* Замечена проблема с туннелированием в правом углу. при столкновении с правой стороной, игрок казалось бы движется сквозь стену. 
   Это не проблема со столкновением плиток, а, скорее, туннелирование. Скорость его прыжка перемещает его вверх более чем на одну клетку.*/

const Game = function() {

  this.world    = new Game.World();

  this.update   = function() {

    this.world.update();

  };

};

Game.prototype = {

  constructor : Game,

};

Game.World = function(friction = 0.8, gravity = 2) {

  this.collider = new Game.World.Collider();

  this.friction = friction;
  this.gravity  = gravity;

  this.columns   = 12;
  this.rows      = 9;

  /* Новый класс tile_set. Игра не будет использовать масштабирование для отдельных объектов, 
     поэтому полный контроль над tilea_size будет у одного источника для обоих схем столкновения в tile_set*/
  this.tile_set = new Game.World.TileSet(8, 16);
  this.player   = new Game.World.Object.Player(100, 100);// Игрок в своем новом «пространстве имен».

  this.map = [01,28,28,28,28,00,01,28,28,28,00,27,
    09,26,26,26,26,08,09,26,26,26,16,00,
    09,26,26,34,34,08,09,26,34,34,26,08,
    19,21,34,26,36,37,38,39,26,34,04,18,
    01,29,26,34,34,26,34,26,34,02,18,41,
    09,26,26,25,34,26,34,34,25,16,28,00,
    09,26,26,26,26,24,34,26,26,26,34,10,
    19,21,34,34,34,40,34,40,34,34,34,10,
    41,19,20,20,20,20,20,20,20,20,20,18];

this.collision_map = [00,04,04,04,04,00,00,04,04,04,04,00,
                      02,00,00,00,00,08,02,00,00,00,12,00,
                      02,00,00,00,00,08,02,00,00,00,00,08,
                      00,03,00,00,13,04,04,07,00,00,09,00,
                      00,06,00,00,00,00,00,00,00,09,00,00,
                      02,00,00,01,00,00,00,00,01,12,04,00,
                      02,00,00,00,00,11,00,00,00,00,00,08,
                      00,03,00,00,00,10,00,11,00,00,00,08,
                      00,00,01,01,01,00,01,00,01,01,01,00];

  this.height   = this.tile_set.tile_size * this.rows;   // изменены для использования tile_set.tile_size
  this.width    = this.tile_set.tile_size * this.columns;// убран this.tile_size в Game.World

};

Game.World.prototype = {

  constructor: Game.World,

  collideObject:function(object) {

    if      (object.getLeft()   < 0          ) { object.setLeft(0);             object.velocity_x = 0; }
    else if (object.getRight()  > this.width ) { object.setRight(this.width);   object.velocity_x = 0; }
    if      (object.getTop()    < 0          ) { object.setTop(0);              object.velocity_y = 0; }
    else if (object.getBottom() > this.height) { object.setBottom(this.height); object.velocity_y = 0; object.jumping = false; }

    var bottom, left, right, top, value;

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

  },

  /* Функция для обновления позиции персонажа столкнув его с преградой,
     а потом обновить анимацию в зависимости от конечного состояния персонажа.*/
  update:function() {

    this.player.updatePosition(this.gravity, this.friction);

    this.collideObject(this.player);

    this.player.updateAnimation();

  }

};

Game.World.Collider = function() {

  this.collide = function(value, object, tile_x, tile_y, tile_size) {

    switch(value) {

      case  1: this.collidePlatformTop      (object, tile_y            ); break;
      case  2: this.collidePlatformRight    (object, tile_x + tile_size); break;
      case  3: if (this.collidePlatformTop  (object, tile_y            )) return;// При столкновении не требуется проверка.
               this.collidePlatformRight    (object, tile_x + tile_size); break;
      case  4: this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case  5: if (this.collidePlatformTop  (object, tile_y            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case  6: if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case  7: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case  8: this.collidePlatformLeft     (object, tile_x            ); break;
      case  9: if (this.collidePlatformTop  (object, tile_y            )) return;
               this.collidePlatformLeft     (object, tile_x            ); break;
      case 10: if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformRight    (object, tile_x + tile_size); break;
      case 11: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformRight    (object, tile_x + tile_size); break;
      case 12: if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case 13: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case 14: if (this.collidePlatformLeft (object, tile_x            )) return;
               if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break;
      case 15: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               if (this.collidePlatformRight(object, tile_x + tile_size)) return; // Добавлен tile_size.
               this.collidePlatformBottom   (object, tile_y + tile_size); break;

    }

  }

};

Game.World.Collider.prototype = {

  constructor: Game.World.Collider,

  collidePlatformBottom:function(object, tile_bottom) {

    if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

      object.setTop(tile_bottom);
      object.velocity_y = 0;
      return true;

    } return false;

  },

  collidePlatformLeft:function(object, tile_left) {

    if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

      object.setRight(tile_left - 0.01);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformRight:function(object, tile_right) {

    if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

      object.setLeft(tile_right);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformTop:function(object, tile_top) {

    if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

      object.setBottom(tile_top - 0.01);
      object.velocity_y = 0;
      object.jumping    = false;
      return true;

    } return false;

  }

 };

Game.World.Object = function(x, y, width, height) {

 this.height = height;
 this.width  = width;
 this.x      = x;
 this.x_old  = x;
 this.y      = y;
 this.y_old  = y;

};

Game.World.Object.prototype = {

  constructor:Game.World.Object,

  /* Получение и установка различных боковых положений объекта. */
  getBottom:   function()  { return this.y     + this.height; },
  getLeft:     function()  { return this.x;                   },
  getRight:    function()  { return this.x     + this.width;  },
  getTop:      function()  { return this.y;                   },
  getOldBottom:function()  { return this.y_old + this.height; },
  getOldLeft:  function()  { return this.x_old;               },
  getOldRight: function()  { return this.x_old + this.width;  },
  getOldTop:   function()  { return this.y_old                },
  setBottom:   function(y) { this.y     = y    - this.height; },
  setLeft:     function(x) { this.x     = x;                  },
  setRight:    function(x) { this.x     = x    - this.width;  },
  setTop:      function(y) { this.y     = y;                  },
  setOldBottom:function(y) { this.y_old = y    - this.height; },
  setOldLeft:  function(x) { this.x_old = x;                  },
  setOldRight: function(x) { this.x_old = x    - this.width;  },
  setOldTop:   function(y) { this.y_old = y;                  }

};

Game.World.Object.Animator = function(frame_set, delay) {

  this.count       = 0;
  this.delay       = (delay >= 1) ? delay : 1;
  this.frame_set   = frame_set;
  this.frame_index = 0;
  this.frame_value = frame_set[0];
  this.mode        = "pause";

};

Game.World.Object.Animator.prototype = {

  constructor:Game.World.Object.Animator,

  animate:function() {

    switch(this.mode) {

      case "loop" : this.loop(); break;
      case "pause":              break;

    }

  },

  changeFrameSet(frame_set, mode, delay = 10, frame_index = 0) {

    if (this.frame_set === frame_set) { return; }

    this.count       = 0;
    this.delay       = delay;
    this.frame_set   = frame_set;
    this.frame_index = frame_index;
    this.frame_value = frame_set[frame_index];
    this.mode        = mode;

  },

  loop:function() {

    this.count ++;

    while(this.count > this.delay) {

      this.count -= this.delay;

      this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;

      this.frame_value = this.frame_set[this.frame_index];

    }

  }

};

/* Теперь игрок также расширяет класс Game.World.Object.Animator.
   Добавлена переменная direction_x для определения в какую сторону игрок смотрит.*/
Game.World.Object.Player = function(x, y) {

  Game.World.Object.call(this, 100, 100, 7, 14);
  Game.World.Object.Animator.call(this, Game.World.Object.Player.prototype.frame_sets["idle-left"], 10);

  this.jumping     = true;
  this.direction_x = -1;
  this.velocity_x  = 0;
  this.velocity_y  = 0;

};

Game.World.Object.Player.prototype = {

  constructor:Game.World.Object.Player,

  /* Значения в этих массивах соответствуют объектам TileSet.Frame в tile_set.
   Они просто жестко запрограммированы здесь, но когда информация о наборе плиток в конечном итоге
   загруженный из файла json, он будет динамически размещаться в какой-либо функции загрузки. */
  frame_sets: {

    "idle-left" : [0],
    "jump-left" : [1],
    "move-left" : [2, 3, 4, 5],
    "idle-right": [6],
    "jump-right": [7],
    "move-right": [8, 9, 10, 11]

  },

  jump: function() {

    if (!this.jumping) {

      this.jumping     = true;
      this.velocity_y -= 20;

    }

  },

  moveLeft: function() {

    this.direction_x = -1; // направление игрока.
    this.velocity_x -= 0.55;

  },

  moveRight:function(frame_set) {

    this.direction_x = 1;
    this.velocity_x += 0.55;

  },

  /* Отдельная функция обновления анимации вызывающаяся при столкновении.*/
  updateAnimation:function() {

    if (this.velocity_y < 0) {

      if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
      else this.changeFrameSet(this.frame_sets["jump-right"], "pause");

    } else if (this.direction_x < 0) {

      if (this.velocity_x < -0.1) this.changeFrameSet(this.frame_sets["move-left"], "loop", 5);
      else this.changeFrameSet(this.frame_sets["idle-left"], "pause");

    } else if (this.direction_x > 0) {

      if (this.velocity_x > 0.1) this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
      else this.changeFrameSet(this.frame_sets["idle-right"], "pause");

    }

    this.animate();

  },

  updatePosition:function(gravity, friction) {

    this.x_old = this.x;
    this.y_old = this.y;
    this.velocity_y += gravity;
    this.x    += this.velocity_x;
    this.y    += this.velocity_y;

    this.velocity_x *= friction;
    this.velocity_y *= friction;

  }

};

/* Двойное наследование прототипа от Object и Animator. */
Object.assign(Game.World.Object.Player.prototype, Game.World.Object.prototype);
Object.assign(Game.World.Object.Player.prototype, Game.World.Object.Animator.prototype);
Game.World.Object.Player.prototype.constructor = Game.World.Object.Player;

/* Класс TileSheet из класса Display и переименован в TileSet.
Он делает все то же самое, но у него нет ссылки на изображение, и это также
определяет определенные области в изображении набора плиток, которые соответствуют спрайту игрока
анимационные кадры. */
Game.World.TileSet = function(columns, tile_size) {

  this.columns    = columns;
  this.tile_size  = tile_size;

  let f = Game.World.TileSet.Frame;

  /* Массив всех кадров в изображении листа плитки. */
  this.frames = [new f( 112, 80, 16, 16, 1, -2), // смотрит на лево
                 new f( 32,  80, 16, 16, 1, -2), // прыжок в левую сторону
                 new f( 96,  80, 16, 16, 1, -2), new f(80, 80, 16, 16, 1, -2), new f(64, 80, 16, 16, 1, -2), new f(32, 80, 16, 16, 1, -2), // ходьба в левую сторону
                 new f(  0,  96, 16, 16, 1, -2), // смотрит на право
                 new f( 80,  96, 16, 16, 1, -2), // прыжок в правую сторону
                 new f( 16,  96, 16, 16, 1, -2), new f(32, 96, 16, 16, 1, -2), new f(48, 96, 16, 16, 1, -2), new f(16, 96, 16, 16, 1, -2) // ходьба в правую сторону
                ];       
};

Game.World.TileSet.prototype = { constructor: Game.World.TileSet };

/* Класс Frame определяет область для вырезания. Он имеет смещение по осям X и Y, 
   использует для рисования вырезаный фрагмент, размещая спрайты в любом месте. */
Game.World.TileSet.Frame = function(x, y, width, height, offset_x, offset_y) {

  this.x        = x;
  this.y        = y;
  this.width    = width;
  this.height   = height;
  this.offset_x = offset_x;
  this.offset_y = offset_y;

};

Game.World.TileSet.Frame.prototype = { constructor: Game.World.TileSet.Frame };
