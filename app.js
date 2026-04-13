// ====================== 1. 新增核心枚举与公式 ======================
// 人生阶段枚举
const LIFE_PHASES = {
  CHILDHOOD: "childhood",    // 童年期 0-14岁
  ADOLESCENCE: "adolescence",// 少年期 14-19岁
  YOUTH: "youth",            // 青年期 20-25岁
  ADULTHOOD: "adulthood",    // 成年期 25-35岁
  ENDING: "ending"           // 终局期 35-46岁
};

// 基础特质定义（童年期产出，不可逆）
const BASE_TRAITS = [
  { id: "determination", name: "决心", desc: "面对困境的坚韧与行动力，影响勇气、权谋类复合特质" },
  { id: "perception", name: "感知", desc: "对人心、环境的洞察力，影响外交、操控类复合特质" },
  { id: "sensibility", name: "灵性", desc: "对信仰、理想的共情力，影响口才、神学类复合特质" },
  { id: "nobility", name: "自尊", desc: "对身份、荣誉的执念，影响秩序、贵族类专属特质" }
];

// 复合特质合成公式（少年期合成，半可逆）
const COMPOUND_TRAITS_FORMULA = {
  valor: { traits: ["determination", "nobility"], weight: [0.6, 0.4] },       // 勇气
  scheming: { traits: ["determination", "perception"], weight: [0.5, 0.5] },  // 权谋
  eloquence: { traits: ["determination", "sensibility"], weight: [0.4, 0.6] },// 口才
  diplomacy: { traits: ["perception", "nobility"], weight: [0.5, 0.5] },      // 外交
  manipulation: { traits: ["perception", "scheming"], weight: [0.6, 0.4] },   // 操控
  theology: { traits: ["sensibility", "nobility"], weight: [0.7, 0.3] }       // 神学
};

// 虚亡事件池（暂仅定义，童年/少年期暂不触发，青年期生效）
const LESSER_DEATH_EVENTS = [
  {
    id: "arrested",
    name: "被捕入狱",
    trigger: { safety: () => state.stats.safety <= -2, tagsAny: ["oppose_terror", "defend_friend"] },
    desc: "你被公安委员会逮捕，关进了巴黎古监狱。黑暗的牢房里，你以为自己的人生已经走到了尽头。",
    reward: { traits: { determination: 5, scheming: 3 }, tags: ["survived_prison", "lesser_death_1"] },
    penalty: { stats: { prestige: -1, influence: -2 }, axes: { rule_of_law: -5 } }
  }
];

// ====================== 2. 扩展状态机 ======================
const state = {
  // 原有核心字段保留
  phase: "title", origin: null, gender: null, region: null,
  axes: { regime: 0, sovereignty: 0, rule_of_law: 0, equality: 0, state_structure: 0, religion: 0, war: 0, order: 0 },
  stats: { wealth: 0, prestige: 0, safety: 1, influence: 0 },
  tags: [], selectedChoice: null,
  chapterIndex: 0, eventIndex: 0, showChapterIntro: true,
  
  // 新增人生阶段管理
  lifePhase: LIFE_PHASES.CHILDHOOD,
  childhoodIndex: 0, adolescenceIndex: 0, // 阶段事件索引
  // 新增特质相关
  baseTraits: { determination: 0, perception: 0, sensibility: 0, nobility: 0 }, // 基础特质
  compoundTraits: {}, // 复合特质（少年期合成后赋值）
  // 新增苦难机制（暂不生效）
  lesserDeathCount: 0, maxLesserDeath: 3, isDead: false,
  // 主线分支锁定（少年期结束后赋值）
  availableBranches: []
};

// ====================== 3. 出身/地区配置（仅完成书记官+省城） ======================
const ORIGINS = [
  { id: "clerk_son", name: "书记官之子", desc: "父亲是省城的地方书记官，你从小接触文书与地方政务", isCompleted: true },
  { id: "peasant", name: "农民之子", desc: "父亲是乡村佃农，你从小在田埂间长大", isCompleted: false },
  { id: "artisan", name: "手工业者之子", desc: "父亲是巴黎的钟表匠，你从小熟悉工坊生活", isCompleted: false },
  { id: "noble", name: "小贵族之子", desc: "父亲是外省小贵族，你拥有微薄的头衔", isCompleted: false }
];

const REGIONS = [
  { id: "provincial_city", name: "省城", desc: "法国中部的省城，介于巴黎与乡村之间，信息流通但节奏缓慢", isCompleted: true },
  { id: "paris", name: "巴黎", desc: "革命的中心，风云变幻之地", isCompleted: false },
  { id: "countryside", name: "乡村", desc: "西部乡村，保皇派根基深厚", isCompleted: false },
  { id: "border", name: "边境", desc: "北部边境，常年受战争影响", isCompleted: false }
];

// ====================== 4. 童年阶段事件库（仅完成书记官+省城线） ======================
const CHILDHOOD_EVENTS = [
  // 事件1：识字的启蒙（书记官之子·省城专属）
  {
    id: "childhood_1",
    title: "父亲的文书桌",
    desc: "1775年，你6岁。父亲是省城的书记官，他的书桌永远堆满了官方文书、地契与信件。趁他外出，你偷偷爬上椅子，想触碰那些写满字的纸张。",
    origin: ["clerk_son"], // 仅书记官之子触发
    region: ["provincial_city"], // 仅省城触发
    choices: [
      {
        text: "模仿父亲的笔迹抄写文书——哪怕写得歪歪扭扭",
        baseTraits: { determination: 4, perception: 2 }, // 基础特质赋值
        axes: { rule_of_law: 3, order: 2 },
        tags: ["early_learning", "respect_authority"],
        desc: "父亲发现后没有责骂，反而笑着教你认字母。你从此对文字与规则有了天然的亲近感。"
      },
      {
        text: "偷偷藏起一张盖有印章的官方纸条，当作玩具",
        baseTraits: { perception: 4, nobility: 2 },
        axes: { state_structure: 2, prestige: 1 },
        tags: ["curious", "value_status"],
        desc: "你摩挲着纸条上的印章，觉得这枚小小的印记仿佛拥有支配一切的力量。"
      },
      {
        text: "对文书毫无兴趣，跑出去和街上的孩子玩闹",
        baseTraits: { determination: 2, sensibility: 3 },
        axes: { equality: 2, order: -1 },
        tags: ["people_friendly", "hate_bureaucracy"],
        desc: "你和铁匠的儿子、面包师的女儿打成一片，第一次意识到，父亲的世界和普通人的世界完全不同。"
      }
    ]
  },
  // 事件2：面包危机的记忆（书记官之子·省城专属）
  {
    id: "childhood_2",
    title: "1780年的面包荒",
    desc: "1780年，你11岁。省城的面包价格暴涨，街头开始出现饥饿的流民。父亲深夜在家中叹气，说地方财政已无力救济。",
    origin: ["clerk_son"],
    region: ["provincial_city"],
    choices: [
      {
        text: "听父亲分析危机的根源，理解政务的艰难",
        baseTraits: { perception: 3, determination: 2 },
        axes: { rule_of_law: 2, state_structure: 3 },
        tags: ["understand_governance", "sympathy_for_officials"],
        desc: "你明白：秩序的维持需要代价，不是所有苦难都能靠善意解决。"
      },
      {
        text: "偷拿家里的零钱，给街头的乞丐买面包",
        baseTraits: { sensibility: 4, nobility: -1 },
        axes: { equality: 3, order: -2 },
        tags: ["compassionate", "anti_hierarchy"],
        desc: "乞丐的道谢让你心酸，你觉得那些冰冷的规则，本该为这些人服务。"
      },
      {
        text: "告诉父亲流民聚集的地点，希望他上报官府",
        baseTraits: { determination: 3, nobility: 2 },
        axes: { order: 3, equality: -1 },
        tags: ["law_abiding", "trust_system"],
        desc: "父亲夸你有责任心，但官府的处理只是驱散流民——问题并未解决。"
      }
    ]
  },
  // 事件3：童年的终章（书记官之子·省城专属）
  {
    id: "childhood_3",
    title: "父亲的教诲",
    desc: "1783年，你14岁。即将告别童年，父亲对你说：你已到了明事理的年纪，未来的路，要靠自己的选择。",
    origin: ["clerk_son"],
    region: ["provincial_city"],
    choices: [
      {
        text: "我想继承你的事业，成为一名书记官",
        baseTraits: { nobility: 3, perception: 2 },
        axes: { regime: -1, order: 4 },
        tags: ["career_bureaucrat", "conservative"],
        desc: "父亲欣慰点头：「规则是文明的基石，哪怕它不完美。」"
      },
      {
        text: "我想学习法律，为普通人争取公正",
        baseTraits: { sensibility: 3, determination: 3 },
        axes: { equality: 3, rule_of_law: 2 },
        tags: ["idealist", "lawyer_dream"],
        desc: "父亲沉默片刻：「公正的代价，往往是不被理解。」"
      },
      {
        text: "我想看看外面的世界，去巴黎求学",
        baseTraits: { perception: 3, determination: 2 },
        axes: { sovereignty: 2, war: 1 },
        tags: ["ambitious", "paris_dream"],
        desc: "父亲既担忧又骄傲：「巴黎是风暴中心，你要守住自己的本心。」"
      }
    ]
  },
  // 其他出身/地区事件（未完成占位）
  {
    id: "childhood_unfinished",
    title: "【未完成】童年事件",
    desc: "该出身/地区的童年事件尚未开发，暂跳转至少年期",
    origin: ["peasant", "artisan", "noble"],
    region: ["paris", "countryside", "border"],
    choices: [
      {
        text: "继续游戏",
        baseTraits: { determination: 1, perception: 1, sensibility: 1, nobility: 1 },
        axes: { order: 0, equality: 0 },
        tags: ["unfinished_content"],
        desc: "你度过了平凡的童年，即将进入少年期。"
      }
    ]
  }
];

// ====================== 5. 童年阶段核心函数 ======================
// 初始化童年期基础特质
function initBaseAttributes() {
  state.baseTraits = {
    determination: 0,
    perception: 0,
    sensibility: 0,
    nobility: 0
  };
}

// 获取当前童年事件
function getCurrentChildhoodEvent() {
  if (state.childhoodIndex >= CHILDHOOD_EVENTS.length) return null;
  const event = CHILDHOOD_EVENTS[state.childhoodIndex];
  // 匹配出身/地区（仅返回已完成或占位事件）
  if (matchOriginAndRegion(event, state)) {
    return event;
  }
  // 未匹配则返回未完成占位事件
  return CHILDHOOD_EVENTS.find(e => e.id === "childhood_unfinished");
}

// 推进童年事件
function advanceChildhoodEvent() {
  state.childhoodIndex += 1;
  const nextEvent = getCurrentChildhoodEvent();
  if (!nextEvent) {
    // 童年期结束，切换到少年期
    transitionLifePhase(LIFE_PHASES.ADOLESCENCE);
    return;
  }
  renderChildhoodEvent(nextEvent);
}

// 匹配出身与地区
function matchOriginAndRegion(event, state) {
  if (!event.origin || !event.region) return true;
  const originMatch = event.origin.includes(state.origin?.id);
  const regionMatch = event.region.includes(state.region?.id);
  return originMatch && regionMatch;
}

// ====================== 6. 少年阶段事件库（仅完成书记官+省城线） ======================
const ADOLESCENCE_EVENTS = [
  // 事件1：学业的选择（书记官之子·省城专属）
  {
    id: "adolescence_1",
    title: "1784年，学业的方向",
    desc: "1784年，你15岁。父亲为你安排了学业：要么进入教会学校学习神学，要么进入法科学校学习律法，要么跟随他学习政务。",
    origin: ["clerk_son"],
    region: ["provincial_city"],
    choices: [
      {
        text: "进入法科学校，钻研法律条文",
        tags: ["law_student", "rational"],
        desc: "你沉迷于罗马法与本土法的对比，相信法律是改变社会的根本。",
        // 影响复合特质合成权重
        traitBoost: { perception: 2, determination: 1 }
      },
      {
        text: "跟随父亲学习政务，熟悉地方管理",
        tags: ["bureaucracy_apprentice", "pragmatic"],
        desc: "你帮父亲处理文书、接待民众，明白政务的核心是平衡各方利益。",
        traitBoost: { nobility: 2, perception: 1 }
      },
      {
        text: "拒绝父亲的安排，自学启蒙思想家的著作",
        tags: ["enlightenment_fan", "rebel"],
        desc: "你偷偷阅读卢梭、伏尔泰的作品，开始质疑现有的秩序。",
        traitBoost: { sensibility: 2, determination: 1 }
      }
    ]
  },
  // 事件2：与贵族的相遇（书记官之子·省城专属）
  {
    id: "adolescence_2",
    title: "外省贵族的到访",
    desc: "1786年，你17岁。一位外省贵族来到省城处理地产纠纷，父亲让你陪同接待。贵族的傲慢与特权，让你有了不同的感受。",
    origin: ["clerk_son"],
    region: ["provincial_city"],
    choices: [
      {
        text: "迎合贵族的喜好，流畅地完成接待",
        tags: ["diplomatic", "adaptable"],
        desc: "贵族对你刮目相看，许诺未来可为你提供帮助——但你内心有些不适。",
        traitBoost: { nobility: 2, perception: 2 }
      },
      {
        text: "直言指出贵族诉求中的不合理之处",
        tags: ["courageous", "principled"],
        desc: "贵族震怒，父亲连忙道歉，但私下里夸你「有骨头」。",
        traitBoost: { determination: 3, sensibility: 1 }
      },
      {
        text: "沉默观察，不发表意见，事后向父亲分析贵族的弱点",
        tags: ["scheming", "observant"],
        desc: "你看清了贵族的贪婪与脆弱，明白权力的本质并非头衔。",
        traitBoost: { perception: 3, determination: 1 }
      }
    ]
  },
  // 事件3：革命前夜的觉醒（书记官之子·省城专属）
  {
    id: "adolescence_3",
    title: "1788年，革命的低语",
    desc: "1788年，你19岁。省城的咖啡馆里，到处是关于三级会议的讨论，有人高呼自由，有人担忧混乱。少年期即将结束，你必须做出人生的第一个关键抉择。",
    origin: ["clerk_son"],
    region: ["provincial_city"],
    choices: [
      {
        text: "加入保皇派的青年团体，维护现有秩序",
        tags: ["royalist_heart", "conservative"],
        axes: { regime: -5, order: 5 },
        desc: "你认为革命只会带来混乱，君主制是法国唯一的选择。",
        traitBoost: { nobility: 3, determination: 2 }
      },
      {
        text: "加入激进的爱国者俱乐部，呼吁改革",
        tags: ["revolutionary_seed", "radical"],
        axes: { regime: 5, equality: 5 },
        desc: "你相信只有彻底的变革，才能让法国摆脱困境。",
        traitBoost: { sensibility: 3, determination: 2 }
      },
      {
        text: "保持中立，专注于自己的学业/事业",
        tags: ["moderate", "pragmatic"],
        axes: { rule_of_law: 4, order: 2 },
        desc: "你认为无论谁掌权，法律与秩序才是根本，不想过早站队。",
        traitBoost: { perception: 3, sensibility: 1 }
      }
    ]
  },
  // 其他出身/地区事件（未完成占位）
  {
    id: "adolescence_unfinished",
    title: "【未完成】少年事件",
    desc: "该出身/地区的少年事件尚未开发，暂完成复合特质合成并跳转至青年期",
    origin: ["peasant", "artisan", "noble"],
    region: ["paris", "countryside", "border"],
    choices: [
      {
        text: "继续游戏",
        traitBoost: { determination: 1, perception: 1, sensibility: 1, nobility: 1 },
        tags: ["unfinished_content"],
        desc: "你度过了平凡的少年期，即将进入革命的风暴中心。"
      }
    ]
  }
];

// ====================== 7. 少年阶段核心函数 ======================
// 合成复合特质（少年期核心）
function synthesizeCompoundAttributes() {
  state.compoundTraits = {};
  // 遍历合成公式计算复合特质
  for (const [traitId, formula] of Object.entries(COMPOUND_TRAITS_FORMULA)) {
    let value = 0;
    formula.traits.forEach((baseTrait, index) => {
      // 基础特质值 + 少年期traitBoost加成
      const baseValue = state.baseTraits[baseTrait] || 0;
      const boostValue = state.traitBoost?.[baseTrait] || 0;
      value += (baseValue + boostValue) * formula.weight[index];
    });
    state.compoundTraits[traitId] = Math.round(value);
  }
  // 同步复合特质到立场轴
  syncTraitsToAxes();
}

// 同步特质到立场轴
function syncTraitsToAxes() {
  // 勇气影响秩序/战争轴
  state.axes.order += state.compoundTraits.valor || 0;
  state.axes.war += state.compoundTraits.valor || 0;
  // 权谋影响主权/法治轴
  state.axes.sovereignty += state.compoundTraits.scheming || 0;
  state.axes.rule_of_law -= state.compoundTraits.scheming || 0;
  // 口才影响平等/宗教轴
  state.axes.equality += state.compoundTraits.eloquence || 0;
  state.axes.religion -= state.compoundTraits.eloquence || 0;
  // 外交影响政体/国家结构轴
  state.axes.regime -= state.compoundTraits.diplomacy || 0;
  state.axes.state_structure += state.compoundTraits.diplomacy || 0;
}

// 锁定主线分支池（少年期结束后）
function lockMainBranchPool() {
  const MAIN_BRANCHES = [
    { id: "royalist", name: "保皇立宪派", lockCondition: { tagsAny: ["royalist_heart"] } },
    { id: "republican", name: "革命共和派", lockCondition: { tagsAny: ["revolutionary_seed"] } },
    { id: "moderate", name: "温和派", lockCondition: { tagsAny: ["moderate"] } }
  ];
  // 筛选可用主线
  state.availableBranches = MAIN_BRANCHES.filter(branch => {
    if (branch.lockCondition.tagsAny) {
      return branch.lockCondition.tagsAny.some(tag => state.tags.includes(tag));
    }
    return true;
  });
  // 兜底：无匹配则默认温和派
  if (state.availableBranches.length === 0) {
    state.availableBranches.push(MAIN_BRANCHES.find(b => b.id === "moderate"));
  }
}

// 推进少年事件
function advanceAdolescenceEvent() {
  state.adolescenceIndex += 1;
  const nextEvent = getCurrentAdolescenceEvent();
  if (!nextEvent) {
    // 少年期结束：合成复合特质 + 锁定主线分支
    synthesizeCompoundAttributes();
    lockMainBranchPool();
    // 跳转至青年期（暂提示未完成）
    alert("少年期结束，青年期内容尚未开发，当前已完成：\n1. 基础特质→复合特质合成\n2. 主线分支锁定：" + state.availableBranches.map(b => b.name).join(","));
    return;
  }
  renderAdolescenceEvent(nextEvent);
}

// 获取当前少年事件
function getCurrentAdolescenceEvent() {
  if (state.adolescenceIndex >= ADOLESCENCE_EVENTS.length) return null;
  const event = ADOLESCENCE_EVENTS[state.adolescenceIndex];
  if (matchOriginAndRegion(event, state)) {
    return event;
  }
  return ADOLESCENCE_EVENTS.find(e => e.id === "adolescence_unfinished");
}

// ====================== 8. 阶段切换核心函数 ======================
function transitionLifePhase(targetPhase) {
  state.lifePhase = targetPhase;
  // 阶段初始化逻辑
  switch (targetPhase) {
    case LIFE_PHASES.CHILDHOOD:
      initBaseAttributes();
      state.childhoodIndex = 0;
      renderChildhoodEvent(getCurrentChildhoodEvent());
      break;
    case LIFE_PHASES.ADOLESCENCE:
      state.adolescenceIndex = 0;
      renderAdolescenceEvent(getCurrentAdolescenceEvent());
      break;
    default:
      break;
  }
  // 更新UI显示当前阶段
  updatePhaseDisplay();
}

// ====================== 9. 渲染逻辑（核心UI） ======================
// 渲染童年事件
function renderChildhoodEvent(event) {
  if (!event) return;
  const eventContainer = document.getElementById("event-container");
  eventContainer.innerHTML = `
    <div class="event-title">${event.title}</div>
    <div class="event-desc">${event.desc}</div>
    <div class="choices">
      ${event.choices.map((choice, idx) => `
        <div class="choice" onclick="selectChildhoodChoice(${idx})">
          ${choice.text}
        </div>
      `).join("")}
    </div>
  `;
  // 更新角色状态面板
  updateCharacterPanel();
}

// 选择童年选项
function selectChildhoodChoice(choiceIndex) {
  const event = getCurrentChildhoodEvent();
  const choice = event.choices[choiceIndex];
  // 应用基础特质修改
  Object.entries(choice.baseTraits || {}).forEach(([trait, value]) => {
    state.baseTraits[trait] += value;
  });
  // 应用立场轴修改
  Object.entries(choice.axes || {}).forEach(([axis, value]) => {
    state.axes[axis] += value;
  });
  // 添加标签
  choice.tags?.forEach(tag => {
    if (!state.tags.includes(tag)) state.tags.push(tag);
  });
  // 显示选择结果
  alert(choice.desc);
  // 推进事件
  advanceChildhoodEvent();
}

// 渲染少年事件
function renderAdolescenceEvent(event) {
  if (!event) return;
  const eventContainer = document.getElementById("event-container");
  eventContainer.innerHTML = `
    <div class="event-title">${event.title}</div>
    <div class="event-desc">${event.desc}</div>
    <div class="choices">
      ${event.choices.map((choice, idx) => `
        <div class="choice" onclick="selectAdolescenceChoice(${idx})">
          ${choice.text}
        </div>
      `).join("")}
    </div>
  `;
  updateCharacterPanel();
}

// 选择少年选项
function selectAdolescenceChoice(choiceIndex) {
  const event = getCurrentAdolescenceEvent();
  const choice = event.choices[choiceIndex];
  // 保存特质加成（用于后续合成）
  state.traitBoost = choice.traitBoost || {};
  // 应用立场轴修改
  Object.entries(choice.axes || {}).forEach(([axis, value]) => {
    state.axes[axis] += value;
  });
  // 添加标签
  choice.tags?.forEach(tag => {
    if (!state.tags.includes(tag)) state.tags.push(tag);
  });
  // 显示选择结果
  alert(choice.desc);
  // 推进事件
  advanceAdolescenceEvent();
}

// 更新角色状态面板
function updateCharacterPanel() {
  const panel = document.getElementById("character-panel");
  // 基础特质展示
  const baseTraitsHtml = BASE_TRAITS.map(trait => `
    <div class="trait-item">
      <span>${trait.name}：</span>
      <span>${state.baseTraits[trait.id] || 0}</span>
      <span class="trait-desc">(${trait.desc})</span>
    </div>
  `).join("");
  // 复合特质展示（少年期后显示）
  let compoundTraitsHtml = "";
  if (state.lifePhase === LIFE_PHASES.ADOLESCENCE && Object.keys(state.compoundTraits).length > 0) {
    compoundTraitsHtml = `
      <div class="panel-section-title">复合特质</div>
      ${Object.entries(state.compoundTraits).map(([traitId, value]) => `
        <div class="trait-item">
          <span>${COMPOUND_TRAITS_FORMULA[traitId] ? 
            (traitId === "valor" ? "勇气" : 
             traitId === "scheming" ? "权谋" : 
             traitId === "eloquence" ? "口才" : 
             traitId === "diplomacy" ? "外交" : 
             traitId === "manipulation" ? "操控" : "神学") : traitId}：</span>
          <span>${value}</span>
        </div>
      `).join("")}
    `;
  }
  // 标签展示
  const tagsHtml = `
    <div class="panel-section-title">标签</div>
    <div class="tags-container">
      ${state.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
    </div>
  `;
  // 组装面板
  panel.innerHTML = `
    <div class="panel-title">角色状态（${state.lifePhase === LIFE_PHASES.CHILDHOOD ? "童年期" : "少年期"}）</div>
    <div class="panel-section-title">基础特质</div>
    ${baseTraitsHtml}
    ${compoundTraitsHtml}
    ${tagsHtml}
  `;
}

// 更新阶段显示
function updatePhaseDisplay() {
  document.getElementById("phase-display").textContent = 
    state.lifePhase === LIFE_PHASES.CHILDHOOD ? "童年期（1769-1783）" : 
    state.lifePhase === LIFE_PHASES.ADOLESCENCE ? "少年期（1783-1788）" : "未知阶段";
}

// ====================== 10. 初始化入口 ======================
// 替换原有初始化逻辑，启动童年阶段
function initGame() {
  // 选择初始身份（仅测试书记官之子+省城）
  state.origin = ORIGINS.find(o => o.id === "clerk_son");
  state.region = REGIONS.find(r => r.id === "provincial_city");
  state.gender = { id: "male", name: "男性" }; // 暂固定男性，女性线未完成
  
  // 启动童年阶段
  transitionLifePhase(LIFE_PHASES.CHILDHOOD);
}

// 页面加载后初始化
window.onload = initGame;