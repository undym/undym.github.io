{
    const box_w = 20;
    const box_h = 20;
    const total_w_num = 50;
    const total_h_num = 50;
    const font_size = 0.5;
    createBase('trp34','trp_story_34','#88a6af',{
        init:(inside)=>{
            const CLEARS = ['ク','リ','ア','★'];
            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';
                // let add_x = 100 / total_w_num;
                // let add_h = 100 / total_h_num;
                let cx = total_w_num / 2;
                let cy = total_h_num / 2;
                let i = 0;
                for(let y = 0; y < total_h_num; y++){
                    if(y === cy){continue;}
                    for(let x = 0; x < total_w_num; x++){
                        if(x === cx){continue;}
                        if(
                               y >= cy - box_h / 2 
                            && y <= cy + box_h / 2
                            && x >= cx - box_w / 2
                            && x <= cx + box_w / 2
                        ){continue;}
                        let a = document.createElement('div');
                        a.textContent = CLEARS[i % CLEARS.length];
                        a.style.fontSize = font_size+'em';
                        a.style.position = 'absolute';
                        a.style.left = (x)+'em';
                        a.style.top  = (y)+'em';
                        p.appendChild( a );
                        
                        i++;
                    }
                }

                p.appendChild((()=>{
                    let a = document.createElement('div');
                    a.textContent = 'クリア★';
                    a.style.position = 'absolute';
                    a.style.textAlign = 'center';
                    a.style.fontSize = font_size+'em';
                    a.style.left = (total_w_num / 2 - a.textContent.length / 2 + 1)+'em';
                    a.style.top  = (total_h_num / 2)+'em';
                    return a;
                })());


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