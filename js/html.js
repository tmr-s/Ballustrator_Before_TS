"use strict";
exports.__esModule = true;
require("jquery");
$(function () {
    console.log('jQ');
});
window.onload = function () {
    document.getElementById("openplist").addEventListener("input", function (e) {
        console.log(e.target);
    });
    document.getElementById("importplist").addEventListener("input", function (e) {
        console.log(e.target.files);
    });
    document.getElementById("importplay").addEventListener("input", function (e) {
        console.log(e.target.files);
    });
};
function openDialog(id) {
    var dialog = document.getElementById(id);
    dialog.click();
}
