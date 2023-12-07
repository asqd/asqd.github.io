const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  phrygian: [1, 2, 2, 2, 1, 2, 2],
  lydian: [2, 2, 2, 1, 2, 2, 1],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
};

const scaleNames = {
  major: 'Мажор',
  minor: 'Минор',
  dorian: 'Дорийский',
  phrygian: 'Фригийский',
  lydian: 'Лидийский',
  lydian: 'Миксолидийский',
};

function generateScaleOptions() {
  const scaleSelector = document.getElementById("scale");

  for (const scale in scales) {
    const option = document.createElement("option");
    option.value = scale;
    option.textContent = scaleNames[scale] //.charAt(0).toUpperCase() + scale.slice(1); // Заглавная первая буква
    scaleSelector.appendChild(option);
  }
}

generateScaleOptions();


function generateScale() {
  const scaleType = document.getElementById("scale").value;
  const rootNote = document.getElementById("rootNote").value;

  const scale = generateScaleFromRoot(scaleType, rootNote);

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `Гамма (${scaleType} ${rootNote}): ${scale.join(", ")}`;
}

function generateScaleFromRoot(scaleType, rootNote) {
  const scaleIntervals = scales[scaleType];
  const rootIndex = notes.indexOf(rootNote);

  let currentNoteIndex = rootIndex;
  const generatedScale = [notes[currentNoteIndex]];

  for (const interval of scaleIntervals) {
    currentNoteIndex = (currentNoteIndex + interval) % notes.length;
    generatedScale.push(notes[currentNoteIndex]);
  }

  return generatedScale;
}

document.getElementById("scale").addEventListener('change', generateScale);
document.getElementById("rootNote").addEventListener('change', generateScale);
