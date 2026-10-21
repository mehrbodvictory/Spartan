/* ===================== sights.js (loaded before systems.js: the hand-built KN-115 / VMP-X models use it while they are being created) ===================== */
/* One style per weapon, all slim and shaped (rings, cones, spheres, angled inserts) instead of blocks.
   o: yt = height of the sight picture centre, yb = surface the rear sits on, yf = surface the front sits on, zr / zf = rear and front positions along the gun, st = style.
   Styles: kn (KN-115: wide notch with red wing inserts, guarded post with red sides), vmp (round hooded rear, front hood with yellow lit slots and three spikes),
   cy (Coyote: orange flip plate with green dots, green tipped post), ghost (SMG ring), leaf (Battle Rifle), bead (shotgun), ramp (revolver), u (machine pistol),
   ap (MVR-67 flip aperture), tri (1911 three dot), rl (launcher ladder), post (default). */
function mkSights(g,o){const{yt,yb,yf,zr,zf,st='post',fmat}=o,dir=zf>=zr?1:-1,sh=-dir,kk=mkSights.k||(mkSights.k={dk:new THREE.MeshLambertMaterial({color:0x0d0e10}),gm:new THREE.MeshLambertMaterial({color:0x2a2d32}),red:new THREE.MeshBasicMaterial({color:0xff2a20}),yel:new THREE.MeshBasicMaterial({color:0xf2e226}),grn:new THREE.MeshBasicMaterial({color:0x32ff58}),wht:new THREE.MeshBasicMaterial({color:0xf4f4ee}),org:new THREE.MeshLambertMaterial({color:0xd9822b}),steel:new THREE.MeshLambertMaterial({color:0x9aa0a8})}),
 B=(w,h,d,x,y,z,m,rz)=>{const e=new THREE.Mesh(bg,m||kk.dk);e.scale.set(w,h,d);e.position.set(x,y,z);if(rz)e.rotation.z=rz;g.add(e);return e},
 Co=(r,h,x,y,z,m)=>{const e=new THREE.Mesh(new THREE.ConeGeometry(r,h,8),m||kk.dk);e.position.set(x,y,z);g.add(e);return e},
 Sp=(r,x,y,z,m)=>{const e=new THREE.Mesh(sg,m||kk.dk);e.scale.setScalar(r);e.position.set(x,y,z);g.add(e);return e},
 Rg=(r,t,x,y,z,m)=>{const e=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,18),m||kk.dk);e.position.set(x,y,z);g.add(e);return e},
 ft=yt+.002,bot=yb+.008,post=(w,m)=>B(w,ft-(yf+.01),w,0,(yf+.01+ft)/2,zf,m);
 const base=(w,z)=>B(w,.008,.026,0,yb+.004,z,kk.gm),fbase=()=>B(.024,.01,.02,0,yf+.005,zf,kk.gm);
 if(st=='kn'){base(.05,zr);const top=yt+.016;B(.046,yt-.009-bot,.018,0,(bot+yt-.009)/2,zr);
  for(const s of[-1,1]){B(.011,top-bot,.018,s*.0175,(bot+top)/2,zr);B(.0034,.017,.004,s*.0125,yt+.003,zr+sh*.0105,kk.red,s*.18);Sp(.0045,s*.0175,top+.001,zr)}
  fbase();for(const s of[-1,1]){B(.007,ft+.004-(yf+.01),.014,s*.0135,(yf+.01+ft+.004)/2,zf);B(.003,.014,.003,s*.0135,ft-.003,zf+sh*.0075,kk.red,-s*.2)}B(.0034,ft-(yf+.01),.004,0,(yf+.01+ft)/2,zf,kk.wht)}
 else if(st=='vmp'){base(.036,zr);B(.011,yt-.0175-yb,.012,0,(yb+yt-.0175)/2,zr,kk.gm);Rg(.0165,.0044,0,yt,zr,kk.gm);fbase();B(.036,.008,.02,0,yf+.014,zf);B(.032,.008,.016,0,yf+.022,zf);
  for(const s of[-1,1]){B(.008,.024,.016,s*.016,yt-.006,zf);B(.0032,.017,.003,s*.016,yt-.006,zf+sh*.0082,kk.yel,s*.3);Co(.0026,.012,s*.0085,yt-.0085,zf)}Co(.0022,.016,0,yt-.006,zf,kk.steel)}
 else if(st=='cy'){base(.036,zr);for(const s of[-1,1]){B(.004,.01,.004,s*.012,yb+.012,zr);B(.016,.03,.006,s*.0145,yt-.002,zr,kk.org);B(.005,.04,.012,s*.027,yt+.004,zr);Sp(.0038,s*.027,yt+.025,zr+sh*.0065,kk.grn);B(.003,.016,.006,s*.007,ft-.01,zf)}
  B(.05,.012,.012,0,yt-.0185,zr,kk.org);fbase();post(.0042,kk.dk);Sp(.0036,0,ft,zf+sh*.001,kk.grn)}
 else if(st=='ghost'){base(.03,zr);B(.01,yt-.0125-yb,.012,0,(yb+yt-.0125)/2,zr,kk.gm);Rg(.0125,.0046,0,yt,zr,kk.gm);fbase();post(.0034,kk.dk);Rg(.0072,.0016,0,ft-.003,zf,kk.gm)}
 else if(st=='leaf'){base(.034,zr);const top=yt+.014;B(.012,top-bot,.014,-.0095,(bot+top)/2,zr);B(.012,top-bot,.014,.0095,(bot+top)/2,zr);B(.032,yt-.006-bot,.014,0,(bot+yt-.006)/2,zr);for(const s of[-1,1])Sp(.0026,s*.0095,yt+.005,zr+sh*.0075,kk.wht);fbase();post(.0038,kk.dk);Rg(.0108,.0017,0,ft-.011,zf,kk.gm)}
 else if(st=='bead'){B(.03,.008,.016,0,yb+.004,zr,kk.gm);for(const s of[-1,1])B(.011,.016,.014,s*.0105,yt-.011,zr,kk.dk,-s*.55);B(.012,.01,.012,0,yt-.019,zr);B(.005,ft-(yf+.004)-.004,.005,0,(yf+.004+ft-.004)/2,zf);Sp(.0056,0,ft-.003,zf,fmat||kk.wht)}
 else if(st=='ramp'){B(.03,.014,.014,0,yb+.007,zr,kk.gm);for(const s of[-1,1])B(.01,.022,.012,s*.01,yt-.005,zr,kk.dk);B(.03,.01,.012,0,yt-.014,zr);B(.012,.016,.034,0,yf+.008,zf,kk.gm);B(.005,.012,.012,0,ft-.008,zf,kk.dk);B(.0042,.01,.003,0,ft-.006,zf+sh*.0065,kk.org)}
 else if(st=='u'){B(.034,.008,.014,0,yb+.004,zr,kk.gm);for(const s of[-1,1])B(.007,yt+.006-yb,.012,s*.011,(yb+yt+.006)/2,zr);fbase();post(.0036,kk.dk);Sp(.0028,0,ft-.001,zf+sh*.002,kk.wht)}
 else if(st=='ap'){base(.044,zr);B(.012,yt-.0185-yb,.014,0,(yb+yt-.0185)/2,zr,kk.gm);Rg(.0148,.0048,0,yt,zr,kk.gm);B(.06,.01,.012,0,yt-.0178,zr,kk.gm);for(const s of[-1,1])Sp(.0028,s*.0235,yt,zr+sh*.004,kk.wht);fbase();post(.0038,kk.dk);Rg(.0125,.002,0,ft-.012,zf,kk.gm);B(.004,.014,.004,0,ft-.012,zf)}
 else if(st=='tri'){B(.034,.008,.014,0,yb+.004,zr,kk.gm);for(const s of[-1,1]){B(.009,yt+.006-yb,.012,s*.0105,(yb+yt+.006)/2,zr);Sp(.0026,s*.0105,yt+.004,zr+sh*.0065,kk.wht)}fbase();post(.0042,kk.dk);Sp(.0028,0,ft-.002,zf+sh*.0035,kk.wht)}
 else if(st=='rl'){base(.03,zr);for(const s of[-1,1]){B(.005,.05,.008,s*.012,yt+.004,zr);for(let i=0;i<4;i++)B(.02,.003,.006,s*.01,yb+.012+i*.012,zr+sh*.002,kk.gm)}fbase();B(.004,ft-(yf+.01)+.016,.004,0,(yf+.01+ft+.016)/2,zf)}
 else{base(.034,zr);const top=yt+.012;B(.01,top-bot,.012,-.011,(bot+top)/2,zr);B(.01,top-bot,.012,.011,(bot+top)/2,zr);B(.032,yt-.008-bot,.012,0,(bot+yt-.008)/2,zr);fbase();post(.0042,kk.dk);Sp(.0026,0,ft,zf,kk.wht)}
 g.userData.sight={yt,zr}}
/* default style per weapon for the generic call */
function addGunSights(g,k,l){if(k=='SN'||k=='RG')return;const st={AR:'kn',SMG:'ghost',BR:'leaf',MP:'u',RL:'rl',MVR:'ap'}[k]||'post',ap=k!='MP';mkSights(g,{st,ap,yt:ap?.118:.1,yb:.0825,yf:k=='RL'?.0375:.0275,zr:l*.14,zf:k=='RL'?l*.95:l*.9})}
