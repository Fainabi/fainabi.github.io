module Main exposing (..)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url
import Url.Builder

import Blog
import Page.Blog
import Route exposing (Route)
import Session exposing (Session, Session(..), navKey)

import Debug

type Model 
    = Home Session
    | NotFound Session
    | Blog Blog.Model
    | PageBlog Page.Blog.Model

getSession : Model -> Session
getSession model =
    case model of 
        Home s -> s

        NotFound s -> s

        Blog blog -> Blog.getSession blog

        PageBlog page -> Page.Blog.getSession page

type Msg
    = UrlChanged Url.Url
    | LinkClicked Browser.UrlRequest
    | GotBlog Blog.Msg
    | GotPageBlog Page.Blog.Msg



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
init _ url key =
    (routeTo (Route.fromUrl url) (Home (Session key)))

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case (msg, model) of
        (UrlChanged url, _) -> 
            (routeTo (Route.fromUrl url) model)

        (LinkClicked req, _) -> 
            case req of 
                Browser.Internal url -> Debug.log "internal"
                    ( model, Nav.pushUrl (navKey (getSession model)) (Url.toString url))

                Browser.External href -> Debug.log "external"
                    ( model, Nav.load href)

        (GotBlog aMsg, Blog aModel) -> 
            let
                (newModel, newMsg) = Blog.update aMsg aModel
            in
                (Blog newModel, Cmd.map GotBlog newMsg)

        (GotPageBlog pMsg, PageBlog pModel) ->
            let
                (newModel, newMsg) = Page.Blog.update pMsg pModel
            in
                (PageBlog newModel, Cmd.map GotPageBlog newMsg)
            
        _ -> (model, Cmd.none)

view : Model -> Browser.Document Msg
view model =
    case model of
        Home _ -> 
            { title = "home"
            , body = [ viewLink <| Route.Blog [] ]
            }

        NotFound _ ->
            { title = "notfound"
            , body = [ text "where is here" ]}

        Blog blog ->
            { title = Blog.titleOf blog |> Maybe.withDefault "no title"
            , body = [ Html.map GotBlog <| Blog.view blog ]}

        PageBlog page ->
            { title = "Blog page"
            , body = [ Html.map GotPageBlog <| Page.Blog.view page]}


viewLink : Route -> Html msg
viewLink path =
   a [ Route.href path ] [ text (Route.toString path) ]


routeTo : Maybe Route -> Model -> ( Model, Cmd Msg )
routeTo maybeRoute model =
    let
        session = getSession model
    in
    case maybeRoute of
        Nothing -> ( NotFound session , Cmd.none )

        Just Route.Home -> ( Home session, Cmd.none )

        Just (Route.Blog blog) ->
            let
                url = Url.Builder.absolute ("blog"::blog) [] |> Debug.log "url is"
            in
                if String.endsWith ".md" url
                then 
                    let (newModel, msg) = Blog.init session url
                    in ( Blog newModel, Cmd.map GotBlog msg )
                else
                    let
                        (newModel, msg) = Page.Blog.initWithPath blog session 
                    in
                        ( PageBlog newModel, Cmd.map GotPageBlog msg )

