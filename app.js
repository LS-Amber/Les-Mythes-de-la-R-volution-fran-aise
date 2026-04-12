/* ============================================================
   风暴中的一生 — 重构版
   新增：条件变体（variants）+ 条件选项（when）+ 出身/性别专属事件
   ============================================================ */

const ORIGINS = [
  { id:"peasant", name:"乡村农民家庭", desc:"你出生在法国乡村，熟悉地租、什一税、徭役与歉收。", icon:"🌾",
    stats:{wealth:-1,prestige:-1,safety:1,influence:-1}, axes:{regime:-5,sovereignty:5,equality:10,state_structure:-10,religion:5} },
  { id:"artisan", name:"城市手工业者家庭", desc:"你出生在城市下层，面包价格、行会规矩、街头舆论是你的日常。", icon:"🔨",
    stats:{wealth:0,prestige:0,safety:0,influence:0}, axes:{sovereignty:10,equality:10,regime:5,state_structure:5} },
  { id:"bourgeois", name:"资产阶级家庭", desc:"律师、商人或医生之家。你相信改革，但也珍视秩序。", icon:"⚖️",
    stats:{wealth:1,prestige:1,safety:1,influence:1}, axes:{rule_of_law:10,regime:5,equality:-5,order:-5} },
  { id:"noble", name:"小贵族家庭", desc:"身份优越但财力未必宽裕。荣誉、等级与体面是你的教养。", icon:"🏰",
    stats:{wealth:1,prestige:2,safety:0,influence:1}, axes:{regime:-10,sovereignty:-10,order:5,religion:5} },
  { id:"clergy", name:"教会关系密切家庭", desc:"你从小在宗教氛围中长大，教会无处不在。", icon:"⛪",
    stats:{wealth:0,prestige:1,safety:1,influence:0}, axes:{religion:-15,regime:-5,state_structure:-10} },
  { id:"military", name:"军人家庭", desc:"军纪、荣誉、服从和边境危险。革命会给你巨大上升机会。", icon:"⚔️",
    stats:{wealth:0,prestige:1,safety:-1,influence:0}, axes:{war:10,order:10,state_structure:10,regime:0} },
];

const GENDERS = [
  { id:"male", name:"男性", desc:"军队、地方行政、国民自卫军、政治俱乐部都向你敞开——但被逮捕和征兵的风险也更高。" },
  { id:"female", name:"女性", desc:"你将通过家庭、沙龙、市场、街区网络和请愿来影响时代。婚姻、继承与舆论的压力将伴随你始终。" },
];

const REGIONS = [
  { id:"paris", name:"巴黎", desc:"革命中心，消息最快，机会与危险都最大。", icon:"🗼", axes:{sovereignty:5,regime:5,state_structure:5} },
  { id:"north", name:"北部边境城市", desc:"战争、征兵、军需——国家与军队的存在感最强。", icon:"🏔️", axes:{war:5,state_structure:5,order:5} },
  { id:"west", name:"西部乡村", desc:"信仰、旧习俗与反中央情绪根深蒂固。", icon:"✝️", axes:{religion:-10,state_structure:-10,regime:-5} },
  { id:"south", name:"南部港口城市", desc:"商业、自由思想与地方精英活力交织。", icon:"⚓", axes:{rule_of_law:5,sovereignty:-5,equality:-5} },
  { id:"center", name:"中部省城", desc:"温和、务实，但也难以置身事外。", icon:"🏛️", axes:{order:0,regime:0} },
];

/* ============================================================
   条件系统：matchWhen(when, state) -> bool
   ============================================================ */
function matchWhen(when, state) {
  if (!when) return true;
  if (when.origin && !when.origin.includes(state.origin?.id)) return false;
  if (when.gender && state.gender?.id !== when.gender) return false;
  if (when.region && !when.region.includes(state.region?.id)) return false;
  if (when.tagsAll && !when.tagsAll.every(t => state.tags.includes(t))) return false;
  if (when.tagsAny && !when.tagsAny.some(t => state.tags.includes(t))) return false;
  if (when.tagsNone && when.tagsNone.some(t => state.tags.includes(t))) return false;
  if (when.axesMin) for (const [k,v] of Object.entries(when.axesMin)) if ((state.axes[k]||0) < v) return false;
  if (when.axesMax) for (const [k,v] of Object.entries(when.axesMax)) if ((state.axes[k]||0) > v) return false;
  return true;
}
// 把事件根据当前状态"解析"为最终呈现的版本
function resolveEvent(event, state) {
  let resolved = { title: event.title, text: event.text, choices: event.choices };
  if (event.variants) {
    for (const v of event.variants) {
      if (matchWhen(v.when, state)) {
        resolved = {
          title: v.title || event.title,
          text: v.text || event.text,
          choices: v.choices || event.choices
        };
        break;
      }
    }
  }
  // 过滤选项级 when
  resolved.choices = resolved.choices.filter(c => matchWhen(c.when, state));
  return resolved;
}
// 事件本身可以有 when：整个事件是否参与本章
function eventApplies(event, state) { return matchWhen(event.when, state); }

/* ============================================================
   成长事件（含变体示范）
   ============================================================ */
const YOUTH_EVENTS = [
  { id:"famine", title:"坏年景与面包危机",
    text:"你十四岁那年，一场严重的歉收席卷了你的家乡。面包价格翻了两倍，母亲不得不减少每顿饭的份量。那个冬天的饥饿感，你至今记得清清楚楚。",
    variants:[
      { when:{origin:["peasant"]},
        title:"坏年景：田里颗粒无收",
        text:"你十四岁那年，连续两季的雨毁掉了麦子。父亲跪在地头看着烂在泥里的麦穗，一句话也没说。村里的老人开始把孩子送到城里当帮工——你差一点就是其中之一。" },
      { when:{origin:["artisan"]},
        title:"面包暴动的前夜",
        text:"作坊门口的面包店前排起了长队。母亲半夜就去排，回来时手里只有半个黑面包。你十四岁，第一次看见街角有人因为抢面包被宪兵打倒。" },
      { when:{origin:["noble","bourgeois"]},
        title:"窗外的饥民",
        text:"你十四岁那年的冬天，家里依旧有热汤和面包。但每天清晨，门外都跪着几个面黄肌瘦的陌生人。母亲让仆人施舍些残羹，父亲皱着眉说：'这样下去不是办法。'" },
      { when:{origin:["clergy"]},
        title:"教区救济站",
        text:"那个冬天，你跟着叔叔（本堂神父）在教区分发救济粮。你看见村民排着长队，眼神里既有感激也有羞耻。叔叔低声说：'光靠教会撑不住的。'" },
    ],
    choices:[
      { text:"你记住的是穷人的无助——需要强有力的秩序来保障生存", axes:{order:8,state_structure:5}, tag:"order_sympathy" },
      { text:"你记住的是地主与商人在灾年照样获利——制度本身就不公正", axes:{equality:10,regime:5}, tag:"anti_privilege" },
      { text:"你记住的是教区救济和邻里互助——共同体比遥远的国家更可靠", axes:{religion:-5,state_structure:-8}, tag:"community_faith" },
      { text:"你记住的是国家离普通人太远——赋税拿走一切，却什么也不还", axes:{sovereignty:8,state_structure:-5}, tag:"anti_state" },
      // 性别专属选项
      { text:"你记住的是母亲在厨房一遍遍重新分配那点食物——女人在饥荒中先饿", when:{gender:"female"},
        axes:{equality:12,sovereignty:5}, tag:"female_hunger" },
    ]},

  { id:"lord_conflict", title:"与领主的冲突",
    text:"你十六岁那年，领主的管事带人来征收地租。父亲跪在地上求情，管事只是冷冷地把账本合上。",
    variants:[
      { when:{origin:["noble"]},
        title:"父亲与邻居领主的纠纷",
        text:"你十六岁那年，邻近的大领主侵占了你家几块林地。父亲想去打官司，却被亲戚劝阻：'对方在凡尔赛有人。'你第一次明白：所谓贵族，也分三六九等。" },
      { when:{origin:["bourgeois"]},
        title:"父亲在法庭上输掉的案子",
        text:"父亲是镇上小有名气的律师，为一户佃农打官司告领主滥征。判决下来那天，他回家后把假发摘下来扔在桌上。'法律？'他冷笑，'法律是给没有特权的人准备的。'" },
      { when:{origin:["clergy"]},
        title:"教会与领主的边界",
        text:"教区与领主因为一片葡萄园起了争执。叔叔被传唤到主教面前，回来后整整一周不说话。后来你才知道：主教让教会让步了——'为了和睦'。" },
      { when:{origin:["military"]},
        title:"父亲被上司羞辱",
        text:"你父亲是个老兵，军功不少，却因为不是贵族永远晋不到上尉。那年新来的少尉——一个十八岁的子爵——当众斥责他。父亲立正敬礼，回家后喝了一整夜的酒。" },
    ],
    choices:[
      { text:"你从此厌恶旧特权——封建制度就是吃人", axes:{equality:10,regime:8}, tag:"anti_feudal" },
      { text:"问题在贪官恶吏，而非制度本身", axes:{regime:-5,order:5}, tag:"reform_faith" },
      { text:"你希望有统一明确的国家法令", axes:{rule_of_law:10,state_structure:8}, tag:"legal_reform" },
      { text:"必须有更强硬的变革——请愿和法律太慢了", axes:{sovereignty:10,equality:8}, tag:"radical_change" },
      { text:"军功才是出路——只有战场不问出身", when:{origin:["military"]}, axes:{war:10,order:5}, tag:"military_dream" },
    ]},

  { id:"mentor", title:"一位重要的人",
    text:"在你的成长中，有一个人对你影响深远。他在你心中种下了一颗种子，直到革命爆发那天才真正发芽。",
    choices:[
      { text:"教区的老神父——他教你读书识字，也教你敬畏上帝", axes:{religion:-12,order:5,regime:-5}, tag:"pious" },
      { text:"一位自由派律师——他向你解释'自然权利'与'社会契约'", axes:{rule_of_law:12,regime:5}, tag:"enlightened" },
      { text:"一位退伍老兵——他说军队才是真正的公平", axes:{war:8,order:8,equality:5}, tag:"military_mentor" },
      { text:"一位激进的小册子作者——他偷偷给你看被禁的文章", axes:{sovereignty:10,regime:10,equality:8}, tag:"radical_mentor" },
      // 女性专属
      { text:"一位经营沙龙的远房姨母——她让你看到女人也能影响政治", when:{gender:"female"},
        axes:{rule_of_law:8,sovereignty:5,equality:8}, tag:"salon_mentor" },
    ]},

  { id:"humiliation", title:"一次羞辱",
    text:"十七岁那年，你因为自己的出身——无论太低还是太高——被人当众嘲笑。那种灼热的耻辱感改变了你看待世界的方式。",
    variants:[
      { when:{origin:["peasant","artisan"]},
        text:"你陪父亲去缴税那天，税务官当着所有人的面把你父亲的帽子打掉，让他跪着数硬币。你站在一旁，手指甲掐进掌心。" },
      { when:{origin:["noble"]},
        text:"在巴黎一次贵族聚会上，因为你家是'乡下贵族'，一位公爵的儿子当众模仿你的口音，引得满座哄笑。你父亲只是低头微笑。" },
      { when:{origin:["bourgeois"]},
        text:"你考取了法律学位，却在一场宴会上被一位侯爵打断：'律师？哦，那种替人写字的行当。'满桌人都在笑。" },
      { when:{gender:"female"},
        text:"你在哥哥的同学面前发表了一段对卢梭的看法。他们先是惊讶，然后开始哄笑——'女孩子谈这个？'你哥哥红着脸把你拉走。" },
    ],
    choices:[
      { text:"你暗暗发誓：总有一天能力会比血统更重要", axes:{equality:10,order:5}, tag:"meritocracy" },
      { text:"你开始怀疑一切等级秩序", axes:{equality:12,sovereignty:8}, tag:"egalitarian" },
      { text:"你学会了隐忍和伪装", axes:{order:5,rule_of_law:-3}, tag:"pragmatic" },
      { text:"你的愤怒变成冰冷的决心——这个世界必须被彻底改造", axes:{regime:10,equality:10}, tag:"revolutionary_seed" },
    ]},

  { id:"eve_of_revolution", title:"1788年，革命前夜的选择",
    text:"1788年夏天，三级会议即将召开的消息传遍全国。空气中弥漫着不安与期待。你即将满二十岁。",
    choices:[
      { text:"留在家乡，守住家庭和你所熟悉的一切", axes:{order:5,state_structure:-5}, tag:"stay_home" },
      { text:"去巴黎！那里正在发生改变世界的事情", axes:{sovereignty:5,regime:5,state_structure:5}, tag:"go_paris" },
      { text:"参军——无论世界怎么变，军队总需要人", when:{gender:"male"}, axes:{war:8,order:5}, tag:"join_army" },
      { text:"进入法律或行政领域", when:{tagsAny:["enlightened","legal_reform","meritocracy"]},
        axes:{rule_of_law:8,state_structure:5}, tag:"legal_career" },
      { text:"准备嫁妆，等家里安排婚事——但你心里另有打算", when:{gender:"female"},
        axes:{sovereignty:3}, tag:"female_waiting" },
      { text:"加入修道院的初学生——也许那里能让世界安静下来", when:{origin:["clergy","noble"], gender:"female"},
        axes:{religion:-10,order:5}, tag:"convent" },
    ]},
];

/* ============================================================
   章节事件（部分含变体；其余按同模式补充即可）
   ============================================================ */
const CHAPTERS = [
  { id:"ch1", title:"第一章：1789，旧世界裂开了", year:"1789",
    intro:"你二十岁了。三级会议在凡尔赛召开，国民议会宣告成立。七月十四日，巴黎群众攻占了巴士底狱。你站在这场风暴的入口处。",
    events:[
      { id:"e1", title:"请愿书",
        text:"地方上正在起草陈情书。社区集会上争吵声此起彼伏。有人拉住你的衣袖：'你来说几句吧。'",
        variants:[
          { when:{region:["paris"]},
            title:"街区俱乐部的彻夜辩论",
            text:"你在街区俱乐部的木板桌上写陈情草稿。烛火摇曳，争吵声从黄昏持续到天明。一个码头工人拍着桌子说：'写就要写得让凡尔赛听见！'" },
          { when:{region:["west"], origin:["peasant","clergy"]},
            title:"教堂门口的村民会议",
            text:"村民们聚在教堂前。老神父也在场。大家既想减税，又害怕巴黎的'新东西'。一个老农低声说：'别写得太过头，国王是好的，是大臣坏。'" },
          { when:{origin:["noble"]},
            title:"贵族陈情书的草拟",
            text:"你随父亲参加本省贵族会议。多数老人主张保住免税特权，少数年轻贵族则主张主动让步。所有目光都看向你这个'年轻人'。" },
          { when:{gender:"female"},
            title:"市场妇女的请愿",
            text:"男人们在市政厅里争论。你和几个市场上的妇女在外面写自己的请愿——关于面包、关于寡妇的继承、关于她们丈夫被征走的事。没有人邀请你们进去。" },
        ],
        choices:[
          { text:"'请求恢复旧日权利和习惯——国王陛下一定会听到我们的声音'", axes:{regime:-10,sovereignty:-5}, tag:"petition_tradition" },
          { text:"'减轻税负，废除封建压迫！'", axes:{equality:8,regime:5,sovereignty:5}, tag:"petition_reform" },
          { text:"'我们需要宪法、统一的法律和真正的代表制'", axes:{rule_of_law:10,regime:5,state_structure:8}, tag:"petition_constitution" },
          { text:"'光写请愿书有什么用？我们需要行动'", axes:{sovereignty:12,regime:8,equality:8}, tag:"petition_radical" },
          { text:"'也写上女人的诉求——继承、寡妇的权利、女儿的教育'", when:{gender:"female"},
            axes:{equality:12,rule_of_law:5}, tag:"petition_female" },
          { text:"'恳请国王亲自下乡看一看歉收的村庄'", when:{origin:["peasant"], region:["west","center"]},
            axes:{regime:-8,order:5}, tag:"petition_loyal_peasant" },
        ]},

      { id:"e2", title:"巴士底狱的消息",
        text:"七月的一天，消息像野火一样传来：巴黎群众攻占了巴士底狱！",
        variants:[
          { when:{region:["paris"]},
            text:"你就在巴黎。烟从圣安托万方向升起。街上的人或哭或笑或奔跑。一个陌生人塞给你一把生锈的剑：'去吧，朋友！'" },
          { when:{region:["west"], tagsAny:["pious","community_faith"]},
            text:"消息传到村里时，神父在教堂里画十字。他低声说：'魔鬼出笼了。'你不知道该跟着画十字，还是悄悄欢呼。" },
          { when:{origin:["noble","military"]},
            text:"消息传来那天，你父亲（或叔叔）正在擦拭那把祖传的佩剑。他听完后久久没说话，然后只说了一句：'国王在干什么？'" },
        ],
        choices:[
          { text:"你感到不安——这是混乱不是改革", axes:{regime:-8,order:8,sovereignty:-8}, tag:"fear_mob" },
          { text:"你能理解人民的愤怒——但希望这是最后一次暴力", axes:{regime:3,rule_of_law:5}, tag:"cautious_sympathy" },
          { text:"你激动得热泪盈眶——人民终于站起来了", axes:{sovereignty:10,regime:8,equality:5}, tag:"revolutionary_joy" },
          { text:"这是信号——旧世界必须被彻底推翻", axes:{sovereignty:12,regime:12,equality:8}, tag:"total_revolution" },
          { text:"你立刻动身去巴黎——你必须亲眼看见", when:{gender:"male", tagsNone:["fear_mob"]},
            axes:{sovereignty:8,regime:5}, tag:"rush_to_paris" },
        ]},
    ]},

  { id:"ch2", title:"第二章：1790–1791，革命是否该停下来", year:"1790–1791",
    intro:"革命已经一年了。教士被要求宣誓，宪法正在起草，俱乐部如雨后春笋。但国王始终是一个谜。",
    events:[
      { id:"e3", title:"教士宣誓",
        text:"当地的老神父被要求向新的国家体制宣誓效忠。他面色灰白，手中攥着十字架。",
        variants:[
          { when:{origin:["clergy"]},
            title:"宣誓——你自己的家",
            text:"被要求宣誓的不是别人，正是你的叔叔/堂兄。他把你叫到一旁问：'你说，我该怎么办？'你看见了他眼里的恐惧——和倔强。" },
          { when:{region:["west"]},
            title:"全村人都站在神父这一边",
            text:"村民们一个接一个走进教堂，把自己的名字写在拒绝宣誓的名单上。有人问你：'你也来签吧？'整个村子都在看你。" },
          { when:{tagsAny:["enlightened","radical_mentor"]},
            text:"你想起那位律师/小册子作者曾说过：'教会的权力必须让位于公民的国家。'你也想起神父小时候教你认字的样子。" },
        ],
        choices:[
          { text:"支持神父拒绝宣誓——信仰不应被国家玷污", axes:{religion:-12,regime:-5,state_structure:-8}, tag:"support_refractory" },
          { text:"试图劝和——也许信仰和国家可以妥协", axes:{rule_of_law:5,order:3}, tag:"religious_compromise" },
          { text:"支持宣誓——国家需要统一", axes:{religion:8,state_structure:8,regime:5}, tag:"support_oath" },
          { text:"教会的公共权威早该被打破了", axes:{religion:15,state_structure:10}, tag:"anti_church" },
          { text:"亲自跪下求叔叔宣誓——你不能眼看他被流放", when:{origin:["clergy"]},
            axes:{religion:5,state_structure:5}, tag:"beg_uncle" },
        ]},

      { id:"e4", title:"国王出逃",
        text:"1791年6月的清晨，整个法国被一个消息震醒：国王一家试图秘密逃离巴黎！他们在瓦雷纳被拦截。",
        choices:[
          { text:"君主制也许仍可挽救——但要更严格地约束他", axes:{regime:-5,rule_of_law:5,order:5}, tag:"keep_king_strict" },
          { text:"君主制已不可信", axes:{regime:10,sovereignty:5}, tag:"doubt_monarchy" },
          { text:"共和！法国不再需要国王！", axes:{regime:15,sovereignty:10,equality:5}, tag:"republic_now" },
          { text:"你对此并不意外", axes:{regime:8,order:3}, tag:"unsurprised" },
          { text:"你心如刀绞——国王是上帝的受膏者，无论如何不能背弃他",
            when:{origin:["noble","clergy"], tagsAny:["pious","petition_tradition"]},
            axes:{regime:-15,religion:-8}, tag:"royalist_heart" },
        ]},
    ]},

  /* ====== 出身专属"插入事件" ====== */
  { id:"ch_noble_only", title:"插曲：贵族的抉择", year:"1790", when:{origin:["noble"]},
    intro:"作为贵族家庭的一员，1790年8月的一道法令直接落在你头上——废除世袭贵族头衔。",
    events:[
      { id:"noble_title", title:"放弃头衔？",
        text:"邻居家的老侯爵当众撕碎了自己的纹章，宣布从此自称'公民某某'。父亲在书房里把祖传族谱锁进了抽屉，一句话也不说。",
        choices:[
          { text:"主动放弃头衔，加入革命的新精英", axes:{regime:8,equality:10,sovereignty:5}, tag:"renounce_title" },
          { text:"私下保留头衔，公开装作普通公民", axes:{order:5,rule_of_law:-3}, tag:"hide_title" },
          { text:"坚守荣誉——纹章是祖先留下的，不容侮辱", axes:{regime:-15,religion:-5,order:8}, tag:"keep_title" },
          { text:"考虑流亡——也许在科布伦茨能找到同伴", axes:{regime:-12,war:5}, tag:"consider_emigration" },
        ]},
    ]},

  /* ====== 性别专属插入事件 ====== */
  { id:"ch_women_march", title:"插曲：十月的妇女游行", year:"1789年10月", when:{gender:"female"},
    intro:"十月五日清晨，巴黎的市场妇女向凡尔赛进发，要求面包，也要求把国王带回巴黎。",
    events:[
      { id:"women_march", title:"你是否加入？",
        text:"队伍经过你住的街区。她们手里有的拿着扫帚，有的拿着刀。一个鱼贩拍着你的肩膀：'走，姐妹，去把国王领回来！'",
        choices:[
          { text:"加入游行——这是你第一次感到自己有政治力量", axes:{sovereignty:15,equality:10,regime:8}, tag:"march_versailles" },
          { text:"远远跟在后面观察", axes:{sovereignty:5}, tag:"watch_march" },
          { text:"留在家里——这种事情不该是女人做的", axes:{order:8,regime:-3}, tag:"refuse_march" },
          { text:"去教堂为国王祈祷", when:{tagsAny:["pious","community_faith"]},
            axes:{religion:-10,regime:-10}, tag:"pray_for_king" },
        ]},
    ]},

  /* === 后续章节：你按上面的模式继续加 variants 即可 === */
  /* 为了让游戏可玩，先保留你原有的 ch3-ch8 框架（无 variants）。
     需要扩写时，每个事件复制 variants/when 模板就行。 */
  { id:"ch3", title:"第三章：1792，共和国与战争来临", year:"1792",
    intro:"战争来了。八月十日，巴黎群众冲入杜伊勒里宫。九月，监狱屠杀。共和国宣告成立。",
    events:[
      { id:"e5", title:"征兵与战争",
        text:"国家需要士兵。'祖国在危难中！'这句话无处不在。",
        choices:[
          { text:"反对主动出击", axes:{war:-10,order:5}, tag:"anti_war" },
          { text:"支持保卫边境", axes:{war:5,rule_of_law:5}, tag:"defensive_war" },
          { text:"战争是革命的试金石", axes:{war:10,regime:8,sovereignty:5}, tag:"revolutionary_war" },
          { text:"在烈火中法兰西才能浴火重生", axes:{war:15,state_structure:8,order:5}, tag:"war_glory" },
          { text:"亲自报名参军", when:{gender:"male", tagsNone:["fear_mob"]},
            axes:{war:12,order:5}, tag:"enlist_92", statChange:{prestige:1,safety:-1} },
          { text:"组织妇女缝制军服、筹集捐款", when:{gender:"female"},
            axes:{war:5,sovereignty:5,equality:5}, tag:"home_front_women" },
        ]},
      { id:"e6", title:"国王的命运",
        text:"路易十六被关押在圣殿塔中。'公民卡佩'是否有罪？该如何处置他？",
        choices:[
          { text:"保住他的生命", axes:{regime:-8,rule_of_law:5,war:-5}, tag:"spare_king" },
          { text:"审判但要遵循严格程序", axes:{rule_of_law:10,regime:5}, tag:"trial_king" },
          { text:"他必须死", axes:{regime:15,sovereignty:10,equality:5}, tag:"execute_king" },
          { text:"摧毁王权的一切象征", axes:{regime:18,sovereignty:12,equality:10,religion:5}, tag:"destroy_monarchy" },
        ]},
    ]},

  { id:"ch4", title:"第四章：1793–1794，恐怖时代", year:"1793–1794",
    intro:"国王被送上断头台。内战与对外战争同时爆发。公安委员会掌握了近乎无限的权力。",
    events:[
      { id:"e7", title:"面包与限价法", text:"市场上的妇女们围堵商铺，要求平价供应。",
        variants:[
          { when:{gender:"female", region:["paris"]},
            text:"你就在那群妇女中间。前一天你的孩子只吃了半个面包。市政官来劝散，被一个老妇人当胸推开：'让我们的孩子先活下去！'" },
          { when:{origin:["bourgeois"], tagsAny:["legal_reform","reform_faith"]},
            text:"作为有产者的儿子/女儿，你看着自家的店铺被指控囤积。父亲连夜核对账本，手在抖。" },
        ],
        choices:[
          { text:"反对限价——市场有自己的规律", axes:{equality:-10,rule_of_law:5}, tag:"free_market" },
          { text:"有限救济就好", axes:{equality:-3,rule_of_law:5,order:5}, tag:"limited_relief" },
          { text:"临时限价是必要的", axes:{equality:8,state_structure:5,sovereignty:5}, tag:"temp_price_control" },
          { text:"强力限价，严惩囤积者！", axes:{equality:15,state_structure:10,sovereignty:8,rule_of_law:-8}, tag:"max_price_control" },
        ]},
      { id:"e8", title:"嫌疑人法与恐怖", text:"任何'缺乏公民热情'的人都可以被逮捕。",
        choices:[
          { text:"这违背了人权宣言", axes:{rule_of_law:10,sovereignty:-5}, tag:"oppose_terror" },
          { text:"作为短期紧急措施可以接受", axes:{rule_of_law:5,state_structure:3}, tag:"reluctant_terror" },
          { text:"战时需要战时手段", axes:{rule_of_law:-8,state_structure:8,sovereignty:5}, tag:"accept_terror" },
          { text:"对敌人不能心慈手软", axes:{rule_of_law:-15,state_structure:12,sovereignty:10,equality:5}, tag:"embrace_terror" },
        ]},
      { id:"e9", title:"老朋友被怀疑",
        text:"一个你从小认识的朋友被检举'立场不纯'。有人悄悄问你是否愿意为他作证。",
        variants:[
          { when:{tagsAny:["enlightened","legal_reform","oppose_terror"]},
            text:"你想起他小时候帮你抄写法律笔记。如今他被控告'与吉伦特派通信'——而你知道这是诬告。" },
          { when:{tagsAny:["embrace_terror","total_revolution","execute_king"]},
            text:"以你现在的立场，本可以毫不犹豫地撇清。但他毕竟救过你父亲一命。你的理性和记忆在打架。" },
        ],
        choices:[
          { text:"冒险为他作证", axes:{rule_of_law:8,order:-5}, tag:"defend_friend", statChange:{safety:-2} },
          { text:"保持沉默", axes:{order:5}, tag:"silence_friend" },
          { text:"配合审查以自保", axes:{order:8,rule_of_law:-5}, tag:"cooperate_purge", statChange:{safety:1} },
          { text:"主动揭发他", axes:{rule_of_law:-10,sovereignty:8,state_structure:5}, tag:"denounce_friend", statChange:{safety:2,prestige:1} },
        ]},
    ]},

  // ch5–ch8：保留你原版（为节省空间未列出全部 variants，可按上面模式继续扩写）
  { id:"ch5", title:"第五章：1794，热月之后", year:"1794",
    intro:"罗伯斯庇尔倒台了。恐怖结束了，但新的报复开始了。",
    events:[
      { id:"e10", title:"热月的意义", text:"过去两年的一切像一场噩梦——或者已醒的梦？",
        choices:[
          { text:"革命被背叛了", axes:{sovereignty:10,equality:8,rule_of_law:-5}, tag:"thermidor_betrayal" },
          { text:"必要的刹车", axes:{regime:5,rule_of_law:5,order:5}, tag:"thermidor_necessary" },
          { text:"终于恢复法治", axes:{rule_of_law:10,order:8,sovereignty:-5}, tag:"thermidor_relief" },
          { text:"该清理极端分子了", axes:{rule_of_law:5,order:10,equality:-8,sovereignty:-10}, tag:"thermidor_reaction" },
        ]},
      { id:"e11", title:"面对反扑", text:"街头开始出现报复。",
        choices:[
          { text:"冲上去保护那个人", axes:{rule_of_law:8,equality:3}, tag:"protect_jacobin" },
          { text:"大声呼吁停止", axes:{rule_of_law:8,order:5}, tag:"stop_revenge" },
          { text:"默默走开", axes:{order:5,rule_of_law:-3}, tag:"allow_reaction" },
          { text:"支持清算", axes:{order:10,sovereignty:-8,equality:-8}, tag:"support_reaction" },
        ]},
    ]},
  { id:"ch6", title:"第六章：1795–1799，督政府时代", year:"1795–1799",
    intro:"共和国仍在，但它越来越依赖精英、行政和军队。",
    events:[
      { id:"e12", title:"被操控的选举", text:"当局准备作废部分选举结果。",
        choices:[
          { text:"坚持程序", axes:{rule_of_law:12,sovereignty:5,order:-5}, tag:"defend_election" },
          { text:"勉强接受有限干预", axes:{rule_of_law:3,order:5}, tag:"limited_intervention" },
          { text:"共和国必须先活下去", axes:{order:10,rule_of_law:-8,state_structure:8}, tag:"republic_over_democracy" },
          { text:"军队和行政可以介入", axes:{order:15,state_structure:10,sovereignty:-10,rule_of_law:-10}, tag:"authoritarian_turn" },
        ]},
      { id:"e13", title:"你的位置", text:"革命已经过去六年了。你三十岁了。",
        choices:[
          { text:"进入地方行政系统", axes:{state_structure:5,rule_of_law:5,order:5}, tag:"civil_servant", statChange:{prestige:1,safety:1} },
          { text:"经商或从事供应生意", axes:{equality:-5,order:3}, tag:"merchant", statChange:{wealth:2} },
          { text:"走军队路线", when:{gender:"male"}, axes:{war:8,order:5,state_structure:5}, tag:"military_path", statChange:{prestige:1} },
          { text:"远离政治，守住家庭", axes:{order:3,state_structure:-3}, tag:"private_life", statChange:{safety:2} },
          { text:"经营沙龙，影响新精英", when:{gender:"female", origin:["bourgeois","noble"]},
            axes:{rule_of_law:5,order:5}, tag:"salon_life", statChange:{influence:2,prestige:1} },
        ]},
    ]},
  { id:"ch7", title:"第七章：1799–1804，强人上场", year:"1799–1804",
    intro:"拿破仑结束了议会政治的疲态，也把法国带向新的集权秩序。",
    events:[
      { id:"e14", title:"雾月政变", text:"'有人结束了议会的内耗'——你怎么看？",
        choices:[
          { text:"军队把政治践踏了", axes:{rule_of_law:8,regime:5,sovereignty:5,order:-5}, tag:"oppose_brumaire" },
          { text:"也许有必要", axes:{order:5,rule_of_law:3}, tag:"cautious_brumaire" },
          { text:"只要革命成果保住", axes:{order:10,state_structure:8,regime:-3}, tag:"accept_brumaire" },
          { text:"国家需要领袖", axes:{order:15,state_structure:12,war:8,sovereignty:-10}, tag:"support_brumaire" },
        ]},
      { id:"e15", title:"新秩序中的你", text:"执政府已经稳固。",
        choices:[
          { text:"内心反对，沉默信仰共和", axes:{rule_of_law:8,regime:8,sovereignty:5,order:-8}, tag:"silent_republican" },
          { text:"加入新行政体系", axes:{state_structure:8,order:8,rule_of_law:3}, tag:"join_napoleon_admin", statChange:{prestige:1,wealth:1} },
          { text:"军功路线", when:{gender:"male"}, axes:{war:8,order:10,state_structure:8}, tag:"napoleon_military", statChange:{prestige:2} },
          { text:"退回私人生活", axes:{order:3}, tag:"retreat_private", statChange:{safety:2} },
        ]},
    ]},
  { id:"ch8", title:"第八章：1804–1815，帝国、战争与终局", year:"1804–1815",
    intro:"帝国建立了。荣耀与伤亡一起增长。",
    events:[
      { id:"e16", title:"皇帝加冕", text:"拿破仑加冕为皇帝。这和我们曾推翻的王冠有什么不同？",
        choices:[
          { text:"革命被王冠重新吞没", axes:{regime:10,sovereignty:5}, tag:"oppose_empire" },
          { text:"背离理想但带来稳定", axes:{order:8,state_structure:5}, tag:"accept_empire" },
          { text:"革命成果的制度化归宿", axes:{order:10,state_structure:10,regime:-8}, tag:"rationalize_empire" },
          { text:"法兰西伟大的巅峰", axes:{order:15,war:10,state_structure:12,sovereignty:-10}, tag:"glorify_empire" },
        ]},
      { id:"e17", title:"战争的代价", text:"亲人失踪，征兵令一张又一张。",
        choices:[
          { text:"够了。这种没有尽头的战争正在吞噬法国", axes:{war:-10,sovereignty:5}, tag:"war_weary" },
          { text:"代价沉重但必要", axes:{war:5,order:5}, tag:"reluctant_war" },
          { text:"伟业不可能没有牺牲", axes:{war:12,order:8}, tag:"accept_war_cost" },
          { text:"你已麻木", axes:{order:-3,sovereignty:-3}, tag:"numb" },
        ]},
      { id:"e18", title:"1814–1815：最终抉择", text:"帝国崩塌、复辟归来、百日王朝、滑铁卢……",
        choices:[
          { text:"接受复辟", axes:{regime:-10,order:10,rule_of_law:3}, tag:"accept_restoration" },
          { text:"接受有限王权", axes:{regime:-3,rule_of_law:8,equality:3,order:5}, tag:"constitutional_restoration" },
          { text:"共和国万岁", axes:{regime:12,sovereignty:10,equality:8}, tag:"eternal_republic" },
          { text:"只想保住自己和家人", axes:{order:5}, tag:"survival" },
        ]},
    ]},
];

/* ============================================================
   FACTIONS / LIFE_ENDINGS / 计算函数（与原版一致）
   ============================================================ */
const FACTIONS = [
  { id:"royalist", name:"正统保王派", desc:"权威、信仰与传统比群众激情更可靠。", figure:"阿图瓦伯爵", figureAlt:"旺代保王派领袖", weights:{regime:-15,sovereignty:-10,religion:-12,order:8,state_structure:-8,rule_of_law:0,equality:-10,war:-3} },
  { id:"constitutional", name:"君主立宪自由派", desc:"改革应停在法治和财产权之内。", figure:"拉法耶特", figureAlt:"巴纳夫", weights:{regime:-5,sovereignty:-3,rule_of_law:12,order:5,equality:-3,state_structure:3,religion:-3,war:-3} },
  { id:"moderate_rev", name:"温和革命派", desc:"摧毁旧弊但不愿无尽动员。", figure:"西哀士", figureAlt:"米拉波", weights:{regime:3,sovereignty:0,rule_of_law:8,order:5,equality:3,state_structure:5,religion:0,war:-3} },
  { id:"girondin", name:"吉伦特式自由共和派", desc:"自由、法治与全国代表制。", figure:"布里索", figureAlt:"孔多塞", weights:{regime:8,sovereignty:3,rule_of_law:10,order:0,equality:3,state_structure:0,religion:3,war:3} },
  { id:"danton", name:"丹东派共和主义者", desc:"重结果重整合多于重纯粹。", figure:"丹东", figureAlt:"德穆兰", weights:{regime:8,sovereignty:5,rule_of_law:0,order:5,equality:5,state_structure:8,religion:3,war:5} },
  { id:"montagnard", name:"雅各宾-山岳派", desc:"用德性、平等与强国家保卫共和。", figure:"罗伯斯庇尔", figureAlt:"圣茹斯特", weights:{regime:12,sovereignty:10,rule_of_law:-8,order:3,equality:12,state_structure:12,religion:8,war:8} },
  { id:"sans_culotte", name:"平民激进派", desc:"站在穷人和街区一边。", figure:"埃贝尔", figureAlt:"肖梅特", weights:{regime:10,sovereignty:15,rule_of_law:-10,order:-5,equality:15,state_structure:5,religion:10,war:5} },
  { id:"thermidor", name:"热月财产共和派", desc:"恐怖必须结束。", figure:"塔利安", figureAlt:"巴拉斯", weights:{regime:3,sovereignty:-5,rule_of_law:8,order:10,equality:-5,state_structure:5,religion:0,war:0} },
  { id:"directory", name:"督政府式秩序共和派", desc:"财产者+行政+军队。", figure:"巴拉斯", figureAlt:"", weights:{regime:3,sovereignty:-8,rule_of_law:5,order:12,equality:-5,state_structure:8,religion:0,war:3} },
  { id:"bonapartist", name:"波拿巴主义者", desc:"效率、统一、军功、国家荣耀。", figure:"拿破仑·波拿巴", figureAlt:"", weights:{regime:-3,sovereignty:-12,rule_of_law:-3,order:15,equality:3,state_structure:15,religion:-3,war:12} },
  { id:"liberal_restoration", name:"开明复辟派", desc:"温和王权加宪法保障。", figure:"路易十八（宪章派）", figureAlt:"", weights:{regime:-8,sovereignty:-5,rule_of_law:8,order:10,equality:-3,state_structure:3,religion:-5,war:-5} },
];

const LIFE_ENDINGS = [
  { id:"executed", name:"被处决的革命者", desc:"你在最狂热的年代把自己交给了事业，最终也被事业吞没。", condition:(s,t)=> (s.safety <= -2 && t.includes("embrace_terror")) || (t.includes("denounce_friend") && t.includes("thermidor_betrayal")) },
  { id:"survivor_notable", name:"幸存的地方名流", desc:"你学会了在每次风向变化中保住自己和家庭。", condition:(s,t)=> s.wealth >= 2 && s.prestige >= 1 && s.safety >= 1 },
  { id:"salon_hostess", name:"沙龙女主人", desc:"你没有写法典，也没有上战场，却让一代精英在你的客厅里相互辩论、缔结盟约。", condition:(s,t)=> t.includes("salon_life") || (t.includes("salon_mentor") && t.includes("petition_female")) },
  { id:"lost_everything", name:"失去一切的普通人", desc:"每一次巨变都比你的力量更大。", condition:(s,t)=> s.wealth <= -1 && s.safety <= 0 && !t.includes("join_napoleon_admin") && !t.includes("napoleon_military") },
  { id:"disillusioned_idealist", name:"共和国的失意理想主义者", desc:"理想被战争、清洗和强人政治挤压得支离破碎。", condition:(s,t)=> t.includes("oppose_brumaire") || t.includes("silent_republican") || t.includes("eternal_republic") },
  { id:"war_admin", name:"战时行政者", desc:"在危机中靠执行力崛起。", condition:(s,t)=> t.includes("civil_servant") || t.includes("join_napoleon_admin") },
  { id:"imperial_officer", name:"帝国军官", desc:"你把个人命运与强国家绑定在一起。", condition:(s,t)=> t.includes("napoleon_military") || (t.includes("support_brumaire") && t.includes("glorify_empire")) },
  { id:"exile", name:"流亡者", desc:"你在故土之外等待法国回头。", condition:(s,t)=> t.includes("support_refractory") && (t.includes("spare_king") || t.includes("fear_mob")) },
  { id:"vendee_widow", name:"旺代的寡妇", desc:"你站在反革命的一侧。教堂被烧，丈夫倒下，你独自把孩子带大，心里只剩下一个十字架。",
    condition:(s,t)=> t.includes("pray_for_king") && t.includes("support_refractory") },
  { id:"family_survivor", name:"归于家庭的幸存者", desc:"你也许没有留下名字，但你活了下来。", condition:(s,t)=> t.includes("private_life") || t.includes("retreat_private") || t.includes("stay_home") || t.includes("survival") },
];

function calculateFaction(axes) {
  let best=null,bestScore=-Infinity,secondBest=null,secondScore=-Infinity,worst=null,worstScore=Infinity;
  for (const f of FACTIONS) {
    let score = 0;
    for (const [k,w] of Object.entries(f.weights)) score += (axes[k]||0) * w;
    if (score > bestScore) { secondBest=best; secondScore=bestScore; best=f; bestScore=score; }
    else if (score > secondScore) { secondBest=f; secondScore=score; }
    if (score < worstScore) { worst=f; worstScore=score; }
  }
  return { primary:best, secondary:secondBest, opposite:worst };
}
function getLifeEnding(stats, tags) {
  for (const e of LIFE_ENDINGS) if (e.condition(stats,tags)) return e;
  return LIFE_ENDINGS.find(e => e.id === "family_survivor");
}
function getIdeologySummary(axes) {
  const parts = [];
  if (axes.regime>8) parts.push("共和主义"); else if (axes.regime<-8) parts.push("君主主义"); else parts.push("温和改良");
  if (axes.equality>8) parts.push("平等优先"); else if (axes.equality<-8) parts.push("财产优先");
  if (axes.order>8) parts.push("秩序导向"); else if (axes.order<-5) parts.push("自由导向");
  if (axes.rule_of_law>5) parts.push("法治信仰"); else if (axes.rule_of_law<-5) parts.push("紧急状态思维");
  if (axes.war>8) parts.push("扩张倾向"); else if (axes.war<-5) parts.push("和平倾向");
  if (axes.religion<-8) parts.push("宗教传统"); else if (axes.religion>8) parts.push("世俗主义");
  return parts.join("·");
}

/* ============================================================
   状态机 / 渲染（基于原版改造，支持 eventApplies 跳过）
   ============================================================ */
const state = {
  phase:"title", origin:null, gender:null, region:null,
  youthIndex:0, chapterIndex:0, eventIndex:0, showChapterIntro:true,
  axes:{regime:0,sovereignty:0,rule_of_law:0,equality:0,state_structure:0,religion:0,war:0,order:0},
  stats:{wealth:0,prestige:0,safety:1,influence:0},
  tags:[], selectedChoice:null
};
const app = document.getElementById("app");

// 跳过整章 when 不满足或所有事件都不满足的章节
function chapterApplies(ch) {
  if (!matchWhen(ch.when, state)) return false;
  return ch.events.some(e => eventApplies(e, state));
}
function nextValidChapter(from) {
  for (let i=from; i<CHAPTERS.length; i++) if (chapterApplies(CHAPTERS[i])) return i;
  return -1;
}
function nextValidEventInChapter(chIdx, fromIdx) {
  const ch = CHAPTERS[chIdx];
  for (let i=fromIdx; i<ch.events.length; i++) if (eventApplies(ch.events[i], state)) return i;
  return -1;
}

function totalEvents() { return CHAPTERS.reduce((s,c)=>s+c.events.length,0) + YOUTH_EVENTS.length; }
function doneEvents() {
  if (state.phase==="result") return totalEvents();
  if (state.phase==="youth") return state.youthIndex;
  if (state.phase==="chapters") {
    const fin = CHAPTERS.slice(0,state.chapterIndex).reduce((s,c)=>s+c.events.length,0);
    return YOUTH_EVENTS.length + fin + (state.showChapterIntro ? 0 : state.eventIndex);
  }
  return 0;
}
function progress() { const t = totalEvents(); return t ? Math.round(doneEvents()/t*100) : 0; }
function applyChoice(c) {
  if (c.axes) for (const [k,v] of Object.entries(c.axes)) state.axes[k]=(state.axes[k]||0)+v;
  if (c.statChange) for (const [k,v] of Object.entries(c.statChange)) state.stats[k]=(state.stats[k]||0)+v;
  if (c.tag) state.tags.push(c.tag);
}
function applyOrigin(o) {
  state.origin=o;
  for (const [k,v] of Object.entries(o.axes||{})) state.axes[k]=(state.axes[k]||0)+v;
  for (const [k,v] of Object.entries(o.stats||{})) state.stats[k]=(state.stats[k]||0)+v;
}
function transition(cb) {
  const c = document.querySelector(".content");
  if (c) c.classList.add("fade-out");
  setTimeout(()=>{ cb(); render(); requestAnimationFrame(()=>{
    const n = document.querySelector(".content");
    if (n) { n.classList.remove("fade-out"); window.scrollTo({top:0,behavior:"smooth"}); }
  }); }, 260);
}
function axisRows() {
  const meta = [
    {key:"regime",left:"王权",right:"共和"},{key:"sovereignty",left:"精英代议",right:"群众政治"},
    {key:"rule_of_law",left:"紧急状态",right:"程序法治"},{key:"equality",left:"财产优先",right:"社会平等"},
    {key:"state_structure",left:"地方传统",right:"中央集权"},{key:"religion",left:"宗教政治",right:"世俗化"},
    {key:"war",left:"和平安定",right:"扩张荣耀"},{key:"order",left:"自由优先",right:"强人整合"},
  ];
  return meta.map(a=>{
    const v = state.axes[a.key]||0, pct = Math.min(100,Math.max(0,50+v*1.5));
    return `<div class="axis-row"><span class="axis-left">${a.left}</span><div class="axis-bar"><div class="axis-center"></div><div class="axis-dot" style="left:${pct}%"></div></div><span class="axis-right">${a.right}</span></div>`;
  }).join("");
}

function renderTitle() { return `<div class="title-screen fade-in-up"><div class="title-decor">⚜</div><h1 class="main-title">风暴中的一生</h1><p class="subtitle">Une Vie dans la Tempête</p><p class="title-desc">1769 – 1815 · 法国大革命文字冒险</p><div class="title-divider">───── ✦ ─────</div><p class="title-flavor">你出生于1769年的法国。<br>二十年后，旧世界裂开了。<br>每一个抉择都将塑造你的命运。</p><button class="btn-primary" data-action="start">开始你的一生</button><p class="tiny-note">含出身/性别/选择分支事件</p></div>`; }
function renderOrigin() { return `<div class="fade-in-up"><p class="phase-label">角色创建 · 第一步</p><h2 class="section-title">你出生在什么样的家庭？</h2><p class="section-desc">1769年。你来到了一个即将崩塌与重生的世界。</p><div class="grid">${ORIGINS.map((o,i)=>`<button class="card" data-action="origin" data-index="${i}"><span class="card-icon">${o.icon}</span><span class="card-title">${o.name}</span><span class="card-desc">${o.desc}</span></button>`).join("")}</div></div>`; }
function renderGender() { return `<div class="fade-in-up"><p class="phase-label">角色创建 · 第二步</p><h2 class="section-title">你的性别</h2><p class="section-desc">性别不会决定你的信念，但会改变你进入政治的方式。</p><div class="gender-grid">${GENDERS.map((g,i)=>`<button class="gender-card" data-action="gender" data-index="${i}"><span class="gender-name">${g.name}</span><span class="card-desc">${g.desc}</span></button>`).join("")}</div></div>`; }
function renderRegion() { return `<div class="fade-in-up"><p class="phase-label">角色创建 · 第三步</p><h2 class="section-title">你出生在法国的哪里？</h2><p class="section-desc">每一片土地都将以不同的方式迎接革命。</p><div class="grid">${REGIONS.map((r,i)=>`<button class="card" data-action="region" data-index="${i}"><span class="card-icon">${r.icon}</span><span class="card-title">${r.name}</span><span class="card-desc">${r.desc}</span></button>`).join("")}</div></div>`; }

function renderYouth() {
  const raw = YOUTH_EVENTS[state.youthIndex];
  const evt = resolveEvent(raw, state);
  return `<div class="fade-in-up"><p class="phase-label">成长岁月 · ${evt.title}</p><p class="year-badge">1769–1789</p><h2 class="event-title">${evt.title}</h2><div class="narrative-box"><p class="narrative-text">${evt.text}</p></div><div class="choice-list">${evt.choices.map((c,i)=>`<button class="choice-btn ${state.selectedChoice===i?'selected':''}" data-action="youth-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>${c.text}</button>`).join("")}</div><p class="event-counter">成长事件 ${state.youthIndex+1} / ${YOUTH_EVENTS.length}</p></div>`;
}
function renderChapterIntro() {
  const ch = CHAPTERS[state.chapterIndex];
  return `<div class="fade-in-up"><div class="chapter-intro"><p class="year-badge">${ch.year}</p><h2 class="chapter-title">${ch.title}</h2><div class="chapter-divider">───── ✦ ─────</div><p class="chapter-intro-text">${ch.intro}</p><button class="btn-primary" data-action="chapter-continue">继续</button></div></div>`;
}
function renderChapterEvent() {
  const ch = CHAPTERS[state.chapterIndex];
  const raw = ch.events[state.eventIndex];
  const evt = resolveEvent(raw, state);
  return `<div class="fade-in-up"><p class="phase-label">${ch.title}</p><p class="year-badge">${ch.year}</p><h2 class="event-title">${evt.title}</h2><div class="narrative-box"><p class="narrative-text">${evt.text}</p></div><div class="choice-list">${evt.choices.map((c,i)=>`<button class="choice-btn ${state.selectedChoice===i?'selected':''}" data-action="chapter-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>${c.text}</button>`).join("")}</div><p class="event-counter">第 ${state.chapterIndex+1} 章 · 事件 ${state.eventIndex+1} / ${ch.events.length}</p></div>`;
}
function renderResult() {
  const f = calculateFaction(state.axes);
  const e = getLifeEnding(state.stats, state.tags);
  const ideo = getIdeologySummary(state.axes);
  return `<div class="fade-in-up"><div class="result-header"><div class="title-decor">⚜</div><h2 class="result-main-title">你的一生</h2><p class="result-subtitle">1769 – 1815</p><p class="result-origin-line">${state.origin.icon} ${state.gender.name} · ${state.origin.name} · ${state.region.name}</p></div><div class="result-section"><h3 class="result-label">⸻ 人生结局 ⸻</h3><h2 class="ending-name">${e.name}</h2><p class="ending-desc">${e.desc}</p></div><div class="result-section"><h3 class="result-label">⸻ 核心意识形态 ⸻</h3><p class="ideology-text">${ideo}</p></div><div class="result-section"><h3 class="result-label">⸻ 最接近的政治派别 ⸻</h3><div class="faction-box"><h2 class="faction-name">${f.primary.name}</h2><p class="faction-desc">${f.primary.desc}</p></div>${f.secondary?`<div class="secondary-faction"><p class="secondary-label">次级倾向：${f.secondary.name}</p></div>`:""}</div><div class="result-section"><h3 class="result-label">⸻ 最相似的历史人物 ⸻</h3><div class="figure-box"><p class="figure-name">${f.primary.figure}</p>${f.primary.figureAlt?`<p class="figure-alt">次相似：${f.primary.figureAlt}</p>`:""}</div></div><div class="result-section"><h3 class="result-label">⸻ 与你最不相似的类型 ⸻</h3><p class="opposite-faction">${f.opposite.name}</p></div><div class="result-section"><h3 class="result-label">⸻ 政治光谱 ⸻</h3><div class="axes-grid">${axisRows()}</div></div><div class="actions-row"><button class="btn-primary" data-action="restart">重新开始</button></div></div>`;
}
function renderPhase() {
  switch(state.phase) {
    case "title": return renderTitle();
    case "origin": return renderOrigin();
    case "gender": return renderGender();
    case "region": return renderRegion();
    case "youth": return renderYouth();
    case "chapters": return state.showChapterIntro ? renderChapterIntro() : renderChapterEvent();
    case "result": return renderResult();
    default: return "<p>未知</p>";
  }
}
function render() {
  const sp = !["title","result"].includes(state.phase);
  app.innerHTML = `<div class="app">${sp?`<div class="progress-bar"><div class="progress-fill" style="width:${progress()}%"></div></div>`:""}<div class="content">${renderPhase()}</div></div>`;
  bindEvents();
}

// 推进到下一章节/事件，自动跳过 when 不满足的
function advanceChapter() {
  const ch = CHAPTERS[state.chapterIndex];
  const next = nextValidEventInChapter(state.chapterIndex, state.eventIndex + 1);
  if (next !== -1) { state.eventIndex = next; return; }
  const nextCh = nextValidChapter(state.chapterIndex + 1);
  if (nextCh !== -1) {
    state.chapterIndex = nextCh;
    state.eventIndex = nextValidEventInChapter(nextCh, 0);
    state.showChapterIntro = true;
  } else state.phase = "result";
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => {
      const a = el.dataset.action;
      const i = el.dataset.index !== undefined ? Number(el.dataset.index) : null;
      if (a==="start") transition(()=> state.phase="origin");
      if (a==="origin") transition(()=> { applyOrigin(ORIGINS[i]); state.phase="gender"; });
      if (a==="gender") transition(()=> { state.gender = GENDERS[i]; state.phase="region"; });
      if (a==="region") transition(()=> {
        state.region = REGIONS[i];
        for (const [k,v] of Object.entries(state.region.axes||{})) state.axes[k]=(state.axes[k]||0)+v;
        state.phase = "youth";
      });
      if (a==="youth-choice" && state.selectedChoice===null) {
        state.selectedChoice = i; render();
        setTimeout(()=> transition(()=> {
          const evt = resolveEvent(YOUTH_EVENTS[state.youthIndex], state);
          applyChoice(evt.choices[i]);
          state.selectedChoice = null;
          if (state.youthIndex < YOUTH_EVENTS.length - 1) state.youthIndex += 1;
          else {
            state.phase = "chapters";
            state.chapterIndex = nextValidChapter(0);
            state.eventIndex = state.chapterIndex>=0 ? nextValidEventInChapter(state.chapterIndex, 0) : 0;
            state.showChapterIntro = true;
            if (state.chapterIndex < 0) state.phase = "result";
          }
        }), 350);
      }
      if (a==="chapter-continue") transition(()=> state.showChapterIntro = false);
      if (a==="chapter-choice" && state.selectedChoice===null) {
        state.selectedChoice = i; render();
        setTimeout(()=> transition(()=> {
          const ch = CHAPTERS[state.chapterIndex];
          const evt = resolveEvent(ch.events[state.eventIndex], state);
          applyChoice(evt.choices[i]);
          state.selectedChoice = null;
          advanceChapter();
        }), 350);
      }
      if (a==="restart") transition(()=> {
        state.phase="title"; state.origin=null; state.gender=null; state.region=null;
        state.youthIndex=0; state.chapterIndex=0; state.eventIndex=0; state.showChapterIntro=true;
        state.axes={regime:0,sovereignty:0,rule_of_law:0,equality:0,state_structure:0,religion:0,war:0,order:0};
        state.stats={wealth:0,prestige:0,safety:1,influence:0};
        state.tags=[]; state.selectedChoice=null;
      });
    });
  });
}
render();
