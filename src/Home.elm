module Home exposing (..)


import Html exposing (..)
import Html.Attributes exposing (..)



type alias Model =
    { }

init : () -> Model
init _ = Model

type Msg
    = Finished

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        _ -> ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div [] []

