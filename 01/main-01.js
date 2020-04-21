window.addEventListener("load", function(event) {

  "use strict";

  var render = function() {

    display.renderColor(game.color);
    display.render();

  };

  var update = function() {

    game.update();

  };

    /* Стремясь достичь более чистого кода, я написал классы для каждого раздела и создал их здесь.*/

    /* Контроллер обрабатывает ввод пользователя */
    var controller = new Controller();
    /* Дисплей обрабатывает изменение размера окна, а также экранное полотно */
    var display    = new Display(document.querySelector("canvas"));
    /* Игра со временем сохранит игровую логику */
    var game       = new Game();
    /* engine - это место, где вышеупомянутые три секции могут взаимодействовать */
    var engine     = new Engine(1000/30, render, update);

    window.addEventListener("resize",  display.handleResize);
    window.addEventListener("keydown", controller.handleKeyDownUp);
    window.addEventListener("keyup",   controller.handleKeyDownUp);

    display.resize();
    engine.start();

});
