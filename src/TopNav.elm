port module TopNav exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)


port changeTheme : String -> Cmd msg
port loadLocalTheme : (String -> msg) -> Sub msg

type Theme
    = Light
    | Dark
    | OS

themeString : Theme -> String
themeString theme =
    case theme of 
        Light -> "Light"
        Dark -> "Dark"
        OS -> "OS"

type alias Model =
    { theme : Theme }

init : () -> Model
init _ = Model OS


type Msg
    = ChangeTheme Theme
    | LoadLocalTheme String

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ChangeTheme theme -> 
            let
               nextTheme = if theme == Light then Dark else Light 
            in ({ model | theme = nextTheme }, changeTheme (themeString nextTheme))
        
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
    nav [class "topnav"] 
        [ div [class "container"] 
            [ div [] 
                [a [href "/#/"] [ text "home" ]]
            , div []
                [ ul []
                    [ li [] [ button [ onClick (ChangeTheme model.theme) ] [text "theme"] ]
                    , li [] [a [href "/#/blog"] [ text "blog"]]
                    ]
                ]
            ]
        ]
    
