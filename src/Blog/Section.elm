module Blog.Section exposing (..)

import Browser exposing (..)
import Html exposing (..)
import Regex

type alias Section = 
    { h : Int
    , name : String
    }


nameOf : Section -> String
nameOf sec = sec.name

nameToId : String -> String
nameToId =
    String.trim 
        >> String.toLower 
        >> Regex.replace 
            (Maybe.withDefault Regex.never <| Regex.fromString " +") (\_ -> "-")

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
    (String.fromInt s.h) ++ ", " ++ s.name |> text

toMsgAll : List Section -> Html msg
toMsgAll ls =    
    ul [] (List.map (\x -> li [] [toMsg x]) ls)

    

