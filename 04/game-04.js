const Game = function() {

  this.world = new Game.World();// Изменения в классе Game.World.

  this.update = function() {

    this.world.update();

  };

};

Game.prototype = { constructor : Game };

Game.World = function(friction = 0.9, gravity = 3) {

  this.collider = new Game.World.Collider();// Новый класс Collider.

  this.friction = friction;
  this.gravity  = gravity;

  this.player   = new Game.World.Player();

  this.columns   = 12;
  this.rows      = 9;
  this.tile_size = 16;

  /* Карта с измененым смещением. Имеет только размещение графики без физики столкновения. */
  this.map = [01,28,28,28,28,00,01,28,28,28,00,27,
              09,26,26,26,26,08,09,26,26,26,16,00,
              09,26,26,34,34,08,09,26,34,34,26,08,
              19,21,34,26,36,37,38,39,26,34,04,18,
              01,29,26,34,34,26,34,26,34,02,18,41,
              09,26,26,25,34,26,34,34,25,16,28,00,
              09,26,26,26,26,24,34,26,26,26,34,10,
              19,21,34,34,34,40,34,40,34,34,34,10,
              41,19,20,20,20,20,20,20,20,20,20,18];

  /* Значения столкновения соответствуют функциям столкновения в классе Collider.
   00 не имеет границ столкновения, все остальное выполняется через оператор switch и направляется на
   соответствующие функции столкновения.

  0000 = 0  Фрейм 0:  0    Фрейм 1:   1     Фрейм 2:   0    Фрейм 15:   1
  0001 = 1          0   0           0   0            0   1            1   1
  0010 = 2            0               0                0                1
  1111 = 15  Без границ    Граница с верху  Граница с права   Все границы

  Это двоичное представление может использоваться для описания стороны элемента фреймового изображения являются границами.
   Каждый бит представляет сторону: 0 0 0 0 = l b r t (слева внизу справа вверху). */

  this.collision_map = [00,04,04,04,04,00,00,04,04,04,04,00,
                        02,00,00,00,00,08,02,00,00,00,12,00,
                        02,00,00,00,00,08,02,00,00,00,00,08,
                        00,03,00,00,13,04,04,07,00,00,09,00,
                        00,06,00,00,00,00,00,00,00,09,00,00,
                        02,00,00,01,00,00,00,00,01,12,04,00,
                        02,00,00,00,00,11,00,00,00,00,00,08,
                        00,03,00,00,00,10,00,11,00,00,00,08,
                        00,00,01,01,01,00,01,00,01,01,01,00];

  this.height   = this.tile_size * this.rows;
  this.width    = this.tile_size * this.columns;

};

Game.World.prototype = {

  constructor: Game.World,

  collideObject:function(object) {

    /* Удостоверность границ мира */
    if      (object.getLeft()   < 0          ) { object.setLeft(0);             object.velocity_x = 0; }
    else if (object.getRight()  > this.width ) { object.setRight(this.width);   object.velocity_x = 0; }
    if      (object.getTop()    < 0          ) { object.setTop(0);              object.velocity_y = 0; }
    else if (object.getBottom() > this.height) { object.setBottom(this.height); object.velocity_y = 0; object.jumping = false; }

    var bottom, left, right, top, value;

    /* Сперва проверим левый верхний угол объекта. Получаем сведенья строки и столбца в карте столкновений.
    В этом случае строка является верхней, а столбец оставлен, затем мы передаем информацию функции столкновения коллайдера. */
    top    = Math.floor(object.getTop()    / this.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_size);
    value  = this.collision_map[top * this.columns + left];
    this.collider.collide(value, object, left * this.tile_size, top * this.tile_size, this.tile_size);

    /*Заново определяем вершину с момента последней проверки столкновения, 
    из-за возможности смещения проверки с последнего момента.*/
   
    top    = Math.floor(object.getTop()    / this.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_size);
    value  = this.collision_map[top * this.columns + right];
    this.collider.collide(value, object, right * this.tile_size, top * this.tile_size, this.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_size);
    value  = this.collision_map[bottom * this.columns + left];
    this.collider.collide(value, object, left * this.tile_size, bottom * this.tile_size, this.tile_size);


    bottom = Math.floor(object.getBottom() / this.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_size);
    value  = this.collision_map[bottom * this.columns + right];
    this.collider.collide(value, object, right * this.tile_size, bottom * this.tile_size, this.tile_size);

  },

  update:function() {

    this.player.velocity_y += this.gravity;
    this.player.update();

    this.player.velocity_x *= this.friction;
    this.player.velocity_y *= this.friction;

    this.collideObject(this.player);

  }

};

Game.World.Collider = function() {

  /* Метод маршрутизации функций. Мы знаем внешний вид объекта, с чем он должен столкнутся, положение х и у, размеры.
  Этой функцией решаются какие столкновения используются в зависимостях от значений и позволяет настраивать иные значения, 
  для сооветсвия форме объекта. 
  */
  this.collide = function(value, object, tile_x, tile_y, tile_size) {

    switch(value) { // Значение фрейма

      /* 15 типов для описания 4 сторон столкновения. Они комбинируются и подбираются для каждого фрейма.*/ 
   
      case  1: this.collidePlatformTop      (object, tile_y            ); break; // столкновение вверху.
      case  2: this.collidePlatformRight    (object, tile_x + tile_size); break; // столкновение с право.
      case  3: if (this.collidePlatformTop  (object, tile_y            )) return;// При столкновении не нужно ничего проверять.
               this.collidePlatformRight    (object, tile_x + tile_size); break; // столкновение вверху и с права.
      case  4: this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение внизу.
      case  5: if (this.collidePlatformTop  (object, tile_y            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение вверху и с низу.
      case  6: if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение с права и с низу.
      case  7: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение вверху, с права, с низу.
      case  8: this.collidePlatformLeft     (object, tile_x            ); break; // столкновение с лева.
      case  9: if (this.collidePlatformTop  (object, tile_y            )) return;
               this.collidePlatformLeft     (object, tile_x            ); break; // столкновение вверху и с лева.
      case 10: if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformRight    (object, tile_x + tile_size); break; // столкновение с лева и с права.
      case 11: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformRight    (object, tile_x + tile_size); break; // столкновение вверху, с лева, с права.
      case 12: if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение с лева и с низу.
      case 13: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение вверху, с лева, с низу.
      case 14: if (this.collidePlatformLeft (object, tile_x            )) return;
               if (this.collidePlatformRight(object, tile_x            )) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение с лева, с права, с низу.
      case 15: if (this.collidePlatformTop  (object, tile_y            )) return;
               if (this.collidePlatformLeft (object, tile_x            )) return;
               if (this.collidePlatformRight(object, tile_x + tile_size)) return;
               this.collidePlatformBottom   (object, tile_y + tile_size); break; // столкновение вверху, с лева, с права, с низу.

    }

  }

};

/* Нахождение всего функционала столкновений. */
Game.World.Collider.prototype = {

  constructor: Game.World.Collider,

  /* Решит коллизию (если есть) между объектом и местоположением y
   низа какого либо объекта. Все эти функции практически одинаковы, только настроены
   для разных сторон объекта и разных траекторий движения объекта. */
  collidePlatformBottom:function(object, tile_bottom) {
   
    if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

      object.setTop(tile_bottom);// Перемещение верхней части объекта к нижней части.
      object.velocity_y = 0;     // Остановка движения в данном направлении.
      return true;               // Возвращает true, из-за столкновения.

    } return false;              // Возвращает false, если нет столкновения.

  },

  collidePlatformLeft:function(object, tile_left) {

    if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

      object.setRight(tile_left - 0.01);// -0.01 - исправить небольшую проблему с округлением.
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

/* Класс объекта - это просто базовый прямоугольник с кучей функций-прототипов.
чтобы помочь нам работать с позиционированием этого прямоугольника. */
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

  /* Эти функции используются для получения и установки различных боковых положений объекта. */
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

Game.World.Player = function(x, y) {

  Game.World.Object.call(this, 100, 100, 11, 11);

  this.color1     = "#404040";
  this.color2     = "#f0f0f0";

  this.jumping    = true;
  this.velocity_x = 0;
  this.velocity_y = 0;

};

Game.World.Player.prototype = {

  jump:function() {

    if (!this.jumping) {

      this.jumping     = true;
      this.velocity_y -= 20;

    }

  },

  moveLeft:function()  { this.velocity_x -= 0.5; },
  moveRight:function() { this.velocity_x += 0.5; },

  update:function() {

    this.x_old = this.x;
    this.y_old = this.y;
    this.x    += this.velocity_x;
    this.y    += this.velocity_y;

  }

};

Object.assign(Game.World.Player.prototype, Game.World.Object.prototype);
Game.World.Player.prototype.constructor = Game.World.Player;
