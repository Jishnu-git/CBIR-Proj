class Drawing {
    constructor(x, y, modelName, scale = 1) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.modelName = modelName;
        this.model = null;
        this.strokePath = [];
        this.maxX = null;
        this.minX = null;
        this.maxY = null;
        this.minY = null;
        this.ready = false;
    }

    async generate(callback = null) {
        return new Promise((resolve) => {
            this.ready = false;
            this.strokePath = [];
            this.model = ml5.sketchRNN(this.modelName, async () => {
                let penStatus = "down";
                let x = this.x,
                    y = this.y;
                this.maxX = x;
                this.minX = x;
                this.maxY = y;
                this.minY = y;
                while (penStatus != "end") {
                    await this.model.generate((err, strokePath) => {
                        if (err) {
                            console.err(err);
                        } else {
                            //console.log(strokePath.pen);
                            let nextPenStatus = strokePath.pen;
                            strokePath.pen = penStatus;
                            penStatus = nextPenStatus;
                            this.strokePath.push(strokePath);
    
                            x += strokePath.dx * this.scale;
                            y += strokePath.dy * this.scale;
                            if (strokePath.pen == "down") {
                                if (x > this.maxX) this.maxX = x;
                                if (y > this.maxY) this.maxY = y;
                                if (x < this.minX) this.minX = x;
                                if (y < this.minY) this.minY = y;
                            }
                        }
                    });
                }
                this.ready = true;
                if (callback) callback(this.boundingBox());
                return resolve(this.boundingBox());
            });
        })
       
    }

    async draw(delayed = false, offsetX = 0, offsetY = 0, tempScale = 1) {
        //console.log("drawin");
        if (!this.ready) {
            console.error("Call draw only after calling generate!")
        }

        let x = this.x + offsetX, 
            y = this.y + offsetY;

        stroke(0);
        strokeWeight(3);
        for (var strokePath of this.strokePath) {
            if (strokePath.pen == "down") {
                line(x, y, x + strokePath.dx * this.scale * tempScale, y + strokePath.dy * this.scale * tempScale);
            }

            x += strokePath.dx * this.scale * tempScale;
            y += strokePath.dy * this.scale * tempScale;
            if (delayed) await(sleep(25));
        }
    }

    width() {
        if (this.maxX == null) {
            console.error("Call draw or generate first before accessing width!");
            return null;
        }
        return this.maxX - this.minX;
    }

    height() {
        if (this.maxY == null) {
            console.error("Call draw or generate first before accessing height!");
            return null;
        }
        return this.maxY - this.minY;
    }

    setScale(scale) {
        this.scale = scale;
        this.recalcPos();
    } 

    setX(x) {
        this.x = x;
        this.recalcPos();
    }

    setY(y) {
        this.y = y;
        this.recalcPos();
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.recalcPos();
    }

    offsetX(offset) {
        this.x += offset;
        this.minX += offset;
        this.maxX += offset;
    }

    offsetY(offset) {
        this.y += offset;
        this.minY += offset;
        this.maxY += offset;
    }

    offsetPos(offsetX, offsetY) {
        this.offsetX(offsetX);
        this.offsetY(offsetY);
    }
    boundingBox(){
        return {
            height:this.height(),
            width:this.width(),
            x: (this.maxX + this.minX) / 2,
            y: (this.maxY + this.minY) / 2
        }
    }

    recalcPos() {
        let x = this.x, 
            y = this.y;

        this.maxX = x;
        this.minX = x;
        this.maxY = y;
        this.minY = y;
        
        stroke(0);
        strokeWeight(3);
        for (var strokePath of this.strokePath) {
            if (strokePath.pen == "down") {
                if (x > this.maxX) this.maxX = x;
                if (y > this.maxY) this.maxY = y;
                if (x < this.minX) this.minX = x;
                if (y < this.minY) this.minY = y;
            }
            x += strokePath.dx * this.scale;
            y += strokePath.dy * this.scale;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }