import Picker from 'vanilla-picker'

const card = document.getElementById("card")
const addRowButton = document.getElementById("add-row")
const randomizeButton = document.getElementById("randomize")
const downloadButton = document.getElementById("download")

const picker = new Picker({
  popup: 'bottom',
  onChange: (color) => {
    const el = picker.settings.parent
    const {
      x,
      y
    } = getCellPos(el)
    cardState[y].colors[x] = color.rgbaString;
    el.style.background = color.rgbaString;
  },
  onDone: (color) => {
    updateUI()
  },
});

const columnCount = 24
const initialRowCount = 19

// card state
const cardState = []

let colorOn = 1
let mouseDown = false

// create card
const addRow = () => {

  const row = document.createElement('div')
  const rowState = []
  row.className = 'row'

  const c0 = document.createElement('div')
  c0.className = 'color0'
  c0.dataset.y = (cardState.length)
  c0.dataset.x = 0
  row.appendChild(c0)

  for (let i = 0; i < columnCount; i++) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    cell.dataset.x = i
    cell.dataset.y = (cardState.length)
    row.appendChild(cell)
    rowState.push(0)
  }

  const c1 = document.createElement('div')
  c1.className = 'color1'
  c1.dataset.y = (cardState.length)
  c1.dataset.x = 1
  row.appendChild(c1)

  // append the row to the card
  card.appendChild(row)
  cardState.push({
    colors: [null, null],
    states: rowState
  })
}


const getCellPos = (el) => {
  // get celll position
  const x = parseInt(el.dataset.x, 10)
  const y = parseInt(el.dataset.y, 10)
  return {
    x,
    y
  }
}


const getColor = (idx, y) => {
  const c = cardState[y].colors[idx]
  if (c)
    return c
  else
    return getColor(idx, y - 1)
}


const updateCellUI = (el) => {
  const {
    x,
    y
  } = getCellPos(el)
  const idx = el.classList.contains("cell") ? cardState[y].states[x] : x
  const color = getColor(idx, y)
  el.style.background = color
}

const updateUI = () => {
  // update UI
  for (let el of card.querySelectorAll('.color1,.color0,.cell')) {
    updateCellUI(el)
  }
}


const randomize = () => {
  // set random states
  for (let y = 0; y < cardState.length; y++) {
    for (let x = 0; x < columnCount; x++) {
      cardState[y].states[x] = Math.random() > 0.5 ? 0 : 1
    }
  }
  updateUI()
}


const initialize = () => {
  // create initial rows
  for (let i = 0; i < initialRowCount; i++) {
    addRow()
  }

  // set default colors
  cardState[0].colors = ['deepskyblue', 'deeppink']
  updateUI()

}

// deshabilitar click derecho ( menu contextual)
window.oncontextmenu = (ev) => ev.preventDefault()

card.addEventListener("mousedown", ev => {
  mouseDown = true

  // left click or right click
  colorOn = ev.which === 1 ? 1 : 0

  const el = ev.target
  const {
    x,
    y
  } = getCellPos(el)

  if (el.classList.contains("cell")) {
    // toggle cell state
    cardState[y].states[x] = colorOn
    // update UI
    updateCellUI(el)
  } else if (el.classList.contains("color0") || el.classList.contains("color1")) {
    //left click?
    if (colorOn) {
      const color = getColor(x, y)
      //open color picker
      const options = {
        parent: el,
        color
      }
      picker.movePopup(options, true)

    } else
      // do not clear the first color!!!!!!
      if (y !== 0) {
        cardState[y].colors[x] = null
        updateUI()
      }
  }


})

document.addEventListener("mouseup", () => mouseDown = false)


// handle mouse over
card.addEventListener("mouseover", (ev) => {
  // early exit
  if (!mouseDown)
    return

  const el = ev.target
  if (el.classList.contains("cell")) {
    const {
      x,
      y
    } = getCellPos(el)
    // toggle cell state
    cardState[y].states[x] = colorOn
    // update UI
    updateCellUI(el)
  }

})

// handle button click add row
addRowButton.addEventListener("click", (ev) => {
  addRow()
  updateUI()
})

// handle button click randomize
randomizeButton.addEventListener("click", (ev) => {
  randomize()
})

// handle button click download
downloadButton.addEventListener("click", (ev) => {
  downloadSVG()
})



const downloadSVG = () => {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 170 100"
    height="100mm"
    width="170mm"
    units="mm"
  >
  `
  const r = 1.5 //radio grilla
  const rl = 1.4 //radio grilla lateral
  const sw = 0.3 // stroke
  for (let y = 0; y < cardState.length; y++) {
    const cy = r + 4 + y * 5.02 //distribucion en y r + (la ubicacion del 1 circulo en y) + (la dif entre el ultima y el primer circulo (y) dividido la cantidad de circulos -1)
    svg += `<circle cx="${24.95+r}" cy="${cy}" r="${rl}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
    svg += `<circle cx="${139.31+r}" cy="${cy}" r="${rl}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
    for (let x = 0; x < columnCount; x++) {
      const cx = r + 30.5 + x * 4.5 //distribucion en x
      if (cardState[y].states[x]) {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
      }
    }
  }

  svg += `
  <rect x="13" y="3" width="141" height="96" fill="transparent" style="fill:none" stroke="black" stroke-width="${sw}" />
  </svg>`



  const filename = 'punch-card.svg'
  const blob = new Blob([svg], {
    type: 'image/svg+xml'
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}

// kick off
initialize()