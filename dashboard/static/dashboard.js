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

function addFraudLocation(lat,lng){

let marker = L.circleMarker([lat,lng],{
radius:8,
color:"red",
fillColor:"red",
fillOpacity:0.7
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

label.className=""

if(tx.risk>0.7){

label.innerText="BLOCKED"
label.classList.add("blocked")
blocked++

addFraudLocation(
(Math.random()*120)-60,
(Math.random()*360)-180
)

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