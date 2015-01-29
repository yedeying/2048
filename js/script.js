//////////////////////
// @author yedeying //
//////////////////////
!function(global) {
  var CONFIG = {
    rowCnt: 4,
    colCnt: 4,
    width: 100,
    spaceWidth: 10
  };
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
        length: 0
      };
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
     * @return {obj}      the grid obj
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
      $this.dataRect[dest.x][dest.y] = {
        id: $this.dataTable.length - 1,
        val: num
      };
      typeof config.createHandle === 'function' && config.createHandle(obj);
      // $this.show();
    };
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
      // top or bottom is true, left or right is false
      var type = (dire === 'top' || dire === 'bottom') || false;
      var len = type && config.rowCnt || config.colCnt;
      for(var i = 0; i < len; i++) {
        vis.push({combine: true});
      }
      _eachTable(dire, function(grid, i, j) {
        var vi = type && vis[j] || vis[i];
        _moveGrid(i, j, d, vi);
      });
      $this.addGrid(({
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
      })[dire]);
      $this.show();
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
      var dx = dire.x;
      var dy = dire.y;
      var tmpGrid = _getGrid(x, y);
      _setGrid(x, y);
      while(!_out(x + dx, y + dy) && _getGrid(x + dx, y + dy).id === -1) {
        x += dx;
        y += dy;
      }
      _setGrid(x, y, tmpGrid);
      if(_out(x + dx, y + dy) || !vis.combine) {
        vis.combine = true;
        return;
      }
      var oriGrid = _getGrid(x, y);
      var newGrid = _getGrid(x + dx, y + dy);
      if(newGrid.val === oriGrid.val) {
        x += dx;
        y += dy;
        oriGrid.val *= 2;
        $this.dataTable[oriGrid.id].val *= 2;
        _delGrid(x, y);
        _setGrid(x, y, oriGrid);
        _setGrid(x - dx, y - dy);
        vis.combine = false;
      }
    }
    /**
     * delete a grid
     * @param  {number} x xPos
     * @param  {number} y yPos
     */
    function _delGrid(x, y) {
      typeof config.delHandle === 'function' && config.delHandle($this.dataTable[_getGrid(x, y).id]);
      if(_getGrid(x, y).id !== -1) {
        // release the space
        $this.dataTable[_getGrid(x, y).id] = undefined;
        delete $this.dataTable[_getGrid(x, y).id];
        $this.dataRect[x][y].id = -1;
      }
      _setGrid(x, y);
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
  var Visual = function() {
    var $ = function(selector, all) {
      if(all) return document.querySelectorAll(selector);
      return document.querySelector(selector);
    }
    var $this = this;
    function _init() {
      $this.model = new Model({
        rowCnt: CONFIG.rowCnt,
        colCnt: CONFIG.colCnt,
        createHandle: _createGrid,
        moveHandle: _moveGrid,
        delHandle: _delGrid,
        finishHandle: _finish
      });
      window.test = $this.model;
      $this.model.addGrid();
      $this.model.addGrid();
      _bindEvents();
    };
    function _getLen(value) {
      return (CONFIG.width + CONFIG.spaceWidth) * value + 'px';
    }
    function _createGrid(gri) {
      var col = document.createElement('div');
      col.classList.add('col');
      var style = "left: {left}; top: {top}".replace(/\{top\}/g, _getLen(gri.x)).replace(/\{left\}/g, _getLen(gri.y));
      col.style.cssText = style;
      col.innerText = gri.val;
      gri.col = col;
      setTimeout(function() {
        $('.inner').appendChild(col);
      }, 150);
    }
    function _moveGrid(gri) {
      if(!gri.col) {
        return;
      }
      gri.col.style.top = _getLen(gri.x);
      gri.col.style.left = _getLen(gri.y);
      setTimeout(function() {
        gri.col.innerText = gri.val;
      }, 150);
    }
    function _delGrid(gri) {
      if(gri.col && gri.col.parentNode) {
        setTimeout(function() {
          gri.col.parentNode.removeChild(gri.col);
        }, 150);
      }
    }
    function _finish() {
      var inner = $('.inner');
      var cols = Array.prototype.slice.call($('.inner .col', true));
      cols.forEach(function(gri) {
        inner.removeChild(gri);
      });
      alert('game over');
    }
    function _bindEvents() {
      var direMap = {
        37: 'left',
        38: 'top',
        39: 'right',
        40: 'bottom'
      };
      window.addEventListener('keydown', function(e) {
        var dire = direMap[e.which];
        dire && $this.model.move(dire);
      }, false);
    }
    _init();
  };
  var visual = new Visual;
}(window);
