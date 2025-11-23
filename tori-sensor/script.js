// 受信データを格納
let pitch = 0, roll = 0, speed = 0, altitude = 0;

// デモ用の計器更新関数
function updateInstruments() {
    drawGauge(speed);
    drawAttitude(pitch, roll);
    setAltitude(altitude);
}

// ----------------------------
// Bluetooth接続
async function connectBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }] // マイコン側サービスUUID
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);

        console.log("Bluetooth 接続完了");
    } catch (err) {
        console.error("Bluetooth 接続失敗:", err);
    }
}

// 受信データ処理
function handleData(event) {
    const value = new TextDecoder().decode(event.target.value);
    // データ例: pitch,roll,speed,altitude\n
    const parts = value.trim().split(",");
    if(parts.length >= 4){
        pitch = parseFloat(parts[0]);
        roll = parseFloat(parts[1]);
        speed = parseFloat(parts[2]);
        altitude = parseFloat(parts[3]);
    }
}

// ----------------------------
// 計器を定期更新
setInterval(updateInstruments, 50);

// ----------------------------
// ページロード後に接続ボタン作成
window.addEventListener('load', () => {
    const btn = document.createElement('button');
    btn.textContent = "Connect Bluetooth";
    btn.style.position = "fixed";
    btn.style.top = "20px";
    btn.style.left = "20px";
    btn.style.fontSize = "16px";
    btn.addEventListener('click', connectBluetooth);
    document.body.appendChild(btn);
});
