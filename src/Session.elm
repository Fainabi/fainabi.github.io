module Session exposing (..)

import Browser.Navigation as Nav

type Session
    = Session Nav.Key

navKey : Session -> Nav.Key
navKey session =
    case session of
        Session key -> key
        
