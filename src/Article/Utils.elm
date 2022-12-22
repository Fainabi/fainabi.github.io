module Article.Utils exposing (..)


titleOf : String -> String -> String
titleOf str defaultTitle =
    let maybeTitle = str |> 
            String.lines |> 
            List.filter (String.startsWith "#") |>
            List.head
    in
        case maybeTitle of
            Just t -> t

            Nothing -> defaultTitle


