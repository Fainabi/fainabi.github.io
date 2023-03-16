using Luxor

logo_width, logo_height = 46, 20

@svg let
    fontsize(20)
    fontface("Z003")
    text("Faina", Point(-width/2, height/4), valign=:left, halign=:top)
end logo_width logo_height "assets/logo.svg"

@svg let
    background(0x28 / 0xff, 0x2c / 0xff, 0x33 / 0xff)
    
    fontsize(20)
    fontface("Z003")
    
    sethue("white")
    text("Faina", Point(-width/2, height/4), valign=:left, halign=:top)    
end logo_width logo_height "assets/logo-dark.svg"


theme_width, theme_height = 30, 30

@svg let
    sethue("black")
    r = 5
    circle(0, 0, r, action=:stroke)

    for idx in 0:5
        theta = 2π / 6 * idx
        line(
            Point(r * cos(theta), r * sin(theta)), 
            Point(2r * cos(theta), 2r * sin(theta)),
            action = :stroke
            )
    end

end theme_width theme_height "assets/sun.svg"

@svg let
    background(0x28 / 0xff, 0x2c / 0xff, 0x33 / 0xff)
    sethue("white")

    r = 8
    circle(0, 0, r, action=:stroke)
    setcolor(0x28 / 0xff, 0x2c / 0xff, 0x33 / 0xff)
    circle(-4, -4, r, action=:fill)

    sethue("white")
    arc(
        Point(-3.7, -3.7), 
        r, 
        -0.15pi,
        0.68pi,
        action=:stroke)
end theme_width theme_width "assets/moon.svg"
