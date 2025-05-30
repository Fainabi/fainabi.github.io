module Route exposing (..)

import Html exposing (Attribute)
import Html.Attributes as Attr
import Url exposing (Url)
import Url.Builder
import Url.Parser as Parser exposing (Parser, oneOf, s, (</>), string)


type Route
    = Home
    | Blog (List String)

routeParser : Parser (Route -> a) a
routeParser =
    oneOf
        [ Parser.map Home Parser.top
        , Parser.map (\e1 e2 e3 e4 e5 -> Blog [e1,e2,e3,e4,e5]) (s "blog" </> string </> string </> string </> string </> string)
        , Parser.map (\e1 e2 e3 e4 -> Blog [e1,e2,e3,e4]) (s "blog" </> string </> string </> string </> string)
        , Parser.map (\e1 e2 e3 -> Blog [e1,e2,e3]) (s "blog" </> string </> string </> string)
        , Parser.map (\e1 e2 -> Blog [e1,e2]) (s "blog" </> string </> string )
        , Parser.map (\e -> Blog [e]) (s "blog" </> string)
        , Parser.map (Blog []) (s "blog")
        ]



href : Route -> Attribute msg
href route =
    Attr.href (toString route)

fromUrl : Url -> Maybe Route
fromUrl url =
    let
        -- Extract the path from the fragment (after #)
        pathFromFragment = 
            case url.fragment of
                Just fragment ->
                    if String.startsWith "#" fragment then
                        String.dropLeft 1 fragment
                    else
                        fragment
                Nothing ->
                    url.path
    in
    Parser.parse routeParser
        { url | path = pathFromFragment }

toString : Route -> String
toString route =
    "/#" ++ Url.Builder.absolute (toPieces route) []

toPieces : Route -> List String
toPieces route =
    case route of
        Home -> []

        Blog urls -> "blog"::urls
