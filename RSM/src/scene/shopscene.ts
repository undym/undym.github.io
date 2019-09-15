import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit, PUnit, Prm } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place, PlayData } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { TecType, Tec, ActiveTec } from "../tec.js";
import { FX_Str } from "../fx/fx.js";
import { Player } from "../player.js";
import { Eq, EqEar } from "../eq.js";
import { Item } from "../item.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Job } from "../job.js";






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

        super.add(Place.TOP, DrawPlayInfo.ins);
        
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 0.75);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add((()=>{
                    const infoBounds = new Rect(0, 0, 1, 0.7);
                    const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
                    return new RatioLayout()
                        .add(infoBounds, ILayout.create({draw:(bounds)=>{
                            Graphics.fillRect(bounds, Color.D_GRAY);

                            const goods = this.choosedGoods;
                            if(!goods){return;}
                            
                            let font = Font.def;
                            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                            const movedP = ()=> p = p.move(0, font.ratioH);
                            
                            font.draw(`[${goods}]`, movedP(), Color.WHITE);
                            font.draw(`${goods.price()}円`, movedP(), Color.WHITE);
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
                                if(PlayData.yen >= goods.price()){
                                    PlayData.yen -= goods.price();

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
        public readonly price:()=>number,
        public readonly isVisible:()=>boolean,
        public readonly buy:()=>void,
        public readonly num:()=>(number|undefined) = ()=>undefined,
    ){
        this.toString = ()=>this.name;
        Goods._values.push(this);
    }

}




const initGoods = ()=>{
    const createItemGoods = (item:Item, price:()=>number, isVisible:()=>boolean)=>{
        new Goods(
            item.toString(),
            item.info,
            price,
            isVisible,
            ()=> item.add(1),
            ()=> item.num,
        );
    };
    // const createItemGoodsNum = (item:Item, num:number, price:()=>number, isVisible:()=>boolean)=>{
    //     new Goods(
    //         item.toString(),
    //         item.info,
    //         price,
    //         isVisible,
    //         ()=> item.add(num),
    //         ()=> item.num,
    //     );
    // };
    const createEqGoods = (eq:Eq, price:()=>number, isVisible:()=>boolean)=>{
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
    const createEarGoods = (ear:EqEar, price:()=>number, isVisible:()=>boolean)=>{
        let info:string[] = [`＜耳＞`];
        new Goods(
            ear.toString(),
            info.concat( ear.info ),
            price,
            isVisible,
            ()=> ear.add(1),
            ()=> ear.num,
        );
    };
    
    createItemGoods(Item.合成許可証, ()=>300, ()=>Dungeon.リテの門.dungeonClearCount > 0 && Item.合成許可証.num === 0);
    
    createItemGoods(Item.スティックパン, ()=>(Item.スティックパン.num+1) * 30, ()=>Item.スティックパン.num < 5);
    createItemGoods(Item.脱出ポッド,    ()=>10,                               ()=>Item.脱出ポッド.num < 1);
    createItemGoods(Item.赤い水,        ()=>(Item.赤い水.num+1) * 100,        ()=>Item.赤い水.num < 10 && Dungeon.再構成トンネル.dungeonClearCount > 0);
    createItemGoods(Item.サンタクララ薬, ()=>(Item.サンタクララ薬.num+1) * 50, ()=>Item.サンタクララ薬.num < 4 && Dungeon.再構成トンネル.dungeonClearCount > 0);

    createEarGoods(EqEar.おにく,       ()=>100 ,()=>Dungeon.はじまりの丘.dungeonClearCount > 0 && EqEar.おにく.num < 2);
    createEarGoods(EqEar.水晶のピアス,  ()=>200 ,()=>Dungeon.はじまりの丘.dungeonClearCount > 0 && EqEar.水晶のピアス.num < 2);
    createEarGoods(EqEar.魔ヶ玉のピアス,       ()=>100 ,()=>Dungeon.リテの門.dungeonClearCount > 0 && EqEar.魔ヶ玉のピアス.num < 2);
    createEarGoods(EqEar.エメラルドのピアス,       ()=>100 ,()=>Dungeon.リテの門.dungeonClearCount > 0 && EqEar.エメラルドのピアス.num < 2);
    // createEqGoods(Eq.う棒,      　()=>500,    ()=>Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.う棒.totalGetNum === 0);

    if(Player.values.some(p=> p.ins.getJobLv(Job.クピド) > 0)){
        createItemGoods(Item.夜叉の矢, ()=>(Item.夜叉の矢.num+1) * 500, ()=>true);
    }
    if(Player.values.some(p=> p.ins.isMasteredJob(Job.砲撃手))){
        createItemGoods(Item.散弾, ()=>(Item.散弾.num+1) * 500, ()=>true);
    }
};

