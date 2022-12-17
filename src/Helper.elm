module Helper exposing (..)

import Html exposing (..)
import Html.Events exposing (onClick)
import Article.Body exposing (..)
import Browser
import Url.Builder


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }

type Model
    = Empty
    | Clicked
    | TestArticle Article.Body.Model
    | ParsedOver Article.Body.Model

type Msg 
    = GetTestArticle
    | GotTestArticle Article.Body.Msg

init : () -> ( Model, Cmd Msg )
init _ = ( Empty, Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetTestArticle, _) -> 
            let (m, msg_a) = Article.Body.init (Url.Builder.absolute ["articles", "test.md"] [])
            in (TestArticle m, Cmd.map GotTestArticle msg_a)

        (GotTestArticle aMsg, TestArticle aModel) ->
            let (m, msg_a) = Article.Body.update aMsg aModel
            in (ParsedOver m, Cmd.map GotTestArticle msg_a)

        _ -> (Clicked, Cmd.none)


view : Model -> Html Msg
view model =
    case model of
        Empty -> div [] 
            [ button [ onClick GetTestArticle ] [ text "Get Test Markdown" ]]

        TestArticle article -> 
            div [] 
                [ Html.map GotTestArticle (Article.Body.view article) ]
        
        Clicked -> div [] [text "clicked"]
    
        ParsedOver article -> 
            div [] 
                [ Html.map GotTestArticle (Article.Body.view article) 
                , text "over"]
    

