import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Item } from "../item.js";
import { Num, Mix } from "../mix.js";
import { Eq } from "../eq.js";
import { SaveData } from "../savedata.js";






export class MixScene extends Scene{

    private list:List;
    private choosedMix:Mix|undefined;
    /**セーブフラグ. */
    private doneAnyMix = false;

    constructor(){
        super();

        this.list = new List();
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

                            const mix = this.choosedMix;
                            if(!mix){return;}

                            const font = Font.def;
                            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                            const movedP = ()=> p = p.move(0, font.ratioH);

                            if(mix.countLimit === Mix.LIMIT_INF){
                                font.draw(`合成回数(${mix.count}/-)`, p, Color.WHITE);
                            }else{
                                font.draw(`合成回数(${mix.count}/${mix.countLimit})`, p, Color.WHITE);
                            }

                            for(let m of mix.materials){
                                const color = m.num >= m.object.num ? Color.WHITE : Color.GRAY;
                                font.draw(`[${m.object}] ${m.num}/${m.object.num}`, movedP(), color);
                            }


                            const result = mix.result;
                            if(result){
                                movedP();
                                if(result.object instanceof Eq){
                                    const eq = result.object;
                                    font.draw(`<${eq.pos}>`, movedP(), Color.WHITE);

                                    if(!mix.info){
                                        for(const info of eq.info){
                                            font.draw(info, movedP(), Color.WHITE);
                                        }
                                    }
                                }
                                if(result.object instanceof Item){
                                    const item = result.object;
                                    font.draw(`<${item.itemType}>`, movedP(), Color.WHITE);
                                    
                                    if(!mix.info){
                                        for(const info of item.info){
                                            font.draw(info, movedP(), Color.WHITE);
                                        }
                                    }
                                }
                            }

                            if(mix.info){
                                movedP();
                                for(const info of mix.info){
                                    font.draw(info, movedP(), Color.WHITE);
                                }
                            }
                            
                            // if(this.choosedObj instanceof Item){
                            //     const result = this.choosedMix.result;
                            //     if(!result){return;}
                            //     const item = result.object;
                            //     if(!(item instanceof Item)){return;}

                            //     const limit = item.num >= item.numLimit ? "（所持上限）" : "";
                            //     font.draw(`[${item}]x${result.num} <${item.itemType}> ${limit}`, movedP(), Color.WHITE);

                            //     for(let info of item.info){
                            //         font.draw(info, movedP(), Color.WHITE);
                            //     }
                            // }

                            // if(this.choosedObj instanceof Eq){
                            //     const result = this.choosedMix.result;
                            //     if(!result){return;}
                            //     const eq = result.object;
                            //     if(!(eq instanceof Eq)){return;}

                            //     font.draw(`[${eq}]x${eq.num} <${eq.pos}>`, movedP(), Color.WHITE);

                            //     for(let info of eq.info){
                            //         font.draw(info, movedP(), Color.WHITE);
                            //     }
                            // }
                            
                        }}))
                        .add(btnBounds, (()=>{
                            const l = new FlowLayout(2,3);
                            
                            l.add(new Btn("建築", ()=>{
                                const values = Mix.values
                                                    .filter(m=> !m.result && m.isVisible());
                                this.setList("建築", values);
                            }));
                            l.add(new Btn("装備", ()=>{
                                const values = Mix.values
                                                    .filter(m=>{
                                                        const result = m.result;
                                                        if(result && result.object instanceof Eq && m.isVisible()){return true;}
                                                        return false;
                                                    });
                                this.setList("装備", values);
                            }));
                            l.add(new Btn("アイテム", ()=>{
                                const values = Mix.values
                                                    .filter(m=>{
                                                        const result = m.result;
                                                        if(result && result.object instanceof Item && m.isVisible()){return true;}
                                                        return false;
                                                    });
                                this.setList("アイテム", values);
                            }));

                
                            l.addFromLast(new Btn("<<", ()=>{
                                if(this.doneAnyMix){
                                    SaveData.save();
                                }
                                Scene.load( TownScene.ins );
                            }));
                            
                            const canMix = ()=>{
                                if(!this.choosedMix){return false;}

                                return this.choosedMix.canRun();
                            };
                            const run = new Btn("合成",async()=>{
                                if(!this.choosedMix){return;}

                                this.choosedMix.run();

                                this.doneAnyMix = true;
                            });
                            const noRun = new Btn("-",async()=>{
                            });
                
                            l.addFromLast(new VariableLayout(()=>{
                                return canMix() ? run : noRun;
                            }));

                            return l;
                        })());
                })())
        );
        
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
    }


    private setList<T>(name:string, values:Mix[]){
        this.list.clear();

        this.list.add({
            center:()=>name,
        });

        values
            .forEach(mix=>{

                const color = ()=>{
                    if(mix === this.choosedMix){return Color.CYAN;}
                    if(!mix.canRun())          {return Color.GRAY;}
                    return Color.WHITE;
                };
                this.list.add({
                    left:()=>{
                        if(mix.countLimit === Mix.LIMIT_INF){return `${mix.count}`;}
                        return `${mix.count}/${mix.countLimit}`;
                    },
                    leftColor:color,
                    right:()=>mix.toString(),
                    rightColor:color,
                    push:(elm)=>{
                        this.choosedMix = mix;
                    },
                });
            });
    }
}