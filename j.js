


$(document).ready(function(){

  //constants
  var N = 1;
  var E = 2;
  var S = 3;
  var W = 4;
  var O = 0;
  var H = 5;
  var F = 6;

  //coordinates of the head and tail of the snake
  var last;
  var head;
  //timer
  var timer;
  //Last commanded direction
  var direction;
  //directions to use before falling back to last command
  var directionStack;

  var width = 10;
  var height = 10;

  var game = [];
  var foodInPlay = 0;
  var spacesInPlay = 0;


  

  /******************/
  /* Render & Setup */
  /******************/


  function start(){
    var main = $('main #game');
    main.html("");
    var table = $('<table/>');


    main.append(table);

    spacesInPlay = width * height -1;
    foodInPlay = 0;

    game = [];
    for (var i = 0; i < height; i++){
      var tr = $('<tr/>');
      table.append(tr);
      for (var j = 0; j < width; j++){
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
    }, 300);
  }

  function endGame(){
    clearInterval(timer);
    $('#gameover').html("GAME OVER!");
  }

  function rerender(coord){
    var td = game[coord.x][coord.y].td;
    var state = gameState(coord);

    td.removeClass("snake");
    td.removeClass("empty");
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
            coord.x = mod(coord.x -1, height);
            break;
        case E:
            coord.y = mod(coord.y +1, height);
            break;
        case S:            
            coord.x = mod(coord.x +1, height);
            break;
        case W:
            coord.y = mod(coord.y -1, height);
            break;
        default:
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
        var rx = getRandomInt(width);
        var ry = getRandomInt(height);
        coord = get(rx,ry);
      } while (gameState(coord) != O && isFood(coord))

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
    var wwidth = $(window).width();
    var wheight = $(window).height() - 30;
    var min = Math.min(wwidth, wheight);

    $('#game table').width(min).height(min);
    $('#game table td').width(wwidth / width);
  }

  $(window).on('resize',function(){ format(); });

  $('#start').on('click', function(){
    start();
    format();
  });

  $('#next').on('click', function(){
    next();
  });

  $('#stop').on('click', function(){
    endGame();
  });


  $('body').on('keydown', function(e){
    console.log(e);
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
