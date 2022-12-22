module Blog.SideNav exposing (..)

import Browser.Dom as Dom
import Html exposing (..)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import Task

import Blog.Section as Section exposing (Section, extractSections)
import Blog.Body as Body



type alias FoldOnceSection = 
    { sec : Section
    , subsec : List Section}

type alias Model = 
    { sections : List FoldOnceSection
    , cursor : Int
    }


type Msg
    = MoveTo Int
    | Reload Body.Model
    | ToSection String
    | Completed
    
init : Body.Model -> Model
init body =
    case body of 
        Body.Article article -> 
            let sections = extractSections article.content |> validSection
            in 
                { sections = foldOnce sections
                , cursor = 0}
        _ -> 
            { sections = [] 
            , cursor = 0}

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        MoveTo pos -> ({ model | cursor = pos }, Cmd.none)

        Reload m -> (init m, Cmd.none)

        ToSection name ->
            ( model
            , Dom.getElement name
                |> Task.andThen (\info -> Dom.setViewport 0 info.element.y)
                -- |> Task.onError (\_ -> Task.succeed ())
                |> Task.attempt (\_ -> Completed))

        _ -> (model, Cmd.none)

view : Model -> Html Msg
view model =
    nav [] 
        [ div [] 
            [ unfoldView model.sections model.cursor ]]

secView : Section -> Html Msg
secView sec =
    div 
        [ onClick << ToSection << Section.nameToId <| sec.name ] 
        [ text sec.name ]


foldOnce : List Section -> List FoldOnceSection
foldOnce ls =
    let grouped = 
            List.foldl 
                (\sec acc ->
                    case acc of
                        [] -> 
                            [(sec, [])]
            
                        (rt, sub)::rest -> 
                            if sec.h == 2
                            then (sec,[])::(rt, sub)::rest
                            else (rt, sub ++ [sec])::rest

                ) [] ls |> List.reverse
    in List.map (\(rt, sub) -> FoldOnceSection rt sub) grouped


unfoldView : List FoldOnceSection -> Int -> Html Msg
unfoldView fs idx =
    ul []
        (List.map 
            (\(j, sec) -> 
                if idx == j
                then li [] [ secView sec.sec, unfoldAll sec.subsec 3 ]
                else li [] [ secView sec.sec ]) 
            (List.indexedMap Tuple.pair fs))

unfoldAll : List Section -> Int -> Html Msg
unfoldAll ls level = 
    let grouped =
            List.foldl
                (\sec acc -> 
                    case acc of
                        [] -> [[sec]]
                    
                        s::rest ->
                            if sec.h == level
                            then [sec]::s::rest
                            else (s ++ [sec])::rest
                ) [] ls |> List.reverse
        
        subview =
            List.map 
                (\group ->
                    case group of
                        [] -> div [] []
                        
                        x::xs -> li [] [secView x, unfoldAll xs (level+1)]
                ) grouped
    in ul [] subview
    
-- every markdown should have one and only one h1 title
validSection : List Section -> List Section
validSection = List.filter ( \sec -> sec.h <= 3 && sec.h > 1 )

