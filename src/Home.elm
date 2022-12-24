module Home exposing (..)


import Html exposing (..)
import Html.Attributes exposing (..)

import Session exposing (Session)


type alias Model =
    { session : Session }

init : Session -> Model
init s = Model s

type Msg
    = Finished

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        _ -> ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div [class "container"] [text "sweet home"]



getSession : Model -> Session
getSession home = home.session
