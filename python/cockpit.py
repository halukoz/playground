from sdv_model import Vehicle
import plugins
from browser import aio
vehicle = Vehicle()

high_temperature = 30
extremely_high_temperature = 40
low_temperature = 15
extremely_low_temperature = 5
temperature_goal = 20
fan_speed_low = 30
fan_speed_high = 100
min_pedestrian_distance = 50
dog_max_sad_time = 30 * 1000
dog_min_sad_time = 10 * 1000


message_extreme_temperature = "EXTREME TEMPERATURE! get your dog!"
message_pedestrian_alert = "Someone thinks your dog is not ok. please com check!"

message_dog_fine = "The dog is fine! Thanks for your concern. If you think the dog is unwell pull the door handle three times"
message_dog_AC = "The AC is running, the dog is fine! Thanks for your concern. If you think the dog is unwell pull the door handle three times"
message_dog_owner = "The owner is informed. The dog will be fine. If you think the dog is unwell pull the door handle three times"
message_dog_danger = "The dog is in danger, the owner is informed, if possible call the authorities"

handle_timeout = 3000
handle_pull_times = 3
pedestrian_cooldown = 15000

OPEN = True
CLOSE = False
HIGH = 100
MEDIUM = 30
OFF = 0
OWNERVOICE = "Live voice from owner"
CALMMUSIC = "Dog calming sounds"
NOTHING = ""

cockpit = plugins.get_plugin("Cockpit")

def convertMillis(millis):
    seconds=int(millis/1000)%60
    minutes=int(millis/(1000*60))%60
    hours=int(millis/(1000*60*60))%24
    return seconds, minutes, hours

async def allWindows(open):
    if open:
        cockpit.printLine("opening all windows to 10%")
        window = await vehicle.Cabin.Door.Row1.Left.Window.IsOpen.get()
        if not window:
            await vehicle.Cabin.Door.Row1.Left.Window.Switch.set("10%")
        window = await vehicle.Cabin.Door.Row1.Right.Window.IsOpen.get()
        if not window:
            await vehicle.Cabin.Door.Row1.Right.Window.Switch.set("10%")
        window = await vehicle.Cabin.Door.Row2.Left.Window.IsOpen.get()
        if not window:
            await vehicle.Cabin.Door.Row2.Left.Window.Switch.set("10%")
        window = await vehicle.Cabin.Door.Row2.Right.Window.IsOpen.get()
        if not window:
            await vehicle.Cabin.Door.Row2.Right.Window.Switch.set("10%")

    else:
        cockpit.printLine("closing all windows")
        window = await vehicle.Cabin.Door.Row1.Left.Window.IsOpen.get()
        if window:
            await vehicle.Cabin.Door.Row1.Left.Window.Switch.set("0%")
        window = await vehicle.Cabin.Door.Row1.Right.Window.IsOpen.get()
        if window:
            await vehicle.Cabin.Door.Row1.Right.Window.Switch.set("0%")
        window = await vehicle.Cabin.Door.Row2.Left.Window.IsOpen.get()
        if window:
            await vehicle.Cabin.Door.Row2.Left.Window.Switch.set("0%")
        window = await vehicle.Cabin.Door.Row2.Right.Window.IsOpen.get()
        if window:
            await vehicle.Cabin.Door.Row2.Right.Window.Switch.set("0%")

async def hvac(level):
    cockpit.printLine("setting hvac to: " + level + "%")
    fan = await vehicle.Cabin.HVAC.Station.Row2.Left.FanSpeed.get()
    if not fan == level:
        await vehicle.Cabin.HVAC.Station.Row2.Left.FanSpeed.set(level)
        await vehicle.Cabin.HVAC.Station.Row2.Left.Temperature.set(temperature_goal)
    fan = await vehicle.Cabin.HVAC.Station.Row2.Right.FanSpeed.get()
    if not fan == level:
        await vehicle.Cabin.HVAC.Station.Row2.Right.FanSpeed.set(level)
        await vehicle.Cabin.HVAC.Station.Row2.Right.Temperature.set(temperature_goal)
    #front rows only activate for high level
    if level == HIGH or level == OFF:
        fan = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get()
        if not fan == level:
            await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.set(level)
            await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.set(temperature_goal)
        fan = await vehicle.Cabin.HVAC.Station.Row1.Right.FanSpeed.get()
        if not fan == level:
            await vehicle.Cabin.HVAC.Station.Row1.Right.FanSpeed.set(level)
            await vehicle.Cabin.HVAC.Station.Row1.Right.Temperature.set(temperature_goal)

handles = [
    {"count": 0, "time": 0},
    {"count": 0, "time": 0},
    {"count": 0, "time": 0},
    {"count": 0, "time": 0}
]

async def handlePulled(pll: bool):
    global handles
    index = None
    handle = await vehicle.Cabin.Door.Row1.Left.IsHandlePulled.get()
    if handle:
        index = 0
    else:
        handle =  await vehicle.Cabin.Door.Row1.Right.IsHandlePulled.get()
        if handle:
            index = 1
        else: 
            handle = await vehicle.Cabin.Door.Row2.Left.IsHandlePulled.get()
            if handle:
                index = 2
            else: 
                handle = await vehicle.Cabin.Door.Row2.Right.IsHandlePulled.get()
                if handle:
                    index = 3
                else:
                    return

    
    time = int(await vehicle.CurrentLocation.Timestamp.get())
    if time - handles[index].time < handle_timeout:
        handles[index].count += 1
        if handles[index].count >= handle_pull_times:
            cockpit.printLine(message_pedestrian_alert, last_dog_mood)
            #TODO: alert auth

    #reset handle count
    else:
        handles[index].count = 1 
    
    cockpit.printLine("handle " + index + " pulled " + handles[index].count + " times")

async def checkTemperature(ambientTemp: int):
    #hot day
    if ambientTemp > high_temperature:
        cockpit.printLine("noticed HIGH temperature")
        #open windows if cooler outside
        exteriorTemp = await vehicle.Exterior.AirTemperature.get()
        if exteriorTemp < ambientTemp:
            cockpit.printLine("noticed outside temp below ambient temp")
            await allWindows(OPEN)

        #check if extremely hot day
        if ambientTemp > extremely_high_temperature:
            cockpit.printLine("noticed EXTREMELY HIGH temperature")
            await hvac(HIGH)
            cockpit.printLine(message_extreme_temperature, last_dog_mood)
        else:
            await hvac(MEDIUM)
    #not hot
    else:
        allWindows(CLOSE) 
        #cold day
        if ambientTemp < extremely_low_temperature:
            cockpit.printLine("noticed EXTREMELY LOW temperature")
            await hvac(HIGH)
            cockpit.notifyPhone(message_extreme_temperature, last_dog_mood)
        elif ambientTemp < low_temperature:
            cockpit.printLine("noticed LOW temperature")
            await hvac(MEDIUM)
        else:
            await hvac(OFF)
        
last_pedestrian_time = 0

async def checkPedestrian(distance: int):
    if distance < min_pedestrian_distance:
        cockpit.printLine("noticed pedestrian at distance: " + distance)
        mill = int(await vehicle.CurrentLocation.Timestamp.get())
        if (mill - last_pedestrian_time) < pedestrian_cooldown:
            await alert_pedestrian()


async def alert_pedestrian():
   # cockpit.printLine("alerting pedestrian through speaker")
    ambientTemp = await vehicle.Cabin.HVAC.AmbientAirTemperature.get()
    dogMood = await vehicle.Cabin.Dog.Mood.get()
    if ambientTemp < high_temperature and ambientTemp > low_temperature and dogMood == "happy":
        await vehicle.Exterior.Speaker.Message.set(message_dog_fine)
    elif ambientTemp > extremely_high_temperature or ambientTemp < extremely_low_temperature:
        await vehicle.Exterior.Speaker.Message.set(message_dog_danger)
    elif ambientTemp > high_temperature or ambientTemp < low_temperature:
        await vehicle.Exterior.Speaker.Message.set(message_dog_AC)
    else:
        await vehicle.Exterior.Speaker.Message.set(message_dog_owner)

subscribed = False
async def subscribeServices():
    global subscribed
    if not subscribed:
        #Temperature Monitoring:
       # cockpit.printLine("monitoring start: ambient temperature")
        await vehicle.Cabin.HVAC.AmbientAirTemperature.subscribe(checkTemperature)

        #Pedestrian Monitoring:
       # cockpit.printLine("monitoring start: pedestrian approach")
        await vehicle.Exterior.PedestrianApproach.subscribe(checkPedestrian)

        #Handle Monitoring:
       # cockpit.printLine("monitoring start: door handles")
        await vehicle.Cabin.Door.Row1.Left.IsHandlePulled.subscribe(handlePulled)
        await vehicle.Cabin.Door.Row1.Right.IsHandlePulled.subscribe(handlePulled)
        await vehicle.Cabin.Door.Row2.Left.IsHandlePulled.subscribe(handlePulled)
        await vehicle.Cabin.Door.Row2.Right.IsHandlePulled.subscribe(handlePulled)
        
        subscribed = True

                
async def unsubscribeServices():
    global subscribed
    if subscribed:
       # cockpit.printLine("stopping all monitoring")
        await vehicle.Cabin.HVAC.AmbientAirTemperature.subscribe(None)
        await vehicle.Exterior.PedestrianApproach.subscribe(None)
        await vehicle.Cabin.Door.Row1.Left.IsHandlePulled.subscribe(None)
        await vehicle.Cabin.Door.Row1.Right.IsHandlePulled.subscribe(None)
        await vehicle.Cabin.Door.Row2.Left.IsHandlePulled.subscribe(None)
        await vehicle.Cabin.Door.Row2.Right.IsHandlePulled.subscribe(None)

        subscribed = False


call_in_progress = False
last_media = ""
async def stream_to_infotainment(call):
    if call:
        cockpit.printLine("starting phone to infotainment stream")
        global call_in_progress, last_media
        call_in_progress = True
        last_media = await vehicle.Cabin.Infotainment.Media.SelectedURI.get()
        await vehicle.Cabin.Infotainment.Media.SelectedURI.set(OWNERVOICE)
    else:
        cockpit.printLine("stopping phone to infotainment stream")
        call_in_progress = False
        await vehicle.Cabin.Infotainment.Media.SelectedURI.set(last_media)

def owner_stream_dialogue ():
    cockpit.printLine("sending dog unwell message and streaming dialogue to owner phone")
    cockpit.streamDialoguePhone(stream_to_infotainment)

running = True
#await vehicle.Cabin.Dog.Present.subscribe(subscribeServices)
last_dog_mood = "happy"
dog_mood_time = 0
owner_notified = False
while(running):
    cockpit.printLine("checking camera feed for dog")
    dog_present = await vehicle.Cabin.Dog.Present.get()

    inside_temp = await vehicle.Cabin.HVAC.AmbientAirTemperature.get()

    pedestrian_check = await vehicle.Exterior.PedestrianApproach.get()

    pedestrian_message = await vehicle.Exterior.Speaker.Message.get()
    #cockpit.pedestrianInfo(True)
    #inside_temp = await vehicle.Cabin.HVAC.AmbientAirTemperature.subscribe(checkTemperature);
    cockpit.printLine("{}: {}".format("pedestrian_check", pedestrian_check))
    cockpit.printLine("{}: {}".format("pedestrian_message", pedestrian_message))
    cockpit.printLine("{}: {}".format("inside", inside_temp))
 
    if inside_temp > 10:
        cockpit.controlWindow("open")
    else:
        cockpit.controlWindow("close")

    if len(pedestrian_message) <= 0:
        cockpit.showPedestrianMessage("no-pedestrian-message", pedestrian_message)
    else:
        cockpit.printLine("{}: {}".format("SHOW", "*******"))
        cockpit.showPedestrianMessage("show-pedestrian-message", pedestrian_message)


    if dog_present:
        cockpit.printLine("dog present!")
        await subscribeServices()
        dog_mood = await vehicle.Cabin.Dog.Mood.get()
        if dog_mood == "happy":
            cockpit.notifyPhone("Your dog is doing good")
            cockpit.printLine("analyzing dog mood: calm")          
            media = await vehicle.Cabin.Infotainment.Media.SelectedURI.get()
            if not call_in_progress and media != NOTHING:
                cockpit.printLine("turning off infotainment")
                await vehicle.Cabin.Infotainment.Media.SelectedURI.set(NOTHING)
        else:
            cockpit.printLine("analyzing dog mood: excited")
            timestamp = int(await vehicle.CurrentLocation.Timestamp.get())
            cockpit.printLine(last_dog_mood)
          #  cockpit.printLine(dog_mood_time)
            if last_dog_mood == dog_mood:
                if timestamp - dog_mood_time >= dog_max_sad_time:
                    con_sec, con_min, con_hour = convertMillis(int(dog_max_sad_time))
                    cockpit.printLine("dog mood: excited for longer than " + f"{con_min:02d}:{con_sec:02d}")
                    if not owner_notified:
                        #owner_stream_dialogue()
                        cockpit.notifyPhone("Your dog is not doing well!!!!!")
                        owner_notified = True
                
                elif timestamp - dog_mood_time >= dog_min_sad_time:
                    con_sec, con_min, con_hour = convertMillis(int(dog_min_sad_time))
                    cockpit.printLine("dog mood: excited for longer than " + f"{con_min:02d}:{con_sec:02d}" )
                    media = await vehicle.Cabin.Infotainment.Media.SelectedURI.get()
                    if media != CALMMUSIC:
                        cockpit.printLine("turning on infotainment, source: 'calming sounds for dogs'" )
                        await vehicle.Cabin.Infotainment.Media.SelectedURI.set(CALMMUSIC)
            
                
            else:
                dog_mood_time = timestamp
        last_dog_mood = dog_mood
    else:
        cockpit.printLine("no dog detected!")
        cockpit.notifyPhone("", last_dog_mood)
        await unsubscribeServices()
    await aio.sleep(3)

