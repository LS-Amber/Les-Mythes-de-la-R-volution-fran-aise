/* ============================================================
   风暴中的一生 — 布兰特式人生叙事 RPG 重构版
   "不要让玩家先选择政治立场，
    而要让玩家先活过一段人生，
    政治立场是那段人生留下的沉淀。"
   ============================================================ */

/* ── 家庭背景（取代6种出身，收束为半固定主角 + 4种家庭气质）── */
const FAMILIES = [
  { id:"legal_rise", name:"法政上升之家", icon:"⚖️",
    desc:"父亲是地方法院的书记官，一生兢兢业业，相信法律能改变命运。母亲是小镇裁缝的女儿，沉默而坚韧。",
    effect:"意志+1 · 洞察+1 · 父亲亲近+3 · 家庭团结+2",
    childTraits:{will:1,insight:1}, resources:{wealth:1,prestige:1,familyUnity:2},
    relations:{ father:{closeness:3,trust:2}, mother:{closeness:2,trust:3}, elderBrother:{closeness:1,trust:1}, sister:{closeness:2,trust:2} },
    axes:{rule_of_law:5,regime:3,state_structure:3} },
  { id:"pious_poor", name:"虔信而贫困之家", icon:"✝️",
    desc:"父亲早逝或长年卧病，母亲靠教区施舍和替人浣衣维持家庭。叔叔是本堂神父，半个父亲。",
    effect:"信念+2 · 神父导师亲近+3 · 安全+1",
    childTraits:{will:0,insight:1}, resources:{wealth:-1,prestige:0,safety:1,familyUnity:1},
    relations:{ father:{closeness:0,trust:0}, mother:{closeness:3,trust:3}, elderBrother:{closeness:1,trust:0}, sister:{closeness:2,trust:2}, priestMentor:{closeness:3,trust:2} },
    axes:{religion:-8,state_structure:-5,regime:-3} },
  { id:"fading_notable", name:"地方名流衰落之家", icon:"🏛️",
    desc:"祖父曾是省议会的代表，但家道已中落。父亲撑着最后的体面，母亲暗暗典当首饰。长兄自认为继承人。",
    effect:"洞察+2 · 长兄亲近-1 · 声望+2 · 财富-1",
    childTraits:{will:0,insight:2}, resources:{wealth:-1,prestige:2,familyUnity:0},
    relations:{ father:{closeness:2,trust:1}, mother:{closeness:2,trust:2}, elderBrother:{closeness:-1,trust:-1}, sister:{closeness:2,trust:2} },
    axes:{regime:-3,order:3,equality:-3} },
  { id:"military_hope", name:"军功寄望之家", icon:"⚔️",
    desc:"父亲是退伍军士，因不是贵族永远无法晋升。他把全部希望寄托在你身上——'只有战场不问出身。'",
    effect:"意志+2 · 父亲信任+3 · 安全-1",
    childTraits:{will:2,insight:0}, resources:{wealth:0,prestige:1,safety:-1,familyUnity:1},
    relations:{ father:{closeness:2,trust:3}, mother:{closeness:2,trust:2}, elderBrother:{closeness:1,trust:1}, sister:{closeness:1,trust:1} },
    axes:{war:5,order:5,equality:3,state_structure:5} },
];

const REGIONS = [
  { id:"paris", name:"巴黎", desc:"革命中心。消息最快，机会与危险都最大。咖啡馆和小册子就是你的大学。", icon:"🗼",
    worldState:{urbanOrder:3,breadSupply:2,revolutionaryHeat:3,religiousFracture:1,conscriptionPressure:1},
    axes:{sovereignty:5,regime:5,state_structure:5} },
  { id:"west", name:"西部乡村", desc:"虔诚、保守、以教区为中心。巴黎的每一道命令都被视为异物。", icon:"✝️",
    worldState:{urbanOrder:1,breadSupply:2,revolutionaryHeat:0,religiousFracture:3,conscriptionPressure:2},
    axes:{religion:-10,state_structure:-10,regime:-5} },
  { id:"province", name:"省城", desc:"温和务实。地方法庭、商铺与教堂并存。你见过法官，也见过乞丐。", icon:"🏛️",
    worldState:{urbanOrder:2,breadSupply:3,revolutionaryHeat:1,religiousFracture:1,conscriptionPressure:1},
    axes:{order:3,rule_of_law:3} },
  { id:"port", name:"南部港口", desc:"商船、走私客、自由思想和异教徒。海风吹来的不只是盐味。", icon:"⚓",
    worldState:{urbanOrder:2,breadSupply:3,revolutionaryHeat:2,religiousFracture:0,conscriptionPressure:1},
    axes:{rule_of_law:5,sovereignty:-3,equality:-3} },
  { id:"border", name:"北部边境", desc:"要塞、驻军、征兵。国家的铁拳在这里触手可及。", icon:"🏔️",
    worldState:{urbanOrder:2,breadSupply:2,revolutionaryHeat:1,religiousFracture:0,conscriptionPressure:3},
    axes:{war:5,state_structure:5,order:5} },
];

/* ── 童年标记事件（角色创建第三步）── */
const CHILDHOOD_MEMORIES = [
  { id:"mother_bread", name:"母亲在厨房分食", icon:"🍞",
    desc:"饥荒那年，母亲把自己的份额分给了你和姐妹。你记住了她的手——骨瘦如柴，却始终在分。",
    childTraits:{will:1}, axes:{equality:5,sovereignty:3},
    relations:{mother:{closeness:2,trust:1}}, addFlags:["memory_hunger"] },
  { id:"father_court", name:"父亲在法庭受辱", icon:"📜",
    desc:"父亲在法庭上被一个贵族的管事当众喝斥。他立正站着，脸涨得通红，一句话也不敢说。你站在门口，指甲掐进掌心。",
    childTraits:{insight:1}, axes:{equality:8,rule_of_law:3},
    relations:{father:{closeness:1,trust:-1}}, addFlags:["memory_humiliation","father_humiliated"] },
  { id:"church_relief", name:"教堂的救济", icon:"⛪",
    desc:"冬天最冷的时候，是教堂给了你一碗热粥。神父摸着你的头说：'上帝不会忘记穷人。'你至今不知道该信他还是信你自己的眼睛。",
    childTraits:{insight:1}, axes:{religion:-5,state_structure:-3},
    relations:{priestMentor:{closeness:2,trust:1}}, addFlags:["memory_church"] },
  { id:"brother_scorn", name:"长兄的轻蔑", icon:"👤",
    desc:"你试图在晚餐桌上说点什么，长兄冷笑一声把你打断：'小孩子懂什么。'父亲低头喝汤，什么也没说。",
    childTraits:{will:1}, axes:{sovereignty:3,equality:3},
    relations:{elderBrother:{closeness:-2,trust:-1},father:{closeness:-1}}, addFlags:["memory_scorn"] },
  { id:"military_myth", name:"军功与体面的神话", icon:"🎖️",
    desc:"父亲擦拭勋章时会讲那些战役。在他的故事里，军队是世界上唯一公平的地方——'子弹不看你的姓氏。'",
    childTraits:{will:1}, axes:{war:5,order:3,equality:3},
    relations:{father:{closeness:2,trust:1}}, addFlags:["memory_military"] },
];

/* ============================================================
   条件系统（保留并增强）
   ============================================================ */
function matchWhen(when, st) {
  if (!when) return true;
  if (when.family && !when.family.includes(st.family?.id)) return false;
  if (when.region && !when.region.includes(st.region?.id)) return false;
  if (when.tagsAll && !when.tagsAll.every(t => st.tags.includes(t))) return false;
  if (when.tagsAny && !when.tagsAny.some(t => st.tags.includes(t))) return false;
  if (when.tagsNone && when.tagsNone.some(t => st.tags.includes(t))) return false;
  if (when.route && !when.route.includes(st.route)) return false;
  if (when.routeNot && when.routeNot.includes(st.route)) return false;
  if (when.flagsAll && !when.flagsAll.every(f => st.flags.includes(f))) return false;
  if (when.flagsAny && !when.flagsAny.some(f => st.flags.includes(f))) return false;
  if (when.flagsNone && when.flagsNone.some(f => st.flags.includes(f))) return false;
  if (when.axesMin) for (const [k,v] of Object.entries(when.axesMin)) if ((st.axes[k]||0) < v) return false;
  if (when.axesMax) for (const [k,v] of Object.entries(when.axesMax)) if ((st.axes[k]||0) > v) return false;
  if (when.relationMin) {
    for (const [person, reqs] of Object.entries(when.relationMin)) {
      const r = st.relations[person];
      if (!r) return false;
      if (reqs.closeness !== undefined && r.closeness < reqs.closeness) return false;
      if (reqs.trust !== undefined && r.trust < reqs.trust) return false;
    }
  }
  if (when.resourceMin) for (const [k,v] of Object.entries(when.resourceMin)) if ((st.resources[k]||0) < v) return false;
  if (when.worldMin) for (const [k,v] of Object.entries(when.worldMin)) if ((st.worldState[k]||0) < v) return false;
  if (when.skillMin) for (const [k,v] of Object.entries(when.skillMin)) if ((st.adultSkills[k]||0) < v) return false;
  return true;
}

function resolveEvent(event, st) {
  let resolved = { title:event.title, text:event.text, choices:event.choices };
  if (event.variants) {
    for (const v of event.variants) {
      if (matchWhen(v.when, st)) {
        resolved = { title:v.title||event.title, text:v.text||event.text, choices:v.choices||event.choices };
        break;
      }
    }
  }
  resolved.choices = resolved.choices.filter(c => matchWhen(c.when, st));
  return resolved;
}

function eventApplies(event, st) { return matchWhen(event.when, st); }

/* ============================================================
   第一部：童年事件 1769–1778
   ============================================================ */
const CHILDHOOD_EVENTS = [
  { id:"bad_harvest", title:"那个冬天，厨房里的最后一块面包",
    text:"你七岁那年，一场严重的歉收席卷了你的家乡。面包价格翻了两倍，母亲不得不减少每顿饭的份量。那个冬天的饥饿感，你至今记得。",
    variants:[
      { when:{family:["pious_poor"]},
        text:"你七岁那年，厨房里只剩一块发硬的黑面包。母亲把它掰成三份——你、姐妹、和她自己。她那一份后来悄悄塞回了你的碗里。你假装没看见。" },
      { when:{family:["fading_notable"]},
        text:"你七岁那年的冬天，家里依旧有热汤。但母亲开始减少仆人的口粮。有一天你看到老女仆在厨房角落偷偷啃面包皮——她看见你，吓得跪下来。" },
      { when:{region:["paris"]},
        text:"你七岁那年，面包店前排起了长队。母亲半夜去排，回来时手里只有半个黑面包。隔壁的木匠妻子什么也没买到——她后来病了，再也没好。" },
    ],
    choices:[
      { text:"把自己的份额让给姐妹", hint:"她比你更小，更需要。",
        childChange:{will:1}, axes:{equality:3,sovereignty:2},
        relationChange:{sister:{closeness:2,trust:1},mother:{closeness:1}},
        addFlags:["shared_bread"] },
      { text:"偷偷改掉账本上的份量数字", hint:"你不知道这算不算偷。但你学会了用笔改变现实。",
        childChange:{insight:2}, axes:{sovereignty:3},
        addFlags:["falsified_ledger"],
        riskText:"父亲可能发现你篡改了账本。" },
      { text:"请求神父继续施粥", hint:"教堂的门总是开着的——至少现在是。",
        childChange:{insight:1}, axes:{religion:-5,state_structure:-3},
        relationChange:{priestMentor:{closeness:2,trust:1}},
        addFlags:["sought_church_help"] },
      { text:"逼父亲去见领主或官员", hint:"你第一次对父亲大喊。",
        childChange:{will:2}, axes:{equality:3,regime:2},
        relationChange:{father:{closeness:-1,trust:1}},
        addFlags:["confronted_father"] },
    ]},

  { id:"family_dinner_silence", title:"晚餐桌上的沉默",
    text:"一个秋天的傍晚，全家围坐吃饭。长兄说起镇上领主家的少爷买了新马车。父亲放下了汤匙。空气突然变得很紧。",
    variants:[
      { when:{family:["legal_rise"]},
        text:"长兄说：'人家的儿子什么都不用做就有马车。'父亲冷冷说：'所以你要好好读书。法律是我们的马车。'长兄摔了筷子走开了。" },
      { when:{family:["military_hope"]},
        text:"长兄说：'那个少爷十八岁就当了少尉。'父亲沉默很久，说：'他生来就是少尉。你得用命换。'母亲低头，不敢看任何人。" },
      { when:{family:["fading_notable"]},
        text:"长兄说：'以前那马车该是我们家的。'父亲没有说话。母亲轻声说：'吃饭吧。'那天晚上你听到父母在卧室里争吵。" },
    ],
    choices:[
      { text:"低头吃饭，假装什么也没听到", hint:"沉默是你学到的第一课。",
        childChange:{insight:1}, axes:{order:2},
        addFlags:["learned_silence"] },
      { text:"试图替父亲说话——'我们不比他们差'", hint:"你不知道这是安慰还是谎言。",
        childChange:{will:1}, axes:{equality:3},
        relationChange:{father:{trust:1}},
        addFlags:["defended_family"] },
      { text:"追出去找长兄", hint:"他坐在门外的石阶上。",
        childChange:{insight:1},
        relationChange:{elderBrother:{closeness:1}},
        addFlags:["followed_brother"] },
      { text:"问母亲：'我们家怎么了？'", hint:"她的眼圈红了。",
        childChange:{insight:1},
        relationChange:{mother:{closeness:1,trust:1}},
        addFlags:["asked_mother"] },
    ]},

  { id:"church_ceremony", title:"第一次领圣体",
    text:"你九岁时第一次领圣体。教堂里燃着蜡烛，神父在你额头画十字。你感到一种从未有过的庄严——或者只是害怕。",
    variants:[
      { when:{family:["pious_poor"]},
        text:"叔叔亲自为你主持仪式。他的手很稳，声音很温柔。母亲在后排哭了。你低头看着圣体饼，想：'如果上帝存在，为什么我们这么穷？'" },
      { when:{flagsAny:["memory_church"]},
        text:"还记得冬天那碗热粥吗？今天你终于走进了施粥的那扇门后面。圣坛上的金色十字架在烛光里发光。你感到敬畏——也感到困惑。" },
    ],
    choices:[
      { text:"你相信了。在那一刻，你真的感到了上帝的存在", hint:"信仰成为你内心的锚。",
        childChange:{will:1}, axes:{religion:-8,order:3},
        relationChange:{priestMentor:{closeness:1,trust:1}},
        addFlags:["true_believer"] },
      { text:"你很害怕。但你学会了在仪式中保持得体", hint:"宗教是秩序，不一定是信仰。",
        childChange:{insight:1}, axes:{order:3},
        addFlags:["ritual_conformist"] },
      { text:"你在心里默默问：'如果上帝存在，为什么……'", hint:"你没敢把这个问题问出声。",
        childChange:{insight:2}, axes:{religion:3,sovereignty:2},
        addFlags:["questioned_god"] },
      { text:"你想着别的事——窗外的阳光，或者晚饭吃什么", hint:"你只是个孩子。",
        childChange:{}, axes:{},
        addFlags:["indifferent_ceremony"] },
    ]},
];

/* ============================================================
   第二部：少年事件 1779–1788
   ============================================================ */
const YOUTH_EVENTS = [
  { id:"mentor_choice", title:"一位重要的人",
    text:"在你十三到十六岁之间，有一个人对你的影响超过了家庭。他不一定比父亲更亲近，但他在你心中种下了一颗种子。",
    choices:[
      { text:"教区的老神父——他教你拉丁文，也教你谦卑与忍耐", hint:"他说：'世界的苦难是上帝的考验，不是反叛的理由。'",
        youthChange:{conviction:2}, axes:{religion:-8,order:3},
        relationChange:{priestMentor:{closeness:3,trust:2}},
        addFlags:["mentor_priest"], routeHint:"faith" },
      { text:"一位自由派律师——他偷偷借你读伏尔泰和孟德斯鸠", hint:"他说：'法律是文明对抗暴力的唯一武器。'",
        youthChange:{honor:1,conviction:1}, axes:{rule_of_law:8,regime:3},
        relationChange:{lawyerMentor:{closeness:3,trust:2}},
        addFlags:["mentor_lawyer"], routeHint:"legal" },
      { text:"一位退伍老兵——他教你骑马、射击，和不相信特权", hint:"他说：'战场上没有贵族。只有活人和死人。'",
        youthChange:{honor:2}, axes:{war:5,order:5,equality:3},
        relationChange:{comrade:{closeness:2,trust:1}},
        addFlags:["mentor_soldier"], routeHint:"legal" },
      { text:"一位激进的印刷工——他的地下印刷所里藏着禁书", hint:"他说：'笔能做到剑做不到的事。'",
        youthChange:{cunning:1,conviction:1}, axes:{sovereignty:8,regime:5,equality:5},
        relationChange:{comrade:{closeness:3,trust:2}},
        addFlags:["mentor_radical"], routeHint:"club" },
    ]},

  { id:"lord_conflict", title:"父亲与权力的碰撞",
    text:"你十六岁那年，一件事让你第一次真正理解了'特权'这个词不是书上的概念，而是一只踩在你头上的脚。",
    variants:[
      { when:{family:["legal_rise"]},
        title:"父亲在法庭上输掉的案子",
        text:"父亲为一户佃农打官司告领主滥征。判决下来那天，他回家把假发扔在桌上。'法律？'他冷笑，'法律是给没有特权的人准备的。'你从没见他这样。" },
      { when:{family:["military_hope"]},
        title:"父亲被上司羞辱",
        text:"新来的少尉——一个十八岁的子爵——当众斥责你父亲。父亲立正敬礼。回家后喝了一整夜的酒。第二天清晨他像什么都没发生一样出了门。" },
      { when:{family:["fading_notable"]},
        title:"邻居领主的侵占",
        text:"大领主侵占了你家几块林地。父亲想打官司，被亲戚劝阻：'对方在凡尔赛有人。'你第一次明白：同是体面人家，也分三六九等。" },
      { when:{family:["pious_poor"]},
        title:"教区与领主的边界",
        text:"领主要征收教区一片葡萄园的税。叔叔去和领主交涉，回来时嘴角破了。他只说了一句：'我们让步了。为了和睦。'" },
    ],
    choices:[
      { text:"你暗暗发誓：总有一天，法律会比血统更重要", hint:"你开始相信制度可以被改变。",
        youthChange:{honor:1,conviction:1}, axes:{rule_of_law:8,equality:5},
        addFlags:["vow_legal_reform","seek_lawful_rise"] },
      { text:"你开始怀恨——这个世界的秩序本身就是不公正的", hint:"种子在愤怒中发芽。",
        youthChange:{conviction:2}, axes:{equality:10,regime:5,sovereignty:5},
        addFlags:["vow_against_privilege"] },
      { text:"你学到了父亲的那种隐忍——也许这就是活下去的方式", hint:"你学会了低头。",
        youthChange:{cunning:2}, axes:{order:3},
        addFlags:["learned_endurance"] },
      { text:"你不再相信请愿——只有力量才能改变力量", hint:"温和从你的词典里消失了。",
        youthChange:{honor:1}, axes:{sovereignty:8,war:3},
        addFlags:["prefers_force"] },
    ]},

  { id:"first_love_or_bond", title:"一个不属于你家庭的人",
    text:"十七岁的夏天，你认识了一个人。这段关系——无论它叫什么名字——第一次让你意识到，你不只是某个家庭的儿女。你也是你自己。",
    variants:[
      { when:{flagsAny:["mentor_radical"]},
        text:"她是印刷工的侄女。你们一起偷看禁书，一起在阁楼上争论到深夜。她比你激进，比你勇敢，也比你更容易受伤。" },
      { when:{flagsAny:["mentor_priest"]},
        text:"他是隔壁教区一个年轻修士。你们在拉丁文课后散步，讨论奥古斯丁和卢梭。你不确定这算友情还是别的什么。" },
    ],
    choices:[
      { text:"你向这个人敞开了心扉——这是你第一次对家人以外的人诚实", hint:"一段真实的纽带。",
        youthChange:{conviction:1}, axes:{sovereignty:3},
        relationChange:{lover:{closeness:3,trust:2}},
        addFlags:["opened_heart"] },
      { text:"你保持了距离——不是不在乎，而是害怕失去", hint:"你学会了保护自己。",
        youthChange:{cunning:1}, axes:{order:2},
        relationChange:{lover:{closeness:1,trust:1}},
        addFlags:["kept_distance"] },
      { text:"你和这个人一起做了一件冒险的事——私下传阅禁书/参加地下聚会", hint:"共同的秘密是最牢固的纽带。",
        youthChange:{cunning:1,conviction:1}, axes:{sovereignty:5,regime:3},
        relationChange:{lover:{closeness:2,trust:3}},
        addFlags:["shared_secret"] },
      { text:"这段关系很快结束了——家庭的压力比你们都大", hint:"你明白了：在这个世界，私人的东西也是政治的。",
        youthChange:{insight:1}, axes:{equality:3},
        relationChange:{lover:{closeness:-1}},
        addFlags:["bond_broken_by_family"] },
    ]},

  { id:"humiliation", title:"一次羞辱",
    text:"十七岁那年，你因为自己的身份——无论它意味着什么——被人当众嘲笑。那种灼热的耻辱感，直到多年后你仍能在梦中感受到。",
    variants:[
      { when:{family:["pious_poor"]},
        text:"你陪母亲去缴税。税务官当着所有人的面指着你母亲的围裙说：'下次洗干净再来。'你站在一旁，什么也做不了。" },
      { when:{family:["fading_notable"]},
        text:"在一次地方社交场合，一位真正的大贵族当众模仿你家的口音。'哦，你们也算贵族？'满座哄笑。你父亲低头微笑。" },
      { when:{family:["legal_rise"]},
        text:"你在一场宴会上被一位侯爵打断：'书记官的儿子？哦，替人写字的那种。'你花了十年背的拉丁文，在那一刻变得一文不值。" },
      { when:{family:["military_hope"]},
        text:"新来的贵族军官看了一眼你父亲的勋章，笑着说：'军士的勋章？挂在胸前像个装饰品。'你父亲的手在发抖。" },
    ],
    choices:[
      { text:"你暗暗发誓：总有一天，能力会比血统更重要", hint:"从耻辱中生出的是向上的决心。",
        youthChange:{honor:2}, axes:{equality:8,order:3},
        addFlags:["meritocracy_vow"] },
      { text:"你开始怀疑一切等级秩序——它们全是谎言", hint:"愤怒开始渗透到你看待世界的方式。",
        youthChange:{conviction:2}, axes:{equality:10,sovereignty:5},
        addFlags:["egalitarian_rage"] },
      { text:"你学会了隐忍和伪装——表面顺从，内心记账", hint:"你变得更难被看透。",
        youthChange:{cunning:2}, axes:{order:3,rule_of_law:-2},
        addFlags:["pragmatic_mask"] },
      { text:"你的愤怒变成冰冷的决心——这个世界必须被彻底改造", hint:"这不是一个可以修补的世界。",
        youthChange:{conviction:1,honor:1}, axes:{regime:8,equality:8,sovereignty:5},
        addFlags:["revolutionary_seed"] },
    ]},

  { id:"eve_of_revolution", title:"1788：离家前夜",
    text:"三级会议即将召开的消息传遍全国。你即将满十九岁。空气中弥漫着不安与期待。今晚是你最后一次和全家坐在同一张桌前。",
    variants:[
      { when:{flagsAny:["father_humiliated","confronted_father"]},
        text:"父亲比平时沉默。你知道他在想什么——那些年的屈辱，那些输掉的案子，那些咽下去的话。他看着你，好像在看一个即将替他去战场的人。" },
      { when:{family:["pious_poor"]},
        text:"叔叔在教堂里为你祈祷了很久。母亲把她最好的一件衣服改小了给你。姐妹站在门口，手里攥着一封信——'到了巴黎也别忘了写信回来。'" },
    ],
    choices:[
      { text:"答应父亲：走法律和行政的道路，用制度改变命运", hint:"你带走了他的期望。这是你的行囊中最重的东西。",
        youthChange:{honor:1}, axes:{rule_of_law:5,state_structure:3},
        relationChange:{father:{trust:2}},
        addFlags:["promise_father_law"], routeSet:"legal" },
      { text:"对母亲承诺：不会背弃信仰，不会忘记家", hint:"她把十字架挂在你脖子上。你没有拒绝。",
        youthChange:{conviction:1}, axes:{religion:-5,order:3},
        relationChange:{mother:{closeness:2,trust:2}},
        addFlags:["promise_mother_faith"], routeSet:"faith" },
      { text:"与印刷工/俱乐部的朋友们约定：到了巴黎，一切才真正开始", hint:"你的行囊里有一叠手抄的小册子。",
        youthChange:{cunning:1}, axes:{sovereignty:5,regime:5},
        relationChange:{comrade:{closeness:2,trust:2}},
        addFlags:["promise_comrades"], routeSet:"club" },
      { text:"谁也没有告别。天不亮你就走了", hint:"你偷拿了家里的银勺。你不知道这算自由还是背叛。",
        youthChange:{cunning:2}, axes:{sovereignty:5},
        resourceChange:{wealth:1},
        relationChange:{father:{trust:-2},mother:{closeness:-1}},
        addFlags:["left_silently","stole_silver"] },
    ]},
];

/* ============================================================
   革命章节（重写为"你在什么位置上看见革命"）
   ============================================================ */
const CHAPTERS = [
  { id:"ch1", title:"第一章：裂开的王国", year:"1789",
    intro:"你二十岁了。三级会议在凡尔赛召开，国民议会宣告成立。七月十四日，巴黎群众攻占了巴士底狱。\n\n你站在这场风暴的入口处。你从何处看见它，取决于你是谁。",
    events:[
      { id:"e1", title:"请愿书",
        text:"社区集会上正在起草陈情书。争吵声此起彼伏。有人拉住你的衣袖：'你来说几句吧。'",
        variants:[
          { when:{route:["legal"]},
            title:"法庭书记官的草稿",
            text:"你被推举起草陈情书——因为你是这里唯一读过法律文本的人。一个老农拍着你的肩膀：'写得让凡尔赛听见。'但另一个声音说：'别写太过头。'" },
          { when:{route:["faith"]},
            title:"教堂门口的村民会议",
            text:"村民们聚在教堂前。神父也在场。大家既想减税，又害怕巴黎的'新东西'。一个老农低声说：'别写得太过头，国王是好的，是大臣坏。'" },
          { when:{route:["club"]},
            title:"俱乐部的彻夜辩论",
            text:"你在俱乐部的木板桌上写陈情草稿。烛火摇曳，争吵声从黄昏持续到天明。一个码头工人拍着桌子说：'写就要写得让所有人都不敢再装睡！'" },
        ],
        choices:[
          { text:"'恳请恢复旧日权利和习惯——国王陛下一定会听到我们的声音'",
            axes:{regime:-8,sovereignty:-5,order:3},
            addFlags:["petition_tradition"],
            skillChange:{eloquence:1} },
          { text:"'减轻税负，废除封建压迫！——但要有序地进行'",
            axes:{equality:5,regime:3,rule_of_law:5},
            addFlags:["petition_reform"],
            skillChange:{eloquence:1,organization:1} },
          { text:"'我们需要宪法、统一的法律和真正的代表制'",
            axes:{rule_of_law:8,regime:5,state_structure:5},
            addFlags:["petition_constitution"],
            skillChange:{eloquence:1,learning:1} },
          { text:"'光写请愿书有什么用？我们需要行动！'",
            axes:{sovereignty:10,regime:8,equality:5},
            addFlags:["petition_radical"],
            skillChange:{valor:1} },
        ]},

      { id:"e2", title:"巴士底狱的消息",
        text:"七月的一天，消息像野火一样传来：巴黎群众攻占了巴士底狱！",
        variants:[
          { when:{region:["paris"]},
            text:"你就在巴黎。烟从圣安托万方向升起。街上的人或哭或笑或奔跑。你闻到了火药味和某种从未有过的兴奋。一个陌生人塞给你一把生锈的剑。" },
          { when:{route:["faith"],region:["west"]},
            text:"消息传到村里时，神父在教堂里画十字。他低声说：'主啊，保佑法兰西。'你看不出他是在祈祷还是在害怕。也许都是。" },
          { when:{family:["military_hope"]},
            text:"消息传来那天，父亲正在擦拭他的旧佩刀。他听完后久久没说话，然后只说了一句：'国王在干什么？'" },
        ],
        choices:[
          { text:"你心里咯噔一下——这不是改革，这是混乱",
            axes:{regime:-5,order:8,sovereignty:-5},
            addFlags:["fear_mob"],
            resourceChange:{safety:1} },
          { text:"你能理解人民的愤怒，但你祈祷这是最后一次暴力",
            axes:{regime:3,rule_of_law:5,order:3},
            addFlags:["cautious_sympathy"],
            skillChange:{learning:1} },
          { text:"你激动得说不出话——压了多少代的东西终于爆开了",
            axes:{sovereignty:8,regime:8,equality:5},
            addFlags:["revolutionary_joy"],
            worldChange:{revolutionaryHeat:2} },
          { text:"这只是开始。旧世界不会只倒一堵墙",
            axes:{sovereignty:12,regime:10,equality:8},
            addFlags:["total_revolution"],
            worldChange:{revolutionaryHeat:3} },
        ]},
    ]},

  { id:"ch2", title:"第二章：信仰的裂痕", year:"1790–1791",
    intro:"革命已经一年了。教士被要求宣誓效忠新宪法，教会被重新划分。宪法正在起草，俱乐部如雨后春笋。但国王始终是一个谜。",
    events:[
      { id:"e3", title:"宣誓——你的选择",
        text:"当地的老神父被要求向新的国家体制宣誓效忠。他面色灰白，手中攥着十字架。",
        variants:[
          { when:{route:["faith"]},
            title:"你自己人的选择",
            text:"被要求宣誓的正是你熟悉的那位神父——也许是你的叔叔，也许是你的导师。他把你叫到一旁问：'你说，我该怎么办？'你看见了他眼里的恐惧，和倔强。" },
          { when:{route:["legal"]},
            text:"作为法政系统的边缘人，你被要求协助执行宣誓登记。这是你的职责——但坐在你对面的那个老人，教过你认字。" },
          { when:{flagsAny:["mentor_radical","total_revolution"]},
            text:"你的朋友们说教会是旧制度最顽固的堡垒。你也这么觉得——大部分时候。但你想起小时候那碗热粥。" },
        ],
        choices:[
          { text:"支持神父拒绝宣誓——信仰不应被国家的手染指",
            axes:{religion:-10,regime:-5,state_structure:-5},
            relationChange:{priestMentor:{closeness:2,trust:2}},
            addFlags:["support_refractory"],
            worldChange:{religiousFracture:2},
            resourceChange:{safety:-1} },
          { text:"试图劝和——也许可以找到信仰和国家都能接受的方式",
            axes:{rule_of_law:3,order:3,religion:-2},
            addFlags:["religious_compromise"],
            skillChange:{eloquence:1} },
          { text:"支持宣誓——国家需要统一，教会必须服从公民秩序",
            axes:{religion:8,state_structure:8,regime:5},
            addFlags:["support_oath"],
            relationChange:{priestMentor:{closeness:-2,trust:-2}},
            worldChange:{religiousFracture:1} },
          { text:"教会的公共权威早该被打破了——这只是第一步",
            axes:{religion:12,state_structure:10,sovereignty:3},
            addFlags:["anti_church"],
            relationChange:{priestMentor:{closeness:-3,trust:-3}},
            worldChange:{religiousFracture:3} },
        ]},

      { id:"e4", title:"国王出逃",
        text:"1791年6月的清晨，整个法国被一个消息震醒：国王一家试图秘密逃离巴黎！他们在瓦雷纳被拦截。",
        choices:[
          { text:"君主制也许仍可挽救——但必须更严格地约束他",
            axes:{regime:-5,rule_of_law:5,order:5},
            addFlags:["keep_king_strict"] },
          { text:"我曾相信国王。现在不了",
            axes:{regime:8,sovereignty:5},
            addFlags:["doubt_monarchy"] },
          { text:"共和！法国不再需要国王！",
            axes:{regime:12,sovereignty:10,equality:5},
            addFlags:["republic_now"],
            worldChange:{revolutionaryHeat:2} },
          { text:"你心如刀绞——无论如何，出逃者不能再信任",
            when:{flagsAny:["true_believer","support_refractory"]},
            axes:{regime:3,order:5},
            addFlags:["heartbroken_royalist"] },
        ]},
    ]},

  /* ── 路线专属插入章 ── */
  { id:"ch_route_legal", title:"插曲：法庭上的选择", year:"1790",
    when:{route:["legal"]},
    intro:"你在地方法院工作已经数月。新法律一道接一道地传来。旧法官和新法官在走廊里彼此侧目。",
    events:[
      { id:"route_legal_1", title:"旧法官的请求",
        text:"一位旧制度的老法官私下找到你。他递给你一叠文件——那是他暗中保存的旧时判例。'新法律好是好，'他说，'但有些案子，新法管不到。帮我把这些留下来。'",
        choices:[
          { text:"保存文件——法律的连续性比革命的纯粹更重要",
            axes:{rule_of_law:8,regime:-3,order:5},
            skillChange:{learning:2},
            addFlags:["preserved_old_law"],
            relationChange:{lawyerMentor:{trust:1}} },
          { text:"上交给革命委员会——旧法就是旧弊",
            axes:{regime:5,rule_of_law:-3,sovereignty:5},
            addFlags:["reported_old_judge"],
            resourceChange:{prestige:1,safety:1} },
          { text:"两边都不告诉——把文件藏起来，以后再说",
            axes:{order:3},
            skillChange:{manipulation:1},
            addFlags:["hid_documents"] },
        ]},
    ]},

  { id:"ch_route_faith", title:"插曲：地下弥撒", year:"1791",
    when:{route:["faith"]},
    intro:"宣誓法令撕裂了教会。在你的地区，拒绝宣誓的神父被迫转入地下。教徒们在谷仓和地窖里秘密做弥撒。",
    events:[
      { id:"route_faith_1", title:"谁来保护他们？",
        text:"一位你认识的老神父正在被搜捕。他躲在一个农妇家的阁楼里。有人来问你：'你愿意帮忙转移他吗？'",
        choices:[
          { text:"帮忙——他是无辜的，信仰不是罪",
            axes:{religion:-8,sovereignty:-5,rule_of_law:3},
            skillChange:{valor:1,organization:1},
            relationChange:{priestMentor:{closeness:2,trust:3}},
            addFlags:["hid_priest"],
            resourceChange:{safety:-2} },
          { text:"拒绝——你不想卷入。你可以为他祈祷，但不能替他冒险",
            axes:{order:3},
            addFlags:["refused_to_hide_priest"],
            resourceChange:{safety:1} },
          { text:"告诉他必须宣誓或离开——这是唯一安全的路",
            axes:{religion:3,state_structure:5,order:5},
            addFlags:["urged_priest_comply"],
            relationChange:{priestMentor:{trust:-2}} },
        ]},
    ]},

  { id:"ch_route_club", title:"插曲：印刷所的夜晚", year:"1790",
    when:{route:["club"]},
    intro:"你加入的俱乐部越来越活跃。印刷机昼夜不停。你的名字开始出现在小册子的署名里——有时是真名，有时是化名。",
    events:[
      { id:"route_club_1", title:"小册子",
        text:"你写了一篇攻击本地富商囤积粮食的文章。朋友兴奋地说可以印两千份。但你知道那个富商的女儿是你认识的人。",
        choices:[
          { text:"印——真相比私情重要",
            axes:{sovereignty:8,equality:8,regime:5},
            skillChange:{eloquence:2},
            addFlags:["published_pamphlet"],
            worldChange:{revolutionaryHeat:1},
            resourceChange:{prestige:1,safety:-1} },
          { text:"改一改——不用真名，也不指名道姓",
            axes:{sovereignty:5,equality:3},
            skillChange:{eloquence:1,manipulation:1},
            addFlags:["cautious_pamphlet"] },
          { text:"不印了——你不想因为一篇文章毁掉一个人的生活",
            axes:{order:3,rule_of_law:3},
            addFlags:["suppressed_pamphlet"],
            relationChange:{comrade:{trust:-1}} },
        ]},
    ]},

  { id:"ch3", title:"第三章：共和国与战争", year:"1792",
    intro:"战争来了。八月十日，巴黎群众冲入杜伊勒里宫。九月，监狱屠杀。共和国宣告成立。\n\n一切都加速了。你是否准备好了？没有人准备好了。",
    events:[
      { id:"e5", title:"征兵令",
        text:"'祖国在危难中！'——这句话无处不在。征兵令到了你家的门口。",
        variants:[
          { when:{flagsAny:["mentor_soldier","memory_military"]},
            text:"父亲把他的旧佩刀递给你。他的眼睛是干的，但手在抖。'去吧，'他说，'回来的时候，带着军官的肩章。'" },
          { when:{route:["faith"],region:["west"]},
            text:"村里的年轻人开始逃进树林。征兵官带着宪兵来了。神父说：'服从凯撒的，归凯撒。'但你知道他心里在想什么。" },
        ],
        choices:[
          { text:"亲自报名参军——无论为了什么理由，这是你的战场",
            axes:{war:10,order:5,state_structure:5},
            skillChange:{valor:2},
            addFlags:["enlisted"],
            resourceChange:{safety:-2,prestige:1},
            worldChange:{conscriptionPressure:-1} },
          { text:"支持战争，但留在后方组织后勤和宣传",
            axes:{war:5,sovereignty:5,state_structure:5},
            skillChange:{organization:2},
            addFlags:["home_front"],
            resourceChange:{prestige:1} },
          { text:"你反对这场战争——这是权贵们的游戏，死的是穷人的孩子",
            axes:{war:-8,sovereignty:3,equality:5},
            addFlags:["anti_war"],
            resourceChange:{safety:-1} },
          { text:"帮一个朋友逃脱征兵",
            when:{flagsNone:["prefers_force"]},
            axes:{rule_of_law:3,order:-3,sovereignty:-3},
            skillChange:{cunning:1},
            addFlags:["helped_deserter"],
            resourceChange:{safety:-1},
            relationChange:{comrade:{closeness:2}} },
        ]},

      { id:"e6", title:"国王的命运",
        text:"路易十六被关押在圣殿塔中。整个法国在争论：'公民卡佩'是否有罪？该如何处置他？\n\n这不再是一个抽象的政治问题。你知道你的回答会决定很多人的命运——包括你自己的。",
        choices:[
          { text:"保住他的生命——杀一个国王会让整个欧洲与我们为敌",
            axes:{regime:-5,rule_of_law:5,war:-5,order:5},
            addFlags:["spare_king"],
            resourceChange:{safety:-1} },
          { text:"公正审判，严格程序——然后接受判决，无论它是什么",
            axes:{rule_of_law:10,regime:5},
            addFlags:["trial_king"],
            skillChange:{learning:1} },
          { text:"他必须死——这是革命不可回头的证明",
            axes:{regime:12,sovereignty:10,equality:5},
            addFlags:["execute_king"],
            worldChange:{revolutionaryHeat:3} },
          { text:"不只是他——整个王权的象征都必须被摧毁",
            axes:{regime:15,sovereignty:12,equality:8,religion:5},
            addFlags:["destroy_monarchy"],
            worldChange:{revolutionaryHeat:4} },
        ]},
    ]},

  { id:"ch4", title:"第四章：恐怖时代", year:"1793–1794",
    intro:"国王被送上断头台。内战与对外战争同时爆发。公安委员会掌握了近乎无限的权力。\n\n你已经不再是1789年的那个人了。但你还是你吗？",
    events:[
      { id:"e7", title:"面包与限价",
        text:"市场上的妇女们围堵商铺，要求平价供应。你的邻居因为'囤积'被抓走了。",
        variants:[
          { when:{region:["paris"]},
            text:"你亲眼看见邻居被押走。他妻子追出来尖叫。他只是一个面包店主——库房里确实还有一些面粉。这算'囤积'吗？" },
          { when:{family:["legal_rise"]},
            text:"你知道限价法在法律上站不住脚。但你也知道：街上的孩子在饿。法律的尊严和饥饿的肚子之间，有多远的距离？" },
        ],
        choices:[
          { text:"反对限价——市场自有规律，强制干预只会更糟",
            axes:{equality:-8,rule_of_law:5},
            addFlags:["free_market"],
            resourceChange:{safety:-1} },
          { text:"有限救济就好——紧急时期需要临时措施，但不能常态化",
            axes:{equality:3,rule_of_law:5,order:3},
            addFlags:["limited_relief"],
            skillChange:{organization:1} },
          { text:"限价是必要的——让穷人活下去比法律的纯粹更重要",
            axes:{equality:8,state_structure:5,sovereignty:5},
            addFlags:["support_price_control"],
            worldChange:{breadSupply:1} },
          { text:"强力限价！严惩囤积者！——这是人民的正义",
            axes:{equality:12,state_structure:8,sovereignty:8,rule_of_law:-8},
            addFlags:["max_price_control"],
            worldChange:{breadSupply:2,urbanOrder:-1} },
        ]},

      { id:"e8", title:"嫌疑人法",
        text:"任何'缺乏公民热情'的人都可以被逮捕。这条法律的边界在哪里？没有人知道——也许这就是它的目的。",
        choices:[
          { text:"这违背了人权宣言——我们不能用我们反对的方法来保卫革命",
            axes:{rule_of_law:10,sovereignty:-5},
            addFlags:["oppose_terror"],
            resourceChange:{safety:-2} },
          { text:"作为短期紧急措施……也许可以接受。但必须有期限",
            axes:{rule_of_law:3,state_structure:3,order:3},
            addFlags:["reluctant_terror"] },
          { text:"战时需要战时手段。敌人不会等你讲完程序正义",
            axes:{rule_of_law:-5,state_structure:8,sovereignty:5,order:5},
            addFlags:["accept_terror"],
            skillChange:{organization:1} },
          { text:"对敌人不能心慈手软——同情心是革命的毒药",
            axes:{rule_of_law:-12,state_structure:10,sovereignty:8,equality:5},
            addFlags:["embrace_terror"],
            worldChange:{revolutionaryHeat:2,urbanOrder:-2} },
        ]},

      { id:"e9", title:"老朋友被检举",
        text:"一个你从小认识的人被检举'立场不纯'。有人悄悄来问你是否愿意为他作证。\n\n你知道这意味着什么——如果你站出来，你自己也会变成嫌疑人。",
        variants:[
          { when:{flagsAny:["mentor_lawyer","oppose_terror"]},
            text:"你想起他小时候帮你抄写法律笔记。如今他被控'与吉伦特派通信'——而你知道这是诬告。但你也知道：在这个时代，事实不重要，立场才重要。" },
          { when:{flagsAny:["embrace_terror","total_revolution"]},
            text:"以你现在的立场，本可以毫不犹豫地撇清。但他毕竟救过你母亲一命。你的理念和记忆在打架。" },
        ],
        choices:[
          { text:"冒险为他作证——你还没有变成那种人",
            axes:{rule_of_law:8,order:-5,sovereignty:-3},
            addFlags:["defended_friend"],
            skillChange:{valor:1,eloquence:1},
            resourceChange:{safety:-3},
            relationChange:{comrade:{trust:2}} },
          { text:"保持沉默——你没有能力救他，但至少不害他",
            axes:{order:3},
            addFlags:["silence_friend"],
            resourceChange:{resolve:-1} },
          { text:"配合审查——自保不是犯罪。活下去才能做更多",
            axes:{order:5,rule_of_law:-5},
            addFlags:["cooperate_purge"],
            resourceChange:{safety:2},
            skillChange:{manipulation:1} },
          { text:"主动揭发他——你必须证明自己的立场足够坚定",
            axes:{rule_of_law:-10,sovereignty:5,state_structure:5},
            addFlags:["denounce_friend"],
            resourceChange:{safety:3,prestige:1,resolve:-2} },
        ]},
    ]},

  { id:"ch5", title:"第五章：热月之后", year:"1794",
    intro:"罗伯斯庇尔倒台了。恐怖结束了——至少官方是这么说的。但新的报复开始了。\n\n你活过了最黑暗的日子。你发现自己还活着。你不确定这算不算幸运。",
    events:[
      { id:"e10", title:"热月的意义",
        text:"过去两年的一切像一场噩梦。你回头看自己做过的事、签过的字、说过的话、沉默过的时刻。",
        choices:[
          { text:"革命被背叛了——热月派不过是换了一批投机者",
            axes:{sovereignty:8,equality:8,rule_of_law:-3},
            addFlags:["thermidor_betrayal"] },
          { text:"这是必要的刹车——再走下去，革命会吃掉自己所有的孩子",
            axes:{regime:3,rule_of_law:5,order:5},
            addFlags:["thermidor_necessary"] },
          { text:"终于可以重建法治了——恐怖时期是一个可怕的错误",
            axes:{rule_of_law:10,order:8,sovereignty:-5},
            addFlags:["thermidor_relief"] },
          { text:"你已经不知道该相信什么了",
            axes:{order:-3,sovereignty:-3},
            addFlags:["thermidor_numb"],
            resourceChange:{resolve:-2} },
        ]},

      { id:"e11", title:"街头的报复",
        text:"一个昔日的雅各宾派成员被一群人围住殴打。他跪在地上，鼻血和泥混在一起。你认出了他——他不是坏人，只是太相信那些话了。",
        choices:[
          { text:"冲上去保护他——不管他是谁，私刑就是私刑",
            axes:{rule_of_law:8,equality:3},
            skillChange:{valor:1},
            addFlags:["protect_jacobin"],
            resourceChange:{safety:-1} },
          { text:"大声呼吁停止——'我们不是要结束暴力吗？'",
            axes:{rule_of_law:5,order:5},
            skillChange:{eloquence:1},
            addFlags:["stop_revenge"] },
          { text:"默默走开——你已经没有力气管别人了",
            axes:{order:3},
            addFlags:["allow_reaction"],
            resourceChange:{resolve:-1} },
          { text:"他活该——让他尝尝他曾让别人尝过的滋味",
            axes:{order:8,sovereignty:-5,equality:-5},
            addFlags:["support_reaction"],
            worldChange:{urbanOrder:-1} },
        ]},
    ]},

  { id:"ch6", title:"第六章：疲惫的共和国", year:"1795–1799",
    intro:"共和国仍在——但它越来越依赖精英、行政和军队。你三十岁了。革命过去六年了。\n\n你还认得出镜子里的自己吗？",
    events:[
      { id:"e12", title:"选举被操控",
        text:"当局准备作废部分选举结果。理由是'保卫共和国'。你在法庭/俱乐部/教区里听到了这个消息。",
        choices:[
          { text:"坚持选举程序——如果选举可以被作废，共和国还剩下什么？",
            axes:{rule_of_law:12,sovereignty:5,order:-5},
            addFlags:["defend_election"],
            resourceChange:{safety:-1} },
          { text:"勉强接受——也许暂时的妥协好过全面内战",
            axes:{rule_of_law:3,order:5},
            addFlags:["accept_intervention"],
            skillChange:{manipulation:1} },
          { text:"共和国必须先活下去——民主可以以后再完善",
            axes:{order:10,rule_of_law:-5,state_structure:8},
            addFlags:["republic_over_democracy"] },
          { text:"也许我们需要一个更强的手来稳住局面",
            axes:{order:12,state_structure:10,sovereignty:-8,rule_of_law:-8},
            addFlags:["authoritarian_turn"] },
        ]},

      { id:"e13", title:"你的位置",
        text:"你三十岁了。你需要为自己和你在乎的人找到一个位置。理想是一回事，活下去是另一回事。",
        choices:[
          { text:"进入地方行政系统——用制度为这个国家做些实事",
            axes:{state_structure:5,rule_of_law:5,order:5},
            skillChange:{organization:2,connection:1},
            addFlags:["civil_servant"],
            resourceChange:{prestige:1,safety:1,wealth:1} },
          { text:"经商——你已经看够了政治。钱至少不会叛变",
            axes:{equality:-3,order:3},
            skillChange:{connection:1,manipulation:1},
            addFlags:["merchant"],
            resourceChange:{wealth:2} },
          { text:"继续战斗——在军队里，至少方向是清楚的",
            when:{flagsAny:["enlisted","mentor_soldier","memory_military"]},
            axes:{war:8,order:5,state_structure:5},
            skillChange:{valor:2},
            addFlags:["military_path"],
            resourceChange:{prestige:1,safety:-1} },
          { text:"远离一切——守住家庭，守住你还能守住的东西",
            axes:{order:3,state_structure:-3},
            addFlags:["private_life"],
            resourceChange:{safety:2,familyUnity:2},
            relationChange:{mother:{closeness:1},sister:{closeness:1}} },
        ]},
    ]},

  { id:"ch7", title:"第七章：强人的脚步声", year:"1799–1804",
    intro:"拿破仑·波拿巴结束了议会政治的疲态。雾月政变干净利落。\n\n有人说这是背叛，有人说这是救赎。大多数人只是松了一口气。",
    events:[
      { id:"e14", title:"雾月政变",
        text:"议会被军队包围。一个将军走上了权力的最高台阶。'法兰西需要秩序。'这句话你听过，但从未像今天这样有分量。",
        choices:[
          { text:"军队践踏了政治——我们用十年换来的一切被一天推倒",
            axes:{rule_of_law:8,regime:5,sovereignty:5,order:-5},
            addFlags:["oppose_brumaire"],
            resourceChange:{safety:-1} },
          { text:"也许有必要——至少不会再有无休止的清洗了",
            axes:{order:5,rule_of_law:3},
            addFlags:["cautious_brumaire"] },
          { text:"只要革命的核心成果——法典、土地、平等——能保住就行",
            axes:{order:8,state_structure:8,regime:-3},
            addFlags:["accept_brumaire"],
            skillChange:{learning:1} },
          { text:"国家需要一个领袖。也许一直都需要",
            axes:{order:12,state_structure:12,war:5,sovereignty:-10},
            addFlags:["support_brumaire"] },
        ]},

      { id:"e15", title:"新秩序中的你",
        text:"执政府已经稳固。新的行政体系正在建立。法典正在编纂。你面前有一条通往体面生活的路——如果你愿意走。",
        choices:[
          { text:"内心反对，沉默保存共和的火种——总有一天会用到",
            axes:{rule_of_law:8,regime:8,sovereignty:5,order:-5},
            addFlags:["silent_republican"],
            resourceChange:{safety:1} },
          { text:"加入新行政体系——这是你能为法治做的最后一件事",
            axes:{state_structure:8,order:8,rule_of_law:3},
            skillChange:{organization:2,connection:1},
            addFlags:["join_napoleon_admin"],
            resourceChange:{prestige:1,wealth:1} },
          { text:"跟随拿破仑的军队——你的时代终于来了",
            when:{flagsAny:["enlisted","military_path","mentor_soldier"]},
            axes:{war:8,order:10,state_structure:8},
            skillChange:{valor:2},
            addFlags:["napoleon_military"],
            resourceChange:{prestige:2,safety:-2} },
          { text:"退回私人生活。你已经厌倦了一切",
            axes:{order:3},
            addFlags:["retreat_private"],
            resourceChange:{safety:2,resolve:-1} },
        ]},
    ]},

  { id:"ch8", title:"第八章：帝国、战争与终局", year:"1804–1815",
    intro:"帝国建立了。荣耀与伤亡一起增长。征兵令一张又一张。你四十五岁了。\n\n你还记得1789年的那个早晨吗？那个站在风暴入口的年轻人？",
    events:[
      { id:"e16", title:"皇帝加冕",
        text:"拿破仑从教皇手中拿过皇冠，亲手戴在自己头上。这和我们曾经推翻的王冠有什么不同？\n\n也许不同，也许完全相同。也许这个问题本身就是答案。",
        choices:[
          { text:"革命被王冠重新吞没了。我们杀了一个国王，又造了一个皇帝",
            axes:{regime:10,sovereignty:5},
            addFlags:["oppose_empire"] },
          { text:"背离了理想，但至少带来了稳定。人不能永远活在风暴里",
            axes:{order:8,state_structure:5},
            addFlags:["accept_empire"],
            resourceChange:{resolve:1} },
          { text:"这是革命成果的制度化——法典、行政、统一度量衡比王冠更重要",
            axes:{order:10,state_structure:10,regime:-5},
            addFlags:["rationalize_empire"],
            skillChange:{learning:1} },
          { text:"法兰西的伟大——无论它叫共和国还是帝国",
            axes:{order:12,war:10,state_structure:12,sovereignty:-10},
            addFlags:["glorify_empire"] },
        ]},

      { id:"e17", title:"又一张征兵令",
        text:"邻居家的儿子被征走了——第三个。他母亲在你家门口哭。你的门槛上有泪痕。\n\n从西班牙到俄罗斯，军队在不停地前进。你知道有些人再也不会回来。",
        choices:[
          { text:"够了。这种没有尽头的战争正在吞噬法国的下一代",
            axes:{war:-10,sovereignty:5},
            addFlags:["war_weary"],
            worldChange:{conscriptionPressure:2} },
          { text:"代价沉重——但也许……也许这是值得的",
            axes:{war:5,order:5},
            addFlags:["reluctant_war"] },
          { text:"伟业不可能没有牺牲。我们正在创造历史",
            axes:{war:10,order:8},
            addFlags:["accept_war_cost"] },
          { text:"你已经麻木了。你不再数死去的人",
            axes:{order:-3,sovereignty:-3},
            addFlags:["numb"],
            resourceChange:{resolve:-3} },
        ]},

      { id:"e18", title:"最终的抉择：1814–1815",
        text:"帝国崩塌。联军进入巴黎。波旁复辟。百日王朝。滑铁卢。\n\n经历了这一切之后——你还相信什么？",
        choices:[
          { text:"也许国王回来是最好的。至少不会再有征兵令了",
            axes:{regime:-10,order:10,rule_of_law:3},
            addFlags:["accept_restoration"] },
          { text:"有限王权，加上宪法保障——这是我能接受的最后底线",
            axes:{regime:-3,rule_of_law:8,equality:3,order:5},
            addFlags:["constitutional_restoration"] },
          { text:"共和国万岁。即便它已经死了，我也不会放弃这三个字",
            axes:{regime:12,sovereignty:10,equality:8},
            addFlags:["eternal_republic"],
            resourceChange:{resolve:2} },
          { text:"你只想保住自己和家人。其余的……随它去吧",
            axes:{order:5},
            addFlags:["survival"],
            resourceChange:{safety:2,familyUnity:1} },
        ]},
    ]},
];

/* ============================================================
   派别（保留为后台归因层）
   ============================================================ */
const FACTIONS = [
  { id:"royalist", name:"正统保王派", desc:"权威、信仰与传统比群众激情更可靠。你属于那些从未放弃旧世界的人。", figure:"阿图瓦伯爵", figureAlt:"旺代保王派领袖",
    weights:{regime:-15,sovereignty:-10,religion:-12,order:8,state_structure:-8,rule_of_law:0,equality:-10,war:-3} },
  { id:"constitutional", name:"君主立宪自由派", desc:"改革该停在法治和财产权之内。你相信秩序可以与自由共存。", figure:"拉法耶特", figureAlt:"巴纳夫",
    weights:{regime:-5,sovereignty:-3,rule_of_law:12,order:5,equality:-3,state_structure:3,religion:-3,war:-3} },
  { id:"moderate_rev", name:"温和革命派", desc:"摧毁旧弊，但不愿无尽动员。改良是你的信条。", figure:"西哀士", figureAlt:"米拉波",
    weights:{regime:3,sovereignty:0,rule_of_law:8,order:5,equality:3,state_structure:5,religion:0,war:-3} },
  { id:"girondin", name:"吉伦特式自由共和派", desc:"自由、法治与全国代表制——但不是暴民政治。", figure:"布里索", figureAlt:"孔多塞",
    weights:{regime:8,sovereignty:3,rule_of_law:10,order:0,equality:3,state_structure:0,religion:3,war:3} },
  { id:"danton", name:"丹东派共和主义者", desc:"重结果、重整合，能屈能伸。你不纯粹，但你活着。", figure:"丹东", figureAlt:"德穆兰",
    weights:{regime:8,sovereignty:5,rule_of_law:0,order:5,equality:5,state_structure:8,religion:3,war:5} },
  { id:"montagnard", name:"雅各宾-山岳派", desc:"用德性、平等与强国家保卫共和。代价不可避免。", figure:"罗伯斯庇尔", figureAlt:"圣茹斯特",
    weights:{regime:12,sovereignty:10,rule_of_law:-8,order:3,equality:12,state_structure:12,religion:8,war:8} },
  { id:"sans_culotte", name:"平民激进派", desc:"站在穷人和街区一边。你的政治在面包和街垒上。", figure:"埃贝尔", figureAlt:"肖梅特",
    weights:{regime:10,sovereignty:15,rule_of_law:-10,order:-5,equality:15,state_structure:5,religion:10,war:5} },
  { id:"thermidor", name:"热月财产共和派", desc:"恐怖必须结束——但共和国的财产秩序不能动摇。", figure:"塔利安", figureAlt:"巴拉斯",
    weights:{regime:3,sovereignty:-5,rule_of_law:8,order:10,equality:-5,state_structure:5,religion:0,war:0} },
  { id:"directory", name:"督政府秩序共和派", desc:"财产者、行政官和军队的联盟——这是共和国最后的形态。", figure:"西哀士（后期）", figureAlt:"",
    weights:{regime:3,sovereignty:-8,rule_of_law:5,order:12,equality:-5,state_structure:8,religion:0,war:3} },
  { id:"bonapartist", name:"波拿巴主义者", desc:"效率、统一、军功、国家荣耀。秩序不是自由的敌人，而是它的容器。", figure:"拿破仑·波拿巴", figureAlt:"",
    weights:{regime:-3,sovereignty:-12,rule_of_law:-3,order:15,equality:3,state_structure:15,religion:-3,war:12} },
  { id:"liberal_restoration", name:"开明复辟派", desc:"温和王权加宪法保障。也许这就是我们能得到的最好结果。", figure:"路易十八（宪章派）", figureAlt:"",
    weights:{regime:-8,sovereignty:-5,rule_of_law:8,order:10,equality:-3,state_structure:3,religion:-5,war:-5} },
];

/* ============================================================
   多段式结局
   ============================================================ */
const MAIN_ENDINGS = [
  { id:"executed", name:"被风暴吞没的人",
    desc:"你在最狂热的年代把自己交给了事业，最终也被事业吞没。你的名字被写在某张名单上——就像你曾经写过别人的名字一样。",
    condition:(s)=> (s.resources.safety <= -3 && s.tags.includes("embrace_terror")) || (s.tags.includes("denounce_friend") && s.tags.includes("thermidor_betrayal")) },
  { id:"disillusioned", name:"共和国的失意理想主义者",
    desc:"你曾相信这个世界可以被重塑。你错了——不是因为理想是错的，而是因为人不配。至少你是这样安慰自己的。",
    condition:(s)=> s.tags.includes("oppose_brumaire") || s.tags.includes("silent_republican") || s.tags.includes("eternal_republic") },
  { id:"imperial_servant", name:"帝国秩序之臣",
    desc:"你找到了一个不需要信仰的位置：效率、法典和行政。拿破仑给了法国你一直想要的东西——只不过它叫帝国。",
    condition:(s)=> s.tags.includes("join_napoleon_admin") || (s.tags.includes("support_brumaire") && s.tags.includes("rationalize_empire")) },
  { id:"officer", name:"帝国的军官",
    desc:"从奥斯特里茨到滑铁卢，你用剑为自己写了一部传记。荣耀是真的，伤疤也是。",
    condition:(s)=> s.tags.includes("napoleon_military") || (s.tags.includes("enlisted") && s.tags.includes("glorify_empire")) },
  { id:"survivor_notable", name:"幸存的地方名流",
    desc:"你学会了在每次风向变化中保住自己和家庭。也许历史不会记住你的名字——但你的孩子会。",
    condition:(s)=> s.resources.wealth >= 2 && s.resources.prestige >= 1 && s.resources.safety >= 1 },
  { id:"faith_keeper", name:"以信仰活下来的人",
    desc:"教堂被关过，神父被追捕过，十字架被砸过。但你没有放弃。在所有风暴过去之后，你仍然在那扇门前画十字。",
    condition:(s)=> s.tags.includes("support_refractory") && (s.tags.includes("true_believer") || s.tags.includes("hid_priest")) },
  { id:"exile", name:"流亡者",
    desc:"你在故土之外等待法国回头。也许它会回头。也许你会先老去。",
    condition:(s)=> (s.tags.includes("support_refractory") || s.tags.includes("keep_title")) && s.resources.safety <= 0 },
  { id:"family_survivor", name:"归于家庭的幸存者",
    desc:"你也许没有留下名字。但当所有风暴过去之后，你还在。你的孩子在你身边。这也许就是胜利。",
    condition:(s)=> true }, // fallback
];

function calculateFaction(axes) {
  let best=null,bs=-Infinity,second=null,ss=-Infinity,worst=null,ws=Infinity;
  for (const f of FACTIONS) {
    let sc=0;
    for (const [k,w] of Object.entries(f.weights)) sc += (axes[k]||0)*w;
    if (sc>bs){second=best;ss=bs;best=f;bs=sc;} else if(sc>ss){second=f;ss=sc;}
    if (sc<ws){worst=f;ws=sc;}
  }
  return {primary:best,secondary:second,opposite:worst};
}
function getMainEnding(st) {
  for (const e of MAIN_ENDINGS) if (e.condition(st)) return e;
  return MAIN_ENDINGS[MAIN_ENDINGS.length-1];
}
function getFamilyEnding(st) {
  const parts = [];
  const r = st.relations;
  // Father
  if (r.father.closeness >= 3 && r.father.trust >= 2) parts.push({name:"父亲", text:"你们和解了。他在临终前握着你的手说：'你比我走得远。'"});
  else if (r.father.trust <= -1) parts.push({name:"父亲", text:"你们再也没有说过话。他死在你不知道的某一天。"});
  else parts.push({name:"父亲", text:"他在革命的某一年安静地去世了。你不确定他是否理解了你的选择。"});
  // Mother
  if (r.mother.closeness >= 3) parts.push({name:"母亲", text:"她活了下来——靠着那种你永远学不会的坚韧。每封信的结尾她都写：'回来吃饭。'"});
  else parts.push({name:"母亲", text:"她在远方独自老去。你寄的钱，她从不花。"});
  // Brother
  if (r.elderBrother.closeness >= 2) parts.push({name:"长兄", text:"你们站在了不同的阵营，但血浓于水。至少你们都还活着。"});
  else if (r.elderBrother.closeness <= -2) parts.push({name:"长兄", text:"他在流亡中死去。或者在监狱里。你不确定。你试着不去想。"});
  else parts.push({name:"长兄", text:"你们失去了联系。也许这是最好的结果。"});
  // Sister
  if (r.sister.closeness >= 3) parts.push({name:"姐妹", text:"她嫁了人，有了孩子，偶尔寄来一封长信。在信里，你们还是小时候一起分面包的那两个人。"});
  else parts.push({name:"姐妹", text:"她在乱世中过着自己的生活。你们偶有书信。"});
  // Family Unity
  if (st.resources.familyUnity >= 3) parts.push({name:"你的家", text:"这个家——奇迹般地——还在。"});
  else if (st.resources.familyUnity <= -1) parts.push({name:"你的家", text:"这个家在风暴中散了。每个人都有自己的理由。"});
  return parts;
}
function getCompanionEnding(st) {
  const r = st.relations;
  if (r.lover.closeness >= 3 && r.lover.trust >= 2) return "那个人还在你身边。在所有主义和旗帜都褪色之后，这也许是唯一真实的东西。";
  if (r.lover.closeness >= 1) return "你们在乱世中失散。多年后你听说那个人还活着——在另一个城市，过着另一种生活。";
  if (st.tags.includes("opened_heart")) return "你曾经向一个人敞开过心扉。后来发生了什么，已经不重要了。";
  return "你独自走完了这段路。也许有人在远处看着你。也许没有。";
}
function getHistoricalMemory(st, faction) {
  if (st.tags.includes("denounce_friend") && st.tags.includes("embrace_terror"))
    return "一百年后，历史学家在公安委员会的档案里找到了你的名字。你签署过几份逮捕令。被你检举的那个人——后来证明是无辜的。没有人记得你后来怎样了。";
  if (st.tags.includes("defended_friend"))
    return "在某本回忆录的脚注里，有人提到你的名字：'在最危险的日子里，他/她站出来为一个朋友作了证。'仅此而已——但这也许够了。";
  if (st.tags.includes("napoleon_military") || st.tags.includes("glorify_empire"))
    return "你的名字被刻在凯旋门下方的某块石板上——或者应该被刻上。功勋簿上有你的条目，但字迹已经模糊。";
  if (st.tags.includes("eternal_republic") || st.tags.includes("oppose_brumaire"))
    return "一个世纪后，第三共和国的历史教科书在一个段落里提到了你所代表的那种人：'他们是共和精神的守护者，虽然他们生前从未看到共和国的胜利。'";
  if (st.tags.includes("hid_priest") || st.tags.includes("support_refractory"))
    return "在你的教区，人们一直记着你。每年某个圣日，有人会在弥撒中提到那些'保护了我们信仰的人'。你的名字在其中。";
  if (st.tags.includes("survival") || st.tags.includes("private_life"))
    return "你的孙辈在阁楼里找到了你留下的一本日记。大部分页面已经发黄模糊，但最后一页写着：'我活过了所有风暴。这就是我的胜利。'";
  return "历史没有记住你的名字。但在某个法国小镇的档案馆里，有一份泛黄的文件上留着你的签名——证明你存在过。";
}

function getIdeologySummary(axes) {
  const p=[];
  if(axes.regime>8)p.push("共和主义");else if(axes.regime<-8)p.push("君主主义");else p.push("温和改良");
  if(axes.equality>8)p.push("平等优先");else if(axes.equality<-8)p.push("财产优先");
  if(axes.order>8)p.push("秩序导向");else if(axes.order<-5)p.push("自由导向");
  if(axes.rule_of_law>5)p.push("法治信仰");else if(axes.rule_of_law<-5)p.push("紧急状态思维");
  if(axes.war>8)p.push("扩张倾向");else if(axes.war<-5)p.push("和平倾向");
  if(axes.religion<-8)p.push("宗教传统");else if(axes.religion>8)p.push("世俗主义");
  return p.join(" · ");
}

function getEpilogueQuote(ending, faction) {
  const quotes = {
    executed: "风暴不问名字。它只是路过——而你恰好站在路上。",
    disillusioned: "你活下来了，但不再相信年轻时的自己。",
    imperial_servant: "你为秩序献出了理想。秩序收下了，没有说谢谢。",
    officer: "荣耀是一种很重的东西。你背了一辈子。",
    survivor_notable: "你守住了一切——除了那个曾经相信世界可以改变的自己。",
    faith_keeper: "十字架比所有旗帜都重。你知道这一点。",
    exile: "你在异乡的窗口看了一辈子的西方——法兰西在那个方向。",
    family_survivor: "你也许没有改变世界。但你保住了一个家。",
  };
  return quotes[ending.id] || "1769–1815。一段普通人的不普通的一生。";
}

/* ============================================================
   游戏状态
   ============================================================ */
const state = {
  phase: "title",
  family: null,
  region: null,
  memory: null,
  route: null, // "legal" | "faith" | "club"
  // Multi-layer stats
  childTraits: { will:0, insight:0 },
  youthTraits: { honor:0, cunning:0, conviction:0 },
  adultSkills: { eloquence:0, organization:0, valor:0, connection:0, manipulation:0, learning:0 },
  resources: { wealth:0, prestige:0, safety:1, familyUnity:1, publicReputation:0, resolve:3 },
  relations: {
    father:{closeness:1,trust:1}, mother:{closeness:2,trust:2},
    elderBrother:{closeness:0,trust:0}, sister:{closeness:1,trust:1},
    priestMentor:{closeness:0,trust:0}, lawyerMentor:{closeness:0,trust:0},
    comrade:{closeness:0,trust:0}, lover:{closeness:0,trust:0}
  },
  worldState: { urbanOrder:2, breadSupply:2, revolutionaryHeat:1, religiousFracture:1, conscriptionPressure:1 },
  axes: {regime:0,sovereignty:0,rule_of_law:0,equality:0,state_structure:0,religion:0,war:0,order:0},
  tags: [],
  flags: [],
  // Navigation
  childhoodIndex: 0,
  youthIndex: 0,
  chapterIndex: 0,
  eventIndex: 0,
  showChapterIntro: true,
  selectedChoice: null,
};

const app = document.getElementById("app");

/* ── Apply functions ── */
function applyFamily(f) {
  state.family = f;
  if (f.childTraits) for (const [k,v] of Object.entries(f.childTraits)) state.childTraits[k]+=v;
  if (f.resources) for (const [k,v] of Object.entries(f.resources)) state.resources[k]=(state.resources[k]||0)+v;
  if (f.relations) for (const [person,changes] of Object.entries(f.relations)) {
    if (!state.relations[person]) state.relations[person]={closeness:0,trust:0};
    for (const [k,v] of Object.entries(changes)) state.relations[person][k]+=v;
  }
  if (f.axes) for (const [k,v] of Object.entries(f.axes)) state.axes[k]=(state.axes[k]||0)+v;
}
function applyRegion(r) {
  state.region = r;
  if (r.axes) for (const [k,v] of Object.entries(r.axes)) state.axes[k]=(state.axes[k]||0)+v;
  if (r.worldState) for (const [k,v] of Object.entries(r.worldState)) state.worldState[k]=v;
}
function applyMemory(m) {
  state.memory = m;
  if (m.childTraits) for (const [k,v] of Object.entries(m.childTraits)) state.childTraits[k]+=v;
  if (m.axes) for (const [k,v] of Object.entries(m.axes)) state.axes[k]=(state.axes[k]||0)+v;
  if (m.relations) for (const [p,c] of Object.entries(m.relations)) {
    if (!state.relations[p]) state.relations[p]={closeness:0,trust:0};
    for (const [k,v] of Object.entries(c)) state.relations[p][k]+=v;
  }
  if (m.addFlags) m.addFlags.forEach(f => { if(!state.flags.includes(f)) state.flags.push(f); });
}
function applyChoice(c) {
  if (c.axes) for (const [k,v] of Object.entries(c.axes)) state.axes[k]=(state.axes[k]||0)+v;
  if (c.childChange) for (const [k,v] of Object.entries(c.childChange)) state.childTraits[k]+=v;
  if (c.youthChange) for (const [k,v] of Object.entries(c.youthChange)) state.youthTraits[k]+=v;
  if (c.skillChange) for (const [k,v] of Object.entries(c.skillChange)) state.adultSkills[k]=(state.adultSkills[k]||0)+v;
  if (c.resourceChange) for (const [k,v] of Object.entries(c.resourceChange)) state.resources[k]=(state.resources[k]||0)+v;
  if (c.worldChange) for (const [k,v] of Object.entries(c.worldChange)) state.worldState[k]=(state.worldState[k]||0)+v;
  if (c.relationChange) for (const [p,ch] of Object.entries(c.relationChange)) {
    if (!state.relations[p]) state.relations[p]={closeness:0,trust:0};
    for (const [k,v] of Object.entries(ch)) state.relations[p][k]+=v;
  }
  if (c.addFlags) c.addFlags.forEach(f => { if(!state.flags.includes(f)) state.flags.push(f); });
  if (c.removeFlags) c.removeFlags.forEach(f => { const idx=state.flags.indexOf(f); if(idx>=0)state.flags.splice(idx,1); });
  if (c.tag) state.tags.push(c.tag);
  if (c.addFlags) c.addFlags.forEach(f => { if(!state.tags.includes(f)) state.tags.push(f); });
  if (c.routeSet && !state.route) state.route = c.routeSet;
  if (c.routeHint && !state.route) state._routeHint = c.routeHint;
}

/* ── Navigation helpers ── */
function chapterApplies(ch) {
  if (!matchWhen(ch.when, state)) return false;
  return ch.events.some(e => eventApplies(e, state));
}
function nextValidChapter(from) {
  for (let i=from;i<CHAPTERS.length;i++) if (chapterApplies(CHAPTERS[i])) return i;
  return -1;
}
function nextValidEventInChapter(chIdx, fromIdx) {
  const ch=CHAPTERS[chIdx];
  for (let i=fromIdx;i<ch.events.length;i++) if (eventApplies(ch.events[i],state)) return i;
  return -1;
}
function totalEvents() { return CHAPTERS.reduce((s,c)=>s+c.events.length,0)+CHILDHOOD_EVENTS.length+YOUTH_EVENTS.length; }
function doneEvents() {
  if (state.phase==="result") return totalEvents();
  if (state.phase==="childhood") return state.childhoodIndex;
  if (state.phase==="youth") return CHILDHOOD_EVENTS.length+state.youthIndex;
  if (state.phase==="chapters") {
    const base=CHILDHOOD_EVENTS.length+YOUTH_EVENTS.length;
    const fin=CHAPTERS.slice(0,state.chapterIndex).reduce((s,c)=>s+c.events.length,0);
    return base+fin+(state.showChapterIntro?0:state.eventIndex);
  }
  return 0;
}
function progress() { const t=totalEvents(); return t?Math.round(doneEvents()/t*100):0; }

function advanceChapter() {
  const ch=CHAPTERS[state.chapterIndex];
  const next=nextValidEventInChapter(state.chapterIndex,state.eventIndex+1);
  if (next!==-1){state.eventIndex=next;return;}
  const nextCh=nextValidChapter(state.chapterIndex+1);
  if (nextCh!==-1){state.chapterIndex=nextCh;state.eventIndex=nextValidEventInChapter(nextCh,0);state.showChapterIntro=true;}
  else state.phase="result";
}

/* ── Transition ── */
function transition(cb) {
  const c=document.querySelector(".content");
  if(c)c.classList.add("fade-out");
  setTimeout(()=>{cb();render();requestAnimationFrame(()=>{
    const n=document.querySelector(".content");
    if(n){n.classList.remove("fade-out");window.scrollTo({top:0,behavior:"smooth"});}
  });},260);
}

/* ── Status bar ── */
function renderStatusBar() {
  const r=state.resources;
  const cls=(v)=>v<=0?'low':v>=3?'high':'';
  return `<div class="status-bar">
    <span class="status-item">💰 <span class="status-value ${cls(r.wealth)}">${r.wealth}</span></span>
    <span class="status-item">⭐ <span class="status-value ${cls(r.prestige)}">${r.prestige}</span></span>
    <span class="status-item">🛡️ <span class="status-value ${cls(r.safety)}">${r.safety}</span></span>
    <span class="status-item">🏠 <span class="status-value ${cls(r.familyUnity)}">${r.familyUnity}</span></span>
    <span class="status-item">🔥 <span class="status-value ${cls(r.resolve)}">${r.resolve}</span></span>
    ${state.route?`<span class="route-badge ${state.route}">${{legal:'法政线',faith:'信仰线',club:'行动线'}[state.route]}</span>`:''}
  </div>`;
}

/* ── Axis Rows ── */
function axisRows() {
  const meta=[
    {key:"regime",left:"王权",right:"共和"},{key:"sovereignty",left:"精英代议",right:"群众政治"},
    {key:"rule_of_law",left:"紧急状态",right:"程序法治"},{key:"equality",left:"财产优先",right:"社会平等"},
    {key:"state_structure",left:"地方传统",right:"中央集权"},{key:"religion",left:"宗教政治",right:"世俗化"},
    {key:"war",left:"和平安定",right:"扩张荣耀"},{key:"order",left:"自由优先",right:"强人整合"},
  ];
  return meta.map(a=>{
    const v=state.axes[a.key]||0,pct=Math.min(100,Math.max(0,50+v*1.5));
    return `<div class="axis-row"><span class="axis-left">${a.left}</span><div class="axis-bar"><div class="axis-center"></div><div class="axis-dot" style="left:${pct}%"></div></div><span class="axis-right">${a.right}</span></div>`;
  }).join("");
}

/* ============================================================
   渲染函数
   ============================================================ */
function renderTitle() {
  return `<div class="title-screen fade-in-up">
    <div class="title-decor">⚜</div>
    <h1 class="main-title">风暴中的一生</h1>
    <p class="subtitle">Une Vie dans la Tempête</p>
    <p class="title-desc">1769 – 1815 · 法国大革命人生叙事</p>
    <div class="title-divider">───── ✦ ─────</div>
    <p class="title-flavor">你出生于1769年的法国。<br>一个即将崩塌与重生的世界。<br><br>你不会选择自己的立场。<br>你会活出它。</p>
    <button class="btn-primary" data-action="start">开始你的一生</button>
    <p class="tiny-note">人生叙事 · 关系驱动 · 路线分流 · 多段式结局</p>
  </div>`;
}

function renderFamily() {
  return `<div class="fade-in-up">
    <p class="phase-label">创建 · 第一步</p>
    <h2 class="section-title">你出生在什么样的家庭？</h2>
    <p class="section-desc">1769年。你的父亲在旧制度的边缘讨生活。你的母亲来自更普通的世界。这个家庭将决定你看见风暴的角度。</p>
    <div class="grid">${FAMILIES.map((f,i)=>`<button class="card" data-action="family" data-index="${i}">
      <span class="card-icon">${f.icon}</span>
      <span class="card-title">${f.name}</span>
      <span class="card-desc">${f.desc}</span>
      <span class="card-effect">${f.effect}</span>
    </button>`).join("")}</div>
  </div>`;
}

function renderRegion() {
  return `<div class="fade-in-up">
    <p class="phase-label">创建 · 第二步</p>
    <h2 class="section-title">你出生在法国的哪里？</h2>
    <p class="section-desc">每一片土地都将以不同的方式迎接革命。</p>
    <div class="grid">${REGIONS.map((r,i)=>`<button class="card" data-action="region" data-index="${i}">
      <span class="card-icon">${r.icon}</span>
      <span class="card-title">${r.name}</span>
      <span class="card-desc">${r.desc}</span>
    </button>`).join("")}</div>
  </div>`;
}

function renderMemory() {
  return `<div class="fade-in-up">
    <p class="phase-label">创建 · 第三步</p>
    <h2 class="section-title">童年最深的记忆</h2>
    <p class="section-desc">在你所有的童年里，有一个画面比其他的都更清晰。它会跟随你一辈子。</p>
    <div class="grid">${CHILDHOOD_MEMORIES.map((m,i)=>`<button class="card" data-action="memory" data-index="${i}">
      <span class="card-icon">${m.icon}</span>
      <span class="card-title">${m.name}</span>
      <span class="card-desc">${m.desc}</span>
    </button>`).join("")}</div>
  </div>`;
}

function renderEventPhase(events, index, phaseName, yearLabel, counterTotal) {
  const raw = events[index];
  const evt = resolveEvent(raw, state);
  return `<div class="fade-in-up">
    <p class="phase-label">${phaseName}</p>
    <p class="year-badge">${yearLabel}</p>
    <h2 class="event-title">${evt.title}</h2>
    <div class="narrative-box"><p class="narrative-text">${evt.text}</p></div>
    <div class="choice-list">${evt.choices.map((c,i)=>`<button class="choice-btn ${state.selectedChoice===i?'selected':''}" data-action="${phaseName==='童年'?'childhood':'youth'}-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>
      ${c.text}${c.hint?`<span class="consequence-hint">${c.hint}</span>`:''}
    </button>`).join("")}</div>
    <p class="event-counter">${phaseName} ${index+1} / ${counterTotal}</p>
  </div>`;
}

function renderChildhood() {
  return renderEventPhase(CHILDHOOD_EVENTS, state.childhoodIndex, '童年', '1769–1778', CHILDHOOD_EVENTS.length);
}
function renderYouth() {
  return renderEventPhase(YOUTH_EVENTS, state.youthIndex, '少年', '1779–1788', YOUTH_EVENTS.length);
}

function renderChapterIntro() {
  const ch=CHAPTERS[state.chapterIndex];
  const introText = ch.intro.replace(/\n/g,'<br>');
  return `<div class="fade-in-up"><div class="chapter-intro">
    <p class="year-badge">${ch.year}</p>
    <h2 class="chapter-title">${ch.title}</h2>
    <div class="chapter-divider">───── ✦ ─────</div>
    <p class="chapter-intro-text">${introText}</p>
    <button class="btn-primary" data-action="chapter-continue">继续</button>
  </div></div>`;
}

function renderChapterEvent() {
  const ch=CHAPTERS[state.chapterIndex];
  const raw=ch.events[state.eventIndex];
  const evt=resolveEvent(raw,state);
  const evtText = evt.text.replace(/\n/g,'<br>');
  return `<div class="fade-in-up">
    <p class="phase-label">${ch.title}</p>
    <p class="year-badge">${ch.year}</p>
    <h2 class="event-title">${evt.title}</h2>
    <div class="narrative-box"><p class="narrative-text">${evtText}</p></div>
    <div class="choice-list">${evt.choices.map((c,i)=>`<button class="choice-btn ${state.selectedChoice===i?'selected':''}" data-action="chapter-choice" data-index="${i}" ${state.selectedChoice!==null?'disabled':''}>
      ${c.text}${c.hint?`<span class="consequence-hint">${c.hint}</span>`:''}
    </button>`).join("")}</div>
    <p class="event-counter">第 ${state.chapterIndex+1} 章 · 事件 ${state.eventIndex+1} / ${ch.events.length}</p>
  </div>`;
}

function renderResult() {
  const f = calculateFaction(state.axes);
  const ending = getMainEnding(state);
  const ideo = getIdeologySummary(state.axes);
  const familyEndings = getFamilyEnding(state);
  const companionEnding = getCompanionEnding(state);
  const historicalMemory = getHistoricalMemory(state, f);
  const quote = getEpilogueQuote(ending, f);

  return `<div class="fade-in-up">
    <!-- 第一屏：总标题 -->
    <div class="epilogue-quote"><p>"${quote}"</p></div>

    <div class="result-header">
      <div class="title-decor">⚜</div>
      <h2 class="result-main-title">你的一生</h2>
      <p class="result-subtitle">1769 – 1815</p>
      <p class="result-origin-line">${state.family.icon} ${state.family.name} · ${state.region.name}${state.route?` · ${{legal:'法政之路',faith:'信仰之路',club:'行动之路'}[state.route]}`:''}</p>
    </div>

    <!-- 第二屏：主角结局 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 人生结局 ⸻</h3>
      <h2 class="ending-name">${ending.name}</h2>
      <p class="ending-desc">${ending.desc}</p>
    </div>

    <!-- 第三屏：家庭结局 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 家庭的命运 ⸻</h3>
      ${familyEndings.map(fe=>`<div class="family-epilogue-item">
        <p class="family-epilogue-name">${fe.name}</p>
        <p class="family-epilogue-fate">${fe.text}</p>
      </div>`).join("")}
    </div>

    <!-- 第四屏：亲密关系 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 那个人 ⸻</h3>
      <p class="epilogue-text">${companionEnding}</p>
    </div>

    <!-- 第五屏：意识形态 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 你一生的沉淀 ⸻</h3>
      <p class="ideology-text">${ideo}</p>
    </div>

    <!-- 第六屏：政治派别 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 最接近的政治归属 ⸻</h3>
      <div class="faction-box">
        <h2 class="faction-name">${f.primary.name}</h2>
        <p class="faction-desc">${f.primary.desc}</p>
      </div>
      ${f.secondary?`<div class="secondary-faction"><p class="secondary-label">次级倾向：${f.secondary.name}</p></div>`:''}
    </div>

    <!-- 第七屏：历史人物 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 最相似的历史人物 ⸻</h3>
      <div class="figure-box">
        <p class="figure-name">${f.primary.figure}</p>
        ${f.primary.figureAlt?`<p class="figure-alt">也像：${f.primary.figureAlt}</p>`:''}
      </div>
    </div>

    <!-- 第八屏：历史记忆 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 历史如何记住你 ⸻</h3>
      <div class="memory-text">${historicalMemory}</div>
    </div>

    <!-- 政治光谱 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 政治光谱 ⸻</h3>
      <div class="axes-grid">${axisRows()}</div>
    </div>

    <!-- 与你最不同 -->
    <div class="result-section">
      <h3 class="result-label">⸻ 与你最不相似的类型 ⸻</h3>
      <p class="opposite-faction">${f.opposite.name}</p>
    </div>

    <div class="actions-row">
      <button class="btn-primary" data-action="restart">重新活一次</button>
    </div>
  </div>`;
}

function renderPhase() {
  switch(state.phase) {
    case "title": return renderTitle();
    case "family": return renderFamily();
    case "region": return renderRegion();
    case "memory": return renderMemory();
    case "childhood": return renderChildhood();
    case "youth": return renderYouth();
    case "chapters": return state.showChapterIntro ? renderChapterIntro() : renderChapterEvent();
    case "result": return renderResult();
    default: return "<p>未知</p>";
  }
}

function render() {
  const showProgress = !["title","result","family","region","memory"].includes(state.phase);
  const showStatus = ["childhood","youth","chapters"].includes(state.phase);
  app.innerHTML = `<div class="app${showStatus?' has-status':''}">
    ${showProgress?`<div class="progress-bar"><div class="progress-fill" style="width:${progress()}%"></div></div>`:''}
    ${showStatus?renderStatusBar():''}
    <div class="content">${renderPhase()}</div>
  </div>`;
  bindEvents();
}

/* ── Event binding ── */
function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el=>{
    el.addEventListener("click",()=>{
      const a=el.dataset.action;
      const i=el.dataset.index!==undefined?Number(el.dataset.index):null;

      if (a==="start") transition(()=> state.phase="family");
      if (a==="family") transition(()=> { applyFamily(FAMILIES[i]); state.phase="region"; });
      if (a==="region") transition(()=> { applyRegion(REGIONS[i]); state.phase="memory"; });
      if (a==="memory") transition(()=> { applyMemory(CHILDHOOD_MEMORIES[i]); state.phase="childhood"; });

      if (a==="childhood-choice" && state.selectedChoice===null) {
        state.selectedChoice=i; render();
        setTimeout(()=>transition(()=>{
          const evt=resolveEvent(CHILDHOOD_EVENTS[state.childhoodIndex],state);
          applyChoice(evt.choices[i]);
          state.selectedChoice=null;
          if (state.childhoodIndex<CHILDHOOD_EVENTS.length-1) state.childhoodIndex++;
          else state.phase="youth";
        }),350);
      }

      if (a==="youth-choice" && state.selectedChoice===null) {
        state.selectedChoice=i; render();
        setTimeout(()=>transition(()=>{
          const evt=resolveEvent(YOUTH_EVENTS[state.youthIndex],state);
          applyChoice(evt.choices[i]);
          state.selectedChoice=null;
          if (state.youthIndex<YOUTH_EVENTS.length-1) state.youthIndex++;
          else {
            // Determine route if not set
            if (!state.route && state._routeHint) state.route=state._routeHint;
            if (!state.route) {
              // Infer from youth traits
              const yt=state.youthTraits;
              if (yt.conviction>=yt.honor && yt.conviction>=yt.cunning) {
                state.route = state.axes.religion < -5 ? "faith" : "club";
              } else if (yt.honor>=yt.cunning) {
                state.route = "legal";
              } else {
                state.route = "club";
              }
            }
            state.phase="chapters";
            state.chapterIndex=nextValidChapter(0);
            state.eventIndex=state.chapterIndex>=0?nextValidEventInChapter(state.chapterIndex,0):0;
            state.showChapterIntro=true;
            if (state.chapterIndex<0) state.phase="result";
          }
        }),350);
      }

      if (a==="chapter-continue") transition(()=> state.showChapterIntro=false);

      if (a==="chapter-choice" && state.selectedChoice===null) {
        state.selectedChoice=i; render();
        setTimeout(()=>transition(()=>{
          const ch=CHAPTERS[state.chapterIndex];
          const evt=resolveEvent(ch.events[state.eventIndex],state);
          applyChoice(evt.choices[i]);
          state.selectedChoice=null;
          advanceChapter();
        }),350);
      }

      if (a==="restart") transition(()=>{
        Object.assign(state, {
          phase:"title",family:null,region:null,memory:null,route:null,
          childTraits:{will:0,insight:0},
          youthTraits:{honor:0,cunning:0,conviction:0},
          adultSkills:{eloquence:0,organization:0,valor:0,connection:0,manipulation:0,learning:0},
          resources:{wealth:0,prestige:0,safety:1,familyUnity:1,publicReputation:0,resolve:3},
          relations:{
            father:{closeness:1,trust:1},mother:{closeness:2,trust:2},
            elderBrother:{closeness:0,trust:0},sister:{closeness:1,trust:1},
            priestMentor:{closeness:0,trust:0},lawyerMentor:{closeness:0,trust:0},
            comrade:{closeness:0,trust:0},lover:{closeness:0,trust:0}
          },
          worldState:{urbanOrder:2,breadSupply:2,revolutionaryHeat:1,religiousFracture:1,conscriptionPressure:1},
          axes:{regime:0,sovereignty:0,rule_of_law:0,equality:0,state_structure:0,religion:0,war:0,order:0},
          tags:[],flags:[],_routeHint:null,
          childhoodIndex:0,youthIndex:0,chapterIndex:0,eventIndex:0,
          showChapterIntro:true,selectedChoice:null
        });
      });
    });
  });
}

render();
