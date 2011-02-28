

/************************** 页面整体效果**************************/

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
	var $topMenus = $(".nav")//头部按钮
	
	var minW = 1024; //可视窗口最小宽度
	var minH = 623; //可视窗口最小高度
	var pageNum = $container.find(".page").size(); //滚动页数 
	var pageH = $(".page").outerHeight();//滚动页面高度
	var pageW = $(".page").outerWidth();
	var currentPage = 0; //当前页
	var runing = true;//是否正在滚动
	var w=$(window).width(), h=$(window).height();
	var containerH = h-$top.height()-$floor.height();
	
	
	$(".pageC").subPage();
	$(".pageB").subPage({moveSize:235});
	$(".pageD").subPage({moveSize:470});
	
	$.ajax({
		url:"subPages/joinUs.html",
		type:'get',
		dataType:'html',
		success:function(text){
			$(".pageE").html(text);
		}
	});
	
	$.ajax({
		url:"subPages/about.html",
		type:'get',
		dataType:'html',
		success:function(text){
			$(".pageA").html(text);
		}
	});
	
	
	//可视窗口大小
	$(window).load(function(){windowSize();});
	$(window).resize(function(){windowSize();});
	$(window).scroll(function(){
		$next.animate({left:$(window).width()-$next.width()+$(window).scrollLeft()},{queue:false},10);	
		$prev.animate({left:$(window).scrollLeft()},{queue:false},10);	
	});
	
	$moveContainer.find(".page").dblclick(function(){
		currentPage = parseInt($(this).attr("lang"));
		movePage(currentPage);
		$("*").blur();
	});
	
	$prev.click(function(){
		if(runing){
			currentPage -= 1;
			if(currentPage < 0){currentPage = 0;}
			else{movePage(currentPage);}
		}
	});
	
	$next.click(function(){
		if(runing){
			currentPage += 1;
			if(currentPage >= pageNum){currentPage = pageNum-1;}
			else{movePage(currentPage);}
		}
	});
	
	$topMenus.find("a").click(function(){
		$(this).blur(); 
		if(runing){
			currentPage = parseInt($(this).attr("lang"));
			movePage(currentPage);
		}
	});
	
	function windowSize(){
		w = $(window).width(); 
		h = $(window).height();
		var moveMargin = 0;
		if(w < minW){w = minW;}
		if(h < minH){h = minH;}
		containerH = h-$top.height()-$floor.height();
		if((containerH-pageH) > 0){moveMargin = (containerH-pageH)/2;}
		$window.css({width:w,height:h});
		$container.css({height:containerH,width:pageNum*pageW*3});
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
	
	function movePage(index){
		runing = false;
		w = $(window).width(); 
		if(w < minW){w = minW;}
		var flashBgMoveSize = ($flashBg.width()-w)/pageNum;
		if(index == pageNum-1){
			$moveContainer.animate({left:-(pageW*pageNum-w)},1000,function(){menuCss();});
		}else{
			$moveContainer.animate({left:-index*pageW},1000,function(){menuCss();});
		}
		$flashBg.animate({left:-flashBgMoveSize*index},1000);
	}
	
	function menuCss(){
		if(currentPage == 0){
			$prev.attr({"class":"prev prev-out"});
			$next.attr({"class":"next next-hover"});
		}else if(currentPage == pageNum-1){
			$next.attr({"class":"next next-out"});
			$prev.attr({"class":"prev prev-hover"});
		}else{
			$prev.attr({"class":"prev prev-hover"});
			$next.attr({"class":"next next-hover"});
		}
		$topMenus.find("a").eq(currentPage).removeClass().addClass("nav-hover").siblings().removeClass().addClass("nav-out");
		runing = true;
	}
	
	// background flash
	var params = { wmode:'transparent',flashvars: "",quality:'Low',scale:'NoBorder' };
	var attributes = { id:'bgFlash', name:'bgFlash' };
	swfobject.embedSWF('images/flash_bg.swf','flashBackground','100%',h,'9.0.115','',false, params, attributes);
	
	$(document).keydown(function(event){
		mousePosition = "";
		if(event.keyCode == 37 || event.keyCode == 38 ){
			$prev.click();
		}else if(event.keyCode == 39 || event.keyCode == 40 ){
			$next.click();
		}
	}).keyup(function(){
		
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
	
	slideDirMove();
	loadSubContainer(path);
	$subNav.find("a").mouseout(function(){
		navCss();
	}).click(function(){
		index = parseInt($(this).attr("lang"));
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
	var opts = $.extend({}, $.fn.subPage.defaults, options);
	
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
	
	$(".images").children("div").each(function(){
		$(this).imgFace({hotTop:-6,
						hotLeft:108,
						faceTop:0,
						faceLeft:0
						});
	});
	
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




