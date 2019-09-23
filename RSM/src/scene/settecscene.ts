import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout, Labels, Label } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit, PUnit } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { TecType, Tec, ActiveTec } from "../tec.js";
import { FX_Str } from "../fx/fx.js";






export class SetTecScene extends Scene{

    private list:List;
    private target:PUnit;
    private choosed:boolean = false;
    private choosedTec:Tec;
    private resetList:(keepScroll:boolean)=>void;

    constructor(){
        super();

        this.list = new List();
    }

    init(){
        this.target = Unit.getFirstPlayer();
        this.choosed = false;
        this.choosedTec = Tec.empty;

        super.clear();

        super.add(Place.TOP, DrawPlayInfo.ins);
        
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);

        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add((()=>{
                    const infoBounds = new Rect(0, 0, 1, 0.4);
                    const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
                    return new RatioLayout()
                        .add(infoBounds, ILayout.create({draw:(bounds)=>{
                            Graphics.fillRect(bounds, Color.D_GRAY);
                        }}))
                        .add(infoBounds, (()=>{
                            return new VariableLayout(()=>{
                                const info = new Labels(Font.def)
                                                .add(()=>`[${this.choosedTec}]`)
                                                .add(()=>`<${this.choosedTec.type}>`)
                                                .addLayout(new XLayout()
                                                    .add(new Label(Font.def, ()=>{
                                                        if(this.choosedTec instanceof ActiveTec){return this.choosedTec.mpCost > 0 ? `MP:${this.choosedTec.mpCost}` : "";}
                                                        return "";
                                                    }))
                                                    .add(new Label(Font.def, ()=>{
                                                        if(this.choosedTec instanceof ActiveTec){return this.choosedTec.tpCost > 0 ? `TP:${this.choosedTec.tpCost}` : "";}
                                                        return "";
                                                    }))
                                                    .add(new Label(Font.def, ()=>{
                                                        if(this.choosedTec instanceof ActiveTec){return this.choosedTec.epCost > 0 ? `EP:${this.choosedTec.epCost}` : "";}
                                                        return "";
                                                    }))
                                                    .add(new Label(Font.def, ()=>{
                                                        if(this.choosedTec instanceof ActiveTec && this.choosedTec.itemCost.length > 0){
                                                            let res = "";
                                                            for(const set of this.choosedTec.itemCost){
                                                                res += `${set.item}-${set.num}(${set.item.num}) `
                                                            }
                                                            return res;
                                                        }
                                                        return "";
                                                    }))
                                                    ,()=>Font.def.ratioH
                                                )
                                                .addln(()=>this.choosedTec.info)
                                                ;
                                return this.choosed ? info : ILayout.empty;
                            })
                        })())
                        .add(btnBounds, (()=>{
                            const otherBtns1:ILayout[] = [
                                new Btn("全て", ()=>{
                                    (this.resetList = keepScroll=>{
                                        this.choosed = false;
                                        this.list.clear(keepScroll);
                                        for(let type of TecType.values()){
                                            const tecs = type.tecs.filter(t=> this.target.isMasteredTec(t));
                                            this.setList( this.target, `${type}`, tecs );
                                        }
                                    })(false);
                                    // this.setList( this.target,u=>{
                                    //     let res:Tec[] = [];
                                    //     for(let type of TecType.values()){
                                    //         res = res.concat( type.tecs.filter(t=> u.isMasteredTec(t)) );
                                    //     }
                                    //     return res;
                                    // });
                                }),
                                new Btn("セット中", ()=>{
                                    (this.resetList = keepScroll=>{
                                        this.choosed = false;
                                        this.list.clear(keepScroll);
                                        this.setList( this.target, "セット中", this.target.tecs );
                                    })(false);
                                }),
                            ];
                            const otherBtns2:ILayout[] = [
                                new Btn("<<", ()=>{
                                    Scene.load( TownScene.ins );
                                }),
                                (()=>{
                                    const choosedTecIsSetting = ()=> this.target.tecs.some(t=> t === this.choosedTec)
                                    const set = new Btn("セット",async()=>{
                                        if(!this.choosedTec){return;}
                                        
                                       for(let i = 0; i < this.target.tecs.length; i++){
                                           if(this.target.tecs[i] === Tec.empty){
                                                this.target.tecs[i] = this.choosedTec;
                                                FX_Str(Font.def, `${this.choosedTec}をセットしました`, {x:0.5, y:0.5}, Color.WHITE);
        
                                                // this.setList(this.target, this.getListTecs ,/*keepPage*/true);
                                                return;
                                           }
                                       }
                                       
                                       FX_Str(Font.def, `技欄に空きがありません`, {x:0.5, y:0.5}, Color.WHITE);
                                    });
                                    const unset = new Btn("外す",async()=>{
                                        if(!this.choosedTec){return;}
        
                                        for(let i = 0; i < this.target.tecs.length; i++){
                                            if(this.target.tecs[i] === this.choosedTec){
                                                this.target.tecs[i] = Tec.empty;
                                                FX_Str(Font.def, `${this.choosedTec}を外しました`, {x:0.5, y:0.5}, Color.WHITE);
        
                                                // this.setList(this.target, this.getListTecs, /*keepPage*/true);
                                                this.resetList(true);
                                                return;
                                            }
                                        }
                                    });

                                    return new VariableLayout(()=>{
                                        if(choosedTecIsSetting()){
                                            return unset;
                                        }
                                        return set;
                                    });
                                })(),
                            ];
                            const w = 2;
                            const h = ((otherBtns1.length + otherBtns2.length + TecType.values().length + 1) / w)|0;
                            const l = new FlowLayout(w,h);
                            
                            for(let type of TecType.values()){
                                l.add(new Btn(`${type}`, ()=>{
                                    (this.resetList = keepScroll=>{
                                        this.choosed = false;
                                        this.list.clear(keepScroll);
                                        this.setList( this.target, `${type}`, type.tecs.filter(t=> this.target.isMasteredTec(t)));
                                    })(false);
                                }));
                            }

                            for(const o of otherBtns1){
                                l.add(o);
                            }
                            for(const o of otherBtns2){
                                l.addFromLast(o);
                            }
                
                            return l;
                        })());
                })())
        );
        
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            Graphics.fillRect(this.target.bounds, new Color(0,1,1,0.2));
        }}));
        super.add(Rect.FULL, ILayout.create({ctrl:(bounds)=>{
            if(!Input.click){return;}

            for(let p of Unit.players.filter(p=> p.exists)){
                if(p.bounds.contains( Input.point )){
                    this.target = p;
                    this.resetList(false);
                    break;
                }
            }
        }}));


        (this.resetList = keepScroll=>{
            this.choosed = false;
            this.list.clear(keepScroll);
            this.setList( this.target, "セット中", this.target.tecs );
        })(false);
    }

    private setList(unit:PUnit, listTypeName:string, tecs:Tec[]){
        this.choosed = false;

        this.list.add({
            center:()=>`${listTypeName}`,
            groundColor:()=>Color.D_GRAY,
        });

        tecs
            .forEach((tec)=>{
                if(tec === Tec.empty){
                    this.list.add({
                        right:()=>"-",
                    });
                }else{
                    let color:()=>Color = ()=>{
                        if(unit.tecs.some(t=> t === tec)){return Color.ORANGE;}
                        return Color.WHITE;
                    };
    
                    this.list.add({
                        left:()=> unit.tecs.some(t=> t === tec) ? "=" : ``,
                        leftColor:color,
                        right:()=>`${tec}`,
                        rightColor:color,
                        groundColor:()=>tec === this.choosedTec ? Color.D_CYAN : Color.BLACK,
                        push:(elm)=>{
                            this.choosedTec = tec;
                            this.choosed = true;
                        },
    
                    });
                }
            });
    }
}