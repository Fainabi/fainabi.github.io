module Article.SideNav exposing (..)

import Article.Section exposing (Section)

type alias Model =
    { title : String
    , sections : Section
    }

