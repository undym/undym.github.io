import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit, PUnit } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { FieldScene } from "./fieldscene.js";
import { Job } from "../job.js";
import { TecType, Tec, ActiveTec } from "../tec.js";
import { FX_Str } from "../fx/fx.js";






export class SetTecScene extends Scene{

    private list:List;
    private target:PUnit;
    private choosedTec:Tec|undefined;
    private getListTecs:(unit:PUnit)=>Tec[];

    constructor(){
        super();

        this.list = new List();
        this.target = Unit.getFirstPlayer();
    }

    init(){
        super.clear();
        
        const mainBounds = new Rect(0, 0, 1, 0.8);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add((()=>{
                    const infoBounds = new Rect(0, 0, 1, 0.4);
                    const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
                    return new RatioLayout()
                        .add(infoBounds, ILayout.create({draw:(bounds)=>{
                            Graphics.fillRect(bounds, Color.D_GRAY);
                            if(!this.choosedTec){return;}

                            const tec = this.choosedTec;
                            let font = Font.getDef();
                            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                            const movedP = ()=> p = p.move(0, font.ratioH);
                            
                            font.draw(`[${tec}]`, p, Color.WHITE);
                            font.draw(`<${tec.type}>`, movedP(), Color.WHITE);
                            
                            if(tec instanceof ActiveTec){
                                let _p = movedP();
                                if(tec.mpCost > 0){
                                    font.draw(`MP:${tec.mpCost}`, _p, Color.WHITE);
                                }
                                if(tec.tpCost > 0){
                                    font.draw(`TP:${tec.tpCost}`, _p.move(bounds.w / 2, 0), Color.WHITE);
                                }
                            }else{
                                movedP();
                            }
                
                            for(let s of tec.info){
                                font.draw(s, movedP(), Color.WHITE);
                            }
                        }}))
                        .add(btnBounds, (()=>{
                            const otherBtns = ["settingList", "set", "<<"];
                            const w = 2;
                            const h = (otherBtns.length + TecType.values().length) / w;
                            const l = new FlowLayout(w,h);
                            
                            for(let type of TecType.values()){
                                l.add(new Btn(`${type}`, ()=>{
                                    this.setList( this.target, u=> type.tecs.filter(t=> u.isMasteredTec(t)) );
                                }));
                            }
                
                            l.addFromLast(new Btn("<<", ()=>{
                                Scene.load( FieldScene.ins );
                            }));
                
                            const choosedTecIsSetting = ()=> this.target.tecs.some(t=> t === this.choosedTec)
                            const set = new Btn("セット",async()=>{
                                if(!this.choosedTec){return;}
                                
                               for(let i = 0; i < this.target.tecs.length; i++){
                                   if(this.target.tecs[i] === Tec.empty){
                                        this.target.tecs[i] = this.choosedTec;
                                        FX_Str(Font.getDef(), `${this.choosedTec}をセットしました`, {x:0.5, y:0.5}, Color.WHITE);

                                        this.setList(this.target, this.getListTecs ,/*keepPage*/true);
                                        return;
                                   }
                               }
                               
                               FX_Str(Font.getDef(), `技欄に空きがありません`, {x:0.5, y:0.5}, Color.WHITE);
                            });
                            const unset = new Btn("外す",async()=>{
                                if(!this.choosedTec){return;}

                                for(let i = 0; i < this.target.tecs.length; i++){
                                    if(this.target.tecs[i] === this.choosedTec){
                                        this.target.tecs[i] = Tec.empty;
                                        FX_Str(Font.getDef(), `${this.choosedTec}を外しました`, {x:0.5, y:0.5}, Color.WHITE);

                                        this.setList(this.target, this.getListTecs, /*keepPage*/true);
                                        return;
                                    }
                                }
                            });
                
                            l.addFromLast(new VariableLayout(()=>{
                                if(choosedTecIsSetting()){
                                    return unset;
                                }
                                return set;
                            }));

                            l.addFromLast(new Btn("セット中", ()=>{
                                this.setList( this.target, u=> u.tecs );
                            }));
                            return l;
                        })());
                })())
        );
        
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            Graphics.fillRect(this.target.bounds, new Color(0,1,1,0.2));
        }}));
        super.add(Rect.FULL, ILayout.create({ctrl:(bounds)=>{
            if(!Input.pushed()){return;}

            for(let p of Unit.players.filter(p=> p.exists)){
                if(p.bounds.contains( Input.point )){
                    this.list.clear(/*keepPage*/false);
                    this.setList(p, this.getListTecs);
                    break;
                }
            }
        }}));

        this.setList( this.target, u=> u.tecs);
    }

    private setList(unit:PUnit, getListTecs:(unit:PUnit)=>Tec[], keepPage = false){
        this.target = unit;
        this.getListTecs = getListTecs;
        this.choosedTec = undefined;

        // this.list.add({
        //     center:()=>`${unit.name}`,
        //     groundColor:()=>Color.D_GRAY,
        // });
        this.list.clear(keepPage);

        getListTecs(unit)
            // .filter(tec=> unit.isMasteredTec(tec))
            .forEach((tec)=>{
                if(tec === Tec.empty){
                    this.list.add({
                        right:()=>"-",
                    });
                }else{
                    let color:()=>Color = ()=>{
                        if(tec === this.choosedTec){return Color.ORANGE;}
                        if(unit.tecs.some(t=> t === tec)){return Color.CYAN;}
                        return Color.WHITE;
                    };
    
                    this.list.add({
                        left:()=> unit.tecs.some(t=> t === tec) ? "=" : ``,
                        leftColor:color,
                        right:()=>`${tec}`,
                        rightColor:color,
                        push:(elm)=>{
                            this.choosedTec = tec;
                        },
    
                    });
                }
            });
    }
}