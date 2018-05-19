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
    document.getElementById("infodiv").innerHTML = "<h4>Info:</h4><p>This is moderately tested. Although no issues have been discovered, I'm not responsible if anything goes wrong!</p><p>This does NOT work on Windows due to a limitation in the Chrome implementation of WebUSB (and probably other reasons!)</p><p>This does NOT currently work on any browser but Chrome, because they don't implement WebUSB.</p><p>On Linux, you might get an access denied error!If you do, you can try creating a file at <code>/etc/udev/rules.d/50-switch.rules</code>With the following contents:<br><code>SUBSYSTEM==\"usb\", ATTR{idVendor}==\"0955\", MODE=\"0664\", GROUP=\"plugdev\"</code></p><p>Hekate for 4.x has not been tested, as I do not have a 4.x switch. However, all other payloads will be tested as they are uploaded.</p><p>This has been tested and appears to work on Linux, OSX, Android (unrooted) and Chromebooks. Your mileage may vary.</p>";
  }
}

function openInstructions() {
  if(document.getElementById("infodiv").innerHTML != "") {
    document.getElementById("infodiv").innerHTML = "";
  } else {
    document.getElementById("infodiv").innerHTML = "<h4>Instructions:</h4><p>Put the Switch in RCM, and connect it to your device.</p><p>Select either the example payload, or upload one.</p><p>Press 'Run Payload!'</p><p>On the consent screen that appears, select 'APX' and hit confirm.</p><p>If all goes well, the payload will launch!</p>";
  }
}
  
document.getElementById("payloadUpload").addEventListener("change", () => document.forms.mainForm.payload.value = "uploaded");
