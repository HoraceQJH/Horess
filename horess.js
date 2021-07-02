// Based on ybj's code and cyb's code

class Queue // 来自度娘的一个queue模板
{
    constructor()
    {
        this.count = 0;//记录队列的数量
        this.lowestCount = 0;//记录当前队列顶部的位置
        this.items = [];//用来存储元素。
    }
    enqueue(element)
    {
        this.items[this.count] = element;
        this.count++;
    }
    dequeue()
    {
        if(this.isEmpty())
        {
            return 'queue is null';
        }
        let resulte = this.items[this.lowestCount];
        delete this.items[this.lowestCount];
        this.lowestCount++;
        return resulte;
    }
    peek()
    {
        return this.items[this.lowestCount];
    }
    isEmpty()
    {
        return this.count - this.lowestCount === 0;
    }
    size()
    {
        return this.count - this.lowestCount;
    }
    clear()
    {
        this.count = 0;
        this.lowestCount = 0;
        this.items = [];
    }
    toString()
    {
        if(this.isEmpty())return "queue is null";
        let objString = this.items[this.lowestCount];
        for(let i = this.lowestCount+1; i < this.count;i++)
        {
            objString = `${objString},${this.items[i]}`;
        }
        return objString;
    }
}
function cAlert(html) // New Alert
{
  $(document.body).append(`<div class="modal fade" id="cAlert" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
    <div class="modal-body" style="text-align:center">${html}</div>
    <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-dismiss="modal">确认</button>
    </div></div></div></div>`);
  $("#cAlert").modal("show").on("shown.bs.modal",
    function ()
    {
      $("#cAlert .btn-secondary").trigger("focus");
    }
  );
  return new Promise(
    function (resolve, reject)
    {
      $("#cAlert").on("hidden.bs.modal",
        function () 
        {
          $("#cAlert").remove();
          resolve();
        }
      );
    }
  );
}

function pos(x, y) // return the position of any given (x,y)
{
  return `top: ${Number(x) * 50}px; left: ${Number(y) * 50}px;`;
}

var board = [[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]];
// board format: [team, level, effect(array), blood, speed, attack, reallevel]
var isDead = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var nam = ["炮", "炮", "马", "马", "球", "球", "猴", "猴"]; //每个棋子的名称
var blood = [2, 2, 3, 3, 6, 6, 1, 1]; //每个棋子的初始血量
var attack = [4, 4, 2, 2, 1, 1, 3, 3]; //每个棋子的初始攻击力
var initPos = [[0, 1], [0, 6], [0, 2], [0, 5], [0, 3], [0, 4], [0, 0], [0, 7]]; //每个旗子所对应的初始坐标
var player = 0;
var going = 0;
var turn = 0; // number of goes made up to now

function inProducer(x, y) //在道具生产者之内
{
  return (x >= 3 && x <= 4 && y >= 3 && y <= 4);
}
function inBoard(x, y) //在棋盘之内
{
  return (x >= 0 && x <= 7 && y >= 0 && y <= 7);
}
function findNumPropArray(x, y)
{
  return x - 3 + (y - 3) * 2;
}
function findPiece(x, y)
{
  return board[x][y][0] * 16 + board[x][y][6];
}
window.onload = function ()
{
  let ht = ""; //加载8*8的棋盘
  for (let i = 0; i < 8; i++)
  { 
    ht += "<tr>";
    for (let i = 0; i < 8; i++) 
      ht += '<td data-color="0"></td>';
    ht += "</tr>";
  }
  $("#board").html(ht);

  for (let i = 0; i < 8; i++) //加载下面的8个棋子
  {
    let xI = 7 - initPos[i][0], yI = 7 - initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teami" id="piece${i}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})"><span>${nameI}</span></div>`;
    if(i == 6 || i == 7) //如果是猴，速度为2
      board[xI][yI] = [0, i, [0, 0], blood[i], 2, attack[i], i];
    else
      board[xI][yI] = [0, i, [0, 0], blood[i], 1, attack[i], i];
  }
  for (let i = 0; i < 8; i++) //加载上面的8个棋子
  {
    let xI = initPos[i][0], yI = initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teamii" id="piece${String(Number(i) + 16)}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})"><span>${nameI}</span></div>`;
    board[xI][yI] = [1, i, [0, 0], blood[i], 1, attack[i]];
    if(i == 6 || i == 7) //如果是猴，速度为2
      board[xI][yI] = [1, i, [0, 0], blood[i], 2, attack[i], i];
    else
      board[xI][yI] = [1, i, [0, 0], blood[i], 1, attack[i], i];
  }
  updatePropProducer();//更新道具生产者
}
function showInformation(x, y)
{
  let boardXY = board[x][y];
  $("#blood").empty();
  $("#attack").empty();
  $("#bone").empty();
  $("#effect").empty();
  document.getElementById("control-name").innerHTML = `<span>${nam[boardXY[1]]}</span>`;
  document.getElementById("control").style.left = String(8 + (Number(y) + 1) * 51) + "px";
  document.getElementById("control").style.top = String(8 + (Number(x) + 1) * 51) + "px";
  for (let i = 0; i < boardXY[3]; i++) //添加生命值图片
    document.getElementById("blood").innerHTML += `<img src="img/heart.png" style="width: 25px">`;
  document.getElementById("attack").innerHTML = `${boardXY[5]}`;
  document.getElementById("speed").innerHTML = `${boardXY[4]}`;
}
function control(x, y) 
{
  function controlHelper(x, y, nx, ny, player) 
  {
    if (!inBoard(nx, ny)) 
      return;
    if (board[nx][ny][0] == player) 
      return;
    if (inProducer(nx, ny) && numProp[findNumPropArray(nx, ny)][0] > 0)
      $("#go").append(`<div class="go-prop" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny] == -1)
      $("#go").append(`<div class="go-empty" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny][0] != player)
      $("#go").append(`<div class="go-kill" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
  }
  function bfs(levelnum)
  {
    if(levelnum == 0 || levelnum == 1)
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    else if(levelnum == 2 || levelnum == 3)
      var dx = [1, -1, 1, -1, 2, -2, 2, -2], dy = [2, 2, -2, -2, 1, 1, -1, -1];
    else if(levelnum == 4 || levelnum == 5)
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    else if(levelnum == 6 || levelnum == 7)
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    var res = [];// 计算棋子可以走的位置，并把结果储存在res中
    var isvisited = [[],[],[],[],[],[],[],[]];
    for(let i = 0; i < 8 ; i ++)
      for(let j = 0; j < 8 ; j ++)
        isvisited[i].push(0);
    var qx = new Queue(), qy = new Queue(), qstep = new Queue();
    qx.clear(), qy.clear(), qstep.clear();
    qx.enqueue(x);
    qy.enqueue(y);
    qstep.enqueue(0);
    if(levelnum == 0 || levelnum == 1)
    {
      var tx, ty;
      for(let i = 0; i < 4; i ++)
      {
        tx = x, ty = y;
        var flag = 0;
        while(inBoard(tx, ty))
        {
          tx += dx[i];
          ty += dy[i];
          if(inBoard(tx, ty))
          {
            if(board[tx][ty] != -1)
            {
              if(flag == 0)
                flag = 1;
              else if(flag == 1 && board[tx][ty][0] == board[x][y][0])
                break;
              else if(flag == 1 && board[tx][ty][0] != board[x][y][0])
              {
                res.push([tx, ty]);
                break;
              }
            }
          }
        }
      }
    }
    while(!qx.isEmpty()) // 宽搜找路径
    {
      let xx = qx.peek(), yy = qy.peek(), ss= qstep.peek();
      isvisited[xx][yy] = 1;
      if (ss >= board[x][y][4]) //走的步数到达上限
        break;
      for (let d = 0; d < dx.length; d ++) 
      {
        let nx = Number(xx) + Number(dx[d]), ny = Number(yy) + Number(dy[d]);
        if (inBoard(nx,ny)) //在棋盘内
        {
          if(board[nx][ny] == -1 && isvisited[nx][ny] == 0) //走到的格子为空格 且 没走过
          {
            if(!(inProducer(nx, ny)) || (inProducer(nx, ny) && numProp[findNumPropArray(nx, ny)][0] > 0)) //如果不再道具格 或 走到的格子是道具（灰色）
              res.push([nx, ny]);
            qx.enqueue(nx);
            qy.enqueue(ny);
            qstep.enqueue(ss + 1);
            isvisited[nx][ny] = 1;
          }
          else if(board[nx][ny][0] != player && isvisited[nx][ny] == 0) //走到的格子中的棋子是对方棋子 且 没走过
          {
            res.push([nx, ny]);
            isvisited[nx][ny] = 1;
          }
          if(levelnum == 4 || levelnum == 5)
          {
            if(board[nx][ny] != -1)
            {
              let px = nx + dx[d], py = ny + dy[d]; // djwpy
              var flag = 0;
              while(inBoard(px, py))
              {
                if(inProducer(px, py))
                  break;
                if(board[px][py] == -1 && !isvisited[px][py])
                {
                  res.push([px, py]);
                  isvisited[px][py] = 1;
                  qx.enqueue(px);
                  qy.enqueue(py);
                  qstep.enqueue(ss + 1);
                  break;
                }
                else if(board[px][py][0] != player && !isvisited[px][py])
                {
                  res.push([px, py]);
                  isvisited[px][py] = 1;
                }
                px += dx[d];
                py += dy[d];
              }

              if(inBoard(px, py))
              {
                if(board[px][py] == -1)
                {
                  qx.enqueue(px);
                  qy.enqueue(py); // djwpy
                  qstep.enqueue(ss + 1);
                }
                else if(board[px][py][0] != player)
                {
                  res.push([px, py]);
                  isvisited[nx][ny] = 1;
                }
              }
              
            }
          }
        }
      }
      qx.dequeue();
      qy.dequeue();
      qstep.dequeue();
    }
    return res;
  }
  $("#control").fadeToggle(function () 
  {
    showInformation(x, y);
    let boardXY = board[x][y];
    if (player == boardXY[0] && going == 0) 
    {
      going = 2;
      var res = [];// 计算棋子可以走的位置，并把结果储存在res中
      switch (boardXY[1])
      {
        case 0:
        case 1://炮,未完成
          res = bfs(1);
          break;
        case 2:
        case 3://马，已完成
          res = bfs(3);
          break;
        case 4:
        case 5://球，未完成
          res = bfs(5);
          break;
        case 6:
        case 7://猴,已完成
          res = bfs(7);
          break;
      }
      // Render the clickable green(or other colors) squares
      for (var pos of res)
      {
        controlHelper(x, y, pos[0], pos[1], player);
      } 
    }
    if (going == 1)
    {
      $("#go").empty();
      going = 0;
    }
    if (going == 2) 
      going = 1;
  });
}

var numProp = [ [0, 0], [0, 0], [0, 0], [0, 0] ]; 
// 分别代表（3，3）（3，4）（4，3）（4，4）内的道具（个数，种类）
// 种类：0 宝石 1 香蕉 2 异变 3 随机
function updatePropProducer() { //更新道具生产者
  for (var i = 3; i <= 4; i++) //遍历坐标（i，j）
    for (var j = 3; j <= 4; j++) 
    {
      var ele = $("#board>tr").eq(i).children("td").eq(j);
      if (numProp[findNumPropArray(i, j)][0] == 0) //如果没有道具，生成灰幕
      {
        ele.css("background", "#aaa");
      }
      else if (numProp[findNumPropArray(i, j)][0] == 1) //如果有且仅有一个道具，随机生成
      {
        var randProp = Math.floor(Math.random() * 4); //随机道具生成（0~3）
        switch(randProp) //分类讨论4种
        {
          case 0:
              ele.css("background", "url(img/diamond.png)");
              break;
          case 1:
              ele.css("background", "url(img/banana.png)");
              break;
          case 2:
              ele.css("background", "url(img/magic.png)");
              break;
          case 3:
              ele.css("background", "url(img/random.png)");
              break;
        }
        numProp[findNumPropArray(i, j)][1] = Number(randProp);
      }
      if (numProp[findNumPropArray(i, j)][0] > 1) //生成个数超过1的情况，显示数字
        ele.html(numProp[findNumPropArray(i, j)][0]);
      else
        ele.html("");
    }
}
function findDead(selectedPlayer)
{
  var flag = 1;
  for(let i = 0; i < 8; i ++)
    if(isDead[selectedPlayer][i] == 0)
    {
      flag = 0;
      break;
    }
  if(flag == 1)
  {
    cAlert((selectedPlayer == 0)? "<h2>Blue Wins!</h2>" : "<h2>Red Wins!</h2>");
  }
}
// Just to move a piece without considering anything else
function movePiece(x, y, nx, ny) 
{
  var bxy = board[x][y];
  var ele = document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[6])));
  document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[6]))).onclick = function ()
  {
    control(nx, ny);
  }
  ele.onclick = function () 
  {
    control(nx, ny);
  }
  ele.style = pos(nx, ny);
}
// Display a piece as dead (put it out of the board)
function killPiece(x, y) 
{
  var bxy = board[x][y];
  var ele = document.getElementById("piece" + String(Number(bxy[0]) * 16 + Number(bxy[6])));
  if (bxy[0] == 0) ele.style = pos(bxy[1], 9);
  else ele.style = pos(bxy[1], 10);
  ele.onclick = function () { };
}
// Main function triggered when player wants to move a piece
function go(x, y, nx, ny)
{
  function doWithProps(ifRand)
  {
    var sw = numProp[findNumPropArray(nx, ny)][1];
    if(ifRand == 1)
      sw = Math.floor(Math.random() * 2);
    switch(sw)
    {
        case 0: //宝石
            board[x][y][4] += 1;
            board[x][y][5] -= 1;
            if(board[x][y][5] <= 0)
              board[x][y][5] = 1;
            break;
        case 1: //香蕉
          if(board[x][y][1] == 6 || board[x][y][1] == 7) //是否棋子为“猴”
          {
            board[x][y][3] += 2; //攻击力&生命值+2
            board[x][y][5] += 2;
          }
          else
          {
            board[x][y][3] += 1; //否则攻击力&生命值+1
            board[x][y][5] += 1;
          }
          break;
        case 2: //异变
          var randlevel = Math.floor(Math.random() * 8);
          while(randlevel == board[x][y][1])
            randlevel = Math.floor(Math.random() * 8); //随机取得一个棋子等级
          let piecenum = board[x][y][6] + 16 * board[x][y][0];
          $(`#piece${piecenum}`).empty();
          $(`#piece${piecenum}`).html(`<span>${nam[randlevel]}</span>`); //改变棋子名称
          board[x][y][1] = randlevel; //改等级
          board[x][y][3] = blood[randlevel]; //改血量
          board[x][y][4] = (randlevel == 6 || randlevel == 7)? 2 : 1; //改速度
          board[x][y][5] = attack[randlevel]; //改攻击力
          showInformation(x, y);
          break;
        case 3: //随机
          if (ifRand == 0)
            doWithProps(1);
          break;
    }
  }

  let bxy = board[x][y], nbxy = board[nx][ny];
  $("#go").empty();
  $("#control").fadeOut();
  going = 0;

  player = 1 - player;//改变当前玩家，在左下角显示
  if (player == 0) document.getElementById("player").style.background = "red";
  else document.getElementById("player").style.background = "blue";

  if (nbxy == -1) 
  { // nbxy==-1 <=> 走入的格子为空
    if (inProducer(nx, ny)) // 走入道具生产者
    { 
      if(numProp[findNumPropArray(nx, ny)][0] > 0)
        for(let i = 0; i < numProp[findNumPropArray(nx, ny)][0]; i ++)
          doWithProps(0);
      for(let i = 0; i < 4; i++)
        numProp[i][0] = 0;
      updatePropProducer();
    }
    else 
    {
      movePiece(x, y, nx, ny);
      board[x][y] = -1;
      board[nx][ny] = bxy;
      document.getElementById(`piece${String(board[nx][ny][0] * 16 + board[nx][ny][6])}`).style.onclick = `control(${nx},${ny})`;
    }
  }
  else // 攻击另一个棋子
  { 
    board[nx][ny][3] -= Math.ceil(board[x][y][5]); //降低生命值
    nbxy = board[nx][ny];
    bxy = board[x][y];
    if (nbxy[3] <= 0)  // 击杀
    {
      killPiece(nx, ny);
      movePiece(x, y, nx, ny);
      board[x][y] = -1;
      board[nx][ny] = bxy;
      isDead[nbxy[0]][nbxy[6]] = 1;
      document.getElementById(`piece${String(board[nx][ny][0] * 16 + board[nx][ny][6])}`).style.onclick = `control(${nx},${ny})`;
    }
    // else { // Still alive; Knockback
    //   var kb = [0, 0];
    //   var sign = (x) => (x > 0 ? 1 : (x == 0 ? 0 : -1));
    //   kb[0] = sign(nx - x), kb[1] = sign(ny - y);
    //   var kbnx = nx + kb[0], kbny = ny + kb[1];
    //   if (inBoard(kbnx, kbny) && board[kbnx][kbny] == -1 && !inProducer(kbnx, kbny)) {
    //     movePiece(nx, ny, kbnx, kbny);
    //     board[kbnx][kbny] = board[nx][ny], board[nx][ny] = -1;
    //     changeColor(nx, ny);
    //   }
    // }
  }
  // 处理道具生成
  turn++;
  if (turn % 5 == 0) {
    for(let i = 0; i < 4; i ++)
      numProp[i][0] ++;
    updatePropProducer();
  }
  findDead(0);
  findDead(1);
}

function giveUp() {
  if (player == 0) {
    cAlert("<h2>Blue Wins!</h2>");
  }
  else {
    cAlert("<h2>Red Wins!</h2>");
  }
}
