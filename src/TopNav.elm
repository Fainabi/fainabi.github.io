module TopNav exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)

import Data.Theme exposing (..)



type alias Model =
    { theme : Theme }

init : () -> Model
init _ = Model Light


type Msg
    = SetTheme Theme
    | LoadLocalTheme String

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetTheme theme -> 
            ({ model | theme = theme }, changeTheme (themeString theme))
        
        LoadLocalTheme str ->
            let
                theme = if str == "Dark" then Dark else Light
            in
                ({ model | theme = theme }, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    loadLocalTheme LoadLocalTheme
                

view : Model -> Html Msg
view model =
    let
        (logo, theme) = case model.theme of 
            Light -> ("assets/logo.svg", "assets/sun.svg")
            _ -> ("assets/logo-dark.svg", "assets/moon.svg")
        
    in
        nav [class "topnav"] 
            [ div [class "topnav-content"] [
                div [class "container"] 
                    [ div [class "topnav-home"] 
                        [ a [href "/#/"] [ 
                            div [class "container"] [
                                img [id "home-logo", src logo] [text "Home"]]]
                        , a [href "/#/blog"] [ text "Blog"]]
                    , div [class "topnav-main"]
                        [button [ onClick (SetTheme (toggleTheme model.theme)) ] [
                            span [class "container"] [
                                img [src theme] [text "Theme"]]]]
                    ]]
            ]
    
