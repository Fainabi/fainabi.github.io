module Article.Body exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Http
import Debug
import Markdown

import Article.Utils exposing (..)
import Article.Attribute as ArticleAttr exposing (ArticleAttribute)
import Article.Section exposing (Section)


type Model 
    = Loading String
    | Failure Http.Error
    | Unknown
    | Article 
        { title : String
        , content : String
        , parsed : Html Msg
        , attributes : List ArticleAttribute
        }

type Msg
    = GetArticle (Result Http.Error String)
    | Finished

init : String -> ( Model, Cmd Msg )
init url = 
    ( Loading url
    , Http.get 
        { url = url
        , expect = Http.expectString GetArticle} )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetArticle result, Loading url) ->   
            case result of
                Err e -> ( Failure e, Cmd.none )

                Ok req -> 
                    ( Article
                        { title = titleOf req "No Title"
                        , content = req
                        , parsed = Markdown.toHtml [class "article"] req
                        , attributes = 
                            [ArticleAttr.Url url]}
                    , Cmd.none )

        (Finished, _) ->
            ( model, Cmd.none)

        _ -> (Unknown, Cmd.none)

view : Model -> Html Msg
view model =
    case model of
        Article article -> div [] 
            [ article.parsed ]

        Loading url -> text <| "now loading from " ++ url

        Failure err -> div [] [ text "Error Occured: ", text (Debug.toString err) ]

        Unknown -> div [] [ text "Unknown error" ]
