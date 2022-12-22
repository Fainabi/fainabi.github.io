module Article exposing (..)

import Browser.Dom as Dom
import Html exposing (..)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Http

import Article.Body as Body
import Article.SideNav as SideNav
import Session exposing (Session)

import Browser
import Task



type alias Model =
    { body : Body.Model
    , sidenav : SideNav.Model
    , session : Session
    , url : String}

-- MODEL

init : Session -> String -> ( Model, Cmd Msg )
init session url =
    let
        (body, bodyMsg) = Body.init url
    in
        ( Model body (SideNav.init body) session url
        , Cmd.map GotBody bodyMsg)

getSession : Model -> Session
getSession model = model.session

type Msg
    = LoadArticle String
    | GotBody Body.Msg
    | GotSideNav SideNav.Msg
    | Finished (Result Http.Error ())
    | NotFound

-- VIEW

view : Model -> Html Msg
view model =
    div [] 
        [ article [] 
            [ Html.map GotBody (Body.view model.body) ]
        , aside [class "toc"]
            [ Html.map GotSideNav (SideNav.view model.sidenav) ]
        ]
        
        


-- UPDATE

update : Msg -> Model ->  ( Model, Cmd Msg )
update msg model =
    case msg of
        GotBody bodyMsg ->
            case bodyMsg of
                Body.GetArticle _ ->
                    let
                        (newBody, newMsg) = Body.update bodyMsg model.body

                        (newNav, newNavMsg) = SideNav.update (SideNav.Reload newBody) model.sidenav
                    in
                        ( { model | body = newBody, sidenav = newNav }
                        , Cmd.batch [Cmd.map GotBody newMsg, Cmd.map GotSideNav newNavMsg] )
                
                _ ->
                    let
                        (newBody, newMsg) = Body.update bodyMsg model.body
                    in
                        (model, Cmd.map GotBody newMsg)
            

        GotSideNav navMsg ->
            let
                (_, newMsg) = SideNav.update navMsg model.sidenav
            in
                ( model
                , Cmd.map GotSideNav newMsg)


        _ ->
             ( model, Debug.log ("::" ++ Debug.toString msg) Cmd.none )




-- main : Program () Model Msg
-- main =
--     Browser.element
--         { init = \_ -> init  "/articles/test.txt"
--         , view = view
--         , update = update
--         , subscriptions = \_ -> Sub.none
--         }
