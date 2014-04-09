function append_text_html(str) {
    return "<div class='text'>" + str + "</div>";
}

function get_id(x, y) {
    return "grid" + (x + 1) + (y + 1);
}

function get_empty_index() {
    var gd = layout.gd;
    var coor = {};
    var arr = [];
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            if(gd[i][j] == 0) {
                arr.push({
                    x: i,
                    y: j
                });
            }
        }
    }
    if(arr.length == 0) {
        return false;
    }
    var ran = parseInt((Math.random() * arr.length), 0);
    return arr[ran];
}

function end() {
    alert("游戏结束");
    $(document).off("keydown");
}

function add_grid() {
    var gd = layout.gd;
    var grid_len = 140;
    var coor = get_empty_index();
    if(coor) {
        gd[coor.x][coor.y] = 2;
        var id = get_id(coor.x, coor.y);
        $('<div id=' + id +' class="col">2</div>').appendTo(".inner");
        $('#' + id).css({
            left: (coor.y * grid_len) + "px",
            top:  (coor.x * grid_len) + "px"
        });
    } else {
        end();
    }
}

function assign_html() {
    var gd = layout.gd;
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            if(gd[i][j] != 0) {
                $("#" + get_id(i, j)).each(function() {
                    $(this).html(append_text_html(gd[i][j].toString()));
                });
            }
        }
    }
}

function show(action) {
    var gd = layout.gd;
    var grid_len = 140;
    if(!$.isEmptyObject(action)) {
        var vis = Array(4);
        for(var i = 0; i < 4; i++) {
            vis[i] = [true, true, true, true];
        }
        action[action.length - 1].last = true;
        console.log("new turns");
        action.forEach(function(obj) {
            console.log("(%i,%i) -> (%i,%i)", obj.x + 1, obj.y + 1, obj.xx + 1, obj.yy + 1);
            var offset = Math.abs(obj.x - obj.xx) + Math.abs(obj.y - obj.yy);
            console.log("#" + get_id(obj.x, obj.y));
            var jq = $("#" + get_id(obj.x, obj.y));
            jq.animate({
                left: (obj.yy * grid_len) + "px",
                top:  (obj.xx * grid_len) + "px"
            }, 100 * offset, function() {
                if(obj.last) {
                    action.forEach(function(obj) {
                        $("#" + get_id(obj.x, obj.y)).attr("data-id", get_id(obj.xx, obj.yy));
                        if(!vis[obj.xx][obj.yy]) {
                            $("#" + get_id(obj.x, obj.y)).attr("data-del", "true");
                        }
                        vis[obj.xx][obj.yy] = false;
                    });
                    $(".col").each(function() {
                        $(this).attr("id", $(this).attr("data-id"));
                        if($(this).attr("data-del") == "true")
                            $(this).remove();
                    });
                    assign_html();
                    add_grid();
                }
            });
        });
    }
    else if(typeof(action) == "undefined"){
        add_grid();
    }
}

function init_array() {
    var gd = [];
    var id = [];
    for(var i = 0; i < 4; i++) {
        gd[i] = [];
        id[i] = [];
        for(var j = 0; j < 4; j++) {
            gd[i][j] = 0;
            id[i][j] = "grid" + (i + 1) + (j + 1);
        }
    }
    layout.gd = gd;
    layout.id = id;
}

function init_listener() {
    // left, up, right, down
    var dir = [37, 38, 39, 40];
    $(document).on("keydown", function(event) {
        for(var i = 0; i < 4; i++) {
            if(event.which == dir[i]) {
                show(move(i));
            }
        }
    });
}

function move(dir) {
    var gd = layout.gd;
    var vis = [true, true, true, true];
    var action = [];
    var dx = [0, -1, 0, 1];
    var dy = [-1, 0, 1, 0];
    if(dir == 0) {
        for(var j = 0; j < 4; j++) {
            for(var i = 0; i < 4; i++) {
                if(gd[i][j] != 0) {
                    vis[i] = move_grid(i, j, dx[dir], dy[dir], action, vis[i]);
                }
            }
        }
    } else if(dir == 1) {
        for(var i = 0; i < 4; i++) {
            for(var j = 0; j < 4; j++) {
                if(gd[i][j] != 0) {
                    vis[j] = move_grid(i, j, dx[dir], dy[dir], action, vis[j]);
                }
            }
        }
    } else if(dir == 2) {
        for(var j = 3; j >= 0; j--) {
            for(var i = 0; i < 4; i++) {
                if(gd[i][j] != 0) {
                    vis[i] = move_grid(i, j, dx[dir], dy[dir], action, vis[i]);
                }
            }
        }
    } else {
        for(var i = 3; i >= 0; i--) {
            for(var j = 0; j < 4; j++) {
                if(gd[i][j] != 0) {
                    vis[j] = move_grid(i, j, dx[dir], dy[dir], action, vis[j]);
                }
            }
        }
    }
    return action;
}

function move_grid(x, y, dx, dy, action, bl) {
    var ac = {
        x: x,
        y: y
    };
    var gd = layout.gd;
    var tmp = gd[x][y];
    gd[x][y] = 0;
    while(0 <= x + dx && x + dx < 4 && 0 <= y + dy
        && y + dy < 4 && gd[x + dx][y + dy] == 0) {
        x += dx;
        y += dy;
    }
    gd[x][y] = tmp;
    if(0 <= x + dx && x + dx < 4 && 0 <= y + dy
        && y + dy < 4 && gd[x + dx][y + dy] == gd[x][y] && bl) {
        gd[x][y] = 0;
        x += dx;
        y += dy;
        gd[x][y] *= 2;
        bl = false;
    }
    ac.xx = x;
    ac.yy = y;
    ac.last = false;
    action.push(ac);
    return bl;
}