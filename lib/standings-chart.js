
var StandingsChart = {
	items:null,
	opts:null,
	xpoints:[],
	yscale:1,
	ctarget:null,
	init:function(items,opts) {
		this.xpoints = [];
		this.yscale=1;
		var defaults = {
			useBezier:true,
			stackedArea:false,
			ypadding:0,
			xgutter:'10%',
			maxPoints:0,
			minHeight:1,
			font:"bold 12px sans-serif",
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

		if(this.opts.maxPoints) {
			for(i in this.items) {
				while(this.items[i].points.length > this.opts.maxPoints) {
					this.items[i].points.shift();
				}
			}
		}

		for(i in this.items) {
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
			//console.log(this.xpoints);return;
			break;
		}
		for(i in this.items) {
			var points = this.items[i].points;
			var name = this.items[i].name;
			for(j=0;j<points.length;j++) {
				var value = points[j];
				totals[j] += value;
				column_groups[j][i] = {value:value,name:name};
			}
		}

		//console.log(column_groups);
		var ranked_column_groups = [];
		var rank_only_scale_up = this.arraymax(totals) * 1000;
		for(column in column_groups) {
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
						ranked_column_groups[column][i].value = rank_only_scale_up + seq;
						totals[column] += ranked_column_groups[column][i].value;
						seq++;
					}
					//console.log(column);
					//console.log(ranked_column_groups);
				}
			}
		}
		//console.log(totals);
		//console.log(ranked_column_groups);
		var max_column = this.arraymax(totals);

		var item_column_min_max = [];

		for(i in this.items) {
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

		this.yscale = (this.ctarget.height - ((-1 + this.items.length) * this.getYPadding())) / max_column;
		var ctx = this.ctarget.getContext('2d');
		ctx.clearRect(0,0,this.ctarget.width,this.ctarget.height);
		ctx.font = this.opts.font;
		ctx.textBaseline = "middle";

		var texts = [];
		var pointsDrawn = [];

		for(i in this.items) {
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
			var bX = this.getXGutter()/1.3;
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
				text:item.name,
				x:xs[0].left+margin,
				y:(this.scaleYwithRankMin(columns_for_item[0]) + this.scaleYwithRankMax(columns_for_item[0]))/2
			});
			texts.push({
				text:item.name,
				x:xs[xs.length-1].right - ctx.measureText(item.name).width - margin,
				y:(this.scaleYwithRankMin(columns_for_item[xs.length-1]) + this.scaleYwithRankMax(columns_for_item[xs.length-1]))/2
			});

			//ctx.fillText(item.name,xs[0].left+margin,(this.scaleYwithRankMin(columns_for_item[0]) + this.scaleYwithRankMax(columns_for_item[0]))/2);
			//ctx.fillText(item.name,xs[xs.length-1].right-ctx.measureText(item.name).width - margin,(this.scaleYwithRankMin(columns_for_item[xs.length-1])+this.scaleYwithRankMax(columns_for_item[xs.length-1]))/2);

		}

		ctx.fillStyle = '#ccc';
		for(i in texts) {
			ctx.fillText(texts[i].text,texts[i].x,texts[i].y);
		}

		if(this.opts.debugPoints) {
			for(i in pointsDrawn) {
				var pt = pointsDrawn[i];
				ctx.fillStyle = "red";
				ctx.beginPath();
				ctx.moveTo(pt.x+2,pt.y+2);
				ctx.lineTo(pt.x-2,pt.y-2);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(pt.x-2,pt.y+2);
				ctx.lineTo(pt.x+2,pt.y-2);
				ctx.stroke();
			}
		}
	},
	getXGutter:function() {
		var value = this.percentOrPxOf(this.opts.xgutter, this.ctarget.width);
		var point_count = this.items[0].points.length;
		while((value * (0+2*point_count)) > this.ctarget.width) {
			value *= .8;
		}
		return value;
	},
	getYPadding:function() {
		return this.percentOrPxOf(this.opts.ypadding, this.ctarget.height);
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
		return this.ctarget.height - (this.getYPadding() * point.rank + this.yscale * point.min);
	},
	scaleYwithRankMax:function(point) {
		return this.ctarget.height - (this.getYPadding() * point.rank + this.yscale * point.max);
	},
	arraymax:function(arr) {
		var max = arr[0];
		var len = arr.length;
		for (var i = 1; i < len; i++) if (arr[i] > max) max = arr[i];
		return max;
	}

};
