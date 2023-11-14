const index = "https://media.digitalauto.tech/data/files/216926a2-1357-4fbf-8a4b-d6f307dbb4cbCamera.html";
const pedestrianIndex = "https://media.digitalauto.tech/data/files/59e5e79b-1c52-477a-bcd7-ede7c011a350Pedestrian.html";
const thermometerIndex = "https://media.digitalauto.tech/data/files/8b18cdf5-47c1-4ba4-823c-9ab460b99f06Thermometer.html";
const radioIndex = "https://media.digitalauto.tech/data/files/3ad9d3fb-7af2-432a-b6f6-82e7bb1378afradio.html";

const plugin = ({widgets, simulator, vehicle}) => {

let div= document.createElement("div");
let pedestrianDiv= document.createElement("div");
let thermometerDiv= document.createElement("div");
let radioDiv = document.createElement("div");

var dogMood = "neutral";
var pedestrianInfo = "approaching car";

var ambientTemp = 0;
var ambientTempChange = ()=>{};

simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "get", () => {
    return ambientTemp;
})

simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "subscibe", (f) => {
    ambientTempChange = f;
})

async function updateRadioText() {
    radioDiv.querySelector("#radioText").innerHTML = await vehicle["Cabin.Infotainment.Media.SelectedURI"].get();
}

function updateDogMood () {

    if (this.value === "happy") {
        div.querySelector("#happydogframe").src = "https://www.youtube.com/embed/d3pcXM5wfvA";
        dogMood = "happy";
    } else if(this.value === "sad") {
        div.querySelector("#happydogframe").src = "https://www.youtube.com/embed/3wqSHyeU7tE";
        dogMood = "sad";
    } else {
        div.querySelector("#happydogframe").src = "";
        dogMood = "no dog";
    }
}

function updateTermo() {

    const FILL_HEIGHT = {
	    "very-hot": "11px",
	    hot: "90px",
	    warm: "160px",
	    cold: "230px",
	    "very-cold": "300px"
    };

    let tempFill = thermometerDiv.querySelector(".thermometer-body-fill");
    let controls = thermometerDiv.querySelector(".controls");

    controls.addEventListener("click", (event) => {
	if (event.target.nodeName === "BUTTON") {
		tempFill.style.setProperty("top", FILL_HEIGHT[event.target.id]);
	}
    });
}

function updatePedestrianImage() {

    if (pedestrianDiv.querySelector('#approaching').checked){
        pedestrianInfo = "approaching car"; 
        pedestrianDiv.querySelector("#pedestrian-image").src = "https://media.digitalauto.tech/data/images/28daba7b-d58f-47cb-9074-bd95400211deapproaching2.jpg";
    } else if(pedestrianDiv.querySelector('#pulling').checked) {
        pedestrianInfo = "pulling handle 3x"; 
        pedestrianDiv.querySelector("#pedestrian-image").src = "https://media.digitalauto.tech/data/images/b9634982-6d7f-475e-8e3f-5bd6f79a9c92approaching.png";
    } else {
        pedestrianInfo = "no one"; 
        pedestrianDiv.querySelector("#pedestrian-image").src = "https://media.digitalauto.tech/data/images/fb236bdc-c719-4473-8fbb-3b18718212c1noone.jpg";
    }

}

async function tempSimStep () {
    const fan1Temp = await vehicle["Cabin.HVAC.Station.Row2.Right.Temperature"].get();
    const fan2Temp = await vehicle["Cabin.HVAC.Station.Row2.Left.Temperature"].get();
    const fan1Speed = await vehicle["Cabin.HVAC.Station.Row2.Right.FanSpeed"].get();
    const fan2Speed = await vehicle["Cabin.HVAC.Station.Row2.Left.FanSpeed"].get();

    const avgTemp = (fan1Temp + fan2Temp) / 2;
    const avgSpeed = (fan1Speed + fan2Speed) / 2;

    ambientTemp = (ambientTemp + (avgTemp * avgSpeed / 100)) / 2;
    ambientTempChange(ambientTemp);
}

setInterval(tempSimStep, 1000)

function updateDiv (text, div) {
    fetch(text).then(r=>r.text()).then(t=>div.innerHTML = t).then(() => {div.querySelector("#dog-names").addEventListener("change", updateDogMood)});
}

function updatePedestrian (text, pedestrianDiv) {

    fetch(text).then(r=>r.text()).then(t=>pedestrianDiv.innerHTML = t).then(() => {
        pedestrianDiv.querySelector('#pedestrian-radio-buttons').addEventListener("change", function() {
            updatePedestrianImage();
        });
    }); 
} 

function updateThermo (text, thermometerDiv) {
     fetch(text).then(r=>r.text()).then(t=>thermometerDiv.innerHTML = t).then(() => {thermometerDiv.querySelector(".controls").addEventListener("click", function () {
        updateTermo()  })});
}

function updateRadio (text, radioDiv) {
     fetch(text).then(r=>r.text()).then(t=>radioDiv.innerHTML = t).then(() => {
         console.log("Update Radio ***");
         setInterval(updateRadioText, 1000);
     });
}

updateDiv(index, div);
updatePedestrian(pedestrianIndex, pedestrianDiv);
updateThermo(thermometerIndex, thermometerDiv);
updateRadio(radioIndex, radioDiv);

widgets.register("DoggyCam", (box) => {
    box.injectNode(div);    
})

widgets.register("PedestrianInfo", (box) => {
    box.injectNode(pedestrianDiv);    
})

widgets.register("Thermometer", (box) => {
    box.injectNode(thermometerDiv);    
})

widgets.register("Radio", (box) => {
    box.injectNode(radioDiv);    
})

let mobileNotifications = null;

widgets.register("Mobile", (box) => {
	({printNotification: mobileNotifications} = MobileNotifications({
		apis : null,
		vehicle: null,
		box: box,
		refresh: null,
        paddingTop: 70,
        paddingHorizontal: 25
	}))
});


 return {
        dog_mood : () => {
            return dogMood;
        },
        pedestrian_info: ()  => {
            return pedestrianInfo;
        },
        notifyPhone: (message) => {
            mobileNotifications(message)
        }
    }
}

export default plugin


const MobileNotifications = ({box, apis = null, vehicle = null, refresh = null, paddingTop = 25, paddingHorizontal = 12, backgroundColor = null}) => {
    const container = document.createElement("div")
    container.setAttribute("style", `height: 100%; width: 100%;`)
    container.innerHTML = (`
    <style>
		@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
            color:#ffffe3;
            background-color:${backgroundColor};
            text-align:center;            
        }
		</style>
    <div style="max-width: fit-content; margin: 0 auto; position: relative;">
    <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FDashboardPhone.png?alt=media&token=d361018a-b4b3-42c0-8ef0-16c9e70fd9c7" style="height: 100%; width: 100%; object-fit: contain;">
        <div class="smartphone-text" style="position: absolute; color: white; font-family: 'Lato'; width: 100%; top: 0; height: 100%; box-sizing: border-box; padding-top: ${paddingTop}px; padding-right: ${paddingHorizontal}px; padding-left: ${paddingHorizontal}px; padding-bottom: 25px; white-space: break-spaces;"></div>
    </div>
    `)
    box.injectNode(container)

    const updateNotification = async () => {
        if(apis !== null || apis !== undefined) {
            for (const api of apis) {
                const stripped = api.split(".").slice(1).join(".")
                const val = await vehicle[stripped].get()
                if (box !== null) {
                    container.querySelector(".smartphone-text").textContent = val
                }
            }
        }                    
    }

    if (refresh !== null) {
        if (typeof refresh !== "number") {
            throw new Error("parameter 'refresh' must be an error")
        }
        const intervalId = setInterval(updateNotification, refresh)
        return () => clearInterval(intervalId)
    }

    return {
        printNotification: (message) => {

            console.log("PRINT !!!!!")
            console.log(message)

            if(message !== undefined || message !== "") {
                container.querySelector(".smartphone-text").textContent = message
            }            
        }
    }

};
  
