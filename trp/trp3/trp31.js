{
    const OVER = 10;
    let time;
    let start_date;
    let run_timer;
    let clear;

    function run(){
        let now_date = new Date();
        let count_ms = now_date.getTime() - start_date.getTime();
        if(count_ms < OVER * 1000){
            let sec = ''+Math.floor( OVER - count_ms / 1000 );
            let ms = ( '000' + (1000 - count_ms) ).slice(-3);
            time.textContent = sec+'.'+ms;
            run_timer = setTimeout( run, 36 );
        }else{
            time.textContent = '0.000';
            clear.textContent = 'クリア★';
        }
    }

    function reset(){
        start_date = new Date();
        clear.textContent = '　';
    }

    createBase('trp31','trp_story_31','#f7806c',{
        init:(inside)=>{
            inside.appendChild((()=>{
                time = document.createElement('div');
                return time;
            })());
            inside.appendChild((()=>{
                clear = document.createElement('div');
                return clear;
            })());
            
            reset();
        },
        open:(inside)=>{
            run();
        },
        close:(inside)=>{
            clearTimeout( run_timer );
            reset();
        },
    });
}