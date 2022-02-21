class Pattern {
  constructor(palette) {
    this.palette = palette;
    this.pixels = [];
    this.maxShift = randomGaussian(1.018, 0.618);
    this.xRandomnessVol = randomGaussian(0.031, 0.003);
    this.yRandomnessVol = randomGaussian(0.031, 0.003);
    this.frameSize = 0.02*height;
    this.backgroundColor = palette[0];
    this.backgroundColor2 = color(hue(this.palette[0]), max(0,saturation(this.palette[0]) - random(3, 7)), min(random(3, 7) + brightness(this.palette[0]), 100));
    var whichRender = random(0, 1);
    if (whichRender < 0.2)
			this.renderType = 'Sprinkler';
    else if (whichRender < 0.5)
			this.renderType = 'Scribbler';		
    else if (whichRender < 0.9)
      this.renderType = 'Cycloïd';
    else if (whichRender < 1.0)
      this.renderType = 'Ellipse';
  }
  
  getNbColors() {
    return this.nbColors;
  }
    
  getRenderType() {
    return this.renderType;
  }

  unzoomPattern() {
		var zerosRow = [];
		for (var j = 0; j < this.pixels[0].length + 4; j++) {
			zerosRow.push(0);
		}
		var newPixels = [];
		newPixels.push(zerosRow);
		newPixels.push(zerosRow);
		for (var i = 0; i < this.pixels.length; i++) {
			var newRow = []; 
			newRow.push(0);
			newRow.push(0);
			for (var j = 0; j < this.pixels[i].length; j++) {
				newRow.push(this.pixels[i][j]);
			}
			newRow.push(0);
			newRow.push(0);
			newPixels.push(newRow);
		}
		newPixels.push(zerosRow);
		newPixels.push(zerosRow);
		this.pixels = newPixels;
  }
  
  initBackground() {
    background(this.backgroundColor);
    let c2 = this.backgroundColor2;
    if (random(0, 1) > 0.5) {
      console.log('Background is basic');
      saveParam('Macro', 'BackgroundType', 'Basic');
    } else {
      let c1 = this.backgroundColor;
      var xB = random(0, width);
      var yB = random(height/2, height);
      console.log('Background is gradient (x0=' + round(xB) + ', y0=' + round(yB) + ')');
      saveParam('Macro', 'BackgroundType', 'Gradient');
      saveParam('Macro', 'BackgroundGradX0', round(xB));
      saveParam('Macro', 'BackgroundGradY0', round(yB));
      for(let x=0; x < width + height*xB/yB; x++) {
        var yy = (-yB/xB)*(xB - x) + yB;
        var n = noise(x/300);
        let newc = lerpColor(c1,c2,n);
        stroke(newc);
        line(x,0,0,yy);
      }      
    }
    noStroke();
    console.log('Background color (H:S:B) is ' + round(hue(this.palette[0])) + '.' + round(saturation(this.palette[0])) + '.' + round(brightness(this.palette[0])));
  	saveParam('Macro', 'BackgroundColor', round(hue(this.palette[0])) + '-' + round(saturation(this.palette[0])) + '-' + round(brightness(this.palette[0])));
  }
  
  initFrame() {
    noStroke();
    push();
    rectMode(CORNERS);
    var frameColorIdx = int(random(0, this.palette.length))
    console.log('Frame color index is ' + frameColorIdx);
    saveParam('Macro', 'FrameColor', frameColorIdx);
    for (var i = 0; i < 67; i++) {
	    var frameColor = color((1 + randomGaussian(0, 1.618))*hue(this.palette[frameColorIdx]), (1 + randomGaussian(0, 1.618))*saturation(this.palette[frameColorIdx]), (1 + randomGaussian(0, 1.618))*brightness(this.palette[frameColorIdx]), (0.0618 + randomGaussian(0, 0.1618))*0.98);
	    fill(frameColor);
	    var thick = (0.666 + randomGaussian(0, 0.1618*2))*this.frameSize;
	    rect(0, 0, thick, height - thick);
	    rect(0, height - thick, width - thick, height);
	    rect(width - thick, thick, width, height);
	    rect(thick, 0, width, thick);  
	  }
		pop();
  }
  
  transform(w, h, pxw0, pxh0, mode, draw, x0, y0) {
    this.flipped = false;
    if (random(0, 1) > 0.5) {
			translate(width, 0);
      scale(-1, 1);
      this.flipped = true;
      console.log('Flipped!');
      saveParam('Macro', 'Flipped', true);
    }		
    this.initBackground();
    switch (this.renderType) {
      case 'Ellipse':
        this.render = new EllipseRender(this.xRandomnessVol, this.yRandomnessVol);
        break;
      case 'Rectangle':
        this.render = new RectangleRender(this.xRandomnessVol, this.yRandomnessVol);
        break;
      case 'Cycloïd':
        this.render = new CycloidRender(this.xRandomnessVol, this.yRandomnessVol);
        break;
      case 'Sprinkler':
        this.render = new GaussianSprinklerRender(this.xRandomnessVol, this.yRandomnessVol);
        break;	
      case 'Scribbler':
        this.render = new GaussianScribblerRender(this.xRandomnessVol, this.yRandomnessVol);
        break;					
    }
    var pxh = pxh0;
    var pxw = pxw0;
		var nonZeroPxRatio = this.getColoredPixelsRatio();
		var variablePxSize = true;
		if (this.getPatternType() === 'Geometrical' && nonZeroPxRatio > 0.06) {
			if (mode === 'Stretch') {
				this.unzoomPattern();
				saveParam('Meso', 'UnzoomedOnce', true);
				if (random(0, 1) < 0.5) {
					this.unzoomPattern();
					saveParam('Meso', 'UnzoomedTwice', true);
					if (random(0, 1) < 0.5) {
						this.unzoomPattern();
						saveParam('Meso', 'UnzoomedThrice', true)
					}					
				}
				variablePxSize = false;
				this.stretchAndClean(w, h, pxw, pxh);
			} else {
				this.stretchAndClean(random(this.pixels.length*pxw, 0.9*w), random(this.pixels[0].length*pxh, 0.9*h), 1.618*pxw, 1.618*pxh);
			}
		}

    var output = [];
    var colorIdxDict = createNumberDict(0, 0);
		this.maxShift = (this.render === 'Sprinkler' || this.render === 'Scribbler') ? 0 : this.maxShift; 
    var maxShift = this.maxShift;
    if (mode === 'VerticalRepeat') {
	    var rptNb = random(1, 4);
	    console.log('Vertical repeat number is ' + rptNb);
	    saveParam('Meso', 'VerticalRptNb', rptNb);
	  }
    rectMode(CENTER);
    var n = 0;
    var alpha = 0.98;
    if (random(0, 1) > 0.5)
      alpha = random(0.7, 0.99);
    console.log('Alpha is ' + alpha);
    saveParam('Meso', 'Alpha', alpha);
    var xShiftMultiple = (random(0, 1) > 0.5 ? -1 : 1)*max(2, randomGaussian(2, 16.18));
    console.log('xShiftMultiple is ' + xShiftMultiple);
    saveParam('Meso', 'HorizontalShiftMultiple', xShiftMultiple);
    var ixMax = int(w/pxw) + 1;
    var iyMax = int(h/pxh) + 1;
		var extraIx = int(0.2*ixMax);
		var extraIy = int(0.2*iyMax);
    var x = x0;
    var y = y0;
    for (var ix = 0; ix<ixMax + 2*extraIx; ix++) {
      output.push([]);
      for (var iy = 0; iy<iyMax + 2*extraIy; iy++) {
        output[ix].push(0);
      }
    }
		var changeHueAmpl = this.render.addScales ? random(0, 6.66) : random(6.18, 61.8);
    var extraDirectionalNoise = max(-6666, min(6666, random(0, 1) > 0.95 ? randomGaussian(1618, 1618) : randomGaussian(618, 1618)));
    console.log('Hue gradient amplitude is ' + changeHueAmpl);
		console.log('Extra directional noise is ' + extraDirectionalNoise);
    saveParam('Meso', 'HueGradientAmplitude', changeHueAmpl);
    saveParam('Meso', 'ExtraDirectionalNoise', extraDirectionalNoise);
    var gradShiftX = random(0, 1) < 0.2 ? width/2 : randomGaussian(width/2, width/16.18);
    var gradShiftY = random(0, 1) < 0.2 ? height/2 : randomGaussian(height/2, height/16.18);
    var gradXY = randomGaussian(0, height/6180);
    var gradAmpl =random(0.1, 1);
    console.log('Color alteration level is ' + round(100*gradAmpl) + '%, shift is ' + round(100*(gradShiftX - width/2)/width*2) + '%|' + round(100*(gradShiftY - height/2)/height*2) + '%');
    saveParam('Meso', 'ColorAlteration1Level', gradAmpl);
    saveParam('Meso', 'ColorAlteration1X0', round(100*gradShiftX/width));
		saveParam('Meso', 'ColorAlteration1Y0', round(100*gradShiftY/height));
    saveParam('Meso', 'ColorAlteration1XY', round(gradXY));
		var shiftX = 0;
		var shiftY = 0;
		var paletteShuffleDone = false;
		var okToShufflePalette = random(0, 1) > 0.5;
		saveParam('Meso', 'PaletteShuffleEnabled', okToShufflePalette);
		var originalPalette = [];
		for (var p = 0; p < this.palette.length; p++) {
			originalPalette.push(this.palette[p]);
		}
		var symAngleBase = randomGaussian(0, this.getPatternType() != 'Transversal' ? PI/22 : PI/11);
		var symAngleFreq = random(0, 1) > 0.79 ? 0 : randomGaussian(0.16, 1);
		var symNoiseVolume = random(0, 1) > 0.27 ? 0 : randomGaussian(0, 0.016);
		var isMirror = random(0, 1) > ((this.getPatternType() === 'Geometrical' || this.getPatternType() == 'Stains') ? 0.81 : 0.93);
		nonZeroPxRatio = this.getColoredPixelsRatio();
		var doRoundAngle = random(0, 1) > 0.9 && (nonZeroPxRatio < 0.618 || this.getPatternType() != 'Geometrical');
		var angleRoundingVal = doRoundAngle ? PI/int(random(3, 9)) : 0;
		var symCenterX = floor(ixMax/2) + randomGaussian(0, ixMax/30);
		var symCenterY = floor(iyMax/2) + randomGaussian(0, iyMax/30);
		var symTypeY = (abs(symAngleBase) > PI/16 && random(0, 1) > 0.062) ? random(0, 1) < 0.83 ? 'CleanMobile' : 'DirtyMobile' : 'Fixed';
		console.log('Sym angle base / angle freq / symTypeY / center / noise vol / isMirror / doRoundAngle / angleRoundingVal are: ' + floor(symAngleBase*180/PI) + '° / ' + round(symAngleFreq*100)/100 + ' / ' + symTypeY + ' / (' + round(symCenterX) + ', ' + round(symCenterY) + ') / '+ round(symNoiseVolume*10000)/10000 + ' / ' + isMirror + ' / ' + doRoundAngle + ' / ' + round(1/angleRoundingVal*PI));
		saveParam('Meso', 'DistorsionAngle', floor(symAngleBase*180/PI));
		saveParam('Meso', 'DistorsionFreq', symAngleFreq);
		saveParam('Meso', 'DistorsionType', symTypeY);
		saveParam('Meso', 'DistorsionCenterX', symCenterX/width);
		saveParam('Meso', 'DistorsionCenterY', symCenterY/height);
		saveParam('Meso', 'DistorsionNoiseLevel', symNoiseVolume);
		saveParam('Meso', 'DistorsionIsMirrored', isMirror);
		saveParam('Meso', 'DistorsionDoRounding', doRoundAngle);
		if (doRoundAngle)
			saveParam('Meso', 'DistorsionDoRoundingValue', floor(angleRoundingVal*180/PI));
		var symAngle = symAngleBase;
    for (var iy = iyMax - 1 + 2*extraIy; iy >= 0; iy--) {
      x = x0;
      y = y0 + iy*pxh;
			symCenterY = symTypeY === 'Fixed' ? symCenterY : symTypeY === 'DirtyMobile' ? height + y : iy;
			shiftY += 1*(random(0, 1) > 0.995)*(-1*random(0, 1) > 0.1618);
			symAngle = (noise(0, y/height/10)*symNoiseVolume + sin(y/height*PI*2*symAngleFreq))*symAngleBase;
      if (doRoundAngle && symAngleFreq != 0)
				symAngle = round(symAngle/angleRoundingVal)*angleRoundingVal;
			for (var ix = int(0.7*sqrt(PI*width/pxw0/8)*exp(4*noise(0.5*0.6, 0.5*0.16)/width/8)); ix < ixMax + 2*extraIx; ix++) {
				// pxw = pxw0*(1 + 0.162*cos(4*PI*symAngleFreq*ix/(ixMax + 2*extraIx)));
				pxw = pxw0*(variablePxSize ? 1 + noise(x/width*0.6, y/height*0.16)*0.24*cos(4*PI*symAngleFreq*ix/(ixMax + 2*extraIx)) : 1 + 0.4*exp(-pow(ix*pxw0 + gradXY/1000*y + 7*pxw0*noise(x/width*0.6, y/height*0.16)*cos(4*PI*symAngleFreq*ix/(ixMax + 2*extraIx))-width/2, 2)/width/8));
				// pxw = pxw0*(1.5 - abs(ix - 0.5*(ixMax + 2*extraIx))/(ixMax + 2*extraIx)*2);
				// pxw = pxw0*(87/pxw0 + 0.618*min(1, 1/abs(ix - 0.5*(ixMax + 2*extraIx))));
        x += pxw;
				shiftX += 1*(random(0, 1) > 0.975)*(-1*random(0, 1) > 0.222);
				var iy2 = (shiftY + 10*iyMax + (iy - symCenterY)*cos(symAngle) + (symCenterX - (isMirror ? int(ixMax/2 - abs(ix - ixMax/2)) : ix))*sin(symAngle) + symCenterY) % iyMax;//min(iyMax - 1, max(0, int((iy - symCenterY)*cos(symAngle) + (symCenterX - ix)*sin(symAngle) + symCenterY)));
				var ix2 = (shiftX + 10*ixMax + (iy - symCenterY)*sin(symAngle) + ((isMirror ? int(ixMax/2 - abs(ix - ixMax/2)) : ix) - symCenterX)*cos(symAngle) + symCenterX) % ixMax;//min(ixMax - 1, max(0, int((iy - symCenterY)*sin(symAngle) + (ix - symCenterX)*cos(symAngle) + symCenterX)));
        var i = 0;
        var j = 0;
        if (mode === 'Stretch') {
          i = (2*this.pixels.length + int(ix2*this.pixels.length/w*pxw0)) % this.pixels.length;
          j = (this.pixels[i].length + int(iy2*this.pixels[i].length/h*pxh)) % this.pixels[i].length;
        } else if (mode === 'Repeat') {
					var jj = int((iy2 + this.pixels[0].length - (1.4*h/pxh % this.pixels[0].length)/2));  
					var ii = (ix2 + this.pixels.length*(1 + int((jj - this.pixels[0].length)/this.pixels[0].length)/xShiftMultiple) - (1.4*w/pxw0 % this.pixels.length)/2);
          i = (this.pixels.length + int(ii % this.pixels.length)) % this.pixels.length;
          j = jj % this.pixels[i].length;
					if (okToShufflePalette && !paletteShuffleDone && (jj === this.pixels[i].length && random(0, 1) < 0.11 || j === 0 && random(0, 1) < 0.055)) {
						var newOrder = [];
						for (var c = 1; c < this.palette.length; c++)
							newOrder.push(c);
						shuffle(newOrder, true);
						var newPalette = [this.palette[0]];
						for (var c = 0; c < newOrder.length; c++)
							newPalette.push(this.palette[newOrder[c]]);
						this.palette = newPalette;
						paletteShuffleDone = true;
					} else if (okToShufflePalette && paletteShuffleDone && (jj === this.pixels[i].length && random(0, 1) < 0.11 || j === 0 && random(0, 1) < 0.055)) {
						this.palette = originalPalette;
						paletteShuffleDone = false;
					}
        } else if (mode === 'VerticalRepeat') {
          i = (this.pixels.length + int(ix2*this.pixels.length/w*pxw0)) % this.pixels.length;
					var jj = int(this.pixels[i].length + iy2*this.pixels[i].length/h*pxh*rptNb); 
          j = jj % this.pixels[i].length;
					if (okToShufflePalette && !paletteShuffleDone && (jj === this.pixels[i].length && random(0, 1) < (this.getPatternType() === 'Longitudinal' ? 0.77 : 0.11) || j === 0 && random(0, 1) < (this.getPatternType() === 'Longitudinal' ? 0.4 : 0.09))) {
						var newOrder = [];
						for (var c = 1; c < this.palette.length; c++)
							newOrder.push(c);
						shuffle(newOrder, true);
						var newPalette = [this.palette[0]];
						for (var c = 0; c < newOrder.length; c++)
							newPalette.push(this.palette[newOrder[c]]);
						this.palette = newPalette;
						paletteShuffleDone = true;
					} else if (okToShufflePalette && paletteShuffleDone && (jj === this.pixels[i].length && random(0, 1) < (this.getPatternType() === 'Longitudinal' ? 0.77 : 0.10) || j === 0 && random(0, 1) < (this.getPatternType() === 'Longitudinal' ? 0.39 : 0.08))) {
						this.palette = originalPalette;
						paletteShuffleDone = false;
					}
        }
        output[ix][iy] = this.pixels[i][j];
        if (draw) {
					var iColor = output[min(int(w/pxw0 - 1), max(0,ix - int(randomGaussian(0, maxShift/1.618))))][min(int(h/pxh - 1), max(0,iy + shiftY - int(randomGaussian(0, maxShift/1.618))))];
					var strokeColor;
					if (!colorIdxDict.hasKey(iColor))
						colorIdxDict.set(iColor, 0);
					if (iColor > 0) {
						strokeColor = null;
						colorIdxDict.set(iColor, colorIdxDict.get(iColor) + 1);
					} else
						strokeColor = this.backgroundColor2;
					var gradFact = gradAmpl*exp(-pow(x + noise(x/width*0.6, y/height*0.16)*0.24 + gradXY*y - gradShiftX, 2)/random(618000, 1618000));
					var colr = color(hue(this.palette[iColor]) + changeHueAmpl*(ix + iy)/(ixMax + iyMax), max(0, -16.18*(gradFact) + saturation(this.palette[iColor])), min(100, 16.18*(gradFact) + brightness(this.palette[iColor])), alpha);
          (this.render).render(colr, strokeColor, x + pxw/xShiftMultiple*(iy%xShiftMultiple), y, pxw, pxh, extraDirectionalNoise);
        }
      }
    }
    this.initFrame();
    console.log('NbColors is actually ' + colorIdxDict.size());
    saveParam('Macro', 'NbColorsActual', colorIdxDict.size());
		nonZeroPxRatio = this.getColoredPixelsRatio(); 
		console.log(round(nonZeroPxRatio*10000)/100 + '% colored pixels');
		saveParam('Meso', 'ColoredPixelsRatio', round(100*nonZeroPxRatio));
		console.log(this.getNbCorners());
		saveParam('Meso', 'NbCorners', this.getNbCorners());
		this.saveMicroParams();		
    return output;    
  }
	
	smoothenPatternDirty() {
		var newPixels = [];
		for (var i = 0; i < this.pixels.length; i++) {
			var newRow = [];
			for (var j = 0; j < this.pixels[0].length; j++) {
				var avgValue = 0;
				for (var e = -1; e < 2; e++) {
					for (var f = -1; f < 2; f++) {				
						var indexColor = (i + e === -1 || j + f === -1 || i + e === this.pixels.length || j + f === this.pixels[0].length) ? 0 : this.pixels[i + e][j + f];
						avgValue += indexColor;
					}
				}
				newRow.push(round(avgValue/9));
			}
			newPixels.push(newRow);
		}
		this.pixels = newPixels;
	}	
	
	smoothenPatternClean() {
		var newPixels = [];
		var maxChanges = this.pixels.length*this.pixels[0].length/50;
		for (var i = 0; i < this.pixels.length; i++) {
			var newRow = [];
			for (var j = 0; j < this.pixels[0].length; j++) {
				var dico = createNumberDict(0, 0);
				for (var e = -1; e < 2; e++) {
					for (var f = -1; f < 2; f++) {
						var indexColor = (i + e === -1 || j + f === -1 || i + e === this.pixels.length || j + f === this.pixels[0].length) ? 0 : this.pixels[i + e][j + f];
						if (dico.hasKey(indexColor))
							dico.add(indexColor, 1);
						else
							dico.set(indexColor, 1);
					}
				}
				var maxV = dico.maxValue();
				for(var key in dico.data) {
					if (dico.get(key) === maxV) {
						if (key == 0)
							newRow.push(0);
						else
							newRow.push(this.pixels[i][j]);
						break;
					}
				}
			}
			newPixels.push(newRow);
		}
		this.pixels = newPixels;
	}
	
  getColoredPixelsRatio() {
    var nonZeros = 0;
		var nbCols = this.pixels.length;
		var nbRows = this.pixels[0].length;
		for (var i = 0; i < nbCols; i++) {
			for (var j = 0; j < nbRows; j++) {
				if (this.pixels[i][j] > 0)
					nonZeros++;
			}
		}
		return nonZeros/nbCols/nbRows;
  }

  getNbCorners() {
    var nbCorners = 0;
		var nbCols = this.pixels.length;
		var nbRows = this.pixels[0].length;
		// for (var i =0; i<nbCols;i++)
		// 	console.log(this.pixels[i].join(' '));

		for (var i = 1; i < nbCols - 1; i++) {
			for (var j = 1; j < nbRows - 1; j++) {
				var cornerCheck = this.pixels[i-1][j] == this.pixels[i][j] && this.pixels[i-1][j-1] == this.pixels[i][j] 
				&& this.pixels[i][j-1] == this.pixels[i][j] && this.pixels[i+1][j-1] != this.pixels[i][j] 
				&& this.pixels[i+1][j] != this.pixels[i][j] && this.pixels[i+1][j+1] != this.pixels[i][j] 
				&& this.pixels[i][j+1] != this.pixels[i][j] && this.pixels[i-1][j+1] != this.pixels[i][j];   
				if (cornerCheck) {
					nbCorners++;
					continue;
				}
				cornerCheck = this.pixels[i-1][j] != this.pixels[i][j] && this.pixels[i-1][j-1] != this.pixels[i][j] 
				&& this.pixels[i][j-1] == this.pixels[i][j] && this.pixels[i+1][j-1] == this.pixels[i][j] 
				&& this.pixels[i+1][j] == this.pixels[i][j] && this.pixels[i+1][j+1] != this.pixels[i][j] 
				&& this.pixels[i][j+1] != this.pixels[i][j] && this.pixels[i-1][j+1] != this.pixels[i][j];   
				if (cornerCheck) {
					nbCorners++;
					continue;
				}
				cornerCheck = this.pixels[i-1][j] != this.pixels[i][j] && this.pixels[i-1][j-1] != this.pixels[i][j] 
				&& this.pixels[i][j-1] != this.pixels[i][j] && this.pixels[i+1][j-1] != this.pixels[i][j] 
				&& this.pixels[i+1][j] == this.pixels[i][j] && this.pixels[i+1][j+1] == this.pixels[i][j] 
				&& this.pixels[i][j+1] == this.pixels[i][j] && this.pixels[i-1][j+1] != this.pixels[i][j];   
				if (cornerCheck) {
					nbCorners++;
					continue;
				}
				cornerCheck = this.pixels[i-1][j] == this.pixels[i][j] && this.pixels[i-1][j-1] != this.pixels[i][j] 
				&& this.pixels[i][j-1] != this.pixels[i][j] && this.pixels[i+1][j-1] != this.pixels[i][j] 
				&& this.pixels[i+1][j] != this.pixels[i][j] && this.pixels[i+1][j+1] != this.pixels[i][j] 
				&& this.pixels[i][j+1] == this.pixels[i][j] && this.pixels[i-1][j+1] == this.pixels[i][j];   
				if (cornerCheck) {
					nbCorners++;
					continue;
				}
			}
		}
		return nbCorners;
  }	
	
	stretchAndClean(w, h, pxw, pxh) {
		var newPixels = [];
		var ixMax = int(w/pxw);
		var iyMax = int(h/pxh);
		for (var ix = 0; ix < ixMax; ix++) {
			var newRow = [];
			for (var iy = 0; iy < iyMax; iy++) {
				var i = int(ix*this.pixels.length/w*pxw);
				var j = int(iy*this.pixels[i].length/h*pxh);
				newRow.push(this.pixels[i][j]);
			}
			newPixels.push(newRow);
		}
		console.log('Pattern stretched!');
		saveParam('Meso', 'FinalStretch', true);
		this.pixels = newPixels;
		for (var t = 0; t < 3; t++) {
			if (this.getNbCorners() > 5 && this.getColoredPixelsRatio() > 0.09 && random(0, 1) < 0.05) {
				this.smoothenPatternClean();
				console.log('Pattern smoothed (clean #' + t + ')!');
				saveParam('Meso', 'FinalSmoothingClean' + t, true);
			} else {
				saveParam('Meso', 'FinalSmoothingClean' + t, false);
			}
		}
		if (random(0, 1) < 0.5) {	
			this.smoothenPatternDirty();
			console.log('Pattern smoothed (dirty)!');
			saveParam('Meso', 'FinalSmoothingDirty', true);			
		} else {
			saveParam('Meso', 'FinalSmoothingDirty', false);
		}
	}

	saveMicroParams() {
  	saveParam('Micro', 'PatternMaxPixelShift', this.maxShift);
  	saveParam('Micro', 'PatternRandomVolHorizontal', this.xRandomnessVol);
  	saveParam('Micro', 'PatternRandomVolVertical', this.yRandomnessVol);
	}
}

class TransversalPattern extends Pattern {
  constructor(palette, nbColors) {
    super(palette);
    this.nbColors = min(palette.length, nbColors);
    this.generatePattern();
  }
  
  getPatternType() {
    return 'Transversal';
  }
  
  generatePattern() {
    this.pixels.push([]);
    var nbPxByColor = 0.01618*height;
    var sizeMax = 1/(this.nbColors-1);
    var sizeMin = sizeMax/1.618;
    var startPos = 0;
    var idxPool = [];
    for (var i = 1; i<this.nbColors; i++)
      idxPool.push(i);
    for (var i = 0; i<this.nbColors-1; i++) {
      var endPos = random(startPos, min(1, startPos + sizeMax));
      for (var j = 0; j < int(nbPxByColor * (endPos - startPos)); j++) {
        this.pixels[0].push(0);
      }
      startPos = endPos;
      endPos = random(min(1, startPos + sizeMin), min(1, startPos + sizeMax));
      var draw = int(random(idxPool.length));
      for (var j = 0; j < int(nbPxByColor * (endPos - startPos)); j++) {      
        this.pixels[0].push(idxPool[draw]);
      }
      idxPool.splice(draw, 1);
      startPos = endPos;
    }
    var nbPxToFill = 1;
    for (var i = 0; i<this.pixels[0].length; i++) {
      if (this.pixels[0][i]>0)
        i=this.pixels[0].length;
      else
        nbPxToFill++
    }
    for (var j=0; j<nbPxToFill; j++)
      this.pixels[0].push(0); 
  }
}

class LongitudinalPattern extends Pattern {
  constructor(palette, nbColors) {
    super(palette);
    this.nbColors = min(palette.length, nbColors);
    this.xRandomnessVol = randomGaussian(0.011, 0.0006);
    this.yRandomnessVol = randomGaussian(0.011, 0.0006);
    this.maxShift = random(0.0, 1.3);
    this.generatePattern();
  }
  
  getPatternType() {
    return 'Longitudinal';
  }  
  
  generatePattern() {
    if (this.nbColors>1) {
      var idxPool = [];
      for (var i = 1; i<this.nbColors; i++)
        idxPool.push(int(random(1,this.nbColors)));
      for (var i = 0; i<idxPool.length; i++) {
        this.pixels.push([0]);
        this.pixels.push([idxPool[i]]);        
      }
      for (var i = idxPool.length-2; i>=0; i--) {
        this.pixels.push([0]);
        this.pixels.push([idxPool[i]]);        
      }
      var squeezeNb = int(random(1, this.pixels.length));
      console.log('Squeeze number is ' + squeezeNb);        
      for (var i = 0; i<squeezeNb; i++) {
        this.pixels.push([0]);
        this.pixels.unshift([0]);        
      }
      console.log('IdxPool is ' + idxPool);
    }
    this.pixels.push([0]);
  }
}

class StainsPattern extends Pattern {
  constructor(palette, nbColors) {
    super(palette);
    this.nbColors = min(palette.length, nbColors);
    this.xRandomnessVol = 0;
    this.yRandomnessVol = 0;
    this.maxShift = 0;
    this.generatePattern();
  }
  
  getPatternType() {
    return 'Stains';
  }  
  
  generatePattern() {
    if (this.nbColors>1) {
      var idxPool = [];
      idxPool.push(0);
      for (var i = 1; i<this.nbColors; i++)
        idxPool.push(int(random(1,this.nbColors)));
      var ixMax = 5000;
      var iyMax = ixMax*2;
      var noisVol = 0.000618;
      var minNoise = min(noise(0, 0), noise(ixMax*noisVol, 0), noise(0, iyMax*noisVol), noise(ixMax*noisVol, iyMax*noisVol), noise(ixMax*noisVol/2, iyMax*noisVol/2));
      var maxNoise = max(noise(0, 0), noise(ixMax*noisVol, 0), noise(0, iyMax*noisVol), noise(ixMax*noisVol, iyMax*noisVol), noise(ixMax*noisVol/2, iyMax*noisVol/2));
      for (var ix = 0; ix < ixMax; ix++) {
        var r = [];
        for (var iy = 0; iy < iyMax; iy++) {
        	r.push(idxPool[int(max(0, min(this.nbColors - 1, (noise(ix*noisVol, iy*noisVol) - minNoise)/(maxNoise - minNoise)*this.nbColors)))]);
				}
				this.pixels.push(r);
      }
    } else this.pixels.push([0]);
    // for (var i = int(0.99*this.pixels.length); i<this.pixels.length; i++) {
    // 	console.log(this.pixels[i].join(' '));
    // }
  }
}

const densityKeys = ['Imperceptible', 'Sparse', 'Balanced', 'Dense'];
var spotsDensities = new p5.TypedDict();

class SpotsPattern extends Pattern {
  constructor(palette) {
    super(palette);
    this.nbColors = min(palette.length, 2);
    this.spotsDensity = random(densityKeys);
    this.initSpotsRefData();
    this.generatePattern();
  }
  
  getPatternType() {
    return 'OrganizedSpots';
  }
  
  initSpotsRefData() {
    spotsDensities.create('Imperceptible', 39.9);
    spotsDensities.create('Sparse', 8.8);
    spotsDensities.create('Balanced', 2.6);
    spotsDensities.create('Dense', 1.4);
  }
  
  getSpotsDensity() {
    return this.spotsDensity;
  }


  saveMicroParams() {
  	super.saveMicroParams();
  	saveParam('Micro', 'SpotsDensity', this.spotsDensity);
  }
  
  generatePattern() {
    if (this.nbColors>1) {
      this.nbColors = 2;
      var r = 1;
      var rho = spotsDensities.get(this.spotsDensity);
      var size = int(2*r*rho);
      var colorIdx = int(random(1, this.palette.length));
      for (var x = 0; x<size; x++) {
        var ys = [];
        for (var y = 0; y<size; y++) {
          ys.push( pow(x-r, 2) + pow(y-r, 2) < r*r ? colorIdx : 0);
        }
        this.pixels.push(ys);
      }
    } else
      this.pixels.push([0]);
  }
}

class SpotsRandomPattern extends Pattern {
  constructor(palette) {
    super(palette);
    this.nbColors = min(palette.length, 2);
    this.spotsDensity = random(densityKeys);
    this.initSpotsRefData();
    this.generatePattern();
	}
  
  getPatternType() {
    return 'RandomSpots';
  }
  
  initSpotsRefData() {
    spotsDensities.create('Imperceptible', 0.0016);
    spotsDensities.create('Sparse', 0.016);
    spotsDensities.create('Balanced', 0.162);
    spotsDensities.create('Dense', 0.382);
  }
  
  getSpotsDensity() {
    return this.spotsDensity;
  }

  saveMicroParams() {
  	super.saveMicroParams();
  	saveParam('Micro', 'SpotsDensity', this.spotsDensity);
  }

  generatePattern() {
    if (this.nbColors>1) {
      this.nbColors = int(random(2, this.nbColors));
      var proba = spotsDensities.get(this.spotsDensity);
      var size = 100;
      //var colorIdx = int(random(1, this.palette.length));
      for (var x = 0; x<size; x++) {
        var ys = [];
        for (var y = 0; y<size*2; y++) {
          ys.push((random(0, 1) < proba) ? int(random(1, this.nbColors)) : 0);
        }
        this.pixels.push(ys);
      }
    } else
      this.pixels.push([0]);
  }
}

const automataType = ['Rectangular', 'Triangular'];
const automataRulesets = [[1, 1, 0, 1], [1, 1, 1, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 0, 1], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 0], [1, 0, 0, 1]];

class GeometricalPattern extends Pattern {
  constructor(palette, nbColors) {
    super(palette);
    this.nbColors = min(palette.length, 2);
    this.automataType = random(automataType);
    this.ruleset = random(automataRulesets);
    this.maxShift = max(0, randomGaussian(0.018, 1.018));
    this.xRandomnessVol = randomGaussian(0.011, 0.0006);
    this.yRandomnessVol = randomGaussian(0.011, 0.0006);
    this.epochs = max(3, min(10, int(randomGaussian(6, 2))));;
    this.generatePattern();
		if (random(0, 1) < this.getColoredPixelsRatio() && this.getNbCorners() > 3) {	
			this.smoothenPatternDirty();
			console.log('Smoothened (dirty final)!');
  		saveParam('Meso', 'SmoothDirtyFinal', true);			
		}
		if (random(0, 1) < this.getColoredPixelsRatio()/2 && this.getNbCorners() > 3) {	
			this.smoothenPatternClean();
			console.log('Smoothened (clean final)!');
			saveParam('Meso', 'SmoothCleanFinal', true);			
		}
	}
  
  getPatternType() {
    return 'Geometrical';
  }    	
  
  getAutomataType() {
    return this.automataType;
  }
  
  getAutomataRuleset() {
    return this.ruleset;
  }  
  
  getAutomataEpochs() {
    return this.epochs;
  }    
  
  transitionRule(a, b, c) {
    if (a == 1 && b == 1 && c == 1) return this.ruleset[0];
    if (a == 1 && b == 1 && c == 0) return this.ruleset[1];
    if (a == 1 && b == 0 && c == 1) return this.ruleset[1];
    if (a == 1 && b == 0 && c == 0) return this.ruleset[2];
    if (a == 0 && b == 1 && c == 1) return this.ruleset[1];
    if (a == 0 && b == 1 && c == 0) return this.ruleset[2];
    if (a == 0 && b == 0 && c == 1) return this.ruleset[2];
    if (a == 0 && b == 0 && c == 0) return this.ruleset[3];
    return 0;
  }
  
  generatePattern() {
    var size = max(33, min(99, int(randomGaussian(33, 11))));
    var epochs = this.epochs;
    var firstRow = [];
    for (var i = 0; i<size; i+=2) {
      if (i === size/2 + (size/2 - int(size/2)) || i === size/2 - (size/2 - int(size/2)) || i + 1 === size/2 + (size/2 - int(size/2)) || i + 1 === size/2 - (size/2 - int(size/2))) {
        firstRow[i] = 1;
        firstRow[i+1] = 1;
      } else {
        firstRow[i] = 0;
        firstRow[i+1] = 0;
      }
    }
    this.pixels.push(firstRow);
    this.pixels.push(firstRow);
    for (var e = 1; e<epochs; e++) {
      var row = [];
      for (var i = 0; i<size; i+=2) {      
        var a = this.automataType === 'Rectangular' ? this.pixels[2*e - 1][i - 2 % size] : this.pixels[2*e - 1][i - 1 % size];
        var b = this.automataType === 'Rectangular' ? this.pixels[2*e - 1][i % size] : this.pixels[2*e - 1][i + 1 % size];
        var c = this.automataType === 'Rectangular' ? this.pixels[2*e - 1][i - 2 % size] : 0;
        var res = this.transitionRule(a, b, c);
        row[i] = res;
        if (this.automataType === 'Rectangular' || e/2 === int(e/2)) {
          row[i + 1] = res;
        } else {
          a = this.pixels[2*e - 1][i % size];
          b = this.pixels[2*e - 1][i + 2 % size];
          res = this.transitionRule(a, b, c);
          row[i + 1] = res;
        }
      }
      this.pixels.push(row);
      this.pixels.push(row);
    }
		if (random(0, 1) < this.getColoredPixelsRatio()) {	
			this.smoothenPatternDirty();
			console.log('Smoothened at start (dirty)!');
			saveParam('Meso', 'SmoothDirtyStart', true);						
		}
		if (random(0, 1) < this.getColoredPixelsRatio()/4 && this.getNbCorners() > 10) {	
			this.smoothenPatternClean();
			console.log('Smoothened at start (clean)!');
			saveParam('Meso', 'SmoothCleanStart', true);
		}
    for (var e = epochs; e>0; e--) {
      var row = [];
      for (var i = 0; i<size; i+=2) {
        row[i] = this.pixels[(2*e-1)][i];
        row[i+1] = this.pixels[(2*e-1) ][i+1];          
      }
      this.pixels.push(row);
      this.pixels.push(row);
    }
    if (random(0, 1) > 0.5) {
      var row = [];
      for (var i = 0; i<size; i+=2) {
        row[i] = 0;
        row[i+1] = 0;
      }
      this.pixels.push(row);
      this.pixels.push(row);
      this.pixels.unshift(row);
      this.pixels.unshift(row); 
    }
		if (random(0, 1) < this.getColoredPixelsRatio()) {	
			this.smoothenPatternDirty();
			console.log('Smoothened at midstage (dirty)!');		
			saveParam('Meso', 'SmoothDirtyMid', true);
		}
		if (random(0, 1) < this.getColoredPixelsRatio()/4) {	
			this.smoothenPatternClean();
			console.log('Smoothened at midstage (clean)!');		
			saveParam('Meso', 'SmoothCleanMid', true);
		}			
    var colorIdx = int(random(1, this.palette.length));
    var colorIdx2 = int(random(1, this.palette.length));
    colorIdx2 += (colorIdx2 === colorIdx) ? (colorIdx2 === 1) ? 1 : -1 : 0;  
    console.log('Colors 1 & 2 are ' + colorIdx + ' & ' + colorIdx2);
    var imax = this.pixels.length;
    var jmax = this.pixels[0].length;
    var insides = [];
    for (var i = 0; i<imax; i++) {
      insides.push([]);
      for (var j = 0; j<jmax; j++) {
        var val = this.pixels[i][j]===0 ? 0 : 1;
        insides[i].push(val);
      }
    }
    for (var i = 0; i<imax; i++) {
      for (var j = 0; j<jmax; j++) {
        if (insides[i][j] == 1) {
          this.pixels[i][j] = colorIdx;
        } else if (j > 0 && i > 0) {
          if (insides[i][j - 1] == 0 || insides[i - 1][j] == 0) {
            if (insides[i - 1][j] == 2) {
              for (var ii = i - 1; ii > 0; ii--) {
                if (insides[ii][j] == 2) {
                  insides[ii][j] = 0;
                  this.pixels[ii][j] = 0;
                }
                else
                  break;
              }
            }
            if (insides[i][j - 1] == 2) {
              for (var jj = j - 1; jj > 0; jj--) {
                if (insides[i][jj] == 2) {
                  insides[i][jj] = 0;
                  this.pixels[i][jj] = 0;
                }
                else
                  break;
              }
            }
            insides[i][j] = 0;
            this.pixels[i][j] = 0
            continue;
          } else if (insides[i][j] == 1)
            continue;
          else if (insides[i][j - 1] == 2 || insides[i - 1][j] == 2) {
            insides[i][j] = 2;
            this.pixels[i][j] = colorIdx2;
          } else if (insides[i][j - 1] === 1 || insides[i - 1][j] === 1) {
            var changesUp = 0;
            for (var jj = j - 1; jj > 0; jj--) {
              if ((this.pixels[i][jj + 1] !== this.pixels[i][jj]) && (this.pixels[i][jj + 1]*this.pixels[i][jj] === 0)) {
                changesUp++;
                break;
              }
            }
            if (changesUp === 0) {
              if (insides[i - 1][j] == 2) {
                for (var ii = i - 1; ii > 0; ii--) {
                  if (insides[ii][j] == 2) {
                    insides[ii][j] = 0;
                    this.pixels[ii][j] = 0;
                  }
                  else 
                    break;
                }
              }
              continue;   
            }
            var changesDown = 0;
            for (var jj = j + 1; jj < jmax; jj++) {
              if ((this.pixels[i][jj - 1] !== this.pixels[i][jj]) && (this.pixels[i][jj - 1]*this.pixels[i][jj] === 0)) {
                changesDown++;
                break;
              }
            }      
            if (changesDown === 0) {
              if (insides[i - 1][j] == 2) {
                for (var ii = i - 1; ii > 0; ii--) {
                  if (insides[ii][j] == 2) {
                    insides[ii][j] = 0;
                    this.pixels[ii][j] = 0;
                  }
                  else
                    break;
                }
              }
              continue;   
            }
            var changesLeft = 0;
            for (var ii = i - 1; ii > 0; ii--) {
              if ((this.pixels[ii + 1][j] !== this.pixels[ii][j]) && (this.pixels[ii + 1][j]*this.pixels[ii][j] === 0)) {
                changesLeft++;
                break;
              }
            }
            if (changesLeft === 0) {
              if (insides[i][j - 1] == 2) {
                for (var jj = j - 1; jj > 0; jj--) {
                  if (insides[i][jj] == 2) {
                    insides[i][jj] = 0;
                    this.pixels[i][jj] = 0;
                  }
                  else
                    break;
                }
              }              
              continue;
            }
            var changesRight = 0;
            for (var ii = i + 1; ii < imax; ii++) {
              if ((this.pixels[ii - 1][j] !== this.pixels[ii][j]) && (this.pixels[ii - 1][j]*this.pixels[ii][j] === 0)) {
                changesRight++;
                break;
              }
            }      
            if (changesRight === 0) {
              if (insides[i][j - 1] == 2) {
                for (var jj = j - 1; jj > 0; jj--) {
                  if (insides[i][jj] == 2) {
                    insides[i][jj] = 0;
                    this.pixels[i][jj] = 0;
                  }
                  else
                    break;
                }
              }              
              continue;
            }
            insides[i][j] = 2;
            this.pixels[i][j] = colorIdx2;
          }
        }
      }    
    }
		if (this.getColoredPixelsRatio() > 0.009 && random(0, 1) < max(0.15, 2*this.getColoredPixelsRatio()) && this.getNbCorners() > 3) {	
			this.smoothenPatternDirty();
			console.log('Smoothened at finish (dirty) #1!');
			saveParam('Meso', 'SmoothDirtyFinish1', true);
			if (this.getColoredPixelsRatio() > 0.009 && random(0, 1) < 2*this.getColoredPixelsRatio() && this.getNbCorners() > 3) {	
				this.smoothenPatternDirty();
				saveParam('Meso', 'SmoothDirtyFinish2', true);
				console.log('Smoothened at finish (dirty) #2!');		
			}
		}
		if (this.getColoredPixelsRatio() > 0.009 && random(0, 1) < this.getColoredPixelsRatio() && this.getNbCorners() > 9) {	
			this.smoothenPatternClean();
			console.log('Smoothened at finish (clean) #1!');		
			saveParam('Meso', 'SmoothCleanFinish1', true);
			if (this.getColoredPixelsRatio() > 0.009 && random(0, 1) < this.getColoredPixelsRatio() && this.getNbCorners() > 9) {	
				this.smoothenPatternClean();
				console.log('Smoothened at finish (clean) #2!');		
				saveParam('Meso', 'SmoothCleanFinish2', true);
			}		
		}
  }
}