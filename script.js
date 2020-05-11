 // Ideas:
// -rewrite boxes in the correct way after forms are submitted
// -max possible words counter
// -Remove spaces from final word
// -night mode
// -add seperate IPA chart for mobile, dont add table head just make it a group of characters
// -add titles to IPA symbols
// -made comments italicized

// To Add:
// -add LITERAL notation ("C")V(N), C"V"N
// -make phonetic groups possible in replacemenets and filters (VV: V)
// -floating point weights (fix the equation in general)
// -favicon

// To Fix:
// 

function generate(
  _min,
  _max,
  _count,
  _patterns,
  _filters,
  _rewrites,
  _characters,
  _duplicates,
  _charWeights,
  _writeWeights
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

  const charWeights = new Map(_charWeights)
  const writeWeights = new Map(_writeWeights)

  let lexicon = []
  // Test if patterns are valid
  if (patterns.length < 1) {return lexicon}

// Functions
  function unique(list) {
    return Array.from(new Set(list))
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }

  function weightedRandom(items, weights) {

    function float(min, max) {
      return Math.random() * (max - min) + min
    }

    const sum = weights.reduce((a, b) => a + b, 0)
    let ran = float(0, sum)
    for (let i = 0; i < items.length; i++) {
      if (ran < weights[i]) {
        return [items[i]]
      }
      else {
        ran -= weights[i]
      }
    }
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
      let letters = characters.get(key)
      let weights = charWeights.get(key)
      word += letters && letters.length > 0 ? weightedRandom(letters, weights) : key
    }
  // Randomly keep or delete letters in parentheses
    const pRegex = /\(([^\(]*?)\)/
    while (pRegex.test(word)) {
      word = word.replace(pRegex, random(0, 2) === 1 ? pRegex.exec(word)[1] : '')
    }
  // Rewrites
    for (let key of rewrites.keys()) {
      let letters = rewrites.get(key)
      let weights = writeWeights.get(key)
      while (word.includes(key)) {
        word = word.replace(key, letters.length > 0 ? weightedRandom(letters, weights) : '')
      }
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
  console.log('Character Weights:', charWeights, '\n')
  console.log('Rewrites:', rewrites, '\n')
  console.log('Rewrite Weights:', writeWeights, '\n')
  console.log('Filters:', filters, '\n')
  console.log('Patterns:', patterns, '\n')
  return lexicon
}

// Format inputs and display list to the page
function takeInput() {
// Functions
  function format(element, regex) {
    const array = []
  // Remove comments
    element = element.replace(/\/[^\s,]*/g, '')
  // Create the arrays
    const matches = element.match(regex)
    if (matches !== null) {
      for (match of matches) {
        let items = []
        match = match.replace(/\(|\)|\[|\]|"|:/g, ' ')
        match = match.match(/\S+/g)
        let name = match[0]
        let contents = match.slice(1, match.length)
        array.push([name, contents])
      }
    }
    return array
  }

  function listFormat(element) {
  // Remove comments
    element = element.replace(/\/[^\s,]*/g, '')
  // Split list
    const regex = /[^\s,][^,]*[^\s,]|[^\s,]/g
    return element.match(regex)
  }

  function makeWeights(input) {
    const array = []
    const regex = /(.+)\*((\d+\.*\d*)|(\.\d+))/
    for (item of input) {
      let pair = []
      let weights = []
      let contents = item[1]
      pair.push(item[0])
      for (i in contents) {
        if (regex.test(contents[i])) {
          weights.push(Number(regex.exec(contents[i])[2]))
          item[1][i] = regex.exec(contents[i])[1]
        } else {
          weights.push(1)
        }
      }
      pair.push(weights)
      array.push(pair)
    }
    return array
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

  const myCharWeights = makeWeights(myCharacters)
  const myWriteWeights = makeWeights(myRewrites)

  const newLine = document.getElementById("new").checked

  const myLexicon = generate(
    myMin,
    myMax,
    myCount,
    myPatterns,
    myFilters,
    myRewrites,
    myCharacters,
    myDuplicate,
    myCharWeights,
    myWriteWeights
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

// Test if user is on mobile device
const onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// Show IPA chart
function showIPA() {
  const ipa = !onMobile ? document.getElementById("ipaChart") : document.getElementById("ipaMobile")
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
    let active = document.activeElement
    if (active.id === "characters" || active.id === "rewrites" || active.id === "patterns" || active.id === "filters") {
      let start = active.selectionStart;
      let end = active.selectionEnd;
      if (active.selectionStart || active.selectionStart === '0') {
        active.value = active.value.substring(0, start)
            + letter.innerHTML
            + active.value.substring(end, active.value.length);
      } else {
          myField.value += myValue;
      }
      active.setSelectionRange(start + 1, start + 1)
    }
    event.preventDefault()
  })
}

const puncts = document.getElementsByClassName("punct")
for (let punct of puncts) {
  punct.addEventListener("mousedown", () => {
    let active = document.activeElement
    if (active.id === "characters" || active.id === "rewrites" || active.id === "patterns" || active.id === "filters") {
      let start = active.selectionStart;
      let end = active.selectionEnd;
      if (active.selectionStart || active.selectionStart === '0') {
        active.value = active.value.substring(0, start)
            + punct.getAttribute("value")
            + active.value.substring(end, active.value.length);
      } else {
          myField.value += myValue;
      }
      active.setSelectionRange(start + 1, start + 1)
    }
    event.preventDefault()
  })
}

// Fix input's position if scrolled too far down
if (!onMobile) {
  function resetInputs () {
    document.getElementById("characters").style.position = "initial"
    document.getElementById("characters").style.minWidth = "initial"
    document.getElementById("characters").style.left = "initial"
    document.getElementById("characters").style.top = "initial"

    document.getElementById("rewrites").style.position = "initial"
    document.getElementById("rewrites").style.minWidth = "initial"
    document.getElementById("rewrites").style.left = "initial"
    document.getElementById("rewrites").style.top = "initial"
    
    document.getElementById("patterns").style.position = "initial"
    document.getElementById("patterns").style.minWidth = "initial"
    document.getElementById("patterns").style.maxWidth = "initial"
    document.getElementById("patterns").style.left = "initial"
    document.getElementById("patterns").style.top = "initial"
    
    document.getElementById("filters").style.position = "initial"
    document.getElementById("filters").style.minWidth = "initial"
    document.getElementById("filters").style.maxWidth = "initial"
    document.getElementById("filters").style.left = "initial"
    document.getElementById("filters").style.top = "initial"
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
          active.style.position = "initial"
          let calculate = window.innerWidth/2 - (active.id === "rewrites" ? active.offsetWidth : active.innerWidth)/2
          active.style.left = calculate + 'px'
          active.style.top = "16px"
          active.style.minWidth = "480px"
          active.style.maxWidth = "480px"
          active.style.position = "fixed"
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

