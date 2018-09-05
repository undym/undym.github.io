{
    let init = false;

    createBase('trp28','trp_story_28','#69a07a',(inside)=>{
        if(!init){
            init = true;

            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '横書きのクリアを1つ並べた。';
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = 'クリア★';
                return a;
            })());
        }
        
    },(inside)=>{
    });
}