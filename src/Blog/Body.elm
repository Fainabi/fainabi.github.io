module Blog.Body exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Http
import Markdown.Option exposing (..)
import Markdown.Render exposing (MarkdownMsg(..), MarkdownOutput(..))

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
    | MarkdownMsg Markdown.Render.MarkdownMsg
    | Finished

init : String -> ( Model, Cmd Msg )
init url = 
    ( Loading
    , Http.get 
        { url = url
        , expect = Http.expectString GetArticle} )


-- markDownOption : Markdown.Options
-- markDownOption = 
--     { githubFlavored = Just { tables = False, breaks = False }
--     , defaultHighlighting = Nothing
--     , sanitize = False
--     , smartypants = False
--     }

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetArticle result, Loading) ->   
            case result of
                Err e -> ( Failure e, Cmd.none )

                Ok req -> 
                    let
                        (tags, content) = splitTagsInMarkdown req
                        _ = Debug.log "tags" tags
                    in
                        ( Article
                            { title = titleOf content "No Title"
                            , content = content
                            -- , parsed = Markdown.toHtmlWith markDownOption [class "article"] content
                            , parsed = Html.div [] []
                            , attributes = []}
                        , Cmd.none )

        (Finished, _) ->
            ( model, Cmd.none)

        _ -> (Unknown, Cmd.none)

view : Model -> Html Msg
view model =
    case model of
        Article article -> 
            Html.div [] 
                [ Markdown.Render.toHtml Markdown.Option.Standard article.content |> Html.map MarkdownMsg ]

        Loading  -> div [] []

        Failure err -> div [] [ text "Error Occurred: ", text (Debug.toString err) ]

        Unknown -> div [] [ text "Unknown error" ]
