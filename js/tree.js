var layoutInfo = {
    startTab: "main",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: ["blank",
                ["display-text", function() {return `<h3 class='overlayThing'>Stage 1-10<br>Monsters: 10</h3>`}],
                "blank",
                ['row',[
                    ["display-text", function() {return `<div style='background-color: red; border: 2px solid white; width: 100px; height:20px'>Player HP</div>
                    <p><div style='background-color: blue; border: 2px solid white; width: 100px; height:20px'>Player MP</div><br>
                    <div style='background-color: lime; width: 100px; height:2px'></div>`}],
                ['blank',['750px','50px']],
                ["display-text", function() {return `<div style='background-color: red; border: 2px solid white; width: 100px; height:20px'>Enemy HP</div>
                    <p><div style='background-color: blue; border: 2px solid white; width: 100px; height:20px'>Enemy MP</div><br>
                    <div style='background-color: lime; width: 100px; height:2px'></div>`}]]]
                ],
    previousTab: "",
    leftTab: true,
})