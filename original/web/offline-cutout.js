// Edge-connected background removal for plain backdrops. Everything runs locally.
export function removePlainBackground(pixels,width,height){
 const out=new Uint8ClampedArray(pixels),buckets=new Map(),edge=[];
 for(let x=0;x<width;x++){edge.push(x,(height-1)*width+x);}for(let y=1;y<height-1;y++)edge.push(y*width,y*width+width-1);
 for(const i of edge){const p=i*4;if(pixels[p+3]<128)continue;const key=[0,1,2].map(c=>pixels[p+c]>>5).join(',');const b=buckets.get(key)||{n:0,r:0,g:0,b:0};b.n++;b.r+=pixels[p];b.g+=pixels[p+1];b.b+=pixels[p+2];buckets.set(key,b);}
 const major=[...buckets.values()].sort((a,b)=>b.n-a.n)[0];if(!major||major.n<edge.length*.3)return {pixels:out,removed:false};
 const color=[major.r/major.n,major.g/major.n,major.b/major.n],seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0,removed=0;
 const push=i=>{if(seen[i])return;seen[i]=1;const p=i*4,delta=Math.hypot(pixels[p]-color[0],pixels[p+1]-color[1],pixels[p+2]-color[2]);if(pixels[p+3]<16||delta<=48)queue[tail++]=i;};
 edge.forEach(push);while(head<tail){const i=queue[head++];if(out[i*4+3]>0)removed++;out[i*4+3]=0;const x=i%width,y=Math.floor(i/width);if(x)push(i-1);if(x<width-1)push(i+1);if(y)push(i-width);if(y<height-1)push(i+width);}
 if(removed<width*height*.03||removed>width*height*.96)return {pixels:new Uint8ClampedArray(pixels),removed:false};
 return {pixels:out,removed:true};
}
