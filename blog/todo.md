# Hello from `fainabi.github.io`

When you gaze into the blogs, they become shy.

## TODO

- side navigator reflecting process of reading (done)
- cheaper DOM handling
- scripts for replacing math formula with rendered static images in markdown source file
- blog path tree for navigation

### Side Navigator

The side navigator provides links to different section of a blog article.
In our Elm implementation here, we design an one-page website, which roots
at `index.html`, and route to subcomponent. Since hash-mode is performed,
we could not directly add `#sec-name` to jump to different section.
Instead, using DOM to find section with specific id, and then setting view on it
solves the problem. 

### Cheaper DOM Handling

Elm has library for parsing markdown content like `String -> Html msg`.
And now the way to extract sections is reanalyze the content and finding lines start with several `#`. Such parsing twice is a little time consuming, and if we
could build a function that `Html msg -> List Section`, which shall be more elegant, though maybe with the same time complexity.

Or maybe compile to html first, then we could minimize the computing time.

### Scripts for Replacing Math Formula

Mathematical formula and equations are normal in blogs, the best way now I know
is that to compile these formula and set it with a `<img />` label. Wikipedia does this, and some of the symbols just using the symbol set characters, since some equations are simple.

### Blog Path Tree For navigtaion

Every time when I will write over a new blog, I'd like to just throw it into one
category, and it should be capable to detect new blog in. 
However, the index to these blogs is essential, to tell the browser which blogs are accessable. In a client-server model, the server handles requests and send back according to a database.
For gitpages, we could set a file to store the index, taking the place of database. That's what `scan.hs` does.