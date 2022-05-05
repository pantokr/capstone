
const url = new URL(window.location.href);
const urlParams = url.searchParams;
console.log(urlParams.get("roomCode"));