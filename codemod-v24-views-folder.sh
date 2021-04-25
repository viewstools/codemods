function findjsr {
  find -L "${3:-.}" -name '*.js' -not -path '*node_modules*' -not -path 'view.js' -not -path '*dist*' -exec grep "$1" --color=auto {} \; -exec gsed -i "s/$1/$2/g" {} \; -print
}

function findlogicr {
  find -L "${3:-.}" -name 'logic.js' -not -path '*node_modules*' -not -path '*dist*' -exec grep "$1" --color=auto {} \; -exec gsed -i "s/$1/$2/g" {} \; -print
}

findjsr "Data\/ViewsData\.js" "Views\/Data\.js" src
findjsr "Logic\/ViewsFlow\.js" "Views\/Flow\.js" src
findjsr "\.\/ViewsFlow\.js" "Views\/Flow\.js" src
findlogicr 'Logic\/useIsMedia\.js' 'Views\/hooks\/useIsMedia\.js' src
rm -f src/Data/ViewsData.js src/Logic/ViewsFlow.js src/Logic/ViewsFlow.json src/Logic/ViewsTools.js src/Logic/ViewsToolsDesignSystem.js src/Logic/useIsBefore.js src/Logic/useIsHovered.js src/Logic/useIsMedia.js src/Logic/ToolsDesignSystem.js
