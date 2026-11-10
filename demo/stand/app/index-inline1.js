
(function(){
  const $ = id => document.getElementById(id);
  const WD = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
  const WDS = ["вс","пн","вт","ср","чт","пт","сб"];
  const WD_FORM = ["ПОНЕДЕЛЬНИК","ВТОРНИК","СРЕДА","ЧЕТВЕРГ","ПЯТНИЦА","СУББОТА","ВОСКРЕСЕНЬЕ"];
  const MON = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  const MON_G = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const LOGO="data:image/png;base64,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";
  const DEF_CFG = {name:"", group:"", tin:"Приехал на объект {объект}, {время}", tout:"Уехал с объекта {объект}, {время}"};

  let db=null, days={}, cfg={...DEF_CFG}, canWrite=true;
  const pad=n=>String(n).padStart(2,"0");
  const key=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)};
  const nowHM=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
  const toMin=t=>{if(!t)return null;const [h,m]=t.split(":").map(Number);return h*60+m};
  const mins=e=>{const s=toMin(e.start),f=toMin(e.end);if(s==null||f==null)return 0;return Math.max(0,f-s-(Number(e.breakMin)||0))};
  const fmt=m=>Math.floor(m/60)+":"+pad(m%60);
  /* перерыв вне списка 0/30/60/90 (после таймера) — добавляем пункт, иначе select сбросится в пусто и 0 минут */
  function setBreak(sel,v){v=String(Number(v)||0);if(![...sel.options].some(o=>o.value===v)){const o=document.createElement("option");o.value=v;const n=Number(v);o.textContent=n<60?n+" мин":n%60?Math.floor(n/60)+" ч "+(n%60):Math.floor(n/60)+" ч";sel.appendChild(o)}sel.value=v}
  const ddmm=k=>{const d=parse(k);return pad(d.getDate())+"."+pad(d.getMonth()+1)};
  const monday=d=>{const x=new Date(d);x.setDate(x.getDate()-((x.getDay()+6)%7));x.setHours(0,0,0,0);return x};
  const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  function toast(t){const el=document.createElement("div");el.className="toast";el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2200)}
  function setStatus(t){const s=$("status");if(!t){s.hidden=true;return}s.hidden=false;s.textContent=t}
  async function copy(text){try{await navigator.clipboard.writeText(text);toast("Скопировано")}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("Скопировано")}catch(_){toast("Выделите текст и скопируйте вручную")}ta.remove()}}

  /* ---------- tabs ---------- */
  function selectTab(name){
    document.querySelectorAll(".tabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.tab===name?"true":"false"));
    ["route","today","log","report"].forEach(t=>$("p-"+t).hidden=(t!==name));
    if(name==="report")renderReport();
    if(name==="log")renderLog();
    if(name==="route")renderRoute();
  }
  document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>selectTab(b.dataset.tab)));

  /* ---------- route ---------- */
  const dirUrl=dest=>"https://www.google.com/maps/dir/?api=1&travelmode=driving&destination="+encodeURIComponent(dest);
  const destOf=e=>e.geo?`${e.geo.lat.toFixed(6)},${e.geo.lng.toFixed(6)}`:e.place;
  function lastWorkDay(){const t=todayKey();const ks=Object.keys(days).filter(k=>k<t&&(days[k].place||"").trim()).sort();return ks.length?days[ks[ks.length-1]]:null}
  function renderRoute(){
    const l=lastWorkDay(),q=$("rt-q"),go=$("rt-go");
    if(l){const d=parse(l.date);q.innerHTML=`Едем туда же, где работали ${ddmm(l.date)} (${WD[d.getDay()]})?<b>${esc(l.place)}</b>`;go.href=dirUrl(destOf(l));go.hidden=false}
    else{q.textContent="Прошлых объектов пока нет. Введите адрес ниже.";go.hidden=true}
    const o=$("rt-other").value.trim(),g2=$("rt-go2");g2.href=o?dirUrl(o):"#";g2.classList.toggle("disabled",!o);
    const seen=new Set(),rec=[];Object.keys(days).sort().reverse().forEach(k=>{const e=days[k],pl=(e.place||"").trim();if(!pl||seen.has(pl)||(l&&pl===(l.place||"").trim()))return;seen.add(pl);if(rec.length<5)rec.push(e)});
    $("rt-recent-card").hidden=!rec.length;
    $("rt-recent").innerHTML=rec.map(e=>`<a class="btn" target="_blank" rel="noopener" href="${esc(dirUrl(destOf(e)))}">${esc(e.place)}</a>`).join("");
  }
  $("rt-other").addEventListener("input",renderRoute);
  $("rt-here").addEventListener("click",()=>selectTab("today"));

  /* ---------- storage ---------- */
  async function saveDay(e){
    if(!db){toast("Журнал недоступен в этом окне");return false}
    try{await db.collection("days").doc(e.date).set(e);return true}
    catch(err){const q=err&&(err.code==="quota_exceeded"||err.name==="QuotaExceededError"||/quota/i.test(err.message||""));toast(q?"Память телефона заполнена — удалите старые фото или сделайте копию":"Не сохранилось, попробуйте ещё раз");return false}
  }
  async function delDay(k){if(!db)return;try{await db.collection("days").doc(k).delete()}catch(e){toast("Не удалилось")}}

  /* ---------- today ---------- */
  const todayKey=()=>key(new Date());
  /* черновик формы «Сегодня»: поля, которые пользователь начал править, не перезаписываются при перерисовке
     и подхватываются при любом сохранении (фото, приезд, отъезд) */
  const tDirty=new Set();
  ["t-work","t-extra","t-start","t-end","t-break"].forEach(id=>$(id).addEventListener("input",()=>tDirty.add(id)));
  function todayDraft(base){const d={...base};
    if(tDirty.has("t-work"))d.work=$("t-work").value.trim();
    if(tDirty.has("t-extra"))d.extra=$("t-extra").value.trim();
    if(tDirty.has("t-start")&&$("t-start").value)d.start=$("t-start").value;
    if(tDirty.has("t-end"))d.end=$("t-end").value;
    if(tDirty.has("t-break"))d.breakMin=Number($("t-break").value);
    return d}
  function renderToday(){
    const d=new Date(),k=todayKey(),e=days[k];
    $("t-wd").textContent=WD[d.getDay()];
    $("t-date").textContent=d.getDate()+" "+MON_G[d.getMonth()]+" "+d.getFullYear();
    if(document.activeElement!==$("t-place")&&!$("t-place").dataset.touched){const planPl=(window.ANKCrew&&ANKCrew.planPlace&&ANKCrew.planPlace())||"";$("t-place").value=(e&&e.start)?(e.place||""):((e&&e.place)||planPl||lastPlace()||(geo?geo.addr:""))}
    renderGeo(e);
    $("b-in-s").textContent=e&&e.start?"в "+e.start:"отметить время";
    $("b-out-s").textContent=e&&e.end?"в "+e.end:"отметить время";
    const yk=key(addDays(d,-1)),yOpen=!(e&&e.start)&&!!(days[yk]&&days[yk].start&&!days[yk].end);
    $("b-out").disabled=!(e&&e.start)&&!yOpen;if(yOpen)$("b-out-s").textContent="закрыть вчерашнюю смену";
    $("t-details").hidden=!(e&&e.start);
    if(e){
      if(!tDirty.has("t-work")&&document.activeElement!==$("t-work"))$("t-work").value=e.work||"";
      if(!tDirty.has("t-start"))$("t-start").value=e.start||"";if(!tDirty.has("t-end"))$("t-end").value=e.end||"";
      if(!tDirty.has("t-break"))setBreak($("t-break"),e.breakMin??60);
      if(!tDirty.has("t-extra")&&document.activeElement!==$("t-extra"))$("t-extra").value=e.extra||"";
      $("t-hours").textContent=e.end?"Итого "+fmt(mins(e)):"";
      renderThumbs($("t-photos"),e.photos||[],removeTodayPhoto);
    }
  }
  /* location passed from the ANK home-screen shortcut as #geo-<lat>-<lng>-<address words> */
  let geo=null;
  const mapUrl=g=>`https://maps.google.com/?q=${g.lat.toFixed(5)},${g.lng.toFixed(5)}`;
  function readGeo(){const m=/^#geo-(m?\d+)-(m?\d+)(?:-(.+))?$/.exec(location.hash||"");if(!m)return;
    const n=v=>(v[0]==="m"?-1:1)*Number(v.replace("m",""))/1e5;
    const addr=(m[3]||"").split("--").map(x=>x.split("-").filter(Boolean).join(" ")).filter(Boolean).join(", ");
    const lat=n(m[1]),lng=n(m[2]);if(!isFinite(lat)||!isFinite(lng))return;
    geo={lat,lng,addr:addr||`${lat.toFixed(5)}, ${lng.toFixed(5)}`};renderToday()}
  function renderGeo(e){const box=$("t-geo");
    if(e&&e.start&&e.geo){box.innerHTML=`Место прибытия отмечено по GPS · <a href="${mapUrl(e.geo)}" target="_blank" rel="noopener">на карте</a>`;return}
    if(geo){box.innerHTML=`Вы здесь: <b>${esc(geo.addr)}</b> · <a href="${mapUrl(geo)}" target="_blank" rel="noopener">на карте</a>`;return}
    if(document.documentElement.dataset.geo==="denied"){box.textContent="Геопозиция выключена для Табеля — разрешите её в настройках телефона или впишите объект вручную";return}
    box.textContent="Определяю, где вы…";}
  window.addEventListener("hashchange",readGeo);
  function lastPlace(){const ks=Object.keys(days).sort();for(let i=ks.length-1;i>=0;i--){if(days[ks[i]].place)return days[ks[i]].place}return ""}
  $("b-in").addEventListener("click",async()=>{
    const k=todayKey(),prev=days[k]||{};
    const e=todayDraft({date:k,start:nowHM(),end:prev.end||"",breakMin:prev.breakMin??60,place:$("t-place").value.trim(),work:prev.work||"",extra:prev.extra||"",photos:prev.photos||[],driveFolder:prev.driveFolder||null,geo:prev.geo||(geo?{lat:geo.lat,lng:geo.lng}:null)});
    if(prev.start){e.start=prev.start}
    if(await saveDay(e)){days[k]=e;tDirty.clear();renderToday();toast(prev.start?"Уже отмечено в "+prev.start:"Приезд отмечен")}
  });
  $("b-out").addEventListener("click",async()=>{
    const k=todayKey(),prev=days[k];
    if(!prev||!prev.start){
      /* после полуночи: вчерашняя смена не закрыта — закрываем её концом дня */
      const yk=key(addDays(new Date(),-1)),y=days[yk];
      if(y&&y.start&&!y.end){if(!confirm("Сегодняшней смены нет, а вчера («Приехал» в "+y.start+") не нажат «Уехал». Закрыть вчерашний день в 23:59?"))return;const ye={...y,end:"23:59"};if(await saveDay(ye)){days[yk]=ye;renderAll();toast("Вчерашняя смена закрыта в 23:59 — поправьте время в журнале, если нужно")}return}
      toast("Сначала нажмите «Приехал»");return}
    if(prev.end&&!confirm("Уход уже отмечен в "+prev.end+". Заменить на "+nowHM()+"?"))return;
    const e={...todayDraft(prev),end:nowHM(),place:$("t-place").value.trim()||prev.place};
    if(await saveDay(e)){days[k]=e;tDirty.clear();renderToday();toast("Отъезд отмечен. Допишите, что сделали");$("t-work").focus()}
  });
  $("t-save").addEventListener("click",async()=>{
    const k=todayKey(),prev=days[k]||{date:k};
    const e={...prev,date:k,place:$("t-place").value.trim(),work:$("t-work").value.trim(),start:$("t-start").value,end:$("t-end").value,breakMin:Number($("t-break").value),extra:$("t-extra").value.trim()};
    if(await saveDay(e)){days[k]=e;tDirty.clear();renderToday();toast("Сохранено")}
  });

  /* ---------- photos ---------- */
  let assetsNs;
  async function getAssets(){if(assetsNs===undefined){try{assetsNs=window.__ankc&&__ankc.use?await __ankc.use("assets"):null}catch(e){assetsNs=null}}return assetsNs}
  function compress(file,m=1600,qq=0.82){return new Promise(res=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{const s=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement("canvas");c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>res(b||file),"image/jpeg",qq)};img.onerror=()=>{URL.revokeObjectURL(url);res(file)};img.src=url})}
  async function uploadFiles(files){const a=await getAssets();if(!a){toast("Загрузка фото недоступна в этом окне");return[]}const out=[];for(let i=0;i<files.length;i++){toast(`Загружаю фото ${i+1} из ${files.length}…`);try{const blob=await compress(files[i]);const r=await a.upload(blob);out.push({id:r.id,url:r.url,blob})}catch(e){toast("Фото не загрузилось, попробуйте ещё раз")}}return out}
  async function dropAssets(ids){if(!ids||!ids.length)return;const a=await getAssets();if(!a)return;for(const id of ids){try{await a.delete(id)}catch(e){}}}
  function renderThumbs(box,photos,onRemove){box.innerHTML="";photos.forEach((p,i)=>{const d=document.createElement("div");d.className="ph";const a=document.createElement("a");a.href=p.url;a.addEventListener("click",ev=>{ev.preventDefault();openLb(photos,i)});const im=document.createElement("img");im.src=p.url;im.alt="Фото работы";im.loading="lazy";a.appendChild(im);const x=document.createElement("button");x.type="button";x.textContent="×";x.setAttribute("aria-label","Удалить фото");x.addEventListener("click",ev=>{ev.preventDefault();if(!x.dataset.arm){x.dataset.arm="1";x.textContent="Удалить?";return}onRemove(i)});d.append(a,x);box.appendChild(d)});box.hidden=!photos.length}
  let lbList=[],lbI=0;
  /* pinch / pan / double-tap zoom, done by hand so it works inside the app frame */
  const Z={s:1,x:0,y:0};
  function applyZ(){const im=$("lb-img");im.style.transform=`translate(${Z.x}px,${Z.y}px) scale(${Z.s})`;$("lb").classList.toggle("zoom",Z.s>1.01)}
  function baseBox(){const im=$("lb-img"),r=im.getBoundingClientRect();return {l:r.left-Z.x,t:r.top-Z.y,w:r.width/Z.s,h:r.height/Z.s}}
  function clampZ(){const b=baseBox(),vw=window.innerWidth,vh=window.innerHeight;if(Z.s<=1.01){Z.s=1;Z.x=0;Z.y=0;return}
    const W=b.w*Z.s,H=b.h*Z.s;
    const minX=W>vw?vw-b.l-W:(vw-W)/2-b.l, maxX=W>vw?-b.l:(vw-W)/2-b.l;
    const minY=H>vh?vh-b.t-H:(vh-H)/2-b.t, maxY=H>vh?-b.t:(vh-H)/2-b.t;
    Z.x=Math.min(maxX,Math.max(minX,Z.x));Z.y=Math.min(maxY,Math.max(minY,Z.y))}
  function zoomAt(px,py,s2){const b=baseBox();const lx=(px-b.l-Z.x)/Z.s,ly=(py-b.t-Z.y)/Z.s;Z.s=Math.min(5,Math.max(1,s2));Z.x=px-b.l-lx*Z.s;Z.y=py-b.t-ly*Z.s;clampZ();applyZ()}
  function resetZ(){Z.s=1;Z.x=0;Z.y=0;applyZ()}
  let g=null,lastTap=0,lastTouchTs=0;
  const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const mid=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
  function startGesture(ev){const t=ev.touches;if(t.length>=2){const m=mid(t[0],t[1]),b=baseBox();g={mode:"pinch",d0:dist(t[0],t[1]),s0:Z.s,lx:(m.x-b.l-Z.x)/Z.s,ly:(m.y-b.t-Z.y)/Z.s,moved:true}}else if(t.length===1){g={mode:Z.s>1.01?"pan":"swipe",x0:t[0].clientX,y0:t[0].clientY,tx:Z.x,ty:Z.y,moved:false}}}
  $("lb").addEventListener("touchstart",ev=>{if(ev.target.closest("button"))return;lastTouchTs=Date.now();startGesture(ev)},{passive:false});
  $("lb").addEventListener("touchmove",ev=>{if(!g)return;ev.preventDefault();const t=ev.touches;
    if(g.mode==="pinch"&&t.length>=2){const m=mid(t[0],t[1]),b=baseBox();Z.s=Math.min(5,Math.max(1,g.s0*dist(t[0],t[1])/g.d0));Z.x=m.x-b.l-g.lx*Z.s;Z.y=m.y-b.t-g.ly*Z.s;clampZ();applyZ();return}
    if(t.length!==1)return;const dx=t[0].clientX-g.x0,dy=t[0].clientY-g.y0;if(Math.abs(dx)+Math.abs(dy)>8)g.moved=true;
    if(g.mode==="pan"){Z.x=g.tx+dx;Z.y=g.ty+dy;clampZ();applyZ()}},{passive:false});
  $("lb").addEventListener("touchend",ev=>{if(!g)return;lastTouchTs=Date.now();
    if(ev.touches.length>0){startGesture(ev);return}
    const end=ev.changedTouches[0],gg=g;g=null;
    if(gg.mode==="pinch"){if(Z.s<1.05)resetZ();return}
    if(!gg.moved){const now=Date.now();if(now-lastTap<300){lastTap=0;if(Z.s>1.01)resetZ();else zoomAt(end.clientX,end.clientY,2.5)}else lastTap=now;return}
    if(gg.mode==="swipe"){const dx=end.clientX-gg.x0,dy=end.clientY-gg.y0;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))stepLb(dx<0?1:-1);else if(dy>90&&Math.abs(dy)>Math.abs(dx))closeLb()}});
  $("lb").addEventListener("touchcancel",()=>{g=null});
  $("lb").addEventListener("wheel",ev=>{ev.preventDefault();zoomAt(ev.clientX,ev.clientY,Z.s*(ev.deltaY<0?1.15:1/1.15))},{passive:false});
  function showLb(){const p=lbList[lbI];if(!p)return;resetZ();$("lb-img").src=p.url;$("lb-count").textContent=lbList.length>1?(lbI+1)+" / "+lbList.length+" · два пальца — увеличить":"Два пальца или двойное нажатие — увеличить";$("lb-prev").hidden=$("lb-next").hidden=lbList.length<2}
  function openLb(list,i){lbList=[...list];lbI=i;showLb();$("lb").hidden=false;$("lb-x").focus()}
  function closeLb(){$("lb").hidden=true;$("lb-img").removeAttribute("src")}
  function stepLb(d){if(lbList.length<2)return;lbI=(lbI+d+lbList.length)%lbList.length;showLb()}
  $("lb-x").addEventListener("click",closeLb);
  $("lb-prev").addEventListener("click",()=>stepLb(-1));
  $("lb-next").addEventListener("click",()=>stepLb(1));
  $("lb-img").addEventListener("click",ev=>{if(Date.now()-lastTouchTs<700)return;if(Z.s>1.01)resetZ();else zoomAt(ev.clientX,ev.clientY,2.5)});
  window.addEventListener("resize",()=>{if(!$("lb").hidden){clampZ();applyZ()}});
  document.addEventListener("keydown",ev=>{if($("lb").hidden)return;if(ev.key==="Escape")closeLb();if(ev.key==="ArrowLeft")stepLb(-1);if(ev.key==="ArrowRight")stepLb(1)});
  $("t-addph").addEventListener("click",()=>$("t-file").click());
  $("t-file").addEventListener("change",async ev=>{const files=[...ev.target.files];ev.target.value="";if(!files.length)return;const added=await uploadFiles(files);if(!added.length)return;const k=todayKey();const base=days[k]||{date:k,start:"",end:"",breakMin:60,place:$("t-place").value.trim(),work:$("t-work").value.trim(),extra:""};const e=todayDraft({...base,photos:[...(base.photos||[]),...added.map(({id,url})=>({id,url}))]});if(await saveDay(e)){days[k]=e;tDirty.clear();renderToday();toast(added.length>1?"Фото добавлены":"Фото добавлено");pushToDrive(k,added)}});
  async function removeTodayPhoto(i){const k=todayKey(),prev=days[k];if(!prev)return;const ph=[...(prev.photos||[])];const [gone]=ph.splice(i,1);const e=todayDraft({...prev,photos:ph});if(await saveDay(e)){days[k]=e;tDirty.clear();renderToday();if(gone){dropAssets([gone.id]);if(gone.driveId)trashDrive([gone.driveId])}}}
  let edPhotos=[],edRemoved=[],edRemovedDrive=[];const edPending=new Map();
  function renderEdPhotos(){renderThumbs($("ed-photos"),edPhotos,i=>{const [g]=edPhotos.splice(i,1);if(g){edRemoved.push(g.id);if(g.driveId)edRemovedDrive.push(g.driveId)}renderEdPhotos()})}
  $("ed-addph").addEventListener("click",()=>$("ed-file").click());
  $("ed-file").addEventListener("change",async ev=>{const files=[...ev.target.files];ev.target.value="";if(!files.length)return;const added=await uploadFiles(files);added.forEach(a=>edPending.set(a.id,a.blob));edPhotos.push(...added.map(({id,url})=>({id,url})));renderEdPhotos();if(added.length)toast("Фото добавлено, нажмите «Сохранить»")});

  /* ---------- Google Drive copies + QR (so anyone can see the photos) ---------- */
  const DRIVE_ROOT_DEFAULT="1592P_rApoZqOGIExf7-cIbkn1GlAHm88";
  let weeks={},mcpNs;
  async function getMcp(){if(mcpNs===undefined){try{mcpNs=window.__ankc&&__ankc.use?await __ankc.use("mcp"):null}catch(e){mcpNs=null}}return mcpNs}
  function driveErr(e){const c=e&&e.code;
    if(c==="server_not_connected")return "Google Drive не подключён. Подключите его в Claude: Настройки → Коннекторы.";
    if(c==="needs_reauth")return "Google Drive отключился. Переподключите его в Claude: Настройки → Коннекторы.";
    if(c==="approval_required"||c==="not_in_manifest")return "Табелю нужно разрешение на Google Drive. Нажмите «Фото недели → Google Drive» и разрешите.";
    if(c==="selection_required")return "Выберите аккаунт Google Drive в окне Claude.";
    if(c==="capability_disabled"||c==="not_granted")return "Google Drive недоступен в этом окне. Фото сохранены в Табеле.";
    return "Google Drive сейчас не ответил. Фото сохранены в Табеле, отправьте их позже кнопкой на вкладке «Отчёт».";}
  function weekTitle(mon){const w=weekData(mon);return `Неделя ${w.from}–${w.to} ${w.month} ${mon.getFullYear()}`}
  async function ensureWeekFolder(mon){const k=key(mon);if(weeks[k]&&weeks[k].folderId)return weeks[k];
    const m=await getMcp();if(!m)throw{code:"capability_disabled"};
    const r=await m.callTool("Google Drive","create_file",{title:weekTitle(mon),contentMimeType:"application/vnd.google-apps.folder",parentId:cfg.driveRoot||DRIVE_ROOT_DEFAULT});
    const p=(r&&r.payload)||{};if(!p.id)throw{code:"tool_error"};
    const w={folderId:p.id,url:p.viewUrl||("https://drive.google.com/drive/folders/"+p.id),title:weekTitle(mon)};
    weeks[k]=w;if(db){try{await db.doc("weeks/"+k).set(w)}catch(e){}}return w}
  async function trashDrive(ids){ids=(ids||[]).filter(id=>id&&id!=="sent");if(!ids.length)return;
    const m=await getMcp();if(!m)return;
    let ok=0,err=null;for(const id of ids){try{await m.callTool("Google Drive","trash_file",{fileId:id});ok++}catch(e){err=e}}
    if(ok&&!err)toast(ok>1?"Удалено и с Google Drive":"Фото удалено и с Google Drive");
    if(err)toast(err.code==="tool_error"?"Это фото на Google Drive уже удалено или не найдено":driveErr(err).replace("Фото сохранены в Табеле","Удалите его там вручную"))}
  async function ensureDayFolder(dateKey){const d=days[dateKey];if(d&&d.driveFolder&&d.driveFolder.id)return d.driveFolder;
    const m=await getMcp();if(!m)throw{code:"capability_disabled"};
    const w=await ensureWeekFolder(monday(parse(dateKey)));const dt=parse(dateKey);
    const day=days[dateKey]||{};const title=`${ddmm(dateKey)} ${WD[dt.getDay()]}${day.place?" — "+day.place:""}`.slice(0,120);
    const r=await m.callTool("Google Drive","create_file",{title,contentMimeType:"application/vnd.google-apps.folder",parentId:w.folderId});
    const p=(r&&r.payload)||{};if(!p.id)throw{code:"tool_error"};
    const f={id:p.id,url:p.viewUrl||("https://drive.google.com/drive/folders/"+p.id)};
    const cur=days[dateKey];if(cur){const e={...cur,driveFolder:f};if(await saveDay(e))days[dateKey]=e}
    return f}
  function blobToB64(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(",")[1]);fr.onerror=rej;fr.readAsDataURL(b)})}
  async function sendToDrive(blob,dateKey,n){const m=await getMcp();if(!m)throw{code:"capability_disabled"};
    const w={folderId:(await ensureDayFolder(dateKey)).id};
    blob=await compress(blob,1280,0.72);
    const isJpg=(blob.type||"image/jpeg")==="image/jpeg";
    const r=await m.callTool("Google Drive","create_file",{title:`${dateKey}_фото-${n}.${isJpg?"jpg":"png"}`,contentMimeType:isJpg?"image/jpeg":(blob.type||"image/png"),disableConversionToGoogleType:true,parentId:w.folderId,base64Content:await blobToB64(blob)});
    return (r&&r.payload&&r.payload.id)||"sent"}
  let driveBusy=false;
  async function pushToDrive(dateKey,items){if(!items.length||!(await getMcp()))return;
    let ok=0,err=null;
    for(const it of items){const day=days[dateKey];if(!day)break;const idx=(day.photos||[]).findIndex(p=>p.id===it.id);if(idx<0)continue;
      try{const did=await sendToDrive(it.blob,dateKey,idx+1);const d2=days[dateKey];const ph=(d2.photos||[]).map(p=>p.id===it.id?{...p,driveId:did}:p);const e={...d2,photos:ph};if(await saveDay(e)){days[dateKey]=e;ok++}}
      catch(e){err=e;break}}
    if(ok)toast(ok>1?`${ok} фото отправлены в Google Drive`:"Фото отправлено в Google Drive");
    if(err)toast(driveErr(err));
    renderAll()}
  async function syncWeek(mon){if(driveBusy)return;driveBusy=true;const btn=$("r-sync"),label=btn.textContent;btn.disabled=true;btn.textContent="Отправляю…";
    try{let any=false;
      for(let i=0;i<6;i++){const k=key(addDays(mon,i)),d=days[k];if(!d||!d.photos)continue;
        const missing=d.photos.filter(p=>!p.driveId);if(!d.photos.length)continue;any=true;
        if(!missing.length)continue;
        const items=[];for(const p of missing){try{const b=await (await fetch(p.url)).blob();items.push({id:p.id,blob:b})}catch(e){}}
        await pushToDrive(k,items)}
      if(!any){toast("За эту неделю фото нет");return}
      await ensureWeekFolder(mon);renderReport()}
    catch(e){toast(driveErr(e))}
    finally{driveBusy=false;btn.disabled=false;btn.textContent=label}}
  function qrImg(url){try{if(!window.qrcode)return "";const q=qrcode(0,"M");q.addData(url);q.make();return q.createDataURL(6,2)}catch(e){return ""}}
  function qrBlock(mon){const w=weeks[key(mon)];if(!w||!w.url)return "";const img=qrImg(w.url);
    return `<a class="qr" href="${esc(w.url)}" target="_blank" rel="noopener" data-href="${esc(w.url)}">${img?`<img src="${img}" alt="QR-код на фото работ">`:""}<div><b>Фото работ за неделю</b>Наведите камеру на QR-код или откройте ссылку:<br><span>${esc(w.url.replace(/^https:\/\//,""))}</span></div></a>`}
  function dayQr(e){const f=e.driveFolder,n=(e.photos||[]).length;if(!f||!f.url||!n)return "";const img=qrImg(f.url);
    return `<a class="dq" href="${esc(f.url)}" target="_blank" rel="noopener" data-href="${esc(f.url)}"><span>Фото дня<br>${n} шт.</span>${img?`<img src="${img}" alt="QR-код на фото дня">`:""}</a>`}
  function renderDriveLine(){const box=$("r-drive");if(!box)return;const w=weeks[key(repWeek)];
    let n=0,s=0;for(let i=0;i<6;i++){const d=days[key(addDays(repWeek,i))];if(d&&d.photos){n+=d.photos.length;s+=d.photos.filter(p=>p.driveId).length}}
    box.innerHTML=(n?`Фото за неделю: ${n}, в Google Drive: ${s}. `:"За эту неделю фото нет. ")+(w&&w.url?`Ссылка для всех: <a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.url.replace(/^https:\/\//,""))}</a>`:(n?"Нажмите «Фото недели → Google Drive», и в отчёте появится QR-код.":""));}

  /* ---------- log ---------- */
  let logMonth=new Date();logMonth.setDate(1);
  function monthEntries(y,m){return Object.values(days).filter(e=>{const d=parse(e.date);return d.getFullYear()===y&&d.getMonth()===m}).sort((a,b)=>a.date<b.date?-1:1)}
  function renderLog(){
    const y=logMonth.getFullYear(),m=logMonth.getMonth();
    $("l-month").textContent=MON[m]+" "+y;
    const list=monthEntries(y,m);
    $("s-days").textContent=list.length;
    $("s-hours").textContent=fmt(list.reduce((a,e)=>a+mins(e),0));
    $("s-places").textContent=new Set(list.map(e=>(e.place||"").trim()).filter(Boolean)).size;
    const box=$("l-list");
    const notes=list.filter(e=>(e.extra||"").trim());
    $("l-notes").innerHTML=notes.length?notes.map(e=>{const d=parse(e.date);return `<div class="note"><div><div class="d">${ddmm(e.date)}</div><div class="wd">${WDS[d.getDay()]}</div></div><div style="min-width:0"><div class="t no-i18n">${esc(e.extra)}</div>${e.place?`<div class="pl no-i18n">${esc(e.place)}</div>`:""}</div></div>`}).join(""):'<div class="empty">Заметок за этот месяц нет. Пишите их на вкладке «Сегодня» в поле «Заметка для себя».</div>';
    if(!list.length){box.innerHTML='<div class="empty">В этом месяце записей нет. Отметьте приезд на вкладке «Сегодня» или добавьте день вручную.</div>';return}
    box.innerHTML=list.map(e=>{const d=parse(e.date);return `<div class="day" data-k="${e.date}" tabindex="0" role="button">
      <div><div class="d">${ddmm(e.date)}</div><div class="wd">${WDS[d.getDay()]}</div></div>
      <div style="min-width:0"><div class="w"><span class="no-i18n">${esc(e.work)}</span>${e.work?"":'<span class="chip warn">нет описания работ</span>'}${e.photos&&e.photos.length?"":' <span class="chip warn">нет фото</span>'}</div><div class="p"><span class="no-i18n">${esc(e.place)}${e.extra?" · "+esc(e.extra):""}</span>${e.photos&&e.photos.length?" · "+e.photos.length+" фото":""}${e.geo?` · <a href="${mapUrl(e.geo)}" target="_blank" rel="noopener" data-map="1">карта</a>`:""}${e.driveFolder&&e.photos&&e.photos.length?` · <a href="${esc(e.driveFolder.url)}" target="_blank" rel="noopener" data-map="1">фото для всех</a>`:""}</div></div>
      <div><div class="h">${e.end?fmt(mins(e)):'<span class="chip warn">нет ухода</span>'}</div><div class="t">${e.start||"—"}–${e.end||"—"}</div></div></div>`}).join("");
    box.querySelectorAll(".day").forEach(el=>{const open=ev=>{if(ev&&ev.target&&ev.target.closest&&ev.target.closest("a[data-map]"))return;openEd(el.dataset.k)};el.addEventListener("click",open);el.addEventListener("keydown",ev=>{if(ev.key==="Enter")open()})});
  }
  $("l-prev").addEventListener("click",()=>{logMonth.setMonth(logMonth.getMonth()-1);renderLog()});
  $("l-next").addEventListener("click",()=>{logMonth.setMonth(logMonth.getMonth()+1);renderLog()});
  let edKey=null,delArm=false;
  function openEd(k){
    edKey=k;delArm=false;$("ed-confirm").hidden=true;
    const e=k?days[k]:{date:todayKey(),start:"08:00",end:"17:30",breakMin:60,place:lastPlace(),work:"",extra:""};
    $("ed-title").textContent=k?"Редактировать "+ddmm(k):"Новый день";
    $("ed-date").value=e.date;$("ed-start").value=e.start||"";$("ed-end").value=e.end||"";setBreak($("ed-break"),e.breakMin??60);
    $("ed-place").value=e.place||"";$("ed-work").value=e.work||"";$("ed-extra").value=e.extra||"";
    edPhotos=[...(e.photos||[])];edRemoved=[];edRemovedDrive=[];renderEdPhotos();$("ed-del").hidden=!k;$("ed").hidden=false;$("ed").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("l-add").addEventListener("click",()=>openEd(null));
  $("ed-cancel").addEventListener("click",()=>{$("ed").hidden=true;const fresh=edPhotos.filter(p=>edPending.has(p.id)).map(p=>p.id);edPending.clear();if(fresh.length)dropAssets(fresh);edPhotos=[];edRemoved=[];edRemovedDrive=[]});
  $("ed-save").addEventListener("click",async()=>{
    const e={date:$("ed-date").value,start:$("ed-start").value,end:$("ed-end").value,breakMin:Number($("ed-break").value),place:$("ed-place").value.trim(),work:$("ed-work").value.trim(),extra:$("ed-extra").value.trim(),photos:edPhotos,driveFolder:(edKey&&days[edKey]&&days[edKey].driveFolder)||null,geo:(edKey&&days[edKey]&&days[edKey].geo)||null};
    if(!e.date){toast("Укажите дату");return}
    if(e.date!==edKey&&days[e.date]){toast("На "+ddmm(e.date)+" уже есть запись — откройте её в журнале");return}
    if(edKey&&edKey!==e.date){await delDay(edKey);delete days[edKey]}
    if(await saveDay(e)){days[e.date]=e;$("ed").hidden=true;renderAll();toast("Сохранено");dropAssets(edRemoved);edRemoved=[];trashDrive(edRemovedDrive);edRemovedDrive=[];const pend=e.photos.filter(p=>edPending.has(p.id)).map(p=>({id:p.id,blob:edPending.get(p.id)}));edPending.clear();if(pend.length)pushToDrive(e.date,pend)}
  });
  $("ed-del").addEventListener("click",async()=>{
    if(!delArm){delArm=true;$("ed-confirm").hidden=false;return}
    const gd=days[edKey]||{};const goneIds=(gd.photos||[]).map(p=>p.id);const goneDrive=gd.driveFolder&&gd.driveFolder.id?[gd.driveFolder.id]:(gd.photos||[]).map(p=>p.driveId);await delDay(edKey);delete days[edKey];dropAssets(goneIds);trashDrive(goneDrive);$("ed").hidden=true;renderAll();toast("День удалён");
  });

  /* ---------- report ---------- */
  let repWeek=monday(new Date());
  function weekData(mon){
    const rows=[];for(let i=0;i<6;i++){const d=addDays(mon,i);rows.push({d,e:days[key(d)]})}
    const sun=days[key(addDays(mon,6))];if(sun)rows.push({d:addDays(mon,6),e:sun});
    const last=sun?6:rows[5].e?5:4;
    const total=rows.reduce((a,r)=>a+(r.e?mins(r.e):0),0);
    const m1=MON[mon.getMonth()],m2=MON[addDays(mon,last).getMonth()];
    return {rows,from:mon.getDate(),to:addDays(mon,last).getDate(),month:m1===m2?m1:m1+"–"+m2,total};
  }
  function sheetHTML(mon){
    const w=weekData(mon);
    const trs=w.rows.map((r,i)=>{const e=r.e;return `<tr><td class="wd"><span>${WD_FORM[i]}</span></td>
      <td>${e?ddmm(e.date):""}</td><td>${e?esc(e.start):""}</td><td>${e?esc(e.end):""}</td>
      <td>${e&&e.breakMin?fmt(Number(e.breakMin)):""}</td><td>${e&&e.end?fmt(mins(e)):""}</td>
      <td>${e?esc(e.place):""}</td><td>${e?`<div class="wk"><span>${esc(e.work)}</span>${dayQr(e)}</div>`:""}</td></tr>`}).join("");
    return `<div class="top"><div>ИМЯ И ФАМИЛИЯ <span class="fill" style="min-width:180px">${esc(cfg.name)}</span></div>
      <div>ОТЧЕТ ЗА НЕДЕЛЮ с <span class="fill">${w.from}</span> по <span class="fill">${w.to}</span> Месяц <span class="fill" style="min-width:110px">${w.month}</span></div><img class="ak" src="${LOGO}" alt="ANK"></div>
      <table><colgroup><col style="width:26px"><col style="width:9%"><col style="width:9%"><col style="width:10%"><col style="width:8%"><col style="width:8%"><col style="width:18%"><col></colgroup>
      <thead><tr><th></th><th>Дата</th><th>Время начала</th><th>Время окончания</th><th>Перерыв</th><th>Итого часов</th><th>Место</th><th>Реализованные работы</th></tr></thead>
      <tbody>${trs}</tbody></table>
      <div class="foot"><div class="tot">ИТОГО ЧАСОВ <span class="fill" style="min-width:140px">${w.total?fmt(w.total):""}</span></div></div>`;
  }
  function renderReport(){
    const w=weekData(repWeek);
    $("r-week").textContent=`${w.from}–${w.to} ${w.month}`;
    $("sheet").innerHTML=sheetHTML(repWeek);
    renderDriveLine();
    if(document.activeElement!==$("c-name"))$("c-name").value=cfg.name;
  }
  $("r-sync").addEventListener("click",()=>syncWeek(repWeek));
  $("r-prev").addEventListener("click",()=>{repWeek=addDays(repWeek,-7);renderReport()});
  $("r-next").addEventListener("click",()=>{repWeek=addDays(repWeek,7);renderReport()});
  $("r-copy").addEventListener("click",()=>{
    const w=weekData(repWeek);
    const lines=[`${cfg.name} — отчёт за неделю с ${w.from} по ${w.to} (${w.month})`];
    w.rows.forEach((r,i)=>{if(r.e){const e=r.e;lines.push(`${WD_FORM[i].toLowerCase()} ${ddmm(e.date)}: ${e.start}–${e.end}, перерыв ${fmt(Number(e.breakMin)||0)}, итого ${fmt(mins(e))} · ${e.place} · ${e.work}`)}});
    lines.push(`Итого часов: ${fmt(w.total)}`);copy(lines.join("\n"));
  });
  async function makePdf(mondays,filename,btn){
    const sheets=mondays.filter(mon=>weekData(mon).rows.some(r=>r.e)).map(mon=>sheetHTML(mon));
    if(!sheets.length){toast("За этот период записей нет");return}
    if(!window.jspdf||!window.html2canvas){toast("Не загрузились инструменты PDF. Проверьте интернет и откройте страницу заново");return}
    const label=btn.textContent;btn.disabled=true;btn.textContent="Готовлю PDF…";
    const host=document.createElement("div");host.style.cssText="position:fixed;left:-12000px;top:0;width:1123px";document.body.appendChild(host);
    try{
      try{await document.fonts.ready}catch(e){}
      const pdf=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
      for(let i=0;i<sheets.length;i++){
        host.innerHTML=`<div class="sheet pdf" style="width:1123px;min-width:0;border-radius:0;padding:30px 34px;background:#fff">${sheets[i]}</div>`;
        const sh=host.firstChild,br=sh.getBoundingClientRect();
        const links=[...sh.querySelectorAll("[data-href]")].map(el=>{const r=el.getBoundingClientRect();return {x:r.left-br.left,y:r.top-br.top,w:r.width,h:r.height,url:el.dataset.href}});
        const c=await window.html2canvas(sh,{scale:2,backgroundColor:"#ffffff",logging:false});
        const maxW=277,maxH=190;let w=maxW,h=w*c.height/c.width;if(h>maxH){h=maxH;w=h*c.width/c.height}
        if(i)pdf.addPage();
        const x0=(297-w)/2;pdf.addImage(c.toDataURL("image/jpeg",0.92),"JPEG",x0,10,w,h);
        const k=w/br.width;links.forEach(l=>{try{pdf.link(x0+l.x*k,10+l.y*k,l.w*k,l.h*k,{url:l.url})}catch(e){}});
      }
      const blob=pdf.output("blob");
      const dl=await __ankc.use("downloads");if(!dl){toast("Скачивание недоступно в этом окне");return}
      await dl.save({filename,data:blob});
    }catch(e){if(!(e&&e.code==="declined"))toast("Не удалось сделать PDF")}
    finally{host.remove();btn.disabled=false;btn.textContent=label}
  }
  $("r-dl").addEventListener("click",()=>{
    const ref=repWeek, y=addDays(ref,2).getFullYear(), m=addDays(ref,2).getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const mons=[];for(let mon=monday(first);mon<=last;mon=addDays(mon,7))mons.push(mon);
    makePdf(mons,`Отчеты_ANK_${MON[m]}_${y}.pdf`,$("r-dl"));
  });
  $("r-dlw").addEventListener("click",()=>{
    const w=weekData(repWeek);
    makePdf([repWeek],`Отчет_ANK_${w.from}-${w.to}_${w.month}.pdf`,$("r-dlw"));
  });
  $("c-save").addEventListener("click",async()=>{
    cfg={...cfg,name:$("c-name").value.trim()};
    if(!db){toast("Журнал недоступен");return}
    try{await db.doc("config/main").set(cfg);toast("Настройки сохранены");renderReport()}catch(e){toast("Не сохранилось")}
  });

  function renderPlaces(){const ps=[...new Set(Object.values(days).map(e=>(e.place||"").trim()).filter(Boolean))];$("places").innerHTML=ps.map(p=>`<option value="${esc(p)}">`).join("")}
  function renderAll(){renderPlaces();renderToday();renderLog();renderRoute();if(!$("p-report").hidden)renderReport()}

  $("t-place").addEventListener("input",()=>{$("t-place").dataset.touched="1"});
  readGeo();
  renderAll();
  setInterval(()=>{if(!$("p-today").hidden&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA")renderToday()},60000);

  /* ---------- connect ---------- */
  (async()=>{
    const c=window.__ankc;
    if(!c||!c.use){setStatus("Откройте эту страницу в Claude, чтобы журнал сохранялся.");return}
    db=await c.use("db");
    if(!db){setStatus("Журнал недоступен в этом окне. Откройте страницу в Claude, войдя в свой аккаунт.");return}
    let gotDays=false,startTabChosen=false;
    const timer=setTimeout(()=>{if(!gotDays)setStatus("Нет связи с журналом. Проверьте интернет, данные подтянутся сами.")},10000);
    db.collection("days").onSnapshot(snap=>{
      days={};snap.docs.forEach(d=>{const v=d.data();if(v&&v.date)days[v.date]=v});
      if(!snap.metadata.fromCache){gotDays=true;clearTimeout(timer);setStatus("")}
      renderAll();
      if(!snap.metadata.fromCache&&!startTabChosen){startTabChosen=true;const t=days[todayKey()];if(!(t&&t.start)&&!geo)selectTab("route")}
    },err=>{clearTimeout(timer);setStatus("Журнал недоступен: "+(err.code==="revoked"?"доступ закрыт.":"ошибка связи. Обновите страницу позже."))});
    db.collection("weeks").onSnapshot(sn=>{const w={};sn.docs.forEach(d=>{const v=d.data();if(v)w[d.id]=v});weeks=w;if(!$("p-report").hidden)renderReport()},()=>{});
    db.doc("config/main").onSnapshot(s=>{if(s.exists){cfg={...DEF_CFG,...s.data()};$("who").textContent=(cfg.name?cfg.name+" · ":"")+"Ingeniería y reformas ANK";if(!$("p-report").hidden)renderReport()}},()=>{});
  })();
})();
