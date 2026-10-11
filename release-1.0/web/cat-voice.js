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
[/获奖|拿.{0,3}奖|得奖|国际大奖|领奖|中奖/,['奖拿到了，背后的努力也值得被抱抱。','大奖都拿了，庆祝菜单是不是也该升级？','这份获奖的喜悦，今晚可以慢慢回味。','获奖这一页我要收藏，努力终于有了回音。','拿奖了呀……我偷偷替你骄傲一下。']],
[/作品集|网站|项目|作业|论文|考试|复习|学习/,['这一页写着你的进度，忙完也记得歇歇。','忙这些事情费脑子，饭可别被你省掉了。','把这些进度写下来，也给脑袋留一点安静。','这些进度值得收好，以后翻回来能看见你走了多远。','你在认真做这些事……我就悄悄陪着。']],
[/加班|熬夜|疲惫|累了|好累|疲劳|筋疲力尽/,['这一页都写累了，今天先放过自己吧。','累成这样，休息和吃饭都得排在前面。','这一页的疲惫我看到了，先安静歇一会儿。','今天收集够多了，接下来收集一点休息。','你写的这些辛苦……我想借你靠一下。']],
[/难过|伤心|焦虑|失眠|委屈|烦躁|低落|崩溃/,['这一页的不好受，我陪你慢慢放下来。','不好受的时候，别连一顿饭也为难自己。','这些心事不用急着解决，我在这里。','把这些心事写下来，已经是在照顾自己了。','我不太会安慰……但这一页我会陪你看完。']],
[/奶茶|咖啡|蛋糕|火锅|早餐|晚餐|午饭|冰淇淋|小龙虾|烧烤|甜点/,null,'food'],
[/旅行|旅游|散步|骑车|自行车|公园|海边|爬山|徒步|出游/,null,'trip'],
[/生日/,['生日这一页，好好留给今天的你。','生日！蛋糕上的奶油有我的份吗？','这一年的生日，愿你过得安心。','生日这一页要收藏，下一年还能回来看看。','生日快乐……我悄悄送你一个小爪印。']],
[/花束|鲜花|荷花|莲花|植物|玫瑰|郁金香/,null,'flower']
];
function seedFriendResponse(context={},cat=window.RecordArt?.adopted().cat||0,variant=0){cat=Math.max(0,Math.min(4,Number(cat)||0));const text=journalText(context),event=events.find(([rule])=>rule.test(text));let line,topic;
if(event){topic=event[2]||'event';const subject=text.match(event[0])[0];line=event[1]?.[cat];if(!line){const specific={food:[`${subject}这一口，值得慢慢享受。`,`${subject}都记进本子了，我的那一口呢？`,`${subject}的这一刻，慢慢留在这一页。`,`${subject}也能成为今天的小收藏！`,`${subject}……我可以凑近闻一下吗？`],trip:[`${subject}这段路，慢慢走也很好。`,`${subject}可以，回来记得给我带零食。`,`${subject}的这一刻，我想安静陪你看看。`,`${subject}又多了一页，下次想听你讲路上的发现。`,`${subject}……下次能不能带上我？`],flower:[`${subject}的温柔，收在这一页刚刚好。`,`${subject}很漂亮，旁边有我的零食吗？`,`${subject}这一页，我想安静多看一会儿。`,`${subject}值得收藏，想知道你为什么选中了它。`,`${subject}好漂亮……我轻轻盖个爪印。`]};line=specific[topic][cat]}}
else if(text.trim()&&text.trim()!=='今天的小日子'){topic='written';const clauses=text.split(/[。！？!?\n]/).map(s=>s.trim()).filter(s=>s&&s!=='今天的小日子');const fragment=(clauses.find(s=>s!==context.title)||clauses[0]||text).slice(0,18);line=[`你写的「${fragment}」，我想陪你多读一遍。`,`「${fragment}」我记住了，讲完这一页再一起吃点东西？`,`「${fragment}」留在这里，慢慢读就好。`,`「${fragment}」让我好奇，这一刻为什么想记下来？`,`「${fragment}」……我有认真听哦。`][cat]}
else{topic='photo';line=lines.photo[cat]}
// A second grounded reply quotes the actual writing rather than introducing unrelated topics.
if(variant%2&&text.trim()&&topic!=='photo'){const fragments=text.split(/[。！？!?\n]/).map(s=>s.trim()).filter(s=>s&&s!=='今天的小日子');const fragment=(fragments[variant%fragments.length]||text).slice(0,16);line=[`「${fragment}」这一段，也值得温柔收好。`,`「${fragment}」这段我听到了，先记好再去吃饭。`,`「${fragment}」，我安静地陪你读这一段。`,`「${fragment}」这段，我想听你再讲一点。`,`「${fragment}」……我会悄悄记住的。`][cat]}
return {topic,text:line,trait:traits[cat]}}
const writtenReplies=[
 ['这一段，想陪你再读一次。','这一刻，也值得被好好照顾。','不用急着翻页，我陪你停一会儿。','这件小事，给今天留了一个位置。','这段话，可以留给以后的自己。','读到这里，想轻轻抱抱写下它的人。'],
 ['这段故事听完了，我的零食还没拆。','这件事记住了，我的爪印也想占个位。','我认真听着呢，尾巴已经坐得很端正了。','这一段值得留着，猫猫已经点头了。','故事还没讲完吧？我把耳朵竖起来了。','这页不翻走，我还想在旁边蹲一会儿。'],
 ['这一段，我想安静地多看一会儿。','不用解释更多，这些字已经留下了痕迹。','读到这里，我把脚步放轻一点。','这一刻，适合慢慢翻回来读。','我在这里，陪这段话待一会儿。','这段记好了，先让脑袋安静一下。'],
 ['这一段，为什么特别想记下来？','这件事，后来还有什么小发现？','这一刻前后，还有什么想收藏的细节？','这些字，是今天最想留下的部分吗？','我把这段圈起来了，还想听你多讲一点。','这页里，你最想让以后记住哪一点？'],
 ['这一段……我有认真读哦。','这件事，我会悄悄记在心里。','我不太敢打扰，但还想听你讲一点。','这一刻，我想轻轻盖一个爪印。','这段话……能让我再看一会儿吗？','我把小爪子收好，安静陪你翻这一页。']
];
// Neutral replies also work for photo-only cards without inventing image details.
const defaultExtras=[
 ['今天想多聊一点，还是让我陪你坐一会儿？','小爪子借你牵一下，翻页也不着急。','你慢慢说，我的耳朵一直给你留着。','这一天里，有没有一个想重新过一遍的瞬间？','我挪近一点，陪你把今天收好。','没什么特别的事，也可以来找我呀。','要不要伸个懒腰？我先示范给你看。','今天给自己留一点空闲了吗？','你在这儿，我就舍不得去睡觉了。'],
 ['我已经坐好了，谁也别把我从这页抱走。','你一翻本子，我就知道有热闹可以凑。','今天的猫猫评委决定先给你一个爪爪。','我没有偷懒，我是在认真陪你发呆。','这页能不能留个角落？我要趴一下。','你再点我一次，我就再陪你多待一会儿。','有什么新鲜事？我的耳朵已经上线了。','今天谁最会陪人？当然是眼前这只猫。','先把尾巴摆正，再听你慢慢讲。'],
 ['窗边的位置留给你，我在旁边就好。','安静待一会儿，也算一起过了今天。','外面的事情可以晚点再想。','翻到这里，我就不往前走了。','想说话的时候，我一直都在。','今天有没有一刻，觉得什么也不做很好？','我把尾巴收好，不打扰你看这一页。','留一点时间给自己，哪怕只是发会儿呆。','不用把每一天都安排得满满的。'],
 ['这一天要取个小标题，你会选什么？','如果只能留一个瞬间，你会选哪一个？','今天有没有什么出乎意料的小事？','下一次翻回来，你想先想起什么？','有没有一个细节，差点就被你忘掉了？','这页之后，你还想收集什么？','今天和昨天，有哪一点不一样？','如果把这一天讲给朋友听，你会从哪里开始？','我想多听一点，你愿意接着讲吗？'],
 ['我挪过来一点，可以坐你旁边吗？','你叫我一声，我就不去别处了。','其实我还想陪你多待一会儿。','我的小爪子举起来了，想跟你打个招呼。','有些话慢慢说就好，我不催你。','你愿意讲的话，我会把耳朵竖起来。','今天有没有想偷偷留给自己的小事？','我躲在这页旁边，不是躲着你哦。','你再翻一页，我也跟着过去。']
];
const photoReplies=[
 ['这一页的照片收好啦。你最想留下哪一刻？','还不知道照片里的故事。愿意给我讲一点吗？','我陪你看这一页。想先从哪张照片说起？','这一页先留着。以后补一句话也很好。','照片里的细节，等你慢慢告诉我。','我在这儿等着听，这一页为什么想收好。'],
 ['这一页我蹲好啦。照片里的故事，讲给我听听？','先不猜照片里有什么。你来讲，我来竖耳朵。','这些照片记住哪一刻？我想听原版故事。','照片收好了。我的爪印可以贴旁边吗？','我不抢着猜啦。这一页有什么想告诉我？','这一页先留好。讲故事的时候叫我一声。'],
 ['照片先安静留在这里。故事可以慢慢讲。','我陪你看这一页。不用急着解释。','这一刻先收好。想说时，我再听。','还不知道照片的故事。我在旁边等一会儿。','这一页不急着翻走。慢慢看也很好。','照片里的那一刻，愿意说时再告诉我。'],
 ['这一页有什么小发现？想听你自己讲。','哪张照片最想留着？为什么选它呢？','照片里的故事，能从头讲给我听吗？','这一刻发生了什么？我把耳朵竖起来了。','照片旁边，最想补上哪句话？','这页的主角是谁？等你告诉我，我再记。'],
 ['这一页……我想听你讲讲。','还不知道照片里是什么。我先乖乖等着。','我悄悄看了一眼。能讲一点故事给我吗？','这一刻先留好……我陪你慢慢看。','照片收好啦。想说的时候叫我一下。','我不乱猜哦。这一页等你慢慢讲。']
];
function friendReplies(context={},cat=window.RecordArt?.adopted().cat||0){cat=Math.max(0,Math.min(4,Number(cat)||0));const text=journalText(context),first=seedFriendResponse(context,cat),fragments=[...new Set(text.split(/[。！？!?\n]/).map(s=>s.trim()).filter(s=>s&&s!=='今天的小日子'))];
if(!fragments.length)return [...photoReplies[cat],...defaultExtras[cat]];
const pool=[first.text];
// Include every written event, instead of responding to only the first matched theme.
for(const [rule,,type] of events){const match=text.match(rule);if(match){const fact=match[0];pool.push(seedFriendResponse({note:fact},cat).text);const follow=type==='food'?[`这次的${fact}，最喜欢的是哪一口？`,`下次还想选${fact}吗？`,`给${fact}留了一页，它在今天排第几名？`]:type==='trip'?[`${fact}这一路，最想留下哪一段？`,`下次${fact}，还想走同样的路线吗？`,`除了${fact}，路上还有什么小发现？`]:type==='flower'?[`选中${fact}，是喜欢它的颜色还是别的细节？`,`这页的${fact}，想放在哪个位置收藏？`,`下次翻到${fact}，还会想起今天哪一刻？`]:/奖/.test(fact)?['知道拿奖的那一刻，第一反应是什么？','获奖这件事，最想先告诉谁？','这份奖的背后，哪一段努力最想记住？']:/作品集|网站|项目|作业|论文/.test(fact)?[`关于${fact}，这一页之后准备做哪一步？`,`${fact}里最花心思的地方，想单独记一页吗？`,`忙${fact}的时候，什么细节最想留下？`]:/加班|熬夜|疲惫|累了/.test(fact)?['这页写着辛苦，接下来想怎么歇一会儿？','忙到累的时候，有没有给自己留一点休息？','今天这些辛苦，想先把哪件事放下来？']:/难过|伤心|焦虑|失眠|委屈/.test(fact)?['这段心事，想有人听听，还是先安静待着？','这一页的不好受，不用急着变成开心。','说到这里，想先停一会儿也可以。']:['生日这一页，最想留下哪个瞬间？','今年生日，有什么想悄悄许下的愿望？','生日这天，哪件小事最想以后再读？'];const voices=['我陪你慢慢想。','猫猫竖起耳朵了。','不急着回答。','这个细节我想收藏。','我……有认真听。'];for(const sentence of follow)pool.push(sentence+voices[cat])}}
const fact=text.match(events.find(([rule])=>rule.test(text))?.[0]||/$^/)?.[0];
if(fact){for(const sentence of writtenReplies[cat])pool.push(fact+'这件事，'+sentence)}
else{pool.length=0;pool.push(...writtenReplies[cat],...defaultExtras[cat])}
return [...new Set(pool)]}
function friendResponse(context={},cat=window.RecordArt?.adopted().cat||0,variant=0){cat=Math.max(0,Math.min(4,Number(cat)||0));const replies=friendReplies(context,cat),index=Math.max(0,Math.floor(Number(variant)||0))%replies.length;return {topic:seedFriendResponse(context,cat).topic,text:replies[index],trait:traits[cat],count:replies.length}}
window.CatVoice={response,friendResponse,friendReplies,journalText,traits};
function textOnly(e){return !!e&&e.kind==='simple'&&!(e.library||[]).length}
function thumbnail(e){return '<span class="text-preview" aria-label="纯文字手账"><small>一页心事</small><strong>'+escape(e.note||e.title)+'</strong><i>“</i></span>'}
window.JournalPreview={textOnly,thumbnail};
})();
