window.addEventListener("load", function(event) {

  "use strict";

  /* Был перемщен из класса Controller в основной файл, из-за дальнейшей работы с отображением или обработкой
входного события к обновлению контроллера.
Не ссылаясь на данные компоненты внутренней логики контроллера, обработчики события перемещены к главному файлу.
*/
  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  /* Также перемещен обработчик Display. Для ссылания на игру и отображать изменения размеров рабочей области.
  Не ссылаясь на игру внутри класса отображения, был перемещен метод редактирования размеров в гланый файл.
  */
  var resize = function(event) {

    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32, game.world.height / game.world.width);
    display.render();

  };

  var render = function() {

    display.fill(game.world.background_color);// Очистка фона для цвета фона игры
    display.drawRectangle(game.world.player.x, game.world.player.y, game.world.player.width, game.world.player.height, game.world.player.color);
    display.render();

  };

  var update = function() {

    if (controller.left.active)  { game.world.player.moveLeft();  }
    if (controller.right.active) { game.world.player.moveRight(); }
    if (controller.up.active)    { game.world.player.jump(); controller.up.active = false; }

    game.update();

  };

  var controller = new Controller();
  var display    = new Display(document.querySelector("canvas"));
  var game       = new Game();
  var engine     = new Engine(1000/30, render, update);

  /* Рабочая область буфера должена идти пиксель за пикселем так же как размер мира, 
     для правельного масштабирования графики. 
     Все игры знают местоположения игроков и размеры миров. Указываем рамер дисплея, для соответствования.*/
  display.buffer.canvas.height = game.world.height;
  display.buffer.canvas.width = game.world.width;

  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);

  resize();

  engine.start();

});
