


$(document).ready(function(){

  //constants 
  //The order and offset is important for other methods!
  var N = 1;
  var E = 2;
  var S = 3;
  var W = 4;
  var O = 0;
  var H = 5;

  //coordinates of the head and tail of the snake
  var last;
  var head;
  //timer
  var timer;
  //Last commanded direction
  var direction;
  //directions to use before falling back to last command
  var directionStack;
  //last applied direction
  var lastDirection;
  //config in use
  var config;

  //game array
  var game = [];

  //counts
  var foodInPlay = 0;
  var spacesInPlay = 0;

  

  /***************************/
  /* Render / Setup / Configs*/
  /***************************/

  var configs = {
    Hard: {
      speed : 100,
      border: false,
      width: 25,
      height: 25,
      maxfood: 1
    },
    Easy : {
      speed : 250,
      border: true,
      width: 15,
      height: 15,
      maxfood: 2
    }
  }

  

  var localStorageName = "lastUsedConfig";

  function initConfig() {
    config = {
      speed: parseInt($('#speed').val()),
      border: $('input[name=border]:checked').val() == "1",
      width: parseInt($('#width').val()),
      height: parseInt($('#height').val()),
      maxfood: parseInt($('#foodval').val())

    }
    localStorage.setItem(localStorageName, JSON.stringify(config));
  }

  function retreiveLocalStorage() {
    var lsconf = localStorage.getItem(localStorageName);
    if (typeof(lsconf) == "string") {
      useConfig(JSON.parse(lsconf));
    }
  }
  
  function useConfig(conf) {
    config = conf;
    $("#speed-slider").slider("value", config.speed);
    $("#height-slider").slider("value", config.height);
    $("#width-slider").slider("value", config.width);
    if (config.border) {
      $('#radio1' ).prop('checked',true);
    } else {
      $('#radio2' ).prop('checked',true);
    }
    $('.radio').buttonset('refresh');
    $('#food-slider').slider("value",config.maxfood);
  }

  function start(){

    $('#about').hide();
    $('#game').show();
    $('#about-toggle').show();

    //Asser timer over 
    endGame();
    $('#gameover').hide();
    $('#counter').show();

    initConfig();

    var main = $('main #game');
    main.html("");
    var table = $('<table/>');

    if (config.border) {
      table.addClass("openborder");
    } else {
      table.addClass("closedborder")
    }

    main.append(table);

    spacesInPlay = config.width * config.height -1;
    foodInPlay = 0;

    game = [];
    for (var i = 0; i < config.height; i++){
      var tr = $('<tr/>');
      table.append(tr);
      for (var j = 0; j < config.width; j++){
        gs = defaultGameState(j, i);
        tr.append(gs.td)
      }
    }
    last = get(0,0);
    head = get(0,0);
    setGameState(head, H);
    direction = E;
    directionStack = [];
    timer = setInterval(function() {
      next();
    }, config.speed);

    format();
  }

  function endGame(){
    clearInterval(timer);
    $('#gameover').show();
    format();
  }

  function rerender(coord){
    var td = game[coord.x][coord.y].td;
    var state = gameState(coord);

    td.removeClass("snake empty head");
    switch(state) {
        case N:
            td.addClass("snake");
            break;
        case E:
            td.addClass("snake");
            break;
        case S:
            td.addClass("snake");
            break;
        case W:
            td.addClass("snake");
            break;
        case H:
            td.addClass("snake head");
            break;
        default:
            td.addClass("empty");
    }

    if (isFood(coord)) {
      td.addClass("food");
    }else {
      td.removeClass("food");
    }

  }




  /**************/
  /* Game State */
  /**************/
 

  function getInDir(coords, dir) {
    coord = dupli(coords);
    switch(dir) {
        case N:
            coord.y = (coord.y -1);
            break;
        case E:
            coord.x = (coord.x +1);
            break;
        case S:            
            coord.y = (coord.y +1);
            break;
        case W:
            coord.x = (coord.x -1);
            break;
        default:
    }
    if (config.border){
      coord.x = mod(coord.x, config.width);
      coord.y = mod(coord.y, config.height);
    } else {
      if (coord.x > config.width -1 || coord.x < 0 || coord.y< 0 || coord.y > config.height - 1) {
        coord.outofbounds = true;
      }
    }
    return coord;
  }

  function defaultGameState(i, j) {

    if (!$.isArray(game)) {
      game = [];
    }
    if (!$.isArray(game[i])){
      game[i] = [];
    }

    game[i][j] = {
      state: O,
      td: $('<td>'),
      food: false
    };
    rerender(get(i,j))
    return game[i][j];
  }


  function gameState(coord) {
    return game[coord.x][coord.y].state;
  }

  function setGameState(coord, state) {
    game[coord.x][coord.y].state = state;
    rerender(coord);
  }

  //advance the frame
  function next() {

    mayAddFood();

    var dir;
    if (directionStack.length == 0) {
      dir = direction;
    } else {
      dir = directionStack.shift();
    }

    var shouldBeNext = getInDir(head, dir);
    if (shouldBeNext.outofbounds) {
      endGame();
      return;
    }

    var nextHeadGameState = gameState(shouldBeNext);
    // Fail if there is a (head taking anything other than the last) || a swap of head and tail
    if ( (nextHeadGameState != O &&  !coordEquals(shouldBeNext, last)) || coordEquals(getInDir(shouldBeNext, nextHeadGameState), head)) {
        endGame();
        return;
    }

    //Go ahead guarentee

    if (isFood(shouldBeNext)) {
      foodInPlay--;
    }

    //assume just head
    var justHead = false;
    
    var directionLast = gameState(last);
    //check if it just the head
    if (directionLast == H) {
      justHead = true;
      directionLast = dir;
    }

    var didEat = false;
    if (isFood(last)) {
      didEat = true;
      removeFood(last);
      spacesInPlay--;
    } else {
     
      var newLast = getInDir(last, directionLast);
      
      setGameState(last, O);
      last =  newLast;
    }

    if (!justHead || didEat) {
      setGameState(head, dir);
    } 

    head = shouldBeNext;
    setGameState(head, H);

    $('#food').html(foodInPlay);
    $('#spaces').html(spacesInPlay);
    
  }


  /*********/
  /* COORD */
  /*********/

  function coordEquals(a, b) {
    return a.x == b.x && a.y == b.y;
  }

  function get(x,y){
    return {
      x : x,
      y : y
    };
  }

  function dupli(coord){
    return get(coord.x, coord.y);
  }


  /********/
  /* FOOD */
  /********/
  function mayAddFood(){
    if (spacesInPlay > 0 && foodInPlay < config.maxfood && getRandomInt(Math.pow(2, foodInPlay + 1)) < 1){
      var coord;
      do {
        var rx = getRandomInt(config.width);
        var ry = getRandomInt(config.height);
        coord = get(rx,ry);
      } while (gameState(coord) != O || isFood(coord));

      putFood(coord)
      foodInPlay++;
    }
  }
  function isFood(coord) {
    return game[coord.x][coord.y].food;
  }
  function putFood(coord) {
    game[coord.x][coord.y].food = true;
    rerender(coord);
  }
  function removeFood(coord) {
    game[coord.x][coord.y].food = false;
    rerender(coord);
  }


  /*********/
  /* UTILS */
  /*********/

  //get a number between 0 and max - 1 (max not included)
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function format() {

    if (config == null) {
      var sqw = 1;
      var sqh = 1;
    } else {
      var sqw = config.width;
      var sqh = config.height;
    }
    var wwidth = $(window).width() - $('#control').width() -20;
    var wheight = $(window).height() - $('header').outerHeight() - 30;
    var min = Math.min(wwidth /sqw, wheight/sqh);

    $('body').width(min * sqw + $('#control').width() + 20);
    $('#game table').width(min * sqw).height(min* sqh);
  }

  /**********/
  /* EVENTS */
  /**********/

  $(window).on('resize',function(){ format(); });

  var sliderEventBinder = function(slidername, showbox, config) {
    var onFn = function() {
      $('#' + showbox).val( $("#" + slidername).slider("value") );
    }
    config.create = onFn;
    config.slide = onFn;
    config.change = onFn;
    $( "#" + slidername ).slider(config);
  }

  sliderEventBinder("speed-slider", "speed",{
    value: configs.Easy.speed,
    min: 50,
    max: 400,
    step: 25
  });

  sliderEventBinder("width-slider", "width",{
    value:configs.Easy.width,
    min: 10,
    max: 50,
    step: 5
  });

  sliderEventBinder("height-slider", "height",{
    value: configs.Easy.height,
    min: 10,
    max: 50,
    step: 5
  });

  sliderEventBinder("food-slider", "foodval",{
    value: configs.maxfood,
    min: 1,
    max: 10,
    step: 1
  });

  $('.radio').buttonset();

  $('.buttons input[type=button]').button();

  $('.defaultConfig').on("click", function() {
    useConfig(configs[$(this).val()]);
    start();
  });

  $('#start').on('click', function(){
    start();
  });


  $('#about-toggle').on('click', function() {
    $('#about').toggle();
    $('#game').toggle();
  });

  $('body').on('keydown', function(e){
    if (e.keyCode >=37 && e.keyCode <=40) {
      var dir;
      switch(e.keyCode) { 
        case 37:
            dir = W;
            break;
        case 38:
            dir = N;
            break;
        case 39:            
            dir = E;
            break;
        case 40:
            dir = S;
            break;
      } 
      if (!((dir - 1 + 2) % 4 + 1 == direction && directionStack.length == 0)){

        directionStack.push(dir);
        direction = dir;

      }
    } else if(e.keyCode == 32){
        // addFood();
    }

  });

  $('#start').button();
  $('#about-toggle').hide();

  $('#gameover').hide();
  $('#counter').hide();
  $('#game').hide();
  $('#hide').hide();
  format();
  retreiveLocalStorage();




});
