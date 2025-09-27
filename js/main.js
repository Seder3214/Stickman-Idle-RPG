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
    }
}
//Функция для вывода характеристик оружия
function getStatName(stat, value) {
    switch(stat) {
        case 'attack': return `Атака: +${format(value,0)}`; break
        case 'speed': return `Скорость: ${format(value*100,0)}%`; break
        case 'fire_attack': return `Огненный урон: +${format(value,0)}`; break
        case 'water_attack': return `Водный урон: +${format(value,0)}`; break
        case 'poison_attack': return `Отравление: +${format(value,0)}`; break
        case 'defense': return `Защита: +${format(value,0)}`; break
        case 'luck': return `Удача: +${format(value,0)}`; break
    }
}
//Пул лута обычной редкости
function getCommonWeapon() {
    let className = player.main.character.class
    let chosenPool = []
    let fullPool = [
        {item_type: 'sword', item_name:'Ржавый меч', level: 0, attack:12, speed:0.9, strength_scale:"E", agility_scale:"F", rarity:1},
        {item_type: 'dagger', item_name:'Потрескавшийся короткий меч', level: 0, attack:4,speed:1.25, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'bow', item_name:'Рассохшийся лук', level: 0, attack:9,speed:1.1, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'staff', item_name:'Простой посох', level: 0, attack:0, speed:1.3, fire_attack:4.5, intelligence_scale:"E", rarity:1},
        {item_type: 'shield', item_name:'Дряхлый щит', level: 0, defense:6, vitality_scale:"E", strength_scale:"F", rarity:1},
        {item_type: 'grimoire', item_name:'Старинный Гримуар', level: 0, attack:0, intelligence_scale:"E", rarity:1},
    ]
    if (className=='warrior') {
        chosenPool=fullPool[0,4]
        console.log(`${chosenPool}`)
    }
    if (className=='archer') {
        chosenPool=fullPool[1,2]
        console.log(`${chosenPool}`)
    }
    if (className=='mage') {
        chosenPool=fullPool[3,4]
        console.log(`${chosenPool}`)
    }
    chosenPool.push(fullPool[0])
    chosenPool.push(fullPool[4])
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
        checkToggleId: '',
        equipment: {
            helmet: {},
            chestplate: {},
            leggings: {},
            boots: {},
            primary_weapon: {},
            secondary_weapon: {},
            ring: {},
            amulet: {},
            necklace: {},
            ring_2: {},
        },
        character: {
            class: 'none',
            vitality:new Decimal(0),
            strength:new Decimal(0),
            defense: new Decimal(0),
            agility: new Decimal(0),
            intelligence: new Decimal(0),
            luck: new Decimal(0),
            crit: new Decimal(0),
            crit_chance: new Decimal(0),
        },
    }},
    color: "white",
    baseAmount() {return player.points}, 
    type: "normal", 
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
            player[this.layer].grid[id]++
        },
        getDisplay(data, id) {
            return data.item_name
        },
        //Функция для текста в всплывалющем тултипе
        getTooltip(data,id) {
            let table = ''
            let statsTable = ''
            if (data.rarity>0) statsTable = '|'
            if (data.rarity>0) table = `${getEquipTypeName(data.item_type)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&i!='rarity') statsTable+=` ${getStatName(i, data[i])} |`
            }
            return table+statsTable
        },
        getStyle(data, id) {
            return {
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
                        'width':'250px',
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
                     ["column", [
                    "upgrades",
                    ]
                ]
         ]
		},
            "Inventory": {
                content:[
                ["column", [
                
                ["blank",['60px','200px']],
                "blank",
                "grid",
                "blank",
                    ]
                ]
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
