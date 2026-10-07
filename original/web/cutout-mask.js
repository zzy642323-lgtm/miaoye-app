// Narrow the uncertain edge while retaining object interiors and larger holes.
export function solidMask(values,width,height){
 const n=width*height;if(values.length!==n)throw Error('Invalid mask size');
 const mask=new Uint8Array(n),outside=new Uint8Array(n),queue=new Int32Array(n);let head=0,tail=0;
 for(let i=0;i<n;i++)mask[i]=Number.isFinite(values[i])&&values[i]>=.38?1:0;
 const add=i=>{if(!mask[i]&&!outside[i]){outside[i]=1;queue[tail++]=i;}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);if(x)add(i-1);if(x<width-1)add(i+1);if(y)add(i-width);if(y<height-1)add(i+width);}
 // Fill only small enclosed holes: broad openings such as handles stay open.
 const visited=new Uint8Array(n),maxHole=Math.max(4,Math.floor(n*.001));
 for(let seed=0;seed<n;seed++)if(!mask[seed]&&!outside[seed]&&!visited[seed]){
  head=0;tail=0;queue[tail++]=seed;visited[seed]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1])if(next>=0&&!mask[next]&&!outside[next]&&!visited[next]){visited[next]=1;queue[tail++]=next;}}
  if(tail<=maxHole)for(let k=0;k<tail;k++)mask[queue[k]]=1;
 }
 // Keep disconnected real objects, remove only tiny specks away from their edges.
 visited.fill(0);const minIsland=Math.max(3,Math.floor(n*.00015));
 for(let seed=0;seed<n;seed++)if(mask[seed]&&!visited[seed]){
  head=0;tail=0;queue[tail++]=seed;visited[seed]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1])if(next>=0&&mask[next]&&!visited[next]){visited[next]=1;queue[tail++]=next;}}
  if(tail<minIsland)for(let k=0;k<tail;k++)mask[queue[k]]=0;
 }
 const alpha=new Uint8ClampedArray(n);
 for(let i=0;i<n;i++)if(mask[i]){
  const x=i%width,y=Math.floor(i/width),edge=(x&&!mask[i-1])||(x<width-1&&!mask[i+1])||(y&&!mask[i-width])||(y<height-1&&!mask[i+width]);
  alpha[i]=edge?Math.round(210+45*Math.min(1,Math.max(0,(values[i]-.38)/.32))):255;
 }
 return alpha;
}
