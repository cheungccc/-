/* App 2.0 screens. The two source manuals remain the content source of truth. */
(() => {
  if (document.documentElement.dataset.uiTheme !== 'app') return;
  const screens = new Set(['Home', 'AI', 'Knowledge', 'HazardTypes', 'TypeResults', 'Profile', 'ProfileDetails', 'AccountSecurity', 'ProfileLogin', 'Recent', 'Favorites', 'Cases']);
  const hazardTypes = window.RoadHazardTypes;
  const storageKey = 'road-safety-app-v2';
  const routeKeys = ['id', 'ci', 'hi', 'si', 'sji'];
  // This account only previews the signed-in interface; it is not an authenticated session.
  const accountPreviewKey = 'road-safety-account-preview';
  const exampleAccount = { name: '陈明', unit: '示例单位', role: '道路巡查员', phone: '138 **** 2468' };
  let accountPreviewActive = true;
  try { accountPreviewActive = sessionStorage.getItem(accountPreviewKey) !== 'signed-out'; } catch {}
  let records = { recent: [], favorites: [] }, storageAvailable = true, lastDetail = '', caseFilterOpen = false;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const key of ['recent', 'favorites']) {
      records[key] = Array.isArray(saved?.[key]) ? saved[key].slice(0, 200) : [];
    }
  } catch { storageAvailable = false; }

  function icon(name) {
    const paths = {
      home: ['m3 10 9-7 9 7', 'M5 9v11h5v-6h4v6h5V9'],
      camera: ['M4 7h4l2-3h4l2 3h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z', 'M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
      book: ['M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z', 'M12 5v16'],
      user: ['M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M3 21a9 9 0 0 1 18 0Z'],
      grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
      guide: ['M5 3h14v18H5z', 'M9 7h6M9 11h6M9 15h4'],
      image: ['M3 3h18v18H3z', 'm3 17 6-7 5 5 3-3 4 5', 'M17 7h.01'],
      star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z'],
      clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 7v5l3 2'],
      spark: ['m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z'],
      type: ['M4 5h12M10 5v15M6 20h8M16 13h6M19 13v7'],
      next: ['M4 12h16m-6-6 6 6-6 6'],
      check: ['m5 12 4 4L19 6'],
      filter: ['M3 4h18l-7 8v7l-4 2v-9Z'],
      intersection: ['M8 2v6H2m14-6v6h6M2 16h6v6m14-6h-6v6', 'M12 2v3m0 14v3M2 12h3m14 0h3'],
      facilities: ['M8 2h8v16H8zM12 18v4M9 22h6', 'M12 6h.01M12 10h.01M12 14h.01'],
      bridge: ['M2 16h20M5 16V5m14 11V5M2 12c4 0 6-6 10-6s6 6 10 6', 'M8 8v8m4-10v10m4-8v8M5 16v6m14-6v6'],
      drainage: ['M4 3h16v10H4zM8 6v4m4-4v4m4-4v4', 'M2 17c2-2 4 2 6 0s4 2 6 0 4 2 8 0M2 21c2-2 4 2 6 0s4 2 6 0 4 2 8 0'],
      slope: ['M2 21h20M3 21 8 8h5l6 13M8 8l2-5h4l2 5', 'm6 14 9 3M9 10l6 2M5 18l8 3'],
      speed: ['M4 19a10 10 0 1 1 16 0Z', 'm12 14 5-6M6 13H4m2-6 2 2m4-6v3m6 7h2']
    };
    if (!paths[name]) return uiIcon(name);
    return s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, ...paths[name].map(d => s('path', { d })));
  }
  function button(cn, action, ...content) { return h('button', { type: 'button', cn, onclick: action }, ...content); }
  function backButton(action, label = '返回上一页') {
    return h('button', { type: 'button', cn: 'app-type-back', 'aria-label': label, onclick: action }, icon('back'));
  }
  function propsOnly(p) {
    const clean = {};
    routeKeys.forEach(key => { if (p?.[key] !== undefined) clean[key] = p[key]; });
    return clean;
  }
  function keyOf(p) { return routeKeys.map(key => p?.[key] ?? '').join(':'); }
  function entry(p) {
    if (!p || !['gsg', 'rural'].includes(p.id)) return null;
    if (!['ci', 'hi'].every(k => Number.isInteger(p[k]) && p[k] >= 0)) return null;
    if (['si', 'sji'].some(k => p[k] !== undefined && (!Number.isInteger(p[k]) || p[k] < 0))) return null;
    const manual = DATA?.[p.id], category = manual?.cat[p.ci];
    let item = category?.h[p.hi];
    if (p.si !== undefined) item = item?.sub?.[p.si];
    if (p.sji !== undefined) item = p.si === undefined ? null : item?.sub?.[p.sji];
    if (!item || item.sub) return null;
    return { props: propsOnly(p), item, category, manual };
  }
  function savedEntries(kind) {
    const seen = new Set();
    return records[kind].flatMap(record => {
      const found = entry(record?.props), key = keyOf(record?.props);
      if (!found || seen.has(key)) return [];
      seen.add(key);
      return [{ ...found, at: Number.isFinite(record.at) && record.at > 0 && record.at <= Date.now() ? record.at : 0 }];
    });
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); storageAvailable = true; }
    catch { storageAvailable = false; }
  }
  function allEntries() {
    const result = [];
    for (const id of ['gsg', 'rural']) DATA[id].cat.forEach((category, ci) => {
      const visit = (items, props, level, ancestors = []) => items.forEach((item, index) => {
        const next = { ...props, [['hi', 'si', 'sji'][level]]: index };
        if (item.sub) visit(item.sub, next, level + 1, [...ancestors, item]);
        else result.push({ props: next, item, category, manual: DATA[id], ancestors });
      });
      visit(category.h, { id, ci }, 0);
    });
    return result;
  }
  function search() { searchQ = ''; searchTab = 'all'; nav('Search'); }
  function heading(title, subtitle) { return D('app-page-heading', h('h1', {}, title), h('p', {}, subtitle)); }
  function section(title, label, action) {
    return D('app-section-head', h('h2', {}, title), label ? button('app-text-button', action, label, icon('arrow')) : null);
  }
  function searchButton(label = '搜索道路隐患、治理措施') { return button('app-search', search, icon('search'), h('span', {}, label), icon('arrow')); }
  function empty(symbol, title, description, label, action) {
    return D('app-empty', icon(symbol), h('h3', {}, title), h('p', {}, description), label ? button('app-text-button', action, label, icon('arrow')) : null);
  }
  function timeLabel(at) {
    if (!at) return '';
    const date = new Date(at), now = new Date();
    return date.toDateString() === now.toDateString() ? '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) : date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  }
  function recordList(items, showMeasures = false) {
    return D('app-records', ...items.map(({ props, item, category, manual, at }) => {
      const picture = item.imgs?.find(img => img.tp === 'problem') || item.imgs?.[0];
      return button('app-record', () => nav('HazardDetail', props),
        picture ? h('img', { src: 'assets/' + props.id + '/' + picture.f, alt: '', loading: 'lazy', width: '64', height: '64' }) : D('app-record-placeholder', icon('guide')),
        D('app-record-copy', h('strong', {}, item.n), h('small', {}, manual.name + ' · ' + category.n),
          showMeasures ? h('p', { cn: 'app-measure-preview' }, measurePreview({ props, item, category, manual }, showMeasures)) : null),
        at ? h('time', { datetime: new Date(at).toISOString() }, timeLabel(at)) : null, icon('arrow'));
    }));
  }
  function measurePreview(entry, type) {
    const first = entry.item.m?.find(m => typeof m === 'string' ? m.trim() : m.text?.trim());
    const original = hazardTypes.measureText?.(entry, type) || (typeof first === 'string' ? first : first?.text || '');
    const text = original.replace(/^\s*[（(]?\d+[）)、.]\s*/, '').replace(/\s+/g, ' ').trim();
    return text ? '治理措施：' + (text.length > 68 ? text.slice(0, 68) + '…' : text) : '查看完整治理措施与手册图表';
  }
  function home() {
    const recent = savedEntries('recent').slice(0, 3);
    return D('app-page app-home',
      D('app-hero', D('app-hero-top', D('app-hero-title', h('h1', {}, '道路安全'), h('p', {}, '排查有据 治理有方')),
        D('app-hero-note', h('img', { src: 'assets/road-safety-icon.png', alt: '道路隐患排查治理助手 App 图标', width: '32', height: '32' }), h('span', {}, '守护每一段路'), h('span', {}, '让出行更安全')))),
      D('app-content',
        D('app-ai-card', D('app-ai-copy', h('small', { cn: 'app-eyebrow' }, icon('spark'), 'AI POWERED'),
          h('h2', {}, 'AI 隐患识别'), h('p', {}, '拍照识别道路隐患 · 获取治理建议'),
          button('app-primary', () => nav('AI'), '开始识别', icon('next'))),
        D('app-camera-art', icon('camera'), h('p', {}, '随手一拍', h('br'), '让隐患无处遁形'))),
        searchButton(), section('常用功能', '更多', () => nav('Knowledge')),
        D('app-shortcuts', ...[
          ['grid', '隐患分类', '按类型查找', 'HazardTypes'], ['guide', '治理指引', '标准与方案', 'Knowledge'],
          ['image', '案例库', '典型案例参考', 'Cases'], ['star', '收藏记录', '我的常用内容', 'Favorites']
        ].map(([symbol, title, subtitle, screen]) => button('app-shortcut', () => nav(screen), icon(symbol), h('strong', {}, title), h('small', {}, subtitle)))),
        section('最近查看', '全部', () => nav('Recent')),
        recent.length ? recordList(recent) : empty('clock', '继续阅读，从这里开始', '浏览过的治理指引会保存在这里', '去知识库看看', () => nav('Knowledge'))
      ));
  }
  function knowledge(byType = false) {
    const entries = allEntries();
    if (!byType) {
      const examples = caseEntries(entries);
      const firstRural = examples.find(example => example.props.id === 'rural');
      const featured = [examples.find(example => example.props.id === 'gsg'), firstRural,
        examples.find(example => example.props.id === 'rural' && example.props.ci !== firstRural?.props.ci)].filter(Boolean);
      return D('app-page app-knowledge app-knowledge-home',
        D('app-page-heading', h('h1', {}, '知识库'), h('p', {}, '专业的道路隐患治理知识库', h('br'), '查问题 · 找方案 · 学案例')),
        D('app-content', searchButton('搜索隐患、设施、治理措施'),
          D('app-knowledge-modules',
            button('app-knowledge-module is-active', () => nav('HazardTypes'), icon('grid'), h('strong', {}, '隐患分类'), h('small', {}, '分类查阅治理指引')),
            button('app-knowledge-module app-module-cases', () => nav('Cases'), icon('guide'), h('strong', {}, '典型案例'), h('small', {}, '查阅手册改善案例'))),
          section('按类型查找', '全部分类', () => nav('HazardTypes')),
          D('app-category-grid', ...['engineering', 'facilities', 'bridges', 'intersection', 'drainage', 'slopes'].map(id => {
            const type = hazardTypes.types.find(type => type.id === id);
            const count = entries.filter(entry => hazardTypes.classify(entry).includes(id)).length;
            return h('button', { type: 'button', cn: 'app-category-tile', 'data-hazard-type': id, onclick: () => nav('TypeResults', { type: id, road: 'all' }) },
              D('app-category-icon', icon(type.icon)), D('app-category-copy', h('strong', {}, type.label), h('small', {}, count + ' 项指引')));
          })),
          roadChoices(),
          section('典型案例', '查看全部', () => nav('Cases')), caseList(featured)));
    }
    return D('app-page app-knowledge app-hazard-knowledge',
      backButton(() => nav('Knowledge'), '返回知识库'),
      heading('隐患知识', '按隐患类型查找，或按道路类型查阅完整指引'), D('app-content', searchButton(),
        typeChoices(entries), roadChoices(),
        h('p', { cn: 'app-knowledge-note' }, icon('shield'), '两本完整手册已收录，保留原有图表与治理措施。')));
  }
  function roadChoices() {
    return D('app-road-choices', section('选择道路类型'),
      D('app-road-guides', ...['gsg', 'rural'].map(id => button('app-road-guide app-manual-card ' + id, () => nav('Category', { id }),
        D('app-manual-icon', icon(id === 'gsg' ? 'road' : 'rural')), D('', h('strong', {}, id === 'gsg' ? '国省道' : '农村公路'), h('small', {}, '治理指引')), icon('arrow')))));
  }
  function typeChoices(entries) {
    return D('app-type-choices', section('按类型查找'),
      h('p', { cn: 'app-knowledge-note' }, '汇集两本指引，按隐患类型查找治理措施。'),
      D('app-hazard-type-grid', ...hazardTypes.types.map(type => {
        const count = entries.filter(entry => hazardTypes.classify(entry).includes(type.id)).length;
        return h('button', { type: 'button', cn: 'app-hazard-type', 'data-hazard-type': type.id, onclick: () => nav('TypeResults', { type: type.id, road: 'all' }) },
          D('app-hazard-type-icon', icon(type.icon)), h('strong', {}, type.label), h('p', {}, type.description),
          h('span', { cn: 'app-type-count' }, count ? count + ' 项指引' : '暂未收录'), icon('arrow'));
      })), h('p', { cn: 'app-knowledge-note' }, '涉及多个类型的隐患，可从不同分类中查阅同一份指引。'));
  }
  function typeResults() {
    const type = hazardTypes.types.find(type => type.id === curProps.type);
    const road = curProps.road || 'all';
    const all = allEntries().filter(entry => hazardTypes.classify(entry).includes(type.id));
    const items = road === 'all' ? all : all.filter(entry => entry.props.id === road);
    return D('app-page app-type-results',
      backButton(() => nav('HazardTypes'), '返回隐患类型'),
      heading(type.label, type.description), D('app-content',
        h('div', { cn: 'app-pills', role: 'group', 'aria-label': '按道路类型筛选' }, ...[
          ['all', '全部'], ['gsg', '国省道'], ['rural', '农村公路']
        ].map(([id, label]) => h('button', { type: 'button', 'aria-pressed': String(road === id), 'data-road-filter': id,
          onclick: () => nav('TypeResults', { type: type.id, road: id }) }, label + ' ' + (id === 'all' ? all.length : all.filter(entry => entry.props.id === id).length)))),
        h('p', { cn: 'app-type-summary', role: 'status' }, '共 ' + items.length + ' 项治理指引 · 点击查看完整措施'),
        items.length ? recordList(items, type.id) : empty(type.icon, '暂无对应指引', '当前手册尚未收录这一类型的对应内容，可切换道路范围或查看其他隐患类型。', '查看其他类型', () => nav('HazardTypes'))));
  }
  function menuItem(symbol, title, note, action) {
    return button('', action, icon(symbol), h('span', {}, title), h('small', {}, note), icon('arrow'));
  }
  function profile() {
    const large = document.documentElement.dataset.reading === 'large';
    return D('app-page app-profile', heading('我的', '让每一次查阅，都有迹可循'), D('app-content',
      button('app-profile-card app-account-card', () => nav(accountPreviewActive ? 'ProfileDetails' : 'ProfileLogin'),
        accountAvatar(), D('app-account-copy',
          D('app-account-name', h('h2', {}, accountPreviewActive ? exampleAccount.name : '登录 / 注册'),
            h('span', { cn: 'app-account-badge' }, accountPreviewActive ? '示例账号' : '未登录')),
          h('p', { cn: 'app-account-meta' }, accountPreviewActive ? exampleAccount.unit + ' · ' + exampleAccount.role : '登录后管理个人资料')), icon('arrow')),
      D('app-stats', button('', () => nav('Favorites'), h('strong', {}, String(savedEntries('favorites').length)), h('span', {}, '我的收藏')),
        button('', () => nav('Recent'), h('strong', {}, String(savedEntries('recent').length)), h('span', {}, '最近查看'))),
      section('使用与设置'), D('app-menu',
        accountPreviewActive ? menuItem('user', '个人资料', '姓名与单位', () => nav('ProfileDetails')) : null,
        accountPreviewActive ? menuItem('shield', '账号与安全', '', () => nav('AccountSecurity')) : null,
        menuItem('type', '阅读字号', large ? '大字号' : '标准', () => { document.querySelector('.trial-type').click(); render(); }),
        menuItem('info', '关于本应用', '2.0 开发版', () => nav('About'))),
      accountPreviewActive ? button('app-account-logout', () => setAccountPreview(false), '退出登录') : null,
      h('p', { cn: 'app-knowledge-note' }, storageAvailable ? '收藏与浏览记录保存在本机。' : '本机存储暂不可用，收藏与记录仅在本次使用中保留。')));
  }
  function accountAvatar() {
    return D('app-account-avatar', { 'aria-hidden': 'true' }, accountPreviewActive ? exampleAccount.name.slice(0, 1) : icon('user'));
  }
  function setAccountPreview(active) {
    accountPreviewActive = active;
    try { sessionStorage.setItem(accountPreviewKey, active ? 'signed-in' : 'signed-out'); } catch {}
    nav('Profile');
  }
  function accountFields(fields) {
    return D('app-account-fields', ...fields.map(([label, value]) => D('app-account-field', h('span', {}, label), h('strong', {}, value))));
  }
  function accountPage(title, subtitle, ...content) {
    return D('app-page app-account-page', backButton(() => nav('Profile'), '返回我的'), heading(title, subtitle), D('app-content', ...content));
  }
  function profileDetails() {
    if (!accountPreviewActive) return profileLogin();
    return accountPage('个人资料', '管理个人信息，方便日常使用',
      D('app-account-summary', accountAvatar(), D('app-account-copy',
        D('app-account-name', h('h2', {}, exampleAccount.name), h('span', { cn: 'app-account-badge' }, '示例账号')))),
      accountFields([['姓名', exampleAccount.name], ['所属单位', exampleAccount.unit], ['工作岗位', exampleAccount.role]]),
      h('p', { cn: 'app-account-note' }, '当前资料用于展示登录后的界面，尚未绑定真实账号。'));
  }
  function accountSecurity() {
    if (!accountPreviewActive) return profileLogin();
    return accountPage('账号与安全', '账号资料与登录信息',
      accountFields([['账号', exampleAccount.name + '（示例）'], ['手机号', exampleAccount.phone + '（示例）'], ['账号服务', '尚未启用']]),
      h('p', { cn: 'app-account-note' }, '当前为展示账号，手机号绑定、密码修改等功能尚未启用。'));
  }
  function profileLogin() {
    return accountPage('登录 / 注册', '登录后使用个人资料与账号设置',
      D('app-account-summary', D('app-account-avatar', icon('user')), D('app-account-copy', h('h2', {}, '道路安全'), h('p', {}, '排查有据 治理有方'))),
      h('p', { cn: 'app-account-note', role: 'status' }, '真实登录服务尚未启用。你可以先体验登录后的页面效果，本机收藏与浏览记录会保留。'),
      button('app-primary app-wide', () => setAccountPreview(true), '体验登录后界面'));
  }
  function collection(kind) {
    const favorite = kind === 'favorites', items = savedEntries(kind);
    return D('app-page app-collection',
      backButton(() => {
        if (history.state?.trial && history.state.depth > 0) history.back();
        else nav('Profile');
      }),
      heading(favorite ? '收藏记录' : '最近查看', favorite ? '把常用的治理指引留在手边' : '接着上一次的阅读，继续查阅'), D('app-content',
      items.length ? recordList(items) : empty(favorite ? 'star' : 'clock', favorite ? '还没有收藏内容' : '还没有浏览记录', favorite ? '在隐患详情页点击收藏，即可在这里快速查阅。' : '进入知识库查看隐患，系统会自动记录最近 50 项。', '浏览知识库', () => nav('Knowledge'))));
  }
  function caseEntries(entries = allEntries()) {
    const cases = new Map();
    for (const entry of entries) {
      const figures = new Map();
      for (const picture of entry.item.imgs || []) {
        if (!/案例|实例/.test(picture.t || '')) continue;
        const number = picture.t.match(/^图\s*(\d+)/)?.[1];
        if (!number) continue;
        if (!figures.has(number)) figures.set(number, []);
        figures.get(number).push(picture);
      }
      for (const [number, pictures] of figures) {
        const key = entry.props.id + ':' + number;
        // The same figure can appear in several hazards; prefer its complete set of images.
        if (cases.has(key) && cases.get(key).pictures.length >= pictures.length) continue;
        const picture = pictures.find(picture => /道路现状|改善前/.test(picture.t)) || pictures[0];
        const title = picture.t.replace(/^图\s*\d+\s*/, '').replace(/\s+[a-z][）)].*$/i, '')
          .replace(/\s*(?:道路现状|改善方案(?:[（(][一二三][）)])?)$/, '').trim();
        cases.set(key, { ...entry, key, number: Number(number), pictures, picture, title });
      }
    }
    return [...cases.values()].sort((a, b) => a.props.id === b.props.id ? a.number - b.number : a.props.id === 'gsg' ? -1 : 1);
  }
  function caseList(items) {
    return D('app-records app-case-records', ...items.map(({ props, item, category, manual, key, picture, title }) =>
      h('button', { type: 'button', cn: 'app-record', 'data-case-id': key, onclick: () => nav('HazardDetail', props) },
        h('img', { src: 'assets/' + props.id + '/' + picture.f, alt: '', loading: 'lazy', width: '64', height: '64' }),
        D('app-record-copy', h('strong', {}, title), h('small', {}, manual.name + ' · ' + category.n),
          h('p', { cn: 'app-case-caption' }, '关联隐患：' + item.n)), icon('arrow'))));
  }
  function caseProps(type, road, query) {
    return { ...(type !== 'all' ? { type } : {}), ...(road !== 'all' ? { road } : {}), ...(query ? { q: query.slice(0, 250) } : {}) };
  }
  function cases() {
    const types = ['engineering', 'facilities', 'intersection', 'bridges', 'drainage', 'slopes', 'speed', 'roadside']
      .map(id => hazardTypes.types.find(type => type.id === id));
    const type = curProps.type || 'all', road = curProps.road || 'all';
    const source = caseEntries().map(entry => {
      const tags = hazardTypes.classify(entry);
      return { ...entry, tags, keywords: [entry.title, entry.item.n, entry.category.n, entry.manual.name,
        ...entry.pictures.map(picture => picture.t), ...types.filter(type => tags.includes(type.id)).map(type => type.label)].join(' ').normalize('NFKC').toLowerCase() };
    });
    const summary = h('p', { cn: 'app-case-summary', role: 'status', 'aria-live': 'polite' });
    const results = D('app-case-results');
    const input = h('input', { type: 'search', value: curProps.q || '', maxlength: '250', 'aria-label': '搜索典型案例',
      placeholder: '搜索案例、隐患类型、关键词', autocomplete: 'off' });
    const clear = h('button', { type: 'button', cn: 'app-case-search-clear', 'aria-label': '清空案例搜索', onclick: () => {
      input.value = ''; updateQuery(); input.focus();
    } }, icon('close'));
    const updateResults = () => {
      const terms = input.value.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
      const items = source.filter(entry => (type === 'all' || entry.tags.includes(type)) && (road === 'all' || entry.props.id === road)
        && terms.every(term => entry.keywords.includes(term)));
      clear.hidden = !input.value;
      summary.textContent = [type === 'all' ? '' : types.find(item => item.id === type).label,
        road === 'all' ? '' : road === 'gsg' ? '国省道' : '农村公路', '共 ' + items.length + ' 个案例'].filter(Boolean).join(' · ');
      results.replaceChildren(items.length ? caseList(items) : empty('search', '暂无匹配案例',
        '可更换关键词、切换分类或道路类型，查看其他案例。', '清除筛选', () => { caseFilterOpen = false; nav('Cases'); }));
    };
    const updateQuery = () => {
      curProps = caseProps(type, road, input.value);
      history.replaceState(history.state, '', location.pathname + location.search + '#' + new URLSearchParams({ view: 'Cases', ...curProps }));
      updateResults();
    };
    input.addEventListener('input', event => { if (!event.isComposing) updateQuery(); });
    input.addEventListener('compositionend', updateQuery);
    const filters = D('app-case-filters', { id: 'app-case-road-filters' }, h('strong', {}, '选择道路类型'),
      h('div', { cn: 'app-pills', role: 'group', 'aria-label': '案例道路类型' }, ...[
        ['all', '全部道路'], ['gsg', '国省道'], ['rural', '农村公路']
      ].map(([id, label]) => h('button', { type: 'button', 'data-case-road': id, 'aria-pressed': String(road === id),
        onclick: () => nav('Cases', caseProps(type, id, input.value)) }, label))));
    filters.hidden = !caseFilterOpen && road === 'all';
    const toggle = h('button', { type: 'button', cn: 'app-case-filter-toggle', 'aria-controls': 'app-case-road-filters',
      'aria-expanded': String(!filters.hidden), onclick: () => {
        filters.hidden = !filters.hidden; caseFilterOpen = !filters.hidden;
        toggle.setAttribute('aria-expanded', String(!filters.hidden));
      } }, icon('filter'), h('span', {}, road === 'all' ? '筛选' : '筛选 · 1'));
    updateResults();
    return D('app-page app-collection app-cases',
      D('app-cases-topbar', backButton(() => nav('Knowledge'), '返回知识库'), toggle),
      heading('典型案例', '学习治理经验，查阅改善方案'), D('app-content',
        h('form', { cn: 'app-case-search', role: 'search', onsubmit: event => { event.preventDefault(); updateQuery(); } },
          h('button', { type: 'submit', cn: 'app-case-search-submit', 'aria-label': '搜索案例' }, icon('search')), input, clear),
        h('div', { cn: 'app-pills app-case-tabs', role: 'group', 'aria-label': '案例隐患分类' },
          ...[{ id: 'all', label: '全部' }, ...types].map(item => h('button', {
            type: 'button', 'data-case-type': item.id, 'aria-pressed': String(type === item.id),
            onclick: () => nav('Cases', caseProps(item.id, road, input.value))
          }, item.label))), filters, summary, results,
        h('p', { cn: 'app-knowledge-note' }, '案例整理自国省道与农村公路治理指引，点击查看原文、图表与完整措施。')));
  }
  function ai() {
    return D('app-page app-ai', D('app-page-heading', h('h1', {}, 'AI 隐患识别')),
      D('app-content',
        D('app-empty app-ai-unavailable', { role: 'status' }, icon('camera'), h('h2', {}, '该功能尚未启用')),
        button('app-secondary app-wide', () => nav('Home'), '返回首页')));
  }
  function bottomNav() {
    const selected = ['Home', 'AI', 'Knowledge', 'Profile'].includes(curScreen) ? curScreen : ['ProfileDetails', 'AccountSecurity', 'ProfileLogin', 'Recent', 'Favorites', 'About'].includes(curScreen) ? 'Profile' : 'Knowledge';
    return h('nav', { cn: 'app-bottom-nav', 'aria-label': '主导航' }, ...[
      ['Home', 'home', '首页'], ['AI', 'camera', 'AI识别'], ['Knowledge', 'book', '知识库'], ['Profile', 'user', '我的']
    ].map(([screen, symbol, label]) => h('button', { type: 'button', 'data-active': String(selected === screen), ...(selected === screen ? { 'aria-current': 'page' } : {}), onclick: () => nav(screen) }, icon(symbol), h('span', {}, label))));
  }
  function afterRender() {
    root.append(bottomNav());
    if (curScreen === 'Cases') {
      const selected = root.querySelector('.app-case-tabs [aria-pressed=true]');
      if (selected) selected.parentElement.scrollLeft = Math.max(0, selected.offsetLeft - selected.parentElement.offsetLeft - 12);
    }
    if (curScreen === 'About') {
      root.querySelectorAll('.about-row').forEach(row => { if (row.querySelector('.about-row-label')?.textContent.includes('版本')) row.querySelector('.about-row-value').textContent = '2.0 开发版'; });
    }
    if (curScreen !== 'HazardDetail') { lastDetail = ''; return; }
    const found = entry(curProps); if (!found) return;
    const key = keyOf(curProps);
    if (lastDetail !== key) {
      records.recent = [{ props: found.props, at: Date.now() }, ...savedEntries('recent').filter(e => keyOf(e.props) !== key).map(e => ({ props: e.props, at: e.at }))].slice(0, 50);
      persist(); lastDetail = key;
    }
    const save = button('app-detail-save', () => {
      const favorites = savedEntries('favorites');
      const exists = favorites.some(e => keyOf(e.props) === key);
      records.favorites = (exists ? favorites.filter(e => keyOf(e.props) !== key) : [{ props: found.props, at: Date.now() }, ...favorites]).map(e => ({ props: e.props, at: e.at }));
      persist(); update();
      status.textContent = (exists ? '已取消收藏' : '已收藏') + (storageAvailable ? '' : '；本机存储不可用，仅本次使用保留');
    });
    const update = () => {
      const exists = savedEntries('favorites').some(e => keyOf(e.props) === key);
      save.replaceChildren(icon('star'), document.createTextNode(exists ? '已收藏' : '收藏指引'));
      save.setAttribute('aria-pressed', String(exists));
    };
    const status = h('span', { cn: 'app-sr-only', role: 'status', 'aria-live': 'polite' });
    update(); root.querySelector('.dhdr')?.append(save, status);
  }
  window.RoadApp = { screens, afterRender,
    validRoute: (screen, props) => {
      if (screen === 'TypeResults') return hazardTypes.types.some(type => type.id === props.type) && [undefined, 'all', 'gsg', 'rural'].includes(props.road);
      if (screen === 'Cases') return ([undefined, 'all'].includes(props.type) || hazardTypes.types.some(type => type.id === props.type))
        && [undefined, 'all', 'gsg', 'rural'].includes(props.road) && (props.q === undefined || typeof props.q === 'string' && props.q.length <= 250);
      return true;
    },
    renderScreen: screen => ({ Home: home, AI: ai, Knowledge: knowledge, HazardTypes: () => knowledge(true), TypeResults: typeResults, Profile: profile, ProfileDetails: profileDetails, AccountSecurity: accountSecurity, ProfileLogin: profileLogin, Recent: () => collection('recent'), Favorites: () => collection('favorites'), Cases: cases })[screen]?.() };
})();
