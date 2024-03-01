const userBtn = document.getElementById("user");
const closeBtn = document.getElementById("close");
const dropdown = document.getElementById("dropdown");

userBtn.addEventListener("click", function(){
    dropdown.classList.add("toggle");
})

closeBtn.addEventListener("click" , function() {
    dropdown.classList.remove("toggle")
})