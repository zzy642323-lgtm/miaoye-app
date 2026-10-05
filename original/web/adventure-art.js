import {loadImage,wrapText} from './images.js';
export const adventureArt=cat=>`./assets/adventure-${cat}-v8.webp`;
const captions=[
 [['花店门口的小客人','花店姐姐给我留了一碗水。我陪她看了一会儿花，也把这份温柔带回来给你。'],['喝过水，再出发','花香和一碗清水，够我记住整个午后。世界很大，好心人也很多。'],['在小花旁边歇一会儿','不急着赶路了。今天，我想认真看看这些花，也认真谢谢照顾我的人。'],['收到一点点温柔','有人记得给小猫留水，真好。下次路过，我还想和她打个招呼。']],
 [['好心人的加餐','在面包店门口遇见好心人。猫粮装满了小碗，我用大大的呼噜声说谢谢。'],['今天是饱饱的一天','本来只想闻闻面包香，结果收到一份猫咪加餐。连肚子都快乐起来了。'],['交到新朋友啦','那只递来猫粮的手很温柔。我决定，明天还来这里和朋友打招呼。'],['小馋猫的好运气','今天最珍贵的发现，是好心人和一碗猫粮。吃饱以后，也想把好运分给你。']],
 [['月光下的对峙','小老鼠躲在花盆后面，我们对视了好久。最后约好：今晚谁也不吓唬谁。'],['大战小老鼠','我守住花盆，它守住自己的勇气。看起来势均力敌，先休战到明天吧。'],['巡夜遇见小邻居','月亮亮起来时，小老鼠也出来散步。安静的夜晚，原来也有小伙伴。'],['勇敢，也可以温柔','没有追赶那只小老鼠。今晚的胜利，是大家都能安心回家睡觉。']],
 [['纸箱里的新世界','花园里捡到一艘纸箱飞船！我当船长，小花当观众，今天的探险非常成功。'],['出发，去花园深处','纸箱一打开，整个世界都新鲜了。明天还想再发现一个小秘密。'],['我的秘密基地','钻进纸箱后，风也变得轻轻的。这座小城堡，我留了一个位置给你。'],['了不起的小小探险','翻过箱沿，看见好多花。只走了一小段，也算勇敢地闯荡了世界。']],
 [['雨停前，等你回来','把羽毛放在窗边，趴在软垫上听雨。小小的好事，想留到你回来再说。'],['窗边的小礼物','找到一根软软的羽毛。我藏好它，也藏好一句很轻的：今天有点想你。'],['躲雨的秘密基地','外面下雨，屋里暖暖。蜷在窗边慢慢等，原来等待也可以很安心。'],['今天想黏着你','雨声变小了，我还是舍不得离开软垫。等你回来，一起看窗外吧。']]
];
export function illustratedStory(record,cats){const [title,body]=captions[record.cat][record.index%4];return {...record,name:cats[record.cat].name,title,body,art:adventureArt(record.cat)};}
export async function adventurePng(story){
 await document.fonts.load('36px JournalCute');const image=await loadImage(story.art||adventureArt(story.cat||0)),canvas=document.createElement('canvas');canvas.width=image.naturalWidth;const w=canvas.width,pad=Math.round(w*.055),ctx=canvas.getContext('2d');ctx.font=`${Math.round(w*.027)}px JournalCute, sans-serif`;const lines=wrapText(ctx,story.body,w-pad*2),footer=pad*2+Math.round(w*.12)+lines.length*Math.round(w*.044);canvas.height=image.naturalHeight+footer;
 ctx.fillStyle='#fff9e8';ctx.fillRect(0,0,w,canvas.height);ctx.drawImage(image,0,0);let y=image.naturalHeight+pad;ctx.fillStyle='#365c46';ctx.font=`${Math.round(w*.038)}px JournalCute, sans-serif`;ctx.fillText(story.title,pad,y+Math.round(w*.038));y+=Math.round(w*.09);ctx.font=`${Math.round(w*.027)}px JournalCute, sans-serif`;for(const line of lines){ctx.fillText(line,pad,y);y+=Math.round(w*.044);}ctx.font=`${Math.round(w*.019)}px sans-serif`;ctx.fillStyle='#78816a';ctx.fillText(`${story.name}的冒险手账 · ${new Date(story.created).toLocaleDateString('zh-CN')}`,pad,canvas.height-pad*.65);return canvas.toDataURL('image/png');
}
