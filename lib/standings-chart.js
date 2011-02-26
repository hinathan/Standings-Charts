
var StandingsChart = {
	items:null,
	opts:null,
	xpoints:[],
	yscale:1,
	ctarget:null,
	init:function(items,opts) {
		this.xpoints = [];
		this.yscale=1;
		ctarget:null,

		this.items=items;
		this.opts=opts;
		var point_count = 0;
		this.ctarget = document.getElementById(this.opts.target);
		//console.log(this.opts.target);
		//console.log(this.ctarget);
		var peaks = [];
		var totals = [];
		var x = 0;
		var column = 0;
		var column_groups = [];
		for(i in this.items) {
			var points = this.items[i].points;
			point_count = points.length;
			var width = (this.ctarget.width - (this.opts.xgutter * (-1 + point_count))) / point_count;
			//console.log("width per = " +width + '  point count ' + point_count);

			for(j=0;j<points.length;j++) {
				peaks[j] = 0;
				totals[j] = 0;
				column_groups[j] = [];
				var left = Math.ceil(x);
				x += width;
				var right = Math.ceil(x);
				this.xpoints.push({left:left,right:right});
				x += this.opts.xgutter;
			}
			//console.log(this.xpoints);return;
			break;
		}
		for(i in this.items) {
			var points = this.items[i].points;
			var name = this.items[i].name;
			for(j=0;j<points.length;j++) {
				totals[j] += points[j];
				column_groups[j][i] = {value:points[j],name:name};
			}
		}
		//console.log(column_groups);
		var ranked_column_groups = [];
		for(column in column_groups) {
			ranked_column_groups[column] = column_groups[column].sort(function(a,b) {
				if(a.value < b.value) { return -1; }
				if(a.value == b.value) { return 0; }
				return 1;
			});
		}
		//console.log(ranked_column_groups);

		var item_column_min_max = [];

		for(i in this.items) {
			item_column_min_max[i] = [];
			var item = this.items[i];
			//console.log("look at " + item.name);
			for(column=0;column<ranked_column_groups.length;column++) {
				//console.log("look at column " + column);
				//console.log("ranked:");
				//console.log(ranked_column_groups[column]);
				var greater_than_me_in_this_column = 0;
				var found_myself = false;
				for(rank=0;rank<ranked_column_groups[column].length;rank++) {
					var this_guy = ranked_column_groups[column][rank];
					if(this_guy.name == item.name) {
						//console.log("for " + item.name + " in column " + column + " offset is " + greater_than_me_in_this_column + " and value is " + this_guy.value + " for rank " + rank);
						found_myself = true;
						item_column_min_max[i][column] = {min:greater_than_me_in_this_column,max:greater_than_me_in_this_column+this_guy.value,rank:rank};
					}
					if(!found_myself) {
						greater_than_me_in_this_column += this_guy.value;
						//console.log("this_guy " + this_guy.name + " is more than me " + item.name);
						//console.log("excess now " + greater_than_me_in_this_column);
					}
				}
			}
		}

		var max_column = this.arraymax(totals);
		this.yscale = (this.ctarget.height - ((-1 + this.items.length) * this.opts.ypadding)) / max_column;
		var ctx = this.ctarget.getContext('2d');

		for(i in this.items) {
			item = this.items[i];

			var columns_for_item = item_column_min_max[i];
			var xs = this.xpoints.slice(0);
			var miny = [];
			var maxy = [];

			ctx.beginPath();
			ctx.fillStyle = item.fillStyle;
			ctx.lineJoin = 'round';

			ctx.moveTo(xs[0].left,this.scaleYwithRankMin(columns_for_item[0]));
			var i;
			for(i=0;i<xs.length;i++) {
				ctx.lineTo(xs[i].left,this.scaleYwithRankMin(columns_for_item[i]));
				ctx.lineTo(xs[i].right,this.scaleYwithRankMin(columns_for_item[i]));
			}


			for(i=xs.length-1;i>=0;i--) {
				ctx.lineTo(xs[i].right,this.scaleYwithRankMax(columns_for_item[i]));
				ctx.lineTo(xs[i].left,this.scaleYwithRankMax(columns_for_item[i]));
			}
			ctx.lineTo(xs[0].left,this.scaleYwithRankMin(columns_for_item[0]));
			ctx.fill();

			ctx.fillStyle = 'black';
			ctx.fillText(item.name,xs[0].left+1,-3+this.scaleYwithRankMin(columns_for_item[0]));
			ctx.fillText(item.name,xs[xs.length-1].right-ctx.measureText(item.name).width,-3+this.scaleYwithRankMin(columns_for_item[xs.length-1]));

		}
	},
	scaleYwithRankMin:function(point) {
		return this.ctarget.height - (this.opts.ypadding * point.rank + this.yscale * point.min);
	},
	scaleYwithRankMax:function(point) {
		return this.ctarget.height - (this.opts.ypadding * point.rank + this.yscale * point.max);
	},
	arraymax:function(arr) {
		var max = arr[0];
		var len = arr.length;
		for (var i = 1; i < len; i++) if (arr[i] > max) max = arr[i];
		return max;
	}

};
