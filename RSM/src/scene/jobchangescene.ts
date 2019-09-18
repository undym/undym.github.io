import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit, PUnit } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place, Debug } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Job } from "../job.js";






export class JobChangeScene extends Scene{

    private list:List;
    private target:PUnit;
    private choosedJob:Job|undefined;

    constructor(){
        super();

        this.list = new List();
        this.target = Unit.getFirstPlayer();
    }

    init(){
        super.clear();
        
        super.add(Place.TOP, DrawPlayInfo.ins);
        
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
            
        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            Graphics.fillRect(this.target.bounds, new Color(0,1,1,0.2));
        }}));
        super.add(Rect.FULL, ILayout.create({ctrl:(bounds)=>{
            if(!Input.click){return;}

            for(let p of Unit.players.filter(p=> p.exists)){
                if(p.bounds.contains( Input.point )){
                    this.setList(p);
                    break;
                }
            }
        }}));

        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        const infoBounds = new Rect(0, 0, 1, 0.7);
        const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add(new RatioLayout()
                    .add(infoBounds, ILayout.create({draw:(bounds)=>{
                        Graphics.fillRect(bounds, Color.D_GRAY);
                        if(!this.target || !this.choosedJob){return;}
            
                        let unit = this.target;
                        let job = this.choosedJob;
                        let font = Font.def;
                        let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                        const moveP = ()=> p = p.move(0, font.ratioH);
                        
                        font.draw(`[${job}]`, p, Color.WHITE);
            
                        const lv = unit.getJobLv(job) >= job.getMaxLv() ? "Lv:★" : `Lv:${unit.getJobLv(job)}`;
                        font.draw(lv, moveP(), Color.WHITE);
            
                        font.draw("成長ステータス:", moveP(), Color.WHITE);
                        for(let set of job.growthPrms){
                            font.draw(` [${set.prm}]+${set.value}`, moveP(), Color.WHITE);
                        }
            
                        moveP();
                        for(let s of job.info){
                            font.draw(s, moveP(), Color.WHITE);
                        }
                    }}))
                    .add(btnBounds, (()=>{
                        const l = new FlowLayout(2,1);
            
            
                        l.addFromLast(new Btn("<<", ()=>{
                            Scene.load( TownScene.ins );
                        }));
            
                        const checkCanChange = ()=>{
                            if(!this.target || !this.choosedJob){return false;}
                            if(this.target.job === this.choosedJob){return false;}
                            return true;
                        }
                        const canChange = new Btn(()=>"転職",async()=>{
                            if(!checkCanChange()){return;}
                            if(!this.choosedJob){return;}
            
                            this.target.job = this.choosedJob;
                        });
                        const cantChange = new Btn(()=>"-",()=>{});
            
                        l.addFromLast(new VariableLayout(()=>{
                            if(!checkCanChange()){
                                return cantChange;
                            }
                            return canChange;
                        }));
                        return l;
                    })())
                )
        );
        


        this.setList( this.target );
    }

    private setList(unit:PUnit){
        this.target = unit;
        this.choosedJob = undefined;

        this.list.clear();
        this.list.add({
            center:()=>`${unit.name}`,
            groundColor:()=>Color.D_GRAY,
        });

        Job.values
            .filter(job=> job.canJobChange(unit) || unit.getJobLv(job) > 0 || Debug.debugMode)
            .forEach((job)=>{
                let color:()=>Color = ()=>{
                    if(job === this.choosedJob){return Color.CYAN;}
                    if(job === unit.job)        {return Color.ORANGE;}
                    if(unit.isMasteredJob(job)) {return Color.YELLOW;}
                    return Color.WHITE;
                };

                this.list.add({
                    left:()=> unit.isMasteredJob(job) ? "★" : `${unit.getJobLv(job)}`,
                    leftColor:color,
                    right:()=>`${job}`,
                    rightColor:color,
                    push:(elm)=>{
                        this.choosedJob = job;
                    },

                });
            });
    }
}