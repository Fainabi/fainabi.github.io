const theme_port = theme => {
    if (theme === "Dark")
        document.body.classList.add("dark");
    else
        document.body.classList.remove("dark");   

    window.localStorage.setItem("theme", theme);
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

const toolbox_port = position => {
    window.localStorage.setItem("toolboxPosition", JSON.stringify(position));
}

const getToolboxPosition = () => {
    const savedPosition = window.localStorage.getItem("toolboxPosition");
    return savedPosition ? JSON.parse(savedPosition) : { x: 50, y: 50 };
}

var mathjax_macro = {
    bm: ["{\\boldsymbol #1}", 1],
    of: ["\\left(#1\\right)", 1],
    abs: ["\\left\\lvert #1 \\right\\rvert", 1],
    norm: ["\\left\\| #1 \\right\\|", 1],
    round: ["\\left\\lfloor #1 \\right\\rceil", 1],
};
const wrapping_type = {
    mathbb: ['Z', 'N', 'Q', 'R', 'B', 'C', 'F', 'H'],
    operatorname: ['Hom', 'DFT', 'CtS'],
    mathsf: ['RLWE', 'CRT'],
};
// into type
for (const key in wrapping_type) {
    for (const sym of wrapping_type[key]) {
        mathjax_macro[sym] = `{\\${key}{${sym}}}`;
    }    
}

const mathjax_port = () => {
    const targetElem = document.getElementsByClassName("main-blog")
    if (targetElem.length == 0)
        return;
    const targetNode = targetElem[0];  // main-blog is the body of blog pages
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      // remove unnecessary span background
      for (const tag of ["span", "p", "h1", "h2", "h3", "h4", "li", "ul"]) {
        for (var b of targetNode.getElementsByTagName(tag)) {
          b.removeAttribute("style");
        }
      }

      // resolve the bug in elm markdown package
      for (const clsname of ["innerJoin", "bracketed", "X12"]) {
        var b = document.getElementsByClassName(clsname);
        while(b.length) {
            var parent = b[0].parentNode;
            while( b[0].firstChild ) {
                parent.insertBefore(b[0].firstChild, b[0] );
            }
            parent.removeChild(b[0]);
        }
      }
      
      const mathjax = document.getElementById("mathjax");
      if (mathjax != undefined && mathjax.getAttribute("toggle") == "on") {  
        // load mathjax for rendering
        // see `https://mathjax.github.io/MathJax-demos-web/load-mathjax/load-mathjax.html.html`
        setTimeout(() => {
          if (document.body.querySelector('math') ||
            document.body.textContent.match(/(?:\$|\\\(|\\\[|\\begin\{.*?})/)) 
          {
            window.MathJax = {
              tex: {
                // inlineMath: {'[+]': [['$', '$'], ['\\(', '\\)']]}
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                macros: mathjax_macro,
              },
              
            };
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            document.head.appendChild(script);
          }
        }, 50);

        // label it off
        mathjax.setAttribute("toggle", "off");

        // observer is used only once
        observer.disconnect();
      }
    });

    observer.observe(targetNode, config);
}