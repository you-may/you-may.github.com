
/************************** 页面整体效果 **************************/

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
	
	var buildPages = $topMenus.each(function(index){
		var hf = $(this).attr("href");
		var name = hf.substring(hf.indexOf("#")+1,hf.length);
		
		var p = $('<div class="page"><div class="pageContainer"></div></div>');
		p.find(".pageContainer").addClass(name);
		$moveContainer.append(p);
		
		$(this).data("pageInfo",{num:index,name:name,state:true});
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
	
	init();
	
	//监听url hash值修改
	$.router(function(hash) {
		
		if("" == hash || null == hash){
			hash = $topMenus.eq(0).data("pageInfo").name;
		}
		
		locationHref = hash;
		loadSubPage(hash);
		
	});
	
	var autoLoadSubPage = setInterval(function(){
		autoLoadPage();
	},autoLoadTime);
	
	//可视窗口大小
	$(window).load(function(){windowSize();});
	$(window).resize(function(){windowSize();});
	
	$(window).scroll(function(){
		$next.animate({left:$(window).width()-$next.width()+$(window).scrollLeft()},{queue:false},10);	
		$prev.animate({left:$(window).scrollLeft()},{queue:false},10);	
	});
	
	// 拖动条
	$scrollbar.slider({
		range: "min",
		value: 1,
		min: 1,
		max: pageW * pageNum- $(window).width(),
		slide: function( event, ui ) {
			$moveContainer.css({left:-ui.value});
			
			var flashMoveSize = $flashBg.width() / (pageW * (pageNum*2+2)) * ui.value;
			
			$flashBg.css({left:-flashMoveSize});
			
			currentPage = Math.round(ui.value / pageW);
			
			var hashName = $topMenus.eq(currentPage).data("pageInfo").name;
			
			if(locationHref != hashName){
				window.location.href = "#" + hashName;
			}
			
		},
		start: function(event,ui) {
			isSide = true;
		},
		stop: function(event,ui) {
			//isSide = false;
		},
		change: function(event,ui){
			if(isPassCtrl){
				$moveContainer.css({left:-ui.value});
				
				var flashMoveSize = $flashBg.width() / (pageW * (pageNum*2+2)) * ui.value;
				
				$flashBg.css({left:-flashMoveSize});
				
				currentPage = Math.round(ui.value / pageW);
				
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
		var moveMargin = 0;
		
		$scrollbar.css({width:w - 100,top:h-70});
		
		if(w < minW){w = minW;}
		if(h < minH){h = minH;}
		containerH = h-$top.height()-$floor.height();
		if((containerH-pageH) > 0){moveMargin = (containerH-pageH)/2;}
		$window.css({width:w,height:h});
		$container.css({height:containerH,width:pageNum*pageW*3});
		$moveContainer.css({height:containerH});
		$moveContainer.css({marginTop:moveMargin});
		$top.width(w);
		$floor.width(w);
		$prev.animate({left:$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2},{queue:false},10);
		$next.animate({left:$(window).width()-$next.width()+$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2},{queue:false},10);
		
		if(($flashBg.width() + $flashBg.offset().left) < w){
			$flashBg.css({left:-($flashBg.width()-w)});
		}
		
		$("#bgFlash").height(h);
	}
	
	$prev.css({left:$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2});
	$next.css({left:$(window).width()-$next.width()+$(window).scrollLeft(),top:containerH/2+$top.height()-$prev.height()/2});
	
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
		if(currentPage < 1){
			$prev.attr({"class":"prev prev-out"});
			$next.attr({"class":"next next-hover"});
			
		}else if(currentPage == pageNum-1){
			$next.attr({"class":"next next-out"});
			$prev.attr({"class":"prev prev-hover"});
			
		}else{
			$prev.attr({"class":"prev prev-hover"});
			$next.attr({"class":"next next-hover"});
		}
		
		$topMenus.eq(currentPage).removeClass().addClass("nav-hover").siblings().removeClass().addClass("nav-out");
	}
	
	function init(){
		var dialogObj = $("[_actionType='dialog']");
		var dialogNoModelObj = $("[_actionType='dialogNoModel']");
		
		dialogObj.die("click");
		dialogObj.live("click",function(){
			$(this).modalWindow();
		});
		
		dialogNoModelObj.die("click");
		dialogNoModelObj.live("click",function(){
			$(this).modalWindow({useModel:false});
		});
		
	}
	
	// background flash
	var params = { wmode:'transparent',flashvars: "",quality:'Low',scale:'NoBorder' };
	var attributes = { id:'bgFlash', name:'bgFlash' };
	swfobject.embedSWF('images/flash_bg.swf','flashBackground','100%',h,'9.0.115','',false, params, attributes);
	
	var $dragCover = $("<span class='dragCover'></span>").css({
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
	$moveContainer.append($dragCover);
	
	var isRepeatPassCtrl = false;
	$(document).keydown(function(event){
		//$("body").append($dragCover);
		
		isPassCtrl = true;
		isSide = true;
		if(event.keyCode == 37 || event.keyCode == 38 ){
			$prev.click();
			
		}else if(event.keyCode == 39 || event.keyCode == 40 ){
			$next.click();
			
		}if(event.keyCode == 17){
			if(isRepeatPassCtrl == false){
				var ml = $moveContainer.offset().left;
				var x,sliderValue;
				$dragCover.css({display:"block"});
				
				$moveContainer.bind("mousedown",function(e){
					x = e.clientX;
					sliderValue = $scrollbar.slider("value");
					
					$moveContainer.bind("mousemove",function(e){
						$scrollbar.slider({value: sliderValue +(x - e.clientX)});
					});
					
				}).bind("mouseup",function(){
					$moveContainer.unbind("mousemove");
				});
			}
			
			isRepeatPassCtrl = true;
		}
	}).keyup(function(){
		$moveContainer.unbind("mousemove");
		$moveContainer.unbind("mouseup");
		$moveContainer.unbind("mousedown");
		isRepeatPassCtrl = false;
		isPassCtrl = false;
		$dragCover.hide();
	});
	
	
	
});

/************************** subPage --ajax --title **************************/

$.fn.subPage = function(options) { //subPage --ajax --title
	var opts = $.extend({}, $.fn.subPage.defaults, options);

	var $subPage = $(this); 
	var $subNav = $subPage.find(".subNav");
	var $slideDir = $subPage.find(".slideDir div");
	var $subContainer = $subPage.find(".subContainer");
	
	var index = 0;
	var pageSize = $subNav.find("a").size();
	var aW = ($subNav.width()-15*pageSize)/pageSize;
	var path = $subNav.find("a:first").attr("_action");
	
	$subNav.find("a").each(function(i){
		
		$(this).data("pageInfo",{num: i});
		
	});
	
	slideDirMove();
	loadSubContainer(path);
	
	$subNav.find("a").mouseout(function(){
		navCss();
	}).click(function(){
		index = $(this).data("pageInfo").num;
		path = $(this).attr("_action");
		slideDirMove();
	});
	
	$subNav.find("a").css({width:aW});
	
	function loadSubContainer(path){
		$.ajax({
			url:path,
			type:'POST',
			dataType:'text',
			success:function(text){
				$subContainer.html(text);
			}
		});
	}
	
	function slideDirMove(){
		$slideDir.animate({left:aW/2+index*opts.moveSize-2},500,function(){
			navCss();
			
			if(path != ""){
				loadSubContainer(path);
			}
			
		});
	}

	function navCss(){
		$subNav.find("a").eq(index).removeClass().addClass("subNav-hover").siblings().removeClass().addClass("subNav-out");
	}
	
};
$.fn.subPage.defaults = {
	moveSize: 190
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
	if($imgCtn.attr("class") == "hot"){
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
		$prev = $window.prev().prev();
		$next = $window.prev();
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
		if(dir == 'left')
			container.animate({"left":-i*options.scrollAmount},options.speed,function(){
				changeListClass(i);
				changeCss();
			});
		else
			container.animate({"top":-i*options.scrollAmount},options.speed,function(){
				changeListClass(i);
				changeCss();
			});
	};
	
	function changeCss(){
		if(options.prevHover != 'no' && options.prevOut != 'no' && options.nextHover != 'no' && options.nextOut != 'no'){
			if(index == 0){
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
					height:"100%",
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
					height:60
					});
					
	var $titleText = $("<div></div>").css({
					float:"left",
					fontSize:30,
					fontFamily:"幼圆",
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
	
	var $context = $("<div></div>").css({
					clear:"both",
					height:428,
					width:915,
					position:"relative",
					padding:20,
					background:"url('images/model_bg.gif') no-repeat"
					});
					
	var $textWindow = $("<div></div>").css({
					overflow:"auto",//"hidden",
					position:"relative",
					height:385,
					marginTop:0,
					overflowY:"hidden",
					overflowX:"hidden"
					});
					
	var $text = $("<div></div>").css({
					lineHeight:"28px",
					textIndent:"2em",
					position:"absolute",
					width:875
					});
	
	var $sidebarWindow = $("<div></div>").css({
					height:428,
					width:23,
					position:"absolute",
					top:0,
					left:928
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
		$context.css({
			background:"",
			width:"100%",
			padding:"2px",
			border:"1px #A0A0A0 dotted"
		});
		
	}else{
		$context.append($textWindow,$sidebarWindow);
	}
	
	$container.append($title,$context);
	
	$sidebarWindow.append($sidePrev,$sidebar,$sideNext);
	
	var title = $contextual.attr("title");
	var english = $contextual.attr("_enTitle").toUpperCase();
	var str = title + "<br/><font style='font-size:12px;color:#9C9E9C'>&nbsp;" + english + "</font>";
	var action = $contextual.attr("_action");
	var twH = $textWindow.height();
	
	$titleText.html(str);
	
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
				if(opts.useModel){
				
					$text.html(text);
					
					if($text.height() > twH){
						$sideNext.css({
							background:"url('images/sideNext_hover.gif') no-repeat"
						});
					}
					
				}else{
					$context.html(text);
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
		var max = $text.height() > twH ?  $text.height() - twH : twH;
		if(v < 20){
			$sidePrev.css({background:"url('images/sidePrev_hover.gif') no-repeat"});
			$sideNext.css({background:"url('images/sideNext_out.gif') no-repeat"});
		}else if(v > max - 20){
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
		
		$windowBg.css({width:w,height:h});
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






