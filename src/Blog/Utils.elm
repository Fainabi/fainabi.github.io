module Blog.Utils exposing (titleOf, splitTagsInMarkdown)

titleOf : String -> String -> String
titleOf str defaultTitle =
    let maybeTitle = str |> 
            String.lines |> 
            List.filter (String.startsWith "#") |>
            List.head
    in
        case maybeTitle of
            Just t -> String.replace "#" "" t |> String.trim

            Nothing -> defaultTitle
            
-- The tags introduced by obsidian is a wrapped lists surrounded by hyphens
-- -----------------
-- tags:
--    - abc
-- -----------------
-- Assume that there is at most one block
splitTagsInMarkdown : String -> (String, String)
splitTagsInMarkdown content =
    let
        trimmed_content = String.trim content
    in
        if String.startsWith "---" trimmed_content 
        then 
            let
                lines = String.split "\n" trimmed_content
                dashed_count = List.length <| List.filter (String.startsWith "---") lines
            in
                if dashed_count >= 2
                then splitTagsInMarkdownLines "" (List.tail lines)  -- there is a block
                else ("", trimmed_content)  -- no block surrounded by hyphens
        else ("", trimmed_content)

splitTagsInMarkdownLines : String -> Maybe (List String) -> (String, String)
splitTagsInMarkdownLines tags rests =
    case rests of
        Nothing -> ("", tags)
        Just [] -> ("", tags)  -- should never occur
        Just (line :: rest_lines) -> 
            if String.startsWith "---" line
            then (tags, String.join "\n\r" rest_lines)
            else splitTagsInMarkdownLines (tags ++ "\n" ++ line) (Just rest_lines)
        
