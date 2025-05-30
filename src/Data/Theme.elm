port module Data.Theme exposing (..)

port changeTheme : String -> Cmd msg
port loadLocalTheme : (String -> msg) -> Sub msg


type Theme
    = Light
    | Dark
    | OS

themeString : Theme -> String
themeString theme =
    case theme of 
        Light -> "Light"
        Dark -> "Dark"
        OS -> "OS"

themeFromString : String -> Theme
themeFromString str =
    case str of 
        "Light" -> Light
        "Dark" -> Dark
        "OS" -> OS
        _ -> Light

toggleTheme : Theme -> Theme
toggleTheme theme =
    case theme of 
        Light -> Dark
        Dark -> Light
        OS -> OS
