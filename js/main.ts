import {
    COMMANDS, IMAGETYPE
} from "./enums";
import {
    default as Menues,
    Params
} from "./html";
import "./structs";
import { CONSTS, PlayList, Symbol, Play, Route, Color } from "./structs";
import { now } from "jquery";

let playlist: PlayList;
let ppp: Params;
let unsaved: Boolean;
let pNames: string[] = [];
let nowTab: number = 0;
let scales: number[] = [];
let nowScale: number = 100;
let asHeight: number = 100;
let alY: number = 0;

window.onload = function() {
    const sS = sessionStorage.getItem("Ballust_Playlist");
    if(sS) {
        const plc = JSON.parse(sS);
        playlist = new PlayList(plc.name);
        playlist.fromObj(plc);
        playlist.exHierarchy();
        playlist.makeLayerView();
        if(playlist.displayed) playlist.displayed.setBack();
        playlist.changed();
    }else {
        const params = Menues.getParameters();
        if(params["listname"]) {
            playlist = new PlayList(params["listname"]);
        }else {
            playlist = new PlayList("no name");
            Menues.openSettingByNextTab(playlist);
            playlist.exHierarchy();
        }
        if(params["type"]) {
            if(params["type"] === "new") {
                playlist.makePlay("Play 01");
            }
            if(params["type"] === "open") {
                let obj = localStorage.getItem("PM_TMP_LIST");
                if(obj === null) {
                    //
                }else {
                    playlist.fromObj(JSON.parse(obj));
                }
            }
        }
    }
    const former = document.getElementById("former");
    if(former) {
        const f = former as HTMLFormElement;
        const r = f.elements.namedItem("scalingrange") as HTMLInputElement|null;
        const n = f.elements.namedItem("scalingInput") as HTMLInputElement|null;
        if(r && n) {
            r.addEventListener('change', (e) => {
                const s = [10, 25, 50, 67, 80, 100, 125, 150, 200, 400, 1000];
                const v = Number(r.value);
                n.value = "" + s[v];
                setScale(s[v]);
            });
            n.addEventListener('change', (e) => {
                const v = Number(n.value);
                r.value = "" + v;
                setScale(v);
            });
        }
        const hie = document.getElementById('leftHierarchy');
        const lay = document.getElementById('leftLayers');
        const his = document.getElementById('leftHistory');
        const hd = document.getElementById('leftHierarchyDisplay');
        const ld = document.getElementById('leftLayersDisplay');
        const hr = document.getElementById('leftHistoryDisplay');
        if(hie && lay && his && hd && ld && hr) {
            hie.addEventListener('input', (e) => {
                playlist.exHierarchy();
                hd.style.display = "block";
                ld.style.display = "none";
                hr.style.display = "none";
            });
            lay.addEventListener('input', (e) => {
                playlist.makeLayerView();
                hd.style.display = "none";
                ld.style.display = "block";
                hr.style.display = "none";
            });
            his.addEventListener('input', () => {
                playlist.makeHistory();
                hd.style.display = "none";
                ld.style.display = "none";
                hr.style.display = "block";
            });
        }
    }
    window.addEventListener("beforeunload", (event) => {
        if(unsaved) {
            event.preventDefault();
            event.returnValue = '保存せずに終了しますか？';
        }
    });
    window.addEventListener('keydown', function(e) {
        //keyDown
        if(e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault();
            playlist.redo();
        }
        else if(e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            playlist.undo();
        }
        if(e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        }
    });
    window.addEventListener('keyup', function(e) {
        //keyUp
    });
    const imagenms = ["graph/selectbox.png", 'graph/arrow.png', 'graph/move.png', 'graph/relation-256.png', 'graph/moveroute.png', 'graph/eraser128.png', 'graph/figure.png', 'graph/text.png', 'graph/lines.svg'];
    for(let i=0;i<imagenms.length;i++) {
        const nm = imagenms[i];
        const id = "comButton" + i;
        const a = document.getElementById(id);
        if(a) a.addEventListener('click', (e) => {
            const cv = document.getElementById('uiCanvas') as HTMLCanvasElement|null;
            if(cv) {
                const ctx = cv.getContext("2d");
                if(ctx) ctx.clearRect(0, 0, cv.width, cv.height);
            }
            selectCom(nm, i);
        });
    }
    setOtherForms();
    setA();
    setPL();
    setLayers();
    setCanvases();
    setCommands();
    cVcSet();
    playlist.cVcSet();
    setContextMenus();
    setAV();
}

function setScale(per: number = 100) {
    scales[nowTab] = per;
    nowScale = per;
    const cs = document.getElementById("canvas");
    if(cs) {
        cs.style.zoom = "" + per + "%";
    }
}

function setPL() {
    const playlist_name = document.getElementById('playlist-name') as HTMLInputElement|null;
    if(playlist_name) playlist_name.addEventListener('change', ()=>{
        if(playlist_name.value !== "") playlist.changeName(playlist_name.value);
    });
    for(let i=0;i<10;i++) {
        const id = "plSettingC" + i;
        const e = document.getElementById(id) as HTMLInputElement|null;
        if(e) {
            e.addEventListener('input', ()=>{
                playlist.setSetting(0, i, e.value);
            });
        }else break;
    }
    for(let i=0;i<10;i++) {
        const id = "plSettingI" + i;
        const e = document.getElementById(id) as HTMLInputElement|null;
        if(e) {
            e.addEventListener('change', ()=>{
                playlist.setSetting(1, i, e.value);
            });
        }else break;
    }
    for(let i=0;i<10;i++) {
        const id = "plSettingS" + i;
        const e = document.getElementById(id) as HTMLSelectElement|null;
        if(e) {
            e.addEventListener('change', ()=>{
                playlist.setSetting(2, i, e.value);
            });
        }else break;
    }
    for(let i=0;i<10;i++) {
        const id = "plSettingCh" + i;
        const e = document.getElementById(id) as HTMLInputElement|null;
        if(e) {
            e.addEventListener('input', ()=>{
                playlist.setSetting(3, i, e.value, e.checked);
            });
        }else break;
    }
}

function setLayers() {
    const form = document.getElementById('former') as HTMLFormElement|null;
    const plus = document.getElementById('layerPlusBtn');
    const setting = document.getElementById('layerSettingBtn');
    const trash = document.getElementById('layerDeleteBtn');
    if(form) {
        if(plus) {
            plus.addEventListener('click', (e)=>{
                const s = form.elements.namedItem("selectedLayer") as RadioNodeList|null;
                if(s) {
                    const n = Number(s.value);
                    if(playlist.displayed) {
                        const x = playlist.displayed.addLayer("", n+1);
                        s.value = String(x);
                    }
                }
            });
        }
        if(setting) {
            setting.addEventListener('click', (e)=>{
                const s = form.elements.namedItem("selectedLayer") as RadioNodeList|null;
                if(s) {
                    const n = Number(s.value);
                    const p = document.getElementById('layerDisplayCell' + n);
                    if(p) {
                        const text = document.createElement('input');
                        text.type = "text";
                        text.style.position = "absolute";
                        text.style.width = "188px";
                        text.style.padding = "6px 6px";
                        text.style.zIndex = "300";
                        text.style.outline = "none";
                        text.style.top = "transparent";
                        text.placeholder = p.firstElementChild?.textContent ?? "";
                        text.addEventListener('change', ()=>{
                            text.blur();
                        });
                        text.addEventListener('blur', ()=>{
                            if(playlist.displayed) playlist.displayed.changeLayer(n, text.value);
                            s.value = "" + n;
                            text.remove();
                        });
                        p.appendChild(text);
                        text.focus();
                    }
                }
            });
        }
        if(trash) {
            trash.addEventListener('click', (e)=>{
                const s = form.elements.namedItem("selectedLayer") as RadioNodeList|null;
                if(s) {
                    const n = Number(s.value);
                    if(playlist.displayed) {
                        const v = playlist.displayed.delLayer(n);
                        s.value = String(v);
                    }
                }
            });
        }
    }
}
function setCanvases() {
    const uiC = document.getElementById('uiCanvas');
    if(uiC) {
        uiC.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const btn = e.button;
            const s = nowScale/100;
            const rect = uiC.getBoundingClientRect();
            const x = (e.clientX - rect.left*s)/s;
            const y = (e.clientY - rect.top*s)/s;
            if(playlist.displayed) {
                switch(btn) {
                    case 0:
                        playlist.displayed.mouseDown(x, y, e.shiftKey);
                        break;
                    case 1:
                        playlist.displayed.mouseRight(x, y, e.shiftKey);
                        break;
                    case 2:
                        playlist.displayed.mouseRight(x, y, e.shiftKey);
                        break;
                    default:
                        break;
                }
            }
        });
        uiC.addEventListener('mousemove', (e) => {
            const s = nowScale/100;
            const rect = uiC.getBoundingClientRect();
            const x = (e.clientX - rect.left*s)/s;
            const y = (e.clientY - rect.top*s)/s;
            if(playlist.displayed) {
                switch(e.buttons) {
                    case 0:
                        playlist.displayed.mouseMove(x, y, e.shiftKey);
                        break;
                    case 1:
                        playlist.displayed.leftDrag(x, y, e.shiftKey);
                        break;
                    case 2:
                        playlist.displayed.rightDrag(x, y, e.shiftKey);
                        break;
                }
            }
        });
        uiC.addEventListener('mouseup', (e) => {
            const s = nowScale/100;
            const rect = uiC.getBoundingClientRect();
            const x = (e.clientX - rect.left*s)/s;
            const y = (e.clientY - rect.top*s)/s;
            if(playlist.displayed) {
                playlist.displayed.mouseUp(x, y, e.shiftKey);
            }
        });
        uiC.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    for(let i=0;i<6;i++) {
        const nm = "canvasSettingI" + i;
        const a = document.getElementById(nm) as HTMLInputElement|null;
        if(a) a.addEventListener('input', (e) => {
            if(i === 4) {
                const b = document.getElementById("canvasSettingI5") as HTMLInputElement|null;
                if(b) {
                    b.max = "" + (100 - Number(a.value));
                    if(Number(b.value) > Number(b.max)) b.value = b.max;
                    if(playlist.displayed) playlist.displayed.feets[5] = Number(b.value);
                }
            }
            if(playlist.displayed) playlist.displayed.setSetting(1, i, Number(a.value));
        });
    }
    for(let i=0;i<4;i++) {
        const nm = "canvasSettingS" + i;
        const a = document.getElementById(nm) as HTMLSelectElement|null;
        if(a) a.addEventListener('change', (e) => {
            if(playlist.displayed) playlist.displayed.setSetting(0, i, Number(a.value));
        });
    }
    const axa = document.getElementById("canvasSettingC0") as HTMLInputElement|null;
    if(axa) axa.addEventListener('input', (e) => {
        if(playlist.displayed) playlist.displayed.setSetting(2, 0, 0, axa.value);
    });
}
function setCommands() {
    const canvasTabBtn = document.getElementById('canvasTabBtn');
    const commandTabBtn = document.getElementById('commandTabBtn');
    const objectTabBtn = document.getElementById('objectTabBtn');
    const rightContCanvas = document.getElementById('rightContCanvas');
    const rightContCommand = document.getElementById('rightContCommand');
    const rightContObject = document.getElementById('rightContObject');
    const matomari = document.getElementById('matomari');
    if(canvasTabBtn && commandTabBtn && objectTabBtn && rightContCanvas && rightContCommand && rightContObject && matomari) {
        canvasTabBtn.addEventListener('click', (e) => {
            rightContCanvas.style.display = 'block';
            rightContCommand.style.display = 'none';
            rightContObject.style.display = 'none';
            playlist.tab = 0;
        });
        commandTabBtn.addEventListener('click', (e) => {
            playlist.tab = 1;
            rightContCanvas.style.display = 'none';
            rightContCommand.style.display = 'block';
            rightContObject.style.display = 'none';
            for(let i=0;i<10;i++) {
                const id = "commander" + i;
                const elt = document.getElementById(id);
                if(elt) elt.style.display = "none";
            }
            if(playlist.displayed) {
                const p = playlist.displayed;
                const s = playlist.displayed.setting;
                const n = playlist.displayed.command;
                const id = "commander" + n;
                const elt = document.getElementById(id);
                if(elt) {
                    elt.style.display = "block";
                    switch(n) {
                        case COMMANDS.route:
                            const lkS = document.getElementById('commandSettingS0') as HTMLSelectElement|null;
                            const lhS = document.getElementById('commandSettingS1') as HTMLSelectElement|null;
                            const lC = document.getElementById('commandSettingC2') as HTMLInputElement|null;
                            if(lkS && lhS && lC) {
                                lkS.value = "" + s.lineKind;
                                lhS.value = "" + s.lineHead;
                                const c = new Color(0, 0, 0, 0);
                                c.fromObj(s.lineColor);
                                lC.value = c.toString();
                            }
                            break;
                        case COMMANDS.object:
                            elt.appendChild(matomari);
                            const cs = matomari.getElementsByClassName("imagelist");
                            const v = '{"name":"' + s.symbolName + '","cov":' + s.symbolCover + '}';
                            for(let i=0;i<cs.length;i++) {
                                const c = cs[i] as HTMLInputElement;
                                if(c.value === v) {
                                    c.checked = true;
                                    break;
                                }
                            }
                            const mC = document.getElementById("commandSettingC0") as HTMLInputElement|null;
                            const sC = document.getElementById("commandSettingC1") as HTMLInputElement|null;
                            const rCh = document.getElementById("commandSettingCh0") as HTMLInputElement|null;
                            const rI = document.getElementById("commandSettingI0") as HTMLInputElement|null;
                            const hI = document.getElementById("commandSettingI3") as HTMLInputElement|null;
                            const wI = document.getElementById("commandSettingI4") as HTMLInputElement|null;
                            const lS = document.getElementById("commandSettingS3") as HTMLSelectElement|null;
                            const fS = document.getElementById("commandSettingS4") as HTMLSelectElement|null;
                            const tI = document.getElementById("commandSettingI7") as HTMLInputElement|null;
                            if(mC && sC && rCh && rI && wI && hI && lS && fS && tI) {
                                let c = new Color(0,0,0,0);
                                c.fromObj(s.mainColor);
                                mC.value = c.toString();
                                c.fromObj(s.subColor);
                                sC.value = c.toString();
                                rCh.checked = s.isFlipped as boolean;
                                rI.value = "" + s.objectRot;
                                wI.value = "" + Math.round(s.objectWidth/CONSTS.FEET);
                                hI.value = "" + Math.round(s.objectHeight/CONSTS.FEET);
                                if(s.objectLayerId === "-1" || p.layers[p.getLayer(s.objectLayerId)].lock) lS.value = "-1";
                                else lS.value = s.objectLayerId;
                                fS.value = s.objectFolderId;
                                tI.value = s.objectText;
                            }
                            break;
                        case COMMANDS.grip:
                            const form = document.getElementById("former") as HTMLFormElement|null;
                            if(form) {
                                const gR = form.elements.namedItem("grip-kind") as RadioNodeList|null;
                                if(gR) gR.value = "" + s.gripKind;
                            }
                            break;
                        case COMMANDS.relation:
                            break;
                        case COMMANDS.text:
                            const foS = document.getElementById("commandSettingS2") as HTMLSelectElement|null;
                            const boC = document.getElementById("commandSettingCh1") as HTMLInputElement|null;
                            const itC = document.getElementById("commandSettingCh2") as HTMLInputElement|null;
                            const tC = document.getElementById("commandSettingC3") as HTMLInputElement|null;
                            const trI = document.getElementById("commandSettingI1") as HTMLInputElement|null;
                            const teI = document.getElementById("commandSettingI2") as HTMLInputElement|null;
                            const tlS = document.getElementById("commandSettingS5") as HTMLSelectElement|null;
                            const tfS = document.getElementById("commandSettingS6") as HTMLSelectElement|null;
                            const tsS = document.getElementById("commandSettingS11") as HTMLSelectElement|null;
                            if(foS && boC && itC && tC && trI && teI && tlS && tfS && tsS) {
                                foS.value = s.fontName;
                                boC.checked = s.textBold;
                                itC.checked = s.textItalic;
                                const c = new Color(1,1,1,1);
                                c.fromObj(s.textColor);
                                tC.value = c.toString();
                                trI.value = "" + s.textRot;
                                teI.value = s.text;
                                tlS.value = s.textLayerId;
                                tfS.value = s.textFolderId;
                                tsS.value = "" + s.textSize;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        });
        objectTabBtn.addEventListener('click', (e) => {
            playlist.tab = 2;
            rightContCanvas.style.display = 'none';
            rightContCommand.style.display = 'none';
            rightContObject.insertBefore(matomari, rightContObject.firstChild);
            if(playlist.displayed) {
                rightContObject.style.display = 'block';
                if(playlist.displayed.selectedObj.length > 0) {
                    const n = playlist.displayed.selectedObj[0];
                    const cs = matomari.getElementsByClassName("imagelist");
                    const o = playlist.displayed.players[n];
                    const v = '{"name":"' + o.symbol + '","cov":' + o.image.covered + '}';
                    for(let i=0;i<cs.length;i++) {
                        const c = cs[i] as HTMLInputElement;
                        if(c.value === v) {
                            c.checked = true;
                            break;
                        }
                    }
                    const mC = document.getElementById("commandSettingC0") as HTMLInputElement|null;
                    const sC = document.getElementById("commandSettingC1") as HTMLInputElement|null;
                    const rCh = document.getElementById("commandSettingCh0") as HTMLInputElement|null;
                    const rI = document.getElementById("commandSettingI0") as HTMLInputElement|null;
                    const hI = document.getElementById("commandSettingI3") as HTMLInputElement|null;
                    const wI = document.getElementById("commandSettingI4") as HTMLInputElement|null;
                    const lS = document.getElementById("commandSettingS3") as HTMLSelectElement|null;
                    const fS = document.getElementById("commandSettingS4") as HTMLSelectElement|null;
                    const tI = document.getElementById("commandSettingI7") as HTMLInputElement|null;
                    if(mC && sC && rCh && rI && wI && hI && lS && fS && tI) {
                        mC.value = o.image.lineColor.toString();
                        sC.value = o.image.fill.toString();
                        rCh.checked = o.image.reverse as boolean;
                        rI.value = "" + o.rot;
                        wI.value = "" + Math.round(o.size.width/CONSTS.FEET);
                        hI.value = "" + Math.round(o.size.height/CONSTS.FEET);
                        lS.value = o.layer;
                        fS.value = o.folder;
                        tI.value = o.text;
                    }
                }else {
                    rightContObject.style.display = "none";
                }
            }
        });
    }
    for(let i=0;i<20;i++) {
        const com = document.getElementById("commandSettingI" + i) as HTMLInputElement|null;
        if(com) {
            com.addEventListener('input', (e) => {
                if(playlist.displayed) {
                    playlist.displayed.setComSetting(0, i, com.value);
                }
            });
        }else break;
    }
    for(let i=0;i<20;i++) {
        const com = document.getElementById("commandSettingC" + i) as HTMLInputElement|null;
        if(com) {
            com.addEventListener('input', (e) => {
                if(playlist.displayed) playlist.displayed.setComSetting(1, i, com.value);
            });
        }else break;
    }
    for(let i=0;i<20;i++) {
        const com = document.getElementById("commandSettingS" + i) as HTMLSelectElement|null;
        if(com) {
            com.addEventListener('change', (e) => {
                if(playlist.displayed) playlist.displayed.setComSetting(2, i, com.value);
            });
        }else break;
    }
    for(let i=0;i<20;i++) {
        const com = document.getElementById("commandSettingCh" + i) as HTMLInputElement|null;
        if(com) {
            com.addEventListener('input', (e) => {
                if(playlist.displayed) playlist.displayed.setComSetting(3, i, com.value, com.checked);
            });
        }else break;
    }
    for(let i=0;i<20;i++) {
        const com = document.getElementById("commandSettingR" + i) as HTMLInputElement|null;
        if(com) {
            com.addEventListener('input', (e) => {
                if(playlist.displayed) playlist.displayed.setComSetting(4, i, com.value);
            });
        }else break;
    }
}
function setA() {
    const open_plist = document.getElementById('openplist') as HTMLInputElement|null;
    const import_plist = document.getElementById('importplist') as HTMLInputElement|null;
    const import_play = document.getElementById('importplay') as HTMLInputElement|null;
    const file_newPL = document.getElementById('A_File_newPL');
    const file_newP = document.getElementById('A_File_newPlay');
    const file_open = document.getElementById('A_File_open');
    const file_save = document.getElementById('A_File_save');
    const file_saveAs = document.getElementById('A_File_saveAs');
    const file_saveAll = document.getElementById('A_File_saveAll');
    const file_exportBRL = document.getElementById('A_File_exportBRL');
    const file_exportBRP = document.getElementById('A_File_exportBRP');
    const file_exportPDF = document.getElementById('A_File_exportPDF');
    const file_exportPNG = document.getElementById('A_File_exportPNG');
    const file_exportJPEG = document.getElementById('A_File_exportJPEG');
    const file_exportSVG = document.getElementById('A_File_exportSVG');
    if(open_plist && import_play && import_plist) {
        open_plist.accept = "pll,PLL";
        import_plist.accept = "pll,PLL";
        import_play.accept = "ply,PLY";
        open_plist.addEventListener('input', (e) => {
            const fs = open_plist.files;
            if(fs) {
                console.log(fs[0].name);
                fs[0].text().then((x) => {
                    console.log(x);
                    Menues.clearPlayTab();
                    playlist = new PlayList("no name");
                    playlist.fromObj(JSON.parse(x));
                    playlist.exHierarchy();
                }).catch((x) => {
                    alert("失敗しました。");
                    console.log(x);
                });
            }
        });
        import_play.addEventListener('input', () => {
            const fs = import_play.files;
            if(fs) {
                for(let i=0;i<fs.length;i++) {
                    fs[i].text().then((x) => {
                        const p = playlist.makePlay("");
                        p.fromObj(JSON.parse(x));
                    }).catch((x) => {
                        alert("失敗しました。");
                        console.log(x);
                    });
                }
            }
        });
        import_plist.addEventListener('input', () => {
            const fs = import_plist.files;
            if(fs) {
                for(let i=0;i<fs.length;i++) {
                    fs[i].text().then((x) => {
                        const pl = JSON.parse(x);
                        for(let j=0;j<pl.plays.length;j++) {
                            const p = playlist.makePlay("");
                            p.fromObj(pl.plays[j]);
                        }
                    }).catch((e) => {
                        alert("失敗しました。");
                        console.log(e);
                    });
                }
            }
        });
    }
    if(file_newPL) {
        file_newPL.addEventListener('click', (e) => {
            //
        });
    }
    if(file_newP) {
        file_newP.addEventListener('click', (e) => {
            if(playlist) {
                if(playlist.setting.newPlayflag) {
                    const view = document.getElementById('createPlayView');
                    if(view) view.style.display = "block";
                }else {
                    playlist.makePlay("", playlist.setting.parameter, playlist.setting.feets);
                }
            }
        });
    }
    if(file_save && file_saveAs && file_exportBRL) {
        file_saveAs.addEventListener("click", (e) => {
            /*const a = prompt("name?");
            if(a) {
                localStorage.setItem("BALLUSTRATOR_BRL/" + a, JSON.stringify(playlist.toObj()));
                localStorage.setItem("BALLUSTRATOR_openedBRL", a);
            }*/
            file_exportBRL.click();
        });
        file_save.addEventListener("click", (e) => {
            /*const lS = localStorage.getItem("BALLUSTRATOR_openedBRL");
            if(lS) {
                localStorage.setItem(lS, JSON.stringify(playlist.toObj()));
            }else {
                file_saveAs.click();
            }*/
            file_exportBRL.click();
        });
    }
    if(file_open && open_plist) {
        file_open.addEventListener('click', (e) => {
            open_plist.click();
        });
    }
    if(file_exportBRL && file_exportBRP && file_exportPDF && file_exportPNG && file_exportJPEG && file_exportSVG) {
        file_exportBRL.addEventListener("click", (e) => {
            playlist.toBRL();
        });
        file_exportBRP.addEventListener("click", (e) => {
            if(playlist.displayed) {
                playlist.displayed.toBRP();
            }
        });
        file_exportPDF.addEventListener("click", () => {
            if(playlist.displayed) {
                playlist.displayed.toImage(IMAGETYPE.pdf);
            }
        });
        file_exportJPEG.addEventListener("click", () => {
            if(playlist.displayed) {
                playlist.displayed.toImage(IMAGETYPE.jpeg);
            }
        });
        file_exportPNG.addEventListener("click", () => {
            if(playlist.displayed) {
                playlist.displayed.toImage(IMAGETYPE.png);
            }
        });
        file_exportSVG.addEventListener("click", (e) => {
            if(playlist.displayed) {
                playlist.displayed.toImage(IMAGETYPE.svg);
            }
        });
    }
    const edit_undo = document.getElementById('A_Edit_undo');
    const edit_redo = document.getElementById('A_Edit_redo');
    const edit_cut = document.getElementById('A_Edit_cut');
    const edit_copy = document.getElementById('A_Edit_copy');
    const edit_paste = document.getElementById('A_Edit_paste');
    const edit_delete = document.getElementById('A_Edit_delete');
    const edit_selectAll = document.getElementById('A_Edit_selectAll');
    const edit_flip = document.getElementById('A_Edit_flip');
    const edit_alignH = document.getElementById('A_Edit_alignH');
    const edit_alignV = document.getElementById('A_Edit_alignV');
    if(edit_undo && edit_redo) {
        edit_undo.addEventListener('click', () => {
            playlist.undo();
        });
        edit_redo.addEventListener('click', () => {
            playlist.redo();
        });
    }
    if(edit_delete) {
        edit_delete.addEventListener('click', (e) => {
            if(playlist.displayed) {
                playlist.displayed.selectedObj.sort((a, b) => a - b);
                for(let i=playlist.displayed.selectedObj.length-1;i>=0;i--) {
                    const a = playlist.displayed.selectedObj[i];
                    playlist.displayed.delObject(a);
                }
                playlist.displayed.draw();
            }
        });
    }
    if(edit_selectAll) {
        edit_selectAll.addEventListener('click', (e) => {
            if(playlist.displayed) {
                playlist.displayed.selectedObj = [];
                for(let i=0; i<playlist.displayed.players.length; i++) {
                    playlist.displayed.selectedObj.push(i);
                    playlist.displayed.players[i].selectMe(true);
                }
            }
        });
    }
    if(edit_alignH && edit_alignV) {
        edit_alignV.addEventListener('click', (e) => {
            if(playlist.displayed && playlist.displayed.selectedObj.length > 0) {
                const aX = playlist.displayed.players[playlist.displayed.selectedObj[0]].pos.x;
                for(let i=1; i<playlist.displayed.selectedObj.length;i++) {
                    playlist.displayed.players[playlist.displayed.selectedObj[i]].pos.x = aX;
                }
            }
        });
        edit_alignH.addEventListener('click', (e) => {
            if(playlist.displayed && playlist.displayed.selectedObj.length > 0) {
                const aX = playlist.displayed.players[playlist.displayed.selectedObj[0]].pos.y;
                for(let i=1; i<playlist.displayed.selectedObj.length;i++) {
                    playlist.displayed.players[playlist.displayed.selectedObj[i]].pos.y = aX;
                }
            }
        });
    }
    const debug = document.getElementById('A_Help_debug');
    if(debug) debug.addEventListener('click', () => {
        console.log(playlist);
    });
}
function setContextMenus() {
    const b0 = document.getElementById("openPlayMenu") as HTMLSpanElement|null;
    if(b0) {
        b0.addEventListener('click', (e) => {
            const x = Number(b0.parentElement?.dataset.num ?? 0);
            const p = playlist.plays[x];
            Menues.openPlayByNexttab(p.name, playlist);
        });
    }
    const b1 = document.getElementById("createNewFolderMenu") as HTMLSpanElement|null;
    if(b1) {
        b1.addEventListener('click', (e) => {
            const x = Number(b1.parentElement?.dataset.num ?? 0);
            const p = playlist.plays[x];
            p.addFolder("new folder");
        });
    }
    const b2 = document.getElementById("deletePlayMenu") as HTMLSpanElement|null;
    if(b2) {
        b2.addEventListener('click', (e) => {
            const x = Number(b2.parentElement?.dataset.num ?? 0);
            playlist.delPlay(x);
        });
    }
    const a0 = document.getElementById("openSettingMenu") as HTMLSpanElement|null;
    if(a0) {
        a0.addEventListener("click", (e) => {
            Menues.openSettingByNextTab(playlist);
        });
    }
    const a1 = document.getElementById("changelistnameMenu") as HTMLSpanElement|null;
    if(a1) {
        a1.addEventListener("click", (e) => {
            const x = document.getElementsByClassName("pldetails")[0];
            const y = x.getElementsByClassName("inputindetail")[0] as HTMLElement;
            y.style.display = "block";
            y.focus();
        });
    }
    const a2 = document.getElementById('createNewPlayMenu') as HTMLSpanElement|null;
    if(a2) {
        a2.addEventListener('click', (e) => {
            if(playlist.setting.newPlayflag) {
                const it = document.getElementById('createPlayView');
                if(it) it.style.display = "block";
            }else playlist.makePlay("");
        });
    }
    const e0 = document.getElementById('selectObjectMenu') as HTMLSpanElement|null;
    if(e0) {
        e0.addEventListener('click', (e) => {
            const x = e0.parentElement?.dataset.num?.split(",");
            if(x) {
                const p = playlist.plays[Number(x[0]) ?? 0];
                if(p) {
                    p.selectedObj = [Number(x[1]) ?? 0];
                    for(let i=0;i<p.players.length;i++) {
                        const o = p.players[i];
                        o.selectMe(false);
                    }
                    p.players[Number(x[1] ?? 0)].selectMe(true);
                    p.draw();
                }
            }
        });
    }
    const e1 = document.getElementById('deleteObjectMenu') as HTMLSpanElement|null;
    if(e1) {
        e1.addEventListener('click', (e) => {
            const x = e1.parentElement?.dataset.num?.split(",");
            if(x) {
                const p = playlist.plays[Number(x[0]) ?? 0];
                if(p) {
                    p.delObject(Number(x[1]) ?? 0);
                    p.draw();
                }
            }
        });
    }
}
function cVcSet() {
    const ul = document.getElementById('imagecollectionView');
    const div = document.getElementById('fileDropView');
    if(ul) {
        ul.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if(div && !playlist.imageDrag) div.style.display = "block";
        });
        if(div) {
            div.addEventListener('dragover', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            div.addEventListener('dragleave', (e) => {
                div.style.display = "none";
            });
            div.addEventListener('drop', (e) => {
                e.stopPropagation();
                e.preventDefault();
                div.style.display = "none";
                const files = e.dataTransfer?.files;
                if(files) getFiles(ul, files);
            });
        }
    }
}
function getFiles(ul: HTMLElement, files: FileList) {
    for(let i=0;i<files.length;i++) {
        const f = files[i];
        const name = f.name;
        const url = window.URL.createObjectURL(f);
        if(f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/bmp" || f.type === "application/pdf") ul.innerHTML += "<label id='" + name + "label'><input type='radio' name='imagecellInput' class='fileUploader' value='" + name + "'><li class='imageCollectioncell' draggable='true' id='" + name + "'><img class='ximgx' src='" + url + "'></li></label>";
    }
    playlist.cVcSet();
}

function selectCom(src: string, num: number) {
    const a = document.forms.item(0);
    if(a) {
        const b = a.elements.namedItem("comButton") as HTMLInputElement;
        if(b) {
            if(playlist.displayed) playlist.displayed.command = num;
            if(playlist.tab === 1) {
                for(let i=0;i<10;i++) {
                    const id = "commander" + i;
                    const e = document.getElementById(id);
                    if(e) {
                        if(i === num) e.style.display = "block";
                        else e.style.display = "none";
                    }
                }
                if(num === COMMANDS.object) {
                    const e = document.getElementById("commander6");
                    const x = document.getElementById('matomari');
                    if(e && x) {
                        e.appendChild(x);
                    }
                }
                const bt = document.getElementById('commandTabBtn');
                if(bt) bt.click();
            }else if(playlist.tab === 2) {
                const bt = document.getElementById('objectTabBtn');
                if(bt) bt.click();
            }
        }
    }
    const c = document.getElementById("comcom") as HTMLImageElement;
    c.src = src;
    if(playlist.displayed) {
        playlist.displayed.draw();
    }
}

function setOtherForms() {
    const play = document.getElementById("newPlayForm") as HTMLFormElement|null;
    const view = document.getElementById('createPlayView');
    if(view && play && play.checkValidity()) {
        play.addEventListener('submit', (e) => {
            let name = "";
            let param: number[] = [0, 0, 0, 0];
            let fts: number[] = [0, 0, 0, 0, 0, 0];
            const color: Color = new Color(255, 255, 255, 1);
            console.log(play.elements);
            const play_name = play.elements.namedItem("play_name") as HTMLInputElement|null;
            const play_margin_top = play.elements.namedItem("margin_top") as HTMLInputElement|null;
            const play_margin_left = play.elements.namedItem("margin_left") as HTMLInputElement|null;
            const play_margin_right = play.elements.namedItem("margin_right") as HTMLInputElement|null;
            const play_margin_bottom = play.elements.namedItem("margin_bottom") as HTMLInputElement|null;
            const play_yardline = play.elements.namedItem('yardline') as HTMLSelectElement|null;
            const play_hash = play.elements.namedItem('hash') as HTMLSelectElement|null;
            const play_endzone = play.elements.namedItem('endzone') as HTMLSelectElement|null;
            const play_yards = play.elements.namedItem('yards') as HTMLInputElement|null;
            const play_start = play.elements.namedItem('start') as HTMLInputElement|null;
            const play_backcolor = play.elements.namedItem('backcolor') as HTMLInputElement|null;
            const play_width = play.elements.namedItem('width') as HTMLSelectElement|null;
            if(play_name) {
                name = play_name.value;
                play_name.value = "";
            }
            if(play_margin_top && play_margin_left && play_margin_right && play_margin_bottom) {
                fts[0] = Number(play_margin_top.value) ?? 0;
                fts[1] = Number(play_margin_left.value) ?? 0;
                fts[2] = Number(play_margin_right.value) ?? 0;
                fts[3] = Number(play_margin_bottom.value) ?? 0;
            }
            if(play_yardline && play_hash && play_endzone && play_width) {
                param[0] = Number(play_yardline.value) ?? 0;
                param[1] = Number(play_hash.value) ?? 0;
                param[2] = Number(play_endzone.value) ?? 0;
                param[3] = Number(play_width.value) ?? 2;
            }
            if(play_yards && play_start) {
                fts[4] = Number(play_yards.value) ?? 30;
                fts[5] = Number(play_start.value) ?? 0;
            }
            if(play_backcolor) {
                color.fromString(play_backcolor.value);
            }
            console.log(fts, param);
            const p = playlist.makePlay(name, param, fts);
            p.backColor = color;
            p.setBack();
            view.style.display = "none";
        });
    }
}

function setAV() {
    const av = document.getElementById('AnimationView') as HTMLDivElement|null;
    const am = document.getElementById('AnimationMain') as HTMLDivElement|null;
    const as = document.getElementById('AnimationSheet') as HTMLDivElement|null;
    const al = document.getElementById('AnimationLine') as HTMLDivElement|null;
    const anpl = document.getElementById('animationPlay') as HTMLImageElement|null;
    const anpa = document.getElementById('animationPause') as HTMLImageElement|null;
    const anst = document.getElementById('animationStop') as HTMLImageElement|null;
    const anime_open = document.getElementById('A_Anime_Open');
    const anime_close = document.getElementById('A_Anime_Close');
    if(av && am && as && al && anime_open && anime_close) {
        al.addEventListener("mousedown", (e) => {
            alY = e.clientY;
        });
        al.addEventListener("mousemove", (e) => {
            if(alY !== 0) {
                const y = alY - e.clientY;
                asHeight += y;
                as.style.height = "" + asHeight + "px";
                alY = e.clientY;
            }
        });
        al.addEventListener("mouseup", (e) => {
            alY = 0;
        });
        anime_open.addEventListener("click", () => {
            av.style.display = "flex";
            if(playlist.displayed) {
                const svg = playlist.displayed.toSVG(true);
                am.appendChild(svg);
            }
        });
        anime_close.addEventListener("click", () => {
            av.style.display = "none";
            am.innerHTML = "";
        });
    }
    if(anpl && anpa && anst) {
        anpl.addEventListener("click", (e) => {
            const anime = document.getElementById('animatebegin');
        });
    }
}