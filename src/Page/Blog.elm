module Page.Blog exposing (..)

-- This file shows page redirecting to articles, i.e. the entry
import Browser.Navigation as Nav
import Html exposing (Html, text, ul, li, a)
import Html.Attributes exposing (href)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (Decoder, field, string, list)
import Url.Builder

import Session exposing (Session, navKey)

import Debug

-- articles/category/topic/../blog.md
type Topic 
    = Topic String SubTopic

type SubTopic = SubTopic (List Topic)


emptyTopic : Topic
emptyTopic = Topic "" (SubTopic [])


topicName : Topic -> String
topicName topic =
    case topic of
        Topic name _ -> name

subTopicOf : Topic -> List Topic
subTopicOf topic =
    case topic of
        Topic _ (SubTopic subTopic) -> subTopic


type alias Model =
    { session: Session
    , topics: List Topic
    , path: List String}

getSession : Model -> Session
getSession model = model.session

initWithPath : List String -> Session -> (Model, Cmd Msg)
initWithPath path s =
    let
        (model, cmd) = init s
    in
        ({model | path = path}, cmd)

init : Session -> (Model, Cmd Msg)
init s =
    ( Model s [] []
    , Http.get 
        { url = articleIdx
        , expect = Http.expectJson GotIdx idxDecoder} )

type Msg
    = Finished
    | GotIdx (Result Http.Error Topic)
    | ChangePath (List String)

view : Model -> Html Msg
view model =
    let
        nowTopics = visitPath model.path model.topics
    in
        ul []
            (List.map (topicName >> viewTopic model.path) nowTopics)


viewTopic : List String -> String -> Html Msg
viewTopic path name =
    let
        newPath = path ++ [name]
    in
        if String.endsWith ".md" name
        then 
            li [] 
                [a 
                    [href (Url.Builder.absolute ("#/blog"::newPath) [])] 
                    [text name]]
        else 
            li [onClick (ChangePath newPath)] [text name]

visitPath : List String -> List Topic -> List Topic
visitPath path topics =
    case path of
        [] -> topics

        x::xs ->
            let
                nextTopic = 
                    List.filter (\t -> topicName t == x) topics
                        |> List.head
                        |> Maybe.withDefault emptyTopic
            in
                visitPath xs (subTopicOf nextTopic)


articleIdx : String
articleIdx = "/blog/index.json"

idxDecoder : Decoder Topic
idxDecoder =
    Decode.map2 Topic
        (field "name" string)
        (field "dir" (Decode.map SubTopic (list (Decode.lazy (\_ -> idxDecoder)))))


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Finished -> (model, Cmd.none)

        GotIdx req ->
            case req of
                Ok topic -> 
                    ( { model | topics = (subTopicOf topic) }
                    , Cmd.none )

                Err err -> (model, Debug.log (Debug.toString err) Cmd.none)

        ChangePath path -> 
            ( { model | path = path }
            , Nav.pushUrl
                (model |> getSession |> navKey) 
                (Url.Builder.absolute ("#/blog"::path) []))

