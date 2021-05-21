import $, { ajax, post } from 'jquery';
import "./enums";
import Exchangers, {
    PlayList,
    Play,
    Obj,
    Route,
    Color,
    Point,
    FRAME,
    SIZE,
    Symbol
} from './structs';
import jsPDF from 'jspdf';

interface SAMPLE {
    name: string
}
/*
$(function(){
    console.log("ABC");
    const pp = new PlayList("playlist");
    pp.makePlay("Play-01", [2, 0, 0, 2], [0, 0, 0, 10, 40, 0]);
    const obj = pp.toObj();
    const str = JSON.stringify(obj);
    post("https://script.google.com/macros/s/AKfycbzLTx2vNjUiDjWvZYnh_FiLwGnw4S6sKPGEEYw42wb6bE1nGqg/exec", {
        "manu": "save",
        "content": str,
        "name": pp.name
    }, (data) => {
        console.log(data);
    }, "text");
})//*/
function openDialog(id: string) {
    const dialog = document.getElementById(id);
    if(dialog === null) {
        return;
    }
    dialog.click();
}
const Menues = {
    openDialog(id: string, callback: Function) {
        const dialog = $(id);
        dialog.click();
    },
    newFile(num: number) {
        const url = window.location.href;
    },
    getParameters(): {[name: string]: string} {
        let qS = window.location.search;
        let ans: {[name: string]: string} = {};
        if(qS) {
            qS = qS.substring(1);
            const params = qS.split("&");
            for(let i=0;i<params.length;i++) {
                const e = params[i].split('=');
                const name = decodeURIComponent(e[0]);
                const value = decodeURIComponent(e[1]);
                ans[name] = value;
            }
        }
        return ans;
    },
    loadList(): string[] {
        let list: string[] = [];
        const text = localStorage.getItem("PM_SAVED_LIST");
        if(text) {
            list = JSON.parse(text);
        }
        return list;
    },
    saveList(p: PlayList) {
        const js = p.toObj();
        let list = this.loadList();
        if(list.indexOf(p.name) === -1) {
            list.push(p.name);
        }
        localStorage.setItem("PM_PLAYLIST_" + p.name, JSON.stringify(js));
    },
    clearPlayTab() {
        const div = document.getElementById('playTabsDiv');
        if(div) {
            div.innerHTML = "";
        }
    },
    openPlayByNexttab(name: string, from: PlayList) {
        const prev = document.getElementById('play-tab-' + name);
        if(prev) {
            prev.click();
            return;
        }
        from.oPlays.push(from.getPlay(name)!);
        const label = document.createElement("label");
        label.className = "invi";
        const input = document.createElement("input");
        input.id = "play-tab-" + name;
        input.className = "playtab";
        input.type = "radio";
        input.name = "plays";
        input.value = name;
        input.addEventListener("input", (e) => {
            const screen = document.getElementById("SettingScreen");
            if(screen) screen.style.display = "none";
            const p = from.getPlay(input.value);
            if(p) {
                p.setBack();
                from.displayed = p;
                const btns = document.getElementById('comButton' + p.command);
                if(btns) btns.click();
                from.makeLayerView();
                from.changed();
            }
        });
        label.appendChild(input);
        const d = document.createElement("div");
        const span = document.createElement("span");
        span.className = "playname";
        span.innerText = name;
        span.style.fontSize = "" + Exchangers.fontSize(name) + "px";
        const batsu = document.createElement("span");
        batsu.className = "batsu";
        batsu.innerText = "×";
        d.appendChild(span);
        d.appendChild(batsu);
        label.appendChild(d);
        const div = document.getElementById("playTabsDiv") as HTMLDivElement|null;
        if(div) {
            const i = from.oPlays.indexOf(from.getPlay(input.value)!);
            if(from.selftab > i) {
                from.selftab -= 1;
            }
            batsu.addEventListener("click", (e) => {
                if(input.checked) {
                    const next = label.nextElementSibling as HTMLElement|null;
                    if(next) next.click();
                    else {
                        const pre = label.previousElementSibling as HTMLElement|null;
                        if(pre) pre.click();
                        else this.openSettingByNextTab(from);
                    }
                }
                const py = from.getPlay(input.value);
                if(py) {
                    const ind = from.oPlays.indexOf(py);
                    from.oPlays.splice(ind, 1);
                }
                div.removeChild(label);
            });
            div.appendChild(label);
            label.click();
        }
    },
    openSettingByNextTab(playlist: PlayList) {
        const prev = document.getElementById('playlist-setting-tab');
        if(prev) {
            prev.click();
            return;
        }
        playlist.selftab = playlist.oPlays.length;
        const label = document.createElement("label");
        label.className = "invi";
        const input = document.createElement("input");
        input.id = "playlist-setting-tab";
        input.className = "playtab";
        input.type = "radio";
        input.name = "plays";
        input.value = playlist.name;
        input.addEventListener("input", (e) => {
            const screen = document.getElementById("SettingScreen");
            if(screen) screen.style.display = "block";
            const cs = document.getElementsByClassName("layerCanvas");
            for(let i=0;i<cs.length;i++) {
                (cs[i] as HTMLElement).style.display = "none";
            }
            playlist.displayed = null;
            playlist.makeLayerView();
        });
        label.appendChild(input);
        const d = document.createElement("div");
        d.className = "playtabbox";
        const span = document.createElement("span");
        span.style.fontSize = "" + Exchangers.fontSize(playlist.name) + "px";
        span.className = "playname";
        span.innerText = playlist.name;
        const batsu = document.createElement("span");
        batsu.className = "batsu";
        batsu.innerText = "×";
        d.appendChild(span);
        d.appendChild(batsu);
        label.appendChild(d);
        const div = document.getElementById("playTabsDiv") as HTMLDivElement|null;
        if(div) {
            batsu.addEventListener("click", (e) => {
                playlist.selftab = -1;
                if(input.checked) {
                    const next = label.nextElementSibling as HTMLElement|null;
                    if(next) next.click();
                    else {
                        const pre = label.previousElementSibling as HTMLElement|null;
                        if(pre) pre.click();
                        else {
                            input.id = "deleting-playlist-tab";
                            this.openSettingByNextTab(playlist);
                        }
                    }
                }
                div.removeChild(label);
            });
            div.appendChild(label);
            label.click();
        }
    }
};
export default Menues;
export class Params {
    parameter: number[];
    feets: number[];

    constructor() {
        this.parameter = [];
        this.feets = [];
    }
    fromStorage() {
        let local = localStorage;
        const text = local.getItem("PlayManager_PARAMS");
        if(text === null) {
            this.parameter = [0, 0, 0, 2];
            this.feets = [0, 0, 0, 0, 0, 0, 0, 0];
            local.setItem("PM_PARAM", JSON.stringify({
                parameter: this.parameter,
                feets: this.feets
            }));
        }else {
            const obj = JSON.parse(text);
            this.parameter = obj.parameter;
            this.feets = obj.feets;
        }
    }
}