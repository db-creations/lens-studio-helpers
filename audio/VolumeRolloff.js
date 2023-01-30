/*
 * VolumeRolloff.js
 * Bart Trzynadlowski, 2021
 *
 * Attach to awake event. Controls audio rolloff with distance.
 */

//@input float minDistance = 50
//@input float rolloffScale = 3.0
//@input Component.CameraComponent arCamera

var _transform = script.getTransform();
var _cameraTransform = arCamera.getTransform();
var _audio = script.getSceneObject().getComponent("Component.AudioComponent");

var lateUpdateEvent = script.createEvent("LateUpdateEvent");
lateUpdateEvent.bind(function(eventData)
{
    // Computation is in meters
    var ourPosition = _transform.getWorldPosition();
    var distance = ourPosition.distance(_cameraTransform.getWorldPosition()) * 1e-2;
    var minDistance = script.minDistance * 1e-2;
    distance = Math.max(distance, minDistance);
    var volume = minDistance * (1 / (1 + script.rolloffScale * (distance - 1)));
    if (volume < 0 || volume > 1)
    {
        volume = 1;
    }
    _audio.volume = volume;
});