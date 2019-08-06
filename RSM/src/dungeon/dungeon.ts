
import DungeonEvent from "./dungeonevent.js";
import { Rect } from "../undym/type.js";
import { Job } from "../job.js";
import { Unit, EUnit, Prm } from "../unit.js";
import { Btn } from "../widget/btn.js";
import { Tec } from "../tec.js";
import { Item } from "../item.js";
import { Num } from "../mix.js";


export abstract class Dungeon{
    private static _values:Dungeon[] = [];
    static values():ReadonlyArray<Dungeon>{
        return this._values;
    }

    private static _valueOf:Map<string,Dungeon>;
    static valueOf(uniqueName:string){
        if(!this._valueOf){
            this._valueOf = new Map<string,Dungeon>();

            for(const d of this.values()){
                this._valueOf.set( d.uniqueName, d );
            }
        }
        return this._valueOf.get(uniqueName);
    }


    static now:Dungeon;
    static auNow:number = 0;

    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------


    clearNum:number = 0;

    readonly uniqueName:string;
    readonly rank:number;
    readonly enemyLv:number;
    readonly au:number;
    readonly clearItem:()=>Num;
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    private constructor(args:{
        uniqueName:string,
        rank:number,
        enemyLv:number,
        au:number,
        clearItem:()=>Num,
    }){
        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;

        this.rank       = args.rank;
        this.enemyLv    = args.enemyLv;
        this.au         = args.au;
        this.clearItem = args.clearItem;

        Dungeon._values.push(this);
    }

    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    abstract isVisible():boolean;
    abstract setBossInner():void;
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent():DungeonEvent{
        if(Math.random() <= 0.20){return DungeonEvent.BOX;}
        if(Math.random() <= 0.20){return DungeonEvent.BATTLE;}
        if(Math.random() <= 0.04){return DungeonEvent.TRAP;}
        return DungeonEvent.empty;
    }

    rndEnemyNum():number{
        const prob = 1.0 - (this.rank + 4) / (this.rank * this.rank + 5);
        let num = 0;
        for(let i = 0; i < Unit.enemies.length; i++){
            if(Math.random() <= prob){
                num++;
            }
        }
        return num === 0 ? 1 : num;
    }

    setEnemy(){
        let enemyNum = this.rndEnemyNum();
        for(let i = 0; i < enemyNum; i++){
            this.setEnemyInner( Unit.enemies[i] );
        }
    }

    setEnemyInner(e:EUnit){
        let lv = (Math.random() * 0.5 + 0.75) * this.enemyLv;
        let job = Job.rndJob(lv);
        job.setEnemy( e, lv );
    }

    setBoss(){
        for(let e of Unit.enemies){
            this.setEnemyInner(e);

            e.prm(Prm.MAX_HP).base *= 3;
            e.hp = e.prm(Prm.MAX_HP).total();
        }

        this.setBossInner();

        for(let e of Unit.enemies){
            e.prm(Prm.HP).base = e.prm(Prm.MAX_HP).total();
        }
    }
    

    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    static readonly                      はじまりの丘:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"はじまりの丘",
                                rank:0, enemyLv:1, au:50,
                                clearItem:()=>Item.勾玉,
        });}
        isVisible = ()=>true;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 30;
            e.prm(Prm.STR).base = 7;
        };
    };
    static readonly                      丘の上:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"丘の上",
                                rank:1, enemyLv:3, au:100,
                                clearItem:()=>Item.石,
        });}
        isVisible = ()=>Dungeon.はじまりの丘.clearNum > 0;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.剣士.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 50;
            e.prm(Prm.STR).base = 10;
        };
    };
    

    // static readonly          test:Dungeon = new class extends Dungeon{
    //     constructor(){super("test",/*rank*/0,/*lv*/1,/*au*/50);}
    //     getArea   = ()=>DungeonArea.黒地域;
    //     getBounds = ()=>new Rect(0.35, 0.4, 0.3, 0.2);
    //     isVisible = ()=>true;
    //     setBossInner = ()=>{
    //         let e = Unit.enemies[0];
    //         e.name = "ボス";
    //         e.prm(Prm.MAX_HP).base = 30;
    //         e.prm(Prm.STR).base = 7;
    //     };
    // };
    // static readonly          はじまりの丘2:Dungeon = new class extends Dungeon{
    //     constructor(){super("はじまりの丘2",/*rank*/0,/*lv*/3,/*au*/50);}

    //     getBounds = ()=>new Rect(0, 0.4, 0.3, 0.15);
    //     isVisible = ()=>true;
    // };
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
}

