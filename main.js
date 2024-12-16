const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resultDisplay = document.getElementById("resultDisplay");
const addItemButton = document.getElementById("addItemButton");
const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");

let items = [];
let availableColors = [
  '#f2a8a5', '#fdb7a0', '#fecd98', 
  '#f8e38d', '#d4dc8b', '#99d6ac', 
  '#7dcabf', '#77b8c8', '#82a5c5', 
  '#9c9ec5', '#b597b9', '#d89dae'];

let spinSpeed = 0;


// ルーレット描画関数
function drawRoulette(startAngle, startButtonDisabled, stopButtonDisabled, addItemButtonDisabled, itemListPointerEvents, resultDisplayText) {
  const radius = canvas.width / 2;
  const arcSize = (2 * Math.PI) / items.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, index) => {
    const angle = startAngle + index * arcSize;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + arcSize);
    ctx.fillStyle = item.color;
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#322d32";
    ctx.font = "24px Arial";
    ctx.fillText(item.name, radius - 10, 10);

    ctx.restore();
  });

  startButton.disabled = startButtonDisabled;
  stopButton.disabled = stopButtonDisabled;
  addItemButton.disabled = addItemButtonDisabled;
  itemList.style.pointerEvents = itemListPointerEvents;
  resultDisplay.textContent = resultDisplayText;
}



// ルーレットを回す（不正）
function spinRogueRoulette(startAngle, targetIndex, targetAngle, totalAngle, decrement, minSpeed, stopSpin, flag, spinTimeout) {
  if (spinSpeed < minSpeed) {
    clearTimeout(spinTimeout);
    drawRoulette(startAngle, false, true, false, "auto", `lucky : ${items[targetIndex].name}`);
    return;
  }

  // ストップボタンの動作
  stopButton.addEventListener("click", () => {
    stopSpin = true;
  });

  let currentAngle = (startAngle + targetAngle + totalAngle) % (2 * Math.PI);
  if (stopSpin) {
    if (currentAngle > (2 * Math.PI - 0.02) || currentAngle < 0.02) {
      flag = true;
    }
  }

  if (flag) {
    spinSpeed *= decrement;
  }

  startAngle += spinSpeed;
  drawRoulette(startAngle, true, false, true, "none", "");
  spinTimeout = requestAnimationFrame(() => 
    spinRogueRoulette(startAngle, targetIndex, targetAngle, totalAngle, decrement, minSpeed, stopSpin, flag, spinTimeout));
}



// スタートボタンの動作
startButton.addEventListener("click", () => {
  if (items.length === 0) {
    alert("ルーレットに項目を追加してください。");
    return;
  }

  spinSpeed = 0.5;

  const targetTexts = ["あべ", "いおり", "阿部", "伊織", "あべいおり", "阿部伊織", "abe", "iori"];
  const matchedIndexes = items
    .map((item, index) => targetTexts.some(text => item.name.includes(text)) ? index : -1)
    .filter(index => index !== -1);
  
  let targetIndex = Math.floor(Math.random() * items.length);

  if (matchedIndexes.length > 0) {
    targetIndex = matchedIndexes[Math.floor(Math.random() * matchedIndexes.length)];
  }

  const arcSize = (2 * Math.PI) / items.length;
  const targetAngle = targetIndex * arcSize + arcSize / 2 + (arcSize / 2) * (Math.random() * 1.8 - 0.9);
  spinRogueRoulette(0, targetIndex, targetAngle, calculateTotalAngle(spinSpeed, 0.99,  0.001), 0.99,  0.001, false, false, null);
});



// 項目を追加する
addItemButton.addEventListener("click", () => {

  if (itemInput.value.trim() === "") {
    return;
  }

  if (availableColors.length === 0) {
    alert("これ以上追加できません。利用可能な色がありません。");
    return;
  }

  const color = availableColors[Math.floor(Math.random() * availableColors.length)];
  availableColors = availableColors.filter(c => c !== color);
  items.push({name : itemInput.value, color : color});
  
  addItem(itemInput.value, color);

  itemInput.value = "";
  drawRoulette(0, false, true, false, "auto", "");
});



function addItem(name, color) {
  const li = document.createElement("li");
  li.textContent = name;
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.textContent = "delete";

  deleteButton.addEventListener("click", () => {
    const index = items.findIndex(item => item.color === color);
    if (index > -1) {
      items.splice(index, 1);
      availableColors.push(color);
      li.remove();
      drawRoulette(0, false, true, false, "auto", "");
    }
  });

  li.appendChild(deleteButton);
  itemList.appendChild(li);
}



function calculateTotalAngle(spinSpeed, decrement, minSpeed) {
  let totalAngle = 0;

  while (spinSpeed > minSpeed) {
    spinSpeed *= decrement;
    totalAngle += spinSpeed;
  }

  return totalAngle;
}
