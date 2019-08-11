import { Scene, wait, cwait } from "../undym/scene.js";
import { Place, Util, PlayData, SceneType } from "../util.js";
import { DrawSTBoxes, DrawDungeonData, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { VariableLayout, ILayout, Layout, YLayout, RatioLayout, FlowLayout } from "../undym/layout.js";
import { Rect, Color, Point } from "../undym/type.js";
import { Unit, PUnit, Prm, EUnit } from "../unit.js";
import { Battle, BattleResult, BattleType } from "../battle.js";
import { Tec, ActiveTec, PassiveTec, TecType } from "../tec.js";
import { Input } from "../undym/input.js";
import { Btn } from "../widget/btn.js";
import { Targeting, Action } from "../force.js";
import { Player } from "../player.js";
import DungeonScene from "./dungeonscene.js";
import DungeonEvent from "../dungeon/dungeonevent.js";
import { FX } from "../fx/fx.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { TownScene } from "./townscene.js";
import { List } from "../widget/list.js";
import { randomInt } from "../undym/random.js";
import { Item } from "../item.js";
import { ItemScene } from "./itemscene.js";
import { Font, Graphics } from "../graphics/graphics.js";

let btnSpace:Layout;


export class BattleScene extends Scene{
    private static _ins:BattleScene;
    static get ins():BattleScene{return this._ins ? this._ins : (this._ins = new BattleScene());}


    private tecInfo:{tec:Tec|undefined, user:Unit} = {tec:undefined, user:Unit.players[0]};
    // private infoTec:Tec|undefined;
    private battleResult:BattleResult;

    private constructor(){
        super();

        btnSpace = new Layout();
    }


    init(){

        super.clear();

        super.add(Place.TOP, DrawPlayInfo.ins);

        super.add(Place.DUNGEON_DATA, new VariableLayout(()=>{
            if(!this.tecInfo.tec || this.tecInfo.tec === Tec.empty){return DrawDungeonData.ins;}
            return ILayout.empty;
        }));
        super.add(Place.DUNGEON_DATA, ILayout.create({draw:(bounds)=>{
            if(!this.tecInfo.tec || this.tecInfo.tec === Tec.empty){return;}

            const tec = this.tecInfo.tec;
            const f = Font.def;
            let p = bounds.upperLeft;

            f.draw( `[${tec}]`, p, Color.GREEN );
            
            p = p.move(0,f.ratioH);
            if(tec instanceof ActiveTec){
                let mpW = 0;
                const user = this.tecInfo.user;
                if(tec.mpCost > 0){
                    let col = tec.mpCost <= user.prm(Prm.MP).base ? Color.WHITE : Color.GRAY;
                    const s = `MP:${tec.mpCost} `;
                    mpW = f.measureRatioW(s);
                    f.draw(s, p, col);
                }

                if(tec.tpCost > 0){
                    let col = tec.tpCost <= user.prm(Prm.TP).base ? Color.WHITE : Color.GRAY;
                    f.draw(`TP:${tec.tpCost}`, p.move(mpW, 0), col);
                }
            }else{
            }

            for(let s of tec.info){
                f.draw(s, p = p.move(0, f.ratioH), Color.WHITE);
            }
        }}));

        super.add(Place.MSG, Util.msg);

        super.add(Place.BTN, btnSpace);

        super.add(Place.E_BOX, DrawSTBoxes.enemies);
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.MAIN, DrawUnitDetail.ins);

        super.add(Rect.FULL, ILayout.create({draw:(noUsed)=>{
            if(!Battle.getPhaseUnit().exists){return;}

            Graphics.fillRect(Battle.getPhaseUnit().bounds, new Color(0,1,1,0.2));
        }}));


        super.add(Rect.FULL, ILayout.create({ctrl:async(noUsed)=>{
            if(Battle.start){
                Battle.start = false;
                
                SceneType.BATTLE.set();

                await this.phaseEnd();
                return;
            }
        }}));
    }

    private async phaseEnd(){
        for(let u of Unit.all){
            await u.judgeDead();
        }

        if(Unit.players.every(u=> !u.exists || u.dead)){
            await lose();
            return;
        }
        if(Unit.enemies.every(u=> !u.exists || u.dead)){
            await win();
            return;
        }

        Battle.phase = (Battle.phase + 1) % Unit.all.length;
        if(Battle.phase === Battle.firstPhase){
            Battle.turn++;
            Util.msg.set(`----------${Battle.turn}ターン目----------`, Color.L_GRAY); await wait();
        }

        let attacker = Battle.getPhaseUnit();

        if(!attacker.exists || attacker.dead){
            this.phaseEnd();
            return;
        }

        Util.msg.set(`${attacker.name}`, Color.ORANGE);
        Util.msg.add(`の行動`);

        attacker.prm(Prm.TP).base += 10;
        attacker.phaseStart();

        if(attacker instanceof PUnit){
            this.setPlayerPhase(attacker);
            return;
        }else{
            let e = attacker as EUnit;
            await e.ai(e, Unit.all);
            this.phaseEnd();
            return;
        }

    }


    

    private setPlayerPhase(attacker:Unit):void{


        const createTecBtn = (tec:Tec)=>{
            let btn:Btn;
            if(tec instanceof ActiveTec){
                btn = new Btn(tec.toString(), async()=>{
                    this.tecInfo.tec = undefined;
        
                    if(tec.targetings & Targeting.SELECT){
        
                        Util.msg.set(`[${tec}]のターゲットを選択してください`);
                        
                        this.setChooseTargetBtn(attacker, async(targets)=>{
                            Util.msg.set(`＞${targets[0].name}を選択`);
                            await tec.use(attacker, targets);
                            this.phaseEnd();
                        });
        
                        return;
                    }else{
                        let targets = Targeting.filter( tec.targetings, attacker, Unit.all );
                        await tec.use(attacker, targets);
                        this.phaseEnd();
                    }
                });

                if(!tec.checkCost(attacker)){
                    btn.groundColor = ()=>Color.GRAY;
                    btn.stringColor = ()=>Color.D_RED;
                }
            }else if(tec instanceof PassiveTec){
                btn = new Btn(`-${tec}-`, ()=>{

                });
                btn.groundColor = ()=>Color.D_GRAY;
                btn.stringColor = ()=>Color.L_GRAY;
            }else{
                return ILayout.empty;
            }
            return new Layout()
                    .add(btn)
                    .add(ILayout.create({ctrl:(bounds)=>{
                        if(bounds.contains(Input.point) && Input.holding() >= 4){
                            this.tecInfo.tec = tec;
                            this.tecInfo.user = attacker;
                        }
                    }}))
                    ;
        };
    

        const w = 4;
        const h = 3;
        const l = new FlowLayout(w,h);
        const drawOnePage = w * (h-1);

        for(let i = attacker.tecPage * drawOnePage; i < (attacker.tecPage+1) * drawOnePage; i++){
            if(i >= attacker.tecs.length){break;}

            l.add( createTecBtn(attacker.tecs[i]) );
        }

        l.addFromLast(new Btn("ITEM", ()=>{
            Scene.load( ItemScene.ins({
                user:attacker,
                selectUser:false,
                use:async(item, user)=>{
                    if(item.targetings & Targeting.SELECT){
                        Util.msg.set(`[${item}]のターゲットを選択してください`);

                        this.setChooseTargetBtn(attacker, async(targets)=>{
                            await item.use( user, targets );
                            this.phaseEnd();
                        });
                    }else{
                        let targets = Targeting.filter( item.targetings, user, Unit.players );
                        
                        if(targets.length > 0){
                            Scene.set(this);
                            await item.use( user, targets );
                            await this.phaseEnd();
                        }
                    }
                },
                returnScene:()=>{
                    Scene.set( BattleScene.ins );
                },
            }))
        }));

        l.addFromLast(new Btn("何もしない", async()=>{
            await ActiveTec.何もしない.use( attacker, [attacker] );
            await this.phaseEnd();
        }));

        const tecPageLim = ((attacker.tecs.length - 1) / drawOnePage)|0;
        const newerTecPage = new Btn(">", ()=>{
            attacker.tecPage++;
            this.setPlayerPhase( attacker );
        });
        l.addFromLast(new VariableLayout(()=>{
            return attacker.tecPage < tecPageLim ? newerTecPage : ILayout.empty;
        }));
        const olderTecPage = new Btn("<", ()=>{
            attacker.tecPage--;
            this.setPlayerPhase( attacker );
        });
        l.addFromLast(new VariableLayout(()=>{
            return attacker.tecPage > 0 ? olderTecPage : ILayout.empty;
        }));

        btnSpace.clear();
        btnSpace.add(l);
    }


    private setChooseTargetBtn(attacker:Unit, chooseAction:(targets:Unit[])=>void){

        const l = new FlowLayout(4,3);
        const addBtn = (unit:Unit)=>{
            if(!unit.exists){
                l.add(ILayout.empty);
                return;
            }

            const btn = new Btn(unit.name, ()=>{
                chooseAction([unit]);
            })
            if(unit.dead){
                btn.groundColor = ()=>Color.D_RED;
            }
            l.add(btn);
        }
        for(let e of Unit.enemies){
            addBtn(e);
        }
        for(let p of Unit.players){
            addBtn(p);
        }
        
        l.addFromLast(new Btn("<<", ()=>{
            Util.msg.set("＞キャンセル");
            this.setPlayerPhase(attacker);
        }));

        
        btnSpace.clear();
        btnSpace.add(l);
    }
}



const win = async()=>{
    Battle.result = BattleResult.WIN;
    Util.msg.set("勝った"); await wait();


    {
        let exp = 0;
        Unit.enemies
            .filter(e=> e.exists)
            .forEach(e=> exp += e.prm(Prm.EXP).base);

        exp = exp|0;
        Util.msg.set(`${exp}の経験値を入手`, Color.CYAN.bright); await wait();

        for(let p of Unit.players.filter(p=> p.exists)){
            await p.addExp( exp );
        }
    }
    {
        let exp = 0;
        Unit.enemies
            .filter(e=> e.exists)
            .forEach(e=> exp += 1);
        for(let p of Unit.players.filter(p=> p.exists)){
            await p.addJobExp( exp );
        }
    }
    {
        let yen = 0;
        Unit.enemies
            .filter(e=> e.exists)
            .forEach(e=> yen += e.yen);
        yen = yen|0;
        PlayData.yen += yen;
        Util.msg.set(`${yen}円入手`, Color.YELLOW.bright); await wait();
    }

    await finish();
    await Battle.battleEndAction(BattleResult.WIN);
};


const lose = async()=>{
    Battle.result = BattleResult.LOSE;
    Util.msg.set("負けた"); await wait();

    if(Battle.type === BattleType.NORMAL){
        const lostYen = (PlayData.yen / 3)|0;
        PlayData.yen -= lostYen;
        Util.msg.set(`${lostYen}円失った...`, (cnt)=>Color.RED); await wait();
    }

    await finish();
    await Battle.battleEndAction(BattleResult.LOSE);
};


const finish = async()=>{
    for(let e of Unit.enemies){
        e.exists = false;
    }

    btnSpace.clear();
}