const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
// menu + header
const ov=$('#ov'),hd=$('#hd');
$('#mo').onclick=()=>{ov.classList.add('o');ov.setAttribute('aria-hidden','false')};
$('#mc').onclick=()=>{ov.classList.remove('o');ov.setAttribute('aria-hidden','true')};
$$('#ov nav a').forEach(a=>a.onclick=()=>ov.classList.remove('o'));
addEventListener('keydown',e=>{if(e.key==='Escape')ov.classList.remove('o')});
const sc=()=>hd.classList.toggle('sc',scrollY>40);sc();addEventListener('scroll',sc,{passive:true});
// reveal
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('v')),{threshold:.05});$$('.rv').forEach(x=>io.observe(x));
// hero slideshow
const hs=$$('.hs img');if(hs.length>1){let i=0;setInterval(()=>{hs[i].classList.remove('on');i=(i+1)%hs.length;hs[i].classList.add('on')},5500)}
// filters
const gr=$('#grid');if(gr){const f={g:'',c:''},q=new URLSearchParams(location.search).get('g');if(q)f.g=q;
const run=()=>{$$('.mc',gr).forEach(c=>c.hidden=(f.g&&c.dataset.g!==f.g)||(f.c&&c.dataset.c!==f.c));$$('.flt button').forEach(b=>b.classList.toggle('on',b.dataset.v===f[b.dataset.f]))};
$$('.flt button').forEach(b=>b.onclick=()=>{f[b.dataset.f]=b.dataset.v===f[b.dataset.f]?'':b.dataset.v;run()});run()}
// shortlist (saved in the visitor's own browser)
const SK='nb_shortlist',gl=()=>{try{return JSON.parse(localStorage.getItem(SK))||[]}catch(e){return[]}},sl=a=>{try{localStorage.setItem(SK,JSON.stringify(a))}catch(e){}};
const root=(document.currentScript&&document.currentScript.src||'').replace(/main\.js.*$/,'');
const paint=()=>{const a=gl(),k=$('[data-slc]');if(k){k.hidden=!a.length;$('b',k).textContent=a.length}
$$('[data-s]').forEach(b=>{const on=a.some(x=>x.s===b.dataset.s);b.classList.toggle('on',on);if(b.dataset.t)b.textContent=on?'In shortlist':'Add to shortlist';else b.textContent=on?'✓':'+'});
const box=$('#shortlist');if(box)box.innerHTML=a.length?'<p class="eb">Your shortlist</p><p>'+a.map(x=>'<strong>'+x.n.replace(/</g,'&lt;')+'</strong>').join(', ')+'</p>':'<p>Add models with the + button on the board and they will be included in your enquiry.</p>'};
document.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;e.preventDefault();let a=gl();const i=a.findIndex(x=>x.s===b.dataset.s);i>-1?a.splice(i,1):a.push({s:b.dataset.s,n:b.dataset.n,u:b.dataset.u});sl(a);paint()});paint();
// lightbox (photos with the same data-lbg belong to one carousel)
{const lb=document.createElement('div');lb.className='lb';lb.innerHTML='<button class="c"></button><button class="x">Close</button><button class="p">Prev</button><button class="n">Next</button><img alt="">';document.body.appendChild(lb);let L=[],i=0,sx=0;
const show=n=>{i=(n+L.length)%L.length;$('img',lb).src=L[i].href;const c=L[i].dataset.cap||'';$('.c',lb).textContent=(c?c+'  ':'')+(L.length>1?(i+1)+' / '+L.length:'');$('.p',lb).hidden=$('.n',lb).hidden=L.length<2},cl=()=>lb.classList.remove('o');
document.addEventListener('click',e=>{const a=e.target.closest('a[data-lbg]');if(!a)return;e.preventDefault();L=$$('a[data-lbg="'+a.dataset.lbg+'"]');i=L.indexOf(a);show(i);lb.classList.add('o')});
$('.x',lb).onclick=cl;$('.p',lb).onclick=()=>show(i-1);$('.n',lb).onclick=()=>show(i+1);lb.onclick=e=>{if(e.target===lb)cl()};
lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(L.length>1&&Math.abs(d)>40)show(i+(d<0?1:-1))});
addEventListener('keydown',e=>{if(!lb.classList.contains('o'))return;if(e.key==='Escape')cl();if(e.key==='ArrowRight'&&L.length>1)show(i+1);if(e.key==='ArrowLeft'&&L.length>1)show(i-1)})}
// model page tabs
$$('.tb button').forEach(b=>b.onclick=()=>{$$('.tb button').forEach(x=>x.classList.toggle('on',x===b));$$('.pn').forEach(p=>p.hidden=p.dataset.pane!==b.dataset.tab)});
// email forms: open the visitor's email app, pre-filled
$$('form[data-mail]').forEach(f=>f.onsubmit=e=>{e.preventDefault();const L=$$('[name]',f).map(x=>(x.dataset.l||x.name)+': '+x.value.trim());
if(f.dataset.sl){const a=gl();if(a.length)L.push('Shortlist: '+a.map(x=>x.n+' ('+new URL('../'+x.u,location.href).href+')').join(', '))}
if(f.dataset.note)L.push('','Reminder before sending: '+f.dataset.note);
location.href='mailto:'+f.dataset.mail+'?subject='+encodeURIComponent(f.dataset.subject+' - '+($('[name=name]',f)||{value:''}).value)+'&body='+encodeURIComponent(L.join('\n'))});
