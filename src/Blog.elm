module Blog exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, attribute)
import Http

import Blog.Body as Body
import Blog.NavIdx as NavIdx
import Blog.SideNav as SideNav
import Session exposing (Session)



type alias Model =
    { body : Body.Model
    , sidenav : SideNav.Model
    , session : Session
    , url : String}

-- MODEL

init : Session -> String -> ( Model, Cmd Msg )
init session url =
    let
        (body, bodyMsg) = Body.init url
    in
        ( Model body (SideNav.init body) session url
        , Cmd.map GotBody bodyMsg)

getSession : Model -> Session
getSession model = model.session

type Msg
    = Loading
    | GotBody Body.Msg
    | GotSideNav SideNav.Msg
    | Finished (Result Http.Error ())
    | NotFound

-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ NavIdx.view model.url
        , div [class "main-blog"] 
            [ article [class "blog-content"] 
                [ Html.map GotBody (Body.view model.body) ]
            , aside [class "toc"]
                [ Html.map GotSideNav (SideNav.view model.sidenav) ]
            , div [id "mathjax", attribute "toggle" "on"] []
            ]
        ]
    
        
        


-- UPDATE

update : Msg -> Model ->  ( Model, Cmd Msg )
update msg model =
    case msg of
        GotBody bodyMsg ->
            case bodyMsg of
                Body.GetArticle _ ->
                    let
                        (newBody, newMsg) = Body.update bodyMsg model.body

                        (newNav, newNavMsg) = SideNav.update (SideNav.Reload newBody) model.sidenav
                    in
                        ( { model | body = newBody, sidenav = newNav }
                        , Cmd.batch [Cmd.map GotBody newMsg, Cmd.map GotSideNav newNavMsg] )
                
                _ ->
                    let
                        (newBody, newMsg) = Body.update bodyMsg model.body
                    in
                        (model, Cmd.map GotBody newMsg)
            

        GotSideNav navMsg ->
            let
                ( newSideNav, newMsg) = SideNav.update navMsg model.sidenav
            in
                ( { model | sidenav = newSideNav }
                , Cmd.map GotSideNav newMsg)


        _ ->
             ( model, Cmd.none )


titleOf : Model -> Maybe String
titleOf model =
    case model.body of
        Body.Article body -> Just body.title

        _ -> Nothing
