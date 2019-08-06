import { Rect, Color } from "./undym/type.js";
import Msg from "./widget/msg.js";
import { XLayout } from "./undym/layout.js";
import { Unit } from "./unit.js";
import { Graphics } from "./graphics/graphics.js";
import { Scene } from "./undym/scene.js";
import { TownScene } from "./scene/townscene.js";
import DungeonScene from "./scene/dungeonscene.js";
import { Dungeon } from "./dungeon/dungeon.js";


export class Debug{
    static readonly DEBUG = true;

    static btnIsVisible = false;
}


export class Util{
    private constructor(){}

    static readonly VERSION = "0.0.13";

    static msg:Msg;

    static init(){
        this.msg = new Msg();
    }
}


export class Place{
    private constructor(){}
    
    private static ST_H = 0.125;

    private static get dotW(){return 1 / Graphics.pixelW;}
    private static get dotH(){return 1 / Graphics.pixelH;}

    
    private static e_box:Rect;
    static get E_BOX(){return this.e_box ? this.e_box : 
        (this.e_box = new Rect(this.dotW, this.dotH, 1 - this.dotW * 2, this.ST_H));}
    private static main:Rect;
    static get MAIN(){return this.main ? this.main : 
        (this.main = new Rect(this.dotW, this.E_BOX.yh, 1 - this.dotW * 2, 0.35 ))}
    private static msg:Rect;
    static get MSG(){return this.msg ? this.msg : 
        (this.msg = new Rect(this.MAIN.x, this.MAIN.y + 1 / Graphics.pixelW, this.MAIN.w, this.MAIN.h * 0.7));}

    private static p_box:Rect;
    static get P_BOX(){return this.p_box ? this.p_box : 
        (this.p_box = new Rect(this.dotW, this.MAIN.yh, 1 - this.dotW * 2, this.ST_H));}
        
    private static btn:Rect;
    static get BTN(){return this.btn ? this.btn : 
        (this.btn = new Rect(this.dotW, this.P_BOX.yh, 1 - this.dotW * 2, 1 - this.P_BOX.yh));}
        
    private static dungeon_data:Rect;
    static get DUNGEON_DATA(){return this.dungeon_data ? this.dungeon_data : 
        (this.dungeon_data = new Rect(this.MAIN.x + this.MAIN.w * 0.05, this.MSG.yh, this.MAIN.w * 0.9, this.MAIN.h - this.MSG.h - this.dotH));}
    
}


export class PlayData{
    private constructor(){}

    static yen:number = 0;
    /**職業変更ボタンの出現フラグ。 */
    static masteredAnyJob = false;
}


export class SceneType{
    private static _valueOf:Map<string,SceneType>;
    static valueOf(uniqueName:string){
        return this._valueOf.get(uniqueName);
    }

    static now:SceneType;

    /**
     * actionLoadSaveData: 読み込み時の処理。
     */
    private constructor(
        public readonly uniqueName:string,
        public readonly loadAction:()=>void,
    ){
        if(!SceneType._valueOf){
            SceneType._valueOf = new Map<string,SceneType>();
        }

        SceneType._valueOf.set( uniqueName, this );
    }

    set(){
        SceneType.now = this;
    }

    static TOWN = new SceneType("TOWN", ()=> Scene.load( TownScene.ins ));
    static DUNGEON = new SceneType("DUNGEON", ()=>{
        Scene.load( DungeonScene.ins )
    });
    static BATTLE = new SceneType("BATTLE", ()=>{
        const lost = (PlayData.yen / 4)|0;
        PlayData.yen -= lost;
        Util.msg.set(`---強制終了ペナルティ-${lost}円---`, Color.RED.bright);
        Scene.load( DungeonScene.ins );
    });
}