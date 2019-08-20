import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit, PUnit, Prm } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place, PlayData } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { TecType, Tec, ActiveTec } from "../tec.js";
import { FX_Str } from "../fx/fx.js";
import { Player } from "../player.js";
import { Eq } from "../eq.js";
import { Item } from "../item.js";
import { Dungeon } from "../dungeon/dungeon.js";






export class ShopScene extends Scene{

    private static completedInitGoods = false;
    private list:List;
    private choosedGoods:Goods|undefined;

    constructor(){
        super();

        this.list = new List();

        if(!ShopScene.completedInitGoods){
            ShopScene.completedInitGoods = true;
            initGoods();
        }
    }

    init(){
        super.clear();
        
        const mainBounds = new Rect(0, 0, 1, 0.8);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add((()=>{
                    const infoBounds = new Rect(0, 0, 1, 0.7);
                    const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
                    return new RatioLayout()
                        .add(infoBounds, ILayout.create({draw:(bounds)=>{
                            Graphics.fillRect(bounds, Color.D_GRAY);
                            
                            let font = Font.def;
                            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                            const movedP = ()=> p = p.move(0, font.ratioH);

                            font.draw(`所持金:${PlayData.yen|0}円`, p, Color.YELLOW);

                            const goods = this.choosedGoods;
                            if(!goods){return;}

                            
                            font.draw(`[${goods}]`, movedP(), Color.WHITE);
                            font.draw(`${goods.price}円`, movedP(), Color.WHITE);
                            if(goods.num()){
                                font.draw(`所持:${goods.num()}`, movedP(), Color.WHITE);
                            }else{
                                movedP();
                            }

                            movedP();
                
                            for(let s of goods.info){
                                font.draw(s, movedP(), Color.WHITE);
                            }
                        }}))
                        .add(btnBounds, (()=>{
                            const l = new FlowLayout(2,1);
                            l.addFromLast(new Btn("<<", ()=>{
                                Scene.load( TownScene.ins );
                            }));
                
                            // const choosedTecIsSetting = ()=> this.target.tecs.some(t=> t === this.choosedTec)
                            const buy = new Btn("買う",async()=>{
                                if(!this.choosedGoods){return;}
                                
                                const goods = this.choosedGoods;
                                
                                if(!goods.isVisible()){return;}
                                if(PlayData.yen >= goods.price){
                                    PlayData.yen -= goods.price;

                                    goods.buy();
                                }
                            });
                            const no = new Btn("-",async()=>{});
                
                            l.addFromLast(new VariableLayout(()=>{
                                if(this.choosedGoods && this.choosedGoods.isVisible()){
                                    return buy;
                                }
                                return no;
                            }));

                            return l;
                        })());
                })())
        );
        
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
        this.setList();
    }

    private setList(){

        this.list.clear();
        Goods.values()
            .filter(g=> g.isVisible())
            .forEach(goods=>{
                this.list.add({
                    left:()=>{
                        const num = goods.num();
                        return num ? `${num}` : "";
                    },
                    leftColor:()=>Color.WHITE,
                    right:()=> goods.isVisible() ? goods.toString() : `-`,
                    rightColor:()=>Color.WHITE,
                    push:(elm)=>{
                        this.choosedGoods = goods;
                    },
                });
            });
    }
}



class Goods{
    private static _values:Goods[] = [];
    static values():ReadonlyArray<Goods>{
        return this._values;
    }

    
    constructor(
        private readonly name:string,
        public readonly info:string[],
        public readonly price:number,
        public readonly isVisible:()=>boolean,
        public readonly buy:()=>void,
        public readonly num:()=>(number|undefined) = ()=>undefined,
    ){
        this.toString = ()=>this.name;
        Goods._values.push(this);
    }

}




const initGoods = ()=>{
    const createItemGoods = (item:Item, price:number, isVisible:()=>boolean)=>{
        new Goods(
            item.toString(),
            item.info,
            price,
            isVisible,
            ()=> item.add(1),
            ()=> item.num,
        );
    };
    const createEqGoods = (eq:Eq, price:number, isVisible:()=>boolean)=>{
        let info:string[] = [`＜${eq.pos}＞`];
        new Goods(
            eq.toString(),
            info.concat( eq.info ),
            price,
            isVisible,
            ()=> eq.add(1),
            ()=> eq.num,
        );
    };

    // new Goods(
    //     "よしこ",
    //     ["よしこが仲間になる"],
    //     100,
    //     ()=>!Player.よしこ.member,
    //     ()=>Player.よしこ.join(),
    // );
    createItemGoods(Item.スティックパン, 100, ()=> Item.スティックパン.num < 5);
    createItemGoods(Item.脱出ポッド, 10, ()=> Item.脱出ポッド.num < 1);
    createEqGoods(Eq.う棒,      　500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.銅剣,       3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.鉄拳,     　9000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.はがねの剣,27000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);

    createEqGoods(Eq.杖,         500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.スギの杖,   3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.ヒノキの杖, 9000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.漆の杖,   27000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);
    
    createEqGoods(Eq.木の鎖,     500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.銅の鎖,    3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.鉄の鎖,    9000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.銀の鎖,   27000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);
    
    createEqGoods(Eq.パチンコ,   500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.ボウガン,  3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.投石器,    9000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.大砲,     27000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);

    createEqGoods(Eq.銅板,      500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 3);
    createEqGoods(Eq.鉄板,     3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.鋼鉄板,   9000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.チタン板,27000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 30);

    createEqGoods(Eq.魔女のとんがり帽,            500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.魔女の高級とんがり帽,       3000,  ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.魔女の最高級とんがり帽,    10000,  ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);
    createEqGoods(Eq.魔女の超最高級とんがり帽,  100000,  ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 80);

    createEqGoods(Eq.山男のとんかつ帽,            500,     ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.山男の高級とんかつ帽,       3000,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 40);
    createEqGoods(Eq.山男の最高級とんかつ帽,    10000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 60);
    createEqGoods(Eq.山男の超最高級とんかつ帽,  100000,   ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 90);
};

