const Engine = function(time_step, update, render) {

  this.accumulated_time        = 0;// накопленное время с последнего обновления
  this.animation_frame_request = undefined,// ссылаемся на animation_frame_request
  this.time                    = undefined,// последняя отметка времени в цикле
  this.time_step               = time_step,// 30 кадров в секунду

  this.updated = false;// вызвана ли функция обновления со периода конечного цикла

  this.update = update;// обновление
  this.render = render;// рендеринг

  this.run = function(time_stamp) {

    this.accumulated_time += time_stamp - this.time;
    this.time = time_stamp;

    /* при медленной работе, обновление займет больше времени, чем наш временной шаг. 
       Игра зависнет и перегрузит процессор. Чтобы такого не произошло, ставим ограничение обновления трех кадров.
    */
    if (this.accumulated_time >= this.time_step * 3) {

      this.accumulated_time = this.time_step;

    }

    /* Мы обновляем при готовом экране для отрисовки запрашивая анимацию кадра функцией run.
     Производим проверку сохраненного времени и проверяем обновления.
    */
    while(this.accumulated_time >= this.time_step) {

      this.accumulated_time -= this.time_step;

      this.update(time_stamp);

      this.updated = true;// после обновления игры рисуем ее заного

    }

    /* Рисует после обновления*/
    if (this.updated) {

      this.updated = false;
      this.render(time_stamp);

    }

    this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

  };

  this.handleRun = (time_step) => { this.run(time_step); };

};

Engine.prototype = {

  constructor:Engine,

  start:function() {

    this.accumulated_time = this.time_step;
    this.time = window.performance.now();
    this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

  },

  stop:function() { window.cancelAnimationFrame(this.animation_frame_request); }

};
