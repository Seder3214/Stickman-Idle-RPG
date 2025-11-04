
function updateSlotStats() {
    let slot = player.main.equipment;
    let exclude = excludeStats();
    let exclude2 = ['speed'];
    for (let i in slot) {
        // Инициализируем базовые статы если их нет
        if (!slot[i]._baseStats) {
            slot[i]._baseStats = {};
            for (let j in slot[i]) {
                if (typeof slot[i][j] === 'number' && j !== 'forgeMult' && j !== '_baseStats') {
                    slot[i]._baseStats[j] = slot[i][j] / (slot[i].forgeMult || 1);
                }
            }
        }
        
        // Применяем умножение
        for (let j in slot[i]) {
            if (!exclude.includes(j) && !exclude2.includes(j) && i !== 'speed' && slot[i]._baseStats[j] > 0) {
                if (slot[i].forgeRarity==undefined&&slot[i].forgeLevel==undefined &&slot[i].forgeMult==undefined) {
                   slot[i].forgeLevel = new Decimal(0)
                    slot[i].forgeMult = new Decimal(1)                   
                }
                if (slot[i].rarity>slot[i].forgeRarity||slot[i].rarity<slot[i].forgeRarity) {
                    player.main.buyables[11] = new Decimal(0)
                    slot[i].forgeLevel = new Decimal(0)
                    slot[i].forgeMult = new Decimal(1)
                    slot[i][j] = slot[i]._baseStats[j]}
                else slot[i][j] = slot[i]._baseStats[j] * slot[i].forgeMult;
            }
        }
    }
}
function getStageRewards() {
    let monstersOnStage = player.main.floor.monsters
    let stage = new Decimal(player.main.floor.floorNumber)
    let level = new Decimal(player.main.floor.floorLvl)
    let luck = new Decimal(getFullStat('luck')).add(1)
    let gold = new Decimal(1.15).mul(stage.mul(level)).mul(monstersOnStage).pow(new Decimal(1).add(luck.max(1).log10()))
    let exp = new Decimal(0.5).mul(stage.mul(level).mul(1.5)).pow(1.1).mul(monstersOnStage).pow(luck.max(1).log2().pow(0.55))
    return {gold:gold,exp:exp}
}
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
function getRariryColor(rarity) {
       switch(rarity) {
        case 0: return 'rgba(75, 75, 75, 1)'; break
        case 1: return 'rgba(156, 156, 156, 1)'; break
        case 2: return 'rgba(7, 206, 0, 1)'; break
        case 3: return 'rgba(25, 0, 255, 1)'; break
        case 4: return 'rgba(255, 0, 242, 1)'; break
        case 5: return 'rgba(255, 183, 0, 1)'; break
        case 6: return 'rgba(255, 98, 0, 1)'; break
        case 7: return 'rgba(255, 0, 0, 1)'; break
        case 8: return 'rgba(0, 238, 255, 1)'; break
    } 
}
function excludeStats() {
let scaled_stats = ['rarity','scaled_attack','scaled_defense','scaled_luck','forgeMult', 'forgeLevel','forgeRarity']
    return scaled_stats
}
function getFullStat(stat) {
    let fullstat = (player.main.character[`${stat}`].toNumber()+(getSlotBuffs()[`add_${stat}`]?getSlotBuffs()[`add_${stat}`]:getSlotBuffs()[`${stat}`]?getSlotBuffs()[`${stat}`]:0))*player.main.character[`multi_${stat}`]
    return fullstat
}
function getMaxPlayerHP() {
    let level = player.main.character.level
    let baseVitScale = new Decimal(10)
    let vitality = new Decimal(getFullStat('vitality')).add(1)
    return new Decimal(100).add(vitality.mul(baseVitScale)).mul(level.add(1).log(2))
}
function updateCurrentHP(value) {
    player.main.character.healthPoints = new Decimal(player.main.character.healthPoints.sub(value).max(0))
}
function getMaxEnemyHP() {
    let stage = new Decimal(player.main.floor.floorNumber)
    let level = new Decimal(player.main.floor.currentMonster)
    let monsterLevel = new Decimal(player.main.floor.monster.level)
    return new Decimal(100).mul(new Decimal(2).pow(level.pow(0.95))).mul(monsterLevel.div(2).add(0.5)).mul(new Decimal(3.546).pow(stage))
}
function updateEnemyCurrentHP(value) {
    player.main.floor.monster.healthPoints = player.main.floor.monster.healthPoints.sub(value)
}
function getTotalAttack() {
    let slotAttack = getSlotBuffs().attack
    let scaleAttack = player.main.equipment.primary_weapon.scaled_attack   
    let totalAttack = slotAttack+scaleAttack
    if (player.main.character.skill.damage) totalAttack = totalAttack*(player.main.character.skill.damage)
    if (player.main.character.skill.fire_tickdamage) totalAttack = totalAttack*(player.main.character.skill.fire_tickdamage)  
    if (!isNaN(slotAttack)&&!isNaN(scaleAttack))return totalAttack
    else return new Decimal(0)
}
function getNextForgeMult(id) {
    let data = player.main.equipment[tmp.main.clickables[player.main.checkToggleSlotId].type]
    let type = tmp.main.clickables[player.main.checkToggleSlotId].type
    let level = data.forgeLevel.add(1)
    let scaleTypes = ['necklace','ring_1','ring_2','bracelet']
    let eff = new Decimal(scaleTypes.includes(type)?0.015:0.15).mul(level)
    eff = eff.mul(level.div(10).add(1)).mul(level.sqrt().div(10).add(1))
    return eff.add(1).pow(data.rarity).max(1)
}
function getSkills(id) {
    let player_vitality = (player.main.character['vitality'].toNumber()+(getSlotBuffs()[`add_vitality`]?getSlotBuffs()[`add_vitality`]:0))*player.main.character[`multi_vitality`]
    let player_strength = (player.main.character['strength'].toNumber()+(getSlotBuffs()[`add_strength`]?getSlotBuffs()[`add_strength`]:0))*player.main.character[`multi_strength`]
    let player_agility = (player.main.character['agility'].toNumber()+(getSlotBuffs()[`add_agility`]?getSlotBuffs()[`add_agility`]:0))*player.main.character[`multi_agility`]
    let player_intelligence = (player.main.character['intelligence'].toNumber()+(getSlotBuffs()[`add_intelligence`]?getSlotBuffs()[`add_intelligence`]:0))*player.main.character[`multi_intelligence`]
    let skills = [
        {skill_name:'Простой удар', skill_image:'basic_attack', damage:1, cooldown:1, rarity:0, level:0},
        {skill_name:'Быстрый взмах', skill_image:'rapid_strike', damage:0.63,bloodlust:3, cooldown:0.365, rarity:1, level:0},
        {skill_name:'Выпад щитом', skill_image:'shield_attack', damage:2.06+(Math.log10(player_strength+1)), defense_buff:1.1, cooldown:5.3, rarity:1, level:0},
        {skill_name:'Двойной разрез', skill_image:'double_attack', damage:(0.5+(Math.log2(player_agility+1)-1))*2, cooldown:2.73, rarity:1, level:0},
        {skill_name:'Огненный удар', skill_image:'fire_sword', damage:0,fire:3,fire_tickdamage: (0.5+(player_intelligence**0.35)), cooldown:3.06, rarity:2, level:0},
    ]
    return skills[id]
}
function getPlayerAttackSpeed() {
    let weaponSpeed = 1/getSlotBuffs().speed
    let skillCooldown = player.main.character.skill.cooldown
    let totalSpeed = weaponSpeed+skillCooldown
    return totalSpeed
}
function getLevelMultipliers(className='') {
    let baseMulti = [new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1)]
    let playerLevel = player.main.character.level
    let stats = ['vitality','strength', 'agility', 'intelligence','luck']
    if (className=='warrior') {
        baseMulti = [new Decimal(2),new Decimal(2),new Decimal(1.5),new Decimal(1.5),new Decimal(1.5)]
    }
    if (className=='archer') {
        baseMulti = [new Decimal(1.5),new Decimal(1.5),new Decimal(2),new Decimal(1.5),new Decimal(2)]
    }
    if (className=='mage') {
        baseMulti = [new Decimal(1.5),new Decimal(1.5),new Decimal(1.5),new Decimal(2.25),new Decimal(1.5)]
    }
    for (s in stats){
    player.main.character[`multi_${stats[s]}`] = new Decimal(1)
    for(i=2;i<=playerLevel.toNumber();i++) {
    let multiplier = baseMulti[s].sub(new Decimal(0.2).mul(new Decimal(i).pow(0.5/baseMulti[s])))
    let weakMultiplier = baseMulti[s].sub(new Decimal(0.05).mul(new Decimal(i).pow(0.5/baseMulti[s])))
    if (baseMulti[s].gte(2))player.main.character[`multi_${stats[s]}`] = player.main.character[`multi_${stats[s]}`].mul(multiplier)
    else player.main.character[`multi_${stats[s]}`] = player.main.character[`multi_${stats[s]}`].mul(weakMultiplier)
    }
    }
}
function updateSlotScaleBuffs() {
    for (i in player.main.clickables) if (player.main.clickables[i].item_name) {getScaleBuffs(true, tmp.main.clickables[i].type)}
}
function getScaleBuffs(slot=false, type='') {
            let scales = ['vitality_scale', 'strength_scale','agility_scale', 'intelligence_scale']
            let scaled_stats = excludeStats()
            let scaleNames = {'-':0,'F': 0.10, 'E': 0.275, 'D':0.45, 'C':0.75, 'B':1, 'A': 1.365, 'S': 1.75, 'SS':2, 'SSS':2.5,'R':3,'SR':3.75, 'SSR':4.5, 'UR':6, 'X':7.5}
            let data = player.main.equipment[type]
            let currentEffect = 0
            let currentStat=''
            for (i in data) {
                if (scales.includes(i)) {
                    for (j in data) {
                        if (j!='speed' &&(!scaled_stats.includes(j)) && data[j]>0) {
                            let base = data[j]
                            currentStat=j
                            let subI = i
                            let statDisplay = subI.split('_')[0]
                            let mainStat = (player.main.character[statDisplay].toNumber()+(getSlotBuffs()[`add_${statDisplay}`]?getSlotBuffs()[`add_${statDisplay}`]:0))*player.main.character[`multi_${statDisplay}`]
                            let multi = (scaleNames[data[subI]]*(mainStat))+1
                            if (multi>1)currentEffect += Math.log(base*multi)*(Math.sqrt(Math.pow(base,2)/multi))*(multi/10)
                        }
                    }
                }
            }
            if (slot&&currentStat!='') player.main.equipment[type][`scaled_${currentStat}`] = currentEffect
        }
function getSlotDisplay() {
    let table = ['column', [
                ['row',[['clickable',[11]], ["blank",['165px','80px']],['clickable',[12]]]],
                ['row',[['clickable',[13]], ["blank",['165px','80px']],['clickable',[15]]]],
                ['row',[['clickable',[14]], ["blank",['165px','80px']],['clickable',[16]]]],
                ['row',[['clickable',[17]], ["blank",['5px','80px']],['clickable',[18]], ["blank",['5px','80px']],['clickable',[19]], ["blank",['5px','80px']],['clickable',[20]]]],
                ], {'margin-right':'40px'}]
    return table
}
function getSlotBuffs() {
    let slot = player.main.equipment
    let data = {add_vitality:0,add_strength:0,add_agility:0,add_intelligence:0,attack:0, speed:0, defense:0, luck:0, fire_attack:0,poison_attack:0, water_attack:0, scaled_attack:0, scaled_defense:0,scaled_luck:0}
    for (i in slot) {
        for (j in data) {
                if (slot[i][j]!=undefined) data[j] += slot[i][j]
        }
    }
    return data
}
function applySlotBuffs() {
    let data = getSlotBuffs()
    let exclude = ['attack','defense']
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
    let temp1 = player.main.equipment[type].forgeLevel
    let temp2 = player.main.equipment[type].forgeMult
    
    player.main.equipment[type] = getGridData('main',player.main.checkToggleGridId)
    player.main.grid[player.main.checkToggleGridId] = slotData
    
    // Сохраняем множитель для нового предмета в слоте
    player.main.equipment[type].forgeLevel = temp1
    player.main.equipment[type].forgeMult = temp2
    
    // Делим ВСЕ статы предмета в инвентаре на множитель
    let stats = ['attack', 'defense','fire_attack', 'water_attack', 'poison_attack', 
                'luck', 'add_strength', 'add_vitality', 'add_agility', 'add_intelligence'];
    
    for (let stat of stats) {
        if (player.main.grid[player.main.checkToggleGridId][stat] !== undefined) {
            let newValue = player.main.grid[player.main.checkToggleGridId][stat] / temp2;
            if (!isNaN(newValue)) {
                player.main.grid[player.main.checkToggleGridId][stat] = newValue;
            }
        }
    }
    
    player.main.checkToggleGridId=''
    player.main.checkToggleGridId_2=''
    player.main.checkToggleSlotId=''
}
            else if (player.main.checkToggleSlotId!=''&&player.main.checkToggleGridId!=''&&player.main.equipment[type].item_name!='') {
                let slotData = player.main.equipment[type]
                let gridable=player.main.grid[player.main.checkToggleGridId]
                player.main.grid[player.main.checkToggleGridId] = slotData
                player.main.equipment[type] += gridable
                 player.main.equipment[type].forgeLevel = temp1
                player.main.equipment[type].forgeMult = temp2
                console.log(player.main.grid[player.main.checkToggleGridId].attack/(temp2))
                if (!isNaN(player.main.grid[player.main.checkToggleGridId].attack/(temp2))) player.main.grid[player.main.checkToggleGridId].attack/(temp2)
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
        case 'skill':
        player.tab = 'main';
        player.subtabs[player.tab].mainTabs = 'Skills';
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
        case 'bracelet': return '[Браслет]'; break
    }
}
//Функция для вывода характеристик снаряжения
function getStatName(stat, value) {
    switch(stat) {
        case 'attack': return `Атака: +${format(value,0)}`; break
        case 'speed': return `Скорость: ${format(value/1,2)}/сек`; break
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
        case 'add_strength': return `<div class='statDiv'>Сила</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_strength,2)} | x${format(1,2)}</div>`; break
        case 'add_vitality': return `<div class='statDiv'>Живучесть:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_vitality,2)} | x${format(1,2)}</div>`; break
        case 'add_agility': return `<div class='statDiv'>Ловкость:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_agility,2)} | x${format(1,2)}</div>`; break
        case 'add_intelligence': return `<div class='statDiv'>Мудрость:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_intelligence,2)} | x${format(1,2)}</div>`; break
        case 'attack': return `<div class='statDiv'>Атака:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)} (${format(getSlotBuffs()['scaled_attack'],2)})</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'speed': return `<div class='statDiv'>Скорость атаки:</div><div class='statDiv'>${format(value!=undefined?value/1:0,2)}/сек</div><div class='statDiv'>
        ${format(bonus!=0?bonus/1:0,2)}/сек</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'defense': return `<div class='statDiv'>Защита:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)} (${format(getSlotBuffs()['scaled_defense'],2)})</div><div class='statDiv' style='width:260px'>x${format(1,2)} | x${format(1,2)}</div>`; break
        case 'luck': return `<div class='statDiv'>Удача:</div><div class='statDiv'>${format(value,0)}</div><div class='statDiv'>${format(bonus,0)} (${format(getSlotBuffs()['scaled_luck'],2)})</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_luck,2)} | x${format(1,2)}</div>`; break
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
        {item_type: 'primary_weapon', item_subtype: 'sword', image_name:'rusty_sword', item_name:'Ржавый меч', level: 0, attack:12, speed:0.9, strength_scale:"E", agility_scale:"F", rarity:1},
        {item_type: 'secondary_weapon',item_subtype: 'dagger',image_name:'cracked_dagger', item_name:'Потрескавшийся короткий меч', level: 0, attack:4,speed:1.25, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'primary_weapon', item_name:'Рассохшийся лук',image_name:'old_bow', item_subtype: 'bow',level: 0, attack:9,speed:1.1, strength_scale:"F", agility_scale:"E", rarity:1},
        {item_type: 'primary_weapon', item_name:'Простой посох', image_name:'simple_staff', item_subtype: 'staff', level: 0, attack:0, speed:1.3, fire_attack:4.5, intelligence_scale:"E", rarity:1},
        {item_type: 'secondary_weapon', item_name:'Дряхлый щит',image_name:'old_shield', item_subtype: 'shield',level: 0, defense:6, vitality_scale:"E", strength_scale:"F", rarity:1},
        {item_type: 'secondary_weapon', item_name:'Старинный Гримуар',image_name:'ancient_grimoire',item_subtype: 'grimoire', level: 0, attack:0, intelligence_scale:"E", rarity:1},
        {item_type: 'chestplate',item_subtype: 'chestplate',image_name:'rusty_chestplate', item_name:'Поржавевшый Нагрудник', level: 0, defense: 9, attack:0, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'helmet',item_subtype: 'helmet', image_name:'rusty_helmet',item_name:'Поржавевший Шлем', level: 0, defense:4, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'leggings', item_subtype: 'leggings',image_name:'rusty_leggings',item_name:'Поржавевшие Поножи', level: 0, defense:6, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'boots',item_subtype: 'boots',image_name:'rusty_boots', item_name:'Кожаные Ботинки', level: 0, defense:3, vitality_scale:"F", strength_scale:"F", agility_scale:"F", rarity:1},
        {item_type: 'ring', item_subtype: 'ring',image_name:'iron_ring',item_name:'Железное Кольцо', level: 0, add_strength:2, rarity:1},
        {item_type: 'ring', item_subtype: 'ring',image_name:'magic_ring',item_name:'Кольцо с магическим камнем', level: 0, add_intelligence:3, rarity:1},
        {item_type: 'ring',item_subtype: 'ring', image_name:'lucky_ring',item_name:'Кольцо с Четырёхлистным клевером',level: 0, luck:3, rarity:1},
        {item_type: 'necklace', item_subtype: 'necklace',image_name:'silver_necklace',item_name:'Серебрянная цепочка', level: 0, add_strength:1, add_vitality: 1, add_agility:1, add_intelligence:1, rarity:1},
        {item_type: 'necklace', item_subtype: 'necklace',image_name:'golden_seal',item_name:'Позолоченная печать', level: 0, luck:2, rarity:1},
        {item_type: 'bracelet', item_subtype: 'bracelet',image_name:'red_string',item_name:'Красная нить', level: 0, luck:3, rarity:1},
        {item_type: 'bracelet', item_subtype: 'bracelet',image_name:'stone_bracelet',item_name:'Браслет из камней', level: 0, add_vitality:1, rarity:1},
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
        for (i=0;i<fullPool.length;i++) if(i<=1||i>=6||i==4) chosenPool.push(fullPool[i])
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
        floor: {
            floorNumber:1,
            floorLvl:1,
            monsters: 5,
            currentMonster:1,
            totalExp:0,
            totalGold:0,
            rarities: [0],
            monster: {
                healthPoints: new Decimal(0),
                level: new Decimal(1),
                currentHP: new Decimal(100),
                manaPoints: new Decimal(100),
                attack: 10,
                attack_speed:0,
                attackBleed:0,
                attackFire:0,
                attackPoison:0,
            },
            boss: {
                healthPoints: new Decimal(100),
                manaPoints: new Decimal(100),
                skill:{},
                attack:0,
                attack_speed:0               
            }
        },
        equipment: {
            helmet: {item_type: 'none',level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0), forgeRarity:0},
            chestplate: {item_type: 'none',  level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            leggings: {item_type: 'none', level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            boots: {item_type: 'none',  level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            primary_weapon: {item_type: 'none', level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            secondary_weapon: {item_type: 'none',  level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            ring_1: {item_type: 'none', level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            necklace: {item_type: 'none',  level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            ring_2: {item_type: 'none', level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
            bracelet: {item_type: 'none', level: 0,rarity:0, forgeMult: new Decimal(1), forgeLevel: new Decimal(0),forgeRarity:0},
        },
        character: {
            class: 'none',
            add_strength:0, 
            add_vitality:0, 
            add_agility:0,
            add_intelligence:0,
            currentHP: new Decimal(100),
            healthPoints: new Decimal(0),
            manaPoints: new Decimal(100),
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
            level: new Decimal(1),
            exp: new Decimal(0),
            skill: {},
        },
        cooldowns: {
            attackCooldown: 0,
            burntCooldown: 0,
            bleedingTimer: 0,
            poisonTimer: 0,
            burningMax:0,
        }
    }},
    color: "white",
    baseAmount() {return player.points}, 
    type: "normal", 
getExpBarStyle() {
    return {
        'background':'linear-gradient(to right, aqua ${player.main.character.exp.add(15)}px, grey ${tmp.main.getNextLevelReq}px)',
        'width':'100%', 'height':'15px', 'position': 'absolute',
         'bottom':'1px',
    }
},
    getNextLevelReq() {
        let currentLevel = player.main.character.level
        let req = new Decimal(10).pow(currentLevel).pow(new Decimal(0.325).pow(currentLevel).add(1))
        return req
    },
    //Слоты для персонажа (отдельный объект от основного инвентаря)
    clickables: {
        11: {
            type() {return 'primary_weapon'},
            forgeLevel() {
                let level = new Decimal(0)
                return level
            },
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+` ${getRarityName(data.rarity)}`+`</h3><span style='color:rgba(119, 119, 119, 1); font-size:12px'>${getStatName('speed',data['speed'])}</span><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    if (i!='speed')statsTable+=` ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`<span style="font-size:10px">(+${format(data[`scaled_${i}`],2)})</span>`:``}`
                    if (stats.length%2!=0 && i>1) statsTable +=` |`
                    
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
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity>0&&player.main.equipment[this.type()].image_name!=undefined?`${player.main.equipment[this.type()].image_name}.png')`:`rarity_${player.main.equipment[this.type()].rarity}.png')`}`,
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
                'background-image': `url('resources/${player.main.equipment[this.type()].rarity>0&&player.main.equipment[this.type()].image_name!=undefined?`${player.main.equipment[this.type()].image_name}.png')`:`rarity_${player.main.equipment[this.type()].rarity}.png')`}`,
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            type() {return 'bracelet'},
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
            if (player.main.checkToggleGridId!='') toggleGridAndSlot(this.type())
        },
            tooltip() {
            let exclude = excludeStats()
                let data = player.main.equipment[this.type()]
            let table = ''
            let stats = []
            let statsTable = ''
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}`+(player.main.equipment[this.type()].forgeLevel?` +${player.main.equipment[this.type()].forgeLevel} `:" ")+ `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=`<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})</span>`:``}`
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
    },
buyables: {
    11: {
        cost(x) { return new Decimal(0).mul(x) },
        display() { return "<h5>Усилить экипировку в данном слоте</h5>" },
        unlocked() {return player.main.checkToggleSlotId!=''},
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            let data = player.main.equipment[tmp.main.clickables[player.main.checkToggleSlotId].type]
            data.forgeRarity = data.rarity
            data.forgeMult = getNextForgeMult(player.main.checkToggleSlotId)
            data.forgeLevel = data.forgeLevel.add(1)
            getMaxPlayerHP(true)
        },
        style() {
            return {
                'width':'205px',
                'height':'50px',
                'border':'4px solid rgba(182, 150, 96, 1)',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background':'#0f0f0f',
            }
        },
    },
},
    skill_grid: {
        rows: 1, 
        cols: 5,
        getSkillData(id) {
            let startDesc = getSkills(((id%10)-1)+((Math.floor(id/100)-1)*7))
            if (getSkillGridData('main',id).level>0) {
                startDesc.damage *= 1.15**getSkillGridData('main',id).level
            }
           return startDesc
        },
        getStartData(id) {
            return {level:0,duplicates:0}
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return true
        },
        onClick(data, id) { 
            },
        onHold(data, id) {
            if (data.level>=0||id==101)setTimeout(player.main.character.skill = this.getSkillData(id),3000)
        },
        getDisplay(data, id) {
            if (data.level==0 && id!=101) return `<span style="font-size:28px; color:grey">🔒</span>`
            return this.getSkillData(id).skill_name
        },
        getProgressStyle(data,id) {
            return {
                'position':'absolute',
                'text-align':'top',
                'bottom':'-20px',
                'font-size':'14px',
                'width':'100%',
                'height':'15px',
                'border-top': '1.5px solid transparent', 
                'border-image': `linear-gradient(to right, rgba(164, 255, 167, 1) ${(data.duplicates/5)*100}%, rgba(62, 62, 62, 1) 0px)`, 
                'border-image-slice':'1',
                'background': `linear-gradient(to right,lime ${Math.min(80,Math.max(0,(data.duplicates/5)-0.2)*100)}%, rgba(120, 255, 124, 1) ${Math.min(100,(data.duplicates/5)*100)}%,  grey 0px)`,
            }
        },
        getProgress(data,id) {
            return `${format(data.duplicates,0)}/${format(5,0)}`
        },
        //Функция для текста в всплывалющем тултипе
        getTooltip(data,id) {
                        let descs= [
                `Делает простой выпад, нанося ${format(this.getSkillData(id).damage*100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
                `Делает точный и быстрый взмах, нанося ${format(this.getSkillData(id).damage*100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
                `Делает выпад тяжелым щитом, нанося ${format(this.getSkillData(id).damage*100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
                `Делает два последовательных взмаха мечом, нанося ${format((this.getSkillData(id).damage/2)*100)}% урона за каждый удар. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
                `Делает взмах мечом, пылающим огнём, накладывая ожог противнику на ${format(this.getSkillData(id).fire) } секунд. Каждую секунду ожог будет наносить ${format((this.getSkillData(id).fire_tickdamage)*100)}% урона каждую секунду. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
            ]
            return descs[((id%10)-1)+((Math.floor(id/100)-1)*7)]
        },
        getStyle(data, id) {
             if (player.main.character.skill.skill_name==this.getSkillData(id).skill_name) return {
                'width':'75px',
                'height':'75px',
                'border':`1px solid`,
                'border-color':'gold',
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-color':'rgba(29, 29, 29, 1)',
                'padding-block':'0px',
                'padding-inline':'0px',            
            }
           return {
                'width':'75px',
                'height':'75px',
                'border':`1px solid`,
                'border-color':getRariryColor(this.getSkillData(id).rarity),
                'border-radius':'0',
                'background-repeat': 'no-repeat',
                'background-position': '50% 50%',
                'color':'white',
                'font-size':'16px',
                'background-color':'rgba(29, 29, 29, 1)',
                'padding-block':'0px',
                'padding-inline':'0px',
            }
            
        },
 getTooltipStyle(data,id) {
               return{
                        'border':'2px solid transparent',
                        'border-color':getRariryColor(this.getSkillData(id).rarity),
                        'background':'#0f0f0f',
                        'width':'225px',
                        'font-size':'12px',
                        'border-image-slice': '1'
                    };
                }
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
        getEffect(data, id) {
            let scales = ['vitality_scale', 'strength_scale','agility_scale', 'intelligence_scale']
            let scaled_stats = excludeStats()
            let scaleNames = {'F': 0.10, 'E': 0.175, 'D':0.25, 'C':0.4, 'B':0.625, 'A': 0.765, 'S': 1}
            let currentEffect = 1
            let currentStat=''
            for (i in data) {
                if (scales.includes(i)) {
                    for (j in data) {
                        if (j!='speed' &&(!scaled_stats.includes(j)) && data[j]>0) {
                            let base = data[j]
                            currentStat=j
                            let subI = i
                            let statDisplay = subI.split('_')[0]
                            let mainStat = player.main.character[statDisplay].toNumber()+getSlotBuffs()[`add_${statDisplay}`]
                            let multi = (scaleNames[data[subI]]*(mainStat+1))+1
                            currentEffect += Math.log(base*multi)*(Math.sqrt(Math.pow(base,2)/multi))*(multi/10)
                        }
                    }
                }
            getGridData('main',id)[`scaled_${currentStat}`] = currentEffect
            }
            return currentEffect
},
        //Функция для текста в всплывалющем тултипе
        getTooltip(data,id) {
            let table = ''
            let statsTable = ''
            let exclude = excludeStats()
            let stats = []
            let k = 0
            let j = 0
            if (data.rarity>0) statsTable = ''
            if (data.rarity>0) table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale==undefined?"-":data.strength_scale} | Живучесть: ${data.vitality_scale==undefined?"-":data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale==undefined?"-":data.agility_scale} | Мудрость: ${data.intelligence_scale==undefined?"-":data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`
            for (i in data) {
                if (data[i]>0&&(!exclude.includes(i))) {
                    stats.push([i])
                    if (stats.length%2!=0) statsTable +=`| `
                    statsTable+=` ${getStatName(i, data[i])}`
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
                'background-image': `${data.rarity>0?`url('resources/${data.image_name}.png')`:`url('resources/rarity_${data.rarity}.png')`})`,
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
                'background-image': `${data.rarity>0?`url('resources/${data.image_name}.png')`:`url('resources/rarity_${data.rarity}.png')`}`,
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
                    let exclude = excludeStats()
                    let inventory = getSlotBuffs()
                    let playerData = player.main.character
                    for (i in inventory) {
                        if (!exclude.includes(i)) table+=` ${getPlayerStats(i, playerData[i], inventory[i])}<br>`
                    }
                    return `<div class='statDiv'><h2>Уровень персонажа - [${player.main.character.level}]</h2></div><br><h3>Характеристики персонажа</h3><hr><br><div class='statDiv'>Хар-ка</div><div class='statDiv'>Персонаж</div><div class='statDiv'>Экипировка</div><div class='statDiv'>Множ. от уровня/карт улучшения</div><br>`+table}]]],
                ]
		},
            "Skills": {
                content:[
                ["blank",['40px','100px']],
                ["column", [
                "blank",
                "skill_grid"
                    ]
                ]
         ]
		},
            "Inventory": {
                content:[
                ["blank",['40px','160px']],
                ['row',[
                ['column', [['display-text',function() {
                    let table = ''
                    let data = getSlotBuffs()
                    let exclude = excludeStats()
                    for (i in data) {
                        if (data[i]>0&&(!exclude.includes(i))) table+=` ${getStatName(i, data[i])} ${data[`scaled_${i}`]?`(+${format(data[`scaled_${i}`],2)})`:``}<br>`
                    }
                    return `<h3>Бонусы от экипировки</h3><hr>`+(table!=''?table:`<span style='color:rgba(84, 84, 84, 1); font-size:12px'>Оденьте снаряжение для получения бонусов.</span>`)}]], {'margin-right':'40px'}],
                    ['v-line', ['200px'], {'margin-left':'-20px'}],
                    getSlotDisplay()
                ]],
                "blank",
                "grid",
                "blank",
                    ]
		},
            "Forge": {
                content:[
                ["blank",['40px','160px']],
                ['row',[
                ['column', [['display-text',function() {
                    let table = ''
                       if (player.main.checkToggleSlotId!='') {
                        let currentMult = player.main.equipment[tmp.main.clickables[player.main.checkToggleSlotId].type].forgeMult-1
                        let currentForgeLevel = player.main.equipment[tmp.main.clickables[player.main.checkToggleSlotId].type].forgeLevel
                        table = `<span style='font-size:12px'>Множитель усиления экипировки:<br> [+${format(currentForgeLevel,0)}] - 
                        ${format(currentMult*100,2)}% → 
                        <span style='color:lime'>[+${format(currentForgeLevel.add(1),0)}]
                        - ${format((getNextForgeMult(player.main.checkToggleSlotId)-1)*100,2)}%</span> <br>Прирост множителя: <span style='color:lime'>
                        (+${format(((getNextForgeMult(player.main.checkToggleSlotId)-1)-currentMult)*100,2)}%, x${format(((currentMult==0?(getNextForgeMult(player.main.checkToggleSlotId)):(getNextForgeMult(player.main.checkToggleSlotId)-1)/(currentMult))),2)})</span></span></span>`}
                    return `<h3>Множитель усиления</h3><hr><br>`+table}],"blank", "buyables"], {'margin-right':'40px'}],
                    ['v-line', ['200px'], {'margin-left':'-20px'}],
                    getSlotDisplay()
                ]],
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
        getLevelMultipliers('warrior')
        updateSlotStats()
        if (player.main.character.skill.fire_tickdamage) player.main.cooldowns.burntCooldown+=diff
        if (player.main.character.healthPoints.lte(0))player.main.character.healthPoints = new Decimal(getMaxPlayerHP())
        if (player.main.floor.monster.healthPoints.lte(0))player.main.floor.monster.healthPoints = new Decimal(getMaxEnemyHP())
        player.main.character.exp =  player.main.character.exp.add(new Decimal(5).times(diff))
        player.main.cooldowns.attackCooldown+=diff
        if (player.main.cooldowns.burntCooldown>=1) {
            updateEnemyCurrentHP(getTotalAttack())
            player.main.cooldowns.burntCooldown=0
            player.main.cooldowns.burningMax -= 1
            player.main.cooldowns.burningMax = Math.max(0,player.main.cooldowns.burningMax)
        }
        if (player.main.cooldowns.attackCooldown>=(getPlayerAttackSpeed()) && getPlayerAttackSpeed()>0) {
            updateCurrentHP(player.main.floor.monster.attack)
            if (!player.main.character.skill.fire_tickdamage)updateEnemyCurrentHP(getTotalAttack())
            if (player.main.character.skill.fire_tickdamage) player.main.cooldowns.burningMax = player.main.character.skill.fire
            player.main.cooldowns.attackCooldown = 0
        }
        if (player.main.character.healthPoints.lte(0)) {
            player.main.character.healthPoints = new Decimal(getMaxPlayerHP())
            player.main.floor.monster.healthPoints = getMaxEnemyHP()

        }
        if (player.main.floor.monster.healthPoints.lte(0)) {
            player.main.character.healthPoints = new Decimal(getMaxPlayerHP())
            player.main.floor.currentMonster += 1
            player.main.floor.monster.healthPoints = getMaxEnemyHP()

        }
        if (player.main.character.exp.gte(tmp.main.getNextLevelReq)) {
            player.main.character.level = player.main.character.level.add(1)
            player.main.character.exp = new Decimal(0)
            player.main.character.healthPoints = new Decimal(getMaxPlayerHP())
        }
        for (i in player.main.clickables) getScaleBuffs(true, tmp.main.clickables[i].type)
       },
    layerShown(){return true}
})