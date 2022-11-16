document.addEventListener("DOMContentLoaded", function () {
  // 드롭다운 메뉴 열기
  document.querySelector(".openMOgnb").addEventListener("click", function () {
    document.querySelector(".header_cont").style.display = "block";
  });

  // 드롭다운 메뉴 닫기
  document.querySelector(".closePop").addEventListener("click", function () {
    document.querySelector(".header_cont").style.display = "none";
  });
});
