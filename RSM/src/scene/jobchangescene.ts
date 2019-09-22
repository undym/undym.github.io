import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout, Labels } from "../undym/layout.js";
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
    private choosed:boolean;
    private choosedJob:Job;

    constructor(){
        super();

        this.list = new List();
    }

    init(){
        this.choosed = false;
        this.choosedJob = Job.しんまい;
        this.target = Unit.getFirstPlayer();

        super.clear();
        
        super.add(Place.TOP, DrawPlayInfo.ins);
        
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);

        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        const infoBounds = new Rect(0, 0, 1, 0.7);
        const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);

        super.add(mainBounds, 
            new XLayout()
                .add(this.list)
                .add(new RatioLayout()
                    .add(infoBounds, ILayout.create({draw:(bounds)=>{
                        Graphics.fillRect(bounds, Color.D_GRAY);
                    }}))
                    .add(infoBounds, (()=>{
                        const info = new Labels(Font.def)
                                        .add(()=>`[${this.choosedJob}]`)
                                        .add(()=> this.target.getJobLv(this.choosedJob) >= this.choosedJob.getMaxLv() ? "Lv:★" : `Lv:${this.target.getJobLv(this.choosedJob)}`)
                                        .add(()=>"成長ステータス:")
                                        .addArray(()=>{
                                            let res:[string,Color?][] = [];
                                            for(const set of this.choosedJob.growthPrms){
                                                res.push([` [${set.prm}]+${set.value}`]);
                                            }
                                            return res;
                                        })
                                        .br()
                                        .addln(()=>this.choosedJob.info)
                                        ;
                        return new VariableLayout(()=>{
                            if(this.choosed){return info;}
                            return ILayout.empty;
                        });
                    })())
                    .add(btnBounds, (()=>{
                        const l = new FlowLayout(2,1);
            
            
                        l.addFromLast(new Btn("<<", ()=>{
                            Scene.load( TownScene.ins );
                        }));
            
                        const checkCanChange = ()=>{
                            if(!this.choosed){return false;}
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


        this.setList( this.target );
    }

    private setList(unit:PUnit){
        this.target = unit;
        this.choosed = false;

        this.list.clear();
        this.list.add({
            center:()=>`${unit.name}`,
            groundColor:()=>Color.D_GRAY,
        });

        Job.values
            .filter(job=> job.canJobChange(unit) || unit.getJobLv(job) > 0 || Debug.debugMode)
            .forEach((job)=>{
                let color:()=>Color = ()=>{
                    if(job === unit.job)        {return Color.ORANGE;}
                    if(unit.isMasteredJob(job)) {return Color.YELLOW;}
                    return Color.WHITE;
                };

                this.list.add({
                    left:()=> unit.isMasteredJob(job) ? "★" : `${unit.getJobLv(job)}`,
                    leftColor:color,
                    right:()=>`${job}`,
                    rightColor:color,
                    groundColor:()=>job === this.choosedJob ? Color.D_CYAN : Color.BLACK,
                    push:(elm)=>{
                        this.choosedJob = job;
                        this.choosed = true;
                    },

                });
            });
    }
}