//Функция для вывода редкости
function getRarityName(rarity) {
    switch(rarity) {
        case 1: return '(Обычный)'; break
        case 2: return '(Необычный)'; break
        case 3: return '(Редкий)'; break
        case 4: return '(Эпический)'; break
        case 5: return '(Легендарный)'; break
        case 6: return '(Мифический)'; break
        case 7: return '(Экзотический)'; break
        case 8: return '(Уникальный)'; break
        case 8: return '(Секретный)'; break
    }
}
function getSlotBuffs() {
    let slot = player.main.equipment
    let data = {add_vitality:0,add_strength:0,add_agility:0,add_intelligence:0,attack:0, speed:0, defense:0, luck:0, fire_attack:0,poison_attack:0, water_attack:0}
    for (i in slot) {
        for (j in data) {
                if (slot[i][j]!=undefined) data[j] += slot[i][j]
        }
    }
    return data
}
function applySlotBuffs() {
    let data = getSlotBuffs()
    let playerData = player.main.character 
    for (i in player.main.character) {
        for (j in data) {
        if (i==j && j!='speed') playerData[i] = data[j]
    }
    }
    return player.main.character
}
function toggleGridAndSlot(type) {
            if (player.main.checkToggleGridId!=''&&player.main.checkToggleSlotId!='') {
                console.log(getGridData('main',player.main.checkToggleGridId))
                let slotData = player.main.equipment[type]
                player.main.equipment[type] = getGridData('main',player.main.checkToggleGridId)
                player.main.grid[player.main.checkToggleGridId] = slotData
                player.main.checkToggleGridId=''
                player.main.checkToggleGridId_2=''
                player.main.checkToggleSlotId=''
            }
            else if (player.main.checkToggleSlotId!=''&&player.main.checkToggleGridId!=''&&player.main.equipment[type].item_name!='') {
                let slotData = player.main.equipment[type]
                let gridable=player.main.grid[player.main.checkToggleGridId]
                player.main.grid[player.main.checkToggleGridId] = slotData
                player.main.equipment[type] = gridable
                player.main.checkToggleGridId=''
                player.main.checkToggleGridId_2=''
                player.main.checkToggleSlotId=''
            }
}
function toggleGrids() {
    if (player.main.checkToggleGridId!=''&&player.main.checkToggleGridId_2!='') {
        let grid_1 = getGridData('main', player.main.checkToggleGridId)
        let grid_2 = getGridData('main', player.main.checkToggleGridId_2)
        player.main.grid[player.main.checkToggleGridId] = grid_2
        player.main.grid[player.main.checkToggleGridId_2] = grid_1
        if (player.main.grid[player.main.checkToggleGridId]!=grid_1){
            player.main.checkToggleGridId=''
            player.main.checkToggleGridId_2=''
        }
    }
}
//Функция для основных кнопок
function setSubtab(id) {
player.tab = 'main'
player.subtabs[player.tab].mainTabs = 'Inventory'
    switch(id) {
        case 'inv': 
        player.tab = 'main';
        player.subtabs[player.tab].mainTabs = 'Inventory';
        break
        case 'player':
        player.tab = 'main';
        player.subtabs[player.tab].mainTabs = 'Player';
        break
        case 'forge':
        player.tab = 'main';
        player.subtabs[player.tab].mainTabs = 'Forge';
        break
        case 'prestige':
        player.tab = 'main';
        player.subtabs[player.tab].mainTabs = 'Prestige';
        break
        case 'shop': return '(Легендарный)'; break
        case 6: return '(Мифический)'; break
        case 7: return '(Экзотический)'; break
        case 8: return '(Уникальный)'; break
        case 8: return '(Секретный)'; break
    }
}
//Функция для вывода названия оружия
function getEquipTypeName(type) {
    switch(type) {
        case 'sword': return '[Меч - Осн. оружие - Воин]'; break
        case 'dagger': return '[Короткий меч - Доп. оружие - Лучник]'; break
        case 'bow': return '[Лук - Осн. оружие - Лучник]'; break
        case 'staff': return '[Посох - Осн. оружие - Маг]'; break
        case 'shield': return '[Щит - Доп. оружие - Воин]'; break
        case 'grimoire': return '[Гримуар - Доп. оружие - Маг]'; break
        case 'helmet': return '[Шлем]'; break
        case 'chestplate': return '[Нагрудник]'; break
        case 'leggings': return '[Поножи]'; break
        case 'boots': return '[Ботинки]'; break
        case 'ring': return '[Кольцо]'; break
        case 'necklace': return '[Ожерелье]'; break
    }
}
//Функция для вывода характеристик снаряжения
function getStatName(stat, value) {
    switch(stat) {
        case 'attack': return `Атака: +${format(value,0)}`; break
        case 'speed': return `Скорость: ${format(1/value,2)}/сек`; break
        case 'fire_attack': return `Огненный урон: +${format(value,0)}`; break
        case 'water_attack': return `Водный урон: +${format(value,0)}`; break
        case 'poison_attack': return `Отравление: +${format(value,0)}`; break
        case 'defense': return `Защита: +${format(value,0)}`; break
        case 'luck': return `Удача: +${format(value,0)}`; break
        case 'add_strength': return `Сила: +${format(value,0)}`; break
        case 'add_vitality': return `Живучесть: +${format(value,0)}`; break
        case 'add_agility': return `Ловкость: +${format(value,0)}`; break
        case 'add_intelligence': return `Мудрость: +${format(value,0)}`; break
    }
}
//Функция для вывода основных характеристик персонажа
function getPlayerStats(stat, value, bonus) {
    switch(stat) {
        case 'add_strength': return `<div class='statDiv'>Сила</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'add_vitality': return `<div class='statDiv'>Живучесть:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'add_agility': return `<div class='statDiv'>Ловкость:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'add_intelligence': return `<div class='statDiv'>Мудрость:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'attack': return `<div class='statDiv'>Атака:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'speed': return `<div class='statDiv'>Скорость атаки:</div><div class='statDiv'>${format(value!=undefined?1/value:0,2)}/сек</div><div class='statDiv'>
        ${format(bonus!=0?1/bonus:0,2)}/сек</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'defense': return `<div class='statDiv'>Защита:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'luck': return `<div class='statDiv'>Удача:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'fire_attack': return `<div class='statDiv'>Огненный урон:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'water_attack': return `<div class='statDiv'>Водный урон:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'poison_attack': return `<div class='statDiv'>Отравление:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
    }
}
//Пул лута обычной редкости
function getCommonWeapon() {
    let className = player.main.character.class
    let chosenPool = []
    let fullPool = [
        {item_type: 'primary_weapon', item_subtype: 'sword', item_name:'Ржавый меч', level: 0, attack:12, speed:0.9, strength_scale:"E", agility_scale:"F", rarity:1},
        {item_type: 'secondary_weapon',item_subtype: 'dagger', item_name:'Потрескавшийся короткий меч', level: 0, attack:4,speed:1.25, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'primary_weapon', item_name:'Рассохшийся лук', item_subtype: 'bow',level: 0, attack:9,speed:1.1, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'primary_weapon', item_name:'Простой посох', item_subtype: 'staff', level: 0, attack:0, speed:1.3, fire_attack:4.5, intelligence_scale:"E", rarity:1},
        {item_type: 'secondary_weapon', item_name:'Дряхлый щит', item_subtype: 'shield',level: 0, defense:6, vitality_scale:"E", strength_scale:"F", rarity:1},
        {item_type: 'secondary_weapon', item_name:'Старинный Гримуар',item_subtype: 'grimoire', level: 0, attack:0, intelligence_scale:"E", rarity:1},
        {item_type: 'chestplate',item_subtype: 'chestplate', item_name:'Поржавевшый Нагрудник', level: 0, defense: 9, attack:0, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'helmet',item_subtype: 'helmet', item_name:'Поржавевший Шлем', level: 0, defense:4, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'leggings', item_subtype: 'leggings',item_name:'Поржавевшие Поножи', level: 0, defense:6, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'boots',item_subtype: 'boots', item_name:'Кожаные Ботинки', level: 0, defense:3, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'ring', item_subtype: 'ring',item_name:'Железное Кольцо', level: 0, add_strength:2, rarity:1},
        {item_type: 'ring', item_subtype: 'ring',item_name:'Кольцо с магическим камнем', level: 0, add_intelligence:3, rarity:1},
        {item_type: 'ring',item_subtype: 'ring', item_name:'Кольцо с Четырёхлистным клевером', level: 0, luck:3, rarity:1},
        {item_type: 'necklace', item_subtype: 'necklace',item_name:'Серебрянная цепочка', level: 0, add_strength:1, add_vitality: 1, add_agility:1, add_intelligence:1, rarity:1},
        {item_type: 'necklace', item_subtype: 'necklace',item_name:'Позолоченная печать', level: 0, luck:2, rarity:1},
    ]
    if (className=='warrior') {
        for (i=0;i<fullPool.length;i++) if(i<=0||i>=6) chosenPool.push(fullPool[i])
    }
    if (className=='archer') {
        chosenPool=fullPool[1,2]
        console.log(`${chosenPool}`)
    }
    if (className=='mage') {
        chosenPool=fullPool[3,4]
        console.log(`${chosenPool}`)
    }
        for (i=0;i<fullPool.length;i++) if(i<=0||i>=6||i==4) chosenPool.push(fullPool[i])
    return chosenPool
}
//Основная часть игры
addLayer("main", {
    name: "game", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
		gold: new Decimal(0),
        checkToggleGridId: '',
        checkToggleGridId_2:'',
        checkToggleSlotId: '',
        checkToggleType: '',
        equipment: {
            helmet: {item_type: 'none',level: 0,rarity:0},
            chestplate: {item_type: 'none',  level: 0,rarity:0},
            leggings: {item_type: 'none', level: 0,rarity:0},
            boots: {item_type: 'none',  level: 0,rarity:0},
            primary_weapon: {item_type: 'none', level: 0,rarity:0},
            secondary_weapon: {item_type: 'none',  level: 0,rarity:0},
            ring_1: {item_type: 'none', level: 0,rarity:0},
            necklace: {item_type: 'none',  level: 0,rarity:0},
            ring_2: {item_type: 'none', level: 0,rarity:0},
        },
        character: {
            class: 'none',
            add_strength:0, 
            add_vitality:0, 
            add_agility:0,
            add_intelligence:0,
            vitality:new Decimal(0),
            strength:new Decimal(0),
            defense: new Decimal(0),
            agility: new Decimal(0),
            intelligence: new Decimal(0),
            attack: new Decimal(0),
            fire_attack: new Decimal(0),
            water_attack: new Decimal(0),
            poison_attack: new Decimal(0),
            luck: new Decimal(0),
            crit: new Decimal(0),
            crit_chance: new Decimal(0),
        },
    }},
    color: "white",
    baseAmount() {return player.points}, 
    type: "normal", 
    //Слоты для персонажа (отдельный объект от основного инвентаря)
    clickables: {
        11: {
            type() {return 'primary_weapon'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
                    };
                }
        },
        12: {
            type() {return 'secondary_weapon'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'border-image-slice': '1',
                        'font-size':'12px',
                    };
                }
        },
        13: {
            type() {return 'helmet'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'font-size':'12px',
                        'width':'225px',
                        'border-image-slice': '1'
                    };
                }
        },
        14: {
            type() {return 'chestplate'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'font-size':'12px',
                        'width':'225px',
                        'border-image-slice': '1'
                    };
                }
        },
        15: {
            type() {return 'leggings'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
                    };
                }
        },
        16: {
            type() {return 'boots'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
                    };
                }
        },
        17: {
            type() {return 'ring_1'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type=='ring'))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type=='ring')
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:'ring'}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:'ring'}.png')`
            }
        },
 tooltipStyle() {
               return {
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
        }
    },
        },
        18: {
            type() {return 'ring_2'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type=='ring'))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type=='ring')
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:'ring'}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:'ring'}.png')`
            }
        },
 tooltipStyle() {
               return {
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
        }
    },
        },
        19: {
            type() {return 'necklace'},
               display() {
            return player.main.equipment[this.type()].item_name?`<h5>${player.main.equipment[this.type()].item_name}</h5>`:""
        },
        canClick(){
            if (!player.main.equipment[this.type()].item_name) return ((player.main.checkToggleGridId&&getGridData('main',player.main.checkToggleGridId).item_type==this.type()))
            else if (player.main.equipment[this.type()].item_name&&player.main.checkToggleGridId) return (getGridData('main',player.main.checkToggleGridId).item_type==this.type())
            else return true
        },
        onClick() {
            if (player.main.checkToggleSlotId==this.id) player.main.checkToggleSlotId = ''
            else player.main.checkToggleSlotId = this.id
            toggleGridAndSlot(this.type())
        },
            tooltip() {
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        style() {
            if (player.main.checkToggleSlotId==this.id) return {
                'width':'75px',
                'min-height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
            else return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity?`rarity_`+player.main.equipment[this.type()].rarity:this.type()}.png')`
            }
        },
 tooltipStyle() {
               return {
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
        }
    },
        },
        20: {
            type() {return 'skill'},
        display() {
            return ''
        },
        canClick(){
            return true
        },
        style() {
                 return {
                'width':'75px',
                'min-height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/rarity_0')`
            }
        },
 tooltipStyle() {
               return {
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
        }
    },
},
    },
    //Инвентарь
    grid: {
        rows: 6, 
        cols: 6,
        getStartData(id) {
            return {item_type: 'none', item_name:'Debug', level: 0,rarity:0}
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return true
        },
        onClick(data, id) { 
            if (player.main.checkToggleGridId==id) player.main.checkToggleGridId = ''
            else if (player.main.checkToggleGridId_2=='') player.main.checkToggleGridId = id

            if (player.main.checkToggleGridId_2==id) player.main.checkToggleGridId_2 = ''
            else if (player.main.checkToggleGridId!='') player.main.checkToggleGridId_2 = id
            if (player.main.checkToggleSlotId!=''&&player.main.checkToggleGridId!=''&&(getGridData('main',player.main.checkToggleGridId).item_type==tmp.main.clickables[player.main.checkToggleSlotId].type||getGridData('main',player.main.checkToggleGridId).item_type=='none')) toggleGridAndSlot(tmp.main.clickables[player.main.checkToggleSlotId].type)
            toggleGrids()
            },
        getDisplay(data, id) {
            return data.item_name
        },
        //Функция для текста в всплывалющем тултипе
        getTooltip(data,id) {
            let table = ''
            let statsTable = ''
            let stats = []
            let k = 0
            let j = 0
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])} `
                    if (stats.length%2!=0) statsTable +=` |`
                    
                    if (stats.length%2==0) statsTable+=' |<br>'
                }
            }
            return table+statsTable
        },
        getStyle(data, id) {
                        if (player.main.checkToggleGridId==id||player.main.checkToggleGridId_2==id) return {
                'width':'75px',
                'height':'75px',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/rarity_${data.rarity}.png')`,
               'border':'4px solid rgba(248, 175, 49, 1)',
            }
           else return {
                'width':'75px',
                'height':'75px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-image': `url('resources/rarity_${data.rarity}.png')`
            }
        },
 getTooltipStyle(data,id) {
               return{
                        'border':'4px solid transparent',
                        'border-image':'linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)',
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
                    };
                }
        },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    //Вкладки
        tabFormat: {
            "Player": {
                content:[
                ['column', [['display-text',function() {
                    let table = ''
                    let inventory = getSlotBuffs()
                    let playerData = player.main.character
                    for (i in inventory) {
                        table+=` ${getPlayerStats(i, playerData[i], inventory[i])}<br>`
                    }
                    return `<h3>Характеристики персонажа</h3><hr><br><div class='statDiv'>Хар-ка</div><div class='statDiv'>Персонаж</div><div class='statDiv'>Экипировка</div><div class='statDiv'>Множ. от уровня/карт улучшения</div><br>`+table}]]],
                ]
		},
            "Inventory": {
                content:[
                ["blank",['60px','150px']],
                ['row',[
                ['column', [['display-text',function() {
                    let table = ''
                    let data = getSlotBuffs()
                    for (i in data) {
                        if (data[i]>0) table+=` ${getStatName(i, data[i])}<br>`
                    }
                    return `<h3>Бонусы от экипировки</h3><hr>`+(table!=''?table:`<span style='color:rgba(84, 84, 84, 1); font-size:12px'>Оденьте снаряжение для получения бонусов.</span>`)}]], {'margin-right':'40px'}],
                    ['v-line', ['200px'], {'margin-left':'-20px'}],
                ['column', [
                ['row',[['clickable',[11]], ["blank",['165px','80px']],['clickable',[12]]]],
                ['row',[['clickable',[13]], ["blank",['165px','80px']],['clickable',[15]]]],
                ['row',[['clickable',[14]], ["blank",['165px','80px']],['clickable',[16]]]],
                ['row',[['clickable',[17]], ["blank",['5px','80px']],['clickable',[18]], ["blank",['5px','80px']],['clickable',[19]], ["blank",['5px','80px']],['clickable',[20]]]],
                ], {'margin-right':'40px'}],
                ]],
                "blank",
                "grid",
                "blank",
                    ]
		},
            "Forge": {
                content:[
                ["column", [
                "blank",
                    ]
                ]
         ]
		},
            "Prestige": {
                content:[
                ["column", [
                "blank",
                    ]
                ]
         ]
		},
    },
    update(diff) {
    },
    layerShown(){return true}
})
