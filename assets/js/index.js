// Scrollbar Removal
(function () {
    var s = document.createElement('style');
    s.textContent =
    'html{-ms-overflow-style:none;scrollbar-width:none;overflow-y:scroll;}' +
    'html::-webkit-scrollbar{display:none;width:0;height:0;}';
    document.head.appendChild(s);
}());