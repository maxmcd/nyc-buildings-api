// http://stackoverflow.com/questions/3620116/get-css-path-from-dom-element
var cssPath = function(el) {
	if (!(el instanceof Element))
		return;
	var path = [];
	while (el.nodeType === Node.ELEMENT_NODE) {
		var selector = el.nodeName.toLowerCase();
		if (el.id) {
			selector += '#' + el.id;
			path.unshift(selector);
			break;
		} else {
			var sib = el,
				nth = 1;
			while (sib = sib.previousElementSibling) {
				if (sib.nodeName.toLowerCase() == selector)
					nth++;
			}
			if (nth != 1)
				selector += ":nth-of-type(" + nth + ")";
		}
		path.unshift(selector);
		el = el.parentNode;
	}
	return path.join(" > ");
};
var jsonCreator = function(e) {
	var path = cssPath(e.toElement);
	console.log("{\n\t\"name\":\"\",\n\t\"location\" : \""+
				path + "\",\n\t\"regex\" : \""+
				e.toElement.innerText + "\"\n},");
};
document.onclick = jsonCreator;


// as bookmarklet
javascript:(function(){var cssPath = function(el) { if (!(el instanceof Element)) return; var path = []; while (el.nodeType === Node.ELEMENT_NODE) { var selector = el.nodeName.toLowerCase(); if (el.id) { selector += '#' + el.id; path.unshift(selector); break; } else { var sib = el, nth = 1; while (sib = sib.previousElementSibling) { if (sib.nodeName.toLowerCase() == selector) nth++; } if (nth != 1) selector += ":nth-of-type(" + nth + ")"; } path.unshift(selector); el = el.parentNode; } return path.join(" > "); }; var jsonCreator = function(e) { var path = cssPath(e.toElement); console.log("{\n\t\"name\":\"\",\n\t\"location\" : \""+ path + "\",\n\t\"regex\" : \""+ e.toElement.innerText + "\"\n},"); }; document.onclick = jsonCreator;})();