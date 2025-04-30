module Blog.NavIdx exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)

import Route
import Utils exposing (scanList)

getIdx : String -> List String
getIdx =
    String.split "/"
        >> List.filter (String.isEmpty >> not)
        

view : String -> Html msg
view model =
    let 
        ls = getIdx model
        lsAcc = 
            List.map 
                (\x -> (List.drop 1 x))
                (scanList (\acc x -> acc ++ [x]) [] ls)

        lsLen = List.length ls

        idxToClass idx = if idx + 1 == lsLen then "navidx-end" else "navidx-path"
    in
        nav [class "navidx"]
            [ol [] 
                (List.map2
                    (\(idx, s) url -> li [] [
                        a [Route.href (Route.Blog url), class (idxToClass idx)] [
                            span [] [text s]]]) 
                    (List.indexedMap Tuple.pair ls) lsAcc)]

