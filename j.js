


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
    tds =[];
    for (var i = 0; i < height; i++){
      game[i] = [];
      tds[i] = [];
      var tr = $('<tr/>');
      table.append(tr);
      for (var j = 0; j < width; j++){
        game[i][j] = O;
        var td = $('<td>');
        tds[i][j] = td;
        tr.append(td);
        td.data('row', i);
        td.data('column', j);
        update(td);
      }
    }
    game[0][0] = H;
    update(tds[0][0]);
    last = get(0,0);
    head = get(0,0);
    direction = E;

  }

  function getCoodsFromTd(td){
    return get(td.data('row'), td.data('column'));
  }

  function updateCoord(coord){
    update(tds[coord.x][coord.y]);
  }

  function update(td) {
    var coords = getCoodsFromTd(td);
    var state = game[coords.x][coords.y];
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
            console.log("Doing this");
            td.html("H");
            break;
        default:
            td.html("O");
    }

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
    return game[coord.x][coord.y];
  }

  function setGameState(coord, state) {
    game[coord.x][coord.y] = state;
  }

  function next() {

    var shouldBeNext = getInDir(head, direction);
    if (gameState(shouldBeNext) == F) {
      eaten++;
    } else if (gameState(shouldBeNext) != O) {
      endGame();
      return;
    }

    setGameState(head, direction);
    updateCoord(head);
    head = shouldBeNext;
    setGameState(head, H);
    console.log(head, gameState(head));
    updateCoord(head);
    if (eaten > 0) {
      eaten--;
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
    } while (gameState(coord) != O)
    setGameState(coord, F)
    updateCoord(coord);
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
