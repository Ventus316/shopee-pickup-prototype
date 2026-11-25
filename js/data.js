// 靜態資料：商品、門市、賣場、icon、初始狀態

export const ICONS = {
  search: '<path d="M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/><path d="M21 21l-4.3-4.3"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2.5l2.7 12.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L22.5 7H5.2"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  home: '<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  package: '<path d="M21 8l-9-5-9 5v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  truck: '<path d="M1 4h14v12H1Z"/><path d="M15 8h4l4 4v4h-8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1Z"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9Z"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  store: '<path d="M2 7l2-4h16l2 4"/><path d="M2 7h20v3a3 3 0 0 1-5 2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-2Z"/><path d="M4 12v9h16v-9"/><path d="M10 21v-5h4v5"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  house: '<path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/><path d="M10 21v-5h4v5"/>',
  school: '<path d="M22 10L12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  play: '<path d="M6 4l14 8-14 8Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};

export const SHOPS = {
  warm: { n: '日常保溫館', reply: ['您好，訂單會在 24 小時內出貨喔！', '保溫瓶都有附防塵蓋，可以放心購買。', '可以寄 7-11 或全家，結帳時選門市就好。'] },
  cotton: { n: '棉質生活', reply: ['您好，T 恤是 100% 純棉，版型偏大一號。', '今天下單明天出貨喔。'] },
  shell: { n: '殼殼小舖', reply: ['您好，手機殼有 iPhone 15 與 15 Pro 兩種。', '有附贈螢幕保護貼喔！'] },
};

// opt：規格；add：加價
export const PRODUCTS = {
  p1: { n: '不鏽鋼保溫瓶 500ml', img: 'img/cup1.jpg', price: 399, rate: 4.9, sold: '1.2 萬', shop: 'warm', desc: '不鏽鋼保溫瓶 500ml｜12 小時保溫保冷，霧面不留指紋',
    kw: ['保溫瓶', '水壺', '不鏽鋼', '保冷'], ship: ['7-11 取貨', '全家取貨', '宅配'], from: '台灣', capB: '500ml 以下',
    opt: [{ n: '顏色', v: ['霧灰', '奶油白', '墨綠'] }, { n: '容量', v: ['500ml', '750ml'], add: [0, 60] }] },
  p2: { n: '真空保溫瓶 750ml 墨綠', img: 'img/cup2.jpg', price: 459, rate: 4.8, sold: '8,214', shop: 'warm', desc: '真空保溫瓶 750ml｜雙層真空，大容量一天份',
    kw: ['保溫瓶', '水壺', '真空', '大容量'], ship: ['7-11 取貨', '全家取貨', '蝦皮店到店'], from: '台灣', capB: '500–750ml',
    opt: [{ n: '顏色', v: ['墨綠', '霧灰'] }, { n: '容量', v: ['750ml'] }] },
  p3: { n: '隨行咖啡杯 防漏蓋', img: 'img/cup3.jpg', price: 329, rate: 4.7, sold: '5,630', shop: 'warm', desc: '隨行咖啡杯｜防漏蓋，可放車用杯架',
    kw: ['咖啡杯', '隨行杯', '保溫瓶', '杯子'], ship: ['7-11 取貨', '宅配'], from: '海外', capB: '500ml 以下',
    opt: [{ n: '顏色', v: ['白', '黑'] }, { n: '容量', v: ['350ml', '500ml'], add: [0, 40] }] },
  p4: { n: '馬卡龍保溫瓶 3 色', img: 'img/cup4.jpg', price: 499, rate: 4.9, sold: '3,105', shop: 'warm', desc: '馬卡龍保溫瓶｜粉、綠、橘三色，輕量好攜帶',
    kw: ['保溫瓶', '水壺', '馬卡龍', '彩色'], ship: ['7-11 取貨', '全家取貨'], from: '台灣', capB: '500–750ml',
    opt: [{ n: '顏色', v: ['粉', '綠', '橘'] }, { n: '容量', v: ['600ml'] }] },
  shirt: { n: '純棉短袖 T 恤', img: 'img/shirt.jpg', price: 290, rate: 4.8, sold: '1.2 萬', shop: 'cotton', desc: '純棉短袖 T 恤｜100% 棉，透氣不悶熱',
    kw: ['T 恤', 't恤', '短袖', '衣服', '上衣'], ship: ['7-11 取貨', '全家取貨', '宅配'], from: '台灣', capB: '',
    opt: [{ n: '顏色', v: ['白色', '黑色'] }, { n: '尺寸', v: ['S', 'M', 'L', 'XL'] }] },
  case: { n: '馬卡龍防摔手機殼', img: 'img/case.jpg', price: 250, rate: 4.8, sold: '9,870', shop: 'shell', desc: '馬卡龍防摔手機殼｜四角氣囊，附螢幕保護貼',
    kw: ['手機殼', 'iphone', '防摔', '殼'], ship: ['7-11 取貨', '蝦皮店到店'], from: '海外', capB: '',
    opt: [{ n: '顏色', v: ['粉', '藍', '綠'] }, { n: '型號', v: ['iPhone 15', 'iPhone 15 Pro'] }] },
};

export const STORES = {
  s1: { n: '7-11 信義公司門市', addr: '台北市信義區松仁路 100 號', hours: '24 小時營業' },
  s2: { n: '全家 永和住家門市', addr: '新北市永和區永和路二段 50 號', hours: '24 小時營業' },
  s3: { n: '7-11 松仁門市', addr: '台北市信義區松仁路 58 號', hours: '24 小時營業', dist: '350 m' },
  s4: { n: '萊爾富 信義店', addr: '台北市信義區信義路五段 7 號', hours: '07:00–23:00', dist: '420 m' },
  s5: { n: '全家 松高店', addr: '台北市信義區松高路 12 號', hours: '24 小時營業', dist: '510 m' },
  s6: { n: '7-11 台大門市', addr: '台北市大安區羅斯福路四段 1 號', hours: '24 小時營業', dist: '6.2 km' },
  s7: { n: '全家 師大店', addr: '台北市大安區和平東路一段 129 號', hours: '24 小時營業', dist: '5.8 km' },
};

export const LABEL_STYLE = { 公司: { cls: '', ic: 'building' }, 住家: { cls: 'home', ic: 'house' }, 學校: { cls: 'ok', ic: 'school' } };

export const HOT = ['保溫瓶', 'T 恤', '手機殼', '咖啡杯'];

export const COUPON_POOL = [
  { id: 'c-ship', kind: 'ship', t: '免運券', d: '超商取貨免運', min: 0, off: 60 },
  { id: 'c-50', kind: 'cash', t: '$50 折價券', d: '滿 $499 可用', min: 499, off: 50 },
  { id: 'c-30', kind: 'cash', t: '$30 折價券', d: '滿 $299 可用', min: 299, off: 30 },
];

// 示範日期：day 1 = 12/01（二）
export const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
export const fmtDay = d => `12/${String(d).padStart(2, '0')}`;
export const weekday = d => WEEK[(d + 1) % 7];

export function initialState() {
  return {
    day: 1,
    orders: [
      { id: 'o1', no: '4821', p: 'p1', spec: ['霧灰', '500ml'], qty: 1, price: 399, store: 's1', status: 'ready', deadline: 5, placed: -4 },
      { id: 'o2', no: '1093', p: 'shirt', spec: ['白色', 'L'], qty: 1, price: 290, store: 's1', status: 'ready', deadline: 6, placed: -3 },
      { id: 'o3', no: '7756', p: 'case', spec: ['粉', 'iPhone 15'], qty: 1, price: 250, store: 's1', status: 'ready', deadline: 6, placed: -3 },
      { id: 'o4', no: '5307', p: 'p2', spec: ['墨綠', '750ml'], qty: 1, price: 459, store: 's2', status: 'ship', eta: 3, placed: -1 },
      { id: 'o5', no: '6620', p: 'p4', spec: ['粉', '600ml'], qty: 1, price: 499, store: 's2', status: 'done', picked: -10, placed: -16, rated: false },
      { id: 'o6', no: '3381', p: 'p3', spec: ['黑', '350ml'], qty: 1, price: 329, store: 's1', status: 'cancel', placed: -20 },
    ],
    favs: [{ id: 'f1', label: '公司', store: 's1' }, { id: 'f2', label: '住家', store: 's2' }],
    defaults: { weekday: 'f1', weekend: 'f2' },
    cart: [{ id: 'k1', p: 'shirt', spec: ['黑色', 'M'], qty: 1, on: true }],
    coins: 1280,
    coinLog: [{ t: '完成評價', v: 15, d: -10 }, { t: '每日簽到', v: 5, d: 0 }],
    wallet: 520,
    coupons: [{ id: 'u1', ref: 'c-ship', used: false }],
    notifyOn: true,
    notifs: [
      { id: 'n1', ic: 'package', t: '3 件包裹已到 7-11 信義公司門市', b: '點一下直接出示整合條碼，取件期限 12/05', d: 1, time: '18:32', read: false, go: 'barcode/s1', kind: 'arrive', store: 's1' },
      { id: 'n2', ic: 'truck', t: '1 件包裹運送中', b: '預計 12/03 到全家 永和住家門市', d: 1, time: '09:10', read: false, go: 'orders/ship', kind: 'ship' },
      { id: 'n3', ic: 'checkCircle', t: '訂單已完成', b: '馬卡龍保溫瓶｜評價可得 5 蝦幣', d: -10, time: '20:05', read: true, go: 'orders/done', kind: 'done' },
      { id: 'n4', ic: 'ticket', t: '雙 11 延長賽｜全站免運', b: '免運券已放進你的票券', d: 0, time: '12:00', read: true, go: 'coupons', kind: 'promo' },
    ],
    picked: {},
    likes: [],
    history: ['保溫瓶', '手機殼'],
    chats: {},
    reviews: [],
    seq: 10,
  };
}
