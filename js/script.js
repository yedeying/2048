//////////////////////
// @author yedeying //
//////////////////////
!function(global) {
  ////////////////////
  // the first part //
  ////////////////////
  /**
   * Model generate the model of 2048
   * @param {object} config:
   * rowCnt [the count of rows, defalut to be 4]
   * colCnt [the count of cols, defalut to be 4]
   * numList [a list for generating number per time]
   * createHandle [when creating, callback the function with a grid obj param]
   * moveHandle [when moving, callback the function with a grid obj param]
   * delHandle [when combine the grids, one of it when be deleted, and the function will be callback width a grid obj param]
   * finishHandle [when the game is over, the function will be callback]
   */
  var Model = function(config) {
    var $this = this;
    _init();
    // init
    function _init() {
      // merge configs
      var defalutConfig = {
        rowCnt: 4,
        colCnt: 4,
        numList: [2, 4],
        createHandle: new Function,
        moveHandle: new Function,
        delHandle: new Function,
        finishHandle: new Function
      };
      for(var i in config) {
        defalutConfig[i] = config[i];
      }
      config = defalutConfig;
      // generate data rect
      $this.dataRect = [];
      for(var i = 0; i < config.rowCnt; i++) {
        var arr = [];
        for(var j = 0; j < config.colCnt; j++) {
          arr.push({id: -1, val: -1});
        }
        $this.dataRect.push(arr);
      }
      // generate data table
      $this.dataTable = {
        length: 0,
        cnt: 0
      };
      // generate data score
      $this.score = 0;
    };
    // travel the dataRect
    function _eachTable(dire, callback) {
      if(typeof dire === 'function') {
        callback = dire;
        dire = 'left';
      }
      var ilen = config.rowCnt;
      var jlen = config.colCnt;
      if(dire === 'top') {
        for(var j = 0; j < jlen; j++) {
          for(var i = 0; i < ilen; i++) {
            callback($this.dataRect[i][j], i, j);
          }
        }
      } else if(dire === 'bottom') {
        for(var j = 0; j < jlen; j++) {
          for(var i = ilen - 1; i >= 0; i--) {
            callback($this.dataRect[i][j], i, j);
          }
        }
      } else if(dire === 'left') {
        for(var i = 0; i < ilen; i++) {
          for(var j = 0; j < jlen; j++) {
            callback($this.dataRect[i][j], i, j);
          }
        }
      } else if(dire === 'right') {
        for(var i = 0; i < ilen; i++) {
          for(var j = jlen - 1; j >= 0; j--) {
            callback($this.dataRect[i][j], i, j);
          }
        }
      } else {
        throw new Error('Model::eachTabel: invalid direction');
      }
    }
    // randomly get a element from array
    function _randomEle(arr) {
      return arr[parseInt(Math.random() * arr.length, 10)];
    }
    /**
     * get grid
     * @param  {number} x xPos
     * @param  {number} y yPos
     * @return {object}      the grid obj
     */
    function _getGrid(x, y) {
      return $this.dataRect && $this.dataRect[x][y];
    }
    /**
     * set a grid with obj
     * @param {number} x   xPos
     * @param {number} y   yPos
     * @param {object} obj the object to fill in the grid @optional
     */
    function _setGrid(x, y, obj) {
      // if obj is undefined, change it to be inited
      obj = obj || {id: -1, val: -1};
      if(obj.id !== -1) {
        $this.dataRect[x][y] = obj;
        var gri = $this.dataTable[obj.id];
        gri.x = x;
        gri.y = y;
        gri.val = obj.val;
        typeof config.moveHandle === 'function' && config.moveHandle(gri);
      }
      $this.dataRect[x][y] = obj;
    }
    function _checkFail() {
      if($this.dataTable.cnt !== config.rowCnt * config.colCnt) return;
      var fail = true;
      for(var i = 0; fail && i < config.rowCnt; i++) {
        for(var j = 0; fail && j < config.colCnt - 1; j++) {
          if($this.dataRect[i][j].val === $this.dataRect[i][j + 1].val) {
            fail = false;
          }
        }
      }
      for(var j = 0; fail && j < config.colCnt; j++) {
        for(var i = 0; fail && i < config.rowCnt - 1; i++) {
          if($this.dataRect[i][j].val === $this.dataRect[i + 1][j].val) {
            fail = false;
          }
        }
      }
      if(fail) {
        typeof config.finishHandle === 'function' && config.finishHandle();
        _init();
      }
    }
    /**
     * generate a new grid
     * @param {string from ['top', 'bottom', 'left', 'right']} dire locate direction @optional
     * @return {boolean} generate success of failed
     */
    this.addGrid = function(dire) {
      var queue = [];
      // select an empty grid to fill in
      _eachTable(function(grid, i, j) {
        if(dire === 'top' && i !== 0) return;
        if(dire === 'bottom' && i !== config.rowCnt - 1) return;
        if(dire === 'left' && j !== 0) return;
        if(dire === 'right' && j !== config.colCnt - 1) return;
        if(grid.id === -1) {
          queue.push({
            x: i,
            y: j
          });
        }
      });
      if(queue.length === 0) {
        typeof config.finishHandle === 'function' && config.finishHandle();
        _init();
        return;
      }
      var dest = _randomEle(queue);
      var num = _randomEle(config.numList);
      var obj = {
        x: dest.x,
        y: dest.y,
        val: num
      };
      $this.dataTable[$this.dataTable.length] = obj;
      $this.dataTable.length++;
      $this.dataTable.cnt++;
      $this.dataRect[dest.x][dest.y] = {
        id: $this.dataTable.length - 1,
        val: num
      };
      typeof config.createHandle === 'function' && config.createHandle(obj);
      // $this.show();
    };
    this.restart = _init,
    /**
     * move with a direction
     * @param  {string from ['top', 'bottom', 'left', 'right']} moving direction
     * @return {boolean} moving success or failed
     */
    this.move = function(dire) {
      var d = ({
        'top': {x: -1, y: 0},
        'bottom': {x: 1, y: 0},
        'left': {x: 0, y: -1},
        'right': {x: 0, y: 1},
      })[dire];
      if(!d) {
        return false;
      }
      // init visit array, for signing if the grid has use
      var vis = [];
      var move = false;
      // top or bottom is true, left or right is false
      var type = (dire === 'top' || dire === 'bottom') || false;
      var len = type && config.rowCnt || config.colCnt;
      for(var i = 0; i < len; i++) {
        vis.push({combine: true});
      }
      _eachTable(dire, function(grid, i, j) {
        var vi = type && vis[j] || vis[i];
        move = _moveGrid(i, j, d, vi) || move;
      });
      if(move) {
        $this.addGrid(({
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left'
        })[dire]);
      }
      _checkFail();
      // $this.show();
    };
    /**
     * move a grid with direction
     * @param  {number} i    the xPos of grid
     * @param  {number} j    the yPos of grid
     * @param  {object} dire the dire offset of moving
     * @param  {object} vis  if the row/col can combine
     */
    function _moveGrid(x, y, dire, vis) {
      function _out(x, y) {
        return x < 0 || x >= config.rowCnt || y < 0 || y >= config.colCnt;
      }
      var move = false;
      var dx = dire.x;
      var dy = dire.y;
      var tmpGrid = _getGrid(x, y);
      if(tmpGrid.id === -1) {
        return move;
      }
      _setGrid(x, y);
      while(!_out(x + dx, y + dy) && _getGrid(x + dx, y + dy).id === -1) {
        x += dx;
        y += dy;
        move = true;
      }
      _setGrid(x, y, tmpGrid);
      if(_out(x + dx, y + dy) || !vis.combine) {
        vis.combine = true;
        return move;
      }
      var oriGrid = _getGrid(x, y);
      var newGrid = _getGrid(x + dx, y + dy);
      if(newGrid.val === oriGrid.val) {
        x += dx;
        y += dy;
        move = true;
        oriGrid.val *= 2;
        $this.score += oriGrid.val;
        $this.dataTable[oriGrid.id].val *= 2;
        _delGrid(x, y);
        _setGrid(x, y, oriGrid);
        _setGrid(x - dx, y - dy);
        vis.combine = false;
      }
      return move;
    }
    /**
     * delete a grid
     * @param  {number} x xPos
     * @param  {number} y yPos
     */
    function _delGrid(x, y) {
      var gri = _getGrid(x, y);
      if(gri.id !== -1) {
        typeof config.delHandle === 'function' && config.delHandle($this.dataTable[gri.id]);
        // release the space
        $this.dataTable[gri.id] = undefined;
        $this.dataTable.cnt--;
        delete $this.dataTable[gri.id];
      }
      $this.dataRect[x][y].id = -1;
      $this.dataRect[x][y].val = -1;
    }
    this.show = function() {
      var out = '';
      _eachTable(function(gri, i, j) {
        if(gri.val !== -1) {
          out += ' ';
        }
        out += gri.val + ' ';
        if(j === config.colCnt - 1) {
          out += '\n';
        }
      });
      console.log(out);
    }
  };
  /////////////////////
  // the second part //
  /////////////////////
  var CONFIG = {
    rowCnt: 4,
    colCnt: 4,
    width: 80,
    spaceWidth: 10,
    fontSize: 50,
    wrapWidth: 10,
    delay: 150,
    desireWidth: 450
  };

  window.Game = function(params) {
    var $this = this;
    var config = (function() {
      var res = CONFIG;
      res.width = params.width || res.width;
      res.rowCnt = params.rowCnt || res.rowCnt;
      res.innerWidth = res.width * res.rowCnt + res.spaceWidth * (res.rowCnt - 1);
      res.outerWidth = res.innerWidth + res.wrapWidth * 2;
      return res;
    })();
    for(var i in params) {
      config[i] = params[i];
    }
    /**
     * a lighter selector
     * @param  {string} selector
     * @param  {boolean} all     true for querySelectorAll
     * @return {object}          for all = true, an array, or it's an HTMLElement
     */
    var $ = function(selector, all) {
      if(all) return Array.prototype.slice.call(document.querySelectorAll(selector));
      return document.querySelector(selector);
    }
    /**
     * init the game, generate the core
     */
    function _init() {
      // generate score text
      $('.score').innerText = 'your score: 0';
      // add background for every grids
      var html = '';
      for(var i = 0; i < config.rowCnt * config.colCnt; i++) {
        html += '<div class="grid"></div>';
      }
      $('.inner').innerHTML = html;
      _initStyles();
      // create the model
      $this.model = new Model({
        rowCnt: config.rowCnt,
        colCnt: config.colCnt,
        numList: [2, 2, 2, 4],
        createHandle: _createGrid,
        moveHandle: _moveGrid,
        delHandle: _delGrid,
        finishHandle: _finish
      });
      window.test = $this.model;
      // generate two grid at start
      $this.model.addGrid();
      $this.model.addGrid();
      // init operation event
      _bindEvents();
    };
    /**
     * wrap a useful css value from number
     * @param  {number} value the number
     * @return {string}       the css value
     */
    function _getLen(value) {
      return (config.width + config.spaceWidth) * value + 'px';
    }
    /**
     * fixed some styles which can not write in css text
     */
    function _initStyles() {
      // just a link
      function _css(selector, key, value) {
        var eles = $(selector, true);
        eles.forEach(function(ele) {
          ele.style[key] = value;
        });
      }
      // just a link
      function _val(pro) {
        return config[pro] + 'px';
      }
      /**
       * .outer {
       *   border-radius: $wrap-width;
       *   width；$outer-width;
       *   height: $outer-width;
       * }
       * .inner {
       *   width: $inner-width;
       *   height: $inner-width;
       * }
       * .col, .grid {
       *   width: $width;
       *   height: $width;
       * }
       * .col, .text {
       *   line-height: $width;
       * }
       * .col {
       *   font-size: $font-size;
       * }
       * .text {
       *   height: $width;
       * }
       */
      _css('.outer', 'borderRadius', _val('wrapWidth'));
      _css('.outer', 'width', _val('outerWidth'));
      _css('.outer', 'height', _val('outerWidth'));
      _css('.inner', 'width', _val('innerWidth'));
      _css('.inner', 'height', _val('innerWidth'));
      _css('.col, .grid', 'width', _val('width'));
      _css('.col, .grid', 'height', _val('width'));
      _css('.col, .text', 'lineHeight', _val('width'));
      _css('.col', 'fontSize', _val('fontSize'));
      _css('.text', 'height', _val('width'));
      // for every grids, generate its position
      var grids = $('.grid', true);
      for(var i = 0; i < config.rowCnt; i++) {
        for(var j = 0; j < config.colCnt; j++) {
          grids[i * config.rowCnt + j].style.top = _getLen(i);
          grids[i * config.rowCnt + j].style.left = _getLen(j);
        }
      }
    }
    /**
     * createHandle for model. It will be callback when creating a grid
     * @param  {object} gri  gri obj, format as below:
     *                    {x: xPos, y: yPos, val: value}
     */
    function _createGrid(gri) {
      var col = document.createElement('div');
      var text = document.createElement('span');
      col.classList.add('col');
      text.classList.add('text');
      var style = "left: {left}; top: {top}".replace(/\{top\}/g, _getLen(gri.x)).replace(/\{left\}/g, _getLen(gri.y));
      col.style.cssText = style;
      text.innerText = gri.val;
      gri.col = col;
      col.style.display = 'none';
      col.appendChild(text);
      $('.inner').appendChild(col);
      // delay the new grid's showing
      setTimeout(function() {
        col.style.display = '';
        _fixFontSize(col);
      }, config.delay);
      // regenerate the styles
      _initStyles();
    }
    /**
     * fixed the font size for new grid, prevent from overlap
     */
    function _fixFontSize(col) {
      var txt = col && col.querySelector('.text');
      var fontSize = parseInt(window.getComputedStyle(txt).fontSize, 10);
      if(txt) {
        while(txt.offsetWidth >= config.width - 10 && fontSize >= 12) {
          fontSize -= 2;
          txt.style.fontSize = fontSize + 'px';
        }
      }
    }
    /**
     * moveHandle for the model, called when the grids moved
     * @param  {object} gri the position object, format as below
     *                      {x: xPos, y: yPos, val: value}
     */
    function _moveGrid(gri) {
      if(!gri.col) return;
      gri.col.style.top = _getLen(gri.x);
      gri.col.style.left = _getLen(gri.y);
      $('.score').innerText = 'your score: ' + $this.model.score;
      // delay value's changing
      setTimeout(function() {
        gri.col.querySelector('.text').innerText = gri.val;
        _fixFontSize(gri.col);
      }, config.delay);
    }
    /**
     * deleteHandle, remove the HTMLElements when they're deleted
     * @param  {object} gri position object
     */
    function _delGrid(gri) {
      if(gri.col && gri.col.parentNode) {
        var col = gri.col;
        // delay, you know
        setTimeout(function() {
          col.parentNode.removeChild(col);
        }, config.delay);
      }
    }
    /**
     * when it's game over, showing an info dialog
     */
    function _finish() {
      var cols = $('.inner .col', true);
      window.showDialog('confirm', 'Game Over', 'Game Over!!! Your score is ' + $this.model.score + '<br>Want continue?', function(cont) {
        if(cont) {
          cols.forEach(function(gri) {
            gri.parentNode && gri.parentNode.removeChild(gri);
          });
          $this.model.restart();
          $this.model.addGrid();
          $this.model.addGrid();
        } else {
          window.removeEventListener('keydown', _keydownHandle);
        }
      });
    }
    /**
     * when moving, call the model.move object
     */
    function _keydownHandle(e) {
      var direMap = {
        37: 'left',
        38: 'top',
        39: 'right',
        40: 'bottom'
      };
      var dire = direMap[e.which];
      dire && $this.model.move(dire);
    }
    function _bindEvents() {
      window.addEventListener('keydown', _keydownHandle, false);
    }
    /**
     * clean eventListener and grid backgrounds
     */
    this.destroy = function() {
      window.removeEventListener('keydown', _keydownHandle);
      $('.inner').innerHTML = '';
      delete $this.model;
    }
    this.start = function() {
      _init();
    }
  };

  ////////////////
  // third part //
  ////////////////
  !function() {
    var currentGame = null;
    function $(selector, all) {
      if(all) return document.querySelectorAll(selector);
      return document.querySelector(selector);
    }
    function init() {
      bindEvents();
      start();
    }
    function bindEvents() {
      $('.replay').addEventListener('click', start);
      $('.num').addEventListener('keydown', function(e) {
        e.which === 13 && start();
      });
    }
    function getWidth(size) {
      var innerWidth = CONFIG.desireWidth;
      var spaceWidth = CONFIG.spaceWidth;
      var width = (innerWidth - spaceWidth * (size - 1)) / size;
      return width;
    }
    function start() {
      var size = $('.num').value || 4;
      if(size <= 1 || size > 10) {
        window.showDialog('alert', 'alert', 'the size must in the range [2, 10]');
        return;
      }
      var width = getWidth(size);
      currentGame && currentGame.destroy();
      currentGame = new Game({
        width: width,
        rowCnt: size,
        colCnt: size
      });
      currentGame.start();
    }
    init();
  }();
}(window);
