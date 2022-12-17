module Main exposing (..)

import Underconstruction
import Browser.Navigation as Nav
import Url
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)


type Model 
    = Underconstruction Underconstruction.Model
    | Home

type Msg
    = GotConstruction Underconstruction.Msg
    | UrlChanged Url.Url
    | LinkClicked Browser.UrlRequest



main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }


init : () -> Url.Url -> Nav.Key -> (Model, Cmd Msg)
init flags url key =
    let (model, msg) = Underconstruction.init ()
    in (Underconstruction model, Cmd.map GotConstruction msg)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case (msg, model) of
        (GotConstruction gcMsg, Underconstruction gcModel) -> 
            let (nm, nmsg) = Underconstruction.update gcMsg gcModel 
            in (Underconstruction nm, Cmd.map GotConstruction nmsg)

        (_, Home) -> (Home, Cmd.none)

        (UrlChanged _, _) -> (Home, Cmd.none)

        (LinkClicked _, _) -> (Home, Cmd.none)

view : Model -> Browser.Document Msg
view model =
    case model of
        Underconstruction ud -> 
            { title = "coming soon ..."
            , body = 
                List.map (Html.map GotConstruction) [ Underconstruction.view ud ]
            }

        Home -> 
            { title = "home"
            , body = []
            }


viewLink : String -> Html msg
viewLink path =
  li [] [ a [ href path ] [ text path ] ]

