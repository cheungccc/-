/* Trial-only presentation and browser navigation. The original manual renderers
   and all source JSON/image bytes remain unchanged in the shared snapshot. */
(() => {
  const themes={app:'道路隐患排查治理助手 2.0',paper:'纸感手册',tool:'专业轻量',color:'轻彩分类',field:'现场手册'};
  const app=window.RoadApp;
  const theme=document.documentElement.dataset.uiTheme;
  const embedded=window.self!==window.top;
  document.documentElement.dataset.embedded=String(embedded);
  // A <base> shares image paths, but history URLs must remain in this theme.
  const pageURL=location.origin+location.pathname;
  const screens=new Set(['Home','Category','HazardList','SubList','SubSubList','HazardDetail','Search','About',...(app?.screens||[])]);
  const oldRender=render, oldUpdate=updateSearchResults;
  const scrolls=new Map();
  let initialized=false, closeDialog=null;
  const hubURL=new URL('../variants.html',document.baseURI).href;
  const switcher=h('nav',{cn:'trial-switcher','aria-label':'网页试用工具'},
    h('a',{href:hubURL},'四版总览'),
    h('select',{'aria-label':'切换界面风格',onchange:e=>{
      location.href=new URL('../'+e.target.value+'/',document.baseURI).href+location.hash;
    }},...Object.entries(themes).map(([id,name])=>h('option',{value:id},name))),
    h('button',{type:'button',cn:'trial-type','aria-label':'切换大字号阅读','aria-pressed':'false',onclick:()=>{
      const large=document.documentElement.dataset.reading!=='large';
      document.documentElement.dataset.reading=large?'large':'normal';
      try{localStorage.setItem('road-trial-reading',large?'large':'normal')}catch{}
      updateTypeControl();
    }},'大字号')
  );
  document.body.insertBefore(switcher,root);
  switcher.querySelector('select').value=theme;
  function updateTypeControl(){
    const large=document.documentElement.dataset.reading==='large';
    const button=switcher.querySelector('button');
    button.setAttribute('aria-pressed',String(large)); button.textContent=large?'标准字号':'大字号';
  }
  try{document.documentElement.dataset.reading=localStorage.getItem('road-trial-reading')||'normal'}catch{}
  updateTypeControl();

  homeScreen=function(){
    return D('home-panel',
      D('trial-home-top',
        h('small',{cn:'trial-kicker'},'交通安全 · 随行手册'),
        D('trial-brand',h('img',{src:'assets/road-safety-icon.png',alt:'',width:'72',height:'72'}),
          D('trial-title',h('h1',{},'道路隐患'),h('p',{},'排查治理助手')),
          h('p',{cn:'trial-intro'},h('span',{},'排查有据'),h('span',{},'治理有方')))
      ),
      D('trial-home-body',
        h('button',{type:'button',cn:'trial-search',onclick:()=>nav('Search')},uiIcon('search'),h('span',{},'搜索隐患与治理措施'),uiIcon('arrow')),
        h('h2',{cn:'trial-section-label'},'选择道路类型'),
        D('trial-roads',...['gsg','rural'].map(id=>h('button',{type:'button',cn:'trial-road '+id,onclick:()=>nav('Category',{id})},
          D('trial-road-icon',uiIcon(id==='gsg'?'road':'rural')),
          D('trial-road-copy',h('strong',{},DATA[id].name),h('small',{},(id==='gsg'?'普通国省道':'农村公路')+'交通事故多发路段治理手册')),
          D('trial-road-arrow',uiIcon('arrow')))))
      ),
      h('button',{type:'button',cn:'trial-about',onclick:()=>nav('About')},uiIcon('info'),h('span',{},'关于本应用'))
    );
  };

  function routeHash(){
    const params=new URLSearchParams({view:curScreen,...curProps});
    if(curScreen!=='Cases'){
      if(searchQ)params.set('q',searchQ);
      if(searchTab!=='all')params.set('tab',searchTab);
    }
    return '#'+params;
  }
  function validRoute(screen,p){
    if(!screens.has(screen))return false;
    if(app?.screens.has(screen))return app.validRoute?.(screen,p) ?? true;
    if(['Home','Search','About'].includes(screen))return true;
    const data=DATA[p.id]; if(!data)return false;
    if(screen==='Category')return true;
    const cat=data.cat[p.ci];if(!cat)return false;
    if(screen==='HazardList')return true;
    const haz=cat.h[p.hi];if(!haz)return false;
    if(screen==='SubList')return !!haz.sub;
    if(screen==='SubSubList')return p.si!==undefined&&p.sji===undefined&&Array.isArray(haz.sub?.[p.si]?.sub);
    const target=p.sji!==undefined?haz.sub?.[p.si]?.sub?.[p.sji]:p.si!==undefined?haz.sub?.[p.si]:haz;
    return !!target&&!target.sub;
  }
  function readRoute(){
    const q=new URLSearchParams(location.hash.slice(1)), p={};
    if(q.has('id'))p.id=q.get('id');
    if(app)for(const key of ['type','road'])if(q.has(key))p[key]=q.get(key);
    if(app&&q.get('view')==='Cases'&&q.has('q'))p.q=q.get('q').slice(0,250);
    for(const key of ['ci','hi','si','sji'])if(q.has(key))p[key]=/^\d+$/.test(q.get(key))?Number(q.get(key)):-1;
    if(q.get('direct')==='true')p.direct=true;
    const screen=q.get('view')||'Home';
    curScreen=validRoute(screen,p)?screen:'Home';curProps=curScreen==='Home'?{}:p;
    if(curScreen!=='Cases'){
      searchQ=(q.get('q')||'').slice(0,250);
      searchTab=['all','gsg','rural'].includes(q.get('tab'))?q.get('tab'):'all';
    }
  }
  function saveScroll(){
    const area=root.querySelector('.scr,.rwrap,.home-panel,.app-page');
    if(area)scrolls.set(routeHash(),area.scrollTop);
  }
  function replaceRoute(){history.replaceState({...history.state,trial:true},'',pageURL+routeHash())}
  nav=function(screen,props){
    if(!validRoute(screen,props||{}))return;
    saveScroll();closeLightbox();clearTimeout(searchTimer);
    const previous=routeHash();
    curScreen=screen;curProps=props||{};
    if(routeHash()!==previous)history.pushState({trial:true,depth:(history.state?.depth||0)+1},'',pageURL+routeHash());
    render();
  };
  function fallbackBack(){
    const p={...curProps};
    if(curScreen==='HazardDetail') {
      if(p.direct)return nav('Category',{id:p.id});
      if(p.sji!==undefined){delete p.sji;return nav('SubSubList',p)}
      if(p.si!==undefined){delete p.si;return nav('SubList',p)}
      return nav('HazardList',{id:p.id,ci:p.ci});
    }
    if(curScreen==='SubSubList'){delete p.si;return nav('SubList',p)}
    if(curScreen==='SubList')return nav('HazardList',{id:p.id,ci:p.ci});
    if(curScreen==='HazardList')return nav('Category',{id:p.id});
    if(app&&curScreen==='Category')return nav('Knowledge');
    nav('Home');
  }
  window.addEventListener('popstate',()=>{if(DATA){saveScroll();closeLightbox();readRoute();render()}});
  window.addEventListener('hashchange',()=>{if(DATA&&location.hash!==routeHash()){saveScroll();closeLightbox();readRoute();render()}});

  function keyboardClick(el,label){
    el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',label);
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}});
  }
  updateSearchResults=function(){
    oldUpdate();
    root.querySelectorAll('.tabs button').forEach((button,i)=>{
      const active=['all','gsg','rural'][i]===searchTab;
      button.className='tab '+(active?'on':'off');button.setAttribute('aria-pressed',String(active));
    });
    root.querySelectorAll('.rc').forEach(card=>keyboardClick(card,'查看'+card.querySelector('.haz').textContent));
    const count=root.querySelectorAll('.rc').length;
    const status=root.querySelector('.trial-result-status');
    if(status)status.textContent=searchQ.trim()?'找到 '+count+' 项相关隐患':'按隐患特征查找治理指引';
    if(curScreen==='Search')replaceRoute();
  };
  render=function(){
    if(!DATA)return;
    const wasInitialized=initialized;
    if(!DATA.gsg?.cat?.length||!DATA.rural?.cat?.length){
      root.replaceChildren(D('trial-error',h('h1',{},'手册暂未加载完成'),h('p',{},'请确认本地预览服务仍在运行，然后重试。'),h('button',{onclick:()=>location.reload()},'重新加载')));return;
    }
    if(!initialized){readRoute();history.replaceState({trial:true,depth:history.state?.trial?history.state.depth||0:0},'',pageURL+routeHash());initialized=true}
    if(app?.screens.has(curScreen))root.replaceChildren(app.renderScreen(curScreen));
    else oldRender();
    app?.afterRender();
    root.dataset.screen=curScreen;root.dataset.road=curProps.id||'';
    root.setAttribute('role','main');root.setAttribute('aria-label','道路隐患排查治理助手');
    const back=root.querySelector('.nav .bk');
    if(back)back.replaceWith(h('button',{type:'button',cn:'bk','aria-label':'返回上一页',onclick:()=>{
      if(history.state?.trial&&history.state.depth>0)history.back();else fallbackBack();
    }},uiIcon('back')));
    const navRow=root.querySelector('.nav');
    if(navRow&&!app){
      navRow.append(h('button',{type:'button',cn:'trial-home-button','aria-label':'返回首页',onclick:()=>nav('Home')},'首页'));
    }
    if(curScreen==='Search'){
      const input=root.querySelector('.sbox input');input.id='trial-search-input';input.type='search';input.value=searchQ;
      input.maxLength=250;input.placeholder='例如：视距不足、护栏缺失';input.setAttribute('aria-describedby','trial-search-status');
      root.querySelector('.sbox').before(h('label',{cn:'trial-search-label',for:input.id},'搜索隐患特征'));
      root.querySelector('.tabs').after(h('p',{cn:'trial-result-status',id:'trial-search-status',role:'status','aria-live':'polite'},''));
      updateSearchResults();
    }
    root.querySelectorAll('.img-item').forEach(item=>{
      const caption=item.querySelector('.img-cap')?.textContent||'手册示意图';
      keyboardClick(item,'放大查看：'+caption);
      const img=item.querySelector('img');if(img)img.alt=caption;
    });
    root.querySelectorAll('.tbl-image img,.tbl-cell-imgs img').forEach(img=>{
      img.alt=img.closest('.tbl-card')?.querySelector('summary')?.textContent||'手册表格配图';keyboardClick(img,'放大查看：'+img.alt);
    });
    root.querySelectorAll('svg').forEach(svg=>svg.setAttribute('aria-hidden','true'));
    root.querySelectorAll('.tbl-wrap').forEach(wrap=>{wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','手册表格，可左右滚动')});
    const heading=root.querySelector('.nm')||root.querySelector('.shdr h2')||root.querySelector('.tt')||root.querySelector('h1');
    if(heading){heading.tabIndex=-1;heading.setAttribute('role','heading');heading.setAttribute('aria-level','1');if(wasInitialized||!embedded)heading.focus({preventScroll:true})}
    const area=root.querySelector('.scr,.rwrap,.home-panel,.app-page');if(area)area.scrollTop=scrolls.get(routeHash())||0;
    const title=root.querySelector('.nm,.shdr h2,.tt,h1')?.textContent||'道路隐患排查治理助手';
    document.title=theme==='app'?'道路隐患排查治理助手 2.0':title+' · '+themes[theme];
  };

  closeLightbox=function(){if(closeDialog)closeDialog()};
  openLightbox=function(src,caption){
    closeLightbox();const previous=document.activeElement;
    const dialog=h('div',{cn:'lb-overlay',role:'dialog','aria-modal':'true','aria-label':caption||'图片预览'},
      h('button',{type:'button',cn:'lb-close','aria-label':'关闭图片预览',onclick:closeLightbox},uiIcon('close')),
      h('div',{cn:'trial-image-stage'},h('img',{src,alt:caption||'手册示意图'})),
      h('p',{cn:'lb-cap'},caption||'手册示意图'),
      h('a',{cn:'trial-original-image',href:new URL(src,document.baseURI).href,target:'_blank',rel:'noopener'},'查看原图')
    );
    const esc=e=>{
      if(e.key==='Escape'){e.preventDefault();closeLightbox()}
      if(e.key==='Tab'){
        const buttons=[...dialog.querySelectorAll('button,a')], first=buttons[0],last=buttons[buttons.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    };
    closeDialog=()=>{dialog.remove();root.inert=false;switcher.inert=false;document.removeEventListener('keydown',esc);closeDialog=null;if(previous?.isConnected)previous.focus({preventScroll:true})};
    dialog.addEventListener('click',e=>{if(e.target===dialog)closeLightbox()});
    root.inert=true;switcher.inert=true;document.body.append(dialog);document.addEventListener('keydown',esc);dialog.querySelector('button').focus();
  };
  if(DATA)render();
})();
