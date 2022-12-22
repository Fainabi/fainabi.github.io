module Article.Slug exposing (..)

import Url.Parser exposing (Parser)

type Slug
    = Slug String

urlParser : Parser (Slug -> a) a
urlParser = 
    Url.Parser.custom "SLUG" (Slug >> Just)

toUrl : Slug -> String
toUrl slug = 
    case slug of
        Slug url -> url
