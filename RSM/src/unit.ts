import { Player } from "./player.js";
import { Util, PlayData } from "./util.js";
import { Scene, wait } from "./undym/scene.js";
import { Color, Rect, Point } from "./undym/type.js";
import { Tec, ActiveTec, PassiveTec, TecType } from "./tec.js";
import { Dmg, Force, Action, Targeting } from "./force.js";
import { Job } from "./job.js";
import { FX_ShakeStr, FX_RotateStr, FX_Shake, FX_Str } from "./fx/fx.js";
import { ConditionType, Condition } from "./condition.js";
import { Eq, EqPos, EqEar } from "./eq.js";
import { choice } from "./undym/random.js";
import { Graphics, Font } from "./graphics/graphics.js";



class PrmSet{
    private _base:number = 0;
    get base()            {return this._base;}
    set base(value:number){this._base = value|0;}

    private _eq:number = 0;
    get eq()              {return this._eq;}
    set eq(value:number)  {this._eq = value|0;}

    private _battle:number = 0;
    get battle()            {return this._battle;}
    set battle(value:number){this._battle = value|0;}

    constructor(){}

    get total():number{
        let res = this.base + this.eq + this.battle;
        if(res < 0){return res;}
        return res;
    }
}


export class Prm{
    private static _values:Prm[] = [];
    static values():ReadonlyArray<Prm>{return this._values;}

    private static ordinalNow:number = 0;

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

    static readonly EP      = new Prm("EP");
    static readonly MAX_EP  = new Prm("最大EP");


    readonly ordinal:number;

    private constructor(_toString:string){
        this.toString = ()=>_toString;

        this.ordinal = Prm.ordinalNow++;

        Prm._values.push(this);
    }

}




export abstract class Unit{
    static readonly DEF_MAX_EP = 1;
    static readonly EAR_NUM = 2;

    private static _players:PUnit[];
    static get players():ReadonlyArray<PUnit>{return this._players;}

    private static _enemies:EUnit[];
    static get enemies():ReadonlyArray<EUnit>{return this._enemies;}

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

    static setPlayer(index:number, p:Player){
        this._players[index] = p.ins;
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
    bounds:Rect;
    tecs:Tec[] = [];
    /**戦闘時の技ページ。 */
    tecPage = 0;
    // protected prmSets = new Map<Prm,PrmSet>();
    protected prmSets:PrmSet[] = [];
    protected equips:Eq[] = [];
    protected eqEars:EqEar[] = [];
    protected conditions:{condition:Condition, value:number}[] = [];

    job:Job;

    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    constructor(){
        this.bounds = Rect.ZERO;

        for(const prm of Prm.values()){
            this.prmSets.push(new PrmSet());
        }

        this.prm(Prm.MAX_EP).base = Unit.DEF_MAX_EP;

        this.job = Job.しんまい;
        
        for(let type of ConditionType.values){
            this.conditions.push( {condition:Condition.empty, value:0} );
        }

        for(const pos of EqPos.values()){
            this.equips.push( Eq.getDef(pos) );
        }

        for(let i = 0; i < Unit.EAR_NUM; i++){
            this.eqEars.push( EqEar.getDef() );
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
    prm(p:Prm){return this.prmSets[p.ordinal] as PrmSet;}

    get hp():number      {return this.prm(Prm.HP).base;}
    set hp(value:number) {
        this.prm(Prm.HP).base = value|0;
        this.fixPrm(Prm.HP, Prm.MAX_HP);
    }
    get mp():number      {return this.prm(Prm.MP).base;}
    set mp(value:number) {
        this.prm(Prm.MP).base = value|0;
        this.fixPrm(Prm.MP, Prm.MAX_MP);
    }
    get tp():number      {return this.prm(Prm.TP).base;}
    set tp(value:number) {
        this.prm(Prm.TP).base = value|0;
        this.fixPrm(Prm.TP, Prm.MAX_TP);
    }
    get exp():number     {return this.prm(Prm.EXP).base;}
    set exp(value:number){this.prm(Prm.EXP).base = value;}

    get ep():number      {return this.prm(Prm.EP).base;}
    set ep(value:number) {
        this.prm(Prm.EP).base = value;
        this.fixPrm(Prm.EP, Prm.MAX_EP);
    }

    private fixPrm(checkPrm:Prm, maxPrm:Prm){
             if(this.prm(checkPrm).base < 0)                     {this.prm(checkPrm).base = 0;}
        else if(this.prm(checkPrm).base > this.prm(maxPrm).total){this.prm(checkPrm).base = this.prm(maxPrm).total;}
    }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    async doDmg(dmg:Dmg){
        if(!this.exists || this.dead){return;}

        const result = dmg.calc();
        const font = new Font(80, Font.BOLD);
        const p =   {
                        x:this.bounds.cx + (1 / Graphics.pixelW) * font.size * (Math.random() * 2 - 1),
                        y:this.bounds.cy + (1 / Graphics.pixelH) * font.size * (Math.random() * 2 - 1),
                    };

        if(result.isHit){
            this.hp -= result.value;
            
            FX_Shake(this.bounds);
            FX_RotateStr(font, `${result.value}`, p, Color.RED);
            Util.msg.set(`${this.name}に${result.value}のダメージ`, Color.RED.bright);
        }else{
            FX_RotateStr(font, `MISS`, p, Color.RED); 
            Util.msg.set("MISS");
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
    equip(){
        for(const prm of Prm.values()){
            this.prm(prm).eq = 0;
        }
        this.force(f=> f.equip(this));
    }
    battleStart()                                     {this.force(f=> f.battleStart(this));}
    phaseStart()                                      {this.force(f=> f.phaseStart(this));}
    beforeDoAtk(action:Action, target:Unit, dmg:Dmg)  {this.force(f=> f.beforeDoAtk(action, this, target, dmg));}
    beforeBeAtk(action:Action, attacker:Unit, dmg:Dmg){this.force(f=> f.beforeBeAtk(action, attacker, this, dmg));}
    afterDoAtk(action:Action, target:Unit, dmg:Dmg)   {this.force(f=> f.afterDoAtk(action, this, target, dmg));}
    afterBeAtk(action:Action, attacker:Unit, dmg:Dmg) {this.force(f=> f.afterBeAtk(action, attacker, this, dmg));}

    protected force(forceDlgt:(f:Force)=>void){
        for(const tec of this.tecs){
            forceDlgt( tec );
        }
        for(const eq of this.equips.values()){
            forceDlgt( eq );
        }
        for(const ear of this.eqEars.values()){
            forceDlgt( ear );
        }
        for(const cond of this.conditions.values()){
            forceDlgt( cond.condition );
        }
    }
    //---------------------------------------------------------
    //
    //Condition
    //
    //---------------------------------------------------------
    existsCondition(condition:Condition|ConditionType){
        if(condition instanceof Condition){
            return this.conditions[condition.type.ordinal].condition === condition;
        }
        if(condition instanceof ConditionType){
            return this.conditions[condition.ordinal].condition !== Condition.empty;
        }
        return false;
    }
    clearCondition(condition:Condition|ConditionType){
        if(condition instanceof Condition){
            const set = this.conditions[condition.type.ordinal];
            if(set.condition === condition){
                set.condition = Condition.empty;
            }
            return;
        }
        if(condition instanceof ConditionType){
            this.conditions[condition.ordinal].condition = Condition.empty;
            return;
        }
    }
    clearAllCondition(){
        for(const set of this.conditions){
            set.condition = Condition.empty;
            set.value = 0;
        }
    }

    setCondition(condition:Condition, value:number){
        const set = this.conditions[condition.type.ordinal];
        set.condition = condition;
        set.value = value|0;
    }

    getCondition(type:ConditionType):Condition{
        return this.conditions[type.ordinal].condition;
    }
    
    getConditionValue(condition:Condition|ConditionType):number{
        if(condition instanceof Condition){
            const set = this.conditions[condition.type.ordinal];
            if(set.condition === condition){
                return set.value;
            }
        }
        if(condition instanceof ConditionType){
            return this.conditions[condition.ordinal].value;
        }
        return 0;
    }
    /**返り値は変更しても影響なし。 */
    getConditionSet(type:ConditionType):{condition:Condition, value:number}{
        const set = this.conditions[type.ordinal];
        return {condition:set.condition, value:set.value};
    }

    addConditionValue(condition:Condition|ConditionType, value:number){
        value = value|0;

        if(condition instanceof Condition){
            const set = this.conditions[condition.type.ordinal];
            if(set.condition === condition){
                set.value += value;
                if(set.value <= 0){
                    set.condition = Condition.empty;
                }
            }
            return;
        }
        if(condition instanceof ConditionType){
            const set = this.conditions[condition.ordinal];
            set.value += value;
            if(set.value <= 0){
                set.condition = Condition.empty;
            }
            return;
        }
    }
    //---------------------------------------------------------
    //
    //Eq
    //
    //---------------------------------------------------------
    getEq(pos:EqPos):Eq            {return this.equips[pos.ordinal];}
    setEq(pos:EqPos, eq:Eq):void   {this.equips[pos.ordinal] = eq;}
    //---------------------------------------------------------
    //
    //EqEar
    //
    //---------------------------------------------------------
    getEqEar(index:number):EqEar     {return this.eqEars[index];}
    setEqEar(index:number, ear:EqEar){this.eqEars[index] = ear;}
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    /**そのユニットのパーティーメンバーを返す。withHimSelfで本人を含めるかどうか。!existsは含めない。deadは含める.*/
    getParty(withHimSelf = true):ReadonlyArray<Unit>{
        const searchMember = (units:ReadonlyArray<PUnit>|ReadonlyArray<EUnit>|ReadonlyArray<Unit>):Unit[]=>{
            let res:Unit[] = [];
            for(const u of units){
                if(!u.exists){continue;}
                if(withHimSelf && u === this){continue;}
                res.push(u);
            }
            return res;
        };

        if(this instanceof PUnit){
            return searchMember( Unit.players );
        }
        if(this instanceof EUnit){
            return searchMember( Unit.enemies );
        }
        return [];
    }
}


export class PUnit extends Unit{
    private jobLvs = new Map<Job,{lv:number, exp:number}>();
    private masteredTecs = new Map<Tec,boolean>();
    // private jobExps = new Map<Job,number>();

    constructor(readonly player:Player){
        super();

        for(let job of Job.values){
            this.jobLvs.set(job, {lv:0, exp:0});
        }

        for(let tec of ActiveTec.values){
            this.masteredTecs.set(tec, false);
        }
        for(let tec of PassiveTec.values){
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

            // for(let grow of this.job.growthPrms){
            //     this.growPrm( grow.prm, grow.value );
            // }

            if(this.prm(Prm.LV).base % 10 === 0){
                this.growPrm( Prm.MAX_MP, 1 );
                this.growPrm( Prm.MAX_TP, 1 );
            }
        }
    }

    getNextLvExp():number{
        const lv = this.prm(Prm.LV).base;
        const res = lv * (lv/20+1) * 5;
        return res|0;
    }
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
            
            for(let grow of this.job.growthPrms){
                this.growPrm( grow.prm, grow.value );
            }

            const learnings:Tec[] = this.job.learningTecs;
            const ratio = set.lv / this.job.getMaxLv();
            for(let i = 0; i < learnings.length; i++){
                if(i+1 > ((learnings.length * ratio)|0)){break;}
                if(this.isMasteredTec(learnings[i])){continue;}

                this.setMasteredTec(learnings[i], true);
                Util.msg.set(`[${learnings[i]}]を習得した！`, Color.GREEN.bright); await wait();

                //技スロットに空きがあれば覚えた技をセット
                for(let ei = 0; ei < this.tecs.length; ei++){
                    if(this.tecs[ei] === Tec.empty){
                        this.tecs[ei] = learnings[i];
                        break;
                    }
                }
            }

            if(set.lv >= this.job.getMaxLv()){
                Util.msg.set(`${this.job}を極めた！`, Color.ORANGE.bright); await wait();
                PlayData.masteredAnyJob = true;
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
        value = value|0;
        this.prm(prm).base += value;

        Util.msg.set(`[${prm}]+${value}`, Color.GREEN.bright); await wait();
    }
}






export class EUnit extends Unit{
    static readonly DEF_AI = async(attacker:Unit, targetCandidates:Unit[])=>{
        let activeTecs:ActiveTec[] = attacker.tecs.filter(tec=> tec instanceof ActiveTec) as ActiveTec[];
        if(activeTecs.length === 0){
            Tec.何もしない.use( attacker, [attacker] );
            return;
        }

        for(let i = 0; i < 7; i++){
            let tec = choice( activeTecs );
            if(tec.checkCost(attacker)){
                let targets = Targeting.filter( tec.targetings, attacker, targetCandidates, tec.rndAttackNum() );
                if(targets.length === 0){continue;}
                await tec.use( attacker, targets );
                return;
            }
        }

        Tec.何もしない.use( attacker, [attacker] );
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