/*
 * StandingsChart
 *  - https://github.com/hinathan/Standings-Charts
 *
 * Version
 *  - 20110228
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
	init:function(items,opts) {
		this.xpoints = [];
		this.yscale=1;
		var defaults = {
			useBezier:true,
			stackedArea:false,
			ypadding:0,
			xgutter:'25%',
			maxPoints:0,
			minHeight:1,
			minPitch:3,
			font:"10px sans-serif",
			rankOnly:false,
			debugPoints:false
			};
		this.items=items;
		this.opts=opts;
		for(i in defaults) {
			if(!this.opts.hasOwnProperty(i)) {
				this.opts[i] = defaults[i];
			}
		}
		var point_count = 0;
		this.ctarget = document.getElementById(this.opts.target);
		var peaks = [];
		var totals = [];
		var x = 0;
		var column = 0;
		var column_groups = [];
		this.item_count = 0;

		if(this.opts.maxPoints) {
			for(i in this.items) {
				if(!this.items.hasOwnProperty(i)) { continue; }
				while(this.items[i].points.length > this.opts.maxPoints) {
					this.items[i].points.shift();
				}
			}
		}

		for(i in this.items) {
			if(!this.items.hasOwnProperty(i)) { continue; }

			var points = this.items[i].points;
			point_count = points.length;
			var width = (this.ctarget.width - (this.getXGutter() * (-1 + point_count))) / point_count;

			for(j=0;j<points.length;j++) {
				peaks[j] = 0;
				totals[j] = 0;
				column_groups[j] = [];
				var left = Math.ceil(x);
				x += width;
				var right = Math.ceil(x);
				this.xpoints.push({left:left,right:right});
				x += this.getXGutter();
			}
			break;
		}
		for(i in this.items) {
			if(!this.items.hasOwnProperty(i)) { continue; }
			this.item_count++;
			var points = this.items[i].points;
			var name = this.items[i].name;
			for(j in points) {
				if(!points.hasOwnProperty(j)) {continue;}
				var value = points[j];
				totals[j] += value;
				column_groups[j][i] = {value:value,name:name};
			}
		}

		var ranked_column_groups = [];
		var rank_only_scale_up = 1000;
		for(column in column_groups) {
			if(!column_groups.hasOwnProperty(column)) { continue; }

			if(this.opts.stackedArea) {
				ranked_column_groups[column] = column_groups[column];
			} else {
				ranked_column_groups[column] = column_groups[column].sort(function(a,b) {
					if(a.value < b.value) { return -1; }
					if(a.value == b.value) { return 0; }
					return 1;
				});

				if(this.opts.rankOnly) {
					totals[column] = 0;

					var seq = 0;

					for(i in ranked_column_groups[column]) {
						if(!ranked_column_groups[column].hasOwnProperty(i)) { continue; }
						ranked_column_groups[column][i].value = rank_only_scale_up + seq;
						totals[column] += ranked_column_groups[column][i].value;
						seq++;
					}
				}
			}
		}

		var max_column = this.arrayMax(totals);

		var item_column_min_max = [];

		for(i in this.items) {
			if(!this.items.hasOwnProperty(i)) { continue; }
			item_column_min_max[i] = [];
			var item = this.items[i];
			for(column=0;column<ranked_column_groups.length;column++) {
				var greater_than_me_in_this_column = 0;
				var found_myself = false;
				for(rank=0;rank<ranked_column_groups[column].length;rank++) {
					var this_guy = ranked_column_groups[column][rank];
					if(this_guy.name == item.name) {
						found_myself = true;

						item_column_min_max[i][column] = {
							min:greater_than_me_in_this_column,
							max:greater_than_me_in_this_column+this_guy.value,
							rank:rank
						};
					}
					if(!found_myself) {
						greater_than_me_in_this_column += this_guy.value;
					}
				}
			}
		}

		// todo - min pitch would be nice.
		var pads = this.item_count;
		var items = items;
		var used_by_pads = this.getYPadding() * pads;
		var remaining_after_pads = this.ctarget.height - used_by_pads;
		this.yscale = remaining_after_pads / max_column;
		var ctx = this.ctarget.getContext('2d');
		ctx.clearRect(0,0,this.ctarget.width,this.ctarget.height);
		ctx.font = this.opts.font;
		ctx.textBaseline = "middle";

		var texts = [];
		var pointsDrawn = [];

		for(i in this.items) {
			if(!this.items.hasOwnProperty(i)) { continue; }
			item = this.items[i];

			var columns_for_item = item_column_min_max[i];
			var xs = this.xpoints.slice(0);
			var miny = [];
			var maxy = [];

			ctx.beginPath();
			ctx.fillStyle = item.fillStyle;
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
				color:this.contrastColour(ctx.fillStyle),
				text:item.name,
				x:xs[0].left+margin,
				y:-1 + (this.scaleYwithRankMin(columns_for_item[0]) + this.scaleYwithRankMax(columns_for_item[0]))/2
			});
			texts.push({
				color:this.contrastColour(ctx.fillStyle),
				text:item.name,
				x:xs[xs.length-1].right - ctx.measureText(item.name).width - margin,
				y:-1 + (this.scaleYwithRankMin(columns_for_item[xs.length-1]) + this.scaleYwithRankMax(columns_for_item[xs.length-1]))/2
			});

		}

		//ctx.fillStyle = '#ccc';
		for(i in texts) {
			ctx.fillStyle = texts[i].color;
			ctx.fillText(texts[i].text,texts[i].x,texts[i].y);
		}

		if(this.opts.debugPoints) {
			ctx.fillStyle = "red";
			for(i in pointsDrawn) {
				var pt = pointsDrawn[i];
				ctx.fillRect(pt.x-1,pt.y-1,2,2);
			}
		}
	},
	getXGutter:function() {
		var point_count = this.items[0].points.length;
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
