from sdv_model import Vehicle
import plugins
from browser import aio

vehicle = Vehicle()

cockpit = plugins.get_plugin("Cockpit")
await vehicle.Cabin.Infotainment.Media.SelectedURI.set("Calm Dog music!!!")
# write your code here

#await Vehicle.Cabin.Door.Row1.Right.IsOpen.set(True)
#await Vehicle.Body.Raindetection.Intensity.set(100)
ambientTemp = await vehicle.Cabin.HVAC.AmbientAirTemperature.get()
cockpit.notifyPhone("Test 12345")
cockpit.notifyPhone("Test 324343")
cockpit.notifyPhone("Test 2222")
await aio.sleep(3)
cockpit.notifyPhone("Test 11111")
print (ambientTemp)
if ambientTemp < 15:
    print("is cold")
    await vehicle.Cabin.HVAC.Station.Row2.Left.Temperature.set(20)
    await vehicle.Cabin.HVAC.Station.Row2.Right.Temperature.set(20)
    await vehicle.Cabin.HVAC.Station.Row2.Left.FanSpeed.set(30)
    await vehicle.Cabin.HVAC.Station.Row2.Right.FanSpeed.set(30)
    
#await aio.sleep(3)
#print (cockpit.dog_mood())
#await vehicle.ADAS.CruiseControl.SpeedSet.set(100)
#await aio.sleep(3)
#print (cockpit.dog_mood())
#await vehicle.ADAS.CruiseControl.SpeedSet.set(40)
await aio.sleep(3)
print (cockpit.dog_mood())

await aio.sleep(3)
print (cockpit.pedestrian_info())
await vehicle.ADAS.CruiseControl.SpeedSet.set(90)

#if cockpit.dogPresent:



