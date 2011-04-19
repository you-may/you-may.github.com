
/************************** 页面整体效果 **************************/
var pageTitle = ".pageTitle";

$(function(){ // 页面整体效果
	var $window = $(".window");//可视窗口
	var $flashBg = $(".bgFlash");//flash背景
	var $mainBody = $(".mainContainer");//主体部分
	var $container = $(".container");//滚动容器
	var $moveContainer = $(".moveContainer");//移动层
	var $top = $(".top"); //头部
	var $floor = $(".floor"); //底部
	var $prev = $(".prev"); //上一页按钮
	var $next = $(".next"); //下一页按钮
	var $topMenus = $(".nav").find("a");//头部按钮
	var $scrollbar = $(".mainSlider");
	
	$prev.hide();
	$next.hide();
	
	var buildPages = $topMenus.each(function(index){
		var hf = $(this).attr("href");
		var name = hf.substring(hf.indexOf("#")+1,hf.length);
		
		var p = $('<div class="page"><div class="pageContainer"></div></div>');
		p.find(".pageContainer").addClass(name);
		$moveContainer.append(p);
		
		$(this).data("pageInfo",{num:index,name:name,state:true});
		$(this).data("navCss",{name:$(this).attr("class")});
		p.data("pageInfo",{num:index,name:name,state:true});
		
	});
	
	
	var $pages = $moveContainer.find(".page");
	var $autoLoadPage = $pages.eq(0);
	
	
	var navigatorName = "Microsoft Internet Explorer";  
	var isIE = false;  
		if( navigator.appName == navigatorName ){  
		isIE = true;      
	} 
	
	var minW = 1024; //可视窗口最小宽度
	var minH = 623; //可视窗口最小高度
	var autoLoadTime = 2000;
	var firstLoad = 0;
	var duration = 1000;
	var pageNum = $container.find(".page").size(); //滚动页数 
	var pageH = $(".page").outerHeight();//滚动页面高度
	var pageW = $(".page").outerWidth();
	var currentPage = 0; //当前页
	var w=$(window).width(), h=$(window).height();
	var containerH = h-$top.height()-$floor.height();
	var isSide = false;
	var locationHref;
	var isPassCtrl = false;
	var isSideTimer = null;
	
	init();
	
	//监听url hash值修改
	$.router(function(hash) {
		if("" == hash || null == hash){
			hash = $topMenus.eq(0).data("pageInfo").name;
		}
		
		locationHref = hash;
		loadSubPage(hash);
		$(".navigation").data("page",{index:currentPage});
		navigation();
	});
	
	var autoLoadSubPage = setInterval(function(){
		autoLoadPage();
	},autoLoadTime);
	
	//可视窗口大小
	$(window).load(function(){windowSize();});
	$(window).resize(function(){windowSize();});
	
	$(window).scroll(function(){
		//$next.animate({left:$(window).width()-$next.width()+$(window).scrollLeft()},{queue:false},10);	
		//$prev.animate({left:$(window).scrollLeft()},{queue:false},10);	
	});
	
	// 拖动条
	$scrollbar.slider({
		range: "min",
		value: 1,
		min: 1,
		max: pageW * pageNum - $(window).width(),
		slide: function( event, ui ) {
			$moveContainer.css({left:-ui.value});
			
			var flashMoveSize = $flashBg.width() / (pageW * (pageNum*2+8.5)) * ui.value;
			
			$flashBg.css({left:-flashMoveSize});
			
			currentPage = Math.round(ui.value / pageW);
			
			menuCss();
			
			var hashName = $topMenus.eq(currentPage).data("pageInfo").name;
			
			if(locationHref != hashName){
				window.location.href = "#" + hashName;
			}
			
		},
		start: function(event,ui) {
			isSide = true;
			if(isSideTimer != null){
				clearTimeout(isSideTimer);
				isSide = true;
			}
		},
		stop: function(event,ui) {
		
			isSideTimer = setTimeout(function(){
				isSide = false;
			},1000);
			
		},
		change: function(event,ui){
			if(isPassCtrl){
				$moveContainer.css({left:-ui.value});
				
				var flashMoveSize = $flashBg.width() / (pageW * (pageNum*2+8.5)) * ui.value;
				
				$flashBg.css({left:-flashMoveSize});
				
				currentPage = Math.round(ui.value / pageW);
				
				menuCss();
				
				var hashName = $topMenus.eq(currentPage).data("pageInfo").name;
				
				if(locationHref != hashName){
					window.location.href = "#" + hashName;
				}
			}
		}
	});
	
	$prev.click(function(){
		currentPage -= 1;
		
		if(currentPage < 0){currentPage = 0;}
		else{changeHref()}
		
		isSide = false;
		
	});
	
	$next.click(function(){
		currentPage += 1;
		
		if(currentPage >= pageNum){currentPage = pageNum-1;}
		else{changeHref()}
		
		isSide = false;
		
	});
	
	$topMenus.click(function(){
		isSide = false;
	}).hover(function(){
		$(this).removeClass().addClass($(this).data("navCss").name + "-hover");
	},function(){
		menuCss();
	});
	
	function autoLoadPage(){
		if(!$autoLoadPage.size() > 0){
			clearTimeout(autoLoadSubPage);
			return;
		}
		
		if(!$autoLoadPage.data("pageInfo").state){
			$autoLoadPage = $autoLoadPage.next("div");
			autoLoadPage();
			
		}else{
			var url = $autoLoadPage.data("pageInfo").name;
			loadByParameter($autoLoadPage,url,false);
			$autoLoadPage = $autoLoadPage.next("div");
		}
	}
	
	function loadSubPage(hash){
		var p = $("." + hash).parent();
		var prevP = p.prev();
		var nextP = p.next("div");
		
		loadByParameter(p,hash,true);
		
		if(prevP.size() > 0){
			var url = prevP.data("pageInfo").name;
			loadByParameter(prevP,url,false);
		}
		
		if(nextP.size() > 0){
			var url = nextP.data("pageInfo").name;
			loadByParameter(nextP,url,false);
		}
		
	}
	
	function loadByParameter(subPageObj,url,crtPage){
		if(subPageObj.data("pageInfo").state){
			var subPageUrl = "subPages/"+ url +".html"
			
			$.ajax({
				url: subPageUrl,
				type:'get',
				dataType:'html',
				success:function(text){
					
					$("." + url).html(text);
					
					subPageObj.data("pageInfo",{state:false});
					
					if(crtPage){
						hashMovePage(url);
					}
				}
			});
			
		}else{
			if(crtPage){
				hashMovePage(url);
			}
		}
	}
	
	function hashMovePage(hash){
		
		$topMenus.each(function(){
			var target = $(this).data("pageInfo").name;
			
			if(target == hash){
				$(this).blur(); 
				currentPage = $(this).data("pageInfo").num;
				$(".navigation").data("page",{index:currentPage});
				movePage();
			}
			
		});
		
	}
	
	function changeHref(){
		document.location.href = $topMenus.eq(currentPage).attr("href");
	}
	
	function windowSize(){
		w = $(window).width(); 
		h = $(window).height();
		//var moveMargin = 0;
		//alert($scrollbar.slider("option","max"));
		
		if(w < minW){w = minW;}
		if(h < minH){h = minH;}
		$scrollbar.css({width:w-150});
		containerH = h-$top.height()-$floor.height();
		//if((containerH-pageH) > 0){moveMargin = (containerH-pageH)/2;}
		$window.css({width:w,height:$top.height()+$container.height()+$floor.height()+$scrollbar.height()});
		$container.css({width:pageNum*pageW*3});
		//$moveContainer.css({height:containerH});
		//$moveContainer.css({marginTop:moveMargin});
		$sideBg.css({width:w+10});
		$top.width(w);
		$floor.width(w);
		//$prev.animate({left:$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2},{queue:false},10);
		//$next.animate({left:$(window).width()-$next.width()+$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2},{queue:false},10);
		
		if(($flashBg.width() + $flashBg.offset().left) < w){
			$flashBg.css({left:-($flashBg.width()-w)});
		}
		
		//movePage();
		//$("#bgFlash").height(h);
	}
	
	//$prev.css({left:$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2});
	//$next.css({left:$(window).width()-$next.width()+$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2});
	
	function movePage(){
		menuCss();
		
		if(!isSide){
			$moveContainer.stop();
			$flashBg.stop();
			w = $(window).width(); 
			if(w < minW){w = minW;}
			
			if(isIE && firstLoad < 2){
				duration = 0;
			}else if(!isIE && firstLoad < 1){
				duration = 0;
			}else{
				duration =1000;
			}
			firstLoad = firstLoad > 2 ? 2 : firstLoad += 1;
		
			var flashBgMoveSize = ($flashBg.width()-w)/pageNum;
			
			if(currentPage == pageNum-1){
				$moveContainer.animate({left:-(pageW*pageNum-w)},{
				duration: duration,
				step: function(){
					changeSideValue();
				},
				complete:function(){
					changeSideValue();
				}});
				
			}else{
				$moveContainer.animate({left:-currentPage*pageW},{
				duration: duration,
				step: function(){
					changeSideValue();
				},
				complete:function(){
					changeSideValue();
				}});
			}
			
			$flashBg.animate({left:-flashBgMoveSize*currentPage},duration);
			
		}
	}
	
	function changeSideValue(){
		var lt = Math.abs($moveContainer.offset().left);
		$scrollbar.slider({value: lt});	
	}
	
	function menuCss(){
		//if(currentPage < 1){
		//	$prev.attr({"class":"prev prev-out"});
		//	$next.attr({"class":"next next-hover"});
			
		//}else if(currentPage == pageNum-1){
		//	$next.attr({"class":"next next-out"});
		//	$prev.attr({"class":"prev prev-hover"});
			
		//}else{
		//	$prev.attr({"class":"prev prev-hover"});
		//	$next.attr({"class":"next next-hover"});
		//}
		
		var $m = $topMenus.eq(currentPage);
		$m.removeClass().addClass($m.data("navCss").name + "-hover").siblings().each(function(){
			$(this).removeClass().addClass($(this).data("navCss").name);
		});
	}
	
	function navigation(){
		var $navs = $pages.eq(currentPage).find(pageTitle);
		var $navigation = $(".navigation");
		var str = "";
		
		$navs.each(function(i){
			if(i == 0){
				str += "> <b>"+ $(this).html() +"</b> ";
			}else{
				str += "> "+ $(this).html();
			}
		});
		
		$navigation.html(str);
	}
	
	var $sideBg = $("<div></div>").css({
		width:w+10,
		height:14,
		background:"#70ADCA",
		position:"absolute",
		top:0,
		marginLeft:-10
	});
	
	$scrollbar.append($sideBg).css({
		height:14,
		marginLeft:7
	}).find("a").css({
		width:50,
		height:12,
		background:"url(images/side_bg.gif) no-repeat",
		border:"0px",
		top:1,
		padding:"0px 50px"
	}).click(function(){
		$(this).blur();
	}).mouseout(function(){
		$(this).blur();
	});
	
	function init(){
		var dialogObj = $("[actionType='dialog']");
		var dialogNoModelObj = $("[actionType='dialogNoModel']");
		var dialogAutoObj = $("[actionType='dialogAuto']");
		
		dialogObj.die("click");
		dialogObj.live("click",function(){
			$(this).modalWindow();
		});
		
		dialogNoModelObj.die("click");
		dialogNoModelObj.live("click",function(){
			$(this).modalWindow({useModel:false});
		});
		
		dialogAutoObj.die("click");
		dialogAutoObj.live("click",function(){
			$(this).modalWindow({useModel:false,contextW:800,contextH:300});
		});
		
	}
	
	// background flash
	var params = { wmode:'transparent',flashvars: "",quality:'Low',scale:'NoBorder' };
	var attributes = { id:'bgFlash', name:'bgFlash' };
	swfobject.embedSWF('images/flash_bg.swf','flashBackground','100%',600,'9.0.115','',false, params, attributes);
	
	var $dragCover = $("<div class='dragCover'></div>").css({
			position:"absolute",
			width:"100%",
			height:"100%",
			cursor:"move",
			opacity:0,
			top:0,
			zIndex:10001,
			background:"red",
			display:"none"
			});
	$("body").append($dragCover);
	
	var isRepeatPassCtrl = false;
	$(document).keydown(function(event){
		
		if(event.keyCode == 37 || event.keyCode == 38 ){
			$prev.click();
			
		}else if(event.keyCode == 39 || event.keyCode == 40 ){
			$next.click();
			
		}if(event.keyCode == 17){
			isPassCtrl = true;
			isSide = true;
			if(isRepeatPassCtrl == false){
				var ml = $moveContainer.offset().left;
				var x,sliderValue;
				$dragCover.css({display:"block"});
				
				$dragCover.bind("mousedown",function(e){
					x = e.clientX;
					sliderValue = $scrollbar.slider("value");
					
					$dragCover.bind("mousemove",function(e){
						$scrollbar.slider({value: sliderValue +(x - e.clientX)});
					});
					
				}).bind("mouseup",function(){
					$dragCover.unbind("mousemove");
					
					if($.browser.mozilla){
						$(document).keyup();
					}
					
				}).bind("mouseout",function(){
					$dragCover.mouseup();
				});
			}
			
			isRepeatPassCtrl = true;
		}
	}).keyup(function(){
		$dragCover.unbind("mousemove");
		$dragCover.unbind("mouseup");
		$dragCover.unbind("mousedown");
		isRepeatPassCtrl = false;
		isPassCtrl = false;
		$dragCover.hide();
	});
	
	
	
});

/************************** subPage --ajax --title **************************/

$.fn.subPage = function(options) { //subPage --ajax --title
	var opts = $.extend({}, $.fn.subPage.defaults, options);

	var $subPage = $(this); 
	var $subNav = $subPage.find(".subNav").css({position:"relative"});
	var $slideDir = $subPage.find(".slideDir div");
	var $subContainer = $subPage.find(".subContainer").css({position:"relative"});
	var $cornerd = $subPage.find(".cornerd");
	
	$subPage.find(".cor").corner("5px").css({background:"white"});
	$cornerd.css({background:"#C0DBE8",padding:"1px 2px 2px 1px"}).corner("cc:#ffffff 6px");
	var $face = $("<div></div>").css({position:"absolute",top:0,left:0,background:"white"});
	
	var index = 0;
	var pageSize = $subNav.find("li").size();
	var aW = ($subNav.width())/pageSize;
	var path = $subNav.find("li:first").attr("action");
	var loading = true;
	var currentPage = -1;
	var faceStop = null;
	
	var $btns = $subNav.find("li");
	
	$subPage.find("ul").css({position:"absolute",top:0,zIndex:100});
	
	$btns.each(function(i){
		$(this).data("data",{index:i});
		$(this).data("pageInfo",{num: i});
		
	}).hover(function(){
			
	});
	
	$btns.css({width:aW});
	
	$btns.click(function(){
		$(this).find("em:first").removeClass().addClass("emFirst-hover");
		$(this).find("em:last").removeClass().addClass("emLast-hover");
		$(this).siblings().find("em:first").removeClass().addClass("emFirst");
		$(this).siblings().find("em:last").removeClass().addClass("emLast");
		
		index = $(this).data("pageInfo").num;
		path = $(this).attr("action");
		
		if(faceStop != null){
			clearTimeout(faceStop);
		}
		
		if(currentPage != index){
			slideDirMove($(this).position().left + $(this).width()/2 - 5);
		}
		
	}).eq(0).click();
	
	function loadSubContainer(path){
		$.ajax({
			url:path,
			type:'POST',
			dataType:'text',
			success:function(text){
			
				currentPage = index;
				$subContainer.html(text).append($face);
				
				$face.stop().css({opacity:0});
				$face.show().css({width:$subContainer.width(),height:$subContainer.height(),opacity:1,background:"white"});
				
				$face.animate({opacity:0},1000,function(){
						$(this).hide();
					});
					
				navigation();
			}
		});
	}
	
	function slideDirMove(size){
	
		$slideDir.animate({left:size},500,function(){
		});
		
		if(path != ""){
			
			faceStop = setTimeout(function(){
			
					$face.css({background:"white url(images/loading.gif) center no-repeat"});
					
			},1000);
			
			loadSubContainer(path);
		}
	}
	
	function navigation(){
		var $navigation = $(".navigation");
		var $pages = $(".moveContainer").find(".page");
		var currentPage = $navigation.data("page").index;
		var $navs = $pages.eq(currentPage).find(pageTitle);
		var str = "";
		
		$navs.each(function(i){
			if(i == 0){
				str += "> <b>"+ $(this).html() +"</b> ";
			}else{
				str += "> "+ $(this).html();
			}
		});
		
		$navigation.html(str);
	}
	
};
$.fn.subPage.defaults = {
	moveSize: 190,
	moveClass:"subNav-hover",
	hoverClass:"subNav-hover",
	direction:"lateral" //vertical纵向 lateral横向
};
$.fn.subPage.setDefaults = function(settings) {
    $.extend($.fn.subPage.defaults, settings);
};

/************************** imgFace **************************/

$.fn.imgFace = function(options) { //imgFace
	var opts = $.extend({}, $.fn.imgFace.defaults, options);
	
	var $imgCtn = $(this);
	var $img = $(this).find("img");
	var $imgFace = $("<span></span>").addClass("imgFace").css({top:opts.faceTop,left:opts.faceLeft});
	var $imgHot = $("<span></span>").addClass("imgHot").css({top:opts.hotTop,left:opts.hotLeft});
	
	$imgCtn.append($imgFace).css({position:"relative"});
	
	if($imgCtn.hasClass("hot")){
		$imgCtn.append($imgHot);
	}
	
	$imgCtn.hover(function(){
		$imgFace.hide();
	},function(){
		$imgFace.show();
	});
	
};
$.fn.imgFace.defaults = {
	hotTop:0,
	hotLeft:0,
	faceTop:0,
	faceLeft:0
};
$.fn.imgFace.setDefaults = function(settings) {
    $.extend($.fn.imgFace.defaults, settings);
};



/************************** roll **************************/

$.fn.roll = function(options) {
	options = $.extend({}, $.fn.roll.defaults, options);

	var $window = $(this);
	var items = $window.children("div");
	items.wrapAll('<div>');
	var container = $window.children();
	var pagers = items.size(); 
	var index = 0;
	var dir = options.direction;
	var listItems;
	var $prev,$next;
	
	if(options.prevID != 'no' && options.nextID != 'no'){
		$prev = $window.prev().find("a:first");
		$next = $window.prev().find("a:last");
	}
	
	if(options.listID != 'no'){
		listItems = $(options.listID);
		listItems.css({cursor:'pointer'}).find(options.listTab).css({cursor:'pointer'});
	}
	
	$window.css({'position':'relative','overflow':'hidden'});
	
	if(dir == 'left'){
		container.css({'position':'absolute','width':pagers*options.scrollAmount});
		items.css({'float':'left'});
	}else
		container.css({'position':'absolute','height':pagers*options.scrollAmount});
	
	var b;
	
	if(options.prevID != 'no'){
		$prev.hover(function(){clearInterval(intervalTime);},
									function(){setIntervalAgain();})
		
		$prev.click(function(){
			$(this).blur();
			clearInterval(intervalTime);
			index--;
			if(b){index--;b=false;}
			if(index < 0)
				index = pagers - 1;
			ShowAD(index);
		});
	}	
	
	if(options.nextID != 'no'){
		$next.hover(function(){clearInterval(intervalTime);},
									function(){setIntervalAgain();})
		
		$next.click(function(){
			$(this).blur(); 
			clearInterval(intervalTime);
			index++;
			if(b){index--;b=false;}
			if(index > pagers - 1)
				index = 0;
			ShowAD(index);
		});
	}
	
	if(options.listID != 'no'){
		listItems.each(function(){
			var items = $(this).find(options.listTab);
			
			if(options.touchList == 'hover'){
				items.hover(function(){
					if(intervalTime){
						clearInterval(intervalTime);
					}
					index=items.index(this);
					intervalTime = setTimeout(function(){
						ShowAD(index);
					},100);
				},function(){
					clearInterval(intervalTime);
					setIntervalAgain();
				});
				
			}else{
				items.click(function(){
					if(intervalTime){
						clearInterval(intervalTime);
					}
					index=items.index(this);
					intervalTime = setTimeout(function(){
						ShowAD(index);
						clearInterval(intervalTime);
						setIntervalAgain();
					},100);
				});
			
			}
		});
	}
	
	items.hover(function(){
		
		if(intervalTime){
			clearInterval(intervalTime);
		}
		
	},function(){
		
		clearInterval(intervalTime);
		setIntervalAgain();
		
	});
	
	var intervalTime;
	setIntervalAgain();
	
	if(options.listID != 'no' && options.listHoverCss != 'no' && options.listOutCss != 'no'){
		changeListClass(0);
		
		listItems.find(options.listTab).hover(function(){
			$(this).addClass(options.listHoverCss).removeClass(options.listOutCss);
		},function(){
			changeListClass(index);
		});
		
	}
	
	var ShowAD=function(i){
		var opts, scrollSize = i*options.scrollAmount;
		
		if(dir == 'left'){
		
			if(i == pagers - 1 && pagers > 1){
				scrollSize = items.eq(pagers-1).outerWidth()*i;
			}
			
			opts = {"left":-scrollSize};
		}
		
		else{
		
			if(i == pagers - 1 && pagers > 1){
				scrollSize = items.eq(pagers-1).outerHeight()*i;
			}
			
			opts = {"top":-scrollSize};
		}
		
		container.animate(opts,options.speed,function(){ });
		changeListClass(i);
		changeCss();
	};
	
	if(pagers == 1){
		$next.removeClass(options.prevHover).addClass(options.nextOut);
	}
	
	function changeCss(){
		if(options.prevHover != 'no' && options.prevOut != 'no' && options.nextHover != 'no' && options.nextOut != 'no'){
			if(pagers == 1){
				$next.removeClass(options.prevHover).addClass(options.nextOut);
			}else if(index == 0){
				$next.removeClass(options.nextOut).addClass(options.nextHover);
				$prev.removeClass(options.prevHover).addClass(options.prevOut);
			}else if(index == pagers-1){
				$next.removeClass(options.nextHover).addClass(options.nextOut);
				$prev.removeClass(options.prevOut).addClass(options.prevHover);
			}else{
				$next.removeClass(options.nextOut).addClass(options.nextHover);
				$prev.removeClass(options.prevOut).addClass(options.prevHover);
			}
		}
	}
	
	function changeListClass(i){
		if(options.listID != 'no' && options.listHoverCss != 'no' && options.listOutCss != 'no'){
			listItems.each(function(){
				var items = $(this).find(options.listTab);
				
				items.each(function(p){
					
					if(p == i){
						$(this).addClass(options.listHoverCss).removeClass(options.listOutCss);
					}else{
						$(this).addClass(options.listOutCss).removeClass(options.listHoverCss);
					}
					
				});
				
			});
		}
	}
	
	function setIntervalAgain(){
		if(options.timer!=0){
			
			intervalTime= setInterval(function(){
				ShowAD(index);
				index++;
				b = true;
				
				if(index==pagers){
					index=0;
				}
				
			},options.timer);
			
		}
	}
};
$.fn.roll.defaults = {
	speed : 1000,
	direction: 'left',  // 方向 'left','up'
	scrollAmount: 870, 	// 步长
	timer: 0,		// 自动滚动时长 '0' 不滚动
	listID: 'no', 		// 页码列表ID 'no' 表示没有页码列表
	listTab: 'li',		// 页码父层标签名
	prevID: 'no',		// 上一页按钮ID 'no' 表示没有按钮
	nextID: 'no',		// 下一页按钮ID
	prevHover: "no",
	prevOut: "no",
	nextHover: "no",
	nextOut: "no",
	touchList: 'click',	// 页码触动方式 'hover' or 'click'
	listHoverCss: 'no', // 鼠标悬停页码时的样式名称
	listOutCss: 'no'	// 鼠标离开页码时的样式名
};
$.fn.roll.setDefaults = function(settings) {
    $.extend($.fn.roll.defaults, settings);
};


/************************** 模式页面 **************************/

$.fn.modalWindow = function(options) { //imgFace
	var opts = $.extend({}, $.fn.modalWindow.defaults, options);
	
	var $contextual = $(this);
	var minW = 1024; 
	var minH = 623; 
	
	var $windowBg = $("<div></div>").css({
					width:"100%",
					height:$(".window").height(),
					opacity:0.8,
					zIndex:10001,
					position:"absolute",
					background:"white",
					top:0
					});
					
	var $window = $("<div></div>").css({
					width:"100%",
					height:"100%",
					zIndex:10002,
					position:"absolute",
					top:0
					});
					
	var $container = $("<div></div>").css({
					width:opts.contextW,
					height:opts.contextH,
					margin:"auto auto"
					});
					
	var $title = $("<div></div>").css({
					width:"100%",
					height:55
					});
					
	var $titleText = $("<div></div>").css({
					float:"left",
					fontSize:22,
					fontWeight:"bold"
					});
	
	var $cancel = $("<div></div>").css({
					float:"right",
					width:72,
					height:26,
					cursor:"pointer",
					marginTop:10,
					background:"url('images/cancel.gif') no-repeat"
					});
	
	var $corner = $("<div></div>").css({
					background:"#078ACA",
					width: opts.contextW - 40,
					height: opts.contextH - 55,
					position:"relative",
					padding:"1px 2px 2px 1px"
					});
	
	var $context = $("<div></div>").css({
					clear:"both",
					position:"relative",
					padding:20,
					background:"white"
					});
					
	var $textWindow = $("<div></div>").css({
					position:"relative",
					height: opts.contextH - 95,
					marginTop:0
					});
					
	var $text = $("<div></div>").css({
					lineHeight:"28px",
					textIndent:"2em",
					position:"absolute"
					});
	
	var $sidebarWindow = $("<div></div>").css({
					height:428,
					width:23,
					position:"absolute",
					top:0,
					left:opts.contextW - 22
					});
					
	var $sidePrev = $("<div></div>").css({
					height:20,
					width:23,
					cursor: "pointer",
					background:"url('images/sidePrev_out.gif') no-repeat"
					});
					
	var $sideNext = $("<div></div>").css({
					height:20,
					width:23,
					cursor: "pointer",
					background:"url('images/sideNext_out.gif') no-repeat"
					});
					
	var $sidebar = $("<div></div>").css({
					height:338,
					width:23,
					margin:"38px 0px 12px 0px",
					border:0,
					background:"transparent"
					});
					
	$window.append($container);
	$("body").append($windowBg,$window);
	$title.append($titleText,$cancel);
	$textWindow.append($text);
	
	if(!opts.useModel){
		$corner.css({
			width:"100%",
			height:"100%"
		});
		$text.css({textIndent:"0em"});
		
		$context.height(opts.contextH - 40);
		$context.append($textWindow);
		
		$textWindow.css({height:opts.contextH - 10});
		
	}else{
		$context.append($textWindow,$sidebarWindow);
		$textWindow.css({overflow:"auto",
						overflowY:"hidden",
						overflowX:"hidden"
		});
	}
	
	$corner.append($context);
	$container.append($title,$corner);
	$corner.corner("cc:#F9F9F9 6px");
	$context.corner("5px");
	
	$sidebarWindow.append($sidePrev,$sidebar,$sideNext);
	
	var title = $contextual.attr("title");
	var english = $contextual.attr("enTitle").toUpperCase();
	var str = title + "<br/><font style='font-size:12px;color:#707070'>&nbsp;" + english + "</font>";
	var action = $contextual.attr("action");
	var twH = $textWindow.height();
	
	$titleText.html(str).addClass("CC078ACA FFSOFT").css({letterSpacing:1});
	
	$sidebar.slider({
		orientation: 'vertical',
		range: "min",
		value: 100000,
		min: 1,
		max: 100000,
		slide: function( event, ui ) {
			if($text.height() > twH){
				$textWindow.scrollTop($text.height() - ui.value - twH);
			}
		},
		start: function(event,ui) {
			$sidebar.slider( "option", "max", $text.height() > twH ?  $text.height() - twH : twH);
			changeSidebarCss();
		},
		stop: function(event,ui) {
			$sidebar.find(".ui-slider-handle ").blur();
			changeSidebarCss();
		}
	});
	
	$textWindow.css({top:0});
	$textWindow.bind("mousewheel",function(event, delta){
		var slierValue = $sidebar.slider( "option", "value" );
		
		if(delta > 0){// ? 'Up' : 'Down'
			$textWindow.scrollTop($textWindow.scrollTop()-50);
		}else{
			$textWindow.scrollTop($textWindow.scrollTop()+50);
		}
		
		changeSidebarValue();
	});
	
	$sidePrev.mousedown(function(){
		$textWindow.scrollTop($textWindow.scrollTop()-50);
		changeSidebarValue();
	});
	
	$sideNext.mousedown(function(){
		$textWindow.scrollTop($textWindow.scrollTop()+50);
		changeSidebarValue();
	});
	
	$sidebar.find(".ui-slider-range").hide();
	$sidebar.find(".ui-slider-handle ").css({
		width:23,
		height:40,
		left:0,
		border:0,
		background:"url('images/sider.gif') no-repeat"
	});
	
	if(action.length > 1){
		$.ajax({
			url: action,
			type:'get',
			dataType:'html',
			success:function(text){
				
					$text.html(text);
					
					if($text.height() > twH){
						$sideNext.css({
							background:"url('images/sideNext_hover.gif') no-repeat"
						});
					}
			}
		});
	}
	
	$cancel.click(function(){
		destroy();
	});
	
	resize();
	$(window).load(function(){resize();});
	$(window).resize(function(){resize();});
	$(window).scroll(function(){resize();});
	
	function changeSidebarCss(){
		var v = $sidebar.slider( "option", "value");
		var max = $text.height() > twH ?  $text.height() - twH - 20 : twH - 20;
		if($text.height() <= twH){
			$sidePrev.css({background:"url('images/sidePrev_out.gif') no-repeat"});
			$sideNext.css({background:"url('images/sideNext_out.gif') no-repeat"});
		}else if(v < 20){
			$sidePrev.css({background:"url('images/sidePrev_hover.gif') no-repeat"});
			$sideNext.css({background:"url('images/sideNext_out.gif') no-repeat"});
		}else if(v > max){
			$sidePrev.css({background:"url('images/sidePrev_out.gif') no-repeat"});
			$sideNext.css({background:"url('images/sideNext_hover.gif') no-repeat"});
		}else{
			$sidePrev.css({background:"url('images/sidePrev_hover.gif') no-repeat"});
			$sideNext.css({background:"url('images/sideNext_hover.gif') no-repeat"});
		}
	}
	
	function destroy(){
		$window.remove();
		$windowBg.remove();
	}
	
	function changeSidebarValue(){
		var max = $text.height() > twH ?  $text.height() - twH : twH;
		$sidebar.slider( "option", "max", max);
		$sidebar.slider({value:max - $textWindow.scrollTop()});
		changeSidebarCss();
	}
	
	function resize(){
		var w=$(window).width(), h=$(window).height();
		if(w < minW){w = minW;}
		if(h < minH){h = minH;}
		
		$windowBg.css({width:w,height:$(".window").height()});
		$window.css({width:w,height:h});
		$container.css({marginTop: (h - $container.height())/2 - 10});
	}
	
	$(document).keydown(function(event){
		if(event.keyCode == 27){
			destroy();
		}
		
	});
};
$.fn.modalWindow.defaults = {
	contextW: 950,
	contextH: 480,
	useModel: true
};
$.fn.modalWindow.setDefaults = function(settings) {
    $.extend($.fn.modalWindow.defaults, settings);
};




$.fn.navAnimate = function(options) { //navAnimate
	var opts = $.extend({}, $.fn.navAnimate.defaults, options);
	
	var $nav = $(this).css({position:"relative"});
	var $btns = $nav.find("a");
	var $btnContainer = $("<div></div>").css({position:"absolute",top:0,zIndex:100});
	var $move = $("<div></div>").addClass(opts.moveClass).css({zIndex:99,position:"absolute"});
	
	$nav.append($move);
	$btns.wrapAll($btnContainer);
	
	var hoverColor = $move.css("color");
	var outColor = $btns.css("color");
	var direction = opts.direction == "lateral" ? true : false;
	
	$btns.eq(0).css({color:hoverColor});
	
	var moveBgH = $move.height();
	
	$btns.each(function(i){
		$(this).data("data",{index:i});
	});
	
	$btns.click(function(){
		var left = $(this).position().left;
		var top = $(this).position().top;
		var $btn = $(this);
		
		var animate1 , animate2 , animate3;
		
		$btns.css({color:outColor});
		
		if(direction){
			animate1 = {height:1,top:top + moveBgH/2,opacity:0.5};
			animate2 = {left:left};
			animate3 = {height:moveBgH,top:top,opacity:1};
			
		}else{
			animate1 = {height:1,top:top + moveBgH/2,opacity:0.5};
			animate2 = {top:top};
			animate3 = {height:moveBgH,left:left,opacity:1};
		}
		
		$move.animate(animate1,500);
		//var o = {};
		//$move.toggle("explode",o,500);
		
		$move.animate(animate2,300);
		
		//$move.toggle("explode",o,500);
		$move.animate(animate3,100,function(){
			$btn.css({color:hoverColor}).siblings().css({color:outColor});
			
		});
		
	}).hover(function(){
		$nav.append("<div class='navAnimate-hover" + $(this).data("data").index + "'></div>");
		
		var $hover = $(".navAnimate-hover" + $(this).data("data").index);
		
		$hover.addClass(opts.hoverClass).css({
			opacity:0,
			zIndex:98,
			position:"absolute",
			top:$(this).position().top,
			left:$(this).position().left
		});
			
		$hover.animate({opacity:0.2},300);
		
	},function(){
		var $hover = $(".navAnimate-hover" + $(this).data("data").index);
		
		$hover.animate({opacity:0},300,function(){
			$hover.remove();
		});
		
	});
	
};
$.fn.navAnimate.defaults = {
	moveClass:"",
	hoverClass:"",
	direction:"lateral" //vertical纵向 lateral横向
};
$.fn.navAnimate.setDefaults = function(settings) {
	$.extend($.fn.navAnimate.defaults, settings);
};




