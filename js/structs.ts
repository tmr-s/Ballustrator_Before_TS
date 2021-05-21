import {
    parseJSON,
    get
} from "jquery";
import {
    IMAGETYPE,
    imageTypeText,
    ITEMKIND,
    PARAM,
    FEETS,
    COVER,
    YARDLINE,
    ENDZONE,
    LINEWIDTH,
    COMMANDS,
    OPERATION,
    IMAGE_DATA,
    HIERARCHY,
    SIZEC,
    FRAMEC,
    ColorC,
    RelationC,
    RouteC,
    ObjC,
    TEXT,
    PlayC,
    PlayListC,
    ComSet,
    FOLDER,
    LAYER,
    HISTORYC,
    PlayHistory,
    PlaylistHistory,
    Setting
} from "./enums";
import {
    default as Menues
} from "./html";
import {svg2pdf, jpeg2pdf, backSVGs, svgs2pdf} from "./pdf";
import CANVAS from "./canvas";
const Exchangers = {
    data2Img: (name: string, data: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
            image.name = name;
            image.src = data;
        });
    },
    img2Data: (img: HTMLImageElement, mime_type: string) => {
        let canvas = document.createElement('canvas');
        canvas.width  = img.width;
        canvas.height = img.height;
        // Draw Image
        let ctx = canvas.getContext('2d');
        if(ctx === null) {
            return "";
        }
        ctx.drawImage(img, 0, 0);
        // To Base64
        return canvas.toDataURL(mime_type);
    },
    mixCanvas: async (cvs: HTMLCanvasElement[]) => {
        let ans = document.createElement('canvas');
        let context = ans.getContext('2d');
        if(context === null) {
            return ans;
        }
        for(let i=0;i<cvs.length;i++) {
            if(ans.width < cvs[i].width) {
                ans.width = cvs[i].width;
            }
            if(ans.height < cvs[i].height) {
                ans.height = cvs[i].height;
            }
            context.drawImage(await CANVAS.createImage(cvs[i]), 0, 0);
        }
        return ans;
    },
    rotate: (x: number, y: number, angle: number, originX: number = 0, originY: number = 0) => {
        let ans = new Point(0, 0);
        const X = x - originX;
        const Y = y - originY;
        const r = angle*Math.PI/180;
        ans.x = X * Math.cos(r) - Y * Math.sin(r);
        ans.y = Y * Math.cos(r) + X * Math.sin(r);
        return ans;
    },
    fontSize: (str: string, max: number = 16, width: number = 65) => {
        const x = document.getElementById('ruler');
        if(x) {
            x.textContent = str;
            const w = x.offsetWidth;
            x.textContent = "";
            if(w < width) return max;
            else return Math.floor(max * width/w);
        }
        return max;
    },
    formatDigit: (num: number, digit: number, char: string = "0") => {
        let ans = "" + num;
        if(ans.length >= digit) return ans;
        for(let i=0;i<digit;i++) {
            ans = char + ans;
        }
        ans = ans.slice(-digit);
        return ans;
    },
    formatDate: (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const day = date.getDate();
        const hour = date.getHours();
        const min = date.getMinutes();
        const yyyy = "" + year;
        const MM = Exchangers.formatDigit(month, 2);
        const dd = Exchangers.formatDigit(day, 2);
        const HH = Exchangers.formatDigit(hour, 2);
        const mm = Exchangers.formatDigit(min, 2);
        const ans = yyyy + "/" + MM + "/" + dd + " " + HH + ":" + mm;
        return ans;
    }
};
export default Exchangers




export const CONSTS = {
    FEET: 5.0,
    YARD: 15.0,
    CON_POINT: 0.5522847498307936,
    ROOT_2: 1.4142135623730951,
    ROOT_3: 1.7320508075688772,
    lineWidth: [1, 2, 4],
    BGSTRS: ["graph/back/white.svg", "graph/back/white.svg", "graph/back/white.svg", "graph/back/line_clg.svg", "graph/back/line_hs.svg", "graph/back/line_pro.svg", "graph/back/zero_clg.svg", "graph/back/zero_hs.svg", "graph/back/zero_pro.svg", "graph/back/num_clg.svg", "graph/back/num_hs.svg", "graph/back/num_pro.svg"],
    allCharacter: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789=-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789=-Jabcdefghijklmnopqrstuvwxyz",
    randomText: (num: number) => {
        let ans = "";
        for(let i=0;i<num;i++) {
            const j = Math.floor(Math.random() * 129);
            ans += CONSTS.allCharacter[j];
        }
        return ans;
    }
};


const zero: number[] = [0, 0];

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class SIZE {
    width: number;
    height: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }
}
export class FRAME implements FRAMEC {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y:number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
}

/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

                                                Color

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/
export class Color implements ColorC {
    red: number;
    green: number;
    blue: number;
    alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
    toString(): string {
        let ans = "#";
        ans += ("00" + this.red.toString(16)).slice(-2) + ("00" + this.green.toString(16)).slice(-2) + ("00" + this.blue.toString(16)).slice(-2);
        return ans;
    }
    fromString(str: string): void {
        const rs = str[1] + str[2];
        this.red = parseInt(rs, 16);
        const gs = str[3] + str[4];
        this.green = parseInt(gs, 16);
        const bs = str[5] + str[6];
        this.blue = parseInt(bs, 16);
    }
    fromObj(obj: ColorC): void {
        this.red = obj.red * 255;
        this.green = obj.green * 255;
        this.blue = obj.blue * 255;
        this.alpha = obj.alpha;
    }
    toObj(): ColorC {
        let ans = {
            red: this.red/255,
            green: this.green/255,
            blue: this.blue/255,
            alpha: this.alpha
        };
        return ans;
    }
}


/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

                                              Symbol

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/

export class Symbol {
    fill: Color = new Color(255, 255, 255, 1);
    lineColor: Color = new Color(0, 0, 0, 1);
    lineWidth: number = 2;
    name: string;
    selected: boolean = false;
    covered: COVER;
    reverse: boolean;
    frame: FRAME;
    canvas: HTMLCanvasElement;
    text: string = "T";
    font: string = "";

    constructor(frame: FRAMEC, name: string, cov: COVER = COVER.none, rev: boolean = false, text: string) {
        this.name = name;
        this.covered = cov;
        this.reverse = rev;
        this.frame = new FRAME(frame.x, frame.y, frame.width, frame.height);
        this.canvas = document.createElement("canvas");
        this.text = text;
        this.draw();
    }

    draw(): HTMLCanvasElement {
        this.canvas.width = this.frame.width;
        this.canvas.height = this.frame.height;
        const ctx = this.canvas.getContext("2d");
        const a = this.frame.width/2 - this.lineWidth/2;
        const b = this.frame.height/2 - this.lineWidth/2;
        const w = this.frame.width/2;
        const h = this.frame.height/2;
        if(ctx === null) {
            return this.canvas;
        }
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fill.toString();
        ctx.strokeStyle = this.lineColor.toString();
        if(this.reverse) {
            ctx.translate(0, h*2);
            ctx.scale(1, -1);
        }
        switch(this.name) {
            case "circle":
                switch(this.covered) {
                    case COVER.center:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(w, 1);
                        ctx.lineTo(w, h*2-1);
                        ctx.stroke();
                        break;
                    case COVER.edge:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.ellipse(w, h, a-1, b-1, 0, -Math.PI/3, Math.PI/3);
                        ctx.closePath();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(w, h, a-1, b-1, 0, Math.PI*2/3, Math.PI*4/3);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case COVER.fill:
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.left:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.ellipse(w, h, a-1, b-1, 0, Math.PI/2, Math.PI*3/2);
                        ctx.fill();
                        break;
                    case COVER.right:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.ellipse(w, h, a-1, b-1, 0, -Math.PI/2, Math.PI/2);
                        ctx.fill();
                        break;
                    case COVER.none:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.X:
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.ellipse(w, h, a-1, b-1, 0, Math.PI/3, Math.PI*4/3);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.ellipse(w, h, a-1, b-1, 0, -Math.PI/3, Math.PI*2/3);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case COVER.dash:
                        const len = (a + b) * Math.PI/4;
                        ctx.setLineDash([len * 0.1, len * 0.1]);
                        ctx.ellipse(w, h, a-1, b-1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    default:
                        break;
                }
                break;
            case "square":
                switch(this.covered) {
                    case COVER.center:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(w, 1);
                        ctx.lineTo(w, h*2-1);
                        ctx.stroke();
                        break;
                    case COVER.edge:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.rect(w-a, h-b, a/2, b*2-1);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.rect(w+a/2, h-b, a/2, b*2-1);
                        ctx.fill();
                        break;
                    case COVER.fill:
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.left:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.rect(w-a, h-b, a, b*2-1);
                        ctx.fill();
                        break;
                    case COVER.right:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.rect(w, h-b, w*2-1, b*2-1);
                        ctx.fill();
                        break;
                    case COVER.X:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(1, 1);
                        ctx.lineTo(w*2-1, b*2-1);
                        ctx.moveTo(w*2-1, 1);
                        ctx.lineTo(1, b*2-1);
                        ctx.stroke();
                        break;
                    case COVER.none:
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.dash:
                        const len = (w + h)/4;
                        ctx.setLineDash([len * 0.3, len * 0.2]);
                        ctx.rect(w-a, h-b, a*2-1, b*2-1);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    default:
                        break;
                }
                break;
            case "triangle":
                switch(this.covered) {
                    case COVER.none:
                        ctx.beginPath();
                        ctx.moveTo(w, h-b+1);
                        ctx.lineTo(a+w-1, b+h-1);
                        ctx.lineTo(w-a+1, h+b-1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.fill:
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.moveTo(w, h-b+1);
                        ctx.lineTo(a+w-1, b+h-1);
                        ctx.lineTo(w-a+1, h+b-1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.center:
                        ctx.beginPath();
                        ctx.moveTo(w, h-b+1);
                        ctx.lineTo(a+w-1, b+h-1);
                        ctx.lineTo(w-a+1, h+b-1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(w, 1);
                        ctx.lineTo(w, h*2-1);
                        ctx.stroke();
                        break;
                    case COVER.left:
                        ctx.beginPath();
                        ctx.moveTo(w, h-b+1);
                        ctx.lineTo(a+w-1, b+h-1);
                        ctx.lineTo(w-a+1, h+b-1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.moveTo(w, 1);
                        ctx.lineTo(w, h*2-1);
                        ctx.lineTo(1, h*2-1);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case COVER.right:
                        ctx.beginPath();
                        ctx.moveTo(w, h-b);
                        ctx.lineTo(a+w, b+h);
                        ctx.lineTo(w-a, h+b);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.moveTo(w, 1);
                        ctx.lineTo(w, h*2-1);
                        ctx.lineTo(w*2-1, h*2-1);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case COVER.dash:
                        const len = (w+h)/3;
                        ctx.setLineDash([len * 0.2, len * 0.1]);
                        ctx.beginPath();
                        ctx.moveTo(w, h-b+1);
                        ctx.lineTo(a+w-1, b+h-1);
                        ctx.lineTo(w-a+1, h+b-1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case COVER.reverse:
                        ctx.beginPath();
                        ctx.moveTo(w-a+1, h-b+1);
                        ctx.lineTo(w, h+b-1);
                        ctx.lineTo(w+a-1, h-b+1);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;
                    default:
                        break;
                }
                break;
            case "X":
                ctx.beginPath();
                ctx.moveTo(1, 1);
                ctx.lineTo(w*2-1, h*2-1);
                ctx.moveTo(w*2-1, 1);
                ctx.lineTo(1, h*2-1);
                ctx.stroke();
                break;
            case "V":
                ctx.beginPath();
                ctx.moveTo(1, 1);
                ctx.lineTo(w, h*2-1);
                ctx.lineTo(w*2-1, 1);
                ctx.stroke();
                break;
            case "TEXT":
                switch(this.covered) {
                    case COVER.none:
                        ctx.fillStyle = this.fill.toString();
                        ctx.font = "" + (h*2) + "px " + function(f: string) {if(f === "") return ""; else return f + ",";}(this.font) + "sans-serif,serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(this.text, w, h);
                        ctx.strokeText(this.text, w, h);
                        break;
                    case COVER.fill:
                        ctx.fillStyle = this.lineColor.toString();
                        ctx.font = "" + (h*2) + "px " + function(f: string) {if(f === "") return ""; else return f + ",";}(this.font) + ",sans-serif,serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(this.text, w, h);
                        ctx.strokeText(this.text, w, h);
                        break;
                }
                break;
            default:
                break;
        }
        return this.canvas;
    }

    drawInPDF() {
    }
    toSVG(): SVGElement {
        const lC = this.lineColor.toString();
        const fC = this.fill.toString();
        const lW = this.lineWidth;
        const w = this.frame.width;
        const h = this.frame.height;
        const ans = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        ans.setAttribute("viewBox", "-" + this.frame.width/2 + " -" + this.frame.height/2 + " " + this.frame.width + " " + this.frame.height);
        switch(this.name) {
            case "circle":
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                circle.style.strokeWidth = "" + lW;
                circle.style.fill = fC;
                circle.style.stroke = lC;
                circle.setAttribute("rx", "" + ((w-lW)/2));
                circle.setAttribute("ry", "" + ((h-lW)/2));
                ans.appendChild(circle);
                const clip = "view-box ellipse(100% 100% at 0px 0px)";
                switch(this.covered) {
                    case COVER.none:
                        break;
                    case COVER.center:
                        const center = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        center.style.strokeWidth = "" + lW;
                        center.style.stroke = lC;
                        center.setAttribute("x1", "0");
                        center.setAttribute("x2", "0");
                        center.setAttribute("y1", "-" + (h/2));
                        center.setAttribute("y2", "" + (h/2));
                        ans.appendChild(center);
                        break;
                    case COVER.edge:
                        const edge = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        edge.style.fill = lC;
                        edge.setAttribute("clip-path", "ellipse(200% 50% at 200% 50%)");
                        edge.setAttribute("x", "-" + (w/2));
                        edge.setAttribute("y", "-" + (h/2));
                        edge.setAttribute("width", "" + (w/4));
                        edge.setAttribute("height", "" + h);
                        const edge2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        edge2.style.fill = lC;
                        edge2.setAttribute("clip-path", "ellipse(200% 50% at -100% 50%)");
                        edge2.setAttribute("x", "" + (w/4));
                        edge2.setAttribute("y", "-" + (h/2));
                        edge2.setAttribute("width", "" + (w/4));
                        edge2.setAttribute("height", "" + h);
                        ans.appendChild(edge);
                        ans.appendChild(edge2);
                        break;
                    case COVER.fill:
                        circle.style.fill = lC;
                        break;
                    case COVER.left:
                        const left = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        left.style.fill = lC;
                        left.setAttribute("clip-path", "ellipse(100% 50% at 100% 50%)");
                        left.setAttribute("x", "-" + (w/2));
                        left.setAttribute("y", "-" + (h/2));
                        left.setAttribute("width", "" + (w/2));
                        left.setAttribute("height", "" + h);
                        ans.appendChild(left);
                        break;
                    case COVER.right:
                        const right = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        right.style.fill = lC;
                        right.setAttribute("clip-path", "ellipse(100% 50% at 0% 50%)");
                        right.setAttribute("x", "0");
                        right.setAttribute("y", "-" + (h/2));
                        right.setAttribute("width", "" + (w/2));
                        right.setAttribute("height", "" + h);
                        ans.appendChild(right);
                        break;
                    case COVER.X:
                        const bt1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        bt1.style.strokeWidth = "" + lW;
                        bt1.style.stroke = lC;
                        bt1.setAttribute("clip-path", "ellipse(50% 50% at 50% 50%)");
                        bt1.setAttribute("x1", "-" + (w/2));
                        bt1.setAttribute("x2", "" + (w/2));
                        bt1.setAttribute("y1", "-" + (h/2));
                        bt1.setAttribute("y2", "" + (h/2));
                        const bt2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        bt2.style.strokeWidth = "" + lW;
                        bt2.style.stroke = lC;
                        bt2.setAttribute("clip-path", "ellipse(50% 50% at 50% 50%)");
                        bt2.setAttribute("x1", "" + (w/2));
                        bt2.setAttribute("x2", "-" + (w/2));
                        bt2.setAttribute("y1", "-" + (h/2));
                        bt2.setAttribute("y2", "" + (h/2));
                        ans.appendChild(bt1);
                        ans.appendChild(bt2);
                        break;
                    case COVER.dash:
                        const len = (w+h) * Math.PI/80;
                        circle.style.strokeDasharray = "" + len + " " + len;
                        break;
                    default:
                        break;
                }
                break;
            case "square":
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.style.stroke = lC;
                rect.style.fill = fC;
                rect.style.strokeWidth = "" + lW;
                rect.setAttribute("x", "-" + ((w-lW)/2));
                rect.setAttribute("y", "-" + ((h-lW)/2));
                rect.setAttribute("width", "" + (w-lW));
                rect.setAttribute("height", "" + (h-lW));
                ans.appendChild(rect);
                switch(this.covered) {
                    case COVER.center:
                        const center = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        center.style.stroke = lC;
                        center.style.strokeWidth = "" + lW;
                        center.setAttribute("y1", "-" + (h/2));
                        center.setAttribute("y2", "" + (h/2))
                        ans.appendChild(center);
                        break;
                    case COVER.edge:
                        const edge1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        edge1.style.fill = lC;
                        edge1.setAttribute("x", "-" + (w/2));
                        edge1.setAttribute("y", "-" + (h/2));
                        edge1.setAttribute("width", "" + (w/4));
                        edge1.setAttribute("height", "" + h);
                        ans.appendChild(edge1);
                        const edge2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        edge2.style.fill = lC;
                        edge2.setAttribute("x", "" + (w/4));
                        edge2.setAttribute("y", "-" + (h/2));
                        edge2.setAttribute("width", "" + (w/4));
                        edge2.setAttribute("height", "" + h);
                        ans.appendChild(edge2);
                        break;
                    case COVER.fill:
                        rect.style.fill = lC;
                        break;
                    case COVER.left:
                        const left = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        left.style.fill = lC;
                        left.setAttribute("x", "-" + (w/2));
                        left.setAttribute("y", "-" + (h/2));
                        left.setAttribute("width", "" + (w/2));
                        left.setAttribute("height", "" + h);
                        ans.appendChild(left);
                        break;
                    case COVER.right:
                        const right = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        right.style.fill = lC;
                        right.setAttribute("x", "0");
                        right.setAttribute("y", "-" + (h/2));
                        right.setAttribute("width", "" + (w/2));
                        right.setAttribute("height", "" + h);
                        ans.appendChild(right);
                        break;
                    case COVER.X:
                        const bt1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        bt1.style.stroke = lC;
                        bt1.style.strokeWidth = "" + lW;
                        bt1.setAttribute("x1", "-" + (w/2));
                        bt1.setAttribute("y1", "-" + (h/2));
                        bt1.setAttribute("x2", "" + (w/2));
                        bt1.setAttribute("y2", "" + (h/2));
                        ans.appendChild(bt1);
                        const bt2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        bt2.style.stroke = lC;
                        bt2.style.strokeWidth = "" + lW;
                        bt2.setAttribute("x1", "" + (w/2));
                        bt2.setAttribute("y1", "-" + (h/2));
                        bt2.setAttribute("x2", "-" + (w/2));
                        bt2.setAttribute("y2", "" + (h/2));
                        ans.appendChild(bt2);
                        break;
                    case COVER.none:
                        break;
                    case COVER.dash:
                        const len = (w+h)/8;
                        rect.style.strokeDasharray = "" + (len*0.3) + " " + (len+0.2);
                        break;
                    default:
                        break;
                }
                break;
            case "triangle":
                const tri = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tri.style.stroke = lC;
                tri.style.fill = fC;
                tri.style.strokeWidth = "" + lW;
                tri.setAttribute("d", "M -" + ((w-lW)/2) + " " + ((h-lW)/2) + " h " + (h-lW) + " L 0 -" + ((h-lW)/2) + " z");
                ans.appendChild(tri);
                switch(this.covered) {
                    case COVER.none:
                        break;
                    case COVER.fill:
                        tri.style.fill = lC;
                        break;
                    case COVER.center:
                        const center = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        center.style.stroke = lC;
                        center.style.strokeWidth = "" + lW;
                        center.setAttribute("y1", "-" + (h/2));
                        center.setAttribute("y2", "" + (h/2));
                        ans.appendChild(center);
                        break;
                    case COVER.left:
                        const left = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        left.style.fill = lC;
                        left.setAttribute("d", "M 0 -" + ((h-lW)/2) + " v " + (h-lW) + " h -" + ((w-lW)/2) + " z");
                        ans.appendChild(left);
                        break;
                    case COVER.right:
                        const right = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        right.style.fill = lC;
                        right.setAttribute("d", "M 0 -" + ((h-lW)/2) + " v " + ((h-lW)/2) + " h " + ((w-lW)/2) + " z");
                        ans.appendChild(right);
                        break;
                    case COVER.dash:
                        const len = (w+h)/6;
                        tri.style.strokeDasharray = "" + (len*0.2) + " " + (len*0.1);
                        break;
                    case COVER.reverse:
                        break;
                    default:
                        break;
                }
                break;
            case "X":
                const Xp = document.createElementNS("http://www.w3.org/2000/svg", "path");
                Xp.style.stroke = lC;
                Xp.style.strokeWidth = "" + lW;
                Xp.style.fillOpacity = "0";
                Xp.setAttribute("d", "M -" + (w/2) + " -" + (h/2) + " l " + w + " " + h + " M -" + (w/2) + " " + (h/2) + " l " + w + " -" + h);
                ans.appendChild(Xp);
                break;
            case "V":
                const Vp = document.createElementNS("http://www.w3.org/2000/svg", "path");
                Vp.style.strokeWidth = "" + lW;
                Vp.style.stroke = lC;
                Vp.style.fillOpacity = "0";
                Vp.setAttribute("d", "M -" + (w/2) + " -" + (h/2) + " L 0 " + ((h-lW)/2) + " L " + (w/2) + " -" + (h/2));
                ans.appendChild(Vp);
                break;
            case "TEXT":
                const tex = document.createElementNS("http://www.w3.org/2000/svg", "text");
                tex.style.fontSize = "" + h;
                tex.style.fontFamily = this.font;
                tex.style.stroke = lC;
                tex.style.fill = fC;
                tex.style.textAnchor = "middle";
                tex.style.dominantBaseline = "central";
                tex.textContent = this.text;
                ans.appendChild(tex);
                switch(this.covered) {
                    case COVER.none:
                        break;
                    case COVER.fill:
                        tex.style.fill = lC;
                        break;
                }
                break;
            default:
                break;
        }
        if(this.reverse) for(let i=0;i<ans.children.length;i++) {
            const a = ans.children[i];
            a.setAttribute("transform", "scale(1, -1)");
        }
        return ans;
    }
}


/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
                                               Route
//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/

export class Route {
    pos: Point[];
    color: Color = new Color(0, 0, 0, 1);
    kind: number;
    head: number;
    lineWidth: number = 1.0;
    speed: number = 1.0;
    children: Route[] = [];
    visible: boolean = true;
    ancient: Obj;
    headsize: number = 1;
    parent: Route|null;

    constructor(a: Obj, p: Route|null, color: ColorC, kind: number, head: number, first: number[] = zero) {
        this.ancient = a;
        this.parent = p;
        this.kind = kind;
        this.head = head;
        this.color.fromObj(color);
        this.pos = [new Point(first[0], first[1])];
    }


    func = function(poses: Point[], callback: Function) {
        const x1 = poses[0].x;
        const x2 = poses[1].x;
        const x3 = poses[2].x;
        const x4 = poses[3].x;
        const y1 = poses[0].y;
        const y2 = poses[1].y;
        const y3 = poses[2].y;
        const y4 = poses[3].y;
        //*
        const xtx = x4-x1;
        const yty = y4-y1;
        const len = Math.sqrt(Math.pow(xtx, 2)+Math.pow(yty, 2));
        const bx = xtx/len;
        const by = yty/len;
        const rest = len%(CONSTS.FEET*2)/2;
        const num = Math.round((len-rest*2)/CONSTS.FEET/2);
        callback(x1, y1, x1+bx*rest, y1+by*rest);
        for(let i=0;i<num;i++) {
            const tox = x1+bx*rest + bx*CONSTS.FEET*(i*2+2);
            const toy = y1+by*rest + by*CONSTS.FEET*(i*2+2);
            if(i%2==0) {
                const tmpx = x1+bx*rest + bx*CONSTS.FEET*(i*2+1) - by*CONSTS.FEET;
                const tmpy = y1+by*rest + by*CONSTS.FEET*(i*2+1) + bx*CONSTS.FEET;
                callback(tmpx, tmpy, tox, toy);
            }else {
                const tmpx = x1+bx*rest + bx*CONSTS.FEET*(i*2+1) + by*CONSTS.FEET;
                const tmpy = y1+by*rest + by*CONSTS.FEET*(i*2+1) - bx*CONSTS.FEET;
                callback(tmpx, tmpy, tox, toy);
            }
        }
        callback(x4, y4, x4, y4);
        //*/
        {/*
        const xt = function(t: number, z1: number, z2: number, z3: number, z4: number) {
            const zt1 = (z4 - 3*(z3 - z2) - z1)*t*t*t + 3*(z3 - 2*z2 + z1)*t*t + 3*(z2-z1)*t + z1;
            const zt2 = 3*(t*t*(z4-z3)+2*t*(1-t)*(z3-z2)+(1-t)*(1-t)*(z2-z1));
            return [zt1, zt2];
        }
        const tmpx = xt(0.49, x1, x2, x3, x4)[0];
        const tmpy = xt(0.49, y1, y2, y3, y4)[0];
        const tmpx2 = xt(0.51, x1, x2, x3, x4)[0];
        const tmpy2 = xt(0.51, y1, y2, y3, y4)[0];
        const len = Math.sqrt(Math.pow(tmpx2-tmpx, 2)+Math.pow(tmpy2-tmpy, 2));
        let t = 0;
        let prx = x1;
        let pry = y1;
        let lenx = x1;
        let leny = y1;
        let lent = 0;
        let k = -1;
        while(t < 0.98) {
            const ix = xt(t, x1, x2, x3, x4);//[0]: x, [1]: x'
            const iy = xt(t, y1, y2, y3, y4);
            lent += Math.sqrt((ix[0]-prx)*(ix[0]-prx) + (iy[0]-pry)*(iy[0]-pry));
            console.log(t, k);
            const av = Math.sqrt(ix[1]*ix[1]+iy[1]*iy[1]);
            if(lent >= len) {
                if(k === -1) {
                    //console.log(t, lenx, leny, ix[0], iy[0]);
                    callback(lenx, leny, ix[0], iy[0]);
                    k = 0;
                    lenx = ix[0];
                    leny = iy[0];
                }else if(k === 0) {
                    lenx = ix[0] - iy[1]*CONSTS.FEET*0.6/av;
                    leny = iy[0] + ix[1]*CONSTS.FEET*0.6/av;
                    k = 1;
                }else if(k === 1) {
                    //console.log(t, lenx, leny, ix[0], iy[0]);
                    callback(lenx, leny, ix[0], iy[0]);
                    k = 2;
                    lenx = ix[0];
                    leny = iy[0];
                }else if(k === 2) {
                    lenx = ix[0] + iy[1]*CONSTS.FEET*0.6/av;
                    leny = iy[0] - ix[1]*CONSTS.FEET*0.6/av;
                    k = 3;
                }else if(k === 3) {
                    //console.log(t, lenx, leny, ix[0], iy[0]);
                    callback(lenx, leny, ix[0], iy[0]);
                    k = 0;
                    lenx = ix[0];
                    leny = iy[0];
                }
                lent = 0;
            }
            prx = ix[0];
            pry = iy[0];
            t += 0.02;
        }
        callback(x4, y4, x4, y4);//*/
        /*
        for(let i=0;i<num;i++) {
            const t1 = 0.02 + (i+0.5)/num;
            const t2 = 0.02 + (i+1)/num;
            if(t2 >= 0.99) break;
            const endX = xt(t2, x1, x2, x3, x4)[0];
            const endY = xt(t2, y1, y2, y3, y4)[0];
            const centerX = xt(t1, x1, x2, x3, x4);
            const centerY = xt(t1, y1, y2, y3, y4);
            const av = Math.sqrt(centerX[1]*centerX[1]+centerY[1]*centerY[1]);
            let cX = 0;
            let cY = 0;
            if(i%2) {
                cX = centerX[0] - centerY[1]*CONSTS.FEET*0.6/av;
                cY = centerY[0] + centerX[1]*CONSTS.FEET*0.6/av;
            }else {
                cX = centerX[0] + centerY[1]*CONSTS.FEET*0.6/av;
                cY = centerY[0] - centerX[1]*CONSTS.FEET*0.6/av;
            }
            callback(cX, cY, endX, endY);
        }
        const eX = xt(0.99, x1, x2, x3, x4)[0];
        const eY = xt(0.99, y1, y2, y3, y4)[0];
        callback(eX, eY, x4, y4); //*/
        }
    }
    toSVG(svg: SVGElement, origin: Point, rot: number, obj: number, it: string = "[0]") {
        const ans = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const nn: number[] = JSON.parse(it);
        let id = "";
        for(let i=0;i<nn.length;i++) {
            const n = nn[i];
            id += "-" + n;
        }
        ans.id = "path-route-" + obj + id;
        ans.style.strokeWidth = "" + this.lineWidth;
        ans.style.stroke = this.color.toString();
        ans.style.fillOpacity = "0";
        if(this.pos.length === 4) {
            const p1 = Exchangers.rotate(this.pos[0].x, this.pos[0].y, rot);
            p1.x += origin.x;
            p1.y += origin.y;
            const p2 = Exchangers.rotate(this.pos[1].x, this.pos[1].y, rot);
            p2.x += origin.x;
            p2.y += origin.y;
            const p3 = Exchangers.rotate(this.pos[2].x, this.pos[2].y, rot);
            p3.x += origin.x;
            p3.y += origin.y;
            const p4 = Exchangers.rotate(this.pos[3].x, this.pos[3].y, rot);
            p4.x += origin.x;
            p4.y += origin.y;
            switch(this.kind) {
                case 0:
                    ans.setAttribute("d", "M " + p1.x + " " + p1.y + " C " + p2.x + " " + p2.y + " " + p3.x + " " + p3.y + " " + p4.x + " " + p4.y);
                    break;
                case 1:
                    if(p1.x === p2.x && p1.y === p2.y && p3.x === p4.x && p3.y === p4.y) {
                        let d = "M " + p1.x + " " + p1.y + "L";
                        this.func([p1, p2, p3, p4], (x1: number, y1: number, x2: number, y2: number) => {
                            d += " " + x1 + " " + y1 + " " + x2 + " " + y2;
                        });
                        ans.setAttribute("d", d);
                    }else {
                        ans.setAttribute("d", "M " + p1.x + " " + p1.y + " C " + p2.x + " " + p2.y + " " + p3.x + " " + p3.y + " " + p4.x + " " + p4.y);
                    }
                    break;
                case 2:
                    if(p1.x === p2.x && p1.y === p2.y && p3.x === p4.x && p3.y === p4.y) {
                        let d = "M " + p1.x + " " + p1.y + "Q";
                        this.func([p1, p2, p3, p4], (x1: number, y1: number, x2: number, y2: number) => {
                            d += " " + x1 + " " + y1 + " " + x2 + " " + y2;
                        });
                        ans.setAttribute("d", d);
                    }else {
                        ans.setAttribute("d", "M " + p1.x + " " + p1.y + " C " + p2.x + " " + p2.y + " " + p3.x + " " + p3.y + " " + p4.x + " " + p4.y);
                    }
                    break;
                case 3:
                    ans.style.strokeDasharray = "" + CONSTS.FEET/2 + " " + CONSTS.FEET/2;
                    ans.setAttribute("d", "M " + p1.x + " " + p1.y + " C " + p2.x + " " + p2.y + " " + p3.x + " " + p3.y + " " + p4.x + " " + p4.y);
                    break;
                default:
                    break;
            }
            svg.appendChild(ans);
            const ar = document.createElementNS("http://www.w3.org/2000/svg", "path");
            if(this.children.length === 0 || (this.children.length > 0 && this.children[0].pos.length === 2)) {
                let xto: number;
                let yto: number;
                const xf = p4.x;
                const yf = p4.y;
                if(p4.x === p3.x && p3.y === p4.y) {
                    const x = p4.x - p2.x;
                    const y = p4.y - p2.y;
                    const len = Math.sqrt(x*x + y*y);
                    xto = x/len;
                    yto = y/len;
                }else {
                    const x = p4.x - p3.x;
                    const y = p4.y - p3.y;
                    const len = Math.sqrt(x*x + y*y);
                    xto = x/len;
                    yto = y/len;
                }
                const sizes: number[] = [8, 6, 4];
                const ss = sizes[this.headsize] * this.lineWidth;
                ar.style.stroke = this.color.toString();
                ar.style.strokeWidth = "" + this.lineWidth;
                ar.style.fill = this.color.toString();
                const pn1 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 120, xf, yf);
                pn1.x += xf;
                pn1.y += yf;
                const pn2 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 240, xf, yf);
                pn2.x += xf;
                pn2.y += yf;
                switch(this.head) {
                    case 0:
                        break;
                    case 1:
                        ar.setAttribute("d", "M " + (xf+xto*ss) + " " + (yf+yto*ss) + " L " + pn1.x + " " + pn1.y + " " + pn2.x + " " + pn2.y + " z");
                        break;
                    case 2:
                        ar.setAttribute("d", "M " + (xf+xto*ss) + " " + (yf+yto*ss) + " L " + pn1.x + " " + pn1.y + " " + xf + " " + yf + " " + pn2.x + " " + pn2.y + " z");
                        break;
                    case 3:
                        ar.style.fillOpacity = "0";
                        const pn3 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 90, xf, yf);
                        pn3.x += xf;
                        pn3.y += yf;
                        const pn4 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, -90, xf, yf);
                        pn4.x += xf;
                        pn4.y += yf;
                        ar.setAttribute("d", "M " + (pn3.x+xto*ss/2) + " " + (pn3.y+yto*ss/2) + " L " + pn3.x + " " + pn3.y + " " + pn4.x + " " + pn4.y + " " + (pn4.x+xto*ss/2) + " " + (pn4.y+yto*ss/2));
                        break;
                    case 4:
                        ar.style.fillOpacity = "0";
                        const pp1 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 45, xf, yf);
                        const pp2 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 135, xf, yf);
                        const pp3 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 225, xf, yf);
                        const pp4 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, -45, xf, yf);
                        ar.setAttribute("d", "M " + (pp1.x+xf) + " " + (pp1.y+yf) + " L " + (pp3.x+xf) + " " + (pp3.y+yf) + " M " + (pp2.x+xf) + " " + (pp2.y+yf) + " L " + (pp4.x+xf) + " " + (pp4.y+yf));
                        break;
                    default:
                        break;
                }
                ar.id = "path-head-" + obj + id;
                ans.addEventListener("click", (e) => {
                    this.ancient.mainRoute = this;
                    this.ancient.mainRouteId = obj + id;
                    this.ancient.parent.updateSVGA();
                });
                ar.addEventListener("click", (e) => {
                    this.ancient.mainRoute = this;
                    this.ancient.mainRouteId = obj + id;
                    this.ancient.parent.updateSVGA();
                });
                svg.appendChild(ar);
            }
        }
        for(let i=0;i<this.children.length;i++) {
            const nnn = JSON.parse(it);
            nnn.push(i);
            this.children[i].toSVG(svg, origin, rot, obj, JSON.stringify(nnn));
        }
    }
    displaySVG(flag: boolean, obj: number, it: string) {
        const nn = JSON.parse(it);
        let id = "path-route-" + obj;
        for(let i=0;i<nn.length;i++) {
            const n = nn[i];
            id += "-" + n;
        }
        const g = document.getElementById(id);
        if(g) g.style.display = function() {if(flag) return "block";else return "none";}();
        const head = document.getElementById(id.replace("route", "head"));
        if(head) head.style.display = function() {if(flag) return "block";else return "none";}();
        for(let i=0;i<this.children.length;i++) {
            const nnn = JSON.parse(it);
            nnn.push(i);
            const c = this.children[i];
            c.displaySVG(flag, obj, JSON.stringify(nnn));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.strokeStyle = this.color.toString();
        ctx.lineWidth = this.lineWidth;
        ctx.moveTo(this.pos[0].x, this.pos[0].y);
        switch(this.kind) {
            case 0:
                if(this.pos.length === 4) {
                    ctx.bezierCurveTo(this.pos[1].x, this.pos[1].y, this.pos[2].x, this.pos[2].y, this.pos[3].x, this.pos[3].y);
                }
                ctx.stroke();
                break;
            case 1:
                if(this.pos.length === 4) {
                    if((this.pos[0].x === this.pos[1].x && this.pos[0].y === this.pos[1].y) && (this.pos[2].x === this.pos[3].x && this.pos[2].y === this.pos[3].y)) {
                        this.func(this.pos, function(x1:number, y1:number, x2:number, y2:number) {
                            ctx.lineTo(x1, y1);
                            ctx.lineTo(x2, y2);
                        });
                    }else {
                        ctx.bezierCurveTo(this.pos[1].x, this.pos[1].y, this.pos[2].x, this.pos[2].y, this.pos[3].x, this.pos[3].y);
                    }
                }
                break;
            case 2:
                if(this.pos.length === 4) {
                    if((this.pos[0].x === this.pos[1].x && this.pos[0].y === this.pos[1].y) && (this.pos[2].x === this.pos[3].x && this.pos[2].y === this.pos[3].y)) {
                        this.func(this.pos, function(x1:number, y1:number, x2:number, y2:number) {
                            //console.log(x1, y1, x2, y2);
                            ctx.quadraticCurveTo(x1, y1, x2, y2);
                        });
                    }else {
                        ctx.bezierCurveTo(this.pos[1].x, this.pos[1].y, this.pos[2].x, this.pos[2].y, this.pos[3].x, this.pos[3].y);
                    }
                }
                break;
            case 3:
                ctx.setLineDash([CONSTS.FEET/2, CONSTS.FEET/2]);
                if(this.pos.length === 4) {
                    ctx.bezierCurveTo(this.pos[1].x, this.pos[1].y, this.pos[2].x, this.pos[2].y, this.pos[3].x, this.pos[3].y);
                }
                break;
            default:
                break;
        }
        ctx.stroke();
        if(this.pos.length === 4 && (this.children.length === 0 || (this.children.length > 0 && this.children[0].pos.length === 2))) {
            let xto: number;
            let yto: number;
            const xf = this.pos[3].x;
            const yf = this.pos[3].y;
            if(this.pos[3].x === this.pos[2].x && this.pos[2].y === this.pos[3].y) {
                const x = this.pos[3].x - this.pos[1].x;
                const y = this.pos[3].y - this.pos[1].y;
                const len = Math.sqrt(x*x + y*y);
                xto = x/len;
                yto = y/len;
            }else {
                const x = this.pos[3].x - this.pos[2].x;
                const y = this.pos[3].y - this.pos[2].y;
                const len = Math.sqrt(x*x + y*y);
                xto = x/len;
                yto = y/len;
            }
            const sizes: number[] = [8, 6, 4];
            const ss = sizes[this.headsize] * this.lineWidth;
            ctx.setLineDash([]);
            ctx.fillStyle = this.color.toString();
            const p1 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 120, xf, yf);
            p1.x += xf;
            p1.y += yf;
            const p2 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 240, xf, yf);
            p2.x += xf;
            p2.y += yf;
            switch(this.head) {
                case 0:
                    break;
                case 1:
                    ctx.beginPath();
                    ctx.moveTo(xf+xto*ss, yf+yto*ss);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 2:
                    ctx.beginPath();
                    ctx.moveTo(xf+xto*ss, yf+yto*ss);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.lineTo(xf, yf);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 3:
                    const p3 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 90, xf, yf);
                    p3.x += xf;
                    p3.y += yf;
                    const p4 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, -90, xf, yf);
                    p4.x += xf;
                    p4.y += yf;
                    ctx.beginPath();
                    ctx.moveTo(p3.x+xto*ss/2, p3.y+yto*ss/2);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.lineTo(p4.x+xto*ss/2, p4.y+yto*ss/2);
                    ctx.stroke();
                    break;
                case 4:
                    const pp1 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 45, xf, yf);
                    const pp2 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 135, xf, yf);
                    const pp3 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, 225, xf, yf);
                    const pp4 = Exchangers.rotate(xf+xto*ss, yf+yto*ss, -45, xf, yf);
                    ctx.beginPath();
                    ctx.moveTo(pp1.x+xf, pp1.y+yf);
                    ctx.lineTo(pp3.x+xf, pp3.y+yf);
                    ctx.moveTo(pp2.x+xf, pp2.y+yf);
                    ctx.lineTo(pp4.x+xf, pp4.y+yf);
                    ctx.stroke();
                    break;
                default:
                    break;
            }
        }
        for(let i=0;i<this.children.length;i++) {
            this.children[i].draw(ctx);
        }
    }
    drawGrip(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 1.0;
        ctx.setLineDash([]);
        ctx.fillStyle = "#ffffff";
        if(this.pos[0].x === this.pos[1].x && this.pos[0].y === this.pos[1].y) {
            //
        }else {
            ctx.strokeStyle = "#cc0000";
            ctx.ellipse(this.pos[1].x, this.pos[1].y, 4, 4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            ctx.moveTo(this.pos[0].x, this.pos[0].y);
            ctx.lineTo(this.pos[1].x, this.pos[1].y);
            ctx.stroke();
        }
        if(this.pos.length === 4) {
            if(this.pos[3].x === this.pos[2].x && this.pos[3].y === this.pos[2].y) {
                //
            }else {
                ctx.beginPath();
                ctx.strokeStyle = "#0000cc";
                ctx.ellipse(this.pos[2].x, this.pos[2].y, 4, 4, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                ctx.moveTo(this.pos[2].x, this.pos[2].y);
                ctx.lineTo(this.pos[3].x, this.pos[3].y);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.strokeStyle = "#000000";
            ctx.ellipse(this.pos[3].x, this.pos[3].y, 4, 4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
        for(let i=0;i<this.children.length;i++) {
            this.children[i].drawGrip(ctx);
        }
    }
    addRoute(color: ColorC, kind: number, head: number, first: number[] = zero): Route {
        const r = new Route(this.ancient, this, color, kind, head, first);
        this.children.push(r);
        this.ancient.tempRoute = r;
        return r;
    }
    addPoint(x: number, y: number, color: ColorC, kind: number, head: number) {
        const c = new Color(0,0,0,1);
        c.fromObj(color);
        if(this.pos.length === 4) {
            const r = this.addRoute(color, kind, head, [x, y]);
            if(this.ancient.mainRoute === null || this.ancient.mainRoute === this) {
                this.ancient.mainRoute = r;
            }
        }else {
            this.kind = kind;
            this.head = head;
            this.color.fromObj(color);
            this.pos.push(new Point(x, y));
        }
    }
    edge(): Route {
        if(this.children.length > 0) {
            return this.children[0].edge();
        }
        return this;
    }
    judgeRoute(x: number, y: number): [Route, number]|null {
        for(let i=0;i<this.pos.length;i++) {
            const p = this.pos[i];
            if(x >= p.x-5 && x <= p.x+5 && y >= p.y-5 && y <= p.y+5) return [this, i];
        }
        for(let i=0;i<this.children.length;i++) {
            const r = this.children[i];
            const a = r.judgeRoute(x, y);
            if(a) return a;
        }
        return null;
    }

    fromObj(obj: RouteC): void {
        for(let i=0;i<obj.pos.length;i++) {
            this.pos[i] = new Point(obj.pos[i][0], obj.pos[i][1]);
        }
        this.color.fromObj(obj.color);
        this.kind = obj.kind;
        this.head = obj.head;
        this.lineWidth = obj.lineWidth;
        this.speed = obj.speed;
        this.visible = obj.visible;
        for(let i=0;i<obj.children.length;i++) {
            this.children[i] = new Route(this.ancient, this, obj.children[i].color, obj.children[i].kind, obj.children[i].head);
            this.children[i].fromObj(obj.children[i]);
        }
    }
    toObj(): RouteC {
        let posC: number[][] = new Array();
        for(let i:number=0;i<this.pos.length;i++) {
            posC[i] = new Array();
            posC[i][0] = this.pos[i].x;
            posC[i][1] = this.pos[i].y;
        }
        let child: RouteC[] = new Array();
        for(let i=0;i<this.children.length;i++) {
            child[i] = this.children[i].toObj();
        }
        let ans: RouteC = {
            pos: posC,
            color: this.color.toObj(),
            kind: this.kind,
            head: this.head,
            lineWidth: this.lineWidth,
            headsize: this.headsize,
            speed: this.speed,
            children: child,
            visible: this.visible
        };
        return ans;
    }
}

/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

                                                Obj

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/

export class Obj {
    name: string;
    pos: Point = new Point(0, 0);
    symbol: string = "circle";
    image: Symbol;
    route: Route[] = [];
    mainRoute: Route|null = null;
    mainRouteId: string = "";
    size: SIZE;
    rot: number = 0;
    text: string = "";
    font: string = "";
    invisible: boolean = false;
    applying: boolean = false;
    clip: boolean = false;
    back: Color = new Color(255,255,255,1);
    color: Color = new Color(0, 0, 0, 1);
    layer: string = "1";
    folder: string = "Object";
    selected: boolean = false;
    parent: Play;
    tempRoute: Route|null = null;
    opened: boolean = false;
    id: number;
    tempNum: number = 0;

    constructor(me: Play,id: number, name: string, text: string, cov: COVER = 0, symbol: string = name) {
        this.parent = me;
        this.name = name;
        this.id = id;
        this.size = new SIZE(CONSTS.FEET * 5, CONSTS.FEET * 5);
        this.symbol = symbol;
        this.image = new Symbol({x: 0, y: 0, width: this.size.width, height: this.size.height}, symbol, cov, false, text);
    }

    setSize(width: number, height: number) {
        if(width > 0) {
            this.size.width = width;
            this.image.frame.width = width;
        }
        if(height > 0) {
            this.size.height = height;
            this.image.frame.height = height;
        }
        this.image.draw();
    }
    setText(t: string) {
        this.text = t;
        this.image.text = t;
        this.image.draw();
    }

    setFlip(flip: boolean) {
        this.image.reverse = flip;
        this.image.draw();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rot/180*Math.PI);
        if(!this.invisible) ctx.drawImage(this.image.canvas, 0 - this.size.width/2, 0 - this.size.height/2);
        if(this.selected) {
            ctx.fillStyle = "#0055ff";
            ctx.globalAlpha = 0.4;
            ctx.fillRect(-this.size.width/2, -this.size.height/2, this.size.width, this.size.height);
        }
        ctx.restore();
    }
    drawRoute(ctx: CanvasRenderingContext2D, ui: CanvasRenderingContext2D) {
        ctx.save();
        ui.save();
        ui.translate(this.pos.x, this.pos.y);
        ui.rotate(this.rot/180*Math.PI);
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rot/180*Math.PI);
        if(!this.invisible) {
            for(let i=0;i<this.route.length;i++) {
                this.route[i].draw(ctx);
                if(this.selected && this.parent.command === COMMANDS.grip) {
                    this.route[i].drawGrip(ui);
                }
            }
        }
        ui.restore();
        ctx.restore();
    }

    judgePoint(x: number, y: number): boolean {
        const p = Exchangers.rotate(x, y, this.rot, this.pos.x, this.pos.y);
        if(p.x >= -this.size.width/2 && p.x <= this.size.width/2 && p.y <= this.size.height/2 && p.y >= -this.size.height/2) {
            return true;
        }
        return false;
    }
    judgeInRect(x1: number, y1: number, x2: number, y2: number): boolean {
        const ax = Math.min(x1, x2);
        const bx = Math.max(x1, x2);
        const ay = Math.min(y1, y2);
        const by = Math.max(y1, y2);
        if(this.pos.x >= ax && this.pos.x <= bx && this.pos.y >= ay && this.pos.y <= by) {
            this.selectMe();
            return true;
        }
        this.selectMe(false);
        return false;
    }
    selectMe(flag: boolean = true) {
        this.selected = flag;
    }
    requestFlash() {
        this.parent.draw([this.layer]);
    }
    judgeRoute(x: number, y: number): [Route, number]|null {
        const p = Exchangers.rotate(x, y, this.rot, this.pos.x, this.pos.y);
        for(let i=0;i<this.route.length;i++) {
            const r = this.route[i];
            const a = r.judgeRoute(p.x, p.y);
            if(a) return a;
        }
        return null;
    }
    fixPoint(x: number, y: number): Point {
        const xx = x - this.pos.x;
        const yy = y - this.pos.y;
        const p = Exchangers.rotate(xx, yy, -this.rot);
        return p;
    }

    makeHierarchy(num: string): HIERARCHY[] {
        let ans: HIERARCHY[] = [];
        function ww(r: Route): number {
            let a = 0;
            if(r.children.length === 0) a = 1;
            for(let i=0;i<r.children.length;i++) {
                a += ww(r.children[i]);
            }
            return a;
        }
        for(let i=0;i<this.route.length;i++) {
            const r = this.route[i];
            const n = ww(r);
            for(let j=0;j<n;j++) {
                ans.push({kind: ITEMKIND.route, text: "route", children: [], num: num + "," + ans.length, open: false});
            }
        }
        return ans;
    }

    toSVG(animation: boolean): SVGElement {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.id = "g-obj-" + this.id;
        const svg = this.image.toSVG();
        svg.id = "svg-obj-" + this.id;
        g.appendChild(svg);
        svg.setAttribute("x", "" + (this.pos.x - this.size.width/2));
        svg.setAttribute("y", "" + (this.pos.y - this.size.height/2));
        svg.setAttribute("width", "" + this.size.width);
        svg.setAttribute("height", "" + this.size.height);
        let trans = "";
        if(this.invisible) svg.style.display = "none";
        trans += "rotate(" + this.rot + "," + this.pos.x + "," + this.pos.y + ") ";
        g.setAttribute("transform", trans);
        return g;
    }
    imNames: [string] = [""];
    imCovers: [number] = [0];

    fromObj(obj: ObjC): void {
        this.name = obj.name;
        this.pos.x = obj.Position[0];
        this.pos.y = obj.Position[1];
        this.symbol = obj.symbolName;
        this.image.name = this.symbol;
        this.image.covered = this.imCovers[obj.cover];
        for(let i=0;i<obj.route.length;i++) {
            this.route[i] = new Route(this, null, obj.route[i].color, 0, 0);
            this.route[i].fromObj(obj.route[i]);
        }
        this.size.width = obj.width;
        this.size.height = obj.height;
        this.image.frame.x = 0;
        this.image.frame.y = 0;
        this.image.frame.width = this.size.width;
        this.image.frame.height = this.size.height;
        let rel = obj.rel;
        this.rot = obj.rot;
        this.image.reverse = obj.fl;
        this.text = obj.text;
        this.font = obj.fName;
        this.invisible = obj.invisible;
        if(obj.applying) this.applying = obj.applying;
        if(obj.clip) this.clip = obj.clip;
        if(obj.back) this.back.fromObj(obj.back);
        this.color.fromObj(obj.color);
        if(obj.layer) this.layer = obj.layer;
        if(obj.folder) this.folder = obj.folder;
        if(obj.opened) this.opened = obj.opened;
        if(obj.id) this.id = obj.id;
        let mr: Route|null = null;
        if(obj.mainRoute) for(let i=0;i<obj.mainRoute.length;i++) {
            const m = obj.mainRoute[i];
            if(mr) mr = mr.children[m];
            else mr = this.route[m];
        }
        this.mainRoute = mr;
        this.parent.relations.concat(rel);

        this.image.draw();
    }
    toObj(): ObjC {
        let routeC: RouteC[] = new Array();
        for(let i=0;i<this.route.length;i++) {
            routeC[i] = this.route[i].toObj();
        }
        let mainR: number[] = [];
        let mr = this.mainRoute;
        while(true) {
            if(!mr) break;
            const p = mr.parent;
            let n: number;
            if(p) n = p.children.indexOf(mr);
            else n = mr.ancient.route.indexOf(mr);
            mr = p;
            mainR.splice(0, 0, n);
        }
        let ans: ObjC = {
            name: this.name,
            Position: [this.pos.x, this.pos.y],
            symbolName: this.symbol,
            cover: this.image.covered,
            route: routeC,
            mainRoute: mainR,
            rot: this.rot,
            fl: this.image.reverse,
            rel: [],
            width: this.size.width,
            height: this.size.height,
            text: this.text,
            fName: this.font,
            invisible: this.invisible,
            applying: this.applying,
            clip: this.clip,
            back: this.back.toObj(),
            layer: this.layer,
            folder: this.folder,
            color: this.color.toObj(),
            opened: this.opened,
            id: this.id,
            symbol: 0
        };
        return ans;
    }

    drawMoment(time: number): boolean {
        return false;
    }
}



class HISTORY {
    timestamp: string;
    operation: string;
    history: string;
    children: HISTORY[] = [];
    parent: HISTORY|null;

    constructor(par: HISTORY|null, time: Date|null = null, op_num: number|null = null, content: any = null) {
        this.parent = par;
        if(time) this.timestamp = Exchangers.formatDate(time);
        else this.timestamp = "";
        this.operation = "";
        this.history = "";
        if(op_num !== null) this.operator(op_num, content);
    }

    operator(op_num: OPERATION, content: any) {
        switch(op_num) {
            case OPERATION.open:
                break;
            case OPERATION.change_name:
                break;
            case OPERATION.select:
                break;
            case OPERATION.route:
                break;
            case OPERATION.move:
                break;
            case OPERATION.relation:
                break;
            case OPERATION.routemove:
                break;
            case OPERATION.erase:
                break;
            case OPERATION.oadd:
                break;
            case OPERATION.tadd:
                break;
            case OPERATION.delete:
                break;
            default:
                break;
        }
    }

    toObj(): HISTORYC {
        let child: HISTORYC[] = [];
        for(let i=0;i<this.children.length;i++) {
            child.push(this.children[i].toObj());
        }
        let ans: HISTORYC = {
            timestamp: this.timestamp,
            operation: this.operation,
            history: this.history,
            children: child
        };
        return ans;
    }
    fromObj(obj: HISTORYC) {
        this.timestamp = obj.timestamp;
        this.operation = obj.operation;
        this.history = obj.history;
        let child: HISTORY[] = [];
        for(let i=0;i<obj.children.length;i++) {
            const c = new HISTORY(this, new Date());
            c.fromObj(obj.children[i]);
        }
        this.children = child;
    }
}


/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

                                                Play

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/
export class Play {
    name: string;
    players: Obj[] = [];
    deletedObj: Obj[] = [];
    tempObj: Obj;
    backColor: Color = new Color(255, 255, 255, 255);
    texts: TEXT[] = [];
    parameter: number[];
    feets: number[];
    los: number = 30;
    history: HISTORY[] = [];
    now: HISTORY;
    folders: FOLDER[] = [];
    layers: LAYER[] = [];
    canvas: {[name: string]: HTMLCanvasElement} = {};
    ctxs: {[name: string]: CanvasRenderingContext2D} = {};
    uiCanvas: CanvasRenderingContext2D|null = null;
    objDic: {[name: number]: Obj} = {};
    div: HTMLSpanElement|null = null;
    images: HTMLImageElement[] = [];
    relations: RelationC[] = [];
    selectedObj: number[] = [];
    selectedText: number[] = [];
    size: SIZE = new SIZE(1200, 1200);
    command: number = 0;
    startP: Point|null = null;
    selectbox: {x1: number, y1: number, x2: number, y2: number}|null = null;
    parent: PlayList;
    opened: boolean = false;
    openedFolder: boolean[] = [];
    oldcom: number|null = null;
    rightFlag: boolean = false;
    setting: ComSet;
    maxLayer: number = 0;
    maxFolder: number = 0;
    baselineV: number[] = [];
    baselineH: number[] = [];
    tempHistory: PlayC[] = [];
    tempNow: number = 0;
    maxId: number = 0;
    tempRoute: Route|null = null;

    constructor(playlist: PlayList, name: string, para: number[], fts: number[]) {
        this.parent = playlist;
        this.name = name;
        this.parameter = para;
        this.feets = fts;
        this.setting = {
            symbolName: "circle",
            symbolCover: COVER.none,
            mainColor: {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 1
            },
            subColor: {
                red: 1,
                green: 1,
                blue: 1,
                alpha: 1
            },
            isFlipped: false,
            objectRot: 0,
            objectWidth: CONSTS.FEET*5,
            objectHeight: CONSTS.FEET*5,
            objectLayerId: "1",
            objectFolderId: "1",
            objectText: "T",
            lineColor: {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 1
            },
            lineKind: 0,
            lineHead: 0,
            lineWidth: 0,
            text: "",
            fontName: "Arial, Helvetica, sans-serif",
            textSize: 25,
            textBold: false,
            textItalic: false,
            textRot: 0,
            textColor: {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 1
            },
            textLayerId: "1",
            textFolderId: "2",
            baselineH: true,
            baselineV: false,
            adaptBaseline: [false, false, true, false, false, false, true, true],
            relKind: 0,
            relWidth: 2.0,
            relColor: {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 1
            },
            relLayerId: "1",
            relSpace: 5.0,
            gripKind: 0
        };
        this.tempObj = new Obj(this, this.maxId, "tempObj", this.setting.objectText);
        this.now = new HISTORY(null, new Date(), OPERATION.open, this.name);
        this.history.push(this.now);
        this.div = document.getElementById('CanvaSpan');
        this.now.history = this.toHistory();
        const ui = document.getElementById("uiCanvas") as HTMLCanvasElement|null;
        if(ui) {
            const uic = ui.getContext("2d") as CanvasRenderingContext2D|null;
            if(uic) this.uiCanvas = uic;
        }
        this.setBack();
    }


    indexOfFolder(id: string): number {
        for(let i=0;i<this.folders.length;i++) {
            const c = this.folders[i].id;
            if(id === c) return i;
        }
        return -1;
    }
    indexOfLayer(name: string): number {
        for(let i=0;i<this.layers.length;i++) {
            const n = this.layers[i].name;
            if(name === n) return i;
        }
        return -1;
    }
    indexOfLayerById(id: string): number {
        for(let i=0;i<this.layers.length;i++) {
            const n = this.layers[i].id;
            if(id === n) return i;
        }
        return -1;
    }
    allLayers(): string[] {
        const ans: string[] = [];
        for(let i=0;i<this.layers.length;i++) {
            ans.push(this.layers[i].id);
        }
        return ans;
    }
    getLayer(id: string): number {
        for(let i=0;i<this.layers.length;i++) {
            const l = this.layers[i];
            if(l.id === id) return i;
        }
        return -1;
    }



    draw(ls: string[] = this.allLayers()) {
        for(let i=0;i<ls.length;i++) {
            const ctx = this.ctxs[ls[i]];
            if(ctx) {
                ctx.clearRect(0, 0, this.size.width, this.size.height);
            }
        }
        for(let i=0;i<this.players.length;i++) {
            if(ls.indexOf(this.players[i].layer) !== -1) {
                const ctx = this.ctxs[this.players[i].layer];
                this.players[i].draw(ctx);
            }
        }
        for(let i=0;i<this.texts.length;i++) {
            const t = this.texts[i];
            if(ls.indexOf(t.layer) !== -1) {
                const ctx = this.ctxs[t.layer];
                ctx.save();
                let y1 = 0;
                let y2 = 0;
                if(t.size < 0) {
                    y1 = t.pos[1];
                    y2 = y1+t.size;
                }else {
                    y1 = t.pos[1] + t.size;
                    y2 = t.pos[1];
                }
                ctx.translate(t.pos[0], y2);
                ctx.rotate(t.angle/180*Math.PI);
                ctx.font = function(){if(t.bold) return "bold ";else return "";}() + function(){if(t.italic) return "italic "; else return "";}() + t.size + "px " + t.fontName;
                const color = new Color(0, 0, 0, 1);
                color.fromObj(t.color);
                const m = ctx.measureText(t.string);
                t.width = m.width;
                ctx.fillStyle = color.toString();
                ctx.fillText(t.string, 0, y1-y2);
                ctx.restore();
            }
        }
        const ui = this.uiCanvas;
        if(ui) {
            const w = ui.canvas.width;
            const h = ui.canvas.height;
            if(this.command === COMMANDS.grip) ui.clearRect(0, 0, w, h);
            for(let i=0;i<this.players.length;i++) {
                if(ls.indexOf(this.players[i].layer) !== -1) {
                    const ctx = this.ctxs[this.players[i].layer];
                    this.players[i].drawRoute(ctx, ui);
                }
            }
        }
        for(let i=0;i<this.relations.length;i++) {
            if(ls.indexOf(this.relations[i].layerId) !== -1) {
                const ctx = this.ctxs[this.relations[i].layerId];
                this.drawRelation(ctx, this.relations[i]);
            }
        }
    }

    drawRelation(ctx: CanvasRenderingContext2D, rel: RelationC) {
        const from = this.objDic[rel.from];
        const to = this.objDic[rel.to];
        const fp = from.pos;
        const tp = to.pos;
        const dif = new Point(tp.x - fp.x, tp.y - fp.y);
        const len = Math.sqrt(dif.x*dif.x+dif.y*dif.y);
        const a = dif.x/len;
        const b = dif.y/len;
        const fs = Math.sqrt(Math.pow(from.size.width,2)+Math.pow(from.size.height,2))/2;
        const ts = Math.sqrt(Math.pow(to.size.width,2)+Math.pow(to.size.height,2))/2;
        ctx.beginPath();
        ctx.save();
        const color = new Color(0, 0, 0, 1);
        color.fromObj(rel.color);
        ctx.strokeStyle = color.toString();
        ctx.lineWidth = rel.width;
        switch(rel.kind) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                ctx.setLineDash([rel.width, rel.width]);
                ctx.moveTo(fp.x, fp.y);
                ctx.lineTo(tp.x, tp.y);
                break;
            default:
                break;
        }
        ctx.stroke();
        ctx.restore();
    }

    setLayers(id: string) {
        const c = this.canvas[id];
        c.style.display = "block";
        const ind = this.indexOfLayerById(id);
        if(ind !== -1 && this.layers[ind].visible) c.style.zIndex = "" + (2+ind);
        else c.style.display = "none";
    }

    judgeAt(x: number, y: number, obj: boolean = true, excepts: string[] = [], select: boolean = false): number {
        if(obj) {
            let tmpPlayers: number = -1;
            let tmpLayer = Number.MAX_SAFE_INTEGER;
            for(let i=0;i<this.players.length;i++) {
                if(select) this.players[i].selectMe(false);
                if(excepts.indexOf(this.players[i].layer) === -1) {
                    if(this.players[i].judgePoint(x, y)) {
                        const a = this.indexOfLayerById(this.players[i].layer);
                        if(a<tmpLayer) {
                            tmpLayer = a;
                            tmpPlayers = i;
                        }
                    }
                }
            }
            return tmpPlayers;
        }else {
            for(let i=0;i<this.texts.length;i++) {
                const t = this.texts[i];
                const x1 = t.pos[0];
                let y1 = 0;
                let y2 = 0;
                if(t.size >= 0) {
                    y1 = t.pos[1];
                    y2 = y1 + t.size;
                }else {
                    y2 = t.pos[1];
                    y1 = y2 + t.size;
                }
                const ctx = this.ctxs[t.layer];
                ctx.save();
                ctx.font = function(){if(t.bold) return "bold "; else return "";}() + function(){if(t.italic) return "italic"; else return "";}() + t.size + "px " + t.fontName;
                const a = ctx.measureText(t.string);
                const x2 = x1 + a.width;
                const p = Exchangers.rotate(x, y, t.angle, x1, y1);
                if(p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2) {
                    return i;
                }
            }
            return -1;
        }
    }
    judgeIn(x1: number, y1: number, x2: number, y2: number, excepts: string[] = []) {
        //
    }
    exceptLayer(): string[] {
        let ans: string[] = [];
        for(let i=0;i<this.layers.length;i++) {
            if(this.layers[i].lock || !this.layers[i].visible) ans.push(this.layers[i].id);
        }
        return ans;
    }

    selectAt(x: number, y: number, excepts: string[] = this.exceptLayer()): boolean {
        const tmpPlayers: number = this.judgeAt(x, y, true, excepts, true);
        if(tmpPlayers == -1) {
            this.selectedObj = [];
            return false;
        }
        this.selectedObj = [tmpPlayers];
        this.players[tmpPlayers].selectMe(true);
        return true;
    }
    selectIn(x1: number, y1: number, x2: number, y2: number, excepts: string[] = this.exceptLayer()) {
        this.selectedObj = [];
        for(let i=0;i<this.players.length;i++) {
            if(excepts.indexOf(this.players[i].layer) === -1) {
                if(this.players[i].judgeInRect(x1, y1, x2, y2)) {
                    this.selectedObj.push(i);
                }
            }
        }
    }

    mouseDown(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.select:
                if(this.setting.adaptBaseline[0]) {
                    for(let i=0;i<this.baselineV.length;i++) {
                        const v = this.baselineV[i] - x;
                        if(v >= -CONSTS.YARD && v <= CONSTS.YARD) {
                            x = this.baselineV[i];
                            break;
                        }
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        const h = this.baselineH[i] - y;
                        if(h >= -CONSTS.YARD && h <= CONSTS.YARD) {
                            y = this.baselineH[i];
                            break;
                        }
                    }
                }
                this.startP = new Point(x, y);
                const flag = this.selectAt(x, y);
                if(flag) {
                    this.command = 2;
                    this.oldcom = 0;
                }
                this.draw();
                if(this.parent.tab === 2) {
                    const oTB = document.getElementById('objectTabBtn');
                    if(oTB) oTB.click();
                }
                break;
            case COMMANDS.route:
                if(this.selectedObj.length === 1 && this.selectedText.length === 0) {
                    const o = this.players[this.selectedObj[0]];
                    if(o.judgePoint(x, y)) {
                        this.startP = new Point(o.pos.x, o.pos.y);
                        const r = new Route(o, null, this.setting.lineColor, this.setting.lineKind, 0, [0, 0]);
                        o.route.push(r);
                        o.tempRoute = r;
                        r.addPoint(0, 0, this.setting.lineColor, this.setting.lineKind, this.setting.lineHead);
                    }else {
                        this.startP = new Point(x, y);
                        if(o.tempRoute) {
                            const p = Exchangers.rotate(x, y, -o.rot, o.pos.x, o.pos.y);
                            o.tempRoute.addPoint(p.x, p.y, this.setting.lineColor, this.setting.lineKind, this.setting.lineHead);
                            o.tempRoute.addPoint(p.x, p.y, this.setting.lineColor, this.setting.lineKind, this.setting.lineHead);
                        }
                    }
                }
                break;
            case COMMANDS.move:
                this.startP = new Point(x, y);
                break;
            case COMMANDS.relation:
                if(this.selectedObj.length === 1 && this.selectedText.length === 0) {
                    const z = this.selectedObj[0];
                    const a = this.judgeAt(x, y);
                    if(a === -1 || z === a) {
                        this.selectedObj = [];
                        this.players[z].selectMe(false);
                    }else {
                        const f = Math.min(this.players[z].id, this.players[a].id);
                        const t = Math.max(this.players[a].id, this.players[z].id)
                        if(this.setting.relKind === 0) {
                            for(let i=0;i<this.relations.length;i++) {
                                const r = this.relations[i];
                                if(r.from === f && r.to === t) {
                                    this.relations.splice(i, 1);
                                    this.updated();
                                    break;
                                }
                            }
                        }else {
                            this.relations.push({from: f, to: t, kind: this.setting.relKind, width: this.setting.relWidth, layerId: this.setting.relLayerId, color: this.setting.relColor, space: this.setting.relSpace});
                            this.updated();
                        }
                        this.players[z].selectMe(false);
                        this.selectedObj = [];
                    }
                }else if(this.selectedObj.length === 0 && this.selectedText.length === 0) {
                    const z = this.judgeAt(x, y);
                    if(z !== -1) {
                        this.players[z].selectMe(true);
                    }
                }else {
                    const flag = this.selectAt(x, y);
                }
                this.draw();
                break;
            case COMMANDS.grip:
                for(let i=0;i<this.selectedObj.length;i++) {
                    const o = this.players[this.selectedObj[i]];
                    const t = o.judgeRoute(x, y);
                    if(t) {
                        const r = t[0];
                        const n = t[1];
                        o.tempRoute = r;
                        this.tempRoute = r;
                        o.tempNum = n;
                        this.startP = new Point(x, y);
                        break;
                    }
                }
                break;
            case COMMANDS.erase:
                break;
            case COMMANDS.object:
                if(this.setting.objectLayerId !== "-1") {
                    if(this.setting.adaptBaseline[6]) {
                        for(let i=0;i<this.baselineV.length;i++) {
                            const v = this.baselineV[i] - x;
                            if(v >= -CONSTS.FEET && v <= CONSTS.FEET) {
                                x = this.baselineV[i];
                                break;
                            }
                        }
                        for(let i=0;i<this.baselineH.length;i++) {
                            const h = this.baselineH[i] - y;
                            if(h >= -CONSTS.FEET && h <= CONSTS.FEET) {
                                y = this.baselineH[i];
                                break;
                            }
                        }
                    }
                    if(this.setting.objectLayerId !== "-1") {
                        this.startP = new Point(x, y);
                        const o = this.addObj(x, y);
                        this.selectedObj = [this.players.length-1];
                        this.draw([o.layer]);
                        if(this.parent.tab === 2) {
                            const oTB = document.getElementById('objectTabBtn');
                            if(oTB) oTB.click();
                        }
                    }
                }
                break;
            case COMMANDS.text:
                this.startP = new Point(x, y);
                const text = this.setting.text;
                const t = this.addText(x, y);
                this.draw();
                break;
            case COMMANDS.line:
                this.startP = new Point(x, y);
                const ctx = this.uiCanvas;
                if(ctx) {
                    const ui = ctx.canvas;
                    ctx.save();
                    ctx.strokeStyle = "red";
                    ctx.clearRect(0, 0, ui.width, ui.height);
                    ctx.globalAlpha = 1;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    if(this.setting.baselineH) {
                        ctx.moveTo(0, y);
                        ctx.lineTo(ui.width, y);
                    }
                    if(this.setting.baselineV) {
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, ui.height);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
                break;
            default:
                break;
        }
    }
    mouseMove(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.select:
                if(this.startP) {
                    this.startP = null;
                    this.selectbox = null;
                }
                break;
            case COMMANDS.route:
                if(this.startP) {
                    this.mouseUp(x, y);
                    this.startP = null;
                }
                if(this.selectedObj.length === 1 && this.selectedText.length === 0) {
                    const o = this.players[this.selectedObj[0]];
                    if(o.tempRoute) {
                        const pos = o.tempRoute.pos;
                        if(pos.length === 2) {
                            const p1 = Exchangers.rotate(pos[0].x, pos[0].y, o.rot);
                            p1.x += o.pos.x;
                            p1.y += o.pos.y;
                            const p2 = Exchangers.rotate(pos[1].x, pos[1].y, o.rot);
                            p2.x += o.pos.x;
                            p2.y += o.pos.y;
                            const ctx = this.uiCanvas;
                            if(ctx) {
                                const cv = ctx.canvas;
                                ctx.save();
                                ctx.setLineDash([]);
                                if(this.setting.lineKind === 3) ctx.setLineDash([CONSTS.FEET/2, CONSTS.FEET/2]);
                                ctx.lineWidth = o.tempRoute.lineWidth;
                                ctx.beginPath();
                                ctx.clearRect(0, 0, cv.width, cv.height);
                                const color = new Color(0,0,0,1);
                                color.fromObj(this.setting.lineColor);
                                ctx.globalAlpha = color.alpha * 0.5;
                                ctx.strokeStyle = color.toString();
                                ctx.moveTo(p1.x, p1.y);
                                ctx.bezierCurveTo(p2.x, p2.y, x, y, x, y);
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                    }
                }
                break;
            case COMMANDS.move:
                break;
            case COMMANDS.relation:
                break;
            case COMMANDS.grip:
                break;
            case COMMANDS.erase:
                break;
            case COMMANDS.object:
                if(this.setting.objectLayerId !== "-1") {
                    if(this.setting.adaptBaseline[6]) {
                        for(let i=0;i<this.baselineV.length;i++) {
                            const v = this.baselineV[i] - x;
                            if(v >= -CONSTS.FEET && v <= CONSTS.FEET) {
                                x = this.baselineV[i];
                                break;
                            }
                        }
                        for(let i=0;i<this.baselineH.length;i++) {
                            const h = this.baselineH[i] - y;
                            if(h >= -CONSTS.FEET && h <= CONSTS.FEET) {
                                y = this.baselineH[i];
                                break;
                            }
                        }
                    }
                    this.tempObj.pos.x = x;
                    this.tempObj.pos.y = y;
                    this.tempObj.rot = this.setting.objectRot;
                    this.tempObj.setFlip(this.setting.isFlipped);
                    this.tempObj.setSize(this.setting.objectWidth, this.setting.objectHeight);
                    this.tempObj.image.lineColor.fromObj(this.setting.mainColor);
                    this.tempObj.image.fill.fromObj(this.setting.subColor);
                    this.tempObj.image.name = this.setting.symbolName;
                    this.tempObj.image.covered = this.setting.symbolCover;
                    this.tempObj.image.draw();
                    const ctx = this.uiCanvas;
                    if(ctx) {
                        const uiC = ctx.canvas;
                        ctx.clearRect(0, 0, uiC.width, uiC.height);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        this.tempObj.draw(ctx);
                        ctx.restore();
                    }
                }
                break;
            case COMMANDS.line:
                const ctx = this.uiCanvas;
                if(ctx) {
                    const ui = ctx.canvas;
                    ctx.save();
                    ctx.strokeStyle = "red";
                    ctx.clearRect(0, 0, ui.width, ui.height);
                    ctx.beginPath();
                    ctx.setLineDash([]);
                    ctx.globalAlpha = 1;
                    for(let i=0;i<this.baselineV.length;i++) {
                        ctx.moveTo(this.baselineV[i], 0);
                        ctx.lineTo(this.baselineV[i], ui.height);
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        ctx.moveTo(0, this.baselineH[i]);
                        ctx.lineTo(ui.width, this.baselineH[i]);
                    }
                    ctx.stroke();
                    ctx.globalAlpha = 0.4;
                    if(this.setting.baselineH) {
                        ctx.moveTo(0, y);
                        ctx.lineTo(ui.width, y);
                    }
                    if(this.setting.baselineV) {
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, ui.height);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
                break;
            default:
                break;
        }
    }
    leftDrag(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.select:
                if(this.setting.adaptBaseline[0]) {
                    for(let i=0;i<this.baselineV.length;i++) {
                        const v = this.baselineV[i] - x;
                        if(v >= -CONSTS.YARD && v <= CONSTS.YARD) {
                            x = this.baselineV[i];
                            break;
                        }
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        const h = this.baselineH[i] - y;
                        if(h >= -CONSTS.YARD && h <= CONSTS.YARD) {
                            y = this.baselineH[i];
                            break;
                        }
                    }
                }
                if(this.startP) {
                    if(this.selectbox) {
                        this.selectbox.x2 = x;
                        this.selectbox.y2 = y;
                    }else {
                        this.selectbox = {x1: this.startP.x, y1: this.startP.y, x2: x, y2: y};
                    }
                    this.selectIn(this.selectbox.x1, this.selectbox.y1, this.selectbox.x2, this.selectbox.y2);
                    this.draw();
                    const ctx = this.uiCanvas;
                    if(ctx) {
                        const cv = ctx.canvas;
                        ctx.save();
                        ctx.strokeStyle = "#000000";
                        ctx.clearRect(0, 0, cv.width, cv.height);
                        ctx.beginPath();
                        ctx.rect(this.selectbox.x1, this.selectbox.y1, this.selectbox.x2-this.selectbox.x1, this.selectbox.y2-this.selectbox.y1);
                        ctx.globalAlpha = 0.3;
                        ctx.setLineDash([2, 2]);
                        ctx.fillStyle = "#808080";
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    }
                    if(this.parent.tab === 2) {
                        const oTB = document.getElementById('objectTabBtn');
                        if(oTB) oTB.click();
                    }
                }
                break;
            case COMMANDS.route:
                if(this.startP) {
                    const o = this.players[this.selectedObj[0]];
                    const p = o.fixPoint(x, y);
                    if(o.tempRoute) {
                        if(o.tempRoute.pos.length === 2) {
                            o.tempRoute.pos[1] = p;
                        }else if(o.tempRoute.pos.length === 4) {
                            p.x = o.tempRoute.pos[3].x*2 - p.x;
                            p.y = o.tempRoute.pos[3].y*2 - p.y;
                            o.tempRoute.pos[2] = p;
                        }
                    }
                    const ctx = this.uiCanvas;
                    if(ctx) {
                        const cv = ctx.canvas;
                        ctx.save();
                        ctx.setLineDash([]);
                        ctx.clearRect(0, 0, cv.width, cv.height);
                        ctx.beginPath();
                        ctx.strokeStyle = "red";
                        ctx.lineWidth = 6;
                        ctx.moveTo(x, y);
                        ctx.lineTo(this.startP.x*2-x, this.startP.y*2-y);
                        ctx.stroke();
                        ctx.moveTo(this.startP.x, this.startP.y);
                        ctx.fillStyle = "white";
                        ctx.ellipse(this.startP.x, this.startP.y, 3, 3, 0, 0, Math.PI*2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
                break;
            case COMMANDS.move:
                if(this.setting.adaptBaseline[2]) {
                    for(let i=0;i<this.baselineV.length;i++) {
                        const v = this.baselineV[i] - x;
                        if(v >= -CONSTS.YARD && v <= CONSTS.YARD) {
                            x = this.baselineV[i];
                            break;
                        }
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        const h = this.baselineH[i] - y;
                        if(h >= -CONSTS.YARD && h <= CONSTS.YARD) {
                            y = this.baselineH[i];
                            break;
                        }
                    }
                }
                if(this.startP) {
                    const X = x - this.startP.x;
                    const Y = y - this.startP.y;
                    for(let i=0;i<this.selectedObj.length;i++) {
                        this.players[this.selectedObj[i]].pos.x += X;
                        this.players[this.selectedObj[i]].pos.y += Y;
                    }
                    for(let i=0;i<this.selectedText.length;i++) {
                        this.texts[this.selectedText[i]].pos[0] += X;
                        this.texts[this.selectedText[i]].pos[1] += Y;
                    }
                    this.startP.x = x;
                    this.startP.y = y;
                    this.draw();
                }
                break;
            case COMMANDS.grip:
                if(this.startP && this.tempRoute) {
                    const r = this.tempRoute;
                    const o = r.ancient;
                    const ps = Exchangers.rotate(x, y, o.rot, o.pos.x, o.pos.y);
                    const pe = Exchangers.rotate(this.startP.x, this.startP.y, o.rot, o.pos.x, o.pos.y);
                    const p = new Point(ps.x-pe.x, ps.y-pe.y);
                    switch(o.tempNum) {
                        case 0:
                            const pa = r.parent;
                            if(pa) {
                                pa.pos[3].x += p.x;
                                pa.pos[3].y += p.y;
                                pa.pos[2].x += p.x;
                                pa.pos[2].y += p.y;
                                for(let i=0;i<pa.children.length;i++) {
                                    const c = pa.children[i];
                                    c.pos[0].x += p.x;
                                    c.pos[0].y += p.y;
                                    c.pos[1].x += p.x;
                                    c.pos[1].y += p.y;
                                }
                            }
                            break;
                        case 1:
                            r.pos[1].x += p.x;
                            r.pos[1].y += p.y;
                            if(r.parent) {
                                r.parent.pos[2].x -= p.x;
                                r.parent.pos[2].y -= p.y;
                            }
                            break;
                        case 2:
                            if(r.pos[3].x === r.pos[2].x && r.pos[3].y === r.pos[2].y) {
                                r.pos[3].x += p.x;
                                r.pos[3].y += p.y;
                                r.pos[2].x += p.x;
                                r.pos[2].y += p.y;
                                for(let i=0;i<r.children.length;i++) {
                                    const c = r.children[i];
                                    c.pos[0].x += p.x;
                                    c.pos[0].y += p.y;
                                    c.pos[1].x += p.x;
                                    c.pos[1].y += p.y;
                                }
                            }else {
                                r.pos[2].x += p.x;
                                r.pos[2].y += p.y;
                                for(let i=0;i<r.children.length;i++) {
                                    const c = r.children[i];
                                    c.pos[1].x -= p.x;
                                    c.pos[1].y -= p.y;
                                }
                            }
                            break;
                        case 3:
                            r.pos[3].x += p.x;
                            r.pos[3].y += p.y;
                            r.pos[2].x += p.x;
                            r.pos[2].y += p.y;
                            for(let i=0;i<r.children.length;i++) {
                                const c = r.children[i];
                                c.pos[0].x += p.x;
                                c.pos[0].y += p.y;
                                c.pos[1].x += p.x;
                                c.pos[1].y += p.y;
                            }
                            break;
                    }
                    this.startP.x = x;
                    this.startP.y = y;
                }
                break;
            case COMMANDS.object:
                if(this.setting.adaptBaseline[6]) {
                    for(let i=0;i<this.baselineV.length;i++) {
                        const v = this.baselineV[i] - x;
                        if(v >= -CONSTS.FEET && v <= CONSTS.FEET) {
                            x = this.baselineV[i];
                            break;
                        }
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        const h = this.baselineH[i] - y;
                        if(h >= -CONSTS.FEET && h <= CONSTS.FEET) {
                            y = this.baselineH[i];
                            break;
                        }
                    }
                }
                if(this.startP) {
                    const o = this.players[this.selectedObj[0]];
                    o.pos.x = x;
                    o.pos.y = y;
                }
                break;
            case COMMANDS.line:
                if(this.startP) {
                    const ctx = this.uiCanvas;
                    if(ctx) {
                        const ui = ctx.canvas;
                        ctx.save();
                        ctx.strokeStyle = "red";
                        ctx.clearRect(0, 0, ui.width, ui.height);
                        ctx.globalAlpha = 1;
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        if(this.setting.baselineH) {
                            ctx.moveTo(0, y);
                            ctx.lineTo(ui.width, y);
                        }
                        if(this.setting.baselineV) {
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, ui.height);
                        }
                        ctx.stroke();
                        ctx.restore();
                    }
                }
                break;
            default:
                break;
        }
        this.draw();
    }
    rightDrag(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.route:
                break;
            default:
                break;
        }
    }
    mouseRight(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.text:
                let now: number = 0;
                let nt: TEXT|null = null;
                for(let i=0;i<this.texts.length;i++) {
                    const t = this.texts[i];
                    const n = this.indexOfLayerById(t.layer);
                    if(!this.layers[n].lock) {
                        const xx = x - t.pos[0];
                        const yy = y - t.pos[1];
                        const p = Exchangers.rotate(xx, yy, -t.angle);
                        if(p.x >= 0 && p.y >= 0 && p.x <= t.width && p.y <= t.size) {
                            if(now <= n) {
                                now = n;
                                nt = t;
                                console.log(xx, yy);
                            }
                        }
                    }
                }
                if(nt) {
                    if(this.setting.text === "") {
                        const j = this.texts.indexOf(nt);
                        this.texts.splice(j,1);
                    }else {
                        nt.string = this.setting.text;
                        nt.angle = this.setting.textRot;
                        nt.color = this.setting.textColor;
                        nt.bold = this.setting.textBold;
                        nt.italic = this.setting.textItalic;
                        nt.layer = this.setting.textLayerId;
                        nt.folder = this.setting.textFolderId;
                        nt.size = this.setting.textSize;
                    }
                    this.updated();
                }
                break;
            default:
                break;
        }
        this.draw();
    }
    mouseUp(x: number, y: number, shift: boolean = false): void {
        switch(this.command) {
            case COMMANDS.select:
                if(this.setting.adaptBaseline[0]) {
                    for(let i=0;i<this.baselineV.length;i++) {
                        const v = this.baselineV[i] - x;
                        if(v >= -CONSTS.YARD && v <= CONSTS.YARD) {
                            x = this.baselineV[i];
                            break;
                        }
                    }
                    for(let i=0;i<this.baselineH.length;i++) {
                        const h = this.baselineH[i] - y;
                        if(h >= -CONSTS.YARD && h <= CONSTS.YARD) {
                            y = this.baselineH[i];
                            break;
                        }
                    }
                }
                if(this.startP?.x === x && this.startP?.y === y) {
                    this.startP = null;
                    this.selectbox = null;
                    return;
                }
                this.startP = null;
                this.selectbox = null;
                const cv = document.getElementById("uiCanvas") as HTMLCanvasElement|null;
                if(cv) {
                    const ctx = cv.getContext("2d");
                    if(ctx) ctx.clearRect(0, 0, cv.width, cv.height);
                }
                break;
            case COMMANDS.route:
                if(this.selectedObj.length === 1 && this.selectedText.length === 0) {
                    const o = this.players[this.selectedObj[0]];
                    if(o.tempRoute) {
                        if(o.tempRoute.pos.length === 4) {
                            const x3x = o.tempRoute.pos[3].x;
                            const x2x = o.tempRoute.pos[2].x;
                            const y3y = o.tempRoute.pos[3].y;
                            const y2y = o.tempRoute.pos[2].y;
                            const xxx = x3x*2 - x2x;
                            const yyy = y3y*2 - y2y;
                            o.tempRoute.addPoint(x3x, y3y, this.setting.lineColor, this.setting.lineKind, this.setting.lineHead);
                            o.tempRoute.addPoint(xxx, yyy, this.setting.lineColor, this.setting.lineKind, this.setting.lineHead);
                        }
                    }
                }
                this.draw();
                this.parent.changed();
                this.updated();
                break;
            case COMMANDS.move:
                this.startP = null;
                this.selectbox = null;
                if(this.oldcom !== null) {
                    this.command = this.oldcom;
                    this.oldcom = null;
                }
                this.parent.changed();
                this.updated();
                break;
            case COMMANDS.relation:
                break;
            case COMMANDS.grip:
                this.startP = null;
                this.updated();
                break;
            case COMMANDS.erase:
                break;
            case COMMANDS.object:
                this.updated();
                break;
            case COMMANDS.text:
                break;
            case COMMANDS.line:
                if(this.startP) {
                    if(this.setting.baselineH) this.baselineH.push(y);
                    if(this.setting.baselineV) this.baselineV.push(x);
                    const ctx = this.uiCanvas;
                    if(ctx) {
                        const ui = ctx.canvas;
                        ctx.save();
                        ctx.strokeStyle = "red";
                        ctx.clearRect(0, 0, ui.width, ui.height);
                        ctx.beginPath();
                        ctx.setLineDash([]);
                        ctx.globalAlpha = 1;
                        for(let i=0;i<this.baselineV.length;i++) {
                            ctx.moveTo(this.baselineV[i], 0);
                            ctx.lineTo(this.baselineV[i], ui.height);
                        }
                        for(let i=0;i<this.baselineH.length;i++) {
                            ctx.moveTo(0, this.baselineH[i]);
                            ctx.lineTo(ui.width, this.baselineH[i]);
                        }
                        ctx.stroke();
                        ctx.restore();
                    }
                    this.parent.changed();
                    this.updated();
                }
                break;
            default:
                break;
        }
        this.startP = null;
    }

    addObj(x: number, y: number): Obj {
        for(let i=0;i<this.players.length;i++) {
            this.players[i].selectMe(false);
        }
        const cov = this.setting.symbolCover;
        const sym = this.setting.symbolName;
        let ans = new Obj(this, this.maxId, sym, this.setting.objectText, cov, sym);
        ans.symbol = sym;
        ans.rot = this.setting.objectRot;
        ans.layer = this.setting.objectLayerId;
        ans.folder = this.setting.objectFolderId;
        ans.image.lineColor.fromObj(this.setting.mainColor);
        ans.image.fill.fromObj(this.setting.subColor);
        ans.image.reverse = this.setting.isFlipped;
        ans.setSize(this.setting.objectWidth, this.setting.objectHeight);
        ans.image.draw();
        ans.selectMe();
        ans.pos.x = x;
        ans.pos.y = y;
        this.players.push(ans);
        this.parent.exHierarchy();
        this.parent.changed();
        this.objDic[this.maxId] = ans;
        this.maxId ++;
        return ans;
    }
    delObject(num: number) {
        this.players.splice(num, 1);
        this.parent.exHierarchy();
        this.parent.changed();
    }
    addText(x: number, y: number) {
        const t: TEXT = {
            pos: [x, y],
            string: this.setting.text,
            color: this.setting.textColor,
            size: this.setting.textSize,
            fontName: this.setting.fontName,
            angle: this.setting.textRot,
            layer: this.setting.textLayerId,
            folder: this.setting.textFolderId,
            bold: this.setting.textBold,
            italic: this.setting.textItalic,
            width: 0
        };
        if(this.setting.text !== "") {
            this.texts.push(t);
            this.parent.exHierarchy();
            this.parent.changed();
            this.updated();
        }
    }
    changeName(name: string) {
        const id = "play-tab-" + this.name;
        const e = document.getElementById(id) as HTMLInputElement|null;
        if(e) {
            e.id = "play-tab-" + name;
            e.value = name;
            const div = e.nextElementSibling;
            if(div) {
                const span = div.getElementsByTagName("span");
                if(span[0]) {
                    span[0].style.fontSize = "" + Exchangers.fontSize(name) + "px";
                    span[0].textContent = name;
                }
            }
        }
        this.name = name;
        this.parent.exHierarchy();
        this.parent.changed();
        this.updated();
    }


    loadLayer(obj: LAYER[]) {
        this.layers = obj.slice();
        for(let i=0;i<obj.length;i++) {
            const canvas = document.createElement("canvas");
            canvas.className = "layerCanvas";
            canvas.width = this.size.width;
            canvas.height = this.size.height;
            if(this.div) this.div.appendChild(canvas);
            this.canvas[obj[i].id] = canvas;
            const ctx = canvas.getContext('2d');
            if(ctx) this.ctxs[obj[i].id] = ctx;
        }
        this.setBack();
    }
    addLayer(name: string, no: number = -1): number {
        if(this.layers.length === 10) {
            alert('レイヤー数が上限に達しています。');
            return no;
        }
        if(name === "") name = "layer " + (this.maxLayer+1);
        if(this.indexOfLayer(name) !== -1) {
            alert('そのレイヤー名は既に使われています。');
            return no;
        }
        this.maxLayer += 1;
        if(no === -1) {
            this.layers.push({
                name: name,
                visible: true,
                lock: false,
                id: "" + this.maxLayer
            });
            const canvas = document.createElement("canvas");
            canvas.className = "layerCanvas";
            canvas.width = this.size.width;
            canvas.height = this.size.height;
            if(this.div !== null) {
                this.div.appendChild(canvas);
            }
            this.canvas["" + this.maxLayer] = canvas;
            const ctx = canvas.getContext('2d');
            if(ctx) this.ctxs["" + this.maxLayer] = ctx;
            no = this.layers.length-1;
        }else {
            this.layers.splice(no, 0, {
                name: name,
                visible: true,
                lock: false,
                id: "" + this.maxLayer
            });
            const canvas = document.createElement("canvas");
            canvas.className = "layerCanvas";
            canvas.width = this.size.width;
            canvas.height = this.size.height;
            if(this.div !== null) {
                this.div.appendChild(canvas);
            }
            this.canvas["" + this.maxLayer] = canvas;
            const ctx = canvas.getContext('2d');
            if(ctx) this.ctxs["" + this.maxLayer] = ctx;
            no = this.layers.length-1;
        }
        this.parent.makeLayerView();
        this.setBack();
        this.parent.changed();
        this.updated();
        return no;
    }
    changeLayer(n: number, v: string) {
        if(v !== "") {
            const i = this.indexOfLayer(v);
            if(i === -1) {
                this.layers[n].name = v;
                //その他 LAYER 操作
            }
        }
        this.parent.makeLayerView();
        this.parent.changed();
        this.updated();
    }
    delLayer(n: number): number {
        this.canvas[this.layers[n].id].style.display = "none";
        if(n > -1 && this.layers.length > 1 && !this.layers[n].lock) {
            this.layers.splice(n, 1);
            if(n >= this.layers.length) n = this.layers.length-1;
        }
        this.parent.makeLayerView();
        this.parent.changed();
        this.updated();
        return n;
    }
    insertLayer(from: number, to: number) {
        const l = this.layers[from];
        this.layers.splice(to, 0, l);
        if(from < to) this.layers.splice(from, 1);
        else this.layers.splice(from+1, 1);
        this.parent.makeLayerView();
        this.parent.changed();
        this.updated();
    }


    addFolder(name: string, no: number = -1) {
        this.maxFolder += 1;
        if(name === "") {
            name = "Folder " + this.maxFolder;
        }
        if(no === -1) {
            this.folders.push({
                name: name,
                id: "" + this.maxFolder
            });
            this.openedFolder.push(false);
        }else {
            this.folders.splice(no, 0, {
                name: name,
                id: "" + this.maxFolder
            });
            this.openedFolder.splice(no, 0, false);
        }
        this.parent.changed();
        this.updated();
    }
    changeFolder(n: number, s: string, div: HTMLElement) {
        if(s) {
            this.folders[n].name = s;
            div.textContent = s;
            const select = document.getElementById('commandSettingS4') as HTMLSelectElement|null;
            if(select) {
                const option = select.options.item(n);
                if(option) option.value = s;
            }
            const select2 = document.getElementById('commandSettingS6') as HTMLSelectElement|null;
            if(select2) {
                const option = select2.options.item(n);
                if(option) option.value = s;
            }
            this.parent.changed();
            this.updated();
        }else {
            alert('不正な値です');
        }
    }
    insertFolder(from: number, to: number) {
        const f = this.folders[from];
        const o = this.openedFolder[from];
        this.folders.splice(to, 0, f);
        this.openedFolder.splice(to, 0, o);
        if(from < to) {
            this.folders.splice(from, 1);
            this.openedFolder.splice(from, 1);
        }else {
            this.folders.splice(from+1, 1);
            this.openedFolder.splice(from+1, 1);
        }
        this.parent.exHierarchy();
        this.parent.changed();
        this.updated();
    }


    setSetting(name: number, no: number, value: number, color: string = "") {
        if(name === 0) {
            this.parameter[no] = value;
        }else if(name === 1) {
            this.feets[no] = value;
        }else {
            this.backColor.fromString(color);
        }
        this.setBack();
        this.parent.changed();
        this.updated();
    }
    setComSetting(kind: number, no: number, value: string, flag: boolean = false) {
        switch(kind) {
            case 0://Input
                switch(no) {
                    case 0:
                        if(this.parent.tab === 1) {
                            this.setting.objectRot = Number(value);
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.rot = Number(value);
                                o.image.draw();
                            }
                            this.draw();
                        }
                        break;
                    case 1:
                        this.setting.textRot = Number(value);
                        break;
                    case 2:
                        this.setting.text = value;
                        break;
                    case 3:
                        if(this.parent.tab === 1) {
                            this.setting.objectHeight = Number(value)*CONSTS.FEET;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                const h = Number(value) * CONSTS.FEET;
                                o.setSize(0, h);
                            }
                            this.draw();
                        }
                        break;
                    case 4:
                        if(this.parent.tab === 1) {
                            this.setting.objectWidth = Number(value)*CONSTS.FEET;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                const w = Number(value) * CONSTS.FEET;
                                o.setSize(w, 0);
                            }
                            this.draw();
                        }
                        break;
                    case 5:
                        if(this.parent.tab === 1) {
                            this.setting.gripKind = Number(value);
                        }
                        break;
                    case 6:
                        if(this.parent.tab === 1) {
                            this.setting.gripKind = Number(value);
                        }
                        break;
                    case 7:
                        if(this.parent.tab === 1) {
                            this.setting.objectText = value;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.setText(value);
                            }
                            this.draw();
                        }
                        break;
                    default:
                        break;
                }
                break;
            case 1://Color
                const c = new Color(0, 0, 0, 1);
                c.fromString(value);
                switch(no) {
                    case 0:
                        if(this.parent.tab === 1) {
                            this.setting.mainColor = c.toObj();
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.image.lineColor.fromString(value);
                                o.image.draw();
                            }
                            this.draw();
                        }
                        break;
                    case 1:
                        if(this.parent.tab === 1) {
                            this.setting.subColor = c.toObj();
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.image.fill.fromString(value);
                                o.image.draw();
                            }
                            this.draw();
                        }
                        break;
                    case 2:
                        this.setting.lineColor = c.toObj();
                        break;
                    case 3:
                        this.setting.textColor = c.toObj();
                        break;
                    case 4:
                        this.setting.relColor = c.toObj();
                        break;
                    default:
                        break;
                }
                break;
            case 2://Select
                switch(no) {
                    case 0:
                        this.setting.lineKind = Number(value);
                        break;
                    case 1:
                        this.setting.lineHead = Number(value);
                        break;
                    case 2:
                        this.setting.fontName = value;
                        break;
                    case 3:
                        if(this.parent.tab === 1) {
                            this.setting.objectLayerId = value;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.layer = value;
                            }
                            this.draw();
                        }
                        break;
                    case 4:
                        if(this.parent.tab === 1) {
                            this.setting.objectFolderId = value;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.folder = value;
                            }
                        }
                        break;
                    case 5:
                        if(this.parent.tab === 1) {
                            this.setting.textLayerId = value;
                        }else {
                            for(let i=0;i<this.selectedText.length;i++) {
                                const o = this.texts[this.selectedText[i]];
                                o.layer = value;
                            }
                            this.draw();
                        }
                        break;
                    case 6:
                        if(this.parent.tab === 1) {
                            this.setting.textFolderId = value;
                        }else {
                            for(let i=0;i<this.selectedText.length;i++) {
                                const o = this.texts[this.selectedText[i]];
                                o.folder = value;
                            }
                        }
                        break;
                    case 7:
                        this.setting.relKind = Number(value);
                        break;
                    case 8:
                        this.setting.relLayerId = value;
                        break;
                    case 9:
                        this.setting.relWidth = Number(value);
                        break;
                    case 10:
                        this.setting.relSpace = Number(value);
                        break;
                    case 11:
                        this.setting.textSize = Number(value);
                        break;
                    default:
                        break;
                }
                break;
            case 3://Checkbox
                switch(no) {
                    case 0:
                        if(this.parent.tab === 1) {
                            this.setting.isFlipped = flag;
                        }else {
                            for(let i=0;i<this.selectedObj.length;i++) {
                                const o = this.players[this.selectedObj[i]];
                                o.setFlip(flag);
                            }
                            this.draw();
                        }
                        break;
                    case 1:
                        this.setting.textBold = flag;
                        break;
                    case 2:
                        this.setting.textItalic = flag;
                        break;
                    case 3:
                        const divO = document.getElementById('deleteObjectSetting') as HTMLDivElement|null;
                        if(flag) {
                            if(divO) divO.className = "abledDiv";
                        }else {
                            if(divO) divO.className = "disabledDiv";
                        }
                        break;
                    case 4:
                        const divR = document.getElementById('deleteObjectSetting') as HTMLDivElement|null;
                        if(flag) {
                            if(divR) divR.className = "abledDiv";
                        }else {
                            if(divR) divR.className = "disabledDiv";
                        }
                        break;
                    case 5:
                        const divT = document.getElementById('deleteObjectSetting') as HTMLDivElement|null;
                        if(flag) {
                            if(divT) divT.className = "abledDiv";
                        }else {
                            if(divT) divT.className = "disabledDiv";
                        }
                        break;
                    case 6:
                        this.setting.baselineV = flag;
                        break;
                    case 7:
                        this.setting.baselineH = flag;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        this.parent.changed();
        this.updated();
    }
    setCanvasTab() {
        const div = document.getElementById('rightContCanvas');
        if(div) {
            const inputs = div.getElementsByTagName('input');
            for(let i=0;i<inputs.length;i++) {
                const e = inputs[i];
                if(i === inputs.length-1) {
                    e.value = this.backColor.toString();
                    break;
                }
                e.value = "" + this.feets[i];
            }
            const selects = div.getElementsByTagName('select');
            for(let i=0;i<selects.length;i++) {
                const e = selects[i];
                e.value = "" + this.parameter[i];
            }
        }
    }
    setBack() {
        this.setCanvasTab();
        let cx: number = 0;
        let cy: number = 0;
        const cw: number = CONSTS.FEET * 160;
        const ch: number = CONSTS.YARD * 100;
        let dy: number = 0;
        let dh: number = 0;
        this.size.width = cw;
        let campus: FRAMEC = {
            x: 0,
            y: 0,
            width: cw,
            height: CONSTS.YARD * this.feets[FEETS.yards]
        }
        this.size.height = campus.height;
        dh = campus.height;
        const bgNum = this.parameter[PARAM.yardline]*3 + this.parameter[PARAM.hashkind];
        const bgstr = CONSTS.BGSTRS[bgNum];
        const img = document.images.namedItem(bgstr);
        let dif: number = this.feets[FEETS.up] * CONSTS.FEET;
        campus.y += dif;
        cy += dif;
        this.size.height += dif;
        dif = this.feets[FEETS.left] * CONSTS.FEET;
        campus.x += dif;
        cx += dif;
        this.size.width += dif;
        dif = this.feets[FEETS.right] * CONSTS.FEET;
        this.size.width += dif;
        dif = this.feets[FEETS.down] * CONSTS.FEET;
        this.size.height += dif;
        dif = ch - campus.height - this.feets[FEETS.startwith] * CONSTS.YARD;
        cy -= dif;
        dy = campus.y;
        switch(this.parameter[PARAM.endzone]) {
            case 0:
                break;
            case 1:
                cy += 10*CONSTS.YARD;
                campus.y += 10*CONSTS.YARD;
                this.size.height += 20*CONSTS.YARD;
                dh += 20*CONSTS.YARD;
                break;
            case 2:
                cy += 10*CONSTS.YARD;
                campus.y += 10*CONSTS.YARD;
                this.size.height += 10*CONSTS.YARD;
                dh += 10*CONSTS.YARD;
                break;
            case 3:
                this.size.height += 10*CONSTS.YARD;
                dh += 10*CONSTS.YARD;
                break;
            default:
                break;
        }
        const back = document.getElementById("bgCanvas") as HTMLCanvasElement|null;
        const ui = document.getElementById("uiCanvas") as HTMLCanvasElement|null;
        const div = document.getElementById("canvas");
        if(back && ui && img && div) {
            const canvases = div.getElementsByTagName("canvas");
            for(let i=0;i<canvases.length;i++) {
                if(canvases[i] !== back && canvases[i] !== ui) canvases[i].style.display = "none";
                else canvases[i].style.display = "block";
            }
            const bc = back.getContext("2d");
            const uc = ui.getContext("2d");
            if(bc && uc) {
                div.style.width = "" + (this.size.width + 100) + "px";
                div.style.height = "" + this.size.height + "px";
                back.width = this.size.width;
                back.height = this.size.height;
                ui.width = this.size.width;
                ui.height = this.size.height;
                Object.keys(this.canvas).forEach(key => {
                    const c = this.canvas[key];
                    c.style.display = "block";
                    const ind = this.indexOfLayerById(key);
                    if(ind !== -1 && this.layers[ind].visible) c.style.zIndex = "" + (2+ind);
                    else c.style.display = "none";
                    c.width = this.size.width;
                    c.height = this.size.height;
                });
                bc.fillStyle = this.backColor.toString();
                bc.fillRect(0, 0, this.size.width, this.size.height);
                bc.lineWidth = this.parameter[PARAM.linewidth];
                bc.rect(campus.x+bc.lineWidth/2, dy+bc.lineWidth/2, campus.width-bc.lineWidth, dh-bc.lineWidth);
                bc.stroke();
                bc.beginPath();
                bc.rect(campus.x, campus.y, campus.width, campus.height);
                bc.clip();
                bc.drawImage(img, cx, cy, cw, ch);
                bc.stroke();
            }
        }
        this.draw();
    }
    setSVGBack(): SVGGElement {
        const ans = document.createElementNS("http://www.w3.org/2000/svg", "g");
        ans.id = "back";
        this.setCanvasTab();
        let cx: number = 0;
        let cy: number = 0;
        const cw: number = CONSTS.FEET * 160;
        const ch: number = CONSTS.YARD * 100;
        let dy: number = 0;
        let dh: number = 0;
        let campus: FRAMEC = {
            x: 0,
            y: 0,
            width: cw,
            height: CONSTS.YARD * this.feets[FEETS.yards]
        }
        dh = campus.height;
        const bgNum = this.parameter[PARAM.yardline]*3 + this.parameter[PARAM.hashkind];
        const bgstr = CONSTS.BGSTRS[bgNum];
        let dif: number = this.feets[FEETS.up] * CONSTS.FEET;
        campus.y += dif;
        cy += dif;
        this.size.height += dif;
        dif = this.feets[FEETS.left] * CONSTS.FEET;
        campus.x += dif;
        cx += dif;
        this.size.width += dif;
        dif = this.feets[FEETS.right] * CONSTS.FEET;
        this.size.width += dif;
        dif = this.feets[FEETS.down] * CONSTS.FEET;
        this.size.height += dif;
        dif = ch - campus.height - this.feets[FEETS.startwith] * CONSTS.YARD;
        cy -= dif;
        dy = campus.y;
        switch(this.parameter[PARAM.endzone]) {
            case 0:
                break;
            case 1:
                cy += 10*CONSTS.YARD;
                campus.y += 10*CONSTS.YARD;
                this.size.height += 20*CONSTS.YARD;
                dh += 20*CONSTS.YARD;
                break;
            case 2:
                cy += 10*CONSTS.YARD;
                campus.y += 10*CONSTS.YARD;
                this.size.height += 10*CONSTS.YARD;
                dh += 10*CONSTS.YARD;
                break;
            case 3:
                this.size.height += 10*CONSTS.YARD;
                dh += 10*CONSTS.YARD;
                break;
            default:
                break;
        }
        const col = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        col.setAttribute("width", "" + this.size.width);
        col.setAttribute("height", "" + this.size.height);
        col.style.fill = this.backColor.toString();
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const l = this.parameter[PARAM.linewidth];
        rect.style.strokeWidth = "" + l;
        rect.style.fillOpacity = "0";
        rect.setAttribute("x", "" + (campus.x + l/2));
        rect.setAttribute("y", "" + (dy + l/2));
        rect.setAttribute("width", "" + (campus.width-l));
        rect.setAttribute("height", "" + (dh-l));
        rect.style.stroke = "black";
        const clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        const crect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        crect.setAttribute("x", "" + campus.x);
        crect.setAttribute("y", "" + campus.y);
        crect.setAttribute("width", "" + campus.width);
        crect.setAttribute("height", "" + campus.height);
        clip.appendChild(crect);
        const hrect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        hrect.setAttribute("x", "" + campus.x);
        hrect.setAttribute("y", "" + campus.y);
        hrect.setAttribute("width", "" + campus.width);
        hrect.setAttribute("height", "" + campus.height);
        hrect.style.stroke = "black";
        hrect.style.strokeWidth = "" + l;
        hrect.style.fillOpacity = "0";
        hrect.setAttribute("clip-path", "url(#backclip)");
        clip.id = "backclip";
        const img = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        img.appendChild(svg);
        svg.setAttribute("viewBox", "0 0 800 1500");
        svg.setAttribute("x", "" + cx);
        svg.setAttribute("y", "" + cy);
        svg.setAttribute("width", "800");
        svg.setAttribute("height", "1500");
        img.setAttribute("clip-path", "url(#backclip)");
        ans.appendChild(col);
        ans.appendChild(rect);
        ans.appendChild(clip);
        ans.appendChild(img);
        ans.appendChild(hrect);
        svg.innerHTML = backSVGs[bgstr];
        ans.addEventListener("click", (e) => {
            this.updateSVGA();
        });
        return ans;
    }
    setSVGLayer(svg: SVGSVGElement, animation: boolean = false, display: boolean = true) {
        let ls: {[name: string]: SVGGElement} = {};
        for(let i=0;i<this.layers.length;i++) {
            const l = this.layers[i];
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.id = l.name;
            if(!l.visible) g.style.display = "none";
            ls[l.id] = g;
            svg.appendChild(g);
        }
        for(let i=0;i<this.players.length;i++) {
            const o = this.players[i];
            const s = o.toSVG(animation);
            s.addEventListener("click", (e) => {
                this.clickSVGA(i, true);
            });
            ls[o.layer].appendChild(s);
        }
        for(let i=0;i<this.texts.length;i++) {
            const t = this.texts[i];
            const c = new Color(1,1,1,1);
            c.fromObj(t.color);
            const s = document.createElementNS("http://www.w3.org/2000/svg", "text");
            s.id = "text-" + i;
            s.style.fill = c.toString();
            s.style.fontFamily = t.fontName;
            s.style.fontSize = "" + t.size + "px";
            s.setAttribute("x", "" + t.pos[0]);
            s.setAttribute("y", "" + (t.pos[1]+t.size));
            s.setAttribute("transform", "rotate(" + t.angle + "," + t.pos[0] + "," + t.pos[1] + ")");
            s.textContent = t.string;
            ls[t.layer].appendChild(s);
        }
        for(let i=0;i<this.players.length;i++) {
            const o = this.players[i];
            for(let j=0;j<o.route.length;j++) {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.id = "g-route-" + o.id + "-" + j;
                const r = o.route[j];
                r.toSVG(g, o.pos, o.rot, o.id, JSON.stringify([j]));
                ls[o.layer].appendChild(g);
            }
        }
        for(let i=0;i<this.relations.length;i++) {
            //
        }
        this.updateSVGA();
    }
    updateSVGA() {
        for(let i=0;i<this.players.length;i++) {
            this.clickSVGA(i);
            const o = this.players[i];
            const id = o.mainRouteId;
            this.selectSVGA(id);
        }
    }
    clickSVGA(n: number, flag: boolean = false) {
        const o = this.players[n];
        for(let i=0;i<o.route.length;i++) {
            const r = o.route[i];
            r.displaySVG(flag, n, "[" + i + "]");
        }
    }
    selectSVGA(id: string) {
        const ary = id.split("-");
        let now = "path-route";
        let o: Element|null = null;
        let old = "animatecontroller";
        for(let i=0;i<ary.length;i++) {
            now += "-" + ary[i];
            if(i === 0) {
                const oid = "g-obj-" + ary[i];
                const oo = document.getElementById(oid);
                if(oo) {
                    o = oo;
                    const x = o.firstChild;
                    if(x) {
                        o.innerHTML = "";
                        o.appendChild(x);
                    }
                }
            }else {
                const path = document.getElementById(now);
                if(path) path.style.display = "block";
                if(o) {
                    const a = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
                    const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
                    mpath.setAttribute("xlink:href", "#" + now);
                    a.id = "animation" + now.replace("path-route", "").replace(/-/g, "_");
                    if(old !== "animatecontroller") a.setAttribute("begin", old + ".end");
                    else a.setAttribute("begin", "animationbegin.click");
                    a.setAttribute("dur", "2s");
                    a.appendChild(mpath);
                    o.appendChild(a);
                    old = a.id;
                }
            }
        }
        const head = document.getElementById("path-head-" + id);
        if(head) head.style.display = "block";
    }

    makeHierarchy(n: number): HIERARCHY {
        let children: HIERARCHY[] = [];
        let items: {[name: string]: HIERARCHY[]} = {};
        for(let i=0;i<this.folders.length;i++) {
            items[this.folders[i].id] = [];
        }
        for(let i=0;i<this.players.length;i++) {
            const rou = this.players[i].makeHierarchy("" + n + "," + i);
            items[this.players[i].folder].push({text: this.players[i].name, kind: ITEMKIND.player, children: rou, num: "" + n + "," + i, open: this.players[i].opened});
        }
        for(let i=0;i<this.texts.length;i++) {
            items[this.texts[i].folder].push({text: this.texts[i].string, kind: ITEMKIND.text, children: [], num: "" + n + "," + i, open: false});
        }
        for(let i=0;i<this.folders.length;i++) {
            children.push({text: this.folders[i].name, kind: ITEMKIND.folder, children: items[this.folders[i].id], num: "" + n + "," + i, open: this.openedFolder[i]});
        }
        let ans: HIERARCHY = {text: this.name, kind: ITEMKIND.play, children: children, num: "" + n, open: this.opened};
        return ans;
    }

    stamp(op_num: OPERATION, content: string) {
        const date = new Date();
        const ans = new HISTORY(this.now, date);
    }
    toHistory(): string {
        const players: ObjC[] = [];
        for(let i=0;i<this.players.length;i++) {
            const o = this.players[i];
            players.push(o.toObj());
        }
        let ans: PlayHistory = {
            name: this.name,
            players: players,
            backColor: this.backColor,
            texts: this.texts,
            parameter: this.parameter,
            feets: this.feets,
            folders: this.folders,
            layers: this.layers,
            selectedObj: this.selectedObj,
            selectedText: this.selectedText,
            relations: this.relations,
            maxLayer: this.maxLayer
        }
        return JSON.stringify(ans);
    }
    fromHistory(from: string) {
        const obj = JSON.parse(from) as PlayHistory;
        this.name = obj.name;
        this.backColor.fromObj(obj.backColor);
        this.parameter = obj.parameter;
        this.feets = obj.feets;
        this.texts = obj.texts;
        this.relations = obj.relations;
        this.maxLayer = obj.maxLayer;
        this.players = [];
        for(let i=0;i<obj.players.length;i++) {
            this.players[i] = new Obj(this, 0, "", "");
            this.players[i].fromObj(obj.players[i]);
            this.objDic[this.players[i].id] = this.players[i];
        }
    }

    fromObj(obj: PlayC): void {
        this.name = obj.name;
        this.backColor = new Color(0, 0, 0, 1);
        this.backColor.fromObj(obj.backColor);
        this.parameter = obj.para;
        this.feets = obj.fts;
        if(obj.los) this.los = obj.los;
        if(obj.texts) this.texts = obj.texts;
        if(obj.relations) this.relations = obj.relations;
        if(obj.maxLayer) this.maxLayer = obj.maxLayer;
        if(obj.maxFolder) this.maxFolder = obj.maxFolder;
        if(obj.layers) this.loadLayer(obj.layers);
        if(obj.folders) this.folders = obj.folders;
        if(obj.setting) this.setting = obj.setting;
        if(obj.openedFolder) this.openedFolder = obj.openedFolder;
        if(obj.opened) this.opened = obj.opened;
        if(obj.baselineH) this.baselineH = obj.baselineH;
        if(obj.baselineV) this.baselineV = obj.baselineV;
        if(obj.maxId) this.maxId = obj.maxId;
        let imgs: Promise<HTMLImageElement>[] = [];
        if(obj.images) for(let i=0;i<obj.images.length;i++) {
            const name = obj.images[i].name;
            const data = obj.images[i].data;
            imgs[i] = Exchangers.data2Img(name, data);
        }
        this.players = [];
        for(let i=0;i<obj.players.length;i++) {
            this.players[i] = new Obj(this, 0, obj.players[i].name, obj.players[i].text);
            this.players[i].fromObj(obj.players[i]);
            this.objDic[this.players[i].id] = this.players[i];
        }
        Promise.all(imgs).then((res) => {
            for(let i=0;i<res.length;i++) {
                this.images[i] = res[i];
            }
        }).catch((res) => {
            this.images = [];
        });
    }
    toObj(): PlayC {
        let objC: ObjC[] = new Array();
        for(let i=0;i<this.players.length;i++) {
            objC[i] = this.players[i].toObj();
        }
        let imagesC: IMAGE_DATA[] = new Array();
        for(let i=0;i<this.images.length;i++) {
            imagesC[i] = {
                name: this.images[i].name,
                data: Exchangers.img2Data(this.images[i], imageTypeText[IMAGETYPE.pdf])
            };
        }
        let ans: PlayC = {
            name: this.name,
            players: objC,
            backColor: this.backColor.toObj(),
            para: this.parameter,
            fts: this.feets,
            los: this.los,
            texts: this.texts,
            images: imagesC,
            relations: this.relations,
            setting: this.setting,
            maxLayer: this.maxLayer,
            maxFolder: this.maxFolder,
            folders: this.folders,
            layers: this.layers,
            opened: this.opened,
            openedFolder: this.openedFolder,
            baselineH: this.baselineH,
            baselineV: this.baselineV,
            maxId: this.maxId
        };
        return ans;
    }
    open(): void {
        for(let i=0;i<this.layers.length;i++) {
            const name = this.layers[i];
        }
    }

    updated() {
        this.tempNow ++;
        this.tempHistory.splice(this.tempNow, this.tempHistory.length-this.tempNow);
        this.tempHistory.push(this.toObj());
        console.log(this.toObj());
    }
    undo() {
        if(this.tempNow > 0) {
            this.tempNow --;
            this.fromObj(this.tempHistory[this.tempNow]);
        }
        this.setBack();
    }
    redo() {
        if(this.tempNow < this.tempHistory.length-1) {
            this.tempNow ++;
            this.fromObj(this.tempHistory[this.tempNow]);
        }
        this.setBack();
    }
    toBRP() {
        const u = URL.createObjectURL(new Blob([JSON.stringify(this.toObj())], {
            type: "text/plain"
        }));
        const a = document.createElement("a");
        a.href = u;
        a.download = this.name + ".brp";
        a.click();
    }
    toImage(type: IMAGETYPE) {
        let cv = document.createElement("canvas");
        const back = document.getElementById("bgCanvas") as HTMLCanvasElement;
        const ctx = cv.getContext("2d");
        cv.width = this.size.width;
        cv.height = this.size.height;
        if(ctx && back) {
            ctx.drawImage(back, 0, 0);
            for(let i=0;i<this.layers.length;i++) {
                const l = this.layers[i];
                if(l.visible) {
                    ctx.drawImage(this.canvas[l.id],0,0);
                }
            }
        }
        const a = document.createElement("a");
        switch(type) {
            case IMAGETYPE.gif:
                a.href = cv.toDataURL("image/gif");
                a.download = this.name + ".gif";
                break;
            case IMAGETYPE.jpeg:
                a.href = cv.toDataURL("image/jpeg");
                a.download = this.name + ".jpeg";
                break;
            case IMAGETYPE.pdf:
                a.href = this.toPDF();
                a.download = this.name + ".pdf";
                break;
            case IMAGETYPE.png:
                a.href = cv.toDataURL("image/png");
                a.download = this.name + ".png";
                break;
            case IMAGETYPE.svg:
                a.href = URL.createObjectURL(new Blob([this.toSVG().outerHTML], {
                    "type": "text/plain"
                }));
                a.download = this.name + ".svg";
                break;
            default:
                break;
        }
        a.click();
    }
    animate(time: number = 0) {
        let count = time;
        while(count > -1) {
            count = this.drawMoment(count);
        }
    }
    drawMoment(time: number): number {
        let flag = false;
        for(let i=0;i<this.players.length;i++) {
            const p = this.players[i];
            if(p.drawMoment(time)) flag = true;
        }
        if(flag) return (time+0.02);
        return -1;
    }
    toSVG(animation: boolean = false, display: boolean = false): SVGSVGElement {
        const ans = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        ans.style.width = "" + this.size.width;
        ans.style.height = "" + this.size.height;
        ans.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        ans.setAttribute("viewBox", "0 0 " + this.size.width + " " + this.size.height);
        const c = this.setSVGBack();
        ans.appendChild(c);
        this.setSVGLayer(ans, animation, display);
        if(animation) {
            const ab = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ab.setAttribute("r", "40");
            ab.id = "animationbegin";
            ans.appendChild(ab);
            /*const cont = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            cont.id = "animatecontroller";
            cont.setAttribute("begin", "animationbegin.click");
            cont.setAttribute("dur", "1s");
            ans.appendChild(cont);*/
            this.updateSVGA();
        }
        return ans;
    }
    toPDF(): string {
        const svg = this.toSVG();
        const pdf = svg2pdf(svg);
        return pdf.output("datauristring");
    }
}


/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////


                                              PlayList


//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/

export class PlayList {
    name: string;
    plays: Play[] = [];
    setting: Setting = {
        newPlayflag: true,
        playName: "Play ",
        zeroNum: 0,
        parameter: [0,0,0,2],
        feets: [0,0,0,0, 30, 0],
        bgColor: {
            red: 1,
            green: 1,
            blue: 1,
            alpha: 1
        }
    };
    maxPlay:number = 1;
    images: HTMLImageElement[] = [];
    opened: boolean = true;
    imageDrag: boolean = false;
    hierarchyDrag: boolean = false;
    draggingText: string|null = null;
    layerDrag: boolean = false;
    dragLayer: number|null = null;
    tab: number = 0;
    displayed: Play|null = null;
    oPlays: Play[] = [];
    selftab: number = 0;
    history: HISTORY[] = [];
    deletedPlay: Play[] = [];
    tempHistory: PlayListC[] = [];

    constructor(name: string) {
        this.name = name;
        this.exHierarchy();
        this.changed();
        this.tempHistory.push(this.toObj());
    }

    toBRL() {
        const u = URL.createObjectURL(new Blob([JSON.stringify(this.toObj())], {
            type: "text/plain"
        }));
        const a = document.createElement("a");
        a.href = u;
        a.download = this.name + ".brl";
        a.click();
    }

    changed() {
        sessionStorage.setItem("Ballust_Playlist", JSON.stringify(this.toObj()));
    }
    updated() {
        this.tempHistory.push(this.toObj());
    }
    undo() {
        if(this.displayed) {
            this.displayed.undo();
        }
    }
    redo() {
        if(this.displayed) {
            this.displayed.redo();
        }
    }

    makePlay(name: string, para?: number[], fts?: number[]): Play {
        let play: Play;
        let real: string;
        if(name === "") {
            name = this.setting.playName + Exchangers.formatDigit(this.maxPlay, this.setting.zeroNum);
            let i = 0;
            while(true) {
                if(i > 0) real =  name + " (" + i + ")";
                else real = name;
                const e = document.getElementById('hierarchy-play-' + name);
                if(!e) break;
                i++;
            }
            play = new Play(this, real, this.setting.parameter.slice(), this.setting.feets.slice());
        }else {
            real = name;
            play = new Play(this, real, para ?? this.setting.parameter.slice(), fts ?? this.setting.feets.slice());
        }
        play.addLayer("");
        play.addFolder("Object");
        play.addFolder("Text");
        this.maxPlay ++;
        this.plays.push(play);
        this.exHierarchy();
        Menues.openPlayByNexttab(real, this);
        this.changed();
        return play;
    }
    insertPlay(from: number, to: number) {
        const p = this.plays[from];
        this.plays.splice(to, 0, p);
        if(from < to) this.plays.splice(from, 1);
        else this.plays.splice(from+1, 1);
        this.exHierarchy();
        this.changed();
    }
    getPlay(name: string): Play|null {
        for(let i=0;i<this.plays.length;i++) {
            if(this.plays[i].name === name) return this.plays[i];
        }
        return null;
    }
    delPlay(num: number) {
        const pt = document.getElementById("playTabsDiv");
        const div = document.getElementById("play-tab-" + this.plays[num].name);/*
        if(pt && div) {
            const pN = div.parentNode;
            if(pN) pt.removeChild(pN);
        }
        const op = this.oPlays.indexOf(this.plays[num]);
        if(op > -1) {
            this.oPlays.splice(op, 1);
        }*/
        if(div) {
            const pE = div.parentElement;
            if(pE) {
                const d = pE.getElementsByTagName("div");
                if(d.length > 0) {
                    const b = d[0].getElementsByClassName("batsu");
                    if(b.length > 0) {
                        (b[0] as HTMLElement).click();
                    }
                }
            }
        }
        this.deletedPlay.push(this.plays[num]);
        this.plays.splice(num, 1);
        this.exHierarchy();
        this.changed();
    }
    changePlay(no: number, name: string): Play | null {
        const play = this.plays[no];
        for(let i=0;i<this.plays.length;i++) {
            if(i != no && this.plays[i].name === name) {
                return null;
            }
        }
        this.plays[no].name = name;
        this.exHierarchy();
        this.changed();
        return play;
    }
    changeName(name: string) {
        const id = "playlist-setting-tab";
        const c = document.getElementById(id) as HTMLInputElement|null;
        const i = document.getElementById("playlist-name") as HTMLInputElement|null;
        if(c && i) {
            c.value = name;
            i.value = name;
            const div = c.nextElementSibling;
            if(div) {
                const span = div.getElementsByTagName("span");
                if(span[0]) {
                    span[0].style.fontSize = "" + Exchangers.fontSize(name) + "px";
                    span[0].textContent = name;
                }
            }
        }
        this.name = name;
        this.exHierarchy();
        this.changed();
    }

    setSetting(n: number, it: number, v: string, flag: boolean = false) {
        switch(n) {
            case 0://color
                switch(it) {
                    case 0:
                        break;
                    default:
                        break;
                }
                break;
            case 1://Input
                switch(it) {
                    case 0:
                        break;
                    default:
                        break;
                }
                break;
            case 2://Select
                switch(it) {
                    case 0:
                        break;
                    case 4:
                        break;
                    default:
                        break;
                }
                break;
            case 3://Checkbox
                switch(it) {
                    case 0:
                        const nPfF = document.getElementById('newPlayflagField');
                        if(nPfF) {
                            if(flag) nPfF.className = "disabledDiv";
                            else nPfF.className = "abledDiv";
                            this.setting.newPlayflag = flag;
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        this.changed();
    }



    makeHierarchy(): HIERARCHY {
        let children: HIERARCHY[] = [];
        for(let i=0;i<this.plays.length;i++) {
            children.push(this.plays[i].makeHierarchy(i));
        }
        let ans: HIERARCHY = {text: this.name, kind: ITEMKIND.playlist, children: children, num: "0", open: this.opened};
        return ans;
    }
    getHierarchy(): HTMLElement {
        const h = this.makeHierarchy();
        let ans = this.H2(h);
        return ans;
    }
    H2(h: HIERARCHY): HTMLElement {
        const ids = ["playlistsummarybtn", "playsummarybtn", "foldersummarybtn", "objsummarybtn", "txtsummarybtn"];
        const ans = document.createElement('label');
        const num = h.num.split(",");
        const text = document.createElement('input');
        text.type = "text";
        text.style.position = "absolute";
        text.style.left = "0px";
        text.style.width = "194px";
        text.style.padding = "3px 4px";
        text.style.display = "none";
        text.style.top = "0px";
        text.placeholder = h.text;
        text.style.outline = "none";
        text.addEventListener('blur', ()=>{
            text.style.display = "none";
        });
        switch(h.kind) {
            case ITEMKIND.playlist:
                const pl_check = document.createElement('input');
                pl_check.type = "checkbox";
                pl_check.className = "hierarchycheck";
                const pl_div = document.createElement('div');
                pl_div.textContent = h.text;
                pl_div.className = "hierarchyPlaylist";
                const pl_radio = document.createElement('input');
                pl_radio.type = "radio";
                pl_radio.name = "hierarchySelected";
                pl_radio.className = "hierarchyRadio";
                pl_radio.value = h.num;
                pl_div.addEventListener('click',(e)=>{
                    if(e.x <= 17) {
                        e.preventDefault();
                        const x = pl_child.style.display;
                        if(x === "block") {
                            pl_child.style.display = "none";
                            pl_check.checked = false;
                            this.opened = false;
                        }
                        else {
                            pl_child.style.display = "block";
                            pl_check.checked = true;
                            this.opened = true;
                        }
                        this.changed();
                    }else if(pl_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                pl_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!pl_radio.checked) pl_radio.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 0) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                text.addEventListener('change', ()=>{
                    this.changeName(text.value);
                    text.blur();
                });
                pl_div.addEventListener('dragover', (e)=>{
                    const num = this.draggingText;
                    if(num) {
                        const sp = num.split(",");
                        if(sp[0] === "1") {
                            pl_div.style.borderBottom = "1px solid red";
                        }
                    }
                });
                pl_div.addEventListener('dragleave',()=>{
                    pl_div.style.border = "";
                });
                pl_div.addEventListener('dragend', ()=>{
                    pl_div.style.borderBottom = "";
                });
                pl_div.addEventListener('drop',()=>{
                    const num = this.draggingText;
                    if(num) {
                        const sp = num.split(",");
                        if(sp[0] === "1") {
                            const from = Number(sp[1]);
                            this.insertPlay(from, 0);
                        }
                    }
                });
                const pl_child = document.createElement('div');
                pl_check.checked = h.open;
                if(h.open) pl_child.style.display = "block";
                else pl_child.style.display = "none";
                for(let i=0;i<h.children.length;i++) {
                    pl_child.appendChild(this.H2(h.children[i]));
                }
                pl_div.appendChild(text);
                ans.appendChild(pl_radio);
                ans.appendChild(pl_check);
                ans.appendChild(pl_div);
                ans.appendChild(pl_child);
                break;
            case ITEMKIND.play:
                const py_check = document.createElement('input');
                py_check.type = "checkbox";
                py_check.className = "hierarchycheck";
                const py_div = document.createElement('div');
                py_div.className = "hierarchyPlay";
                py_div.textContent = h.text;
                const py_radio = document.createElement('input');
                py_div.id = "hierarchy-play-" + h.text;
                py_radio.name = "hierarchySelected";
                py_radio.type = "radio";
                py_radio.className = "hierarchyRadio";
                py_radio.value = h.num;
                const py_child = document.createElement('div');
                py_div.draggable = true;
                py_div.addEventListener('click',(e)=>{
                    if(e.x >= 6 && e.x <= 23) {
                        e.preventDefault();
                        const x = py_child.style.display;
                        if(x === "block") {
                            py_child.style.display = "none";
                            py_check.checked = false;
                            this.plays[Number(num[0])].opened = false;
                        }
                        else {
                            py_child.style.display = "block";
                            py_check.checked = true;
                            this.plays[Number(num[0])].opened = true;
                        }
                        this.changed();
                    }else if(py_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                text.addEventListener('change', ()=>{
                    this.plays[Number(num[0]) ?? 0].changeName(text.value);
                    text.blur();
                });
                py_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!py_radio.checked) py_div.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 1) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                py_div.addEventListener('dragstart', (e) => {
                    this.draggingText = "" + h.kind + "," + h.num;
                    this.hierarchyDrag = true;
                });
                py_div.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if(this.hierarchyDrag) {
                        const data = this.draggingText;
                        if(data) {
                            const sp = data.split(",");
                            if(sp[0] === "1") {
                                const rect = py_div.getBoundingClientRect();
                                if(e.clientY-rect.top <= rect.height/2) {
                                    py_div.style.borderTop = "1px solid red";
                                    py_div.style.borderBottom = "";
                                    py_child.style.borderBottom = "";
                                }else if(py_child.style.display === "block") {
                                    py_div.style.borderTop = "";
                                    py_div.style.borderBottom = "";
                                    py_child.style.borderBottom = "1px solid red";
                                }else {
                                    py_div.style.borderBottom = "1px solid red";
                                    py_div.style.borderTop = "";
                                    py_child.style.borderBottom = "";
                                }
                            }
                        }
                    }
                });
                py_div.addEventListener('dragleave', (e) => {
                    py_div.style.borderBottom = "";
                    py_div.style.borderTop = "";
                    py_child.style.borderBottom = "";
                });
                py_div.addEventListener('dragend', (e) => {
                    this.hierarchyDrag = false;
                    py_div.style.borderBottom = "";
                    py_div.style.borderTop = "";
                    py_child.style.borderBottom = "";
                });
                py_div.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const num = this.draggingText;
                    const rect = py_div.getBoundingClientRect();
                    if(this.hierarchyDrag && num) {
                        const sp = num.split(",");
                        if(sp[0] === "1") {
                            const from = Number(sp[1]);
                            let to = Number(h.num);
                            if(e.clientY-rect.top > rect.height/2) to ++;
                            this.insertPlay(from, to);
                        }
                    }
                    this.hierarchyDrag = false;
                    this.draggingText = null;
                });
                py_child.addEventListener('dragover', (e)=>{
                    const num = this.draggingText;
                    if(num && this.hierarchyDrag) {
                        const sp = num.split(",");
                        if(sp[0] === "1") {
                            py_child.style.borderBottom = "1px solid red";
                            py_div.style.border = "";
                        }
                    }
                });
                py_child.addEventListener('dragleave',()=>{
                    py_child.style.borderBottom = "";
                });
                py_child.addEventListener('dragend',()=>{
                    py_child.style.borderBottom = "";
                    this.hierarchyDrag = false;
                });
                py_child.addEventListener('drop', (e) => {
                    py_child.style.borderBottom = "";
                    const num = this.draggingText;
                    if(num && this.hierarchyDrag) {
                        const sp = num.split(",");
                        if(sp[0] === "1") {
                            const to = (Number(h.num.split(",")[0]) ?? 0) + 1;
                            const from = Number(sp[1]);
                            this.insertPlay(from, to);
                        }
                    }
                    this.hierarchyDrag = false;
                    this.draggingText = null;
                    this.changed();
                });
                py_check.checked = h.open;
                if(h.open) py_child.style.display = "block";
                else py_child.style.display = "none";
                for(let i=0;i<h.children.length;i++) {
                    py_child.appendChild(this.H2(h.children[i]));
                }
                py_div.appendChild(text);
                ans.appendChild(py_radio);
                ans.appendChild(py_check);
                ans.appendChild(py_div);
                ans.appendChild(py_child);
                break;
            case ITEMKIND.folder:
                const f_check = document.createElement('input');
                f_check.type = "checkbox";
                f_check.className = "hierarchycheck";
                const f_div = document.createElement('div');
                f_div.className = "hierarchyFolder";
                f_div.draggable = true;
                const f_radio = document.createElement('input');
                f_radio.name = "hierarchySelected";
                f_radio.className = "hierarchyRadio";
                f_radio.type = "radio";
                f_radio.value = h.num;
                f_div.textContent = h.text;
                const f_child = document.createElement('div');
                f_div.addEventListener('click',(e)=>{
                    if(e.x >= 12 && e.x <= 29) {
                        const x = f_child.style.display;
                        if(x === "block") {
                            f_child.style.display = "none";
                            f_check.checked = false;
                            this.plays[Number(num[0])].openedFolder[Number(num[1]) ?? 0] = false;
                        }
                        else {
                            f_child.style.display = "block";
                            f_check.checked = true;
                            this.plays[Number(num[0])].openedFolder[Number(num[1]) ?? 0] = true;
                        }
                        this.changed();
                    }else if(f_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                text.addEventListener('change', ()=>{
                    this.plays[Number(num[0])].changeFolder(Number(num[1]), text.value, f_div);
                    this.plays[Number(num[0])].folders[Number(num[1]) ?? 0].name = text.value;
                    f_div.textContent = text.value;
                    text.blur();
                });
                f_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!f_radio.checked) f_div.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 2) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                f_div.addEventListener('dragstart', (e)=>{
                    this.hierarchyDrag = true;
                    this.draggingText = "" + h.kind + "," + h.num;
                });
                f_div.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if(this.hierarchyDrag) {
                        const data = this.draggingText;
                        if(data) {
                            const sp = data.split(",");
                            const play = h.num.split(",")[0];
                            if(sp[0] === "5" && sp[1] === play) {
                                const rect = f_div.getBoundingClientRect();
                                if(e.clientY-rect.top <= rect.height/2) {
                                    f_div.style.borderTop = "1px solid red";
                                    f_div.style.borderBottom = "";
                                    f_child.style.borderBottom = "";
                                }else if(f_child.style.display === "block") {
                                    f_div.style.border = "";
                                    f_child.style.borderBottom = "1px solid red";
                                }else {
                                    f_div.style.borderBottom = "1px solid red";
                                    f_div.style.borderTop = "";
                                    f_child.style.borderBottom = "";
                                }
                            }
                        }
                    }
                });
                f_div.addEventListener('dragleave', ()=>{
                    f_div.style.border = "";
                    f_child.style.borderBottom = "";
                });
                f_div.addEventListener('dragend', ()=>{
                    this.hierarchyDrag = false;
                    f_div.style.border = "";
                    f_child.style.borderBottom = "";
                });
                f_div.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const num = this.draggingText;
                    const rect = f_div.getBoundingClientRect();
                    if(this.hierarchyDrag && num) {
                        const sp = num.split(",");
                        if(sp[0] === "5") {
                            const from = Number(sp[2]);
                            const ttt = h.num.split(",")[1];
                            let to = Number(ttt);
                            if(e.clientY-rect.top > rect.height/2) to ++;
                            this.plays[Number(sp[1]) ?? 0].insertFolder(from, to);
                            this.draggingText = null;
                            this.hierarchyDrag = false;
                            this.changed();
                        }
                    }
                });
                f_child.addEventListener('dragover', ()=>{
                    const num = this.draggingText;
                    if(this.hierarchyDrag && num) {
                        const sp = num.split(",");
                        if(sp[0] === "5") {
                            f_div.style.border = "";
                            f_child.style.borderBottom = "1px solid red";
                        }
                    }
                });
                f_child.addEventListener('dragleave',()=>{
                    f_child.style.border = "";
                });
                f_child.addEventListener('dragend', ()=>{
                    f_child.style.border = "";
                });
                f_child.addEventListener('drop', (e) => {
                    const num = this.draggingText;
                    if(this.hierarchyDrag && num) {
                        const sp = num.split(",");
                        if(sp[0] === "5") {
                            const to = Number(h.num.split(",")[1]) + 1;
                            const from = Number(sp[2]);
                            const play = this.plays[Number(sp[1]) ?? 0];
                            play.insertFolder(from, to);
                            this.hierarchyDrag = false;
                            this.draggingText = "";
                            this.changed();
                        }else if(sp[0] === "2") {
                            //
                        }
                    }
                });
                f_check.checked = h.open;
                if(h.open) f_child.style.display = "block";
                else f_child.style.display = "none";
                for(let i=0;i<h.children.length;i++) {
                    f_child.appendChild(this.H2(h.children[i]));
                }
                f_div.appendChild(text);
                ans.appendChild(f_radio);
                ans.appendChild(f_check);
                ans.appendChild(f_div);
                ans.appendChild(f_child);
                break;
            case ITEMKIND.player:
                const p_radio = document.createElement('input');
                const p_check = document.createElement('input');
                const p_div = document.createElement('div');
                const p_child = document.createElement('div');
                p_div.draggable = true;
                p_div.className = "hierarchyObject";
                p_div.textContent = h.text;
                p_check.type = "checkbox";
                p_check.className = "hierarchycheck";
                p_radio.className = "hierarchyRadio";
                p_radio.type = "radio";
                p_radio.name = "hierarchySelected";
                p_radio.value = h.num;
                text.addEventListener('change', ()=>{
                    if(text.value !== "") {
                        this.plays[Number(num[0])].players[Number(num[1])].name = text.value;
                        p_div.textContent = text.value;
                    }
                    text.blur();
                    this.changed();
                });
                p_div.addEventListener('click',(e)=>{
                    if(e.x >= 18 && e.x <= 35) {
                        const x = p_child.style.display;
                        if(x === "block") {
                            p_child.style.display = "none";
                            p_check.checked = false;
                            this.plays[Number(num[0])].players[Number(num[1]) ?? 0].opened = false;
                        }
                        else {
                            p_child.style.display = "block";
                            p_check.checked = true;
                            this.plays[Number(num[0])].players[Number(num[1]) ?? 0].opened = true;
                        }
                        this.changed();
                    }else if(p_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                p_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!p_radio.checked) p_div.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 3) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                p_div.addEventListener('dragstart', ()=>{
                    this.draggingText = "" + h.kind + "," + h.num;
                    this.hierarchyDrag = true;
                });
                p_check.checked = h.open;
                if(h.open) p_child.style.display = "block";
                else p_child.style.display = "none";
                for(let i=0;i<h.children.length;i++) {
                    p_child.appendChild(this.H2(h.children[i]));
                }
                p_div.appendChild(text);
                ans.appendChild(p_radio);
                ans.appendChild(p_check);
                ans.appendChild(p_div);
                ans.appendChild(p_child);
                break;
            case ITEMKIND.text:
                const t_radio = document.createElement('input');
                const t_check = document.createElement('input');
                const t_div = document.createElement('div');
                t_div.draggable = true;
                t_div.textContent = h.text;
                t_div.className = "hierarchyText";
                t_check.style.display = "none";
                t_radio.className = "hierarchyRadio";
                t_radio.type = "radio";
                t_radio.name = "hierarchySelected";
                t_radio.value = h.num;
                t_div.addEventListener('click',()=>{
                    if(t_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                t_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!t_radio.checked) t_div.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 3) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                t_div.addEventListener('dragstart', ()=>{
                    this.draggingText = "" + h.kind + "," + h.num;
                    this.hierarchyDrag = true;
                });
                t_div.appendChild(text);
                ans.appendChild(t_radio);
                ans.appendChild(t_check);
                ans.appendChild(t_div);
                break;
            case ITEMKIND.route:
                const r_radio = document.createElement('input');
                const r_check = document.createElement('input');
                const r_div = document.createElement('div');
                r_div.textContent = h.text;
                r_div.className = "hierarchyRoute";
                r_check.style.display = "none";
                r_radio.className = "hierarchyRadio";
                r_radio.type = "radio";
                r_radio.name = "hierarchySelected";
                r_radio.value = h.num;
                text.addEventListener('change', ()=>{
                    f_div.textContent = text.value;
                    text.blur();
                });
                r_div.addEventListener('click',()=>{
                    if(t_radio.checked) {
                        text.style.display = "block";
                        text.focus();
                    }
                });
                r_div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if(!t_radio.checked) r_div.click();
                    const con = document.getElementById("contextmenuView") as HTMLDivElement|null;
                    if(con) {
                        con.style.display = "block";
                        for(let i=0;i<ids.length;i++) {
                            const id = ids[i];
                            const view = document.getElementById(id);
                            if(view) {
                                if(i === 3) {
                                    view.style.display = "block";
                                    view.style.top = "" + e.y + "px";
                                    view.style.left = "" + e.x + "px";
                                    view.dataset.num = h.num;
                                }else view.style.display = "none";
                            }
                        }
                    }
                });
                r_div.appendChild(text);
                ans.appendChild(r_radio);
                ans.appendChild(r_check);
                ans.appendChild(r_div);
                break;
            default:
                break;
        }
        return ans;
    }
    exHierarchy() {
        const s = this.getHierarchy();
        const div = document.getElementById("leftHierarchyDisplay");
        if(div) {
            div.innerHTML = "";
            div.appendChild(s);
        }
        const select = document.getElementById('commandSettingS4') as HTMLSelectElement|null;
        const select2 = document.getElementById('commandSettingS6') as HTMLSelectElement|null;
        const p = this.displayed;
        if(p && select && select2) {
            select.innerHTML = "";
            select2.innerHTML = "";
            for(let i=0;i<p.folders.length;i++) {
                const f = p.folders[i];
                const option = document.createElement('option');
                option.value = f.id;
                option.textContent = f.name;
                select.appendChild(option);
                const option2 = document.createElement('option');
                option2.value = f.id;
                option2.textContent = f.name;
                select2.appendChild(option2);
            }
            select.value = p.setting.objectFolderId;
            select2.value = p.setting.textFolderId;
        }
    }


    makeLayerView() {
        let valueO = "-1";
        const form = document.getElementById('former') as HTMLFormElement|null;
        if(form) {
            const s = form.elements.namedItem("selectedLayer") as RadioNodeList|null;
            if(s) {
                valueO = s.value;
            }
        }
        const div = document.getElementById('leftLayersDisplayBody');
        const back = document.getElementById('leftLayersDisplayBack');
        const bb = document.getElementById('backBone');
        const select = document.getElementById("commandSettingS3") as HTMLSelectElement|null;
        const select2 = document.getElementById('commandSettingS5') as HTMLSelectElement|null;
        const select3 = document.getElementById('commandSettingS8') as HTMLSelectElement|null;
        if(this.displayed && div && select && select2 && select3 && bb) {
            const a = div.parentElement;
            if(a) a.style.opacity = "1";
            div.innerHTML = "";
            select.innerHTML = "<option value='-1'>--レイヤーを選択--</option>\n";
            select2.innerHTML = "<option value='-1'>--レイヤーを選択--</option>\n";
            select3.innerHTML = "<option value='-1'>--レイヤーを選択--</option>\n";
            const play = this.displayed;
            if(back) {
                bb.ondragover = (e) => {
                    e.preventDefault();
                    bb.style.borderTop = "2px solid red";
                };
                bb.ondragleave = () => {
                    bb.style.borderTop = "";
                };
                bb.ondrop = (e) => {
                    e.preventDefault();
                    if(this.layerDrag) {
                        if((this.dragLayer ?? 0) !== 0) play.insertLayer(this.dragLayer ?? 0, 0);
                        this.layerDrag = false;
                        play.setBack();
                        this.changed();
                    }
                };
                bb.ondragend = () => {
                    bb.style.borderTop = "";
                    this.layerDrag = false;
                };
            }
            for(let i=0;i<play.layers.length;i++) {
                const l = play.layers[i];
                const option = document.createElement('option');
                const option2 = document.createElement('option');
                const option3 = document.createElement('option');
                option.value = l.id;
                option.innerText = l.name;
                option2.value = l.id;
                option2.innerText = l.name;
                option3.value = l.id;
                option3.innerText = l.name;
                select.insertBefore(option, select.firstChild);
                select2.insertBefore(option2, select2.firstChild);
                select3.insertBefore(option3, select3.firstChild);
                if(l.lock) {
                    option.disabled = true;
                    option2.disabled = true;
                    option3.disabled = true;
                }
                const label = document.createElement('label');
                const ch1 = document.createElement('input');
                ch1.style.display = "none";
                ch1.type = "radio";
                ch1.name = "selectedLayer";
                ch1.value = "" + i;
                ch1.addEventListener("input", (e) => {
                    if(!l.lock) {
                        if(this.tab === 1) {
                            select.value = l.id;
                            select2.value = l.id;
                            select3.value = l.id;
                        }
                        play.setting.objectLayerId = l.id;
                        play.setting.textLayerId = l.id;
                        play.setting.relLayerId = l.id;
                    }
                });
                label.appendChild(ch1);
                const body = document.createElement('div');
                body.id = "layerDisplayCell" + i;
                body.className = "layerDisplayCell";
                body.draggable = true;
                body.addEventListener('dragstart', (e) => {
                    this.layerDrag = true;
                    this.dragLayer = i;
                });
                body.addEventListener('dragleave', (e) => {
                    body.style.borderTop = "";
                });
                body.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    bb.style.borderTop = "";
                    body.style.borderTop = "2px solid red";
                });
                body.addEventListener('dragend', (e) => {
                    body.style.borderTop = "";
                    bb.style.borderTop = "";
                    this.layerDrag = false;
                });
                body.addEventListener('drop', (e) => {
                    if(this.layerDrag) {
                        e.preventDefault();
                        if(this.dragLayer !== i) play.insertLayer(this.dragLayer ?? 0, i+1);
                        this.layerDrag = false;
                        play.setBack();
                        this.changed();
                    }
                });
                const span = document.createElement('span');
                span.style.gridColumn = "span 1";
                span.style.padding = "3px";
                span.style.width = "132px";
                span.style.overflow = "scroll";
                span.textContent = l.name;
                const label1 = document.createElement('label');
                label1.style.borderLeft = "1px dashed black";
                const ch2 = document.createElement('input');
                ch2.type = "checkbox";
                ch2.style.gridColumn = "span 1";
                ch2.className = "layerChecker";
                ch2.checked = l.visible;
                ch2.addEventListener('input', (e) => {
                    play.layers[i].visible = ch2.checked;
                    play.setLayers(l.id);
                    this.changed();
                });
                label1.appendChild(ch2);
                const label2 = document.createElement('label');
                label2.style.borderLeft = "1px dashed black";
                const ch3 = document.createElement('input');
                ch3.type = "checkbox";
                ch3.style.gridColumn = "span 1";
                ch3.className = "layerChecker";
                ch3.checked = l.lock.valueOf();
                ch3.addEventListener('input', (e) => {
                    play.layers[i].lock = ch3.checked;
                    if(ch3.checked) {
                        if(select.value === l.id) select.value = "-1";
                        if(select2.value === l.id) select2.value = "-1";
                        if(select3.value === l.id) select3.value = "-1";
                    }else {
                        if(ch1.checked) {
                            select.value = l.id;
                            select2.value = l.id;
                            select3.value = l.id;
                        }
                    }
                    play.setting.objectLayerId = select.value;
                    play.setting.textLayerId = select2.value;
                    play.setting.relLayerId = select3.value;
                    option.disabled = ch3.checked;
                    option2.disabled = ch3.checked;
                    option3.disabled = ch3.checked;
                    if(this.displayed && ch3.checked) {
                        const p = this.displayed;
                        for(let j=0;j<p.selectedObj.length;j++) {
                            const s = p.selectedObj[j];
                            if(p.players[s].layer === ch1.value) {
                                p.players[s].selectMe(false);
                                p.selectedObj.splice(j, 1);
                                j --;
                            }
                        }
                        this.changed();
                    }
                });
                label2.appendChild(ch3);
                body.appendChild(span);
                body.appendChild(label1);
                body.appendChild(label2);
                label.appendChild(body);
                div.insertBefore(label, div.firstChild);
                if(valueO === l.id) body.click();
            }
        }else if(div) {
            const a = div.parentElement;
            if(a) a.style.opacity = "0";
        }
    }


    makeHistory() {
        if(this.displayed) {
            const p = this.displayed;
            for(let i=0;i<p.history.length;i++) {
                //
            }
        }else {
            for(let i=0;i<this.history.length;i++) {
                //
            }
        }
    }

    toSinglePDF(): string {
        return "";
    }
    toMultiPDF(): string|null {
        let svgs: SVGElement[] = [];
        for(let i=0;i<this.plays.length;i++) {
            const p = this.plays[i];
            svgs.push(p.toSVG());
        }
        const pdf = svgs2pdf(svgs);
        if(pdf) {
            return pdf.output("datauristring");
        }
        return null;
    }

    fromObj(obj: PlayListC): void {
        if(obj.setting) this.setting = obj.setting;
        this.name = obj.name;
        let imgs: Promise<HTMLImageElement>[] = [];
        if(obj.images) for(let i=0;i<obj.images.length;i++) {
            imgs[i] = Exchangers.data2Img(obj.images[i].name, obj.images[i].data);
        }
        for(let i=0;i<obj.plays.length;i++) {
            this.plays[i] = new Play(this, obj.plays[i].name, obj.plays[i].para, obj.plays[i].fts);
            this.plays[i].fromObj(obj.plays[i]);
        }
        Promise.all(imgs).then((res) => {
            for(let i=0;i<res.length;i++) {
                this.images[i] = res[i];
            }
        }).catch((res) => {
            this.images = [];
        });
        if(obj.openedPlays) for(let i=0;i<obj.openedPlays.length;i++) {
            const num = obj.openedPlays[i];
            if(num === "") {
                Menues.openSettingByNextTab(this);
            }else {
                Menues.openPlayByNexttab(num, this);
            }
        if(obj.openedPlays[obj.openedPlay]) {
            Menues.openPlayByNexttab(obj.openedPlays[obj.openedPlay], this);
        }else {
            Menues.openSettingByNextTab(this);
        }
        }
    }
    toObj(): PlayListC {
        let playsC: PlayC[] = new Array();
        for(let i=0;i<this.plays.length;i++) {
            playsC[i] = this.plays[i].toObj();
        }
        let imagesC: IMAGE_DATA[] = new Array();
        for(let i=0;i<this.images.length;i++) {
            imagesC[i] = {
                name: this.images[i].name,
                data: Exchangers.img2Data(this.images[i], imageTypeText[IMAGETYPE.pdf])
            };
        }
        let oP: number = 0;
        let oPs: string[] = [];
        for(let i=0;i<this.oPlays.length;i++) {
            oPs.push(this.oPlays[i].name);
        }
        if(this.selftab !== -1) {
            oPs.splice(this.selftab, 0, "");
        }
        if(this.displayed) {
            oP = oPs.indexOf(this.displayed.name);
            if(oP === -1) oP = this.selftab;
        }
        let ans: PlayListC = {
            name: this.name,
            plays: playsC,
            images: imagesC,
            setting: this.setting,
            opened: this.opened,
            openedPlay: oP,
            openedPlays: oPs,
        };
        return ans;
    }

    cVcSet() {
        const es = document.getElementsByClassName("imageCollectioncell");
        for(let i=0;i<es.length;i++) {
            const e = es[i] as HTMLLIElement;
            if(e.ondragstart === null) {
                e.ondragstart = (a) => {
                    a.dataTransfer?.setData('text/plain', e.id);
                    this.imageDrag = true;
                };
                e.ondragover = (a) => {
                    a.preventDefault();
                    const rect = e.getBoundingClientRect();
                    if((a.clientX - rect.left) < (e.clientWidth/2)) {
                        e.style.borderLeft = '2px solid red';
                        e.style.borderRight = '1px solid gray';
                        e.style.marginRight = '5px';
                        e.style.marginLeft = '4px';
                    }else {
                        e.style.borderLeft = '1px solid gray';
                        e.style.borderRight = '2px solid red';
                        e.style.marginRight = '4px';
                        e.style.marginLeft = '5px';
                    }
                };
                e.ondragleave = (a) => {
                    e.style.border = "";
                    e.style.margin = "";
                };
                e.ondragend = (a) => {
                    this.imageDrag = false;
                };
                e.ondrop = (a) => {
                    this.imageDrag = false;
                    a.preventDefault();
                    const id = a.dataTransfer?.getData("text/plain");
                    if(id) {
                        const element = document.getElementById(id + "label");
                        if(element) {
                            const rect = e.getBoundingClientRect();
                            if((a.clientX - rect.left) < (e.clientWidth/2)) {
                                e.parentNode?.parentNode?.insertBefore(element, e.parentNode);
                            }else {
                                e.parentNode?.parentNode?.insertBefore(element, e.parentNode.nextSibling);
                            }
                        }
                        a.dataTransfer?.setData("text/plain", "");
                    }
                    e.style.border = "";
                    e.style.margin = "";
                };
            }
        }
        const form = document.getElementById("former") as HTMLFormElement;
        const ils = form.getElementsByClassName("imagelist");
        for(let i=0;i<ils.length;i++) {
            const l = ils[i] as HTMLInputElement;
            l.oninput = (e) => {
                const el = form.elements.namedItem("imagecellInput") as RadioNodeList;
                const json = parseJSON(el.value);
                if(this.tab === 1) {
                    if(this.displayed) {
                        this.displayed.setting.symbolName = json.name;
                        this.displayed.setting.symbolCover = json.cov;
                    }
                }
                else if(this.tab === 2) {
                    if(this.displayed) {
                        for(let j=0;j<this.displayed.selectedObj.length;j++) {
                            const o = this.displayed.players[this.displayed.selectedObj[j]];
                            o.symbol = json.name;
                            o.image.name = json.name;
                            o.image.covered = json.cov;
                            o.image.draw();
                        }
                        this.displayed.draw();
                    }
                }
            };
        }
    }
}
