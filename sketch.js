const patterns = ['Transversal', 'Longitudinal'];//, 'Transversal', 'Longitudinal', 'Spots', 'Stains', 'Stains', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical', 'Geometrical'];
var palettes = new p5.TypedDict();
const paletteKeys = ['Annild', 'Bobb', 'Colib', 'Elpid', 'Elpid', 'Lamiy', 'Pared', 'Pared', 'Viper', 'Xenop'];
var pproject = 'Skins 0.71';
var paramsDict;

function setup() {
  for (var iter=0; iter < 10; iter++) {
    console.log('Generating #' + (iter + 1));
  initParamsDict();
  var seeds = [];
  for(let i = 0; i < 1; i++) {
    seeds.push(int(random()*pow(10,12)));
  }
  var seed = seeds.join('');
  //var seed = 66503027;//-1015296444;// -439467224;// 1606821863;// 577385954;//125452737; //-96248538;// // 135430015;//1717035749;//1110303483 ;//-1028029964 ; //  
  console.log(`Using seed: ${seed}`);
  saveParam('Macro', 'Seed', seed);
  randomSeed(seed);
  noiseSeed(seed);

  colorMode(HSB);
  var wHeight = 3000;//windowHeight;//2222;
  createCanvas(wHeight/2, wHeight);
  console.log('Canvas size is ' + width + 'x' + height);
  saveParam('Macro', 'Width', width);
  saveParam('Macro', 'Height', height);
  noStroke();
  initColors();
  initPalettes();
  var palette = selectRandomPalette();
  var pattern = generateRandomPattern(palette, true);
  saveCanvas(pproject + '_seed=' + seed, 'png');
  paramsDict.saveJSON(pproject + '_seed=' + seed);
  // saveCanvas([pproject, pattern.getAutomataRuleset().join(''), pattern.getAutomataType(), pattern.getAutomataEpochs()].join('-') + '_seed=' + seed, 'png');
  // paramsDict.saveJSON([pproject, pattern.getAutomataRuleset().join(''), pattern.getAutomataType(), pattern.getAutomataEpochs()].join('-') + '_seed=' + seed);
  }
}

function initParamsDict() {
  paramsDict = new p5.TypedDict();
  paramsDict.create('Macro', new p5.TypedDict());
  paramsDict.create('Meso', new p5.TypedDict());
  paramsDict.create('Micro', new p5.TypedDict());
}

function saveParam(level, name, value) {
  paramsDict.get(level).create(name, value);
}

function generateRandomPattern(palette, drawPreview) {
  var pattern;
  var patType = random(patterns); 
  
	if (patType==='Transversal') {
    pattern = new TransversalPattern(palette, palette.length);
  } else if (patType==='Longitudinal') {
    pattern = new LongitudinalPattern(palette, int(random(2, palette.length+1)));
  } else if (patType==='Stains') {
    pattern = new StainsPattern(palette, int(random(2, palette.length+1)));
  } else if (patType==='Spots') {
    if (random(0, 1) > 0.51)
      pattern = new SpotsPattern(palette);
    else
      pattern = new SpotsRandomPattern(palette);
    console.log('Spots Density is "' + pattern.getSpotsDensity() + '"');
    saveParam('Meso', 'SpotsDensity', pattern.getSpotsDensity());
  } else if (patType==='Geometrical') {
    pattern = new GeometricalPattern(palette);
    console.log('Automata Type is "' + pattern.getAutomataType() + '"');
    console.log('Automata Ruleset is "' + pattern.getAutomataRuleset().join('-') + '"');
    console.log('Automata Epochs is ' + pattern.getAutomataEpochs());
    saveParam('Meso', 'AutomataType', pattern.getAutomataType());
    saveParam('Meso', 'AutomataRuleset', pattern.getAutomataRuleset().join('-'));
    saveParam('Meso', 'AutomataEpochs', pattern.getAutomataEpochs());
  }
  console.log('Pattern Type is "' + pattern.getPatternType() + '"');
  console.log('Render Type is "' + pattern.getRenderType() + '"');
  console.log('NbColors is '+ pattern.getNbColors());
  saveParam('Macro', 'PatternType', pattern.getPatternType());
  saveParam('Macro', 'RenderType', pattern.getRenderType());
  saveParam('Macro', 'NbColorsTheoretical', pattern.getNbColors());
  var mode = (patType==='Spots' || (random(0, 1) > 0.67 && (patType === 'Geometrical' || patType === 'Transversal'))) ? 'Repeat' : random(0, 1) > 0.6 ? 'VerticalRepeat' : 'Stretch';
  console.log('Repeat mode is '+ mode);
  saveParam('Macro', 'RepeatMode', mode); 
  var pxSize = max(8, randomGaussian(12, 5))*height/2000;
  console.log('PxSize is '+ pxSize);
  saveParam('Macro', 'PixelSize', pxSize);
  saveParam('Macro', 'CreatedBy', 'MaKRz');
  var output = pattern.transform(width, height, pxSize, pxSize, mode, drawPreview, 0, 0);
  return pattern;
}

function selectRandomPalette() {
  var keysPool = [];
  for (var k = 0; k<paletteKeys.length; k++)
    for (var c = 0; c<palettes.get(paletteKeys[k]).length; c++)
      keysPool.push(paletteKeys[k]);
  var key = random(keysPool);
  var palettesPool = palettes.get(key);
  var idx = int(random(palettesPool.length));
  console.log('Palette Key is "' + key + '"');
  console.log('Palette Index is ' + idx);
  saveParam('Macro', 'PaletteKey', key);
  saveParam('Macro', 'PaletteIndex', idx);
  var paletteName = getPaletteName(key, idx);
  console.log('Palette Name is ' + paletteName);
  saveParam('Macro', 'PaletteName', paletteName);
  return palettesPool[idx];  
}

function getPaletteName(prefix, idx) {
  var suffixes = ['a', 'i', 'shi', 'z', 'ka', 'o', 'e', 'ud'];
  var charToShave = [1, 3, 2, 1, 2, 0, 2, 3];
  return prefix.substring(0, prefix.length - charToShave[idx]) + suffixes[idx];
}

function getTextWidth(text, font) {
    var context = drawingContext;
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}