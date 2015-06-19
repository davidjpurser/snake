


$(document).ready(function(){


  var width = 10;
  var height = 10;
  var game = [];
  var tds = [];
  var eaten = 0;
  var length = 0;

  var N = 1;
  var E = 2;
  var S = 3;
  var W = 4;
  var O = 0;
  var H = 5;
  var F = 6;
  var last;
  var head;
  var direction;


  function get(x,y){
    return {
      x : x,
      y : y
    };
  }


  function start(){
    var main = $('main #game');
    main.html("");
    var table = $('<table/>');


    main.append(table);
    console.log('starting');
    game = [];
    for (var i = 0; i < height; i++){
      game[i] = [];
      tds[i] = [];
      var tr = $('<tr/>');
      table.append(tr);
      for (var j = 0; j < width; j++){

        var td = $('<td>');
        tr.append(td);
        td.data('row', i);
        td.data('column', j);
        game[i][j] = {
          state: 0,
          td: td,
          food: false

        };
        updateCoord(get(i,j));
      }
    }
    last = get(0,0);
    head = get(0,0);
    setGameState(head, H);
    updateCoord(head);
    direction = E;

  }

  function getCoodsFromTd(td){
    return get(td.data('row'), td.data('column'));
  }

  function updateCoord(coord){
    var td = game[coord.x][coord.y].td;
    var state = gameState(coord);
    switch(state) {
        case N:
            td.html("N");
            break;
        case E:
            td.html("E");
            break;
        case S:
            td.html("S");
            break;
        case W:
            td.html("W");
            break;
        case H:
            td.html("H");
            break;
        default:
            td.html("O");
    }

    if (isFood(coord)) {
      td.append("<sub>F</sub>");
    }

  }

  function isFood(coord) {
    return game[coord.x][coord.y].food;
  }

  function mod(n, m) {
        return ((n % m) + m) % m;
  }

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

  function dupli(coord){
    return get(coord.x, coord.y);
  }

  function gameState(coord) {
    return game[coord.x][coord.y].state;
  }

  function setGameState(coord, state) {
    game[coord.x][coord.y].state = state;
  }

  function next() {
    var eat = false;
    var shouldBeNext = getInDir(head, direction);

    if (gameState(shouldBeNext) != O) {
      endGame();
      return;
    }

    setGameState(head, direction);
    updateCoord(head);
    head = shouldBeNext;
    setGameState(head, H);
    updateCoord(head);

    if (isFood(last)) {
      removeFood(last);
      updateCoord(last);
    } else {
      var newLast = getInDir(last, gameState(last));
      setGameState(last, O);
      updateCoord(last);
      last = newLast;
    }
  }

  function endGame(){
    alert('die');
  }

  function addFood(){
    var coord;
    do {
      var rx = getRandomInt(width);
      var ry = getRandomInt(height);
      coord = get(rx,ry);
    } while (gameState(coord).state !=O && isFood(coord))

    console.log(coord, gameState(coord));
    putFood(coord)
    updateCoord(coord);
  }

  function putFood(coord) {
    game[coord.x][coord.y].food = true;
  }
  function removeFood(coord) {
     game[coord.x][coord.y].food = false;
  }

  //get a number between 0 and max - 1 (max not included)
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  $('#start').on('click', function(){
    start();
  });

  $('#next').on('click', function(){
    next();
  });

  $('body').on('keydown', function(e){
    console.log(e);
    if (e.keyCode >=37 && e.keyCode <=40) {

      switch(e.keyCode) {
        case 37:
            direction = W;
            break;
        case 38:
            direction = N;
            break;
        case 39:            
            direction = E;
            break;
        case 40:
            direction = S;
            break;
      } 
      next();
    } else if(e.keyCode == 32){
        addFood();
    }

  });



});
