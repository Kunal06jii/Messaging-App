const socket = io();

const myCodeEl = document.getElementById("myCode");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const toCodeInput = document.getElementById("toCode");

let myCode = "";

socket.on("yourCode", (code) => {
  myCode = code;
  myCodeEl.textContent = code;
});

function sendMessage() {
  const toCode = toCodeInput.value.trim();
  const message = msgInput.value.trim();
  
  if (toCode && message) {
    socket.emit("sendMessage", { toCode, message });
    addMessage(`You: ${message}`, "sent");
    msgInput.value = "";
  }
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

socket.on("receiveMessage", ({ fromCode, message }) => {
  addMessage(`${fromCode}: ${message}`, "received");
});

socket.on("errorMessage", (msg) => {
  addMessage(`⚠️ ${msg}`, "error");
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.textContent = text;
  div.classList.add("message", type);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

