//Based on ybj's code and cyb's code

class Queue //来自度娘的一个queue模板
{
    constructor()
    {
        this.count = 0; //记录队列的数量
        this.lowestCount = 0; //记录当前队列顶部的位置
        this.items = []; //用来存储元素
    }
    enqueue(element)
    {
        this.items[this.count] = element;
        this.count++;
    }
    dequeue()
    {
        if(this.isEmpty())
            return 'queue is null';
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
        if(this.isEmpty())
          return "queue is null";
        let objString = this.items[this.lowestCount];
        for(let i = this.lowestCount+1; i < this.count;i++)
            objString = `${objString},${this.items[i]}`;
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
function pos(x, y) //返回board[x][y]的页面中的坐标
{
  return `top: ${Number(x) * 50}px; left: ${Number(y) * 50}px;`;
}

//测试用变量，请注意
var allYork = 0; // 若值为1，则异变只会产生姚

//游戏运行的全局变量
var board = [[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]];
//board格式: [0 team, 1 level, 2 effect[0 shield], 3 blood, 4 speed, 5 attack, 6 reallevel]
var isDead = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var nam = ["炮", "炮", "马", "马", "球", "球", "猴", "猴", "姚"]; //每个棋子的名称
var blood = [2, 2, 3, 3, 5, 5, 1, 1, 3]; //每个棋子的初始血量
var attack = [4, 4, 2, 2, 1, 1, 3, 3, 3]; //每个棋子的初始攻击力
var speed = [1, 1, 1, 1, 1, 1, 2, 2, 1]; //每个棋子的初始速度
var initPos = [[0, 1], [0, 6], [0, 2], [0, 5], [0, 3], [0, 4], [0, 0], [0, 7], /*姚*/[-1, -1]]; //每个旗子所对应的初始坐标
var player = 0; //目前操作的玩家：0红 1蓝
var going = 0; //用来判断在不在control状态下的变量
var turn = 0; //已经走过的回合数
var numProp = [ [0, 0], [0, 0], [0, 0], [0, 0] ]; 
// 分别代表（3，3）（3，4）（4，3）（4，4）内的道具（个数，种类）
// 种类：0 宝石 1 香蕉 2 异变 3 随机
var secretText = 
   ["(奥秘)公正审判：当一个棋子攻击时，将其攻击力和生命值变为1"
  , "(奥秘)清算：当一个棋子造成3点或以上伤害后，将其消灭"
  , "(奥秘)复仇：当一个棋子被击杀后，随机使另一个同方棋子获得+3/+2"
  , "(奥秘)蕉猾诡计：下个被获得的道具将变为香蕉"
  , "(奥秘)偷天换日：当一个随从被攻击时，将其异变"
  , "(奥秘)抄袭：当一个道具被获得后，使另一方的一个随机棋子也获得此道具"
  , "(奥秘)冰冻陷阱：当一个随从攻击时，阻止这次攻击"
  , "(奥秘)爆炸陷阱：当一个随从攻击时，对所有同方其他棋子造成1点伤害"];
var nowSecret = [0, 0, 0, 0, 0, 0, 0, 0];
var numSecret = 0;

function inProducer(x, y) //在道具生产者之内
{
  return (x >= 3 && x <= 4 && y >= 3 && y <= 4);
}
function inBoard(x, y) //在棋盘之内
{
  return (x >= 0 && x <= 7 && y >= 0 && y <= 7);
}
function findNumPropArray(x, y) //通过(x, y)坐标找到它在numProp中的第一个下标
{
  return x - 3 + (y - 3) * 2;
}
function findPiece(x, y) //通过(x, y)找到html中id：piece${}
{
  return board[x][y][0] * 16 + board[x][y][6];
}
window.onload = function()
{
  let ht = ""; 
  for (let i = 0; i < 8; i++) //加载8*8的棋盘
  { 
    ht += "<tr>";
    for (let i = 0; i < 8; i++) 
      ht += '<td></td>';
    ht += "</tr>";
  }
  $("#board").html(ht);
  for (let i = 0; i < 8; i++) //加载下面的8个棋子
  {
    let xI = 7 - initPos[i][0], yI = 7 - initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teami" id="piece${i}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})"><span>${nameI}</span></div>`;
    let haveShield = (i == 4 || i == 5)? 1 : 0;
    board[xI][yI] = [0, i, [haveShield], blood[i], speed[i], attack[i], i];
  }
  for (let i = 0; i < 8; i++) //加载上面的8个棋子
  {
    let xI = initPos[i][0], yI = initPos[i][1];
    let nameI = nam[i];
    document.body.innerHTML += `<div class="piece teamii" id="piece${String(Number(i) + 16)}" style
      ="${pos(xI, yI)}" onclick="control(${xI}, ${yI})"><span>${nameI}</span></div>`;
    let haveShield = (i == 4 || i == 5)? 1 : 0;
    board[xI][yI] = [1, i, [haveShield], blood[i], speed[i], attack[i], i];
  }
  updatePropProducer(); //更新道具生产者
}
function showInformation(x, y)
{
  let boardXY = board[x][y];
  $("#blood").empty(); //清空原来显示的内容
  $("#shield").empty();
  $("#attack").empty();
  $("#speed").empty();
  $("#effect").empty();
  document.getElementById("control-name").innerHTML = `<span>${nam[boardXY[1]]}</span>`; //显示棋子名称
  document.getElementById("control").style.left = String(8 + (Number(y) + 1) * 51) + "px"; //定位显示位置
  document.getElementById("control").style.top = String(8 + (Number(x) + 1) * 51) + "px";
  for (let i = 0; i < boardXY[3]; i++) //添加生命值图片
    document.getElementById("blood").innerHTML += `<img src="img/heart.png" style="width: 25px">`;
  if(board[x][y][2][0] == 1) //检测圣盾
    document.getElementById("shield").innerHTML += `<img src="img/shield.png" style="width: 25px">`;
  for (let i = 0; i < boardXY[5]; i++) //添加攻击力图片
    document.getElementById("attack").innerHTML += `<img src="img/attack.png" style="width: 25px">`;
  for (let i = 0; i < boardXY[4]; i++) //添加速度图片
    document.getElementById("speed").innerHTML += `<img src="img/speed.png" style="width: 25px">`;
}
function control(x, y) 
{
  function controlHelper(x, y, nx, ny, player) 
  {
    if (!inBoard(nx, ny)) 
      return;
    if (board[nx][ny][0] == player) //检测走到的不能是本方棋子
      return;
    //注：这里的先后关系不能改，不然可能找不到board[nx][ny]，导致运行错误
    //注：第二个if重复判断，暂时不删
    if (inProducer(nx, ny) && numProp[findNumPropArray(nx, ny)][0] > 0) //分别显示道具、空格、攻击的格子颜色
      $("#go").append(`<div class="go-prop" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny] == -1)
      $("#go").append(`<div class="go-empty" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
    else if (board[nx][ny][0] != player)
      $("#go").append(`<div class="go-kill" onclick="go(${x},${y},${nx},${ny})"style="${pos(nx, ny)}"></div>`);
  }
  function bfs(levelnum) //广度优先遍历可以走到的格子
  {
    if(levelnum == 0 || levelnum == 1) //对于不同的棋子有不同的移动规则
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    else if(levelnum == 2 || levelnum == 3)
      var dx = [1, -1, 1, -1, 2, -2, 2, -2], dy = [2, 2, -2, -2, 1, 1, -1, -1];
    else if(levelnum == 4 || levelnum == 5)
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    else if(levelnum == 6 || levelnum == 7)
      var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];
    else if(levelnum == 8)
      var dx = [-1, -1, 1, 1], dy = [-1, 1, -1, 1];
    var res = []; //计算棋子可以走的位置，并把结果储存在res中
    var isvisited = [[],[],[],[],[],[],[],[]]; //记忆化搜索，解决绿格子重复与效率低的问题
    for(let i = 0; i < 8 ; i ++) //记忆化数组初始定义为全0(false)
      for(let j = 0; j < 8 ; j ++)
        isvisited[i].push(0);
    var qx = new Queue(), qy = new Queue(), qstep = new Queue(); //利用队列实现bfs
    qx.clear(), qy.clear(), qstep.clear();
    qx.enqueue(x);
    qy.enqueue(y);
    qstep.enqueue(0);
    if(levelnum == 0 || levelnum == 1) //炮的特殊计算
    {
      var tx, ty;
      for(let i = 0; i < 4; i ++)
      {
        tx = x, ty = y;
        var flag = 0; //用来判断是否已经找到炮架台
        while(inBoard(tx, ty))
        {
          tx += dx[i];
          ty += dy[i];
          if(inBoard(tx, ty))
            if(board[tx][ty] != -1) // 格子不为空
            {
              if(flag == 0) //没找到，设为找到
                flag = 1;
              else if(flag == 1 && board[tx][ty][0] == board[x][y][0]) //不能朝本方棋子开炮
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
    while(!qx.isEmpty()) // 宽搜找路径
    {
      let xx = qx.peek(), yy = qy.peek(), ss= qstep.peek(); //取队首元素
      isvisited[xx][yy] = 1;
      if (ss >= board[x][y][4]) //走的步数到达上限
        break;
      for (let d = 0; d < dx.length; d ++) 
      {
        let nx = xx + dx[d], ny = yy + dy[d];
        if (inBoard(nx, ny)) //在棋盘内
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
            //注：攻击后不能再移动，所以没有把此时坐标进入队列
          }
        }
      }
      qx.dequeue();
      qy.dequeue();
      qstep.dequeue(); //出栈
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
        case 1: //炮
          res = bfs(1);
          break;
        case 2:
        case 3: //马
          res = bfs(3);
          break;
        case 4:
        case 5: //球
          res = bfs(5);
          break;
        case 6:
        case 7: //猴
          res = bfs(7);
          break;
        case 8: //姚
          res = bfs(8);
          break;
      }
      // 生成可移动的位置
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
function search(target, ux, uy) //target 2全部 否则为 0红 1蓝
{
  var list = [];
  for(let i = 0; i <= 7; i++)
    for(let j = 0; j <= 7; j++)
    { 
      let bxy = board[i][j], array = [-1, -1];
      if(bxy == -1 || (target != 2 && bxy[0] != target) || (i == ux && j == uy)) //不考虑的情况：空/目标阵营不对/特别去除的坐标
        continue;
      array[0] = i; array[1] = j;
      list.push(array);
    }
  return list;
}
function showSecret(showingSecret)
{
  swal({
    title: "Secret!",
    text: secretText[showingSecret],
    icon: "warning",
  });
}
function updateSecret()
{
  $("#secret").empty();
  for(let i = 1; i <= numSecret; i++)
    document.getElementById("secret").innerHTML += `<div class="secretPiece secretInstr">S${i}</div>`;
}
function newSecret()
{
  if(numSecret >= 5) //最多同时控制5个奥秘
    return;
  var randSecret = Math.floor(Math.random() * 8);
  while(nowSecret[randSecret] == 1) //防止生成一样的奥秘
    randSecret = Math.floor(Math.random() * 8);
  nowSecret[randSecret] = 1;
  numSecret += 1;
  updateSecret();
}
function updatePropProducer() //更新道具生产者
{ 
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
        var randProp = Math.floor(Math.random() * 6); //随机道具生成（0~5）
        switch(randProp) //分类讨论6种
        {
          case 0:
              ele.css("background", "url(img/random.png)");
              break;
          case 1:
              ele.css("background", "url(img/diamond.png)");
              break;
          case 2:
              ele.css("background", "url(img/banana.png)");
              break;
          case 3:
              ele.css("background", "url(img/magic.png)");
              break;
          case 4:
              ele.css("background", "url(img/shield.png)");
              break;
          case 5:
              ele.css("background", "url(img/bone.png)");
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
    cAlert((selectedPlayer == 0)? "<h2>Blue Wins!</h2>" : "<h2>Red Wins!</h2>");
}
// Just to move a piece without considering anything else
function movePiece(x, y, nx, ny) 
{
  var bxy = board[x][y];
  var ele = document.getElementById(`piece${findPiece(x, y)}`);
  document.getElementById(`piece${findPiece(x, y)}`).onclick = function ()
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
  var ele = document.getElementById(`piece${findPiece(x, y)}`);
  if (bxy[0] == 0) ele.style = pos(bxy[1], 9);
  else ele.style = pos(bxy[1], 10);
  ele.onclick = function () { };
}
function go(x, y, nx, ny) //从(x, y)移动到(nx, ny), 只关心结果
{ 
  //ifrand: 0正常 1随机 2香蕉
  function realizeProp(number, newIfRand, sx, sy)
  {
    switch(number)
    {
      case 0: //随机
        if (newIfRand == 0)
          doWithProps(1);
        break;
      case 1: //宝石
          board[sx][sy][4] += 1;
          board[sx][sy][5] -= 1;
          if(board[sx][sy][5] <= 0)
            board[sx][sy][5] = 1;
          break;
      case 2: //香蕉
        if(board[sx][sy][1] == 6 || board[sx][sy][1] == 7) //是否棋子为“猴”
        {
          board[sx][sy][3] += 2; //攻击力&生命值+2
          board[sx][sy][5] += 2;
        }
        else
        {
          board[sx][sy][3] += 1; //否则攻击力&生命值+1
          board[sx][sy][5] += 1;
        }
        break;
      case 3: //异变
        var randlevel = Math.floor(Math.random() * 8);
        while(randlevel == board[sx][sy][1]) //防止取到相同的等级
          randlevel = Math.floor(Math.random() * 8); //随机取得一个棋子等级
        if((board[sx][sy][1] % 2 == 0 && randlevel == board[sx][sy][1] + 1)
        || (board[sx][sy][1] % 2 == 1 && randlevel == board[sx][sy][1] - 1)
        || allYork == 1) //活动棋子：姚
          randlevel = 8;
        let piecenum = board[sx][sy][6] + 16 * board[sx][sy][0];
        $(`#piece${piecenum}`).empty();
        $(`#piece${piecenum}`).html(`<span>${nam[randlevel]}</span>`); //改变棋子名称
        board[sx][sy][1] = randlevel; //改等级
        board[sx][sy][3] = blood[randlevel]; //改血量
        board[sx][sy][4] = speed[randlevel]; //改速度
        board[sx][sy][5] = attack[randlevel]; //改攻击力
        break;
      case 4: //圣盾
        board[sx][sy][2][0] = 1;
        break;
      case 5: //骨头
        board[sx][sy][5] += 3;
        break;
    }
  }

  function doWithProps(ifRand) //处理道具(会嵌套)
  {
    var sw = numProp[findNumPropArray(nx, ny)][1];
    if(ifRand == 1)
      sw = Math.floor(Math.random() * 5 + 1);
    else if(ifRand == 2)
      sw = 2;
    realizeProp(sw, ifRand, x, y);
    if (nowSecret[5] == 1 && ifRand != 1) //(奥秘)抄袭：当一个道具被获得后，使另一方的一个随机棋子也获得此道具
    {
      showSecret(5);
      let rlist = search((!board[x][y][0]), -1, -1);
      let rd = Math.floor(Math.random() * rlist.length);
      let rdPiece = rlist[rd];
      realizeProp(sw, ifRand, rdPiece[0], rdPiece[1]);
      nowSecret[5] = 0;
      numSecret -= 1;
      updateSecret();
    }
  }

  let bxy = board[x][y], nbxy = board[nx][ny];
  $("#go").empty();
  $("#control").fadeOut();
  going = 0;

  player = 1 - player;//改变当前玩家，在左下角显示
  if (player == 0) document.getElementById("player").style.background = "red";
  else document.getElementById("player").style.background = "blue";

  if (bxy[1] == 8) //移动的棋子是姚
    newSecret();


  if (nbxy == -1) // nbxy==-1 <=> 走入的格子为空
  { 
    if (inProducer(nx, ny)) // 走入道具生产者
    { 
      if(numProp[findNumPropArray(nx, ny)][0] > 0)
        for(let i = 0; i < numProp[findNumPropArray(nx, ny)][0]; i ++)
        {
          if (nowSecret[3] == 1) //(奥秘)蕉猾诡计：下个被获得的道具将变为香蕉
          {
            showSecret(3);
            doWithProps(2);
            nowSecret[3] = 0;
            numSecret -= 1;
            updateSecret();
            continue;
          }
          doWithProps(0);
        }
      for(let i = 0; i < 4; i++)
        numProp[i][0] = 0;
      updatePropProducer();
    }
    else 
    {
      movePiece(x, y, nx, ny);
      board[x][y] = -1;
      board[nx][ny] = bxy;
      document.getElementById(`piece${findPiece(nx, ny)}`).style.onclick = `control(${nx},${ny})`;
    }
  }
  else // 攻击另一个棋子
  { 
    if (nowSecret[6] == 1) //(奥秘)冰冻陷阱：当一个随从攻击时，阻止这次攻击
    {
      showSecret(6);
      nowSecret[6] = 0;
      numSecret -= 1;
      updateSecret();
      return;
    }

    if (nowSecret[0] == 1) //(奥秘)公正审判：当一个棋子攻击时，将其攻击力和生命值变为1
    {
      showSecret(0);
      board[x][y][3] = bxy[3] = 1; //生命值变为1
      board[x][y][5] = bxy[5] = 1; //攻击力变为1
      nowSecret[0] = 0;
      numSecret -= 1;
      updateSecret();
    }

    if (nowSecret[4] == 1) //(奥秘)偷天换日：当一个随从被攻击时，将其异变
    {
      showSecret(4);

      //直接抄异变代码，(x, y)改成(nx, ny)
      var randlevel = Math.floor(Math.random() * 8);
      while(randlevel == board[nx][ny][1]) //防止取到相同的等级
        randlevel = Math.floor(Math.random() * 8); //随机取得一个棋子等级
      if((board[nx][ny][1] % 2 == 0 && randlevel == board[nx][ny][1] + 1)
      || (board[nx][ny][1] % 2 == 1 && randlevel == board[nx][ny][1] - 1)
      || allYork == 1) //活动棋子：姚
        randlevel = 8;
      let piecenum = findPiece(nx, ny);
      $(`#piece${piecenum}`).empty();
      $(`#piece${piecenum}`).html(`<span>${nam[randlevel]}</span>`); //改变棋子名称
      board[nx][ny][1] = randlevel; //改等级
      board[nx][ny][3] = blood[randlevel]; //改血量
      board[nx][ny][4] = speed[randlevel]; //改速度
      board[nx][ny][5] = attack[randlevel]; //改攻击力

      nowSecret[4] = 0;
      numSecret -= 1;
      updateSecret();
    }
    var flagSecret1 = 0;

    if (nowSecret[7] == 1) //(奥秘)爆炸陷阱：当一个随从攻击时，对所有同方其他棋子造成1点伤害
    {
      showSecret(7);
      let rlist = search(board[x][y][0], x, y);
      for(let i = 0; i < rlist.length; i++)
      {
        let rx = rlist[i][0], ry = rlist[i][1];
        let brxy = board[rx][ry];
        board[rx][ry][3] -= 1; //对所有同方其他棋子造成1点伤害
        if(board[rx][ry][3] <= 0)
        {
          killPiece(rx, ry);
          board[rx][ry] = -1;
          isDead[brxy[0]][brxy[6]] = 1;
        }
      }
      nowSecret[7] = 0;
      numSecret -= 1;
      updateSecret();
    }

    if(board[nx][ny][2][0] == 0) //检测没有圣盾
    {
      board[nx][ny][3] -= Math.ceil(board[x][y][5]); //降低生命值
      if (nowSecret[1] == 1 && Math.ceil(board[x][y][5]) >= 3) //(奥秘)清算：当一个棋子造成3点或以上伤害后，将其消灭
      {
        showSecret(1);
        killPiece(x, y);
        board[x][y] = -1;
        flagSecret1 = 1;
        nowSecret[1] = 0;
        numSecret -= 1;
        updateSecret();
      }
    }
    else
      board[nx][ny][2][0] = 0;
    nbxy = board[nx][ny];
    bxy = board[x][y];
    if (nbxy[3] <= 0)  // 击杀
    {
      killPiece(nx, ny);
      if(flagSecret1 == 0) //当清算消灭了棋子后，不要再移动
        movePiece(x, y, nx, ny);
      board[x][y] = -1;
      board[nx][ny] = bxy;
      isDead[nbxy[0]][nbxy[6]] = 1;
      if(flagSecret1 == 0)
        document.getElementById(`piece${findPiece(nx, ny)}`).style.onclick = `control(${nx},${ny})`;
      if (nowSecret[2] == 1) //(奥秘)复仇：当一个棋子死亡后，随机使另一个同方棋子获得+3/+2
      {
        showSecret(2);
        let rlist = search(nbxy[0], nx, ny);
        let rd = Math.floor(Math.random() * rlist.length);
        let rdPiece = rlist[rd];
        board[rdPiece[0]][rdPiece[1]][5] += 3; //攻击力+3
        board[rdPiece[0]][rdPiece[1]][3] += 2; //生命值+2
        nowSecret[2] = 0;
        numSecret -= 1;
        updateSecret();
      }
    }
  }
  // 处理道具生成
  turn++;
  if (turn % 5 == 0)
  {
    for(let i = 0; i < 4; i ++)
      numProp[i][0] ++;
    updatePropProducer();
  }
  findDead(0);
  findDead(1);
}

function giveUp()
{
  if (player == 0)
    cAlert("<h2>Blue Wins!</h2>");
  else
    cAlert("<h2>Red Wins!</h2>");
}
