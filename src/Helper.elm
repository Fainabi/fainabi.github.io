module Helper exposing (..)

import Html exposing (..)
import Html.Events exposing (onClick)
import Article.Body exposing (..)
import Browser
import Url.Builder
import Article.SideNav



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
    | TestArticle Article.Body.Model Article.SideNav.Model
    | ParsedOver Article.Body.Model Article.SideNav.Model

type Msg 
    = GetTestArticle
    | GotTestArticle Article.Body.Msg
    | GotSideNavigator Article.SideNav.Msg

init : () -> ( Model, Cmd Msg )
init _ = ( Empty, Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case (msg, model) of
        (GetTestArticle, _) -> 
            let (m, msg_a) = Article.Body.init (Url.Builder.absolute ["articles", "test.md"] [])
            in (TestArticle m (Article.SideNav.init m), Cmd.map GotTestArticle msg_a)

        (GotTestArticle aMsg, TestArticle aModel sModel) ->
            let (m, msg_a) = Article.Body.update aMsg aModel
                
                (newS, _) = 
                    Article.SideNav.update (Article.SideNav.Reload m) sModel
            in (ParsedOver m newS, Cmd.none)

        (GotSideNavigator sMsg, ParsedOver aModel sModel) ->
            let (m, _) = Article.SideNav.update sMsg sModel
            in (ParsedOver aModel m, Cmd.none)

        _ -> (Clicked, Cmd.none)


view : Model -> Html Msg
view model =
    case model of
        Empty -> div [] 
            [ button [ onClick GetTestArticle ] [ text "Get Test Markdown" ]]

        TestArticle article _ -> 
            div [] 
                [ Html.map GotTestArticle (Article.Body.view article) ]
        
        Clicked -> div [] [text "clicked"]
    
        ParsedOver article sidenav -> 
            div [] 
                [ Html.map GotTestArticle (Article.Body.view article) 
                , text "over\n"
                , text "the side navigator is:\n"
                , Html.map GotSideNavigator (Article.SideNav.view sidenav)
                , text "\n from \n"
                , text <| Debug.toString sidenav]
    

