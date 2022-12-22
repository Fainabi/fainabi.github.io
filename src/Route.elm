module Route exposing (..)

import Browser.Navigation as Nav
import Html exposing (Attribute)
import Html.Attributes as Attr
import Url exposing (Url)
import Url.Parser as Parser exposing (Parser, oneOf, s, (</>))
import Page.Article

import Article.Slug as Slug exposing (Slug)

type Route
    = Home
    | Article Slug
    | PageArticle

routeParser : Parser (Route -> a) a
routeParser =
    oneOf
        [ Parser.map Home Parser.top
        , Parser.map Article (s "articles" </> Slug.urlParser)
        , Parser.map PageArticle (s "articl")]


-- href : Route -> Attribute msg

fromUrl : Url -> Maybe Route
fromUrl url =
    Parser.parse routeParser
        { url | path = Maybe.withDefault "" url.fragment, fragment = Nothing}


