module Home exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (Decoder)
import Time
import Url.Builder
import Browser.Navigation as Nav

import Session exposing (Session)
import Route exposing (Route(..), toString)

-- MODEL

type alias Model =
    { session : Session
    , featuredPosts : List FeaturedPost
    , loading : Bool
    , error : Maybe String
    }

type alias FeaturedPost =
    { title : String
    , description : String
    , date : String
    , path : List String
    }

init : Session -> ( Model, Cmd Msg )
init session =
    ( Model session [] True Nothing
    , fetchFeaturedPosts
    )

-- UPDATE

type Msg
    = GotFeaturedPosts (Result Http.Error (List FeaturedPost))
    | NavigateToPost (List String)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotFeaturedPosts result ->
            case result of
                Ok posts ->
                    ( { model | featuredPosts = posts, loading = False, error = Nothing }
                    , Cmd.none
                    )
                Err _ ->
                    ( { model | loading = False, error = Just "Failed to load featured posts" }
                    , Cmd.none
                    )

        NavigateToPost path ->
            ( model
            , Nav.pushUrl (Session.navKey model.session) (Route.toString <| Debug.log "" (Blog path))
            )

-- VIEW

view : Model -> Html Msg
view model =
    -- div [class "main-blog"]
    div [ class "home-container" ]
        [ viewHero
        , viewFeaturedPosts model
        ]

viewHero : Html msg
viewHero =
    section [ class "hero" ]
        [ h1 [] [ text "Welcome to My Blog" ]
        , p [] 
            [ text "I write about programming, technology, and my journey in software development. "
            , text "Explore my thoughts, tutorials, and experiences in the world of code."
            ]
        ]

viewFeaturedPosts : Model -> Html Msg
viewFeaturedPosts model =
    section [ class "featured-posts" ]
        [ h2 [] [ text "Featured Posts" ]
        , if model.loading then
            div [ class "loading" ] [ text "Loading posts..." ]
          else if model.error /= Nothing then
            div [ class "error" ] [ text (Maybe.withDefault "" model.error) ]
          else
            div [ class "posts-grid" ]
                (List.map viewPostCard model.featuredPosts)
        ]

viewPostCard : FeaturedPost -> Html Msg
viewPostCard post =
    article [ class "post-card" ]
        [ div [ class "post-card-content" ]
            [ h3 [] [ text post.title ]
            , p [] [ text post.description ]
            , div [ class "post-card-meta" ]
                [ span [] [ text post.date ]
                , button 
                    [ class "read-more"
                    , onClick (NavigateToPost post.path)
                    ] 
                    [ text "Read More →" ]
                ]
            ]
        ]

-- HTTP

fetchFeaturedPosts : Cmd Msg
fetchFeaturedPosts =
    Http.get
        { url = "/blog/featured.json"
        , expect = Http.expectJson GotFeaturedPosts featuredPostsDecoder
        }

featuredPostDecoder : Decoder FeaturedPost
featuredPostDecoder =
    Decode.map4 FeaturedPost
        (Decode.field "title" Decode.string)
        (Decode.field "description" Decode.string)
        (Decode.field "date" Decode.string)
        (Decode.field "path" (Decode.list Decode.string))

featuredPostsDecoder : Decoder (List FeaturedPost)
featuredPostsDecoder =
    Decode.list featuredPostDecoder

-- Session helpers

getSession : Model -> Session
getSession model =
    model.session
