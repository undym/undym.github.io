import { Scene, cwait } from "../undym/scene.js";
import { RatioLayout, YLayout, ILayout, XLayout, VariableLayout, InnerLayout } from "../undym/layout.js";
import { Rect, Color } from "../undym/type.js";
import DungeonEvent from "../dungeon/dungeonevent.js";
import { Place, Util, SceneType } from "../util.js";
import { DrawSTBoxes, DrawUnitDetail, DrawDungeonData, DrawPlayInfo } from "./sceneutil.js";
import { Unit } from "../unit.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { TownScene } from "./townscene.js";
import { Img } from "../graphics/graphics.js";



export default class DungeonScene extends Scene{
    private static _ins:DungeonScene;
    static get ins():DungeonScene{return this._ins ? this._ins : (this._ins = new DungeonScene());}



    private constructor(){
        super();
        DungeonEvent.now = DungeonEvent.empty;
    }

    init(){
        super.clear();

        super.add(Place.TOP, DrawPlayInfo.ins);

        super.add(Place.DUNGEON_DATA, DrawDungeonData.ins);

        
        super.add(Place.MAIN, DrawEvent.ins);
        super.add(Place.MSG, Util.msg);

        let dungeonEventBak:DungeonEvent;
        let btnLayout:ILayout;
        super.add(Place.BTN,
            new VariableLayout(()=>{
                if(dungeonEventBak != DungeonEvent.now){
                    dungeonEventBak = DungeonEvent.now;
                    btnLayout = dungeonEventBak.createBtnLayout();
                }
                return btnLayout;
            })
        );
        
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.MAIN, DrawUnitDetail.ins);

        SceneType.DUNGEON.set();
    }

}


class DrawEvent extends InnerLayout{
    private static _ins:DrawEvent;
    static get ins():DrawEvent{return this._ins ? this._ins : (this._ins = new DrawEvent());}

    constructor(){
        super();

        let evBak = DungeonEvent.now;
        let img = Img.empty;
        let zoomCount = 0;

        super.add(ILayout.create({draw:(bounds)=>{
            if(evBak != DungeonEvent.now){
                evBak = DungeonEvent.now;

                img = evBak.getImg();
                if(evBak.isZoomImg()){
                    zoomCount = 0;
                }
            }

            zoomCount++;
            
            if(!img.loaded){return;}

            let zoom = 0;
            if(img.ratioW / bounds.w > img.ratioH / bounds.h){
                zoom = zoomCount / (zoomCount + 1) * bounds.w / img.ratioW;
            }else{
                zoom = zoomCount / (zoomCount + 1) * bounds.h / img.ratioH;
            }
            const sizeW = img.ratioW * zoom;
            const sizeH = img.ratioH * zoom;
            img.draw( new Rect(bounds.cx - sizeW / 2, bounds.cy - sizeH / 2, sizeW, sizeH) );
        }}));

    }
}