(() => {
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const traits=['温柔的小小陪伴家','快乐的美食探险家','安静的夜晚守护者','好奇的日常收藏家','害羞的暖心小伙伴'];
const topicRules=[['tired',/累|疲惫|加班|难过|伤心|焦虑|烦|哭/],['food',/吃|喝|饭|奶茶|咖啡|蛋糕|甜|火锅|罐头|杯|茶颜/],['trip',/出门|旅行|散步|骑车|自行车|秋天|风景|远方|公园/],['flower',/花|莲|植物|阳光|春天/],['happy',/开心|快乐|哈哈|幸福|满足|好耶|喜欢/]];
const lines={
tired:['辛苦啦，今天不用逞强。我陪你歇一会儿。','先歇歇，吃饱才有力气继续。小鱼干分你一半。','不想说也没关系，我会安静地陪着你。','今天先收集一个小小的休息，明天再出发。','那个……我的肚皮可以借你靠一下。'],
food:['这一口小快乐，值得慢慢尝，也值得记下来。','这份看起来好吃！我的那一口藏在哪里？','慢慢吃吧。今晚的香气，也可以留在这一页。','今天的新发现：美味居然也能贴进本子里！','我、我可以凑近闻一下吗？只闻一下。'],
trip:['走累了就慢一点，沿途的小美好都在等你。','出门可以，记得给我带点好吃的回来。','风吹过的声音，我也想安静地听一会儿。','你发现新地方了？快给我讲讲路上的故事！','下次……能不能也带上我？我会乖乖的。'],
flower:['把这一点温柔收好，日子也会慢慢开花。','花很漂亮。不过旁边有可以吃的吗？','这一页像窗边的花，安静地开着。','这是什么花？我想把每一片花瓣都看清楚。','好漂亮……我悄悄给这一页盖个小爪印。'],
happy:['看到你开心，我也忍不住轻轻摇尾巴。','这么开心？庆祝一下，零食是不是该加餐啦！','这一点开心，留到夜晚也会发光。','快乐的证据又多一条！快收进我们的本子。','你一笑，我也偷偷跟着开心了。'],
ordinary:['普通的一天，也有值得好好抱住的瞬间。','今天记好了，那今天的小零食呢？','不说很多也没关系，这一页已经替你记住了。','让我看看，今天又发现了哪件小事？','能陪你记下今天……真好。'],
photo:['这张素材也能替你记住今天，慢慢给它写句话吧。','照片收好啦。快告诉我，有没有好吃的？','不用急着解释，我陪你看这一张。','这张照片里有什么故事？给我一点线索吧！','我悄悄看了一眼……想听你讲它的故事。']};
const sampleTopics={9:'food',5:'food',13:'food',8:'food',7:'food',2:'trip',15:'flower'};
function response(context={},cat=window.RecordArt?.adopted().cat||0){const text=String(context.text||context.title||'')+' '+String(context.note||'');let topic=topicRules.find(([,r])=>r.test(text))?.[0];if(!topic){for(const asset of context.assets||context.library||[]){topic=sampleTopics[asset.sample]||topicRules.find(([,r])=>r.test(asset.label||''))?.[0];if(topic)break}}if(!topic){const photos=context.photos||[];for(const value of [context.photo,...photos]){topic=sampleTopics[value];if(typeof value==='string')topic=/cups|cans|cupcake/.test(value)?'food':/bike/.test(value)?'trip':/lotus/.test(value)?'flower':topic;if(topic)break}}if(!topic)topic=context.mood<=1?'tired':context.mood>=3?'happy':(context.assets?.length&&!text.trim()?'photo':'ordinary');return {topic,text:lines[topic][cat],trait:traits[cat]}}
// Only read written journal content, never infer a subject from an uploaded image.
function journalText(context={}){return [...new Set([context.title,context.text,context.note,context.message,...(context.pages||[]).flatMap(p=>(p.items||[]).filter(i=>i.kind==='text').map(i=>i.text))].filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim()))].join('。')}
const events=[
[/获奖|拿.{0,3}奖|得奖|国际大奖/,['奖拿到了，背后的努力也值得被抱抱。','大奖都拿了，庆祝菜单是不是也该升级？','这份获奖的喜悦，今晚可以慢慢回味。','获奖这一页我要收藏，努力终于有了回音。','拿奖了呀……我偷偷替你骄傲一下。']],
[/作品集|网站|项目|作业|论文/,['这一页写着你的进度，忙完也记得歇歇。','忙这些事情费脑子，饭可别被你省掉了。','把这些进度写下来，也给脑袋留一点安静。','这些进度值得收好，以后翻回来能看见你走了多远。','你在认真做这些事……我就悄悄陪着。']],
[/加班|熬夜|疲惫|累了/,['这一页都写累了，今天先放过自己吧。','累成这样，休息和吃饭都得排在前面。','这一页的疲惫我看到了，先安静歇一会儿。','今天收集够多了，接下来收集一点休息。','你写的这些辛苦……我想借你靠一下。']],
[/难过|伤心|焦虑|失眠|委屈/,['这一页的不好受，我陪你慢慢放下来。','不好受的时候，别连一顿饭也为难自己。','这些心事不用急着解决，我在这里。','把这些心事写下来，已经是在照顾自己了。','我不太会安慰……但这一页我会陪你看完。']],
[/奶茶|咖啡|蛋糕|火锅|早餐|晚餐|午饭|冰淇淋|小龙虾|烧烤|甜点/,null,'food'],
[/旅行|散步|骑车|自行车|公园|海边|爬山/,null,'trip'],
[/生日/,['生日这一页，好好留给今天的你。','生日！蛋糕上的奶油有我的份吗？','这一年的生日，愿你过得安心。','生日这一页要收藏，下一年还能回来看看。','生日快乐……我悄悄送你一个小爪印。']],
[/花束|鲜花|荷花|莲花|植物/,null,'flower']
];
function friendResponse(context={},cat=window.RecordArt?.adopted().cat||0,variant=0){cat=Math.max(0,Math.min(4,Number(cat)||0));const text=journalText(context),event=events.find(([rule])=>rule.test(text));let line,topic;
if(event){topic=event[2]||'event';const subject=text.match(event[0])[0];line=event[1]?.[cat];if(!line){const specific={food:[`${subject}这一口，值得慢慢享受。`,`${subject}都记进本子了，我的那一口呢？`,`${subject}的这一刻，慢慢留在这一页。`,`${subject}也能成为今天的小收藏！`,`${subject}……我可以凑近闻一下吗？`],trip:[`${subject}这段路，慢慢走也很好。`,`${subject}可以，回来记得给我带零食。`,`${subject}的这一刻，我想安静陪你看看。`,`${subject}又多了一页，下次想听你讲路上的发现。`,`${subject}……下次能不能带上我？`],flower:[`${subject}的温柔，收在这一页刚刚好。`,`${subject}很漂亮，旁边有我的零食吗？`,`${subject}这一页，我想安静多看一会儿。`,`${subject}值得收藏，想知道你为什么选中了它。`,`${subject}好漂亮……我轻轻盖个爪印。`]};line=specific[topic][cat]}}
else if(text.trim()&&text.trim()!=='今天的小日子'){topic='written';const clauses=text.split(/[。！？!?\n]/).map(s=>s.trim()).filter(s=>s&&s!=='今天的小日子');const fragment=(clauses.find(s=>s!==context.title)||clauses[0]||text).slice(0,18);line=[`你写的「${fragment}」，我想陪你多读一遍。`,`「${fragment}」我记住了，讲完这一页再一起吃点东西？`,`「${fragment}」留在这里，慢慢读就好。`,`「${fragment}」让我好奇，这一刻为什么想记下来？`,`「${fragment}」……我有认真听哦。`][cat]}
else{topic='photo';line=lines.photo[cat]}
// A second grounded reply quotes the actual writing rather than introducing unrelated topics.
if(variant%2&&text.trim()&&topic!=='photo'){const fragments=text.split(/[。！？!?\n]/).map(s=>s.trim()).filter(s=>s&&s!=='今天的小日子');const fragment=(fragments[variant%fragments.length]||text).slice(0,16);line=[`「${fragment}」这一段，也值得温柔收好。`,`「${fragment}」这段我听到了，先记好再去吃饭。`,`「${fragment}」，我安静地陪你读这一段。`,`「${fragment}」这段，我想听你再讲一点。`,`「${fragment}」……我会悄悄记住的。`][cat]}
return {topic,text:line,trait:traits[cat]}}
window.CatVoice={response,friendResponse,journalText,traits};
function textOnly(e){return !!e&&e.kind==='simple'&&!(e.library||[]).length}
function thumbnail(e){return '<span class="text-preview" aria-label="纯文字手账"><small>一页心事</small><strong>'+escape(e.note||e.title)+'</strong><i>“</i></span>'}
window.JournalPreview={textOnly,thumbnail};
})();
