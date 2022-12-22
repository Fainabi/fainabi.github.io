module Blog.Body exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Http
import Markdown

import Blog.Utils exposing (..)
import Blog.Attribute exposing (ArticleAttribute)

import Debug

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
    = GetArticle (Result Http.Error String)
    | Finished

init : String -> ( Model, Cmd Msg )
init url = 
    ( Loading
    , Http.get 
        { url = url
        , expect = Http.expectString GetArticle} )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetArticle result, Loading) ->   
            case result of
                Err e -> ( Failure e, Cmd.none )

                Ok req -> 
                    ( Article
                        { title = titleOf req "No Title"
                        , content = req
                        , parsed = Markdown.toHtml [class "article"] req
                        , attributes = []}
                    , Cmd.none )

        (Finished, _) ->
            ( model, Cmd.none)

        _ -> (Unknown, Cmd.none)

view : Model -> Html Msg
view model =
    case model of
        Article article -> div [] 
            [ article.parsed ]

        Loading  -> div [] []

        Failure err -> div [] [ text "Error Occured: ", text (Debug.toString err) ]

        Unknown -> div [] [ text "Unknown error" ]
