
import { Scene } from "../undym/scene.js";
import { RatioLayout, XLayout, YLayout, ILayout, VariableLayout, Label, FlowLayout } from "../undym/layout.js";
import { Place, Util, PlayData, Debug, SceneType } from "../util.js";
import { Btn } from "../widget/btn.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Rect, Color, Point } from "../undym/type.js";
import DungeonScene from "./dungeonscene.js";
import DungeonEvent from "../dungeon/dungeonevent.js";
import { DrawUnitDetail, DrawSTBoxes, DrawPlayInfo } from "./sceneutil.js";
import { Unit, Prm } from "../unit.js";
import { createOptionBtn } from "./optionscene.js";
import { ItemScene } from "./itemscene.js";
import { Input } from "../undym/input.js";
import { Targeting } from "../force.js";
import { Font, Graphics } from "../graphics/graphics.js";
import { Item } from "../item.js";
import { JobChangeScene } from "./jobchangescene.js";
import { SetTecScene } from "./settecscene.js";
import { MixScene } from "./mixscene.js";
import { EqScene } from "./eqscene.js";


let choosedDungeon:Dungeon;
let visibleDungeonEnterBtn = false;


export class TownScene extends Scene{
    private static _ins:TownScene;
    static get ins():TownScene{return this._ins ? this._ins : (this._ins = new TownScene());}


    private constructor(){
        super();
    }

    init(){
        super.clear();
        
        super.add(Place.TOP, DrawPlayInfo.ins);
        
        super.add(Place.MSG, Util.msg);


        super.add(Place.BTN,
            new VariableLayout(()=>TownBtn.ins)
        );
        
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.MAIN, DrawUnitDetail.ins);



        //----------------------------------------------------

        SceneType.TOWN.set();
        TownBtn.reset();
        fullCare();

        //----------------------------------------------------
    }
}


const fullCare = ()=>{
    for(let u of Unit.players){
        u.prm(Prm.HP).base = u.prm(Prm.MAX_HP).total();
        u.prm(Prm.MP).base = u.prm(Prm.MAX_MP).total();
    }
};


class TownBtn{
    private static _ins:ILayout;
    static get ins(){return this._ins;}

    private static dungeonPage = 0;

    static reset(){
        const l = new FlowLayout(4,3);
            l.add(new Btn("ダンジョン",()=>{
                this.setDungeonBtn();
            }));
            
            if(PlayData.masteredAnyJob || Debug.debugMode){
                l.add(new Btn("職業",()=>{
                    Scene.load(new JobChangeScene());
                }));
                l.add(new Btn("技のセット",()=>{
                    Scene.load(new SetTecScene());
                }));
            }
            if(PlayData.gotAnyEq || Debug.debugMode){
                l.add(new Btn("装備",()=>{
                    Scene.load(new EqScene());
                }));
            }
            if(Dungeon.はじまりの丘.clearNum > 0 || Debug.debugMode){
                l.add(new Btn("合成", ()=>{
                    Scene.load(new MixScene());
                }));
            }

            l.add(new Btn("アイテム", ()=>{
                Scene.load( ItemScene.ins({
                    selectUser:true,
                    user:Unit.players[0],
                    use:async(item,user)=>{
                        if(item.targetings & Targeting.SELECT){
                            await item.use( user, [user] );
                        }else{
                            let targets = Targeting.filter( item.targetings, user, Unit.players );
                            
                            if(targets.length > 0){
                                await item.use( user, targets );
                            }
                        }
                    },
                    returnScene:()=>{
                        Scene.load( TownScene.ins );
                    }, 
                }) );
            }));
            l.add(new Btn("OPTION", ()=>{
                this._ins = createOptionBtn();
            }));
        this._ins = l;
        visibleDungeonEnterBtn = false;
    }

    private static setDungeonBtn(){
        const w = 4;
        const h = 3;
        const l = new FlowLayout(w,h);
        const onePageDrawDungeonNum = w * (h - 1);
        let num = 0;
        // 0, 1, 2, 3,
        // 4, 5, 6, 7,
        // 8, 9,10,11,
        const visibleDungeons = Dungeon.values().filter(d=> d.isVisible());
        for(let i = this.dungeonPage * onePageDrawDungeonNum; i < visibleDungeons.length; i++){
            const d = visibleDungeons[i];

            l.add(new Btn(()=>`${d}`,()=>{
                choosedDungeon = d;
                visibleDungeonEnterBtn = true;

                Util.msg.set(`[${d}]`);
                Util.msg.set(`Rank:${d.rank}`);
                Util.msg.set(`攻略回数:${d.clearNum}`, d.clearNum === 0 ? Color.GRAY : Color.WHITE);
            }));

            if(++num >= onePageDrawDungeonNum){
                break;
            }
        }
        const pageLim = (visibleDungeons.length - 1) / onePageDrawDungeonNum;
        


        
        l.addFromLast(new Btn(()=>"<<",()=>{
            this.reset();
        }));
        
        const enter = new Btn("侵入", ()=>{
            if(choosedDungeon === undefined){return;}


            Dungeon.now = choosedDungeon;
            DungeonEvent.now = DungeonEvent.empty;
            for(let item of Item.consumableValues()){
                item.usedNum = 0;
            }

            Util.msg.set(`${choosedDungeon}に侵入しました`);

            Scene.load( DungeonScene.ins );
        });
        l.addFromLast(new VariableLayout(()=>{
            return visibleDungeonEnterBtn ? enter : ILayout.empty;
        }));

        const toNewer = new Btn(">", ()=>{
            this.dungeonPage++;
            visibleDungeonEnterBtn = false;
        });
        l.addFromLast(new VariableLayout(()=>{
            return this.dungeonPage < pageLim ? toNewer : ILayout.empty;
        }));

        const toOlder = new Btn("<", ()=>{
            this.dungeonPage--;
            visibleDungeonEnterBtn = false;
        });
        l.addFromLast(new VariableLayout(()=>{
            return this.dungeonPage > 0 ? toOlder : ILayout.empty;
        }));

        
        visibleDungeonEnterBtn = false;
        this._ins = l;
    }

}