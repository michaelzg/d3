/* A data-driven mosaic: any region with a center, extent and population can be added. */
const REGIONS = [
 {id:'tokyo',name:'Tokyo',country:'Japan',center:[139.69,35.68],span:[12,13],population:37.4,water:'PACIFIC OCEAN',waterAt:[.72,.65]},
 {id:'delhi',name:'Delhi',country:'India',center:[77.21,28.61],span:[14,10],population:32.9},
 {id:'shanghai',name:'Shanghai',country:'China',center:[121.47,31.23],span:[13,11],population:29.2,water:'EAST CHINA SEA',waterAt:[.75,.72]},
 {id:'newyork',name:'New York',country:'United States',center:[-74,40.71],span:[13,12],population:22.1,water:'ATLANTIC OCEAN',waterAt:[.68,.74]},
 {id:'saopaulo',name:'São Paulo',country:'Brazil',center:[-46.63,-23.55],span:[13,10],population:22.6,water:'ATLANTIC OCEAN',waterAt:[.7,.78]},
 {id:'cairo',name:'Cairo',country:'Egypt',center:[31.24,30.04],span:[13,12],population:22.2,water:'MEDITERRANEAN SEA',waterAt:[.47,.32]},
 {id:'mexico',name:'Mexico City',country:'Mexico',center:[-99.13,19.43],span:[14,10],population:21.8},
 {id:'lagos',name:'Lagos',country:'Nigeria',center:[3.38,6.52],span:[13,11],population:16.5,water:'GULF OF GUINEA',waterAt:[.55,.78]}
];
// Choose once per page load; featured regions remain visible for every count.
const featured = new Set(d3.shuffle([...REGIONS]).slice(0,1+Math.floor(Math.random()*3)).map(r=>r.id));
const displayRegions = [...REGIONS.filter(r=>featured.has(r.id)), ...REGIONS.filter(r=>!featured.has(r.id))];
let count=6, generation=0, geography, borders;
const root=d3.select('#mosaic');
function simulate(){
 REGIONS.forEach((r,i)=>{
  const random=d3.randomLcg(0.17+i*.079+generation*.031);
  r.value=+(r.population*(generation ? .72+random()*.56 : 1)).toFixed(1);
  const normal=d3.randomNormal.source(random)(0,1);
  const satellites=Array.from({length:6},()=>[r.center[0]+normal()*1.2,r.center[1]+normal()*.9]);
  r.points=[];
  const total=Math.round(r.value*40);
  for(let attempt=0;r.points.length<total && attempt<total*20;attempt++){
   const c=random()<.6?r.center:satellites[Math.floor(random()*satellites.length)];
   const p=[c[0]+normal()*.48/Math.cos(c[1]*Math.PI/180),c[1]+normal()*.36];
   if(d3.geoContains(r.land,p))r.points.push(p);
  }
 });
}
// Art-directed slots on a 1000 × 500 stage. Empty space is part of the layout.
// Each count keeps the same stage ratio; population gently scales within safe slots.
const COMPOSITIONS = {
 4: [[0,18,235,460],[247,0,506,238],[247,250,506,250],[765,22,235,460]],
 5: [[0,22,210,456],[222,0,272,230],[506,12,272,230],[222,254,556,246],[790,18,210,464]],
 6: [[0,20,210,450],[222,0,272,225],[222,237,272,263],[506,14,272,255],[506,281,272,207],[790,30,210,450]],
 7: [[0,15,205,470],[217,0,280,220],[217,232,280,268],[509,15,272,260],[509,287,272,200],[793,0,207,210],[793,222,207,265]],
 8: [[0,25,180,450],[192,0,194,225],[192,237,194,263],[398,20,194,265],[398,297,194,203],[604,0,194,200],[604,212,194,268],[810,30,190,440]]
};
const MOBILE_COMPOSITIONS = {
 4: [[0,0,490,650],[510,15,490,430],[510,465,490,785],[0,670,490,560]],
 5: [[0,0,490,650],[510,15,490,370],[510,405,490,425],[0,670,490,560],[510,850,490,400]],
 6: [[0,0,490,480],[510,15,490,365],[0,500,490,355],[510,400,490,480],[0,875,490,355],[510,900,490,350]],
 7: [[0,0,490,460],[510,15,490,295],[0,480,490,355],[510,330,490,430],[0,855,490,375],[510,780,490,235],[510,1035,490,215]],
 8: [[0,0,490,330],[510,15,490,280],[0,350,490,270],[510,315,490,355],[0,640,490,330],[510,690,490,270],[0,990,490,240],[510,980,490,270]]
};
function layout(regions,width,height){
 const mobile=width<600, slots=(mobile?MOBILE_COMPOSITIONS:COMPOSITIONS)[regions.length];
 const [min,max]=d3.extent(regions,r=>r.value);
 const available=slots.map((slot,index)=>({slot,index})).sort((a,b)=>b.slot[2]*b.slot[3]-a.slot[2]*a.slot[3]);
 const assigned=new Map();
 regions.filter(r=>featured.has(r.id)).forEach(r=>assigned.set(r.id,available.shift().slot));
 available.sort((a,b)=>a.index-b.index);
 regions.filter(r=>!featured.has(r.id)).forEach(r=>assigned.set(r.id,available.shift().slot));
 return regions.map(r=>{
  const [x,y,w,h]=assigned.get(r.id), scale=featured.has(r.id)?1:.98+.015*(r.value-min)/(max-min||1);
  return {r,x:(x+w*(1-scale)/2)*width/1000,y:(y+h*(1-scale)/2)*height/(mobile?1250:500),w:w*scale*width/1000,h:h*scale*height/(mobile?1250:500)};
 });
}
function drawMap(node,r){
 const w=node.clientWidth,h=node.clientHeight;
 if(!w||!h)return;
 const svg=d3.select(node).select('svg').attr('viewBox',`0 0 ${w} ${h}`);
 // Fit actual geographic bounds into the space between the headline and caption.
 const projection=d3.geoMercator().rotate([-r.center[0],0]).center([0,r.center[1]]);
 const corners={type:'MultiPoint',coordinates:[[r.center[0]-r.span[0]/2,r.center[1]-r.span[1]/2],[r.center[0]+r.span[0]/2,r.center[1]+r.span[1]/2]]};
 const compact=w<180||h<220;
 projection.fitExtent([[6,compact?36:60],[w-6,Math.max(compact?45:70,h-(compact?30:48))]],corners);
 d3.select(node).classed('compact',compact);
 const path=d3.geoPath(projection);
 svg.select('.grid').attr('d',path(d3.geoGraticule().step([2,2])()));
 svg.select('.land').attr('d',path(geography));
 svg.select('.borders').attr('d',path(borders));
 svg.select('.points').selectAll('circle').data(r.points).join('circle').attr('class','point').attr('r',1.15).attr('cx',d=>projection(d)[0]).attr('cy',d=>projection(d)[1]);
 const [x,y]=projection(r.center);
 svg.select('.center').attr('cx',x).attr('cy',y);
 d3.select(node).select('.focus-glow').style('left',`${x}px`).style('top',`${y}px`);
 svg.select('.city-label').attr('x',Math.max(12,Math.min(w-70,x+9))).attr('y',y-10).text(w>190&&h>220?r.name:'');
 svg.select('.water-label').attr('x',w*(r.waterAt?.[0]||.5)).attr('y',Math.max(96,h*(r.waterAt?.[1]||.5))).text(w>270&&h>260?r.water||'':'');
}
const panelObserver=new ResizeObserver(entries=>entries.forEach(e=>drawMap(e.target,e.target.__data__.r)));
function render(){
 if(!geography)return;
 const width=root.node().clientWidth, height=root.node().clientHeight;
 const boxes=layout(displayRegions.slice(0,count),width,height);
 const panels=root.selectAll('article').data(boxes,d=>d.r.id);
 panels.exit().each(function(){panelObserver.unobserve(this)}).remove();
 const enter=panels.enter().append('article').attr('class','panel');
 enter.html('<svg role="img"><title></title><path class="grid"/><path class="land"/><path class="borders" fill="none" stroke="#c4cebd" stroke-width=".5"/><text class="water-label" text-anchor="middle"/><g class="points"/><circle class="center" r="2.6" fill="#583e2b" stroke="#fff" stroke-width="1"/><text class="city-label"/></svg><div class="focus-glow" aria-hidden="true"></div><div class="panel-title"><p class="region-meta"></p><h2></h2></div><p class="population"><strong></strong>simulated population</p><span class="panel-number" aria-hidden="true"></span>');
 enter.each(function(){panelObserver.observe(this)});
 const all=enter.merge(panels).classed('featured',d=>featured.has(d.r.id));
 all.style('left',d=>`${d.x}px`).style('top',d=>`${d.y}px`).style('width',d=>`${d.w}px`).style('height',d=>`${d.h}px`);
 all.select('h2').text(d=>d.r.name);
 all.select('.region-meta').text(d=>d.r.country);
 all.select('.population strong').text(d=>`${d.r.value.toFixed(1)}m`);
 all.select('.panel-number').text(d=>String(REGIONS.indexOf(d.r)+1).padStart(2,'0'));
 all.select('svg title').text(d=>`${featured.has(d.r.id)?'Highlighted region. ':''}${d.r.name}, ${d.r.country}. ${d.r.value} million simulated people clustered around the city.`);
 all.each(function(d){drawMap(this,d.r)});
 d3.select('#summary').text(`${count} regions · ${d3.sum(displayRegions.slice(0,count),r=>r.value).toFixed(1)} million simulated people`);
 d3.selectAll('[data-count]').attr('aria-pressed',function(){return +this.dataset.count===count?'true':'false'});
}
d3.selectAll('[data-count]').on('click',function(){count=+this.dataset.count;render()});
d3.select('#reshuffle').on('click',()=>{generation++;simulate();render()});
let frame;
new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(render)}).observe(root.node());
fetch('../data/countries-110m.json').then(response=>{if(!response.ok)throw Error(response.status);return response.json()}).then(world=>{
 geography=topojson.feature(world,world.objects.countries);
 borders=topojson.mesh(world,world.objects.countries,(a,b)=>a!==b);
 REGIONS.forEach(r=>{r.land={type:'FeatureCollection',features:geography.features.filter(f=>{
  const [lo,hi]=d3.geoBounds(f);
  return lo[0]<=r.center[0]+6 && hi[0]>=r.center[0]-6 && lo[1]<=r.center[1]+6 && hi[1]>=r.center[1]-6;
 })}});
 simulate();render();root.attr('aria-busy','false');d3.selectAll('button').property('disabled',false);
}).catch(error=>{console.error(error);root.style('display','none').attr('aria-busy','false');document.querySelector('#error').hidden=false;d3.select('#summary').text('Maps unavailable');d3.selectAll('button').property('disabled',true)});
