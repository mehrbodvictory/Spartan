/* ---------- Nuketown: layout traced from the reference mini-map (bat-wing outline, two house clusters, central street) ---------- */
(()=>{const PO=[[-29.25,-16.35],[-11.6,-10.1],[-6.4,-13.1],[.75,-15],[8.6,-12.75],[12,-11.6],[29.25,-16.1],[34.9,-7.3],[37.9,2.25],[11.25,9.75],[6.75,8.85],[6.4,15.6],[-4.9,15.75],[-5.25,9.75],[-10.5,7.9],[-11.25,10.5],[-37.5,1.9],[-33.75,-9.75]];
const inside=(x,z)=>{let c=0;for(let i=0,j=PO.length-1;i<PO.length;j=i++){const[a,b]=PO[i],[p,q]=PO[j];if((b>z)!=(q>z)&&x<(p-a)*(z-b)/(q-b)+a)c=!c}return c};
MAPS.Nuketown={d:'Bat-wing suburb: two house clusters and a central street',H:40,sky:0xe3c9a0,gr:0xb59d6c,bc:0xc2b48f,b(){
 const a=[[-13.1,-4.3,12,7.2,5],[-15.6,2.6,5.6,6,4],[-31.4,-7.75,5.8,4.3,4],[-26.25,3.9,4.1,4,3.5],[-23.45,-13.5,2.9,2.2,3],
  [15.2,1.1,12.4,9.75,5],[15.1,-5.1,7.75,6.35,5],[21.9,-12.3,3.35,3.9,3.5],[27.55,4.3,1.9,2.35,3],
  [1.9,-.2,3.1,9,2.2],[-1.4,6.2,3.6,7.6,2],[-.8,-8.8,2.5,3.1,1.6],[.85,13.9,2.3,1.1,1],[-6,-3,2,2,1],[7,-6,2,2,1],[24,0,2.5,2.5,1],[-24,-3,2.5,2.5,1]],H=40,rows=[];
 for(let z=-H;z<H;z+=2.5){let s=null;for(let x=-H;x<=H;x+=2.5){const o=x<H&&!inside(x+1.25,z+1.25);if(o&&s===null)s=x;if(!o&&s!==null){rows.push([s,x,z,z+2.5]);s=null}}}
 const open={},out=[];for(const[x0,x1,z0,z1]of rows){const k=x0+','+x1,o=open[k];if(o&&o[3]==z0)o[3]=z1;else{const n=[x0,x1,z0,z1];open[k]=n;out.push(n)}}
 for(const[x0,x1,z0,z1]of out)a.push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,9]);return a}}})();
