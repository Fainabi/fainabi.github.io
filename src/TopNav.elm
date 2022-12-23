module TopNav exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)

type Theme
    = Light
    | Dark
    | OS

type alias Model =
    { theme : Theme }

init : () -> Model
init _ = Model OS


type Msg
    = ChangeTheme Theme

update : Msg -> Model -> Model
update msg model =
    case msg of
        ChangeTheme theme -> { model | theme = theme }


view : Model -> Html Msg
view model =
    div [class "topnav"] 
        [ div [] 
            [a [href "/#/"] [ text "home" ]]
        , div []
            []
        , div []
            [a [href "/#/blog"] [ text "blog"]]]
    
