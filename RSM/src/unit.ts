import { Player } from "./player.js";
import { Util, PlayData } from "./util.js";
import { Scene, wait } from "./undym/scene.js";
import { Color, Rect, Point } from "./undym/type.js";
import { Tec, ActiveTec, PassiveTec, TecType } from "./tec.js";
import { Dmg, Force, Action, Targeting } from "./force.js";
import { Job } from "./job.js";
import { FX_ShakeStr, FX_RotateStr } from "./fx/fx.js";
import { ConditionType, Condition } from "./condition.js";
import { Eq, EqPos } from "./eq.js";
import { choice } from "./undym/random.js";
import { Graphics, Font } from "./graphics/graphics.js";



class PrmSet{
    base:number = 0;
    eq:number = 0;
    battle:number = 0;

    constructor(){}

    total():number{
        let res = this.base + this.eq + this.battle;
        if(res < 0){return res;}
        return res;
    }
}


export class Prm{
    private static _values:Prm[] = [];
    static values():ReadonlyArray<Prm>{return this._values;}

    static readonly HP      = new Prm("HP");
    static readonly MAX_HP  = new Prm("最大HP");
    static readonly MP      = new Prm("MP");
    static readonly MAX_MP  = new Prm("最大MP");
    static readonly TP      = new Prm("TP");
    static readonly MAX_TP  = new Prm("最大TP");

    static readonly STR     = new Prm("力");
    static readonly MAG     = new Prm("魔");
    static readonly LIG     = new Prm("光");
    static readonly DRK     = new Prm("闇");
    static readonly CHN     = new Prm("鎖");
    static readonly PST     = new Prm("過");
    static readonly GUN     = new Prm("銃");
    static readonly ARR     = new Prm("弓");

    static readonly LV      = new Prm("Lv");
    static readonly EXP     = new Prm("Exp");



    private constructor(_toString:string){
        this.toString = ()=>_toString;

        Prm._values.push(this);
    }

}




export abstract class Unit{
    static readonly DEF_MAX_MP = 100;
    static readonly DEF_MAX_TP = 100;

    private static _players:PUnit[];
    static get players():PUnit[]{return this._players;}

    private static _enemies:EUnit[];
    static get enemies():EUnit[]{return this._enemies;}

    private static _all:Unit[];
    static get all():Unit[]{return this._all;}

    static init(){
        let player_num = 4;
        let enemy_num = 4;

        this._players = [];
        for(let i = 0; i < player_num; i++){
            this._players.push(Player.empty.ins);
        }

        this._enemies = [];
        for(let i = 0; i < enemy_num; i++){
            this._enemies.push(new EUnit());
        }

        this.resetAll();
    }

    static setPlayer(index:number, p:PUnit){
        this._players[index] = p;
        this.resetAll();
    }
    /** */
    static getFirstPlayer():PUnit{
        for(let p of this._players){
            if(p.exists){return p;}
        }
        return this._players[0];
    }

    private static resetAll(){
        this._all = [];
        for(let p of this._players){
            this._all.push(p);
        }
        for(let e of this._enemies){
            this._all.push(e);
        }
    }

    name:string = "";
    exists:boolean = false;
    dead:boolean = false;
    prmSets = new Map<Prm,PrmSet>();
    bounds:Rect;
    equips = new Map<EqPos,Eq>();
    tecs:Tec[] = [];
    /**戦闘時の技ページ。 */
    tecPage = 0;

    job:Job;

    // protected conditions = new Map<ConditionType,Condition>();
    protected conditions:Condition[] = [];
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    constructor(){
        this.bounds = Rect.ZERO;

        for(let prm of Prm.values()){
            this.prmSets.set(prm, new PrmSet());
        }

        this.job = Job.しんまい;
        
        // for(let type of ConditionType.values()){
        //     this.conditionSets.set(type, {condition:Condition.empty, value:0});
        // }

        for(let pos of EqPos.values()){
            this.equips.set(pos, Eq.getDef(pos));
        }
    }



    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    abstract isFriend(u:Unit):boolean;

    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    prm(p:Prm){return this.prmSets.get(p) as PrmSet;}

    get hp():number      {return this.prm(Prm.HP).base;}
    set hp(value:number) {
        this.prm(Prm.HP).base = value;
        this.fixPrm(Prm.HP, Prm.MAX_HP);
    }
    get mp():number      {return this.prm(Prm.MP).base;}
    set mp(value:number) {
        this.prm(Prm.MP).base = value;
        this.fixPrm(Prm.MP, Prm.MAX_MP);
    }
    get tp():number      {return this.prm(Prm.TP).base;}
    set tp(value:number) {
        this.prm(Prm.TP).base = value;
        this.fixPrm(Prm.TP, Prm.MAX_TP);
    }
    get exp():number     {return this.prm(Prm.EXP).base;}
    set exp(value:number){this.prm(Prm.EXP).base = value;}

    private fixPrm(checkPrm:Prm, maxPrm:Prm){
             if(this.prm(checkPrm).base < 0)                       {this.prm(checkPrm).base = 0;}
        else if(this.prm(checkPrm).base > this.prm(maxPrm).total()){this.prm(checkPrm).base = this.prm(maxPrm).total();}
    }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    async doDmg(dmg:Dmg){
        if(!this.exists || this.dead){return;}

        const result = dmg.calc();
        const p =   {
                        x:this.bounds.cx + (1 / Graphics.pixelW) * 20 * (Math.random() * 2 - 1),
                        y:this.bounds.cy + (1 / Graphics.pixelH) * 20 * (Math.random() * 2 - 1),
                    };

        if(result.isHit){
            this.hp -= result.value;
            
            FX_RotateStr(new Font(30, Font.BOLD), `${result.value}`, p, Color.RED); 
            Util.msg.set(`${this.name}に${result.value}のダメージ`, Color.RED.bright); await wait();
        }else{
            FX_RotateStr(new Font(30, Font.BOLD), `MISS`, p, Color.RED); 
            Util.msg.set("MISS"); await wait();
        }
    }

    async judgeDead(){
        if(!this.exists || this.dead){return;}
        if(this.prm(Prm.HP).base > 0){return;}
        
        this.dead = true;
        Util.msg.set(`${this.name}は死んだ`, Color.RED); await wait();
    }
    //---------------------------------------------------------
    //
    //force
    //
    //---------------------------------------------------------
    phaseStart()                                      {this.force(f=> f.phaseStart(this));}
    beforeDoAtk(action:Action, target:Unit, dmg:Dmg)  {this.force(f=> f.beforeDoAtk(action, this, target, dmg));}
    beforeBeAtk(action:Action, attacker:Unit, dmg:Dmg){this.force(f=> f.beforeBeAtk(action, attacker, this, dmg));}
    afterDoAtk(action:Action, target:Unit, dmg:Dmg)   {this.force(f=> f.afterDoAtk(action, this, target, dmg));}
    afterBeAtk(action:Action, attacker:Unit, dmg:Dmg) {this.force(f=> f.afterBeAtk(action, this, attacker, dmg));}

    protected force(forceDlgt:(f:Force)=>void){
        for(let tec of this.tecs){
            forceDlgt( tec );
        }
        for(let eq of this.equips.values()){
            forceDlgt( eq );
        }
    }
    //---------------------------------------------------------
    //
    //Condition
    //
    //---------------------------------------------------------
    existsCondition(type:ConditionType):boolean;
    existsCondition(c:Condition):boolean;
    existsCondition(a:any):boolean{
        if(a instanceof ConditionType){
            return this.conditions.some(c=> c.type === a);
        }
        if(a instanceof Condition){
            return this.conditions.some(c=> c.name === a.name);
        }
        return false;
    }
    clearCondition(type:ConditionType):void;
    clearCondition(c:Condition):void;
    clearCondition(a:any):void{
        if(a instanceof ConditionType){
            this.conditions = this.conditions.filter(c=> c.type !== a);
        }
        if(a instanceof Condition){
            this.conditions = this.conditions.filter(c=> c.name !== a.name);
        }
    }
    setCondition(condition:Condition){
        if(condition.type === ConditionType.INVISIBLE){
            this.conditions.push(condition);
            return;
        }

        this.conditions = this.conditions.filter(c=> c.type !== condition.type);
        this.conditions.push( condition );
    }
    getCondition(type:ConditionType):Condition  {
        let res = this.conditions.find(c=> c.type === type);
        if(res === undefined){return Condition.empty;}
        return res;
    }
    //---------------------------------------------------------
    //
    //Eq
    //
    //---------------------------------------------------------
    getEq(pos:EqPos):Eq {return this.equips.get(pos) as Eq;}
    setEq(eq:Eq):void   {this.equips.set(eq.pos, eq);}
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
}


export class PUnit extends Unit{
    readonly player:Player;
    private jobLvs = new Map<Job,{lv:number, exp:number}>();
    private masteredTecs = new Map<Tec,boolean>();
    // private jobExps = new Map<Job,number>();

    constructor(player:Player){
        super();
        this.player = player;

        for(let job of Job.values()){
            this.jobLvs.set(job, {lv:0, exp:0});
        }

        for(let tec of ActiveTec.values()){
            this.masteredTecs.set(tec, false);
        }
        for(let tec of PassiveTec.values()){
            this.masteredTecs.set(tec, false);
        }
    }

    isFriend(u:Unit):boolean{return (u instanceof PUnit);}
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    async addExp(exp:number){
        this.prm(Prm.EXP).base += exp;
        if(this.prm(Prm.EXP).base >= this.getNextLvExp()){
            this.prm(Prm.LV).base++;
            this.prm(Prm.EXP).base = 0;

            Util.msg.set(`${this.name}はLv${this.prm(Prm.LV).base}になった`, Color.ORANGE.bright); await wait();

            const growHP = this.prm(Prm.LV).base / 100 + 1;
            this.growPrm( Prm.MAX_HP, growHP|0 );

            for(let grow of this.job.getGrowthPrms()){
                this.growPrm( grow.prm, grow.value );
            }
        }
    }

    getNextLvExp():number{return Math.pow(this.prm(Prm.LV).base, 2) * 3;}
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    private getJobLvSet(job:Job):{lv:number, exp:number}{return this.jobLvs.get(job) as {lv:number, exp:number};}
    setJobExp(job:Job, exp:number){this.getJobLvSet(job).exp = exp;}
    getJobExp(job:Job):number     {return this.getJobLvSet(job).exp;}
    async addJobExp(value:number){
        if(this.isMasteredJob(this.job)){return;}

        const set = this.getJobLvSet(this.job);

        set.exp += value;
        if(set.exp >= this.job.lvupExp){
            set.lv += 1;
            set.exp = 0;

            Util.msg.set(`${this.name}の${this.job}Lvが${set.lv}になった`, Color.ORANGE.bright); await wait();
            
            for(let grow of this.job.getGrowthPrms()){
                this.growPrm( grow.prm, grow.value );
            }

            const tecs:Tec[] = this.job.getLearningTecs();
            const ratio = set.lv / this.job.getMaxLv();
            for(let i = 0; i < tecs.length; i++){
                if(i+1 > tecs.length * ratio){break;}
                if(this.isMasteredTec(tecs[i])){continue;}

                this.setMasteredTec(tecs[i], true);
                Util.msg.set(`[${tecs[i]}]を習得した！`, Color.GREEN.bright); await wait();

                //技スロットに空きがあれば覚えた技をセット
                for(let ei = 0; ei < this.tecs.length; ei++){
                    if(this.tecs[ei] === Tec.empty){
                        this.tecs[ei] = tecs[i];
                        break;
                    }
                }
            }

            if(set.lv >= this.job.getMaxLv()){
                Util.msg.set(`${this.job}を極めた！`, Color.ORANGE.bright); await wait();
                PlayData.jobChangeBtnIsVisible = true;
            }
        }
    }

    setJobLv(job:Job, lv:number){this.getJobLvSet(job).lv = lv;}
    getJobLv(job:Job):number    {return this.getJobLvSet(job).lv;}

    isMasteredJob(job:Job):boolean{return this.getJobLvSet(job).lv >= job.getMaxLv();}
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    setMasteredTec(tec:Tec, b:boolean){this.masteredTecs.set(tec, b);}
    isMasteredTec(tec:Tec):boolean{
        const b = this.masteredTecs.get(tec);
        return b === undefined ? false : b;
    }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    private async growPrm(prm:Prm, value:number){
        this.prm(prm).base += value;

        Util.msg.set(`[${prm}]+${value}`, Color.GREEN.bright); await wait();
    }
}






export class EUnit extends Unit{
    static readonly DEF_AI = async(attacker:Unit, targetCandidates:Unit[])=>{
        let activeTecs:ActiveTec[] = attacker.tecs.filter(tec=> tec instanceof ActiveTec) as ActiveTec[];
        if(activeTecs.length === 0){
            ActiveTec.何もしない.use( attacker, [attacker] );
            return;
        }

        for(let i = 0; i < 7; i++){
            let tec = choice( activeTecs );
            if(tec.checkCost(attacker)){
                let targets = Targeting.filter( tec.targetings, attacker, targetCandidates );
                if(targets.length === 0){continue;}
                await tec.use( attacker, targets );
                return;
            }
        }

        ActiveTec.何もしない.use( attacker, [attacker] );
    };

    yen:number = 0;

    ai = EUnit.DEF_AI;

    constructor(){
        super();
    }

    isFriend(u:Unit):boolean{return (u instanceof EUnit);}

    
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
}