
var mandel_paper = null

function draw(msg){
    if(!msg){
        return
    }
    var ret = msg.data

    mandel_paper.putImageData(ret, 0,0);
}

class mandel {
    constructor(dom_id, size_x, size_y) {
        var canvas = document.getElementById(dom_id);
        mandel_paper = canvas.getContext('2d');
        this.wkr = new Worker("mandelw.js");

        canvas.width  = size_x;
        canvas.height = size_y;

        this.wkr.onmessage = draw
        
        /* we create it here as we have no DOM in the wrk */
        var img_data = mandel_paper.createImageData(size_x, size_y);

        var cmd = {"x0":0,
                   "size_x":size_x,
                   "size_y":size_y,
                   "data": img_data}

        /* Start drawing */
        this.wkr.postMessage(cmd)
    }

    terminate()
    {
        this.wkr.terminate()
    }
}

