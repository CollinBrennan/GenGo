 // Ideas:
// -rewrite boxes in the correct way after forms are submitted
// -max possible words counter
// -Remove spaces from final word
// -night mode
// -add seperate IPA chart for mobile, dont add table head just make it a group of characters
// -add titles to IPA symbols

// To Do:
// -add LITERAL notation ('C')V(N), C'V'N
// -make phonetic groups possible in replacemenets and filters (VV: V)

// To Fix:
// -text input wiggles when its position is fixed

function generate(
  _min,
  _max,
  _count,
  _patterns,
  _filters,
  _rewrites,
  _characters,
  _duplicates
) {
// Variables
  const min = _min
  const max = _max
  const count = _count
  const patterns = unique(_patterns)
  const filters = unique(_filters)
  const rewrites = new Map(_rewrites)
  const characters = new Map(_characters)
  const duplicates = _duplicates
  let lexicon = []
// Functions
  function unique(list) {
    return Array.from(new Set(list))
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }
// Loop
  while (lexicon.length < count) {
  // Create the template
    let syllableCount = random(min, max + 1)
    let template = ''
    for (let i = 0; i < syllableCount; i++) {
      template += patterns[random(0, patterns.length)]
    }
  // Pick random letter(s) in brackets
    const bRegex = /\[([^\[]*?)\]/
    while (bRegex.test(template)) {
      let matches = bRegex.exec(template)[1].split(/\s+/)
      template = template.replace(bRegex, matches[random(0, matches.length)])
    }
  // Make word from template
    let word = ''
    for (let key of template) {
      let values = characters.get(key)
      word += values && values.length > 0 ? values[random(0, values.length)] : key
    }
  // Randomly keep or delete letters in parentheses
    const pRegex = /\(([^\(]*?)\)/
    while (pRegex.test(word)) {
      word = word.replace(pRegex, random(0, 2) === 1 ? pRegex.exec(word)[1] : '')
    }
  // Rewrites
    for (let key of rewrites.keys()) {
      let values = rewrites.get(key)
      while (word.includes(key))
        word = word.replace(key, values.length > 0 ? values[random(0, values.length)] : '')
    }
  // Filters
    let push = true
    for (let filter of filters) {
      if (word.includes(filter)) {
        push = false
      }
    }
  // Add word to lexicon
    if (push) {
      lexicon.push(word)
    }
  }
// Remove duplicates
    if (!duplicates) {
      lexicon = unique(lexicon)
    }
// Return
  console.log('Characters:', characters, '\n')
  console.log('Rewrites:', rewrites, '\n')
  console.log('Filters:', filters, '\n')
  console.log('Patterns:', patterns, '\n')
  return lexicon
}

// Format inputs and display list to the page
function takeInput() {
// Functions
  function format(element, regex) {
    const array = []
  // Create the arrays
    const matches = element.match(regex)
    if (matches !== null) {
      for (match of matches) {
        let items = []
        match = match.replace(/\(|\)|\[|\]|"|:/g, ' ')
        match = match.match(/\S+/g)
        // Add weights
        const wRegex = /(\S+)\*(\d+)/
        let name = match[0]
        let contents = match.slice(1, match.length)
        let weightedContents = []
        for (item of contents) {
          if (wRegex.test(item)) {
            let groups = wRegex.exec(item)
            let counter = groups[2] > 100 ? 100 : groups[2]
            for (let i = 0; i < counter; i++) {
              weightedContents.push(groups[1])
            }
          } else {
            weightedContents.push(item)
          }
        }
        array.push([name, weightedContents])
      }
    }
    return array
  }

  function listFormat(element) {
    const regex = /[^\s,][^,]*[^\s,]|[^\s,]/g
    return element.match(regex)
  }
// Variables
  const myMin = Number(document.getElementById("min").value)
  const myMax = Number(document.getElementById("max").value)
  const myCount = Number(document.getElementById("words").value)
  const myPatterns = listFormat(document.getElementById("patterns").value)
  const myFilters = listFormat(document.getElementById("filters").value)
  const myRewrites = format(document.getElementById("rewrites").value, /[^\s,]+\s*:[^,]*/g)
  const myCharacters = format(document.getElementById("characters").value, /[^\s,]\s*:[^,]*/g)
  const myDuplicate = document.getElementById("duplicates").checked

  const newLine = document.getElementById("new").checked

  const myLexicon = generate(
    myMin,
    myMax,
    myCount,
    myPatterns,
    myFilters,
    myRewrites,
    myCharacters,
    myDuplicate
  )
// Fix form inputs
  myMax < myMin ? document.getElementById("max").value = myMin : null
// Clear words
  const list = document.getElementById("lexicon")
  list.innerHTML = ''
// Display words
  for (item of myLexicon) {
    list.innerHTML += item + (newLine ? '\n' : ' ')
  }
// Information
  const divider = document.getElementById("divider")
  divider.style.display = "block"
  const info = document.getElementById("info")
  info.innerHTML = '~ ' + myLexicon.length + ' words generated ~'
}


// Copy list
function copyToClipboard() {
  const copy = document.getElementById("copy")
  const list = document.getElementById("lexicon").innerHTML
  let info = document.getElementById("info")
  if (list !== '') {
    navigator.clipboard.writeText(list)
    info.innerHTML = "~ Copied to clipboard! ~"
  }
}


// Show IPA chart
function showIPA() {
  const ipa = document.getElementById("ipaChart")
  const button = document.getElementById("ipa")
  if (ipa.style.display !== "block") {
    ipa.style.display = "block"
    button.innerHTML = "IPA<i class='fas fa-caret-up'></i>"
  } else {
    ipa.style.display = "none"
    button.innerHTML = "IPA<i class='fas fa-caret-down'>"
  }
}

// When symbol is clicked, add it to the current focused input
const letters = document.getElementsByClassName("letter")
for (let letter of letters) {
  letter.addEventListener("mousedown", () => {
    let active = document.activeElement.id
    if (active === "characters" || active === "rewrites" || active === "patterns" || active === "filters") {
      document.activeElement.value += letter.innerHTML
    }
    event.preventDefault()
  })
}

const puncts = document.getElementsByClassName("punct")
for (let punct of puncts) {
  punct.addEventListener("mousedown", () => {
    let active = document.activeElement.id
    if (active === "characters" || active === "rewrites" || active === "patterns" || active === "filters") {
      document.activeElement.value += punct.getAttribute("value")
    }
    event.preventDefault()
  })
}

// Fix input's position if scrolled too far down
if  (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  function resetInputs () {
    document.getElementById("characters").style.position = "initial"
    document.getElementById("characters").style.maxWidth = "initial"

    document.getElementById("rewrites").style.position = "initial"
    document.getElementById("rewrites").style.maxWidth = "initial"
    
    document.getElementById("patterns").style.position = "initial"
    document.getElementById("patterns").style.maxWidth = "initial"
    
    document.getElementById("filters").style.position = "initial"
    document.getElementById("filters").style.maxWidth = "initial"
  }

  function fixInput() {
    let active = document.activeElement
    if (
      active.id === "characters" 
      || active.id === "rewrites" 
      || active.id === "patterns" 
      || active.id === "filters"
    ) {
      if (document.getElementById("ipaChart").style.display === "block") {
        if (window.scrollY > 300 && window.scrollY < 1200) {
          active.style.position = "fixed"
          active.style.maxWidth = "480px"
          let calculate = window.innerWidth/2 - active.offsetWidth/2
          active.style.left = calculate + 'px'
          active.style.top = "16px"
        } else {
          resetInputs()
        } 
      } else {
        resetInputs()
      }
    } else {
      resetInputs()
    }
  }
  window.setInterval(fixInput, 250)
}

