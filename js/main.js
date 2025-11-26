
/*-------------------------
  | Функции характеристик |
  -------------------------*/
  function getCritStats() {
    let chance = getSlotBuffs().crit_chance+player.main.character.crit_chance
    let crit = getSlotBuffs().crit+player.main.character.crit+200
    return {crit_chance:chance/100, crit:crit/100}
  }
function updatePlayerStats() {
  let className = player.main.character.class
  let vitality = className=='warrior'?new Decimal(2):new Decimal(1)
  let strength = className=='warrior'?new Decimal(2):new Decimal(1)
  let defense = new Decimal(0)
  let agility = className=='archer'?new Decimal(2):new Decimal(1)
  let intelligence = className=='mage'?new Decimal(2):new Decimal(1)
  let attack = getSlotBuffs().attack
  let fire_attack = className=='mage'?new Decimal(1):new Decimal(0)
  let water_attack = className=='mage'?new Decimal(1):new Decimal(0)
  let poison_attack = className=='mage'?new Decimal(1):new Decimal(0)
  let luck = className=='archer'?new Decimal(2):new Decimal(1)
  let crit = new Decimal(0)
  let crit_chance = className=='archer'?new Decimal(5):new Decimal(0)
  let level = new Decimal(1)
  let data = player.main.cards
  /*      cards: {
        common_vit: 0,
        common_str: 0,
        common_agi: 0,
        common_int: 0,
        common_atk_amp: 0,
        common_luc: 0,
        common_def_amp: 0,
        common_fire_amp: 0,
        common_psn_amp: 0,
        common_wtr_amp: 0,
        */
  vitality = vitality.add(data.common_vit).add(className=='warrior'?buyableEffect('main',18):0)
  strength = strength.add(data.common_str).add(className=='warrior'?buyableEffect('main',18):0)
  agility = agility.add(data.common_agi).add(className=='archer'?buyableEffect('main',15):0)
  intelligence = intelligence.add(data.common_int).add(className=='intelligence'?buyableEffect('main',19):0)
  luck = luck.add(data.common_luc)
  crit_chance = crit_chance.add(className=='archer'?buyableEffect('main',16):0)
  if (vitality!=player.main.character.vitality)player.main.character.vitality = vitality
  if (strength!=player.main.character.strength)player.main.character.strength = strength
  if (agility!=player.main.character.agility)player.main.character.agility = agility
  if (intelligence!=player.main.character.intelligence)player.main.character.intelligence = intelligence
  if (luck!=player.main.character.luck)player.main.character.luck = luck
  if (crit_chance!=player.main.character.crit_chance)player.main.character.crit_chance = crit_chance
}
function getMaxPlayerHP() {
  let level = player.main.character.level;
  let baseVitScale = new Decimal(10);
  let vitality = new Decimal(getFullStat("vitality")).add(1);
  return new Decimal(100)
    .add(vitality.mul(baseVitScale))
    .mul(level.add(1).log(2));
}
function updateCurrentHP(value) {
  player.main.character.healthPoints = new Decimal(
    player.main.character.healthPoints.sub(value).max(0)
  );
}
function getMaxEnemyHP() {
  let stage = new Decimal(player.main.floor.floorNumber);
  let level = new Decimal(player.main.floor.currentMonster);
  return new Decimal(10)
    .mul(new Decimal(1.15).pow(level.pow(0.95)))
    .mul(new Decimal(stage.gte(10)?1.75:1.346).pow(stage)).pow(player.main.floor.currentMonster>=player.main.floor.monsters?1.25:1);
}
function updateEnemyCurrentHP(value) {
  player.main.floor.monster.healthPoints =
    player.main.floor.monster.healthPoints.sub(value);
}
function getPlayerAttackSpeed() {
  let totalSpeed = 0;
  let weaponSpeed = 1 / getSlotBuffs().speed;
  let skillCooldown = player.main.character.skill.cooldown;
  if (weaponSpeed && skillCooldown) totalSpeed = weaponSpeed * skillCooldown;
  return totalSpeed;
}
function getLevelMultipliers(className = "") {
  let baseMulti = [
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
    new Decimal(1),
  ];
  let playerLevel = player.main.character.level;
  let stats = ["vitality", "strength", "agility", "intelligence", "luck"];
  if (className == "warrior") {
    baseMulti = [
      new Decimal(2),
      new Decimal(2),
      new Decimal(1.5),
      new Decimal(1.5),
      new Decimal(1.05),
    ];
  }
  if (className == "archer") {
    baseMulti = [
      new Decimal(1.5),
      new Decimal(1.5),
      new Decimal(2),
      new Decimal(1.5),
      new Decimal(1.2),
    ];
  }
  if (className == "mage") {
    baseMulti = [
      new Decimal(1.5),
      new Decimal(1.5),
      new Decimal(1.5),
      new Decimal(2.25),
      new Decimal(1.05),
    ];
  }
  for (s in stats) {
    player.main.character[`multi_${stats[s]}`] = new Decimal(1);
    for (i = 2; i <= playerLevel.toNumber(); i++) {
      let multiplier = baseMulti[s].sub(
        new Decimal(0.2).mul(new Decimal(i).pow(0.5 / baseMulti[s]))
      );
      let weakMultiplier = baseMulti[s].sub(
        new Decimal(0.05).mul(new Decimal(i).pow(0.5 / baseMulti[s]))
      );
      if (baseMulti[s].gte(2))
        player.main.character[`multi_${stats[s]}`] =
          player.main.character[`multi_${stats[s]}`].mul(multiplier);
      else
        player.main.character[`multi_${stats[s]}`] =
          player.main.character[`multi_${stats[s]}`].mul(weakMultiplier);
    }
  }
}
function updateSlotScaleBuffs() {
  for (i in player.main.clickables)
    if (player.main.clickables[i].item_name) {
      getScaleBuffs(true, tmp.main.clickables[i].type);
    }
}
function getScaleBuffs(slot = false, type = "") {
  let scales = [
    "vitality_scale",
    "strength_scale",
    "agility_scale",
    "intelligence_scale",
  ];
  let scaled_stats = excludeStats();
  let scaleNames = {
    "-": 0,
    FF: 0.001,
    F: 0.1,
    E: 0.275,
    D: 0.45,
    C: 0.75,
    B: 1,
    A: 1.365,
    S: 1.75,
    SS: 2,
    SSS: 2.5,
    R: 3,
    SR: 3.75,
    SSR: 4.5,
    UR: 6,
    X: 7.5,
  };
  let data = player.main.equipment[type];
  let currentEffect = 0;
  let currentStat = "";
  for (i in data) {
    if (scales.includes(i)) {
      for (j in data) {
        if (j != "speed" && !scaled_stats.includes(j) && data[j] > 0) {
          let base = data[j];
        if (j=='attack') {
          if (player.main.cards.common_atk_amp>=1) base *= 1.05**player.main.cards.common_atk_amp
            switch (player.main.character.class) {
              case 'warrior':
                base *= buyableEffect('main',12)
                base *= buyableEffect('main',21)
                break
              case 'archer':
                base *= buyableEffect('main',13)
                base *= buyableEffect('main',22)
                break
              case 'mage':
                base *= buyableEffect('main',14)
                base *= buyableEffect('main',23)
                break
    }

    }
          currentStat = j;
          let subI = i;
          let statDisplay = subI.split("_")[0];
          let mainStat =
            (player.main.character[statDisplay].toNumber() +
              (getSlotBuffs()[`add_${statDisplay}`]
                ? getSlotBuffs()[`add_${statDisplay}`]
                : 0)) *
            player.main.character[`multi_${statDisplay}`];
          let multi = scaleNames[data[subI]] * mainStat + 1;
          if (multi > 1)
            currentEffect +=
              Math.log(base * multi) *
              Math.sqrt(Math.pow(base, 2) / multi) *
              (multi / 10);
        }
      }
    }
  }
  if (slot && currentStat != "")
    player.main.equipment[type][`scaled_${currentStat}`] = currentEffect;
}
function updateSlotStats() {
  let slot = player.main.equipment;
  let exclude = excludeStats();
  let exclude2 = ["speed", "crit_chance"];
  for (let i in slot) {
    // Инициализируем базовые статы если их нет
    if (!slot[i]._baseStats) {
      slot[i]._baseStats = {};
      for (let j in slot[i]) {
        if (
          typeof slot[i][j] === "number" &&
          j !== "forgeMult" &&
          j !== "_baseStats"
        ) {
          slot[i]._baseStats[j] =
            slot[i][j] /
            (slot[i]._baseStats["item_name"] ? slot[i].forgeMult || 1 : 1);
        }
      }
      slot[i]._baseStats["item_name"] = slot[i]["item_name"];
    }

    // Применяем умножение
    for (let j in slot[i]) {
      if (
        !exclude.includes(j) &&
        !exclude2.includes(j) &&
        i !== "speed" &&
        slot[i]._baseStats[j] > 0
      ) {
        if (
          slot[i].forgeRarity == undefined &&
          slot[i].forgeLevel == undefined &&
          slot[i].forgeMult == undefined
        ) {
          slot[i].forgeLevel = new Decimal(0);
          slot[i].forgeMult = new Decimal(1);
        }
        if (
          slot[i].rarity > slot[i].forgeRarity ||
          slot[i].rarity < slot[i].forgeRarity
        ) {
          player.main.buyables[11] = new Decimal(0);
          slot[i].forgeLevel = new Decimal(0);
          slot[i].forgeMult = new Decimal(1);
          slot[i][j] = slot[i]._baseStats[j];
        } else slot[i][j] = slot[i]._baseStats[j] * slot[i].forgeMult;
      }
    }
  }
}
function getFullStat(stat) {
  let fullstat =
    (player.main.character[`${stat}`].toNumber() +
      (getSlotBuffs()[`add_${stat}`]
        ? getSlotBuffs()[`add_${stat}`]
        : getSlotBuffs()[`${stat}`]
          ? getSlotBuffs()[`${stat}`]
          : 0)) *
    player.main.character[`multi_${stat}`];
  return fullstat;
}
function getTotalAttack() {
  let slotAttack = getSlotBuffs().attack;
  let scaleAttack = player.main.equipment.primary_weapon.scaled_attack;
  let totalAttack = slotAttack + (scaleAttack ? scaleAttack : 0);
  if (player.main.character.skill.damage)
    totalAttack = totalAttack * player.main.character.skill.damage;
  if (player.main.character.skill.fire_tickdamage)
    totalAttack = totalAttack * player.main.character.skill.fire_tickdamage;
  return totalAttack;
}
function getTotalMonsterAttack() {
  let mainAttack = player.main.floor.monster.attack
  if (player.main.floor.currentMonster==player.main.floor.monsters) mainAttack*=player.main.floor.boss.skill.damage
  if (getSlotBuffs().defense>0) mainAttack /= (getSlotBuffs().defense+getSlotBuffs().scaled_defense)**0.45
  return mainAttack;
}
function getSlotBuffs() {
  let slot = player.main.equipment;
  let data = {
    add_vitality: 0,
    add_strength: 0,
    add_agility: 0,
    add_intelligence: 0,
    attack: 0,
    speed: 0,
    defense: 0,
    luck: 0,
    fire_attack: 0,
    poison_attack: 0,
    water_attack: 0,
    scaled_attack: 0,
    scaled_defense: 0,
    scaled_luck: 0,
    crit: 0,
    crit_chance: 0,
  };
  for (i in slot) {
    for (j in data) {
      if (slot[i][j] != undefined) data[j] += slot[i][j];
    }
  }
    if (player.main.cards.common_atk_amp>=1) data['attack'] *= 1.05**player.main.cards.common_atk_amp
    switch (player.main.character.class) {
      case 'warrior':
        data['attack'] *= buyableEffect('main',12)
        data['attack'] *= buyableEffect('main',21)
        break
      case 'archer':
        data['attack'] *= buyableEffect('main',13)
        data['attack'] *= buyableEffect('main',22)
        break
      case 'mage':
        data['attack'] *= buyableEffect('main',14)
        data['attack'] *= buyableEffect('main',23)
        break
    }
  return data;
}
function applySlotBuffs() {
  let data = getSlotBuffs();
  let exclude = ["attack", "defense"];
  let playerData = player.main.character;
  for (i in player.main.character) {
    for (j in data) {
      if (i == j && j != "speed") playerData[i] = data[j];
    }
  }
  return player.main.character;
}
function getNextForgeMult(id) {
  let data =
    player.main.equipment[
      tmp.main.clickables[player.main.checkToggleSlotId].type
    ];
  let type = tmp.main.clickables[player.main.checkToggleSlotId].type;
  let level = data.forgeLevel.add(1);
  let scaleTypes = ["necklace", "ring_1", "ring_2", "bracelet"];
  let eff = new Decimal(scaleTypes.includes(type) ? 0.015 : 0.15).mul(level);
  eff = eff.mul(level.div(10).add(1)).mul(level.sqrt().div(10).add(1));
  return eff.add(1).pow(data.rarity).max(1);
}
function getSkills(id) {
  let skills = [
    {
      skill_name: "Простой удар",
      skill_image: "basic_attack",
      damage: 1,
      cooldown: 1,
      rarity: 0,
      level: 0,
    },
    {
      skill_name: "Быстрый взмах",
      skill_image: "rapid_strike",
      damage: 0.63,
      bloodlust: 3,
      cooldown: 0.365,
      rarity: 1,
      level: 0,
    },
    {
      skill_name: "Выпад щитом",
      skill_image: "shield_attack",
      damage: 2.06,
      defense_buff: 1.1,
      cooldown: 5.3,
      rarity: 1,
      level: 0,
    },
    {
      skill_name: "Двойной разрез",
      skill_image: "double_attack",
      damage: 1.45,
      cooldown: 2.73,
      rarity: 1,
      level: 0,
    },
    {
      skill_name: "Огненный удар",
      skill_image: "fire_sword",
      damage: 0,
      fire: 3,
      fire_tickdamage: 5.12,
      cooldown: 6.06,
      rarity: 2,
      level: 0,
    },
  ];
  return skills[id];
}
/*------------------------
  |  Функции для наград  |
  ------------------------*/
function getMob() {
  let stage = player.main.floor.floorNumber
  let current = player.main.floor.currentMonster
  let mobs = []
  let skill = {}
  if (stage<=99) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Высшее созвездие","Высшее созвездие","Высшее созвездие","Высшее созвездие","Созвездие Башни"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Созвездие Башни"?5000:3000,cooldown:mobs[random]=="Созвездие Башни"?15:7}
  }
  if (stage<=90) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Низший управляющий башней","Низший управляющий башней","Низший управляющий башней","Низший управляющий башней","Космический капитан"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Космический капитан"?2650:900,cooldown:mobs[random]=="Космический капитан"?7.5:5}
  }
  if (stage<=80) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Страж Башни Созвездий","Страж Башни Созвездий","Страж Башни Созвездий","Страж Башни Созвездий","Страж Пустоты"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Страж Пустоты"?850:440,cooldown:mobs[random]=="Страж Пустоты"?10:2}
  }
  if (stage<=70) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Оживший низший бог","Оживший низший бог","Оживший низший бог","Оживший низший бог","Древний высший бог"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Древний высший бог"?365:220,cooldown:mobs[random]=="Древний высший бог"?7:4}
  }
  if (stage<=50) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Древняя статуя","Древняя статуя","Древняя статуя","Древняя статуя","Живая статуя бога"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Живая статуя бога"?125:80,cooldown:mobs[random]=="Живая статуя бога"?5:2.5}
  }
  if (stage<=40) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Адский Демон","Адский Демон","Адский Демон","Адский Демон","Высший дьявол"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Высший дьявол"?35:20,cooldown:mobs[random]=="Высший дьявол"?3:1.5}
  }
  if (stage<=30) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Огненный Слизень","Огненный Слизень","Огненный Слизень","Огненный Слизень","Огненный Элементаль"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Огненный Элементаль"?10:5,cooldown:mobs[random]=="Огненный Элементаль"?1.5:0.7}
  }
  if (stage<=20) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Гоблин","Гоблин","Гоблин","Гоблин","Ork"]
    mobs = mobs[random]
    skill = {damage:mobs[random]=="Ork"?2:1,cooldown:mobs[random]=="Ork"?2:1}
  }
  if (stage<=10) {
    let random = Math.floor(Math.random()*(5-0)+0)
    mobs = ["Слизень","Слизень","Слизень","Слизень","Гоблин"]
    mobs = mobs[random]
    console.log(random)
    skill = {damage:mobs[random]=="Гоблин"?1.25:1,cooldown:mobs[random]=="Гоблин"?1:0.75}
  }
  if (stage<=3) {
    mobs = "Слизень"
    skill = {damage:1,cooldown:0.75}
  }
  player.main.floor.monster.name=mobs
  player.main.floor.monster.attack = 5*(stage**1.25)*(stage>10?(((stage-10)+1)**1.15):1)*((current*0.1)+1)
  if (player.main.floor.currentMonster==player.main.floor.monsters) {
    player.main.floor.monster.name="[Босс] "+mobs
    player.main.floor.boss.skill = skill}
}
function getStageRewards() {
  let monstersOnStage = player.main.floor.monsters;
  let stage = new Decimal(player.main.floor.floorNumber);
  let level = new Decimal(player.main.floor.floorLvl);
  let luck = new Decimal(getFullStat("luck")).add(1);
  let gold = new Decimal(1.15)
    .mul(stage.mul(level))
    .mul(monstersOnStage)
    .pow(new Decimal(1).add(luck.max(1).log10())).mul(player.main.floor.currentMonster==monstersOnStage?10:1);
  let exp = new Decimal(0.5)
    .mul(stage.mul(level).mul(1.5))
    .pow(1.1)
    .mul(monstersOnStage)
    .pow(luck.max(1).log2().pow(0.55).add(1));
  return { gold: gold, exp: exp };
}
function getItemDropChances() {
  let stage = player.main.floor.floorNumber;
  let luck = getFullStat("luck");
  let chances = [0, 0, 0, 0, 0, 0, 0, 0];
  if (stage <= 100) {
    chances = [0, 0, 0, 0, 0, 0, 0, 1e-9 * stage];
  }
  if (stage <= 90) {
    chances = [
      0,
      0,
      0,
      0,
      0.0035 * stage,
      0.001 * stage,
      (1 / 10000000) * stage,
      0,
    ];
  }
  if (stage <= 80) {
    chances = [0, 0, 0, 0, 0.0025 * stage, 0.00001 * stage, 0, 0];
  }
  if (stage <= 65) {
    chances = [0, 0, 0.012 * stage, 0.01 * stage, 0.001 * stage, 0, 0, 0];
  }
  if (stage <= 40) {
    chances = [0, 0, 0.2 * stage, 0.01 * stage, 0, 0, 0, 0];
  }
  if (stage <= 30) {
    chances = [
      15 - stage / 3,
      30 * (stage ** 0.15 / 5),
      0.12 * stage,
      0,
      0,
      0,
      0,
      0,
    ];
  }
  if (stage <= 20) {
    chances = [2 + stage * 2, 1 + stage * 1.35, 0, 0, 0, 0, 0];
  }
  if (stage <= 10) {
    chances = [9 * stage + luck, 0, 0, 0, 0, 0, 0];
  }
  for (i = 0; i < chances.length; i++) {
    if (chances[i] >= 0)
      chances[i] *= new Decimal(luck)
        .add(1)
        .div(10)
        .add(1)
        .pow(0.35 * (stage > 80 && i > 5 ? 2.5 : 1)).min(1)
        .toNumber();
    chances[i] = chances[i] / 100;
  }
  return chances;
}
/*------------------------
  | Функции для престижа |
  ------------------------*/
  function getPrestigeCurrencyGain() {
    let totalGold = player.main.totalGold
    let level = player.main.character.level
    let gain = new Decimal(2).mul(totalGold.root(10).max(1).pow(0.75)).mul(level.max(1).root(2).pow(1.5).add(1)).mul(level.gte(10)?level.max(1).root(1.5).pow(1.15).add(1):1)
    return gain
  }
/*--------------
  | UI функции |
  --------------*/
function getClassName(className) {
  switch (className) {
    case 'warrior':
      return 'Воин'
      break
    case 'archer':
      return 'Лучник'
      break
    case 'mage':
      return 'Маг'
      break
    case 'none':
      return 'Человек'
      break
  }
}
function getRarityName(rarity) {
  switch (rarity) {
    case 1:
      return "(Обычный)";
      break;
    case 2:
      return "(Необычный)";
      break;
    case 3:
      return "(Редкий)";
      break;
    case 4:
      return "(Эпический)";
      break;
    case 5:
      return "(Легендарный)";
      break;
    case 6:
      return "(Мифический)";
      break;
    case 7:
      return "(Экзотический)";
      break;
    case 8:
      return "(Уникальный)";
      break;
    case 8:
      return "(Секретный)";
      break;
  }
}
function getRariryColor(rarity) {
  switch (rarity) {
    case 0:
      return "rgba(75, 75, 75, 1)";
      break;
    case 1:
      return "rgba(156, 156, 156, 1)";
      break;
    case 2:
      return "rgba(7, 206, 0, 1)";
      break;
    case 3:
      return "rgba(25, 0, 255, 1)";
      break;
    case 4:
      return "rgba(255, 0, 242, 1)";
      break;
    case 5:
      return "rgba(255, 183, 0, 1)";
      break;
    case 6:
      return "rgba(255, 98, 0, 1)";
      break;
    case 7:
      return "rgba(255, 0, 0, 1)";
      break;
    case 8:
      return "rgba(0, 238, 255, 1)";
      break;
  }
}
function getSlotDisplay() {
  let table = [
    "column",
    [
      [
        "row",
        [
          ["clickable", [11]],
          ["blank", ["165px", "80px"]],
          ["clickable", [12]],
        ],
      ],
      [
        "row",
        [
          ["clickable", [13]],
          ["blank", ["165px", "80px"]],
          ["clickable", [15]],
        ],
      ],
      [
        "row",
        [
          ["clickable", [14]],
          ["blank", ["165px", "80px"]],
          ["clickable", [16]],
        ],
      ],
      [
        "row",
        [
          ["clickable", [17]],
          ["blank", ["5px", "80px"]],
          ["clickable", [18]],
          ["blank", ["5px", "80px"]],
          ["clickable", [19]],
          ["blank", ["5px", "80px"]],
          ["clickable", [20]],
        ],
      ],
    ],
    { "margin-right": "40px" },
  ];
  return table;
}
function excludeStats() {
  let scaled_stats = [
    "rarity",
    "scaled_attack",
    "scaled_defense",
    "scaled_luck",
    "forgeMult",
    "forgeLevel",
    "forgeRarity",
  ];
  return scaled_stats;
}
//Функция для вывода названия оружия
function getEquipTypeName(type) {
  switch (type) {
    case "sword":
      return "[Меч - Осн. оружие - Воин]";
      break;
    case "dagger":
      return "[Короткий меч - Доп. оружие - Лучник]";
      break;
    case "bow":
      return "[Лук - Осн. оружие - Лучник]";
      break;
    case "staff":
      return "[Посох - Осн. оружие - Маг]";
      break;
    case "shield":
      return "[Щит - Доп. оружие - Воин]";
      break;
    case "grimoire":
      return "[Гримуар - Доп. оружие - Маг]";
      break;
    case "helmet":
      return "[Шлем]";
      break;
    case "chestplate":
      return "[Нагрудник]";
      break;
    case "leggings":
      return "[Поножи]";
      break;
    case "boots":
      return "[Ботинки]";
      break;
    case "ring":
      return "[Кольцо]";
      break;
    case "necklace":
      return "[Ожерелье]";
      break;
    case "bracelet":
      return "[Браслет]";
      break;
  }
}
//Функция для вывода характеристик снаряжения
function getStatName(stat, value) {
  switch (stat) {
    case "attack":
      return `Атака: +${format(value, 2)}`;
      break;
    case "speed":
      return `Скорость: ${format(value / 1, 2)}/сек`;
      break;
    case "fire_attack":
      return `Огненный урон: +${format(value, 0)}`;
      break;
    case "water_attack":
      return `Водный урон: +${format(value, 0)}`;
      break;
    case "poison_attack":
      return `Отравление: +${format(value, 0)}`;
      break;
    case "defense":
      return `Защита: +${format(value, 0)}`;
      break;
    case "luck":
      return `Удача: +${format(value, 0)}`;
      break;
    case "add_strength":
      return `Сила: +${format(value, 0)}`;
      break;
    case "add_vitality":
      return `Живучесть: +${format(value, 0)}`;
      break;
    case "add_agility":
      return `Ловкость: +${format(value, 0)}`;
      break;
    case "add_intelligence":
      return `Мудрость: +${format(value, 0)}`;
      break;
    case "crit_chance":
      return `Шанс крита: +${format(value, 0)}%`;
      break;
    case "crit":
      return `Крит урон: +${format(value, 0)}%`;
      break;
  }
}
//Функция для вывода основных характеристик персонажа
function getPlayerStats(stat, value, bonus) {
  switch (stat) {
    case "add_strength":
      return `<div class='statDiv'>Сила</div><div class='statDiv'>${format(player.main.character.strength, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_strength, 2)} | -</div>`;
      break;
    case "add_vitality":
      return `<div class='statDiv'>Живучесть:</div><div class='statDiv'>${format(player.main.character.vitality, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_vitality, 2)} | -</div>`;
      break;
    case "add_agility":
      return `<div class='statDiv'>Ловкость:</div><div class='statDiv'>${format(player.main.character.agility, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_agility, 2)} | -</div>`;
      break;
    case "add_intelligence":
      return `<div class='statDiv'>Мудрость:</div><div class='statDiv'>${format(player.main.character.intelligence, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_intelligence, 2)} | -</div>`;
      break;
    case "attack":
      return `<div class='statDiv'>Атака:</div><div class='statDiv'></div><div class='statDiv'>${format(bonus, 2)} (${format(getSlotBuffs()["scaled_attack"], 2)})</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1.05**player.main.cards.common_atk_amp, 2)}</div>`;
      break;
    case "speed":
      return `<div class='statDiv'>Скорость атаки:</div><div class='statDiv'>${format(player.main.character.skill.cooldown ? player.main.character.skill.cooldown : 0, 2)}/сек</div><div class='statDiv'>
        ${format(bonus != 0 ? bonus / 1 : 0, 2)}/сек</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | -</div>`;
      break;
    case "defense":
      return `<div class='statDiv'>Защита:</div><div class='statDiv'>${format(value, 0)}</div><div class='statDiv'>${format(bonus, 0)} (${format(getSlotBuffs()["scaled_defense"], 2)})</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
    case "luck":
      return `<div class='statDiv'>Удача:</div><div class='statDiv'>${format(value, 0)}</div><div class='statDiv'>${format(bonus, 0)} (${format(getSlotBuffs()["scaled_luck"], 2)})</div><div class='statDiv' style='width:260px'>x${format(player.main.character.multi_luck, 2)} | -</div>`;
      break;
    case "fire_attack":
      return `<div class='statDiv'>Огненный урон:</div><div class='statDiv'>${format(value, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
    case "water_attack":
      return `<div class='statDiv'>Водный урон:</div><div class='statDiv'>${format(value, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
    case "poison_attack":
      return `<div class='statDiv'>Отравление:</div><div class='statDiv'>${format(value, 0)}</div><div class='statDiv'>${format(bonus, 0)}</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
    case "crit_chance":
      return `<div class='statDiv'>Шанс крита : </div><div class='statDiv'>${format(value, 0)}%</div><div class='statDiv'>${format(bonus, 0)}%</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
    case "crit":
      return `<div class='statDiv'>Крит. урон: </div><div class='statDiv'>${format(value + 100, 0)}%</div><div class='statDiv'>${format(bonus, 0)}%</div><div class='statDiv' style='width:260px'>x${format(1, 2)} | x${format(1, 2)}</div>`;
      break;
  }
}
/*----------------------------
  |  Функции для инвентаря   |
  |  Функции для карт улучш. |
  ----------------------------*/
function toggleGridAndSlot(type) {
  if (
    player.main.checkToggleGridId != "" &&
    player.main.checkToggleSlotId != ""
  ) {
    if (player.main.grid[player.main.checkToggleGridId].item_name!='Debug')console.log(getGridData("main", player.main.checkToggleGridId));
    let slotData = player.main.equipment[type];
    let temp1 = player.main.equipment[type].forgeLevel;
    let temp2 = player.main.equipment[type].forgeMult;
    let rarity = player.main.equipment[type].forgeRarity!=0?player.main.equipment[type].forgeRarity:player.main.equipment[type].rarity;
    if (!(player.main.grid[player.main.checkToggleGridId].item_name=='Debug') && player.main.grid[player.main.checkToggleGridId].item_type!='none') player.main.equipment[type] = getGridData(
      "main",
      player.main.checkToggleGridId
    );
    else player.main.equipment[type] = {         
          item_type: `${type}`,
          level: 0,
          rarity: 0,
          forgeMult: temp2,
          forgeLevel: temp1,
          forgeRarity: rarity
        }
    player.main.grid[player.main.checkToggleGridId] = slotData;
    if (player.main.equipment[type].rarity!=0&&player.main.equipment[type].forgeRarity!=0)player.main.equipment[type].forgeRarity=player.main.equipment[type].rarity
    console.log(player.main.equipment[type].forgeRarity,rarity,player.main.equipment[type].rarity)
    if (
      player.main.equipment[type].rarity >
        rarity ||
      player.main.equipment[type].rarity <
        rarity && player.main.equipment[type].rarity!=0
    ) {
      player.main.equipment[type].forgeLevel = new Decimal(0);
      player.main.equipment[type].forgeMult = new Decimal(1);
    } else {
      player.main.equipment[type].forgeLevel = temp1;
      player.main.equipment[type].forgeMult = temp2;
    }

    let stats = [
      "attack",
      "defense",
      "fire_attack",
      "water_attack",
      "poison_attack",
      "luck",
      "add_strength",
      "add_vitality",
      "add_agility",
      "add_intelligence",
    ];

    for (let stat of stats) {
      if (player.main.grid[player.main.checkToggleGridId][stat] !== undefined) {
        let newValue =
          player.main.grid[player.main.checkToggleGridId][stat] / temp2;
        if (!isNaN(newValue)) {
          player.main.grid[player.main.checkToggleGridId][stat] = newValue;
        }
      }
    }

    player.main.checkToggleGridId = "";
    player.main.checkToggleGridId_2 = "";
    player.main.checkToggleSlotId = "";
  }
  if (
    player.main.checkToggleSlotId != "" &&
    player.main.checkToggleGridId != "" &&
    player.main.equipment[type].item_name != ""
  ) {
    let rarity = player.main.equipment[type].forgeRarity;
    let temp1 = player.main.equipment[type].forgeLevel;
    let temp2 = player.main.equipment[type].forgeMult;
    let slotData = player.main.equipment[type];
    let gridable = player.main.grid[player.main.checkToggleGridId];
    player.main.grid[player.main.checkToggleGridId] = slotData;
    player.main.equipment[type] += gridable;
    if (
      player.main.equipment[type].rarity >
        rarity ||
      player.main.equipment[type].rarity <
        rarity
    ) {
      player.main.equipment[type].forgeLevel = temp1;
      player.main.equipment[type].forgeMult = temp2;
    }
    console.log(player.main.grid[player.main.checkToggleGridId].attack / temp2);
    if (!isNaN(player.main.grid[player.main.checkToggleGridId].attack / temp2))
      player.main.grid[player.main.checkToggleGridId].attack / temp2;
    player.main.checkToggleGridId = "";
    player.main.checkToggleGridId_2 = "";
    player.main.checkToggleSlotId = "";
  }
}
function toggleGrids() {
  if (
    player.main.checkToggleGridId != "" &&
    player.main.checkToggleGridId_2 != ""
  ) {
    let grid_1 = getGridData("main", player.main.checkToggleGridId);
    let grid_2 = getGridData("main", player.main.checkToggleGridId_2);
    player.main.grid[player.main.checkToggleGridId] = grid_2;
    player.main.grid[player.main.checkToggleGridId_2] = grid_1;
    if (player.main.grid[player.main.checkToggleGridId] != grid_1) {
      player.main.checkToggleGridId = "";
      player.main.checkToggleGridId_2 = "";
    }
  }
}
function getCard(id, skillId = undefined) {
  if (skillId != undefined) player.main.skill_grid[skillId].duplicates += 1;
  else if (id != undefined) player.main.cards[id] += 1;
  player.main.character.skill_choose = {};
  player.inCardChoose = false;
}
function setClass(className) {
  player.main.character.class = className
  player.inClassChoose = false;
}
//Функция для основных кнопок
function setSubtab(id) {
  player.tab = "main";
  player.subtabs[player.tab].mainTabs = "Inventory";
  switch (id) {
    case "tree":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Tree";
      break;
    case "pres":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Prestige";
      break;
    case "inv":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Inventory";
      break;
    case "player":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Player";
      break;
    case "skill":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Skills";
      break;
    case "forge":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Forge";
      break;
    case "pres":
      player.tab = "main";
      player.subtabs[player.tab].mainTabs = "Prestige";
      break;
    case "shop":
      return "(Легендарный)";
      break;
    case 6:
      return "(Мифический)";
      break;
    case 7:
      return "(Экзотический)";
      break;
    case 8:
      return "(Уникальный)";
      break;
    case 8:
      return "(Секретный)";
      break;
  }
}
/*---------------------------------------------
  |  Предметы/карты улучшения разной редкости  |
  ---------------------------------------------*/
function getCommonWeapon(ifSingleId = false, itemId) {
  let className = player.main.character.class;
  let chosenPool = [];
  let classPool = [];
  let fullPool = [
    {
      item_type: "chestplate",
      item_subtype: "chestplate",
      image_name: "rusty_chestplate",
      item_name: "Поржавевшый Нагрудник",
      level: 0,
      defense: 9,
      attack: 0,
      rarity: 1,
    },
    {
      item_type: "helmet",
      item_subtype: "helmet",
      image_name: "rusty_helmet",
      item_name: "Поржавевший Шлем",
      level: 0,
      defense: 4,
      rarity: 1,
    },
    {
      item_type: "leggings",
      item_subtype: "leggings",
      image_name: "rusty_leggings",
      item_name: "Поржавевшие Поножи",
      level: 0,
      defense: 6,
      rarity: 1,
    },
    {
      item_type: "boots",
      item_subtype: "boots",
      image_name: "rusty_boots",
      item_name: "Кожаные Ботинки",
      level: 0,
      defense: 3,
      rarity: 1,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "iron_ring",
      item_name: "Железное Кольцо",
      level: 0,
      add_strength: 2,
      rarity: 1,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "magic_ring",
      item_name: "Кольцо с магическим камнем",
      level: 0,
      add_intelligence: 3,
      rarity: 1,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "lucky_ring",
      item_name: "Кольцо с Четырёхлистным клевером",
      level: 0,
      luck: 3,
      rarity: 1,
    },
    {
      item_type: "necklace",
      item_subtype: "necklace",
      image_name: "silver_necklace",
      item_name: "Серебрянная цепочка",
      level: 0,
      add_strength: 1,
      add_vitality: 1,
      add_agility: 1,
      add_intelligence: 1,
      rarity: 1,
    },
    {
      item_type: "necklace",
      item_subtype: "necklace",
      image_name: "golden_seal",
      item_name: "Позолоченная печать",
      level: 0,
      luck: 2,
      rarity: 1,
    },
    {
      item_type: "bracelet",
      item_subtype: "bracelet",
      image_name: "red_string",
      item_name: "Красная нить",
      level: 0,
      luck: 3,
      rarity: 1,
    },
    {
      item_type: "bracelet",
      item_subtype: "bracelet",
      image_name: "stone_bracelet",
      item_name: "Браслет из камней",
      level: 0,
      add_vitality: 1,
      rarity: 1,
    },
  ];
  if (className == "warrior") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_subtype: "sword",
        image_name: "rusty_sword",
        item_name: "Ржавый меч",
        level: 0,
        attack: 12,
        strength_scale: "FF",
        speed: 0.9,
        rarity: 1,
      },
      {
        item_type: "secondary_weapon",
        item_name: "Дряхлый щит",
        image_name: "old_shield",
        item_subtype: "shield",
        level: 0,
        defense: 6,
        rarity: 1,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (className == "archer") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_name: "Рассохшийся лук",
        image_name: "old_bow",
        item_subtype: "bow",
        level: 0,
        agility_scale: "FF",
        attack: 9,
        speed: 1.1,
        rarity: 1,
      },
      {
        item_type: "secondary_weapon",
        item_subtype: "dagger",
        image_name: "cracked_dagger",
        item_name: "Потрескавшийся короткий меч",
        level: 0,
        attack: 4,
        rarity: 1,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (className == "mage") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_name: "Простой посох",
        image_name: "simple_staff",
        item_subtype: "staff",
        intelligence_scale: "FF",
        level: 0,
        attack: 3,
        speed: 1.3,
        fire_attack: 4.5,
        rarity: 1,
      },
      {
        item_type: "secondary_weapon",
        item_name: "Старинный Гримуар",
        image_name: "ancient_grimoire",
        item_subtype: "grimoire",
        level: 0,
        attack: 1,
        rarity: 1,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (ifSingleId) return chosenPool[0][itemId];
  else return chosenPool[0];
}
function getUncommonWeapon(ifSingleId = false, itemId) {
  let className = player.main.character.class;
  let chosenPool = [];
  let classPool = [];
  let fullPool = [
    {
      item_type: "chestplate",
      item_subtype: "chestplate",
      image_name: "chain_chestplate",
      item_name: "Кольчужный Нагрудник",
      level: 0,
      vitality_scale: "F",
      agility_scale: "F",
      intelligence_scale: "F",
      defense: 16,
      attack: 0,
      rarity: 2,
    },
    {
      item_type: "helmet",
      item_subtype: "helmet",
      image_name: "chain_helmet",
      item_name: "Кольчужный Шлем",
      level: 0,
      vitality_scale: "F",
      agility_scale: "F",
      intelligence_scale: "F",
      defense: 7,
      rarity: 2,
    },
    {
      item_type: "leggings",
      item_subtype: "leggings",
      image_name: "chain_leggings",
      item_name: "Кольчужные Поножи",
      vitality_scale: "F",
      agility_scale: "F",
      intelligence_scale: "F",
      level: 0,
      defense: 8,
      rarity: 2,
    },
    {
      item_type: "boots",
      item_subtype: "boots",
      image_name: "old_boots",
      item_name: "Старые ботинки",
      vitality_scale: "F",
      agility_scale: "F",
      intelligence_scale: "F",
      level: 0,
      defense: 5,
      rarity: 2,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "wold_fang_ring",
      item_name: "Кольцо из клыка волка",
      level: 0,
      add_strength: 4,
      crit_chance: 1,
      rarity: 2,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "magic_orb_ring",
      item_name: "Кольцо со сферой стихий",
      level: 0,
      add_intelligence: 5,
      attack: 2,
      rarity: 2,
    },
    {
      item_type: "ring",
      item_subtype: "ring",
      image_name: "semi_golden_ring",
      item_name: "Позолоченное кольцо",
      level: 0,
      luck: 3,
      rarity: 2,
    },
    {
      item_type: "necklace",
      item_subtype: "necklace",
      image_name: "silver_necklace",
      item_name: "Ожерелье из глаза гоблина",
      level: 0,
      crit_chance: 2,
      attack: 3,
      rarity: 2,
    },
    {
      item_type: "necklace",
      item_subtype: "necklace",
      image_name: "golden_runic_seal",
      item_name: "Позолоченная руническая печать",
      level: 0,
      luck: 6,
      rarity: 2,
    },
    {
      item_type: "bracelet",
      item_subtype: "bracelet",
      image_name: "ente_root",
      item_name: "Закругленный корень энта",
      level: 0,
      crit: 5,
      add_strength: 2,
      rarity: 2,
    },
    {
      item_type: "bracelet",
      item_subtype: "bracelet",
      image_name: "speed_bracelet",
      item_name: "Браслет скорости",
      level: 0,
      add_agility: 2,
      rarity: 2,
    },
  ];
  if (className == "warrior") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_subtype: "sword",
        image_name: "old_warrior_sword",
        item_name: "Старый меч воина",
        strength_scale: "F",
        level: 0,
        attack: 21,
        speed: 0.85,
        rarity: 2,
      },
      {
        item_type: "secondary_weapon",
        item_name: "Деревянный щит",
        image_name: "wooden_shield",
        item_subtype: "shield",
        level: 0,
        defense: 12,
        vitality_scale: "F",
        rarity: 2,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (className == "archer") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_name: "Длинный лук",
        image_name: "long_bow",
        item_subtype: "bow",
        level: 0,
        attack: 14,
        agility_scale: "F",
        speed: 1,
        rarity: 2,
      },
      {
        item_type: "secondary_weapon",
        item_subtype: "dagger",
        image_name: "cracked_dagger",
        item_name: "Потрескавшийся короткий меч",
        intelligence_scale: "F",
        level: 0,
        attack: 4,
        rarity: 2,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (className == "mage") {
    classPool = [
      {
        item_type: "primary_weapon",
        item_name: "Посох с плохим магическим камнем",
        image_name: "magic_stone_staff",
        item_subtype: "staff",
        intelligence_scale: "F",
        level: 0,
        attack: 8,
        speed: 1.25,
        rarity: 2,
      },
      {
        item_type: "secondary_weapon",
        item_name: "Фолиант ученика",
        image_name: "rookie_grimoire",
        item_subtype: "grimoire",
        level: 0,
        attack: 3,
        intelligence_scale: "F",
        rarity: 2,
      },
    ];
    chosenPool.push(fullPool.concat(classPool));
  }
  if (ifSingleId) return chosenPool[0][itemId];
  else return chosenPool[0];
}
function getCommonUC(skill = false) {
  let className = player.main.character.class;
  let chosenPool = [];
  let fullPool = [
    {
      card_name: "Листок с острыми углами",
      description: "Сила персонажа ",
      value: 1,
      amplify: false,
      card_id: "common_str",
      rarity: 1,
    },
    {
      card_name: "Толстый лист",
      description: "Живучесть персонажа ",
      value: 1,
      amplify: false,
      card_id: "common_vit",
      rarity: 1,
    },
    {
      card_name: "Тонкий лист",
      description: "Ловкость персонажа",
      value: 1,
      amplify: false,
      card_id: "common_agi",
      rarity: 1,
    },
    {
      card_name: "Лист с древними надписями",
      description: "Мудрость персонажа",
      value: 1,
      amplify: false,
      card_id: "common_int",
      rarity: 1,
    },
    {
      card_name: "Лист на удачу",
      description: "Удача персонажа",
      value: 1,
      amplify: false,
      card_id: "common_luc",
      rarity: 1,
    },
    {
      card_name: "Печать усиления",
      description: "Атака оружия ",
      value: 5,
      amplify: true,
      card_id: "common_atk_amp",
      rarity: 1,
    },
    {
      card_name: "Печать стойкости",
      description: "Защита персонажа ",
      value: 5,
      amplify: true,
      card_id: "common_def_amp",
      rarity: 1,
    },
    {
      card_name: "Лист с обугленными краями",
      description: "Огненный урон персонажа ",
      value: 5,
      amplify: true,
      card_id: "common_fire_amp",
      rarity: 1,
    },
    {
      card_name: "Пропитанный ядом лист",
      description: "Урон отравлением персонажа ",
      value: 5,
      amplify: true,
      card_id: "common_psn_amp",
      rarity: 1,
    },
    {
      card_name: "Промоченный лист",
      description: "Водный урон персонажа ",
      value: 5,
      amplify: true,
      card_id: "common_wtr_amp",
      rarity: 1,
    },
  ];
  let skillPool = [
    {
      card_name: "Быстрый взмах",
      description: "Получить дупликат навыка",
      skillId: 102,
      rarity: 1,
    },
    {
      card_name: "Двойной разрез",
      description: "Получить дупликат навыка",
      skillId: 104,
      rarity: 1,
    },
    {
      card_name: "Выпад щитом",
      description: "Получить дупликат навыка",
      skillId: 103,
      rarity: 1,
    },
  ];
  if ((className = "warrior")) {
    if (skill == false) chosenPool.push(fullPool);
    else chosenPool.push(skillPool);
  }
  return chosenPool;
}
function getRandomCards() {
  let cards = getCommonUC(false)[0];
  let skillCards = getCommonUC(true)[0];

  let chosenCards = [];
  let rand = 1000;
  for (i = 1; i <= 3; i++) {
    if (i < 3) {
      rand = Math.floor(Math.random() * (cards.length - 0) + 0);
      chosenCards.push(cards[rand]);
    } else {
      rand = Math.floor(Math.random() * (skillCards.length - 0) + 0);
      chosenCards.push(skillCards[rand]);
    }
  }
  return chosenCards;
}
//Основная часть игры
addLayer("main", {
  name: "game", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      gold: new Decimal(0),
      fame_coins: new Decimal(0),
      totalGold: new Decimal(0),
      checkToggleGridId: "",
      checkToggleGridId_2: "",
      checkToggleSlotId: "",
      checkToggleType: "",
      cards: {
        common_vit: 0,
        common_str: 0,
        common_agi: 0,
        common_int: 0,
        common_atk_amp: 0,
        common_luc: 0,
        common_def_amp: 0,
        common_fire_amp: 0,
        common_psn_amp: 0,
        common_wtr_amp: 0,
      },
      floor: {
        floorNumber: 1,
        floorLvl: 1,
        monsters: 5,
        currentMonster: 1,
        totalExp: 0,
        totalGold: 0,
        monster: {
          name: '',
          healthPoints: new Decimal(0),
          level: new Decimal(1),
          currentHP: new Decimal(100),
          manaPoints: new Decimal(100),
          attack: 10,
          attack_speed: 0,
          attackBleed: 0,
          attackFire: 0,
          attackPoison: 0,
        },
        boss: {
          healthPoints: new Decimal(100),
          manaPoints: new Decimal(100),
          skill: {},
          attack: 0,
          attack_speed: 0,
        },
      },
      equipment: {
        helmet: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        chestplate: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        leggings: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        boots: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        primary_weapon: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        secondary_weapon: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        ring_1: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        necklace: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        ring_2: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
        bracelet: {
          item_type: "none",
          level: 0,
          rarity: 0,
          forgeMult: new Decimal(1),
          forgeLevel: new Decimal(0),
          forgeRarity: 0,
        },
      },
      character: {
        class: "none",
        add_strength: 0,
        add_vitality: 0,
        add_agility: 0,
        add_intelligence: 0,
        currentHP: new Decimal(100),
        healthPoints: new Decimal(0),
        manaPoints: new Decimal(100),
        vitality: new Decimal(0),
        strength: new Decimal(0),
        defense: new Decimal(0),
        agility: new Decimal(0),
        intelligence: new Decimal(0),
        attack: new Decimal(0),
        fire_attack: new Decimal(0),
        water_attack: new Decimal(0),
        poison_attack: new Decimal(0),
        luck: new Decimal(0),
        crit: 0,
        crit_chance: 0,
        level: new Decimal(1),
        exp: new Decimal(0),
        skill: {},
      },
      cooldowns: {
        attackCooldown: 0,
        monsterAttackCooldown:0,
        burntCooldown: 0,
        bleedingTimer: 0,
        poisonTimer: 0,
        burningMax: 0,
      },
    };
  },
  color: "white",
  baseAmount() {
    return player.points;
  },
  type: "normal",
  getExpBarStyle() {
    return {
      background:
        "linear-gradient(to right, aqua ${player.main.character.exp.add(15)}px, grey ${tmp.main.getNextLevelReq}px)",
      width: "100%",
      height: "15px",
      position: "absolute",
      bottom: "1px",
    };
  },
  getNextLevelReq() {
    let currentLevel = player.main.character.level;
    let req = new Decimal(10)
      .pow(currentLevel)
      .pow(new Decimal(0.325).pow(currentLevel).add(1));
    return req;
  },
  //Слоты для персонажа (отдельный объект от основного инвентаря)
  clickables: {
    11: {
      type() {
        return "primary_weapon";
      },
      forgeLevel() {
        let level = new Decimal(0);
        return level;
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            ` ${getRarityName(data.rarity)}` +
            `</h3><span style='color:rgba(119, 119, 119, 1); font-size:12px'>${getStatName("speed", data["speed"])}</span><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            if (i != "speed")
              statsTable += ` ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `<span style="font-size:10px">(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0 && i > 1) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    12: {
      type() {
        return "secondary_weapon";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "border-image-slice": "1",
          "font-size": "12px",
        };
      },
    },
    13: {
      type() {
        return "helmet";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          "font-size": "12px",
          width: "225px",
          "border-image-slice": "1",
        };
      },
    },
    14: {
      type() {
        return "chestplate";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          "font-size": "12px",
          width: "225px",
          "border-image-slice": "1",
        };
      },
    },
    15: {
      type() {
        return "leggings";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    16: {
      type() {
        return "boots";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    17: {
      type() {
        return "ring_1";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              "ring"
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            "ring"
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : "ring"}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : "ring"}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    18: {
      type() {
        return "bracelet";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    19: {
      type() {
        return "necklace";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              this.type()
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            this.type()
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : this.type()}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
    20: {
      type() {
        return "ring_2";
      },
      display() {
        return player.main.equipment[this.type()].item_name
          ? `<h5>${player.main.equipment[this.type()].item_name}</h5>`
          : "";
      },
      canClick() {
        if (!player.main.equipment[this.type()].item_name)
          return (
            player.main.checkToggleGridId &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              "ring"
          );
        else if (
          player.main.equipment[this.type()].item_name &&
          player.main.checkToggleGridId
        )
          return (
            getGridData("main", player.main.checkToggleGridId).item_type ==
            "ring"
          );
        else return true;
      },
      onClick() {
        if (player.main.checkToggleSlotId == this.id)
          player.main.checkToggleSlotId = "";
        else player.main.checkToggleSlotId = this.id;
        if (player.main.checkToggleGridId != "") toggleGridAndSlot(this.type());
      },
      tooltip() {
        let exclude = excludeStats();
        let data = player.main.equipment[this.type()];
        let table = "";
        let stats = [];
        let statsTable = "";
        if (data.rarity > 0) statsTable = "";
        if (data.rarity > 0)
          table =
            `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name}` +
            (player.main.equipment[this.type()].forgeLevel
              ? ` +${player.main.equipment[this.type()].forgeLevel} `
              : " ") +
            `${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
        for (i in data) {
          if (data[i] > 0 && !exclude.includes(i)) {
            stats.push([i]);
            if (stats.length % 2 != 0) statsTable += `| `;
            statsTable += `<span style="font-size:10px"> ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})</span>` : ``}`;
            if (stats.length % 2 != 0) statsTable += ` |`;

            if (stats.length % 2 == 0) statsTable += " |<br>";
          }
        }
        return table + statsTable;
      },
      style() {
        if (player.main.checkToggleSlotId == this.id)
          return {
            width: "75px",
            "min-height": "75px",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : "ring"}.png')`,
            border: "4px solid rgba(248, 175, 49, 1)",
          };
        else
          return {
            width: "75px",
            "min-height": "75px",
            border: "4px solid rgba(182, 150, 96, 1)",
            "border-radius": "0",
            "background-repeat": "no-repeat",
            "background-position": "50% 50%",
            color: "white",
            "font-size": "16px",
            "background-image": `url('resources/${player.main.equipment[this.type()].rarity ? `rarity_` + player.main.equipment[this.type()].rarity : "ring"}.png')`,
          };
      },
      tooltipStyle() {
        return {
          border: "4px solid transparent",
          "border-image":
            "linear-gradient(to right, rgba(182, 150, 96, 1) 0%, rgba(235, 194, 122, 1) 50%,rgba(182, 150, 96, 1) 100%)",
          background: "#0f0f0f",
          width: "225px",
          "font-size": "12px",
          "border-image-slice": "1",
        };
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        return new Decimal(0).mul(x);
      },
      display() {
        return "<h5>Усилить экипировку в данном слоте</h5>";
      },
      unlocked() {
        return player.main.checkToggleSlotId != "";
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        let data =
          player.main.equipment[
            tmp.main.clickables[player.main.checkToggleSlotId].type
          ];
        data.forgeRarity = data.rarity;
        data.forgeMult = getNextForgeMult(player.main.checkToggleSlotId);
        data.forgeLevel = data.forgeLevel.add(1);
        getMaxPlayerHP(true);
      },
      style() {
        return {
          width: "205px",
          height: "50px",
          border: "4px solid rgba(182, 150, 96, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
        };
      },
    },
    12: {
      purchaseLimit: 3,
      cost(x) {
        return new Decimal(15).mul(x.add(1));
      },
      reqClass: "warrior",
      upgId:'str_1',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass;
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество воина I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Атака +50% за уровень.<br>Текущий бонус: +${(this.effect()-1)*100}% к атаке.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = new Decimal(0.5).mul(x)
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
    13: {
      purchaseLimit: 3,
      reqClass:'archer',
      cost(x) {
        return new Decimal(15).mul(x.add(1));
      },
      upgId:'str_2',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass;
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество лучника I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Атака +50% за уровень.<br>Текущий бонус: +${(this.effect()-1)*100}% к атаке <br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = new Decimal(0.5).mul(x)
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
    14: {
      purchaseLimit: 3,
      reqClass:'mage',
      cost(x) {
        return new Decimal(15).mul(x.add(1));
      },
      upgId:'str_3',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass;
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество мага I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Атака +50% за уровень.<br>Текущий бонус: +${(this.effect()-1)*100}% к атаке <br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = new Decimal(0.5).mul(x)
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
    
15: {
      purchaseLimit: 5,
      reqClass:'archer',
      cost(x) {
        return new Decimal(35).mul(x.div(5).add(1));
      },
      branches: [[13, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'agi',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[13].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Теневой бег I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Ловкость +1 за уровень.<br>Текущий бонус: +${format(this.effect())} Ловкости <br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
16: {
      purchaseLimit: 2,
      reqClass:'archer',
      cost(x) {
        return new Decimal(50).mul(x.div(2).add(1));
      },
      branches: [[13, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'crit_c',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[13].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Меткий выстрел I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Шанс крита +1% за уровень.<br>Текущий бонус: +${format(this.effect())}% к шансу крита.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
  17: {
      purchaseLimit: 5,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(35).mul(x.div(5).add(1));
      },
      branches: [[12, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'body',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[12].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Закалка тела I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Сила +1 за уровень.<br>Текущий бонус: +${format(this.effect())} Силы <br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
18: {
      purchaseLimit: 5,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(35).mul(x.div(5).add(1));
      },
      branches: [[12, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'body_2',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[12].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Стальная кожа I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Живучесть +1 за уровень.<br>Текущий бонус: +${format(this.effect())} Живучести.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
19: {
      purchaseLimit: 5,
      reqClass:'mage',
      cost(x) {
        return new Decimal(35).mul(x.div(5).add(1));
      },
      branches: [[14, '#464646ff','4']],
      upgId:'int',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass && player.main.buyables[14].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Фолиант мудрости I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>Мудрость +1 за уровень.<br>Текущий бонус: +${format(this.effect())} Мудрости <br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
  20: {
      purchaseLimit: 2,
      reqClass:'mage',
      cost(x) {
        return new Decimal(50).mul(x.div(2).add(1));
      },
      branches: [[14, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'body_2',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[14].gte(3);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Мастер стихий I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+1 ко всему стихийному урону за уровень.<br>Текущий бонус: +${format(this.effect())} ко всему стихийному урону.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
21: {
      purchaseLimit: 10,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(100).mul(x.div(5).add(1));
      },
      branches: [[17, (this.canAfford?'lime':'#464646ff'),'4'],[18, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'str_1',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[17].gte(5)&& player.main.buyables[18].gte(5);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество воина II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+100% к атаке персонажа.<br>Текущий бонус: +${format((this.effect()-1)*100)}% к атаке.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
22: {
      purchaseLimit: 10,
      reqClass:'archer',
      cost(x) {
        return new Decimal(100).mul(x.div(5).add(1));
      },
      branches: [[15, (this.canAfford?'lime':'#464646ff'),'4'],[16, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'str_2',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[15].gte(5)&& player.main.buyables[16].gte(5);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество лучника II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+100% к атаке персонажа.<br>Текущий бонус: +${format((this.effect()-1)*100)}% к атаке.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
23: {
      purchaseLimit: 10,
      reqClass:'mage',
      cost(x) {
        return new Decimal(100).mul(x.div(5).add(1));
      },
      branches: [[19, (this.canAfford?'lime':'#464646ff'),'4'],[20, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'str_3',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[22].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Могущество мага II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+100% к атаке персонажа.<br>Текущий бонус: +${format((this.effect()-1)*100)}% к атаке.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        return eff.add(1)
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
24: {
      purchaseLimit: 5,
      reqClass:'archer',
      cost(x) {
        return new Decimal(200).mul(x.div(10).add(1));
      },
      branches: [[22, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'luck',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[22].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Большая удача I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 Удачи за уровень.<br>Текущий бонус: +${format((this.effect()))} Удачи.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
25: {
      purchaseLimit: 5,
      reqClass:'archer',
      cost(x) {
        return new Decimal(200).mul(x.div(10).add(1));
      },
      branches: [[22, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'crit_c',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[19].gte(5)&& player.main.buyables[20].gte(5);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Меткий выстрел II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]
        </h4><hr><b style='font-size:10px'>+1% к шансу крита и +3% к крит. урону за уровень.<br>Текущий бонус: +${format((this.effect().eff))}% к шансу крита и +${format((this.effect().eff2))}% к крит. урону.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x
        let eff2 = x.mul(3)
        return {eff:eff, eff2:eff2}
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
26: {
      purchaseLimit: 5,
      reqClass:'archer',
      cost(x) {
        return new Decimal(150).mul(x.div(10).add(1));
      },
      branches: [[22, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'agi',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[19].gte(5)&& player.main.buyables[20].gte(5);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Теневой бег 2 [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]
        </h4><hr><b style='font-size:10px'>+2 ловкости за уровень.<br>Текущий бонус: +${format((this.effect()))} Ловкости.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x*2
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
  27: {
      purchaseLimit: 5,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(200).mul(x.div(10).add(1));
      },
      branches: [[21, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'luck',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[21].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Большая удача I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 Удачи за уровень.<br>Текущий бонус: +${format((this.effect()))} Удачи.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
28: {
      purchaseLimit: 5,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(150).mul(x.div(10).add(1));
      },
      branches: [[21, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'body',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[21].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Закалка тела II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 Силы за уровень.<br>Текущий бонус: +${format((this.effect()))} Силы.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
  29: {
      purchaseLimit: 5,
      reqClass:'warrior',
      cost(x) {
        return new Decimal(150).mul(x.div(10).add(1));
      },
      branches: [[21, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'body',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[21].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Стальная кожа II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 Живучести за уровень.<br>Текущий бонус: +${format((this.effect()))} Живучести.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
30: {
      purchaseLimit: 5,
      reqClass:'mage',
      cost(x) {
        return new Decimal(200).mul(x.div(10).add(1));
      },
      branches: [[23, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'luck',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[23].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Большая удача I [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 Удачи за уровень.<br>Текущий бонус: +${format((this.effect()))} Удачи.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
31: {
      purchaseLimit: 5,
      reqClass:'mage',
      cost(x) {
        return new Decimal(200).mul(x.div(10).add(1));
      },
      branches: [[23, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'luck',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[23].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Мастер стихий II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 ко всему стихийному урону.<br>Текущий бонус: +${format((this.effect()))} ко всему стихийному урону.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
32: {
      purchaseLimit: 5,
      reqClass:'mage',
      cost(x) {
        return new Decimal(150).mul(x.div(10).add(1));
      },
      branches: [[23, (this.canAfford?'lime':'#464646ff'),'4']],
      upgId:'luck',
      display() {
        return "";
      },
      unlocked() {
        return player.main.floor.floorNumber>10;
      },
      canAfford() {
        return player[this.layer].fame_coins.gte(this.cost())&&player.main.character.class==tmp.main.buyables[this.id].reqClass&& player.main.buyables[23].gte(10);
      },
      buy() {
        player[this.layer].fame_coins = player[this.layer].fame_coins.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      tooltip() {
        return `<h4 style='${this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)?'color:lime':'color:white'}'>Фолиант мудрости II [${format(player[this.layer].buyables[this.id],0)}/${format(this.purchaseLimit,0)}]</h4><hr><b style='font-size:10px'>+2 к Мудрости.<br>Текущий бонус: +${format((this.effect()))} Мудрости.<br>Стоимость: ${format(this.cost())} Монет Cлавы</b>`
      },
      effect(x=player[this.layer].buyables[this.id]) {
        let eff = x.mul(2)
        return eff
      },
      tooltipStyle() {
        return {
          width:'200px',
          'max-height':'150px',
          border: '2px solid white',
          background: '#0f0f0f',
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
 }
      },
      style() {
         if (this.canAfford()&&player[this.layer].buyables[this.id].lt(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid lime",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
         else if (player[this.layer].buyables[this.id].gte(this.purchaseLimit)) return {
          width: "50px",
          height: "50px",
          border: "2px solid yellow",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        };
        else if (player.main.character.class!=this.reqClass) return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(108, 3, 3, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
        else return {
          width: "50px",
          height: "50px",
          border: "2px solid rgba(80, 80, 80, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          background: "#0f0f0f",
          "background-image": `url('resources/${this.upgId}.png')`,
        }
      },

    },
  },
  skill_grid: {
    rows: 1,
    cols: 5,
    getSkillData(id) {
      let startDesc = getSkills((id % 10) - 1 + (Math.floor(id / 100) - 1) * 7);
      if (getSkillGridData("main", id).level > 0) {
        startDesc.damage *= 1.15 ** getSkillGridData("main", id).level;
      }
      return startDesc;
    },
    getStartData(id) {
      return { level: 0, duplicates: 0 };
    },
    getUnlocked(id) {
      // Default
      return true;
    },
    getLevelReq(data, id) {
      let level = player.main.skill_grid[id].level;
      let req = Math.floor(level + 1 * (level / 5 + 1));
      return req;
    },
    getCanClick(data, id) {
      return true;
    },
    onClick(data, id) {
      if (data.duplicates >= this.getLevelReq(data, id)) {
        data.duplicates -= this.getLevelReq(data, id);
        data.level += 1;
      }
    },
    onHold(data, id) {
      if (data.level >= 0 || id == 101)
        setTimeout((player.main.character.skill = this.getSkillData(id)), 3000);
    },
    getDisplay(data, id) {
      if (data.level == 0 && id != 101)
        return `<span style="font-size:28px; color:grey">🔒</span>`;
      return this.getSkillData(id).skill_name;
    },
    getProgressStyle(data, id) {
      return {
        position: "absolute",
        "text-align": "top",
        bottom: "-20px",
        "font-size": "14px",
        width: "100%",
        height: "15px",
        "border-top": "1.5px solid transparent",
        "border-image": `linear-gradient(to right, rgba(164, 255, 167, 1) ${(data.duplicates / this.getLevelReq(data, id)) * 100}%, rgba(62, 62, 62, 1) 0px)`,
        "border-image-slice": "1",
        background: `linear-gradient(to right,lime ${Math.min(80, Math.max(0, data.duplicates / this.getLevelReq(data, id) - 0.2) * 100)}%, rgba(120, 255, 124, 1) ${Math.min(100, (data.duplicates / this.getLevelReq(data, id)) * 100)}%,  grey 0px)`,
      };
    },
    getProgress(data, id) {
      return `${format(data.duplicates, 0)}/${format(this.getLevelReq(data, id), 0)}`;
    },
    //Функция для текста в всплывалющем тултипе
    getTooltip(data, id) {
      let descs = [
        `Делает простой выпад, нанося ${format(this.getSkillData(id).damage * 100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
        `Делает точный и быстрый взмах, нанося ${format(this.getSkillData(id).damage * 100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
        `Делает выпад тяжелым щитом, нанося ${format(this.getSkillData(id).damage * 100)}% урона. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
        `Делает два последовательных взмаха мечом, нанося ${format((this.getSkillData(id).damage / 2) * 100)}% урона за каждый удар. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
        `Делает взмах мечом, пылающим огнём, накладывая ожог противнику на ${format(this.getSkillData(id).fire)} секунд. Каждую секунду ожог будет наносить ${format(this.getSkillData(id).fire_tickdamage * 100)}% урона каждую секунду. Перезарядка: ${format(this.getSkillData(id).cooldown)} сек.`,
      ];
      return descs[(id % 10) - 1 + (Math.floor(id / 100) - 1) * 7];
    },
    getStyle(data, id) {
      if (
        player.main.character.skill.skill_name ==
        this.getSkillData(id).skill_name
      )
        return {
          width: "75px",
          height: "75px",
          border: `3px solid`,
          "border-color": "gold",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          "background-color": "#231D11",
          "padding-block": "0px",
          "padding-inline": "0px",
        };
      return {
        width: "75px",
        height: "75px",
        border: `3px solid`,
        "border-color": getRariryColor(this.getSkillData(id).rarity),
        "border-radius": "0",
        "background-repeat": "no-repeat",
        "background-position": "50% 50%",
        color: "white",
        "font-size": "16px",
        "background-color": "#231D11",
        "padding-block": "0px",
        "padding-inline": "0px",
      };
    },
    getTooltipStyle(data, id) {
      return {
        border: "2px solid transparent",
        "border-color": getRariryColor(this.getSkillData(id).rarity),
        background: "#0f0f0f",
        width: "225px",
        "font-size": "12px",
        "border-image-slice": "1",
      };
    },
  },
  //Инвентарь
  grid: {
    rows: 6,
    cols: 6,
    getStartData(id) {
      return { item_type: "none", item_name: "Debug", level: 0, rarity: 0 };
    },
    getUnlocked(id) {
      // Default
      return true;
    },
    getCanClick(data, id) {
      return true;
    },
    onClick(data, id) {
      if (player.main.checkToggleGridId == id)
        player.main.checkToggleGridId = "";
      else if (player.main.checkToggleGridId_2 == "")
        player.main.checkToggleGridId = id;
      if (player.main.checkToggleGridId_2 == id)
        player.main.checkToggleGridId_2 = "";
      else if (player.main.checkToggleGridId != "")
        player.main.checkToggleGridId_2 = id;
      if (
        player.main.checkToggleSlotId != "" &&
        player.main.checkToggleGridId != "" &&
        (getGridData("main", player.main.checkToggleGridId).item_type ==
          tmp.main.clickables[player.main.checkToggleSlotId].type ||
          getGridData("main", player.main.checkToggleGridId).item_type ==
            "none")
      )
        toggleGridAndSlot(
          tmp.main.clickables[player.main.checkToggleSlotId].type
        );
      else if (player.main.checkToggleSlotId != "") {
        if (
          (player.main.checkToggleGridId != "" &&
            tmp.main.clickables[player.main.checkToggleSlotId].type ==
              "ring_1") ||
          (tmp.main.clickables[player.main.checkToggleSlotId].type ==
            "ring_2" &&
            getGridData("main", player.main.checkToggleGridId).item_type ==
              "ring")
        )
          toggleGridAndSlot(
            tmp.main.clickables[player.main.checkToggleSlotId].type
          );
      }
      toggleGrids();
    },
    getDisplay(data, id) {
      return data.item_name;
    },
    //Функция для текста в всплывалющем тултипе
    getTooltip(data, id) {
      let table = "";
      let statsTable = "";
      let exclude = excludeStats();
      let stats = [];
      let k = 0;
      let j = 0;
      if (data.rarity > 0) statsTable = "";
      if (data.rarity > 0)
        table = `${getEquipTypeName(data.item_subtype)}<h4>[Ур. ${data.level}] ${data.item_name} 
            ${getRarityName(data.rarity)}</h3><hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:grey; font-size:12px'> 
            Усиление от характеристик:<br>Сила: ${data.strength_scale == undefined ? "-" : data.strength_scale} | Живучесть: ${data.vitality_scale == undefined ? "-" : data.vitality_scale} 
            <br>Ловкость: ${data.agility_scale == undefined ? "-" : data.agility_scale} | Мудрость: ${data.intelligence_scale == undefined ? "-" : data.intelligence_scale}</span>
            <hr style='border-color:rgba(182, 150, 96, 1)'><span style='color:lime; font-size:12px'>Характеристики:<br>`;
      for (i in data) {
        if (data[i] > 0 && !exclude.includes(i)) {
          stats.push([i]);
          if (stats.length % 2 != 0) statsTable += `| `;
          statsTable += ` ${getStatName(i, data[i])}`;
          if (stats.length % 2 != 0) statsTable += ` |`;

          if (stats.length % 2 == 0) statsTable += " |<br>";
        }
      }
      return table + statsTable;
    },
    getStyle(data, id) {
      if (
        player.main.checkToggleGridId == id ||
        (player.main.checkToggleGridId_2 == id && data.rarity > 0)
      )
        return {
          width: "75px",
          height: "75px",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          "background-image": `${data.rarity > 0 ? `url('resources/rarity_${data.rarity}.png')` : `url('resources/rarity_${data.rarity}.png')`})`,
          border: "4px solid rgba(248, 175, 49, 1)",
        };
      else
        return {
          width: "75px",
          height: "75px",
          border: "4px solid rgba(182, 150, 96, 1)",
          "border-radius": "0",
          "background-repeat": "no-repeat",
          "background-position": "50% 50%",
          color: "white",
          "font-size": "16px",
          "background-image": `${data.rarity > 0 ? `url('resources/rarity_${data.rarity}.png')` : `url('resources/rarity_${data.rarity}.png')`}`,
        };
    },
    getTooltipStyle(data, id) {
      return {
        border: "4px solid transparent",
        "border-image": "url(resources/border.png)",
        background: "#0f0f0f",
        width: "225px",
        "font-size": "12px",
        "border-image-slice": "10%",
      };
    },
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "p",
      description: "P: Reset for prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  //Вкладки
  tabFormat: {
      Tree: {
      content: [
            [
              "display-text",
              function () {
                let table = `<button class='prestige_tab'; onClick='setSubtab("pres")'>Монеты Славы</button>
                <button class='prestige_tab'; onClick='setSubtab("tree")'>Дерево Усилений</button>`;
                return (table);
              },
            ],
            ['blank',['10px','50px']],
            [
              "display-text",
              function () {
                let table = `<br>Улучшайте персонажа, покупая улучшения в Древе Усилений за Монеты Славы.`;
                return (table);
              },
            ],
            ['blank',['10px','50px']],
            ['row',[['buyable',[13]],['blank',['170px','0px']],['buyable',[12]],['blank',['170px','0px']],['buyable',[14]]]],
            ['blank',['10px','25px']],
            ['row',[['buyable',[15]],['blank',['30px','0px']],['buyable',[16]],['blank',['90px','0px']],['buyable',[17]],['blank',['30px','0px']],['buyable',[18]]
            ,['blank',['90px','0px']],['buyable',[19]],['blank',['30px','0px']],['buyable',[20]]]],
            ['blank',['10px','25px']],
            ['row',[['buyable',[22]],['blank',['170px','0px']],['buyable',[21]],['blank',['170px','0px']],['buyable',[23]]]],
            ['blank',['10px','25px']],
            ['row',[['blank',['45px','0px']],['buyable',[24]],['blank',['15px','0px']],['buyable',[25]],['blank',['15px','0px']],['buyable',[26]],['blank',['45px','0px']],
            ['buyable',[27]],['blank',['15px','0px']],['buyable',[28]],['blank',['15px','0px']],['buyable',[29]],['blank',['45px','0px']],
          ['buyable',[30]],['blank',['15px','0px']],['buyable',[31]],['blank',['15px','0px']],['buyable',[32]],['blank',['45px','0px']]]],
        ],
    },
    Prestige: {
      content: [
            [
              "display-text",
              function () {
                let table = `<button class='prestige_tab'; onClick='setSubtab("pres")'>Монеты Славы</button>
                <button class='prestige_tab'; onClick='setSubtab("tree")'>Дерево Усилений</button>`;
                return (table);
              },
            ],
            ['blank',['10px','50px']],
            [
              "display-text",
              function () {
                let table = `<div style='background-color: rgba(23, 23, 23, 1); width:90%; height:20%; padding: 0px 5px 15px 5px; border:3px solid gold'><br>Сбросьте всё полученное золото, уровень, карты улучшения и экипировку в инвентаре <br>(не одетую) и взамен получите Монеты Славы.
                 <br>Полученные Монеты Славы можно потратить на различные улучшения в<br>Дереве Усилений.<br><br>Текущее количество <span style='color:orange'>Монет Славы</span> для получения: <b style='color:orange'>${format(getPrestigeCurrencyGain())}</b></div>`;
                return (table);
              },
            ],
            ['blank',['10px','100px']],
        ],
    },
    Player: {
      content: [
        [
          "column",
          [
            [
              "display-text",
              function () {
                let table = "";
                let exclude = excludeStats();
                let inventory = getSlotBuffs();
                let playerData = player.main.character;
                for (i in inventory) {
                  if (!exclude.includes(i)){
                  table += ` ${getPlayerStats(i, playerData[i], inventory[i])}<br>`};
                }
                return (
                  `<div class='statDiv' style='padding: 5px 5px 5px 5px; border:3px solid transparent; border-image: url(resources/border.png); border-image-slice:20%''><h2>Уровень персонажа [${getClassName(player.main.character.class)}] - [${player.main.character.level}]</h2></div><br><br>
                    <br><div style='border: 4px solid transparent;border-image: url(resources/border.png); border-image-slice:20%''>
                    <div class='statDiv'>Хар-ка</div><div class='statDiv'>Персонаж</div><div class='statDiv'>Экипировка</div><div class='statDiv'>Множ. от уровня/карт улучшения</div><br>` +
                  table +
                  "</div>"
                );
              },
            ],
          ],
        ],
      ],
    },
    Skills: {
      content: [
        ["blank", ["40px", "100px"]],
        ["column", ["blank", "skill_grid"]],
      ],
    },
    Inventory: {
      content: [
        ["blank", ["40px", "120px"]],
        [
          "row",
          [
            [
              "column",
              [
                [
                  "display-text",
                  function () {
                    let table = "";
                    let data = getSlotBuffs();
                    let exclude = excludeStats();
                    for (i in data) {
                      if (data[i] > 0 && !exclude.includes(i))
                        table += ` ${getStatName(i, data[i])} ${data[`scaled_${i}`] ? `(+${format(data[`scaled_${i}`], 2)})` : ``}<br>`;
                    }
                    return (
                      `<div style='background-color: #000000b2; padding: 5px 5px 5px 5px; border:3px solid transparent; border-image: url(resources/border.png); border-image-slice:20%'><h4>Бонусы экипировки</h4><hr>` +
                      (table != ""
                        ? table
                        : `<span style='color:rgba(84, 84, 84, 1); font-size:12px'>Оденьте снаряжение для получения бонусов.</span></div>`)
                    );
                  },
                ],
              ],
              { "margin-right": "40px" },
            ],
            [
              "v-line",
              ["200px"],
              {
                "margin-left": "-20px",
                "border-color": "rgba(235, 194, 122, 1)",
              },
            ],
            getSlotDisplay(),
          ],
        ],
        "blank",
        "grid",
        "blank",
      ],
    },
    Forge: {
      content: [
        ["blank", ["40px", "160px"]],
        [
          "row",
          [
            [
              "column",
              [
                [
                  "display-text",
                  function () {
                    let table = "";
                    if (player.main.checkToggleSlotId != "") {
                      let currentMult =
                        player.main.equipment[
                          tmp.main.clickables[player.main.checkToggleSlotId]
                            .type
                        ].forgeMult - 1;
                      let currentForgeLevel =
                        player.main.equipment[
                          tmp.main.clickables[player.main.checkToggleSlotId]
                            .type
                        ].forgeLevel;
                      table = `<span style='font-size:12px'>Множитель усиления экипировки:<br> [+${format(currentForgeLevel, 0)}] - 
                        ${format(currentMult * 100, 2)}% → 
                        <span style='color:lime'>[+${format(currentForgeLevel.add(1), 0)}]
                        - ${format((getNextForgeMult(player.main.checkToggleSlotId) - 1) * 100, 2)}%</span> <br>Прирост множителя: <span style='color:lime'>
                        (+${format((getNextForgeMult(player.main.checkToggleSlotId) - 1 - currentMult) * 100, 2)}%, x${format(currentMult == 0 ? getNextForgeMult(player.main.checkToggleSlotId) : (getNextForgeMult(player.main.checkToggleSlotId) - 1) / currentMult, 2)})</span></span></span>`;
                    }
                    return (
                      `<div style='background-color: #000000b2; padding: 5px 5px 5px 5px; border:3px solid transparent; border-image: url(resources/border.png); border-image-slice:20%'>
                    <h3>Множитель усиления</h3><hr>` +
                      (player.main.checkToggleSlotId!=''?table:"<span style='color:rgba(84, 84, 84, 1); font-size:12px'>Выберите снаряжение для улучшения</span>") +
                      "</div>"
                    );
                  },
                ],
                "blank",
                ["buyable", [11]],
              ],
              { "margin-right": "40px" },
            ],
            [
              "v-line",
              ["200px"],
              {
                "margin-left": "-20px",
                "border-color": "rgba(235, 194, 122, 1)",
              },
            ],
            getSlotDisplay(),
          ],
        ],
      ],
    },
  },
  update(diff) {
    	var number = "resources/hills.jpg";
      switch (Math.floor(player.main.floor.floorNumber/10)) {
        case 0:
          number = "resources/tower-first.jpg"
          break
        case 1:
          number ='resources/tower-second.jpg'
          break
        case 2:
          number = 'resources/hell-tower2.jpg'
          break
        case 3:
          number = 'resources/hell-tower.jpg'
          break
        case 4:
          number = 'resources/tower-third.jpg'
          break
        case 5:
          number = 'resources/tower-fourth.jpg'
          break
        case 6:
          number = 'resources/royal-tower1.jpg'
          break
        case 7:
          number = 'resources/royal-tower2.jpg'
          break
        case 8:
          number = 'resources/celestial-tower.jpg'
          break
        case 'default':
          number = "resources/hills.jpg";
          break
      }
    if (number!='none') document.getElementById("treeOverlay").style.backgroundImage = `url(${number})`;
    if (player.inCardChoose|| player.inClassChoose) {
      getLevelMultipliers(player.main.character.class);
      updatePlayerStats()
      updateSlotStats();
      for (i in player.main.clickables)
        getScaleBuffs(true, tmp.main.clickables[i].type);
      return;
    }
    getLevelMultipliers(player.main.character.class);
    updatePlayerStats()
    updateSlotStats();
    if (player.main.character.skill.fire_tickdamage)
      player.main.cooldowns.burntCooldown += diff;
    if (
      player.main.character.healthPoints.lte(0) ||
      player.main.character.healthPoints.gt(getMaxPlayerHP())
    )
     { player.main.character.healthPoints = new Decimal(getMaxPlayerHP())
     };
    if (player.main.floor.monster.healthPoints.lte(0)||player.main.floor.monster.healthPoints.gt(getMaxEnemyHP()))
      player.main.floor.monster.healthPoints = new Decimal(getMaxEnemyHP());
    player.main.character.exp = player.main.character.exp.add(
      new Decimal(5).times(diff)
    );
    if (getPlayerAttackSpeed() > 0)
      player.main.cooldowns.attackCooldown += diff;
      player.main.cooldowns.monsterAttackCooldown += diff;
    if (player.main.cooldowns.monsterAttackCooldown>=1) {
      makeParticles(damageEnemy, 1)
      updateCurrentHP(getTotalMonsterAttack());
      player.main.cooldowns.monsterAttackCooldown=0
    }
    if (
      player.main.cooldowns.attackCooldown >= getPlayerAttackSpeed() &&
      getPlayerAttackSpeed() > 0
    ) {
      if (!player.main.character.skill.fire_tickdamage) {
        let critCheck = Math.random()
        let attack = getTotalAttack()
        if (critCheck<getCritStats().crit_chance) {
          makeParticles(damagePlayerCrit, 1)
           attack*=getCritStats().crit}
        else makeParticles(damagePlayer, 1)
        updateEnemyCurrentHP(attack);
      }
      else
        player.main.cooldowns.burningMax = player.main.character.skill.fire;
      player.main.cooldowns.attackCooldown = 0;
    }
    if (
      player.main.cooldowns.burntCooldown >= 1 &&
      player.main.cooldowns.burningMax > 0 ||
      (!player.main.character.skill.fire_tickdamage &&
      player.main.cooldowns.burningMax > 0)
    ) {
    makeParticles(damagePlayer, 1)
      updateEnemyCurrentHP(getTotalAttack());
      player.main.cooldowns.burntCooldown = 0;
      player.main.cooldowns.burningMax -= 1;
      player.main.cooldowns.burningMax = Math.max(
        0,
        player.main.cooldowns.burningMax
      );
    }
    if (player.main.character.healthPoints.lte(0)) {
      makeParticles(deadPlayer, 1)
      player.main.cooldowns.attackCooldown=0
      player.main.character.healthPoints = new Decimal(getMaxPlayerHP());
      if (player.main.floor.currentMonster==player.main.floor.monsters) {player.main.floor.currentMonster=1; getMob()}
      player.main.floor.monster.healthPoints = getMaxEnemyHP();
    }
    if (player.main.floor.monster.healthPoints.lte(0)) {
      if (player.main.floor.currentMonster >= player.main.floor.monsters) {
          player.main.character.skill_choose = getRandomCards();
          player.inCardChoose = true;
      }
      player.main.gold=player.main.gold.add(getStageRewards().gold.div(player.main.floor.monsters))
      player.main.character.exp = player.main.character.exp.add(getStageRewards().exp.div(player.main.floor.monsters))
      let dropChance = Math.random();
      console.log(dropChance);
      player.main.character.healthPoints = new Decimal(getMaxPlayerHP());
      if (player.main.floor.currentMonster<player.main.floor.monsters) player.main.floor.currentMonster += 1;
      else {
        player.main.floor.currentMonster=1
        player.main.floor.floorNumber+=1
      }
      player.main.floor.monster.healthPoints = getMaxEnemyHP();
      let x = 0;
      let rarityItems = [
        function () {
          return;
        },
        getCommonWeapon,
        getUncommonWeapon,
                function () {
          return;
        },
                function () {
          return;
        },
                function () {
          return;
        },
                function () {
          return;
        },
                function () {
          return;
        },
      ];
      console.log(rarityItems[0](false), rarityItems[1](false));
      for (let i = 0; i < getItemDropChances().length; i++) {
        if (dropChance < getItemDropChances()[i]) {
          x += 1;
          console.log(
            dropChance < getItemDropChances()[i],
            dropChance,
            getItemDropChances()[i],
            x,
            i
          );
        }
      }
      if (x >= 1 && x<=2) {
        let max = rarityItems[x](false).length - 1;
        let checkItem = Math.floor(Math.random() * (max - 0) + 0);
        console.log(rarityItems[x](true, checkItem), x);
        x = 0;
      }
      getMob()
    }
    if (player.main.character.exp.gte(tmp.main.getNextLevelReq)) {
      player.main.character.level = player.main.character.level.add(1);
      player.main.character.exp = new Decimal(0);
      player.main.character.healthPoints = new Decimal(getMaxPlayerHP());
    }
    for (i in player.main.clickables)
      getScaleBuffs(true, tmp.main.clickables[i].type);
  },
  layerShown() {
    return true;
  },
});
