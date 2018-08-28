{
    const DUMMY_TEXT = '　';
    const MAP = [
        `'|''''''''''`,
        `~|~~~~~~~~~~`,
        `.|..........`,
        `.J..........`,
    ];
    const FISH = `>'>><`;
    //

    let init = false;
    let dom = {
        fishing:undefined,
        msg:undefined,
        water:undefined,
    };

    let run_timer;
    let fish = {
        exists:false,
        x:0,
        y:0,
    };

    function run(){
        if(!fish.exists){
            fish.exists = true;
            fish.x = MAP[0].length;
            fish.y = 3;
        }

        if(fish.x > 0){fish.x--;}

        updateDom();

        run_timer = setTimeout( run ,150 );
    }

    function updateDom(){
        for(let y = 0; y < dom.water.length; y++){
                dom.water[y].textContent = MAP[y];
        }

        {
            let x = i + fish.x;
            let y = fish.y;
            if(y >= 0 && y < MAP.length && x >= 0 && x < MAP[y].length){

                // dom.water[y].textContent = FISH[i];
            }
        }
    }

    createBase('trp20','trp_story_20','#5e83ff',(inside)=>{
        if(!init){
            init = true;

            inside.appendChild((()=>{
                let left = document.createElement('div');
                left.style.cssFloat = 'left';
                left.style.width = '10%';

                left.appendChild( document.createElement('br') );
                left.appendChild((()=>{
                    dom.fishing = document.createElement('div');
                    dom.fishing.textContent = '釣る';
                    dom.fishing.style.cursor = 'pointer';
                    dom.fishing.style.textDecoration = 'underline';

                    dom.fishing.addEventListener('click',()=>{
                    });
                    return dom.fishing;
                })());

                return left;
            })());

            inside.appendChild((()=>{
                let right = document.createElement('div');
                right.style.cssFloat = 'right';
                right.style.width = '90%';
                right.style.position = 'relative';
                
                right.appendChild((()=>{
                    dom.msg = document.createElement('div');
                    dom.msg.textContent = DUMMY_TEXT;
                    return dom.msg;
                })());
                right.appendChild((()=>{
                    let p = document.createElement('div');
                    // p.style.clear = 'both';

                    const BLOCK_SIZE = {w:12,h:14};

                    dom.water = new Array( MAP.length );

                    for(let y = 0; y < dom.water.length; y++){
                        let p2 = document.createElement('div');
                        p2.textContent = MAP[y];
                        p2.style.fontFamily = 'monospace';
                        dom.water[y] = p2;
                        p.appendChild( p2 );
                    }
                    return p;
                })());

                return right;
            })());
            //背景確保用
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.clear = 'both';
                a.textContent = DUMMY_TEXT;
                a.appendChild( document.createElement('br') );
                a.appendChild( document.createElement('br') );
                a.appendChild( document.createElement('br') );
                return a;
            })());
        }
        
        run();
    },(inside)=>{
        clearTimeout(run_timer);
    });
}