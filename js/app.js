import { ICONS, SHOPS, PRODUCTS as P, STORES, LABEL_STYLE, HOT, COUPON_POOL, fmtDay, weekday, initialState } from './data.js';

/* ========== 狀態 ========== */
const KEY = 'shopee-pickup-proto-v1';
let S = load();
const ui = { sort: '綜合', q: '', filter: blankFilter(), pickTab: 'ready', notifTab: '物流', sel: null, co: null, lastPicked: [], lastOrder: [], addLabel: '學校', addCustom: '', preferStore: null, dialog: null, storeQ: '' };
function blankFilter() { return { ship: [], rate: '', from: [], cap: [], min: '', max: '' }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.orders) return Object.assign(initialState(), s); } catch (e) {} return initialState(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const uid = p => p + (++S.seq);

/* ========== 小工具 ========== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, s, st) => `<svg class="i" viewBox="0 0 24 24" ${s ? `style="width:${s}px;height:${s}px${st ? ';' + st : ''}"` : (st ? `style="${st}"` : '')} aria-hidden="true">${ICONS[n]}</svg>`;
const money = n => '$' + n.toLocaleString('en-US');
const favOf = sid => S.favs.find(f => f.store === sid);
const labelStyle = l => LABEL_STYLE[l] || { cls: 'grey', ic: 'pin' };
const storeTag = sid => { const f = favOf(sid); return f ? `<span class="tag ${labelStyle(f.label).cls}">${esc(f.label)}</span>` : ''; };
const storeIcon = sid => { const f = favOf(sid); const st = f ? labelStyle(f.label) : { cls: 'grey', ic: 'store' };
  const col = { '': ['var(--o-soft)', 'var(--o)'], home: ['var(--home-soft)', 'var(--home)'], ok: ['var(--ok-soft)', 'var(--ok)'], grey: ['#F0F0F0', 'var(--sub)'] }[st.cls];
  return `<span class="icon-circle" style="background:${col[0]};color:${col[1]}">${ic(st.ic, 22)}</span>`; };
const unitPrice = (p, spec) => { let x = P[p].price; P[p].opt.forEach((o, i) => { const k = o.v.indexOf(spec[i]); if (o.add && k > 0) x += o.add[k]; }); return x; };
const specText = spec => spec.join('｜');
const byStatus = st => S.orders.filter(o => o.status === st);
const readyByStore = () => { const g = {}; byStatus('ready').forEach(o => (g[o.store] = g[o.store] || []).push(o)); return g; };
const unread = () => S.notifs.filter(n => !n.read).length;
const cartCount = () => S.cart.reduce((a, c) => a + c.qty, 0);
const isWeekend = d => ['六', '日'].includes(weekday(d));
const defaultFav = () => S.favs.find(f => f.id === (isWeekend(S.day) ? S.defaults.weekend : S.defaults.weekday)) || S.favs[0];
const shipStore = () => ui.preferStore || (defaultFav() ? defaultFav().store : 's3');
const dayLabel = d => `${fmtDay(d)}（${weekday(d)}）`;
const dateOf = d => d > 0 ? fmtDay(d) : `11/${String(30 + d).padStart(2, '0')}`;
function barcode(code) {
  let x = 0, r = '', seed = 7; for (const ch of code) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  while (x < 300) { const w = 1 + Math.floor(rnd() * 3.2); r += `<rect x="${x}" y="0" width="${w}" height="84" fill="#111"/>`; x += w + 1 + Math.floor(rnd() * 3); }
  return `<svg class="bars" viewBox="0 0 300 84" preserveAspectRatio="none" role="img" aria-label="取件條碼">${r}</svg>`;
}
function qr(seedStr) {
  let s = 11; for (const ch of seedStr) s = (s * 33 + ch.charCodeAt(0)) % 2147483647; let r = '';
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#111"/>`;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12); if (!inF && rnd() > .52) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`; }
  return `<svg viewBox="-1 -1 23 23" width="76" height="76" style="flex:none" role="img" aria-label="QR Code"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/>${r}${f(0, 0)}${f(14, 0)}${f(0, 14)}</svg>`;
}
const pickupCode = sid => 'SP' + (2026120000000 + S.day * 1000 + parseInt(sid.slice(1)) * 137 + byStatus('ready').filter(o => o.store === sid).length * 11);
const spaced = c => c.replace(/^(SP)(\d{4})(\d{4})(\d{4})(\d)$/, '$1 $2 $3 $4 $5');

/* ========== 共用版塊 ========== */
const sb = () => `<div class="sb">9:41</div>`;
const hdr = (title, opt = {}) => `<div class="hdr">${sb()}<div class="bar ${opt.back === false ? 'root' : ''}">${opt.back === false ? '' : `<button class="ib" data-a="back" aria-label="返回">${ic('left')}</button>`}<h2>${title}</h2>${opt.right || ''}</div></div>`;
const TABS = [['home', '首頁', 'home'], ['results', '搜尋', 'search'], ['pickup', '取件', 'package'], ['notifs', '通知', 'bell'], ['me', '我的', 'user']];
const tabbar = on => `<nav class="tabbar">${TABS.map(([r, l, i]) => `<button data-a="tab" data-r="${r}" class="${on === r ? 'on' : ''}" ${on === r ? 'aria-current="page"' : ''}>${ic(i)}${l}${r === 'notifs' && unread() ? `<span class="badge">${unread()}</span>` : ''}${r === 'pickup' && byStatus('ready').length ? `<span class="badge">${byStatus('ready').length}</span>` : ''}</button>`).join('')}</nav>`;
const cartBtn = () => `<button class="ib" data-a="go" data-r="cart" aria-label="購物車">${ic('cart', 26)}${cartCount() ? `<span class="badge">${cartCount()}</span>` : ''}</button>`;
const pcard = (k, showShip) => { const p = P[k]; return `<button class="pcard press" data-a="go" data-r="product/${k}"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy"><div class="t"><div class="n">${esc(p.n)}</div>${showShip ? `<div class="row" style="gap:4px">${p.ship.includes('7-11 取貨') ? '<span class="tag ok">7-11 取貨</span>' : ''}${p.ship.includes('全家取貨') ? '<span class="tag home">全家</span>' : ''}</div>` : ''}<div class="row" style="justify-content:space-between;margin-top:auto"><span class="price">${money(p.price)}</span><span class="sub small">${showShip ? '★ ' + p.rate : '已售 ' + p.sold}</span></div></div></button>`; };
const steps = n => `<div class="steps"><span class="fill" style="width:${n >= 3 ? 66.6 : n === 2 ? 33.3 : 0}%"></span>${['已出貨', '配送中', '到店'].map((s, i) => `<div class="${i < n ? 'on' : ''}"><i></i>${s}</div>`).join('')}</div>`;
const orderLine = (o, right) => `<div class="row"><img class="thumb" src="${P[o.p].img}" alt=""><div class="grow"><div class="ellipsis" style="font-weight:500">${esc(P[o.p].n)}</div><div class="sub small" style="margin-top:3px">${esc(specText(o.spec))} x${o.qty}｜訂單末碼 ${o.no}</div><div class="small" style="margin-top:3px">${money(o.price * o.qty)}</div></div>${right || ''}</div>`;

/* ========== 畫面 ========== */
const V = {};

V.home = () => {
  const g = readyByStore(), stores = Object.keys(g), n = byStatus('ready').length, ship = byStatus('ship');
  const minDl = Math.min(...byStatus('ready').map(o => o.deadline));
  return `<div class="scr">
<div class="hdr" style="padding-bottom:58px">${sb()}<div class="bar" style="padding:0 6px 0 12px;gap:4px">
 <button class="search" data-a="go" data-r="search">${ic('search')}<span class="sub">${esc(S.history[0] || '搜尋商品')}</span></button>${cartBtn()}
 <button class="ib" data-a="go" data-r="chats" aria-label="聊聊">${ic('chat')}</button></div>
 <div style="padding:2px 16px;font-size:12px;font-weight:500">雙 11 延長賽｜全站免運</div></div>
<div class="body" style="margin-top:-50px">
 <button class="card press" data-a="tab" data-r="pickup" style="display:block;width:calc(100% - 24px);margin:0 12px;padding:14px 16px;box-shadow:0 4px 14px rgba(0,0,0,.08)">
  <div class="row"><span class="icon-circle" style="background:var(--o-soft);color:var(--o);width:40px;height:40px">${ic('package', 22)}</span>
   <div class="grow"><div class="sub small">今日待取｜${dayLabel(S.day)}</div><div style="font-size:20px;font-weight:700">${n ? n + ' 件可取貨' : '今天沒有要取的包裹'}</div></div><span class="chev">${ic('right')}</span></div>
  ${n || ship.length ? '<div class="divider" style="margin:12px 0"></div>' : ''}
  <div class="stack" style="gap:8px;font-size:13px">
   ${stores.map(s => `<div class="row" style="gap:8px"><span style="color:var(--ok);display:flex">${ic('store', 18)}</span><span class="ellipsis">${STORES[s].n}</span>${storeTag(s)}<span class="grow"></span><b style="color:var(--ok)">${g[s].length} 件</b></div>`).join('')}
   ${ship.length ? `<div class="row sub" style="gap:8px">${ic('truck', 18)}<span class="ellipsis">${ship.length} 件運送中，最快 ${fmtDay(Math.min(...ship.map(o => o.eta)))} 到店</span></div>` : ''}
   ${n ? `<div class="row" style="gap:8px;color:var(--o)">${ic('clock', 18)}<span>最早期限 ${fmtDay(minDl)}（剩 ${minDl - S.day} 天）</span></div>` : ''}
  </div></button>
 <div class="quick" style="margin-top:12px">${[['zap', '蝦皮直送', 'results', 'direct'], ['truck', '免運', 'coupons'], ['coins', '蝦幣', 'coins'], ['wallet', '錢包', 'wallet'], ['ticket', '領券', 'coupons']].map(([i, l, r, x]) => `<button data-a="${x ? 'direct' : 'go'}" data-r="${r}"><span>${ic(i, 22)}</span>${l}</button>`).join('')}</div>
 <div class="row" style="padding:16px 16px 10px"><b class="grow" style="font-size:16px">每日新發現</b><button class="sub small" data-a="tab" data-r="results">看更多 ›</button></div>
 <div class="pgrid">${Object.keys(P).map(k => pcard(k, false)).join('')}</div>
</div>${tabbar('home')}</div>`;
};

V.search = () => `<div class="scr" style="background:#fff"><div class="hdr">${sb()}<form class="bar" data-f="search" style="padding:0 12px 0 4px;gap:6px"><button type="button" class="ib" data-a="back" aria-label="返回">${ic('left')}</button>
 <label class="search">${ic('search')}<input id="q" name="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="搜尋商品" value="${esc(ui.q)}" aria-label="搜尋商品"></label><button class="b" style="padding:0 6px">搜尋</button></form></div>
<div class="body"><div id="suggest"></div><div class="stack" style="padding:16px">
 ${S.history.length ? `<div class="row"><b class="grow">搜尋紀錄</b><button class="sub small" data-a="clearHistory">清除</button></div><div class="chips">${S.history.map(h => `<button class="chip" data-a="doSearch" data-q="${esc(h)}">${ic('history', 14, 'vertical-align:-2px;margin-right:4px')}${esc(h)}</button>`).join('')}</div>` : ''}
 <b style="margin-top:8px">熱門搜尋</b><div class="chips">${HOT.map(h => `<button class="chip" data-a="doSearch" data-q="${esc(h)}">${esc(h)}</button>`).join('')}</div>
</div></div></div>`;

function results() {
  const q = ui.q.trim().toLowerCase(), f = ui.filter;
  let a = Object.keys(P).filter(k => { const p = P[k];
    if (q && !(p.n.toLowerCase().includes(q) || p.kw.some(w => w.toLowerCase().includes(q) || q.includes(w.toLowerCase())))) return false;
    if (f.ship.length && !f.ship.some(s => p.ship.includes(s))) return false;
    if (f.rate && p.rate < parseFloat(f.rate)) return false;
    if (f.from.length && !f.from.includes(p.from)) return false;
    if (f.cap.length && !f.cap.includes(p.capB)) return false;
    if (f.min !== '' && p.price < +f.min) return false;
    if (f.max !== '' && p.price > +f.max) return false;
    return true; });
  if (ui.sort === '價格') a.sort((x, y) => P[x].price - P[y].price);
  if (ui.sort === '最新') a.reverse();
  if (ui.sort === '熱銷') a.sort((x, y) => P[y].rate - P[x].rate);
  return a;
}
const filterCount = () => { const f = ui.filter; return f.ship.length + f.from.length + f.cap.length + (f.rate ? 1 : 0) + (f.min !== '' || f.max !== '' ? 1 : 0); };
V.results = () => { const list = results(), fc = filterCount(); return `<div class="scr"><div class="hdr">${sb()}<div class="bar" style="padding:0 6px 0 12px;gap:4px"><button class="search" data-a="go" data-r="search">${ic('search')}<span class="${ui.q ? '' : 'sub'} ellipsis">${esc(ui.q || '搜尋商品')}</span></button>${ui.q ? `<button class="ib" data-a="clearQ" aria-label="清除搜尋">${ic('x', 20)}</button>` : ''}${cartBtn()}</div></div>
<div class="sort">${['綜合', '最新', '熱銷', '價格'].map(s => `<button data-a="sort" data-v="${s}" class="${ui.sort === s ? 'on' : ''}">${s}</button>`).join('')}<button data-a="go" data-r="filter" class="${fc ? 'on' : ''}">${ic('filter', 18)}篩選${fc ? `（${fc}）` : ''}</button></div>
<div class="body">${fc ? `<div class="row wrap" style="padding:10px 12px 0;gap:6px">${[...ui.filter.ship, ...ui.filter.from, ...ui.filter.cap, ui.filter.rate ? ui.filter.rate + ' 星以上' : '', ui.filter.min !== '' || ui.filter.max !== '' ? `${ui.filter.min || 0}–${ui.filter.max || '∞'} 元` : ''].filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('')}<button class="small sub" data-a="resetFilter" style="text-decoration:underline">清除篩選</button></div>` : ''}
${list.length ? `<div class="pgrid" style="padding-top:12px">${list.map(k => pcard(k, true)).join('')}</div>` : `<div class="empty">${ic('search', 36)}<div>找不到符合的商品</div><button class="btn sm line" data-a="resetFilter">清除篩選與搜尋</button></div>`}
</div>${tabbar('results')}</div>`; };

const FILTERS = [['ship', '物流方式', ['7-11 取貨', '全家取貨', '宅配', '蝦皮店到店']], ['from', '出貨地', ['台灣', '海外']], ['cap', '容量', ['500ml 以下', '500–750ml']]];
V.filter = () => { const f = ui.filter; return `<div class="side" role="dialog" aria-label="篩選"><div style="height:36px"></div><div class="row" style="padding:4px 8px 8px 16px"><b class="grow" style="font-size:18px">篩選</b><button class="ib" data-a="back" aria-label="關閉">${ic('x')}</button></div>
<div class="body" style="padding:0 16px 16px"><div class="stack" style="gap:18px">
${FILTERS.map(([k, t, o]) => `<div class="stack" style="gap:10px"><b>${t}</b><div class="chips">${o.map(c => `<button class="chip ${f[k].includes(c) ? 'on' : ''}" data-a="fchip" data-k="${k}" data-v="${c}" aria-pressed="${f[k].includes(c)}">${c}</button>`).join('')}</div></div>`).join('')}
<div class="stack" style="gap:10px"><b>評價</b><div class="chips">${['4.8', '4.5'].map(v => `<button class="chip ${f.rate === v ? 'on' : ''}" data-a="frate" data-v="${v}">${v} 星以上</button>`).join('')}</div></div>
<div class="stack" style="gap:10px"><b>價格區間</b><div class="row" style="gap:8px"><input class="field" id="pmin" inputmode="numeric" aria-label="最低價" placeholder="$ 最低" value="${f.min}"><span class="sub">—</span><input class="field" id="pmax" inputmode="numeric" aria-label="最高價" placeholder="$ 最高" value="${f.max}"></div></div>
</div></div>
<div class="foot row" style="gap:10px"><button class="btn line" data-a="resetFilter">重設</button><button class="btn" data-a="applyFilter">套用（${results().length} 件）</button></div></div>`; };

V.product = k => { const p = P[k], liked = S.likes.includes(k), st = shipStore(), mine = S.reviews.filter(r => r.p === k);
  const revs = [...mine.map(r => ({ u: 'Amber', s: r.stars, t: r.text || '（沒有留下文字）', spec: specText(r.spec) })), { u: 'k***9', s: 5, t: '很保溫，早上裝的熱水下班還是熱的。', spec: p.opt.map(o => o.v[0]).join('｜') }, { u: 'm***a', s: 4, t: '超商取貨很方便，到店有通知。', spec: p.opt.map(o => o.v[o.v.length - 1]).join('｜') }];
  return `<div class="scr"><div class="body">
<div style="position:relative"><img src="${p.img}" alt="${esc(p.n)}" style="width:100%;aspect-ratio:1/0.95;object-fit:cover;display:block">
 <button class="ib" data-a="back" aria-label="返回" style="position:absolute;top:44px;left:12px;background:rgba(0,0,0,.35);color:#fff">${ic('left')}</button>
 <div class="row" style="position:absolute;top:44px;right:12px;gap:8px"><button class="ib" data-a="share" aria-label="分享" style="background:rgba(0,0,0,.35);color:#fff">${ic('share', 20)}</button><span style="background:rgba(0,0,0,.35);color:#fff;border-radius:20px" class="ib">${cartBtn().replace('class="ib"', 'class="ib" style="color:#fff"')}</span></div></div>
<div style="background:#fff;padding:14px 16px" class="stack"><div class="row" style="gap:8px"><span class="price" style="font-size:24px">${money(p.price)}</span><span class="tag">免運</span></div>
 <div class="row" style="align-items:flex-start"><div class="grow" style="font-size:15px;line-height:1.5">${esc(p.desc)}</div><button data-a="like" data-k="${k}" aria-pressed="${liked}" aria-label="喜歡" style="color:${liked ? 'var(--o)' : 'var(--sub)'}">${ic('heart', 24, liked ? 'fill:var(--o)' : '')}</button></div>
 <div class="row small" style="gap:6px"><span style="color:var(--gold)">★★★★★</span><span class="sub">${p.rate}｜已售 ${p.sold}</span></div></div>
<button class="row press" data-a="go" data-r="storepick/product" style="background:#fff;margin-top:8px;padding:14px 16px;width:100%"><span style="color:var(--ok);display:flex">${ic('truck', 22)}</span>
 <div class="grow"><div class="sub small">${favOf(st) ? '寄到常用門市' : '寄到'}</div><div class="row" style="gap:8px;margin:2px 0"><b class="ellipsis">${STORES[st].n}</b>${storeTag(st)}</div><div class="small" style="color:var(--ok)">今天下單，預計 ${dayLabel(S.day + 2)} 到店，到店會通知你</div></div><span class="chev">${ic('right')}</span></button>
<button class="row press" data-a="go" data-r="spec/${k}/buy" style="background:#fff;margin-top:8px;padding:14px 16px;width:100%;font-size:13px"><span class="sub">規格</span><span class="grow">${p.opt.map(o => o.v.join('、')).join('｜')}</span><span class="chev">${ic('right')}</span></button>
<button class="row press" data-a="go" data-r="chat/${p.shop}" style="background:#fff;margin-top:8px;padding:14px 16px;width:100%"><span class="icon-circle" style="background:var(--bg);color:var(--o)">${ic('store', 22)}</span><div class="grow"><b>${SHOPS[p.shop].n}</b><div class="sub small">通常 1 小時內回覆</div></div><span class="btn sm line">聊聊</span></button>
<div style="background:#fff;margin-top:8px;padding:14px 16px" class="stack"><div class="row"><b class="grow">商品評價（${revs.length}）</b><span style="color:var(--gold)">★ ${p.rate}</span></div>
 ${revs.map(r => `<div class="stack" style="gap:4px;border-top:1px solid var(--line);padding-top:10px"><div class="row small" style="gap:8px"><b>${esc(r.u)}</b><span style="color:var(--gold)">${'★'.repeat(r.s)}${'☆'.repeat(5 - r.s)}</span></div><div class="sub small">規格：${esc(r.spec)}</div><div style="line-height:1.6">${esc(r.t)}</div></div>`).join('')}</div>
<div style="height:16px"></div></div>
<div class="row" style="flex:none;background:#fff;border-top:1px solid var(--line);gap:0;padding-bottom:env(safe-area-inset-bottom,0px)">
 <button class="small" data-a="go" data-r="chat/${p.shop}" style="width:62px;height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ok)">${ic('chat', 20)}聊聊</button>
 <button data-a="go" data-r="spec/${k}/cart" style="flex:1;height:54px;background:var(--ok-soft);color:var(--ok);font-weight:700;text-align:center">加入購物車</button>
 <button data-a="go" data-r="spec/${k}/buy" style="flex:1;height:54px;background:var(--o);color:#fff;font-weight:700;font-size:16px;text-align:center">直接購買</button></div></div>`; };

function selFor(k) { if (!ui.sel || ui.sel.p !== k) ui.sel = { p: k, spec: P[k].opt.map(o => o.v[0]), qty: 1 }; return ui.sel; }
V.spec = (k, mode) => { const p = P[k], s = selFor(k); return `<div class="sheet" role="dialog" aria-label="選擇規格"><div class="row" style="padding:16px;align-items:flex-end"><img class="thumb" src="${p.img}" alt="" style="width:96px;height:96px;margin-top:-40px;border:3px solid #fff"><div class="grow"><div class="price" style="font-size:22px">${money(unitPrice(k, s.spec))}</div><div class="sub small">庫存 238 件｜已選 ${esc(specText(s.spec))}</div></div><button class="ib" data-a="back" aria-label="關閉" style="align-self:flex-start;color:var(--sub)">${ic('x')}</button></div>
<div class="body" style="padding:0 16px 8px"><div class="stack" style="gap:16px">
${p.opt.map((o, i) => `<div class="stack" style="gap:10px"><b>${o.n}</b><div class="chips">${o.v.map((v, j) => `<button class="chip ${s.spec[i] === v ? 'on' : ''}" data-a="opt" data-i="${i}" data-v="${esc(v)}" aria-pressed="${s.spec[i] === v}">${esc(v)}${o.add && o.add[j] ? ' +$' + o.add[j] : ''}</button>`).join('')}</div></div>`).join('')}
<div class="row"><b class="grow">數量</b><div class="qty"><button data-a="selQty" data-d="-1" aria-label="減少">${ic('minus', 16)}</button><span>${s.qty}</span><button data-a="selQty" data-d="1" aria-label="增加">${ic('plus', 16)}</button></div></div>
</div></div><div class="foot"><button class="btn" data-a="${mode === 'cart' ? 'addCart' : 'buyNow'}">${mode === 'cart' ? '加入購物車' : '直接購買'}</button></div></div>`; };

V.cart = () => { const on = S.cart.filter(c => c.on), total = on.reduce((a, c) => a + unitPrice(c.p, c.spec) * c.qty, 0); return `<div class="scr">${hdr(`購物車（${cartCount()}）`)}
<div class="body"><div class="stack pad">${S.cart.length ? S.cart.map(c => `<div class="card row" style="padding:12px;align-items:flex-start"><button data-a="cartOn" data-id="${c.id}" class="check o ${c.on ? 'on' : ''}" role="checkbox" aria-checked="${c.on}" aria-label="選取 ${esc(P[c.p].n)}" style="margin-top:20px">${c.on ? ic('check', 16) : ''}</button>
 <button data-a="go" data-r="product/${c.p}"><img class="thumb" src="${P[c.p].img}" alt=""></button><div class="grow stack" style="gap:6px"><div class="ellipsis" style="font-weight:500">${esc(P[c.p].n)}</div><span class="tag grey" style="align-self:flex-start">${esc(specText(c.spec))}</span>
 <div class="row" style="justify-content:space-between"><span class="price">${money(unitPrice(c.p, c.spec))}</span><div class="qty"><button data-a="cartQty" data-id="${c.id}" data-d="-1" aria-label="減少">${ic('minus', 16)}</button><span>${c.qty}</span><button data-a="cartQty" data-id="${c.id}" data-d="1" aria-label="增加">${ic('plus', 16)}</button></div></div></div>
 <button class="ib" data-a="cartDel" data-id="${c.id}" aria-label="刪除" style="color:var(--sub);width:32px;height:32px">${ic('trash', 20)}</button></div>`).join('') : `<div class="card empty">${ic('cart', 40)}<div>購物車是空的</div><button class="btn sm" data-a="tab" data-r="results">去逛逛</button></div>`}
</div></div>${S.cart.length ? `<div class="foot row"><button class="row" data-a="cartAll" style="gap:8px"><span class="check o ${S.cart.every(c => c.on) ? 'on' : ''}">${S.cart.every(c => c.on) ? ic('check', 16) : ''}</span>全選</button><div class="grow" style="text-align:right"><div class="sub small">總計</div><div class="price" style="font-size:18px">${money(total)}</div></div><button class="btn" data-a="cartCheckout" style="width:120px" ${on.length ? '' : 'disabled'}>去結帳（${on.reduce((a, c) => a + c.qty, 0)}）</button></div>` : ''}</div>`; };

const PAY = { cod: ['cash', '取件時付款'], card: ['card', '信用卡（末四碼 4417）'], wallet: ['wallet', '蝦皮錢包'], atm: ['cash', 'ATM 轉帳（下單後 24 小時內付款）'] };
function coCalc() { const c = ui.co, sub = c.items.reduce((a, i) => a + i.price * i.qty, 0);
  const cps = S.coupons.filter(u => !u.used).map(u => ({ ...COUPON_POOL.find(x => x.id === u.ref), uid: u.id }));
  const shipCp = cps.find(x => x.kind === 'ship'); const cash = c.coupon ? cps.find(x => x.uid === c.coupon) : null;
  const ship = shipCp ? 0 : 60, off = cash && sub >= cash.min ? cash.off : 0, coin = c.coins ? Math.min(12, S.coins) : 0;
  return { sub, ship, shipCp, off, coin, cps, total: Math.max(0, sub + ship - off - coin) }; }
V.checkout = () => { const c = ui.co; if (!c) return V.home(); const st = c.store, k = coCalc(), f = favOf(st), dfl = defaultFav();
  const auto = dfl && st === dfl.store; return `<div class="scr">${hdr('結帳')}<div class="body"><div class="stack pad">
<button class="card row press" data-a="go" data-r="storepick/checkout" style="padding:14px;width:100%;align-items:flex-start"><span style="color:var(--o);display:flex">${ic('pin', 20)}</span>
 <div class="grow"><div class="sub small">取件門市</div><div class="row wrap" style="gap:8px;margin:2px 0"><b style="font-size:15px">${STORES[st].n}</b>${f ? `<span class="tag ${labelStyle(f.label).cls}">${esc(f.label)}｜常用</span>` : ''}</div><div class="sub small">${STORES[st].addr}</div>
 ${auto ? `<div class="tag ok" style="margin-top:8px">${isWeekend(S.day) ? '週末' : '平日'}下單，已自動帶入${esc(dfl.label)}門市，可點此更換</div>` : ''}</div><span class="chev">${ic('right')}</span></button>
<div class="card stack" style="padding:12px">${c.items.map(i => `<div class="row"><img class="thumb" src="${P[i.p].img}" alt=""><div class="grow"><div class="ellipsis" style="font-weight:500">${esc(P[i.p].n)}</div><div class="sub small">${esc(specText(i.spec))}</div><div class="row" style="justify-content:space-between;margin-top:4px"><span class="price" style="font-size:15px">${money(i.price)}</span><span class="sub small">x${i.qty}</span></div></div></div>`).join('<div class="divider"></div>')}</div>
<div class="card" style="padding:6px 14px"><b style="display:block;padding:8px 0 4px">付款方式</b>${Object.entries(PAY).map(([key, [i, l]]) => { const dis = key === 'wallet' && S.wallet < k.total; return `<button class="row" data-a="pay" data-v="${key}" ${dis ? 'disabled style="opacity:.45;padding:10px 0;width:100%"' : 'style="padding:10px 0;width:100%"'}>${ic(i, 20)}<span class="grow">${l}${key === 'wallet' ? `（餘額 ${money(S.wallet)}）` : ''}</span><span class="radio ${c.pay === key ? 'on' : ''}"></span></button>`; }).join('')}</div>
<div class="card" style="padding:6px 14px">
 <div class="kv"><span class="sub">商品小計</span><span>${money(k.sub)}</span></div>
 <div class="kv"><span class="sub">運費</span><span style="color:${k.shipCp ? 'var(--ok)' : 'inherit'}">${k.shipCp ? '$60 → 免運（免運券）' : '$60'}</span></div>
 <div class="kv"><span class="sub">折價券</span>${k.cps.filter(x => x.kind === 'cash').length ? `<select id="cpsel" data-ch="coupon" style="border:0;background:none;text-align:right;color:var(--o)"><option value="">不使用</option>${k.cps.filter(x => x.kind === 'cash').map(x => `<option value="${x.uid}" ${c.coupon === x.uid ? 'selected' : ''} ${k.sub < x.min ? 'disabled' : ''}>${x.t}（${x.d}）</option>`).join('')}</select>` : '<span class="sub">沒有可用的券</span>'}</div>
 <div class="kv"><span class="sub">蝦幣折抵（可折 $12）</span><button class="switch ${c.coins ? 'on' : ''}" data-a="coCoins" role="switch" aria-checked="${!!c.coins}" aria-label="使用蝦幣折抵"></button></div>
 <div class="kv"><span class="sub">預計到店</span><span>${dayLabel(S.day + 2)}</span></div></div>
</div></div><div class="foot row"><div class="grow"><div class="sub small">總付款金額</div><div class="price" style="font-size:20px">${money(k.total)}</div></div><button class="btn" data-a="placeOrder" style="width:140px">下訂單</button></div></div>`; };

V.storepick = ctx => { const q = ui.storeQ.trim(); const cur = ctx === 'checkout' ? ui.co?.store : ctx === 'product' ? shipStore() : ctx.startsWith('fav:') ? S.favs.find(f => f.id === ctx.slice(4))?.store : null;
  const match = s => !q || STORES[s].n.includes(q) || STORES[s].addr.includes(q);
  const others = Object.keys(STORES).filter(s => !favOf(s) && match(s));
  const row = (s, sub) => `<button class="card row press" data-a="pickStore" data-s="${s}" data-ctx="${ctx}" style="padding:14px;width:100%;${cur === s ? 'box-shadow:inset 0 0 0 1.5px var(--o)' : ''}">${storeIcon(s)}<div class="grow"><div class="row" style="gap:8px"><b class="ellipsis" style="font-size:15px">${STORES[s].n}</b>${storeTag(s)}</div><div class="sub small" style="margin-top:3px">${sub}</div></div><span class="radio ${cur === s ? 'on' : ''}"></span></button>`;
  return `<div class="scr">${hdr(ctx === 'add' ? `選擇${esc(ui.addLabel === '其他' ? ui.addCustom || '新' : ui.addLabel)}門市` : '選擇取件門市')}<div class="body"><div class="stack pad">
<label class="search" style="flex:none">${ic('search')}<input id="storeq" data-in="storeq" type="search" placeholder="搜尋門市名稱或地址" value="${esc(ui.storeQ)}" aria-label="搜尋門市"></label>
<div id="storelist" class="stack">${ctx !== 'add' && S.favs.some(f => match(f.store)) ? `<div class="sec-t">常用門市</div>${S.favs.filter(f => match(f.store)).map(f => row(f.store, STORES[f.store].addr)).join('')}` : ''}
<div class="sec-t">附近門市</div>${others.length ? others.map(s => row(s, `${STORES[s].addr}${STORES[s].dist ? '｜' + STORES[s].dist : ''}`)).join('') : '<div class="sub" style="padding:8px 4px">找不到符合的門市</div>'}</div>
${ctx !== 'add' ? `<button class="row" data-a="go" data-r="storeadd" style="justify-content:center;height:48px;border:1.5px dashed #C9C9C9;border-radius:12px;color:var(--sub);gap:6px;width:100%">${ic('plus', 20)}新增常用門市（學校等）</button>` : ''}
</div></div></div>`; };

V.ordered = () => { const os = S.orders.filter(o => ui.lastOrder.includes(o.id)); if (!os.length) return V.home(); const st = os[0].store, pay = os[0].status === 'pay';
  return `<div class="scr" style="background:#fff">${sb()}<div class="body"><div class="stack" style="padding:36px 20px;align-items:center;text-align:center;gap:10px">
<span class="icon-circle" style="width:84px;height:84px;border-radius:42px;background:var(--ok-soft);color:var(--ok)">${ic('checkCircle', 44)}</span>
<b style="font-size:22px;margin-top:10px">${pay ? '訂單已成立，請完成付款' : '訂單成立'}</b><span class="sub">${favOf(st) ? `已寄到你的${esc(favOf(st).label)}門市` : '已寄到你選的門市'}｜${os.length} 件商品</span>
<div class="card stack" style="width:100%;background:var(--bg);padding:16px;text-align:left;margin-top:16px;gap:10px">
 <div class="row" style="gap:8px"><span style="color:var(--ok);display:flex">${ic('store', 20)}</span><b>${STORES[st].n}</b>${storeTag(st)}</div>
 <div class="row sub" style="gap:8px">${ic('truck', 20)}預計 ${dayLabel(S.day + 2)} 到店</div>
 <div class="row small" style="gap:8px;color:var(--o)">${ic('bell', 20)}${S.notifyOn ? '到店會推播，點通知直接出示條碼' : '到店通知已關閉，記得在首頁查看今日待取'}</div></div>
<div class="stack" style="width:100%;margin-top:20px;gap:10px"><button class="btn" data-a="tabTo" data-r="orders/${pay ? 'pay' : 'prep'}">查看購買清單</button><button class="btn line" data-a="tab" data-r="home">回首頁</button></div>
</div></div></div>`; };

V.pickup = () => { const g = readyByStore(), ship = byStatus('ship'), n = byStatus('ready').length, t = ui.pickTab;
  return `<div class="scr">${hdr('取件中心', { back: false })}
<div class="seg"><button data-a="pickTab" data-v="ready" class="${t === 'ready' ? 'on' : ''}">可取貨（${n}）</button><button data-a="pickTab" data-v="ship" class="${t === 'ship' ? 'on' : ''}">運送中（${ship.length}）</button></div>
<div class="body"><div class="stack pad">
${!S.notifyOn ? `<button class="tip press" data-a="tab" data-r="notifs" style="text-align:left">${ic('bell')}<span class="grow">到店通知已關閉，開啟後包裹到店會提醒你</span><b>開啟</b></button>` : ''}
${t === 'ready' ? (n ? `<div class="sub small" style="margin:0 4px">依門市分組，一次看清楚要去哪裡拿</div>${Object.entries(g).map(([s, os]) => `<div class="card pad stack">
   <button class="row press" data-a="go" data-r="storelist/${s}" style="width:100%">${storeIcon(s)}<div class="grow"><div class="row" style="gap:8px"><b class="ellipsis" style="font-size:16px">${STORES[s].n}</b>${storeTag(s)}</div><div class="sub small" style="margin-top:2px">${os.length} 件可取｜期限 ${fmtDay(Math.min(...os.map(o => o.deadline)))}</div></div><span class="chev">${ic('right')}</span></button>
   <div class="divider"></div>
   <button class="row" data-a="go" data-r="storelist/${s}" style="gap:8px">${os.slice(0, 4).map(o => `<img class="thumb" style="width:56px;height:56px" src="${P[o.p].img}" alt="${esc(P[o.p].n)}">`).join('')}<span style="margin-left:6px;font-weight:500">共 ${os.length} 件</span></button>
   <button class="btn" data-a="go" data-r="barcode/${s}">出示整合條碼（${os.length} 件）</button></div>`).join('')}`
   : `<div class="card empty">${ic('checkCircle', 40, 'color:var(--ok)')}<div>目前沒有可取貨的包裹</div>${ship.length ? `<div class="small">${ship.length} 件運送中，到店會通知你</div>` : ''}</div>`)
 : (ship.length ? ship.map(o => `<div class="card pad stack"><div class="row" style="gap:8px"><span class="sub" style="display:flex">${ic('store', 20)}</span><b class="ellipsis">${STORES[o.store].n}</b>${storeTag(o.store)}</div>${orderLine(o, '<span class="tag grey round">運送中</span>')}${steps(2)}<div style="font-weight:500;font-size:13px">預計 ${dayLabel(o.eta)} 到店</div></div>`).join('') : `<div class="card empty">沒有運送中的包裹</div>`)}
${S.notifyOn && t === 'ready' ? `<div class="tip">${ic('bell')}<span>包裹到店會推播，點通知可直接開條碼</span></div>` : ''}
</div></div>${tabbar('pickup')}</div>`; };

V.storelist = s => { const os = byStatus('ready').filter(o => o.store === s), got = os.filter(o => S.picked[o.id]).length, dl = os.length ? Math.min(...os.map(o => o.deadline)) : 0;
  return `<div class="scr">${hdr(STORES[s].n)}<div class="body">
 <div style="background:#fff;padding:12px 16px" class="stack small"><div class="row" style="gap:8px">${ic('pin', 18)}${STORES[s].addr}</div><div class="row" style="gap:8px">${ic('clock', 18)}${STORES[s].hours}</div>${os.length ? `<div class="row" style="gap:8px;color:var(--o);font-weight:500">${ic('info', 18)}取件期限 ${fmtDay(dl)}，剩 ${dl - S.day} 天</div>` : ''}</div>
 <div class="stack pad">${os.length ? `<div class="row" style="margin:4px 4px 0"><b class="grow" style="font-size:15px">本店包裹（${os.length}）</b><span class="sub small">拿到就打勾</span></div>
  ${os.map(o => `<button class="card press" data-a="got" data-id="${o.id}" style="padding:12px;width:100%" role="checkbox" aria-checked="${!!S.picked[o.id]}">${orderLine(o, `<span class="check ${S.picked[o.id] ? 'on' : ''}">${S.picked[o.id] ? ic('check', 18) : ''}</span>`)}</button>`).join('')}
  <div style="font-weight:700;color:${got === os.length ? 'var(--ok)' : 'var(--o)'};margin:0 4px">${got === os.length ? `${os.length} 件都拿到了` : `已拿 ${got} / ${os.length} 件`}</div>` : `<div class="card empty">這家門市沒有待取的包裹</div>`}</div>
</div>${os.length ? `<div class="foot"><button class="btn" data-a="go" data-r="barcode/${s}">出示整合條碼（${os.length} 件）</button></div>` : ''}</div>`; };

V.barcode = s => { const os = byStatus('ready').filter(o => o.store === s);
  if (!os.length) return `<div class="scr">${hdr('取件條碼')}<div class="body"><div class="card empty" style="margin:12px">${ic('checkCircle', 40, 'color:var(--ok)')}<div>${STORES[s].n} 目前沒有待取的包裹</div><button class="btn sm" data-a="tab" data-r="pickup">回取件中心</button></div></div></div>`;
  const code = pickupCode(s);
  return `<div class="scr">${hdr('取件條碼')}<div class="body"><div class="stack pad">
<div class="card stack" style="padding:18px;align-items:center;text-align:center;gap:8px">
 <b style="font-size:17px">${STORES[s].n}</b><span class="tag">一次取 ${os.length} 件</span>
 <div style="width:100%;padding:8px 6px 0">${barcode(code)}</div>
 <div style="font-size:16px;font-weight:500;letter-spacing:.08em;font-variant-numeric:tabular-nums">${spaced(code)}</div>
 <div class="divider" style="width:100%;margin:6px 0"></div>
 <div class="row" style="width:100%;text-align:left">${qr(code)}<div class="grow"><div style="font-weight:500">店員也可掃 QR Code</div><div class="sub small" style="margin-top:4px">驗證碼 末三碼 ${code.slice(-3)}</div></div></div>
</div>
<div class="tip" style="background:#FFF6E0;color:#A86A00">${ic('sun')}螢幕已自動調到最亮，方便掃描</div>
<div class="card pad"><div class="sub small" style="margin-bottom:8px">這個條碼包含</div><div class="row" style="gap:8px">${os.slice(0, 4).map(o => `<img class="thumb" style="width:52px;height:52px" src="${P[o.p].img}" alt="${esc(P[o.p].n)}">`).join('')}<span style="margin-left:6px;font-weight:500">共 ${os.length} 件</span></div></div>
</div></div><div class="foot"><button class="btn" data-a="pickedAll" data-s="${s}">已拿齊 ${os.length} 件</button></div></div>`; };

V.picked = () => { const os = S.orders.filter(o => ui.lastPicked.includes(o.id)); if (!os.length) return V.home(); const coins = os.length * 5;
  return `<div class="scr" style="background:#fff">${sb()}<div class="body"><div class="stack" style="padding:32px 20px;align-items:center;gap:10px">
<span class="icon-circle" style="width:84px;height:84px;border-radius:42px;background:var(--ok-soft);color:var(--ok)">${ic('checkCircle', 44)}</span>
<b style="font-size:22px;margin-top:10px">取件完成</b><span class="sub">${os.length} 件已取，訂單自動完成</span>
<div class="card stack" style="width:100%;background:var(--bg);padding:6px 14px;margin-top:14px;gap:0">${os.map((o, i) => `<div class="row" style="padding:10px 0;${i ? 'border-top:1px solid var(--line)' : ''}"><img class="thumb" style="width:40px;height:40px" src="${P[o.p].img}" alt=""><span class="grow ellipsis">${esc(P[o.p].n)}</span><span style="color:var(--ok);display:flex">${ic('check', 20)}</span></div>`).join('')}</div>
${os.some(o => !o.rated) ? `<button class="card row press" data-a="go" data-r="review/${os.filter(o => !o.rated).map(o => o.id).join(',')}" style="width:100%;background:var(--o-soft);padding:14px;margin-top:6px"><span style="color:var(--o);display:flex">${ic('star', 22)}</span><div class="grow" style="text-align:left"><b>評價這 ${os.length} 件商品</b><div class="small" style="color:var(--o)">完成評價可得 ${coins} 蝦幣</div></div><span class="chev">${ic('right')}</span></button>` : ''}
<div class="stack" style="width:100%;margin-top:14px;gap:10px">${os.some(o => !o.rated) ? `<button class="btn" data-a="go" data-r="review/${os.filter(o => !o.rated).map(o => o.id).join(',')}">去評價</button>` : ''}<button class="btn line" data-a="tab" data-r="home">回首頁</button></div>
</div></div></div>`; };

V.review = ids => { const os = ids.split(',').map(id => S.orders.find(o => o.id === id)).filter(o => o && !o.rated);
  if (!os.length) return `<div class="scr">${hdr('評價')}<div class="body"><div class="card empty" style="margin:12px">${ic('checkCircle', 40, 'color:var(--ok)')}<div>都評價完了，謝謝你</div><button class="btn sm" data-a="tabTo" data-r="orders/done">查看完成訂單</button></div></div></div>`;
  ui.stars = ui.stars || {}; return `<div class="scr">${hdr('評價商品')}<form class="body" data-f="review" data-ids="${os.map(o => o.id).join(',')}" id="reviewForm"><div class="stack pad">
${os.map(o => { const st = ui.stars[o.id] ?? 5; return `<div class="card pad stack">${orderLine(o)}<div class="row"><span class="sub small grow">商品品質</span><div class="stars" role="radiogroup" aria-label="${esc(P[o.p].n)} 評分">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-a="star" data-id="${o.id}" data-n="${n}" class="${n <= st ? 'on' : ''}" role="radio" aria-checked="${n === st}" aria-label="${n} 星">${ic('star', 26)}</button>`).join('')}</div></div>
 <textarea class="field" name="t-${o.id}" aria-label="評價內容" placeholder="分享使用心得，幫助其他買家（選填）"></textarea></div>`; }).join('')}
</div></form><div class="foot"><button class="btn" data-a="submitReview">送出評價，領 ${os.length * 5} 蝦幣</button></div></div>`; };

V.notifs = () => { const t = ui.notifTab; const list = S.notifs.filter(n => t === '物流' ? n.kind !== 'promo' : n.kind === 'promo').sort((a, b) => b.d - a.d || b.time.localeCompare(a.time));
  return `<div class="scr">${hdr('通知', { back: false, right: unread() ? `<button class="small" data-a="readAll" style="color:#fff;padding:0 8px">全部已讀</button>` : '' })}
<div class="seg">${['物流', '優惠'].map(x => `<button data-a="notifTab" data-v="${x}" class="${t === x ? 'on' : ''}">${x}${S.notifs.filter(n => !n.read && (x === '物流' ? n.kind !== 'promo' : n.kind === 'promo')).length ? ' •' : ''}</button>`).join('')}</div>
<div class="body"><div class="stack pad">
<div class="card row" style="padding:12px 14px"><span style="color:var(--o);display:flex">${ic('bell', 22)}</span><div class="grow"><b>包裹到店通知</b><div class="sub small">關閉後仍可在首頁「今日待取」查看</div></div><button class="switch ${S.notifyOn ? 'on' : ''}" data-a="notify" role="switch" aria-checked="${S.notifyOn}" aria-label="包裹到店通知"></button></div>
${list.length ? list.map(n => `<button class="card row press" data-a="openNotif" data-id="${n.id}" style="padding:14px;width:100%;align-items:flex-start"><span class="icon-circle" style="background:${!n.read ? 'var(--o-soft)' : '#F0F0F0'};color:${!n.read ? 'var(--o)' : 'var(--sub)'}">${ic(n.ic, 22)}</span><div class="grow"><b style="font-size:15px">${esc(n.t)}</b><div class="sub small" style="margin-top:3px">${esc(n.b)}</div><div class="sub small" style="margin-top:2px">${dateOf(n.d)} ${n.time}</div></div>${!n.read ? '<span class="dot" style="margin-top:6px"></span>' : ''}</button>`).join('') : '<div class="card empty">目前沒有通知</div>'}
</div></div>${tabbar('notifs')}</div>`; };

V.me = () => { const cnt = st => byStatus(st).length; return `<div class="scr"><div class="hdr" style="padding-bottom:20px">${sb()}<div class="row" style="padding:10px 16px 0;gap:14px"><span class="icon-circle" style="width:56px;height:56px;border-radius:28px;background:#fff;color:var(--o)">${ic('user', 28)}</span><div class="grow"><div style="font-size:20px;font-weight:700">Amber</div><div class="small" style="margin-top:2px">蝦皮會員｜蝦幣 ${S.coins.toLocaleString()}</div></div>${cartBtn().replace('class="ib"', 'class="ib" style="color:#fff"')}</div></div>
<div class="body"><div class="stack pad">
<div class="card" style="padding:14px 8px 10px"><div class="row" style="padding:0 8px 12px"><b class="grow" style="font-size:16px">購買清單</b><button class="sub small" data-a="go" data-r="orders/ready">查看全部 ›</button></div>
<div style="display:grid;grid-template-columns:repeat(5,1fr)">${[['wallet', '待付款', 'pay'], ['package', '待出貨', 'prep'], ['truck', '運送中', 'ship'], ['store', '可取貨', 'ready'], ['star', '待評價', 'rate']].map(([i, l, t]) => { const b = t === 'rate' ? S.orders.filter(o => o.status === 'done' && !o.rated).length : cnt(t); return `<button data-a="go" data-r="orders/${t === 'rate' ? 'done' : t}" style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;position:relative;padding:4px 0">${ic(i)}${l}${b ? `<span class="badge" style="right:10px">${b}</span>` : ''}</button>`; }).join('')}</div></div>
<div class="card">${[['package', '取件中心', cnt('ready') ? cnt('ready') + ' 件可取貨' : '沒有待取包裹', 'tab:pickup', !!cnt('ready')], ['building', '常用門市', S.favs.map(f => f.label).join('、'), 'stores'], ['heart', '我的按讚', S.likes.length + ' 件', 'likes'], ['chat', '聊聊', '', 'chats']].map(([i, l, s, r, hot]) => `<button class="menu-row" data-a="${r.startsWith('tab:') ? 'tab' : 'go'}" data-r="${r.replace('tab:', '')}">${ic(i)}<span class="grow">${l}</span><span class="small" style="color:${hot ? 'var(--o)' : 'var(--sub)'}">${esc(s)}</span><span class="chev">${ic('right', 20)}</span></button>`).join('')}</div>
<div class="card">${[['coins', '蝦幣', S.coins.toLocaleString(), 'coins'], ['wallet', '蝦皮錢包', money(S.wallet), 'wallet'], ['ticket', '優惠券', S.coupons.filter(c => !c.used).length + ' 張可用', 'coupons'], ['bell', '通知設定', S.notifyOn ? '到店通知開啟' : '到店通知關閉', 'tab:notifs']].map(([i, l, s, r]) => `<button class="menu-row" data-a="${r.startsWith('tab:') ? 'tab' : 'go'}" data-r="${r.replace('tab:', '')}">${ic(i)}<span class="grow">${l}</span><span class="small sub">${s}</span><span class="chev">${ic('right', 20)}</span></button>`).join('')}</div>
<button class="card menu-row" data-a="go" data-r="menu">${ic('menu')}<span class="grow">原型說明與示範工具</span><span class="chev">${ic('right', 20)}</span></button>
</div></div>${tabbar('me')}</div>`; };

const OTABS = [['pay', '待付款'], ['prep', '待出貨'], ['ship', '運送中'], ['ready', '可取貨'], ['done', '完成'], ['cancel', '取消']];
V.orders = t => { const os = byStatus(t).sort((a, b) => b.placed - a.placed); let body = '';
  if (!os.length) body = `<div class="card empty">${ic('package', 40)}<div>這裡目前沒有訂單</div><button class="btn sm line" data-a="tab" data-r="results">去逛逛</button></div>`;
  else if (t === 'ready') body = Object.entries(readyByStore()).map(([s, g]) => `<div class="row" style="gap:8px;margin:4px 4px 0"><span style="color:var(--ok);display:flex">${ic('store', 20)}</span><b class="ellipsis">${STORES[s].n}</b>${storeTag(s)}</div>
   ${g.map(o => `<button class="card press" data-a="go" data-r="storelist/${s}" style="padding:12px;width:100%">${orderLine(o, '<span class="tag round">可取貨</span>')}</button>`).join('')}
   <div class="small" style="color:var(--o);font-weight:500;margin:0 4px">取件期限 ${fmtDay(Math.min(...g.map(o => o.deadline)))}，剩 ${Math.min(...g.map(o => o.deadline)) - S.day} 天</div>
   <button class="btn" data-a="go" data-r="barcode/${s}">出示整合條碼（${g.length} 件）</button>`).join('<div style="height:8px"></div>');
  else body = os.map(o => `<div class="card pad stack"><div class="row small"><span class="grow sub">${SHOPS[P[o.p].shop].n}</span><span style="color:var(--o)">${{ pay: '待付款', prep: '待出貨', ship: '運送中', done: '完成', cancel: '已取消' }[t]}</span></div>${orderLine(o)}
   <div class="row small sub" style="gap:6px">${ic('store', 16)}<span class="ellipsis">${STORES[o.store].n}</span>${storeTag(o.store)}</div>
   ${t === 'ship' ? steps(2) + `<div style="font-weight:500;font-size:13px">預計 ${dayLabel(o.eta)} 到店</div>` : ''}
   ${t === 'done' ? `<div class="sub small">${dateOf(o.picked)} 已取件</div>` : ''}
   <div class="row" style="justify-content:flex-end;gap:8px">
    ${t === 'pay' ? `<button class="btn sm line" data-a="cancelAsk" data-id="${o.id}">取消訂單</button><button class="btn sm" data-a="payNow" data-id="${o.id}">去付款 ${money(o.price * o.qty)}</button>` : ''}
    ${t === 'prep' ? `<button class="btn sm line" data-a="go" data-r="chat/${P[o.p].shop}">聊聊</button><button class="btn sm line" data-a="cancelAsk" data-id="${o.id}">取消訂單</button>` : ''}
    ${t === 'done' ? (o.rated ? '<span class="tag ok">已評價</span>' : `<button class="btn sm" data-a="go" data-r="review/${o.id}">評價領 5 蝦幣</button>`) : ''}
    ${t === 'done' || t === 'cancel' ? `<button class="btn sm line" data-a="go" data-r="product/${o.p}">再買一次</button>` : ''}
   </div></div>`).join('');
  return `<div class="scr">${hdr('購買清單')}<div class="seg">${OTABS.map(([k, l]) => { const n = byStatus(k).length; return `<button data-a="orderTab" data-v="${k}" class="${t === k ? 'on' : ''}" style="font-size:14px">${l}${n && !['done', 'cancel'].includes(k) ? ' ' + n : ''}</button>`; }).join('')}</div>
<div class="body"><div class="stack pad">${body}</div></div></div>`; };

V.stores = () => `<div class="scr">${hdr('常用門市')}<div class="body"><div class="stack pad">
<div class="sec-t">我的常用門市</div>
${S.favs.map(f => `<div class="card row" style="padding:14px">${storeIcon(f.store)}<div class="grow"><div class="row" style="gap:8px"><b class="ellipsis" style="font-size:15px">${STORES[f.store].n}</b><span class="tag ${labelStyle(f.label).cls}">${esc(f.label)}</span></div><div class="sub small" style="margin-top:3px">${STORES[f.store].addr}</div></div>
 <button class="ib" data-a="go" data-r="storepick/fav:${f.id}" aria-label="更換${esc(f.label)}門市" style="color:var(--sub)">${ic('edit', 20)}</button>${S.favs.length > 1 ? `<button class="ib" data-a="favDel" data-id="${f.id}" aria-label="刪除${esc(f.label)}門市" style="color:var(--sub)">${ic('trash', 20)}</button>` : ''}</div>`).join('')}
<button class="row" data-a="go" data-r="storeadd" style="justify-content:center;height:48px;border:1.5px dashed #C9C9C9;border-radius:12px;color:var(--sub);gap:6px;width:100%">${ic('plus', 20)}新增常用門市（學校等）</button>
<div class="sec-t">結帳預設</div>
<div class="card" style="padding:4px 16px">${[['weekday', '平日下單（一～五）'], ['weekend', '週末下單（六、日）']].map(([k, l], i) => `${i ? '<div class="divider"></div>' : ''}<label class="kv" style="padding:12px 0"><span>${l}</span><select data-ch="default" data-k="${k}" style="border:0;background:none;color:var(--o);font-weight:700;text-align:right">${S.favs.map(f => `<option value="${f.id}" ${S.defaults[k] === f.id ? 'selected' : ''}>寄到${esc(f.label)}門市</option>`).join('')}</select></label>`).join('')}</div>
<div class="sub small" style="margin:0 4px;line-height:1.6">今天是 ${dayLabel(S.day)}，結帳會自動帶入${esc(defaultFav()?.label || '')}門市</div>
</div></div></div>`;

V.storeadd = () => `<div class="scr">${hdr('新增常用門市')}<div class="body"><div class="stack pad">
<div class="sec-t">這是哪裡的門市？</div>
<div class="chips">${['學校', '公司', '住家', '其他'].map(l => `<button class="chip ${ui.addLabel === l ? 'on' : ''}" data-a="addLabel" data-v="${l}">${l}</button>`).join('')}</div>
${ui.addLabel === '其他' ? `<input class="field" id="addCustom" data-in="addCustom" maxlength="6" placeholder="自訂名稱，例如：健身房" value="${esc(ui.addCustom)}" aria-label="自訂名稱">` : ''}
${S.favs.some(f => f.label === ui.addLabel) ? `<div class="tip">${ic('info')}已經有「${esc(ui.addLabel)}」門市，新增後會取代原本的設定</div>` : ''}
</div></div><div class="foot"><button class="btn" data-a="addNext">下一步：選擇門市</button></div></div>`;

V.chats = () => `<div class="scr">${hdr('聊聊')}<div class="body"><div class="card" style="margin:12px">${Object.entries(SHOPS).map(([k, s]) => { const m = (S.chats[k] || []).slice(-1)[0]; return `<button class="menu-row" data-a="go" data-r="chat/${k}"><span class="icon-circle" style="background:var(--o-soft);color:var(--o)">${ic('store', 22)}</span><div class="grow" style="text-align:left"><b>${s.n}</b><div class="sub small ellipsis">${esc(m ? m.t : '點一下開始聊聊')}</div></div></button>`; }).join('')}</div></div></div>`;

V.chat = k => { const msgs = S.chats[k] || [], shop = SHOPS[k]; return `<div class="scr">${hdr(shop.n)}<div class="body" id="chatBody"><div class="stack" style="padding:16px 12px;gap:10px">
<div class="sub small" style="text-align:center">賣家通常 1 小時內回覆</div>
<div class="bubble them">您好，歡迎光臨${shop.n}，有什麼可以幫您？</div>
${msgs.map(m => `<div class="bubble ${m.me ? 'me' : 'them'}">${esc(m.t)}</div>`).join('')}
${ui.typing === k ? '<div class="bubble them sub">對方輸入中…</div>' : ''}
</div></div>
<div class="foot stack" style="gap:8px;padding-top:8px"><div class="chips" style="flex-wrap:nowrap;overflow-x:auto">${['什麼時候出貨？', '可以寄全家嗎？', '有其他顏色嗎？'].map(q => `<button class="chip" style="flex:none" data-a="quickMsg" data-k="${k}" data-v="${q}">${q}</button>`).join('')}</div>
<form class="row" data-f="chat" data-k="${k}" style="gap:8px"><input class="field" id="msg" name="msg" autocomplete="off" placeholder="輸入訊息" aria-label="輸入訊息"><button class="ib" style="background:var(--o);color:#fff;width:42px;height:42px;border-radius:21px" aria-label="送出">${ic('send', 20)}</button></form></div></div>`; };

V.likes = () => `<div class="scr">${hdr('我的按讚')}<div class="body">${S.likes.length ? `<div class="pgrid" style="padding-top:12px">${S.likes.map(k => pcard(k, true)).join('')}</div>` : `<div class="card empty" style="margin:12px">${ic('heart', 40)}<div>還沒有按讚的商品，在商品頁點愛心就會出現在這裡</div></div>`}</div></div>`;

V.coins = () => `<div class="scr">${hdr('蝦幣')}<div class="body"><div class="stack pad">
<div class="card" style="padding:22px 18px;background:linear-gradient(135deg,#F7B500,#F08C00);color:#fff"><div class="small">目前蝦幣</div><div style="font-size:34px;font-weight:700">${S.coins.toLocaleString()}</div><div class="small">1 蝦幣 = $1，結帳可折抵</div></div>
<div class="sec-t">蝦幣紀錄</div><div class="card">${S.coinLog.slice().reverse().map(l => `<div class="menu-row"><span class="grow">${esc(l.t)}</span><span class="sub small">${dateOf(l.d)}</span><b style="color:${l.v > 0 ? 'var(--ok)' : 'var(--o)'};width:56px;text-align:right">${l.v > 0 ? '+' : ''}${l.v}</b></div>`).join('')}</div>
</div></div></div>`;

V.wallet = () => `<div class="scr">${hdr('蝦皮錢包')}<div class="body"><div class="stack pad">
<div class="card" style="padding:22px 18px;background:var(--o);color:#fff"><div class="small">錢包餘額</div><div style="font-size:34px;font-weight:700">${money(S.wallet)}</div></div>
<div class="row" style="gap:10px">${[300, 500, 1000].map(v => `<button class="btn line" data-a="topup" data-v="${v}">儲值 ${money(v)}</button>`).join('')}</div>
<div class="sub small" style="margin:0 4px">示範版：按下即儲值，不會真的扣款</div></div></div></div>`;

V.coupons = () => { const own = S.coupons.map(u => ({ ...COUPON_POOL.find(c => c.id === u.ref), u })); const can = COUPON_POOL.filter(c => !S.coupons.some(u => u.ref === c.id && !u.used));
  const card = (c, right) => `<div class="coupon"><div class="l ${c.kind === 'ship' ? 'ship' : ''}">${c.kind === 'ship' ? ic('truck', 22) : `<span style="font-size:20px">$${c.off}</span>`}<span class="small">${c.kind === 'ship' ? '免運' : '折價'}</span></div><div class="r"><div class="grow"><b>${c.t}</b><div class="sub small">${c.d}</div></div>${right}</div></div>`;
  return `<div class="scr">${hdr('優惠券')}<div class="body"><div class="stack pad">
<div class="sec-t">可領取</div>${can.length ? can.map(c => card(c, `<button class="btn sm" data-a="claim" data-id="${c.id}">領取</button>`)).join('') : '<div class="sub" style="padding:4px">都領完了</div>'}
<div class="sec-t">我的票券</div>${own.length ? own.map(c => card(c, c.u.used ? '<span class="tag grey">已使用</span>' : '<span class="tag ok">可使用</span>')).join('') : '<div class="sub" style="padding:4px">還沒有票券</div>'}
</div></div></div>`; };

V.lock = () => { const n = S.notifyOn ? S.notifs.filter(x => x.kind === 'arrive' && !x.read).slice(-1)[0] || S.notifs.filter(x => x.kind === 'arrive').sort((a, b) => b.d - a.d)[0] : null; const live = n && byStatus('ready').some(o => o.store === n.store);
  return `<div class="scr lock">${sb()}<div class="body" style="display:flex;flex-direction:column;padding:0 14px">
<div style="text-align:center;margin-top:28px;font-size:16px;opacity:.9">12 月 ${S.day} 日 星期${weekday(S.day)}</div>
<div style="text-align:center;font-size:76px;font-weight:700;line-height:1.1;letter-spacing:-1px">18:32</div>
<div style="flex:1;min-height:100px"></div>
${n && live ? `<div class="pulse"><button class="notif tap press" data-a="openNotif" data-id="${n.id}" aria-label="打開蝦皮通知：${esc(n.t)}">
 <div class="row small" style="gap:8px"><span style="width:22px;height:22px;border-radius:6px;background:var(--o);color:#fff;display:grid;place-items:center">${ic('store', 14)}</span><b class="grow">蝦皮購物</b><span class="sub">現在</span></div>
 <b style="font-size:15px">${esc(n.t)}</b><span class="small">${esc(n.b)}</span></button></div>
<div class="nact"><button class="pri" data-a="openNotif" data-id="${n.id}">出示取件條碼</button><button data-a="toast" data-v="明天 9:00 再提醒你">明天提醒我</button></div>`
 : `<div class="notif" style="text-align:center;line-height:1.6">${S.notifyOn ? '目前沒有新的到店通知。<br>用「示範工具」讓包裹到店，就會出現蝦皮推播。' : '到店通知已關閉，所以這裡不會出現蝦皮通知。<br>打開蝦皮 App，首頁的「今日待取」一樣看得到。'}</div>
 <button class="nact" data-a="tab" data-r="home" style="width:100%"><span class="btn sm" style="width:100%">打開蝦皮 App</span></button>`}
<div class="notif" style="margin-top:10px;opacity:.75"><div class="row small" style="gap:8px"><span style="width:22px;height:22px;border-radius:6px;background:#06C755"></span><b class="grow">LINE</b><span class="sub">5 分鐘前</span></div><span class="small">媽媽：晚上回來吃飯嗎？</span></div>
<div style="text-align:center;font-size:12px;opacity:.8;padding:24px 0 18px">點蝦皮通知會直接打開 App 的取件條碼頁</div>
</div></div>`; };

const TASKS = [['home', '情境一', '從首頁看今天能拿幾件，到信義公司門市出示條碼'], ['search', '情境二', '搜尋保溫瓶，寄到常用門市並下訂單'], ['lock', '情境三', '收到到店推播，點通知直接出示整合條碼取件'], ['me', '自由瀏覽', '我的、購買清單、通知、常用門市']];
const TOOLS = [['advance', 'play', '物流推進一天（運送中 → 到店並推播）'], ['showLock', 'bell', '切到鎖定畫面看推播'], ['reset', 'history', '重設所有資料']];
V.menu = () => `<div class="scr" style="background:var(--desk)"><div class="body"><div class="stack" style="padding:calc(28px + env(safe-area-inset-top,0px)) 16px 24px;gap:12px">
<h1 style="font-size:24px;margin:0">蝦皮取件體驗優化</h1><p class="sub" style="margin:0;line-height:1.7">可操作原型。選一個任務開始；要回到這裡，長按畫面最上方的橘色標題列，或到「我的 → 原型說明與示範工具」。</p>
${TASKS.map(([r, b, s]) => `<button class="task" data-a="start" data-r="${r}"><b>${b}</b><span>${s}</span></button>`).join('')}
<h3 class="sub small" style="margin:10px 0 0;letter-spacing:.08em">示範工具｜今天 ${dayLabel(S.day)}</h3>
${TOOLS.map(([a, i, l]) => `<button class="tool" data-a="${a}">${ic(i)}${l}</button>`).join('')}
</div></div></div>`;

/* ========== 路由 ========== */
const OVERLAY = { filter: () => 'results', spec: a => 'product/' + a[0] };
const ROOTS = ['home', 'results', 'pickup', 'notifs', 'me', 'menu', 'lock'];
let stack = [];
const app = document.getElementById('app');
let lastRoute = '';
function viewOf(route) { const [n, ...a] = route.split('/'); return (V[n] || V.home)(...a); }
function render() {
  const r = stack[stack.length - 1] || 'home', [n, ...a] = r.split('/');
  const keep = r === lastRoute ? app.querySelector('.body')?.scrollTop : 0;
  const focusId = document.activeElement && app.contains(document.activeElement) ? document.activeElement.id : '';
  let html = OVERLAY[n] ? viewOf(OVERLAY[n](a)) + '<div class="dim" data-a="back"></div>' + viewOf(r) : viewOf(r);
  if (ui.dialog) html += '<div class="dim" data-a="closeDialog"></div>' + ui.dialog;
  app.innerHTML = html;
  const b = OVERLAY[n] ? app.querySelector('.scr .body') : app.querySelector('.body'); if (b && keep) b.scrollTop = keep;
  if (n === 'chat') { const c = document.getElementById('chatBody'); if (c) c.scrollTop = c.scrollHeight; }
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); } }
  if (n === 'search' && r !== lastRoute) document.getElementById('q')?.focus();
  lastRoute = r; const h = '#' + r; if (location.hash !== h) history.replaceState(history.state, '', h);
  save(); syncPanel();
}
function go(r) { const top = stack[stack.length - 1]; if (top && OVERLAY[top.split('/')[0]]) stack.pop(); if (stack[stack.length - 1] !== r) { stack.push(r); history.pushState({ d: stack.length }, '', '#' + r); } ui.dialog = null; render(); }
let skipPop = 0;
function back() { ui.dialog = null; if (stack.length > 1) { stack.pop(); skipPop++; history.back(); render(); } else { stack = ['home']; render(); } }
function tab(r) { stack = [r]; history.pushState({ d: 1 }, '', '#' + r); ui.dialog = null; render(); }
function setStack(a) { stack = a; history.pushState({ d: a.length }, '', '#' + a[a.length - 1]); ui.dialog = null; render(); }
window.addEventListener('popstate', () => { if (skipPop) { skipPop--; return; } if (stack.length > 1) stack.pop(); else { const h = location.hash.slice(1); stack = [h && V[h.split('/')[0]] ? h : 'home']; } ui.dialog = null; render(); });

function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; app.appendChild(d); setTimeout(() => d.remove(), 2500); }
function banner(n) { app.querySelector('.banner')?.remove(); const b = document.createElement('button'); b.className = 'banner'; b.dataset.a = 'openNotif'; b.dataset.id = n.id;
  b.innerHTML = `<div class="row small" style="gap:8px"><span style="width:20px;height:20px;border-radius:6px;background:var(--o);color:#fff;display:grid;place-items:center">${ic('store', 13)}</span><b class="grow">蝦皮購物</b><span class="sub">現在</span></div><b>${esc(n.t)}</b><span class="small sub">${esc(n.b)}</span>`;
  app.appendChild(b); setTimeout(() => b.remove(), 7000); }
function notify(n) { n.id = uid('n'); n.d = S.day; n.time = '18:' + String(10 + S.seq % 50).padStart(2, '0'); n.read = false; S.notifs.push(n); return n; }

/* ========== 動作 ========== */
const A = {
  back, go: d => go(d.r), tab: d => { if (d.r === 'pickup') ui.pickTab = 'ready'; tab(d.r); },
  tabTo: d => setStack([d.r.startsWith('orders') ? 'me' : 'home', d.r]),
  start: d => { if (d.r === 'search') { ui.q = ''; setStack(['home', 'search']); } else setStack([d.r]); },
  toast: d => toast(d.v),
  direct: () => { ui.filter = blankFilter(); ui.filter.ship = ['蝦皮店到店']; ui.q = ''; tab('results'); },
  doSearch: d => doSearch(d.q), clearHistory: () => { S.history = []; render(); }, clearQ: () => { ui.q = ''; render(); },
  sort: d => { ui.sort = d.v; render(); },
  fchip: d => { const a = ui.filter[d.k], i = a.indexOf(d.v); i < 0 ? a.push(d.v) : a.splice(i, 1); readPrice(); render(); },
  frate: d => { ui.filter.rate = ui.filter.rate === d.v ? '' : d.v; readPrice(); render(); },
  resetFilter: () => { ui.filter = blankFilter(); if (stack[stack.length - 1] !== 'filter') ui.q = ''; render(); },
  applyFilter: () => { readPrice(); back(); },
  like: d => { const i = S.likes.indexOf(d.k); i < 0 ? S.likes.push(d.k) : S.likes.splice(i, 1); render(); toast(i < 0 ? '已加入我的按讚' : '已取消按讚'); },
  share: () => { const u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('已複製商品連結'), () => toast('連結：' + u)); },
  opt: d => { ui.sel.spec[+d.i] = d.v; render(); },
  selQty: d => { ui.sel.qty = Math.max(1, Math.min(9, ui.sel.qty + +d.d)); render(); },
  addCart: () => { const s = ui.sel, same = S.cart.find(c => c.p === s.p && c.spec.join() === s.spec.join()); if (same) same.qty = Math.min(9, same.qty + s.qty); else S.cart.push({ id: uid('k'), p: s.p, spec: [...s.spec], qty: s.qty, on: true }); back(); setTimeout(() => toast('已加入購物車'), 30); },
  buyNow: () => { const s = ui.sel; startCheckout([{ p: s.p, spec: [...s.spec], qty: s.qty, price: unitPrice(s.p, s.spec) }], null); },
  cartOn: d => { const c = S.cart.find(x => x.id === d.id); c.on = !c.on; render(); },
  cartAll: () => { const v = !S.cart.every(c => c.on); S.cart.forEach(c => (c.on = v)); render(); },
  cartQty: d => { const c = S.cart.find(x => x.id === d.id); c.qty = Math.max(1, Math.min(9, c.qty + +d.d)); render(); },
  cartDel: d => { S.cart = S.cart.filter(x => x.id !== d.id); render(); toast('已從購物車移除'); },
  cartCheckout: () => { const on = S.cart.filter(c => c.on); if (on.length) startCheckout(on.map(c => ({ p: c.p, spec: c.spec, qty: c.qty, price: unitPrice(c.p, c.spec) })), on.map(c => c.id)); },
  pay: d => { ui.co.pay = d.v; render(); },
  coCoins: () => { ui.co.coins = !ui.co.coins; render(); },
  placeOrder,
  pickStore: d => pickStore(d.s, d.ctx),
  pickTab: d => { ui.pickTab = d.v; render(); },
  got: d => { S.picked[d.id] = !S.picked[d.id]; render(); },
  pickedAll: d => pickedAll(d.s),
  star: d => { ui.stars[d.id] = +d.n; render(); },
  submitReview,
  notifTab: d => { ui.notifTab = d.v; render(); },
  notify: () => { S.notifyOn = !S.notifyOn; render(); toast(S.notifyOn ? '已開啟到店通知' : '已關閉到店通知，首頁的今日待取仍會顯示'); },
  readAll: () => { S.notifs.forEach(n => (n.read = true)); render(); },
  openNotif: d => { const n = S.notifs.find(x => x.id === d.id); if (!n) return; n.read = true; app.querySelector('.banner')?.remove();
    const base = n.go.startsWith('barcode') ? 'pickup' : n.go.startsWith('orders') ? 'me' : 'notifs'; setStack([base, n.go]); },
  orderTab: d => { stack[stack.length - 1] = 'orders/' + d.v; history.replaceState(history.state, '', '#orders/' + d.v); render(); },
  payNow: d => { const o = S.orders.find(x => x.id === d.id); o.status = 'prep'; render(); toast('付款完成，賣家準備出貨'); },
  cancelAsk: d => { ui.dialog = `<div class="dialog" role="alertdialog" aria-label="取消訂單"><b style="font-size:17px">確定要取消這筆訂單嗎？</b><div class="sub" style="line-height:1.6">取消後無法復原，已付款的金額會退回蝦皮錢包。</div><div class="row" style="gap:10px"><button class="btn line" data-a="closeDialog">再想想</button><button class="btn" data-a="cancelOrder" data-id="${d.id}">確定取消</button></div></div>`; render(); },
  closeDialog: () => { ui.dialog = null; render(); },
  cancelOrder: d => { const o = S.orders.find(x => x.id === d.id); if (o.paid) S.wallet += o.price * o.qty; o.status = 'cancel'; ui.dialog = null; render(); toast('訂單已取消'); },
  favDel: d => { const f = S.favs.find(x => x.id === d.id); S.favs = S.favs.filter(x => x.id !== d.id); ['weekday', 'weekend'].forEach(k => { if (S.defaults[k] === d.id) S.defaults[k] = S.favs[0].id; }); render(); toast(`已刪除${f.label}門市`); },
  addLabel: d => { ui.addLabel = d.v; render(); },
  addNext: () => { if (ui.addLabel === '其他' && !ui.addCustom.trim()) { toast('請先輸入自訂名稱'); return; } ui.storeQ = ''; go('storepick/add'); },
  quickMsg: d => sendMsg(d.k, d.v),
  topup: d => { S.wallet += +d.v; render(); toast(`已儲值 ${money(+d.v)}`); },
  claim: d => { S.coupons.push({ id: uid('u'), ref: d.id, used: false }); render(); toast('已領取，結帳時會自動套用'); },
  advance, showLock: () => setStack(['lock']), reset: () => { S = initialState(); Object.assign(ui, { q: '', filter: blankFilter(), co: null, sel: null, preferStore: null, dialog: null }); setStack(['home']); toast('資料已重設'); },
};

function readPrice() { const a = document.getElementById('pmin'), b = document.getElementById('pmax'); if (a) ui.filter.min = a.value.replace(/\D/g, ''); if (b) ui.filter.max = b.value.replace(/\D/g, ''); }
function doSearch(q) { q = q.trim(); ui.q = q; if (q) S.history = [q, ...S.history.filter(h => h !== q)].slice(0, 6); stack = stack.filter(r => r !== 'search'); if (!stack.length) stack = ['home']; go('results'); }
function startCheckout(items, cartIds) { ui.co = { items, cartIds, store: shipStore(), pay: 'cod', coins: false, coupon: null }; go('checkout'); }
function pickStore(s, ctx) {
  if (ctx === 'checkout') ui.co.store = s;
  else if (ctx === 'product') ui.preferStore = s;
  else if (ctx.startsWith('fav:')) { const f = S.favs.find(x => x.id === ctx.slice(4)); f.store = s; }
  else if (ctx === 'add') { const label = ui.addLabel === '其他' ? ui.addCustom.trim() : ui.addLabel; const ex = S.favs.find(f => f.label === label);
    if (ex) ex.store = s; else S.favs.push({ id: uid('f'), label, store: s }); ui.addCustom = '';
    stack = stack.filter(r => r !== 'storeadd'); toast(`已新增${label}門市：${STORES[s].n}`); back(); return; }
  toast('取件門市：' + STORES[s].n); back();
}
function placeOrder() {
  const c = ui.co, k = coCalc(); if (c.pay === 'wallet' && S.wallet < k.total) { toast('錢包餘額不足'); return; }
  const ids = [], status = c.pay === 'atm' ? 'pay' : 'prep';
  c.items.forEach(i => { const o = { id: uid('o'), no: String(1000 + Math.floor(Math.random() * 9000)), p: i.p, spec: i.spec, qty: i.qty, price: i.price, store: c.store, status, placed: S.day, paid: c.pay === 'wallet' || c.pay === 'card' }; S.orders.unshift(o); ids.push(o.id); });
  if (k.shipCp) S.coupons.find(u => u.id === k.shipCp.uid).used = true;
  if (k.off) S.coupons.find(u => u.id === c.coupon).used = true;
  if (k.coin) { S.coins -= k.coin; S.coinLog.push({ t: '結帳折抵', v: -k.coin, d: S.day }); }
  if (c.pay === 'wallet') S.wallet -= k.total;
  if (c.cartIds) S.cart = S.cart.filter(x => !c.cartIds.includes(x.id));
  ui.lastOrder = ids; ui.co = null; ui.preferStore = null; setStack(['home', 'ordered']);
}
function pickedAll(s) {
  const os = byStatus('ready').filter(o => o.store === s); os.forEach(o => { o.status = 'done'; o.picked = S.day; o.rated = false; delete S.picked[o.id]; });
  S.notifs.filter(n => n.kind === 'arrive' && n.store === s).forEach(n => (n.read = true));
  notify({ ic: 'checkCircle', t: `${os.length} 件已取件，訂單自動完成`, b: '評價可得蝦幣', go: 'orders/done', kind: 'done' }).read = true;
  ui.lastPicked = os.map(o => o.id); setStack(['home', 'picked']);
}
function submitReview() {
  const f = document.getElementById('reviewForm'); if (!f) return; const ids = f.dataset.ids.split(','); let n = 0;
  ids.forEach(id => { const o = S.orders.find(x => x.id === id); if (!o || o.rated) return; o.rated = true; n++; S.reviews.push({ p: o.p, spec: o.spec, stars: ui.stars[id] ?? 5, text: (f.elements['t-' + id]?.value || '').trim() }); });
  S.coins += n * 5; S.coinLog.push({ t: `評價 ${n} 件商品`, v: n * 5, d: S.day }); ui.stars = {};
  setStack(['me', 'orders/done']); toast(`感謝評價，獲得 ${n * 5} 蝦幣`);
}
function sendMsg(k, t) { if (!t.trim()) return; (S.chats[k] = S.chats[k] || []).push({ me: true, t: t.trim() }); ui.typing = k; render();
  setTimeout(() => { const r = SHOPS[k].reply; S.chats[k].push({ me: false, t: r[S.chats[k].length % r.length] }); ui.typing = null; if (stack[stack.length - 1] === 'chat/' + k) render(); else save(); }, 1100); }
function advance() {
  S.day++; let shipped = 0; const arrived = {};
  S.orders.forEach(o => { if (o.status === 'ship' && o.eta <= S.day) { o.status = 'ready'; o.deadline = S.day + 7; (arrived[o.store] = arrived[o.store] || []).push(o); } });
  S.orders.forEach(o => { if (o.status === 'prep' && o.placed < S.day) { o.status = 'ship'; o.eta = S.day + 1; shipped++; } });
  if (shipped) notify({ ic: 'truck', t: `${shipped} 件包裹已出貨`, b: '到店會再通知你', go: 'orders/ship', kind: 'ship' });
  let last = null;
  Object.entries(arrived).forEach(([s, os]) => { const all = byStatus('ready').filter(o => o.store === s).length;
    S.notifs.filter(n => n.kind === 'arrive' && n.store === s).forEach(n => (n.read = true));
    last = notify({ ic: 'package', t: `${all} 件包裹已到 ${STORES[s].n}`, b: `點一下直接出示整合條碼，取件期限 ${fmtDay(S.day + 7)}`, go: 'barcode/' + s, kind: 'arrive', store: s }); });
  render();
  const n = Object.values(arrived).flat().length;
  toast(`今天 ${dayLabel(S.day)}：${n ? n + ' 件到店' : '沒有包裹到店'}${shipped ? `，${shipped} 件出貨` : ''}`);
  if (last && S.notifyOn) setTimeout(() => banner(last), 400);
}

/* ========== 事件 ========== */
app.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (!el || el.disabled || !app.contains(el)) return; const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el.dataset, el); } });
app.addEventListener('submit', e => { e.preventDefault(); const f = e.target;
  if (f.dataset.f === 'search') doSearch(f.elements.q.value);
  if (f.dataset.f === 'chat') { const v = f.elements.msg.value; f.elements.msg.value = ''; sendMsg(f.dataset.k, v); }
});
app.addEventListener('input', e => { const t = e.target;
  if (t.id === 'q') { const q = t.value.trim().toLowerCase(), box = document.getElementById('suggest'); ui.q = t.value;
    const hits = q ? Object.keys(P).filter(k => P[k].n.toLowerCase().includes(q) || P[k].kw.some(w => w.toLowerCase().includes(q))) : [];
    box.innerHTML = hits.map(k => `<button class="menu-row" data-a="doSearch" data-q="${esc(P[k].kw[0])}">${ic('search', 18)}<span class="grow">${esc(P[k].n)}</span></button>`).join(''); }
  if (t.dataset.in === 'storeq') { ui.storeQ = t.value; render(); }
  if (t.dataset.in === 'addCustom') ui.addCustom = t.value;
});
app.addEventListener('change', e => { const t = e.target;
  if (t.dataset.ch === 'coupon') { ui.co.coupon = t.value || null; render(); }
  if (t.dataset.ch === 'default') { S.defaults[t.dataset.k] = t.value; render(); toast('已更新結帳預設'); }
});
let lp; app.addEventListener('pointerdown', e => { if (e.target.closest('.sb,.hdr') && !e.target.closest('button,input')) lp = setTimeout(() => setStack(['menu']), 700); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(t => app.addEventListener(t, () => clearTimeout(lp)));

/* 桌機側欄 */
const panel = document.getElementById('panel');
function syncPanel() { if (!panel) return; panel.querySelector('#day').textContent = `今天 ${dayLabel(S.day)}`; }
if (panel) {
  panel.querySelector('#tasks').innerHTML = TASKS.map(([r, b, s]) => `<button class="task" data-a="start" data-r="${r}"><b>${b}</b><span>${s}</span></button>`).join('');
  panel.querySelector('#tools').innerHTML = TOOLS.map(([a, i, l]) => `<button class="tool" data-a="${a}">${ic(i)}${l}</button>`).join('');
  panel.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset, el); });
}

/* 啟動 */
const h = decodeURIComponent(location.hash.slice(1));
const narrow = matchMedia('(max-width:760px)').matches;
const first = h && V[h.split('/')[0]] && !['ordered', 'picked', 'checkout'].includes(h) ? h : (narrow ? 'menu' : 'home');
stack = ROOTS.includes(first.split('/')[0]) ? [first] : ['home', first];
if (stack.length > 1) { history.replaceState({ d: 1 }, '', '#' + stack[0]); history.pushState({ d: 2 }, '', '#' + first); } else history.replaceState({ d: 1 }, '', '#' + first);
render();
