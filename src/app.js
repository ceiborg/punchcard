const card = document.getElementById("card")
const addRowButton = document.getElementById("add-row")
const randomizeButton = document.getElementById("randomize")
const downloadButton = document.getElementById("download")

const columnCount = 24
const initialRowCount = 19

// card state
const cardState = []

// create card
const addRow = () => {

  const row = document.createElement('div')
  const rowState = []
  row.className = 'row'

  for (let i = 0; i < columnCount; i++) { 
    const cell = document.createElement('div')
    cell.className = 'cell'
    cell.dataset.x = i
    cell.dataset.y = (cardState.length)
    row.appendChild(cell)
    rowState.push(false)
  }

  // append the row to the card
  card.appendChild(row)

  cardState.push(rowState)
}

const randomize = () => {

  // set random states
  for (let y = 0; y < cardState.length; y++) {
    for (let x = 0; x < columnCount; x++) {
      cardState[y][x] = Math.random() > 0.5 ? true : false
    }
  }

  // update UI
  for(let el of card.getElementsByClassName('cell')){
    // get celll position
    const x = parseInt(el.dataset.x, 10)
    const y = parseInt(el.dataset.y, 10)

    el.classList.remove("on")
    if (cardState[y][x])
      el.classList.add("on")
  }

}


const downloadSVG = () => {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 170 100"
    height="100mm"
    width="170mm"
    units="mm"
  >
  `
  const r = 1.5 //radio grilla
  const rl = 1.4  //radio grilla lateral
  const sw = 0.3  // stroke
  for (let y = 0; y < cardState.length; y++) {
    const cy = r + 4 + y * 5.02  //distribucion en y r + (la ubicacion del 1 circulo en y) + (la dif entre el ultima y el primer circulo (y) dividido la cantidad de circulos -1)
    svg += `<circle cx="${24.95+r}" cy="${cy}" r="${rl}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
    svg += `<circle cx="${139.31+r}" cy="${cy}" r="${rl}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
    for (let x = 0; x < columnCount; x++) {
      const cx = r + 30.5 + x * 4.5 //distribucion en x
      if(cardState[y][x]){
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="black" stroke-width="${sw}" style="fill:none" fill="transparent"  />`
      }
    }
  }

  svg += `
  <rect x="13" y="3" width="141" height="96" fill="transparent" style="fill:none" stroke="black" stroke-width="${sw}" />
  </svg>`



  const filename = 'punch-card.svg'
  const blob = new Blob([svg], {type: 'image/svg+xml'})
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}



const initialize = () => {
  // create initial rows
  for (let i = 0; i < initialRowCount; i++) {
    addRow()
  }
}




let colorOn = false


let mouseDown = false
document.addEventListener("mousedown", ev => {
  const el = ev.target
  if (el.classList.contains("cell")) {

    // get celll position
    const x = parseInt(el.dataset.x, 10)
    const y = parseInt(el.dataset.y, 10)

    // toggle cell state
    cardState[y][x] = !cardState[y][x]
    colorOn = cardState[y][x]
    // update UI
    el.classList.remove("on")
    if (cardState[y][x])
      el.classList.add("on")

  }

  mouseDown = true
} )
document.addEventListener("mouseup", ev => mouseDown = false)

// handle mouse over
card.addEventListener("mouseover", (ev) => {
  // early exit
  if(!mouseDown)
    return

  const el = ev.target
  if (el.classList.contains("cell")) {

    // get celll position
    const x = parseInt(el.dataset.x, 10)
    const y = parseInt(el.dataset.y, 10)

    // toggle cell state
    cardState[y][x] = colorOn

    // update UI
    el.classList.remove("on")
    if (cardState[y][x])
      el.classList.add("on")

  }

})



// handle button click add row
addRowButton.addEventListener("click", (ev) => {
  addRow()
})

// handle button click randomize
randomizeButton.addEventListener("click", (ev) => {
  randomize()
})

// handle button click download
downloadButton.addEventListener("click", (ev) => {
  downloadSVG()
})  

// kick off
initialize()