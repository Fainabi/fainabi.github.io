port module Main exposing (..)

-- External packages
import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url

-- local packages
import Page
import Route
import Session exposing (navKey)
import TopNav

port loadMathJax : () -> Cmd msg

-- The model contains a main html page and the top navigator bar
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


update : Msg -> Model -> ( Model, Cmd Msg )
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
                ( { model | page = newPage }, Cmd.batch [Cmd.map GotPage newMsg, loadMathJax ()])

        GotTopNav navMsg ->
            let
                (newNav, newMsg) = TopNav.update navMsg model.topnav
            in
                ( { model | topnav = newNav}, Cmd.map GotTopNav newMsg )

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



subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch 
        [ Sub.map GotTopNav (TopNav.subscriptions model.topnav) ]


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }



