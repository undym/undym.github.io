

export const randomInt = (min:number, max:number):number=>{
    min = Math.round(min);
    max = Math.round(max - min);
    return Math.floor(min + Math.random() * max);
};

export const randomFloat = (min:number, max:number):number=>{
    return min + Math.random() * (max - min);
};

// export function choice<T>(arr:ReadonlyArray<T>):T;
// export function choice<T>(arr:Array<T>):T;
// export function choice<T>(arr:any):T;
//     let i = Math.floor( Math.random() * arr.length );
//     return arr[i];
// };

export const choice = <T>(arr:ReadonlyArray<T> | Array<T>):T=>{
    let i = Math.floor( Math.random() * arr.length );
    return arr[i];
}