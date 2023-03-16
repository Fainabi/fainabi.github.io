module Utils exposing (..)

import Time


type alias Date = 
  { day : Int
  , hour : Int
  , minute : Int
  , second : Int
  }

seconds_to_days : Int -> Date
seconds_to_days s =
  let 
    days = s // (24 * 60 * 60)
    hours = modBy 24 (s // 60 // 60)
    mins = modBy 60 (s // 60)
    second = modBy 60 s
  in
    { day = days, hour = hours, minute = mins, second = second }

slack_off_time : Time.Posix -> String
slack_off_time time =
  let
    t = Time.posixToMillis time
    diff = (t - 1671261642608) // 1000
    dhm = seconds_to_days diff
    day = String.fromInt dhm.day
    hour = String.fromInt dhm.hour
    min = String.fromInt dhm.minute
    scs = String.fromInt dhm.second
  in
    day ++ " days, " ++ hour ++ " hours, " ++ min ++ " mins, " ++ scs ++ " seconds, current is " ++ (String.fromInt t)


scanList : (a -> b -> a) -> a -> List b -> List a
scanList f v ls =
  case ls of
    [] -> []

    x::xs ->
      let y = f v x 
      in y::(scanList f y xs)
