/* Navigation tags for the existing manuals, not new treatment guidance.
   Each leaf route below was reviewed against its problem and measures. A leaf
   may appear under several types, but its original detail page stays intact.
   Route + normalized title guards against silently misclassifying a reordered
   source snapshot. Run check-hazard-types.cjs when either manual changes. */
(() => {
  const types = [
    { id: 'intersection', label: '交叉口', description: '平交路口、接入口与渠化组织', icon: 'intersection' },
    { id: 'facilities', label: '交通设施', description: '标志标线、信号、护栏与照明', icon: 'facilities' },
    { id: 'bridges', label: '桥梁隧道', description: '桥梁病害、隧道与洞口安全', icon: 'bridge' },
    { id: 'drainage', label: '排水设施', description: '沟渠疏通、路面积水与排水改造', icon: 'drainage' },
    { id: 'slopes', label: '边坡', description: '边坡修整、山体遮挡与防护', icon: 'slope' },
    { id: 'engineering', label: '道路工程', description: '路线线形、横断面与路面修复', icon: 'road' },
    { id: 'speed', label: '速度管理', description: '限速设置、减速设施与速度协调', icon: 'speed' },
    { id: 'roadside', label: '路侧环境', description: '路侧障碍、临水临崖与通行干扰', icon: 'shield' }
  ];
  const codes = { I: 'intersection', F: 'facilities', B: 'bridges', D: 'drainage', L: 'slopes', E: 'engineering', S: 'speed', R: 'roadside' };
  const cleanTitle = value => String(value || '').replace(/^\s*\d+(?:\.\d+)*\s*/, '').trim();
  // I: intersections, F: traffic facilities, B: bridges/tunnels, D: drainage,
  // L: slopes, E: road engineering, S: speed management, R: roadside environment.
  // Slope tags are only the six reviewed earthwork/fill-slope entries below:
  // gsg 3/0 (缓边坡), 5/1 (开挖山体), 6/0 (填方边坡/路肩挡墙);
  // rural 2/0/1, 2/1, 2/4/1 (局部开挖、削坡). A road's longitudinal
  // gradient, “断崖式限速”, and generic references to hills never add this tag.
  // Drainage includes explicit ditch reconstruction and drainage-design measures;
  // merely mentioning rain, water beside a road, or a bridge does not add a tag.
  const reviewed = `
gsg/0/0 | 行车视距不足 | IFR
gsg/0/1/0 | 渠化设计缺失 | IFE
gsg/0/1/1 | 车道设置不合理 | IFE
gsg/0/1/2 | 行人路权保障不足 | IFE
gsg/0/1/3 | 非机动车路权保障不足 | IFE
gsg/0/1/4 | 交通控制设施设置不合理 | IFS
gsg/0/2 | 交通管理方式不合理 | IF
gsg/0/3/0 | 斜交交叉口 | IFE
gsg/0/3/1 | 多路交叉口 | IE
gsg/0/3/2 | 错位交叉口 | IFE
gsg/0/3/3 | 交叉口尺度偏大 | IFE
gsg/0/3/4/0 | 弯道路段设置交叉口 | IFES
gsg/0/3/4/1 | 下坡路段设置交叉口 | IFES
gsg/0/3/4/2 | 次要公路纵坡过大 | IFDES
gsg/0/4 | 交叉范围存在接入口 | IE
gsg/0/5 | 交叉间距不合理 | IE
gsg/1/0 | 接入口设置不合理 | IE
gsg/1/1 | 视距不足 | IR
gsg/1/2 | 交通控制不合理 | IF
gsg/1/3 | 缺少道口标柱设施 | IF
gsg/2/0 | 路网结构不合理 | IE
gsg/2/1/0 | 人行道不完善 | ER
gsg/2/1/1 | 行人过街安全岛设置不当 | FE
gsg/2/1/2 | 非机动车道缺失 | E
gsg/2/1/3 | 非机动车道不连续 | E
gsg/2/1/4 | 非机动车道宽度不足 | E
gsg/2/1/5 | 非机动车通道内有障碍物 | R
gsg/2/1/6 | 摩托车道缺失 | E
gsg/2/2/0 | 中央隔离设施设置不当 | F
gsg/2/2/1 | 中央分隔带开口设置不合理 | FE
gsg/2/2/2 | 护栏防护等级不足 | FR
gsg/2/2/3 | 护栏立柱直径、长度、埋深或间距不足 | FR
gsg/2/2/4 | 护栏端头处置不当 | FR
gsg/2/2/5 | 机非隔离设施设置不当 | F
gsg/2/3 | 照明设施缺失、照度不足 | F
gsg/2/4 | 学校周边道路设施设计不合理 | FESR
gsg/2/5 | 公交车停靠站设计不合理 | FER
gsg/3/0 | 急弯路段 | FDLESR
gsg/4/0 | 速度控制不合理 | FS
gsg/4/1 | 缺乏避险车道、防护等安全设施 | FE
gsg/5/0 | 横断面设计不合理 | FDE
gsg/5/1 | 视距不良 | FLER
gsg/6/0 | 路侧护栏缺失 | FLR
gsg/6/1 | 标志标线缺失 | FSR
gsg/7/0 | 接缝破损 | BE
gsg/7/1 | 标志标线设置不完善 | FBS
gsg/7/2 | 桥梁护栏设置不合理 | FB
gsg/8/0 | 横断面衔接过渡不顺畅 | FBE
gsg/8/1 | 隧道标志标线不合理 | FB
gsg/8/2 | 隧道洞口亮度及照明过渡不合理 | FB
gsg/8/3 | 隧道出入口抗滑能力不良 | BE
gsg/9/0 | 排水不畅 | D
gsg/9/1 | 超高渐变段积水严重 | DE
gsg/10/0 | 限速设施缺失 | FS
gsg/10/1 | 减速标线施划不合理 | FS
gsg/10/2 | 断崖式限速 | S
gsg/10/3 | 限速路段长度过短 | S
rural/0/0/0 | 人行道及非机动车道缺失或不连续 | FER
rural/0/0/1 | 行人过街设施缺失 | FE
rural/0/1 | 穿村镇路段接入口密集 | IFE
rural/0/2 | 夜间照明不足 | F
rural/0/3/0 | 交通标线错漏、模糊不清 | F
rural/0/3/1 | 交通标志设置不合理 | FR
rural/0/3/2/0 | 中央隔离设施设置不合理 | F
rural/0/3/2/1 | 机非隔离设施设置不合理 | F
rural/0/4 | 路宅界限不明确 | FR
rural/0/5 | 速度控制不合理 | FS
rural/0/6 | 路侧环境干扰严重 | R
rural/1/0 | 学校周边路段 | FESR
rural/2/0/0 | 弯道半径过小 | FDE
rural/2/0/1 | 视距不良 | FLER
rural/2/0/2 | 视线诱导不良 | F
rural/2/0/3 | 路侧护栏缺失或防护不足 | FR
rural/2/0/4 | 标志标线设置不合理 | FS
rural/2/0/5 | 速度控制不合理 | FS
rural/2/1 | 连续急弯路段 | FLESR
rural/2/2/0 | 路侧护栏缺失或防护不足 | FR
rural/2/2/1 | 交通标志、标线设置缺失 | FS
rural/2/2/2 | 速度控制不合理 | FS
rural/2/3/0 | 避险车道缺失 | FE
rural/2/3/1 | 路侧护栏缺失或防护不足 | FR
rural/2/3/2 | 交通标志、标线设置不佳或缺失 | FS
rural/2/3/3 | 速度控制不合理 | FS
rural/2/4/0 | 路线平纵组合不良 | FDE
rural/2/4/1 | 视距不良 | FLER
rural/2/4/2 | 视线诱导不良 | F
rural/2/4/3 | 路侧护栏缺失或防护不足 | FR
rural/2/4/4 | 路面抗滑性能不足 | DE
rural/2/4/5 | 标志标线设置不合理 | FS
rural/2/4/6 | 速度控制不合理 | FS
rural/3/0/0 | 临水侧防护设施缺失或不足 | FR
rural/3/0/1 | 标志标线缺失 | FSR
rural/3/1/0 | 临崖侧防护设施缺失或防护等级不足 | FR
rural/3/1/1 | 标志标线缺失 | FSR
rural/3/2 | 其他险要路段 | FR
rural/4/0/0 | 桥头接小半径曲线 | FBDES
rural/4/0/1 | 宽路窄桥 | FBES
rural/4/0/2 | 桥梁不均匀沉降 | FBES
rural/4/0/3 | 桥梁护栏设置不合理 | FB
rural/4/0/4 | 标志标线设置不完善 | FBS
rural/4/1/0 | 立面标记缺失 | FB
rural/4/1/1 | 限高设施缺失 | FB
rural/4/1/2 | 隧道积水 | FBD
rural/5/0 | 接入口密集 | IE
rural/5/1 | 视距不良 | IFR
rural/5/2 | 接入口存在陡坡 | IFE
rural/5/3 | 交通控制不合理 | IF
rural/6/0/0 | 斜交交叉口 | IFE
rural/6/0/1 | 多路交叉口 | IE
rural/6/0/2 | 错位交叉口 | IFE
rural/6/0/3 | 交叉口尺度偏大 | IFE
rural/6/0/4/0 | 弯道路段设置交叉口 | IFES
rural/6/0/4/1 | 下坡路段设置交叉口 | IFES
rural/6/0/4/2 | 次要公路纵坡过大 | IFDES
rural/6/1 | 行车视距不足 | IFR
rural/6/2/0 | 渠化设计缺失 | IFE
rural/6/2/1 | 行人路权保障不足 | IFE
rural/6/2/2 | 非机动车路权保障不足 | IFE
rural/6/2/3 | 交通控制设施设置不合理 | IFS
rural/6/3 | 交通管理方式不合理 | IF
rural/6/4 | 交叉范围存在接入口 | IE
rural/6/5 | 交叉间距不合理 | IE
rural/7/0 | 限速设施缺失 | FS
rural/7/1 | 特殊路段限速不合理 | S
rural/7/2 | 断崖式限速 | S
rural/7/3 | 限速路段长度过短 | S
`;
  const routes = new Map(reviewed.trim().split('\n').map(line => {
    const [route, title, tags] = line.split('|').map(part => part.trim());
    return [route, { title, tags: new Set([...tags].map(code => codes[code])) }];
  }));
  function classify(entry) {
    if (!entry?.props || !entry.item || entry.item.sub) return [];
    const p = entry.props;
    if (!['gsg', 'rural'].includes(p.id) || !['ci', 'hi'].every(key => Number.isInteger(p[key]) && p[key] >= 0)) return [];
    if (['si', 'sji'].some(key => p[key] !== undefined && (!Number.isInteger(p[key]) || p[key] < 0))) return [];
    if (p.sji !== undefined && p.si === undefined) return [];
    const route = ['id', 'ci', 'hi', 'si', 'sji'].map(key => p[key]).filter(value => value !== undefined).join('/');
    const match = routes.get(route);
    if (!match || match.title !== cleanTitle(entry.item.n)) return [];
    return types.filter(type => match.tags.has(type.id)).map(type => type.id);
  }
  // These patterns only choose a verbatim preview from an already classified
  // leaf. They never affect curated membership or create treatment guidance.
  const measureTopics = {
    intersection: /平面交叉|交叉口|接入口|出入口|渠化|路口/,
    facilities: /标志|标线|信号灯|护栏|照明|诱导|凸面镜|道口|警示|防护设施/,
    bridges: /桥梁|桥头|伸缩缝|隧道|洞口|限高|沉降/,
    drainage: /排水|积水|边沟|沟渠|截水沟|疏浚|水位/,
    slopes: /缓边坡|填方边坡|削坡|开挖弯道内侧山体|路肩挡墙/,
    engineering: /加宽|拓宽|改线|线形|横断面|纵坡|超高|路面|人行道|非机动车道|摩托车道|接缝|伸缩缝|沉降|工程改造|移位/,
    speed: /限速|减速|限制速度|速度控制|测速|速度管理/,
    roadside: /路侧|障碍物|树木|灌木|杂草|绿化|临水|临崖|路宅|占道|违停|停车/
  };
  function measureText(entry, type) {
    const measures = (entry?.item?.m || []).map(measure => typeof measure === 'string' ? measure : measure?.text).filter(text => typeof text === 'string' && text.trim());
    const topic = measureTopics[type];
    if (!topic) return measures[0] || '';
    const text = measures.find(measure => topic.test(measure));
    if (!text) return measures[0] || '';
    // A later clause may contain the relevant work (e.g. ditch reshaping after
    // lane widening). Only extract a complete clause that states its own
    // condition. Never split on commas, or drop “有条件时/对于…可行时”. Other
    // paragraphs are returned whole to preserve preceding qualifications.
    const clauses = text.match(/[^。！？；;]+(?:[。！？；;]|$)/g) || [text];
    const clause = clauses.find(part => topic.test(part));
    if (clause && clause !== clauses[0] && /^(对于|针对|有边沟的|有条件时|当[^时]*时|如果|若)/.test(clause.trim())) return clause.trim();
    return text;
  }
  window.RoadHazardTypes = Object.freeze({ types: Object.freeze(types.map(Object.freeze)), classify, measureText });
})();
