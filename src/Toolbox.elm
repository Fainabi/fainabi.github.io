port module Toolbox exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Data.Theme exposing (..)

-- Ports
port scrollToTop : () -> Cmd msg

-- MODEL
type alias Model =
    { expanded : Bool
    , theme : Theme
    }

init : Model
init =
    { expanded = False
    , theme = Light
    }

-- UPDATE
type Msg
    = ToggleExpand
    | SetTheme Theme
    | LoadLocalTheme String
    | GoToTop
    | ShowPath

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ToggleExpand ->
            ( { model | expanded = not model.expanded }, Cmd.none )

        SetTheme theme ->
            let
                newTheme = if theme == Light then Light else Dark
            in
            ( { model | theme = newTheme }, changeTheme (themeString newTheme) )

        LoadLocalTheme str ->
            let
                theme = if str == "Dark" then Dark else Light
            in
                ({ model | theme = theme }, Cmd.none)

        GoToTop ->
            ( model, scrollToTop () )

        ShowPath ->
            ( model, Cmd.none )

-- SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions _ =
    loadLocalTheme LoadLocalTheme
    

-- VIEW
view : Model -> Html Msg
view model =
    div [ class "toolbox-wrapper" ]
        [ div [ class "toolbox" ]
            [ div [ class "toolbox-item top", onClick GoToTop ]
                [ text "↑" ]
            , div [ class "toolbox-item path", onClick ShowPath ]
                [ text "→" ]
            , div [ class "toolbox-item theme", onClick (SetTheme <| toggleTheme model.theme) ]
                [ text (if model.theme == Dark then "🌙" else "☀") ]
            ]
        ]
