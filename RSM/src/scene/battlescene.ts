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
    private battleResult:BattleResult;

    private constructor(){
        super();

        btnSpace = new Layout();
    }


    init(){

        super.clear();

        super.add(Place.TOP, DrawPlayInfo.ins);

        const drawBG:(bounds:Rect)=>void = (()=>{
            if(Battle.type === BattleType.BOSS){
                return createBossBG();
            }
            if(Battle.type === BattleType.EX){
                return createExBG();
            }
            return (bounds)=>{};
        })();
        super.add(Place.MAIN, ILayout.create({draw:(bounds)=>{
            Graphics.clip(bounds, ()=>{
                drawBG(bounds);
            });
        }}));

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
                let tpW = 0;
                const user = this.tecInfo.user;
                if(tec.mpCost > 0){
                    let col = tec.mpCost <= user.mp ? Color.WHITE : Color.GRAY;
                    const s = `MP:${tec.mpCost} `;
                    f.draw(s, p, col);
                    mpW = f.measureRatioW(s);
                }

                if(tec.tpCost > 0){
                    let col = tec.tpCost <= user.tp ? Color.WHITE : Color.GRAY;
                    const s = `TP:${tec.tpCost} `;
                    f.draw(s, p.move(mpW, 0), col);
                    tpW = f.measureRatioW(s);
                }

                if(tec.epCost > 0){
                    let col = tec.epCost <= user.ep ? Color.WHITE : Color.GRAY;
                    f.draw(`EP:${tec.epCost}`, p.move(tpW, 0), col);
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

        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            if(!Battle.getPhaseUnit().exists){return;}

            Graphics.fillRect(Battle.getPhaseUnit().bounds, new Color(0,1,1,0.2));
        }}));


        super.add(Rect.FULL, ILayout.create({ctrl:async(bounds)=>{
            if(Battle.start){
                Battle.start = false;
                SceneType.BATTLE.set();
                //init
                for(const u of Unit.all){
                    u.tp = 0;
                }

                for(const u of Unit.all){
                    u.battleStart();
                }

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
            await this.phaseEnd();
            return;
        }

        Util.msg.set(`${attacker.name}の行動`, Color.ORANGE);

        attacker.prm(Prm.TP).base += 10;
        attacker.phaseStart();

        for(const u of Unit.all){
            u.judgeDead();
        }
        if(attacker.dead){
            await this.phaseEnd();
            return;
        }

        if(attacker instanceof PUnit){
            await this.setPlayerPhase(attacker);
            return;
        }else{
            let e = attacker as EUnit;
            await e.ai(e, Unit.all);
            await this.phaseEnd();
            return;
        }

    }


    

    private async setPlayerPhase(attacker:Unit){
        const createTecBtn = (tec:Tec)=>{
            let btn:Btn;
            if(tec instanceof ActiveTec){
                btn = new Btn(tec.toString(), async()=>{
                    this.tecInfo.tec = undefined;
                    
                    if(tec.targetings & Targeting.SELECT){
        
                        Util.msg.set(`[${tec}]のターゲットを選択してください`);
                        
                        await this.setChooseTargetBtn(attacker, async(targets)=>{
                            if(
                                   !targets[0].dead 
                                || (tec.targetings & Targeting.WITH_DEAD || tec.targetings & Targeting.ONLY_DEAD)
                            ){
                                Util.msg.set(`＞${targets[0].name}を選択`);
                                await tec.use(attacker, new Array<Unit>( tec.rndAttackNum() ).fill( targets[0] ));
                                await this.phaseEnd();
                            }
                        });
        
                        return;
                    }else{
                        let targets:Unit[] = [];
                        targets = targets.concat( Targeting.filter( tec.targetings, attacker, Unit.all, tec.rndAttackNum() ) );
                        await tec.use(attacker, targets);
                        await this.phaseEnd();
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
                        if(bounds.contains(Input.point) && Input.holding >= 4){
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

        l.addFromLast(new Btn("ITEM", async()=>{
            Scene.load( ItemScene.ins({
                user:attacker,
                selectUser:false,
                use:async(item, user)=>{
                    Scene.set(this);

                    if(item.targetings & Targeting.SELECT){
                        Util.msg.set(`[${item}]のターゲットを選択してください`);

                        this.setChooseTargetBtn(attacker, async(targets)=>{
                            await item.use( user, targets );
                            await this.phaseEnd();
                        });
                    }else{
                        let targets = Targeting.filter( item.targetings, user, Unit.players, /*num*/1 );
                        
                        await item.use( user, targets );
                        await this.phaseEnd();
                    }
                },
                returnScene:()=>{
                    Scene.set( BattleScene.ins );
                },
            }))
        }));

        l.addFromLast(new Btn("何もしない", async()=>{
            await Tec.何もしない.use( attacker, [attacker] );
            await this.phaseEnd();
        }));

        const tecPageLim = ((attacker.tecs.length - 1) / drawOnePage)|0;
        const newerTecPage = new Btn(">", async()=>{
            attacker.tecPage++;
            await this.setPlayerPhase( attacker );
        });
        l.addFromLast(new VariableLayout(()=>{
            return attacker.tecPage < tecPageLim ? newerTecPage : ILayout.empty;
        }));
        const olderTecPage = new Btn("<", async()=>{
            attacker.tecPage--;
            await this.setPlayerPhase( attacker );
        });
        l.addFromLast(new VariableLayout(()=>{
            return attacker.tecPage > 0 ? olderTecPage : ILayout.empty;
        }));

        btnSpace.clear();
        btnSpace.add(l);
    }


    private async setChooseTargetBtn(attacker:Unit, chooseAction:(targets:Unit[])=>void){

        const l = new FlowLayout(4,3);
        const addBtn = async(unit:Unit)=>{
            if(!unit.exists){
                l.add(ILayout.empty);
                return;
            }

            const btn = new Btn(unit.name, async()=>{
                await chooseAction([unit]);
            })
            if(unit.dead){
                btn.groundColor = ()=>new Color(1,0.3,0.3);
            }
            l.add(btn);
        }
        for(let e of Unit.enemies){
            addBtn(e);
        }
        for(let p of Unit.players){
            addBtn(p);
        }
        
        l.addFromLast(new Btn("<<", async()=>{
            Util.msg.set("＞キャンセル");
            await this.setPlayerPhase(attacker);
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
    for(const e of Unit.enemies){
        e.exists = false;
    }

    for(const p of Unit.players){
        for(const prm of Prm.values()){
            p.prm(prm).battle = 0;
        }
    }

    btnSpace.clear();
}


const createBossBG:()=>(bounds:Rect)=>void = ()=>{
    const nextR = (r:number, num:number)=>{
        if(num <= 0){return r;}
        return nextR(r * 1.2 + 0.002, num-1);
    };
    const nextRad = (rad:number, num:number)=>{
        if(num <= 0){return rad;}
        // return nextRad(rad * 1.05, num-1);
        return nextRad(rad + 0.05, num-1);
    };

    let center = {x:0.5, y:0.5};
    let nextCenter = {x:0.5, y:0.5};;

    let elms:{rad:number, r:number}[] = [];
    const elmNum = 60;
    for(let i = 0; i < elmNum; i++){
        elms.push({
            rad:Math.PI * 2 * (i+1) / elmNum,
            r:Math.random(),
        });
    }
    
    return bounds=>{
        const color = {r:0, g:0, b:0, a:1};
        const color2 = {r:0, g:0, b:0, a:1};
        const rotateCenter = {x:bounds.x + bounds.w * center.x, y:bounds.y + bounds.h * center.y};
        const vertex = 4;
        let vertexes:{x:number ,y:number}[] = [];
        for(let i = 0; i < vertex; i++){
            const rad = Math.PI * 2 * (i+1) / vertex;
            vertexes.push({
                x:Math.cos(rad),
                y:Math.sin(rad),
            });
        }
        for(let i = 0; i < elms.length; i++){
            const e = elms[i];

            Graphics.setLineWidth(80 * e.r, ()=>{
                let points:{x:number, y:number}[] = [];
                const x = bounds.x + center.x * bounds.w + Math.cos(e.rad) * e.r;
                const y = bounds.y + center.y * bounds.h + Math.sin(e.rad) * e.r;
                const r = e.r * 0.1;
                for(let i = 0; i < vertex; i++){
                    points.push({
                        x:x + vertexes[i].x * r,
                        y:y + vertexes[i].y * r,
                    });
                }

                color.r = 0.2 + e.r * 0.8;
                Graphics.lines(points, color);
            });

            e.r = nextR(e.r, 1);
            if(e.r > 1){
                e.r = 0.01 + Math.random() * 0.01;
            }


            e.rad = nextRad(e.rad, 1);
        }

        center.x = center.x * 0.97 + nextCenter.x * 0.03;
        center.y = center.y * 0.97 + nextCenter.y * 0.03;
        if(Math.abs(center.x - nextCenter.x) < 0.001 && Math.abs(center.y - nextCenter.y) < 0.001){
            nextCenter.x = 0.1 + Math.random() * 0.8;
            nextCenter.y = 0.1 + Math.random() * 0.8; 
        }
    };
};


const createExBG:()=>(bounds:Rect)=>void = ()=>{
    let count = 0;
    let vertex = 4;
    let rads:{x:number, y:number}[] = [];
    for(let i = 0; i < vertex; i++){
        const rad = Math.PI * 2 * (i+1) / vertex;
        rads.push({
            x:Math.cos(rad),
            y:Math.sin(rad),
        });
    }
    return bounds=>{
        const xNum = 8;
        const yNum = 4;
        const w = bounds.w / xNum;
        const h = bounds.h / yNum;
        const wHalf = w / 2;
        const hHalf = h / 2;
        const color = new Color(0,0.25,0.25);
        const lineWidth = 4;
        count++;
            for(let y = 0; y < yNum; y++){
                for(let x = 0; x < xNum; x++){
                    let points:{x:number, y:number}[] = [];
                    const _x = bounds.x + wHalf + w * x;
                    const _y = bounds.y + hHalf + h * y;
                    for(let i = 0; i < vertex; i++){
                        points.push({
                            x:_x + rads[i].x * w / 2,
                            y:_y + rads[i].y * h / 2,
                        });
                    }
                    // Graphics.setLineWidth(lineWidth + Math.sin( x * 0.1 + y * 0.1 + count * 0.1 ) * lineWidth, ()=>{    
                    Graphics.setLineWidth(Math.abs(Math.sin( x * 0.1 + y * 0.1 + count * 0.05 )) * lineWidth, ()=>{    
                        Graphics.lines(points, color);
                    });
                }
            }

    };
};