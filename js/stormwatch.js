'use strict';
var Stormwatch = (()=>{
const stormwatchMarkup = `<style>
:host {
 display:block;position:fixed;inset:0;z-index:1000;overflow:hidden;
 pointer-events:none;color:#f5f0e8;--ink:#f5f0e8;--soft:#c3b9ae;--accent:#f1be84;
 --panel:#1b1718d9;--line:#f5dab14d;
 --display:"Barlow Condensed","Arial Narrow",Impact,sans-serif;
 font:600 14px/1.4 Inter,system-ui,sans-serif;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
canvas{display:block}
button{font:750 .85rem system-ui;cursor:pointer;border:1px solid var(--line);border-radius:3px;padding:10px 15px;background:#282225;color:var(--ink)}
button:hover,button:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px}
button.primary{background:var(--accent);color:#2a1c17;border-color:var(--accent)}
h1,h2,p{margin:0}
kbd{font:750 .76rem system-ui;padding:.13em .4em;background:#40332c;border-radius:2px}
#hud{position:absolute;inset:0;pointer-events:none;user-select:none}
#field-sound-captions{position:absolute;left:50%;bottom:clamp(116px,21vh,172px);transform:translateX(-50%);display:grid;justify-items:center;gap:4px;width:max-content;max-width:64vw;text-align:center}
#field-sound-captions>div{padding:4px 10px;border:1px solid #ead8c676;background:#171416e8;color:#fff;font:650 13px/1.35 system-ui;border-radius:3px}
[data-pad-focus]{outline:2px solid var(--accent);outline-offset:2px}
#field-audio-settings{display:grid;gap:8px;margin-top:14px;max-width:360px}
#field-audio-settings label{display:grid;grid-template-columns:minmax(0,1fr) 5ch;gap:4px 8px;align-items:center;font:650 13px/1.35 system-ui}
#field-audio-settings label span{grid-column:1/-1}#field-audio-settings input{width:100%;accent-color:var(--accent)}
#field-audio-settings output{text-align:right;font-variant-numeric:tabular-nums}
#field-audio-settings .audio-checkbox span{grid-column:1}#field-audio-settings .audio-checkbox input{justify-self:end;width:18px;height:18px}
#field-audio-settings input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
#operation-rewards{margin-top:12px;padding:9px 12px;border-left:3px solid #9bdbc7;background:#203432;color:#d4f3e7;font:650 13px/1.5 system-ui}
#mission[data-assault=arming] #status{color:#ffe2b4;border-color:#fec78e;background:#613a31;animation:assault-signal .8s ease-in-out alternate infinite}
#mission[data-assault=active] #status{border-color:#db92d9;background:#47284f}
@keyframes assault-signal{to{box-shadow:0 0 18px #ffa36ca8}}
@media(prefers-reduced-motion:reduce){#mission[data-assault=arming] #status{animation:none}}
#vitals{position:absolute;top:22px;left:22px;width:clamp(128px,16vw,225px);display:grid;gap:5px}
.vital{position:relative;height:22px;border:1px solid #ffead295;border-left:3px solid var(--meter);background:#1a1719b9;overflow:hidden}
.vital label{position:absolute;inset:0;display:flex;gap:5px;align-items:center;padding:0 7px;font:800 14px/1 var(--display);text-shadow:0 1px 3px #0f0b0a}
.vital label i{font-style:normal;width:12px;text-align:center}
#shield{--meter:#55bde9}
#health{--meter:#95c96b}
#pulse-vital{--meter:#e9b367}
meter{display:block;width:100%;height:6px;-webkit-appearance:none;appearance:none;border:0;background:none}
meter::-webkit-meter-bar{background:#1b171900;border:0;border-radius:0;height:100%}
meter::-webkit-meter-optimum-value{background:linear-gradient(90deg,var(--meter,#edb877),color-mix(in srgb,var(--meter,#edb877) 45%,#2d2531));border-radius:0}
meter::-moz-meter-bar{background:var(--meter,#edb877)}
.vital meter{height:100%;opacity:.91}
#stash{display:flex;padding:6px 0 0;gap:4px;border-top:1px solid var(--line);margin-top:4px}
#stash span{width:33%;display:grid;justify-items:center;gap:1px;background:#271d1ca8;padding:4px 5px;font:750 17px/.9 var(--display);font-variant-numeric:tabular-nums}
#stash svg{width:25px;height:20px}
#objective{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:min(290px,36vw)}
.objective-line{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 10px;padding:5px 8px;background:#211b1bd2;border:1px solid var(--line)}
.objective-line b{font:750 14px/1 var(--display);text-transform:uppercase;letter-spacing:.075em}
.objective-line small{font:750 13px/1 var(--display);font-variant-numeric:tabular-nums}
.objective-line meter{grid-column:1/-1;background:#ffffff26}
#boss{margin-top:4px;--meter:#f19483}
#mission{position:absolute;top:22px;right:22px;width:clamp(117px,12vw,162px);text-align:right;display:grid;justify-items:stretch;gap:4px}
#radar{justify-self:end;width:min(100%,126px);height:auto;border:1px solid #ffdfb688;border-radius:50%;background:radial-gradient(circle,#362320c7,#171721d8);box-shadow:0 3px 14px #170f1455}
#status{margin-top:3px;background:#211b1bba;border-right:2px solid var(--accent);padding:3px 7px;font:750 17px/1.15 var(--display);text-transform:uppercase;letter-spacing:.06em}
#remaining,#task,#passStatus{font-size:11px;color:#fff3dd;text-shadow:0 1px 3px #1e1513}
#passStatus{color:var(--accent)}
#kit{position:absolute;right:22px;bottom:20px;display:grid;justify-items:end;gap:7px}
#held{font:750 15px/1 var(--display);text-transform:uppercase;letter-spacing:.04em;text-shadow:0 1px 4px #17101b}
#hotbar,#build-strip{display:flex;justify-content:flex-end;gap:4px}
#hotbar{padding-top:5px;border-top:1px solid #ffeece90}
.slot{--slot:#90806a;position:relative;display:grid;place-items:center;width:clamp(44px,5vw,70px);height:clamp(43px,4.7vw,63px);
 padding:4px 3px 10px;background:linear-gradient(153deg,#fff6d419,#1c161bab),var(--slot);border:1px solid #eedab1ae;box-shadow:inset 0 0 0 2px #0f0b1363}
.slot[data-selected="true"],#build-strip .selected{outline:2px solid #fff2d5;outline-offset:1px}
.slot img,.slot svg{width:100%;height:100%;max-height:39px;object-fit:contain;filter:drop-shadow(1px 2px 2px #060503aa)}
.slot img{position:absolute;inset:3px;width:calc(100% - 6px)}.slot img:not([hidden])+svg{opacity:.22}
.slot kbd{position:absolute;bottom:1px;font-size:.58rem;padding:0 3px;background:#161216ad}
#build-strip .slot{background:#1b2a3fda;border-color:#92b2d697;height:44px}
#ammo{float:right;margin-left:10px;color:var(--accent)}
#prompt,#toast,#threat{position:absolute;left:50%;transform:translateX(-50%);width:max-content;max-width:84%;text-align:center}
#prompt{bottom:104px;padding:4px 9px;background:#211b1bcd;border-bottom:1px solid var(--accent);font-size:.77rem}
#toast{bottom:144px;font:750 17px/1.2 var(--display);letter-spacing:.04em;text-shadow:0 2px 4px #241416;color:#ffdbab}
#squad-status{color:#c8ffef;font-size:.73rem;text-shadow:0 2px 3px #081d24;overflow-wrap:anywhere}
#squad-status:empty{display:none}
#seat-label{justify-self:start;padding:1px 6px;border-left:2px solid #81e8ec;background:#172b35eb;color:#e2faff;font:750 11px/1.4 system-ui}
:host([data-local="2"]) #seat-label{border-color:#ffc385;background:#382a24eb;color:#ffe6cc}
#threat{left:22px;bottom:20px;transform:none;color:#ffdcad;text-shadow:0 2px 3px #251719;font-size:.72rem}
#cross{position:absolute;top:50%;left:50%;width:24px;height:17px;transform:translate(-50%,-50%);color:#fff8db;filter:drop-shadow(0 1px 2px #1d1826);border:1px solid currentColor;border-block-color:transparent;border-radius:44%}
#cross{width:calc(24px + var(--bloom,0px));transition:width .07s ease-out}
#cross[data-hit="yes"]::before{content:"";position:absolute;inset:-9px;border:2px solid #ffdd96;clip-path:polygon(0 0,24% 0,50% 39%,76% 0,100% 0,61% 50%,100% 100%,76% 100%,50% 61%,24% 100%,0 100%,39% 50%)}
#cross::after{content:"";position:absolute;inset:0;margin:auto;width:3px;height:3px;border-radius:50%;background:currentColor}
#cross[data-hit="yes"]{color:#ffbb7d;width:16px}
#cross[data-build="yes"]{color:#9adbff}
#harvest{position:absolute;left:50%;top:calc(50% + 25px);transform:translateX(-50%);width:112px;text-align:center;
 background:#282027c9;color:#fff1d8;padding:3px 5px;border-left:2px solid #e2b568;font:750 13px/1.1 var(--display)}
#harvest meter{margin-top:4px;background:#463939;height:4px;--meter:#f0bc73}
#damage{position:absolute;inset:0;box-shadow:inset 0 0 95px 15px #f75654b0;opacity:0}
#screen{position:absolute;inset:0;pointer-events:auto;display:grid;align-items:center;padding:clamp(15px,6vw,93px);overflow:auto;background:linear-gradient(90deg,#1e1616f5,#1b1518c4 34%,transparent 77%)}
#sheet{width:min(515px,100%);padding:24px 0}
#screen:not([data-mode="brief"]){justify-items:center;background:#191417bb}
#screen:not([data-mode="brief"]) #sheet{width:min(455px,100%);padding:24px;background:var(--panel);border-top:2px solid var(--accent)}
.eyebrow{font:800 .69rem Inter,system-ui;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
#screen h1{font:800 clamp(3.2rem,8vw,6.5rem)/.87 var(--display);letter-spacing:.01em;text-transform:uppercase;margin:9px 0 14px}
#screen:not([data-mode="brief"]) h1{font-size:clamp(2.4rem,6vw,3.6rem)}
#summary{color:#e1cebd;font-size:.97rem}
#guide{margin-top:15px;border-top:1px solid var(--line);padding-top:12px;display:grid;gap:6px;color:#eee0d1;font-size:.76rem}
#guide p{line-height:1.55}
#guide b{color:var(--accent)}
#buttons{display:flex;flex-wrap:wrap;gap:7px;margin-top:17px}
#profile{margin-top:14px}
#screen[data-mode="citadel"] #sheet{width:min(850px,100%);max-height:90vh;overflow:auto;border-color:#74c3bc}
#screen[data-mode="citadel"] #sheet>h1{margin-bottom:8px}
#citadel-root{margin-top:9px}
#region-picker{font:700 .83rem system-ui;background:#252326;color:#f6ede1;border:1px solid var(--line);padding:6px}
.citadel-rating{display:flex;gap:8px 16px;align-items:center;flex-wrap:wrap;padding:8px 11px;background:#274240;border-left:3px solid #a3dfcb}
.citadel-rating strong{font:800 22px/1 var(--display);color:#d2f3de}
.citadel-tabs{display:flex;gap:4px;margin:8px 0}
.citadel-tabs button[aria-selected="true"]{background:#35625a;border-color:#83c8b9}
.citadel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:7px}
.citadel-select{display:grid;gap:3px;color:#c7dfd3;font-size:.68rem}
#citadel-root select{width:100%;min-height:32px;color:#ebf6ec;background:#263635;border:1px solid #729b90;padding:4px}
#citadel-root select:focus-visible{outline:2px solid #e7ba84}
.citadel-grid fieldset{margin:0;border:1px solid #536c69;padding:7px;min-width:0}
.citadel-grid legend{padding:0 3px;font:750 14px var(--display)}
.citadel-stock{display:flex;flex-wrap:wrap;gap:3px 10px;color:#e0c5a0;margin-top:9px;font-size:.70rem}
.citadel-blueprints{display:grid;gap:6px}
.citadel-blueprints article{--rarity:#bfbec5;padding:9px;border-left:2px solid var(--rarity);background:#232d2d}
.citadel-blueprints article[data-rarity="1"]{--rarity:#83c779}.citadel-blueprints article[data-rarity="2"]{--rarity:#78baef}
.citadel-blueprints article[data-rarity="3"]{--rarity:#bf9ceb}.citadel-blueprints article[data-rarity="4"]{--rarity:#f2b178}
.citadel-blueprints article[data-rarity="5"]{--rarity:#f2db7d}
.citadel-blueprints h3{margin:0;color:var(--rarity);font:800 22px var(--display)}
.citadel-blueprints small{display:inline-block;margin:5px;color:#dcc7b2}
.citadel-blueprints button{margin:4px 0;padding:6px;font-size:.72rem}
#citadel-root button:disabled{opacity:.52;cursor:default}
#edit{position:absolute;right:22px;top:30%;width:min(260px,48vw);padding:13px;pointer-events:auto;
 background:#182526f2;border:1px solid #89ced1a6;border-top:2px solid #82d7d8;box-shadow:0 14px 32px #0c171489}
#edit h2{font:800 23px/1 var(--display);text-transform:uppercase;letter-spacing:.05em}
#edit-grid{display:grid;grid-template-columns:repeat(var(--count),minmax(0,1fr));gap:4px;margin:9px 0}
#edit-grid button{padding:0;aspect-ratio:1;border:1px solid #73ada9d1;background:#294344}
#edit-grid button[aria-pressed="true"]{background:linear-gradient(145deg,#82c5bb,#31696d);border-color:#a7dedc}
#edit-grid button:focus-visible{outline-color:#f6c493;z-index:1}
#edit-status{color:#e8c99f;min-height:1.3em;font-size:.74rem}
#edit-actions{display:flex;gap:4px;margin-top:6px}
#edit-actions button{padding:6px;font-size:.73rem}
#trap-picker{width:min(100%,340px);padding:7px 9px;color:#e1f4f0;border:1px solid #79b8b4aa;background:#213033;font:700 .83rem system-ui}
#trap-recipe{color:#bbd0cb;font-size:.75rem}
@media(max-width:680px){#edit{right:8px;top:29%;width:min(176px,46vw)}}
#screen[data-mode="pack"] #sheet{width:min(570px,100%);border-color:#79b8b4}
#pack{display:grid;gap:9px;border-top:1px solid #79b8b472;padding-top:12px;margin-top:13px}
.pack-item{display:grid;grid-template-columns:1fr auto;gap:6px;padding:7px 9px;background:#33434566;border-left:2px solid #79b8b472}
.pack-item b{color:#dbefea;font-weight:700}
.pack-item small{color:#bcceca}
.pack-rows{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#pack-stock{color:#dbc39b;font:750 16px var(--display)}
@media(max-width:520px){.pack-rows{grid-template-columns:1fr}}
.idr-plate{position:relative;overflow:hidden;display:flex;gap:9px;align-items:center;width:min(320px,100%);height:48px;padding:4px 10px;background:var(--idr-shade);color:var(--idr-ink)}
.idr-card-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.idr-badge,.idr-plate-text{position:relative}
.idr-badge{width:34px;height:34px}
.idr-plate-text{display:grid;color:#fff2e7;text-shadow:0 1px 3px #000}
.idr-plate-text small{font-size:.64rem}
@media(max-width:680px){
 #vitals,#mission{top:9px}#vitals,#threat{left:8px}#mission,#kit{right:8px}
 #objective{top:9px;width:29vw}#kit{bottom:11px}
 #mission{width:92px}#radar{width:70px}#status{font-size:14px}
 #vitals{width:115px}.vital{height:18px}.vital label{font-size:12px}
 #prompt{bottom:121px}#toast{bottom:151px}
 #screen h1{font-size:3.6rem}
}

/* Deployment and field readouts share the Citadel's alloy and amber palette. */
:host{--accent:#f5c285;--panel:#142022f2;--line:#91b9b455}
#screen[data-mode="brief"]{
 grid-template-columns:minmax(250px,.83fr) minmax(360px,1.05fr);column-gap:clamp(20px,6vw,110px);
 align-content:center;align-items:center;padding:clamp(23px,5.3vw,100px);
 background:linear-gradient(95deg,#0f191bdc,#0d171980 52%,#10181bbe),linear-gradient(0deg,#10191cee,transparent 40%);
}
#screen[data-mode="brief"] #sheet{width:100%;padding:23px 0;border-block-start:2px solid #f5c285;border-block-end:1px solid #c1dcce42}
#screen[data-mode="brief"][data-hub]{grid-template-columns:minmax(0,560px) 1fr}
#screen[data-mode="brief"] h1{font-size:clamp(3rem,6.05vw,7.4rem);margin:15px 0;line-height:.82}
#operation-title{font:780 clamp(23px,3.3vw,35px)/1 var(--display);color:#cae7db;margin:28px 0 5px;letter-spacing:.022em}
#screen[data-mode="brief"] #summary{max-width:40ch;color:#d8e4db;font-size:clamp(.86rem,1.3vw,1.02rem);line-height:1.52}
#screen[data-mode="brief"] #buttons{margin-top:20px}
#screen[data-mode="brief"] #deploy{min-width:128px;box-shadow:0 4px 0 #956847;color:#1c2220}
#screen[data-mode="brief"] #deploy:disabled{opacity:.56}
#board{
 width:100%;max-width:660px;justify-self:end;border:1px solid #93aea274;border-top:3px solid #9fd1c2;
 padding:clamp(10px,1.9vw,23px);background:#132324eb;box-shadow:0 26px 60px #0a161ba6;
}
.board-head{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:10px}
.board-head .citadel-select{min-width:min(57%,200px);font:720 .73rem Inter,system-ui}
#board #region-picker{width:100%;background:#223433;border:1px solid #93aea274;color:#eeefe2;margin-top:2px}
#board-power{white-space:nowrap;color:#e6cfab;font:800 18px/1 var(--display)}
.board-map{position:relative;border:1px solid #76ad9f55;background:#182d31;overflow:hidden}
#sector-map{display:block;width:100%;height:clamp(135px,23vh,238px);object-fit:cover}
#map-sector{position:absolute;left:8px;bottom:7px;padding:3px 7px;background:#122223cc;color:#cee6d8;font:750 13px var(--display);letter-spacing:.10em;text-transform:uppercase}
#mission-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}
.op-option{position:relative;min-height:65px;display:grid;grid-template-columns:31px 1fr;gap:8px;align-items:center;text-align:left;color:#d9e3d9;
 background:#243333;border:1px solid #65857e65;padding:7px;line-height:1.1}
.op-option svg{width:27px;height:27px;color:#86bdb6}
.op-option span{display:grid;gap:4px}
.op-option b{font:770 clamp(13px,1.8vw,20px)/.95 var(--display);letter-spacing:.01em}
.op-option small{font:650 .68rem Inter,system-ui;color:#b3cbc3}
.op-option[aria-pressed="true"]{background:linear-gradient(120deg,#3b6256,#253a35);border-color:#b4d8b8;box-shadow:inset 3px 0 #efc38d}
.op-option[aria-pressed="true"] svg{color:#f2cb9f}
#alert-toggle{display:flex;justify-content:space-between;gap:7px;align-items:center;width:100%;margin-top:8px;padding:7px 9px;text-align:left;background:#3b3026;border-color:#bf8f58a0;color:#f2d7a9}
#alert-toggle[aria-pressed="true"]{background:#684d30;box-shadow:inset 2px 0 #efc58e}
#alert-toggle small{font-size:.65rem;color:#e4ba82}
#alert-detail{font-size:.70rem;color:#edc99e;padding:5px 2px 0;min-height:14px}
.operation-card{display:grid;gap:6px;background:#23383a;border:1px solid #699e9655;border-left:3px solid #94c2ac;padding:10px}
.operation-card h3{margin:0;font:800 20px var(--display);color:#d2eddf}
.operation-card p,.operation-card small{font-size:.72rem;color:#c4d5cc}
.operation-card progress{accent-color:#8fceb2;width:100%}
.operation-card button{justify-self:start;padding:5px 8px}
#fabricator{display:grid;gap:7px;margin-top:3px;padding-top:7px;border-top:1px solid #79b8b472}
#fabricator select{width:min(100%,340px);padding:7px 9px;color:#e1f4f0;border:1px solid #79b8b4aa;background:#213033}
#fabricator small{font-size:.73rem;color:#b7d0c6}
#vitals{gap:5px}
.vital{height:24px;border-radius:3px;background:#16262bd9;border-color:#d7e5dc8a}
.vital label{font-size:15px;text-shadow:0 1px 2px #040b10,0 0 5px #091418}
meter::-webkit-meter-optimum-value{background:linear-gradient(180deg,color-mix(in srgb,var(--meter,#edb877) 74%,white),var(--meter,#edb877) 64%,color-mix(in srgb,var(--meter,#edb877) 74%,#283f40) 67%)}
.slot{background:linear-gradient(150deg,#c1d4c438,#101d24dc),#3b5a63;border-color:#aac1baaa;border-radius:3px}
.slot[data-selected="true"]{border-color:#fff4cc;box-shadow:inset 0 -3px #e3b47a,inset 0 0 0 2px #0f0b1363}
.objective-line,#status{background:#17262bdd;border-color:#c1e1cc66;border-radius:3px}
#mission{gap:4px}
@media(max-width:800px){
 #screen[data-mode="brief"]{grid-template-columns:1fr;align-content:start;gap:14px;padding:16px}
 #screen[data-mode="brief"] #sheet{padding:12px 0}
 #screen[data-mode="brief"] h1{font-size:clamp(2.1rem,7vw,4.9rem);margin:9px 0}
 #operation-title{font-size:1.3rem;margin:12px 0 4px}
 #screen[data-mode="brief"] #buttons{margin-top:9px}
 #board{justify-self:start}
 .op-option{min-height:47px}
 #sector-map{height:118px}
 .vital{height:20px}.vital label{font-size:12px}
}
@media(max-height:540px){
 #screen,#screen[data-mode="brief"]{align-content:start;align-items:start;padding:10px}
 #screen:not([data-mode="brief"]) #sheet,#screen[data-mode="brief"] #sheet{padding:10px 13px}
 #screen:not([data-mode="brief"]) h1,#screen[data-mode="brief"] h1{font-size:2rem;margin:4px 0 8px}
 #screen #buttons{margin-top:8px;gap:5px}#screen button{padding:5px 9px;min-height:30px}
 #screen[data-mode="citadel"] #sheet{max-height:none;overflow:visible}
 #vitals,#objective,#mission{top:7px}
 #vitals{left:8px;width:min(145px,24vw);gap:3px}
 .vital{height:17px}.vital label{font-size:11px;white-space:nowrap;overflow:hidden}
 #stash{padding-top:3px;margin-top:1px;gap:2px}#stash span{display:flex;align-items:center;justify-content:center;padding:2px;font-size:12px}
 #stash svg{width:14px;height:13px}
 #objective{width:min(240px,38vw)}.objective-line{padding:3px 5px;gap:2px 5px}
 #mission{right:8px;width:min(155px,25vw);gap:2px}
 #radar{width:clamp(42px,16vh,72px);height:auto}
 #status{font-size:13px;margin:0;padding:2px 5px}#remaining,#task,#passStatus{font-size:10px;line-height:1.2}
 #squad-status{font-size:10px}
 #kit{right:8px;bottom:8px;gap:3px}#held{font-size:12px}
 #hotbar{padding-top:3px}#hotbar .slot,#build-strip .slot{width:clamp(26px,7vw,38px);height:31px}
 #prompt{bottom:51px;max-width:65%;font-size:11px}#toast{bottom:76px;max-width:66%;font-size:13px}
 #threat{left:8px;bottom:8px;max-width:27%;font-size:10px}
 #field-sound-captions{bottom:98px}
 #edit{top:42%;right:8px;max-width:26vw}
}
</style>
<div id="hud" hidden>
 <div id="field-sound-captions" aria-live="polite" aria-label="Sound captions" hidden></div>
 <section id="vitals" aria-label="Vitals and materials">
  <div id="seat-label" hidden></div>
  <div class="vital" id="shield"><meter id="shield-meter" aria-label="Shield" min="0" max="60" value="60"></meter><label for="shield-meter"><i>◇</i><span id="shield-text"></span></label></div>
  <div class="vital" id="health"><meter id="health-meter" aria-label="Health" min="0" max="100" value="100"></meter><label for="health-meter"><i>✚</i><span id="health-text"></span></label></div>
  <div class="vital" id="pulse-vital"><meter id="pulse-meter" aria-label="Shock pulse charge" min="0" max="24" value="24"></meter><label for="pulse-meter"><i>ϟ</i><span id="pulse-text"></span></label></div>
  <div id="stash">
   <span aria-label="Wood"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#a66c46" d="m3 13 19-9 7 3 1 6-20 9-7-3Z"/><path fill="#d9a275" d="m3 13 19-9 7 3-19 9Z"/><path fill="#ecd1a0" d="m3 13 7 3v6l-7-3Z"/><path fill="#9a603c" d="m5 16 3 1v2l-3-1Z"/></svg><b id="wood"></b></span>
   <span aria-label="Stone"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#9a98b0" d="m2 19 4-11 12-5 10 6 2 11-12 4Z"/><path fill="#d5cde0" d="m6 8 12-5 10 6-10 7Z"/><path fill="#6c6781" d="m18 16 10-7 2 11-12 4Z"/></svg><b id="stone"></b></span>
   <span aria-label="Metal"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#81bed1" d="M4 4h24l-4 5h-5v8h8v5H4v-5h8V9H4Z"/><path fill="#518196" d="m19 9 5-1v7h6l-3 7v-5h-8Z"/><path fill="#c7e4e3" d="M4 4h24l-4 4H4Z"/></svg><b id="metal"></b></span>
  </div>
  <div id="squad-status"></div>
 </section>
 <section id="objective" aria-label="Objective">
  <div class="objective-line"><b id="atlas-name">Signal Relay</b><small id="atlas-text"></small><meter id="atlas-meter" aria-label="Signal Relay integrity" min="0" max="900" value="900"></meter></div>
  <div class="objective-line" id="boss" hidden><b id="boss-name">Stormbreaker</b><small id="boss-text"></small><meter id="boss-meter" aria-label="Stormbreaker health" min="0" max="760" value="760"></meter></div>
 </section>
 <section id="mission" aria-label="Mission">
  <canvas id="radar" width="156" height="156" aria-label="Tactical radar"></canvas>
  <div id="status"></div><div id="remaining"></div><div id="task"></div><div id="passStatus"></div>
 </section>
 <div id="toast" role="status" hidden></div>
 <div id="cross"></div><div id="damage"></div>
 <div id="harvest" hidden><span id="harvest-name"></span>
  <meter id="harvest-meter" aria-label="Resource durability" min="0" value="0"></meter>
 </div>
 <section id="kit" aria-label="Equipment hotbar">
  <div id="build-strip" hidden></div>
  <div id="held"><span id="held-name"></span><span id="ammo"></span></div>
  <div id="hotbar"></div>
 </section>
 <div id="prompt" hidden></div><div id="threat"></div>
 <section id="edit" aria-label="Edit structure" hidden>
  <h2 id="edit-name"></h2>
  <div id="edit-grid"></div><div id="edit-status" role="status"></div>
  <div id="edit-actions"><button id="edit-apply" class="primary">Apply</button><button id="edit-reset">Reset</button><button id="edit-cancel">Cancel</button></div>
 </section>
</div>
<section id="screen" data-mode="brief" aria-labelledby="title">
 <div id="sheet">
  <div id="kicker" class="eyebrow">Relay Ridge · Solo PvE</div>
  <h1 id="title">Stormwatch</h1>
  <h2 id="operation-title"></h2>
  <p id="summary">Restore power to the relay and defend it through five assaults.</p>
  <p id="operation-rewards" aria-live="polite" hidden></p>
  <div id="profile" hidden></div>
  <div id="citadel-root" hidden></div>
  <div id="pack" hidden>
   <div id="pack-stock"></div>
   <div id="pack-weapons" class="pack-rows"></div>
   <div class="pack-rows">
    <div class="pack-item"><b>Ammo</b><small>6 Stone · 4 Metal</small></div>
    <div class="pack-item"><b>Traps</b><small id="trap-recipe"></small></div>
   </div>
   <select id="trap-picker" aria-label="Trap recipe"></select>
   <div id="fabricator" hidden>
    <select id="fabrication-picker" aria-label="Weapon to fabricate"></select>
    <small id="fabrication-cost"></small>
   </div>
  </div>
  <div id="buttons">
   <button id="deploy" class="primary" data-action="deploy" disabled>Deploy</button>
   <button id="retry" class="primary" data-action="retry" hidden>Run again</button>
   <button id="pass" data-action="pass" hidden>Battle Pass</button>
   <button id="citadel" data-action="citadel" disabled>Citadel</button>
   <button id="citadel-back" data-action="citadelBack" hidden>Back</button>
   <button id="help" data-action="help" aria-expanded="false">Controls</button>
   <button id="field-audio" data-action="audio" aria-controls="field-audio-settings" aria-expanded="false" hidden>Audio</button>
   <button id="craft" data-action="craft" hidden>Craft ammo · 6 Stone + 4 Metal</button>
   <button id="drop-stock" data-action="drop-stock" hidden>Drop building supplies</button>
   <button id="field-crate" data-action="field-crate" hidden>Craft and drop weapon</button>
   <button id="fabricate" data-action="fabricate" hidden>Fabricate weapon</button>
   <button id="traps" data-action="traps" hidden>Select trap</button>
   <button id="exit" data-action="exit">Mode select</button>
  </div>
  <div id="guide" hidden>
   <p id="controls-fight"></p><p id="controls-build"></p><p id="controls-mission"></p>
  </div>
  <div id="field-audio-settings" hidden>${PlayerAudio.controls(true)}</div>
 </div>
 <section id="board" aria-label="Deployment board">
  <div class="board-head">
   <label class="citadel-select"><span>Region</span><select id="region-picker" aria-label="Stormwatch region"></select></label>
   <div id="board-power"></div>
  </div>
  <div class="board-map">
   <canvas id="sector-map" width="700" height="245" aria-label="Procedural terrain preview"></canvas>
   <span id="map-sector"></span>
  </div>
  <div id="mission-cards" role="group" aria-label="Stormwatch mission"></div>
  <button id="alert-toggle" type="button" aria-pressed="false">
   <span id="alert-name"></span><small id="alert-mode"></small>
  </button>
  <p id="alert-detail"></p>
 </section>
</section>
`;
return {mount(options={}){
const host = document.createElement('article');
host.id = 'stormwatch-mode';
if(options.local)host.dataset.local=String(window.SD_SPLIT.seat);
const surface = host.attachShadow({mode:'open'});
surface.innerHTML = stormwatchMarkup;
document.body.append(host);
const ui = Object.fromEntries([...surface.querySelectorAll('[id]')].map(el => [el.id, el]));
if(options.local){ui['seat-label'].textContent='Player '+window.SD_SPLIT.seat;ui['seat-label'].hidden=false}
const fieldCaptions=PlayerAudio.captions(ui['field-sound-captions']);
const unbindFieldAudio=PlayerAudio.bind(ui['field-audio-settings']);
const embedded = !!options.renderer;
const coop=options.squad;
let coopReady=false,remoteSeat=null,savingResult=false;
const controller = new AbortController();
let padFocus=null;
function listen(target,name,handler,settings={}){
 target.addEventListener(name,handler,{...settings,signal:controller.signal});
}
listen(surface,'focusin',event=>{
 padFocus?.removeAttribute('data-pad-focus');padFocus=event.target;
 if(options.local&&event.target!==canvas)padFocus.setAttribute('data-pad-focus','');
});
function fieldFocus(){
 return surface.activeElement||(options.local&&padFocus?.getClientRects().length&&!padFocus.disabled?padFocus:null);
}
function exit(){
 if(savingResult)return;
 if(options.leave)options.leave('exit');
 else location.assign('index.html');
}
ui.exit.textContent = options.hub?'Command Map':embedded?'Mode select':'Spartan Drill';
ui.exit.onclick = exit;
if (!window.THREE) {
 ui.summary.textContent = 'Three.js could not load. Check your connection and reload.';
 return {close:()=>host.remove()};
}

const regions={
 timbervale:{name:'Timbervale',site:'Relay Ridge',floor:1,ceiling:19,woodland:.83,trees:33,relief:1,ground:[.3,.14],sky:[.84,.51,.40,.21,.23,.39],
  haze:0x685066,key:0xffd2a3,mountain:[0x53607b,0x62647f,0x555673,0x6e6885]},
 ironridge:{name:'Ironridge',site:'Foundry Pass',floor:19,ceiling:46,woodland:.55,trees:35,relief:1.15,ground:[.19,.105],sky:[.58,.55,.46,.13,.22,.28],
  haze:0x404b55,key:0xe3c4a3,mountain:[0x4b5a62,0x5b6668,0x69665d,0x5c5053]},
 canyonlands:{name:'Canyonlands',site:'Copper Wash',floor:46,ceiling:70,woodland:.14,trees:35,relief:1.34,ground:[.098,.063],sky:[.94,.60,.35,.26,.23,.36],
  haze:0x905f51,key:0xffc48a,mountain:[0x795455,0x90604e,0x74646b,0x916c57]},
 obsidian:{name:'Obsidian Peaks',site:'Frostline Relay',floor:70,ceiling:140,woodland:.22,trees:31,relief:1.52,ground:[.53,.61],sky:[.40,.51,.67,.11,.12,.27],
  haze:0x455579,key:0xaabde6,mountain:[0x4d5683,0x5f6485,0x555565,0x78879b]}
};
const query=new URLSearchParams(location.search);
const chosenRegion=options.region||(!embedded?query.get('region'):null);
const regionId=Object.hasOwn(regions,chosenRegion)?chosenRegion:'timbervale';
const region=regions[regionId];
const initialMission=options.mission||(!embedded?query.get('mission'):null);
const T = THREE;
let physics=null;
const vec = (x=0,y=0,z=0) => new T.Vector3(x,y,z);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const lerp = (a,b,t) => a+(b-a)*t;
const TAU = Math.PI*2;
const outpostSeed=(0x7325481+Object.keys(regions).indexOf(regionId)*2654435761)>>>0;
const mapSeed=(!initialMission||initialMission==='defense')?outpostSeed:(options.seed??window.crypto.getRandomValues(new Uint32Array(1))[0]);
const objectiveSeed=options.seed??window.crypto.getRandomValues(new Uint32Array(1))[0];
const objectiveSites=[[0,19],[0,-24],[22,-1],[-25,-1],[0,31],[-32,-1]];
const [ox,oz]=objectiveSites[(!initialMission||initialMission==='defense')&&Number.isInteger(options.relaySite)&&objectiveSites[options.relaySite]?options.relaySite:objectiveSeed%objectiveSites.length];
const objectiveDistance=(x,z)=>Math.hypot(x-ox,z-oz);
const districts={
 timbervale:['Pine suburbs','Orchard farms','Ancient forest','River grasslands','Timber market'],
 ironridge:['Foundry terraces','Rail city','Mill allotments','Coalwood forest','Slag meadows'],
 canyonlands:['Adobe suburbs','Mesa trading city','Irrigated farms','Juniper forest','Dry steppe'],
 obsidian:['Alpine village','Summit observatory','Frost farms','Black pine forest','Tundra grasslands']
};
const zoneKind=mapSeed%5,zoneName=districts[regionId][zoneKind];
let seed=mapSeed;
const slopeX=(mapSeed%1024)/287;
const slopeZ=((mapSeed>>>13)%1024)/211;
function rand(){
 seed = (Math.imul(seed,1664525)+1013904223)>>>0;
 return seed/4294967296;
}
const pick = items => items[Math.floor(rand()*items.length)];
const engineering = StormwatchEngineering;
const operations = StormwatchOperations;
const GRID = engineering.CELL, LEVEL = GRID, BOUND = 80, ATLAS_HP = 900, MAX_WAVES = 5;
const ASSAULT_WARNING=4, SEAL_DURATION=240, SEAL_SLICE=SEAL_DURATION/5;
const NEST_DURATION=420, PAYLOAD_PREP=40, PAYLOAD_DURATION=145, PAYLOAD_HP=760;
const nestCrews=[
 ['husk','husk','runner','runner','husk'],
 ['husk','runner','spitter','husk','husk','runner'],
 ['husk','brute','runner','spitter','husk','phantasm','runner'],
 ['runner','demolisher','beam','runner','husk','brute','spitter','husk'],
 ['juggernaut','runner','husk','brute','beam','phantasm','runner','spitter','husk']
];
const materials = [
 {id:'wood',name:'Timber',hp:190,buildTime:.52,color:0xbd875a,frame:0x79472d},
 {id:'stone',name:'Masonry',hp:320,buildTime:.93,color:0xaaa1bd,frame:0x5e5870},
 {id:'metal',name:'Alloy',hp:480,buildTime:1.42,color:0x519ab2,frame:0x263c55}
];
const pieces = engineering.ARCHETYPES;
const portals = [[0,-44-Math.floor(rand()*3)],[-43-Math.floor(rand()*3),-1],
 [43+Math.floor(rand()*3),-1],[0,43+Math.floor(rand()*3)]];
const waves = [
 {name:'Scavengers',lanes:[0],units:['husk','husk','runner','husk','husk','runner','husk','husk','runner']},
 {name:'Cover Breakers',lanes:[1,0],units:['runner','husk','husk','runner','spitter','husk','runner','husk','demolisher','runner','husk','husk']},
 {name:'Crossfire',lanes:[2,1,0],units:['husk','runner','spitter','brute','demolisher','runner','mortar','husk','phantasm','husk','husk','spitter','husk','brute']},
 {name:'Siege Crew',lanes:[3,2,1],units:['runner','beam','runner','brute','husk','catapult','husk','runner','mortar','brute','spitter','phantasm','husk','demolisher','runner','juggernaut']},
 {name:'Stormbreaker',lanes:[0,3,2,1],units:['boss','runner','husk','beam','runner','demolisher','brute','mortar','husk','phantasm','husk','spitter','juggernaut','catapult','husk','brute','runner','mortar','husk']}
];
const assaultLanes=waves.map(wave=>operations.assaultFronts(mapSeed,wave.lanes));
const frontNames=['North','West','East','South'];
const noFronts=[];
let assaultQueue=[],assaultGroup=0,assaultUnit=0;
const husks = {
 husk:{hp:80,speed:2.1,hit:18,scale:1.05,skin:0x9e99a6,suit:0x542e61,eye:0xffb364},
 runner:{hp:55,speed:3.7,hit:13,scale:.88,skin:0xb5a9c2,suit:0x822f62,eye:0xff8589},
 spitter:{hp:105,speed:1.8,hit:19,scale:1.18,skin:0x7fb9a3,suit:0x304a61,eye:0xaaffb9},
 brute:{hp:280,speed:1.55,hit:48,scale:1.53,skin:0x9379a4,suit:0x514263,eye:0xff9877},
 boss:{hp:760,speed:1.34,hit:64,scale:2.0,skin:0x827aa3,suit:0x442f58,eye:0xffc66f},
 mortar:{hp:168,speed:1.4,hit:49,scale:1.07,skin:0x8a879d,suit:0x683f6a,eye:0xff8562},
 demolisher:{hp:148,speed:1.92,hit:68,scale:1.28,skin:0x8d9c98,suit:0x72534d,eye:0xffbd62},
 beam:{hp:129,speed:1.63,hit:26,scale:1.42,skin:0xa5a3cb,suit:0x3d5b62,eye:0x74e1e4},
 phantasm:{hp:95,speed:3.14,hit:26,scale:1.00,skin:0xa499cc,suit:0x504467,eye:0xcda2ff},
 catapult:{hp:230,speed:1.34,hit:39,scale:1.52,skin:0xa5999f,suit:0x60525b,eye:0xf3bd77},
 juggernaut:{hp:411,speed:1.74,hit:51,scale:1.74,skin:0x998477,suit:0x4d4556,eye:0xff8e69}
};
const hollowNames={husk:'Shambler',runner:'Runner',spitter:'Hurler',brute:'Brute',boss:'Stormbreaker',
 mortar:'Mortar',demolisher:'Demolisher',beam:'Beam-Eye',phantasm:'Phantasm',catapult:'Catapult',juggernaut:'Juggernaut'};
const elementColors={Kinetic:0xffd4a0,Aether:0xbfa0ff,Scorch:0xff9058,Frost:0x83d9ec,Volt:0x8ce8a2};
const config = {sensitivity:1,quality:'med',pad:'auto',vibration:true,...options.config};
const scene = new T.Scene();
scene.background = new T.Color(0x596083);
scene.fog = new T.FogExp2(region.haze,.0098);
const camera = new T.PerspectiveCamera(64,1,.06,180);
camera.rotation.order = 'YXZ';
let render;
try {
 render = options.renderer || new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
} catch (error) {
 ui.summary.textContent = 'WebGL could not start. Enable hardware acceleration or try a browser with WebGL support.';
 return {close:()=>host.remove()};
}
const oldRenderer = {pixelRatio:render.getPixelRatio(),
 encoding:render.outputEncoding,tone:render.toneMapping,exposure:render.toneMappingExposure,
 shadows:render.shadowMap.enabled,shadowType:render.shadowMap.type,style:render.domElement.getAttribute('style'),tabindex:render.domElement.getAttribute('tabindex')};
render.outputEncoding = T.sRGBEncoding;
render.toneMapping = T.ACESFilmicToneMapping;
render.toneMappingExposure = .92;
const canvas = render.domElement;
if(!embedded)document.body.prepend(canvas);
Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex:'999',touchAction:'none',outline:'none'});
canvas.tabIndex=-1;
const hemi = new T.HemisphereLight(0xacbaff,0x486556,.81);
scene.add(hemi);
const sun = new T.DirectionalLight(region.key,1.47);
sun.position.set(-37,52,21);
sun.castShadow = true;
Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:135});
sun.shadow.mapSize.set(1024,1024);
sun.shadow.normalBias = .05;
sun.shadow.bias = -.0003;
scene.add(sun);

function resize() {
 render.setPixelRatio(config.quality==='low'?1:Math.min(devicePixelRatio,config.quality==='high'?1.5:1.2));
 render.setSize(innerWidth,innerHeight);
 render.shadowMap.enabled = config.quality==='high';
 render.shadowMap.type = T.PCFSoftShadowMap;
 camera.aspect = innerWidth/Math.max(1,innerHeight);
 camera.updateProjectionMatrix();
}
listen(window,'resize',resize);
resize();

const box = new T.BoxGeometry(1,1,1);
const sphere = new T.IcosahedronGeometry(1,1);
const rock = new T.DodecahedronGeometry(1,0);
const cyl = new T.CylinderGeometry(1,1,1,12);
const hex = new T.CylinderGeometry(1,1,1,6);
const cone = new T.ConeGeometry(1,1,7);
const gem = new T.OctahedronGeometry(1);
const tire = new T.CylinderGeometry(1,1,1,12);
const palette = new Map();
function mat(color,glow=0,metalness=0) {
 const key = color+'/'+glow+'/'+metalness;
 if (!palette.has(key)) palette.set(key,new T.MeshStandardMaterial({
  color,emissive:glow,emissiveIntensity:glow?.78:0,metalness,roughness:.8,flatShading:true
 }));
 return palette.get(key);
}
function mesh(group,shape,material,x,y,z,w,h,d,cast=true) {
 const model = new T.Mesh(shape,material);
 model.position.set(x,y,z);model.scale.set(w,h,d);
 model.castShadow=cast;model.receiveShadow=true;
 group.add(model);
 return model;
}
function block(group,material,x,y,z,w,h,d,cast=true) {
 return mesh(group,box,material,x,y,z,w,h,d,cast);
}
function groupAt(parent,x=0,y=0,z=0) {
 const group = new T.Group();
 group.position.set(x,y,z);
 parent.add(group);
 return group;
}
function ring(group,material,radius,thickness,y=0,segments=32) {
 const item = mesh(group,new T.TorusGeometry(radius,thickness,6,segments),material,0,y,0,1,1,1,false);
 item.rotation.x = Math.PI/2;
 return item;
}
const steel=mat(0x28364d,0,0.4);
const trim=mat(0x7291aa,0,.3);
const accent=mat(0x65e9d9,0x35b2aa,.15);
const purple=mat(0xca87ff,0x9354f3,.1);
const orange=mat(0xe0a05b);
const dark=mat(0x192334);
const tires=mat(0x242331);
const glass=mat(0x355163,0,.3);
const portalFx=[];
const props=[];
const builds=new Map();
let supportedBuilds=engineering.supportIndex([]);
const collapsing=[];
const trapShots=[];
const trapRecipes=engineering.recipes;
const structureBatches=new Map();
let structureBatchDirty=true;
const enemies=[];
const bolts=[];
const loot=[];
const effects=[];
const fragments=[];
const fallen=[];
const solidProps=[];
const terrainPads=[];
const shelters=[];
const shotProps=[];
const cracked=new Set();let focusedProp=null;
let obstaclesDirty=true;
const keys=new Set();
const hero={pos:vec(-3,0,11),vy:0,ground:true,yaw:.18,pitch:-.14,hp:100,shield:60,hitAgo:20,reload:0,emote:0,
 maxhp:100,maxShield:60,heat:0,shout:0,rotary:0,tempGun:null,dash:0,extraJump:false,weapon:0,shot:0,swingTime:0,anim:0,bob:0,pulse:0,stacks:[40,30,20],cache:0,repairs:2,sprint:false,aim:false,move:0};
const state={mission:Object.hasOwn(operations.missions,initialMission)?initialMission:'defense',modifier:null,
 alertRequested:!!options.alert,started:0,flux:0,siege:0,nestsCleared:0,nest:null,stormRadius:49.7,phase:'scout',wave:0,prep:0,elapsed:0,waveTime:0,pending:0,takedowns:0,atlas:ATLAS_HP,spawnIn:0,
 building:false,piece:0,material:0,recipe:0,ability:0,edit:null,deployed:false,finished:false,paused:true,screen:'brief',toasted:0,damage:0,hit:0,
 xp:0,tier:options.tier??null,allClear:false,mouse:false,look:'keys',pointerHint:false};
const gear=options.gear;
let citadel=null,unmountCitadel=null;
let profile=StormwatchCitadel.blank(),squad=StormwatchCitadel.rating(profile);
let fieldBag=StormwatchCitadel.emptyBag();
const discoveries=new Map();
const fieldReportId=mapSeed+'-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),n=>n.toString(36)).join('-');
let reportNumber=0,fieldMetrics=operations.statline();
const fieldHollows=new Set(),fieldTraps=new Set();
function fileFieldReport(victory=false){
 if(!citadel||!state.deployed)return;
 if(victory)fieldMetrics.wins=1;
 if(!Object.values(fieldMetrics).some(Boolean)&&!fieldHollows.size&&!fieldTraps.size)return;
 const delta=fieldMetrics,hollows=[...fieldHollows],traps=[...fieldTraps];
 fieldMetrics=operations.statline();fieldHollows.clear();fieldTraps.clear();
 citadel.dispatch({type:'field-report',id:fieldReportId+'-'+(++reportNumber),started:state.started,
  mission:state.mission,modifier:state.modifier?.id,delta,hollows,traps}).then(saved=>{
  if(saved||controller.signal.aborted)return;
  for(const [key,n] of Object.entries(delta))fieldMetrics[key]+=n;
  for(const kind of hollows)fieldHollows.add(kind);for(const kind of traps)fieldTraps.add(kind);
  notice('Field report could not be saved');
 });
}
function collectPart(id,count){
 if(remoteSeat){remoteSeat.bag[id]=(remoteSeat.bag[id]||0)+count;sendGame('feedback',{part:[id,count]},remoteSeat.id);return}
 fieldBag[id]=(fieldBag[id]||0)+count;
}
function bankSalvage(victory,wave){
 fileFieldReport(victory);
 if(!citadel)return Promise.resolve(false);
 const bag=fieldBag,found=victory?[...discoveries.values()]:[];
 if(!victory&&!wave&&!Object.values(bag).some(Boolean))return Promise.resolve(true);
 fieldBag=StormwatchCitadel.emptyBag();if(victory)discoveries.clear();
 const action={type:wave?'debrief':'salvage',bag,discoveries:found,victory,mission:state.mission,
  region:regionId,completionId:fieldReportId,operative:squad.lead.id};
 if(!guest&&state.mission==='defense'&&wave&&mapSeed===outpostSeed){
  action.outpost={layoutVersion:2,seed:mapSeed,started:state.started,rows:packStructures(),cleared:props.flatMap((p,i)=>p.alive?[]:[i])};
 }
 return citadel.dispatch(action).then(saved=>saved||!victory?saved:citadel.dispatch(action)).then(saved=>{
  if(!saved&&!controller.signal.aborted){
   for(const [key,n] of Object.entries(bag))collectPart(key,n);
   for(const item of found)discoveries.set(item.id,item);
   notice('Citadel salvage could not be saved');
  }
  return saved;
 });
}
const fallbackGun={name:'Assault rifle',stats:{d:30,m:30,au:1,rl:1.5,r:.12,sp:.009,pel:1}};
function armWeapon(weapon,power,element,design=profile.blueprints[weapon.k]){
 const base=weapon.baseStats||weapon.stats,blueprint=StormwatchCitadel.tune(design);
 const research=StormwatchCitadel.fieldResearch(profile);
 const stats={...base,d:base.d*blueprint.boost*(1+(squad.vital.Impact-10)*.005)*(1+.03*research.ordnance),
  m:Math.round(base.m*blueprint.mag),rl:base.rl*blueprint.reload};
 return {...weapon,stats,baseStats:base,power:Math.max(power,Math.round(blueprint.power)),element:element||blueprint.element||'Kinetic',
  blueprint,mag:stats.m,reserve:Math.max(72,stats.m*5)+18*research.logistics};
}
const guns=(gear?.weapons.length?gear.weapons:[fallbackGun]).map(weapon=>armWeapon(weapon,12));
const currentGun=()=>hero.tempGun||guns[hero.weapon];
function restock(amount){
 if(remoteSeat){sendGame('feedback',{ammo:amount},remoteSeat.id);return}
 for(const [index,weapon] of guns.entries()){
  weapon.reserve=Math.min(360,weapon.reserve+Math.ceil(amount*(index===0?1:.56)));
 }
}
const stage = groupAt(scene);
const ray = new T.Raycaster();
const aimDirection = vec(), aimPoint = vec();
let aimed=null, blueprint=null;
const screenVector = new T.Vector2();
let audio=null;
const fieldSoundLabels={pulse:'Energy pulse',hurt:'Taking damage',pickup:'Pickup chime'};
function sound(kind,caption=fieldSoundLabels[kind]) {
 if(remoteSeat)return;
 if(caption&&!state.paused)fieldCaptions.show(caption);
 if (!audio || audio.state!=='running')return;
 const [low,high,duration,volume,type] = {
  rifle:[125,38,.07,.105,'sawtooth'],hit:[565,285,.064,.044,'triangle'],swing:[280,102,.11,.041,'triangle'],
  build:[165,320,.14,.08,'triangle'],chip:[230,150,.075,.045,'square'],wave:[150,330,.42,.1,'triangle'],
  pulse:[225,36,.35,.105,'sine'],hurt:[210,64,.14,.075,'triangle'],pickup:[460,875,.15,.055,'sine'],
  empty:[138,95,.045,.03,'square'],step:[85,48,.058,.013,'triangle'],land:[112,51,.13,.06,'triangle']
 }[kind];
 const oscillator = audio.createOscillator(), gain=audio.createGain(), now=audio.currentTime;
 oscillator.type=type;
 oscillator.frequency.setValueAtTime(low,now);
 oscillator.frequency.exponentialRampToValueAtTime(high,now+duration);
 gain.gain.setValueAtTime(volume,now);
 gain.gain.exponentialRampToValueAtTime(.001,now+duration);
 oscillator.connect(gain).connect(PlayerAudio.output(audio,'effects',true));
 oscillator.start();
 oscillator.stop(now+duration);
}
function unlockAudio(){
 const Audio = window.AudioContext || window.webkitAudioContext;
 if(!audio&&Audio){
  audio=new Audio();
  const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const wind=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  wind.buffer=buffer;wind.loop=true;filter.type='lowpass';filter.frequency.value=158;
  gain.gain.value=.006;wind.connect(filter).connect(gain).connect(PlayerAudio.output(audio,'ambience',true));wind.start();
  ambient={wind,filter,gain};
 }
 audio?.resume().catch(()=>{});
}

function stormDistance(x,z){return state.mission==='nests'?Math.hypot(x,z):objectiveDistance(x,z)}
function terrainHeight(x,z){
 const roadClearance=Math.min(Math.abs(x)-4.3,Math.abs(z+1)-3.1);
 if(roadClearance<=0)return 0;
 const blend=clamp(roadClearance*.21,0,1);
 const center=clamp((Math.hypot(x,z)-13)/19,0,1);
 const roll=.6+.51*Math.sin(x*.21+slopeX)*Math.cos(z*.18+slopeZ)+.43*Math.sin((x+z)*.13+slopeZ);
 let height=Math.max(0,roll)*blend*(.24+1.72*center*region.relief);
 for(const pad of terrainPads){
  const edge=Math.max(Math.abs(x-pad.x),Math.abs(z-pad.z));
  if(edge<9)height=lerp(pad.y,height,clamp((edge-4.5)/4.5,0,1));
 }
 return height;
}
function terrainTexture(street){
 const image=document.createElement('canvas');image.width=image.height=128;
 const ctx=image.getContext('2d');
 ctx.fillStyle=street?'#bab29e':'#cfc2ad';ctx.fillRect(0,0,128,128);
 for(let i=0;i<480;i++){
  ctx.fillStyle=i%3===0?'#57554a28':i%3===1?'#f6eed841':'#7a836a50';
  const x=rand()*128,y=rand()*128;
  ctx.fillRect(x,y,.5+rand()*4,.75+rand()*2);
 }
 if(street)for(let i=0;i<39;i++){
  ctx.strokeStyle=i%2===0?'#3e373a5c':'#faf0d646';ctx.lineWidth=.5+rand()*.8;
  const x=rand()*128,y=rand()*128;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4,y-3);ctx.lineTo(x+11,y+1);ctx.stroke();
 }
 const texture=new T.CanvasTexture(image);
 texture.wrapS=texture.wrapT=T.RepeatWrapping;
 return texture;
}
function createLandscape(){
 const sky = new T.Mesh(new T.SphereGeometry(145,24,12),new T.ShaderMaterial({
  side:T.BackSide,depthWrite:false,
  uniforms:{horizon:{value:vec(...region.sky.slice(0,3))},zenith:{value:vec(...region.sky.slice(3))}},
  vertexShader:'varying vec3 pos; void main(){pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 pos;uniform vec3 horizon,zenith;
   void main(){
    vec3 dir=normalize(pos);
    float h=clamp(dir.y,0.,1.);
    vec3 sky=mix(horizon,zenith,smoothstep(0.,.60,h));
    float sun=max(0.,dot(dir,normalize(vec3(-.68,.20,-.62))));
    sky+=vec3(.64,.40,.14)*pow(sun,8.);
    sky+=vec3(.58,.35,.18)*smoothstep(.9981,.9994,sun);
    gl_FragColor=vec4(sky,1.);
   }`
 }));
 sky.renderOrder=100;scene.add(sky);
 const plane=new T.PlaneGeometry(210,210,132,132);
 plane.rotateX(-Math.PI/2);
 const pos=plane.attributes.position, colors=[];
 const tint=new T.Color();
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),z=pos.getZ(i),edge=Math.max(0,Math.max(Math.abs(x),Math.abs(z))-BOUND-3);
  const hill=edge*(.19+.15*Math.sin(x*.25)+.1*Math.cos(z*.19));
  pos.setY(i,-.055+hill+terrainHeight(x,z));
  const earth=Math.sin(x*.37+slopeX)+Math.cos(z*.31+slopeZ)+Math.sin((x+z)*.23);
  tint.setHSL(earth>1?region.ground[1]:region.ground[0]+.033*Math.sin(x*.12)*Math.cos(z*.14),.31+rand()*.10,(regionId==='obsidian'?.25:.13)+.028*Math.sin(x*.25+z*.11)+rand()*.03);
  colors.push(tint.r,tint.g,tint.b);
 }
 plane.setAttribute('color',new T.Float32BufferAttribute(colors,3));plane.computeVertexNormals();
 const landTexture=terrainTexture(false);landTexture.repeat.set(34,34);
 const ground=new T.Mesh(plane,new T.MeshStandardMaterial({map:landTexture,vertexColors:true,roughness:1}));
 ground.receiveShadow=true;scene.add(ground);
 for(let i=0;i<39;i++){
  const angle=i/39*TAU,rad=75+rand()*12;
  const mountain=mesh(stage,rock,mat(pick(region.mountain)),
   Math.cos(angle)*rad,-3,Math.sin(angle)*rad,9+rand()*9,(7+rand()*17)*region.relief,9+rand()*5,false);
  mountain.rotation.y=rand()*TAU;
 }
 const gravel=mat(0x514841),stripe=mat(0xb19c6d);
 const asphalt=terrainTexture(true);asphalt.repeat.set(3,48);
 const shoulder=terrainTexture(true);shoulder.repeat.set(39,3);
 const road=new T.MeshStandardMaterial({color:0x47424b,map:asphalt,roughness:1});
 const sideRoad=new T.MeshStandardMaterial({color:0x625751,map:shoulder,roughness:1});
 const track=(material,x,z,w,d,y)=>{
  const model=mesh(stage,shadowGeometry,material,x,y,z,w,d,1,false);
  model.rotation.x=-Math.PI/2;
 };
 track(road,0,0,7.15,109,-.019);track(sideRoad,0,-1,105,5.5,-.012);
 for(const edge of [-1,1]){
  track(gravel,edge*3.62,0,.17,104,-.015);
  track(gravel,0,-1+edge*2.79,104,.19,-.010);
 }
 for(let i=-50;i<52;i+=5){
  if(Math.abs(i)<5||rand()>.82)continue;
  block(stage,stripe,(rand()-.5)*.06,-.016,i,.079,.012,.97+rand()*.59,false);
 }
 for(let i=0;i<29;i++){
  const z=(rand()-.5)*88,x=(rand()-.5)*5.7;
  const repair=mesh(stage,rock,mat(pick([0x45404a,0x575051,0x49484d])),x,-.014,z,.19+rand()*.66,.01,.26+rand()*.41,false);
  repair.rotation.y=rand()*TAU;
 }
 const blades=new T.InstancedMesh(cone,mat(regionId==='obsidian'?0x829aaa:regionId==='canyonlands'?0xb08e65:0x708951),Math.round(430+region.woodland*570));
 const dummy=new T.Object3D(),color=new T.Color();
 for(let i=0;i<blades.count;i++){
  let x,z;
  do{x=(rand()-.5)*BOUND*2;z=(rand()-.5)*BOUND*2}while(Math.abs(x)<4||Math.abs(z+1)<3.7);
  const height=.14+rand()*.37;
  dummy.position.set(x,terrainHeight(x,z)+height*.37,z);dummy.scale.set(.08+rand()*.11,height,.07+rand()*.09);
  dummy.rotation.set(rand()*.26,rand()*TAU,rand()*.3-.15);dummy.updateMatrix();
  blades.setMatrixAt(i,dummy.matrix);blades.setColorAt(i,color.setHSL(region.ground[0]-.11+rand()*.17,.32,.47+rand()*.33));
 }
 scene.add(blades);
}
function makeRiftDome(){
 const geometry=new T.SphereGeometry(49.7,54,26,0,TAU,0,Math.PI*.51);
 const material=new T.ShaderMaterial({
  transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{uTime:{value:0},uPressure:{value:.08}},
  vertexShader:`varying vec3 w; varying vec3 n;
   void main(){w=(modelMatrix*vec4(position,1.)).xyz;n=normalize(position);gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
  fragmentShader:`uniform float uTime,uPressure; varying vec3 w; varying vec3 n;
   void main(){
    float angle=atan(w.z,w.x);
    float fold=sin(angle*29.+sin(w.y*.23-uTime*.7)*2.4);
    float ribbons=smoothstep(.86,.99,fold)*(.58+.42*sin(w.y*.37-uTime*.95));
    float rim=1.-abs(dot(normalize(cameraPosition-w),normalize(n)));
    float top=1.-smoothstep(17.,38.,max(0.,w.y));
    float near=1.-smoothstep(6.,18.,length(cameraPosition-w));
    float opacity=(.018+ribbons*.21+rim*.11)*(top*.72+.28)*(uPressure+.24+near*.64);
    if(w.y<-.15)discard;
    gl_FragColor=vec4(mix(vec3(.34,.16,.59),vec3(.79,.41,1.),ribbons),opacity);
   }`
 });
 const dome=new T.Mesh(geometry,material);
 dome.position.y=-.38;
 dome.renderOrder=2;
 scene.add(dome);
 return dome;
}
const shadowGeometry=new T.PlaneGeometry(1,1);
const shadowTexture=(()=>{
 const image=document.createElement('canvas');image.width=image.height=32;
 const ctx=image.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);
 gradient.addColorStop(0,'rgba(0,0,0,0.69)');
 gradient.addColorStop(.44,'rgba(0,0,0,0.42)');
 gradient.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
 return new T.CanvasTexture(image);
})();
const shadowMaterial=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
function contactShadow(parent,width,depth){
 const shadow=new T.Mesh(shadowGeometry,shadowMaterial);
 shadow.rotation.x=-Math.PI/2;shadow.scale.set(width,depth,1);shadow.position.y=.018;
 parent.add(shadow);
 return shadow;
}
const trunkGeometry=new T.CylinderGeometry(.56,1,1,8,2);
function logBeam(group,material,from,to,radius){
 const start=vec(...from),end=vec(...to),direction=end.clone().sub(start);
 const center=start.addScaledVector(direction,.5);
 const stem=mesh(group,trunkGeometry,material,center.x,center.y,center.z,radius,direction.length(),radius);
 stem.quaternion.setFromUnitVectors(vec(0,1,0),direction.normalize());
 return stem;
}
function tree(group,size=1,wide=false){
 const bark=mat(pick([0x493934,0x58432e,0x534044])),flecks=mat(0x88644a);
 const colors=regionId==='obsidian'?[0x3e575f,0x6a8791,0x9cb3b9]:regionId==='canyonlands'?
  [0x535c3e,0x6b704d,0x938157]:wide?[0x345c41,0x537342,0x70834a]:[0x294f43,0x355d4e,0x607a54];
 mesh(group,trunkGeometry,bark,0,1.68,0,.31,3.38,.30);
 for(const [sign,lift] of [[-1,0],[1,.42],[-1,.9]]){
  const end=sign*(wide?1.38:.70);
  logBeam(group,bark,[0,1.78+lift,0],[end,2.56+lift,-.33],wide?.155:.087);
  logBeam(group,flecks,[sign*.22,.09,.06],[0,.58,0],.052);
 }
 if(wide){
  for(let i=0;i<6;i++){
   const angle=i/6*TAU+rand()*.25,spread=i<4?1.06:.71;
   const puff=mesh(group,sphere,mat(colors[i%3]),Math.cos(angle)*spread,3.23+(i%3)*.64,Math.sin(angle)*spread,
    1.4+rand()*.5,1.02+rand()*.43,1.16+rand()*.58);
   puff.rotation.set(rand()*.7,rand()*TAU,rand()*.7);
   puff.userData.chip=i===3||i===1;
  }
 }else{
  for(let i=0;i<5;i++){
   const radius=1.65-i*.27;
   const crown=mesh(group,cone,mat(colors[i%3]),(rand()-.5)*.11,2.22+i*.70,0,radius,1.80-i*.17,radius*.95);
   crown.rotation.set((rand()-.5)*.17,i*.83,(rand()-.5)*.18);
   crown.userData.chip=i===0||i===2;
   if(i<3)mesh(group,cone,mat(colors[(i+1)%3]),.32,1.99+i*.69,-radius*.32,radius*.67,.95-i*.12,radius*.59).rotation.set(.26,i*.66,.24);
  }
 }
 group.scale.setScalar(size);
}
function shelter(x,z,yaw,variation){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);group.rotation.y=yaw;
 group.updateWorldMatrix(true,false);
 const wall=mat(({timbervale:[0x81684e,0x57765c,0x955b45],ironridge:[0x795948,0x616875,0x956a54],canyonlands:[0xb27a54,0xc88b61,0xa66c52],obsidian:[0x5a656f,0x536475,0x66616c]})[regionId][variation%3]),beam=mat(0x453835),roof=mat(0x3c5258);
 const flooring=mat(0x69574a),windowGlass=mat(0x2a3d3e),width=GRID*2,depth=GRID*2;
 const alongZ=Math.abs(Math.sin(yaw))>.5;
 block(group,flooring,0,-.034,0,width,.10,depth);
 const toWorld=(lx,lz)=>group.localToWorld(vec(lx,0,lz));
 const building={type:'prop',kind:1,group,x,y,z,top:y+4,height:4,r:width/2,max:26,hp:26,alive:true,yaw,weakIndex:0,chippable:[],walls:[]};
 props.push(building);
 function panel(lx,lz,w,d){
  const top=2.65,world=toWorld(lx,lz),hx=(alongZ?d:w)*.5,hz=(alongZ?w:d)*.5;
  const cover={type:'cover',alive:true,r:Math.hypot(hx,hz),top:y+top,x:world.x,z:world.z,rect:{x:world.x,z:world.z,hx,hz}};
  const segment=block(group,wall,lx,top/2,lz,w,top,d);
  registerHit(segment,building);building.walls.push([segment,cover]);solidProps.push(cover);
  return cover;
 }
 const floorMark=toWorld(0,0);
 const aperture=2.24,wing=(width-aperture)/2,thickness=.23;
 panel(0,-depth/2,width,thickness);
 panel(-width/2,0,thickness,depth);
 panel(width/2,0,thickness,depth);
 for(const side of [-1,1])panel(side*(aperture/2+wing/2),depth/2,wing,thickness);
 block(group,beam,0,2.50,depth/2,width,.32,.34);
 block(group,beam,0,.04,depth/2,width,.092,.32);
 for(const side of [-1,1]){
  const slab=block(group,roof,side*width*.24,3.26,0,width*.58,.263,depth+.62);
  slab.rotation.z=-side*.42;
  for(const x of [side*width*.48,side*aperture*.52]){
   block(group,beam,x,1.27,depth*.5+.045,.135,2.53,.18);
  }
  for(let i=0;i<8;i++){
   block(group,beam,side*(width*.5+.122),1.24,(i-3.5)*depth/8,.024,2.37,.042,false);
  }
  const sideSign=side*(width*.5+.126);
  block(group,beam,sideSign,1.6,1.1,.065,1.02,1.46);
  block(group,windowGlass,sideSign+side*.035,1.6,1.1,.024,.73,1.21);
  block(group,trim,sideSign+side*.054,1.6,1.1,.025,.75,.049);
  const logs=groupAt(group,side*(width*.37),0,depth*.67);
  for(let i=0;i<3;i++)for(let j=-1;j<=1;j++){
   mesh(logs,cyl,mat(0x84634a),j*.248,.125+i*.21,.15,.137,1.23,.137).rotation.x=Math.PI/2;
  }
 }
 block(group,beam,0,1.46,-depth*.5+.38,3.36,.15,.58);
 block(group,beam,0,1.53,-depth*.5+.77,3.36,.085,.036);
 if(zoneKind===1){
  const floors=1+variation;
  for(let level=0;level<floors;level++){
   const h=4.9+level*2.5;
   const shell=block(group,wall,0,h,0,width*.90,2.5,depth*.9);
   registerHit(shell,building);building.extraHits||=[];building.extraHits.push(shell);
   for(const side of [-1,1])for(let bay=-1;bay<=1;bay++)block(group,glass,bay*width*.27,h,side*(depth*.451),width*.17,.95,.04);
  }
 }else if(zoneKind===2){
  for(let row=0;row<4;row++){
   const crop=groupAt(group,width*.7+row*.84,0,0);
   block(crop,mat(0x765538),0,.07,0,.58,.15,6);
   for(let stem=0;stem<6;stem++)mesh(crop,cone,mat(regionId==='obsidian'?0x8aa5ae:0xa7ac58),0,.39,stem-2.5,.29,.75,.29);
  }
 }
 const entrance=toWorld(0,depth/2+.9),inside=toWorld(0,depth/2-1.5),chest=toWorld((variation%2?1:-1)*1.8,-1.65);
 shelters.push({x:floorMark.x,z:floorMark.z,y,yaw,entrance,inside,chest});
}
function boulder(group){
 const surface=mat(pick([0x737083,0x8c8497,0x888491]));
 const body=mesh(group,rock,surface,0,.63,0,1.04,1.11,.95);
 body.rotation.set(.29,rand()*TAU,.22);
 const ledge=mesh(group,rock,mat(0x9993a0),.57,.31,.28,.64,.63,.65);
 ledge.rotation.set(.23,.65,-.28);
 mesh(group,rock,mat(0x62785b),-.41,.53,.53,.31,.17,.23);
}
function wreck(group){
 const paint=mat(pick([0x819b9f,0xb48262,0x7c82af,0x646c83]));
 block(group,dark,0,.42,0,1.55,.33,2.93);
 block(group,paint,0,.64,-.03,1.61,.39,2.94);
 block(group,paint,0,.87,1.04,1.56,.13,.73);
 block(group,glass,0,1.05,-.33,1.39,.42,1.33);
 block(group,paint,0,1.3,-.36,1.49,.12,1.4);
 for(const side of [-1,1]){
  block(group,paint,side*.72,1.05,-.33,.058,.43,.067);
  const windshield=block(group,paint,side*.67,1.05,.34,.07,.46,.07);
  windshield.rotation.x=.27;
  for(const end of [-1,1]){
   const wheel=mesh(group,tire,tires,side*.79,.36,end*.9,.32,.31,.32);
   wheel.rotation.z=Math.PI/2;
   const hub=mesh(group,tire,trim,side*.955,.36,end*.9,.15,.031,.15);
   hub.rotation.z=Math.PI/2;
  }
  block(group,mat(0xe7b980),side*.57,.72,1.47,.29,.126,.035);
  block(group,mat(0x963e4b),side*.57,.73,-1.5,.27,.12,.034);
 }
 block(group,trim,0,.53,1.47,1.56,.085,.075);
 block(group,trim,0,.53,-1.51,1.54,.085,.075);
}
function registerHit(object,entity,target=shotProps){
 object.userData.entity=entity;
 target.push(object);physics?.add(object);
 return object;
}
const invisible=new T.MeshBasicMaterial({visible:false});
function makeProp(kind,x,z){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const id=materials[kind].id;
 const wide=kind===0&&rand()<.46;
 const prop={type:'prop',kind,group,x,z,y,r:[wide?.57:.49,.99,1.32][kind],
  top:y+[3,1.52,1.38][kind],height:[3,1.52,1.38][kind],hp:[5,7,9][kind],alive:true,wide,
  shake:0,impact:0,weakIndex:0};
 prop.max=prop.hp;
 group.rotation.y=kind===2?(rand()-.5)*.6+Math.PI/2:rand()*TAU;
 if(kind===0)tree(group,1,wide);
 if(kind===1)boulder(group);
 if(kind===2)wreck(group);
 const source=group.children.slice();
 prop.chippable=(kind===0?source.filter(part=>part.userData.chip):kind===1?[source[2],source[1]]:
  source.slice(5).filter(part=>part.geometry===box&&part.scale.x<.64&&part.scale.y<.6));
 contactShadow(group,[2.3,2.8,2.2][kind],[2.8,2.5,3.9][kind]);
 prop.hitbox=registerHit(block(group,invisible,0,prop.height*.5,0,
  kind===2?1.75:prop.r*2,prop.height,kind===2?3:prop.r*2,false),prop);
 prop.id=id;prop.yaw=group.rotation.y;
 props.push(prop);solidProps.push(prop);
}
function batchScenery(items){
 const groups=new Map(),bounds=new T.Box3(),itemBounds=new T.Box3();
 for(const root of items){
  root.updateWorldMatrix(true,true);
  root.traverse(part=>{
   if(!part.isMesh||part.isInstancedMesh||part.material.transparent)return;
   const {matrixWorld,geometry,material}=part;
   const x=matrixWorld.elements[12],z=matrixWorld.elements[14];
   const key=[geometry.id,material.id,part.castShadow,part.receiveShadow,Math.floor(x/36),Math.floor(z/36)].join('/');
   let parts=groups.get(key);
   if(!parts)groups.set(key,parts=[]);
   parts.push(part);
  });
 }
 for(const parts of groups.values()){
  if(parts.length<3)continue;
  const source=parts[0],geometry=source.geometry.clone();
  const batch=new T.InstancedMesh(geometry,source.material,parts.length);
  geometry.computeBoundingBox();bounds.makeEmpty();
  for(let i=0;i<parts.length;i++){
   const part=parts[i];
   batch.setMatrixAt(i,part.matrixWorld);
   bounds.union(itemBounds.copy(geometry.boundingBox).applyMatrix4(part.matrixWorld));
   part.parent.remove(part);
  }
  geometry.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  batch.castShadow=source.castShadow;batch.receiveShadow=source.receiveShadow;
  batch.frustumCulled=true;batch.matrixAutoUpdate=false;
  scene.add(batch);
 }
}
function makeRidge(){
 const plans=[
  [-16-rand()*5,-19-rand()*6,pick([0,Math.PI/2])],
  [16+rand()*6,-16-rand()*7,pick([0,-Math.PI/2])],
  [14+rand()*9,19+rand()*7,pick([Math.PI,-Math.PI/2])]
 ].map(([x,z,yaw])=>[snapTile(x)+GRID/2,snapTile(z)+GRID/2,yaw]);
 const lots=[8,14,5,2,3][zoneKind];
 const rotation=rand()*TAU;
 for(let i=0;i<lots;i++){
  const a=rotation+i*TAU/lots,r=42+rand()*23;
  const x=snapTile(Math.cos(a)*r),z=snapTile(Math.sin(a)*r);
  plans.push([x,z,pick([0,Math.PI/2,Math.PI,-Math.PI/2])]);
 }
 for(const [x,z] of plans)terrainPads.push({x,z,y:Math.min(.35,terrainHeight(x,z))});
 createLandscape();
 const scenery=stage.children.filter(node=>node.isMesh&&!node.isInstancedMesh);
 for(const [x,z,yaw] of plans)shelter(x,z,yaw,Math.floor(rand()*3));
 const nearby=[
  [0,-7,10],[0,7,12],[0,-8,-10],[0,9,-13],[0,-13,18],[0,12,-5],[0,6,16],[0,-12,6],
  [1,-7,15],[1,6,7],[1,-10,-8],[1,9,16],[1,11,-13],[1,-14,1],
  [2,8,4],[2,-11,3],[2,10,-7],[2,-19,-3],[2,24,3],[2,-4,-18]
 ];
  for(const [kind,x,z] of nearby){
  const px=x+(rand()-.5)*1.35,pz=z+(rand()-.5)*1.15;
  if(objectiveDistance(px,pz)>4&&!shelters.some(obj=>Math.hypot(px-obj.x,pz-obj.z)<7)&&!solidProps.some(obj=>coverAt(obj,px,pz,2)))makeProp(kind,px,pz);
 }
 for(let i=0;i<region.trees+[15,8,24,60,12][zoneKind];i++){
  let x,z,attempt=0;
  do{x=Math.round((rand()-.5)*(BOUND*2-6));z=Math.round((rand()-.5)*(BOUND*2-6));attempt++}
  while(attempt<125&&(Math.abs(x)<5||Math.abs(z+1)<4||Math.hypot(x,z)<20||
   portals.some(([px,pz])=>Math.hypot(x-px,z-pz)<6)||shelters.some(p=>Math.hypot(x-p.x,z-p.z)<7)||solidProps.some(p=>coverAt(p,x,z,2.5))));
  if(attempt<125){
   const kind=zoneKind===1&&i%3===0?2:rand()<region.woodland*(zoneKind===4?.45:1)?0:regionId==='ironridge'&&i%3===0?2:1;
   makeProp(kind,x,z);
  }
 }
 const horizonTrees=Math.round(8+region.woodland*17);
 for(let i=0;i<horizonTrees;i++){
  const angle=i/horizonTrees*TAU+rand()*.13,radius=BOUND+5+rand()*9;
  const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
  const horizon=groupAt(stage,x,terrainHeight(x,z)+.4,z);
  tree(horizon,1.05+rand()*.55,i%4===0);
  scenery.push(horizon);
 }
 batchScenery(scenery);
}

let atlasCore,atlasRing,atlasBeacon,atlasModel,atlasBody,atlasHit;
function makeAtlas(){
 const model=atlasModel=groupAt(stage,ox,0,oz);
 const pad=mat(0x374b61,0,.32);
 contactShadow(model,5.8,5.6);
 mesh(model,hex,dark,0,.1,0,2.15,.2,2.15);
 mesh(model,hex,pad,0,.26,0,1.94,.28,1.94);
 mesh(model,hex,steel,0,.65,0,1.18,.7,1.18);
 mesh(model,hex,trim,0,.98,0,.94,.16,.94);
 atlasBody={type:'atlas',x:ox,z:oz,r:1.91,top:3.65,alive:true};
 solidProps.push(atlasBody);
 atlasHit=registerHit(mesh(model,cyl,invisible,0,1.65,0,1.53,3.3,1.53,false),atlasBody);
 ring(model,accent,1.79,.029,.397,42);
 for(let i=0;i<4;i++){
  const frame=groupAt(model);frame.rotation.y=Math.PI/4+i*Math.PI/2;
  block(frame,pad,0,.33,1.55,.64,.28,.69);
  const strut=block(frame,pad,0,1.35,.99,.29,1.95,.3);
  strut.rotation.x=-.21;
  block(frame,orange,0,.56,1.61,.42,.06,.39);
  block(frame,accent,0,1.91,1.07,.09,.48,.06,false);
 }
 atlasRing=ring(model,accent,1.12,.039,2.34,34);
 const darkCore=groupAt(model,0,2.34,0);
 atlasCore=mesh(darkCore,gem,accent,0,0,0,.58,.94,.58,false);
 atlasBeacon=mesh(model,cyl,new T.MeshBasicMaterial({color:0x61e9db,transparent:true,opacity:.105,depthWrite:false}),0,7,0,.065,9,.065,false);
}
function haloTexture(){
 const image=document.createElement('canvas');image.width=image.height=64;
 const context=image.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'#fff');gradient.addColorStop(.19,'#ede1ffb0');
 gradient.addColorStop(.5,'#cab1ff35');gradient.addColorStop(1,'#a271ff00');
 context.fillStyle=gradient;context.fillRect(0,0,64,64);
 return new T.CanvasTexture(image);
}
const haloMap=haloTexture();
const weakTexture=(()=>{
 const image=document.createElement('canvas');image.width=image.height=64;
 const ctx=image.getContext('2d');ctx.lineWidth=6;ctx.strokeStyle='#fdf7b1';
 ctx.beginPath();ctx.arc(32,32,22,0,TAU);ctx.stroke();
 ctx.strokeStyle='#203940';ctx.lineWidth=2;ctx.beginPath();ctx.arc(32,32,18,0,TAU);ctx.stroke();
 ctx.fillStyle='#86e5de';ctx.beginPath();ctx.moveTo(32,22);ctx.lineTo(42,32);ctx.lineTo(32,42);ctx.lineTo(22,32);
 ctx.closePath();ctx.fill();
 return new T.CanvasTexture(image);
})();
const weakMark=new T.Sprite(new T.SpriteMaterial({
 map:weakTexture,transparent:true,depthWrite:false,opacity:.95,depthTest:false
}));
weakMark.visible=false;weakMark.renderOrder=5;weakMark.scale.set(.30,.30,1);scene.add(weakMark);
function glow(group,color,x,y,z,w,h,opacity){
 const material=new T.SpriteMaterial({map:haloMap,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false});
 const sprite=new T.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(w,h,1);group.add(sprite);
 return sprite;
}
function makePortals(){
 for(let i=0;i<portals.length;i++){
  const [x,z]=portals[i],gate=groupAt(stage,x,terrainHeight(x,z),z);
  gate.rotation.y=Math.atan2(x,z);
  mesh(gate,hex,mat(0x312944),0,.02,0,3.45,.15,3.45,false);
  const flare=glow(gate,0xd49cff,0,2.5,0,9,10,0);
  const rot=groupAt(gate,0,2.67,0);
  const center=mesh(rot,gem,purple,0,0,0,.72,1.75,.18,false);
  center.rotation.z=-.12;
  const arch=ring(rot,purple,1.83,.077,0,28);
  arch.rotation.set(0,0,-.21);arch.scale.set(.77,1.17,1);
  const outer=ring(rot,mat(0x8e62d2,0x7549bc),2.13,.035,0,24);
  outer.rotation.set(.19,.31,.12);outer.scale.set(.85,1.12,1);
  for(const s of [-1,1]){
   const extrusion=mesh(gate,rock,mat(0x66557f),s*2.07,.56,0,.66,.81,.58);
   extrusion.rotation.z=s*.26;
  }
  const survey=mesh(gate,gem,mat(0x6d5c8c,0x38256a),0,.57,0,.38,.72,.36,false);
  const warning=groupAt(gate),light=new T.MeshBasicMaterial({color:0xffbf79,transparent:true,opacity:.61,depthWrite:false});
  mesh(warning,cyl,light,0,5.4,0,.095,10.8,.095,false);
  ring(warning,light,1.48,.046,.13,32);warning.visible=false;
  rot.visible=false;
  portalFx.push({flare,rot,outer,arch,survey,warning,active:false});
 }
}

function cacheModel(group,kind){
 const body=kind==='cache'?mat(0x966b49):mat(0x35667e);
 const light=kind==='cache'?mat(0xf8c875,0xd68a39):accent;
 block(group,dark,0,.35,0,1.18,.65,.91);
 block(group,body,0,.44,0,1.22,.58,.93);
 block(group,body,0,.76,0,1.28,.15,1.01);
 for(const side of [-1,1]){
  block(group,steel,side*.38,.46,.478,.17,.62,.09);
  block(group,trim,side*.38,.832,0,.175,.035,.97);
 }
 block(group,light,0,.59,.494,.23,.145,.074,false);
 return glow(group,kind==='cache'?0xffb95c:0x56eeff,0,.78,0,2.8,2.6,.39);
}
let dropIndex=0;
function addCache(x,z,kind){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const flare=cacheModel(group,kind);
 const marker=mesh(group,gem,kind==='cache'?mat(0xf8c875,0xd68a39):accent,0,1.37,0,.15,.24,.15,false);
 loot.push({x,y,z,kind,group,flare,marker,active:true});
}

function addChest(shed,index){
 const {x,z}=shed.chest;
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 group.rotation.y=shed.yaw;
 const body=mat(0x856244),strap=mat(0x3a505a),brass=mat(0xffcd8c,0xbe8644);
 block(group,dark,0,.25,0,1.30,.50,1.03);
 block(group,body,0,.29,0,1.22,.43,.97);
 const lid=groupAt(group,0,.53,-.47);
 block(lid,body,0,.025,.47,1.31,.18,1.04);
 for(const side of [-1,1]){
  block(lid,strap,side*.46,.085,.47,.135,.09,1.01);
  block(group,strap,side*.46,.27,.486,.14,.49,.045);
 }
 block(lid,brass,0,-.046,.99,.20,.147,.032,false);
 const flare=glow(group,0xffcc8d,0,.63,0,2.5,2.4,.42);
 const marker=mesh(group,gem,brass,0,1.23,0,.133,.16,.133,false);
 const pool=gear?.loot.filter(item=>!guns.some(gun=>gun.k===item.k))||[];
 const roll=rand(),reward=pool.length?pool[Math.floor(roll*pool.length)]:{k:null,name:'Ridge Carbine'};
 loot.push({x,y,z,group,lid,flare,marker,kind:'chest',active:true,opened:false,reward,
  power:Math.max(20,region.floor+5)+index*3+Math.floor(rand()*6),element:engineering.elements[1+(index+Math.floor(rand()*4))%4],stocks:[24+Math.floor(rand()*21),14+Math.floor(rand()*15),10+Math.floor(rand()*15)]});
}
function availableChest(){
 let closest=null,distance=2.35;
 for(const item of loot){
  if((item.kind!=='chest'&&item.kind!=='weapon')||!item.active||Math.abs(hero.pos.y-item.y)>1.9)continue;
  const range=Math.hypot(hero.pos.x-item.x,hero.pos.z-item.z);
  if(range>=distance)continue;
  if(wallBetween(hero.pos.x,hero.pos.z,item.x,item.z,.025,hero.pos.y+.43))continue;
  if(solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,hero.pos.x,hero.pos.z,item.x,item.z,.015)))continue;
  closest=item;distance=range;
 }
 return closest;
}
function useChest(){
 const chest=availableChest();
 if(!chest)return false;
 if(!chest.opened){
  chest.opened=true;chest.lid.rotation.x=-1.19;fieldMetrics.caches++;
  hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+chest.stocks[i]));
  chest.marker.material=accent;chest.flare.material.color.setHex(0x7ddcde);
  restock(30);collectPart('parts',2+Math.floor(rand()*5));collectPart(pick(['quartz','powder','gears','cells']),1+Math.floor(rand()*4));collectPart('charge',2);
  if(chest.reward.k){
   const found={id:chest.reward.k,name:chest.reward.name};
   if(remoteSeat)sendGame('feedback',{discovery:found},remoteSeat.id);else discoveries.set(found.id,found);
  }
  notice(chest.reward.name+' · P'+chest.power+' '+chest.element+(chest.reward.k&&!profile.blueprints[chest.reward.k]?' · Extract to recover the pattern':''));
 }else{
  const drop={...chest.reward,power:chest.power,element:chest.element};
  if(remoteSeat)sendGame('feedback',{weapon:drop},remoteSeat.id);else equipLoot(drop);
  chest.active=false;if(chest.kind==='weapon')chest.group.visible=false;chest.marker.visible=false;chest.flare.visible=false;
 }
 sound('pickup');rumble(.18,68);
 return true;
}

function equipLoot(drop,design){
 const index=currentGun()?hero.weapon:0;
 const old=guns[index],weapon=drop.k&&gear?.canForge(drop.k)?gear.weapon(drop.k):{...fallbackGun,name:drop.name};
 if(old?.model){old.model.visible=false;gear.model.remove(old.model)}
 guns[index]=armWeapon(weapon,drop.power,drop.element,design);
 repaintWeaponSlot(index);switchWeapon(index);
}

function createHero(){
 const root=groupAt(scene),chest=groupAt(root,0,1.12,0);
 const shell=mat(0xa8623e),cloth=mat(0x35495e), visor=mat(0x447e99,0x2a5167,.42);
 block(chest,cloth,0,.07,0,.58,.55,.36);
 block(chest,shell,0,.14,-.13,.5,.36,.21);
 for(const side of [-1,1]){
  block(chest,trim,side*.24,.16,.06,.075,.36,.39);
  block(chest,mat(0x775242),side*.2,-.16,-.2,.15,.15,.12);
 }
 block(chest,dark,0,.072,.235,.41,.44,.18);
 block(chest,mat(0x657b8a),0,.13,.344,.32,.26,.067);
 block(chest,accent,0,.07,.39,.18,.036,.022,false);
 for(const side of [-1,1])block(chest,orange,side*.19,.135,.337,.046,.3,.043);
 const head=groupAt(chest,0,.53,0);
 mesh(head,sphere,shell,0,0,0,.262,.252,.245);
 block(head,visor,0,-.009,-.187,.39,.128,.13);
 block(head,accent,0,-.007,-.257,.322,.023,.012,false);
 for(const side of [-1,1])block(head,dark,side*.235,-.034,0,.053,.146,.152);
 const antenna=block(head,trim,.21,.22,.079,.03,.27,.029);
 antenna.rotation.z=-.17;
 block(head,accent,.23,.35,.079,.036,.055,.035,false);
 const legs=[-1,1].map(side=>{
  const leg=groupAt(root,side*.164,.89,0);
  block(leg,cloth,0,-.21,.002,.24,.42,.24);
  block(leg,dark,0,-.54,.02,.205,.28,.19);
  block(leg,trim,0,-.37,-.103,.19,.125,.109);
  block(leg,dark,0,-.77,-.055,.252,.2,.343);
  block(leg,shell,0,-.742,-.20,.226,.102,.081);
  return leg;
 });
 const arms=[-1,1].map(side=>{
  const arm=groupAt(chest,side*.362,.23,-.035);
  block(arm,shell,0,-.08,0,.20,.25,.24);
  block(arm,cloth,0,-.24,0,.16,.22,.16);
  const fore=groupAt(chest);
  block(fore,cloth,0,-.11,0,.15,.24,.158);
  block(fore,trim,0,-.23,0,.16,.12,.161);
  block(fore,dark,0,-.33,0,.16,.15,.16);
  return {arm,fore,side};
 });
 const held=groupAt(chest,.395,-.033,-.31);
 const rifle=groupAt(held);
 block(rifle,steel,0,0,-.24,.145,.154,.66);
 block(rifle,dark,0,.029,.133,.13,.102,.296);
 block(rifle,trim,0,.005,-.46,.17,.133,.33);
 block(rifle,dark,0,.001,-.746,.067,.07,.3);
 block(rifle,dark,0,-.115,-.27,.097,.197,.149).rotation.x=-.25;
 block(rifle,orange,0,.103,-.214,.10,.074,.151);
 block(rifle,accent,.075,.027,-.343,.01,.036,.139,false);
 const muzzle=groupAt(rifle,0,.012,-.92),flash=glow(muzzle,0xffd898,0,0,0,.64,.64,0);
 const axe=groupAt(held);
 block(axe,mat(0x8b614a),0,-.06,-.382,.074,.078,1.0);
 block(axe,steel,0,-.059,-.83,.119,.119,.27);
 for(const side of [-1,1]){
  const blade=mesh(axe,gem,trim,side*(side===1?.17:.125),-.058,-.817,side===1?.30:.24,.083,.139);
  blade.rotation.y=side*.24;
  block(axe,steel,side*.106,-.014,-.819,.142,.022,.081);
  block(axe,orange,side*.049,-.014,-.817,.023,.035,.067);
 }
 for(let i=0;i<6;i++){
  block(axe,mat(0x343747),0,-.06,.045-i*.023,.08,.084,.016);
  block(axe,mat(0x343747),0,-.06,-.426-i*.017,.079,.083,.012);
 }
 const shadow=contactShadow(root,1.65,1.42);
 return {root,chest,head,legs,arms,held,rifle,axe,muzzle,flash,shadow};
}
const actor=createHero();
if(gear){
 actor.baseModel=gear.model;
 actor.root.add(actor.baseModel);
 for(const model of [actor.chest,...actor.legs])model.visible=false;
 actor.root.add(actor.held);
 actor.held.position.set(.385,1.12,-.34);
 actor.rifle.visible=false;
}
const weaponVisible=()=>!state.building&&hero.emote<=0;
const SWING_DURATION=.62, SWING_CONTACT=.27;
const axeMotion=[
 [0,[-.19,1.24,-.33],[.84,.49,-.31]],
 [.21,[-.19,1.66,-.17],[.49,.86,.07]],
 [.34,[-.12,1.66,-.24],[.36,.85,-.17]],
 [.46,[-.13,1.32,-.36],[.67,-.27,-.69]],
 [.63,[-.16,1.10,-.31],[.80,-.52,-.25]],
 [1,[-.19,1.24,-.33],[.84,.49,-.31]]
];
const axeGrip={right:vec(),left:vec(),axis:vec(),phase:0};
const axeForward=vec(0,0,-1),axeGripOffset=vec();
function poseAxe(step){
 const time=hero.swingTime/SWING_DURATION;
 const next=axeMotion.findIndex(([t])=>t>time);
 const end=next>0?next:axeMotion.length-1;
 const [from,start,direction]=axeMotion[end-1], [to,target,heading]=axeMotion[end];
 const a=clamp((time-from)/(to-from),0,1),mix=a*a*(3-2*a);
 const right=axeGrip.right.set(...start).lerp(axeGripOffset.set(...target),mix);
 right.y+=Math.abs(step)*.043*hero.move;
 const axis=axeGrip.axis.set(...direction).lerp(axeGripOffset.set(...heading),mix).normalize();
 actor.held.quaternion.setFromUnitVectors(axeForward,axis);
 actor.held.position.copy(right).sub(axeGripOffset.set(0,-.06,-.105).applyQuaternion(actor.held.quaternion));
 axeGrip.left.copy(right).addScaledVector(axis,.33);
 axeGrip.phase=hero.swingTime?Math.sin(Math.PI*time):0;
 return axeGrip;
}
function aimFallbackArm(limb,point){
 const {arm,fore,side}=limb;
 const shoulder=arm.position;
 const wrist=point.clone().sub(actor.chest.position),reach=wrist.clone().sub(shoulder);
 const length=Math.min(.69,reach.length()),direction=reach.normalize();
 const hint=vec(side*.54,-1,.05);
 const bend=hint.addScaledVector(direction,-hint.dot(direction)).normalize()
  .multiplyScalar(Math.sqrt(Math.max(0,.345**2-(length*.5)**2)));
 fore.position.copy(shoulder).addScaledVector(direction,length*.5).add(bend);
 arm.quaternion.setFromUnitVectors(vec(0,-1,0),fore.position.clone().sub(shoulder).normalize());
 fore.quaternion.setFromUnitVectors(vec(0,-1,0),wrist.sub(fore.position).normalize());
}
function animHero(dt){
 hero.bob+=dt*(hero.sprint?12:8)*hero.move;
 hero.anim=Math.max(0,hero.anim-dt*3.4);
 const bob=Math.sin(hero.bob),step=hero.move*(hero.sprint?.86:.66);
 actor.root.position.copy(hero.pos);
 actor.root.rotation.y=hero.yaw;
 actor.shadow.visible=hero.ground;
 const gun=currentGun(),visible=weaponVisible(),pickaxe=visible&&!gun;
 let grip;
 if(!gear){
  actor.chest.position.y=1.12+Math.abs(bob)*.052*hero.move;
  actor.chest.rotation.x=hero.sprint?-.115:hero.pitch*.22;
  actor.chest.rotation.y=bob*hero.move*.05;
  actor.head.rotation.x=hero.pitch*.54;
  actor.legs.forEach((leg,i)=>{leg.rotation.x=hero.ground?bob*(i?1:-1)*step:(i?-.36:.48)});
 }
 if(pickaxe){
  if(actor.held.parent!==actor.root)actor.root.add(actor.held);
  grip=poseAxe(bob);
 }
 if(gear){
  for(const weapon of guns)weapon.model.visible=visible&&weapon===gun;
  if(hero.tempGun)hero.tempGun.model.visible=visible&&gun===hero.tempGun;
  gear.pose(hero,visible?gun:null,dt,grip);
  if(gun?.muzzle&&actor.flash.parent!==gun.muzzle)gun.muzzle.add(actor.flash);
 }else{
  if(hero.tempGun){
   hero.tempGun.model.visible=visible;
   hero.tempGun.model.position.set(.24,1.31,-.20);hero.tempGun.model.rotation.y=Math.PI;
  }
  if(!pickaxe){
   if(actor.held.parent!==actor.chest)actor.chest.add(actor.held);
   actor.held.position.set(.395,-.033,-.31);
   actor.held.rotation.set(hero.pitch*.58,0,hero.reload>0?-.4:0);
  }
  const left=grip?.right||vec(.02,1.18,-.49);
  const right=grip?.left||vec(.36,1.12,-.28);
  aimFallbackArm(actor.arms[0],left);aimFallbackArm(actor.arms[1],right);
  actor.rifle.visible=visible&&!!gun&&!hero.tempGun;
 }
 actor.axe.visible=pickaxe;
 actor.flash.material.opacity=visible&&gun&&hero.flash>0?.8:0;
}

function makeHusk(kind,x,z,knownElement){
 const base=husks[kind];
 const stats=state.modifier?.id==='quick'?{...base,speed:base.speed*1.22}:base;
 const root=groupAt(scene,x,terrainHeight(x,z),z),rig=groupAt(root);
 root.scale.setScalar(stats.scale);
 contactShadow(root,1.5,1.34);
 const skin=mat(stats.skin),suit=mat(stats.suit),eye=mat(stats.eye,stats.eye);
 const heavy=['brute','boss','juggernaut','catapult'].includes(kind),width=heavy?.71:.47;
 const chest=groupAt(rig,0,1.17,0);
 block(chest,suit,0,.08,0,width,.63,.35);
 block(chest,dark,0,-.22,0,width*.91,.16,.34);
 for(const side of [-1,1]){
  const pad=mesh(chest,rock,kind==='boss'?purple:suit,side*width*.445,.29,-.005,.17,.21,.19);
  pad.rotation.y=side*.33;
  block(chest,skin,side*.13,.175,-.179,.124,.042,.018);
 }
 const head=groupAt(chest,0,.48,-.111);
 mesh(head,rock,skin,0,.018,0,.238,.255,.236);
 block(head,dark,0,-.063,-.201,.246,.102,.052);
 block(head,skin,0,-.126,-.199,.139,.065,.106);
 for(const side of [-1,1]){
  block(head,eye,side*.089,.05,-.213,.098,.041,.035,false).rotation.z=side*.18;
  if(heavy)mesh(chest,gem,kind==='boss'?purple:eye,side*.31,.43,.04,.118,.33,.133);
 }
 const limbs=[-1,1].map(side=>{
  const arm=groupAt(chest,side*(width*.5+.065),.21,.01);
  block(arm,suit,0,-.125,0,.166,.31,.178);
  block(arm,skin,0,-.337,-.02,.15,.24,.15);
  block(arm,skin,0,-.457,-.063,.157,.092,.182);
  const leg=groupAt(rig,side*width*.267,.92,0);
  block(leg,suit,0,-.214,0,.19,.43,.21);
  block(leg,dark,0,-.57,.006,.161,.34,.16);
  block(leg,dark,0,-.784,-.048,.211,.17,.282);
  return {arm,leg};
 });
 const power=Math.max(region.floor,region.floor+9+(state.wave-1)*4+({husk:0,runner:1,spitter:3,brute:6,boss:13,
  mortar:4,demolisher:4,beam:6,phantasm:4,catapult:7,juggernaut:9})[kind]);
 const element=knownElement||(state.wave<3?'Kinetic':pick(state.wave>=4?engineering.elements.slice(2):['Kinetic','Kinetic','Scorch','Frost','Volt']));
 if(element!=='Kinetic')for(const side of [-1,1])block(chest,mat(elementColors[element],elementColors[element]),
  side*width*.42,.31,-.18,.073,.093,.05,false);
 const max=Math.round((stats.hp+(kind==='boss'?0:(Math.max(1,state.wave)-1)*7))*
  (1+(region.floor-1)*.008)*(state.modifier?.id==='tough'?1.28:1));
 const enemy={netId:++enemySerial,type:'enemy',kind,power,stats,root,rig,chest,head,limbs,x,z,r:heavy?.53:.34,
  active:true,hp:max,max,air:0,vy:0,kx:0,kz:0,snare:0,tar:0,charge:0,chargeIn:1.3,beamFor:0,beamTick:0,element,hitIn:1.15,bob:rand()*TAU,recoil:0,stun:0,stuck:0,yaw:Math.atan2(x,z)};
 enemy.body=registerHit(block(root,invisible,0,.88,0,width+.37,1.44,.64,false),enemy,enemyTargets);
 enemy.skull=registerHit(block(root,invisible,0,1.68,-.1,.49,.51,.48,false),enemy,enemyTargets);
 enemy.skull.userData.head=true;
 if(kind==='demolisher'){
  const cell=mesh(chest,cyl,mat(0xb5704b,0xc37833),0,.084,-.275,.17,.55,.168);
  mesh(chest,cyl,steel,0,.34,-.275,.174,.12,.17);
  enemy.canister=registerHit(block(chest,invisible,0,.084,-.275,.41,.57,.39,false),enemy,enemyTargets);
  enemy.canister.userData.canister=true;cell.rotation.z=.075;
 }
 if(kind==='mortar'){
  const tube=mesh(chest,cyl,mat(0x4b6370,0,.23),.13,.31,.27,.15,.77,.15);
  tube.rotation.x=.28;
 }
 if(kind==='beam')block(head,mat(0x69e5df,0x69e5df),0,.077,-.238,.145,.082,.03,false);
 if(kind==='phantasm'){
  const spirit=glow(root,0xab72ec,0,1.04,.15,1.75,2.8,.38);
  enemy.spirit=spirit;
 }
 if(kind==='boss')enemy.halo=ring(root,purple,.88,.027,.055,22);
 enemies.push(enemy);
 return enemy;
}
const enemyTargets=[];
const structureTargets=[];
const activeWalls=[];
const walkways=[];
function removeTarget(list,target){
 const i=list.indexOf(target);
 if(i!==-1){list.splice(i,1);physics?.remove(target)}
}

const gridHelper = new T.GridHelper(BOUND*2,Math.round(BOUND*2/GRID),0x64bfdf,0x5093b9);
gridHelper.position.y=.011;
gridHelper.material.opacity=.21;gridHelper.material.transparent=true;gridHelper.visible=false;
scene.add(gridHelper);

const ghostSkin=new T.MeshBasicMaterial({color:0x5dbeff,transparent:true,opacity:.21,depthWrite:false});
const ghostOutline=new T.LineBasicMaterial({color:0x9cdeff,transparent:true,opacity:.86,depthWrite:false});
const edgeBox=new T.EdgesGeometry(box);
const structureMaterials=new Map();
function structureSkin(spec){
 if(structureMaterials.has(spec.id))return structureMaterials.get(spec.id);
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#d9cfc5';ctx.fillRect(0,0,64,96);
 if(spec.id==='wood'){
  for(let i=0;i<43;i++){
   const x=rand()*64,d=(rand()-.5)*14;
   ctx.strokeStyle=i%3?'#7f695345':'#fff8de70';ctx.lineWidth=.5+rand();
   ctx.beginPath();ctx.moveTo(x,-8);ctx.bezierCurveTo(x+d,28,x-d*.7,63,x+d*.3,104);ctx.stroke();
  }
 }else if(spec.id==='stone'){
  for(let y=0;y<96;y+=24){
   ctx.fillStyle='#7a6d726d';ctx.fillRect(0,y,64,2);
   ctx.fillRect(y%48?20:39,y,2,23);
   ctx.fillStyle='#fff3db57';ctx.fillRect(0,y+3,64,1);
  }
 }else{
  for(let i=0;i<30;i++){
   const x=rand()*64,y=rand()*96;
   ctx.fillStyle=i%3?'#5c6a6e51':'#f2f6f291';
   ctx.fillRect(x,y,1,.8+rand()*12);
  }
  for(const x of [6,58])for(const y of [7,85]){
   ctx.fillStyle='#586066';ctx.fillRect(x,y,2,2);
  }
 }
 const map=new T.CanvasTexture(canvas);
 const material=new T.MeshStandardMaterial({color:spec.color,map,roughness:.82,metalness:spec.id==='metal'?.32:0});
 structureMaterials.set(spec.id,material);
 return material;
}
const capPanels=new Map();
function capPanel(bit){
 if(capPanels.has(bit))return capPanels.get(bit);
 const {u0,u1,v0,v1}=engineering.patchBounds(4,bit);
 const top=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([x,z])=>[x,engineering.surfaceHeight(4,x,z)+.083,z]);
 const corner=top.findIndex(value=>value[1]>.1),opposite=(corner+2)%4;
 const [a,b,c,d]=[corner,(corner+1)%4,opposite,(corner+3)%4];
 const points=top.concat(top.map(([x,y,z])=>[x,y-.162,z]));
 const indices=[a,c,b,a,d,c,a+4,b+4,c+4,a+4,c+4,d+4];
 for(let i=0;i<4;i++){
  const j=(i+1)%4;
  indices.push(i,j+4,j,i,i+4,j+4);
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
 geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([x,,z])=>[x/GRID+.5,z/GRID+.5]),2));
 geo.setIndex(indices);geo.computeVertexNormals();
 capPanels.set(bit,geo);return geo;
}

function panels(group,item,preview=false){
 const {piece,mask,rank,material}=item;
 const skin=preview?ghostSkin:structureSkin(material);
 const frame=preview?ghostSkin:mat(material.frame);
 const n=engineering.dimensions(piece),solids=[];
 for(let bit=0;bit<n*n;bit++){
  if(!engineering.present(mask,bit))continue;
  const {u0,u1,v0,v1}=engineering.patchBounds(piece,bit);
  const u=(u0+u1)/2,v=(v0+v1)/2;
  let panel,angle=0;
  if(piece===0)panel=block(group,skin,u,v,0,u1-u0-.016,v1-v0-.012,.18+(rank-1)*.07,!preview);
  else if(piece===4)panel=mesh(group,capPanel(bit),skin,0,0,0,1,1,1,!preview);
  else{
   const slope=piece===2;
   angle=slope?Math.atan2(LEVEL,GRID):0;
   panel=block(group,skin,u,engineering.surfaceHeight(piece,u,v)+.065,v,
    u1-u0-.016,.152+(rank-1)*.035,(v1-v0)*(slope?Math.SQRT2:1)-.014,!preview);
   panel.rotation.x=angle;
  }
  solids.push({panel,bit});
  if(preview){
   const wire=new T.LineSegments(piece===4?new T.EdgesGeometry(panel.geometry):edgeBox,ghostOutline);
   wire.position.copy(panel.position);wire.quaternion.copy(panel.quaternion);wire.scale.copy(panel.scale);group.add(wire);
  }else if(piece!==4){
   if(piece===0){
    block(group,frame,u,v1-.042,.12,u1-u0-.016,.042,.065,false);
    if(rank>1)block(group,mat(rank===3?0xbcddda:0x83939e),u,v-.23,.14,(u1-u0)*.72,.074,.075,false);
   }else{
    const brace=block(group,frame,u,panel.position.y+.09,v,.056,.037,panel.scale.z*.9,false);
    brace.rotation.x=angle;
   }
  }
 }
 return solids;
}
function clearGhost(group){
 for(const child of group.children){
  if(child.isLineSegments&&child.geometry!==edgeBox)child.geometry.dispose();
 }
 group.clear();
}
const ghostModels = pieces.map((_,piece)=>{
 const group=groupAt(scene);group.visible=false;
 if(piece===3)block(group,ghostSkin,0,.14,0,GRID-.19,.22,GRID-.19,false);
 else panels(group,{piece,mask:engineering.fullMask(piece),rank:1},true);
 return group;
});
const editGhost=groupAt(scene);
editGhost.visible=false;

const coordinateKey=(type,x,z,layer)=>type+':'+x+':'+z+':'+layer;
const snapTile=n=>Math.round(n/GRID)*GRID;
function rectDistance(x,z,rect){
 return Math.hypot(Math.max(Math.abs(x-rect.x)-rect.hx,0),Math.max(Math.abs(z-rect.z)-rect.hz,0));
}
function planTrap(){
 const recipe=trapRecipes[state.recipe];
 const mounted=aimed?.object.userData.entity;
 if(mounted?.type!=='structure'||mounted.piece===3||aimed.distance>13)return {type:3,reason:'Aim at a friendly '+recipe.mount};
 const wall=recipe.mount==='wall',ceiling=recipe.mount==='ceiling';
 if((wall?mounted.piece!==0:mounted.piece!==1)||(ceiling&&mounted.layer===0))return {type:3,reason:'Requires a friendly '+recipe.mount};
 if(mounted.mask!==engineering.fullMask(mounted.piece))return {type:3,reason:'Requires a complete surface'};
 if(mounted.construction>0)return {type:3,reason:'Surface is under construction'};
 const angle=wall?mounted.angle:0;
 const nx=Math.sin(angle),nz=Math.cos(angle);
 const side=wall&&((hero.pos.x-mounted.x)*nx+(hero.pos.z-mounted.z)*nz)<0?-1:1;
 const x=mounted.x+(wall?nx*.25*side:0),z=mounted.z+(wall?nz*.25*side:0);
 const y=mounted.y+(wall?LEVEL*.5:ceiling?-.19:.18);
 const key=mounted.key+'/trap/'+recipe.mount+(wall?side:'');
 const reason=builds.has(key)?'Surface occupied':builds.size>=110?'Structure limit reached':
  recipe.cost.some((n,i)=>n>hero.stacks[i])?'Need more materials':'';
 return {type:3,key,x,y,z,angle:angle+(side<0?Math.PI:0),recipe,mount:mounted,material:mounted.material,cost:recipe.cost,reason};
}
function planStructure(){
 const type=state.piece;
 if(type===3)return planTrap();
 const dx=-Math.sin(hero.yaw),dz=-Math.cos(hero.yaw);
 const reach=clamp(4.85+hero.pitch*3.3,2.35,7);
 let x=snapTile(hero.pos.x+dx*reach),z=snapTile(hero.pos.z+dz*reach);
 const acrossX=Math.abs(dx)>Math.abs(dz);
 const angle=type===1?0:acrossX?(dx<0?Math.PI/2:-Math.PI/2):(dz<0?0:Math.PI);
 const viewY=hero.pos.y+1.4+Math.tan(hero.pitch)*reach;
 let layer=clamp(Math.floor((viewY+.3)/LEVEL),0,5);
 if(type===0){
  if(acrossX)x+=dx<0?GRID/2:-GRID/2;
  else z+=dz<0?GRID/2:-GRID/2;
 }else if(type===1&&hero.pos.y>LEVEL*.72&&viewY>LEVEL*.65)layer=clamp(Math.round(hero.pos.y/LEVEL),0,5);
 const y=layer*LEVEL,half=GRID/2;
 const rect={x,z,hx:type===0&&acrossX?.155:half,hz:type===0&&!acrossX?.155:half};
 const key=coordinateKey(['wall','floor','ramp','trap','cap'][type],x,z,layer);
 const material=materials[state.material],cost=materials.map(m=>m===material?10:0);
 const mask=engineering.fullMask(type),contacts=engineering.contacts({piece:type,x,z,layer,angle,mask});
 let reason='';
 if(Math.abs(x)>BOUND-half||Math.abs(z)>BOUND-half)reason='Out of bounds';
 else if(state.mission==='payload'&&rectDistance(ox,oz,rect)<1.65)reason='Keep the landing zone clear';
 else if(terrainHeight(x,z)>y+.48)reason='Uneven ground';
 else if(builds.has(key))reason='Already built';
 else if(type!==0&&[1,2,4].some(piece=>piece!==type&&builds.has(coordinateKey(['wall','floor','ramp','trap','cap'][piece],x,z,layer))))reason='Cell is occupied';
 else if(!engineering.canSupport(contacts,supportedBuilds))reason='Needs a grounded connection';
 else if(builds.size>=110)reason='Structure limit reached';
 else if(solidProps.some(p=>p.alive&&y<p.top-.05&&(p.rect?
   Math.abs(p.x-rect.x)<p.rect.hx+rect.hx&&Math.abs(p.z-rect.z)<p.rect.hz+rect.hz:rectDistance(p.x,p.z,rect)<p.r)))reason='Site obstructed';
 else if(type===0&&hero.pos.y+1.7>y&&hero.pos.y<y+LEVEL&&rectDistance(hero.pos.x,hero.pos.z,rect)<.35)reason='Step clear of the wall';
 else if(type===0&&y===0&&enemies.some(e=>e.active&&rectDistance(e.x,e.z,rect)<e.r))reason='Hollow blocking placement';
 else if(cost.some((n,i)=>n>hero.stacks[i]))reason='Need more materials';
 return {x,y,z,type,layer,angle,rect,material,cost,key,mask,contacts,reason};
}
function blueprintPose(model,plan){
 model.position.set(plan.x,plan.y,plan.z);
 model.rotation.set(plan.recipe?.mount==='wall'?Math.PI/2:0,plan.angle,0,'YXZ');
}
function updateBlueprint(){
 gridHelper.visible=state.building||!!state.edit;
 if(blueprint)ghostModels[blueprint.type].visible=false;
 if(!state.building||state.edit){blueprint=null;return}
 blueprint=planStructure();
 if(!Number.isFinite(blueprint.x))return;
 ghostSkin.color.setHex(blueprint.reason?0xf38282:0x5dbeff);
 ghostOutline.color.setHex(blueprint.reason?0xffa49b:0x9cdeff);
 const model=ghostModels[blueprint.type];
 model.visible=true;blueprintPose(model,blueprint);
}
function panelRect(item,bit){
 const {u0,u1,v0,v1}=engineering.patchBounds(0,bit),u=(u0+u1)/2;
 const c=Math.round(Math.cos(item.angle)),s=Math.round(Math.sin(item.angle));
 const span=(u1-u0)*.5,depth=.14+(item.rank-1)*.035;
 return {x:item.x+c*u,z:item.z-s*u,hx:c?span:depth,hz:s?span:depth,bottom:item.y+v0,top:item.y+v1};
}
function rebuildStructure(item){
 structureBatchDirty=true;
 for(const target of item.targets||[])removeTarget(structureTargets,target);
 item.group.clear();
 item.targets=[];item.barriers=[];
 if(item.piece===3){
  item.targets=trapVisual(item).map(model=>registerHit(model,item,structureTargets));
  return;
 }
 for(const {panel,bit} of panels(item.group,item)){
  item.targets.push(registerHit(panel,item,structureTargets));
  if(item.piece===0)item.barriers.push(panelRect(item,bit));
 }
 if(item.piece===0)obstaclesDirty=true;
}
function constructionAppearance(item,remaining){
 if(!remaining){item.group.scale.y=1;return}
 const built=1-remaining/item.material.buildTime;
 item.group.scale.y=.28+.72*clamp(built,0,1);
}
function place(){
 const plan=planStructure();
 if(guest){
  if(plan.reason){notice(plan.reason);return false}
  coopAction('place',{piece:state.piece,material:state.material,recipe:state.recipe,aim:packVector(aimPoint)});
  sound('build');return true;
 }
 if(plan.reason){notice(plan.reason);sound('empty');return false}
 const {type,x,y,z,angle,material,cost,key}=plan;
 const group=groupAt(scene,x,y,z);
 group.rotation.y=angle;
 const hp=type===3?145:material.hp;
 const calibration=plan.recipe?StormwatchCitadel.tune(profile.blueprints['trap/'+plan.recipe.id]):null;
 const item={...plan,group,type:'structure',piece:type,hp,max:hp,rank:1,trapIn:0,
  calibration,life:plan.recipe?Math.round(plan.recipe.charges*calibration.mag):null,
  construction:type===3?0:material.buildTime};
 rebuildStructure(item);
 constructionAppearance(item,item.construction);
 if(type===0)activeWalls.push(item);
 else if(type!==3)walkways.push(item);
 builds.set(key,item);fieldMetrics.builds++;
 if(type!==3)refreshSupport();
 hero.stacks=hero.stacks.map((n,i)=>n-cost[i]);
 addSparks(vec(x,y+.45,z),material?.color??0xf1bd87,11,2.7);
 sound('build');rumble(.11,55);
 return true;
}
function detachStructure(item,fall){
 if(!builds.delete(item.key))return;
 structureBatchDirty=true;item.group.visible=true;
 if(state.edit?.item===item){closeEditor(false);notice('Structure collapsed')}
 for(const target of item.targets)removeTarget(structureTargets,target);
 if(item.piece===0){
  removeTarget(activeWalls,item);obstaclesDirty=true;
 }else removeTarget(walkways,item);
 if(fall)collapsing.push({item,time:0,roll:item.x%3<0?-.72:.72});
 else scene.remove(item.group);
 addSparks(vec(item.x,item.y+.45,item.z),item.material?.color??0xf1bd87,13,3.2);
}
function refreshSupport(){
 const actual=[...builds.values()].filter(item=>item.piece!==3);
 supportedBuilds=engineering.supportIndex(actual);
 for(const item of actual){
  if(!supportedBuilds.supported.has(item))detachStructure(item,true);
 }
 for(const item of builds.values())if(item.piece===3&&
  (!builds.has(item.mount.key)||item.mount.mask!==engineering.fullMask(item.mount.piece)))detachStructure(item,true);
}
function removeStructure(item){
 detachStructure(item,true);
 if(item.piece!==3)refreshSupport();
}
function animateConstruction(dt){
 for(const item of builds.values()){
  if(item.construction<=0)continue;
  item.construction=Math.max(0,item.construction-dt);
  constructionAppearance(item,item.construction);
  physics?.update(item.targets);
  if(item.construction===0){
   structureBatchDirty=true;
   if(item.piece===0)obstaclesDirty=true;
  }
 }
 for(let i=collapsing.length-1;i>=0;i--){
  const collapse=collapsing[i],{item}=collapse;collapse.time+=dt;
  item.group.position.y=item.y-collapse.time**2*8;
  item.group.rotation.z=collapse.roll*collapse.time;
  if(collapse.time>.85){scene.remove(item.group);collapsing.splice(i,1)}
 }
}
function batchStructures(){
 if(!structureBatchDirty)return;
 structureBatchDirty=false;
 const groups=new Map();
 for(const item of builds.values()){
  if(item.construction>0||state.edit?.item===item)continue;
  item.group.updateWorldMatrix(true,true);
  for(const detail of item.group.children){
   if(!detail.isMesh)continue;
   const key=detail.geometry.uuid+'/'+detail.material.uuid;
   if(!groups.has(key))groups.set(key,{geometry:detail.geometry,material:detail.material,transforms:[]});
   groups.get(key).transforms.push(detail.matrixWorld);
  }
  item.group.visible=false;
 }
 for(const [key,batch] of structureBatches){
  if(groups.has(key))continue;
  scene.remove(batch);batch.dispose?.();structureBatches.delete(key);
 }
 for(const [key,group] of groups){
  const {geometry,material,transforms}=group;
  let batch=structureBatches.get(key);
  if(!batch||batch.instanceMatrix.count<transforms.length){
   if(batch){scene.remove(batch);batch.dispose?.()}
   const capacity=2**Math.ceil(Math.log2(transforms.length));
   batch=new T.InstancedMesh(geometry,material,capacity);
   batch.frustumCulled=false;batch.castShadow=true;batch.receiveShadow=true;
   structureBatches.set(key,batch);scene.add(batch);
  }
  transforms.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));
  batch.count=transforms.length;
  batch.instanceMatrix.needsUpdate=true;
 }
}

function segmentRect(x,z,dx,dz,r,padding=0){
 let start=0,end=1;
 for(const [pos,delta,center,half] of [[x,dx,r.x,r.hx+padding],[z,dz,r.z,r.hz+padding]]){
  if(Math.abs(delta)<.00001){
   if(Math.abs(pos-center)>half)return null;
   continue;
  }
  const a=(center-half-pos)/delta,b=(center+half-pos)/delta;
  start=Math.max(start,Math.min(a,b));end=Math.min(end,Math.max(a,b));
  if(start>end)return null;
 }
 return start;
}
function wallBetween(x,z,tx,tz,padding=.22,y=0){
 let first=null,near=Infinity;
 const dx=tx-x,dz=tz-z;
 for(const wall of activeWalls){
  if(wall.construction>0)continue;
  for(const panel of wall.barriers){
   if(y<panel.bottom-.01||y>=panel.top)continue;
   const t=segmentRect(x,z,dx,dz,panel,padding);
   if(t!==null&&t<near){first=wall;near=t}
  }
 }
 return first;
}
function circleBetween(x,z,tx,tz,p,radius){
 const dx=tx-x,dz=tz-z;
 const len=dx*dx+dz*dz;
 const dot=len?clamp(((p.x-x)*dx+(p.z-z)*dz)/len,0,1):0;
 return Math.hypot(x+dx*dot-p.x,z+dz*dot-p.z)<radius;
}
function coverAt(prop,x,z,r=.01){
 return prop.rect?rectDistance(x,z,prop.rect)<r:Math.hypot(x-prop.x,z-prop.z)<prop.r+r;
}
function coverAlong(prop,x,z,tx,tz,r){
 return prop.rect?segmentRect(x,z,tx-x,tz-z,prop.rect,r)!==null:circleBetween(x,z,tx,tz,prop,prop.r+r);
}
function playerBlocked(x,z,y){
 if(Math.abs(x)>BOUND-.35||Math.abs(z)>BOUND-.35)return true;
 for(const p of solidProps){
  if(p.alive&&y<p.top-.03&&coverAt(p,x,z,.28))return true;
 }
 return activeWalls.some(w=>w.construction<=0&&w.barriers.some(panel=>
  y+1.57>panel.bottom+.035&&y<panel.top-.04&&rectDistance(x,z,panel)<.29));
}
function floorAt(x,z,ceiling){
 let highest=terrainHeight(x,z);
 for(const item of walkways){
  const dx=x-item.x,dz=z-item.z;
  if(item.construction>0||Math.abs(dx)>GRID/2+.024||Math.abs(dz)>GRID/2+.024)continue;
  const c=Math.cos(item.angle),s=Math.sin(item.angle);
  const u=dx*c-dz*s,v=dx*s+dz*c,bit=engineering.bitAt(item.piece,u,v);
  if(!engineering.present(item.mask,bit))continue;
  const y=item.y+engineering.surfaceHeight(item.piece,u,v)+.135;
  if(y<=ceiling)highest=Math.max(highest,y);
 }
 return highest;
}

const NAV_STEP=GRID/2,NAV_SIZE=Math.round(2*BOUND/NAV_STEP);
const NAV_ORIGIN=-BOUND+NAV_STEP/2,NAV_COUNT=NAV_SIZE*NAV_SIZE;
const BREACH_COST=Math.round(3*GRID/NAV_STEP);
const navX=index=>index%NAV_SIZE*NAV_STEP+NAV_ORIGIN;
const navZ=index=>Math.floor(index/NAV_SIZE)*NAV_STEP+NAV_ORIGIN;
const navCell=(x,z)=>clamp(Math.round((x-NAV_ORIGIN)/NAV_STEP),0,NAV_SIZE-1)+
 clamp(Math.round((z-NAV_ORIGIN)/NAV_STEP),0,NAV_SIZE-1)*NAV_SIZE;
const distances=new Uint16Array(NAV_COUNT);
const navClosed=new Uint8Array(NAV_COUNT);
function neighbors(index){
 const ix=index%NAV_SIZE,row=Math.floor(index/NAV_SIZE),list=[];
 if(ix>0)list.push(index-1);
 if(ix<NAV_SIZE-1)list.push(index+1);
 if(row>0)list.push(index-NAV_SIZE);
 if(row<NAV_SIZE-1)list.push(index+NAV_SIZE);
 return list;
}
const navEdges=Array.from({length:NAV_COUNT},(_,i)=>neighbors(i));
function refreshRoutes(){
 obstaclesDirty=false;
 const cap=2000,buckets=Array.from({length:cap},()=>[]);
 distances.fill(cap);
 for(let i=0;i<NAV_COUNT;i++){
  const x=navX(i),z=navZ(i);
  navClosed[i]=solidProps.some(p=>p.alive&&coverAt(p,x,z,.39))?1:0;
  if(!navClosed[i]&&objectiveDistance(x,z)<3.7&&!wallBetween(x,z,ox,oz,.08)){
   distances[i]=0;buckets[0].push(i);
  }
 }
 if(!buckets[0].length){
  for(let i=0;i<NAV_COUNT;i++){
   if(objectiveDistance(navX(i),navZ(i))<3.7&&!navClosed[i]){distances[i]=0;buckets[0].push(i)}
  }
 }
 const propsForNav=solidProps.filter(p=>p.alive&&p!==atlasBody);
 for(let d=0;d<cap;d++){
  for(const here of buckets[d]){
   if(distances[here]!==d)continue;
   const hx=navX(here),hz=navZ(here);
   for(const next of navEdges[here]){
    if(navClosed[next]||distances[next]<=d+1)continue;
    const x=navX(next),z=navZ(next);
    if(propsForNav.some(p=>Math.abs(p.x-x)<p.r+3&&Math.abs(p.z-z)<p.r+3&&coverAlong(p,x,z,hx,hz,.33)))continue;
    const wall=wallBetween(x,z,hx,hz,.3);
    const cost=d+1+(wall?BREACH_COST:0);
    if(cost<distances[next]){distances[next]=cost;buckets[cost].push(next)}
   }
  }
 }
}
function enemyRoute(enemy){
 const {x,z}=enemy;
 const cell=navCell(x,z);
 let best=null,score=Infinity;
 const primary = navEdges[cell];
 const nearby = [cell,...primary,...primary.flatMap(n=>navEdges[n])];
 for(const i of nearby){
  const nx=navX(i),nz=navZ(i),length=Math.hypot(nx-x,nz-z);
  if(length<.25||length>5.4||distances[i]>=2000||distances[i]>=distances[cell])continue;
  if(solidProps.some(p=>p.alive&&coverAlong(p,x,z,nx,nz,enemy.r*.7)))continue;
  const wall=wallBetween(x,z,nx,nz,enemy.r*.72);
  const value=distances[i]+length*.55+(wall?BREACH_COST:0);
  if(value<score){score=value;best=[nx,nz]}
 }
 if(best)return best;
 if(navClosed[cell]||distances[cell]>=2000){
  for(const i of nearby){
   if(navClosed[i]||distances[i]>=2000)continue;
   const nx=navX(i),nz=navZ(i),length=Math.hypot(nx-x,nz-z);
   if(length<.23||solidProps.some(p=>p.alive&&coverAlong(p,x,z,nx,nz,enemy.r*.45)))continue;
   const value=length+distances[i]*.6;
   if(value<score){score=value;best=[nx,nz]}
  }
 }
 return best||[ox,oz];
}
function groundPos(){
 const f=-Math.sin(hero.yaw),g=-Math.cos(hero.yaw);
 return {f,g};
}
function moveHero(dt,pad){
 let side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+(pad?.side||0);
 let ahead=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+(pad?.ahead||0);
 const mag=Math.hypot(side,ahead);
 if(mag>1){side/=mag;ahead/=mag}
 const {f,g}=groundPos();
 hero.sprint=!!(keys.has('ShiftLeft')||keys.has('ShiftRight')||pad?.sprint)&&ahead>.2&&!hero.aim;
 const velocity=hero.sprint?8.4:hero.aim?3.2:5.65;
 const surge=hero.dash>0?hero.dashHeading:null,pace=hero.dashKind==='bull'?16.8:19.1;
 const hold=Math.exp(-dt*(hero.ground?17:6.5));
 const tx=surge?surge.x*pace:(f*ahead-g*side)*velocity,tz=surge?surge.z*pace:(g*ahead+f*side)*velocity;
 hero.vx=lerp(tx,hero.vx||0,surge?0:hold);hero.vz=lerp(tz,hero.vz||0,surge?0:hold);
 const dx=hero.vx*dt,dz=hero.vz*dt,pos=hero.pos;
 hero.strafe=lerp(side,hero.strafe||0,Math.exp(-dt*9));
 if(physics){
  hero.move=lerp(hero.move,Math.min(1,mag),Math.min(1,dt*12));
  hero.vy-=dt*18;
  const vertical=hero.vy*dt;
  const result=physics.move(pos,{x:dx,y:vertical,z:dz});
  pos.copy(result.next);hero.ground=result.grounded&&hero.vy<=0;
  if(hero.ground){
   if(hero.vy<-13&&squad.lead.className!=='Shadow')hurtHero(Math.min(65,(Math.abs(hero.vy)-12)**1.3*2.4));
   hero.extraJump=false;
  }
  if(hero.ground||(vertical>0&&result.delta.y<vertical*.66))hero.vy=0;
  return;
 }
 if(!playerBlocked(pos.x+dx,pos.z,pos.y))pos.x+=dx;
 if(!playerBlocked(pos.x,pos.z+dz,pos.y))pos.z+=dz;
 hero.move=lerp(hero.move,Math.min(1,mag),Math.min(1,dt*12));
 const before=pos.y;
 const step=hero.ground&&hero.vy<=0?.32:.022;
 const floor=floorAt(pos.x,pos.z,before+step);
 hero.vy-=dt*18;
 pos.y+=hero.vy*dt;
 if(hero.vy>0){
  for(const item of walkways){
   if(item.piece!==1||item.construction>0||item.y<LEVEL||Math.abs(pos.x-item.x)>GRID/2||Math.abs(pos.z-item.z)>GRID/2||
    !engineering.present(item.mask,engineering.bitAt(1,pos.x-item.x,pos.z-item.z)))continue;
   if(before+1.66<item.y&&pos.y+1.66>=item.y){pos.y=item.y-1.67;hero.vy=0}
  }
 }
 if(pos.y<=floor&&hero.vy<=0){pos.y=floor;hero.ground=true;hero.vy=0}
 else hero.ground=false;
}
function jump(){
 if(!hero.ground){
  if(squad.lead.className!=='Shadow'||hero.extraJump)return;
  hero.extraJump=true;hero.vy=6.9;return;
 }
 hero.ground=false;hero.vy=7.4;
}
const cameraOffset=vec(),cameraTarget=vec(),cameraBoom=vec(),cameraPivot=vec();
let boomFraction=1,kickEnergy=0,groundedLast=true,strideSound=0,ambient=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function viewKick(amount){if(!reduceMotion)kickEnergy=Math.min(.33,kickEnergy+amount)}
function fieldFeedback(dt){
 const moving=hero.move>.15&&hero.ground&&hero.hp>0;
 if(hero.ground&&!groundedLast){viewKick(.15);sound('land');addSparks(hero.pos,0xbaba92,7,1.55)}
 groundedLast=hero.ground;
 strideSound-=dt;
 if(moving&&strideSound<=0){strideSound=hero.sprint?.26:.39;sound('step')}
 if(ambient&&audio?.state==='running'){
  const near=clamp((stormDistance(hero.pos.x,hero.pos.z)-state.stormRadius+13)/13,0,1);
  ambient.gain.gain.setTargetAtTime(.006+.02*near+.009*Number(state.phase==='active'),audio.currentTime,.37);
  ambient.filter.frequency.setTargetAtTime(158+near*280,audio.currentTime,.32);
 }
 ui.cross.style.setProperty('--bloom',Math.round(hero.heat*5+hero.move*3)+'px');
}

function cameraTick(dt,brief=false){
 if(brief){
  const time=state.elapsed*.19;
  camera.position.set(-12.8+Math.sin(time)*1.3,5.1,18+Math.sin(time*.61)*1.8);
  camera.lookAt(-5.5,1.3,-5);
  camera.updateMatrixWorld();
  return;
 }
 const width=hero.aim?.64:.79,behind=hero.aim?2.1:2.76;
 const y=hero.yaw;
 cameraPivot.copy(hero.pos).add(cameraOffset.set(0,1.48,0));
 cameraBoom.set(Math.cos(y)*width+Math.sin(y)*behind,.46-hero.pitch*.54,-Math.sin(y)*width+Math.cos(y)*behind);
 let t=1;
 for(const prop of solidProps){
  if(!prop.alive||cameraPivot.y>prop.top)continue;
  const hit=segmentRect(cameraPivot.x,cameraPivot.z,cameraBoom.x,cameraBoom.z,prop.rect||{x:prop.x,z:prop.z,hx:prop.r*.84,hz:prop.r*.84},.12);
  if(hit!==null)t=Math.min(t,Math.max(.11,hit-.06));
 }
 for(const wall of activeWalls){
  if(cameraPivot.y<wall.y||cameraPivot.y>wall.y+LEVEL)continue;
  const hit=wall.barriers.reduce((near,panel)=>{
   if(cameraPivot.y<panel.bottom||cameraPivot.y>panel.top)return near;
   const fraction=segmentRect(cameraPivot.x,cameraPivot.z,cameraBoom.x,cameraBoom.z,panel,.17);
   return fraction===null?near:Math.min(near??1,fraction);
  },null);
  if(hit!==null)t=Math.min(t,Math.max(.08,hit-.07));
 }
 boomFraction=t<boomFraction||dt===0?t:lerp(boomFraction,t,Math.min(1,dt*11));
 camera.position.copy(cameraPivot).addScaledVector(cameraBoom,boomFraction);
 kickEnergy*=Math.exp(-dt*12);
 const bob=reduceMotion?0:Math.sin(hero.bob*2)*hero.move*.027;
 camera.position.y+=bob;
 const roll=reduceMotion?0:(hero.strafe||0)*-.019;
 camera.rotation.set(hero.pitch+kickEnergy*.11,y+Math.sin(state.elapsed*31)*kickEnergy*.025,roll);
 const baseFov=hero.aim?55:hero.dash>0?76:hero.sprint?70:64;
 const targetFov=window.SD_SPLIT?splitCameraFov(baseFov,camera.aspect):baseFov;
 camera.fov=lerp(camera.fov,targetFov,dt===0?1:Math.min(1,dt*11));
 camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
function notice(message){
 if(remoteSeat){sendGame('feedback',{line:message},remoteSeat.id);return}
 if(ui.toast.textContent!==message)ui.toast.textContent=message;
 ui.toast.hidden=false;state.toasted=3.1;
 if(!reduceMotion)ui.toast.animate([{opacity:.2,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:190,easing:'ease-out'});
}
function getAim(){
 ray.setFromCamera(screenVector,camera);
 aimDirection.copy(ray.ray.direction);
 ray.far=80;
 if(physics){
  const hit=physics.query(ray.ray.origin,aimDirection,72);
  aimed=hit?.object?hit:null;
  aimPoint.copy(hit?hit.point:ray.ray.at(65,cameraTarget));return;
 }
 const hits=ray.intersectObjects(shotProps.concat(structureTargets,enemyTargets),false);
 const floorT=ray.ray.direction.y<-.0001?-ray.ray.origin.y/ray.ray.direction.y:Infinity;
 aimed=hits.length&&hits[0].distance<=floorT?hits[0]:null;
 aimPoint.copy(aimed?aimed.point:ray.ray.at(Math.min(65,floorT),cameraTarget));
}
function shotFrom(muzzle,point){
 const bullet=vec().subVectors(point,muzzle);
 ray.far=bullet.length()+.24;
 ray.set(muzzle,bullet.normalize());
 if(physics)return physics.query(muzzle,bullet,ray.far);
 return ray.intersectObjects(shotProps.concat(structureTargets,enemyTargets),false)[0]||null;
}

const particleGeo=new T.IcosahedronGeometry(.095,0);
const particleMat=new T.MeshBasicMaterial({color:0xffffff});
const particleField=new T.InstancedMesh(particleGeo,particleMat,110);
particleField.instanceMatrix.setUsage(T.DynamicDrawUsage);particleField.count=0;particleField.frustumCulled=false;
scene.add(particleField);
const particlePose=new T.Object3D(),particleColor=new T.Color();
const particles=[];
function addSparks(pos,color,count,strength=3.8){
 for(let i=0;i<count;i++){
  if(particles.length>=110)particles.shift();
  particles.push({pos:pos.clone(),v:vec((rand()-.5)*strength,(.25+rand()*.68)*strength,(rand()-.5)*strength),
   color,time:.23+rand()*.3,r:.34+rand()*.98});
 }
}
function effect(object,duration,animate){
 scene.add(object);effects.push({object,duration,time:duration,animate});
}
function tracer(a,b,element){
 const color=gear?.tracer??elementColors[element]??0xffdc8e;
 const geometry=new T.BufferGeometry().setFromPoints([a,b]);
 if(!element||element==='Kinetic'){
  const material=new T.LineBasicMaterial({color,transparent:true,opacity:.88,blending:T.AdditiveBlending,depthWrite:false});
  effect(new T.Line(geometry,material),.085,t=>{material.opacity=t*.9});
  return;
 }
 geometry.setAttribute('distanceRatio',new T.Float32BufferAttribute([0,1],1));
 const material=new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{tint:{value:new T.Color(color)},phase:{value:1}},
  vertexShader:`attribute float distanceRatio;varying float along;
   void main(){along=distanceRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 tint;uniform float phase;varying float along;
   void main(){float gap=(along-(1.-phase))*.88;float head=exp(-gap*gap);gl_FragColor=vec4(tint*(1.+head*.42),phase*(.29+.69*head));}`
 });
 effect(new T.Line(geometry,material),.145,t=>{material.uniforms.phase.value=t});
}
function animateParticles(dt){
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i];p.time-=dt;
  if(p.time<=0){particles.splice(i,1);continue}
  p.v.y-=dt*11;p.pos.addScaledVector(p.v,dt);
 }
 for(let i=0;i<particles.length;i++){
  const {pos,color,r,time}=particles[i];
  particlePose.position.copy(pos);particlePose.scale.setScalar(r*Math.min(1,time*5));
  particlePose.updateMatrix();particleField.setMatrixAt(i,particlePose.matrix);
  particleField.setColorAt(i,particleColor.setHex(color));
 }
 particleField.count=particles.length;
 if(particles.length){
  particleField.instanceMatrix.needsUpdate=true;particleField.instanceColor.needsUpdate=true;
 }
 for(let i=effects.length-1;i>=0;i--){
  const item=effects[i];item.time-=dt;
  if(item.time>0)item.animate(item.time/item.duration);
  else{
   scene.remove(item.object);item.object.geometry.dispose();item.object.material.dispose();effects.splice(i,1);
  }
 }
}

const propSurfaceRay=new T.Raycaster();
const propProjection=vec(),propLook=vec();
const crackMaterial=new T.LineBasicMaterial({color:0x36252c,transparent:true,opacity:.83});
const glowCrack=new T.LineBasicMaterial({color:0xddad79,transparent:true,opacity:.5});
function actualSurface(prop,point){
 prop.group.updateWorldMatrix(true,true);
 propLook.copy(point).sub(camera.position).normalize();
 propSurfaceRay.set(camera.position,propLook);
 propSurfaceRay.far=camera.position.distanceTo(point)+3;
 const targets=prop.group.children.filter(part=>part.isMesh&&part.material.visible&&part.geometry!==shadowGeometry);
 return propSurfaceRay.intersectObjects(targets,false)[0]?.point?.clone();
}
function showWeakPoint(prop){
 if(!prop.weak){
  const n=prop.weakIndex;
  const offsets=[[.05,.78],[-.25,.43],[.33,.64],[-.04,.31],[.22,.48]];
  const [side,up]=offsets[n%offsets.length];
  const right=vec().setFromMatrixColumn(camera.matrixWorld,0);
  const target=vec(prop.x,prop.y+Math.max(.37,Math.min(prop.height*.77,up*(prop.kind===0?2.21:1.35))),prop.z)
   .addScaledVector(right,side*prop.r);
  const surface=actualSurface(prop,target)||target;
  surface.addScaledVector(propLook,-.044);
  prop.weak=prop.group.worldToLocal(surface);
 }
 const world=prop.group.localToWorld(propProjection.copy(prop.weak));
 propProjection.copy(world).project(camera);
 if(Math.abs(propProjection.x)>1||Math.abs(propProjection.y)>1||propProjection.z>1)return;
 weakMark.position.copy(prop.weak);prop.group.localToWorld(weakMark.position);
 weakMark.visible=true;
}
function watchWeakPoint(){
 weakMark.visible=false;
 const prop=aimed?.object.userData.entity;
 focusedProp=prop?.type==='prop'&&prop.alive&&aimed.distance<16?prop:null;
 if(!focusedProp||currentGun()||state.building)return;
 if(Math.hypot(hero.pos.x-prop.x,hero.pos.z-prop.z)>3.7+prop.r*.5)return;
 showWeakPoint(prop);
}
function isWeakHit(prop){
 if(!weakMark.visible||focusedProp!==prop||!prop.weak)return false;
 propProjection.copy(weakMark.position).project(camera);
 return Math.hypot(propProjection.x*innerWidth,propProjection.y*innerHeight)<42;
}
function splitTrace(prop,hit){
 const surface=actualSurface(prop,hit)||hit.clone();
 const inward=camera.position.clone().sub(surface).normalize();
 surface.addScaledVector(inward,.034);
 const right=vec().setFromMatrixColumn(camera.matrixWorld,0);
 const up=vec().setFromMatrixColumn(camera.matrixWorld,1);
 const radius=prop.kind===0?.14:prop.kind===1?.27:.22,segments=[],light=[];
 for(let i=0;i<4;i++){
  const sign=i%2===0?-1:1,v=(Math.floor(i/2)-.5)*1.5;
  const joint=surface.clone().addScaledVector(right,sign*radius*.76).addScaledVector(up,v*radius);
  const tip=joint.clone().addScaledVector(right,sign*radius*.63).addScaledVector(up,-v*radius*.51);
  segments.push(prop.group.worldToLocal(surface.clone()),prop.group.worldToLocal(joint.clone()),
   prop.group.worldToLocal(joint.clone()),prop.group.worldToLocal(tip));
  joint.addScaledVector(up,.021);
  light.push(prop.group.worldToLocal(surface.clone().addScaledVector(up,.014)),prop.group.worldToLocal(joint));
 }
 prop.group.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(segments),crackMaterial));
 prop.group.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(light),glowCrack));
}
function wobbleProps(dt){
 for(const prop of cracked){
  if(!prop.alive){cracked.delete(prop);continue}
  prop.shake=Math.max(0,prop.shake-dt);
  const t=1-prop.shake/.35,amplitude=prop.impact*(1-t)*Math.sin(t*16);
  prop.group.rotation.set(amplitude*.71,prop.yaw+amplitude*.21,-amplitude);
  if(!prop.shake)cracked.delete(prop);
 }
}
function breakPart(part,origin,power,scale=1){
 if(!part?.parent||!part.material.visible)return;
 if(fragments.length>=100){
  const old=fragments.shift();scene.remove(old.model);
 }
 part.updateWorldMatrix(true,false);
 const model=new T.Mesh(part.geometry,part.material);
 part.matrixWorld.decompose(model.position,model.quaternion,model.scale);
 model.scale.multiplyScalar(scale);
 model.castShadow=true;model.receiveShadow=true;
 const direction=vec(model.position.x-origin.x,0,model.position.z-origin.z);
 if(direction.lengthSq()<.02)direction.set(rand()-.5,0,rand()-.5);
 direction.normalize().multiplyScalar(power*(.45+rand()));
 direction.y=(.72+rand()*.7)*power;
 scene.add(model);
 fragments.push({model,v:direction,omega:vec((rand()-.5)*7,(rand()-.5)*7,(rand()-.5)*7),life:2.2+rand()*.9});
}
function animateDebris(dt){
 for(let i=fragments.length-1;i>=0;i--){
  const frag=fragments[i];
  frag.life-=dt;
  if(frag.life<=0){scene.remove(frag.model);fragments.splice(i,1);continue}
  const {model,v,omega}=frag;
  v.y-=dt*12;model.position.addScaledVector(v,dt);
  model.rotation.x+=omega.x*dt;model.rotation.y+=omega.y*dt;model.rotation.z+=omega.z*dt;
  const floor=Math.min(.47,.08+model.scale.y*.23);
  if(model.position.y<floor){
   model.position.y=floor;v.y=v.y<-.52?-v.y*.27:0;
   v.x*=.8;v.z*=.8;omega.multiplyScalar(.78);
  }
 }
 for(let i=fallen.length-1;i>=0;i--){
  const tree=fallen[i];tree.age+=dt;
  if(tree.age>3.2){stage.remove(tree.group);fallen.splice(i,1);continue}
  const t=clamp(tree.age/.85,0,1);
  tree.group.quaternion.setFromAxisAngle(tree.axis,1.46*t*t).multiply(tree.yaw);
  if(t===1&&!tree.landed){tree.landed=true;addSparks(tree.group.position.clone().addScaledVector(tree.heading,3.1),0xa18358,11,3)}
 }
}
function breakProp(prop,hit,replay=false){
 if(!replay)fieldMetrics.breaks++;
 prop.alive=false;
 if(prop.walls){for(const target of prop.extraHits||[])removeTarget(shotProps,target);for(const [wall,cover] of prop.walls){removeTarget(shotProps,wall);cover.alive=false}}else removeTarget(shotProps,prop.hitbox);
 obstaclesDirty=true;
 if(prop.kind===0){
  const heading=vec(prop.x-hero.pos.x,0,prop.z-hero.pos.z).normalize();
  fallen.push({group:prop.group,axis:vec(heading.z,0,-heading.x),yaw:prop.group.quaternion.clone(),heading,age:0,landed:false});
  prop.group.remove(prop.hitbox);
 }else{
  for(const part of prop.group.children){
   if(!part.isMesh||part.geometry===shadowGeometry||part===prop.hitbox)continue;
   breakPart(part,hit,prop.kind===1?2.6:3.4,part.scale.length()>2?.73:1);
  }
  stage.remove(prop.group);
 }
}
function damageProp(prop,amount,hit){
 if(!prop.alive)return;
 prop.hp=Math.max(0,prop.hp-amount);
 if(prop.hp>0){
  prop.shake=.35;prop.impact=amount>1?.12:.053;cracked.add(prop);
  splitTrace(prop,hit);
 }
 prop.weak=null;prop.weakIndex++;
 if(amount>1){
  const weak=amount>=4,extra=weak?2:1;
  if(prop.kind===0)collectPart('planks',extra);
  if(prop.kind===1){collectPart('powder',extra);if(weak)collectPart('quartz',1)}
  if(prop.kind===2){collectPart('parts',extra);if(weak)collectPart('gears',1)}
 }
 const reward=amount>1?6+(amount>=4?4:0):3,bonus=prop.hp<=0?[20,23,25][prop.kind]:0;
 hero.stacks[prop.kind]=Math.min(999,hero.stacks[prop.kind]+reward+bonus);
 const color=materials[prop.kind].color;
 addSparks(hit,color,prop.hp<=0?16:5,prop.hp<=0?4:2.7);
 sound('chip');
 if(prop.hp<=0){
  breakProp(prop,hit);
  }else{
  const part=prop.chippable.shift();
  if(part){
   breakPart(part,hit,amount>1?2.8:1.8);prop.group.remove(part);
  }
  const colorChip=mesh(scene,rock,mat(materials[prop.kind].frame),hit.x,hit.y,hit.z,.14,.15,.11,false);
  breakPart(colorChip,vec(hero.pos.x,0,hero.pos.z),2.4);scene.remove(colorChip);
 }
}
function hurtEnemy(enemy,amount,point,head=false){
 if(!enemy.active)return;
 enemy.hp-=amount;enemy.recoil=.22;
 addSparks(point,head?0xffd390:0xc98aff,head?9:5,3.6);
 state.hit=head?.17:.10;
 if(enemy.hp>0)return;
 enemy.active=false;fieldMetrics.kills++;fieldHollows.add(enemy.kind);
 if(enemy.kind==='boss')addSparks(vec(enemy.x,1.3,enemy.z),0xffcb88,26,7.2);
 else addSparks(vec(enemy.x,.98,enemy.z),0xc491ee,11,4.2);
 scene.remove(enemy.root);
 removeTarget(enemyTargets,enemy.body);removeTarget(enemyTargets,enemy.skull);
 if(enemy.canister)removeTarget(enemyTargets,enemy.canister);
 if(enemy.spirit)enemy.spirit.material.dispose();
 state.takedowns++;
 if(enemy.kind==='boss'){collectPart('cells',4);collectPart('charge',7)}
 else if(state.takedowns%4===0)collectPart('charge',1);
 if(state.takedowns%3===0||enemy.kind==='boss')restock(15);
}
function reload(){
 const gun=currentGun();
 if(state.building||!gun||gun===hero.tempGun||hero.reload>0||gun.mag===gun.stats.m||gun.reserve===0)return;
 hero.reload=gun.stats.rl;sound('build');
}
function dropSupplies(){
 if(guest){coopAction('drop-stock');return}
 if(hero.stacks.some(n=>n<10)){notice('Bundle needs 10 of each building material');return}
 const spot=safeFieldPoint(hero.pos.x+2.8*Math.sin(hero.yaw),hero.pos.z+2.8*Math.cos(hero.yaw),.5);
 if(!spot||loot.some(item=>item.active&&item.kind==='bundle'&&Math.hypot(item.x-spot.x,item.z-spot.z)<2))return;
 hero.stacks=hero.stacks.map(n=>n-10);addCache(spot.x,spot.z,'bundle');
}
function craftAmmo(){
 if(guest){coopAction('craft');return}
 if(hero.stacks[1]<6||hero.stacks[2]<4){notice('Ammo: 6 Stone + 4 Metal');return}
 if(guns.every(gun=>gun.reserve>=360)){notice('Reserve is full');return}
 hero.stacks[1]-=6;hero.stacks[2]-=4;restock(60);
 sound('pickup');
}
function switchWeapon(index=(hero.weapon+1)%(guns.length+1)){
 if(hero.tempGun){
  hero.tempGun.model.parent?.remove(hero.tempGun.model);hero.tempGun=null;hero.rotary=0;
 }
 if(index<0||index>guns.length)return;
 if(state.building)toggleBuilding();
 hero.weapon=index;hero.reload=0;hero.anim=0;hero.shot=.12;hero.emote=0;hero.swingTime=0;
}
function playEmote(){
 if(gear&&hero.ground&&!state.building){hero.emote=gear.emoteLength;hero.reload=0;hero.swingTime=0}
}
function swing(){
 hero.shot=SWING_DURATION;hero.swingTime=.001;
}
function advancePickaxe(dt){
 if(!hero.swingTime)return;
 const before=hero.swingTime;
 hero.swingTime+=dt;
 if(before<.15&&hero.swingTime>=.15)sound('swing');
 if(before<SWING_CONTACT&&hero.swingTime>=SWING_CONTACT)axeImpact();
 if(hero.swingTime>=SWING_DURATION)hero.swingTime=0;
}
function axeImpact(){
 const origin=vec(hero.pos.x,hero.pos.y+1.16,hero.pos.z);
 const aimedNest=aimed?.object.userData.entity;
 if(aimedNest?.walls&&aimedNest.alive&&origin.distanceTo(aimed.point)<3.25){
  if(guest)coopAction('fire',{axe:true,aim:packVector(aimed.point)});else damageProp(aimedNest,2,aimed.point);
  return;
 }
 if(aimedNest?.type==='nest'&&origin.distanceTo(aimed.point)<3.25){
  if(guest)coopAction('fire',{axe:true,aim:packVector(aimed.point)});
  else hurtNest(aimedNest,67,aimed.point);return;
 }
 const {f,g}=groundPos();
 const candidates=[];
 for(const target of [...props,...enemies]){
  if((target.type==='prop'&&!target.alive)||(target.type==='enemy'&&!target.active))continue;
  const dx=target.x-origin.x,dz=target.z-origin.z,length=Math.hypot(dx,dz);
  if(length>2.85+(target.r||0)*.6||length<.01||(dx*f+dz*g)/length<.45||origin.y>terrainHeight(origin.x,origin.z)+3.2)continue;
  if(target.type==='prop'&&origin.y>target.top+.95)continue;
  if(wallBetween(origin.x,origin.z,target.x,target.z,.02,origin.y))continue;
  const point=vec(target.x,target.type==='prop'?Math.min(origin.y,target.top-.16):terrainHeight(target.x,target.z)+1.04,target.z);
  const score=length-(aimed?.object.userData.entity===target?1.1:0);
  candidates.push({target,point,score});
 }
 candidates.sort((a,b)=>a.score-b.score);
 if(!candidates.length)return;
 const {target,point}=candidates[0];
 viewKick(.19);
 if(guest){coopAction('fire',{axe:true,aim:packVector(point)});return}
 if(target.type==='prop'){
  const weak=isWeakHit(target),impact=weak?weakMark.position.clone():aimed?.object.userData.entity===target?aimed.point:point;
  damageProp(target,weak?4:2,impact);
  if(weak){state.hit=.23;sound('hit')}
 }
 else {hurtEnemy(target,67,point);sound('hit')}
 rumble(.19,62);
}
const shotRight=vec(),shotUp=vec();
function attack(){
 if(hero.shot>0||hero.emote>0)return;
 const gun=currentGun();
 if(!gun){swing();return}
 if(hero.reload>0)return;
 if(gun.mag<=0){
  reload();
  if(hero.reload===0){notice('Out of ammo');sound('empty','Out of ammo');hero.shot=.36}
  return;
 }
 const {r,pel,sp,d}=gun.stats;
 gun.mag--;hero.heat=Math.min(1,hero.heat+.13);hero.shot=Math.max(.058,r*(hero.shout>0?.76:1));hero.flash=.045;hero.anim=.53;
 const muzzle=(gun.muzzle||actor.muzzle).getWorldPosition(vec());
 const direction=groundPos();
 const origin=vec(hero.pos.x+direction.f*.24,hero.pos.y+1.42,hero.pos.z+direction.g*.24);
 viewKick(.09+(gun.stats.pel||1)*.016);
 if(guest){
  coopAction('fire',{aim:packVector(aimPoint),muzzle:packVector(muzzle),damage:d*Math.min(3,(pel||1))*1.24,element:gun.element});
  tracer(muzzle,aimPoint,gun.element);sound('rifle');rumble(.13,42);return;
 }
 if(coop)sendGame('trace',{from:packVector(muzzle),to:packVector(aimPoint),owner:coop.id,element:gun.element});
 const range=origin.distanceTo(aimPoint),spread=(sp||0)*(hero.aim?.57:1);
 shotRight.setFromMatrixColumn(camera.matrixWorld,0);
 shotUp.setFromMatrixColumn(camera.matrixWorld,1);
 const impacts=new Map();
 for(let i=0;i<(pel||1);i++){
  const point=aimPoint.clone();
  if(i>0||range>20){
   point.addScaledVector(shotRight,(rand()-.5)*range*spread);
   point.addScaledVector(shotUp,(rand()-.5)*range*spread);
  }
  const impact=shotFrom(origin,point),end=impact?.point||point;
  if(i<3)tracer(muzzle,end,gun.element);
  const target=impact?.object?.userData.entity;
  if(!target)continue;
  if(!impacts.has(target))impacts.set(target,{damage:0,head:false,canister:false,end});
  const entry=impacts.get(target),critical=!!impact.object.userData.head;
  const falloff=Math.max(.56,1-impact.distance/(pel>1?54:160));
  const power=target.type==='enemy'?clamp(1+(gun.power-target.power)*.019,.66,1.63):1;
  const crit=rand()<gun.blueprint.crit;
  const core=gun.blueprint.core==='Sustained Fire'?1+.22*hero.heat:1;
  entry.damage+=d*1.28*(critical?1.64:1)*(crit?gun.blueprint.critMulti:1)*falloff*power*core*(hero.shout>0?1.19:1);entry.head||=critical;
  entry.canister||=impact.object.userData.canister;
 }
 for(const [target,{damage,head,canister,end}] of impacts){
  if(target.type==='enemy'){
   if(canister&&target.kind==='demolisher'){detonateHollow(target);continue}
   const dealt=damage*engineering.damageFactor(gun.element,target.element);
   hurtEnemy(target,dealt,end,head);sound('hit');
   if(gun.blueprint.core==='Affliction'&&target.active)
    target.affliction={amount:dealt*.19,element:gun.element,remaining:2.4,next:.6};
   if(gun.blueprint.core==='Headshot Burst'&&head&&!target.active)
    abilityBlast(end,44,2.1,gun.element);
  }
  else if(target.type==='prop')damageProp(target,1,end);
  else if(target.type==='nest')hurtNest(target,damage,end);
  else addSparks(end,0xffd08e,4,2.2);
 }
 sound('rifle');rumble(.13,42);
}
function canEditHere(item,mask){
 if(item.piece!==0)return true;
 const playerOccupies=panel=>hero.pos.y+1.65>panel.bottom&&hero.pos.y<panel.top&&rectDistance(hero.pos.x,hero.pos.z,panel)<.31;
 for(let bit=0;bit<9;bit++){
  if(!engineering.present(mask^item.mask,bit)||!engineering.present(mask,bit))continue;
  const panel=panelRect(item,bit);
  if(playerOccupies(panel)||enemies.some(e=>e.active&&panel.bottom<terrainHeight(e.x,e.z)+1.5&&rectDistance(e.x,e.z,panel)<e.r))return false;
 }
 return true;
}
function renderEdit(){
 const edit=state.edit;if(!edit)return;
 const {item,mask}=edit;
 const valid=engineering.connectedMask(item.piece,mask),clear=valid&&canEditHere(item,mask);
 ui['edit-apply'].disabled=!clear||mask===item.mask;
 for(const cell of ui['edit-grid'].children)cell.setAttribute('aria-pressed',String(engineering.present(mask,+cell.dataset.bit)));
 text(ui['edit-status'],!valid?'Keep a connected surface':!clear?'Edit is obstructed':'');
 clearGhost(editGhost);
 if(mask)panels(editGhost,{piece:item.piece,mask,rank:item.rank},true);
 ghostSkin.color.setHex(clear?0x5dbeff:0xf38282);
 ghostOutline.color.setHex(clear?0x9cdeff:0xffa49b);
 editGhost.position.copy(item.group.position);editGhost.rotation.copy(item.group.rotation);editGhost.visible=true;
}
function openEditor(){
 const item=aimed?.object.userData.entity;
 if(state.edit||state.paused||item?.type!=='structure'||item.piece===3||item.construction>0||aimed.distance>13){
  notice('Aim at a completed structure');return;
 }
 const n=engineering.dimensions(item.piece);
 state.edit={item,mask:item.mask,paint:null};
 state.mouse=false;mouseFire=mouseAim=mouseLook=false;hero.reload=0;hero.swingTime=0;
 keys.clear();if(document.pointerLockElement===canvas)document.exitPointerLock();
 ui.edit.hidden=false;text(ui['edit-name'],'Edit '+pieces[item.piece]);
 const grid=ui['edit-grid'];
 grid.style.setProperty('--count',n);
 grid.replaceChildren();
 for(let row=n-1;row>=0;row--)for(let col=0;col<n;col++){
  const cell=document.createElement('button'),bit=row*n+col;
  cell.type='button';cell.dataset.bit=bit;
  cell.setAttribute('aria-label','Panel '+(bit+1));
  cell.onclick=event=>{if(event.detail===0)togglePanel(bit)};
  grid.append(cell);
 }
 item.group.visible=false;
 structureBatchDirty=true;
 renderEdit();
 grid.firstElementChild.focus({preventScroll:true});
}
function closeEditor(lock){
 if(!state.edit)return;
 const item=state.edit.item;state.edit=null;
 item.group.visible=true;
 structureBatchDirty=true;
 editGhost.visible=false;clearGhost(editGhost);
 ui.edit.hidden=true;
 if(lock)requestMouse();
 else canvas.focus({preventScroll:true});
}
function togglePanel(bit,placePanel){
 if(!state.edit)return;
 const change=1<<bit,mask=state.edit.mask;
 state.edit.mask=placePanel===undefined?mask^change:placePanel?mask|change:mask&~change;
 renderEdit();
}
function applyEdit(lock){
 const edit=state.edit;
 if(!edit||ui['edit-apply'].disabled||!canEditHere(edit.item,edit.mask))return;
 const {item,mask}=edit;
 if(guest){coopAction('edit',{key:item.key,mask});closeEditor(lock);return}
 item.mask=mask;item.contacts=engineering.contacts(item);
 closeEditor(lock);
 rebuildStructure(item);refreshSupport();sound('build');
}
ui['edit-reset'].onclick=()=>{
 if(!state.edit)return;
 state.edit.mask=engineering.fullMask(state.edit.item.piece);renderEdit();
};
ui['edit-cancel'].onclick=()=>closeEditor(state.look==='keys');
ui['edit-apply'].onclick=()=>applyEdit(state.look==='keys');
listen(ui['edit-grid'],'pointerdown',event=>{
 const bit=event.target.dataset.bit;
 if(!state.edit||bit===undefined||event.button!==0)return;
 state.edit.paint=!engineering.present(state.edit.mask,+bit);togglePanel(+bit,state.edit.paint);
});
listen(ui['edit-grid'],'pointerover',event=>{
 const bit=event.target.dataset.bit;
 if(state.edit&&event.buttons&1&&bit!==undefined&&state.edit.paint!==null)togglePanel(+bit,state.edit.paint);
});
listen(window,'pointerup',()=>{if(state.edit)state.edit.paint=null});
function editPad(edge){
 const list=[...ui['edit-grid'].children,...ui['edit-actions'].querySelectorAll('button:not(:disabled)')];
 let index=list.indexOf(fieldFocus());
 const move=edge(14)?-1:edge(15)?1:edge(12)?-engineering.dimensions(state.edit.item.piece):edge(13)?engineering.dimensions(state.edit.item.piece):0;
 if(move)list[(index+move+list.length)%list.length]?.focus({preventScroll:true});
 if(edge(padFamily==='ns'?1:0)){
  const active=fieldFocus();
  if(active?.dataset.bit!==undefined)togglePanel(+active.dataset.bit);
  else if(active===ui['edit-apply'])applyEdit(false);
  else active?.click();
 }
 if(edge(padFamily==='ns'?0:1)||edge(11))closeEditor(false);
 if(edge(2))applyEdit(false);
}
function fortify(){
 if(guest){coopAction('repair',{aim:packVector(aimPoint)});return}
 const item=aimed?.object.userData.entity;
 if(item?.type==='atlas'&&objectiveDistance(hero.pos.x,hero.pos.z)<8.5&&['prep','fuel','payload'].includes(state.phase)){
  const max=state.mission==='payload'?PAYLOAD_HP:ATLAS_HP;
  if(state.atlas===max){notice('Integrity is full');return}
  if(!hero.repairs||hero.stacks[2]<12){notice(hero.repairs?'Repair needs 12 Alloy':'Repair kits used');return}
  hero.repairs--;hero.stacks[2]-=12;state.atlas=Math.min(max,state.atlas+215);
  sound('build');return;
 }
 if(item?.type!=='structure'||aimed.distance>12||item.construction>0){notice('Aim at a completed structure');return}
 if(item.piece===3&&item.life<Math.round(item.recipe.charges*item.calibration.mag)){
  if(hero.stacks[2]<4){notice('Trap refill needs 4 Alloy');return}
  hero.stacks[2]-=4;item.life=Math.min(Math.round(item.recipe.charges*item.calibration.mag),item.life+4);
  sound('build');return;
 }
 const index=materials.indexOf(item.material);
 const upgrade=item.hp>=item.max&&item.piece!==3&&item.rank<3;
 if(item.hp>=item.max&&!upgrade){notice('Already at full strength');return}
 const rate=[.041,.029,.020][item.rank-1];
 const cost=upgrade?8+item.rank*4:Math.max(1,Math.ceil((item.max-item.hp)*rate));
 if(hero.stacks[index]<cost){notice('Need '+cost+' '+item.material.name);return}
 hero.stacks[index]-=cost;
 if(upgrade){
  item.rank++;item.max=Math.round(item.material.hp*[1,1.5,2.15][item.rank-1]);
  rebuildStructure(item);
 }
 item.hp=item.max;
 sound('build');
}
const abilityTables={
 Vanguard:[['Cluster Grenade',17],['Rotary Minigun',32],['Battle Shout',26],['Concussion Blast',24]],
 Architect:[['Aegis Core',28],['Bull Charge',15],['Holodecoy',22],['Plasma Surge',23]],
 Shadow:[['Void Slash',12],['Shuriken Fan',11],['Smoke Veil',25],['Crescent Kick',15]],
 Prospector:[['Seismic Punch',12],['Phase Blink',9],['A.U.T.O. Turret',26],['Shock Tower',22]]
};
const gadgets=[];
const abilityCooldown=[0,0,0,0];
const dashHits=new Set();
const selectedAbility=()=>abilityTables[squad.lead.className][state.ability];
let aegisTiles=new Set();
const operativeForward=()=>vec(-Math.sin(hero.yaw),0,-Math.cos(hero.yaw));
function labelledAbility(index){
 return abilityTables[squad.lead.className][index];
}
function useAbility(index=state.ability){
 if(state.paused||state.edit||state.building)return;
 state.ability=index;
 const [,seconds]=labelledAbility(index);
 if(abilityCooldown[index]>0)return;
 const klass=squad.lead.className;
 const local=klass==='Vanguard'&&(index===1||index===2)||klass==='Architect'&&index===1||klass==='Shadow'&&index===0||klass==='Prospector'&&index===1;
 const moved=guest&&!local?true:performAbility(klass,index);
 if(moved&&guest&&!local){coopAction('ability',{klass,index,aim:packVector(aimPoint)});return}
 if(!moved)return;
 abilityCooldown[index]=seconds;
 sound('pulse');rumble(.48,110);
}
function unitCandidates(origin,range){
 return enemies.filter(enemy=>enemy.active&&origin.distanceToSquared(enemyPoint(enemy,.45))<range*range)
  .sort((a,b)=>origin.distanceToSquared(enemyPoint(a,.45))-origin.distanceToSquared(enemyPoint(b,.45)));
}
function chainAt(origin,targets,force,element){
 for(const enemy of targets){
  if(!enemy.active)continue;
  const point=enemyPoint(enemy,1);
  trapLine(origin,point,elementColors[element]);
  trapDamage(enemy,force,element);
  origin=point;
 }
}
function compactGadget(kind,position,seconds){
 const group=groupAt(scene,position.x,position.y,position.z);
 const tint={aegis:0x80dbc5,decoy:0x97e0e6,turret:0xe9ba8c,tower:0x8acded,smoke:0xa28bc7}[kind];
 const light=mat(tint,tint),base=mat(0x324956);
 if(kind==='decoy'){
  mesh(group,sphere,light,0,1.44,0,.21,.24,.21);
  block(group,light,0,1.04,0,.45,.56,.23);
  for(const side of [-1,1]){
   block(group,light,side*.31,1.06,0,.101,.46,.12);
   block(group,light,side*.14,.43,0,.16,.69,.18);
  }
 }else if(kind!=='smoke'){
  mesh(group,hex,base,0,.14,0,.57,.20,.57);
  mesh(group,cyl,base,0,.42,0,.23,.46,.23);
  if(kind==='turret'){
   for(const x of [-.23,.23]){
    block(group,base,x,.7,.03,.29,.30,.76);
    block(group,light,x,.7,.45,.09,.12,.24);
   }
  }else mesh(group,gem,light,0,.78,0,.22,.32,.22,false);
 }
 const halo=glow(group,tint,0,kind==='smoke'?.65:.66,0,kind==='smoke'?5.1:2.1,kind==='smoke'?3.2:2.1,.54);
 const gadget={kind,group,halo,x:position.x,y:position.y,z:position.z,hp:215,seconds,next:0};
 gadgets.push(gadget);
 return gadget;
}
function projectGadget(distance){
 const start=hero.pos.clone(),forward=operativeForward();
 let reach=0;
 for(let t=.30;t<=distance;t+=.25){
  const x=start.x+forward.x*t,z=start.z+forward.z*t,y=Math.max(start.y,terrainHeight(x,z));
  if(playerBlocked(x,z,y))break;
  reach=t;
 }
 if(reach<.8)return null;
 const point=start.addScaledVector(forward,reach);
 point.y=floorAt(point.x,point.z,point.y+.34);
 return point;
}
function primeDash(mode){
 if(hero.dash>0)return false;
 hero.dash=mode==='bull'?.68:.55;hero.dashKind=mode;
 hero.dashHeading=operativeForward();dashHits.clear();
 return true;
}
function summonRotary(){
 if(hero.rotary>0)return false;
 const model=groupAt(gear?.model||actor.root);
 const body=mat(0x3b4b55,0,.32),metal=mat(0x71808c,0,.38),amber=mat(0xe1ae68,0xc68241);
 block(model,body,0,-.05,.3,.38,.31,.83);
 mesh(model,cyl,metal,0,-.07,.73,.174,.24,.174).rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){
  const angle=i*Math.PI/3;
  const barrel=mesh(model,cyl,metal,Math.cos(angle)*.095,Math.sin(angle)*.095-.07,1.0,.036,.61,.036);
  barrel.rotation.x=Math.PI/2;
 }
 block(model,amber,.201,-.043,.33,.022,.085,.22,false);
 const muzzle=groupAt(model,0,-.07,1.34);
 model.userData.a={r:[0,-.15,.01],l:[0,-.092,.5],m:[0,-.14,.31]};
 model.userData.fit={s:.72,gz:.22,mz:1.34};model.userData.mags=[];
 const stats={d:24,m:125,au:1,r:.052,rl:1.8,pel:1,sp:.037};
 hero.tempGun=armWeapon({k:'rotary',model,muzzle,name:'Rotary Minigun',stats},Math.max(17,squad.power),'Kinetic');
 hero.rotary=9;hero.reload=0;hero.shot=0;hero.swingTime=0;return true;
}
function performAbility(name,index){
 const forward=operativeForward(),center=hero.pos.clone().add(vec(0,.57,0));
 if(name==='Vanguard'){
  if(index===0){
   const velocity=forward.multiplyScalar(11.4);velocity.y=6.4;
   trapProjectile('cluster',center.clone().add(vec(0,.66,0)),velocity,.19,1.05,76,'Scorch');
  }else if(index===1)return summonRotary();
  else if(index===2){
   hero.shout=9;
   addSparks(center,0xf9ce89,33,5.7);
  }else{
   pulse(true);
   for(const e of unitCandidates(center,7.8)){
    const dx=e.x-center.x,dz=e.z-center.z,length=Math.hypot(dx,dz)||1;
    knockHollow(e,dx/length,dz/length,91,1.05);
   }
  }
  return true;
 }
 if(name==='Architect'){
  if(index===0){
   const item=aimed?.object.userData.entity;
   if(item?.type!=='structure'||item.piece===3||item.construction>0||aimed.distance>12){
    notice('Aim at a friendly structure');return false;
   }
   const core=compactGadget('aegis',vec(item.x,item.y+.3,item.z),14);
   core.mount=item;
  }else if(index===1)return primeDash('bull');
  else if(index===2){
   const point=projectGadget(5);
   if(!point)return false;
   compactGadget('decoy',point,12);
  }else chainAt(center,unitCandidates(center,9.5).slice(0,5),96,'Volt');
  return true;
 }
 if(name==='Shadow'){
  if(index===0)return primeDash('void');
  if(index===1){
   const angle=hero.yaw;
   for(let i=-2;i<=2;i++){
    const turn=angle+i*.138;
    trapProjectile('dart',center.clone().add(vec(0,.56,0)),vec(-Math.sin(turn)*22,0,-Math.cos(turn)*22),.13,.52,55,'Aether');
   }
  }else if(index===2){
   const cloud=compactGadget('smoke',hero.pos.clone(),8.4);
   cloud.next=.12;
  }else for(const e of unitCandidates(center,3.35)){
   const vector=vec(e.x-center.x,0,e.z-center.z).normalize();
   if(vector.dot(forward)<-.1)continue;
   trapDamage(e,103,'Kinetic');knockHollow(e,vector.x,vector.z,92,1.1);
  }
  return true;
 }
 if(index===0){
  const targets=props.filter(prop=>prop.alive&&Math.hypot(prop.x-center.x,prop.z-center.z)<4.25&&
   vec(prop.x-center.x,0,prop.z-center.z).normalize().dot(forward)>.06&&
   !wallBetween(center.x,center.z,prop.x,prop.z,.05,center.y));
  if(!targets.length){notice('Aim toward harvestable terrain');return false}
  for(const prop of targets)damageProp(prop,Math.max(prop.max,4),vec(prop.x,Math.min(prop.top,prop.y+.75),prop.z));
 }else if(index===1){
  const point=projectGadget(6.5);
  if(!point)return false;
  addSparks(center,0xc0a0f3,15,3.3);hero.pos.copy(point);hero.vy=0;cameraTick(0);
 }else{
  if(index===2&&!fieldBag.charge){notice('Need a Charge Fragment');return false}
  const point=projectGadget(index===2?4.4:3.6);
  if(!point)return false;
  if(index===2)fieldBag.charge--;
  const gadget=compactGadget(index===2?'turret':'tower',point,index===2?16:7.2);
  gadget.next=.22;
 }
 return true;
}
function updateGadgets(dt){
 for(let i=0;i<abilityCooldown.length;i++)abilityCooldown[i]=Math.max(0,abilityCooldown[i]-dt);
 aegisTiles=new Set();
 if(hero.rotary>0){
  hero.rotary=Math.max(0,hero.rotary-dt);
  if(!hero.rotary||hero.tempGun.mag<=0){
   hero.rotary=0;
   const gun=hero.tempGun;
   gun.model.parent?.remove(gun.model);
   hero.tempGun=null;
  }
 }
 for(let i=gadgets.length-1;i>=0;i--){
  const gadget=gadgets[i];
  gadget.seconds-=dt;gadget.next-=dt;
  if(gadget.seconds<=0||gadget.hp<=0||gadget.mount&&!builds.has(gadget.mount.key)){
   scene.remove(gadget.group);gadget.halo.material.dispose();gadgets.splice(i,1);continue;
  }
  const at=vec(gadget.x,gadget.y+(gadget.kind==='turret'?.7:.46),gadget.z);
  if(gadget.kind==='aegis'){
   const pending=[gadget.mount],component=new Set(pending);
   for(let k=0;k<pending.length;k++)for(const item of supportedBuilds.neighbors.get(pending[k])||[]){
    if(!builds.has(item.key)||component.has(item))continue;
    component.add(item);pending.push(item);
   }
   for(const item of component){
    aegisTiles.add(item);
    if(gadget.next<=0)item.hp=Math.min(item.max,item.hp+7+squad.vital.Aptitude*.07);
   }
   if(gadget.next<=0)gadget.next=1;
  }else if(gadget.next<=0&&gadget.kind==='turret'){
   const target=unitCandidates(at,12).find(e=>!wallBetween(at.x,at.z,e.x,e.z,.035,at.y)&&
    !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,at.x,at.z,e.x,e.z,.04)));
   if(!target)continue;
   gadget.next=.28;
   gadget.group.rotation.y=Math.atan2(target.x-at.x,target.z-at.z);
   const end=enemyPoint(target,.91);
   for(const side of [-1,1]){
    const port=vec(side*.23,.70,.54).applyAxisAngle(vec(0,1,0),gadget.group.rotation.y).add(gadget.group.position);
    trapLine(port,end,0xf6c68e);
   }
   trapDamage(target,38,'Kinetic');
  }else if(gadget.next<=0&&gadget.kind==='tower'){
   gadget.next=1.45;
   const targets=unitCandidates(at,5.7);
   chainAt(at,targets,62,'Volt');
   for(const target of targets)target.stun=Math.max(target.stun,.96);
  }else if(gadget.next<=0&&gadget.kind==='smoke'){
   gadget.next=.65;
   abilityBlast(at,35,3.75,'Aether');
  }
 }
}
function afterDash(dt){
 if(hero.dash<=0)return;
 for(const enemy of unitCandidates(hero.pos.clone().add(vec(0,.70,0)),1.88)){
  if(dashHits.has(enemy))continue;
  dashHits.add(enemy);
  if(guest){coopAction('dashHit',{enemy:enemy.netId,kind:hero.dashKind});continue}
  trapDamage(enemy,hero.dashKind==='bull'?61:122,hero.dashKind==='bull'?'Kinetic':'Aether');
  knockHollow(enemy,hero.dashHeading.x,hero.dashHeading.z,93,.70);
 }
 hero.dash=Math.max(0,hero.dash-dt);
}
function pulse(ability=false){
 if(!ability&&hero.pulse>0){notice('Shock pulse recharges in '+Math.ceil(hero.pulse)+' s');return}
 if(!ability)hero.pulse=24;
 const y=hero.pos.y+.105;
 const mat=new T.MeshBasicMaterial({color:0x78eee1,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});
 const wave=new T.Mesh(new T.RingGeometry(.86,1,48),mat);
 wave.position.set(hero.pos.x,y,hero.pos.z);wave.rotation.x=-Math.PI/2;
 effect(wave,.48,t=>{wave.scale.setScalar(.8+(1-t)*7.8);mat.opacity=t*.85});
 for(const enemy of enemies){
  if(!enemy.active||Math.hypot(hero.pos.x-enemy.x,hero.pos.z-enemy.z)>7.8||hero.pos.y>=3.8)continue;
  enemy.stun=enemy.kind==='boss'?.8:2.35;
  hurtEnemy(enemy,enemy.kind==='boss'?63:92,vec(enemy.x,1,enemy.z));
 }
 sound('pulse');rumble(.66,225);
}

function hurtHero(amount){
 if(state.finished||guest||hero.hp<=0)return;
 const shield=Math.min(hero.shield,amount);
 hero.shield-=shield;hero.hp=Math.max(0,hero.hp-(amount-shield));hero.hitAgo=0;
 if(!remoteSeat){state.damage=.7;sound('hurt');rumble(.49,110);viewKick(.22)}
 if(hero.hp<=0){
  if(!coop){finish(false,'You were downed');return}
  if(remoteSeat){remoteSeat.down=true;remoteSeat.updateLabel(true);sendGame('feedback',{line:'Down · Wait for a squadmate'},remoteSeat.id)}
  else notice('Down · Wait for a squadmate');
 }
}
function hurtAtlas(amount){
 if(!atlasBody.alive||state.finished)return;
 state.atlas=Math.max(0,state.atlas-amount);
 if(state.atlas===0)finish(false,state.mission==='payload'?'The recovery pod was lost':state.mission==='seal'?'The Rift Anchor failed':'The Signal Relay went offline');
}
function hurtStructure(item,amount,attacker=null){
 if(aegisTiles.has(item)){
  if(attacker?.active)hurtEnemy(attacker,amount*.24,enemyPoint(attacker,.48));
  amount*=.68;
 }
 item.hp=Math.max(0,item.hp-amount);
 addSparks(vec(item.x,item.y+.8,item.z),item.material.color,3,2);
 if(item.hp===0)removeStructure(item);
}
function blast(origin,force,radius,element,source=null){
 addSparks(origin,elementColors[element],36,9.1);
 sound('pulse');rumble(.54,135);
 for(const item of [...builds.values()]){
  const d=origin.distanceTo(vec(item.x,item.y+(item.piece===0?LEVEL*.45:0),item.z));
  if(d<radius&&builds.has(item.key))hurtStructure(item,force*(1-d/radius)*engineering.structureFactor(element,item.material.id));
 }
 for(const enemy of enemies){
  if(enemy===source||!enemy.active)continue;
  const d=origin.distanceTo(enemyPoint(enemy,.55));
  if(d<radius)hurtEnemy(enemy,force*.92*(1-d/radius)*engineering.damageFactor(element,enemy.element),enemyPoint(enemy,.63));
 }
 const atlas=origin.distanceTo(vec(ox,1.25,oz));
 if(atlas<radius+1.1)hurtAtlas(force*(1-atlas/(radius+1.1)));
 const player=origin.distanceTo(hero.pos.clone().add(vec(0,1.1,0)));
 if(player<radius)hurtHero(force*.95*(1-player/radius));
 if(coop)for(const m of mates.values()){
  const d=origin.distanceTo(m.target.clone().add(vec(0,1.1,0)));
  if(d<radius&&m.ready)damageMate(m,force*.95*(1-d/radius));
 }
}
function detonateHollow(enemy){
 if(!enemy.active)return;
 const origin=enemyPoint(enemy,.75);
 hurtEnemy(enemy,enemy.hp,origin);
 blast(origin,96,5,enemy.element==='Kinetic'?'Scorch':enemy.element,enemy);
}
function castArtillery(enemy){
 const origin=enemyPoint(enemy,1.35);
 const roofs=[...builds.values()].filter(item=>item.piece!==3&&item.layer>=1&&objectiveDistance(item.x,item.z)<7.8);
 roofs.sort((a,b)=>b.y-a.y);
 const roof=roofs[0];
 const end=roof?vec(roof.x,roof.y+.2,roof.z):vec(ox,1.65,oz);
 const air=Math.max(1.5,Math.min(2.8,origin.distanceTo(end)/10));
 const velocity=end.clone().sub(origin).multiplyScalar(1/air);
 velocity.y+=8.75*air;
 const shell=trapProjectile('mortar',origin,velocity,.29,air+.84,enemyDamage(enemy)*1.52,enemy.element==='Kinetic'?'Scorch':enemy.element);
 shell.source=enemy;shell.target=end;shell.arc=air;
}
function tossShambler(catapult,shambler){
 const distance=objectiveDistance(shambler.x,shambler.z),length=Math.max(distance,.01),flight=1.18+distance*.027;
 const from=vec(shambler.x,terrainHeight(shambler.x,shambler.z),shambler.z);
 const end=vec(ox+(shambler.x-ox)/length*2.42,0,oz+(shambler.z-oz)/length*2.42);
 shambler.hurl={from,end,flight,t:0};
 shambler.hitIn=Math.max(shambler.hitIn,flight+.40);
 catapult.hitIn=8.3;
 addSparks(enemyPoint(catapult),0xf5b88d,12,3.6);
}
function castBolt(enemy,target,focus=hero.pos){
 const y=terrainHeight(enemy.x,enemy.z)+1.29*enemy.stats.scale;
 const start=vec(enemy.x,y,enemy.z);
 const group=groupAt(scene,start.x,start.y,start.z);
 mesh(group,gem,mat(0xb3ff9d,0x80ea7c),0,0,0,.145,.17,.145,false);
 const flare=glow(group,0xb2ffb3,0,0,0,1.24,1.24,.55);
 const direction=target==='hero'?vec(focus.x,focus.y+1.04,focus.z):vec(ox,1.48,oz);
 direction.sub(start).normalize().multiplyScalar(9.8);
 bolts.push({group,flare,v:direction,life:2.65,damage:enemyDamage(enemy),element:enemy.element});
}
function moveBolts(dt){
 for(let i=bolts.length-1;i>=0;i--){
  const bolt=bolts[i],pos=bolt.group.position,tx=pos.x+bolt.v.x*dt,tz=pos.z+bolt.v.z*dt;
  const wall=wallBetween(pos.x,pos.z,tx,tz,.07,pos.y);
  bolt.life-=dt;
  let hit=false;
  const mate=coop&&[...mates.values()].find(m=>m.ready&&m.vitals.hp>0&&pos.y>m.target.y&&pos.y<m.target.y+1.82&&Math.hypot(tx-m.target.x,tz-m.target.z)<.5);
  if(wall){hurtStructure(wall,bolt.damage*engineering.structureFactor(bolt.element,wall.material.id));hit=true}
  else if(solidProps.some(p=>p.alive&&p.type==='cover'&&pos.y<p.top&&coverAt(p,tx,tz,.06)))hit=true;
  else if(mate){damageMate(mate,bolt.damage);hit=true}
  else if(hero.hp>0&&pos.y>hero.pos.y&&pos.y<hero.pos.y+1.82&&Math.hypot(tx-hero.pos.x,tz-hero.pos.z)<.48){
   hurtHero(bolt.damage);hit=true;
  }else if(atlasBody.alive&&pos.y>0&&pos.y<atlasBody.top&&objectiveDistance(tx,tz)<1.7){
   hurtAtlas(bolt.damage);hit=true;
  }
  if(hit||bolt.life<=0||pos.y<0){
   if(hit)addSparks(pos,0xa2ed90,5,2.6);
   scene.remove(bolt.group);
   bolt.flare.material.dispose();bolts.splice(i,1);
  }else pos.addScaledVector(bolt.v,dt);
  if(state.finished)return;
 }
}
function addFluxCrystals(){
 const sites=state.mission==='defense'
  ?[[-16,13],[16,-12]]
  :[[-12,12],[14,-9],[-13,-16]];
 for(const [gx,gz] of sites){
  const site=safeFieldPoint(gx+(rand()-.5)*5,gz+(rand()-.5)*4,.8)||safeFieldPoint(gx,gz,.65);
  if(site)addFluxAt(site.x,site.z);
  else addFluxAt(0,gz);
 }
}
function addFluxAt(x,z){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const glowMat=mat(0xa3e4d2,0x6ccfc0,.24);
 mesh(group,rock,steel,0,.16,0,.47,.24,.42);
 mesh(group,gem,glowMat,0,.63,0,.22,.52,.22,false);
 const marker=mesh(group,gem,glowMat,0,1.44,0,.12,.18,.12,false);
 const flare=glow(group,0x98e9d3,0,.7,0,2.8,2.3,.51);
 loot.push({x,y,z,kind:'flux',active:true,group,marker,flare});
}
function activePickups(dt){
 for(const item of loot){
  if(!item.active)continue;
  item.marker.rotation.y+=dt*1.6;
  item.marker.position.y=1.36+Math.sin(state.elapsed*3+item.x)*.21;
  if(guest||hero.hp<=0||(item.kind==='chest'||item.kind==='weapon'))continue;
  if(Math.abs(hero.pos.y-item.y)>1.9||Math.hypot(hero.pos.x-item.x,hero.pos.z-item.z)>1.74||
    wallBetween(hero.pos.x,hero.pos.z,item.x,item.z,.02,hero.pos.y+.42))continue;
  item.active=false;stage.remove(item.group);item.flare.material.dispose();
  if(item.kind==='bundle'){hero.stacks=hero.stacks.map(n=>Math.min(999,n+10))}
  else if(item.kind==='flux'){
   state.flux++;
   if(state.mission==='defense'){
    if(state.flux===2)state.phase='prep';
    if(state.flux===2)notice('Relay powered · Fortify the marked front');
   }else if(state.mission==='seal'&&state.flux===3)notice('Return to the Rift Anchor');
  }else if(item.kind==='cache'){
   hero.cache++;fieldMetrics.caches++;
   hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[20,15,10][i]));
   restock(36);
  }else{
   fieldMetrics.caches++;
   hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[30,20,15][i]));
   restock(90);
   hero.hp=Math.min(hero.maxhp,hero.hp+38);hero.shield=Math.min(hero.maxShield,hero.shield+28);
  }
  sound('pickup');
 }
}
const trapFields=[];
function trapVisual(item){
 const {group,recipe}=item,mount=recipe.mount;
 const color={Kinetic:0xb8afb0,Aether:0xbd87df,Scorch:0xef9054,Volt:0x74d9ee,Frost:0x9ceaff}[recipe.element];
 const shell=mat(0x334b55,0,.3),hot=mat(color,color,.18),side=GRID*.69;
 if(recipe.id==='rime'){
  const base=block(group,shell,0,0,0,1.5,.18,1.5);
  for(let i=0;i<6;i++)mesh(group,gem,hot,.55*Math.cos(i*TAU/6),-.38,.55*Math.sin(i*TAU/6),.15,.57,.15);
  return [base];
 }
 if(recipe.id==='winch'){
  const base=block(group,shell,0,0,0,1.7,1,.22);
  const spool=mesh(group,cyl,hot,0,0,.38,.37,1.2,.37);spool.rotation.z=Math.PI/2;
  return [base];
 }
 if(mount==='wall'){
  const base=block(group,shell,0,0,.035,side,GRID*.52,.16);
  for(const s of [-1,1])block(group,hot,s*side*.31,0,.14,.09,GRID*.36,.08);
  for(let i=-1;i<=1;i++){
   const head=mesh(group,cyl,hot,i*.55,0,.16,.13,.29,.13);
   head.rotation.x=Math.PI/2;
  }
  return [base];
 }
 const below=mount==='ceiling',sideY=below?-1:1;
 const base=block(group,shell,0,sideY*.05,0,side,.17,side);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
  const detail=mesh(group,recipe.id==='spikes'?cone:hex,hot,i*side*.29,sideY*.23,j*side*.29,.13,.28,.13);
  if(below)detail.rotation.z=Math.PI;
 }
 return [base];
}
function enemyPoint(enemy,height=.9){
 return vec(enemy.x,terrainHeight(enemy.x,enemy.z)+enemy.air+height*enemy.stats.scale,enemy.z);
}
function trapDamage(enemy,force,element,item){
 if(element==='Scorch'){
  for(const trap of builds.values())if(trap.recipe?.id==='tar'&&trap.pool>0&&trap.burning<=0&&
   Math.hypot(trap.x-enemy.x,trap.z-enemy.z)<trap.recipe.range+.38)igniteTar(trap);
 }
 const tune=item?.calibration,alignment=tune?.element||element;
 const critical=tune&&rand()<tune.crit?tune.critMulti:1;
 const amount=force*(tune?.boost??1)*critical*(1+(squad.vital.Aptitude-10)*.005)*engineering.damageFactor(alignment,enemy.element);
 hurtEnemy(enemy,amount,enemyPoint(enemy,.6));
 if(tune?.core==='Affliction'&&enemy.active)enemy.affliction={amount:amount*.18,remaining:2.4,next:.6};
}
function trapLine(a,b,color){
 const geometry=new T.BufferGeometry().setFromPoints([a,b]);
 const material=new T.LineBasicMaterial({color,transparent:true,opacity:.9});
 effect(new T.Line(geometry,material),.19,t=>{material.opacity=t*.92});
}
function trapProjectile(kind,origin,velocity,radius,life,dmg,element){
 const model=mesh(scene,kind==='dart'?gem:kind==='tire'?tire:sphere,
  mat(kind==='dart'?0xffd49c:kind==='tire'?0x27313b:0xe49b6e),
  origin.x,origin.y,origin.z,radius,kind==='dart'?radius*2.6:radius,radius,false);
 if(kind==='tire')model.rotation.z=Math.PI/2;
 if(kind==='dart')model.quaternion.setFromUnitVectors(vec(0,1,0),velocity.clone().normalize());
 const body=kind!=='dart'&&physics?physics.ball(origin,velocity,radius,kind!=='mortar'):null;
 trapShots.push({kind,model,v:velocity,radius,life,dmg,element,hit:new Set(),body});
 return trapShots[trapShots.length-1];
}
function knockHollow(enemy,dx,dz,impulse,stagger=0){
 const stability=enemy.kind==='juggernaut'?99:enemy.kind==='boss'?70:enemy.kind==='brute'?44:22;
 if(impulse<stability&&enemy.stun<=0)return;
 const factor=clamp(impulse/(stability+15),.65,2.1);
 enemy.kx+=dx*factor*5;enemy.kz+=dz*factor*5;
 enemy.stun=Math.max(enemy.stun,stagger);
}
function igniteTar(item){
 item.pool=Math.max(item.pool,3.2);item.burning=Math.max(item.burning,3.2);
 addSparks(vec(item.x,item.y+.24,item.z),0xff914a,12,4.2);
}
function fieldTrap(item,element,seconds,interval,damage){
 const emissive=element==='Scorch'?0xff8b4d:0xba86e6;
 const cloud=glow(scene,emissive,item.x,item.y+(item.recipe.mount==='ceiling'?-1.15:.2),item.z,
  item.recipe.range*1.55,item.recipe.range*.94,.52);
 trapFields.push({x:item.x,z:item.z,y:item.y,range:item.recipe.range,element,seconds,interval,damage,next:0,
  cloud,mount:item.recipe.mount,host:item});
}
function moveTrapFields(dt){
 for(let i=trapFields.length-1;i>=0;i--){
  const field=trapFields[i];field.seconds-=dt;field.next-=dt;
  if(field.seconds<=0){
   scene.remove(field.cloud);field.cloud.material.dispose();trapFields.splice(i,1);continue;
  }
  field.cloud.material.opacity=Math.min(.52,field.seconds*.8);
  if(field.next>0)continue;
  field.next+=field.interval;
  for(const enemy of enemies)if(enemy.active&&withinTrapField(field,enemy))trapDamage(enemy,field.damage,field.element,field.host);
 }
}
function withinTrapField(trap,enemy){
 const ground=terrainHeight(enemy.x,enemy.z)+enemy.air,center=ground+enemy.stats.scale*.72;
 const depth=trap.mount==='ceiling'?trap.y-center:ground-trap.y;
 return Math.hypot(enemy.x-trap.x,enemy.z-trap.z)<trap.range&&
  (trap.mount==='ceiling'?depth>-.25&&depth<GRID*3+.2:Math.abs(depth)<.95);
}
function trapTargets(item){
 const {recipe}=item,nx=Math.sin(item.angle),nz=Math.cos(item.angle);
 const depth=recipe.mount==='ceiling'?GRID*3:recipe.mount==='wall'?2.7:2;
 const center=vec(item.x,item.y-(recipe.mount==='ceiling'?depth*.48:0),item.z);
 const occupants=physics?.enemyVolume(center,{x:recipe.range+1,y:depth*.54+.55,z:recipe.range+1});
 const eligible=[...(occupants||enemies)].filter(enemy=>{
  if(!enemy.active)return false;
  const dx=enemy.x-item.x,dz=enemy.z-item.z;
  if(recipe.mount==='wall'){
   const front=dx*nx+dz*nz,side=Math.abs(dx*nz-dz*nx);
   const waist=enemyPoint(enemy,.88).y;
   return front>.11&&front<recipe.range&&side<GRID*.39&&Math.abs(waist-item.y)<1.28&&
    !wallBetween(item.x,item.z,enemy.x,enemy.z,.018,item.y);
  }
  if(recipe.id==='coil'){
   const depth=item.y-enemyPoint(enemy,.66).y;
   return Math.abs(dx)<recipe.range&&Math.abs(dz)<recipe.range&&depth>-.1&&depth<GRID*3;
  }
  return withinTrapField({x:item.x,y:item.y,z:item.z,range:recipe.range,mount:recipe.mount},enemy);
 });
 return eligible.sort((a,b)=>Math.hypot(a.x-item.x,a.z-item.z)-Math.hypot(b.x-item.x,b.z-item.z));
}
function fireTrap(item,targets){
 const {recipe}=item,head=vec(item.x,item.y,item.z),f=vec(Math.sin(item.angle),0,Math.cos(item.angle));
 const effectColor={Kinetic:0xffd4a0,Aether:0xbf89eb,Scorch:0xff8a50,Volt:0x78d9ff,Frost:0x9ceaff}[recipe.element];
 const primary=targets[0];
 switch(recipe.id){
  case 'rime':
   for(const e of targets){trapLine(head,enemyPoint(e),effectColor);e.snare=Math.max(e.snare,3.5);trapDamage(e,42,recipe.element,item)}
   break;
  case 'winch':
   trapLine(head,enemyPoint(primary),effectColor);
   knockHollow(primary,-f.x,-f.z,70,.48);trapDamage(primary,58,recipe.element,item);
   break;
  case 'spikes':
   for(const e of targets){e.snare=Math.max(e.snare,2.8);trapDamage(e,49,recipe.element,item)}
   break;
  case 'tar':
   item.pool=4.6;item.burning=0;
   for(const e of targets){
    e.tar=Math.max(e.tar,1.65);
    if(e.kind==='juggernaut'){e.charge=0;e.stun=Math.max(e.stun,1.18)}
   }
   break;
  case 'launch':
   for(const e of targets)if(e.kind!=='juggernaut'){
    e.vy=Math.max(e.vy,e.kind==='boss'?5.4:10.6);e.stun=Math.max(e.stun,.28);trapDamage(e,22,recipe.element,item);
   }
   break;
  case 'grill':
   fieldTrap(item,recipe.element,2.9,.54,27);
   break;
  case 'darts':
   for(const offset of [-.61,0,.61]){
    const at=head.clone().addScaledVector(f,.18).add(vec(f.z*offset,0,-f.x*offset));
    trapProjectile('dart',at,f.clone().multiplyScalar(27),.115,recipe.range/27,72,recipe.element).host=item;
   }
   break;
  case 'cannon':{
   const v=f.clone().multiplyScalar(12.8);v.y=2.45;
   trapProjectile('cannon',head.clone().addScaledVector(f,.31),v,.27,3.8,114,recipe.element).host=item;
   break;
  }
  case 'piston':
   for(const e of targets){knockHollow(e,f.x,f.z,76,.57);trapDamage(e,25,recipe.element,item)}
   break;
  case 'dynamo':
   trapLine(head,enemyPoint(primary),effectColor);trapDamage(primary,161,recipe.element,item);break;
  case 'miasma':
   fieldTrap(item,recipe.element,4.8,.6,24);
   break;
  case 'coil':{
   let start=head;
   const remaining=targets.slice();
   while(remaining.length){
    let nearest=0,best=Infinity;
    for(let i=0;i<remaining.length;i++){
     const range=start.distanceToSquared(enemyPoint(remaining[i]));
     if(range<best){nearest=i;best=range}
    }
    const [e]=remaining.splice(nearest,1);
    const point=enemyPoint(e);trapLine(start,point,effectColor);trapDamage(e,82,recipe.element,item);start=point;
   }
   break;
  }
  case 'tires':
   for(const side of [-1,1]){
    const route=vec(side*1.38,-2.8,side*1.18);
    trapProjectile('tire',head.clone().add(vec(side*.51,-.27,0)),route,.31,4.6,77,recipe.element).host=item;
   }
   break;
 }
 addSparks(head,effectColor,13,3.35);
 sound(recipe.element==='Volt'?'pulse':'chip');
}
function trapTerrainAt(x,z,y){
 return floorAt(x,z,y+.13);
}
function hitTrapLine(shot,from,to){
 const {radius,v}=shot;
 for(const enemy of enemies){
  if(!enemy.active||shot.hit.has(enemy)||!circleBetween(from.x,from.z,to.x,to.z,enemy,enemy.r+radius))continue;
  const feet=terrainHeight(enemy.x,enemy.z)+enemy.air;
  if(Math.max(from.y,to.y)<feet-radius||Math.min(from.y,to.y)>feet+1.8*enemy.stats.scale+radius)continue;
  shot.hit.add(enemy);
  if(shot.kind==='tire'){
   enemy.stun=Math.max(enemy.stun,.68);
   const flat=Math.hypot(v.x,v.z)||1;
   knockHollow(enemy,v.x/flat,v.z/flat,61,.68);
  }
  trapDamage(enemy,shot.dmg,shot.element,shot.host);
 }
}
function finishPlayerProjectile(shot,point,index){
 if(shot.kind==='cluster'){
  for(let i=0;i<4;i++){
   const angle=i*Math.PI*.5+.34,spread=vec(Math.cos(angle)*4,2.8,Math.sin(angle)*4);
   trapProjectile('bomblet',point.clone().add(vec(0,.2,0)),spread,.109,.62+i*.10,shot.dmg,shot.element);
  }
 }else abilityBlast(point,shot.dmg,3.55,shot.element);
 removeTrapShot(shot,index);
}
function removeTrapShot(shot,index){
 scene.remove(shot.model);
 if(shot.body)physics?.removeBall(shot.body);
 trapShots.splice(index,1);
}
function updatePhysicalShot(shot,index,dt){
 const {body,model,v}=shot,p=model.position,origin=p.clone(),point=vec().copy(body.translation());
 const speed=body.linvel();
 shot.life-=dt;
 if(shot.kind==='mortar'){
  const touchdown=shot.life<.84||point.distanceTo(shot.target)<.42||
   v.y<-.6&&speed.y>v.y+1.8||
   Math.hypot(v.x,v.z)>3&&Math.hypot(speed.x,speed.z)<Math.hypot(v.x,v.z)*.62;
  if(touchdown){
   blast(point,shot.dmg,5.3,shot.element,shot.source);
   removeTrapShot(shot,index);return;
  }
 }else if(shot.kind==='cluster'||shot.kind==='bomblet'){
  if(shot.life<=0){finishPlayerProjectile(shot,point,index);return}
 }else hitTrapLine(shot,origin,point);
 p.copy(point);v.copy(speed);
 model.rotation.x+=dt*5.7;model.rotation.y+=dt*2.7;
 if(shot.life<=0)removeTrapShot(shot,index);
}
function moveTrapShots(dt){
 for(let i=trapShots.length-1;i>=0;i--){
  const shot=trapShots[i],{model,v,radius}=shot,p=model.position;
  if(shot.body){updatePhysicalShot(shot,i,dt);continue}
  const dart=shot.kind==='dart';
  shot.life-=dt;
  if(!dart)v.y-=dt*(shot.kind==='mortar'?17.5:14.5);
  const nx=p.x+v.x*dt,ny=p.y+v.y*dt,nz=p.z+v.z*dt;
  const hit=(x,z)=>Math.abs(x)>BOUND||Math.abs(z)>BOUND||wallBetween(p.x,p.z,x,z,radius*.7,p.y)||
   solidProps.some(prop=>prop.alive&&p.y<prop.top&&coverAt(prop,x,z,radius));
  const stopX=hit(nx,p.z),stopZ=hit(p.x,nz),diagonal=!stopX&&!stopZ&&hit(nx,nz);
  const tx=stopX||diagonal?p.x:nx,tz=stopZ||diagonal?p.z:nz;
  if(dart&&(stopX||stopZ||diagonal))shot.life=0;
  else{
   if(stopX||diagonal)v.x*=-.87;
   if(stopZ||diagonal)v.z*=-.87;
  }
  let ty=ny;
  const ground=trapTerrainAt(tx,tz,p.y-radius)+radius;
  if(shot.kind==='mortar'&&(stopX||stopZ||diagonal||ty<ground||shot.life<=.80||
    p.distanceTo(shot.target)<.38)){
   blast(vec(tx,Math.max(ty,ground),tz),shot.dmg,5.3,shot.element,shot.source);
   shot.life=0;
  }
  if(ty<ground){
   ty=ground;v.y=Math.max(1.2,-v.y*(shot.kind==='tire'?.78:.70));
   v.x*=.9;v.z*=.9;if(dart)shot.life=0;
  }
  const player=shot.kind==='cluster'||shot.kind==='bomblet';
  if(!player&&shot.kind!=='mortar')hitTrapLine(shot,p,vec(tx,ty,tz));
  p.set(tx,ty,tz);
  if(!dart){model.rotation.x+=dt*5.7;model.rotation.y+=dt*2.7}
  if(shot.life<=0){if(player)finishPlayerProjectile(shot,p.clone(),i);else removeTrapShot(shot,i)}
 }
}
function abilityBlast(origin,force,radius,element='Aether'){
 for(const enemy of enemies){
  if(!enemy.active)continue;
  const point=enemyPoint(enemy,.62),range=point.distanceTo(origin);
  if(range<radius)trapDamage(enemy,force*(1-range/radius)*.78+force*.22,element);
 }
 addSparks(origin,elementColors[element],17,4.1);
}
function trapTick(dt){
 moveTrapShots(dt);moveTrapFields(dt);
 for(const item of builds.values()){
  if(item.piece!==3)continue;
  const recipe=item.recipe;
  item.trapIn=Math.max(0,item.trapIn-dt);
  if(recipe.id==='tar'&&item.pool>0){
   item.pool=Math.max(0,item.pool-dt);item.burning=Math.max(0,item.burning-dt);
   if(item.burning>0&&item.flame!==true){item.flame=true;fieldTrap(item,'Scorch',item.burning,.44,29)}
   if(!item.burning)item.flame=false;
   for(const e of trapTargets(item))if(e.active){
    e.tar=Math.max(e.tar,.24);
    if(e.kind==='juggernaut'&&e.charge>0){e.charge=0;e.stun=Math.max(e.stun,.52)}
   }
  }
  if(item.trapIn>0)continue;
  if(item.life===0){
   if(!item.pool)removeStructure(item);
   continue;
  }
  const targets=trapTargets(item);
  if(!targets.length)continue;
  item.life--;item.trapIn=recipe.reload*item.calibration.reload;fieldTraps.add(recipe.id);
  fireTrap(item,targets);
 }
}
function enemyDamage(enemy){
 return Math.round(enemy.stats.hit*(1+.012*(enemy.power-10))*(state.modifier?.id==='surge'?1.22:1));
}
function strike(enemy,target,wall,mate){
 if(enemy.hitIn>0)return;
 if(enemy.kind==='demolisher'){detonateHollow(enemy);return}
 enemy.hitIn=enemy.kind==='boss'?1.38:enemy.kind==='brute'?1.27:1.12;
 enemy.recoil=.29;
 const damage=enemyDamage(enemy)*(enemy.kind==='juggernaut'&&enemy.charge>0&&target==='wall'?2.7:1);
 if(enemy.kind==='juggernaut'&&enemy.charge>0&&target!=='wall')enemy.charge=0;
 if(target==='hero'){if(mate)damageMate(mate,damage);else hurtHero(damage)}
 if(target==='atlas')hurtAtlas(damage);
 if(target==='wall')hurtStructure(wall,damage*engineering.structureFactor(enemy.element,wall.material.id),enemy);
}
function chaseDecoy(enemy,dt){
 const decoy=gadgets.find(g=>g.kind==='decoy'&&g.hp>0&&Math.hypot(g.x-enemy.x,g.z-enemy.z)<11&&
  !wallBetween(enemy.x,enemy.z,g.x,g.z,.05,.68)&&
  !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,enemy.x,enemy.z,g.x,g.z,.05)));
 if(!decoy)return null;
 const dx=decoy.x-enemy.x,dz=decoy.z-enemy.z,distance=Math.hypot(dx,dz);
 enemy.yaw=Math.atan2(-dx,-dz);
 if(distance<1.28){
  if(enemy.hitIn<=0){enemy.hitIn=1.05;decoy.hp-=enemyDamage(enemy)}
  return 0;
 }
 const fraction=Math.min(1,enemy.stats.speed*dt/distance);
 enemy.x+=dx*fraction;enemy.z+=dz*fraction;return 1;
}
function seek(enemy,dt){
 const {x,z,stats,r}=enemy;
 const taunt=chaseDecoy(enemy,dt);if(taunt!==null)return taunt;
 const nearest=coop?closestPlayer(x,z):{pos:hero.pos,mate:null};
 const focus=nearest?.pos||hero.pos,mate=nearest?.mate;
 const concealed=gadgets.some(g=>g.kind==='smoke'&&Math.hypot(g.x-focus.x,g.z-focus.z)<3.55);
 const toHero=Math.hypot(x-focus.x,z-focus.z),toAtlas=objectiveDistance(x,z);
 const phasing=enemy.kind==='phantasm';
 const sight=phasing||(!wallBetween(x,z,focus.x,focus.z,.12,.76)&&
  !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,x,z,focus.x,focus.z,.06)));
 const alert=({runner:7.5,spitter:12.2,beam:17,phantasm:10,juggernaut:9})[enemy.kind]||4.7;
 const hunt=enemy.hunt===true;
 const focusHero=!!nearest&&(hunt||(!concealed&&sight&&toHero<alert&&(phasing||focus.y-terrainHeight(focus.x,focus.z)<1.3)));
 const lineToAtlas=!phasing&&wallBetween(x,z,ox,oz,.1,.84);
 const target=focusHero?'hero':'atlas';
 let tx=focusHero?focus.x:ox,tz=focusHero?focus.z:oz;
 if(!hunt&&enemy.kind==='mortar'&&toAtlas<24&&toAtlas>4.5){
  enemy.yaw=Math.atan2(x,z);
  if(enemy.hitIn<=0){enemy.hitIn=5.3;enemy.recoil=.29;castArtillery(enemy)}
  return 0;
 }
 if(!hunt&&enemy.kind==='catapult'&&toAtlas<19&&toAtlas>5.6&&enemy.hitIn<=0){
  const ally=enemies.find(e=>e.active&&e.kind==='husk'&&!e.hurl&&Math.hypot(e.x-x,e.z-z)<5.1);
  if(ally){tossShambler(enemy,ally);return 0}
 }
 if(enemy.kind==='beam'){
  if(focusHero&&sight&&enemy.hitIn<=0&&enemy.beamFor<=0){enemy.beamFor=1.63;enemy.beamTick=0;enemy.hitIn=4.4}
  if(enemy.beamFor>0){
   if(!focusHero||!sight){enemy.beamFor=0;return 0}
   enemy.beamFor-=dt;enemy.beamTick-=dt;
   enemy.yaw=Math.atan2(x-focus.x,z-focus.z);
   if(enemy.beamTick<=0){
    enemy.beamTick=.142;
    trapLine(enemyPoint(enemy,1.5),focus.clone().add(vec(0,1.18,0)),elementColors[enemy.element]);
    if(mate)damageMate(mate,enemyDamage(enemy)*.29);else hurtHero(enemyDamage(enemy)*.29);
   }
   return 0;
  }
 }
 if(enemy.kind==='juggernaut'){
  enemy.charge=Math.max(0,enemy.charge-dt);enemy.chargeIn=Math.max(0,enemy.chargeIn-dt);
  if(enemy.chargeIn<=0&&enemy.tar<=0&&(focusHero?toHero:toAtlas)<16){
   enemy.charge=2.55;enemy.chargeIn=7.6;
   addSparks(enemyPoint(enemy,.55),0xeebd8a,13,3.6);
  }
 }
 const ranged=enemy.kind==='spitter';
 if(ranged&&((focusHero&&sight&&toHero<11)||(!hunt&&!lineToAtlas&&toAtlas<11))){
  if(!focusHero){tx=0;tz=0}
  enemy.yaw=Math.atan2(x-tx,z-tz);
  if(enemy.hitIn<=0){enemy.hitIn=2.72;enemy.recoil=.25;castBolt(enemy,focusHero?'hero':'atlas',focus)}
  return 0;
 }
 const range=focusHero?(enemy.kind==='boss'?1.87:enemy.kind==='brute'?1.51:1.09):3.42;
 if((focusHero&&sight&&toHero<=range&&(phasing||focus.y-terrainHeight(x,z)<2.3))||(!focusHero&&!lineToAtlas&&toAtlas<=range)){
  enemy.yaw=Math.atan2(x-tx,z-tz);
  strike(enemy,target,null,mate);
  return 0;
 }
 if(!focusHero&&!phasing)[tx,tz]=enemyRoute(enemy);
 const dx=tx-x,dz=tz-z,len=Math.hypot(dx,dz);
 if(len<.0001)return 0;
 const ux=dx/len,uz=dz/len;
 if(hunt&&toHero<.95&&!sight)return 0;
 const stopDist=dt*stats.speed+r+.32;
 const wall=!phasing&&wallBetween(x,z,x+ux*stopDist,z+uz*stopDist,r*.85,.6);
 enemy.yaw=Math.atan2(-ux,-uz);
 if(wall){strike(enemy,'wall',wall);return 0}
 let pushX=0,pushZ=0;
 for(const other of enemies){
  if(other===enemy||!other.active)continue;
  const ox=x-other.x,oz=z-other.z,dist=Math.hypot(ox,oz),minimum=r+other.r+.34;
  if(dist<.005||dist>minimum)continue;
  const strength=clamp((minimum-dist)/minimum,0,.43)*2;
  pushX+=ox/dist*strength;pushZ+=oz/dist*strength;
 }
 const pace=stats.speed*dt*(enemy.tar>0?.11:enemy.charge>0?3.05:enemy.snare>0?.70:1);
 const clear=(a,b)=>(phasing||!wallBetween(x,z,a,b,r*.66,.57))&&
  !solidProps.some(p=>p.alive&&coverAt(p,a,b,r*.63));
 const nx=x+(ux+clamp(pushX,-.65,.65))*pace,nz=z+(uz+clamp(pushZ,-.65,.65))*pace;
 if(clear(nx,nz)){
  enemy.x=clamp(nx,-BOUND+.5,BOUND-.5);enemy.z=clamp(nz,-BOUND+.5,BOUND-.5);return 1;
 }
 if(clear(x+ux*pace,z+uz*pace)){
  enemy.x+=ux*pace;enemy.z+=uz*pace;return 1;
 }
 const tangent=.79*(enemy.stuck>1.4?-1:1);
 if(clear(x-uz*pace*tangent,z+ux*pace*tangent)){enemy.x-=uz*pace*tangent;enemy.z+=ux*pace*tangent;return .8}
 return 0;
}
function updateHusks(dt){
 if(obstaclesDirty)refreshRoutes();
 for(const enemy of enemies){
  if(!enemy.active)continue;
  enemy.hitIn-=dt;
  if(enemy.affliction){
   const affliction=enemy.affliction;affliction.remaining-=dt;affliction.next-=dt;
   if(affliction.next<=0){affliction.next+=.6;hurtEnemy(enemy,affliction.amount,enemyPoint(enemy,.65))}
   if(affliction.remaining<=0)enemy.affliction=null;
   if(!enemy.active)continue;
  }
  if(enemy.hurl){
   const {from,end,flight}=enemy.hurl;
   enemy.hurl.t+=dt;
   const t=clamp(enemy.hurl.t/flight,0,1),x=lerp(from.x,end.x,t),z=lerp(from.z,end.z,t);
   enemy.x=x;enemy.z=z;
   enemy.air=Math.max(0,lerp(from.y,end.y,t)+Math.sin(t*Math.PI)*6.6-terrainHeight(x,z));
   enemy.root.position.set(x,terrainHeight(x,z)+enemy.air,z);
   if(t>=1){enemy.hurl=null;enemy.air=0;enemy.stun=.29}
   continue;
  }
  enemy.snare=Math.max(0,enemy.snare-dt);enemy.tar=Math.max(0,enemy.tar-dt);
  if(enemy.air>0||enemy.vy>0){
   enemy.vy-=dt*18;enemy.air=Math.max(0,enemy.air+enemy.vy*dt);
   if(!enemy.air)enemy.vy=0;
  }
  if(Math.hypot(enemy.kx,enemy.kz)>.05){
   const x=enemy.x+enemy.kx*dt,z=enemy.z+enemy.kz*dt;
   const y=terrainHeight(enemy.x,enemy.z)+enemy.air+.55;
   if(Math.abs(x)<BOUND&&Math.abs(z)<BOUND&&!wallBetween(enemy.x,enemy.z,x,z,enemy.r*.8,y)&&
     !solidProps.some(p=>p.alive&&p.top>y&&coverAt(p,x,z,enemy.r*.67))){enemy.x=x;enemy.z=z}
   enemy.kx*=Math.max(0,1-dt*5);enemy.kz*=Math.max(0,1-dt*5);
  }
  enemy.recoil=Math.max(0,enemy.recoil-dt);enemy.stun=Math.max(0,enemy.stun-dt);
  const moving=enemy.stun>0||enemy.air>.5?0:seek(enemy,dt);
  enemy.stuck=moving?0:(enemy.stuck+dt)%3.4;
  if(state.finished)return;
  enemy.bob+=dt*(moving?7+enemy.stats.speed:2.9);
  const step=Math.sin(enemy.bob),lift=Math.abs(step),recoil=enemy.recoil;
  enemy.rig.position.y=lift*moving*.058;
  enemy.chest.rotation.x=-.15+(recoil>0?Math.sin(recoil*11)*-.33:0);
  enemy.chest.rotation.z=step*moving*.11;
  enemy.head.rotation.z=.072+step*.045;
  for(let i=0;i<2;i++){
   const {arm,leg}=enemy.limbs[i],sign=i?1:-1;
   leg.rotation.x=step*sign*moving*.71;
   arm.rotation.set(-.57-step*sign*moving*.46-recoil*1.9,0,.18*sign);
  }
  const haunt=enemy.kind==='phantasm'?.34+Math.sin(enemy.bob*.7)*.16:0;
  enemy.root.position.set(enemy.x,terrainHeight(enemy.x,enemy.z)+enemy.air+haunt,enemy.z);
  const facing=enemy.root.rotation.y;
  enemy.root.rotation.y=facing+Math.atan2(Math.sin(enemy.yaw-facing),Math.cos(enemy.yaw-facing))*Math.min(dt*11,1);
 }
}
function plannedFronts(){
 if(state.mission!=='defense'||state.finished)return noFronts;
 return assaultLanes[state.phase==='active'||state.phase==='arming'?state.wave-1:state.wave]||noFronts;
}
function startWave(){
 if(state.phase!=='prep'||state.finished)return;
 const seats=coop?livePlayers().length:1;
 state.wave++;state.waveTime=0;state.phase='arming';state.prep=ASSAULT_WARNING;
 const wave=waves[state.wave-1];
 assaultQueue=operations.assaultGroups(wave,plannedFronts(),seats);
 for(let i=0;i<(state.outpostTier||0);i++){
  assaultQueue.push({lane:plannedFronts()[i%plannedFronts().length],units:[i%2?'brute':'runner','husk']});
 }
 assaultGroup=assaultUnit=0;
 state.pending=assaultQueue.reduce((sum,group)=>sum+group.units.length,0);state.spawnIn=.12;
 notice(wave.name+' · '+plannedFronts().map(lane=>frontNames[lane]).join(' / '));
 sound('wave','Assault incoming');rumble(.43,140);
}
function spawnHusk(){
 const group=assaultQueue[assaultGroup];
 const [x,z]=portals[group.lane];
 const drop=safeFieldPoint(x+(rand()-.5)*2.8,z+(rand()-.5)*2.8,.65);
 makeHusk(group.units[assaultUnit++],drop?.x??x,drop?.z??z);
 addSparks(vec(x,terrainHeight(x,z)+1.4,z),0xaf72ff,9,5.6);
 state.pending--;
 if(assaultUnit===group.units.length){
  assaultGroup++;assaultUnit=0;state.spawnIn=Math.max(3.3,6.8-state.wave*.66);
 }else state.spawnIn=.53;
}
function clearWave(){
 const bonus=hero.cache===3&&!state.allClear;
 if(bonus)state.allClear=true;
 awardWave(bonus);
 bankSalvage(false,true);
 portalFx.forEach(portal=>{portal.active=false});
 for(const bolt of bolts){
  scene.remove(bolt.group);bolt.flare.material.dispose();
 }
 bolts.length=0;enemies.length=0;
 for(let i=trapShots.length-1;i>=0;i--)removeTrapShot(trapShots[i],i);
 for(const field of trapFields){scene.remove(field.cloud);field.cloud.material.dispose()}
 trapFields.length=0;
 if(state.wave===MAX_WAVES){finish(true,'All five assaults repelled');return}
 state.phase='prep';state.prep=0;
 hero.hp=Math.min(hero.maxhp,hero.hp+17);
 hero.shield=Math.max(hero.shield,32);
 for(const gun of guns)gun.reserve=Math.max(48,gun.reserve);
 hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[16,12,8][i]));
 const points=[[-5,7],[6,5],[-6,-6],[6,-6]];
 const [x,z]=points[dropIndex++%points.length];
 addCache(x,z,'airdrop');
 notice('Assault repelled · Resupply and prepare for the next front');sound('pickup','Resupply delivered');
}
const nests=[];
let pod=null;
let plannedNests=null;
function turnOffAtlas(){
 atlasModel.visible=false;atlasBody.alive=false;
 removeTarget(shotProps,atlasHit);obstaclesDirty=true;
}
function safeFieldPoint(x,z,clearance){
 for(let i=0;i<33;i++){
  const theta=i*2.39996,offset=i?Math.sqrt(i)*.98:0;
  const a=x+Math.cos(theta)*offset,b=z+Math.sin(theta)*offset;
  if(Math.abs(a)<BOUND-4&&Math.abs(b)<BOUND-4&&!solidProps.some(prop=>prop.alive&&coverAt(prop,a,b,clearance)))return vec(a,terrainHeight(a,b),b);
 }
 return null;
}
function nestSites(){
 if(plannedNests)return plannedNests;
 const twist=(mapSeed%65521)/65521*TAU;
 const fallback=[[-33,-1],[0,-31],[32,-1],[0,35],[-29,25],[26,-27]];
 plannedNests=[];
 for(let i=0;i<nestCrews.length;i++){
  const angle=twist+i*TAU/nestCrews.length,radius=24+((mapSeed>>>(i*5))&31)*1.25;
  const candidate=safeFieldPoint(Math.cos(angle)*radius,Math.sin(angle)*radius,2.6);
  const far=site=>site&&plannedNests.every(other=>other.distanceTo(site)>12);
  const site=far(candidate)?candidate:fallback.map(([x,z])=>safeFieldPoint(x,z,2.6)).find(far);
  if(site)plannedNests.push(site);
 }
 return plannedNests;
}
function prepareNests(){
 turnOffAtlas();
 ui.objective.hidden=true;
 state.phase='hunt';state.huntTime=NEST_DURATION;
 for(const site of nestSites()){
  const {x,y,z}=site,group=groupAt(stage,x,y,z);
  const shell=mat(0x563953,0x1a0c21),vein=mat(0xca97dc,0x7f44ad);
  mesh(group,rock,shell,0,.32,0,1.47,.66,1.53);
  for(let j=0;j<6;j++){
   const turn=j*TAU/6,spine=mesh(group,gem,shell,Math.cos(turn)*1.05,.83,Math.sin(turn)*1.05,.28,.87,.31);
   spine.rotation.z=Math.cos(turn)*.29;
  }
  const gemstone=mesh(group,gem,vein,0,1.13,0,.52,.84,.52,false);
  const shield=ring(group,purple,1.53,.031,.38);
  const haze=glow(group,0xbb73d6,0,1,0,3.2,3.3,.44);
  const max=Math.round(150+region.floor*1.6);
  nests.push({type:'nest',x,y,z,group,gemstone,shield,haze,max,hp:max,active:true,crew:null,remaining:0});
 }
 if(nests.length!==nestCrews.length){finish(false,'The nest survey failed');return}
 notice('Follow the nest signals');
}
function availableNest(){
 if(state.mission!=='nests'||state.nest)return null;
 return nests.find(nest=>nest.active&&Math.abs(hero.pos.y-nest.y)<2.25&&
  Math.hypot(nest.x-hero.pos.x,nest.z-hero.pos.z)<3.35&&
  !wallBetween(hero.pos.x,hero.pos.z,nest.x,nest.z,.05,nest.y+1)&&
  !solidProps.some(prop=>prop.alive&&p.type==='cover'&&coverAlong(prop,hero.pos.x,hero.pos.z,nest.x,nest.z,.05)));
}
function scanNest(nest){
 state.nest=nest;state.wave=state.nestsCleared+1;
 nest.crew=[...nestCrews[state.nestsCleared]];nest.remaining=nest.crew.length;nest.spawnIn=.20;
 notice('Guardians incoming');sound('wave','Guardians incoming');
}
function missionInteraction(){
 if(hero.hp<=0||objectiveDistance(hero.pos.x,hero.pos.z)>4.8||Math.abs(hero.pos.y)>2.25)return '';
 if(state.phase==='drop'&&!state.overclock&&state.flux>0)return 'Overclock landing beacon · 1 Flux · stronger assault · +6 Cells on victory';
 if(state.phase==='payload'&&state.flux>0&&state.podFuel<=80)return 'Feed pod · 1 Flux';
 if(state.mission==='defense'&&state.phase==='prep')return 'Launch assault '+(state.wave+1);
 if(state.mission==='seal'&&state.phase==='fuel'&&state.flux===3)return 'Activate Rift Anchor';
 return '';
}
function searchableWreck(){
 return props.find(p=>p.kind===2&&p.alive&&!p.searched&&Math.abs(hero.pos.y-p.y)<2&&Math.hypot(p.x-hero.pos.x,p.z-hero.pos.z)<2.9);
}
function interactField(){
 if(hero.hp<=0)return false;
 if(guest){
  const teammate=[...mates.values()].some(m=>m.ready&&m.down&&m.target.distanceTo(hero.pos)<2.65);
  if(teammate||availableNest()||availableChest()||searchableWreck()||(state.phase==='payload'&&missionInteraction())){coopAction('interact');return true}
  return false;
 }
 if(coop&&reviveMate())return true;
 const nest=availableNest();
 if(nest){scanNest(nest);return true}
 if(useChest())return true;
 const wreck=searchableWreck();
 if(wreck){
  wreck.searched=true;fieldMetrics.caches++;
  collectPart(pick(['parts','gears','powder','charge']),2+Math.floor(rand()*5));sound('pickup');return true;
 }

 if(!missionInteraction()||coop&&!coopStarted)return false;
 if(state.phase==='drop'&&!remoteSeat){state.flux--;state.overclock=true;sound('build');return true}
 if(state.phase==='payload'){
  state.flux--;state.podFuel=Math.min(100,state.podFuel+44);
  addSparks(vec(0,1,0),0x98e9d3,22,5);sound('build');return true;
 }
 if(remoteSeat)return false;
 if(state.mission==='defense')startWave();
 else{
  state.phase='seal';state.wave=1;state.spawnIn=.35;
  portalFx.forEach(portal=>{portal.active=true});
  notice('Anchor online · Keep it intact');sound('wave','Anchor online');
 }
 return true;
}
function updateNest(nest,dt){
 nest.gemstone.rotation.y+=dt*.75;
 nest.gemstone.position.y=1.14+Math.sin(state.elapsed*2+nest.x)*.09;
 nest.haze.material.opacity=nest===state.nest?.72:.42;
 if(nest!==state.nest||nest.hit)return;
 nest.spawnIn-=dt;
 if(nest.crew.length&&nest.spawnIn<=0){
  const angle=rand()*TAU,range=3.2+rand()*2.2;
  const site=safeFieldPoint(nest.x+Math.cos(angle)*range,nest.z+Math.sin(angle)*range,.55)||vec(nest.x,nest.y,nest.z);
  const enemy=makeHusk(nest.crew.shift(),site.x,site.z);
  enemy.hunt=true;enemy.nest=nest;
  addSparks(site.clone().add(vec(0,.8,0)),0xcb91e7,11,3.2);
  nest.spawnIn=.79;
 }
 nest.remaining=nest.crew.length+enemies.reduce((n,e)=>n+Number(e.active&&e.nest===nest),0);
 if(nest.remaining===0){
  nest.hit=registerHit(nest.gemstone,nest);
  nest.shield.visible=false;
  notice('Core exposed');sound('pickup');
 }
}
function stageReward(){
 const bonus=hero.cache===3&&!state.allClear;
 if(bonus)state.allClear=true;
 awardWave(bonus);
 bankSalvage(false,true);
}
function hurtNest(nest,damage,point){
 if(state.nest!==nest||!nest.active||!nest.hit||state.finished)return;
 nest.hp=Math.max(0,nest.hp-damage);
 state.hit=.16;addSparks(point,0xd8a4f0,8,4);
 if(nest.hp>0)return;
 removeTarget(shotProps,nest.hit);nest.hit=null;
 nest.active=false;state.nest=null;state.nestsCleared++;
 nest.haze.material.dispose();stage.remove(nest.group);
 collectPart('quartz',2);collectPart('charge',1);restock(32);
 hero.hp=Math.min(hero.maxhp,hero.hp+22);
 state.wave=state.nestsCleared;stageReward();
 if(state.nestsCleared===nests.length){finish(true,'All nests destroyed');return}
 addCache(nest.x,nest.z,'airdrop');
}
function nestTick(dt,realTime){
 state.huntTime=Math.max(0,state.huntTime-realTime);
 if(state.huntTime===0){finish(false,'The hunt window expired');return}
 for(const nest of nests)if(nest.active)updateNest(nest,dt);
 trapTick(dt);updateHusks(dt);
 if(!state.finished)moveBolts(dt);
 for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].active)enemies.splice(i,1);
}
function preparePayload(){
 turnOffAtlas();
 state.phase='drop';state.podFuel=70;state.flux=0;state.overclock=false;
 if(!guest)addFluxCrystals();
 state.atlas=PAYLOAD_HP;state.prep=PAYLOAD_PREP;
 text(ui['atlas-name'],'Recovery pod');
 ui['atlas-meter'].setAttribute('aria-label','Recovery pod integrity');
 const pad=groupAt(stage,ox,0,oz);
 ring(pad,mat(0xe7b98b,0x866341),2.33,.039,.06);
 for(let i=0;i<4;i++){
  const flag=groupAt(pad);flag.rotation.y=i*TAU/4;
  block(flag,orange,0,.02,2.31,.44,.035,.65);
 }
 pod=groupAt(stage,ox,22,oz);
 pod.visible=false;
 mesh(pod,hex,steel,0,.32,0,1.08,.56,1.08);
 mesh(pod,hex,mat(0x826246,0,.44),0,.96,0,.97,1.08,.97);
 mesh(pod,hex,trim,0,1.60,0,1.01,.28,1.01);
 for(let i=0;i<6;i++){
  const rail=groupAt(pod);rail.rotation.y=i*TAU/6;
  block(rail,dark,0,.89,.90,.24,.92,.09);
  block(rail,accent,0,1.06,.96,.11,.42,.031,false);
 }
 notice('Prepare the landing zone');
}
function landPayload(){
 pod.position.y=0;pod.visible=true;
 atlasBody.alive=true;atlasBody.top=1.78;atlasBody.r=1.35;
 atlasHit=registerHit(block(pod,invisible,0,.82,0,1.74,1.65,1.74,false),atlasBody);
 obstaclesDirty=true;
 state.phase='payload';state.wave=1;state.spawnIn=1;
 addSparks(vec(0,.2,0),0xe6ae7b,26,6);
 notice('Pod landed');sound('wave','Pod landed');rumble(.45,135);
}
function payloadTick(dt,realTime){
 if(state.phase==='drop'){
  state.prep=Math.max(0,state.prep-realTime);
  pod.visible=state.prep<4;
  pod.position.y=Math.max(0,state.prep/4)**1.27*22;
  trapTick(dt);
  if(!state.prep)landPayload();
  return;
 }
 state.podFuel=Math.max(0,state.podFuel-realTime*.85);
 if(state.podFuel>0)state.siege=Math.min(PAYLOAD_DURATION,state.siege+realTime);
 else{
  state.atlas=Math.max(0,state.atlas-realTime*7);
  if(state.atlas<=0){finish(false,'The recovery pod lost power');return}
 }
 state.stormRadius=lerp(10,49.7,state.podFuel/100);
 state.spawnIn-=dt;
 if(state.spawnIn<=0&&enemies.reduce((n,e)=>n+Number(e.active),0)<23){
  const wave=waves[state.wave-1],angle=rand()*TAU,radius=Math.max(18,state.stormRadius*.80);
  const site=safeFieldPoint(Math.cos(angle)*radius,Math.sin(angle)*radius,.55);
  if(site){
   makeHusk(pick(wave.units),site.x,site.z);
   addSparks(site.clone().add(vec(0,1.2,0)),0xc188ee,10,4.2);
  }
  state.spawnIn=Math.max(.86,2.12-state.wave*.20)*(state.overclock?.72:1);
 }
 trapTick(dt);updateHusks(dt);
 if(state.finished)return;
 moveBolts(dt);if(state.finished)return;
 while(state.siege>=state.wave*PAYLOAD_DURATION/MAX_WAVES){
  stageReward();
  if(state.wave===MAX_WAVES){finish(true,'Pod transmission recovered');return}
  const theta=state.wave*2.39;
  addCache(Math.cos(theta)*5.8,Math.sin(theta)*5.8,'airdrop');
  state.wave++;restock(24);
 }
 for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].active)enemies.splice(i,1);
}
function sealTick(dt,realTime){
 if(state.phase==='fuel'){
  trapTick(dt);
  return;
 }
 state.siege=Math.min(SEAL_DURATION,state.siege+realTime);
 state.spawnIn-=dt;
 const wave=waves[state.wave-1];
 if(state.spawnIn<=0&&enemies.reduce((n,e)=>n+Number(e.active),0)<22){
  const kind=pick(wave.units),[x,z]=pick(portals);
  makeHusk(kind,x+(rand()-.5)*2.4,z+(rand()-.5)*2.4);
  state.spawnIn=Math.max(1.18,3.15-state.wave*.32);
 }
 trapTick(dt);updateHusks(dt);
 if(state.finished)return;
 moveBolts(dt);
 if(state.finished)return;
 while(state.siege>=state.wave*SEAL_SLICE){
  const bonus=hero.cache===3&&!state.allClear;
  if(bonus)state.allClear=true;
  awardWave(bonus);
  bankSalvage(false,true);
  if(state.wave===MAX_WAVES){finish(true,'Rift sealed');return}
  state.wave++;
  hero.hp=Math.min(hero.maxhp,hero.hp+13);restock(21);
  const [x,z]=[[-5,7],[6,5],[-6,-6],[6,-6]][dropIndex++%4];
  addCache(x,z,'airdrop');
 }
}
function waveTick(dt,realTime=dt){
 if(state.mission==='nests'){nestTick(dt,realTime);return}
 if(state.mission==='payload'){payloadTick(dt,realTime);return}
 if(state.mission==='seal'){sealTick(dt,realTime);return}
 if(state.phase==='arming'){
  state.prep=Math.max(0,state.prep-realTime);
  if(state.prep>0){trapTick(dt);return}
  state.phase='active';
  for(const lane of plannedFronts())portalFx[lane].active=true;
 }
 if(state.phase!=='active'){trapTick(dt);return}
 state.waveTime+=dt;
 state.spawnIn-=dt;
 if(state.pending>0&&state.spawnIn<=0&&enemies.filter(enemy=>enemy.active).length<24)spawnHusk();
 trapTick(dt);
 updateHusks(dt);
 if(state.finished)return;
 if(state.pending===0&&!enemies.some(e=>e.active)){clearWave();return}
 moveBolts(dt);
}
function animateWorld(dt){
 riftDome.material.uniforms.uTime.value=state.elapsed;
 riftDome.position.set(state.mission==='nests'?0:ox,0,state.mission==='nests'?0:oz);
 const rim=state.stormRadius/49.7;
 riftDome.scale.set(rim,Math.max(.48,rim),rim);
 riftDome.material.uniforms.uPressure.value=['active','seal','payload','hunt'].includes(state.phase)?.26+state.wave*.086:.08;
 atlasCore.rotation.y+=dt*.91;
 atlasCore.position.y=Math.sin(state.elapsed*2)*.147;
 atlasRing.rotation.z+=dt*.48;
 atlasRing.rotation.y=Math.sin(state.elapsed*2)*.31;
 atlasBeacon.material.opacity=(.08+Math.sin(state.elapsed*2.01)*.03)*Math.max(.24,state.atlas/ATLAS_HP);
 const fronts=plannedFronts();
 for(const [index,portal] of portalFx.entries()){
  portal.rot.visible=portal.active;
  portal.survey.visible=!portal.active;
  portal.warning.visible=!portal.active&&fronts.includes(index);
  if(portal.warning.visible)portal.warning.scale.setScalar(.92+Math.sin(state.elapsed*3+index)*.08);
  portal.outer.rotation.y+=dt*.88;
  portal.rot.rotation.z=Math.sin(state.elapsed*2.4)*.18;
  portal.flare.material.opacity=portal.active?.9+Math.sin(state.elapsed*5.2)*.1:.08;
  portal.survey.rotation.y+=dt*.41;
 }
}

const xbox={a:'A',b:'B',x:'X',y:'Y',lb:'LB',rb:'RB',lt:'LT',rt:'RT',view:'View',menu:'Menu',ls:'LS',rs:'RS'};
const families={
 xbox,
 ps:{a:'✕',b:'○',x:'□',y:'△',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'Create',menu:'Options',ls:'L3',rs:'R3'},
 ns:{a:'B',b:'A',x:'Y',y:'X',lb:'L',rb:'R',lt:'ZL',rt:'ZR',view:'−',menu:'+',ls:'L-Stick',rs:'R-Stick'},
 ouya:{a:'O',b:'A',x:'U',y:'Y',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'System',menu:'Menu',ls:'L3',rs:'R3'}
};
let padInfo=null,padLabels=xbox,padFamily='xbox',lastPad=[],padIndex=-1,padMenuMove=false;
let mouseFire=false,mouseAim=false,mouseLook=false;
function family(gamepad){
 if(families[config.pad])return config.pad;
 const id=gamepad.id.toLowerCase();
 if(/045e|xbox|xinput/.test(id))return 'xbox';
 if(/054c|dualshock|dualsense|playstation|wireless controller/.test(id))return 'ps';
 if(/057e|nintendo|switch|joy-con/.test(id))return 'ns';
 if(/2836|ouya/.test(id))return 'ouya';
 return 'xbox';
}
function boardFocus(current,horizontal,vertical){
 if(state.screen!=='brief')return false;
 const cards=[...missionControls.values()],index=cards.indexOf(current);
 const active=missionControls.get(state.mission);
 let next=null;
 if(index>=0){
  if(horizontal&&index%2+horizontal>=0&&index%2+horizontal<2)next=cards[index+horizontal];
  if(vertical<0)next=index>=2?cards[index-2]:ui['region-picker'];
  if(vertical>0)next=index<2?cards[index+2]:ui['alert-toggle'];
  if(horizontal<0&&index%2===0)next=ui.deploy;
 }else if(current===ui['region-picker']&&vertical>0)next=active;
 else if(current===ui['alert-toggle']&&vertical<0)next=active;
 else if(current===ui.deploy&&(horizontal>0||vertical>0))next=active;
 if(!next)return false;
 next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});
 return true;
}
function rumble(strength,duration){
 if(remoteSeat)return;
 if(!config.vibration||state.look!=='pad')return;
 try{padInfo?.vibrationActuator?.playEffect('dual-rumble',{duration,strongMagnitude:strength,weakMagnitude:strength*.66}).catch(()=>{})}catch(error){}
}
function pollController(dt){
 padInfo=options.local||config.pad!=='kb'?StormwatchHub.controllerPad():null;
 if(!padInfo){
  lastPad=[];padIndex=-1;padMenuMove=false;
  if(state.look==='pad'){state.look='keys';syncBriefing()}
  return null;
 }
 const buttons=Array.from({length:17},(_,i)=>(padInfo.buttons[i]?.value||0)>.36||!!padInfo.buttons[i]?.pressed);
 const samePad=padIndex===padInfo.index;
 const edge=i=>samePad&&buttons[i]&&!lastPad[i];
 const dz=n=>Math.abs(n)>.16?Math.sign(n)*(Math.abs(n)-.16)/.84:0;
 const [side,negativeAhead,rx,ry]=Array.from({length:4},(_,i)=>dz(padInfo.axes[i]||0));
 const type=family(padInfo);
 if((buttons.some(Boolean)||[side,negativeAhead,rx,ry].some(n=>Math.abs(n)>.15))&&(state.look!=='pad'||type!==padFamily)){
  state.look='pad';padFamily=type;padLabels=families[type];syncBriefing();
 }
 if(state.edit){editPad(edge);return padResult()}
 if(state.paused){
  const confirm=padFamily==='ns'?1:0,back=padFamily==='ns'?0:1;
  const axisMove=Math.abs(side)>.48||Math.abs(negativeAhead)>.48;
  const move=edge(14)||edge(12)?-1:edge(15)||edge(13)?1:axisMove&&!padMenuMove?(Math.abs(side)>.48?Math.sign(side):Math.sign(negativeAhead)):0;
  padMenuMove=axisMove;
  const current=fieldFocus();
  if(move&&boardFocus(current,edge(14)?-1:edge(15)?1:0,edge(12)?-1:edge(13)?1:0))return padResult();
  if(move&&current===ui['trap-picker']&&Math.abs(move)===1&&(edge(14)||edge(15))){
   state.recipe=(state.recipe+move+trapRecipes.length)%trapRecipes.length;updateTrapPicker();
  }else if(move){
   const available=[...ui.screen.querySelectorAll('button:not(:disabled),select:not(:disabled),input[data-audio-option]')].filter(node=>!node.closest('[hidden]'));
   const control=current;
   if(control?.matches('input[type=range]')&&(edge(14)||edge(15))){
    if(edge(14))control.stepDown();else control.stepUp();
    control.dispatchEvent(new Event('input',{bubbles:true}));
    return padResult();
   }
   if(control?.matches('select')&&(edge(14)||edge(15))){
    control.selectedIndex=(control.selectedIndex+move+control.options.length)%control.options.length;
    control.dispatchEvent(new Event('change',{bubbles:true,composed:true}));
    return padResult();
   }
   const x=edge(14)?-1:edge(15)?1:!edge(12)&&!edge(13)&&Math.abs(side)>.48?Math.sign(side):0;
   const next=StormwatchHub.directionalControl(available,control,x,x?0:move);
   if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest'})}
  }
  if(edge(confirm)){
   const current=fieldFocus(),action=current?.dataset.action;
   if(action)menuAction(action,false);
   else if(current?.matches('button,input[type=checkbox]'))current.click();
  }else if(edge(back)){
   menuAction(state.screen==='citadel'?'citadelBack':state.screen==='pause'||state.screen==='pack'?'deploy':'exit',false);
  }else if(edge(9)&&(state.screen==='pause'||state.screen==='pack')||edge(8)&&state.screen==='pack')menuAction('deploy',false);
 }else if(edge(9))showScreen('pause');
 else{
  const bend=n=>Math.sign(n)*Math.abs(n)**1.55;
  hero.yaw-=bend(rx)*dt*3.05*config.sensitivity;
  hero.pitch=clamp(hero.pitch-bend(ry)*dt*2.38*config.sensitivity,-1.16,.97);
  if(edge(11)){openEditor();return padResult()}
  if(edge(8)){showScreen('pack');return padResult()}
  if(edge(0))jump();
  if(edge(2)&&!interactField())reload();
  if(edge(3))switchWeapon();
  if(edge(4))toggleBuilding();
  if(edge(1))fortify();
  if(edge(5)){if(state.building)fortify();else useAbility()}
  if(!state.building&&edge(14))state.ability=(state.ability+3)%4;
  if(!state.building&&edge(15))state.ability=(state.ability+1)%4;
  if(!state.building&&edge(13))playEmote();
  if(state.building){
   if(edge(6))cycleMaterial();
   if(edge(14))selectPiece(0);
   if(edge(12))selectPiece(1);
   if(edge(15))selectPiece(2);
   if(edge(13))selectPiece(4);
  }else if(edge(12))craftAmmo();
 }
 return padResult();
 function padResult(){
  lastPad=buttons;padIndex=padInfo.index;
  return {side,ahead:-negativeAhead,fire:buttons[7],aim:buttons[6],place:buttons[7]&&!pollController.wasFire,sprint:buttons[10]};
 }
}
pollController.wasFire=false;

function toggleBuilding(){
 state.building=!state.building;
 hero.reload=0;hero.swingTime=0;
 if(state.building)hero.aim=false;
}
function selectPiece(piece){
 if(!state.building)toggleBuilding();
 state.piece=piece;
}
function cycleMaterial(){
 state.material=(state.material+1)%materials.length;
}
function bodyPause(){
 if(state.finished||state.screen==='brief')return;
 showScreen('pause');
}
function requestMouse(){
 if(options.local)return;
 state.look='keys';syncBriefing();
 if(document.pointerLockElement===canvas)return;
 if(!canvas.requestPointerLock){state.pointerHint=true;return}
 try{
  canvas.requestPointerLock()?.catch(()=>{state.pointerHint=true});
 }catch(error){state.pointerHint=true}
}
function deploy(lock){
 unlockAudio();
 if(state.finished)return;
 const savedProfile=citadel?.snapshot()||profile;
 if(!state.deployed&&!options.hub&&!coop&&StormwatchCitadel.rating(savedProfile).power<region.floor&&
   !operations.campaignProgress(savedProfile).unlocked.includes(regionId)){
  ui.summary.textContent=region.name+' requires Power '+region.floor;return;
 }
 if(!state.deployed){
  state.deployed=true;state.started=Date.now();
  if(coop){
   const seat=Math.max(1,[...coop.names.keys()].indexOf(coop.id));
   const x=coop.host?-4.5:2.9,z=coop.host?11:10+2*seat;
   const spawn=safeFieldPoint(x,z,.7);
   if(spawn)hero.pos.copy(spawn);
  }
  const alert=operations.dailyAlert(operations.windows(state.started).day);
  if(state.alertRequested&&alert.mission===state.mission)state.modifier=alert;
  if(state.mission==='nests')prepareNests();
  if(state.mission==='payload')preparePayload();
  if(state.finished)return;
  if(state.mission==='seal'){
   state.phase='fuel';if(!guest)addFluxCrystals();text(ui['atlas-name'],'Rift Anchor');
   ui['atlas-meter'].setAttribute('aria-label','Rift Anchor integrity');
  }
  if(state.mission==='defense'&&!guest)addFluxCrystals();
  profile=savedProfile;squad=StormwatchCitadel.rating(profile);
  if(state.mission==='defense'&&!guest){
   const fort=profile.outposts?.[regionId];
   state.outpostTier=Math.min(5,profile.outpostWins?.[regionId]||0);
   if(fort?.seed===mapSeed){
    for(const index of (fort.layoutVersion===2?fort.cleared:[])){const prop=props[index];if(prop?.alive){prop.hp=0;breakProp(prop,vec(prop.x,prop.y,prop.z),true)}}
    syncBuilds(fort.rows);
   }
  }
  const resilience=StormwatchCitadel.fieldResearch(profile).resilience;
  hero.maxhp=100+(squad.vital.Vitality-10)*2+6*resilience;
  hero.maxShield=60+Math.round((squad.vital.Toughness-10)*1.3)+3*resilience;
  hero.hp=hero.maxhp;hero.shield=hero.maxShield;
  for(let i=0;i<guns.length;i++){
   const key=profile.fieldLoadout?.[i];
   if(key&&gear?.canForge(key)&&profile.blueprints[key]?.kind==='weapon'){
    guns[i].model?.parent?.remove(guns[i].model);guns[i]=gear.weapon(key);repaintWeaponSlot(i);
   }
   guns[i]=armWeapon(guns[i],12);
  }
 }
 state.paused=false;state.screen='play';
 ui.screen.hidden=true;ui.hud.hidden=false;
 if(surface.activeElement instanceof HTMLElement)surface.activeElement.blur();
 canvas.focus({preventScroll:true});
 if(lock)requestMouse();
 cameraTick(0);
}
function menuAction(action,lock){
 if(action==='deploy')deploy(lock);
 if(action==='exit')ui.exit.onclick();
 if(action==='pass')options.leave?.('pass');
 if(action==='citadel'&&citadel)citadel.prepareUI().then(attach=>{
  if(controller.signal.aborted)return;
  showScreen('citadel');unmountCitadel=attach(ui['citadel-root']);
 }).catch(()=>{ui.summary.textContent='Citadel management could not load.'});
 if(action==='citadelBack'){
  unmountCitadel?.();unmountCitadel=null;
  showScreen('brief');
 }
 if(action==='drop-stock'){dropSupplies();fillPack()}
 if(action==='craft'){craftAmmo();fillPack()}
 if(action==='fabricate'||action==='field-crate')fabricateWeapon(lock,action==='field-crate');
 if(action==='traps'){selectPiece(3);deploy(lock)}
 if(action==='retry'){if(options.leave)options.leave('retry',{region:regionId,mission:state.mission,alert:state.alertRequested});else location.reload()}
 if(action==='help'){
  ui.guide.hidden=!ui.guide.hidden;
  ui.help.setAttribute('aria-expanded',String(!ui.guide.hidden));
  syncBriefing();
 }
 if(action==='audio'){
  const panel=ui['field-audio-settings'],button=ui['field-audio'];
  panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)panel.querySelector('input').focus();
 }
}
for(const button of [ui.deploy,ui.retry,ui.pass,ui.help,ui.craft,ui['drop-stock'],ui['field-crate'],ui.fabricate,ui.traps,ui.citadel,ui['citadel-back'],ui['field-audio']]){
 button.onclick=event=>menuAction(button.dataset.action,event.detail>0||state.look!=='pad');
}
function focusedButton(){
 const button=state.screen==='result'?ui.retry:state.screen==='citadel'?ui['citadel-back']:ui.deploy;
 button.focus({preventScroll:true});
}
function syncBriefing(){
 const p=state.look==='pad'?padLabels:null;
 ui['controls-fight'].textContent=p?p.ls+' move · '+p.rs+' look · '+p.a+' jump · '+p.rt+' attack · '+p.y+' swap · '+p.x+' reload':
  'WASD move · Space jump · LMB attack · 1–3 / V equip · R reload';
 ui['controls-build'].textContent=p?p.lb+' build · D-pad pieces · '+p.lt+' material · '+p.rt+' place · '+p.rs+' edit':
  'Q build · 1–4 pieces · T trap · RMB material · B edit · G repair';
 ui['controls-mission'].textContent=p?p.view+' field kit · '+p.x+' interact / reload · '+p.rb+' ability · D-pad ←/→ select · ↑ craft ammo':
  'Tab field kit · F chest · 5–8 abilities · C craft ammo';
}
const trapPicker=ui['trap-picker'];
for(const [index,recipe] of trapRecipes.entries()){
 const option=document.createElement('option');option.value=index;
 option.textContent=recipe.name+' · '+recipe.mount;trapPicker.append(option);
}
function trapCost(recipe){
 return recipe.cost.map((n,i)=>n?n+' '+materials[i].name:'').filter(Boolean).join(' · ');
}
function updateTrapPicker(){
 const recipe=trapRecipes[state.recipe];trapPicker.value=state.recipe;
 text(ui['trap-recipe'],trapCost(recipe)+' / '+recipe.charges+' charges');
}
trapPicker.onchange=()=>{state.recipe=Number(trapPicker.value);updateTrapPicker()};
const fabricationPicker=ui['fabrication-picker'];
const fabricationBag={parts:5,powder:3,gears:2};
const fabricationStocks=[8,4,10];
function fabricateChoices(){
 return Object.entries(profile.blueprints).filter(([id,item])=>item.kind==='weapon'&&gear?.canForge(id));
}
function updateFabricator(){
 const available=fabricateChoices(),current=fabricationPicker.value;
 ui.fabricator.hidden=!available.length;ui.fabricate.hidden=!available.length;
 fabricationPicker.replaceChildren(...available.map(([id,item])=>{
  const option=document.createElement('option');option.value=id;option.textContent=item.name;return option;
 }));
 if(available.some(([id])=>id===current))fabricationPicker.value=current;
 const field=Object.entries(fabricationBag).map(([key,n])=>
  fieldBag[key]+'/'+n+' '+StormwatchCitadel.components[key]);
 const stock=fabricationStocks.map((n,i)=>hero.stacks[i]+'/'+n+' '+materials[i].name);
 text(ui['fabrication-cost'],[...field,...stock].join(' · '));
 ui.fabricate.disabled=!available.length||Object.entries(fabricationBag).some(([key,n])=>fieldBag[key]<n)||
  fabricationStocks.some((n,i)=>hero.stacks[i]<n);
}
function weaponCrate(key,x,z,power,element){
 if(!guest)while(loot.some(l=>l.kind==='weapon'&&l.active&&Math.hypot(l.x-x,l.z-z)<.07))x+=.16;
 addCache(x,z,'weapon');
 const item=loot.at(-1);
 Object.assign(item,{opened:true,reward:{k:key,name:profile.blueprints[key]?.name||key},power,element});
}
function fabricateWeapon(lock,drop=false){
 const key=fabricationPicker.value;
 if(state.screen!=='pack'||ui.fabricate.disabled||!fabricateChoices().some(([id])=>id===key))return;
 if(Object.entries(fabricationBag).some(([id,n])=>fieldBag[id]<n)||fabricationStocks.some((n,i)=>hero.stacks[i]<n))return;
 if(guest){coopAction('fabricate',{key,drop});deploy(lock);return}
 for(const [id,n] of Object.entries(fabricationBag))fieldBag[id]-=n;
 hero.stacks=hero.stacks.map((n,i)=>n-fabricationStocks[i]);
 if(drop){
  const design=StormwatchCitadel.tune(profile.blueprints[key]);
  weaponCrate(key,hero.pos.x,hero.pos.z,Math.max(region.floor,Math.round(design.power)),design.element||'Kinetic');
  deploy(lock);return;
 }
 const weapon=gear.weapon(key);
 const index=guns[hero.weapon]?hero.weapon:0;
 guns[index].model?.parent?.remove(guns[index].model);
 guns[index]=armWeapon(weapon,Math.max(12,region.floor));
 repaintWeaponSlot(index);switchWeapon(index);
 deploy(lock);sound('pickup');
}
function fillPack(){
 updateTrapPicker();
 updateFabricator();
 const salvage=Object.entries(fieldBag).filter(([,n])=>n>0).map(([id,n])=>n+' '+StormwatchCitadel.components[id]);
 text(ui['pack-stock'],[materials.map((m,i)=>m.name+' '+hero.stacks[i]).join(' / '),...salvage].join(' · '));
 ui['pack-weapons'].replaceChildren(...guns.map(gun=>{
  const item=document.createElement('div'),name=document.createElement('b'),ammo=document.createElement('small');
  item.className='pack-item';name.textContent=gun.name+' · P'+gun.power+' '+gun.element;ammo.textContent=gun.mag+' / '+gun.reserve;
  item.append(name,ammo);return item;
 }));
 ui['field-crate'].disabled=ui.fabricate.disabled;
 ui['field-crate'].hidden=ui.fabricate.hidden;
 ui['drop-stock'].disabled=hero.stacks.some(n=>n<10);
 for(const item of citadel?.snapshot()?.backpack||[]){
  if(!gear?.canForge(item.key))continue;
  const button=document.createElement('button');
  button.textContent='Equip '+item.design.name+' · Lv '+item.design.level+' · Tier '+item.design.tier;
  button.onclick=async()=>{
   button.disabled=true;
   if(await citadel.dispatch({type:'unpack-weapon',serial:item.serial})){
    equipLoot({k:item.key,name:item.design.name,power:StormwatchCitadel.tune(item.design).power},item.design);
   }
   if(!controller.signal.aborted)fillPack();
  };
  ui['pack-weapons'].append(button);
 }
 ui.craft.disabled=hero.stacks[1]<6||hero.stacks[2]<4||guns.every(gun=>gun.reserve>=360);
}
const regionPicker=ui['region-picker'];
function updateRegions(){
 const saved=citadel?.snapshot()||profile,power=StormwatchCitadel.rating(saved).power;
 const unlocked=operations.campaignProgress(saved).unlocked;
 regionPicker.replaceChildren(...Object.entries(regions).map(([id,preset])=>{
  const option=document.createElement('option');option.value=id;
  option.disabled=preset.floor>power&&!unlocked.includes(id);
  option.textContent=preset.name+' · '+preset.floor+'–'+preset.ceiling;
  return option;
 }));
 regionPicker.value=regionId;
}
regionPicker.onchange=()=>{
 if(state.deployed||regionPicker.value===regionId)return;
 if(embedded)options.leave('region',{region:regionPicker.value,mission:state.mission,alert:state.alertRequested});
 else{
  const url=new URL(location.href);
  url.searchParams.set('region',regionPicker.value);url.searchParams.set('mission',state.mission);location.assign(url);
 }
};
const boardCopy={
 defense:['5 waves','M5 16h10v11H5zm10-6h10v17H15zm10 6h10v11H25zM5 8h5m22 0h3'],
 seal:['4-minute siege','M20 4 30 16 20 30 10 16zM4 19q6 5 11 0m10 0q5 5 11 0'],
 nests:['5 roaming encounters','M20 5v6m0 12v7M7 17h6m14 0h6M20 11l6 6-6 6-6-6z'],
 payload:['Fuel-powered shelter','M12 14h16v14H12zM5 9l6 5m24-5-6 5M20 2v11m-3-4 3 4 3-4']
};
const missionControls=new Map();
for(const [id,entry] of Object.entries(operations.missions)){
 const [format,path]=boardCopy[id];
 const button=document.createElement('button');
 button.type='button';button.className='op-option';button.dataset.operation=id;
 button.innerHTML='<svg viewBox="0 0 40 34" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="'+path+'"/></svg>'+
  '<span><b></b><small></small></span>';
 button.querySelector('b').textContent=entry.name;button.querySelector('small').textContent=format;
 button.onclick=()=>{
  if(state.deployed)return;
  state.mission=id;
  if(operations.dailyAlert(operations.windows(Date.now()).day).mission!==id)state.alertRequested=false;
  if(!embedded){
   const url=new URL(location.href);url.searchParams.set('mission',id);
   try{history.replaceState(null,'',url)}catch(error){}
  }
  updateMissionBrief();drawSectorMap();
 };
 ui['mission-cards'].append(button);missionControls.set(id,button);
}
ui['alert-toggle'].onclick=()=>{
 if(state.deployed)return;
 const alert=operations.dailyAlert(operations.windows(Date.now()).day);
 if(state.mission!==alert.mission){
  state.mission=alert.mission;state.alertRequested=true;
 }else state.alertRequested=!state.alertRequested;
 updateMissionBrief();drawSectorMap();
};
listen(ui.board,'keydown',event=>{
 const horizontal=event.code==='ArrowLeft'?-1:event.code==='ArrowRight'?1:0;
 const vertical=event.code==='ArrowUp'?-1:event.code==='ArrowDown'?1:0;
 if(boardFocus(surface.activeElement,horizontal,vertical))event.preventDefault();
});
function updateMissionBrief(){
 const active=operations.missions[state.mission],snapshot=citadel?.snapshot()||profile;
 for(const [id,button] of missionControls)button.setAttribute('aria-pressed',String(id===state.mission));
 text(ui['operation-title'],active.name);text(ui.summary,active.brief);
 text(ui['board-power'],'Power '+StormwatchCitadel.rating(snapshot).power);
 text(ui['map-sector'],zoneName);
 const {alert,orders}=operations.board(snapshot,Date.now());
 const engaged=state.alertRequested&&state.mission===alert.mission;
 text(ui['alert-name'],alert.name);
 text(ui['alert-mode'],engaged?'Alert enabled':orders.alertClaimed?'Reward collected':operations.missions[alert.mission].name);
 const resources=Object.entries(alert.bonus).map(([key,n])=>n+' '+StormwatchCitadel.components[key]).join(' · ');
 text(ui['alert-detail'],engaged?alert.description.split('. ')[0]+' · '+resources:orders.alertClaimed?'':resources);
 ui['alert-toggle'].setAttribute('aria-pressed',String(engaged));
}
function drawSectorMap(){
 const cv=ui['sector-map'],ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
 const px=x=>w*.5+x*5.7,pz=z=>h*.5+z*2.35;
 const color=regionId==='obsidian'?'#2c495e':regionId==='canyonlands'?'#584b41':'#274343';
 ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
 // Shading is sampled from the same height function that drives the terrain mesh and Rapier.
 for(let z=-48;z<=48;z+=2)for(let x=-59;x<=59;x+=2){
  const elevation=terrainHeight(x,z),light=Math.min(.34,elevation*.103+.032);
  ctx.fillStyle='rgba(200,220,182,'+light+')';ctx.fillRect(px(x),pz(z),11.8,5);
 }
 for(const [level,opacity] of [[.23,.19],[.49,.22],[.82,.26],[1.19,.25],[1.62,.18]]){
  ctx.strokeStyle='rgba(225,229,188,'+opacity+')';ctx.lineWidth=1.25;ctx.beginPath();
  for(let z=-48;z<48;z+=4)for(let x=-56;x<56;x+=4){
   const corners=[[x,z],[x+4,z],[x+4,z+4],[x,z+4]],altitudes=corners.map(([a,b])=>terrainHeight(a,b));
   const cross=[];
   for(let i=0;i<4;i++){
    const j=(i+1)%4,a=altitudes[i],b=altitudes[j];
    if((a>=level)===(b>=level))continue;
    const fraction=(level-a)/(b-a);
    cross.push([px(lerp(corners[i][0],corners[j][0],fraction)),pz(lerp(corners[i][1],corners[j][1],fraction))]);
   }
   for(let i=0;i+1<cross.length;i+=2){ctx.moveTo(...cross[i]);ctx.lineTo(...cross[i+1])}
  }
  ctx.stroke();
 }
 ctx.strokeStyle='#b2d2bc42';ctx.lineWidth=1;
 for(let x=-50;x<=50;x+=10){ctx.beginPath();ctx.moveTo(px(x),0);ctx.lineTo(px(x),h);ctx.stroke()}
 for(let z=-40;z<=40;z+=10){ctx.beginPath();ctx.moveTo(0,pz(z));ctx.lineTo(w,pz(z));ctx.stroke()}
 ctx.setLineDash([5,7]);ctx.strokeStyle='#d9dcc587';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(px(0),0);ctx.lineTo(px(0),h);ctx.moveTo(0,pz(-1));ctx.lineTo(w,pz(-1));ctx.stroke();
 ctx.setLineDash([]);ctx.strokeStyle='#d3a8f0aa';
 ctx.beginPath();ctx.ellipse(w*.5,h*.5,49.7*5.7,49.7*2.35,0,0,TAU);ctx.stroke();
 for(const shelter of shelters){
  ctx.fillStyle='#bcdbcebb';ctx.fillRect(px(shelter.x)-9,pz(shelter.z)-4,18,8);
 }
 const mark=(x,z,tint,size)=>{
  ctx.fillStyle=tint;ctx.beginPath();ctx.moveTo(px(x),pz(z)-size);ctx.lineTo(px(x)+size,pz(z));
  ctx.lineTo(px(x),pz(z)+size);ctx.lineTo(px(x)-size,pz(z));ctx.closePath();ctx.fill();
 };
 if(state.mission==='nests'){
  for(const site of nestSites())mark(site.x,site.z,'#deb1e9',7);
 }else if(state.mission==='seal'){
  [[-12,12],[14,-9],[-13,-16]].forEach(([x,z])=>mark(x,z,'#a3e6d0',6));mark(0,0,'#fad294',9);
 }else{
  mark(0,0,'#fad294',9);
  for(const [x,z] of portals)mark(x,z,'#c58ee1bb',5);
 }
 ctx.fillStyle='#e7eece';ctx.font='bold 14px system-ui';ctx.fillText('N',w-25,21);
}
updateRegions();
function showScreen(mode){
 if(state.edit)closeEditor(false);
 state.paused=true;state.screen=mode;
 fieldCaptions.clear();
 mouseFire=mouseAim=mouseLook=false;keys.clear();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 ui.screen.hidden=false;ui.screen.dataset.mode=mode;
 const pack=mode==='pack',citadelPanel=mode==='citadel';
 ui.board.hidden=mode!=='brief'||options.hub;
 ui['operation-title'].hidden=mode!=='brief';
 ui.citadel.hidden=mode!=='brief'||options.hub;
 ui['citadel-back'].hidden=ui['citadel-root'].hidden=!citadelPanel;
 ui.exit.hidden=citadelPanel;
 ui.pack.hidden=ui.craft.hidden=ui.traps.hidden=!pack;
 ui.fabricate.hidden=ui['field-crate'].hidden=ui['drop-stock'].hidden=!pack;
 ui.guide.hidden=true;ui.help.hidden=mode==='result'||pack||citadelPanel;ui.help.setAttribute('aria-expanded','false');
 ui['field-audio'].hidden=mode!=='pause';ui['field-audio'].setAttribute('aria-expanded','false');ui['field-audio-settings'].hidden=true;
 ui.deploy.hidden=mode==='result'||citadelPanel;
 ui.retry.hidden=mode!=='result';
 ui.pass.hidden=mode!=='result'||!embedded||options.local;
 if(mode==='brief'){
  text(ui.kicker,region.site+' · '+zoneName);text(ui.title,'Stormwatch');
  updateMissionBrief();text(ui.deploy,'Deploy');
 }
 if(citadelPanel){
  text(ui.kicker,'Stormwatch');text(ui.title,'The Citadel');text(ui.summary,'');
 }
 if(mode==='pause'||pack){
  ui.kicker.textContent=zoneName+' · Wave '+Math.max(1,state.wave);
  ui.title.textContent=pack?'Field kit':'Paused';
  const margin=Math.round(state.stormRadius-stormDistance(hero.pos.x,hero.pos.z));
  const boundary=margin<0?'Return '+(-margin)+' m toward the center':'Storm boundary '+margin+' m away';
  const recharge=Math.max(0,Math.ceil(5.5-hero.hitAgo));
  const shield=hero.hp<=0?'Awaiting revive':hero.shield>=hero.maxShield?'Shield full':recharge?'Shield recharge in '+recharge+'s':'Shield recharging';
  const repairs=Math.min(hero.repairs,Math.floor(hero.stacks[2]/12));
  ui.summary.textContent=[boundary,shield,state.mission==='nests'?'':repairs+' objective repairs available'].filter(Boolean).join(' · ');
  ui.deploy.textContent='Resume';
  if(pack)fillPack();
 }
 focusedButton();
}
let outcome='';
function resultsSummary(){
 const next=embedded?' '+state.xp+' Battle Pass XP saved'+(state.tier===null?'': ' · Tier '+state.tier)+'.':'';
 const result=state.mission==='nests'?state.nestsCleared+' / 5 nests':
  Math.round(state.atlas)+' '+(state.mission==='payload'?'pod':state.mission==='seal'?'Anchor':'Relay')+' integrity';
 ui.summary.textContent=outcome+'. '+state.takedowns+' Hollows defeated · '+result+'.'+next;
}
function awardWave(bonus){
 if(coop&&!guest){
  sendGame('reward',{wave:state.wave,bonus});
  for(const m of mates.values()){
   m.bag=StormwatchCitadel.emptyBag();
   if(m.vitals.hp>0){
    m.vitals.hp=Math.min(m.vitals.maxhp,m.vitals.hp+15);
    m.vitals.shield=Math.max(m.vitals.shield,25);
    sendGame('feedback',{ammo:24},m.id);
   }
  }
 }
 if(!options.award)return;
 const result=options.award(state.wave,bonus);
 if(!result)return;
 state.tier=result.tier;
 state.xp+=result.xp;
 if(!result.saved)notice('Battle Pass XP could not be saved');
}
function finish(win,message,remote=false){
 if(coop&&!guest&&!remote&&!state.finished)sendGame('end',{win,message});
 if(state.finished)return;
 state.finished=true;outcome=message;
 const overclockBonus=win&&state.mission==='payload'&&state.overclock;
 if(overclockBonus)collectPart('cells',6);
 savingResult=win;ui.retry.disabled=win;ui.pass.disabled=win;
 const rewards=ui['operation-rewards'];rewards.hidden=!win;
 const patterns=[...discoveries.values()].filter(item=>!Object.hasOwn(profile.blueprints,item.id)).length;
 const payout=StormwatchCitadel.payoutText(state.mission,regionId)+(overclockBonus?' · 6 overclock Cells':'')+(patterns?' · '+patterns+' recovered pattern'+(patterns===1?'':'s'):'');
 if(win)text(rewards,'Victory payout · '+payout+' · Saving…');
 bankSalvage(win,false).then(saved=>{
  if(!win||controller.signal.aborted)return;
  savingResult=false;ui.retry.disabled=false;ui.pass.disabled=false;
  text(rewards,saved?'Deposited at the Citadel · '+payout:'Victory payout could not be saved');
  focusedButton();
 });
 if(options.hub){ui.retry.dataset.action='exit';ui.retry.textContent='Return to Command';ui.exit.hidden=true;}
 ui.kicker.textContent=region.site+' · Mission report';
 ui.title.textContent=win?({seal:'Rift sealed',payload:'Payload recovered',nests:'Hunt complete',defense:'Relay secured'})[state.mission]:'Operation failed';
 resultsSummary();
 if(gear?.profile){ui.profile.innerHTML=gear.profile;ui.profile.hidden=false}
 showScreen('result');
 if(options.hub)ui.exit.hidden=true;
}

listen(window,'keydown',event=>{
 const code=event.code;
 if(state.edit){
  if(['Escape','KeyB','Enter','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'].includes(code))event.preventDefault();
  if(event.repeat)return;
  if(code==='Escape'||code==='KeyB')closeEditor(true);
  else if(code==='Enter')applyEdit(true);
  else if(/^Digit[1-9]$/.test(code)){
   const bit=Number(code.slice(-1))-1,n=engineering.dimensions(state.edit.item.piece);
   if(bit<n*n)togglePanel(bit);
  }
  return;
 }
 if(state.paused){
  if(state.screen==='citadel'&&code==='Escape'&&!event.repeat){
   event.preventDefault();menuAction('citadelBack',false);return;
  }
  if(state.screen==='pack'&&code==='Escape'&&!event.repeat){
   event.preventDefault();deploy(state.look==='keys');
  }
  return;
 }
 if(['Space','Tab','KeyW','KeyA','KeyS','KeyD'].includes(code))event.preventDefault();
 if(code==='Escape'){event.preventDefault();bodyPause();return}
 if(code==='Tab'&&!event.repeat){showScreen('pack');return}
 keys.add(code);
 if(event.repeat)return;
 state.look='keys';
 if(code==='Space')jump();
 if(code==='KeyQ')toggleBuilding();
 if(code==='KeyR')reload();
 if(code==='KeyF')interactField();
 if(code==='KeyV')switchWeapon();
 if(code==='KeyE')playEmote();
 if(!state.building){
  if(code==='Digit1')switchWeapon(guns.length);
  if(code==='Digit2')switchWeapon(0);
  if(code==='Digit3'&&guns.length>1)switchWeapon(1);
 }
 if(code==='KeyC')craftAmmo();
 if(code==='KeyG')fortify();
 if(code==='KeyB')openEditor();
 if(code==='KeyX')useAbility();
 if(/^Digit[5-8]$/.test(code))useAbility(Number(code.slice(-1))-5);
 if(code==='Digit1'&&state.building)selectPiece(0);
 if(code==='Digit2'&&state.building)selectPiece(1);
 if(code==='Digit3'&&state.building)selectPiece(2);
 if(code==='Digit4'&&state.building)selectPiece(4);
 if(code==='KeyT')selectPiece(3);
});
listen(window,'keyup',event=>{keys.delete(event.code)});
listen(window,'blur',()=>{keys.clear();mouseFire=mouseAim=mouseLook=false});
listen(document,'visibilitychange',()=>{if(document.hidden&&!state.paused)bodyPause()});
listen(document,'pointerlockchange',()=>{
 const locked=document.pointerLockElement===canvas;
 if(locked)state.pointerHint=false;
 if(!locked&&state.mouse&&!state.paused&&!state.edit&&state.look==='keys')bodyPause();
 state.mouse=locked;
});
listen(document,'pointerlockerror',()=>{state.pointerHint=true});
listen(canvas,'contextmenu',event=>event.preventDefault());
listen(canvas,'wheel',event=>{
 if(state.paused||state.building)return;
 event.preventDefault();if(hero.shot<.1)switchWeapon();
},{passive:false});
listen(canvas,'mousedown',event=>{
 if(state.paused||state.edit)return;
 event.preventDefault();
 state.look='keys';
 unlockAudio();
 if(event.button===2){
  if(state.building)cycleMaterial();
  else mouseAim=true;
  if(!state.mouse)mouseLook=true;
 }
 if(event.button===1&&!state.mouse)mouseLook=true;
 if(event.button!==0)return;
 if(!state.mouse&&!state.pointerHint){requestMouse();return}
 if(state.building)place();
 else mouseFire=true;
});
listen(window,'mouseup',event=>{
 if(event.button===0)mouseFire=false;
 if(event.button===2)mouseAim=false;
 if(event.button===1||event.button===2)mouseLook=false;
});
listen(window,'mousemove',event=>{
 if(state.paused||state.edit||(!state.mouse&&!mouseLook))return;
 state.look='keys';
 hero.yaw-=event.movementX*.0026*config.sensitivity;
 hero.pitch=clamp(hero.pitch-event.movementY*.00235*config.sensitivity,-1.16,.97);
});

function text(el,value){
 value=String(value);
 if(el.textContent!==value)el.textContent=value;
}
function meter(id,value,max){
 const level=Math.round(value);
 const bar=ui[id+'-meter'];
 if(bar.max!==max)bar.max=max;
 if(bar.value!==level)bar.value=level;
 text(ui[id+'-text'],level+' / '+max);
}
const radar=ui.radar.getContext('2d');
const RADAR_W=156;
function drawRadar(){
 radar.clearRect(0,0,RADAR_W,RADAR_W);
 const middle=RADAR_W*.5,scale=(middle-5)/BOUND;
 radar.strokeStyle='#9fcaf842';radar.lineWidth=1;
 radar.beginPath();radar.arc(middle,middle,44,0,TAU);
 radar.moveTo(middle-75,middle);radar.lineTo(middle+75,middle);
 radar.moveTo(middle,middle-75);radar.lineTo(middle,middle+75);radar.stroke();
 radar.fillStyle='#a6bada';radar.font='12px system-ui';radar.textAlign='center';radar.fillText('N',middle,14);
 const dot=(x,z,color,r)=>{
  radar.fillStyle=color;radar.beginPath();
  radar.arc(middle+x*scale,middle+z*scale,r,0,TAU);radar.fill();
 };
 if(state.mission!=='nests')dot(ox,oz,'#8bf0d0',4.3);
 for(const nest of nests)if(nest.active)dot(nest.x,nest.z,nest===state.nest?'#ffc992':'#d58be9',4);
 if(state.mission==='payload'){
  radar.strokeStyle='#d9a8f18a';radar.beginPath();radar.arc(middle+ox*scale,middle+oz*scale,state.stormRadius*scale,0,TAU);radar.stroke();
 }
 const fronts=plannedFronts();
 for(let i=0;i<portals.length&&state.mission!=='nests';i++){
  const [x,z]=portals[i];
  if(fronts.includes(i)){
   radar.strokeStyle=portalFx[i].active?'#dd85fa91':'#ffc786a5';radar.lineWidth=2;
   radar.beginPath();radar.moveTo(middle+x*scale,middle+z*scale);
   radar.lineTo(middle+x*scale*.22,middle+z*scale*.22);radar.stroke();
  }
  dot(x,z,portalFx[i].active?'#dc83ff':fronts.includes(i)?'#ffc786':'#7c6f9e',fronts.includes(i)||portalFx[i].active?5:2.4);
 }
 for(const item of loot)if(item.active){
  const color=item.kind==='flux'?'#c0edd6':item.kind==='cache'?'#fbc477':item.kind==='chest'&&!item.opened?'#df9c69':'#69d6ff';
  dot(item.x,item.z,color,item.kind==='flux'?4.2:item.kind==='chest'?3.2:2.65);
 }
 for(const enemy of enemies)if(enemy.active)dot(enemy.x,enemy.z,enemy.kind==='boss'?'#ffc484':'#ff8495',enemy.kind==='boss'?4.7:2.4);
 radar.save();
 radar.translate(middle+hero.pos.x*scale,middle+hero.pos.z*scale);
 radar.rotate(-hero.yaw);
 radar.fillStyle='#fff';radar.beginPath();radar.moveTo(0,-7);radar.lineTo(5,5);radar.lineTo(0,2);radar.lineTo(-5,5);radar.closePath();radar.fill();
 radar.restore();
}
const iconPaths={
 pickaxe:'<path fill="#e2bb89" d="M19 26 45 7l3 4-26 20Z"/><path fill="#9dc5d4" d="M35 9c8-8 19-6 23 3l-6 1-7-4-8 5Z"/>',
 gun:'<path fill="#b5c5cd" d="m4 22 12-6h22l10-5h13v3l-12 2-8 4-7 1-4 8-8 1 3-9-10 1-7 5Z"/><path fill="#dcb483" d="M25 15V12h9v3Z"/>',
 wall:'<path fill="#73acc2" d="m13 9 35-4v23l-35 4Z"/><path fill="#b1d9de" d="m20 9 3-1v22l-3 1Zm15-2 3-1v23l-3 1Z"/>',
 floor:'<path fill="#83b7c9" d="m4 20 26-10 30 8-27 11Z"/><path fill="#d1e4e0" d="m12 17 30 9 4-2-30-9Z"/>',
 ramp:'<path fill="#7bb1ca" d="m8 28 27-21 20 6v15Z"/><path fill="#c0e2e0" d="m14 23 31-6 4-4-26 5Z"/>',
 cap:'<path fill="#83b7c9" d="m6 25 25-19 28 19-26 6Z"/><path fill="#cadfe6" d="m31 6 2 25-27-6Z"/>',
 trap:'<path fill="#60798d" d="m5 22 25-9 29 8-27 10Z"/><path fill="#d7b28d" d="m15 23 4-10 3 9m6-3 5-13 4 11m3 7 6-11 4 9Z"/>'
};
function slot(parent,label,kind,img=''){
 const container=document.createElement('span');
 container.className='slot';container.title=label;container.setAttribute('aria-label',label);
 container.innerHTML='<img hidden alt=""><svg viewBox="0 0 64 36" aria-hidden="true">'+iconPaths[kind]+'</svg><kbd></kbd>';
 const image=container.querySelector('img');
 if(img){image.src=img;image.hidden=false}
 parent.append(container);
 return {container,key:container.querySelector('kbd')};
}
const toolSlots=[
 slot(ui.hotbar,'Pickaxe','pickaxe'),
 ...guns.map(weapon=>slot(ui.hotbar,weapon.name,'gun',weapon.icon))
];
function repaintWeaponSlot(index){
 const weapon=guns[index],element=toolSlots[index+1].container,img=element.querySelector('img');
 element.title=weapon.name;element.setAttribute('aria-label',weapon.name);
 img.hidden=!weapon.icon;
 if(weapon.icon)img.src=weapon.icon;
}
const buildSlots=['wall','floor','ramp','trap','cap'].map((kind,i)=>slot(ui['build-strip'],pieces[i],kind));
function updateHUD(){
 const p=state.look==='pad'?padLabels:null;

 const existing=aimed?.object.userData.entity;
 const buildMaterial=materials[state.material];
 const left=enemies.reduce((count,e)=>count+(e.active?1:0),state.pending);
 meter('atlas',state.atlas,state.mission==='payload'?PAYLOAD_HP:ATLAS_HP);meter('health',hero.hp,hero.maxhp);meter('shield',hero.shield,hero.maxShield);
 const [ability,cooldown]=selectedAbility(),remaining=abilityCooldown[state.ability];
 meter('pulse',cooldown-remaining,cooldown);
 text(ui['pulse-text'],ability+(remaining>0?' '+Math.ceil(remaining)+'s':''));
 ui['pulse-meter'].setAttribute('aria-label',ability+' recharge');
 const boss=enemies.find(e=>e.active&&e.kind==='boss');
 ui.objective.hidden=state.mission==='nests'&&!boss;
 ui['atlas-name'].closest('.objective-line').hidden=state.mission==='nests';
 ui.boss.hidden=!boss;
 if(boss){meter('boss',boss.hp,boss.max);text(ui['boss-name'],'Stormbreaker · P'+boss.power)}
 const time=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
 if(state.mission==='nests'){
  text(ui.status,'Nests '+state.nestsCleared+' / '+nests.length);
  const nest=state.nest;
  text(ui.remaining,time(Math.ceil(state.huntTime))+' · '+(nest?(nest.hit?'Shatter the core':nest.remaining+' guarding'):'Find a nest'));
 }else if(state.mission==='payload'){
  const prep=state.phase==='drop';
  text(ui.status,(state.overclock?'Overclocked · ':'')+(prep?'Pod landing':'Recovery '+Math.floor(state.siege/PAYLOAD_DURATION*100)+'%'));
  text(ui.remaining,prep?'Collect marked Flux · '+time(Math.ceil(state.prep)):'Fuel '+Math.ceil(state.podFuel)+'% · '+state.flux+' Flux carried'+(state.podFuel<=25?' · Feed the pod':''));
 }else if(state.mission==='seal'){
  text(ui.status,state.phase==='fuel'?'Fuel the Anchor':'Seal · '+time(Math.ceil(SEAL_DURATION-state.siege)));
  text(ui.remaining,state.phase==='fuel'?(state.flux===3?'Fortify, then activate the Anchor':'Flux Crystals '+state.flux+' / 3'):'Hold the Anchor');
 }else{
  const planning=state.phase==='prep'||state.phase==='scout';
  if(ui.mission.dataset.assault!==state.phase)ui.mission.dataset.assault=state.phase;
  text(ui.status,state.phase==='scout'?'Restore the Signal Relay':(state.outpostTier?'Siege '+(state.outpostTier+1)+' · ':'')+'Assault '+Math.min(MAX_WAVES,state.wave+Number(planning))+' / '+MAX_WAVES);
  text(ui.remaining,state.phase==='scout'?'Power cells '+state.flux+' / 2 · Mint markers on radar':
   state.phase==='arming'?'Rifts opening in '+Math.ceil(state.prep)+'s':
   state.phase==='active'?left+' Hollows left':guest?'Build defenses · Leader starts the assault':'Build defenses · Start at the relay');
 }
 const fronts=plannedFronts();
 text(ui.task,fronts.length?'Threat · '+fronts.map(lane=>frontNames[lane]).join(' / '):hero.cache<3?'Caches '+hero.cache+'/3':'');
 text(ui.passStatus,state.phase==='prep'&&loot.some(item=>item.active&&item.kind==='airdrop')?'Airdrop on radar':'');
 text(ui.wood,hero.stacks[0]);text(ui.stone,hero.stacks[1]);text(ui.metal,hero.stacks[2]);
 const gun=currentGun();
 text(ui['held-name'],state.building?(state.piece===3?trapRecipes[state.recipe].name:buildMaterial.name):gun?gun.name+' · P'+gun.power+(gun.element==='Kinetic'?'':' '+gun.element):'Pickaxe');
 text(ui.ammo,state.building?(state.piece===3?trapRecipes[state.recipe].mount:'10'):(gun?(hero.reload>0?'Reloading':gun.mag+' / '+gun.reserve):''));
 ui['build-strip'].hidden=!state.building;
 for(const [i,item] of toolSlots.entries()){
  const index=i===0?guns.length:i-1;
  item.container.dataset.selected=String(!state.building&&hero.weapon===index);
  text(item.key,p?(hero.weapon===index?p.y:''):i+1);
 }
 if(state.building)for(const [i,item] of buildSlots.entries()){
  item.container.classList.toggle('selected',i===state.piece);
  text(item.key,p?['←','↑','→','Kit','↓'][i]:[1,2,3,'T',4][i]);
 }
 let focus='';
 teamHud();
 const nearbyNest=availableNest(),chest=availableChest();
 const control=missionInteraction();
 if(coop&&[...mates.values()].some(m=>m.ready&&m.down&&m.target.distanceTo(hero.pos)<2.65))focus=(p?p.x:'F')+' · Revive squadmate';
 else if(nearbyNest)focus=(p?p.x:'F')+' · Scan nest';
 else if(chest)focus=(p?p.x:'F')+(chest.opened?' · Equip '+chest.reward.name+' · P'+chest.power+' '+chest.element:' · Open chest');
 else if(searchableWreck())focus=(p?p.x:'F')+' · Search wreck';
 else if(control)focus=guest&&state.phase!=='payload'?'Squad leader · '+control:coop&&!coopStarted?'Waiting for squad link':(p?p.x:'F')+' · '+control;
 else if(blueprint?.reason)focus=blueprint.reason;
 else if(existing?.type==='structure'&&aimed.distance<12){
  const stats=Math.ceil(existing.hp)+' / '+existing.max;
  focus=existing.piece===3?existing.recipe.name+' · '+existing.life+' charges':
   existing.construction>0?'Constructing '+pieces[existing.piece]:
   (p?p.rs:'B')+' edit · '+(p?p.b:'G')+' reinforce · R'+existing.rank+' '+stats;
 }
 else if(existing?.type==='atlas'&&state.phase==='prep'&&state.atlas<ATLAS_HP&&objectiveDistance(hero.pos.x,hero.pos.z)<8.5)focus=(p?p.b:'G')+' · Repair relay';
 const harvest=focusedProp?.alive?focusedProp:null;
 const husk=existing?.type==='enemy'&&existing.active&&existing.kind!=='boss'?existing:null;
 const core=existing?.type==='nest'&&existing.hit?existing:null;
 ui.harvest.hidden=!harvest&&!husk&&!core;
 if(harvest){
  const name=harvest.kind===0?(harvest.wide?'Oak':'Pine'):harvest.kind===1?'Boulder':'Wreck';
  text(ui['harvest-name'],name+'  '+harvest.hp+'/'+harvest.max);
  ui['harvest-meter'].max=harvest.max;ui['harvest-meter'].value=harvest.hp;
 }else if(core){
  text(ui['harvest-name'],'Nest core');
  ui['harvest-meter'].max=core.max;ui['harvest-meter'].value=core.hp;
 }else if(husk){
  text(ui['harvest-name'],hollowNames[husk.kind]+' · P'+husk.power+(husk.element==='Kinetic'?'':' '+husk.element));
  ui['harvest-meter'].max=husk.max;ui['harvest-meter'].value=husk.hp;
 }
 ui.prompt.hidden=!focus||!!state.edit;
 text(ui.prompt,focus);
 text(ui.threat,state.pointerHint&&state.look==='keys'?'Hold RMB to look':(p?p.view:'Tab')+' · Field kit');
 drawRadar();
}

text(ui.kicker,region.site+(coop?' · Squad operation':' · Solo operation'));
if(options.hub){
 ui.screen.dataset.hub='';ui.board.hidden=true;ui.citadel.hidden=true;
 text(ui.deploy,coop?'Enter Sector':'Deploy');
}
updateMissionBrief();
syncBriefing();
makeRidge();
const riftDome=makeRiftDome();
makeAtlas();
makePortals();
shelters.forEach(addChest);
drawSectorMap();
for(const [x,z] of [[-8.5,21],[17,-11],[-21,-8]]){
 addCache(x+(rand()-.5)*3.4,z+(rand()-.5)*3.4,'cache');
}
cameraTick(0,true);
function deploymentReady(){
 if(controller.signal.aborted)return;
 coopReady=true;ui.deploy.disabled=false;
 if(coop){deploy(false);notice('Squad uplink · click the field to aim');return}
 if(!surface.activeElement)ui.deploy.focus({preventScroll:true});
}
const fieldProfileReady=StormwatchCitadel.open().then(account=>{
 if(controller.signal.aborted){account.close();return}
 citadel=account;profile=account.snapshot();squad=StormwatchCitadel.rating(profile);
 ui.citadel.disabled=false;updateRegions();updateMissionBrief();
}).catch(()=>{
 if(!controller.signal.aborted)ui.citadel.title='Citadel storage could not load';
});
StormwatchPhysics.create(T,terrainHeight,BOUND).then(engine=>{
 if(controller.signal.aborted){engine.close();return}
 physics=engine;
 for(const object of shotProps)physics.add(object);
 physics.advance(1/60);
}).catch(()=>{
 if(!controller.signal.aborted)ui.summary.textContent='Using local movement and collision.';
}).then(()=>fieldProfileReady).then(deploymentReady);



/* Host owns the operation. Guests predict their own movement and weapon
   feedback, then interpolate the host's world and squad snapshots. */
const mates=new Map(),replicas=new Map(),remoteProjectiles=[];
const coopFields=['elapsed','phase','wave','prep','siege','flux','stormRadius','atlas','pending','nestsCleared','huntTime','takedowns','podFuel','overclock','outpostTier'];
let netClock=0,enemySerial=0,coopStarted=false,signalTick=0;
const guest=Boolean(coop&&!coop.host);
const nround=options.round;
const packVector=v=>v.toArray().map(n=>Math.round(n*100)/100);
const goodVector=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
function sendGame(type,values={},id){
 const data={type,round:nround,...values};
 if(id)coop.direct(id,data);else coop.send(data);
}
function coopAction(action,values={}){
 if(!guest||!coopStarted||hero.hp<=0)return;
 sendGame('action',{action,...values});
}
function hydrateMate(id,point,operator){
 const position=vec().fromArray(point);
 const look=coop.names.get(id)||'Operator';
 const unit=groupAt(scene,...point),body=groupAt(unit),model=gear?.teammate?.(operator);
 const bright=mat(0x6adac9,0x256e78,.2);
 if(model){body.add(model.model)}
 else{
  mesh(body,rock,bright,0,1.46,0,.215,.22,.2);
  block(body,steel,0,.98,0,.49,.69,.28);
  for(const side of [-1,1]){
   block(body,trim,side*.34,1.05,0,.17,.57,.19);
   block(body,steel,side*.13,.34,0,.2,.69,.26);
  }
 }
 const label=document.createElement('canvas');label.width=256;label.height=64;
 const context=label.getContext('2d');
 function updateLabel(down){
  context.clearRect(0,0,256,64);context.fillStyle=down?'#691f2ded':'#133540e8';context.fillRect(8,9,240,46);
  context.font='700 20px system-ui';context.textAlign='center';context.textBaseline='middle';context.fillStyle='#eafaff';
  context.fillText(down?look+' • DOWN':look,128,33,225);
  sprite.material.map.needsUpdate=true;
 }
 const tag=new T.CanvasTexture(label),sprite=new T.Sprite(new T.SpriteMaterial({map:tag,depthWrite:false}));
 sprite.position.y=2.05;sprite.scale.set(options.local?1.45:2.15,options.local?.36:.54,1);unit.add(sprite);updateLabel(false);
 const mate={id,look,operator,unit,body,model,label:sprite,updateLabel,pos:position,target:position.clone(),angle:0,last:0,active:true,down:false,
  vitals:{hp:100,maxhp:100,shield:60,maxShield:60,hitAgo:20,stacks:[40,30,20],repairs:2,cache:0},cooldown:[0,0,0,0],bag:StormwatchCitadel.emptyBag(),ready:false};
 mates.set(id,mate);return mate;
}
function removeMate(id){
 const m=mates.get(id);if(!m)return;
 if(m.model)m.body.remove(m.model.model);scene.remove(m.unit);m.label.material.map.dispose();m.label.material.dispose();mates.delete(id);
}
function peerLife(m,dt){
 m.pos.lerp(m.target,1-Math.exp(-dt*17));m.unit.position.copy(m.pos);
 m.unit.rotation.y+=Math.atan2(Math.sin(m.angle-m.unit.rotation.y),Math.cos(m.angle-m.unit.rotation.y))*Math.min(1,dt*13);
 const moving=m.target.distanceTo(m.pos)>.07;
 m.body.rotation.z=lerp(m.body.rotation.z,m.down?-1.19:0,Math.min(1,dt*12));
 if(m.model)m.model.pose(m.pos,m.unit.rotation.y,moving,dt);
 else m.body.position.y=m.down?-.18:moving?Math.sin(state.elapsed*13)*.043:0;
}
function withMate(m,work){
 const local={...hero},originalAim=aimed,seat=remoteSeat;
 remoteSeat=m;
 Object.assign(hero,m.vitals,{pos:m.target,yaw:m.angle,pitch:m.pitch||0});
 try{return work()}
 finally{
  for(const key of Object.keys(m.vitals))m.vitals[key]=hero[key];
  Object.assign(hero,local);aimed=originalAim;remoteSeat=seat;
 }
}
function livePlayers(){
 const result=[];
 if(hero.hp>0)result.push({pos:hero.pos,mate:null});
 for(const mate of mates.values())if(mate.ready&&mate.vitals.hp>0)result.push({pos:mate.target,mate});
 return result;
}
function downCheck(){
 if(coop&&!guest&&livePlayers().length===0)finish(false,'The squad was downed');
}
function damageMate(m,amount){withMate(m,()=>hurtHero(amount))}
function closestPlayer(x,z){
 return livePlayers().sort((a,b)=>a.pos.distanceToSquared(vec(x,a.pos.y,z))-b.pos.distanceToSquared(vec(x,b.pos.y,z)))[0];
}
function reviveMate(){
 const nearby=[...mates.values()].find(m=>m.ready&&m.vitals.hp<=0&&m.target.distanceTo(hero.pos)<2.65);
 if(nearby){
  nearby.vitals.hp=Math.min(nearby.vitals.maxhp,48);nearby.vitals.hitAgo=0;nearby.down=false;nearby.updateLabel(false);
  sendGame('feedback',{line:'Revived by a squadmate'},nearby.id);notice(nearby.look+' revived');sound('pickup');return true;
 }
 if(remoteSeat&&heroBeforeRemote?.hp<=0&&heroBeforeRemote.pos.distanceTo(hero.pos)<2.65){
  heroBeforeRemote.hp=48;heroBeforeRemote.hitAgo=0;return true;
 }
 return false;
}
let heroBeforeRemote=null;
function remoteAttack(m,d){
 if(performance.now()<m.fireAt||!goodVector(d.aim))return;
 const origin=m.target.clone().add(vec(0,1.39,0)),end=vec().fromArray(d.aim),length=origin.distanceTo(end);
 if(length<.001||length>97||d.axe&&length>3.7)return;
 m.fireAt=performance.now()+(d.axe?440:55);
 const rayHit=shotFrom(origin,end),target=rayHit?.object?.userData.entity,point=rayHit?.point||end;
 const nozzle=goodVector(d.muzzle)?vec().fromArray(d.muzzle):origin;
 sendGame('trace',{from:packVector(nozzle.distanceTo(origin)<2?nozzle:origin),to:packVector(point),owner:m.id,element:d.element});
 if(!target)return;
 const element=Object.hasOwn(elementColors,d.element)?d.element:'Kinetic';
 if(target.type==='prop'){
  if(d.axe||length<48)damageProp(target,d.axe?2:1,point);
 }else if(target.type==='enemy'||target.type==='nest'){
  const head=!!rayHit.object.userData.head;
  const amount=d.axe?67:clamp(Number(d.damage)||0,8,185)*(head?1.49:1);
  if(target.type==='enemy')hurtEnemy(target,amount*engineering.damageFactor(element,target.element),point,head);
  else hurtNest(target,amount,point);
  sendGame('feedback',{hit:head?2:1},m.id);
 }
}
function handleAction(m,d){
 if(!m?.ready||m.vitals.hp<=0||state.finished||!coopStarted)return;
 if(!['fire','dashHit'].includes(d.action)&&performance.now()<(m.actionAt||0))return;
 if(!['fire','dashHit'].includes(d.action))m.actionAt=performance.now()+90;
 const local={...hero},oldPiece=state.piece,oldMat=state.material,oldRecipe=state.recipe;
 heroBeforeRemote=local;
 try{withMate(m,()=>{
  if(d.action==='fire'){remoteAttack(m,d);return}
  if(d.action==='interact'){interactField();return}
  if(d.action==='dashHit'){
   const enemy=enemies.find(e=>e.active&&e.netId===d.enemy);
   if(!enemy||enemyPoint(enemy,.45).distanceTo(m.target.clone().add(vec(0,.7,0)))>3.75)return;
   m.dashed ||= new Map();
   if((m.dashed.get(enemy.netId)||0)>state.elapsed)return;
   m.dashed.set(enemy.netId,state.elapsed+7);
   const bull=d.kind==='bull';
   trapDamage(enemy,bull?61:122,bull?'Kinetic':'Aether');
   const heading=operativeForward();knockHollow(enemy,heading.x,heading.z,93,.70);
   return;
  }
  if(d.action==='fabricate'){
   const key=d.key;
   if(!gear?.canForge(key)||Object.entries(fabricationBag).some(([id,n])=>m.bag[id]<n)||
     fabricationStocks.some((n,i)=>hero.stacks[i]<n))return;
   for(const [id,n] of Object.entries(fabricationBag))m.bag[id]-=n;
   hero.stacks=hero.stacks.map((n,i)=>n-fabricationStocks[i]);
   if(d.drop===true)weaponCrate(key,hero.pos.x,hero.pos.z,Math.max(12,region.floor),'Kinetic');
   else sendGame('feedback',{fabricated:key},m.id);return;
  }
  if(d.action==='drop-stock'){dropSupplies();return}
  if(d.action==='craft'){
   if(hero.stacks[1]>=6&&hero.stacks[2]>=4){hero.stacks[1]-=6;hero.stacks[2]-=4;restock(60)}
   return;
  }
  if(goodVector(d.aim)){
   const p=vec().fromArray(d.aim);
   if(p.distanceTo(m.target)<20)aimed=shotFrom(m.target.clone().add(vec(0,1.48,0)),p);
  }
  if(d.action==='place'&&pieces[d.piece]&&materials[d.material]&&trapRecipes[d.recipe]){
   state.piece=d.piece;state.material=d.material;state.recipe=d.recipe;place();return;
  }
  if(d.action==='repair'){fortify();return}
  if(d.action==='edit'){
   const item=builds.get(d.key);
   if(item&&Number.isInteger(d.mask)&&item.group.position.distanceTo(m.target)<10&&
    engineering.connectedMask(item.piece,d.mask)&&canEditHere(item,d.mask)){
    item.mask=d.mask;item.contacts=engineering.contacts(item);rebuildStructure(item);refreshSupport();
   }
   return;
  }
  if(d.action==='ability'&&Number.isInteger(d.index)&&d.index>=0&&d.index<4&&m.cooldown[d.index]<=state.elapsed){
   const klass=Object.hasOwn(abilityTables,d.klass)?d.klass:'Vanguard';
   if((klass==='Vanguard'&&d.index===1)||(klass==='Architect'&&d.index===1)||(klass==='Shadow'&&d.index===0)||(klass==='Prospector'&&d.index===1))return;
   const bag=fieldBag;
   fieldBag=m.bag;
   let used;
   try{used=performAbility(klass,d.index)}finally{fieldBag=bag}
   if(used){
    const cooldown=abilityTables[klass][d.index][1];
    m.cooldown[d.index]=state.elapsed+cooldown;
    sendGame('feedback',{ability:[d.index,cooldown],charge:m.bag.charge},m.id);
   }
  }
 })}finally{
  hero.hp=local.hp;hero.hitAgo=local.hitAgo;heroBeforeRemote=null;
  state.piece=oldPiece;state.material=oldMat;state.recipe=oldRecipe;
 }
}
function syncLoot(list){
 const seen=new Set();
 for(const [kind,x,z,opened,active,weapon,power,element] of list){
  const key=kind+'/'+x+'/'+z;seen.add(key);
  let item=loot.find(l=>l.kind===kind&&(kind==='chest'||l.active)&&Math.hypot(l.x-x,l.z-z)<.065);
  if(!item&&kind==='weapon'&&active&&gear?.canForge(weapon)){weaponCrate(weapon,x,z,power,element);item=loot.at(-1)}
  if(!item&&active&&(kind==='airdrop'||kind==='bundle')){addCache(x,z,kind);item=loot.at(-1)}
  if(!item&&active&&kind==='flux'){addFluxAt(x,z);item=loot.at(-1)}
  if(!item)continue;
  item.active=active;item.group.visible=active||kind==='chest';
  if(kind==='chest'){
   item.opened=opened;item.lid.rotation.x=opened?-1.19:0;
   item.marker.visible=active;item.flare.visible=active;
   if(opened)item.flare.material.color.setHex(0x7ddcde);
  }
 }
 for(const item of loot)if(item.kind!=='chest'&&item.active&&
  !seen.has(item.kind+'/'+Number(item.x.toFixed(3))+'/'+Number(item.z.toFixed(3)))){item.active=false;item.group.visible=false}
}
function packStructures(){return [...builds.values()].map(i=>[i.key,i.piece,i.x,i.y,i.z,i.angle,i.layer,materials.indexOf(i.material),i.mask,i.rank,i.hp,i.max,i.construction,i.mount?.key,i.recipe?.id,i.life])}
function syncBuilds(list){
 const keep=new Set(list.map(row=>row[0]));
 for(const item of builds.values())if(!keep.has(item.key))detachStructure(item,true);
 for(const [key,piece,x,y,z,angle,layer,material,mask,rank,hp,max,construction,mountKey,recipeId,life] of list){
  let item=builds.get(key),rebuild=false;
  if(!item){
   const group=groupAt(scene,x,y,z);group.rotation.y=angle;
   const recipe=trapRecipes.find(r=>r.id===recipeId),mount=builds.get(mountKey);
   if(piece===3&&(!mount||!recipe)){scene.remove(group);continue}
   const rect={x,z,hx:piece===0&&Math.abs(Math.sin(angle))>.5?.155:GRID/2,hz:piece===0&&Math.abs(Math.sin(angle))<.5?.155:GRID/2};
   item={key,piece,type:'structure',x,y,z,angle,layer,material:materials[material],group,rect,recipe,mount,trapIn:0,
    calibration:recipe?StormwatchCitadel.tune(profile.blueprints['trap/'+recipe.id]):null,targets:[]};
   builds.set(key,item);rebuild=true;
   if(piece===0)activeWalls.push(item);else if(piece!==3)walkways.push(item);
  }
  const changed=rebuild||item.mask!==mask||item.rank!==rank,settled=item.construction>0&&construction===0;
  Object.assign(item,{mask,rank,hp,max,construction,life});
  if(changed){item.contacts=engineering.contacts(item);rebuildStructure(item)}
  constructionAppearance(item,construction);
  if(settled){physics?.update(item.targets);structureBatchDirty=true;obstaclesDirty=true}
 }
 refreshSupport();
}
function syncEnemies(list){
 const keep=new Set();
 for(const [id,kind,x,y,z,yaw,hp,max,power,element,recoil] of list){
  keep.add(id);
  let e=replicas.get(id);
  if(!e){
   e=makeHusk(kind,x,z,element);e.netId=id;e.target=vec(x,y,z);e.root.position.copy(e.target);replicas.set(id,e);
   addSparks(vec(x,y+.9,z),0xc086e8,9,3.2);
  }
  e.target.set(x,y,z);Object.assign(e,{x,z,yaw,hp,max,power,element,recoil});
 }
 for(const [id,e] of replicas)if(!keep.has(id)){
  addSparks(e.root.position.clone().add(vec(0,.88,0)),0xc38df0,11,4.2);
  scene.remove(e.root);removeTarget(enemyTargets,e.body);removeTarget(enemyTargets,e.skull);
  if(e.canister)removeTarget(enemyTargets,e.canister);
  e.spirit?.material.dispose();replicas.delete(id);
  const index=enemies.indexOf(e);if(index>=0)enemies.splice(index,1);
 }
}
function syncScene(d){
 if(!coopStarted&&!d.started)return;
 coopStarted=d.started;
 const phase=state.phase;
 for(const [i,k] of coopFields.entries())if(d.state[i]!=null)state[k]=d.state[i];
 if(phase!==state.phase&&state.phase==='arming'){
  const wave=waves[state.wave-1];
  if(wave)notice(wave.name+' · '+plannedFronts().map(lane=>frontNames[lane]).join(' / '));
  sound('wave','Assault incoming');rumble(.43,140);
 }
 if(phase==='active'&&state.phase==='prep'){
  notice('Assault repelled · Resupply and prepare for the next front');sound('pickup','Resupply delivered');
 }
 d.portals.forEach((active,i)=>{portalFx[i].active=active});
 const living=new Set();
 for(const [id,p,yaw,hp,operator] of d.players){
  if(id===coop.id)continue;
  living.add(id);
  const m=mates.get(id)||hydrateMate(id,p,operator);m.target.fromArray(p);m.angle=yaw;
  m.vitals.hp=hp;m.ready=true;
  if(m.down!==(hp<=0)){m.down=hp<=0;m.updateLabel(m.down)}
 }
 for(const id of mates.keys())if(!living.has(id))removeMate(id);
 syncBuilds(d.builds);syncEnemies(d.enemies);syncLoot(d.loot);
 for(const [index,hp,searched] of d.props){
  const prop=props[index];if(prop&&searched)prop.searched=true;
  if(!prop?.alive||hp>=prop.hp)continue;
  prop.hp=hp;prop.weak=null;prop.weakIndex++;
  const hit=vec(prop.x,Math.min(prop.top,prop.y+.78),prop.z);
  addSparks(hit,materials[prop.kind].color,hp?4:11,hp?2:4);
  if(!hp)breakProp(prop,hit,true);
  else {prop.shake=.35;prop.impact=.10;cracked.add(prop)}
 }
 if(state.mission==='nests'){
  state.nest=null;
  for(const [index,n] of nests.entries()){
   const packet=d.nests[index];if(!packet)continue;
   const [active,hp,remaining,marked,opened]=packet;
   n.active=n.group.visible=active;n.hp=hp;n.remaining=remaining;if(marked)state.nest=n;
   n.shield.visible=!opened;
   if(opened&&active&&!n.hit)n.hit=registerHit(n.gemstone,n);
   if(!active&&n.hit){removeTarget(shotProps,n.hit);n.hit=null}
  }
 }
 if(state.mission==='payload'){
  pod.visible=state.phase==='payload'||state.prep<4;pod.position.y=Math.max(0,state.prep/4)**1.27*22;
  if(state.phase==='payload'&&!atlasBody.alive){
   atlasBody.alive=true;atlasBody.top=1.78;atlasBody.r=1.35;
   atlasHit=registerHit(block(pod,invisible,0,.82,0,1.74,1.65,1.74,false),atlasBody);
  }
 }
 for(let i=0;i<Math.max(remoteProjectiles.length,d.projectiles.length);i++){
  const p=d.projectiles[i];let item=remoteProjectiles[i];
  if(!p){if(item)item.visible=false;continue}
  if(!item)item=remoteProjectiles[i]=mesh(scene,gem,accent,...p,.18,.2,.18,false);
  item.visible=true;item.position.set(...p);
 }
}
function teamHud(){
 if(!coop)return;
 const rows=[...mates.values()].filter(m=>m.ready).map(m=>m.look+(m.down?' · DOWN':' · '+Math.ceil(m.vitals.hp)+' HP'));
 if(hero.hp<=0)rows.unshift('DOWN · A squadmate can revive you with F');
 text(ui['squad-status'],rows.join('  /  '));
}
function receiveGame(d,id){
 if(d.type==='lost'){if(!state.finished)finish(false,'Connection to the host was lost',true);return}
 if(d.type==='left'){removeMate(id);if(state.deployed)downCheck();return}
 if(d.round!==nround||!state.deployed)return;
 if(!guest){
  if(d.type==='pose'&&goodVector(d.pos)&&d.pos.every((v,i)=>Math.abs(v)<(i===1?32:BOUND+2))&&Number.isFinite(d.yaw+d.pitch)){
   const m=mates.get(id)||hydrateMate(id,d.pos,d.operator);
   m.target.fromArray(d.pos);m.angle=d.yaw;m.pitch=clamp(d.pitch,-1.16,1.16);
   if(!m.ready&&Number.isFinite(d.maxhp+d.maxShield)){
    m.ready=true;m.vitals.hp=m.vitals.maxhp=clamp(d.maxhp,100,250);
    m.vitals.shield=m.vitals.maxShield=clamp(d.maxShield,60,200);
   }
  }else if(d.type==='action')handleAction(mates.get(id),d);
  else if(d.type==='withdraw'){removeMate(id);downCheck()}
  return;
 }
 if(d.type==='scene')syncScene(d);
 if(d.type==='feedback'){
  if(d.line)notice(d.line);
  if(d.hit){state.hit=.21;sound('hit');viewKick(.07)}
  if(d.ammo)restock(d.ammo);
  if(d.part)collectPart(d.part[0],d.part[1]);
  if(d.discovery)discoveries.set(d.discovery.id,d.discovery);
  if(d.weapon)equipLoot(d.weapon);
  if(d.fabricated){
   for(const [id,n] of Object.entries(fabricationBag))fieldBag[id]=Math.max(0,fieldBag[id]-n);
   if(gear?.canForge(d.fabricated))equipLoot({k:d.fabricated,power:Math.max(12,region.floor),element:'Kinetic'});
  }
  if(d.ability&&Number.isInteger(d.ability[0])){
   abilityCooldown[d.ability[0]]=d.ability[1];
   fieldBag.charge=d.charge;sound('pulse');rumble(.46,100);viewKick(.14);
  }
 }
 if(d.type==='vitals'){
  const was=hero.hp;hero.hp=d.hp;hero.shield=d.shield;hero.stacks=d.stacks;hero.cache=d.cache;hero.repairs=d.repairs;
  if(hero.hp<was){state.damage=.66;sound('hurt');viewKick(.24)}
  if(was<=0&&hero.hp>0){notice('Squadmate revived you');sound('pickup')}
 }
 if(d.type==='reward'&&!state.finished){
  const wave=state.wave;state.wave=d.wave;
  awardWave(d.bonus);bankSalvage(false,true);state.wave=wave;
 }
 if(d.type==='end'){
  if(d.hostLeft&&!state.finished)finish(false,'The host returned to command',true);
  else if(!d.hostLeft&&!state.finished)finish(d.win,d.message,true);
 }
 if(d.type==='trace'&&d.owner!==coop.id&&goodVector(d.from)&&goodVector(d.to)){
  tracer(vec().fromArray(d.from),vec().fromArray(d.to),d.element);
 }
}
function networkTick(dt){
 if(!coop||!state.deployed)return;
 for(const m of mates.values())peerLife(m,dt);
 netClock+=dt;if(netClock<.083)return;netClock=0;
 if(guest){
  if(!state.finished)sendGame('pose',{pos:packVector(hero.pos),yaw:hero.yaw,pitch:hero.pitch,operator:gear?.operator,maxhp:hero.maxhp,maxShield:hero.maxShield});
  return;
 }
 if(!coopStarted){
  signalTick+=.083;
  coopStarted=coopReady&&([...mates.values()].filter(m=>m.ready).length>=coop.size-1||signalTick>=15);
  }
 const enemyRows=enemies.filter(e=>e.active).map(e=>[e.netId,e.kind,...packVector(e.root.position),+e.yaw.toFixed(2),e.hp,e.max,e.power,e.element,e.recoil]);
 sendGame('scene',{
  started:coopStarted,state:coopFields.map(key=>state[key]),portals:portalFx.map(p=>p.active),
  players:[[coop.id,packVector(hero.pos),hero.yaw,hero.hp,gear?.operator],...[...mates.values()].filter(m=>m.ready).map(m=>[m.id,packVector(m.target),m.angle,m.vitals.hp,m.operator])],
  enemies:enemyRows,
  builds:packStructures(),
  loot:loot.filter(l=>l.active||!['bundle','weapon'].includes(l.kind)).map(l=>[l.kind,+l.x.toFixed(3),+l.z.toFixed(3),!!l.opened,l.active,...(l.kind==='weapon'?[l.reward.k,l.power,l.element]:[])]),
  props:props.flatMap((p,i)=>p.hp<p.max||p.searched?[[i,p.hp,!!p.searched]]:[]),
  nests:nests.map(n=>[n.active,n.hp,n.remaining,n===state.nest,!!n.hit]),
  projectiles:[...bolts.map(b=>b.group),...trapShots.map(s=>s.model)].map(m=>packVector(m.position))
 });
 for(const m of mates.values())if(m.ready)sendGame('vitals',m.vitals,m.id);
}
function hostSquadTick(dt){
 if(!coop||guest)return;
 for(const m of mates.values()){
  if(!m.ready||m.vitals.hp<=0)continue;
  const v=m.vitals;v.hitAgo+=dt;
  if(v.hitAgo>5.5)v.shield=Math.min(v.maxShield,v.shield+dt*11);
  m.storm=Math.max(0,(m.storm||0)-dt);
  if(!m.storm&&['active','seal','payload','hunt'].includes(state.phase)&&stormDistance(m.target.x,m.target.z)>state.stormRadius){
   m.storm=.85;damageMate(m,4+state.wave*2);
  }
  withMate(m,()=>activePickups(0));
 }
}
function animateReplicas(dt){
 for(const e of replicas.values()){
  const moving=e.root.position.distanceTo(e.target)>.09;
  e.root.position.lerp(e.target,1-Math.exp(-dt*20));
  e.root.rotation.y+=Math.atan2(Math.sin(e.yaw-e.root.rotation.y),Math.cos(e.yaw-e.root.rotation.y))*Math.min(dt*12,1);
  e.bob+=dt*(moving?9:3);
  e.rig.position.y=Math.abs(Math.sin(e.bob))*.085;
  e.chest.rotation.x=-.14-(e.recoil>0?.21:0);
  for(const [i,limb] of e.limbs.entries()){
   const step=Math.sin(e.bob+i*Math.PI);
   limb.leg.rotation.x=moving?step*.63:step*.085;
   limb.arm.rotation.x=-.54+(moving?step*.38:0)-e.recoil;
  }
 }
 for(const n of nests)if(n.active){n.gemstone.rotation.y+=dt*.75;n.gemstone.position.y=1.14+Math.sin(state.elapsed*2+n.x)*.09}
}
const unsubscribeCoop=coop?.subscribe(receiveGame);

let last=performance.now(),nextHud=0,renderAfter=0,wasFire=false;
function tick(now){
 if(controller.signal.aborted)return;
 requestAnimationFrame(tick);
 const realTime=Math.max(0,(now-last)/1000),dt=Math.min(realTime,.045);
 last=now;
 const pad=pollController(dt);
 if(!state.paused){
  state.elapsed+=dt;
  state.stormTick=(state.stormTick||0)-dt;
  if(['active','seal','payload','hunt'].includes(state.phase)&&stormDistance(hero.pos.x,hero.pos.z)>state.stormRadius&&state.stormTick<=0){
   state.stormTick=.85;hurtHero(4+state.wave*2);
  }
  hero.shout=Math.max(0,hero.shout-dt);
  hero.heat=Math.max(0,hero.heat-dt*.95);
  state.damage=Math.max(0,state.damage-dt*2.8);
  state.hit=Math.max(0,state.hit-dt);state.toasted=Math.max(0,state.toasted-dt);
  hero.shot=Math.max(0,hero.shot-dt);hero.flash=Math.max(0,(hero.flash||0)-dt);
  hero.pulse=Math.max(0,hero.pulse-dt);hero.hitAgo+=dt;
  if(!guest&&hero.hp>0&&hero.hitAgo>5.5)hero.shield=Math.min(hero.maxShield,hero.shield+dt*11);
  if(hero.reload>0){
   hero.reload-=dt;
   if(hero.reload<=0){
    const gun=currentGun(),amount=Math.min(gun.stats.m-gun.mag,gun.reserve);
    gun.mag+=amount;gun.reserve-=amount;
   }
  }
  hero.aim=!state.building&&(mouseAim||!!pad?.aim);
  hero.emote=Math.max(0,hero.emote-dt);
  animateConstruction(dt);physics?.advance(dt);updateGadgets(dt);
  if(hero.hp>0){moveHero(dt,state.edit?null:pad);afterDash(dt)}else{hero.move=0;hero.sprint=false}
  if(hero.move>.18)hero.emote=0;
  animHero(dt);cameraTick(dt);
  // Rapier owns its collider transforms. The mesh-ray fallback still needs an up-to-date scene.
  if(!physics)scene.updateMatrixWorld();
  getAim();watchWeakPoint();updateBlueprint();advancePickaxe(dt);
  if(hero.hp>0&&state.building&&!state.edit&&pad?.place)place();
  const fire=mouseFire||!!pad?.fire;
  if(hero.hp>0&&!state.building&&!state.edit&&fire&&(!wasFire||!currentGun()||currentGun().stats.au))attack();
  wasFire=fire;
  activePickups(dt);
  animateWorld(dt);animateParticles(dt);animateDebris(dt);wobbleProps(dt);fieldFeedback(dt);
  ui.cross.dataset.hit=state.hit>0?'yes':'no';
  ui.cross.dataset.build=state.building?'yes':'no';
  ui.damage.style.opacity=state.damage;
  if(state.toasted===0)ui.toast.hidden=true;
  if(now>=nextHud){updateHUD();nextHud=now+90}
 }else if(state.screen==='brief'){
  state.elapsed+=dt;
  animHero(dt);cameraTick(dt,true);animateWorld(dt);
 }
 if(!state.finished&&state.deployed){
  if(guest)animateReplicas(dt);
  else if(!state.paused||coopStarted){
   if(!coop||coopStarted){waveTick(dt,Math.min(realTime,.16));hostSquadTick(dt);downCheck()}
  }
  networkTick(dt);
 }
 pollController.wasFire=!!pad?.fire;
 if(now>=renderAfter){
  batchStructures();
  renderAfter=now+(state.paused?29:0);
  render.render(scene,camera);
 }
}
requestAnimationFrame(tick);
return {close(){
 unsubscribeCoop?.();
 if(coop){
  if(!guest&&!state.finished)sendGame('end',{hostLeft:true});
  if(guest&&!state.finished)sendGame('withdraw');
  for(const id of mates.keys())removeMate(id);
 }
 bankSalvage(false,false);
 unmountCitadel?.();citadel?.close();
 controller.abort();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 unbindFieldAudio();fieldCaptions.close();
 if(audio){PlayerAudio.release(audio);audio.close()}
 physics?.close();
 actor.baseModel?.parent?.remove(actor.baseModel);
 if(actor.flash.parent)actor.flash.parent.remove(actor.flash);
 actor.flash.material.dispose();
 const geometries=new Set(),materials=new Set();
 scene.traverse(node=>{
  if(node.geometry)geometries.add(node.geometry);
  if(node.isInstancedMesh)node.dispose();
  if(node.material)materials.add(node.material);
 });
 for(const m of palette.values())materials.add(m);
 for(const m of structureMaterials.values())materials.add(m);
 geometries.forEach(g=>g.dispose());
 materials.forEach(m=>{
  if(m.map&&m.map!==haloMap&&m.map!==shadowTexture&&m.map!==weakTexture)m.map.dispose();
  m.dispose();
 });
 haloMap.dispose();shadowTexture.dispose();weakTexture.dispose();
 if(embedded){
  if(oldRenderer.style===null)canvas.removeAttribute('style');
  else canvas.setAttribute('style',oldRenderer.style);
  if(oldRenderer.tabindex===null)canvas.removeAttribute('tabindex');
  else canvas.setAttribute('tabindex',oldRenderer.tabindex);
  render.outputEncoding=oldRenderer.encoding;
  render.toneMapping=oldRenderer.tone;
  render.toneMappingExposure=oldRenderer.exposure;
  render.shadowMap.enabled=oldRenderer.shadows;
  render.shadowMap.type=oldRenderer.shadowType;
  render.setPixelRatio(oldRenderer.pixelRatio);
  render.setSize(innerWidth,innerHeight);
  render.renderLists.dispose();
 }else{render.dispose();canvas.remove()}
 host.remove();
}};
}};

})();
