import Data.List
import Data.Tree
import System.Directory
import System.FilePath

scanMD :: FilePath -> FilePath -> IO (Tree FilePath)
scanMD root path = do
    if takeExtension path == ".md"
    then return (Node path [])
    else do
        let pwd = joinPath [root, path]
        filepath <- listDirectory pwd

        let jointPath = map (\p -> joinPath [path, p]) filepath

        let files = (filter ((== ".md") . takeExtension)) $ jointPath

        isDir <- sequence $ map doesDirectoryExist jointPath
        let dirs = (map snd) . (filter fst) $ (zip isDir jointPath)

        subTrees <- sequence . map (scanMD pwd) . (map takeFileName) $ (files ++ dirs)
        return (Node path subTrees)


treeToJSON :: Tree FilePath -> String
treeToJSON tree =
    let 
        content = 
            if length (subForest tree) == 0
                then ",\"dir\":[]"
                else ",\"dir\":" ++ "[" ++ (intercalate "," . map treeToJSON $ subForest tree) ++ "]"
    in 
    "{" ++ 
        "\"name\":" ++ (show $ rootLabel tree) ++
        content ++ "}"


main :: IO ()
main = do
    t <- scanMD "" "blog"
    writeFile "blog/index.json" (treeToJSON t)

 