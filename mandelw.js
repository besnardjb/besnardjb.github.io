function  new_state(sx,sy)
{
    state = Array(sx);
    for (var x = 0; x < sx; x++) {
        state[x] = Array(sy);
    }
    return state
}

function clear_state(state, sx, sy) {
    for (var x = 0; x < sx; x++) {
        for (var y = 0; y < sy; y++) {
            state[x][y] = 0
        }
    }
}

onmessage = function(msg) {
    x0 = -2.0
    y0 = -1.0
    size_x = msg.data["size_x"]
    size_y = msg.data["size_y"]

    imgdata = msg.data["data"]

    size_x = Math.floor(size_x);
    size_y = Math.floor(size_y);

    state = new_state(size_x, size_y)
    clear_state(state, size_x, size_y)

    var color_lut = [];

    var max_iter = 32.0

    var sx = 3.0
    var sy = 2.0

    var qx = sx / parseFloat(size_x);
    var qy = sy / parseFloat(size_y);

    while(true){

        color_lut = [];

        for (var i = (max_iter-1) ; 0 <= i ; i--){
            color_lut.push([255-(255*(i/parseFloat(max_iter)))%255,
                            255-(255*(i*2/parseFloat(max_iter)))%255,
                            255-(255*(i*3/parseFloat(max_iter)))%255]);
        }

        for (var x = 0; x < size_x; x++) {
            for (var y = 0; y < size_y; y++) {

                var cr = x0 + x * qx;
                var ci = y0 + y * qy;
                var zr = 0.0;
                var zi = 0.0;
                var liter = 0

                var pzr = 0.0;
                var pzi = 0.0;

                while( (liter++ <= max_iter ) && ((zr*zr+zi*zi) < 4.0)) {
                    var szr = zr
                    zr = zr * zr - zi * zi
                    zi = 2 * szr * zi
                    zr += cr
                    zi += ci
                }

                state[x][y] = liter - 1
            }
        }

        for (var x = 0; x < size_x; x++) {
            /* Convert to color scale */
            for (var y = 0; y < size_y; y++) {
                var it = state[x][y] % color_lut.length
                var coord = (y * (size_x * 4)) + (x * 4);
                imgdata.data[coord] =  color_lut[it][0]
                imgdata.data[coord + 1] = color_lut[it][1]
                imgdata.data[coord + 2] = color_lut[it][2]
                imgdata.data[coord + 3] = 255
            }
        }

        ret = imgdata
        postMessage(ret)

        /* Where we want the center */
        var tx = 0.15071879
        var ty = 0.61422179
        /* Apply zoom */
        var zoom = 1.01
        sx /= zoom
        sy /=zoom
        /* Update quantums */
        qx = sx / parseFloat(size_x);
        qy = sy / parseFloat(size_y);

        /* The deeper we go the more itterations we need */
        max_iter++

        /*As we index with top left, compensate */
        x0 = tx - qx * (size_x/2)
        y0 = ty- qy * (size_y/2)

        clear_state(state, size_x, size_y)
    }
}
