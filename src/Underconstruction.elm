module Underconstruction exposing (..)

import Html exposing (..)
import Task
import Time
import Utils exposing (slack_off_time)
import Helper
import Browser
import Session exposing (Session)
import Browser.Navigation as Nav

-- main : Program () Model Msg
-- main =
--     Browser.element
--         { init = init
--         , view = view
--         , update = update
--         , subscriptions = \_ -> Sub.none
--         }

type Model 
    = Plan Session
    | PlanWithTime Time.Posix Helper.Model Session

getSession : Model -> Session
getSession model =
    case model of
        Plan s -> s

        PlanWithTime _ _ s -> s

init : Session -> (Model, Cmd Msg)
init session = 
    (   Plan session
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
            in (PlanWithTime time hMdl (getSession model), Cmd.map GotHelper hMsg)

        (GotHelper helperMsg, PlanWithTime time helper s) ->
            let (newHelper, newMsg) = Helper.update helperMsg helper
            in (PlanWithTime time newHelper s, Cmd.map GotHelper newMsg)
    
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
                PlanWithTime t helper _ -> 
                    div [] 
                    [ text ("the blogger has been slacking off for " ++ slack_off_time t)
                    , Html.map GotHelper (Helper.view helper)]

                Plan _ -> text ""
            ]
        ]


