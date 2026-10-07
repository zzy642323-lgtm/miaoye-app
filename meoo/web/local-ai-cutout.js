import {solidMask} from './cutout-mask.js';
// U²-Net small model; preprocessing follows rembg's U2netpSession.
let runtimePromise,sessionPromise;
function runtime(){
  if(window.ort)return Promise.resolve(window.ort);
  return runtimePromise??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/ort.wasm.min.js',import.meta.url).href;script.onload=()=>resolve(window.ort);script.onerror=()=>{runtimePromise=undefined;script.remove();reject(new Error('无法加载本机抠图引擎'));};document.head.append(script);});
}
async function session(progress){
  if(!sessionPromise)sessionPromise=(async()=>{progress?.('加载本机模型',0,1);const ort=await runtime();ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;ort.env.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;return await ort.InferenceSession.create(new URL('./models/u2netp.onnx',import.meta.url).href,{executionProviders:['wasm'],graphOptimizationLevel:'all'});})();
  try{return await sessionPromise;}catch(error){sessionPromise=undefined;throw error;}
}
export async function removeLocalBackground(canvas,progress){
  const engine=await session(progress),ort=window.ort,size=320,area=size*size;
  progress?.('识别照片主体',0,1);await new Promise(resolve=>requestAnimationFrame(resolve));
  const input=document.createElement('canvas');input.width=input.height=size;const context=input.getContext('2d',{willReadFrequently:true});context.drawImage(canvas,0,0,size,size);
  const pixels=context.getImageData(0,0,size,size).data,tensor=new Float32Array(area*3),mean=[.485,.456,.406],std=[.229,.224,.225];let max=1;
  for(let i=0;i<pixels.length;i+=4)for(let c=0;c<3;c++)max=Math.max(max,pixels[i+c]);
  for(let i=0;i<area;i++)for(let c=0;c<3;c++)tensor[c*area+i]=(pixels[i*4+c]/max-mean[c])/std[c];
  const outputs=await engine.run({[engine.inputNames[0]]:new ort.Tensor('float32',tensor,[1,3,size,size])});
  const mask=outputs[engine.outputNames[0]].data;let low=Infinity,high=-Infinity;
  for(let i=0;i<area;i++){low=Math.min(low,mask[i]);high=Math.max(high,mask[i]);}
  if(!Number.isFinite(high)||high-low<1e-6)throw new Error('没有识别到清晰主体，可手动修边');
  const normalized=Float32Array.from(mask,v=>Math.max(0,Math.min(1,(v-low)/(high-low))));
  const refined=solidMask(normalized,size,size),image=context.createImageData(size,size);let foreground=0;
  for(let i=0;i<area;i++){const alpha=refined[i];image.data[i*4]=image.data[i*4+1]=image.data[i*4+2]=255;image.data[i*4+3]=alpha;if(alpha>128)foreground++;}
  if(foreground<area*.002)throw new Error('主体太小，可换一张照片或手动修边');
  context.putImageData(image,0,0);const result=document.createElement('canvas');result.width=canvas.width;result.height=canvas.height;const out=result.getContext('2d');out.drawImage(canvas,0,0);out.globalCompositeOperation='destination-in';out.imageSmoothingEnabled=true;out.imageSmoothingQuality='high';out.drawImage(input,0,0,result.width,result.height);out.globalCompositeOperation='source-over';
  progress?.('本机抠图完成',1,1);return result.toDataURL('image/png');
}
