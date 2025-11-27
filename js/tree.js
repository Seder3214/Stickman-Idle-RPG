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
                 <hr style='height:3px; width:30%; border:none;background-image:linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, red 50%, rgba(0, 0, 0, 0) 100%)'>
                 <div style='width:200px;  background-image:linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0,0,0,0.7) 20%,rgb(0,0,0,0.7) 80%, rgba(0, 0, 0, 0) 100%)'>
                 <h3 class='overlayThing' style='color: white;'>Стадия ${player.main.floor.floorNumber}-${player.main.floor.currentMonster}</h3><br>
                 <h3 class='overlayThing' style='color: white'>Монстров: ${player.main.floor.monsters}</h3></div>
                <hr style='height:3px; width:30%; border:none;background-image:linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, red 50%, rgba(0, 0, 0, 0) 100%)'><br>
                `
                    return table}],
                "blank",
                ['row',[
                    ["display-text", function() {return `<div style=" width:100px; height:50px; position:absolute; 
            top:3%; left:5%; align-items: center; justify-content: center; display:flex"><img src='resources/coin.png' style='background-repeat: no-repeat;
            background-position: 50% 50%; text-align: center;'><b>${format(player.main.gold)}</b></img></div><b style='font-size:12px; color:lime'>Игрок</b><br>
            <div style='clip-path: polygon(nonzero,10% 0%, 100% 0%, 90% 100%, 0% 100%); border:2px solid white;background-size: cover;
            background-image: linear-gradient(125deg, red ${(player.main.character.healthPoints/(getMaxPlayerHP()))*100}%, darkred 1px), url("resources/hp_bar.png");
            width: 150px; height:20px'><b style='font-size:12px;font-style: oblique'>${format(player.main.character.healthPoints,2)}/${format(getMaxPlayerHP(),2)}</b></div>
                    <br>
                    <div style='background:linear-gradient(to right, lime ${(player.main.cooldowns.attackCooldown/(getPlayerAttackSpeed()))*100}%, rgba(58, 58, 58, 1) 1px); width: 100px; height:4px'></div>`}],
                ['blank',['650px','50px']],
                ["display-text", function() {
                    let debuffs = ``
                    let cooldown = player.main.floor.currentMonster==player.main.floor.monsters?player.main.floor.boss.skill.cooldown:1
                    if (player.main.cooldowns.burningMax>=1) debuffs+=`<div>Fire: ${player.main.cooldowns.burningMax}</div><br>`
                    return debuffs+`
                    <b style='font-size:12px; color:red;'>${player.main.floor.monster.name}</b>
                    <div style='clip-path: polygon(nonzero,10% 0%, 100% 0%, 90% 100%, 0% 100%); border:2px solid white;background-size: cover; 
                    background-image: linear-gradient(125deg, red ${(player.main.floor.monster.healthPoints/(getMaxEnemyHP()))*100}%, darkred 1px), url("resources/hp_bar.png");
                    width: 150px; height:20px'><b style='font-size:12px; font-style: oblique'>${format(player.main.floor.monster.healthPoints,2)}/${format(getMaxEnemyHP(),2)}</b></div>
                    <br>
                    <div style='background:linear-gradient(to right, lime ${(player.main.cooldowns.monsterAttackCooldown/cooldown)*100}%, rgba(58, 58, 58, 1) 1px); width: 100px; height:4px'></div>`}]]],
                ['blank',['0px','100px']],
                ["display-text", function() {
                    let table = "<span style='display:inline;'>Вы победили босса этажа. Выберите одну из трёх полученных карт. <br></span><br><div style='width:90%; background:rgba(21, 21, 21, 1); height:500px; align-items:center; justify-content:center; display:flex; border:4px solid white; opacity:1'><br>"
                    if (player.inCardChoose) {
                        let x = player.main.character.skill_choose
                        for (i=0;i<3;i++) {
                            table+=`<div style='width:250px; height:400px; border:4px><span style='display:inline;'>${x[i].card_name?x[i].card_name:""}</span><hr><br>
                            <div style='background-color:rgba(193, 153, 61, 1); border:2px solid white; 
                            height:350px; width:220px; text-align:center; align-items:flex-end; justify-content:center;
                            display:flex; padding-block-end:0rem; color:black'><span style='font-size:19px;font-family: "Cormorant Garamond", serif;padding-top:90%'>${x[i].description} 
                            ${`<span style='color:rgba(72, 255, 0, 1); font-family: "Cormorant Garamond", serif;'>${x[i].skillId?`[${x[i].card_name}]`:(x[i].amplify==true?`+${x[i].value}%`:`+${x[i].value}`)}</span>`}</span><span style='position:absolute;padding-bottom:2px; font-size:15px;font-family: "Cormorant Garamond", serif;'>${getRarityName(x[i].rarity)} | ${x[i].skillId?'Карта навыка':'Карта улучшения'}</span>
                            </div><br>
                            <button onClick='getCard("${x[i].skillId?undefined:x[i].card_id}", ${x[i].skillId?x[i].skillId:undefined})'style='border:2px solid rgba(38, 255, 0, 1); width:200px; height:30px; background:rgba(17, 36, 10, 1); font-size:14px; color:rgba(142, 255, 130, 1); cursor:pointer;'>Выбрать ${x[i].skillId?`карту навыка`:`карту улучшения`}</button></div>`
                        }
                        return table+"</div>"
                    }
                }],
                ["display-text", function() {
                    let table = "<span style='display:inline;'>Для начала игры выберите класс персонажа, за которого хотите играть.<br></span><br><div style='width:90%; background:rgba(21, 21, 21, 1); height:500px; align-items:center; justify-content:center; display:flex; border:4px solid white; opacity:1'><br>"
                    if (player.inClassChoose) {
                        let x = ['none', 'warrior','archer','mage']
                        let xShow = ['none','Воин','Лучник','Маг']
                        let desc = ['','Сильный воин с мечом. Имеет повышенную живучесть и силу, что позволит наносить больше урона и получать меньше урона от монстров! <br> Основные бонусы: +1 к силе и живучести.',
                            'Ловкий лучник. Имеет повышенную ловкость и меткость, что позволяет ему наносить быстрые и точные удары в слабые места монстров, а также уворачиваться от атак врагов.<br> Основные бонусы: +1 к ловкости и +5% к шансу крита.',
                            'Могучий маг. Обладает великим умом, что позволяет ему использовать различную магию четырёх стихий взамен на ману.<br>Основные бонусы: +1 к мудрости и всему стихийному урону.']
                        let stats = ['','Живучесть: 2, Сила: 2<br>Мудрость: 1, Ловкость: 1<br>Удача: 1',
                            'Живучесть: 1, Сила: 1<br>Мудрость: 1, Ловкость: 2<br>Шанс крит. удара: 5%, Удача: 2',
                            'Живучесть: 1, Сила: 1<br>Мудрость: 2, Ловкость: 1<br>Удача: 2<br>Огненный урон: 1, Водный урон: 1<br>Урон молнией: 1, Земляной урон: 1']
                        for (i=1;i<4;i++) {
                            table+=`<div style='width:250px; height:400px; align-items:center;display:flow; justify-content:center; border:4px><span style='display:inline;'>${xShow[i]}</span><hr><br>
                            <i style='font-size:12px'>${desc[i]}</i><br><br><hr><br>
                            <b style='font-size:12px'>Характеристики класса:</b><br><br>
                            <span style='font-size:12px'>Бонусы к основным характеристикам (живучесть, сила, ловкость и мудрость) также увеличивают множитель увеличения этих характеристик в 2 раза.</span><br><br>
                            <b style='font-size:12px'>${stats[i]}</b><br><br>
                            <button onClick='setClass("${x[i]}")'style='border:2px solid rgba(38, 255, 0, 1);
                             width:200px; height:30px; background:rgba(17, 36, 10, 1); font-size:14px; color:rgba(142, 255, 130, 1); cursor:pointer;'>Выбрать класс
                             </button></div>`
                        }
                        return table+"</div>"
                    }
                }],
                ],
                
    previousTab: "",
    leftTab: true,
})