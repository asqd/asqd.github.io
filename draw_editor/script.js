// elements
const canvas = document.querySelector("canvas")
const toolButtons = document.querySelectorAll(".tool")
const colorButtons = document.querySelectorAll(".colors .option")
const fillColor = document.querySelector("#fill-color")
const sizeSlider = document.querySelector("#size-slider")
const colorPicker = document.querySelector("#color-picker")
const clearCanvasButton = document.querySelector(".clear-canvas")
const saveImgButton = document.querySelector(".save-img")
const ctx = canvas.getContext("2d")

// defaul values
let prevMouseX
let prevMouseY
let snapshot
let isDrawing = false
let selectedTool = "brush"
let toolWidth = 5
let selectedColor = "#000"

const setBackground = () => {
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = selectedColor
}

// geometry functions
const drawRect = (e) => {
    ctx.beginPath()
    ctx.rect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY)
    fillColor.checked ? ctx.fill() : ctx.stroke()
}

const drawCircle = (e) => {
    ctx.beginPath()
    const radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2))
    ctx.arc(prevMouseX, prevMouseY, radius, 0 , 2 * Math.PI)
    fillColor.checked ? ctx.fill() : ctx.stroke()
}

const drawTriangle = (e) => {
    ctx.beginPath()
    ctx.moveTo(prevMouseX, prevMouseY)
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY)
    ctx.closePath()
    fillColor.checked ? ctx.fill() : ctx.stroke()
}

// event map
const actionMap = {
    "brush": (e) => {
        ctx.strokeStyle = selectedColor
        ctx.lineTo(e.offsetX, e.offsetY)
        ctx.stroke()
    },
    "eraser": (e) => {
        ctx.strokeStyle = "#fff"
        ctx.lineTo(e.offsetX, e.offsetY)
        ctx.stroke()
    },
    "rectangle": drawRect,
    "circle": drawCircle,
    "triangle": drawTriangle,
}

// draw functions
const startDraw = (e) => {
    isDrawing = true
    prevMouseX = e.offsetX
    prevMouseY = e.offsetY
    ctx.beginPath()
    ctx.lineWidth = toolWidth
    ctx.strokeStyle = selectedColor
    ctx.fillStyle = selectedColor
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
}

const drawing = (e) => {
    if (!isDrawing) return

    ctx.putImageData(snapshot, 0, 0)
    actionMap[selectedTool](e)
}

// events
window.addEventListener("load", () => {
    setBackground()
})

toolButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active")
        btn.classList.add("active")
        selectedTool = btn.id
    })
})

sizeSlider.addEventListener("input", () => { 
    toolWidth = sizeSlider.value
    sizeSlider.nextElementSibling.innerText = toolWidth
})

colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".option.selected").classList.remove("selected")
        btn.classList.add("selected")
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color")
    })
})

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value
    colorPicker.parentElement.click()
})

clearCanvasButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setBackground()
})

saveImgButton.addEventListener("click", () => {
    const link = document.createElement("a")
    link.download = `${Date.now()}.jpg`
    link.href = canvas.toDataURL()
    link.click()
})

canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", () => isDrawing = false)
