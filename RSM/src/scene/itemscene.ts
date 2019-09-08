import { Scene, wait } from "../undym/scene.js";
import { Place, Util } from "../util.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { YLayout, ILayout, RatioLayout, VariableLayout, FlowLayout, XLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit } from "../unit.js";
import { List } from "../widget/list.js";
import { Rect, Color, Point } from "../undym/type.js";
import { Item, ItemParentType } from "../item.js";
import { FX } from "../fx/fx.js";
import { Input } from "../undym/input.js";
import { Targeting } from "../force.js";
import { Battle } from "../battle.js";
import { BattleScene } from "./battlescene.js";
import { Graphics, Font } from "../graphics/graphics.js";



export class ItemScene extends Scene{
    private static _ins:ItemScene;
    static ins(args:{selectUser:boolean, user:Unit, use:(item:Item, user:Unit)=>void, returnScene:()=>void}):ItemScene{
        this._ins ? this._ins : (this._ins = new ItemScene());

        this._ins.selectUser = args.selectUser;
        this._ins.user = args.user;
        this._ins.use = args.use;
        this._ins.returnScene = args.returnScene;

        return this._ins;
    }
    
    private selectUser:boolean;
    private user:Unit;
    private use:(item:Item, user:Unit)=>void;
    private returnScene:()=>void;

    private selectedItem:Item|undefined;

    private list:List;


    private constructor(){
        super();

        this.list = new List();
    }
    

    init(){
        this.selectedItem = undefined;
        
        super.clear();


        const listBounds = new Rect(0, 0, 0.5, 0.8);
        const infoBounds = new Rect(listBounds.xw, 0, 1 - listBounds.w, 0.3);
        const btnBounds = new Rect(infoBounds.x,  infoBounds.yh, infoBounds.w, listBounds.yh - infoBounds.yh);
        const pboxBounds = new Rect(Place.P_BOX.x, listBounds.yh, Place.P_BOX.w, 1 - listBounds.yh);

        super.add(listBounds, this.list);
        super.add(infoBounds, ILayout.create({draw:(bounds)=>{
            Graphics.fillRect(bounds, Color.D_GRAY);
            if(this.selectedItem === undefined){return;}

            let item = this.selectedItem;
            let font = Font.def;
            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
            const movedP = ()=> p = p.move(0, font.ratioH);
            
            font.draw(`[${item}]`, p, Color.WHITE);

            {
                const num = item.consumable 
                            ? `${item.remainingUseCount}/${item.num}`
                            : `${item.num}`
                            ;
                const limit = item.num >= item.numLimit ? "（所持上限）" : "";
                font.draw(`${num}個${limit}`, movedP(), Color.WHITE);
            }

            font.draw(`<${item.itemType}>`, movedP(), Color.WHITE);
            font.draw(`Rank:${item.rank}`, movedP(), Color.WHITE);
            
            movedP();
            for(let s of item.info){
                font.draw(s, movedP(), Color.WHITE);
            }
        }}));
        
        super.add(btnBounds, (()=>{
            const otherBtns:ILayout[] = [
                new Btn("<<", ()=>{
                    this.returnScene();
                }),
                (()=>{
                    const canUse = new Btn(()=>"使用",async()=>{
                        await this.use( this.selectedItem as Item, this.user );
                    });
                    const cantUse = new Btn(()=>"-",()=>{});

                    return new VariableLayout(()=>{
                        if(this.selectedItem === undefined || !this.selectedItem.canUse()){
                            return cantUse;
                        }
                        return canUse;
                    });
                })(),
            ];
            const w = 2;
            const h = ((otherBtns.length + ItemParentType.values().length + 1) / w)|0;
            const l = new FlowLayout(w,h);

            for(let type of ItemParentType.values()){
                l.add(new Btn(type.toString(), ()=>{
                    this.setList(type);
                }));
            }

            for(const o of otherBtns){
                l.addFromLast(o);
            }
            return l;
        })());
        
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            Graphics.fillRect(this.user.bounds, new Color(0,1,1,0.2));
        }}));
        super.add(Rect.FULL, ILayout.create({ctrl:(bounds)=>{
            if(!this.selectUser){return;}
            if(!Input.pushed){return;}

            for(let p of Unit.players.filter(p=> p.exists)){
                if(p.bounds.contains( Input.point )){
                    this.user = p;
                    break;
                }
            }
        }}));


        this.setList( ItemParentType.回復 );
    }


    private setList(parentType:ItemParentType){
        this.list.clear();

        for(let type of parentType.children){

            this.list.add({
                center:()=>`${type}`,
                groundColor:()=>Color.D_GRAY,
            });

            for(let item of type.values().filter(item=> item.num > 0)){
                const color = ()=> this.selectedItem === item ? Color.CYAN : Color.WHITE;
                this.list.add({
                    left:()=>{
                        if(item.consumable){return `${item.remainingUseCount}/${item.num}`;}
                        return `${item.num}`;
                    },
                    leftColor:color,
                    right:()=>`${item}`,
                    rightColor:color,
                    push:(elm)=>{
                        this.selectedItem = item;
                    },

                });
            }
        }
    }
}
