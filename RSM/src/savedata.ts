import { Item } from "./item.js";
import { Eq, EqPos } from "./eq.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { PUnit, Prm, Unit } from "./unit.js";
import { Player } from "./player.js";
import { Tec, PassiveTec, ActiveTec } from "./tec.js";
import { Job } from "./job.js";
import { ConditionType, Condition } from "./condition.js";
import { PlayData, SceneType, Util } from "./util.js";
import { Color } from "./undym/type.js";
import { Mix } from "./mix.js";



export class Version{
    static readonly NOW = new Version(0,8,4);

    private values:number[];

    get major()     {return this.values[0];}
    get minior()    {return this.values[1];}
    get mentener()  {return this.values[2];}

    /**Integer. */
    constructor(major:number, minior:number, mentener:number){
        this.values = [major|0, minior|0, mentener|0];
    }

    isNewerThan(version:Version):boolean{
        for(let i = 0; i < this.values.length; i++){
            if(this.values[i] < version.values[i]){
                return false;
            }
            if(this.values[i] > version.values[i]){
                return true;
            }
        }

        return false;
    }

    equals(version:Version):boolean{
        for(let i = 0; i < this.values.length; i++){
            if(this.values[i] !== version.values[i]){return false;}
        }
        return true;
    }

    toString(){return `${this.major}.${this.minior}.${this.mentener}`;}
}



let saveDataVersion:Version;



export class SaveData{
    private static readonly existsSaveData = "existsSaveData";

    static exists():boolean{
        return window.localStorage.getItem(this.existsSaveData) !== null;
    }

    static delete(){
        window.localStorage.clear();
    }
    /** */
    static save(){
        if(!this.exists()){
            window.localStorage.setItem(this.existsSaveData, "true");
        }
        this.io(/*save*/true);

        Util.msg.set("セーブしました", Color.CYAN.bright);
    }
    /**全セーブデータ読み込み。 */
    static load(){
        this.io(/*save*/false);
    }

    private static io(save:boolean){
        strageSaveData(save);
        Item.values().forEach(item=> strageItem(save, item));
        Eq.values().forEach(eq=> strageEq(save, eq));
        Dungeon.values().forEach(d=> strageDungeon(save, d));
        Player.values().forEach(p=> stragePlayer(save, p));
        Mix.values().forEach(m=> strageMix(save, m));
        stragePlayData(save);
    }
}


const ioInt = (save:boolean, key:string, value:number, loadAction:(load:number)=>void)=>{
    value = value|0;
    if(save){
        window.localStorage.setItem(key, `${value}`);
    }else{
        const strage = window.localStorage.getItem(key);
        if(strage){
            const parsed:number = Number.parseInt(strage);
            if(parsed !== undefined){loadAction(parsed);}
            else                    {console.log(`ioInt(), parseFail, "${key}":${strage}`);}
        }
    }
};

const ioBool = (save:boolean, key:string, value:boolean, loadAction:(load:boolean)=>void)=>{
    if(save){
        window.localStorage.setItem(key, `${value}`);
    }else{
        const strage = window.localStorage.getItem(key);
        if(strage){
            if(strage === "true"){loadAction(true);}
            else                 {loadAction(false);}
        }
    }
};

const ioStr = (save:boolean, key:string, value:string, loadAction:(load:string)=>void)=>{
    if(save){
        window.localStorage.setItem(key, value);
    }else{
        const strage = window.localStorage.getItem(key);
        if(strage){
            loadAction(strage);
        }
    }
};


const strageSaveData = (save:boolean)=>{
    const name = `${strageSaveData.name}`;
    let major = Version.NOW.major;
    let minior = Version.NOW.minior;
    let mentener = Version.NOW.mentener;
    ioInt(save, `${name}_version_major`,    Version.NOW.major,    load=>major = load);
    ioInt(save, `${name}_version_minior`,   Version.NOW.minior,   load=>minior = load);
    ioInt(save, `${name}_version_mentener`, Version.NOW.mentener, load=>mentener = load);

    saveDataVersion = new Version(major, minior, mentener);
};


const strageItem = (save:boolean, item:Item)=>{
    const name = `${strageItem.name}_${item.uniqueName}`;
    ioInt(save, `${name}_num`,         item.num,         load=> item.num = load);
    ioInt(save, `${name}_totalGetNum`, item.totalGetNum, load=> item.totalGetNum = load);
    ioInt(save, `${name}_remainingUseCount`,     item.remainingUseCount,     load=> item.remainingUseCount = load);

    // const mix = item.mix;
    // if(mix){
    //     ioInt(save, `${name}_mixCount`, mix.count, load=> mix.count = load);
    // }
};


const strageEq = (save:boolean, eq:Eq)=>{
    const name = `${strageEq.name}_${eq.uniqueName}`;
    ioInt(save, `${name}_num`,         eq.num,         load=> eq.num = load);
    ioInt(save, `${name}_totalGetNum`, eq.totalGetNum, load=> eq.totalGetNum = load);
    
    // const mix = eq.mix;
    // if(mix){
    //     ioInt(save, `${name}_mixCount`, mix.count, load=> mix.count = load);
    // }
}


const strageDungeon = (save:boolean, d:Dungeon)=>{
    const name = `${strageDungeon.name}_${d.uniqueName}`;
    ioInt(save, `${name}_clearNum`,         d.clearNum,         load=> d.clearNum = load);
};


const stragePlayer = (save:boolean, p:Player)=>{
    const name = `${stragePlayer.name}_${p.uniqueName}`;

    ioBool(save, `${name}_player_member`, p.member, load=> p.member = load);

    const u = p.ins;
    ioBool(save, `${name}_exists`, u.exists, load=> u.exists = load);
    ioBool(save, `${name}_dead`, u.dead, load=> u.dead = load);
    for(const prm of Prm.values()){
        ioInt(save, `${name}_prm_${prm}_base`,   u.prm(prm).base|0,   load=> u.prm(prm).base = load);
        ioInt(save, `${name}_prm_${prm}_eq`,     u.prm(prm).eq|0,     load=> u.prm(prm).eq = load);
        ioInt(save, `${name}_prm_${prm}_battle`, u.prm(prm).battle|0, load=> u.prm(prm).battle = load);
    }
    for(const pos of EqPos.values()){
        ioStr(save, `${name}_eq_${pos}`, u.getEq(pos).uniqueName, load=>{
            const eq = Eq.valueOf(load);
            if(eq){u.setEq(pos, eq);}
        })
    }

    ioStr(save, `${name}_job`, u.job.uniqueName, load=>{
        const job = Job.valueOf(load);
        if(job){
            u.job = job;
        }
    });

    let tecLen = u.tecs.length;
    ioInt(save, `${name}_tec_length`, u.tecs.length, load=> tecLen = load);

    u.tecs.length = tecLen;
    for(let i = 0; i < u.tecs.length; i++){
        if(!u.tecs[i]){
            u.tecs[i] = Tec.empty;
        }
    }

    for(let i = 0; i < tecLen; i++){
        const isPassiveKey = `${name}_tec_${i}_isPassive`;
        let isPassive:boolean = u.tecs[i] instanceof PassiveTec;
        ioBool(save, isPassiveKey, isPassive, load=> isPassive = load);

        const key = `${name}_tec_${i}`;
        const value = u.tecs[i].uniqueName;

        ioStr(save, key, value, load=>{
            if(isPassive){
                const loadTec = PassiveTec.valueOf(load);
                if(loadTec){u.tecs[i] = loadTec;}
            }else{
                const loadTec = ActiveTec.valueOf(load);
                if(loadTec){u.tecs[i] = loadTec;}
            }
        });
    }

    for(const tec of PassiveTec.values()){
        ioBool(save, `${name}_masteredPassiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load=>{
            u.setMasteredTec(tec, load);
        });
    }
    for(const tec of ActiveTec.values()){
        ioBool(save, `${name}_masteredActiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load=>{
            u.setMasteredTec(tec, load);
        });
    }

    for(const job of Job.values()){
        ioInt(save, `${name}_${job.uniqueName}_exp`, u.getJobExp(job), load=>{
            u.setJobExp(job, load);
        })
        ioInt(save, `${name}_${job.uniqueName}_lv`, u.getJobLv(job), load=>{
            u.setJobLv(job, load);
        })
    }

    {//condition
        let savedConditions:{condition:Condition, value:number}[] = [];
        for(const type of ConditionType.values()){
            const set = u.getConditionSet(type);
            const loadSet = {condition:Condition.empty, value:0};
            ioStr(save, `${name}_condition_${type.uniqueName}_condition`, set.condition.uniqueName, load=>{
                const condition = Condition.valueOf(load);
                if(condition){
                    loadSet.condition = condition;
                }
            });
            ioInt(save, `${name}_condition_${type.uniqueName}_value`, set.value, load=> loadSet.value = load);

            savedConditions.push(loadSet);
        }
        if(!save){
            for(let set of savedConditions){
                u.setCondition( set.condition, set.value );
            }
        }
    }
};



const strageMix = (save:boolean, mix:Mix)=>{
    const name = `${strageMix.name}_${mix.uniqueName}`;
    ioInt(save, `${name}_count`, mix.count, load=> mix.count = load);
};


const stragePlayData = (save:boolean)=>{
    const name = `${stragePlayData.name}`;
    ioInt(save, `${name}_yen`, PlayData.yen, load=> PlayData.yen = load);
    ioBool(save, `${name}_masteredAnyJob`, PlayData.masteredAnyJob, load=> PlayData.masteredAnyJob = load);
    ioBool(save, `${name}_gotAnyEq`, PlayData.gotAnyEq, load=> PlayData.gotAnyEq = load);
    ioStr(save, `${name}_dungeonNow`, Dungeon.now.uniqueName, load=>{
        const dungeon = Dungeon.valueOf(load);
        if(dungeon){
            Dungeon.now = dungeon;
        }
    });
    ioInt(save, `${name}_dungeonAU`, Dungeon.auNow, load=> Dungeon.auNow = load);
    ioStr(save, `${name}_sceneType`, SceneType.now.uniqueName, load=>{
        const type = SceneType.valueOf(load);
        if(type){
            type.loadAction();
        }else{
            SceneType.TOWN.set();
            SceneType.TOWN.loadAction();
        }
    });

    for(let i = 0; i < Unit.players.length; i++){
        ioStr(save, `${name}_players_${i}`, Unit.players[i].player.uniqueName, load=>{
            const p = Player.valueOf(load);
            if(p){
                Unit.setPlayer( i, p );
            }
        });
    }
};

