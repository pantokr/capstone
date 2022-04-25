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

// b1.addEventListener("click", openM1);
// b2.addEventListener("click", openM2);

// c1.addEventListener("click", closeM1);
// c2.addEventListener("click", closeM2);
