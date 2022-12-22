module Main exposing (..)

import Browser.Navigation as Nav
import Url
import Url.Builder
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)

import Article
import Article.Slug as Slug
import Page.Article
import Route exposing (Route)
import Session exposing (Session, Session(..), navKey)

import Underconstruction
import Debug

type Model 
    = Underconstruction Underconstruction.Model
    | Home Session
    | NotFound Session
    | Article Article.Model
    | PageArticle Page.Article.Model

getSession : Model -> Session
getSession model =
    case model of 
        Home s -> s

        NotFound s -> s

        Article article -> Article.getSession article

        Underconstruction ud -> Underconstruction.getSession ud

        PageArticle page -> Page.Article.getSession page

type Msg
    = GotConstruction Underconstruction.Msg
    | UrlChanged Url.Url
    | LinkClicked Browser.UrlRequest
    | GotArticle Article.Msg
    | GotPageArticle Page.Article.Msg



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
    Debug.log "route" (routeTo (Route.fromUrl url) (Home (Session key)))
    -- routeTo (Just <| Route.Article <| Slug.Slug "test.txt") (Home (Session key))
    -- let (model, msg) = Article.init "/articles/test.txt"
    -- in (Article model, Cmd.map GotArticle msg)
    -- let (model, msg) = Underconstruction.init ()
    -- in (Underconstruction model, Cmd.map GotConstruction msg)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case (msg, model) of
        (GotConstruction gcMsg, Underconstruction gcModel) -> 
            let (nm, nmsg) = Underconstruction.update gcMsg gcModel 
            in (Underconstruction nm, Cmd.map GotConstruction nmsg)

        (_, Home _) -> (model, Cmd.none)

        (UrlChanged url, _) -> 
            routeTo (Route.fromUrl url) model

        (LinkClicked req, _) -> 
            case req of 
                Browser.Internal url ->
                    ( model, Nav.pushUrl (navKey (getSession model)) (Url.toString url))

                Browser.External href ->
                    ( model, Nav.load href)

        (GotArticle aMsg, Article aModel) -> 
            let
                (newModel, newMsg) = Article.update aMsg aModel
            in
                (Article newModel, Cmd.map GotArticle newMsg)

        (GotPageArticle pMsg, PageArticle pModel) ->
            let
                (newModel, newMsg) = Page.Article.update pMsg pModel
            in
                (PageArticle newModel, Cmd.map GotPageArticle newMsg)
            

        _ -> (model, Cmd.none)

view : Model -> Browser.Document Msg
view model =
    case model of
        Underconstruction ud -> 
            { title = "coming soon ..."
            , body = 
                List.map (Html.map GotConstruction) [ Underconstruction.view ud ]
            }

        Home _ -> 
            { title = "home"
            , body = [ viewLink "/articles/test.txt" ]
            }

        NotFound _ ->
            { title = "notfound"
            , body = [ text "where is here" ]}

        Article article ->
            { title = "article"
            , body = [ Html.map GotArticle <| Article.view article ]}

        PageArticle page ->
            { title = "article page"
            , body = [ Html.map GotPageArticle <| Page.Article.view page]}


viewLink : String -> Html msg
viewLink path =
  li [] [ a [ href path ] [ text path ] ]


routeTo : Maybe Route -> Model -> ( Model, Cmd Msg )
routeTo maybeRoute model =
    let
        session = getSession model
    in
    case maybeRoute of
        Nothing -> ( NotFound session , Cmd.none )

        Just Route.Home -> ( Home session, Cmd.none )

        Just (Route.Article s) -> 
            let 
                (newModel, msg) = 
                    (Url.Builder.absolute ["articles", Slug.toUrl s] [])
                        |> Article.init session
            in 
                ( Article newModel, Cmd.map GotArticle msg )

        Just Route.PageArticle ->
            let
                (newModel, msg) =
                    Page.Article.init (getSession model)
            in
                ( PageArticle newModel, Cmd.map GotPageArticle msg )

