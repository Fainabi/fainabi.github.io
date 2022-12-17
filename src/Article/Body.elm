module Article.Body exposing (..)

import Article.Attribute exposing (ArticleAttribute)
import Article.Section exposing (Section)
import Html exposing (..)
import Html.Attributes exposing (class)
import Http
import Article.Utils exposing (..)
import Markdown


type Model 
    = Loading
    | Failure Http.Error
    | Unknown
    | Article 
        { title : String
        , content : String
        , parsed : Html Msg
        , attributes : List ArticleAttribute
        }

type Msg
    = Top
    | ToSection Section
    | ToPos
    | GetArticle (Result Http.Error String)

init : String -> ( Model, Cmd Msg )
init url = 
    ( Loading
    , Http.get 
        { url = url
        , expect = Http.expectString GetArticle} )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetArticle result, _) ->   
            case result of
                Err e -> ( Failure e, Cmd.none )

                Ok req -> 
                    ( Article
                        { title = titleOf req "No Title"
                        , content = req
                        , parsed = Markdown.toHtml [class "article"] req
                        , attributes = []}, Cmd.none )

        _ -> (Unknown, Cmd.none)

view : Model -> Html Msg
view model =
    case model of
        Article article -> div [] 
            [ text "parsed Markdown is: "
            , article.parsed
            , text "origin: "
            , pre [] [ text article.content ]
            ]

        Loading -> text "now loading"

        Failure err -> div [] [ text "Error Occured", text (Debug.toString err) ]

        Unknown -> div [] [ text "Unknown error" ]
