jbodju
======

jbodju Chrome Extension


Installation
============

1. Go to chrome://extensions/
2. Enable Developer mode (not packaged in chrome store - yet)
3. Load unpacked extension...  Select the directory of this git repo


Usage
=====

Currently only enabled on "*://*.lojban.org/*" and "*://groups.google.com/*".

Select some lojban text or click some lojban text.

Clicking text may not work so well, because if there are other HTML nodes in the text it will stop at them.
Selecting text means it doesn't need to try and figure out where the text to parse starts/ends.

If the text is deemed gramatical by camxes.js, then the parse tree will be added to the page.

You can toggle elided terminators.

Click some other text or click close to get rid of the parse tree.
