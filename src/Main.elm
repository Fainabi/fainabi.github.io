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
import Toolbox

port loadMathJax : () -> Cmd msg

-- The model contains a main html page and the top navigator bar
type alias Model =
    { page : Page.Model
    , topnav : TopNav.Model
    , toolbox : Toolbox.Model
    }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    let 
        (page, msg) = Page.init url key
        (topnav) = TopNav.init ()
        (toolbox) = Toolbox.init
    in
        (Model page topnav toolbox, Cmd.batch [Cmd.map GotPage msg])

type Msg
    = GotPage Page.Msg
    | GotTopNav TopNav.Msg
    | GotToolbox Toolbox.Msg
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
                -- The `loadMathJax` is used to load mathjax for rendering
                ( { model | page = newPage }, Cmd.batch [Cmd.map GotPage newMsg, loadMathJax ()])

        GotTopNav navMsg ->
            let
                (newNav, newMsg) = TopNav.update navMsg model.topnav
                (newToolbox, _) = Toolbox.update (Toolbox.SetTheme newNav.theme) model.toolbox
            in
                ( { model | topnav = newNav, toolbox = newToolbox}, Cmd.map GotTopNav newMsg )

        GotToolbox toolboxMsg ->
            let
                (newToolbox, newMsg) = Toolbox.update toolboxMsg model.toolbox
                (newNav, _) = TopNav.update (TopNav.SetTheme newToolbox.theme) model.topnav
            in
                ( { model | toolbox = newToolbox, topnav = newNav }, Cmd.map GotToolbox newMsg )

view : Model -> Browser.Document Msg
view model =
    let
        dmsg = Page.view model.page
        pageContent = List.map (Html.map GotPage) dmsg.body
        toolboxContent = [Html.map GotToolbox (Toolbox.view model.toolbox)]
    in
        { title = dmsg.title
        , body = 
            [ Html.map GotTopNav (TopNav.view model.topnav) ]
            ++ pageContent
            ++ toolboxContent
        }



subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch 
        [ Sub.map GotTopNav (TopNav.subscriptions model.topnav)
        , Sub.map GotToolbox (Toolbox.subscriptions model.toolbox)
        ]


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



