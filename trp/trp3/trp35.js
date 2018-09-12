{
    const box_w = 20;
    const box_h = 20;
    const total_w_num = 50;
    const total_h_num = 50;
    const font_size = 0.5;
    createBase('trp35','trp_story_35','#a58ac4',{
        init:(inside)=>{
            const CLEARS = ['ク','リ','ア','★'];
            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';
                let cx = total_w_num / 2;
                let cy = total_h_num / 2;
                let i = 0;
                for(let y = 0; y < total_h_num; y++){
                    for(let x = 0; x < total_w_num; x++){
                        let sin = Math.sin( (y * total_w_num + x * y) * Math.PI * 2 / total_w_num );
                        if(sin >= 0){continue;}

                        let a = document.createElement('div');
                        a.textContent = CLEARS[i % CLEARS.length];
                        a.style.fontSize = font_size+'em';
                        a.style.position = 'absolute';
                        a.style.left = (x)+'em';
                        a.style.top  = (y)+'em';
                        let alpha = Math.abs( sin );
                        a.style.color = `rgba(0,0,0,${alpha})`;
                        p.appendChild( a );
                        
                        i++;
                    }
                }

                return p;
            })());
            
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '　';
                a.style.fontSize = (total_h_num * font_size)+'em';
                return a;
            })());
        },
        open:(inside)=>{
        },
        close:(inside)=>{
        },
    });
}