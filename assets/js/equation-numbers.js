/* ---------------------------------------------------------------------------
 * equation-numbers.js — number every display equation in a post
 *
 * Main text:    (1), (2), (3), …   one sequence per post
 * Remark boxes: (4.i), (4.ii), …   restart in each collapsible box, prefixed
 *                                  with the section the box sits in. A section
 *                                  holding several boxes gets letters:
 *                                  (7a.i), (7b.i), (7c.i).
 *
 * Each number is an anchor — (7) links to #eq-7, (7b.ii) to #eq-7b-ii — so an
 * equation can be linked to, not just named.
 *
 * These numbers are POSITIONAL: inserting an equation renumbers everything
 * after it. They are for talking about a post, not for durable cross-post
 * links — those use the semantic anchors in CONTRIBUTING-posts.md.
 *
 * Runs after MathJax typesets. No change to the Markdown is needed: it works
 * on whatever `$$…$$` blocks MathJax has already rendered.
 * ------------------------------------------------------------------------- */

(function () {
  "use strict";

  var DISPLAY = 'mjx-container[display="true"]';
  var BOXES = ".learn-more-box, details";

  // --- helpers -------------------------------------------------------------

  var ROMAN = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];

  function roman(n) {
    var out = "";
    for (var i = 0; i < ROMAN.length; i++) {
      while (n >= ROMAN[i][0]) {
        out += ROMAN[i][1];
        n -= ROMAN[i][0];
      }
    }
    return out;
  }

  // "## 4 · The Gaussian machinery" renders as an <h2> whose text starts "4 ·".
  function sectionNumber(h) {
    var m = /^\s*(\d+)\s*[·.:]/.exec(h.textContent || "");
    return m ? m[1] : null;
  }

  function letter(i) {
    return String.fromCharCode(97 + i); // 0 -> a
  }

  function slug(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  // --- styles, injected once so a post only needs the one <script> ---------

  function injectStyles() {
    if (document.getElementById("eqno-styles")) return;
    var css = [
      ".eq-block{display:flex;align-items:center;gap:0.75rem;margin:1.5rem 0;}",
      ".eq-block > .eq-body{flex:1 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;}",
      ".eq-block > .eq-body > mjx-container{margin:0!important;}",
      ".eq-block > .eq-no{flex:0 0 auto;font-variant-numeric:tabular-nums;",
      "font-size:0.9em;color:var(--global-text-color);opacity:0.55;",
      "text-decoration:none;white-space:nowrap;}",
      ".eq-block > .eq-no:hover{opacity:1;color:var(--global-theme-color);}",
      ".eq-block > .eq-no:target,.eq-block > .eq-no.eq-flash{opacity:1;",
      "color:var(--global-theme-color);font-weight:700;}",
      // Inside the boxed .key-eq callouts the equation already has padding.
      ".key-eq .eq-block{margin:0.6rem 0;}",
      "@media (max-width:576px){.eq-block{gap:0.4rem;}",
      ".eq-block > .eq-no{font-size:0.8em;}}",
    ].join("");
    var el = document.createElement("style");
    el.id = "eqno-styles";
    el.textContent = css;
    document.head.appendChild(el);
  }

  // --- the pass ------------------------------------------------------------

  function number(root) {
    if (root.getAttribute("data-eqno-done") === "1") return;

    var equations = root.querySelectorAll(DISPLAY);
    if (!equations.length) return;

    // 1 · Work out a prefix for every remark box.
    //
    // `.learn-more-box` wraps a `<details>`, so both match the selector —
    // keep only the outermost of any nested pair.
    var allBoxes = Array.prototype.slice.call(root.querySelectorAll(BOXES));
    var boxes = allBoxes.filter(function (b) {
      return !allBoxes.some(function (other) {
        return other !== b && other.contains(b);
      });
    });

    // Group by the section each box sits in, so we know which need letters.
    var headings = Array.prototype.slice.call(root.querySelectorAll("h2"));
    var bySection = {};
    var boxSection = new Map();

    boxes.forEach(function (box, i) {
      var sec = null;
      for (var h = headings.length - 1; h >= 0; h--) {
        // compareDocumentPosition: heading precedes the box
        if (headings[h].compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING) {
          sec = sectionNumber(headings[h]);
          break;
        }
      }
      // No numbered heading above it (e.g. a post with an unnumbered intro):
      // fall back to the box's own ordinal, marked so it can't collide with a
      // real section number.
      var key = sec === null ? "b" + (i + 1) : sec;
      boxSection.set(box, key);
      (bySection[key] = bySection[key] || []).push(box);
    });

    var boxState = new Map();
    Object.keys(bySection).forEach(function (key) {
      var group = bySection[key];
      group.forEach(function (box, i) {
        boxState.set(box, {
          prefix: group.length > 1 ? key + letter(i) : key,
          count: 0,
        });
      });
    });

    // 2 · Walk the equations in document order and label them.
    var main = 0;

    Array.prototype.forEach.call(equations, function (eq) {
      if (eq.closest(".eq-block")) return; // already numbered

      var box = eq.closest(BOXES);
      var state = box ? boxState.get(box) : null;

      // A box nested inside another box shares the outer box's counter.
      while (box && !state) {
        box = box.parentElement && box.parentElement.closest(BOXES);
        state = box ? boxState.get(box) : null;
      }

      var label, id;
      if (state) {
        state.count += 1;
        label = state.prefix + "." + roman(state.count);
        id = "eq-" + slug(label);
      } else {
        main += 1;
        label = String(main);
        id = "eq-" + main;
      }

      // Wrap: [ equation ][ (n) ]. A sibling rather than an ::after, so a wide
      // equation can scroll horizontally without dragging its number along.
      var block = document.createElement("div");
      block.className = "eq-block";

      var body = document.createElement("div");
      body.className = "eq-body";

      eq.parentNode.insertBefore(block, eq);
      body.appendChild(eq);
      block.appendChild(body);

      var tag = document.createElement("a");
      tag.className = "eq-no";
      tag.id = id;
      tag.href = "#" + id;
      tag.textContent = "(" + label + ")";
      tag.setAttribute("aria-label", "Equation " + label + ", link to this equation");
      block.appendChild(tag);
    });

    root.setAttribute("data-eqno-done", "1");

    // If the page was opened on an equation anchor, reveal it: the target may
    // sit inside a collapsed <details>.
    revealTarget();
  }

  function revealTarget() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var el = document.getElementById(hash.slice(1));
    if (!el || !/^eq-/.test(el.id)) return;

    var d = el.closest("details");
    while (d) {
      d.open = true;
      d = d.parentElement && d.parentElement.closest("details");
    }
    el.classList.add("eq-flash");
    el.scrollIntoView({ block: "center" });
  }

  // --- start ---------------------------------------------------------------

  function run() {
    injectStyles();
    var root = document.querySelector(".post-content") || document.querySelector("article") || document.querySelector("main") || document.body;
    number(root);
  }

  function whenTypeset(cb) {
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(cb).catch(cb);
      return;
    }
    // MathJax is loaded from a CDN and may not be present yet.
    var tries = 0;
    var poll = setInterval(function () {
      if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        clearInterval(poll);
        window.MathJax.startup.promise.then(cb).catch(cb);
      } else if (++tries > 100) {
        clearInterval(poll); // ~10 s; give up quietly rather than hang
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      whenTypeset(run);
    });
  } else {
    whenTypeset(run);
  }

  window.addEventListener("hashchange", revealTarget);
})();
