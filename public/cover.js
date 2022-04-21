var navlink = document.getElementsByClassName("nav-link");

function navClick(event) {

  if (event.target.classList[1] === "active") {
	event.target.classList.remove("active");
  } 
  else {
	for (var i = 0; i < navlink.length; i++) {
	  navlink[i].classList.remove("active");
	}

	event.target.classList.add("active");
  }
}

function init() {
  for (var i = 0; i < navlink.length; i++) {
	navlink[i].addEventListener("click", navClick);
  }
}

init();

// const open = () => {
//   document
//       .querySelector(".modal")
//       .classList
//       .remove("hidden");
// }

// const close = () => {
//   document
//       .querySelector(".modal")
//       .classList
//       .add("hidden");
// }


// document
//   .querySelector(".startBtn")
//   .addEventListener("click", open);
// document
//   .querySelector(".close")
//   .addEventListener("click", close);
// document
//   .querySelector(".bg")
//   .addEventListener("click", close);




//   const openPT = () => {
//     document
//         .querySelector(".modalPT")
//         .classList
//         .remove("hidden");
//   }
//   const closePT = () => {
//     document
//         .querySelector(".modalPT")
//         .classList
//         .add("hidden");
//   }

// document
//   .querySelector(".participateBtn")
//   .addEventListener("click", openPT);
// document
//   .querySelector(".closePT")
//   .addEventListener("click", closePT);
// document
//   .querySelector(".bgPT")
// .addEventListener("click", closePT);

var b1 = document.getElementById("b1");
var b2 = document.getElementById("b2");

var m1 = document.getElementById("m1");
var m2 = document.getElementById("m2");

var c1 = document.getElementById("c1");
var c2 = document.getElementById("c2");

var col = document.getElementsByClassName("col");

const openM1 = () => {
    // document
    //     .querySelector(".modal")
    //     .classList
    //     .remove("hidden");
    
    m1.style.display = "flex";
    m1.style.justifyContent = "center";
    m1.style.alignItems = "center";

  }
  
const closeM1 = () => {
  
  m1.style.display = "none";
}
const openM2 = () => {
  
  m2.style.display = "block";
}

const closeM2 = () => {
  m2.style.display = "none";
}

b1.addEventListener("click", openM1);
b2.addEventListener("click", openM2);

c1.addEventListener("click", closeM1);
c2.addEventListener("click", closeM2);

// Btnclick(b1, m1);
// Btnclick(b2, m2);
// Spanclcik(c1, m1);
// Spanclcik(c2, m2);

// window.onclick = function(event){
//   if(event.target == m1){
//     m1.style.display = "none";
//   }
//   if(event.target == m2){
//     m2.style.display = "none";
//   }
// }