const DEFAULT_TEMPLATE = `
e|------------------|------------------|------------------|------------------|
B|-5--4-5-----------|------------------|-5--4-5-----------|------------------|
G|--------4-7-5-----|-----4----5-4-----|--------4-7-5-----|-----4----5-4-----|
D|--------------7---|---7----------7---|--------------7---|---7----------7---|
A|------------------|-7----------------|------------------|-7----------------|
E|------------------|------------------|------------------|------------------|

e|-------------------------------------|------------------|------------------|
B|--------5----6-5-----5---------------|-5--4-5-----------|------------------|
G|--4-5-7----------7-----7-5----7--5-4-|--------4-7-5-----|-----4----5-4-----|
D|-------------------------------------|--------------7---|---7----------7---|
A|-------------------------------------|------------------|-7----------------|
E|-------------------------------------|------------------|------------------|
`;

const TEMPLATE = `
e|---------------------------------------------------------------------------|
B|---------------------------------------------------------------------------|
G|---------------------------------------------------------------------------|
D|---------------------------------------------------------------------------|
A|---------------------------------------------------------------------------|
E|---------------------------------------------------------------------------|
`;

const PERMITTED_KEYS = [
  "h",
  "p",
  "b",
  "r",
  "/",
  "|",
  "\\",
  "v",
  "t",
  "s",
  "S",
  "*",
  "[",
  "n",
  "]",
  "(",
  ")",
  "T",
  "P",
  "M",
  "=",
  "<",
  ">",
  "x",
  "o",
  "·",
  ".",
  "~",
  "-",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

var $tab = document.querySelector(".tab");

function addRow(template) {
  var html = prepareTemplate(template);
  $tab.innerHTML += html;

  var spans = document.querySelectorAll("span");
  var isMoving = false;
  var $dragging;

  spans.forEach((span) => {
    span.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isMoving = true;
      $dragging = e.target;
    });
    span.addEventListener("mouseup", (_e) => {
      isMoving = false;
    });
    span.addEventListener("click", (e) => {
      if (!e.target.classList.contains("is-editable")) return;

      html = e.target.innerHTML;
      e.target.innerHTML = "<input maxlength='1'>";
      var input = e.target.querySelector("input");
      if (html != "-") input.value = html;
      input.focus();
      input.addEventListener("blur", (ee) => {
        var value = ee.target.value != "" ? ee.target.value : "-";
        e.target.innerHTML = `${value}`;
      });

      keyListener(input, e.target);
    });
  });

  document.body.addEventListener("mousemove", (e) => {
    if (isMoving && e.target.classList.contains("is-editable")) {
      var old_value = $dragging.innerHTML;
      var new_value = e.target.innerHTML;
      $dragging.innerHTML = new_value;
      e.target.innerHTML = old_value;
      $dragging = e.target;
    }
  });
}

function keyListener(input, evetTarget) {
  let rowsNum = 77;
  let nodeList = document.querySelectorAll(".tab span.is-editable");
  let index = Array.from(nodeList).indexOf(evetTarget);
  let rem = (index - (index % rowsNum)) / rowsNum;
  
  input.addEventListener("keydown", (ee) => {
    pressedKey = ee.key;

    if (pressedKey === "Backspace" || pressedKey === "Delete") return;

    if (PERMITTED_KEYS.indexOf(pressedKey) > -1) {
      ee.target.value = pressedKey;
    }


    ee.preventDefault();
    if (ee.shiftKey && ee.key === "Tab") {
      pressedKey = "ArrowLeft";
    }

    processKey(pressedKey);
  });

  function processKey(pressedKey) {
    switch (pressedKey) {
      case "Escape":
        stopEditing();
        return false;
      case "Enter":
        stopEditing();
        return false;
      case "Tab":
        turnRight();
        return false;
      case "ArrowLeft":
        turnLeft();
        return false;
      case "ArrowUp":
        turnUp();
        return false;
      case "ArrowRight":
        turnRight();
        return false;
      case "ArrowDown":
        turnDown();
        return false;
    }
  }

  function stopEditing() {
    input.blur();
  }

  function turnLeft() {
    if (index > -1 && index % rowsNum > 1) {
      evetTarget.previousElementSibling.click();
      input.blur();
    } else {
      nodeList[index + 75].click();
      input.blur();
    }
  }

  function turnRight() {
    if (index > -1 && index % rowsNum < 76) {
      evetTarget.nextElementSibling.click();
      input.blur();
    } else {
      nodeList[index - 75].click();
      input.blur();
    }
  }

  function turnUp() {
    if (rem > 0) {
      nodeList[index - rowsNum].click();
      input.blur();
    } else {
      nodeList[nodeList.length - (rowsNum - (index % rowsNum))].click();
      input.blur();
    }
  }

  function turnDown() {
    if (rem < nodeList.length / rowsNum - 1) {
      nodeList[index + rowsNum].click();
      input.blur();
    } else {
      nodeList[index % rowsNum].click();
      input.blur();
    }
  }
}

function prepareTemplate(template) {
  return template
    .split("")
    .map((e) => {
      if (e === "-" || e.match(/[0-9+]/) || e === "|")
        return `<span class='is-editable'>${e}</span>`;
      return `<span>${e}</span>`;
    })
    .join("");
}

function clear() {
  $tab.innerHTML = "";
  addRow(TEMPLATE);
}

function download() {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent($tab.innerText)
  );
  element.setAttribute("download", "tab.txt");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function toggleVisibility(classname) {
  element = document.querySelector("." + classname);
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

// Open tips content in modal
function modalLinks() {
  links = document.querySelectorAll("table a");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      modal = document.getElementById("tips-modal");
      modal.style.display = "block";

      modal.querySelector(".modal-content .content").innerHTML =
        '<object class="remote-content" type="text/html" data=' +
        link.href +
        "></object>";
    });
  });

  document
    .querySelector("#tips-modal .close")
    .addEventListener("click", (e) => toggleVisibility("modal#tips-modal"));

  window.onclick = (event) => {
    modal = document.getElementById("tips-modal");
    if (event.target == modal) modal.style.display = "none";
  };
}

function addRowButtonHandler() {
  document
    .querySelector(".add-row")
    .addEventListener("click", (e) => addRow(TEMPLATE));
}

function clearButtonHandler() {
  document.querySelector(".clear").addEventListener("click", clear);
}

function downloadButtonHandler() {
  document
    .querySelector(".download")
    .addEventListener("click", (e) => download());
}

function tipsButtonHandler() {
  document
    .querySelector(".help")
    .addEventListener("click", (e) => toggleVisibility("tips"));
}

addRow(DEFAULT_TEMPLATE);

modalLinks();
addRowButtonHandler();
clearButtonHandler();
downloadButtonHandler();
tipsButtonHandler();
