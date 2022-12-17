module Article.Section exposing (..)

import Html exposing (..)
import Browser exposing (..)


type Section = Section Int String

type FoldableSection = FoldableSection Section (List Section)


numberOfSharp : List Char -> Int
numberOfSharp s =
    case s of
        [] -> 0
        c::cs -> 
            if c == '#'
            then 1 + numberOfSharp cs
            else 0

extractSections : String -> List Section
extractSections article =
    let
        rows = String.lines article
        chapters = List.filter (String.startsWith "#") rows
        
    in
        List.map (\x -> 
            let
                len = numberOfSharp (String.toList x)
                restTitle = x |> String.dropLeft len |> String.trim
            in Section len restTitle) chapters


toMsg : Section -> Html msg
toMsg s =
    case s of
        Section h content -> (String.fromInt h) ++ ", " ++ content |> text

toMsgAll : List Section -> Html msg
toMsgAll ls =    
    ul [] (List.map (\x -> li [] [toMsg x]) ls)

    

