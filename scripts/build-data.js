// Script parses the game files and collect the data and css-icons for the website
// magick.exe - must be available to execute from command line (ImageMagick)

const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')

console.log('building...')

// src must contain main.bundle.js from Vampire Survivors/resources/app/.webpack/renderer
// and all used files from Vampire Survivors\resources\app\.webpack\renderer\assets\img and from DLC: Vampire Survivors\2230760\scripts\data
// characters.json, characters.png, enemies.json, enemies.png, enemies2.json, enemies2.png, enemies3.json, enemies3.png, enemiesM.json, enemiesM.png, items.json, items.png, randomazzo.json, randomazzo.png, UI.json, UI.png
// moonspell.json, moonspell.png, moonspellChars.json, moonspellChars.png, characterData_Moonspell.json, weaponData_Moonspell.json, stageData_Moonspell.json
const src = `${__dirname}/src`
// dst will contain data.js and icons.css
const dst = `${__dirname}/dst`

const defaultCharacterStats = { maxHp: 100, armor: 0, regen: 0, moveSpeed: 1, power: 1, cooldown: 1, area: 1, speed: 1, duration: 1, amount: 0, luck: 1, growth: 1, greed: 1, curse: 1, magnet: 0, revivals: 0, rerolls: 0, skips: 0, banish: 0 }
const defaultWeaponStats = { area: 1, speed: 1, amount: 1, chance: 1 }
const defaultStageStats = { ClockSpeed: 1, EnemySpeed: 1, EnemyHealth: 1, GoldMultiplier: 1, XPBonus: 1, TimeLimit: 1800, PlayerPxSpeed: 1, ProjectileSpeed: 1, LuckBonus: 0, tips: '' }

const characters = [
  { id: 'antonio', name: 'Antonio', emoji: ':charAntonioVS:', itemIds: ['whip'] },
  { id: 'imelda', name: 'Imelda', emoji: ':charImeldaVS:', itemIds: ['magicwand'] },
  { id: 'pasqualina', name: 'Pasqualina', emoji: ':charPasqualinaVS:', itemIds: ['runetracer'] },
  { id: 'gennaro', name: 'Gennaro', emoji: ':charGennaroVS:', itemIds: ['knife'] },
  { id: 'arca', name: 'Arca', emoji: ':charArcaVS:', itemIds: ['firewand'] },
  { id: 'porta', name: 'Porta', emoji: ':charPortaVS:', itemIds: ['lightning'] },
  { id: 'lama', name: 'Lama', emoji: ':charLamaVS:', itemIds: ['axe'] },
  { id: 'poe', name: 'Poe', emoji: ':charPoeVS:', itemIds: ['garlic'] },
  { id: 'clerici', name: 'Clerici', emoji: ':charClericiVS:', itemIds: ['water'] },
  { id: 'dommario', name: 'Dommario', emoji: ':charDommarioVS:', itemIds: ['bible'] },
  { id: 'krochi', name: 'Krochi', emoji: ':charKrochiVS:', itemIds: ['cross'] },
  { id: 'christine', name: 'Christine', emoji: ':charChristineVS:', itemIds: ['pentagram'] },
  { id: 'pugnala', name: 'Pugnala', emoji: ':charPugnalaVS:', itemIds: ['guns1', 'guns2'] },
  { id: 'poppea', name: 'Poppea', emoji: ':charPoppeaVS:', itemIds: ['mana'] },
  { id: 'mortaccio', name: 'Mortaccio', emoji: ':charMortaccioVS:', itemIds: ['bone'] },
  { id: 'cavallo', name: 'Cavallo', emoji: ':charYattaCavalloVS', itemIds: ['cherry'] },
  { id: 'ramba', name: 'Ramba', emoji: ':charBiancaRambaVS:', itemIds: ['cart'] },
  { id: 'osole', name: 'O`Sole', emoji: ':charOSoleMeeo2VS:', itemIds: ['flowers'] },
  { id: 'giovanna', name: 'Giovanna', emoji: ':charGiovannaVS:', itemIds: ['cat'] },
  { id: 'concetta', name: 'Concetta', emoji: ':charConcettaVS:', itemIds: ['pinion'] },
  { id: 'gallo', name: 'Gallo', emoji: ':charIguanaGalloVS:', itemIds: ['lancet'] },
  { id: 'divano', name: 'Divano', emoji: ':charDivanoVS:', itemIds: ['laurel'] },
  { id: 'assunta', name: 'Zi`Assunta', emoji: ':charZiAssuntaVS:', itemIds: ['vento'] },
  { id: 'ambrojoe', name: 'Ambrojoe', emoji: ':charSirAmbrojoeVS:', itemIds: ['furniture'] },
  { id: 'sigma', name: 'Sigma', emoji: ':charQueenSigmaVS:', itemIds: ['sword'] },
  // dlc 1
  { id: 'miang', name: 'Miang', emoji: ':charMiangVS:', itemIds: ['wind'], dlc: true },
  { id: 'menya', name: 'Menya', emoji: ':charMenyaVS:', itemIds: ['seasons'], dlc: true },
  { id: 'syuuto', name: 'Syuuto', emoji: ':charSyuutoVS:', itemIds: ['night'], dlc: true },
  { id: 'megamenya', name: 'Menya', emoji: ':charMegaloMenyaVS:', itemIds: ['bocce'], dlc: true },
  { id: 'megasyuuto', name: 'Syuuto', emoji: ':charMegaloSyuutoVS:', itemIds: ['muramasa'], dlc: true },
  { id: 'onna', name: 'Babi-Onna', emoji: ':charBabiOnnaVS:', itemIds: ['mirage'], dlc: true },
  { id: 'tony', name: "Gab'Et-Oni", emoji: ':charGavEtOniVS:', itemIds: ['bolle'], dlc: true },
  { id: 'mccoy', name: 'McCoy-Oni', emoji: ':charMccoyVS:', itemIds: ['bocce'], dlc: true },
  { id: 'scorej', name: 'Scorej-Oni', emoji: ':charScorejOniVS:', itemIds: ['lightning'], dlc: true },
  // dlc 2
  { id: 'eleanor', name: 'Eleanor Uziron', emoji: ':grey_question:', itemIds: ['spell1'], dlc2: true },
  { id: 'maruto', name: 'Maruto Cuts', emoji: ':grey_question:', itemIds: ['eskizzibur'], dlc2: true },
  { id: 'keitha', name: 'Keitha Muort', emoji: ':grey_question:', itemIds: ['arrow'], dlc2: true },
  { id: 'luminaire', name: 'Luminaire Foscari', emoji: ':grey_question:', itemIds: ['prism'], dlc2: true },
  { id: 'genevieve', name: 'Genevieve Gruyère', emoji: ':grey_question:', itemIds: ['servant'], dlc2: true },
  { id: 'jeneviv', name: 'Je-Ne-Viv', emoji: ':grey_question:', itemIds: ['servant'], dlc2: true },
  { id: 'sammy', name: 'Sammy', emoji: ':grey_question:', itemIds: ['cat_'], dlc2: true },
  { id: 'ghoul', name: "Rottin'Ghoul", emoji: ':grey_question:', itemIds: ['popper'], dlc2: true },
  // secret
  { id: 'exdash', name: 'Exdash', emoji: ':charExdashVS:', itemIds: ['bird2'], special: true },
  { id: 'toastie', name: 'Toastie', emoji: ':charToastieVS:', itemIds: ['bird1'], special: true },
  { id: 'smith', name: 'Smith', emoji: ':charSmithVS:', itemIds: ['bird_'], special: true },
  { id: 'leda', name: 'Leda', emoji: ':charLedaVS:', itemIds: ['magicwand_'], special: true },
  { id: 'reaper', name: 'Red Death', emoji: ':charReddeathVS:', itemIds: ['axe_'], special: true },
  { id: 'marrabbio', name: 'Marrabbio', emoji: ':charBoonMarrabbioVS:', itemIds: ['knife_'], special: true },
  { id: 'minnah', name: 'Minnah', emoji: ':charMinnahVS:', itemIds: ['whip_'], special: true },
  { id: 'peppino', name: 'Peppino', emoji: ':charPeppinoVS:', itemIds: ['garlic_'], special: true },
  { id: 'gains', name: 'Gains', emoji: ':charGainsBorosVS:', itemIds: ['cross_'], special: true },
  { id: 'gyorunton', name: 'Gyorunton', emoji: ':charGyoruntonVS:', itemIds: ['bracelet'], special: true },
  { id: 'cosmo', name: 'Cosmo', emoji: ':animCosmoPavoneVS:', itemIds: ['bird1', 'bird2'], special: true },
  { id: 'trouser', name: 'Trouser', emoji: ':BigTrouserVS:', itemIds: ['candybox'], special: true },
  { id: 'random', name: 'Random', emoji: ':charRandomVS:', itemIds: [], special: true },
  { id: 'avatar', name: 'Avatar', emoji: ':charAvatarInfernasVS:', itemIds: ['flame'], special: true },
]

const weapons = [
  { id: 'magicwand', name: 'Magic Wand', emoji: ':magicwandVS:' },
  { id: 'firewand', name: 'Fire Wand', emoji: ':firewandVS:' },
  { id: 'axe', name: 'Axe', emoji: ':axeVS:' },
  { id: 'lightning', name: 'Lightning Ring', emoji: ':lightningringVS:' },
  { id: 'knife', name: 'Knife', emoji: ':knifeVS:' },
  { id: 'bible', name: 'King Bible', emoji: ':kingbibleVS:' },
  { id: 'cross', name: 'Cross', emoji: ':crossVS:' },
  { id: 'garlic', name: 'Garlic', emoji: ':garlicVS:' },
  { id: 'pentagram', name: 'Pentagram', emoji: ':pentagramVS:' },
  { id: 'runetracer', name: 'Runetracer', emoji: ':runetracerVS:' },
  { id: 'water', name: 'Santa Water', emoji: ':santawaterVS:' },
  { id: 'whip', name: 'Whip', emoji: ':whipVS:' },
  { id: 'guns1', name: 'Phiera Der Tuphello', emoji: ':phieraVS:' },
  { id: 'guns2', name: 'Eight The Sparrow', emoji: ':sparrowVS:' },
  { id: 'bird1', name: 'Peachone', emoji: ':peachoneVS:' },
  { id: 'bird2', name: 'Ebony Wings', emoji: ':ebonywingsVS:' },
  { id: 'mana', name: 'Song Of Mana', emoji: ':manaVS:' },
  { id: 'cat', name: 'Gatti Amari', emoji: ':catVS:' },
  { id: 'pinion', name: 'Shadow Pinion', emoji: ':shadowpinionVS:' },
  { id: 'vento', name: 'Vento Sacro', emoji: ':ventosacroVS:' },
  { id: 'lancet', name: 'Clock Lancet', emoji: ':lancetVS:' },
  { id: 'laurel', name: 'Laurel', emoji: ':laurelVS:' },
  { id: 'sword', name: 'Victory Sword', emoji: ':victoryswordVS:' },
  { id: 'flame', name: 'Flames of Misspell', emoji: ':flamesofmisspellVS:' },
  { id: 'jubilee', name: 'Greatest Jubilee', emoji: ':greatestjubileeVS:' },
  { id: 'bracelet', name: 'Bracelet', emoji: ':braceletVS:' },
  { id: 'bone', name: 'Bone', emoji: ':boneVS:', special: true },
  { id: 'cherry', name: 'Cherry Bomb', emoji: ':cherrybombVS:', special: true },
  { id: 'cart', name: 'Carréllo', emoji: ':carrelloVS:', special: true },
  { id: 'flowers', name: 'Celestial Dusting', emoji: ':celestialdustingVS:', special: true },
  { id: 'furniture', name: 'La Robba', emoji: ':larobbaVS:', special: true },
  { id: 'candybox', name: 'Candybox', emoji: ':candyboxVS:', special: true },
  // dlc 1
  { id: 'wind', name: 'Silver Wind', emoji: ':SilverWindVS:', dlc: true },
  { id: 'seasons', name: 'Four Seasons', emoji: ':FourSeasonsVS:', dlc: true },
  { id: 'night', name: 'Summon Night', emoji: ':SummonNightVS:', dlc: true },
  { id: 'mirage', name: 'Mirage Robe', emoji: ':MirageRobeVS:', dlc: true },
  { id: 'muramasa', name: 'Night Sword', emoji: ':NightSwordVS:', dlc: true },
  { id: 'bolle', name: 'Mille Bolle Blu', emoji: ':MilleBolleBluVS:', dlc: true },
  { id: 'bocce', name: '108 Bocce', emoji: ':108BocceVS:', dlc: true },
  // dlc 2
  { id: 'spell1', name: 'SpellString', emoji: ':grey_question:', dlc2: true },
  { id: 'spell2', name: 'SpellStream', emoji: ':grey_question:', dlc2: true },
  { id: 'spell3', name: 'SpellStrike', emoji: ':grey_question:', dlc2: true },
  { id: 'eskizzibur', name: 'Eskizzibur', emoji: ':grey_question:', dlc2: true },
  { id: 'arrow', name: 'Flash Arrow', emoji: ':grey_question:', dlc2: true },
  { id: 'prism', name: 'Prismatic Missile', emoji: ':grey_question:', dlc2: true },
  { id: 'servant', name: 'Shadow Servant', emoji: ':grey_question:', dlc2: true },
  { id: 'popper', name: 'Party Popper', emoji: ':grey_question:', dlc2: true },
]

const evolutions = [
  { id: 'magicwand_', name: 'Holy Wand', emoji: ':holywandVS:', itemIds: ['magicwand', 'cooldown'] },
  { id: 'firewand_', name: 'Hellfire', emoji: ':hellfireVS:', itemIds: ['firewand', 'might'] },
  { id: 'axe_', name: 'Death Spiral', emoji: ':deathspiralVS:', itemIds: ['axe', 'area'] },
  { id: 'lightning_', name: 'Thunder Loop', emoji: ':thunderloopVS:', itemIds: ['lightning', 'amount'] },
  { id: 'knife_', name: 'Thousand Edge', emoji: ':thousandedgeVS:', itemIds: ['knife', 'speed'] },
  { id: 'bible_', name: 'Unholy Vespers', emoji: ':unholyvespersVS:', itemIds: ['bible', 'duration'] },
  { id: 'cross_', name: 'Heaven Sword', emoji: ':heavenswordVS:', itemIds: ['cross', 'luck'] },
  { id: 'garlic_', name: 'Soul Eater', emoji: ':souleaterVS:', itemIds: ['garlic', 'recovery'] },
  { id: 'pentagram_', name: 'Gorgeous Moon', emoji: ':gorgeousmoonVS:', itemIds: ['pentagram', 'growth'] },
  { id: 'runetracer_', name: 'NO FUTURE', emoji: ':NOFUTUREVS:', itemIds: ['runetracer', 'armor'] },
  { id: 'water_', name: 'La Borra', emoji: ':laborraVS:', itemIds: ['water', 'magnet'] },
  { id: 'mana_', name: 'Mannajja', emoji: ':mannajjaVS:', itemIds: ['mana', 'curse'] },
  { id: 'whip_', name: 'Bloody Tear', emoji: ':bloodytearVS:', itemIds: ['whip', 'health'] },
  { id: 'cat_', name: 'Vicious Hunger', emoji: ':vicioushungerVS:', itemIds: ['cat', 'greed'] },
  { id: 'pinion_', name: 'Valkyrie Turner', emoji: ':valkyrieVS:', itemIds: ['pinion', 'wings'] },
  { id: 'sword_', name: 'Sole Solution', emoji: ':solesolutionVS:', itemIds: ['sword', 'torrona'] },
  { id: 'flame_', name: 'Ashes of Muspell', emoji: ':ashesofmuspellVS:', itemIds: ['flame', 'torrona'] },
  { id: 'lancet_', name: 'Infinite Corridor', emoji: ':infinitecorridorVS:', itemIds: ['lancet', 'ring1', 'ring2'] },
  { id: 'laurel_', name: 'Crimson Shroud', emoji: ':cloakVS:', itemIds: ['laurel', 'sign1', 'sign2'] },
  // special
  { id: 'bird_', name: 'Vandalier', emoji: ':vandalierVS:', itemIds: ['bird1', 'bird2'], special: true },
  { id: 'guns_', name: 'Phieraggi', emoji: ':phieraggiVS:', itemIds: ['guns1', 'guns2', 'revival'], special: true },
  { id: 'vento_', name: 'Fuwalafuwaloo', emoji: ':fuwalafuwalooVS:', itemIds: ['vento', 'whip_'], special: true },
  { id: 'bracelet_', name: 'Bi-Bracelet', emoji: ':bibraceletVS:', itemIds: ['bracelet'], special: true },
  { id: 'bracelet__', name: 'Tri-Bracelet', emoji: ':tribraceletVS:', itemIds: ['bracelet_'], special: true },
  { id: 'candybox_', name: 'Super Candybox II Turbo', emoji: ':supercandyboxIIturboVS:', itemIds: ['candybox'], special: true },
  // dlc 1
  { id: 'wind_', name: 'Festive Winds', itemIds: ['wind', 'recovery'], emoji: ':FestiveWindsVS:', dlc: true },
  { id: 'muramasa_', name: 'Muramasa', itemIds: ['muramasa', 'greed'], emoji: ':MuraMasaVS:', dlc: true },
  { id: 'seasons_', name: 'Godai Shuffle', itemIds: ['seasons', 'might', 'area'], emoji: ':GodaiShuffleVS:', dlc: true },
  { id: 'night_', name: "Night's Reach", itemIds: ['night', 'amount'], emoji: ':EchoNightVS:', dlc: true },
  { id: 'mirage_', name: "J'Odore", itemIds: ['mirage', 'magnet'], emoji: ':JOdoreVS:', dlc: true },
  { id: 'bolle_', name: 'Boo Roo Boolle', itemIds: ['bolle', 'duration'], emoji: ':BooRooBoolleVS:', dlc: true },
  // dlc 2
  { id: 'spell_', name: 'SpellStrom', itemIds: ['spell1', 'spell2', 'spell3'], emoji: ':grey_question:', dlc2: true },
  { id: 'eskizzibur_', name: 'Legionnaire', itemIds: ['eskizzibur', 'armor'], emoji: ':grey_question:', dlc2: true },
  { id: 'arrow_', name: 'Millionaire', itemIds: ['arrow', 'speed', 'luck'], emoji: ':grey_question:', dlc2: true },
  { id: 'prism_', name: 'Luminaire Luminaire', itemIds: ['prism', 'growth'], emoji: ':grey_question:', dlc2: true },
  { id: 'servant_', name: 'Ophion', itemIds: ['servant', 'curse'], emoji: ':grey_question:', dlc2: true },
]

const passives = [
  { id: 'cooldown', name: 'Empty Tome', emoji: ':emptytomeVS:' },
  { id: 'might', name: 'Spinach', emoji: ':spinachVS:' },
  { id: 'area', name: 'Candelabrador', emoji: ':candelabradorVS:' },
  { id: 'amount', name: 'Duplicator', emoji: ':duplicatorVS:' },
  { id: 'speed', name: 'Bracer', emoji: ':bracerVS:' },
  { id: 'duration', name: 'Spellbinder', emoji: ':spellbinderVS:' },
  { id: 'luck', name: 'Clover', emoji: ':cloverVS:' },
  { id: 'recovery', name: 'Pummarola', emoji: ':pummarolaVS:' },
  { id: 'growth', name: 'Crown', emoji: ':crownVS:' },
  { id: 'armor', name: 'Armor', emoji: ':armorVS:' },
  { id: 'magnet', name: 'Attractorb', emoji: ':attractorbVS:' },
  { id: 'curse', name: 'Skull O`Maniac', emoji: ':curseVS:' },
  { id: 'health', name: 'Hollow Heart', emoji: ':hollowheartVS:' },
  { id: 'revival', name: 'Tiragisú', emoji: ':tiragisuVS:' },
  { id: 'wings', name: 'Wings', emoji: ':wingsVS:' },
  { id: 'greed', name: 'Stone Mask', emoji: ':maskVS:' },
  { id: 'torrona', name: 'Torrona`s Box', emoji: ':torronasboxVS:' },
  { id: 'ring1', name: 'Silver Ring', emoji: ':silverringVS:', special: true },
  { id: 'ring2', name: 'Gold Ring', emoji: ':goldringVS:', special: true },
  { id: 'sign1', name: 'Metaglio Left', emoji: ':metaglioleftVS:', special: true },
  { id: 'sign2', name: 'Metaglio Right', emoji: ':metagliorightVS:', special: true },
  { id: 'badge', name: 'Academy Badge', emoji: ':grey_question:', dlc2: true },
]

const powerups = [
  { id: 'cooldown', name: 'Cooldown', emoji: ':emptytomeVS:' },
  { id: 'might', name: 'Might', emoji: ':spinachVS:' },
  { id: 'area', name: 'Area', emoji: ':candelabradorVS:' },
  { id: 'amount', name: 'Amount', emoji: ':duplicatorVS:' },
  { id: 'speed', name: 'Speed', emoji: ':bracerVS:' },
  { id: 'duration', name: 'Duration', emoji: ':spellbinderVS:' },
  { id: 'luck', name: 'Luck', emoji: ':cloverVS:' },
  { id: 'recovery', name: 'Recovery', emoji: ':pummarolaVS:' },
  { id: 'growth', name: 'Growth', emoji: ':crownVS:' },
  { id: 'armor', name: 'Armor', emoji: ':armorVS:' },
  { id: 'magnet', name: 'Magnet', emoji: ':attractorbVS:' },
  { id: 'curse', name: 'Curse', emoji: ':curseVS:' },
  { id: 'health', name: 'Max Health', emoji: ':hollowheartVS:' },
  { id: 'revival', name: 'Revival', emoji: ':tiragisuVS:' },
  { id: 'wings', name: 'MoveSpeed', emoji: ':wingsVS:' },
  { id: 'greed', name: 'Greed', emoji: ':maskVS:' },
  { id: 'omni', name: 'Omni', emoji: ':torronasboxVS:', special: true },
  { id: 'reroll', name: 'Reroll', emoji: ':rerollVS:', special: true },
  { id: 'skip', name: 'Skip', emoji: ':skipVS:', special: true },
  { id: 'banish', name: 'Banish', emoji: ':banishVS:', special: true },
]

const arcanas = [
  { id: 'arcana0', name: 'Game Killer', emoji: ':0GameKillerVS:', itemIds: ['experience', 'chest'] },
  { id: 'arcana1', name: 'Gemini', emoji: ':IGeminiVS:', itemIds: ['bird1', 'bird2', 'bird_', 'guns1', 'guns2', 'guns_', 'cat', 'cat_', 'fritta', 'popper'] },
  { id: 'arcana2', name: 'Twilight Requiem', emoji: ':IITwilightRequiemVS:', itemIds: ['bible', 'bible_', 'lightning', 'lightning_', 'bird1', 'bird2', 'runetracer', 'pinion', 'bone', 'flowers', 'bracelet_', 'wind', 'wind_', 'prism'] },
  { id: 'arcana3', name: 'Tragic Princess', emoji: ':IIITragicPrincess:', itemIds: ['cooldown', 'garlic', 'garlic_', 'water', 'water_', 'lightning', 'lightning_', 'cart'] },
  { id: 'arcana4', name: 'Awake', emoji: ':4VS:', itemIds: ['revival', 'health', 'armor', 'might', 'area', 'duration', 'speed', 'eskizzibur'] },
  { id: 'arcana5', name: 'Chaos in the Dark Night', emoji: ':5VS:', itemIds: ['speed'] },
  { id: 'arcana6', name: 'Sarabande of Healing', emoji: ':6VS:', itemIds: ['recovery', 'revival', 'whip_', 'vento_', 'garlic_', 'wind', 'wind_', 'muramasa', 'muramasa_', 'chicken', 'flowers'] },
  { id: 'arcana7', name: 'Iron Blue Will', emoji: ':7VS:', itemIds: ['knife', 'knife_', 'axe', 'axe_', 'guns1', 'guns2', 'cart', 'arrow'] },
  { id: 'arcana8', name: 'Mad Groove', emoji: ':VIIIMadGrooveVS:', itemIds: [] },
  { id: 'arcana9', name: 'Divine Bloodline', emoji: ':IXDivineBloodlinesVS:', itemIds: ['armor', 'health', 'cross', 'bible', 'garlic', 'water', 'lightning', 'mana', 'vento', 'sword', 'wind', 'eskizzibur', 'arrow'] },
  { id: 'arcana10', name: 'Beginning', emoji: ':XBeginningVS:', itemIds: ['amount', 'bone', 'cherry', 'cart', 'flowers', 'furniture'] },
  { id: 'arcana11', name: 'Waltz of Pearls', emoji: ':11VS:', itemIds: ['magicwand', 'magicwand_', 'firewand', 'firewand_', 'cross', 'cross_', 'cart'] },
  { id: 'arcana12', name: 'Out of Bounds', emoji: ':XIIOutOfBounds:', itemIds: ['lancet', 'lancet_', 'mirage', 'mirage_', 'orologion'] },
  { id: 'arcana13', name: 'Wicked Season', emoji: ':XIIIWickedSeasonVS:', itemIds: ['growth', 'luck', 'greed', 'curse'] },
  { id: 'arcana14', name: 'Jail of Crystal', emoji: ':XIVJailOfCrystal:', itemIds: ['magicwand', 'magicwand_', 'runetracer', 'runetracer_', 'bracelet', 'guns2', 'guns4', 'bird3', 'prism'] },
  { id: 'arcana15', name: 'Disco of Gold', emoji: ':XVDiscoOfGoldVS:', itemIds: ['cat_', 'greed', 'coin', 'coinbag', 'richcoinbag', 'bigcoinbag', 'gildedclover', 'chest'] },
  { id: 'arcana16', name: 'Slash', emoji: ':16VS:', itemIds: ['knife', 'knife_', 'whip', 'whip_', 'axe', 'axe_', 'vento', 'vento_', 'cross_', 'sword', 'muramasa_'] },
  { id: 'arcana17', name: 'Lost & Found Painting', emoji: ':17VS:', itemIds: ['duration'] },
  { id: 'arcana18', name: 'Boogaloo of Illusions', emoji: ':XVIIIBoogalOofIllusions:', itemIds: ['area'] },
  { id: 'arcana19', name: 'Heart of Fire', emoji: ':19VS:', itemIds: ['firewand', 'firewand_', 'guns1', 'pinion_', 'bracelet__', 'guns3', 'bird4', 'prism', 'brazier'] },
  { id: 'arcana20', name: 'Silent Old Sanctuary', emoji: ':XXSilentOldSanctuary:', itemIds: ['reroll', 'skip', 'banish'] },
  { id: 'arcana21', name: 'Blood Astronomia', emoji: ':XXIBloodAstronomiaVS:', itemIds: ['amount', 'magnet', 'garlic', 'garlic_', 'pentagram', 'pentagram_', 'mana', 'mana_', 'lancet', 'laurel'] },
]

const stages = [
  { id: 'forest', name: 'Mad Forest', itemIds: ['might', 'luck', 'health', 'recovery', 'curse'] },
  { id: 'library', name: 'Inlaid Library', itemIds: ['cooldown', 'greed'] },
  { id: 'plant', name: 'Dairy Plant', itemIds: ['magnet', 'area', 'wings', 'armor'] },
  { id: 'tower', name: 'Gallo Tower', itemIds: ['speed', 'duration'] },
  { id: 'capella', name: 'Cappella Magna', itemIds: ['growth', 'revival', 'amount'] },
  { id: 'moonspell', name: 'Mt.Moonspell', itemIds: ['might', 'recovery', 'area', 'amount', 'magnet', 'greed', 'muramasa'], dlc: true },
  { id: 'lake', name: 'Lake Foscari', itemIds: ['armor', 'speed', 'luck', 'growth', 'curse', 'badge' /* BoxArcana */], dlc2: true },
  { id: 'abyss', name: 'Abyss Foscari', itemIds: ['cooldown', 'magnet', 'greed', 'armor', 'curse', 'torrona'], dlc2: true },
  { id: 'acres', name: 'Green Acres', itemIds: [], special: true },
  { id: 'bonezone', name: 'The Bone Zone', itemIds: [], special: true },
  { id: 'molise', name: 'Il Molise', itemIds: [], special: true },
  { id: 'bridge', name: 'Tiny Bridge', itemIds: ['wings', 'vento', 'magnet', 'lightning'], special: true },
  { id: 'moongolow', name: 'Moongolow', itemIds: ['cooldown', 'might', 'area', 'amount', 'speed', 'duration', 'luck', 'recovery', 'growth', 'armor', 'magnet', 'curse', 'health', 'revival', 'wings', 'greed'], special: true },
  { id: 'bosses', name: 'Boss Rash', itemIds: ['cooldown', 'might', 'area', 'amount', 'speed', 'duration', 'luck', 'recovery', 'growth', 'armor', 'magnet', 'curse', 'health', 'revival', 'wings', 'greed'], special: true },
]

const pickups = [
  { id: 'bigcoinbag', name: 'Big Coin Bag' },
  { id: 'coinbag', name: 'Coin Bag' },
  { id: 'experience', name: 'Experience Gem' },
  { id: 'chicken', name: 'Floor Chicken' },
  { id: 'gildedclover', name: 'Gilded Clover' },
  { id: 'glassvizard', name: 'Glass Vizard' },
  { id: 'coin', name: 'Gold Coin' },
  { id: 'egg', name: 'Golden Egg' },
  { id: 'littleclover', name: 'Little Clover' },
  { id: 'littleheart', name: 'Little Heart' },
  { id: 'banger', name: 'Magic Banger' },
  { id: 'map', name: 'Milky Way Map' },
  { id: 'fritta', name: 'Nduja Fritta' },
  { id: 'orologion', name: 'Orologion' },
  { id: 'randomazzo', name: 'Randomazzo' },
  { id: 'richcoinbag', name: 'Rich Coin Bag' },
  { id: 'rosary', name: 'Rosary' },
  { id: 'tears', name: 'Sorceress` Tears' },
  { id: 'chest', name: 'Treasure Chest' },
  { id: 'arcana', name: 'BoxArcana' },
  { id: 'vacuum', name: 'Vacuum' },
  { id: 'yellowsign', name: 'Yellow Sign' },
]

const structures = [
  { id: 'lampost', name: 'Lampost' },
  { id: 'wagon', name: 'Cart' },
  { id: 'brazier', name: 'Brazier' },
  { id: 'brazier2', name: 'Brazier2' },
  { id: 'candelabrone', name: 'Candelabrone' },
]

const counterparts = [
  { id: 'bird3', name: 'Cygnus', itemsIds: [] },
  { id: 'bird4', name: 'Zhar Ptytsia', itemsIds: [] },
  { id: 'guns3', name: 'Red Muscle', itemsIds: [] },
  { id: 'guns4', name: 'Twice Upon a Time', itemsIds: [] },
  { id: 'cat2', name: 'Flock Destroyer', itemsIds: [] },
  { id: 'pooper', name: 'Party Pooper', dlc2: true },
  { id: 'sliver', name: 'Silver Sliver', dlc2: true },
  { id: 'insatiable', name: 'Insatiable', dlc2: true },
]

const enemies = []
const achievements = []
const authors = []

const items = [...characters, ...weapons, ...counterparts, ...passives, ...powerups, ...arcanas, ...stages, ...pickups, ...structures]

const allFramesById = {}
const powerupParams = ['level', 'maxHp', 'armor', 'regen', 'moveSpeed', 'power', 'cooldown', 'area', 'speed', 'duration', 'amount', 'luck', 'growth', 'greed', 'curse', 'magnet', 'revivals', 'rerolls', 'skips', 'banish']

// all: 'amount', 'area', 'bulletType', 'chance', 'charges', 'code', 'critChance', 'critMul', 'desc', 'description', 'duration', 'evoInto', 'evolvesFrom', 'evoSynergy', 'frameName', 'hidden', 'hitBoxDelay', 'hitsWalls', 'hitVFX', 'interval', 'intervalDependsOnDuration', 'isEvolution', 'isUnlocked', 'knockback', 'level', 'name', 'penetrating', 'poolLimit', 'power', 'rarity', 'repeatInterval', 'requires', 'requiresMax', 'speed', 'texture', 'tips', 'volume',
// ignored: 'bulletType', 'code', 'evoInto', 'evolvesFrom', 'evoSynergy', 'frameName', 'hidden', 'hitBoxDelay',  'hitVFX', 'intervalDependsOnDuration', 'isEvolution', 'isUnlocked', 'name', 'requires', 'requiresMax', 'texture', 'volume',
const baseWeaponParams = ['description', 'poolLimit', 'critChance', 'critMul', 'hitsWalls', 'knockback', 'rarity', 'tips']
const levelWeaponParams = [...powerupParams, 'chance', 'charges', 'desc', 'penetrating', 'interval', 'repeatInterval']

// all: 'amount', 'area', 'armor', 'banish', 'bgm', 'charName', 'code', 'completedStages', 'cooldown', 'curse', 'debugEnemies', 'debugTime', 'description', 'duration', 'exLevels', 'exWeapons', 'flipper', 'greed', 'growth', 'hidden', 'isBought', 'level', 'luck', 'magnet', 'maxHp', 'moveSpeed', 'noHurt', 'onEveryLevelUp', 'portraitName', 'power', 'prefix', 'price', 'regen', 'rerolls', 'revivals', 'showcase', 'skips', 'speed', 'spriteName', 'startingWeapon', 'surname', 'textureName', 'walkFrameRate', 'walkingFrames', 'sineMight','sineSpeed','sineDuration','sineArea','sineCooldown'}
// ignored: 'charName', 'code', 'exWeapons' (pungala), 'flipper' (leda), 'hidden', 'isBought', 'noHurt' (flowers), 'portraitName', 'showcase', 'spriteName', 'startingWeapon', 'textureName', 'walkFrameRate', 'walkingFrames',
const baseCharacterParams = ['prefix', 'surname', 'description', 'onEveryLevelUp', 'price', 'sineMight', 'sineSpeed', 'sineDuration', 'sineArea', 'sineCooldown']
const levelCharacterParams = [...powerupParams]

// all: 'armor', 'bulletType', 'code', 'description', 'frameName', 'isPowerUp', 'level', 'name', 'price', 'rarity', 'texture', 'unlockedRank' (armor),
// ignored: 'bulletType', 'code', 'frameName', 'isPowerUp', 'texture', 'unlockedRank',
const basePassiveParams = ['description', 'isPowerUp', 'name', 'rarity', 'price']
const levelPassiveParams = [...powerupParams]

// all: 'arcanaHolder', 'arcanaTreasure', 'background', 'BGM', 'BGMMOD', 'BGTextureName', 'bosses', 'cff', 'code', 'dayNight', 'description', 'destructibleChance', 'destructibleChanceMax', 'destructibleFreq', 'destructibleType', 'enemies', 'events', 'frameName', 'frameNameUnlock', 'frequency', 'hidden', 'hyper', 'hyperTips', 'legacyBGM', 'maxDestructibles', 'minimum', 'minute', 'mods', 'pizzaEvents', 'pizzaIntervalInMilliSeconds', 'spawnType', 'stageName', 'stageNumber', 'startingSpawns', 'texture', 'tilemapPos', 'tilemapTiledIMG', 'tilemapTiledJSON', 'tileset', 'tips', 'treasure', 'uiFrame', 'uiTexture', 'unlocked',
// mods: 'BGM_detune', 'BGM_ignoreModsForNewSoundtrack', 'BGM_new_rate', 'BGM_rate', 'ClockSpeed', 'EnemyHealth', 'EnemyMinimumMul', 'EnemySpeed', 'GoldMultiplier', 'LuckBonus', 'PlayerPxSpeed', 'ProjectileSpeed', 'StartingSpawns', 'TimeLimit', 'tips', 'unlocked', 'XPBonus',
// ignored: 'arcanaHolder', 'code', 'arcanaTreasure', 'background', 'BGM', 'BGTextureName', 'BGMMOD', 'bosses', 'cff', 'dayNight', 'destructibleChance', 'destructibleChanceMax', 'destructibleFreq', 'destructibleType', 'enemies', 'events', 'frameName', 'frameNameUnlock', 'frequency', 'hidden', 'hyper', 'hyperTips', 'legacyBGM', 'maxDestructibles', 'minimum', 'minute', 'pizzaEvents', 'pizzaIntervalInMilliSeconds', 'spawnType', 'stageName', 'stageNumber', 'startingSpawns', 'texture', 'tilemapPos', 'tilemapTiledIMG', 'tilemapTiledJSON', 'tileset', 'tips', 'treasure', 'uiFrame', 'uiTexture', 'unlocked',
const baseStageParams = ['description', 'mods', 'hyper']
const modStageParams = ['ClockSpeed', 'EnemyHealth', 'EnemySpeed', 'GoldMultiplier', 'LuckBonus', 'PlayerPxSpeed', 'ProjectileSpeed', 'TimeLimit', 'tips', 'XPBonus']
const minuteStageParams = []

// all: 'achievementTips', 'description', 'feverMS', 'frameName', 'hidden', 'inTreasures', 'isRare', 'isRelic', 'name', 'pickedupAmount', 'rarity', 'seen', 'texture', 'tips', 'unlocksAt', 'value',
// ignored: 'frameName', 'hidden', 'pickedupAmount', ''seen', 'texture',
const basePickupParams = ['achievementTips', 'description', 'feverMS', 'inTreasures', 'isRare', 'isRelic', 'name', 'rarity', 'tips', 'unlocksAt', 'value']

// all: 'destroyedAmount', 'frameName', 'maxHp', 'textureName',
// ignored: 'destructibleType', 'destroyedAmount', 'textureName',
const baseDestructibleParams = ['maxHp', 'frameName']

// all: 'arcanaType', 'description', 'enabled', 'frameName', 'items', 'major', 'name', 'texture', 'unlocked', 'weapons',
// ignored: 'arcanaType',  'enabled', 'frameName', 'items', 'texture', 'unlocked', 'weapons',
const baseArcanaParams = ['description', 'major', 'name']

// all: 'alias', 'alpha', 'bulletType', 'code', 'colliderOverride', 'deathKB', 'end', 'feverValue', 'fireDelay', 'flagName', 'frameNames', 'idleFrameCount', 'killedAmount', 'knockback', 'level', 'lives' 'maxHp', 'maxKnockback', 'maxSpeed', 'moreX', 'moreY' 'passThroughWalls', 'patrolDuration', 'power', 'res_Debuffs', 'res_Freeze', 'res_Knockback', 'res_Rosary', 'scale', 'skills', 'speed', 'textureName', 'tint', 'xp',
const baseEnemyParams = []

const imagesById = {}

try {
  let data = '' + readFileSync(`${src}/main.bundle.js`)
  let fixedData = ''

  const groupsMatch = data.matchAll(/[a-z0-9]+=(\{\[.+?(?=;|},_))/g)

  for (const [, rawGroupString] of groupsMatch) {
    const fixedGroupString = fixJsonString(rawGroupString)
    console.log(fixedGroupString)
    fixedData += '\n\n' + fixedGroupString
    try {
      const parsedGroup = JSON.parse(fixedGroupString)
      if (fixedGroupString.includes('"startingWeapon"')) {
        Object.assign(parsedGroup, require(`${__dirname}/src/characterData_Moonspell.json`))
        Object.assign(parsedGroup, require(`${__dirname}/src/characterData_Foscari.json`))
      }
      if (fixedGroupString.includes('"evoSynergy"')) {
        Object.assign(parsedGroup, require(`${__dirname}/src/weaponData_Moonspell.json`))
        Object.assign(parsedGroup, require(`${__dirname}/src/weaponData_Foscari.json`))
      }
      if (fixedGroupString.includes('"stageName"')) {
        Object.assign(parsedGroup, require(`${__dirname}/src/stageData_Moonspell.json`))
        Object.assign(parsedGroup, require(`${__dirname}/src/stageData_Foscari.json`))
      }
      const objects = []
      for (const code in parsedGroup) {
        if (parsedGroup[code][0]) {
          parsedGroup[code][0].code = code
        }
        objects.push(parsedGroup[code])
      }
      const object0 = objects[0][0] || objects[0]
      const type = object0.textureName || object0.texture || object0.uiTexture || ''
      if (type === 'characters') {
        for (const character of characters) {
          const levels = objects.find((lvls) => lvls[0] && lvls[0].charName === character.name && (!character.id.includes('mega') || lvls[0].prefix?.includes('Megalo')))
          if (levels) {
            levels.sort((a, b) => a.level - b.level)
            Object.assign(character, pickFields(levels[0], baseCharacterParams))
            character.levels = levels.map((level) => pickFields(level, levelCharacterParams))
            // delete extra growth
            for (let index = 1; index < character.levels.length; index++) {
              const level = character.levels[index]
              if (level.growth) {
                if (level.growth >= 1) {
                  level.growth = parseFloat((level.growth - 1).toFixed(3))
                }
                if (level.growth <= -1) {
                  level.growth = parseFloat((level.growth + 1).toFixed(3))
                }
                if (level.growth === 0) {
                  delete level.growth
                }
              }
            }
            // delete default values
            for (const param in defaultCharacterStats) {
              if (typeof character.levels[0][param] === 'undefined' || character.levels[0][param] === defaultCharacterStats[param]) {
                delete character.levels[0][param]
              } else {
                character.levels[0][param] = parseFloat((character.levels[0][param] - defaultCharacterStats[param]).toFixed(3))
              }
            }
            character.levels = character.levels.filter((level) => Object.values(level).length > 1)
            // save image
            imagesById[character.id] = getImage(levels[0].textureName, levels[0].spriteName)
          }
        }
      } else if (type === 'items') {
        for (const weapon of weapons.concat(evolutions).concat(counterparts)) {
          const levels = objects.find((lvls) => lvls[0] && lvls[0].name === weapon.name)
          if (levels) {
            for (let level = 0; level < levels.length; level++) {
              levels[level].level = levels[level].level || level + 1
            }
            Object.assign(weapon, pickFields(levels[0], baseWeaponParams))
            weapon.levels = levels.map((level) => pickFields(level, levelWeaponParams))
            // delete default values
            for (const param in defaultWeaponStats) {
              if (!weapon.levels[0][param] || weapon.levels[0][param] === defaultWeaponStats[param]) {
                delete weapon.levels[0][param]
              } else {
                // weapon.levels[0][param] = parseFloat((weapon.levels[0][param] - defaultWeaponStats[param]).toFixed(3))
              }
            }
            // delete some useless params
            if (weapon.id.includes('firewand') || weapon.id.includes('axe')) {
              delete weapon.levels[0].duration
            }
            if (weapon.id.includes('vento')) {
              delete weapon.levels[0].duration
            }
            if (weapon.id === 'laurel') {
              delete weapon.levels[0].power
            }
            // save image
            imagesById[weapon.id] = getImage(levels[0].texture, levels[0].frameName)
          }
        }

        for (const passive of passives.concat(powerups)) {
          const levels = objects.find((lvls) => lvls[0] && lvls[0].name === passive.name)
          if (levels) {
            for (let level = 0; level < levels.length; level++) {
              levels[level].level = levels[level].level || level + 1
            }
            Object.assign(passive, pickFields(levels[0], basePassiveParams))
            passive.levels = levels.map((level) => pickFields(level, levelPassiveParams))
            // save image
            imagesById[passive.id] = getImage(levels[0].texture, levels[0].frameName)
          }
        }

        for (const pickup of pickups) {
          const object = objects.find((obj) => !obj[0] && obj.name === pickup.name)
          if (object) {
            Object.assign(pickup, pickFields(object, basePickupParams))
            // save image
            imagesById[pickup.id] = getImage(object.texture, object.frameName)
          }
        }

        for (const destructible of structures) {
          const object = objects.find((obj) => !obj[0] && obj.frameName === destructible.name)
          if (object) {
            Object.assign(destructible, pickFields(object, baseDestructibleParams))
            // save image
            imagesById[destructible.id] = getImage(object.textureName, object.frameName)
          }
        }
      } else if (type === 'randomazzo') {
        for (const arcana of arcanas) {
          const object = objects.find((obj) => obj.name.includes(arcana.name))
          if (object) {
            Object.assign(arcana, pickFields(object, baseArcanaParams))
            // save image
            imagesById[arcana.id] = getImage(object.texture, object.frameName.padStart(2, 0))
          }
        }
      } else if (type === 'UI') {
        for (const minutes of objects) {
          const stage = stages.find((stg) => minutes[0] && minutes[0].stageName === stg.name)
          if (stage) {
            Object.assign(stage, pickFields(minutes[0], baseStageParams))
            stage.hyper = pickFields(stage.hyper, modStageParams)
            stage.mods = pickFields(stage.mods, modStageParams)
            // delete default values
            for (const param in defaultStageStats) {
              if (!stage.mods[param] || stage.mods[param] === defaultStageStats[param]) {
                delete stage.mods[param]
              }
              if (!stage.hyper[param] || stage.hyper[param] === defaultStageStats[param]) {
                delete stage.hyper[param]
              }
            }
            // stage.minutes = minutes.map((minute) => pickFields(minute, minuteStageParams))
            // save image
            imagesById[stage.id] = getImage(minutes[0].uiTexture, minutes[0].uiFrame)
          } else {
            // console.log(`Stage ${stage.name} not found`)
          }
        }
        //console.log(parsedObjects)
      } else if (type.includes('enemies')) {
        // enemies
      } else if ('achieved' in objects[0]) {
        // achievements
      } else if ('author' in objects[0]) {
        // authors
      } else if ('hitFrameName' in objects[0]) {
        // hits
      } else {
        const specialStages = objects.filter((a) => a.length && a.stageName)
        for (const minutes of specialStages) {
          const stage = stages.find((stg) => minutes && minutes[0].stageName === stg.name)
          if (stage) {
            Object.assign(stage, pickFields(minutes[0], baseStageParams))
            stage.hyper = pickFields(stage.hyper, modStageParams)
            stage.mods = pickFields(stage.mods, modStageParams)
            // delete default values
            for (const param in defaultStageStats) {
              if (!stage.mods[param] || stage.mods[param] === defaultStageStats[param]) {
                delete stage.mods[param]
              }
              if (!stage.hyper[param] || stage.hyper[param] === defaultStageStats[param]) {
                delete stage.hyper[param]
              }
            }
            // stage.minutes = minutes.map((minute) => pickFields(minute, minuteStageParams))
            // save image
            imagesById[stage.id] = getImage(minutes[0].uiTexture, minutes[0].uiFrame)
          }
        }
      }
    } catch (error) {
      console.log(error)
      // writeFileSync(`${src}/error_${Date.now()}.js`, fixedGroupString)
    }
  }

  // collect all fields from all levels
  // const fields = new Set()
  // for (const levelOrMinute of levelOrMinutes) {
  //   for (const feild in levelOrMinute) {
  //     fields.add(feild)
  //   }
  // }
  // console.log(fields)

  // temporary delete levels
  for (const object of characters.concat(weapons, evolutions, counterparts, passives, powerups)) {
    delete object.levels
  }

  writeFileSync(`${dst}/main.bundle_extracted.js`, fixedData)
  writeFileSync(`${dst}/data.js`, `window.vs = ${JSON.stringify({ characters, weapons, evolutions, counterparts, passives, powerups, arcanas, pickups, structures, stages }, null, 2)}`)
  // writeFileSync(`${dst}/data.js`, `window.vs = ${JSON.stringify({ characters, weapons, evolutions, passives, powerups, arcanas, pickups, structures, stages, defaultCharacterStats, defaultWeaponStats, defaultStageStats }, null, 2)}`)
  // writeFileSync(`${dst}/data.min.js`, `window.vs = ${JSON.stringify({ characters, weapons, evolutions, passives, powerups, arcanas, pickups, structures, stages, defaultCharacterStats, defaultWeaponStats, defaultStageStats })}`)
  writeFileSync(`${dst}/icons.css`, getCSS())
} catch (error) {
  console.log(error)
}

writeFileSync(`${dst}/framesById.json`, JSON.stringify(allFramesById, null, 2))

function fixJsonString(objectString) {
  objectString = ('' + objectString)
    .replaceAll(/\\'/g, `\``) // protect escaped quotes from replacing
    .replaceAll(/'"/g, `"\\"`) // protect double quotes
    .replaceAll(/"'/g, `\\""`) // protect double qoutes
    .replaceAll(/'(.*?(?='))'/g, '"$1"') // replace single quotes to double quotes
    .replaceAll(/\\`/g, `'`) // bring protected quotes back
    .replaceAll(/_?\w+\(((_|\w)+)\)/g, '"$1"') // replace encrypted functions
    .replaceAll(/_?\w+\["((_|\w)+)"\]/g, '"$1"') // replace encrypted objects
    .replaceAll(/"\w+"\[/g, `[`) // remove extra wrappers
    .replaceAll(/"\w+"\:\[\],/g, ``) // remove empty arrays
    .replaceAll(/\[\[("\w+")]]:/g, '$1:') // unwrap double array-keys
    .replaceAll(/\[("\w+")]:/g, '$1:') // unwrap array-keys
    .replaceAll(':!0x1', ':false')
    .replaceAll(':!0x0', ':true')

  // find hexadecimal numbers
  const numbersMatch = objectString.matchAll(/(0x[a-f0-9]+)/gim)
  // sort hexadecimal number by length to prevent replacing parts of them
  const uniqNumbers = [...new Set([...numbersMatch].map((numberMatch) => numberMatch[1]))].sort((a, b) => b.length - a.length)
  // replace hexadecimal numbers
  for (const uniqNumber of uniqNumbers) {
    objectString = objectString.replaceAll(uniqNumber, +uniqNumber)
  }

  // fix brackets
  let brackets = ''
  for (const letter of objectString) {
    if (letter === '{') {
      brackets = '}' + brackets
    }
    if (letter === '[') {
      brackets = ']' + brackets
    }
    if (letter === '}' || letter === ']') {
      brackets = brackets.replace(letter, '')
    }
  }

  return objectString + brackets
}

// levels[0].textureName, levels[0].spriteName
function getImage(textureName, name) {
  if (!textureName || !name) {
    console.log(`Error: name "${name}" and/or textureName "${textureName}" are empty`)
    return { data: '', width: 0, height: 0 }
  } else {
    console.log(`Info: name "${name}" / textureName "${textureName}"`)
  }
  const framesById = getFramesById(textureName)
  const frame = Object.values(framesById)
    .flat()
    .find((frame) => frame.filename === name || frame.id === name)

  if (frame) {
    // cut borders of arcanas
    if (textureName === 'randomazzo') {
      frame.x = frame.x + 1
      frame.y = frame.y + 11
      frame.w = 54
      frame.h = 58
    }
    // cut borders of stages
    if (textureName === 'UI') {
      frame.x = frame.x + 5
      frame.y = frame.y + 32
      frame.w = 146
      frame.h = 59
    }
    const image = '' + execSync(`magick.exe ${src}/${textureName}.png -crop ${frame.w}x${frame.h}+${frame.x}+${frame.y} inline:-`) //  ${dst}/character_${character.id}.png
    return { data: image, width: frame.w, height: frame.h }
  } else {
    console.log(`Can't find a frame of ${name} in ${textureName}`)
  }
}

function getCSS() {
  let content = `.icon { width: 1em; height: 1em; background-size: contain; background-position: center; background-repeat: no-repeat; }\n`
  for (const imageId in imagesById) {
    const image = imagesById[imageId]
    if (!image) {
      console.log(`Unknown image ${imageId}`)
      continue
    }
    const character = characters.find((c) => c.id === imageId)
    const backgroundData = `background-image: url("${image.data}");`
    const backgroundStyle = character ? `background-size: ${image.width / 10}em ${image.height / 10}em; background-position: left bottom;` : ''
    content += `.icon-${imageId} { ${backgroundData} ${backgroundStyle} }\n`
  }
  return content + '\n'
}

function getFramesById(sprite) {
  const data = JSON.parse('' + readFileSync(`${src}/${sprite}.json`))
  const texture = data.textures[0]
  const framesById = {}
  for (const frame of texture.frames) {
    // ignore death animations of enemies
    const [filename, id, index] = frame.filename.match(/(\w+)_i(\d+)\.png/) || frame.filename.match(/(\w+)_(\d\d)\.png/) || frame.filename.match(/([a-z]+\d?)(\d)\.png/i) || frame.filename.match(/(.+)\.png/) || []
    if (id) {
      const { w, h, x, y } = frame.frame
      framesById[id] = framesById[id] || []
      framesById[id].push({ id, index, filename, w, h, x, y })
      framesById[id] = framesById[id].sort((a, b) => (a.filename < b.filename ? -1 : 1))
    }
  }
  Object.assign(allFramesById, framesById)

  return framesById
}

function pickFields(object = {}, params = []) {
  // console.log('extract', params, 'from', object)
  if (typeof object !== 'object') {
    return object
  }
  return params.reduce((paramsById, param) => {
    if (typeof object[param] !== 'undefined') {
      paramsById[param] = object[param]
    }
    return paramsById
  }, {})
}
