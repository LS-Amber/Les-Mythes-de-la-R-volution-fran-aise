const ORIGINS = [
  { id:"peasant", name:"乡村农民家庭", desc:"你出生在法国乡村，熟悉地租、什一税、徭役与歉收。土地、粮食和税负是你最先懂得的词。", icon:"🌾",
    stats:{wealth:-1,prestige:-1,safety:1,influence:-1}, axes:{regime:-5,sovereignty:5,equality:10,state_structure:-10,religion:5} },
  { id:"artisan", name:"城市手工业者家庭", desc:"你出生在城市下层，面包价格、行会规矩、街头舆论是你的日常。你对物价的敏感超过任何人。", icon:"🔨",
    stats:{wealth:0,prestige:0,safety:0,influence:0}, axes:{sovereignty:10,equality:10,regime:5,state_structure:5} },
  { id:"bourgeois", name:"资产阶级家庭", desc:"你出身于有教育和财产的家庭——律师、商人或医生之家。你相信改革，但也珍视秩序。", icon:"⚖️",
    stats:{wealth:1,prestige:1,safety:1,influence:1}, axes:{rule_of_law:10,regime:5,equality:-5,order:-5} },
  { id:"noble", name:"小贵族家庭", desc:"你出生在身份优越但财力未必宽裕的贵族之家。荣誉、等级和体面是你的教养，但你也看见了旧制度的僵化。", icon:"🏰",
    stats:{wealth:1,prestige:2,safety:0,influence:1}, axes:{regime:-10,sovereignty:-10,order:5,religion:5} },
  { id:"clergy", name:"教会关系密切家庭", desc:"你从小在宗教氛围中长大。无论虔诚还是矛盾，教会在你的世界中无处不在。", icon:"⛪",
    stats:{wealth:0,prestige:1,safety:1,influence:0}, axes:{religion:-15,regime:-5,state_structure:-10} },
  { id:"military", name:"军人家庭", desc:"你从小接触的是军纪、荣誉、服从和边境的危险。革命会给你混乱，也会给你巨大的上升机会。", icon:"⚔️",
    stats:{wealth:0,prestige:1,safety:-1,influence:0}, axes:{war:10,order:10,state_structure:10,regime:0} },
];

const GENDERS = [
  { id:"male", name:"男性", desc:"你将更容易进入军队、地方行政、国民自卫军和正面政治组织。街头冲突、俱乐部辩论与军功晋升是你的舞台——当然，也意味着更高的被逮捕和征兵风险。" },
  { id:"female", name:"女性", desc:"你将通过家庭、沙龙、市场、街区网络和请愿来影响时代。面包暴动、革命节庆、宗教迫害——你将以不同的方式深刻经历这一切。婚姻、财产继承和舆论的压力将伴随你始终。" },
];

const REGIONS = [
  { id:"paris", name:"巴黎", desc:"革命中心，消息最快，机会最多，危险也最大。报刊、俱乐部、街区政治——一切都在你身边发生。", icon:"🗼",
    axes:{sovereignty:5,regime:5,state_structure:5} },
  { id:"north", name:"北部边境城市", desc:"战争、征兵、军需——国家与军队的存在感在这里最强。你更容易理解强国家的需求。", icon:"🏔️",
    axes:{war:5,state_structure:5,order:5} },
  { id:"west", name:"西部乡村", desc:"信仰、旧习俗与反中央情绪在这里根深蒂固。革命的很多政策会被感受为入侵和撕裂。", icon:"✝️",
    axes:{religion:-10,state_structure:-10,regime:-5} },
  { id:"south", name:"南部港口城市", desc:"商业、自由思想与地方精英活力交织。你可能更关注贸易自由与地方自治，对巴黎的专断心存警惕。", icon:"⚓",
    axes:{rule_of_law:5,sovereignty:-5,equality:-5} },
  { id:"center", name:"中部省城", desc:"既能感受中央改革，也受制于地方秩序。这里是“中间法国”的典型——温和、务实，但也难以置身事外。", icon:"🏛️",
    axes:{order:0,regime:0} },
];

const YOUTH_EVENTS = [
  { id:"famine", title:"坏年景与面包危机", 
    text:"你十四岁那年，一场严重的歉收席卷了你的家乡。面包价格翻了两倍，母亲不得不减少每顿饭的份量。邻居家有老人因此病倒，再也没能站起来。那个冬天的饥饿感，你至今记得清清楚楚。",
    choices:[
      { text:"你记住的是穷人的无助——需要一个强有力的秩序来保障生存", axes:{order:8,state_structure:5}, tag:"order_sympathy" },
      { text:"你记住的是地主与商人在灾年照样获利——制度本身就不公正", axes:{equality:10,regime:5}, tag:"anti_privilege" },
      { text:"你记住的是教区救济和邻里互助——共同体比遥远的国家更可靠", axes:{religion:-5,state_structure:-8}, tag:"community_faith" },
      { text:"你记住的是国家离普通人太远——赋税拿走一切，却什么也不还", axes:{sovereignty:8,state_structure:-5}, tag:"anti_state" },
    ]},
  { id:"lord_conflict", title:"与领主的冲突",
    text:"你十六岁那年，领主的管事带人来征收地租，还顺便翻查了你家的账册，声称你们欠缴了三年的附加税。父亲跪在地上求情，管事只是冷冷地把账本合上。那一幕深深刻入了你的记忆。",
    choices:[
      { text:"你从此厌恶旧特权与地方压迫——封建制度就是吃人", axes:{equality:10,regime:8}, tag:"anti_feudal" },
      { text:"你认为问题在贪官恶吏，而非制度本身——如果有好的领主，这一切不会发生", axes:{regime:-5,order:5}, tag:"reform_faith" },
      { text:"你希望有统一而明确的国家法令，让这种随意压榨不再可能", axes:{rule_of_law:10,state_structure:8}, tag:"legal_reform" },
      { text:"你认为必须有更强硬的变革——请愿和法律太慢了", axes:{sovereignty:10,equality:8}, tag:"radical_change" },
    ]},
  { id:"mentor", title:"一位重要的人",
    text:"在你的成长中，有一个人对你影响深远。他的话语、态度和命运，在你心中种下了一颗种子，直到革命爆发的那一天才真正发芽。",
    choices:[
      { text:"教区的老神父——他教你读书识字，也教你敬畏上帝。他说世间的苦难自有意义，忍耐是通往救赎的道路", axes:{religion:-12,order:5,regime:-5}, tag:"pious" },
      { text:"一位自由派律师——他向你解释什么是“自然权利”和“社会契约”。他相信法律可以改变一切", axes:{rule_of_law:12,regime:5,sovereignty:-3}, tag:"enlightened" },
      { text:"一位退伍老兵——他讲述战场上的荣耀与残酷。他说只有军队才是真正的公平：不问出身，只看能力", axes:{war:8,order:8,equality:5}, tag:"military_mentor" },
      { text:"一位激进的小册子作者——他偷偷给你看被禁的文章，讲述巴黎的新思想。他说旧世界正在腐烂，必须推倒重来", axes:{sovereignty:10,regime:10,equality:8}, tag:"radical_mentor" },
    ]},
  { id:"humiliation", title:"一次羞辱",
    text:"十七岁那年的一个场景，你永远忘不了。在一次公开场合，你因为自己的出身——无论是太低还是太高——被人当众嘲笑。那种灼热的耻辱感改变了你看待世界的方式。",
    choices:[
      { text:"你暗暗发誓：总有一天，能力会比血统更重要", axes:{equality:10,order:5}, tag:"meritocracy" },
      { text:"你开始怀疑一切等级秩序——为什么有的人生来就可以践踏别人？", axes:{equality:12,sovereignty:8}, tag:"egalitarian" },
      { text:"你学会了隐忍和伪装——在这个世界，聪明比正义更能活下去", axes:{order:5,rule_of_law:-3}, tag:"pragmatic" },
      { text:"你的愤怒变成了一种冰冷的决心——这个不公正的世界必须被彻底改造", axes:{regime:10,equality:10,sovereignty:5}, tag:"revolutionary_seed" },
    ]},
  { id:"eve_of_revolution", title:"1788年，革命前夜的选择",
    text:"1788年夏天，法国陷入了严重的财政与粮食危机。三级会议即将召开的消息传遍全国。空气中弥漫着不安与期待。你即将满二十岁，必须做出人生的第一个重大选择。",
    choices:[
      { text:"留在家乡，守住家庭和你所熟悉的一切", axes:{order:5,state_structure:-5,religion:-3}, tag:"stay_home" },
      { text:"去巴黎！那里正在发生改变世界的事情", axes:{sovereignty:5,regime:5,state_structure:5}, tag:"go_paris" },
      { text:"参军——无论世界怎么变，军队总需要人", axes:{war:8,order:5}, tag:"join_army" },
      { text:"进入法律或行政领域——用知识和制度来改变现状", axes:{rule_of_law:8,state_structure:5}, tag:"legal_career" },
    ]},
];

const CHAPTERS = [
  { id:"ch1", title:"第一章：1789，旧世界裂开了", year:"1789", intro:"你二十岁了。一切都在改变。三级会议在凡尔赛召开，国民议会宣告成立。七月十四日，巴黎群众攻占了巴士底狱。整个法国都在颤抖——有人欢呼，有人恐惧，有人困惑。而你，站在这场风暴的入口处。", events:[
    { id:"e1", title:"请愿书", text:"地方上正在起草向国民议会递交的陈情书。你所在的社区召开集会，争论应该写些什么。争吵声此起彼伏，每个人都想把自己的苦难写进去。有人拉住你的衣袖：‘你来说几句吧。’", choices:[
      { text:"“我们应该请求恢复旧日的权利和习惯——国王陛下一定会听到我们的声音”", axes:{regime:-10,sovereignty:-5,state_structure:-5}, tag:"petition_tradition" },
      { text:"“减轻税负，废除封建压迫！让每个人都能靠自己的劳动活下去”", axes:{equality:8,regime:5,sovereignty:5}, tag:"petition_reform" },
      { text:"“我们需要的是宪法、统一的法律和真正的代表制——不是恩赐，是权利”", axes:{rule_of_law:10,regime:5,state_structure:8}, tag:"petition_constitution" },
      { text:"“光写请愿书有什么用？我们需要行动——是他们欠我们的，不是我们在求他们”", axes:{sovereignty:12,regime:8,equality:8}, tag:"petition_radical" },
    ]},
    { id:"e2", title:"巴士底狱的消息", text:"七月的一天，消息像野火一样传来：巴黎群众攻占了巴士底狱！那座象征王权与压迫的堡垒被人民踏平了。有人放声欢呼，有人面色发白。你的心跳得很快。", choices:[
      { text:"你感到不安——暴民打砸抢烧，这不是改革，这是混乱", axes:{regime:-8,order:8,sovereignty:-8}, tag:"fear_mob" },
      { text:"你能理解人民的愤怒——但暴力终究令人不安，希望这是最后一次", axes:{regime:3,sovereignty:3,rule_of_law:5}, tag:"cautious_sympathy" },
      { text:"你激动得热泪盈眶——人民终于从压迫中站起来了！", axes:{sovereignty:10,regime:8,equality:5}, tag:"revolutionary_joy" },
      { text:"这是一个信号——旧世界已经无可救药，必须彻底推翻它", axes:{sovereignty:12,regime:12,equality:8}, tag:"total_revolution" },
    ]},
  ]},
  { id:"ch2", title:"第二章：1790–1791，革命是否该停下来", year:"1790–1791", intro:"革命已经一年了。旧制度的废墟上，人们试图建造新世界。教士被要求向国家宣誓效忠，宪法正在起草，政治俱乐部如雨后春笋般出现。但国王始终是一个谜。", events:[
    { id:"e3", title:"教士宣誓", text:"你们当地的老神父——一位受人尊敬的好人——被要求向新的国家体制宣誓效忠。他站在教堂门口，面色灰白，手中攥着十字架。", choices:[
      { text:"你站出来支持神父拒绝宣誓——信仰不应该被国家的命令所玷污", axes:{religion:-12,regime:-5,state_structure:-8}, tag:"support_refractory" },
      { text:"你试图劝和——也许信仰和国家可以各退一步，找到妥协", axes:{religion:-3,rule_of_law:5,order:3}, tag:"religious_compromise" },
      { text:"你支持宣誓——国家需要统一，教会也必须服从新秩序", axes:{religion:8,state_structure:8,regime:5}, tag:"support_oath" },
      { text:"你认为这是一个好机会——教会的公共权威早该被打破了", axes:{religion:15,state_structure:10}, tag:"anti_church" },
    ]},
    { id:"e4", title:"国王出逃", text:"1791年6月的一个清晨，整个法国被一个消息震醒：国王一家试图秘密逃离巴黎！他们在瓦雷纳被拦截，像囚犯一样被押送回来。", choices:[
      { text:"这是对国体与信任的背叛——但君主制也许仍可挽救，只要更严格地约束他", axes:{regime:-5,rule_of_law:5,order:5}, tag:"keep_king_strict" },
      { text:"君主制已经不可信了——一个试图逃跑的国王，怎么还能是国家元首？", axes:{regime:10,sovereignty:5}, tag:"doubt_monarchy" },
      { text:"共和！法国不再需要国王了！", axes:{regime:15,sovereignty:10,equality:5}, tag:"republic_now" },
      { text:"你对此并不意外——你从未真正相信过王室的诚意", axes:{regime:8,order:3}, tag:"unsurprised" },
    ]},
  ]},
  { id:"ch3", title:"第三章：1792，共和国与战争来临", year:"1792", intro:"战争来了。八月十日，巴黎群众冲入杜伊勒里宫，王权事实上崩溃了。九月，监狱中的‘敌人’被群众屠杀。共和国宣告成立。", events:[
    { id:"e5", title:"征兵与战争", text:"国家需要士兵。征兵令贴满了每一面墙壁。‘祖国在危难中！’这句话无处不在。", choices:[
      { text:"你反对主动出击——法国应该先稳住国内局势，而不是四处树敌", axes:{war:-10,order:5,rule_of_law:3}, tag:"anti_war" },
      { text:"你支持保卫边境——但战争不应该吞噬掉法治和自由", axes:{war:5,rule_of_law:5,order:3}, tag:"defensive_war" },
      { text:"战争是革命的试金石！它将检验和巩固我们的新共和国", axes:{war:10,regime:8,sovereignty:5}, tag:"revolutionary_war" },
      { text:"战争会重塑这个国家——只有在烈火中，法兰西才能浴火重生", axes:{war:15,state_structure:8,order:5}, tag:"war_glory" },
    ]},
    { id:"e6", title:"国王的命运", text:"路易十六被关押在圣殿塔中。国民公会即将对他进行审判。‘公民卡佩’是否有罪？该如何处置他？", choices:[
      { text:"保住他的生命——处死国王会让整个欧洲与我们为敌，也会让法国失控", axes:{regime:-8,rule_of_law:5,order:5,war:-5}, tag:"spare_king" },
      { text:"审判他，但要遵循严格的法律程序——正义不能变成复仇", axes:{rule_of_law:10,regime:5,order:3}, tag:"trial_king" },
      { text:"他必须死——只有国王的血才能真正终结君主制，建立共和国", axes:{regime:15,sovereignty:10,equality:5}, tag:"execute_king" },
      { text:"不仅要处死他，还要连王权的一切象征一起摧毁！", axes:{regime:18,sovereignty:12,equality:10,religion:5}, tag:"destroy_monarchy" },
    ]},
  ]},
  { id:"ch4", title:"第四章：1793–1794，恐怖时代", year:"1793–1794", intro:"国王被送上断头台。内战与对外战争同时爆发。公安委员会掌握了近乎无限的权力。", events:[
    { id:"e7", title:"面包与限价法", text:"面包价格涨到了普通人无法承受的地步。市场上的妇女们围堵商铺，要求平价供应。", choices:[
      { text:"反对限价——市场有自己的规律，国家不应过度干预", axes:{equality:-10,rule_of_law:5,order:-3}, tag:"free_market" },
      { text:"有限救济就好——但不能摧毁财产权，那是社会秩序的根基", axes:{equality:-3,rule_of_law:5,order:5}, tag:"limited_relief" },
      { text:"临时限价是必要的——人民在挨饿，先保证生存再说", axes:{equality:8,state_structure:5,sovereignty:5}, tag:"temp_price_control" },
      { text:"强力限价，征用粮食，严惩囤积者！革命不能让人民饿死", axes:{equality:15,state_structure:10,sovereignty:8,rule_of_law:-8}, tag:"max_price_control" },
    ]},
    { id:"e8", title:"嫌疑人法与恐怖", text:"‘嫌疑人法’颁布了：任何行为可疑、言论不当或‘缺乏公民热情’的人都可以被逮捕。", choices:[
      { text:"这太过分了——预防性逮捕违背了人权宣言的精神", axes:{rule_of_law:10,sovereignty:-5,order:-5}, tag:"oppose_terror" },
      { text:"也许作为短期的紧急措施可以接受——但必须尽快恢复正常法律秩序", axes:{rule_of_law:5,state_structure:3,order:3}, tag:"reluctant_terror" },
      { text:"战时需要战时手段——共和国的敌人无处不在，我们不能心慈手软", axes:{rule_of_law:-8,state_structure:8,sovereignty:5}, tag:"accept_terror" },
      { text:"革命之所以一再受挫，就是因为对敌人太宽容了！", axes:{rule_of_law:-15,state_structure:12,sovereignty:10,equality:5}, tag:"embrace_terror" },
    ]},
    { id:"e9", title:"老朋友被怀疑", text:"一个你从小认识的朋友被检举‘立场不纯’。有人悄悄来找你，问你是否愿意为他作证。", choices:[
      { text:"冒险为他作证——你不能看着他去死而无动于衷", axes:{rule_of_law:8,order:-5}, tag:"defend_friend", statChange:{safety:-2} },
      { text:"保持沉默——至少不要让自己和家人也陷进去", axes:{order:5}, tag:"silence_friend" },
      { text:"配合审查以自保——这个时代由不得个人感情", axes:{order:8,rule_of_law:-5}, tag:"cooperate_purge", statChange:{safety:1} },
      { text:"主动揭发他以证明自己的忠诚——革命不承认私情", axes:{rule_of_law:-10,sovereignty:8,state_structure:5}, tag:"denounce_friend", statChange:{safety:2,prestige:1} },
    ]},
  ]},
  { id:"ch5", title:"第五章：1794，热月之后", year:"1794", intro:"罗伯斯庇尔倒台了。恐怖结束了，但新的报复开始了。", events:[
    { id:"e10", title:"热月的意义", text:"过去两年的一切像一场噩梦——或者是一场已醒的梦？你必须为自己找到一个答案。", choices:[
      { text:"革命被背叛了——真正为人民而战的人被出卖", axes:{sovereignty:10,equality:8,rule_of_law:-5}, tag:"thermidor_betrayal" },
      { text:"这是必要的刹车——恐怖走得太远，但绝不能让旧势力复辟", axes:{regime:5,rule_of_law:5,order:5}, tag:"thermidor_necessary" },
      { text:"终于恢复了法治与常态——人们不该因一句话就被送上断头台", axes:{rule_of_law:10,order:8,sovereignty:-5}, tag:"thermidor_relief" },
      { text:"该清理那些极端分子了——共和国需要有产者和秩序", axes:{rule_of_law:5,order:10,equality:-8,sovereignty:-10}, tag:"thermidor_reaction" },
    ]},
    { id:"e11", title:"面对反扑", text:"街头开始出现报复。昨日的激进派，今天成了被殴打和追逐的对象。", choices:[
      { text:"冲上去保护那个人——无论他曾做过什么，这种私刑是不对的", axes:{rule_of_law:8,sovereignty:3,equality:3}, tag:"protect_jacobin" },
      { text:"大声呼吁停止——仇恨链条必须在某处断裂", axes:{rule_of_law:8,order:5}, tag:"stop_revenge" },
      { text:"默默走开——也许这是一种必要的清算", axes:{order:5,rule_of_law:-3}, tag:"allow_reaction" },
      { text:"这正是新秩序建立的方式——旧极端派必须被清除", axes:{order:10,sovereignty:-8,equality:-8}, tag:"support_reaction" },
    ]},
  ]},
  { id:"ch6", title:"第六章：1795–1799，督政府时代", year:"1795–1799", intro:"共和国仍在，但它越来越依赖精英、行政和军队。", events:[
    { id:"e12", title:"被操控的选举", text:"当局准备作废部分选举结果，因为‘错误的人’赢了。", choices:[
      { text:"坚持程序——即使结果危险，民主也必须承受不确定性", axes:{rule_of_law:12,sovereignty:5,order:-5}, tag:"defend_election" },
      { text:"勉强接受有限干预——但不能太过分", axes:{rule_of_law:3,order:5}, tag:"limited_intervention" },
      { text:"共和国必须先活下去——如果选举会杀死共和国，那就暂时牺牲选举", axes:{order:10,rule_of_law:-8,state_structure:8}, tag:"republic_over_democracy" },
      { text:"军队和行政力量可以介入——秩序比程序更重要", axes:{order:15,state_structure:10,sovereignty:-10,rule_of_law:-10}, tag:"authoritarian_turn" },
    ]},
    { id:"e13", title:"你的位置", text:"革命已经过去六年了。你三十岁了，必须认真考虑自己的未来。", choices:[
      { text:"进入地方行政系统——做一个文书、法官助手或税务官", axes:{state_structure:5,rule_of_law:5,order:5}, tag:"civil_servant", statChange:{prestige:1,safety:1} },
      { text:"经商或从事供应生意——战争和混乱中，精明的人总能找到机会", axes:{equality:-5,order:3}, tag:"merchant", statChange:{wealth:2} },
      { text:"走向军队或军需系统——在这个时代，国家总需要能执行命令的人", axes:{war:8,order:5,state_structure:5}, tag:"military_path", statChange:{prestige:1} },
      { text:"远离政治，守住家庭——照顾好自己的人", axes:{order:3,state_structure:-3}, tag:"private_life", statChange:{safety:2} },
    ]},
  ]},
  { id:"ch7", title:"第七章：1799–1804，强人上场", year:"1799–1804", intro:"拿破仑结束了议会政治的疲态，也把法国带向新的集权秩序。", events:[
    { id:"e14", title:"雾月政变", text:"‘有人结束了议会的内耗’——街头巷尾都在这样说。你怎么看？", choices:[
      { text:"这是对共和国最后的背叛——军队把政治践踏了", axes:{rule_of_law:8,regime:5,sovereignty:5,order:-5,war:-5}, tag:"oppose_brumaire" },
      { text:"也许有必要——但必须防止他变成独裁者", axes:{order:5,rule_of_law:3,regime:3}, tag:"cautious_brumaire" },
      { text:"只要革命的核心成就被保住，集中权力未尝不可", axes:{order:10,state_structure:8,regime:-3}, tag:"accept_brumaire" },
      { text:"这正是法国需要的！统一、效率、胜利——国家需要领袖", axes:{order:15,state_structure:12,war:8,sovereignty:-10}, tag:"support_brumaire" },
    ]},
    { id:"e15", title:"新秩序中的你", text:"执政府已经稳固。新的法典正在编纂，行政体系遍布全国。你如何安置自己？", choices:[
      { text:"继续在内心反对强人政治——你相信自由和共和，哪怕只能沉默地信仰", axes:{rule_of_law:8,regime:8,sovereignty:5,order:-8}, tag:"silent_republican" },
      { text:"加入新的行政体系——这个国家需要能干的人", axes:{state_structure:8,order:8,rule_of_law:3}, tag:"join_napoleon_admin", statChange:{prestige:1,wealth:1} },
      { text:"走军功与国家服务的道路——战场和官僚体系是最好的上升阶梯", axes:{war:8,order:10,state_structure:8}, tag:"napoleon_military", statChange:{prestige:2} },
      { text:"退回私人生活——你已经厌倦了政治", axes:{order:3}, tag:"retreat_private", statChange:{safety:2} },
    ]},
  ]},
  { id:"ch8", title:"第八章：1804–1815，帝国、战争与终局", year:"1804–1815", intro:"帝国建立了。荣耀与伤亡一起增长。你终于要面对自己一生的最后答案。", events:[
    { id:"e16", title:"皇帝加冕", text:"拿破仑加冕为皇帝。你看着这一幕，不得不问：这和我们曾推翻的王冠有什么不同？", choices:[
      { text:"革命至此被王冠重新吞没了——一切牺牲似乎都白费了", axes:{regime:10,sovereignty:5,equality:3}, tag:"oppose_empire" },
      { text:"它背离了共和理想——但至少带来了稳定、秩序和效率", axes:{order:8,regime:-3,state_structure:5}, tag:"accept_empire" },
      { text:"帝国是革命成果制度化后的合理归宿——旧制度不会回来了", axes:{order:10,state_structure:10,regime:-8}, tag:"rationalize_empire" },
      { text:"这是法兰西伟大的巅峰！能力主义、法典、荣耀——拿破仑是革命的完成者", axes:{order:15,war:10,state_structure:12,sovereignty:-10}, tag:"glorify_empire" },
    ]},
    { id:"e17", title:"战争的代价", text:"帝国在扩张，但战争的代价也在你身边堆积。亲人失踪，征兵令一张又一张地贴出来。", choices:[
      { text:"够了。无论帝国带来了什么，这种没有尽头的战争正在吞噬法国", axes:{war:-10,order:-5,sovereignty:5}, tag:"war_weary" },
      { text:"代价是沉重的——但如果我们停下来，敌人就会扑过来", axes:{war:5,order:5}, tag:"reluctant_war" },
      { text:"这是法国伟大所必须付出的代价——伟业不可能没有牺牲", axes:{war:12,order:8}, tag:"accept_war_cost" },
      { text:"你已经麻木了——太多人死了，你不再相信任何宏大叙事", axes:{order:-3,sovereignty:-3}, tag:"numb" },
    ]},
    { id:"e18", title:"1814–1815：最终抉择", text:"帝国崩塌、复辟归来、百日王朝、滑铁卢……风暴终于走向尾声。你站在哪里？", choices:[
      { text:"接受复辟吧——法国需要停止流血了", axes:{regime:-10,order:10,rule_of_law:3}, tag:"accept_restoration" },
      { text:"接受有限王权——但革命成果必须保留", axes:{regime:-3,rule_of_law:8,equality:3,order:5}, tag:"constitutional_restoration" },
      { text:"共和国万岁！——你拒绝一切回头路", axes:{regime:12,sovereignty:10,equality:8}, tag:"eternal_republic" },
      { text:"你不再关心谁坐在巴黎的宝座上——只想保住自己和家人", axes:{order:5}, tag:"survival" },
    ]},
  ]},
];

const FACTIONS = [
  { id:"royalist", name:"正统保王派", desc:"你始终相信权威、信仰与传统比群众激情更可靠。在你看来，革命撕裂了法国，而不是解放了法国。", figure:"阿图瓦伯爵", figureAlt:"旺代保王派领袖", weights:{regime:-15,sovereignty:-10,religion:-12,order:8,state_structure:-8,rule_of_law:0,equality:-10,war:-3} },
  { id:"constitutional", name:"君主立宪自由派", desc:"你支持改革，却希望改革停在法治和财产权之内。你最害怕的不是旧制度，而是无限革命。", figure:"拉法耶特", figureAlt:"巴纳夫", weights:{regime:-5,sovereignty:-3,rule_of_law:12,order:5,equality:-3,state_structure:3,religion:-3,war:-3} },
  { id:"moderate_rev", name:"温和革命派", desc:"你希望摧毁封建旧弊，却不愿让国家陷入无止境的动员与清洗。你是革命的建设者，而不是赌徒。", figure:"西哀士", figureAlt:"米拉波", weights:{regime:3,sovereignty:0,rule_of_law:8,order:5,equality:3,state_structure:5,religion:0,war:-3} },
  { id:"girondin", name:"吉伦特式自由共和派", desc:"你接受共和国，相信自由、法治与全国代表制。你愿为原则而战，但不愿把人民主权缩减为首都街头的胁迫。", figure:"布里索", figureAlt:"孔多塞", weights:{regime:8,sovereignty:3,rule_of_law:10,order:0,equality:3,state_structure:0,religion:3,war:3} },
  { id:"danton", name:"丹东派共和主义者", desc:"你接受强力政府的必要性，却不愿恐怖成为日常。你重结果、重整合、重生存，多于重纯粹。", figure:"丹东", figureAlt:"德穆兰", weights:{regime:8,sovereignty:5,rule_of_law:0,order:5,equality:5,state_structure:8,religion:3,war:5} },
  { id:"montagnard", name:"雅各宾-山岳派", desc:"你相信共和国必须用德性、平等与强国家来保卫自身。对你而言，宽容并不总是美德。", figure:"罗伯斯庇尔", figureAlt:"圣茹斯特", weights:{regime:12,sovereignty:10,rule_of_law:-8,order:3,equality:12,state_structure:12,religion:8,war:8} },
  { id:"sans_culotte", name:"平民激进派", desc:"你站在穷人和街区一边。程序常常只是强者拖延正义的借口。你要求革命真正落到面包、价格和生存之上。", figure:"埃贝尔", figureAlt:"肖梅特", weights:{regime:10,sovereignty:15,rule_of_law:-10,order:-5,equality:15,state_structure:5,religion:10,war:5} },
  { id:"thermidor", name:"热月财产共和派", desc:"你认为革命已越过边界。共和国应活下来，但恐怖、清洗和群众支配必须结束。", figure:"塔利安", figureAlt:"巴拉斯", weights:{regime:3,sovereignty:-5,rule_of_law:8,order:10,equality:-5,state_structure:5,religion:0,war:0} },
  { id:"directory", name:"督政府式秩序共和派", desc:"你不再迷信激情。一个由财产者、行政与军队维持的共和国，胜过再次坠入极端。", figure:"巴拉斯", figureAlt:"名流共和派人物", weights:{regime:3,sovereignty:-8,rule_of_law:5,order:12,equality:-5,state_structure:8,religion:0,war:3} },
  { id:"bonapartist", name:"波拿巴主义者", desc:"你接受革命摧毁旧制度的成果，但不相信无休止辩论能治理国家。你选择效率、统一、军功和国家荣耀。", figure:"拿破仑·波拿巴", figureAlt:"", weights:{regime:-3,sovereignty:-12,rule_of_law:-3,order:15,equality:3,state_structure:15,religion:-3,war:12} },
  { id:"liberal_restoration", name:"开明复辟派", desc:"你希望法国回归秩序与传统，但也承认革命改变了一切。温和的王权加上宪法保障——也许这就是最好的结局。", figure:"路易十八（宪章派）", figureAlt:"", weights:{regime:-8,sovereignty:-5,rule_of_law:8,order:10,equality:-3,state_structure:3,religion:-5,war:-5} },
];

const LIFE_ENDINGS = [
  { id:"executed", name:"被处决的革命者", desc:"你在最狂热的年代把自己交给了事业，最终也被事业吞没。你可能因为立场太激进，也可能因为站错了清洗链条中的位置。", condition:(s,t)=> (s.safety <= -2 && t.includes("embrace_terror")) || (t.includes("denounce_friend") && t.includes("thermidor_betrayal")) },
  { id:"survivor_notable", name:"幸存的地方名流", desc:"你没有改变世界，但你学会了在每次风向变化中保住自己和家庭。你是时代的幸存者，也是它的现实主义产物。", condition:(s,t)=> s.wealth >= 2 && s.prestige >= 1 && s.safety >= 1 },
  { id:"lost_everything", name:"失去一切的普通人", desc:"你并非没有判断，只是每一次巨变都比你的力量更大。你活着看见了所有口号，也承受了所有代价。", condition:(s,t)=> s.wealth <= -1 && s.safety <= 0 && !t.includes("join_napoleon_admin") && !t.includes("napoleon_military") },
  { id:"disillusioned_idealist", name:"共和国的失意理想主义者", desc:"你曾真心相信自由、法治和公民的新世界。但理想被战争、清洗和强人政治挤压得支离破碎。", condition:(s,t)=> t.includes("oppose_brumaire") || t.includes("silent_republican") || t.includes("eternal_republic") },
  { id:"war_admin", name:"战时行政者", desc:"你在危机中靠执行力崛起。别人写口号时，你在征粮、征兵、整理档案和恢复秩序。", condition:(s,t)=> t.includes("civil_servant") || t.includes("join_napoleon_admin") },
  { id:"imperial_officer", name:"帝国军官 / 国家仆从", desc:"你最终把个人命运与强国家绑定在一起。法典、军功、效率和秩序——这些就是你的信仰。", condition:(s,t)=> t.includes("napoleon_military") || (t.includes("support_brumaire") && t.includes("glorify_empire")) },
  { id:"exile", name:"流亡者", desc:"你无法接受革命，或革命无法接受你。你在故土之外等待法国回头，却也不断发现法国已经变了。", condition:(s,t)=> t.includes("support_refractory") && (t.includes("spare_king") || t.includes("fear_mob")) },
  { id:"family_survivor", name:"归于家庭的幸存者", desc:"你在一次次风暴后退回了家庭、店铺或农地。也许你没有留下名字，但你活了下来。", condition:(s,t)=> t.includes("private_life") || t.includes("retreat_private") || t.includes("stay_home") || t.includes("survival") },
];

function calculateFaction(axes) {
  let best = null, bestScore = -Infinity, secondBest = null, secondScore = -Infinity;
  let worst = null, worstScore = Infinity;
  for (const f of FACTIONS) {
    let score = 0;
    for (const [k,w] of Object.entries(f.weights)) score += (axes[k] || 0) * w;
    if (score > bestScore) { secondBest = best; secondScore = bestScore; best = f; bestScore = score; }
    else if (score > secondScore) { secondBest = f; secondScore = score; }
    if (score < worstScore) { worst = f; worstScore = score; }
  }
  return { primary: best, secondary: secondBest, opposite: worst };
}
function getLifeEnding(stats, tags) {
  for (const ending of LIFE_ENDINGS) if (ending.condition(stats, tags)) return ending;
  return LIFE_ENDINGS.find(e => e.id === "family_survivor");
}
function getIdeologySummary(axes) {
  const parts = [];
  if (axes.regime > 8) parts.push("共和主义"); else if (axes.regime < -8) parts.push("君主主义"); else parts.push("温和改良");
  if (axes.equality > 8) parts.push("平等优先"); else if (axes.equality < -8) parts.push("财产优先");
  if (axes.order > 8) parts.push("秩序导向"); else if (axes.order < -5) parts.push("自由导向");
  if (axes.rule_of_law > 5) parts.push("法治信仰"); else if (axes.rule_of_law < -5) parts.push("紧急状态思维");
  if (axes.war > 8) parts.push("扩张倾向"); else if (axes.war < -5) parts.push("和平倾向");
  if (axes.religion < -8) parts.push("宗教传统"); else if (axes.religion > 8) parts.push("世俗主义");
  return parts.join("·");
}

const state = {
  phase: "title",
  origin: null,
  gender: null,
  region: null,
  youthIndex: 0,
  chapterIndex: 0,
  eventIndex: 0,
  showChapterIntro: true,
  axes: { regime:0, sovereignty:0, rule_of_law:0, equality:0, state_structure:0, religion:0, war:0, order:0 },
  stats: { wealth:0, prestige:0, safety:1, influence:0 },
  tags: [],
  selectedChoice: null
};

const app = document.getElementById("app");

function totalEvents() {
  return CHAPTERS.reduce((sum, c) => sum + c.events.length, 0) + YOUTH_EVENTS.length;
}
function doneEvents() {
  if (state.phase === "result") return totalEvents();
  if (state.phase === "youth") return state.youthIndex;
  if (state.phase === "chapters") {
    const finishedChapters = CHAPTERS.slice(0, state.chapterIndex).reduce((sum,c)=>sum + c.events.length, 0);
    return YOUTH_EVENTS.length + finishedChapters + (state.showChapterIntro ? 0 : state.eventIndex);
  }
  return 0;
}
function progress() {
  const total = totalEvents();
  return total ? Math.round((doneEvents() / total) * 100) : 0;
}
function applyChoice(choice) {
  if (choice.axes) for (const [k,v] of Object.entries(choice.axes)) state.axes[k] = (state.axes[k] || 0) + v;
  if (choice.statChange) for (const [k,v] of Object.entries(choice.statChange)) state.stats[k] = (state.stats[k] || 0) + v;
  if (choice.tag) state.tags.push(choice.tag);
}
function applyOrigin(origin) {
  state.origin = origin;
  for (const [k,v] of Object.entries(origin.axes || {})) state.axes[k] = (state.axes[k] || 0) + v;
  for (const [k,v] of Object.entries(origin.stats || {})) state.stats[k] = (state.stats[k] || 0) + v;
}
function transition(callback) {
  const content = document.querySelector(".content");
  if (content) content.classList.add("fade-out");
  setTimeout(() => {
    callback();
    render();
    requestAnimationFrame(() => {
      const newContent = document.querySelector(".content");
      if (newContent) {
        newContent.classList.remove("fade-out");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, 260);
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function axisRows() {
  const axesMeta = [
    {key:"regime", left:"王权", right:"共和"},
    {key:"sovereignty", left:"精英代议", right:"群众政治"},
    {key:"rule_of_law", left:"紧急状态", right:"程序法治"},
    {key:"equality", left:"财产优先", right:"社会平等"},
    {key:"state_structure", left:"地方传统", right:"中央集权"},
    {key:"religion", left:"宗教政治", right:"世俗化"},
    {key:"war", left:"和平安定", right:"扩张荣耀"},
    {key:"order", left:"自由优先", right:"强人整合"},
  ];
  return axesMeta.map(a => {
    const val = state.axes[a.key] || 0;
    const pct = Math.min(100, Math.max(0, 50 + val * 1.5));
    return `
      <div class="axis-row">
        <span class="axis-left">${a.left}</span>
        <div class="axis-bar">
          <div class="axis-center"></div>
          <div class="axis-dot" style="left:${pct}%"></div>
        </div>
        <span class="axis-right">${a.right}</span>
      </div>`;
  }).join("");
}
function renderTitle() {
  return `
    <div class="title-screen fade-in-up">
      <div class="title-decor">⚜</div>
      <h1 class="main-title">风暴中的一生</h1>
      <p class="subtitle">Une Vie dans la Tempête</p>
      <p class="title-desc">1769 – 1815 · 法国大革命文字冒险</p>
      <div class="title-divider">───── ✦ ─────</div>
      <p class="title-flavor">
        你出生于1769年的法国。<br>
        二十年后，旧世界裂开了。<br>
        在接下来的二十六年风暴中，<br>
        你将做出无数抉择——<br>
        而每一个抉择，都将塑造你的命运。
      </p>
      <button class="btn-primary" data-action="start">开始你的一生</button>
      <p class="tiny-note">基于法国大革命真实历史事件</p>
    </div>`;
}
function renderOrigin() {
  return `
    <div class="fade-in-up">
      <p class="phase-label">角色创建 · 第一步</p>
      <h2 class="section-title">你出生在什么样的家庭？</h2>
      <p class="section-desc">1769年，路易十五仍在凡尔赛的镜厅中老去。你来到了这个世界——一个你即将见证其崩塌与重生的世界。</p>
      <div class="grid">
        ${ORIGINS.map((o,i)=>`
          <button class="card" data-action="origin" data-index="${i}">
            <span class="card-icon">${o.icon}</span>
            <span class="card-title">${o.name}</span>
            <span class="card-desc">${o.desc}</span>
          </button>`).join("")}
      </div>
    </div>`;
}
function renderGender() {
  return `
    <div class="fade-in-up">
      <p class="phase-label">角色创建 · 第二步</p>
      <h2 class="section-title">你的性别</h2>
      <p class="section-desc">性别不会决定你的信念，但会改变你进入政治的方式、承受的风险，以及这个社会如何看待你。</p>
      <div class="gender-grid">
        ${GENDERS.map((g,i)=>`
          <button class="gender-card" data-action="gender" data-index="${i}">
            <span class="gender-name">${g.name}</span>
            <span class="card-desc">${g.desc}</span>
          </button>`).join("")}
      </div>
    </div>`;
}
function renderRegion() {
  return `
    <div class="fade-in-up">
      <p class="phase-label">角色创建 · 第三步</p>
      <h2 class="section-title">你出生在法国的哪里？</h2>
      <p class="section-desc">从巴黎的喧嚣到西部的静谧教堂，每一片土地都将以不同的方式迎接革命的到来。</p>
      <div class="grid">
        ${REGIONS.map((r,i)=>`
          <button class="card" data-action="region" data-index="${i}">
            <span class="card-icon">${r.icon}</span>
            <span class="card-title">${r.name}</span>
            <span class="card-desc">${r.desc}</span>
          </button>`).join("")}
      </div>
    </div>`;
}
function renderYouth() {
  const evt = YOUTH_EVENTS[state.youthIndex];
  return `
    <div class="fade-in-up">
      <p class="phase-label">成长岁月 · ${evt.title}</p>
      <p class="year-badge">1769–1789</p>
      <h2 class="event-title">${evt.title}</h2>
      <div class="narrative-box"><p class="narrative-text">${evt.text}</p></div>
      <div class="choice-list">
        ${evt.choices.map((c,i)=>`
          <button class="choice-btn ${state.selectedChoice===i ? 'selected' : ''}" data-action="youth-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>${c.text}</button>
        `).join("")}
      </div>
      <p class="event-counter">成长事件 ${state.youthIndex + 1} / ${YOUTH_EVENTS.length}</p>
    </div>`;
}
function renderChapterIntro() {
  const ch = CHAPTERS[state.chapterIndex];
  return `
    <div class="fade-in-up">
      <div class="chapter-intro">
        <p class="year-badge">${ch.year}</p>
        <h2 class="chapter-title">${ch.title}</h2>
        <div class="chapter-divider">───── ✦ ─────</div>
        <p class="chapter-intro-text">${ch.intro}</p>
        <button class="btn-primary" data-action="chapter-continue">继续</button>
      </div>
    </div>`;
}
function renderChapterEvent() {
  const ch = CHAPTERS[state.chapterIndex];
  const evt = ch.events[state.eventIndex];
  return `
    <div class="fade-in-up">
      <p class="phase-label">${ch.title}</p>
      <p class="year-badge">${ch.year}</p>
      <h2 class="event-title">${evt.title}</h2>
      <div class="narrative-box"><p class="narrative-text">${evt.text}</p></div>
      <div class="choice-list">
        ${evt.choices.map((c,i)=>`
          <button class="choice-btn ${state.selectedChoice===i ? 'selected' : ''}" data-action="chapter-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>${c.text}</button>
        `).join("")}
      </div>
      <p class="event-counter">第 ${state.chapterIndex + 1} 章 · 事件 ${state.eventIndex + 1} / ${ch.events.length}</p>
    </div>`;
}
function renderResult() {
  const faction = calculateFaction(state.axes);
  const ending = getLifeEnding(state.stats, state.tags);
  const ideology = getIdeologySummary(state.axes);
  return `
    <div class="fade-in-up">
      <div class="result-header">
        <div class="title-decor">⚜</div>
        <h2 class="result-main-title">你的一生</h2>
        <p class="result-subtitle">1769 – 1815</p>
        <p class="result-origin-line">${state.origin.icon} ${state.gender.name} · ${state.origin.name} · ${state.region.name}</p>
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 人生结局 ⸻</h3>
        <h2 class="ending-name">${ending.name}</h2>
        <p class="ending-desc">${ending.desc}</p>
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 核心意识形态 ⸻</h3>
        <p class="ideology-text">${ideology}</p>
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 最接近的政治派别 ⸻</h3>
        <div class="faction-box">
          <h2 class="faction-name">${faction.primary.name}</h2>
          <p class="faction-desc">${faction.primary.desc}</p>
        </div>
        ${faction.secondary ? `<div class="secondary-faction"><p class="secondary-label">次级倾向：${faction.secondary.name}</p></div>` : ""}
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 最相似的历史人物 ⸻</h3>
        <div class="figure-box">
          <p class="figure-name">${faction.primary.figure}</p>
          ${faction.primary.figureAlt ? `<p class="figure-alt">次相似：${faction.primary.figureAlt}</p>` : ""}
        </div>
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 与你最不相似的类型 ⸻</h3>
        <p class="opposite-faction">${faction.opposite.name}</p>
      </div>

      <div class="result-section">
        <h3 class="result-label">⸻ 政治光谱 ⸻</h3>
        <div class="axes-grid">${axisRows()}</div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" data-action="restart">重新开始</button>
      </div>
      <p class="helper-note">这是由你上传的 React/JSX 版本改写而来的静态 HTML/CSS/JS 版本。</p>
    </div>`;
}
function renderPhase() {
  switch (state.phase) {
    case "title": return renderTitle();
    case "origin": return renderOrigin();
    case "gender": return renderGender();
    case "region": return renderRegion();
    case "youth": return renderYouth();
    case "chapters": return state.showChapterIntro ? renderChapterIntro() : renderChapterEvent();
    case "result": return renderResult();
    default: return "<p>未知状态</p>";
  }
}
function render() {
  const showProgress = !["title", "result"].includes(state.phase);
  app.innerHTML = `
    <div class="app">
      ${showProgress ? `<div class="progress-bar"><div class="progress-fill" style="width:${progress()}%"></div></div>` : ""}
      <div class="content">${renderPhase()}</div>
    </div>`;
  bindEvents();
}
function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => {
      const action = el.dataset.action;
      const idx = el.dataset.index !== undefined ? Number(el.dataset.index) : null;
      if (action === "start") transition(() => state.phase = "origin");
      if (action === "origin") transition(() => { applyOrigin(ORIGINS[idx]); state.phase = "gender"; });
      if (action === "gender") transition(() => { state.gender = GENDERS[idx]; state.phase = "region"; });
      if (action === "region") transition(() => {
        state.region = REGIONS[idx];
        for (const [k,v] of Object.entries(state.region.axes || {})) state.axes[k] = (state.axes[k] || 0) + v;
        state.phase = "youth";
      });
      if (action === "youth-choice" && state.selectedChoice === null) {
        state.selectedChoice = idx; render();
        setTimeout(() => transition(() => {
          applyChoice(YOUTH_EVENTS[state.youthIndex].choices[idx]);
          state.selectedChoice = null;
          if (state.youthIndex < YOUTH_EVENTS.length - 1) state.youthIndex += 1;
          else { state.phase = "chapters"; state.chapterIndex = 0; state.eventIndex = 0; state.showChapterIntro = true; }
        }), 350);
      }
      if (action === "chapter-continue") transition(() => state.showChapterIntro = false);
      if (action === "chapter-choice" && state.selectedChoice === null) {
        state.selectedChoice = idx; render();
        setTimeout(() => transition(() => {
          const ch = CHAPTERS[state.chapterIndex];
          applyChoice(ch.events[state.eventIndex].choices[idx]);
          state.selectedChoice = null;
          if (state.eventIndex < ch.events.length - 1) state.eventIndex += 1;
          else if (state.chapterIndex < CHAPTERS.length - 1) { state.chapterIndex += 1; state.eventIndex = 0; state.showChapterIntro = true; }
          else state.phase = "result";
        }), 350);
      }
      if (action === "restart") transition(() => {
        state.phase = "title";
        state.origin = null; state.gender = null; state.region = null;
        state.youthIndex = 0; state.chapterIndex = 0; state.eventIndex = 0; state.showChapterIntro = true;
        state.axes = { regime:0, sovereignty:0, rule_of_law:0, equality:0, state_structure:0, religion:0, war:0, order:0 };
        state.stats = { wealth:0, prestige:0, safety:1, influence:0 };
        state.tags = [];
        state.selectedChoice = null;
      });
    });
  });
}
render();
