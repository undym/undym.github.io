{
    
    const LANE_Y = 2;
    const PRESSED_H = 5;
    const MAP_W = 19;
    const MAP_H = LANE_Y + 1 + PRESSED_H;
    const BLOCK_SIZE = 14;

    let init = false;
    let run_timer;
    let dom = {
        map:undefined,
    };

    let lane = new Array(MAP_W);
    let count = 0;
    let press_phase = 0;
    let press_count = 0;
    let press_y = 0;
    const PRESS_W = 3;
    const PRESS_X = Math.floor(MAP_W / 2) - Math.floor( PRESS_W / 2 );

    let pressed = new Array( PRESSED_H );
    for(let i = 0; i < pressed.length; i++){
        pressed[i] = '   ';
    }

    function run(){
        const PRESS_COUNT_MAX = 1;
        if(count++ % 3 !== 0){
            run_timer = setTimeout( run ,36 );
            return;
        }

        if(press_phase !== 2){
            moveLane();
        }
        for(let i = 0; i < lane.length; i++){
            dom.map[ LANE_Y ][i].textContent = lane[i];
        }
        //move press
        if(press_count++ >= PRESS_COUNT_MAX){
            press_count = 0;

            switch(press_phase){
                case 1:
                    press_y++;
                    if(press_y >= LANE_Y){
                        press_y = LANE_Y;
                        press_phase = 2;
                        
                        for(let i = pressed.length - 1; i > 0; i--){
                            pressed[i] = pressed[i-1];
                        }

                        let str = '';
                        for(let x = PRESS_X; x < PRESS_X + PRESS_W; x++){
                            str += dom.map[ LANE_Y ][x].textContent;
                            dom.map[ LANE_Y ][x].textContent = '';
                        }

                        pressed[0] = str;

                        {//クリア判定
                            if(pressed[0] === 'クリア'){
                                pressed[0] += '★';
                            }
                            //ク
                            //リ
                            //ア
                            for(let x = 0; x < PRESS_W; x++){
                                if(pressed[0].substr(x,1) === 'ク' && pressed[1].substr(x,1) === 'リ' && pressed[2].substr(x,1) === 'ア'){
                                    pressed[3] = pressed[3].substr(0,x)+'★'+pressed[3].substr(x+1,pressed[3].length - x);
                                }
                            }
                            if(pressed[0].substr(0,1) === 'ク' && pressed[1].substr(1,1) === 'リ' && pressed[2].substr(2,1) === 'ア'){
                                pressed[3] = pressed[3].substr(0,pressed[3].length)+'★';
                            }
                        }

                    }
                    break;
                case 2:

                    press_phase = 3;
                    press_count = PRESS_COUNT_MAX;
                    break;
                case 3:
                    press_y--;
                    if(press_y <= 0){
                        press_y = 0;
                        press_phase = 0;
                    }
                    break;
            }
        }
        //clear press
        for(let y = 0; y < LANE_Y; y++){
            for(let x = PRESS_X; x < PRESS_X + PRESS_W; x++){
                dom.map[y][x].textContent = '';
            }
        }
        //draw press
        for(let y = 0; y < press_y+1; y++){
            for(let x = PRESS_X; x < PRESS_X + PRESS_W; x++){
                dom.map[y][x].textContent = '■';
            }
        }

        //clear pressed
        for(let y = LANE_Y + 1; y < MAP_H; y++){
            for(let x = 0; x < MAP_W; x++){
                dom.map[y][x].textContent = '';
            }
        }
        //draw pressed
        for(let i = 0; i < pressed.length; i++){
            for(let j = 0; j < pressed[i].length; j++){
                dom.map[LANE_Y + 1 + i][j + PRESS_X].textContent = pressed[i].substr(j,1);
            }
        }

        run_timer = setTimeout( run ,36 );
    }

    function moveLane(){
        for(let i = 0; i < lane.length - 1; i++){
            lane[i] = lane[i+1];
        }
        setLaneRnd( lane.length - 1 );
    }

    function setLaneRnd(index){
        const VALUES = ['ク','リ','ア'];
        lane[index] = VALUES[ Math.floor( Math.random() * VALUES.length ) ];
    }

    createBase('trp20','trp_story_20','#5e83ff',(inside)=>{
        if(!init){
            init = true;

            inside.style.cursor = 'pointer';

            inside.addEventListener('click',()=>{
                if(press_phase !== 0){return;}

                press_phase = 1;
                press_count = 0;
            });

            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';

                dom.map = new Array( MAP_H );
                for(let y = 0; y < dom.map.length; y++){
                    dom.map[y] = new Array( MAP_W );
                    for(let x = 0; x < dom.map[y].length; x++){
                        let a = document.createElement('div');
                        a.style.position = 'absolute';
                        a.style.left = (x * BLOCK_SIZE)+'px';
                        a.style.top  = (y * BLOCK_SIZE)+'px';

                        dom.map[y][x] = a;
                        p.appendChild( a );
                    }
                }
                return p;
            })());
            inside.appendChild(document.createElement('br'));
            inside.appendChild(document.createElement('br'));
            inside.appendChild(document.createElement('br'));
            inside.appendChild(document.createElement('br'));
            inside.appendChild(document.createElement('br'));
        }

        for(let i = 0; i < lane.length; i++){
            setLaneRnd(i);
        }
        
        run();
    },(inside)=>{
        clearTimeout(run_timer);
    });
}