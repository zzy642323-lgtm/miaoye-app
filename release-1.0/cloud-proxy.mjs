// Forward only the public Supabase API with the user's JWT. Never use the service role.
const allowed = /^(?:functions\/v1\/cat-reply|auth\/v1\/(?:token|signup|logout|user|verify|recover|resend|otp)|rest\/v1\/miaoye_backups|rest\/v1\/rpc\/miaoye_social_(?:me|profile|note|friends|request|friend_action|publish|publish_v2|feed|like|unshare)|storage\/v1\/object\/(?:authenticated\/)?miaoye-private\/[a-f0-9-]+\/[a-f0-9-]+\/[a-f0-9-]+\.json)$/;
export async function cloudProxy(req, res, url, env=process.env, fetcher=fetch) {
  if (!url.pathname.startsWith('/cloud/')) return false;
  const origin=req.headers.origin;
  const trusted=['https://appassets.androidplatform.net','https://s7ianzbg94fw.meoo.run'];
  if(origin && !trusted.includes(origin) && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {res.writeHead(403);res.end();return true;}
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  headers['Access-Control-Allow-Headers']='authorization,content-type,prefer,x-upsert';
  headers['Access-Control-Allow-Methods']='GET,POST,PUT,PATCH,DELETE,OPTIONS';
  const send=(status,body)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(body));};
  if(req.method==='OPTIONS'){res.writeHead(204,headers);res.end();return true;}
  if(!env.SUPABASE_URL||!env.SUPABASE_ANON_KEY){send(503,{error:'云服务正在准备，请稍后重试。'});return true;}
  if(url.pathname==='/cloud/status'){send(200,{ready:true});return true;}
  const target=url.pathname.slice(7);
  if(!allowed.test(target)||!['GET','POST','PUT','PATCH','DELETE'].includes(req.method)){send(404,{error:'Not found'});return true;}
  if(!target.startsWith('auth/')&&!/^Bearer [A-Za-z0-9_.-]+$/.test(req.headers.authorization||'')){send(401,{error:'请先登录。'});return true;}
  try{
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>50*1024*1024){send(413,{error:'备份超过 50 MB，请减少照片后重试。'});return true;}chunks.push(chunk);}
    const upstreamHeaders={apikey:env.SUPABASE_ANON_KEY,Authorization:req.headers.authorization||'Bearer '+env.SUPABASE_ANON_KEY,Origin:'https://s7ianzbg94fw.meoo.run','OneDay-App-Id':'s7ianzbg94fw','X-Meoo-Source':'local-dev'};
    for(const key of ['content-type','prefer','x-upsert'])if(req.headers[key])upstreamHeaders[key]=req.headers[key];
    let upstreamPath=target,body=chunks.length?Buffer.concat(chunks):undefined;
    // Supabase deletes objects through the bucket endpoint with a prefixes array.
    if(req.method==='DELETE'&&target.startsWith('storage/v1/object/miaoye-private/')){
      upstreamPath='storage/v1/object/miaoye-private';
      body=JSON.stringify({prefixes:[target.slice('storage/v1/object/miaoye-private/'.length)]});
      upstreamHeaders['content-type']='application/json';
    }
    const upstream=await fetcher(env.SUPABASE_URL.replace(/\/$/,'')+'/'+upstreamPath+url.search,{method:req.method,headers:upstreamHeaders,body,signal:AbortSignal.timeout(120000),redirect:'error'});
    res.writeHead(upstream.status,{...headers,'Content-Type':upstream.headers.get('content-type')||'application/json'});
    res.end(Buffer.from(await upstream.arrayBuffer()));
  }catch{send(502,{error:'云端暂时连接不上，本机手账仍然保留。'});}
  return true;
}

