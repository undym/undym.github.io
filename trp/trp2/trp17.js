{

    const DUMMY_TEXT = '　';
    const FIELD_W = 15;
    const FIELD_H = 30;
    const BLOCK = [
        [
            [0,1,0],
            [1,1,1],
        ],
        [
            [1,1],
            [1,1],
        ],
        [
            [1,0,0],
            [1,0,0],
            [1,1,1],
        ],
    ];
    const BLOCK_SIZE = 10;

    let init = false;
    let running = false;
    let game_over = false;
    let dom = {
        field:undefined,
    };
    let field;
    let run_timer;
    let falling = {
        block:null,
        x:0,
        y:0,
    };

    let num_to_block = {0:'.',1:'X'};

    function run(){
        if(game_over){
            running = false;
            return;
        }

        if(!falling.block){
            let i = Math.floor( Math.random() * BLOCK.length);
            falling.block = BLOCK[i];
            falling.x = Math.floor( FIELD_W / 2 );
            falling.y = 0;
        }

        {//着地
            function deleteLine(){
                for(let y = 0; y < field.length; y++){
                    let del = true;
                    for(let x = 0; x < field[y].length; x++){
                        if(field[y][x] === 0){
                            del = false;
                            break;
                        }
                    }
                    if(del){
                        console.log('del');
                        for(let x = 0; x < field[y].length; x++){
                            field[y][x] = 0;
                        }
                        //消した行を詰める
                        for(let y2 = y; y2 > 0 ;y2--){
                            for(let x = 0; x < field[y2].length; x++){
                                field[y2][x] = field[y2-1][x];
                            }
                        }
                        for(let x = 0; x < field[0].length; x++){
                            field[0][x] = 0;
                        }
                        y--;
                        continue;
                    }
                }
            }
            label:
            for(let y = 0; y < falling.block.length; y++){
                for(let x = 0; x < falling.block[y].length; x++){
                    if(falling.block[y][x] === 0){continue;}
                    let fx = x + falling.x;
                    let fy = y + falling.y;
                    if(     
                            fy + 1 >= FIELD_H
                        ||  field[fy+1][fx] === 1
                    ){
                        setBlock( falling.block ,falling.x ,falling.y );
                        falling.block = null;

                        deleteLine();

                        if(falling.y <= 0){
                            game_over = true;
                        }

                        break label;
                    }
                }
            }
        }

        if(falling.block){
            falling.y ++;

            if(Math.random() <= 0.3){
                if(Math.random() < 0.5){
                    falling.x --;
                    if(falling.x < 0){falling.x = 0;}

                    for(let y = 0; y < falling.block.length; y++){
                        let x = 0;
                        if(field[y][x] === 1){
                            falling.x++;
                            let w = falling.block[0].length;
                            if(falling.x > FIELD_W - w){falling.x = FIELD_W - w;}
                            break;
                        }
                    }
                }else{
                    falling.x ++;
                    let w = falling.block[0].length;
                    if(falling.x > FIELD_W - w){falling.x = FIELD_W - w;}

                    for(let y = 0; y < falling.block.length; y++){
                        let x = falling.block[y].length - 1;
                        if(field[y][x] === 1){
                            falling.x--;
                            if(falling.x < 0){falling.x = 0;}
                            break;
                        }
                    }
                }
            }
            if(Math.random() <= 0.2){
                roll();
            }
        }


        updateDom();
        run_timer = setTimeout( run ,36 );
    }
    /** 
     * block = ['.XX','XXX'];
    */
    function setBlock(block ,x ,y){
        for(let by = 0; by < block.length; by++){
            for(let bx = 0; bx < block[by].length; bx++){
                if(block[by][bx] === 0){continue;}
                let fx = bx + x;
                let fy = by + y;
                if(fy < 0 || fy >= field.length || fx < 0 || fx >= field[fy].length){continue;}
                field[fy][fx] = block[by][bx];
            }
        }
    }

    //TODO 回転の禁則処理
    function roll(){
        /*
        [
            [0,1,0],
            [1,1,1],
        ],
        [
            [1,0],
            [1,1],
            [1,0],
        ],
        nb[0][0] = b[1][0]
        nb[0][1] = b[0][0]

        nb[1][0] = b[1][1]
        nb[1][1] = b[0][1]

        nb[2][0] = b[1][2]
        nb[2][1] = b[0][2]
        */
       let b = falling.block;
       let nb = new Array(b[0].length);
       for(let y = 0; y < nb.length; y++){
           nb[y] = new Array(b.length);
       }

       for(let ny = 0; ny < nb.length; ny++){
           let nx_len = nb[ny].length;
           for(let nx = 0; nx < nx_len; nx++){
               nb[ny][nx] = b[nx_len - nx - 1][ny];
           }
       }

       falling.block = nb;
    }

    function reset(){
        for(let y = 0; y < field.length; y++){
            for(let x = 0; x < field[y].length; x++){
                field[y][x] = 0;
            }
        }

        falling.block = null;

        updateDom();
    }

    function updateDom(){
        for(let y = 0; y < dom.field.length; y++){
            for(let x = 0; x < dom.field[y].length; x++){
                dom.field[y][x].textContent = num_to_block[ field[y][x] ];
            }
        }

        if(falling.block){
            for(let y = 0; y < falling.block.length; y++){
                for(let x = 0; x < falling.block[y].length; x++){
                    let dx = falling.x + x;
                    let dy = falling.y + y;
                    if(dy < 0 || dy >= FIELD_H || dx < 0 || dx >= FIELD_W){continue;}
                    if(falling.block[y][x] === 1){
                        dom.field[dy][dx].textContent = 'X';
                    }
                }
            }
        }
    }

    function setClickStart(){
        game_over = false;
        clearTimeout( run_timer );

        // for(let y = 0; y < field.length; y++){
        //     for(let x = 0; x < field[y].length; x++){
        //         field[y][x] = '';
        //     }
        // }

        for(let y = 0; y < dom.field.length; y++){
            for(let x = 0; x < dom.field[y].length; x++){
                dom.field[y][x].textContent = '';
            }
        }

        let y = Math.floor( dom.field.length / 2 );
        dom.field[y][0].textContent = 'ClickStart';
    }

    createBase('trp18','trp_story_18','#dcebcc',(inside)=>{
        if(!init){
            init = true;

            inside.addEventListener('click',()=>{
                if(game_over){
                    setClickStart();
                    return;
                }
                if(!running){
                    running = true;
                    reset();
                    run();
                }
            });

            {
                field = [];
                for(let y = 0; y < FIELD_H; y++){
                    field.push( new Array(FIELD_W) );
                }
            }

            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';

                dom.field = new Array( FIELD_H );

                for(let y = 0; y < FIELD_H; y++){
                    let arr = new Array( FIELD_W );
                    for(let x = 0; x < FIELD_W; x++){
                        let f = document.createElement('div');
                        f.style.position = 'absolute';
                        f.style.left = (x * BLOCK_SIZE)+'px';
                        f.style.top  = (y * BLOCK_SIZE)+'px';
                        p.appendChild( f );
                        arr[x] = f;
                    }

                    dom.field[y] = arr;
                }
                return p;
            })());
            inside.appendChild((()=>{//背景確保用
                let a = document.createElement('div');
                a.style.height = ((FIELD_H + 2) * BLOCK_SIZE)+'px';
                return a;
            })());
        }

        setClickStart();
    },(inside)=>{
        clearTimeout( run_timer );
    });
}