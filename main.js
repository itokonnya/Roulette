const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resultDisplay = document.getElementById("resultDisplay");
const addItemButton = document.getElementById("addItemButton");
const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");

let items = [];
let usedColors = [];
let lastColor = "";
let availableColors = ['#f2a8a5', '#fdb7a0', '#fecd98', '#f8e38d', '#d4dc8b', '#99d6ac', '#7dcabf', '#77b8c8', '#82a5c5', '#9c9ec5', '#b597b9', '#d89dae'];

let startAngle = 0;
let spinSpeed = 0;
let spinTimeout;
let stopSpin = false;

// ルーレット描画関数
function drawRoulette() {
  const radius = canvas.width / 2;
  const numItems = items.length;
  const arcSize = (2 * Math.PI) / numItems;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, index) => {
    const angle = startAngle + index * arcSize;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + arcSize);
    ctx.fillStyle = usedColors[index];
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#322d32";
    ctx.font = "24px Arial";
    ctx.fillText(item, radius - 10, 10);

    ctx.restore();
  });
}

// ルーレットを回す
function spinRoulette(decrement, minSpeed) {
  if (stopSpin) {
    if (spinSpeed < minSpeed) {
      clearTimeout(spinTimeout);
      finalizeSpin();
      return;
    }
    spinSpeed *= decrement;
  }
  startAngle += spinSpeed;
  drawRoulette();
  spinTimeout = requestAnimationFrame(() => spinRoulette(decrement, minSpeed));
}

// ルーレットを回す（不正）
let flag = false;
function spinRogueRoulette(targetAngle, totalAngle, decrement, minSpeed) {
  if (stopSpin) {
    const currentAngle = (startAngle + targetAngle + totalAngle) % (2 * Math.PI);
    if (currentAngle > (2 * Math.PI - 0.02) || currentAngle < 0.02) {
      flag = true;
    }
    if (flag) {
      if (spinSpeed < minSpeed) {
        clearTimeout(spinTimeout);
        finalizeSpin();
        return;
      }
      spinSpeed *= decrement;
    }
  }
  startAngle += spinSpeed;
  drawRoulette();
  spinTimeout = requestAnimationFrame(() => spinRogueRoulette(targetAngle, totalAngle, decrement, minSpeed));
}

// 回転終了時に当たりを表示
function finalizeSpin() {
  const numItems = items.length;
  const selectedIndex = Math.floor(((startAngle % (2 * Math.PI)) / (2 * Math.PI)) * numItems);
  const winner = items[(numItems - 1 - selectedIndex + numItems) % numItems];

  resultDisplay.textContent = `lucky : ${winner}`;
  startButton.disabled = false;
  stopButton.disabled = true;
  addItemButton.disabled = false;
}

// スタートボタンの動作
startButton.addEventListener("click", () => {
  if (items.length === 0) {
    alert("ルーレットに項目を追加してください。");
    return;
  }
  stopSpin = false;
  startAngle = 0;
  spinSpeed = 0.5;
  const decrement = 0.99;
  const minSpeed = 0.001;
  resultDisplay.textContent = "";
  startButton.disabled = true;
  stopButton.disabled = false;
  addItemButton.disabled = true;

  flag = false;
  const targetTexts = ["あべ", "いおり", "阿部", "伊織", "あべいおり", "阿部伊織", "abe", "iori"];
  const matchedIndexes = items
    .map((item, index) => targetTexts.some(text => item.includes(text)) ? index : -1)
    .filter(index => index !== -1);
  if (matchedIndexes.length > 0) {
    const targetIndex = matchedIndexes[Math.floor(Math.random() * matchedIndexes.length)];
    const numItems = items.length;
    const arcSize = (2 * Math.PI) / numItems;
    const targetAngle = targetIndex * arcSize + arcSize / 2 + (arcSize / 2) * (Math.random() * 1.8 - 0.9);
    const totalAngle = calculateTotalAngle(spinSpeed, decrement, minSpeed);
    spinRogueRoulette(targetAngle, totalAngle, decrement, minSpeed);
  } else {
    spinRoulette(decrement, minSpeed);
  }
});

// ストップボタンの動作
stopButton.addEventListener("click", () => {
  stopSpin = true;
});

// 項目を追加する
addItemButton.addEventListener("click", () => {
  const newItem = itemInput.value.trim();
  if (newItem !== "") {
    if (availableColors.length === 0) {
      alert("これ以上追加できません。利用可能な色がありません。");
      return;
    }
    const color = getRandomColor();
    if (color) {
      items.push(newItem);
      usedColors.push(color);

      const li = document.createElement("li");
      li.textContent = newItem;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "delete";
      deleteButton.addEventListener("click", () => {
        const index = items.indexOf(newItem);
        if (index > -1) {
          items.splice(index, 1);
          const removedColor = usedColors.splice(index, 1)[0];
          availableColors.push(removedColor);
          li.remove();
          drawRoulette();
        }
      });
      li.appendChild(deleteButton);
      itemList.appendChild(li);
      itemInput.value = "";
      drawRoulette();
    }
  }
});

// ランダムに色を選ぶ関数。同じ色が連続しないようにし、使用済みの色を保持する
function getRandomColor() {
  let color;
  do {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    color = availableColors[randomIndex];
  } while (color === lastColor);
  lastColor = color;
  availableColors = availableColors.filter(c => c !== color);
  return color;
}


function calculateTotalAngle(spinSpeed, decrement, minSpeed) {
  let totalAngle = 0;

  while (spinSpeed > minSpeed) {
    spinSpeed *= decrement;
    totalAngle += spinSpeed;
  }

  return totalAngle;
}