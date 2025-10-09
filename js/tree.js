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
                ["display-text", function() {
                    let table=`<div style="width:85%; height:15px; font-size:12px; position: absolute; bottom:1px;color:black; background:linear-gradient(to right, aqua ${player.main.character.exp.div(tmp.main.getNextLevelReq).mul(100)}%, grey 0px);
                border: 2px solid rgba(178, 178, 178, 1)">${format(player.main.character.exp,2)}/${format(tmp.main.getNextLevelReq,2)} Опыта - [${format(player.main.character.exp.div(tmp.main.getNextLevelReq).mul(100),2)}%]</div>
                <h3 class='overlayThing'>Stage ${player.main.floor.floorNumber}-${player.main.floor.currentMonster}<br>Monsters: ${player.main.floor.monsters}</h3><br>`
                    return table}],
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