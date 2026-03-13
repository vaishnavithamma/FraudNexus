function loadFeed(){

fetch("/feed")
.then(res=>res.json())
.then(data=>{

let html=""

data.forEach(t=>{

let statusHTML=""

if(t.probability > 0.8){

statusHTML=`<span class="blocked">BLOCKED</span>`

}

else if(t.probability < 0.4){

statusHTML=`<span class="approved">APPROVED</span>`

}

else{

statusHTML=`
<button onclick="approve(${t.id})">Approve</button>
<button onclick="block(${t.id})">Block</button>
`

}

html+=`
<li>
<span>$${t.amount} ${t.merchant}</span>
${statusHTML}
</li>
`

})

document.getElementById("feed").innerHTML=html

})

}

setInterval(loadFeed,3000)
loadFeed()



function approve(id){

fetch("/approve/"+id)
.then(res=>res.json())
.then(data=>{

document.getElementById("approvedCount").innerText = data.approved
document.getElementById("challengeCount").innerText = data.challenges

})

}



function block(id){

fetch("/block/"+id)
.then(res=>res.json())
.then(data=>{

document.getElementById("blockedCount").innerText = data.blocked
document.getElementById("challengeCount").innerText = data.challenges

})

}



const latencyChart = new Chart(document.getElementById("latency"),{

type:'doughnut',

data:{
labels:["Latency","Remaining"],
datasets:[{
data:[0,200],
backgroundColor:["#00f7ff","#09121c"],
borderWidth:0
}]
},

options:{
cutout:'80%',
plugins:{legend:{display:false}},
animation:{animateRotate:true}
}

})


function updateLatency(){

let latency = Math.floor(Math.random()*120)+20

document.getElementById("latencyValue").innerText = latency + "ms"

latencyChart.data.datasets[0].data=[latency,200-latency]

latencyChart.update()

}

setInterval(updateLatency,2000)
updateLatency()



const fraudChart = new Chart(document.getElementById("graph"),{

type:'radar',

data:{
labels:["Device","Geo","Proxy","Wallet","Card"],
datasets:[{
label:"Fraud Risk Signals",
data:[20,30,40,50,25],
backgroundColor:"rgba(0,247,255,0.15)",
borderColor:"#00f7ff",
pointBackgroundColor:"#00f7ff",
pointRadius:4
}]
},

options:{
scales:{
r:{
min:0,
max:100,
grid:{color:"rgba(0,255,255,0.15)"},
angleLines:{color:"rgba(0,255,255,0.2)"},
pointLabels:{color:"#9befff",font:{size:12}}
}
},
plugins:{legend:{display:false}}
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
updateFraudSignals()