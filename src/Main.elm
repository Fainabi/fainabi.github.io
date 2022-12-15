module Main exposing (..)

import Html exposing (..)
-- import Utils
import Task
import Time
import Utils exposing (slack_off_time)
import Browser


main = 
    Browser.element
        {   init = init
        ,   update = update
        ,   view = view
        ,   subscriptions = \_ -> Sub.none
        }

type Model 
    = Plan
    | PlanWithTime { time : Time.Posix }

init : () -> (Model, Cmd Msg)
init _ = 
    (   Plan
    ,   Task.perform GetTime Time.now
    )

type Msg
    = GetTime Time.Posix


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        GetTime time -> (PlanWithTime { time = time }, Cmd.none)


view : Model -> Html Msg
view model =
    div []
        [ div [] [ text "Coming soon ..." ]
        , ul []
            [ li [] [ text "blogs" ]
            , li [] [ text "explorable maps and movable avatars" ]
            , li [] [ text "light and dark thems" ]
            , li [] [ text "others"]
            ]
        , div [] [ 
            case model of 
                PlanWithTime t -> text ("the blogger has been slacking off for " ++ slack_off_time t.time)
                Plan -> text ""
            ]
        ]


