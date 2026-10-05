import {illustratedStory} from './adventure-art.js';
export const notebookLimit=n=>n>=25?5:n>=15?4:3;
export const catTraits=['小只纤细 · 温柔慢热','圆滚滚的大橘 · 热情贪吃','高挑长尾 · 安静勇敢','结实短尾 · 活泼好奇','小小毛团 · 害羞黏人'];
const tales=[
 [['一碗温热的水','路过花店，店主给我留了一碗水。我没打扰她，只在门口陪她看了一会儿花。','garden',2],['把小花带回来','发现一朵被风吹落的小花，我把它放在你的本子旁边。希望你今天也有一点开心。','garden',0],['雨停之后','躲雨时遇见另一只小猫，我们一起等到雨停。安静地陪着，也是一种勇敢。','house',3],['晒太阳的位置','我找到一块暖暖的地板，特意给你留了一半。今天的好事，就是太阳刚好照过来。','house',4]],
 [['好心人的加餐','香味把我带到了巷子口，好心人给了我一点猫粮。我吃得肚子圆圆，用呼噜声道谢。','garden',0],['面包店探险','守在面包店门口闻香气，老板笑着叫我小馋猫。没吃面包，但交到了一位朋友。','house',2],['大战小老鼠','小老鼠从草丛溜出来！追了三步我就决定休战：跑步很累，午睡更重要。','garden',4],['午睡也有收获','梦里有一条大鱼，醒来只有一片树叶。我把树叶收好，它也算今天的战利品。','garden',3]],
 [['月光下的巡逻','沿着围墙巡逻，我赶跑了吓唬小猫的影子。其实影子是我的，不过没人知道。','garden',0],['与小老鼠对峙','我和小老鼠隔着花盆对视很久。它先溜走，我把这次胜利轻轻记下来。','house',2],['守好这一盏灯','窗边的灯一直亮着，我替你守了一会儿。等你回来，一起翻今天的手账。','house',3],['屋顶上的朋友','在屋顶遇见爱聊天的猫。听它说完远方的故事，我悄悄想起了你。','garden',5]],
 [['纸箱里的新世界','钻进街角的空纸箱，发现它是宇宙飞船！今天完成了一次很了不起的探险。','house',0],['追风的一天','追着叶子绕花园三圈。没追上风，但是认识了很多小花。','garden',4],['好心人的礼物','有人把小球滚给我。我玩了好久，又把它滚回去：朋友之间要一起分享。','garden',2],['大战玩具老鼠','把玩具老鼠扑倒了五次！第六次它躲到沙发下面，我宣布明天继续比赛。','house',0]],
 [['主动打招呼','遇见好心人，犹豫很久，终于轻轻蹭了她的手。今天的我勇敢了一点点。','garden',2],['藏起来的小礼物','找到软软的羽毛，我把它藏在枕头旁边。等你回来，只给你看。','house',5],['躲雨的秘密基地','下雨时钻进小屋，把爪子藏起来。雨声很轻，适合想念一个人。','house',3],['小老鼠也害羞','小老鼠看见我就躲起来。我没有追它，毕竟我也知道害羞是什么感觉。','garden',0]]
];
export function updateCatLife(saved={},unlocked,now=Date.now(),rng=Math.random){const life=structuredClone(saved);let changed=false;for(let cat=0;cat<5;cat++)if(unlocked(cat)){const item=life[cat]??={affection:0,stories:[],nextAt:0,joinedAt:now};if(!item.joinedAt){item.joinedAt=item.stories[0]?.created||now;changed=true;}if(!item.nextAt||now>=item.nextAt){const last=item.stories.at(-1)?.index;let index=Math.min(tales[cat].length-1,Math.floor(rng()*tales[cat].length));if(index===last)index=(index+1)%tales[cat].length;item.stories.push({id:`${cat}-${now}`,cat,index,created:now});item.stories=item.stories.slice(-20);item.affection=Math.min(100,(item.affection||0)+3);item.nextAt=now+(2+Math.min(1,Math.floor(rng()*2)))*86400000;changed=true;}}return {life,changed};}
export function petAffection(life,cat,day){const item=life[cat];if(!item||item.petDay===day)return false;item.petDay=day;item.affection=Math.min(100,(item.affection||0)+2);return true;}
export function storyFor(r,cats){if(!r)return null;return illustratedStory(r,cats);}
export function latestStory(life,cats){return storyFor(Object.values(life).flatMap(x=>x.stories||[]).sort((a,b)=>b.created-a.created)[0],cats);}
