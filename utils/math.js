export const toGwei = (ele)=>{
    if(ele)
      return (Number(ele)/1000000000).toFixed(2);
    return null
  } 

export const asc = arr => arr.sort((a, b) => a - b);

export const quartile = (arr, q) =>{
    if(arr === undefined || arr === null || arr.length == 0)
        return "N/A"
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);

    const rest = (pos - base);
    if (sorted[base + 1] !== undefined) {
        return (Number(sorted[base]) + rest * (Number(sorted[base + 1]) - Number(sorted[base]))).toFixed(2);
    } else {
        return sorted[base];
    }
} 