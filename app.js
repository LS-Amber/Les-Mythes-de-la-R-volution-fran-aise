// ============================================================
// 风暴中的一生 · app.js
// 试玩版:童年期 + 少年期(书记官之子 · 省城 · 男性)
// ============================================================

// ====================== 1. 枚举与配置 ======================
const LIFE_PHASES = {
  CHILDHOOD:   "childhood",
  ADOLESCENCE: "adolescence",
  YOUTH:       "youth",
  ADULTHOOD:   "adulthood",
  ENDING:      "ending"
};

const PHASE_LABEL = {
  childhood:   "童年期(1769 — 1783)",
  adolescence: "少年期(1783 — 1788)",
  youth:       "青年期(1789 — 1794)",
  adulthood:   "成年期(1794 — 1804)",
  ending:      "终局期(1804 — 1815)"
};

// 基础特质
const BASE_TRAITS = [
  { id: "determination", name: "决心", desc: "面对困境的坚韧与行动力" },
  { id: "perception",    name: "感知", desc: "对人心与环境的洞察力" },
  { id: "sensibility",   name: "灵性", desc: "对信仰与理想的共情力" },
  { id: "nobility",      name: "自尊", desc: "对身份与荣誉的执念" }
];

// 复合特质合成公式
const COMPOUND_TRAITS_FORMULA = {
  valor:        { name: "勇气", traits: ["determination", "nobility"],    weight: [0.6, 0.4] },
  scheming:     { name: "权谋", traits: ["determination", "perception"],  weight: [0.5, 0.5] },
  eloquence:    { name: "口才", traits: ["determination", "sensibility"], weight: [0.4, 0.6] },
  diplomacy:    { name: "外交", traits: ["perception",    "nobility"],    weight: [0.5, 0.5] },
  manipulation: { name: "操控", traits: ["perception",    "sensibility"], weight: [0.6, 0.4] },
  theology:     { name: "神学", traits: ["sensibility",   "nobility"],    weight: [0.7, 0.3] }
};

// 立场轴中文名(用于面板)
const AXES_LABEL = {
  regime: "政体", sovereignty: "主权", rule_of_law: "法治", equality: "平等",
  state_structure: "国家结构", religion: "宗教", war: "战争", order: "秩序"
};

// ====================== 2. 出身 / 地区 / 性别 ======================
const ORIGINS = [
  { id: "clerk_son", name: "书记官之子", desc: "父亲是省城的地方书记官,你从小接触文书与地方政务", ready: true },
  { id: "peasant",   name: "农民之子",   desc: "父亲是乡村佃农,你从小在田埂间长大",               ready: false },
  { id: "artisan",   name: "手工业者之子", desc: "父亲是巴黎的钟表匠,你从小熟悉工坊生活",          ready: false },
  { id: "noble",     name: "小贵族之子", desc: "父亲是外省小贵族,你拥有微薄的头衔",                ready: false }
];

const REGIONS = [
  { id: "provincial_city", name: "省城",   desc: "法国中部的省城,介于巴黎与乡村之间", ready: true },
  { id: "paris",           name: "巴黎",   desc: "革命的中心,风云变幻之地",            ready: false },
  { id: "countryside",     name: "西部乡村", desc: "保皇派根基深厚的旺代地区",          ready: false },
  { id: "border",          name: "北部边境", desc: "常年受战争影响的边境地带",          ready: false }
];

const GENDERS = [
  { id: "male",   name: "男性", desc: "在那个时代,享有更多的公民权利", ready: true },
  { id: "female", name: "女性", desc: "需要在父权与革命之间寻找出路",   ready: false }
];

// ====================== 3. 状态机 ======================
const state = {
  phase: "title",
  origin: null, region: null, gender: null,
  lifePhase: LIFE_PHASES.CHILDHOOD,

  axes:  { regime:0, sovereignty:0, rule_of_law:0, equality:0, state_structure:0, religion:0, war:0, order:0 },
  stats: { wealth:0, prestige:0, safety:1, influence:0 },
  tags:  [],

  baseTraits:    { determination:0, perception:0, sensibility:0, nobility:0 },
  compoundTraits: {},
  traitBoostAccum: { determination:0, perception:0, sensibility:0, nobility:0 },

  childhoodIndex: 0,
  adolescenceIndex: 0,

  lesserDeathCount: 0, maxLesserDeath: 3, isDead: false,
  availableBranches: [],

  // 临时:当前选项的结果展示
  pendingOutcome: null
};

// ====================== 4. 童年事件库 ======================
const CHILDHOOD_EVENTS = [
  {
    id: "childhood_1",
    title: "父亲的文书桌",
    desc: "1775 年,你六岁。父亲是省城的书记官,他的书桌永远堆满了官方文书、地契与信件。趁他外出,你偷偷爬上椅子,想触碰那些写满字的纸张。",
    choices: [
      {
        text: "模仿父亲的笔迹抄写文书 —— 哪怕写得歪歪扭扭",
        baseTraits: { determination: 4, perception: 2 },
        axes: { rule_of_law: 3, order: 2 },
        tags: ["early_learning", "respect_authority"],
        outcome: "父亲发现后没有责骂,反而笑着教你认字母。从此你对文字与规则有了天然的亲近感。在那个识字率不到三成的法兰西,你已悄悄走在了同龄人的前面。"
      },
      {
        text: "偷偷藏起一张盖有印章的官方纸条,当作玩具",
        baseTraits: { perception: 4, nobility: 2 },
        axes: { state_structure: 2 },
        tags: ["curious", "value_status"],
        outcome: "你摩挲着纸条上的红色印章,觉得这枚小小的印记仿佛拥有支配一切的力量。多年以后,你才明白那种力量叫做「权力」。"
      },
      {
        text: "对文书毫无兴趣,跑出去和街上的孩子玩闹",
        baseTraits: { determination: 2, sensibility: 3 },
        axes: { equality: 2, order: -1 },
        tags: ["people_friendly", "hate_bureaucracy"],
        outcome: "你和铁匠的儿子、面包师的女儿打成一片。那一天你第一次意识到,父亲的世界和普通人的世界,中间隔着一堵看不见的墙。"
      }
    ]
  },
  {
    id: "childhood_2",
    title: "1780 年的面包荒",
    desc: "1780 年,你十一岁。省城的面包价格暴涨,街头开始出现饥饿的流民。父亲深夜在家中叹气,说地方财政已无力救济。窗外不时传来骚动的声音。",
    choices: [
      {
        text: "听父亲分析危机的根源,理解政务的艰难",
        baseTraits: { perception: 3, determination: 2 },
        axes: { rule_of_law: 2, state_structure: 3 },
        tags: ["understand_governance", "sympathy_for_officials"],
        outcome: "你听着父亲讲述谷物贸易、税收、王室债务……第一次明白:秩序的维持需要代价,不是所有苦难都能靠善意解决。"
      },
      {
        text: "偷拿家里的零钱,给街头的乞丐买面包",
        baseTraits: { sensibility: 4, nobility: -1 },
        axes: { equality: 3, order: -2 },
        tags: ["compassionate", "anti_hierarchy"],
        outcome: "一位老妇人接过面包时跪了下来。那一刻你心里某种东西碎了 —— 你觉得那些冰冷的规则,本该为这些人服务,而非反过来。"
      },
      {
        text: "告诉父亲流民聚集的地点,希望他上报官府",
        baseTraits: { determination: 3, nobility: 2 },
        axes: { order: 3, equality: -1 },
        tags: ["law_abiding", "trust_system"],
        outcome: "父亲夸你有责任心,但官府的处理只是驱散流民 —— 问题并未解决,只是被推到了视线之外。你隐约觉得不对,却说不出哪里不对。"
      }
    ]
  },
  {
    id: "childhood_3",
    title: "父亲的教诲",
    desc: "1783 年,你十四岁。即将告别童年。一个雨夜,父亲在烛火下放下笔,对你说:「你已到了明事理的年纪。未来的路,要靠自己的选择。告诉我,你想成为什么样的人?」",
    choices: [
      {
        text: "「我想继承你的事业,成为一名书记官」",
        baseTraits: { nobility: 3, perception: 2 },
        axes: { regime: -1, order: 4 },
        tags: ["career_bureaucrat", "conservative"],
        outcome: "父亲欣慰地点头:「规则是文明的基石,哪怕它并不完美。记住这一点。」窗外的雨声中,你感到一种安稳的归属。"
      },
      {
        text: "「我想学习法律,为普通人争取公正」",
        baseTraits: { sensibility: 3, determination: 3 },
        axes: { equality: 3, rule_of_law: 2 },
        tags: ["idealist", "lawyer_dream"],
        outcome: "父亲沉默片刻,缓缓道:「公正的代价,往往是不被理解。你要做好准备,孩子。」他的眼神里有忧虑,也有一丝你读不懂的骄傲。"
      },
      {
        text: "「我想看看外面的世界,去巴黎求学」",
        baseTraits: { perception: 3, determination: 2 },
        axes: { sovereignty: 2, war: 1 },
        tags: ["ambitious", "paris_dream"],
        outcome: "父亲既担忧又骄傲:「巴黎是风暴的中心。你要守住自己的本心 —— 那里能成就一个人,也能毁掉一个人。」"
      }
    ]
  }
];

// ====================== 5. 少年事件库 ======================
const ADOLESCENCE_EVENTS = [
  {
    id: "adolescence_1",
    title: "1784 年 · 学业的方向",
    desc: "你十五岁。父亲为你安排了三条路:进入教会学校学习神学,进入法科学校钻研律法,或留在他身边学习政务。这是你第一次被赋予「选择」的权利。",
    choices: [
      {
        text: "进入法科学校,钻研法律条文",
        traitBoost: { perception: 2, determination: 1 },
        axes: { rule_of_law: 3 },
        tags: ["law_student", "rational"],
        outcome: "你沉迷于罗马法与本土法的对比,相信成文的法律是改变社会的根本。课堂上,一位年轻的讲师常常引用孟德斯鸠 —— 你从他那里第一次听到「三权分立」这个词。"
      },
      {
        text: "跟随父亲学习政务,熟悉地方管理",
        traitBoost: { nobility: 2, perception: 1 },
        axes: { state_structure: 3, order: 2 },
        tags: ["bureaucracy_apprentice", "pragmatic"],
        outcome: "你帮父亲处理文书、接待民众、协调税吏与农户。半年下来,你明白了一件事:政务的核心是平衡 —— 平衡贵族、平民、教会、王室,在所有人之间踩钢丝。"
      },
      {
        text: "拒绝父亲的安排,自学启蒙思想家的著作",
        traitBoost: { sensibility: 2, determination: 1 },
        axes: { equality: 3, regime: 2 },
        tags: ["enlightenment_fan", "rebel"],
        outcome: "你偷偷阅读卢梭与伏尔泰,夜里在被窝里点蜡烛抄写《社会契约论》。父亲发现后摇头叹息,但没有阻止你。某种东西在你心里发了芽。"
      }
    ]
  },
  {
    id: "adolescence_2",
    title: "外省贵族的到访",
    desc: "1786 年,你十七岁。一位名叫德·维尔福伯爵的外省贵族来到省城处理一桩地产纠纷。父亲让你陪同接待。伯爵的傲慢与他锦缎外衣下的傲慢气息,让你第一次近距离打量「特权阶级」。",
    choices: [
      {
        text: "迎合伯爵的喜好,流畅地完成接待",
        traitBoost: { nobility: 2, perception: 2 },
        axes: { regime: -2, order: 1 },
        tags: ["diplomatic", "adaptable"],
        outcome: "伯爵对你刮目相看,临走时许诺日后可在巴黎为你引荐。你嘴角微笑,心里却有一丝难以言说的不适 —— 仿佛吞下了一枚带涩味的橄榄。"
      },
      {
        text: "直言指出伯爵诉求中不合法理之处",
        traitBoost: { determination: 3, sensibility: 1 },
        axes: { rule_of_law: 3, equality: 2 },
        tags: ["courageous", "principled", "noble_grudge"],
        outcome: "伯爵震怒,拂袖而去。父亲连忙赔罪,但夜里他独自喝了一杯酒,拍着你的肩膀说:「你有骨头。这是好事 —— 也是祸事。」"
      },
      {
        text: "沉默观察,事后向父亲分析伯爵的弱点",
        traitBoost: { perception: 3, determination: 1 },
        axes: { state_structure: 1 },
        tags: ["scheming", "observant"],
        outcome: "你看清了伯爵的贪婪、虚荣与对债务的恐惧。那一晚你第一次意识到:权力的本质并非头衔,而是对他人欲望与恐惧的掌握。"
      }
    ]
  },
  {
    id: "adolescence_3",
    title: "1788 年 · 革命的低语",
    desc: "你十九岁。省城的咖啡馆里,到处是关于三级会议的讨论。有人高呼自由,有人担忧混乱,有人冷眼旁观。少年期即将结束 —— 你必须做出人生的第一个真正的选择:在即将到来的风暴中,你站在哪一边?",
    choices: [
      {
        text: "加入保皇派的青年团体,维护现有秩序",
        traitBoost: { nobility: 3, determination: 2 },
        axes: { regime: -8, order: 6, religion: 3 },
        tags: ["royalist_heart", "conservative"],
        outcome: "你认为革命只会带来混乱,君主制是法兰西历经千年的根基。你与一群同样想法的年轻人聚在教堂的偏厅里,以国王之名宣誓。"
      },
      {
        text: "加入激进的爱国者俱乐部,呼吁改革",
        traitBoost: { sensibility: 3, determination: 2 },
        axes: { regime: 8, equality: 6, sovereignty: 4 },
        tags: ["revolutionary_seed", "radical"],
        outcome: "你站在一群年轻人中间,听着一位律师慷慨激昂地谈论「人民的主权」。那一刻你心跳加速 —— 你相信只有彻底的变革,才能让法兰西获得新生。"
      },
      {
        text: "保持中立,专注于自己的学业与事业",
        traitBoost: { perception: 3, sensibility: 1 },
        axes: { rule_of_law: 4, order: 2 },
        tags: ["moderate", "pragmatic"],
        outcome: "你冷静地观察两边的人,觉得他们都太过激动。你相信无论谁掌权,法律与秩序才是根本。但你也知道,在风暴里,中立往往是最危险的位置。"
      }
    ]
  }
];

// ====================== 6. 主线分支定义 ======================
const MAIN_BRANCHES = [
  { id: "royalist",   name: "保皇立宪派", lockCondition: { tagsAny: ["royalist_heart"] } },
  { id: "republican", name: "革命共和派", lockCondition: { tagsAny: ["revolutionary_seed"] } },
  { id: "moderate",   name: "温和派",     lockCondition: { tagsAny: ["moderate"] } }
];

// ====================== 7. 屏幕切换 ======================
function goToScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "screen-select") renderSelectScreen();
}

// ====================== 8. 身份选择界面 ======================
let selection = { origin: "clerk_son", region: "provincial_city", gender: "male" };

function renderSelectScreen() {
  renderSelectGrid("origin-grid", ORIGINS, "origin");
  renderSelectGrid("region-grid", REGIONS, "region");
  renderSelectGrid("gender-grid", GENDERS, "gender");
  updateStartButton();
}

function renderSelectGrid(gridId, items, kind) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = items.map(item => `
    <div class="select-card ${!item.ready ? "disabled" : ""} ${selection[kind] === item.id ? "selected" : ""}"
         onclick="${item.ready ? `pickSelection('${kind}','${item.id}')` : ""}">
      ${!item.ready ? '<span class="select-card-badge">未完成</span>' : ""}
      <div class="select-card-name">${item.name}</div>
      <div class="select-card-desc">${item.desc}</div>
    </div>
  `).join("");
}

function pickSelection(kind, id) {
  selection[kind] = id;
  renderSelectScreen();
}

function updateStartButton() {
  const btn = document.getElementById("btn-start-life");
  const ok = ORIGINS.find(o => o.id === selection.origin)?.ready &&
             REGIONS.find(r => r.id === selection.region)?.ready &&
             GENDERS.find(g => g.id === selection.gender)?.ready;
  btn.disabled = !ok;
}

function startLife() {
  state.origin = ORIGINS.find(o => o.id === selection.origin);
  state.region = REGIONS.find(r => r.id === selection.region);
  state.gender = GENDERS.find(g => g.id === selection.gender);
  goToScreen("screen-game");
  transitionLifePhase(LIFE_PHASES.CHILDHOOD);
}

// ====================== 9. 阶段切换 ======================
function transitionLifePhase(targetPhase) {
  state.lifePhase = targetPhase;
  updatePhaseDisplay();

  switch (targetPhase) {
    case LIFE_PHASES.CHILDHOOD:
      state.childhoodIndex = 0;
      renderChildhoodEvent();
      break;
    case LIFE_PHASES.ADOLESCENCE:
      state.adolescenceIndex = 0;
      renderTransitionToAdolescence();
      break;
    case LIFE_PHASES.YOUTH:
      synthesizeCompoundAttributes();
      lockMainBranchPool();
      renderTransitionToYouth();
      break;
  }
}

// ====================== 10. 童年阶段 ======================
function renderChildhoodEvent() {
  const event = CHILDHOOD_EVENTS[state.childhoodIndex];
  if (!event) {
    transitionLifePhase(LIFE_PHASES.ADOLESCENCE);
    return;
  }
  renderEventCard(event, "childhood");
}

function selectChildhoodChoice(choiceIndex) {
  const event = CHILDHOOD_EVENTS[state.childhoodIndex];
  const choice = event.choices[choiceIndex];

  applyChoiceEffects(choice);
  showOutcome(choice, () => {
    state.childhoodIndex += 1;
    renderChildhoodEvent();
  });
}

// ====================== 11. 少年阶段 ======================
function renderTransitionToAdolescence() {
  const c = document.getElementById("event-container");
  c.innerHTML = `
    <div class="transition-card">
      <div class="year">— 1783 —</div>
      <h2>童年的尽头</h2>
      <p>十四岁的你告别了家中的小院,走进了少年的世界。父亲的教诲尚在耳边,但你已经隐约感到,有些东西正在远处的地平线上聚集 —— 像一场迟早要来的暴风雨。</p>
      <button class="btn btn-primary" onclick="enterAdolescence()">进入少年期</button>
    </div>
  `;
  updateCharacterPanel();
}

function enterAdolescence() {
  renderAdolescenceEvent();
}

function renderAdolescenceEvent() {
  const event = ADOLESCENCE_EVENTS[state.adolescenceIndex];
  if (!event) {
    transitionLifePhase(LIFE_PHASES.YOUTH);
    return;
  }
  renderEventCard(event, "adolescence");
}

function selectAdolescenceChoice(choiceIndex) {
  const event = ADOLESCENCE_EVENTS[state.adolescenceIndex];
  const choice = event.choices[choiceIndex];

  applyChoiceEffects(choice);
  // 累计 traitBoost(用于复合特质合成)
  Object.entries(choice.traitBoost || {}).forEach(([k, v]) => {
    state.traitBoostAccum[k] = (state.traitBoostAccum[k] || 0) + v;
  });

  showOutcome(choice, () => {
    state.adolescenceIndex += 1;
    renderAdolescenceEvent();
  });
}

// ====================== 12. 复合特质合成与主线锁定 ======================
function synthesizeCompoundAttributes() {
  state.compoundTraits = {};
  for (const [traitId, formula] of Object.entries(COMPOUND_TRAITS_FORMULA)) {
    let value = 0;
    formula.traits.forEach((baseTrait, index) => {
      const baseValue  = state.baseTraits[baseTrait] || 0;
      const boostValue = state.traitBoostAccum[baseTrait] || 0;
      value += (baseValue + boostValue) * formula.weight[index];
    });
    state.compoundTraits[traitId] = Math.round(value);
  }
  syncTraitsToAxes();
}

function syncTraitsToAxes() {
  // 复合特质轻度同步到立场轴(权重低,避免覆盖玩家选择)
  const c = state.compoundTraits;
  state.axes.order        += Math.round((c.valor || 0) * 0.3);
  state.axes.war          += Math.round((c.valor || 0) * 0.2);
  state.axes.sovereignty  += Math.round((c.scheming || 0) * 0.3);
  state.axes.equality     += Math.round((c.eloquence || 0) * 0.3);
  state.axes.state_structure += Math.round((c.diplomacy || 0) * 0.3);
}

function lockMainBranchPool() {
  state.availableBranches = MAIN_BRANCHES.filter(branch => {
    if (branch.lockCondition.tagsAny) {
      return branch.lockCondition.tagsAny.some(tag => state.tags.includes(tag));
    }
    return true;
  });
  if (state.availableBranches.length === 0) {
    state.availableBranches.push(MAIN_BRANCHES.find(b => b.id === "moderate"));
  }
}

function renderTransitionToYouth() {
  const c = document.getElementById("event-container");
  const traitItems = Object.entries(state.compoundTraits)
    .map(([id, val]) => `
      <div class="synthesis-item">
        <span class="synthesis-name">${COMPOUND_TRAITS_FORMULA[id].name}</span>
        <span class="synthesis-value">${val}</span>
      </div>
    `).join("");

  const branchNames = state.availableBranches.map(b => b.name).join(" / ");

  c.innerHTML = `
    <div class="transition-card">
      <div class="year">— 1788 —</div>
      <h2>少年的尽头</h2>
      <p>十九岁的你站在 1789 年的门槛前。童年的记忆与少年的选择,在你身上凝结成一个具体的人 —— 一个有具体性格、具体偏向、具体局限的人。</p>

      <div class="panel-section-title" style="text-align:center; border-bottom:1px dashed var(--line); padding-bottom:0.4em;">复合特质已合成</div>
      <div class="synthesis-grid">${traitItems}</div>

      <div class="branch-result">
        <div class="branch-result-label">你的人生轨迹已被锁定为</div>
        <div class="branch-result-name">${branchNames}</div>
      </div>

      <p style="font-size:0.92rem; color:var(--ink-faded); margin-top:2em;">
        — 试玩版到此结束 —<br>
        青年期(1789-1794)、成年期、终局期内容尚在开发中。<br>
        感谢你陪伴这个少年走到风暴的边缘。
      </p>
      <button class="btn" onclick="goToScreen('screen-title')">回到标题</button>
    </div>
  `;
  updateCharacterPanel();
}

// ====================== 13. 通用渲染:事件卡 ======================
function renderEventCard(event, phaseKind) {
  const c = document.getElementById("event-container");
  const handler = phaseKind === "childhood" ? "selectChildhoodChoice" : "selectAdolescenceChoice";

  c.innerHTML = `
    <h2 class="event-title">${event.title}</h2>
    <div class="event-desc">${event.desc}</div>
    <div class="choices">
      ${event.choices.map((ch, idx) => `
        <div class="choice" onclick="${handler}(${idx})">
          <div class="choice-text">${ch.text}</div>
          ${renderChoiceHint(ch)}
        </div>
      `).join("")}
    </div>
  `;
  updateCharacterPanel();
}

function renderChoiceHint(ch) {
  // 轻量提示:展示主要的特质方向
  const traits = ch.baseTraits || ch.traitBoost || {};
  const hints = Object.entries(traits)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      const name = BASE_TRAITS.find(t => t.id === k)?.name || k;
      return `${name}+${v}`;
    });
  return hints.length ? `<span class="choice-hint">[ ${hints.join(" · ")} ]</span>` : "";
}

function applyChoiceEffects(choice) {
  Object.entries(choice.baseTraits || {}).forEach(([k, v]) => {
    state.baseTraits[k] = (state.baseTraits[k] || 0) + v;
  });
  Object.entries(choice.axes || {}).forEach(([k, v]) => {
    state.axes[k] = (state.axes[k] || 0) + v;
  });
  (choice.tags || []).forEach(tag => {
    if (!state.tags.includes(tag)) state.tags.push(tag);
  });
}

function showOutcome(choice, onContinue) {
  const c = document.getElementById("event-container");
  // 在事件卡底部追加结果
  const effects = [];
  Object.entries(choice.baseTraits || {}).forEach(([k, v]) => {
    const name = BASE_TRAITS.find(t => t.id === k)?.name || k;
    effects.push(`<span>${name} ${v > 0 ? "+" : ""}${v}</span>`);
  });
  Object.entries(choice.traitBoost || {}).forEach(([k, v]) => {
    const name = BASE_TRAITS.find(t => t.id === k)?.name || k;
    effects.push(`<span>${name} ${v > 0 ? "+" : ""}${v}</span>`);
  });
  Object.entries(choice.axes || {}).forEach(([k, v]) => {
    const name = AXES_LABEL[k] || k;
    effects.push(`<span>${name} ${v > 0 ? "+" : ""}${v}</span>`);
  });
  (choice.tags || []).forEach(tag => effects.push(`<span>+「${tag}」</span>`));

  // 隐藏选项区
  const choicesEl = c.querySelector(".choices");
  if (choicesEl) choicesEl.style.display = "none";

  const block = document.createElement("div");
  block.className = "outcome-block";
  block.innerHTML = `
    ${choice.outcome}
    <div class="outcome-effects">${effects.join("")}</div>
    <div class="outcome-actions">
      <button class="btn btn-primary" id="btn-continue">继续 →</button>
    </div>
  `;
  c.appendChild(block);
  document.getElementById("btn-continue").onclick = onContinue;
  updateCharacterPanel();
}

// ====================== 14. 角色面板 ======================
function updateCharacterPanel() {
  const panel = document.getElementById("character-panel");

  const baseHtml = BASE_TRAITS.map(t => `
    <div class="trait-item">
      <span class="trait-name">${t.name}</span>
      <span class="trait-val">${state.baseTraits[t.id] || 0}</span>
    </div>
  `).join("");

  let compoundHtml = "";
  if (Object.keys(state.compoundTraits).length > 0) {
    compoundHtml = `
      <div class="panel-section-title">复合特质</div>
      ${Object.entries(state.compoundTraits).map(([id, v]) => `
        <div class="trait-item">
          <span class="trait-name">${COMPOUND_TRAITS_FORMULA[id].name}</span>
          <span class="trait-val">${v}</span>
        </div>
      `).join("")}
    `;
  }

  // 立场轴:仅展示非零项
  const axesEntries = Object.entries(state.axes).filter(([_, v]) => v !== 0);
  let axesHtml = "";
  if (axesEntries.length > 0) {
    axesHtml = `
      <div class="panel-section-title">立场</div>
      ${axesEntries.map(([k, v]) => `
        <div class="trait-item">
          <span class="trait-name">${AXES_LABEL[k] || k}</span>
          <span class="trait-val">${v > 0 ? "+" : ""}${v}</span>
        </div>
      `).join("")}
    `;
  }

  let tagsHtml = "";
  if (state.tags.length > 0) {
    tagsHtml = `
      <div class="panel-section-title">标签</div>
      <div class="tags-container">
        ${state.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
    `;
  }

  const idHtml = state.origin ? `
    <div class="trait-item" style="border:none; padding-bottom:0.6em;">
      <span class="trait-name" style="font-style:italic;">${state.origin.name} · ${state.region.name}</span>
    </div>
  ` : "";

  panel.innerHTML = `
    <div class="panel-title">角色状态</div>
    ${idHtml}
    <div class="panel-section-title">基础特质</div>
    ${baseHtml}
    ${compoundHtml}
    ${axesHtml}
    ${tagsHtml}
  `;
}

function updatePhaseDisplay() {
  const el = document.getElementById("phase-display");
  if (el) el.textContent = PHASE_LABEL[state.lifePhase] || "";
}

function toggleSidebar() {
  const p = document.getElementById("character-panel");
  p.style.display = p.style.display === "none" ? "" : "none";
}

// ====================== 15. 启动 ======================
window.addEventListener("DOMContentLoaded", () => {
  goToScreen("screen-title");
});
