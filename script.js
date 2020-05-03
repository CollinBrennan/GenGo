 // Ideas:
// -rewrite boxes in the correct way after forms are submitted
// -phoneme weights
// -max possible words counter
// -make phonetic groups possible in replacmenets and filters (VV: V)
// -add LITERAL notation ('C')V(N), C'V'N
// -add copy list button
// -Generate paragraph by default, add new line button
// -Remove spaces from final word
// -Capitalization radio (none, all, random)

// To Fix:
// -Page reloads when no replacements entered
// -Rename structures/sequences to patterns
// -Possibly make filters a text input

// Look of site:
// -night mode
// -fix form layout
// -fucking decide on 1280px or 960px for max width

function generate(
  _min,
  _max,
  _count,
  _sequences,
  _filters,
  _changes,
  _phonemes,
  _duplicates
) {
// Variables
  const min = _min
  const max = _max < min ? min : _max
  const count = _count
  const sequences = unique(_sequences)
  const filters = unique(_filters)
  const changes = new Map(_changes)
  const phonemes = new Map(_phonemes)
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
      template += sequences[random(0, sequences.length)]
    }
  // Pick random letter(s) in brackets
    const tempRegex = /\[([^\[]*?)\]/
    while (tempRegex.test(template)) {
      let matches = tempRegex.exec(template)[1].split(/\s+/)
      template = template.replace(tempRegex, matches[random(0, matches.length)])
    }
  // Make word from template
    let word = ''
    for (let value of template) {
      let list = phonemes.get(value)
      word += list !== undefined ? list[random(0, list.length)] : value
    }
  // Randomly keep or delete letters in parentheses
    const wordRegex = /\(([^\(]*?)\)/
    while (wordRegex.test(word)) {
      word = word.replace(wordRegex, random(0, 2) === 1 ? wordRegex.exec(word)[1] : '')
    }
  // Replace
    for (let key of changes.keys()) {
      let list = changes.get(key)
      while (word.includes(key))
        word = word.replace(key, list.length > 0 ? list[random(0, list.length)] : '')
    }
  // Filter or add word to lexicon
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
  console.log('Phonemes:', phonemes, '\n')
  console.log('Changes:', changes, '\n')
  console.log('Filters:', filters, '\n')
  console.log('Sequences:', sequences, '\n')
  return lexicon
}

function takeInput() {
// Functions
  function format(element, regex) {
    const array = []
    const matches = element.match(regex)
    for (match of matches) {
      let items = []
      match = match.replace(/\(|\)|:/g, '')
      match = match.match(/\S+/g)
      items.push(match[0])
      items.push(match.slice(1, match.length))
      array.push(items)
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
  const mySequences = listFormat(document.getElementById("patterns").value)
  const myFilters = listFormat(document.getElementById("filters").value)
  const myReplacements = format(document.getElementById("changes").value, /[^\s,]+\s*:[^,]+/g)
  const myPhonemes = format(document.getElementById("phonemes").value, /[^\s,]\s*:[^,]+/g)
  const myDuplicate = document.getElementById("duplicates").checked

  const myLexicon = generate(
    myMin,
    myMax,
    myCount,
    mySequences,
    myFilters,
    myReplacements,
    myPhonemes,
    myDuplicate
  )
// Clear
  const list = document.getElementById("list")
  while (list.hasChildNodes()) {
    list.removeChild(list.lastChild);
  }
// Information
  const lexiconLength = document.createElement("p")
  lexiconLength.innerHTML = myLexicon.length + ' words generated'
  //list.appendChild(document.createElement("br"))
  list.appendChild(lexiconLength)
// Display list
  for (item of myLexicon) {
    list.innerHTML += item
    list.appendChild(document.createElement("br"))
  }
}