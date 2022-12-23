module Main exposing (..)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url

import Page
import Route
import Session exposing (navKey)
import TopNav



type alias Model =
    { page : Page.Model
    , topnav : TopNav.Model
    }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    let 
        (page, msg) = Page.init url key
        (topnav) = TopNav.init ()
    in
        (Model page topnav, Cmd.map GotPage msg)

type Msg
    = GotPage Page.Msg
    | GotTopNav TopNav.Msg
    | UrlChanged Url.Url
    | LinkClicked Browser.UrlRequest


update : Msg -> Model ->  ( Model, Cmd Msg )
update msg model =
    case msg of
        UrlChanged url ->
            let
                (newPage, newMsg) = (Page.routeTo (Route.fromUrl url) model.page)
            in
                ({model | page = newPage}, Cmd.map GotPage newMsg)

        LinkClicked req -> 
            case req of 
                Browser.Internal url ->
                    ( model, Nav.pushUrl (navKey (Page.getSession model.page)) (Url.toString url))

                Browser.External href ->
                    ( model, Nav.load href)

        GotPage pageMsg ->
            let
                (newPage, newMsg) = Page.update pageMsg model.page
            in
                ( { model | page = newPage }, Cmd.map GotPage newMsg )

        GotTopNav navMsg ->
            let
                newNav = TopNav.update navMsg model.topnav
            in
                ( { model | topnav = newNav}, Cmd.none )

view : Model -> Browser.Document Msg
view model =
    let
        dmsg = Page.view model.page
    in
        { title = dmsg.title
        , body = 
                Html.map GotTopNav (TopNav.view model.topnav)
                    :: (List.map (Html.map GotPage) dmsg.body)
        }


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
