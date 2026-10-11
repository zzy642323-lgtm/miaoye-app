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
window.CatVoice={response,traits};
function textOnly(e){return !!e&&e.kind==='simple'&&!(e.library||[]).length}
function thumbnail(e){return '<span class="text-preview" aria-label="纯文字手账"><small>一页心事</small><strong>'+escape(e.note||e.title)+'</strong><i>“</i></span>'}
window.JournalPreview={textOnly,thumbnail};
})();
