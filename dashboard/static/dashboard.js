/* =============================
GLOBAL VARIABLES
============================= */

let approved = 0
let blocked = 0
let challenge = 0

let map
let latencyChart
let riskGauge
let fraudChart
/* =============================
INITIALIZE MAP
============================= */

function initMap(){

map = L.map('fraudMap').setView([20,0],2)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map)

}

/* =============================
FRAUD MAP MARKER
============================= */

function addFraudLocation(coords){

let marker = L.circleMarker(coords,{
radius:6,
color:"red",
fillColor:"red",
fillOpacity:0.7
})

marker.addTo(map)

setTimeout(()=>{
map.removeLayer(marker)
},8000)

}

/* =============================
COUNTRY LOCATION
============================= */

function getLocation(country){

const locations = {

"USA":[37.09,-95.71],
"India":[20.59,78.96],
"UK":[55.37,-3.43],
"Germany":[51.16,10.45],
"Singapore":[1.35,103.81]

}

return locations[country] || [20,0]

}

/* =============================
FRAUD COMPANY GRAPH
============================= */
function initFraudChart(){

const ctx = document.getElementById("fraudChart")

fraudChart = new Chart(ctx,{
type:"bar",
data:{
labels:[],
datasets:[{
label:"Fraud Risk %",
data:[],
backgroundColor:"#ff3b3b"
}]
},
options:{
responsive:true,
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
})

}
function initFraudChart(){

const ctx = document.getElementById("fraudChart")

fraudChart = new Chart(ctx,{
type:"bar",
data:{
labels:[],
datasets:[{
label:"Fraud Risk %",
data:[],
backgroundColor:"#ff3b3b"
}]
},
options:{
responsive:true,
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
})

}
function updateFraudGraph(){

const width = document.getElementById("fraudGraph").clientWidth
const height = 320

d3.select("#fraudGraph svg").remove()

const svg = d3.select("#fraudGraph")
.append("svg")
.attr("width",width)
.attr("height",height)

const rows = document.querySelectorAll("#feed li")

const nodes = [
{id:"Transaction",type:"core"}
]

const links = []
const merchantMap = {}

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

Object.keys(merchantMap).forEach(merchant => {

const avgRisk = merchantMap[merchant].total / merchantMap[merchant].count

let level="low"
if(avgRisk > 70) level="high"
else if(avgRisk > 40) level="medium"

nodes.push({
id: merchant,
level: level
})

links.push({
source:"Transaction",
target:merchant,
distance:80+avgRisk
})

})

const simulation = d3.forceSimulation(nodes)
.force("link", d3.forceLink(links).id(d=>d.id).distance(d=>d.distance))
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
.attr("r",d=>d.id==="Transaction"?18:10)
.style("fill",d=>{
if(d.id==="Transaction") return "#8b5cf6"
if(d.level==="high") return "#ff3b3b"
if(d.level==="medium") return "#ffc857"
return "#00f7ff"
})

const label = svg.selectAll("text")
.data(nodes)
.enter()
.append("text")
.text(d=>d.id)
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

/* =============================
LATENCY CHART
============================= */

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

/* =============================
RISK GAUGE
============================= */

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
options:{cutout:"70%"}
})

}

/* =============================
GENERATE TRANSACTION
============================= */

function generateTransaction(){

const merchants=[
"Amazon","Stripe","Binance","PayPal",
"Apple Store","Netflix","Uber"
]

const countries=[
"USA","India","UK","Germany","Singapore"
]

return{

amount:(Math.random()*5000).toFixed(2),

merchant: merchants[Math.floor(Math.random()*merchants.length)],

country: countries[Math.floor(Math.random()*countries.length)],

risk:Math.random()

}

}

/* =============================
UPDATE METRICS
============================= */

function updateMetrics(){

document.getElementById("approvedCount").innerText=approved
document.getElementById("blockedCount").innerText=blocked
document.getElementById("challengeCount").innerText=challenge

let latency=Math.floor(Math.random()*200)+50

document.getElementById("latencyValue").innerText=latency+" ms"

latencyChart.data.labels.push("")
latencyChart.data.datasets[0].data.push(latency)

if(latencyChart.data.labels.length>10){

latencyChart.data.labels.shift()
latencyChart.data.datasets[0].data.shift()

}

latencyChart.update()

}

/* =============================
AI DECISION PANEL
============================= */

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

}

else{

label.innerText="APPROVED"
label.classList.add("approved")

approved++

}

updateMetrics()

}

/* =============================
UPDATE FEED
============================= */

function updateFeed(tx){

let feed = document.getElementById("feed")
let li = document.createElement("li")

let risk = (tx.risk*100).toFixed(1)

let actionButtons=""

if(tx.risk>0.4 && tx.risk<=0.7){

challenge++

actionButtons = `
<div class="action-area">
<button class="approve-btn" onclick="approveTx(this)">Approve</button>
<button class="block-btn" onclick="blockTx(this)">Block</button>
</div>
`
}

if(tx.risk>0.7){
li.classList.add("fraud")
}

li.innerHTML=`<span>$${tx.amount}</span> <span>${tx.merchant}</span> <span>${risk}%</span>
${actionButtons}`

feed.prepend(li)

if(feed.children.length>10){
feed.removeChild(feed.lastChild)
}

updateFraudGraph()

}

/* =============================
APPROVE / BLOCK
============================= */

function approveTx(btn){

approved++

if(challenge>0) challenge--

updateMetrics()

btn.parentElement.innerHTML=
`<span class="approved-status">APPROVED</span>`

}

function blockTx(btn){

blocked++

if(challenge>0) challenge--

updateMetrics()

btn.parentElement.innerHTML=
`<span class="blocked-status">BLOCKED</span>`

}

/* =============================
SIMULATION LOOP
============================= */

function runSimulation(){

let tx = generateTransaction()

updateFeed(tx)
updateDecision(tx)

}

/* =============================
INITIALIZE DASHBOARD
============================= */

window.onload=()=>{

initMap()
initFraudChart()
updateFraudGraph()
initLatencyChart()
initRiskGauge()

setInterval(runSimulation,2000)

}
