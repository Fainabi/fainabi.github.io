# Building a Personal Blog with Elm

In this post, I'll share how I built this blog using Elm and modern web technologies. We'll explore the architecture, design decisions, and key features.

## Architecture Overview

The blog is built using:
- Elm for the frontend
- Markdown for content
- JSON for content organization
- CSS for styling

## Key Features

1. **Routing**: Using Elm's URL parser for clean URLs
2. **Theme Support**: Light and dark mode with system preference detection
3. **Markdown Rendering**: Converting markdown files to HTML
4. **Category Organization**: Hierarchical content structure

## Implementation Details

### Routing
```elm
type Route
    = Home
    | Blog (List String)

routeParser : Parser (Route -> a) a
routeParser =
    oneOf
        [ Parser.map Home Parser.top
        , Parser.map Blog (s "blog" </> list string)
        ]
```

### Theme Support
```elm
type Theme
    = Light
    | Dark
    | OS

port changeTheme : String -> Cmd msg
port loadLocalTheme : (String -> msg) -> Sub msg
```

### Content Organization
```json
{
    "name": "root",
    "dir": [
        {
            "name": "category",
            "dir": [
                {
                    "name": "post.md",
                    "dir": []
                }
            ]
        }
    ]
}
```

## Design Decisions

1. **Why Elm?**
   - Type safety
   - Predictable state management
   - Great developer experience

2. **Content Structure**
   - Markdown for easy writing
   - JSON for flexible organization
   - Hierarchical categories

3. **Styling**
   - CSS variables for theming
   - Responsive design
   - Clean, minimal aesthetic

## Future Improvements

1. Add search functionality
2. Implement tags and filtering
3. Add comments section
4. Improve performance with lazy loading

Stay tuned for more posts about Elm development! 