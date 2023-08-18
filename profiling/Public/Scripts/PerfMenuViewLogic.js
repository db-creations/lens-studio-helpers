//@input Component.ScriptComponent performanceManager
//@input Component.Text cpuTimeText
//@input Component.Text gpuTimeText
//@input Component.Text totalTimeText
//@input Component.Text fpsText

script.createEvent("UpdateEvent").bind(update);

function update() {
    script.cpuTimeText.text = "CPU MS: " + Math.ceil(script.performanceManager.getAverageCpuExecutionTime()).toString();
    script.gpuTimeText.text = "GPU MS: " + Math.ceil(script.performanceManager.getAverageGpuExecutionTime()).toString();
    script.totalTimeText.text = "TOTAL MS: " + Math.ceil(script.performanceManager.getAverageTotalExecutionTime()).toString();
    script.fpsText.text = "FPS: " + (Math.floor(1.0 / (script.performanceManager.getAverageTotalExecutionTime() / 1000))).toString();
}