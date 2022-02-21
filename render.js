class Render {
  constructor(xRandomnessVol, yRandomnessVol) {
    this.xRandomnessVol = xRandomnessVol;
    this.yRandomnessVol = yRandomnessVol;
    this.noiseSensi = randomGaussian(0.0016, 0.00016);
		this.scaleMissingRatio = random(0, 1) < 0.5 ? 0 : random(0, 1) < 0.8 ? int(random(0, 0.75)*10)/10 : int(random(0.75, 1.1)*10)/10;
		this.scaleNbVertices = random(0, 1) < 0.01 ? 3 : int(random(4, 9));
		this.scaleSize = max(0.1, randomGaussian(0.8, 0.8*0.618/3));
  }
  
	saveMicroParams() {
  	saveParam('Micro', 'RenderNoiseSensi', this.noiseSensi);
		saveParam('Micro', 'RenderScalesPresence', this.addScales);
		saveParam('Micro', 'RenderScalesNbVertices', this.scaleNbVertices);
		saveParam('Micro', 'RenderScalesSize', this.scaleSize);
		saveParam('Micro', 'RenderScalesMissingRatio', this.scaleMissingRatio);
  	saveParam('Micro', 'RenderRandomVolHorizontal', this.xRandomnessVol);
  	saveParam('Micro', 'RenderRandomVolVertical', this.yRandomnessVol);		
	}
}

class EllipseRender extends Render {
  constructor(xRandomnessVol, yRandomnessVol) {
    super(xRandomnessVol, yRandomnessVol);
		this.addScales = random(0, 1) > 0.15;
  }
  
  render(fillColor, strokeColor, x, y, pxw, pxh, extraDirectionalNoise) {
    if (strokeColor)
      stroke(strokeColor);
    else
      noStroke();
    fill(fillColor);
    var shiftFactor = randomGaussian(666, 66) + extraDirectionalNoise;
    var xDev = x + randomGaussian(0, this.xRandomnessVol*pxw) + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height)));
    var yDev = y + randomGaussian(0, this.yRandomnessVol*pxh) + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))); 
    var pxwDev = pxw/2*1.6 + randomGaussian(0, this.xRandomnessVol*pxw*2);
    var pxhDev = pxh/2*1.6 + randomGaussian(0, this.yRandomnessVol*pxh);
    ellipse(xDev, yDev, pxwDev, pxhDev);
		if (this.addScales) {
			var newStrokeColor = color(hue(fillColor), (brightness(fillColor) < 40) ? (0.44*sqrt(saturation(fillColor))) : min(91, 1.234*saturation(fillColor)), min(90, ((brightness(fillColor) < 40) ? 4 : 0.44) * brightness(fillColor)), alpha(fillColor)*0.555);
			stroke(newStrokeColor);
			strokeWeight(width/515 + randomGaussian(0, 0.5));
			var lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.789);
			fill(lowAlphaFillColor);
			beginShape();
			var scqleSize = this.scaleSize;
			var initAngle = PI/2;
			if (random(0, 1) > this.scaleMissingRatio) {
				for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
					vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + sin(angle)*scqleSize*pxh);
				}
			} else {
				for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
					vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxh);
				}
			}
			endShape();
		} else {
			  var angle = -PI/2 + PI*noise(x/width/3, y/height/4);
			  var angleLeft = angle - PI*0.2;
			  var angleRight = angle + PI*0.2;
			  var r = 0.7*sqrt(pow(pxwDev/2*cos(angle), 2) + pow(pxhDev/2*sin(angle), 2));
			  var rLeft = 0.7*sqrt(pow(pxwDev/2*cos(angleLeft), 2) + pow(pxhDev/2*sin(angleLeft), 2));
			  var rRight = 0.7*sqrt(pow(pxwDev/2*cos(angleRight), 2) + pow(pxhDev/2*sin(angleRight), 2));
			  push();
				strokeWeight((pxw + pxh)/15.5);
		    stroke(hue(fillColor), 0.333*saturation(fillColor), 33 + 0.67*brightness(fillColor), 0.44 + 0.44*noise(x/5/width, y/44/height));
		    line(xDev + 0.8*cos(angleLeft)*rLeft, yDev + 0.8*sin(angleLeft)*rLeft, xDev + 0.8*cos(angle)*r, yDev + 0.8*sin(angle)*r);
		    line(xDev + 0.8*cos(angleRight)*rRight, yDev + 0.8*sin(angleRight)*rRight, xDev + 0.8*cos(angle)*r, yDev + 0.8*sin(angle)*r);
		    stroke(hue(fillColor), 0.162*saturation(fillColor), 55 + 0.45*brightness(fillColor), 0.51 + 0.44*noise(x/5/width, y/44/height));
		    line(xDev + 0.7*cos(angleLeft)*rLeft, yDev + 0.7*sin(angleLeft)*rLeft, xDev + 0.7*cos(angle)*r, yDev + 0.7*sin(angle)*r);
		    line(xDev + 0.7*cos(angleRight)*rRight, yDev + 0.7*sin(angleRight)*rRight, xDev + 0.7*cos(angle)*r, yDev + 0.7*sin(angle)*r);
		    pop();
		}
	}
}

class CycloidRender extends Render {
  constructor(xRandomnessVol, yRandomnessVol) {
    super(xRandomnessVol, yRandomnessVol);
		this.scaleMissingRatio = min(1, max(0, int(randomGaussian(0, 3))/10));
		this.addScales = random(0, 1) > 0.15;
  }
  
  render(fillColor, strokeColor, x, y, pxw, pxh, extraDirectionalNoise) {
    if (strokeColor)
      stroke(strokeColor);
    else
      noStroke();
    fill(fillColor);
    var scqleSize = 1.2;
    var shiftFactor = randomGaussian(666, 66) + extraDirectionalNoise;
    beginShape();
    for (let angle = 0; angle <= TWO_PI*2; angle = angle + PI*0.25) {
      let r = scqleSize*noise(x + y, x + cos(angle) + 1, y + sin(angle) + 1)*sqrt(pow(pxw/2*cos(angle), 2) + pow(pxh/2*sin(angle), 2));
      let xrDev = randomGaussian(0, this.xRandomnessVol*pxw) + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height)));
      let xpos = x + xrDev + cos(angle)*r;
      let yrDev = randomGaussian(0, this.yRandomnessVol*pxh) + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height)));
      let ypos = y + yrDev + sin(angle)*r;
      curveVertex(xpos, ypos);             
      endShape();
    	if(angle > TWO_PI*1.6 && !this.addScales) {
    		push();
				strokeWeight(width/509);
		    stroke(hue(fillColor), 0.333*saturation(fillColor), 33 + 0.67*brightness(fillColor), 0.44 + 0.44*noise(x/5/width, y/100/height));
		    line(x + xrDev + 0.9*cos(angle - PI*0.25)*r, y + yrDev + 0.9*sin(angle - PI*0.25)*r, x + xrDev + 0.9*cos(angle)*r, y + yrDev + 0.9*sin(angle)*r);
		    line(x + xrDev + 0.9*cos(angle + PI*0.25)*r, y + yrDev + 0.9*sin(angle + PI*0.25)*r, x + xrDev + 0.9*cos(angle)*r, y + yrDev + 0.9*sin(angle)*r);
		    stroke(hue(fillColor), 0.162*saturation(fillColor), 55 + 0.45*brightness(fillColor), 0.51 + 0.44*noise(x/5/width, y/100/height));
		    line(x + xrDev + 0.8*cos(angle - PI*0.2)*r, y + yrDev + 0.8*sin(angle - PI*0.2)*r, x + xrDev + 0.8*cos(angle)*r, y + yrDev + 0.8*sin(angle)*r);
		    line(x + xrDev + 0.8*cos(angle + PI*0.2)*r, y + yrDev + 0.8*sin(angle + PI*0.2)*r, x + xrDev + 0.8*cos(angle)*r, y + yrDev + 0.8*sin(angle)*r);
		    pop();
    	}
    }
		if (this.addScales) {
			var newStrokeColor = color(hue(fillColor), min(91, 1.234*saturation(fillColor)), min(90, 0.44*brightness(fillColor)), alpha(fillColor)*0.555); //color(hue(fillColor), (brightness(fillColor) < 40) ? (0.44*sqrt(saturation(fillColor))) : min(91, 1.234*saturation(fillColor)), min(90, ((brightness(fillColor) < 40) ? 4 : 0.44) * brightness(fillColor)), alpha(fillColor)*0.555);
			stroke(newStrokeColor);
			strokeWeight(width/515 + randomGaussian(0, 0.5));
			var lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.789);
			fill(lowAlphaFillColor);
			beginShape();
			scqleSize = this.scaleSize;
			var initAngle = PI/2;
			if (random(0, 1.1) > this.scaleMissingRatio) {
				for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
					//curveVertex
					vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + sin(angle)*scqleSize*pxh);
				}
			} else {
				for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
					vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxh);
				}
			}
			endShape();
		}
  }
}

class GaussianScribblerRender extends Render {
  constructor(xRandomnessVol, yRandomnessVol) {
    super(xRandomnessVol, yRandomnessVol);
		this.addScales = true;
  }
  
  render(fillColor, strokeColor, x, y, pxw, pxh, extraDirectionalNoise) {
		var nbStrokes = int(random(3,8));
		var nbstep = 100/nbStrokes;
    noStroke();
		var lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.666);
    fill(lowAlphaFillColor);
    var scqleSize = 1.2;
    var shiftFactor = randomGaussian(666, 66) + extraDirectionalNoise;
		for (var i = 0; i < nbstep; i++) {
			beginShape();
			for (var  angle = 0 ; angle < 2*PI; angle = angle + 2*PI/nbStrokes) {
				let r = noise(x + y, x + cos(angle) + 1, y + sin(angle) + 1)*sqrt(pow(pxw/2*cos(angle), 2) + pow(pxh/2*sin(angle), 2));
				let xrDev = randomGaussian(0, width/161.8) + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height)));
				let xpos = x + xrDev + cos(angle)*r;
				let yrDev = randomGaussian(0, height/161.8) + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height)));
				let ypos = y + yrDev + sin(angle)*r;
				curveVertex(xpos, ypos);             
			}
			endShape();    
		}
		var newStrokeColor = color(hue(fillColor), (brightness(fillColor) < 40) ? (0.44*sqrt(saturation(fillColor))) : min(91, 1.234*saturation(fillColor)), min(90, ((brightness(fillColor) < 40) ? 4 : 0.44) * brightness(fillColor)), alpha(fillColor)*0.555);
		stroke(newStrokeColor);
		strokeWeight(width/500 + randomGaussian(0, 0.5));
		lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.789);
		fill(lowAlphaFillColor);
		beginShape();
		scqleSize = this.scaleSize;
		var initAngle = -PI/2;
		if (random(0, 1) > this.scaleMissingRatio) {
			for (var angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
				vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + sin(angle)*scqleSize*pxh);
			}
		} else {
			for (var angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
				vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxh);
			}
		}
		endShape();
  }
}

class GaussianSprinklerRender extends Render {
  constructor(xRandomnessVol, yRandomnessVol) {
    super(xRandomnessVol, yRandomnessVol);
		this.addScales = true;
  }
  
  render(fillColor, strokeColor, x, y, pxw, pxh, extraDirectionalNoise) {
    var nbstep = 99*pxw/13;
    noStroke();
		var lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.666);
    fill(lowAlphaFillColor);
    var shiftFactor = randomGaussian(666, 66) + extraDirectionalNoise;
    for (var i = 0 ; i < nbstep; i++) {
    	ellipse(x + randomGaussian(0, width/161.8) + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))), y + randomGaussian(0, height/161.8) + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))), sqrt(sqrt(pxw)) + randomGaussian(0, this.xRandomnessVol*pxw), sqrt(sqrt(pxh)) + randomGaussian(0, this.yRandomnessVol*pxh));
		}
		var newStrokeColor = color(hue(fillColor), (brightness(fillColor) < 40) ? (0.44*sqrt(saturation(fillColor))) : min(91, 1.234*saturation(fillColor)), min(90, ((brightness(fillColor) < 40) ? 4 : 0.44) * brightness(fillColor)), alpha(fillColor)*0.555);
		stroke(newStrokeColor);
		strokeWeight(width/500 + randomGaussian(0, 0.5));
		lowAlphaFillColor = color(hue(fillColor), saturation(fillColor), brightness(fillColor), alpha(fillColor)*0.789);
		fill(lowAlphaFillColor);
		beginShape();
		var scqleSize = this.scaleSize;
		var initAngle = -PI/2;
		if (random(0, 1) > this.scaleMissingRatio) {
			for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
				vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + sin(angle)*scqleSize*pxh);
			}
		} else {
			for (var  angle = initAngle ; angle < initAngle +2*PI; angle = angle + 2*PI/this.scaleNbVertices) {
				vertex(x + shiftFactor*this.xRandomnessVol*(noise(x*this.noiseSensi, y*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxw, y  + shiftFactor*this.yRandomnessVol*(noise(y*this.noiseSensi, x*this.noiseSensi) - max(noise(0, 0), noise(width, 0), noise(0, height), noise(width, height))) + cos(angle)*scqleSize*pxh);
			}
		}
		endShape();
  }
}