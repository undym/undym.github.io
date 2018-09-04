{
    const SQUARE_W = 3;
    const SQUARE_H = 1;

    let init = false;
    let squares;
    let clear;

    function reset(){
        for(let y = 0; y < squares.length; y++){
            for(let x = 0; x < squares[y].length; x++){
                squares[y][x].textContent = 'ク';
            }
        }
    }

    createBase('trp27','trp_story_27','#4b9c63',(inside)=>{
        if(!init){
            init = true;

            function addClickListener(dom, x, y){

                dom.addEventListener('click',()=>{

                    function change(_x, _y){
                        const CLEAR = {'ク':'リ','リ':'ア','ア':'ク'};
                        if(_y < 0 || _y >= squares.length || _x < 0 || _x >= squares[_y].length){return;}
                        squares[_y][_x].textContent = CLEAR[ squares[_y][_x].textContent ];
                    }
                    
                    change(x,y);
                    change(x  ,y-1);
                    change(x+1,y);
                    change(x  ,y+1);
                    change(x-1,y);
                    
                    let all_line_clear = (()=>{
                        
                        for(let _y = 0; _y < squares.length; _y++){
                            if(    squares[_y][0].textContent !== 'ク' 
                                || squares[_y][1].textContent !== 'リ' 
                                || squares[_y][2].textContent !== 'ア'
                            ){
                                return false;
                            }
                        }
                        return true;
                    })();
                    if(all_line_clear){
                        clear.textContent = 'クリア★';
                    }
                });


            }

            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '横書きのクリアを1つ並べよ。';
                return a;
            })());
            inside.appendChild( document.createElement('br') );

            squares = new Array(SQUARE_H);

            for(let y = 0; y < squares.length; y++){
                squares[y] = new Array(SQUARE_W);
                inside.appendChild((()=>{
                    let p = document.createElement('div');
                    p.style.position = 'relative';
                    p.style.left = '4em';
                    
                    for(let x = 0; x < squares[y].length; x++){
                        let a = document.createElement('span');
                        squares[y][x] = a;

                        addClickListener(a, x, y);

                        p.appendChild( a );
                    }
                    return p;
                })());
            }
            
            inside.appendChild( document.createElement('br') );
            inside.appendChild((()=>{
                clear = document.createElement('div');
                clear.textContent = '　';
                return clear;
            })());
        }
        
        reset();
    },(inside)=>{
    });
}