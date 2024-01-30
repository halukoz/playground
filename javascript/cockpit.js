const index = "https://media.digitalauto.tech/data/files/216926a2-1357-4fbf-8a4b-d6f307dbb4cbCamera.html";
const pedestrianIndex = "https://media.digitalauto.tech/data/files/59e5e79b-1c52-477a-bcd7-ede7c011a350Pedestrian.html";
const thermometerIndex = "https://media.digitalauto.tech/data/files/8b18cdf5-47c1-4ba4-823c-9ab460b99f06Thermometer.html";
const radioIndex = "https://media.digitalauto.tech/data/files/3ad9d3fb-7af2-432a-b6f6-82e7bb1378afradio.html";
const carOutsideIndex = "https://media.digitalauto.tech/data/files/8774e40e-4415-44d5-b4d4-78898abcfd0eCarOutside.html";
const klimaIndex = "https://media.digitalauto.tech/data/files/2ed63707-50f5-4978-bf4a-ef7dad517e56luftung.html";


const plugin = ({widgets, simulator, vehicle}) => {

let div = document.createElement("div");
let pedestrianDiv = document.createElement("div");
let thermometerDiv = document.createElement("div");
let radioDiv = document.createElement("div");
let carOutsideDiv = document.createElement("div");
let klimaDiv = document.createElement("div");

var dogMood = "no dog";
var pedestrianInfo = "";

var ambientTemp = 0;
let isPedestrianInfoShown = false;
let pedestrianApproachingMessage = "Dog is fine! if you think otherwise, pull handle 3 times.";
let pedestrianPullingMessage = "The owner is informed.";

simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "subscibe", (f) => {
    ambientTempChange = f;
})

simulator("Vehicle.Cabin.Dog.Mood", "get", () => {
    return dogMood;
})

simulator("Vehicle.Exterior.Speaker.Message", "get", () => {
    if (pedestrianInfo == "approaching car") {
        return pedestrianApproachingMessage;
    } else if(pedestrianInfo == "pulling handle 3x") {
        return pedestrianPullingMessage;
    } else {
        return "";
    }
      
})

simulator("Vehicle.Cabin.Dog.Present", "get", () => {
    return ! (dogMood === "no dog")
})

simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "get", () => {
    return ambientTemp;
})

simulator("Vehicle.Exterior.PedestrianApproach", "get", () => {
    return (pedestrianInfo === "pulling handle 3x");
})

simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "subscribe", (callback) => {
    console.log(callback);
})

simulator("Vehicle.Exterior.PedestrianApproach", "subscribe", (callback) => {
    console.log("subscribed: ");
    console.log(callback);
})

simulator("Vehicle.Cabin.Door.Row1.Left.IsHandlePulled", "subscribe", (callback) => {
    console.log("subscribed: ");
    console.log(callback);
})
simulator("Vehicle.Cabin.Door.Row1.Right.IsHandlePulled", "subscribe", (callback) => {
    console.log("subscribed: ");
    console.log(callback);
})
simulator("Vehicle.Cabin.Door.Row2.Left.IsHandlePulled", "subscribe", (callback) => {
    console.log("subscribed: ");
    console.log(callback);
})
simulator("Vehicle.Cabin.Door.Row2.Right.IsHandlePulled", "subscribe", (callback) => {
    console.log("subscribed: ");
    console.log(callback);
})

simulator("Vehicle.CurrentLocation.Timestamp", "get", () => {
    return Date.now();
})

async function updateRadioText() {
    radioDiv.querySelector("#radioText").innerHTML = await vehicle["Cabin.Infotainment.Media.SelectedURI"].get();
}

function updateDogMood () {
    if (div.querySelector('#happy').checked) {
        div.querySelector("#happydogframe").src = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fcalm.gif?alt=media&token=7c01a791-1be9-402b-8609-094ed3ee88e1";
        dogMood = "happy";
        
    } else if(div.querySelector('#sad').checked) {
        div.querySelector("#happydogframe").src = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fwild.gif?alt=media&token=ac5dbeaf-6fb4-4efb-a4b8-817c18bc9662";
        dogMood = "sad";
    } else {
        div.querySelector("#happydogframe").src = "https://media.digitalauto.tech/data/images/0d7f20bd-087a-4163-afe9-efcda5f23a11nodog-im-auto.jpg";
        dogMood = "no dog";
    }
}

function updateTermo() {

    let colorRed = "#db1d1d";
    let colorYellow = "#FAD02C";
    let colorBlue = "#0000FF";

    const FILL_HEIGHT = {
	    "very-hot": "11px",
	    hot: "90px",
        neutral: "130px",
	    warm: "160px",
	    cold: "230px"
    };

    let tempFill = thermometerDiv.querySelector(".thermometer-body-fill");
    let controls = thermometerDiv.querySelector(".controls");
    let tempBaseFill = thermometerDiv.querySelector(".thermometer-base-fill");
    

    tempFill.style.setProperty("top", FILL_HEIGHT["neutral"]);
    let tempBase = thermometerDiv.querySelector(".thermometer-base");
    tempBase.style.backgroundColor  = colorYellow;
    tempFill.style.backgroundColor  = colorYellow;
    tempBaseFill.style.backgroundColor  = colorYellow;

    controls.addEventListener("click", (event) => {

	if (event.target.nodeName === "BUTTON") {

        if(event.target.id === 'very-hot') {
            ambientTemp = 40;
            tempBase.style.backgroundColor  = colorRed;
            tempFill.style.backgroundColor  = colorRed;
            tempBaseFill.style.backgroundColor  = colorRed;

            klimaDiv.querySelector("#klima-image-above").style.visibility = 'visible';
            klimaDiv.querySelector("#klima-image-above").src = "https://media.digitalauto.tech/data/images/75cc03ae-8ff8-4103-a364-fca34385f94acold.png";
        } else if(event.target.id === 'hot') {
            ambientTemp = 30;            
            tempBase.style.backgroundColor  = colorRed;
            tempFill.style.backgroundColor  = colorRed;
            tempBaseFill.style.backgroundColor  = colorRed;

            klimaDiv.querySelector("#klima-image-above").style.visibility = 'visible';
            klimaDiv.querySelector("#klima-image-above").src = "https://media.digitalauto.tech/data/images/75cc03ae-8ff8-4103-a364-fca34385f94acold.png";
        } else if(event.target.id === 'warm') {
            ambientTemp = 20;
            tempBase.style.backgroundColor  = colorBlue;
            tempFill.style.backgroundColor  = colorBlue;
            tempBaseFill.style.backgroundColor  = colorBlue;

            klimaDiv.querySelector("#klima-image-above").style.visibility = 'visible';
            klimaDiv.querySelector("#klima-image-above").src = "https://media.digitalauto.tech/data/images/81c6801e-7e78-4888-b0c3-fd3554febbb4warm.png";
        } else if(event.target.id === 'cold'){
            ambientTemp = 10;
            tempBase.style.backgroundColor  = colorBlue;
            tempFill.style.backgroundColor  = colorBlue;
            tempBaseFill.style.backgroundColor  = colorBlue;

            klimaDiv.querySelector("#klima-image-above").style.visibility = 'visible';
            klimaDiv.querySelector("#klima-image-above").src = "https://media.digitalauto.tech/data/images/81c6801e-7e78-4888-b0c3-fd3554febbb4warm.png";
        } 
		tempFill.style.setProperty("top", FILL_HEIGHT[event.target.id]);
	}
    });
}

function updatePedestrianImage() {

    if (pedestrianDiv.querySelector('#approaching').checked){
        pedestrianInfo = "approaching car"; 
        isPedestrianInfoShown = false;
        pedestrianDiv.querySelector("#pedestrian-image").src ="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fapproach%201.gif?alt=media&token=675aaa9d-1fce-4c71-b9e7-ec67eaed6759" ;
    
    } else if(pedestrianDiv.querySelector('#pulling').checked) {
        pedestrianInfo = "pulling handle 3x"; 
        isPedestrianInfoShown = false;
        pedestrianDiv.querySelector("#pedestrian-image").src = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fpull%201.gif?alt=media&token=e9b6296b-3c14-4322-85c9-7ce74bceca8c";
    } else {
        pedestrianInfo = "no one"; 
        pedestrianDiv.querySelector("#pedestrian-image").src = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FMicrosoftTeams-image%20(1).png?alt=media&token=d17841fa-24ce-407e-a3ee-c54c6e372839";
    }
}

function disapperMessage() {
    isPedestrianInfoShown = true;
    carOutsideDiv.querySelector("#car-window-text").style.visibility = 'hidden';
}

function showPedestrianMessage(pullInfo, pedestrian_message) {

    if (pullInfo == "show-pedestrian-message" && !isPedestrianInfoShown && pedestrianInfo == "approaching car") {
        carOutsideDiv.querySelector("#car-window-text").style.visibility = 'visible';
        carOutsideDiv.querySelector("#dog-mood").textContent = pedestrian_message;
        carOutsideDiv.querySelector('.box').style['height'] = "80px";
        setTimeout(disapperMessage, 5000);
    } else if (pullInfo == "show-pedestrian-message" && !isPedestrianInfoShown && pedestrianInfo == "pulling handle 3x") {
        carOutsideDiv.querySelector("#car-window-text").style.visibility = 'visible';
        carOutsideDiv.querySelector("#dog-mood").textContent = pedestrian_message;
        carOutsideDiv.querySelector('.box').style['height'] = "40px";
        setTimeout(disapperMessage, 5000);
    } else {
        carOutsideDiv.querySelector("#car-window-text").style.visibility = 'hidden';
    }

}


function updateCarWindowImage(movement) {

    if (movement === "open"){
        carOutsideDiv.querySelector("#car-window-image").src = "https://media.digitalauto.tech/data/images/70a0f85a-5e79-4749-9922-9dbec48ada53open.jpg";
    
    } else if(movement === "close") {
        carOutsideDiv.querySelector("#car-window-image").src = "https://media.digitalauto.tech/data/images/74b79804-c5e4-4b93-95ec-230f51139feaclose.png";
    } 
}


function updateDiv (text, div) {
    fetch(text).then(r=>r.text()).then(t=>div.innerHTML = t).then(() => {div.querySelector("#dog-mode-radio-buttons").addEventListener("change", updateDogMood)});
}

function updatePedestrian (text, pedestrianDiv) {

    fetch(text).then(r=>r.text()).then(t=>pedestrianDiv.innerHTML = t).then(() => {
        pedestrianDiv.querySelector('#pedestrian-radio-buttons').addEventListener("change", function() {
            updatePedestrianImage();
        });
    }); 
} 


function updateCarOutside (text, carOutsideDiv) {

    fetch(text).then(r=>r.text()).then(t=>carOutsideDiv.innerHTML = t).then(() => {

    }); 
} 

function updateThermo (text, thermometerDiv) {
     fetch(text).then(r=>r.text()).then(t=>thermometerDiv.innerHTML = t).then(() => {
        updateTermo() });
}

function updateRadio (text, radioDiv) {
     fetch(text).then(r=>r.text()).then(t=>radioDiv.innerHTML = t).then(() => {
         setInterval(updateRadioText, 1000);
     });
}

function updateKlima(text, klimaDiv) {
     fetch(text).then(r=>r.text()).then(t=>klimaDiv.innerHTML = t).then(() => {
     });
}

updateDiv(index, div);
updatePedestrian(pedestrianIndex, pedestrianDiv);
updateCarOutside(carOutsideIndex, carOutsideDiv);
updateThermo(thermometerIndex, thermometerDiv);
updateRadio(radioIndex, radioDiv);
updateKlima(klimaIndex, klimaDiv);

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

widgets.register("CarOutside", (box) => {
    box.injectNode(carOutsideDiv);
})

widgets.register("Klima", (box) => {
    box.injectNode(klimaDiv); 
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

const container = document.createElement("div")

const MobileNotifications = ({box, apis = null, vehicle = null, refresh = null, paddingTop = 0, paddingHorizontal = 12, backgroundColor = null}, dog_mood) => {
    
    let allMessages = "";
    let isCameraOpened = false;
  
    container.setAttribute("style", `height: 93%; width: 100%;`)
    container.innerHTML = (`
    <style>
		@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        html {
            background: black;
        }
        body {
            font-family: 'Lato', sans-serif;
            color:#ffffe3;
            background-color:${backgroundColor};
            text-align:center;            
        }
		</style>
    <div style="max-width: fit-content; margin: 0 auto; position: relative;">
    <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FDashboardPhone.png?alt=media&token=d361018a-b4b3-42c0-8ef0-16c9e70fd9c7" style="height: 95%; width: 100%; object-fit: contain;">
        <div class="smartphone-text" style="position: absolute; color: white; font-weight: bold; font-family: 'Lato'; width: 100%; top: 0; height: 95%; box-sizing: border-box; padding-top: ${paddingTop}px; padding-right: ${paddingHorizontal}px; padding-left: ${paddingHorizontal}px; padding-bottom: 25px; white-space: break-spaces;"></div>
    </div>
    <img id="dog-photo-happy" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fcalm.gif?alt=media&token=7c01a791-1be9-402b-8609-094ed3ee88e1" width="280" height="280" style="position: relative; top: -550px; margin-left: 37px; display:none"></img>
    <img id="dog-photo-sad" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fwild.gif?alt=media&token=ac5dbeaf-6fb4-4efb-a4b8-817c18bc9662" width="280" height="280" style="position: relative; top: -550px; margin-left: 37px; display:none"></img>
    <img id="dog-photo-no" src="https://media.digitalauto.tech/data/images/0d7f20bd-087a-4163-afe9-efcda5f23a11nodog-im-auto.jpg" width="280" height="280" style="position: relative; top: -550px; margin-left: 37px; display:none"></img>
    <p style="position: relative; top: -550px" ><i>Do you want to see your dog?</i></p>
    <button class="button" id="openCameraId" style="position: relative; top: -520px; background-color: #04AA6D; border: none; color: white; padding: 5px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Open Camera</button>
    <button class="button" id="closeCameraId" style="position: relative; top: -520px; background-color: #008CBA; border: none; color: white; padding: 5px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;" onclick="closeCamera()">Close Camera</button>
    <img src="https://www.opitz-consulting.com/themes/oc/images/oc_logo_white.svg" alt="" width="150" height="150" style="position: fixed; bottom: 12%; left: 30%; z-index:1000">
    `)
    box.injectNode(container)

    container.querySelector("#openCameraId").addEventListener("click", openCamera);
    container.querySelector("#closeCameraId").addEventListener("click", closeCamera);

    function updateImage() {
      if (isCameraOpened) {
        if (dogMood === 'happy') {
            container.querySelector("#dog-photo-happy").style.display = 'block';
            container.querySelector("#dog-photo-sad").style.display = 'none';
            container.querySelector("#dog-photo-no").style.display = 'none';
      
        } else if (dogMood === 'sad') {
            container.querySelector("#dog-photo-sad").style.display = 'block';
            container.querySelector("#dog-photo-happy").style.display = 'none';
            container.querySelector("#dog-photo-no").style.display = 'none';
        } else {
            container.querySelector("#dog-photo-no").style.display = 'block';
           container.querySelector("#dog-photo-sad").style.display = 'none';
            container.querySelector("#dog-photo-happy").style.display = 'none';
        }
      }
    
    }

    function openCamera() {
        isCameraOpened = true;
        setInterval(updateImage, 100);
    }
    
    function closeCamera(e) {
        isCameraOpened = false;
        container.querySelector("#dog-photo-happy").style.display = 'none';
        container.querySelector("#dog-photo-sad").style.display = 'none';
        container.querySelector("#dog-photo-no").style.display = 'none';
    }

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
            if(message !== undefined || message !== "") {
                allMessages = message + "\n";
                container.querySelector(".smartphone-text").textContent = allMessages
            }        
        }
    }

};

widgets.register("Terminal", (box) => {
        const div = document.createElement("div")
        div.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
        <div class="flex flex-col text-gray-100 text-sm subpixel-antialiased bg-gray-800 leading-normal overflow-auto h-48 scroll-gray h-full" id="terminal-container-id" >
            <div class="top flex items-center sticky top-0 left-0 bg-gray-800 px-5 pt-4 pb-2" >
                <div class="select-none" >Terminal</div>
            </div>
            <div class="flex flex-col h-full px-5 text-xs terminal-lines" id="terminal-line-id"></div>
        </div>
        `
        box.injectNode(div)


        print = (text) => {
            const line = document.createElement("div")
            line.className = "flex mt-2 font-mono last:pb-4"
            line.innerHTML = `
            <span class="text-green-400 select-none">&gt;&gt;&gt;</span>
            <p class="flex-1 items-center pl-2 whitespace-pre-line">${text}</p>
            `
          
           div.querySelector(".terminal-lines").appendChild(line);
           div.querySelector('#terminal-container-id').scrollTop = div.querySelector('#terminal-container-id').scrollHeight;
        }

        return () => {
            print = null
        }
    })


 return {
        dog_mood : () => {
            return dogMood;
        },
        pedestrian_info: ()  => {
            return pedestrianInfo;
        },
        notifyPhone: (message, dog_mood) => {
            mobileNotifications(message, dog_mood);
        },
        streamDialoguePhone: (callback) => {
            console.log(callback)
        },
        controlWindow: (movement) => {
            updateCarWindowImage(movement)
        },
        showPedestrianMessage: (pullInfo, pedestrian_message) => {
            showPedestrianMessage(pullInfo, pedestrian_message);
        },
        printLine: (text) => {
            if (print !== null) {
                print(text)
            }
        }
    }
}

export default plugin



  
