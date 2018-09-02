{
    let init = false;
    let clear;
    let run_timer;
    let count = 0;

    function run(){
        let deg = Math.floor( Math.sin( Math.PI / 2 * count ) * 8 );
        for(let i = 0; i < clear.length; i++){
            clear[i].style.transform = 'rotate('+deg+'deg)';
        }
        count++;
        run_timer = setTimeout( run ,50 );
    }

    createBase('trp25','trp_story_25','#25ffff',(inside)=>{
        if(!init){
            init = true;

            const CLEAR = ['ク','リ','ア','★'];
            clear = [];
            inside.appendChild((()=>{
                let p = document.createElement('div');

                // p.appendChild((()=>{
                //     let a = document.createElement('span');
                //     a.textContent = '.';
                //     return a;
                // })());

                for(let i = 0; i < CLEAR.length; i++){
                    p.appendChild((()=>{
                        let a = document.createElement('span');
                        a.style.display = 'inline-block';

                        let c = document.createElement('span');
                        c.textContent = CLEAR[i];
                        c.style.position = 'relative';
                        c.style.left = '-0.5em';

                        a.appendChild(c);

                        clear.push( a );

                        return a;
                    })());
                }
                return p;
            })());
            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.clear = 'both';
                return p;
            })());
        }

        run();
    },(inside)=>{
        clearTimeout( run_timer );
    });
}