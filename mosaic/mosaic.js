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
// Keep two strong vertical anchors; recursively partition the middle by population.
function layout(regions,width,height){
 const gap=10;
 if(width<900){
  const columns=width<440?1:2, cell=(width-gap*(columns-1))/columns;
  root.style('height',`${Math.ceil(regions.length/columns)*300-gap}px`);
  return regions.map((r,i)=>({r,x:i%columns*(cell+gap),y:Math.floor(i/columns)*300,w:cell,h:290}));
 }
 root.style('height',null);
 const ranked=[...regions].sort((a,b)=>b.value-a.value);
 const anchors=[ranked[0],ranked[1]], interior=regions.filter(r=>!anchors.includes(r));
 const total=d3.sum(regions,r=>r.value), available=width-2*gap;
 const left=available*anchors[0].value/total,right=available*anchors[1].value/total;
 const middleWidth=width-left-right-2*gap;
 const tree=d3.hierarchy({children:interior.map(r=>({r,value:r.value}))}).sum(d=>d.value||0);
 d3.treemap().tile(d3.treemapBinary).size([middleWidth,height]).paddingInner(gap)(tree);
 return [{r:anchors[0],x:0,y:0,w:left,h:height},...tree.leaves().map(n=>({r:n.data.r,x:left+gap+n.x0,y:n.y0,w:n.x1-n.x0,h:n.y1-n.y0})),{r:anchors[1],x:width-right,y:0,w:right,h:height}];
}
function drawMap(node,r){
 const w=node.clientWidth,h=node.clientHeight;
 if(!w||!h)return;
 const svg=d3.select(node).select('svg').attr('viewBox',`0 0 ${w} ${h}`);
 // Fit actual geographic bounds into the space between the headline and caption.
 const projection=d3.geoMercator().rotate([-r.center[0],0]).center([0,r.center[1]]);
 const corners={type:'MultiPoint',coordinates:[[r.center[0]-r.span[0]/2,r.center[1]-r.span[1]/2],[r.center[0]+r.span[0]/2,r.center[1]+r.span[1]/2]]};
 projection.fitExtent([[8,70],[w-8,h-60]],corners);
 const path=d3.geoPath(projection);
 svg.select('.grid').attr('d',path(d3.geoGraticule().step([2,2])()));
 svg.select('.land').attr('d',path(geography));
 svg.select('.borders').attr('d',path(borders));
 svg.select('.points').selectAll('circle').data(r.points).join('circle').attr('class','point').attr('r',1.15).attr('cx',d=>projection(d)[0]).attr('cy',d=>projection(d)[1]);
 const [x,y]=projection(r.center);
 svg.select('.center').attr('cx',x).attr('cy',y);
 svg.select('.city-label').attr('x',Math.max(12,Math.min(w-70,x+9))).attr('y',y-10).text(r.name);
 svg.select('.water-label').attr('x',w*(r.waterAt?.[0]||.5)).attr('y',Math.max(96,h*(r.waterAt?.[1]||.5))).text(w>210?r.water||'':'');
}
const panelObserver=new ResizeObserver(entries=>entries.forEach(e=>drawMap(e.target,e.target.__data__.r)));
function render(){
 if(!geography)return;
 const width=root.node().clientWidth, height=innerWidth>=1600?610:innerWidth<=1000?570:540;
 const boxes=layout(REGIONS.slice(0,count),width,height);
 const panels=root.selectAll('article').data(boxes,d=>d.r.id);
 panels.exit().each(function(){panelObserver.unobserve(this)}).remove();
 const enter=panels.enter().append('article').attr('class','panel');
 enter.html('<svg role="img"><title></title><path class="grid"/><path class="land"/><path class="borders" fill="none" stroke="#c4cebd" stroke-width=".5"/><text class="water-label" text-anchor="middle"/><g class="points"/><circle class="center" r="2.6" fill="#583e2b" stroke="#fff" stroke-width="1"/><text class="city-label"/></svg><div class="panel-title"><p class="region-meta"></p><h2></h2></div><p class="population"><strong></strong>simulated population</p><span class="panel-number" aria-hidden="true"></span>');
 enter.each(function(){panelObserver.observe(this)});
 const all=enter.merge(panels);
 all.style('left',d=>`${d.x}px`).style('top',d=>`${d.y}px`).style('width',d=>`${d.w}px`).style('height',d=>`${d.h}px`);
 all.select('h2').text(d=>d.r.name);
 all.select('.region-meta').text(d=>d.r.country);
 all.select('.population strong').text(d=>`${d.r.value.toFixed(1)}m`);
 all.select('.panel-number').text(d=>String(REGIONS.indexOf(d.r)+1).padStart(2,'0'));
 all.select('svg title').text(d=>`${d.r.name}, ${d.r.country}. ${d.r.value} million simulated people clustered around the city.`);
 all.each(function(d){drawMap(this,d.r)});
 d3.select('#summary').text(`${count} regions · ${d3.sum(REGIONS.slice(0,count),r=>r.value).toFixed(1)} million simulated people`);
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
