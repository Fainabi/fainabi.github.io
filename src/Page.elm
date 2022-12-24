module Page exposing (..)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url
import Url.Builder

import Blog
import Home
import Page.Blog
import Route exposing (Route)
import Session exposing (Session, Session(..), navKey)

import Debug

type Model 
    = Home Home.Model
    | NotFound Session
    | Blog Blog.Model
    | PageBlog Page.Blog.Model

getSession : Model -> Session
getSession model =
    case model of 
        Home home -> Home.getSession home

        NotFound s -> s

        Blog blog -> Blog.getSession blog

        PageBlog page -> Page.Blog.getSession page


type Msg
    -- = UrlChanged Url.Url
    -- | LinkClicked Browser.UrlRequest
    = GotBlog Blog.Msg
    | GotPageBlog Page.Blog.Msg
    | GotHome Home.Msg



-- main : Program () Model Msg
-- main =
--     Browser.application
--         { init = init
--         , view = view
--         , update = update
--         , subscriptions = \_ -> Sub.none
--         , onUrlChange = UrlChanged
--         , onUrlRequest = LinkClicked
--         }


init : Url.Url -> Nav.Key -> (Model, Cmd Msg)
init url key =
    (routeTo (Route.fromUrl url) (Home <| Home.init (Session key)))

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case (msg, model) of

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
        Home home -> 
            { title = "home"
            , body = [ Html.map GotHome (Home.view home) ]
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


routeTo : Maybe Route -> Model -> ( Model, Cmd Msg )
routeTo maybeRoute model =
    let
        session = getSession model
    in
    case maybeRoute of
        Nothing -> ( NotFound session , Cmd.none )

        Just Route.Home -> ( Home <| Home.init session, Cmd.none )

        Just (Route.Blog blog) ->
            let
                url = Url.Builder.absolute ("blog"::blog) [] |> Debug.log "url"
            in
                if String.endsWith ".md" url
                then 
                    let (newModel, msg) = Blog.init session url
                    in ( Blog newModel, Cmd.map GotBlog msg )
                else
                    case model of
                        PageBlog page -> 
                            let
                                newModel = { page | path = blog }
                            in
                                ( PageBlog newModel, Cmd.none)

                        _ ->
                            let
                                (newModel, msg) = Page.Blog.initWithPath blog session 
                            in
                                ( PageBlog newModel, Cmd.map GotPageBlog msg )

