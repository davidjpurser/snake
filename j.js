


$(document).ready(function(){


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
  var timer;

  var width = 10;
  var height = 10;

  var game = [];
  var foodInPlay = 0;
  var spacesInPlay = 0;


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

    spacesInPlay = width * height -1;
    foodInPlay = 0;

    game = [];
    for (var i = 0; i < height; i++){
      game[i] = [];
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
    timer = setInterval(function() {
      next();
    }, 300);
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

    if (getRandomInt(9) >= 6) {
      addFood();
    }

    var shouldBeNext = getInDir(head, direction);

    if (isFood(last)) {
      removeFood(last);
      updateCoord(last);
      spacesInPlay--;
    } else {
      var directionLast = gameState(last);
      if (directionLast == H) {
        console.log("is head");
        directionLast = direction;
      }
      var newLast = getInDir(last, directionLast);
      setGameState(last, O);
      updateCoord(last);
      last = newLast;
    }

    if (gameState(shouldBeNext) != O) {
      endGame();
      return;
    }

    if (isFood(shouldBeNext)) {
      foodInPlay--;
    }

    //gameState == 0 means that it head == last as the last management has moved the last forward once already (to the new shouldBeNext).
    if (gameState(last) != O) {
      setGameState(head, direction);
      updateCoord(head);
    }
    head = shouldBeNext;
    setGameState(head, H);
    updateCoord(head);

    $('#food').html(foodInPlay);
    $('#spaces').html(spacesInPlay);
    
  }

  function endGame(){
    clearInterval(timer);
    alert('die');
  }

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
      updateCoord(coord);
    }
  }

  function isSpaceForFood() {
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++){
        if (gameState(get(i,j)) == O) {
          return true;
        } 
      }
    }
    return false;
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

  $('#stop').on('click', function(){
    endGame();
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
    } else if(e.keyCode == 32){
        // addFood();
    }

  });



});
