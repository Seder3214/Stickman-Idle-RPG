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
                    ["display-text", function() {return `<div style=" width:100px; height:50px; position:absolute; 
            top:3%; left:5%; align-items: center; justify-content: center; display:flex"><img src='resources/coin.png' style='background-repeat: no-repeat;
            background-position: 50% 50%; text-align: center;'><b>${format(player.main.gold)}</b></img></div><div style='background-color: red; border: 2px solid white; width: 150px; height:20px'>${format(player.main.character.healthPoints,2)}/${format(getMaxPlayerHP(),2)}</div>
                    <p><div style='background-color: blue; border: 2px solid white; width: 100px; height:20px'>Player MP</div><br>
                    <div style='background:linear-gradient(to right, lime ${(player.main.cooldowns.attackCooldown/(getPlayerAttackSpeed()))*100}%, grey 1px); width: 100px; height:2px'></div>`}],
                ['blank',['750px','50px']],
                ["display-text", function() {
                    let debuffs = ``
                    if (player.main.cooldowns.burningMax>=1) debuffs+=`<div>Fire: ${player.main.cooldowns.burningMax}</div><br>`
                    return debuffs+`
                    <div style='background-color: red; border: 2px solid white; width: 150px; height:20px'>${format(player.main.floor.monster.healthPoints,2)}/${format(getMaxEnemyHP(),2)}</div>
                    <p><div style='background-color: blue; border: 2px solid white; width: 100px; height:20px'>Enemy MP</div><br>
                    <div style='background-color: lime; width: 100px; height:2px'></div>`}]]],
                ['blank',['0px','100px']],
                ["display-text", function() {
                    let table = "<span style='display:inline;'>Вы победили босса этажа. Выберите одну из трёх полученных карт. <br></span><br><div style='width:90%; background:rgba(21, 21, 21, 1); height:500px; align-items:center; justify-content:center; display:flex; border:4px solid white; opacity:1'><br>"
                    if (player.inCardChoose) {
                        let x = player.main.character.skill_choose
                        for (i=0;i<3;i++) {
                            table+=`<div style='width:250px; height:400px; border:4px><span style='display:inline;'>${x[i].card_name}</span><hr><br>
                            <div style='background-color:rgba(193, 153, 61, 1); border:2px solid white; 
                            height:350px; width:220px; text-align:center; align-items:flex-end; justify-content:center;
                            display:flex; padding-block-end:0rem; color:black'><span style='font-size:19px;font-family: "Cormorant Garamond", serif;padding-top:90%'>${x[i].description} 
                            ${`<span style='color:rgba(72, 255, 0, 1); font-family: "Cormorant Garamond", serif;'>${x[i].skillId?`[${x[i].card_name}]`:(x[i].amplify==true?`+${x[i].value}%`:`+${x[i].value}`)}</span>`}</span><span style='position:absolute;padding-bottom:2px; font-size:17px;font-family: "Cormorant Garamond", serif;'>${getRarityName(x[i].rarity)} | ${x[i].skillId?'Карта навыка':'Карта улучшения'}</span>
                            </div><br>
                            <button onClick='getCard("${x[i].skillId?undefined:x[i].card_id}", ${x[i].skillId?x[i].skillId:undefined})'style='border:2px solid rgba(38, 255, 0, 1); width:200px; height:30px; background:rgba(17, 36, 10, 1); font-size:14px; color:rgba(142, 255, 130, 1); cursor:pointer;'>Выбрать ${x[i].skillId?`карту навыка`:`карту улучшения`}</button></div>`
                        }
                        return table+"</div>"
                    }
                }],
                ],
                
    previousTab: "",
    leftTab: true,
})