module Underconstruction exposing (..)

import Html exposing (..)
import Task
import Time
import Utils exposing (slack_off_time)
import Helper
import Browser

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }

type Model 
    = Plan
    | PlanWithTime Time.Posix Helper.Model

init : () -> (Model, Cmd Msg)
init _ = 
    (   Plan
    ,   Task.perform GetTime Time.now
    )

type Msg
    = GetTime Time.Posix
    | GotHelper Helper.Msg


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case (msg, model) of
        (GetTime time, _) -> 
            let (hMdl, hMsg) = (Helper.init ())
            in (PlanWithTime time hMdl, Cmd.map GotHelper hMsg)

        (GotHelper helperMsg, PlanWithTime time helper) ->
            let (newHelper, newMsg) = Helper.update helperMsg helper
            in (PlanWithTime time newHelper, Cmd.map GotHelper newMsg)
    
        _ -> (model, Cmd.none)


view : Model -> Html Msg
view model =
    div []
        [ div [] [ text "Coming soon ..." ]
        , ul []
            [ li [] [ text "blogs" ]
            , li [] [ text "explorable maps and movable avatars" ]
            , li [] [ text "light and dark themes" ]
            , li [] [ text "others"]
            ]
        , div [] [ 
            case model of 
                PlanWithTime t helper -> 
                    div [] 
                    [ text ("the blogger has been slacking off for " ++ slack_off_time t)
                    , Html.map GotHelper (Helper.view helper)]

                Plan -> text ""
            ]
        ]


