
export enum IMAGETYPE {
    png,
    jpeg,
    gif,
    pdf,
    svg
}
export const imageTypeText = ["image/png", "image/jpeg", "image/gif", "application/pdf"];
export enum ITEMKIND {
    playlist,
    play,
    player,
    object,
    text,
    folder,
    layer,
    history,
    route
}
export enum PARAM {
    yardline,
    hashkind,
    endzone,
    linewidth
}
export enum FEETS {
    up,
    left,
    right,
    down,
    yards,
    startwith
}
export enum COVER {
    none,
    fill,
    right,
    left,
    center,
    edge,
    X,
    dash,
    reverse
}
export enum YARDLINE {
    none,
    line,
    zero,
    num
}
export enum HASHKIND {
    college,
    highscool,
    pro
}
export enum ENDZONE {
    none,
    both,
    top,
    bottom
}
export enum LINEWIDTH {
    thin,
    medium,
    thick
}
export enum COMMANDS {
    select,
    route,
    move,
    relation,
    grip,
    erase,
    object,
    text,
    line
}
export enum OPERATION {
    open,
    change_name,
    select,
    route,
    move,
    relation,
    routemove,
    erase,
    oadd,
    tadd,
    delete
}


/*////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

                                                interface

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////*/


export interface IMAGE_DATA {
    name: string,
    data: string
}
export interface HIERARCHY {
    kind: ITEMKIND,
    text: string,
    children: HIERARCHY[],
    num: string,
    open: boolean
}
export interface SIZEC {
    width: number;
    height: number;
}
export interface FRAMEC {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ColorC {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
export interface RelationC {
    from: number,
    to: number,
    kind: number,
    width: number,
    color: ColorC,
    space: number,
    layerId: string
}
export interface RouteC {
    pos: number[][],
    color: ColorC,
    kind: number,
    head: number,
    lineWidth: number,
    headsize: number,
    speed: number,
    children: RouteC[],
    visible: boolean
}
export interface ObjC {
    name: string,
    Position: number[],
    symbolName: string,
    cover: number,
    route: RouteC[],
    mainRoute: number[],
    rot: number,
    fl: boolean,
    width: number,
    height: number,
    text: string,
    fName: string,
    invisible: boolean,
    applying: boolean,
    clip: boolean,
    back: ColorC,
    color: ColorC,
    layer: string,
    folder: string,
    opened: boolean,
    id: number,
    rel: RelationC[],
    symbol: number
}
export interface TEXT {
    pos: number[];
    string: string;
    color: ColorC;
    size: number;
    fontName: string;
    angle: number;
    layer: string;
    folder: string;
    bold: boolean;
    italic: boolean;
    width: number;
}
export interface PlayC {
    name: string,
    players: ObjC[],
    backColor: ColorC,
    para: number[],
    fts: number[],
    los: number,
    texts: TEXT[],
    images: IMAGE_DATA[],
    relations: RelationC[],
    setting: ComSet,
    maxLayer: number,
    layers: LAYER[],
    folders: FOLDER[],
    maxFolder: number,
    opened: boolean,
    openedFolder: boolean[],
    baselineH: number[],
    baselineV: number[],
    maxId: number
}
export interface PlayListC {
    name: string,
    plays: PlayC[],
    images: IMAGE_DATA[],
    setting: Setting,
    openedPlays: string[],
    openedPlay: number,
    opened: boolean
}

export interface ComSet {
    symbolName: string,
    symbolCover: COVER,
    mainColor: ColorC,
    subColor: ColorC,
    isFlipped: boolean,
    objectRot: number,
    objectWidth: number,
    objectHeight: number,
    objectLayerId: string,
    objectFolderId: string,
    objectText: string,
    lineKind: number,
    lineHead: number,
    lineWidth: number,
    lineColor: ColorC,
    fontName: string,
    textSize: number,
    textBold: boolean,
    textItalic: boolean,
    textColor: ColorC,
    textRot: number,
    text: string,
    textLayerId: string,
    textFolderId: string,
    baselineH: boolean,
    baselineV: boolean,
    adaptBaseline: boolean[],
    relKind: number,
    relWidth: number,
    relColor: ColorC,
    relSpace: number,
    relLayerId: string,
    gripKind: number
}
export interface FOLDER {
    name: string,
    id: string
}
export interface LAYER {
    name: string,
    id: string,
    visible: boolean,
    lock: boolean
}
export interface HISTORYC {
    timestamp: string,
    operation: string,
    history: string,
    children: HISTORYC[]
}
export interface PlayHistory {
    name: string,
    players: ObjC[],
    backColor: ColorC,
    texts: TEXT[],
    parameter: number[],
    feets: number[],
    folders: FOLDER[],
    layers: LAYER[],
    selectedObj: number[],
    selectedText: number[],
    relations: RelationC[],
    maxLayer: number
}
export interface PlaylistHistory {
    name: string,
    plays: PlayHistory,
    setting: Setting
}
export interface Setting {
    newPlayflag: boolean,
    playName: string,
    zeroNum: number,
    parameter: number[],
    feets: number[],
    bgColor: ColorC
}