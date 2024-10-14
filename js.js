const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resultDisplay = document.getElementById("resultDisplay");
const addItemButton = document.getElementById("addItemButton");
const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");

let items = [];
let isSpinning = false;
let startAngle = 0;
let spinTimeout;
let stopSpin = false;
let spinSpeed = 0;

const targetItems = ["あべ", "阿部", "abe"];  // ターゲット文字列
const colors = ['#f2a8a5', '#fdb7a0', '#fecd98', '#f8e38d', '#d4dc8b', '#99d6ac', '#7dcabf', '#77b8c8', '#82a5c5', '#9c9ec5', '#b597b9', '#d89dae'];

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
    ctx.fillStyle = colors[index % colors.length];  // 3色を繰り返す
    ctx.fill();

    // テキストの描画
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.fillText(item, radius - 10, 10);
    ctx.restore();
  });
}

// ルーレットを回す
function spinRoulette() {
  if (stopSpin) {
    if (spinSpeed < 0.02) {
      clearTimeout(spinTimeout);
      finalizeSpin();
      return;
    }
    spinSpeed *= 0.97;  // 減速
  }

  startAngle += spinSpeed;
  drawRoulette();
  spinTimeout = requestAnimationFrame(spinRoulette);
}

// 回転終了時に当たりを表示し、ルーレットをその文字列に調整して停止
function finalizeSpin() {
  const targetIndices = items
    .map((item, index) => (targetItems.includes(item) ? index : null))
    .filter((index) => index !== null);  // ターゲットアイテムのインデックス取得

  let selectedIndex;
  if (targetIndices.length > 0) {
    // ターゲットアイテムの中からランダムに選ぶ
    selectedIndex = targetIndices[Math.floor(Math.random() * targetIndices.length)];
  } else {
    // ターゲットアイテムがない場合は通常のランダム処理
    selectedIndex = Math.floor(((startAngle % (2 * Math.PI)) / (2 * Math.PI)) * items.length);
  }

  // ルーレットが選択された文字に止まるように調整
  const numItems = items.length;
  const arcSize = (2 * Math.PI) / numItems;
  const targetAngle = (selectedIndex * arcSize) + arcSize / 2;

  // ターゲットに合わせて最終停止角度を計算
  const stopAngle = (2 * Math.PI) - targetAngle;

  // 徐々に停止するようにアニメーションで角度調整
  spinSpeed = 0.1;
  function slowToStop() {
    if (spinSpeed < 0.01) {
      startAngle = stopAngle;
      const winner = items[selectedIndex];
      resultDisplay.textContent = `lucky : ${winner}`;
      startButton.disabled = false;
      stopButton.disabled = true;
      return;
    }
    spinSpeed *= 0.9;
    startAngle += spinSpeed;
    drawRoulette();
    requestAnimationFrame(slowToStop);
  }
  slowToStop();
}

// スタートボタンの動作
startButton.addEventListener("click", () => {
  if (items.length === 0) {
    alert("ルーレットに項目を追加してください。");
    return;
  }

  startAngle = 0;
  spinSpeed = Math.random() * 0.5 + 0.3;
  stopSpin = false;
  isSpinning = true;
  resultDisplay.textContent = "";
  startButton.disabled = true;
  stopButton.disabled = false;
  spinRoulette();
});

// ストップボタンの動作
stopButton.addEventListener("click", () => {
  stopSpin = true;
});

// 項目を追加する
addItemButton.addEventListener("click", () => {
  const newItem = itemInput.value.trim();
  if (newItem !== "") {
    items.push(newItem);
    const li = document.createElement("li");
    li.textContent = newItem;
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "delete";
    deleteButton.addEventListener("click", () => {
      const index = items.indexOf(newItem);
      if (index > -1) {
        items.splice(index, 1);
        li.remove();
        drawRoulette();
      }
    });
    li.appendChild(deleteButton);
    itemList.appendChild(li);
    itemInput.value = "";
    drawRoulette();
  }
});
