module Blog.Utils exposing (..)

import Debug

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
            


