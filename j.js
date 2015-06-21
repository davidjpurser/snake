


$(document).ready(function(){

  //constants
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

  var config;


  var game = [];
  var foodInPlay = 0;
  var spacesInPlay = 0;


  

  /******************/
  /* Render & Setup */
  /******************/

  $('#gameover').hide();
  $('#counter').hide();

  function initConfig() {
    config = {
      speed: parseInt($('#speed').val()),
      border: $('input[name=border]:checked').val() == "1",
      width: parseInt($('#width').val()),
      height: parseInt($('#height').val())

    }
    console.log(config);
  }

  function start(){
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
        gs = defaultGameState(i, j);
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
  }

  function endGame(){
    clearInterval(timer);
    $('#gameover').show();
    format();
  }

  function rerender(coord){
    var td = game[coord.x][coord.y].td;
    var state = gameState(coord);

    td.removeClass("snake");
    td.removeClass("empty");
    td.removeClass("head");
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
            td.addClass("snake");
            td.addClass("head");
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
            coord.x = (coord.x -1);
            break;
        case E:
            coord.y = (coord.y +1);
            break;
        case S:            
            coord.x = (coord.x +1);
            break;
        case W:
            coord.y = (coord.y -1);
            break;
        default:
    }
    console.log(config);
    console.log(mod(coord.x, config.width));
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

  function next() {

    if (getRandomInt(9) >= 6) {
      addFood();
    }

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

    console.log(shouldBeNext);

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
  function addFood(){
    if (spacesInPlay > 0 && foodInPlay < 2){
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
    var wwidth = $(window).width() - $('#control').width() -20;
    var wheight = $(window).height() - $('header').outerHeight() - 30;
    var min = Math.min(wwidth, wheight);

    $('body').width(Math.max(min) + $('#control').width() + 20);
    $('#game table').width(min).height(min);
  }
  format();

  $(window).on('resize',function(){ format(); });



  $( "#speed-slider" ).slider({
    value:300,
    min: 150,
    max: 500,
    step: 25,
    slide: function( event, ui ) {
      $('#speed').val( ui.value );
    },
    create: function( event, ui ) {
      $('#speed').val( 300 );
    }
  });

  $( "#width-slider" ).slider({
    value:15,
    min: 10,
    max: 50,
    step: 5,
    slide: function( event, ui ) {
      $('#width').val( ui.value );
    },
    create: function( event, ui ) {
      $('#width').val( 15 );
    }
  });

  $( "#height-slider" ).slider({
    value:15,
    min: 10,
    max: 50,
    step: 5,
    slide: function( event, ui ) {
      $('#height').val( ui.value );
    },
    create: function( event, ui ) {
      $('#height').val( 15 );
    }
  });

  $('.radio').buttonset();

  $('#start').on('click', function(){
    $('#about').hide();
    $('#game').show();
    start();
    format();
  });

  $('#next').on('click', function(){
    next();
  });

  $('#stop').on('click', function(){
    endGame();
  });

  $('#about-toggle').on('click', function() {
    $('#about').toggle();
    $('#game').toggle();
  });



  $('#game').hide();
  $('#hide').hide();

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
      directionStack.push(dir);
      direction = dir;

    } else if(e.keyCode == 32){
        // addFood();
    }

  });



});
