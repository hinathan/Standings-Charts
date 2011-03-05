/*
 * StandingsChart
 *  - https://github.com/hinathan/Standings-Charts
 *
 * Version
 *  - 20110302
 *
 * About
 *  - A simple tool for drawing rank-bar-plots
 *
 * Author
 *  - Nathan Schmidt <nschmidt@gmail.com>
 *
 * License
 *  - MIT
 *
 */


var StandingsChart = {
	items:null,
	opts:null,
	xpoints:[],
	yscale:1,
	ctarget:null,
	item_count:0,
	init:function(inputs,canvas) {
		this.xpoints = [];
		this.yscale=1;
		var defaults = {
			useBezier:true,
			stackedArea:false,
			ypadding:0,
			xgutter:'25%',
			maxPoints:0,
			minHeight:2,
			minPitch:3,
			labels:{position:'out'},
			margins:{right:0,left:0,top:0,bottom:0},
			font:"10px sans-serif",
			rankOnly:false,
			data:[[0,1,2,3],[3,2,1,0],[2,3,1,2]],
			debugPoints:false,
			textShadows:false,
			};
		this.opts=inputs;
		for(i in defaults) {
			if(!this.opts.hasOwnProperty(i)) {
				this.opts[i] = defaults[i];
			}
		}
		var point_count = 0;
		this.ctarget = canvas;
		var column = 0;
		this.item_count = 0;


		if(this.opts.maxPoints) {
			this.opts.data = this.applyMaxPoints(this.opts.data);
		}

		var metrics = this.computeMetrics(this.opts.data);
		for(i in metrics) {
			if(metrics.hasOwnProperty(i)) {
				this[i] = metrics[i];
			}
		}

		var column_groups = this.computeColumnGroups(this.opts.data);

		var totals = this.computeColumnTotals(this.opts.data);

		var ranked_column_groups = this.rankColumnGroups(column_groups);

		if(this.opts.rankOnly) {
			totals = [];
			for(var i in ranked_column_groups) {
				if(!ranked_column_groups.hasOwnProperty(i)) { continue; }
				totals[i] = 0;
				for(var j in ranked_column_groups[i]) {
					totals[i] += ranked_column_groups[i][j].value;
				}
			}
		}

		var item_column_min_max = this.computeItemColumnMinMax(column_groups,ranked_column_groups);


		var max_column = this.arrayMax(totals);

		this.yscale = this.computeYScale(max_column);

		var ctx = this.ctarget.getContext('2d');
		ctx.clearRect(0,0,this.ctarget.width,this.ctarget.height);
		ctx.font = this.opts.font;
		ctx.textBaseline = "middle";

		var texts = [];
		var pointsDrawn = [];

		for(var i in item_column_min_max) {

			var name = i;

			var columns_for_item = item_column_min_max[i];
			var xs = this.xpoints.slice(0);
			var miny = [];
			var maxy = [];

			ctx.beginPath();
			ctx.fillStyle = this.colorForSet(i);
			ctx.lineJoin = 'round';

			pointsDrawn.push({x:xs[0].left,y:this.scaleYwithRankMin(columns_for_item[0])});
			ctx.moveTo(xs[0].left,this.scaleYwithRankMin(columns_for_item[0]));

			var i;
			var bX = this.getXGutter();

			for(i=0;i<xs.length;i++) {
				if(i && this.opts.useBezier) {
					var lastX = xs[i-1].right;
					var lastY = this.scaleYwithRankMin(columns_for_item[i-1]);
					var x = xs[i].left;
					var y = this.scaleYwithRankMin(columns_for_item[i]);
					var c1 = {x:lastX + bX,y:lastY + 0};
					var c2 = {x:x - bX,y:y + 0};
					ctx.bezierCurveTo(c1.x,c1.y,c2.x,c2.y,x,y);
					pointsDrawn.push(c1);
					pointsDrawn.push(c2);
					pointsDrawn.push({x:x,y:y});
				} else {
					ctx.lineTo(xs[i].left,this.scaleYwithRankMin(columns_for_item[i]));
					pointsDrawn.push({x:xs[i].left,y:this.scaleYwithRankMin(columns_for_item[i])});
				}
				ctx.lineTo(xs[i].right,this.scaleYwithRankMin(columns_for_item[i]));
				pointsDrawn.push({x:xs[i].right,y:this.scaleYwithRankMin(columns_for_item[i])});
			}


			for(i=xs.length-1;i>=0;i--) {

				if(i<(xs.length-1) && this.opts.useBezier) {
					var lastX = xs[i+1].left;
					var lastY = this.scaleYwithRankMax(columns_for_item[i+1]);
					var x = xs[i].right;
					var y = this.scaleYwithRankMax(columns_for_item[i]);
					var c1 = {x:lastX - bX,y:lastY};
					var c2 = {x:x + bX,y:y};
					ctx.bezierCurveTo(c1.x,c1.y,c2.x,c2.y,x,y);
					pointsDrawn.push(c1);
					pointsDrawn.push(c2);
					pointsDrawn.push({x:x,y:y});
				} else {
					ctx.lineTo(xs[i].right,this.scaleYwithRankMax(columns_for_item[i]));
					pointsDrawn.push({x:xs[i].right,y:this.scaleYwithRankMax(columns_for_item[i])});

				}

				ctx.lineTo(xs[i].left,this.scaleYwithRankMax(columns_for_item[i]));
				pointsDrawn.push({x:xs[i].left,y:this.scaleYwithRankMax(columns_for_item[i])});

			}
			ctx.lineTo(xs[0].left,this.scaleYwithRankMin(columns_for_item[0]));
			pointsDrawn.push({x:xs[0].left,y:this.scaleYwithRankMin(columns_for_item[0])});

			ctx.fill();

			var margin = 2;
			texts.push({
				color:'#000',//this.contrastColour(ctx.fillStyle),
				text:name,
				x:margin,
				y:-1 + (this.scaleYwithRankMin(columns_for_item[0]) + this.scaleYwithRankMax(columns_for_item[0]))/2
			});
			texts.push({
				color:'#000',//this.contrastColour(ctx.fillStyle),
				text:name,
				x:xs[xs.length-1].right - ctx.measureText(name).width - margin - this.opts.margins.right,
				y:-1 + (this.scaleYwithRankMin(columns_for_item[xs.length-1]) + this.scaleYwithRankMax(columns_for_item[xs.length-1]))/2
			});

		}

		this.drawTexts(ctx,texts);

		if(this.opts.debugPoints) {
			this.drawPoints(ctx,pointsDrawn);
		}

	},
	getXGutter:function() {
		var point_count = 0;
		for(var i in this.opts.data) {
			for(var j in this.opts.data[i]) {
				point_count++;
			}
			break;
		}
		var full = this.ctarget.width;
		var original_datum_width = full / point_count;
		var margins_needed = point_count - 1;
		var dim = this.opts.xgutter;
		var value = 0;
		if(dim.match(/%$/)) {
			var frac = parseFloat(dim.replace('%','')) / 100;
			// percent is a percent of datum width.
			var units = (point_count - 1) + frac * margins_needed;
			var unit = full / units;
			value = unit * frac;
			return value;
		} else {
			dim = dim.replace('px','');
			value = Math.max(parseFloat(dim),0);
			while((value * margins_needed) > this.ctarget.width) {
				value *= .9;
			}
		}
		return value;
	},
	getYPadding:function() {
		var padding = this.percentOrPxOf(this.opts.ypadding, this.ctarget.height);
		return padding;
	},
	percentOrPxOf:function(dim,full) {
		var dim = '' + dim;

		if(dim.match(/%$/)) {
			var frac = parseFloat(dim.replace('%','')) / 100;
			dim = full * frac;
		} else {
			dim = dim.replace('px','');
		}
		var value = Math.max(parseFloat(dim),0);
		return value;
	},
	colorForSet:function(dataset) {
		if(this.opts.useColors && this.opts.useColors[dataset]) {
			return this.opts.useColors[dataset];
		}
		return '#' + Math.round(0xffffff * Math.random()).toString(16);
	},
	scaleYwithRankMin:function(point) {
		var value = this.ctarget.height;
		// account for rank pads

		value -= this.getYPadding() * point.rank;
		// account for value
		value -= this.yscale * point.min;
		// margin
		value -= this.getYPadding() * .5;
		return value;
	},
	scaleYwithRankMax:function(point) {
		var value = this.ctarget.height;
		// account for rank pads
		value -= this.getYPadding() * point.rank;
		// account for value
		var correctedValue = this.yscale * point.max;

		if(correctedValue < this.opts.minHeight) {
			correctedValue = this.opts.minHeight;
		}
		value -= correctedValue;

		// margin
		value -= (this.getYPadding() * .5);

		return value;
	},
	arrayMax:function(arr) {
		var max = arr[0];
		var len = arr.length;
		for (i in arr) {
			if(arr.hasOwnProperty(i) && (arr[i] > max)) {
				max = arr[i];
			}
		}
		return max;
	},
	hex2rgb:function(hex, opacity) {
		if(hex.match(/^rgb/)) {
			return hex;
		}
		var rgb = hex.replace('#', '').match(/(.{2})/g);

		var i = 3;
		while (i--) {
			rgb[i] = parseInt(rgb[i], 16);
		}

		if (typeof opacity == 'undefined') {
			return 'rgb(' + rgb.join(', ') + ')';
		}

		return 'rgba(' + rgb.join(', ') + ', ' + opacity + ')';
	},
	applyMaxPoints:function(data) {
		for(i in data) {
			if(!data.hasOwnProperty(i)) { continue; }
			while(data[i].length > this.opts.maxPoints) {
				data[i].points.shift();
			}
		}
		return data;
	},
	computeMetrics:function(data) {
		var points = [];
		var xpoints = [];
		var point_count = 0;
		var item_count = 0;
		var width = 0;
		var availableWidth = this.ctarget.width;

		if(this.opts.labels.position=='out') {
			var mwidth = 0;
			var ctx = this.ctarget.getContext('2d');
			for(var i in this.opts.data) {
				if(this.opts.data.hasOwnProperty(i)) {
					var width = ctx.measureText(i).width;
					width += 2;
					mwidth = Math.max(mwidth,width);
				}
			}
			availableWidth -= 2 * mwidth;
			this.opts.margins.left += mwidth;
			this.opts.margins.right -= mwidth;
		}

		var x = this.opts.margins.left;

		for(i in data) {
			if(!data.hasOwnProperty(i)) { continue; }
			item_count++;
			if(item_count > 1) { continue; }

			points = data[i];
			point_count = points.length;
			width = (availableWidth - (this.getXGutter() * (-1 + point_count))) / point_count;
			for(j=0;j<point_count;j++) {
				var left = Math.ceil(x);
				x += width;
				var right = Math.ceil(x);
				xpoints.push({left:left,right:right});
				x += this.getXGutter();
			}
		}
		return {x:x,xpoints:xpoints,point_count:point_count,item_count:item_count};
	},
	computeColumnGroups:function(data) {
		var groups = [];
		var column_number = 0;
		for(var i in data) {
			if(!data.hasOwnProperty(i)) { continue; }
			var points = data[i];
			for(var j=0;j<points.length;j++) {
				var value = points[j];
				if(!groups[j]) {
					groups[j] = [];
				}

				groups[j][column_number] = {value:value,name:i};
			}
			column_number++;
		}
		return groups;
	},
	computeColumnTotals:function(data) {
		var totals = [];
		for(var name in data) {
			if(!data.hasOwnProperty(name)) { continue; }
			var points = data[name];
			for(j=0;j<points.length;j++) {
				var value = points[j];
				if(!totals[j]) {
					totals[j] = 0;
				}
				totals[j] += value;
			}
		}
		return totals;
	},
	rankColumnGroups:function(column_groups) {

		var ranked_groups = [];

		for(column in column_groups) {
			if(!column_groups.hasOwnProperty(column)) { continue; }

			if(this.opts.stackedArea) {
				ranked_groups[column] = column_groups[column];
			} else {
				ranked_groups[column] = column_groups[column].sort(function(a,b) {
					if(a.value < b.value) { return -1; }
					if(a.value == b.value) { return 0; }
					return 1;
				});

				if(this.opts.rankOnly) {
					var seq = 0;
					var rank_only_scale_up = 100000;
					for(i in ranked_groups[column]) {
						if(!ranked_groups[column].hasOwnProperty(i)) { continue; }
						ranked_groups[column][i].value = rank_only_scale_up + seq;
						seq++;
					}
				}
			}
		}
		return ranked_groups;
	},
	computeItemColumnMinMax:function(groups,ranked_groups) {

		var item_column_min_max = {};

		for(var column_number=0;column_number<groups.length;column_number++) {
			var column = groups[column_number];
			var greater_than_me_in_this_column = 0;
			for(var rank=0;rank<ranked_groups[column_number].length;rank++) {
				var this_item = ranked_groups[column_number][rank];
				var name = this_item.name;
				if(!item_column_min_max[name]) {
					item_column_min_max[name] = [];
				}
				item_column_min_max[name][column_number] = {
					min:greater_than_me_in_this_column,
					max:greater_than_me_in_this_column+this_item.value,
					name:this_item.name,
					value:this_item.value,
					rank:rank,
				};
				greater_than_me_in_this_column += this_item.value;
			}
		}
		return item_column_min_max;
	},
	computeYScale:function(max_column_total) {
		// todo - min pitch would be nice.
		var pads = this.item_count;
		var used_by_pads = this.getYPadding() * pads;
		var remaining_after_pads = this.ctarget.height - used_by_pads;
		return remaining_after_pads / max_column_total;
	},
	drawTexts:function(context,textRecords) {
		for(var i in textRecords) {
			var txt = textRecords[i];
			if(this.opts.textShadows) {
				txt.color = '#fff';
				context.save();
				context.fillStyle = this.contrastColour(txt.color);
				context.fillStyle = '#000';
				var xextent = 2.0;
				var yextent = 2.0;
				var increment = .5;
				for(var x=-xextent;x<=xextent;x+=increment) {
					for(var y=-yextent;y<=yextent;y+=increment) {
						context.fillText(txt.text,txt.x+x,txt.y+y);
					}
				}
				context.restore();
			}

			context.fillStyle = txt.color;
			context.fillText(txt.text,txt.x,txt.y);
		}
	},
	drawPoints:function(context,points) {
		context.fillStyle = "red";
		for(var i in points) {
			var pt = points[i];
			context.fillRect(pt.x-1,pt.y-1,2,2);
		}
	},
	contrastColour:function(rgbstring) {
		rgbstring = this.hex2rgb(rgbstring);
		var commadelim = rgbstring.substring(4,rgbstring.length-1);
		var strings = commadelim.split(",");
		var triplet = [];
		for(var i=0; i<3; i++) { triplet[i] = parseInt(strings[i]); }
		var newtriplet = [];
		// black or white:
		var total = 0; for (var i=0; i<triplet.length; i++) { total += triplet[i]; }
		if(total > (3*256/2)) {
			newtriplet = [0,0,0];
		} else {
			newtriplet = [255,255,255];
		}
		var newstring = "rgb("+newtriplet.join(",")+")";
		return newstring;
	}


};
