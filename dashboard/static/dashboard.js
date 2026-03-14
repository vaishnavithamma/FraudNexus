// =============================
// GLOBAL VARIABLES
// =============================

let approved = 0
let blocked = 0
let challenge = 0

let map
let fraudChart
let latencyChart
let riskGauge


// =============================
// INITIALIZE MAP
// =============================

function initMap(){

map = L.map('fraudMap').setView([20,0],2)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map)

}


// =============================
// FRAUD MAP MARKER
// =============================

function addFraudLocation(coords){

let marker = L.circleMarker(coords,{
radius:3,
color:"red",
fillColor:"red",
fillOpacity:0.7,
className:"fraud-marker"
})

marker.addTo(map)

setTimeout(()=>{
 map.removeLayer(marker)
},8000)

}

// =============================
// FRAUD SIGNAL CHART
// =============================

function initFraudChart(){

const ctx = document.getElementById("graph")

fraudChart = new Chart(ctx,{

type:"radar",

data:{

labels:[
"Device Risk",
"Geo Anomaly",
"Velocity",
"Proxy",
"Card Behavior"
],

datasets:[{

label:"Fraud Signals",

data:[40,50,30,45,60],

backgroundColor:"rgba(255,0,0,0.3)",

borderColor:"red"

}]

},

options:{
responsive:true
}

})

}


// =============================
// LATENCY CHART
// =============================

function initLatencyChart(){

const ctx = document.getElementById("latency")

latencyChart = new Chart(ctx,{

type:"line",

data:{

labels:[],

datasets:[{

label:"Latency (ms)",

data:[],

borderColor:"#00f7ff",

tension:0.4

}]

}

})

}


// =============================
// RISK GAUGE
// =============================

function initRiskGauge(){

const ctx = document.getElementById("riskGauge")

riskGauge = new Chart(ctx,{

type:"doughnut",

data:{

labels:["Risk","Safe"],

datasets:[{

data:[30,70],

backgroundColor:["red","#00ff9d"]

}]

},

options:{
cutout:"70%"
}

})

}


// =============================
// GENERATE RANDOM TRANSACTION
// =============================

function generateTransaction(){

const merchants=[
"Amazon",
"Stripe",
"Binance",
"PayPal",
"Apple Store",
"Netflix",
"Uber"
]

const countries=[
"USA",
"India",
"UK",
"Germany",
"Singapore"
]

let amount=(Math.random()*5000).toFixed(2)

let merchant=merchants[Math.floor(Math.random()*merchants.length)]

let country=countries[Math.floor(Math.random()*countries.length)]

let risk=Math.random()

return{
amount,
merchant,
country,
risk
}

}


// =============================
// UPDATE METRICS
// =============================

function updateMetrics(){

animateValue("approvedCount", approved)
animateValue("blockedCount", blocked)
animateValue("challengeCount", challenge)

let latency=Math.floor(Math.random()*200)+50

document.getElementById("latencyValue").innerText = latency + " ms"

latencyChart.data.labels.push("")
latencyChart.data.datasets[0].data.push(latency)

if(latencyChart.data.labels.length > 10){
 latencyChart.data.labels.shift()
 latencyChart.data.datasets[0].data.shift()
}

latencyChart.update()

}

// =============================
// UPDATE AI DECISION PANEL
// =============================

function updateDecision(tx){

document.getElementById("txAmount").innerText="$"+tx.amount
document.getElementById("txMerchant").innerText=tx.merchant
document.getElementById("txCountry").innerText=tx.country

let score=Math.floor(tx.risk*100)

document.getElementById("riskScore").innerText=score+"%"

riskGauge.data.datasets[0].data=[score,100-score]
riskGauge.update()

let label=document.getElementById("decisionLabel")

label.classList.remove("approved","blocked","challenge")

if(tx.risk>0.7){

label.innerText="BLOCKED"
label.classList.add("blocked")
blocked++

addFraudLocation(getLocation(tx.country))

}

else if(tx.risk>0.4){

label.innerText="CHALLENGE"
label.classList.add("challenge")
challenge++

}

else{

label.innerText="APPROVED"
label.classList.add("approved")
approved++

}
updateMetrics()
}

function runSimulation(){

let tx = generateTransaction()

updateFeed(tx)

updateDecision(tx)

updateFraudSignals()

}
function getLocation(country){

const locations = {

"USA": [37.0902, -95.7129],
"India": [20.5937, 78.9629],
"UK": [55.3781, -3.4360],
"Germany": [51.1657, 10.4515],
"Singapore": [1.3521, 103.8198]

}

return locations[country] || [20,0]

}
function animateValue(id, value){
  const el = document.getElementById(id)
  el.textContent = value
}
// =============================
// APPROVE / BLOCK FUNCTIONS
// =============================

function approveTx(btn){

approved++

if(challenge>0) challenge--

updateMetrics()

const actionArea = btn.parentElement
actionArea.innerHTML = `<span class="approved-status">APPROVED</span>`

}


function blockTx(btn){

blocked++

if(challenge>0) challenge--

updateMetrics()

const actionArea = btn.parentElement
actionArea.innerHTML = `<span class="blocked-status">BLOCKED</span>`

}


// =============================
// UPDATE FEED
// =============================

function updateFeed(tx){

let feed = document.getElementById("feed")

let li = document.createElement("li")

let action = ""

if(tx.risk > 0.4 && tx.risk <= 0.7){

action = `
<div class="action-area">
<button onclick="approveTx(this)">Approve</button>
<button onclick="blockTx(this)">Block</button>
</div>
`

} else {

action = `<div class="action-area"></div>`

}

li.innerHTML = `
<span>$${tx.amount}</span>
<span>${tx.merchant}</span>
<span>${(tx.risk*100).toFixed(1)}%</span>
${action}
`

if(tx.risk > 0.7){
li.classList.add("fraud")
}

feed.prepend(li)

if(feed.children.length>10){
feed.removeChild(feed.lastChild)
}
updateFraudGraph()
}

function updateFraudGraph(){

const width = 420
const height = 420

d3.select("#fraudGraph svg").remove()

const svg = d3.select("#fraudGraph")
.append("svg")
.attr("width",width)
.attr("height",height)

const rows = document.querySelectorAll("#feed li")

const nodes = [
 {id:"Transaction",label:"Transaction",type:"core"}
]

const links = []
const merchantMap = {}

/* collect merchant risk */

rows.forEach(row => {

 const spans = row.querySelectorAll("span")
 const merchant = spans[1].innerText.trim()
 const risk = parseFloat(spans[2].innerText)

 if(!merchantMap[merchant]){
  merchantMap[merchant] = { total:0, count:0 }
 }

 merchantMap[merchant].total += risk
 merchantMap[merchant].count += 1

})

/* build unique merchant nodes */

Object.keys(merchantMap).forEach(merchant => {

 const avgRisk = merchantMap[merchant].total / merchantMap[merchant].count

 let level="low"
 if(avgRisk > 70) level="high"
 else if(avgRisk > 40) level="medium"

 nodes.push({
  id: merchant,
  label: merchant,
  level: level,
  risk: avgRisk
 })

 links.push({
  source:"Transaction",
  target:merchant,
  distance: 70 + avgRisk
 })

})

const simulation = d3.forceSimulation(nodes)
.force("link", d3.forceLink(links)
 .id(d=>d.id)
 .distance(d=>d.distance)
)
.force("charge", d3.forceManyBody().strength(-250))
.force("center", d3.forceCenter(width/2,height/2))

const link = svg.selectAll("line")
.data(links)
.enter()
.append("line")
.style("stroke","#00f7ff66")

const node = svg.selectAll("circle")
.data(nodes)
.enter()
.append("circle")
.attr("r",d=>d.type==="core"?18:10)
.style("fill",d=>{
 if(d.type==="core") return "#8b5cf6"
 if(d.level==="high") return "#ff3b3b"
 if(d.level==="medium") return "#ffc857"
 return "#00f7ff"
})
.style("filter","drop-shadow(0 0 8px currentColor)")

const label = svg.selectAll("text")
.data(nodes)
.enter()
.append("text")
.text(d=>d.label)
.attr("fill","#ddd")
.attr("font-size","11px")
.attr("text-anchor","middle")

simulation.on("tick",()=>{

 link
 .attr("x1",d=>d.source.x)
 .attr("y1",d=>d.source.y)
 .attr("x2",d=>d.target.x)
 .attr("y2",d=>d.target.y)

 node
 .attr("cx",d=>d.x)
 .attr("cy",d=>d.y)

 label
 .attr("x",d=>d.x)
 .attr("y",d=>d.y+18)

})

}
// =============================
// UPDATE RADAR SIGNALS
// =============================

function updateFraudSignals(){

fraudChart.data.datasets[0].data=[

Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100

]

fraudChart.update()

}


// =============================
// MAIN LOOP
// =============================

function runSimulation(){

let tx=generateTransaction()

updateFeed(tx)
updateDecision(tx)
updateFraudSignals()
updateMetrics()

}


// =============================
// INITIALIZE DASHBOARD
// =============================

initMap()
initFraudChart()
initLatencyChart()
initRiskGauge()

setInterval(runSimulation,2000)