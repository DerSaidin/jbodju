/*
 * Copyright (c) 2014, Andrew Browne <dersaidin@dersaidin.net>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
 * This extension includes camxes.js parser from:
 *     https://github.com/Ilmen-vodhr/ilmentufa
 */

var JBOJDU_BOX_COUNT_CLASS = ["jbodju-first", "jbodju-second", "jbodju-third", "jbodju-fourth", "jbodju-fifth"];

function boxClass(i) {
    return JBOJDU_BOX_COUNT_CLASS[(i % JBOJDU_BOX_COUNT_CLASS.length)];
}

var JBOJDU_ELIDABLE_CLASS = "jbojdu-elidable";

var JBOJDU_INFO_MAIN_ID = "jbodju-info-main";
var JBOJDU_INFO_CLASS = "jbodju-info";

/*
 * Print the top most layer of the parse tree.
 * +--------+
 * | word   |
 * | gclass |
 * +--------+
 * A div containing the word, followed by it's gramatic class on a new line.
 */
function printWord(a, i) {
    var h = "";
    if (a.constructor === Array) {
        if (a.length == 1 || a.length == 2) {
            var elidableClass = "";
            var disp = "";
            if (a.length == 1) {
                // Length 1 means the grammar has a marker here, but the actual text we are displaying elided it.
                elidableClass = " " + JBOJDU_ELIDABLE_CLASS;
                disp = ' style="display:none"'; // need to set the display:none here instead of in CSS for the toggler to work
            }
            
            h += '<div class="jbodju-box ' + boxClass(i) + elidableClass + '"' + disp + '>';
            i = i + 1;
            if (a.length == 2) {
                h += '<p><a href="http://vlasisku.lojban.org/vlasisku/' + a[1] + '" target="_blank"><strong>' + a[1] + '</strong></a></p>';
            } else {
                h += '<br/>';
            }
            h += '<p>' + a[0] + '</p>';
            h += '</div>';
        } else {
            assert();
        }
    } else {
        assert();
    }
    return { text: h, inc: i };
}

function printTree(a, i) {
    var h = "";
    if (a.constructor === Array) {
        if ((a.length == 1 && a[0].constructor === String) ||
            (a.length == 2 && a[0].constructor === String && a[1].constructor === String)) {
            var result = printWord(a, i);
            h += result.text;
            i += result.inc;
        } else if (a.length == 2 && a[0].constructor === String && a[1].constructor === Array) {
            // Skip displaying the name of this production to save space.
            // Just display the next production inside it.
            var result = printTree(a[1], i);
            h += result.text;
            i += result.inc;
        } else if (a.length >= 1 && a[0].constructor === String) {
            h += '<div class="jbodju-box ' + boxClass(i) + '" id="' + a[0] + '">';
            i = i + 1;
            for (var j = 1; j<a.length; j++) {
                var result = printTree(a[j], i);
                h += result.text;
                i += result.inc;
            }
            h += '<p>' + a[0] + '</p>'; // Production name
            h += '</div>';
        } else if (a.length >= 1) {
            h += '<div class="jbodju-box ' + boxClass(i) + '">';
            i = i + 1;
            for (var j = 0; j<a.length; j++) {
                var result = printTree(a[j], i);
                h += result.text;
                i += result.inc;
            }
            h += '</div>';
        } else {
            assert();
        }
    } else {
        assert();
    }
    return { text: h, inc: i };
};

function toggleHiddenByClass(togClass) {
    var e = document.getElementsByClassName(togClass);
    for (var i = 0; i < e.length; i++) {
        e[i].style.display = ((e[i].style.display == "none") ? "table-cell" : "none");
    }
}

function removeElementByID(id) {
    var e = document.getElementById(id);
    if (e) {
        e.parentNode.removeChild(e);
    }
}

function parseTreeToHTML(p) {
    var h = "";
    
    // Build the <div> tree for the parse tree.
    result = printTree(p, 0);
    h += result.text;
    
    // Build the control bar at the bottom.
    var ctrlBar = '<div>';
    ctrlBar += '<div class="jbodju-info-button" onclick=\'' + removeElementByID.toString() + '; removeElementByID("' + JBOJDU_INFO_MAIN_ID + '");\'>Close</div>  ';
    ctrlBar += '<div class="jbodju-info-button" onclick=\'' + toggleHiddenByClass.toString() + '; toggleHiddenByClass("' + JBOJDU_ELIDABLE_CLASS + '");\'>Toggle Elidable</div>';
    ctrlBar += '<div></div></div>';
    
    return '<div id="jbodju-boxes">' + h + ctrlBar + '</div>';
};

/*
 * Given an Element, walk up parents until we find an Element that we can put the info box on.
 */
function getPlaceElement(n) {
    while (1) {
        var prev = n;
        if (n.tagName == 'A' && n.getAttribute("href")) {
            // We don't want to build the parse info inside an <a>, otherwise it will all be a link.
            n = n.parentElement
        }
        if (prev == n) { break; }
    }
    return n;
}

function processNode(n, specificText) {
    var existingJbojduInfo = document.getElementById(JBOJDU_INFO_MAIN_ID);
    if (existingJbojduInfo) {
        // Check if selection is inside a jbojdu info.
        // If it is, ignore it.
        np = n;
        if (np == existingJbojduInfo) { return; }
        while (np.parentNode) {
            np = np.parentNode;
            if (np == existingJbojduInfo) { return; }
        }
    }

    var text = "";
    if (typeof(specificText)==='undefined') {
        if (n.wholeText) {
            // This will not get text in other nodes.
            // If there is a link in the text, this will stop at the <a>.
            //TODO: try aggregating subsequent nodes and trying to parse it, fallback to just this node.
            text = n.wholeText;
        } else {
            // Clicked somewhere with no text.
            if (existingJbojduInfo) {
                // Remove the old one.
                existingJbojduInfo.parentNode.removeChild(existingJbojduInfo);
            }
            return;
        }
    } else {
        text = specificText;
    }
    
    text = text.trim();
    
    if (text.match("^\s*$") != null) {
        // No text here.
        return;
    }
    
    if (existingJbojduInfo) {
        // Remove the old one.
        existingJbojduInfo.parentNode.removeChild(existingJbojduInfo);
    }

    var response = {
        gramatical: false,
        parse: [],
        error: {},
        };

    try {
        p = camxes.parse(text);
        response.gramatical = true;
        response.parse = p;
    } catch(se) {
        /* SyntaxError */
        response.error = se;
    }
    
    if (response.gramatical) {
        console.log('{' + text + '} camxes {' + JSON.stringify(response.parse) + '}');
    } else {
        console.log('{' + text + '} camxes ungramatical');
        return;
    }
    
    var JbojduInfo = document.createElement('div'); 
    JbojduInfo.innerHTML = parseTreeToHTML(response.parse);
    selectionNode = getPlaceElement(n.parentElement);
    selectionNode.appendChild(JbojduInfo);
    JbojduInfo.className = JBOJDU_INFO_CLASS;
    JbojduInfo.id = JBOJDU_INFO_MAIN_ID;
    JbojduInfo.style.position = "absolute";
    JbojduInfo.style.left = selectionNode.offsetLeft + "px";
    JbojduInfo.style.top = selectionNode.offsetTop + selectionNode.offsetHeight + "px";
};

function processSelected(){
    sel = window.getSelection();
    if (sel.type == "Caret") {
        processNode(sel.baseNode);
    } else if (sel.type == "Range") {
        processNode(sel.baseNode, sel.toString());
    }
};

/* Entry point, when user clicks something. */
window.onclick = processSelected;
