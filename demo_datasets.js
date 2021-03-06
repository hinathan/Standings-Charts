var colormap = {
	"Canada":"#6A89BB",
	"Japan":"#443B33",
	"Mexico":"#004A94",
	"UK":"#F0D252",
	"Germany":"#98A9CA",
	"South Korea":"#119D3F",
	"France":"#004A94",
	"Netherlands":"#2C67A7",
	"Taiwan":"#7DB877",
	"Brazil":"#7DB877",
	"China":"#D4022F",
	"Venezuela":"#DD7A76",
	"Nigeria":"#5D257C",
};


var colormap_alt = {
	"Burnished":"#6A89BB",
	"Dissonant":"#D4022F",
	"Goodyear":"#119D3F",
	"Hesitant":"#F0D252",
};
var colormap_food = {
	"Meats":"#1E4E49",
	"Fruits & Vegetables":"#2B6E68",
	"Grains & Baked Goods":"#79B7B3",
	"Dairy Products":"#A3811E",
	"Processed Foods & Sweets":"#EABB2A",
	"Beverages":"#F2DC88",
	"Other Foods":"#F8EFC0",
}

var demo_datasets = [
{
	title:"Exports (Commerce department via WSJ)",
	xgutter:'30%',
	ypadding:'3',
	useBezier:false,
	labels:{position:'out'},
	useColors:colormap,
	data:{
		"Canada":[31,65,91],
		"Mexico":[11,41,59.5],
		"Japan":[18,24,22],
		"UK":[9,15,18],
		"Germany":[7,11,18],
		"South Korea":[5,10.5,14],
		"Brazil":[2.5,6,13.5],
		"Netherlands":[5.25,8.25,13.25],
		"Singapore":[3.25,7.5,11],
		"France":[5.25,7.5,10],
		"Hong Kong":[2.25,5.5,10],
		"Taiwan":[4.25,9.25,9.25],
		"China":[2.25,6.25,33.75],
	}
},
{
	title:"Money Spent On Groceries (BLS via NPR / Lam Thuy Vo)",
	xgutter:'30%',
	ypadding:'3',
	useBezier:false,
	labels:{position:'in'},
	useColors:colormap_food,
	data:{
		"Meats":[31.3,21.5],
		"Fruits & Vegetables":[14.5,14.6],
		"Grains & Baked Goods":[13.2,14.4],
		"Dairy Products":[13.2,10.6],
		"Processed Foods & Sweets":[11.6,22.9],
		"Beverages":[11.0,11.1],
		"Other Foods":[5.3,5.1],
	},
},
{
	title:"Imports (Commerce department via WSJ)",
	xgutter:'30%',
	ypadding:'3',
	useBezier:false,
	useColors:colormap,
	data:{
		"Canada":[32.5,84,101],
		"Mexico":[11,48.25,83.5],
		"Japan":[33,53.5,43],
		"UK":[7,15.5,18.5],
		"Germany":[10.5,22,30.5],
		"South Korea":[7,14.5,18],
		"Brazil":[3.5,0.25,0.25],
		"France":[5,11,14],
		"Hong Kong":[3.25,0.25,0.25],
		"Taiwan":[8.25,14.5,13.25],
		"Venezuela":[3.75,6.25,12.5],
		"Nigeria":[2.25,3.5,11.5],
		"China":[6.25,37,133.5]
	}
},
{
	title:"Arbitrary ranking",
	xgutter:'25%',
	ypadding:'0%',
	rankOnly:true,
	height:100,
	useColors:colormap,
	data:{
		"Canada":[100000,20000,10000,20000],
		"Mexico":[20000,30000,40000,10000],
		"Japan":[30000,10000,40000,30000],
		"China":[40000,40000,30000,20000],
	}
},
{
	title:"Arbitrary ranking",
	xgutter:'25%',
	ypadding:'0%',
	height:100,
	rankOnly:true,
	useBezier:false,
	useColors:colormap,
	data:{
		"Canada":[100000,20000,10000,20000],
		"Mexico":[20000,30000,40000,10000],
		"Japan":[30000,10000,40000,30000],
		"China":[40000,40000,30000,20000]
	}
},
{
	title:"Graph 2",
	xgutter:'33%',
	ypadding:10,
	stackedArea:false,
	useBezier:true,
	debugPoints:false,
	useColors:colormap,
	data:{
		"Canada":[4,15,25,15,21],
		"Mexico":[4,51,24,25,32],
		"Japan":[10,25,40,33,43],
		"China":[3,6,12,24,48],
	}
},
{
	title:"An abstract mapping",
	xgutter:'25%',
	ypadding:'5%',
	useBezier:false,
	data:{
		"Abstract":[534,172,1,439,222],
		"Burnished":[17481,20574,21835,18992,12981],
		"Chortle":[58118,47260,57831,66583,51079],
		"Dissonant":[13002,16289,7747,7039,3252],
		"Elephant":[1056,3225,3665,2590,1373],
		"Fortunate":[1,1,1,1,2],
		"Goodyear":[12494,4594,28446,12597,41153],
		"Hesitant":[19710,32399,29923,21746,18192],
	},
},
{
	title:"Small map, straight lines",
	xgutter:'25%',
	ypadding:'5%',
	height:100,
	width:200,
	useBezier:false,
	useColors:colormap_alt,
	data:{
		"Dissonant":[13002,16289,7747,7039,3252],
		"Burnished":[17481,20574,21835,18992,12981],
		"Goodyear":[12494,4594,28446,12597,41153],
		"Hesitant":[19710,32399,29923,21746,18192],
	},
},
{
	title:"Small map, ranks, Bezier curves",
	xgutter:'25%',
	ypadding:'5%',
	height:100,
	width:200,
	useBezier:true,
	rankOnly:true,
	useColors:colormap_alt,
	data:{
		"Dissonant":[13002,16289,7747,7039,3252],
		"Burnished":[17481,20574,21835,18992,12981],
		"Goodyear":[12494,4594,28446,12597,41153],
		"Hesitant":[19710,32399,29923,21746,18192],
	},
}

];