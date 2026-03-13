/* counters */

function animateCounter(id,target){

let el=document.getElementById(id)
let count=0

let interval=setInterval(()=>{

count+=Math.ceil(target/40)

if(count>=target){
count=target
clearInterval(interval)
}

el.innerText=count

},20)

}

animateCounter("approvedCount",12911)
animateCounter("blockedCount",406)
animateCounter("challengeCount",160)



/* latency */

const latencyChart=new Chart(document.getElementById("latency"),{

type:'doughnut',

data:{
labels:["Latency","Remaining"],
datasets:[{
data:[0,200],
backgroundColor:["#00f7ff","#09121c"]
}]
},

options:{cutout:'80%',plugins:{legend:{display:false}}}

})

function updateLatency(){

let latency=Math.floor(Math.random()*120)+20

document.getElementById("latencyValue").innerText=latency+"ms"

latencyChart.data.datasets[0].data=[latency,200-latency]

latencyChart.update()

}

setInterval(updateLatency,2000)



/* radar */

const ctx = document.getElementById("graph").getContext("2d")

const gradient = ctx.createRadialGradient(200,200,50,200,200,200)

gradient.addColorStop(0,"rgba(255,60,60,0.6)")
gradient.addColorStop(1,"rgba(255,0,0,0.05)")

const fraudChart = new Chart(ctx,{

type:'radar',

data:{
labels:["Device Risk","Geo Anomaly","Proxy Use","Wallet Risk","Card Behavior"],

datasets:[{
label:"Fraud Risk Signals",

data:[35,60,50,70,45],

backgroundColor:gradient,

borderColor:"#ff3b3b",

borderWidth:3,

pointBackgroundColor:"#ff3b3b",

pointBorderColor:"#ffffff",

pointRadius:6,

pointHoverRadius:10
}]
},

options:{

plugins:{
legend:{
labels:{
color:"#ffffff",
font:{size:14}
}
}
},

scales:{
r:{

min:0,
max:100,

grid:{
color:"rgba(255,255,255,0.08)"
},

angleLines:{
color:"rgba(255,255,255,0.15)"
},

pointLabels:{
color:"#00f7ff",
font:{size:14}
},

ticks:{
color:"#aaa",
backdropColor:"transparent"
}

}
}

}

})

function updateFraudSignals(){

let signals=[

Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100

]

fraudChart.data.datasets[0].data = signals

fraudChart.update()

}

setInterval(updateFraudSignals,3000)



/* feed */

function loadFeed(){

const merchants=["Stripe","PayPal","Binance","Adyen"]

let html=""

for(let i=0;i<5;i++){

let amount=(Math.random()*5000).toFixed(2)
let prob=Math.random()

let fraudClass=prob>0.8?"fraud":""

let status=prob>0.8?
`<span class="blocked">BLOCKED</span>`:
`<span class="approved">APPROVED</span>`

html+=`
<li class="${fraudClass}">
<span>$${amount} ${merchants[Math.floor(Math.random()*4)]}</span>
${status}
</li>
`

}

document.getElementById("feed").innerHTML=html

}

setInterval(loadFeed,3000)
loadFeed()



/* decision simulation */

function simulateDecision(){

const merchants=["Stripe","PayPal","Binance","Adyen"]
const countries=["USA","India","Brazil","China"]

let amount=(Math.random()*5000).toFixed(2)
let risk=Math.random()

let decision=risk>0.8?"BLOCKED":"APPROVED"

document.getElementById("txAmount").innerText="$"+amount
document.getElementById("txMerchant").innerText=
merchants[Math.floor(Math.random()*4)]

document.getElementById("txCountry").innerText=
countries[Math.floor(Math.random()*4)]

document.getElementById("riskScore").innerText=
Math.floor(risk*100)+"%"

const label=document.getElementById("decisionLabel")

label.innerText=decision

label.className=decision==="BLOCKED"?"blocked":"approved"

}

setInterval(simulateDecision,4000)
simulateDecision()



/* risk gauge */

new Chart(document.getElementById("riskGauge"),{

type:'doughnut',

data:{
datasets:[{
data:[90,10],
backgroundColor:["red","#0f2c40"]
}]
},

options:{cutout:'80%',plugins:{legend:{display:false}}}

})
/* =========================
   FRAUD WORLD MAP
========================= */

const map = L.map('fraudMap',{

zoomControl:false

}).setView([20,0],2)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'',
opacity:0.6
}
).addTo(map)



/* fraud locations */

const fraudLocations=[
[40.7128,-74.0060],   // New York
[51.5074,-0.1278],    // London
[28.6139,77.2090],    // Delhi
[1.3521,103.8198],    // Singapore
[-23.5505,-46.6333],  // Brazil
[35.6895,139.6917]    // Tokyo
]



function addFraudMarker(lat,lng){

let circle=L.circle([lat,lng],{

color:'red',
fillColor:'red',
fillOpacity:0.5,
radius:400000

}).addTo(map)



/* blinking effect */

setInterval(()=>{

circle.setStyle({

fillOpacity:Math.random()

})

},800)

}



/* add markers */

fraudLocations.forEach(loc=>{

addFraudMarker(loc[0],loc[1])

})



/* simulate new fraud attacks */

function simulateFraud(){

let lat=(Math.random()*180)-90
let lng=(Math.random()*360)-180

addFraudMarker(lat,lng)

}

setInterval(simulateFraud,6000)
document.addEventListener("DOMContentLoaded", function(){

const map = L.map('fraudMap').setView([20,0],2)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:18,
attribution:''
}
).addTo(map)


const fraudLocations=[
[40.7128,-74.0060],
[51.5074,-0.1278],
[28.6139,77.2090],
[1.3521,103.8198],
[-23.5505,-46.6333],
[35.6895,139.6917]
]


fraudLocations.forEach(loc=>{

L.circle(loc,{
color:'red',
fillColor:'red',
fillOpacity:0.6,
radius:400000
}).addTo(map)

})

})