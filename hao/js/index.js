 

$(document).ready(function(){
	$(".pinned").pin({containerSelector: "body"});
	
	var userAgent = window.navigator.userAgent;
	if(userAgent.indexOf("MSIE 7.0")>0 || (userAgent.indexOf("MSIE 8.0")>0 && !window.innerWidth)){ } else {
		var scrollTimeout = null;
		window.onscroll = function(){
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(function(){
				$.nav_autofocus();
			},20);
		}
	}
	
	$('.back-top').hide();
	$('.back-top').click(function(){$.scrollTop();});
	$('.sub-logo').click(function(){$.scrollTop();});
	
	$(".top-reading ul li").click(function(){
		$(this).children(".read-title").children("a").attr("target","_blank");
		var url = $(this).children(".read-title").children("a").attr("href");
		window.open(url);
	});
	
	$(".mainbody a").attr("target","_blank");
	$(".site-bottom a").attr("target","_blank");
	
	
	
	$(".search-btn").click(function(){
		var txt = $(".search-input").val();
		if(txt !== ""){
			window.open("http://www.baidu.com/s?wd=" + txt);//百度搜索
		}
	});
	
	$("img").lazyload({
		effect: "fadeIn",
		failurelimit:20
	});
	
	var enterflag = false;
	$(".search-input").bind("focus",function(){enterflag = true});
	$(".search-input").bind("blur",function(){enterflag = false});
	
	document.onkeydown=function(event){
	var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e && e.keyCode==13 && enterflag){ // enter 键
			$(".search-btn").click();
		}
	};
	
	$.ctrlbar_fix();
	$(window).resize(function() {
		$.ctrlbar_fix();
	});
	
	$(".setting").mouseover(function(){
	   $(this).children("a").children("img").attr("src","img/site_setting1.gif");
	}).mouseout(function(){
	   $(this).children("a").children("img").attr("src","img/site_setting0.gif");
	});
	
	//#f6f6f6
	//$(".site-area ul li").
});




$.extend({
	topArr : [
			$(".floor_1").offset().top - 40,
			$(".floor_2").offset().top - 40,
			$(".floor_3").offset().top - 40,
			$(".floor_4").offset().top - 40,
			$(".floor_5").offset().top - 40,
			$(".floor_6").offset().top - 40,
			$(".floor_7").offset().top - 40
	],
	nav_fix : function(_selector){
		var $e = $(_selector);
		var offset = $e.offset();
		$('html,body').animate({scrollTop: (offset.top - 55) + 'px'}, 300);
	},
	nav_autofocus : function(){
		var topArr = this.topArr;
		var currScrollTop = $(window).scrollTop();
		var $nav_a = $(".nav-list ul li a");
		if(currScrollTop < topArr[0]){
			$nav_a.removeClass("active");
			$nav_a.eq(0).addClass("active");
		}else if(currScrollTop < topArr[1]){
			$nav_a.removeClass("active");
			$nav_a.eq(1).addClass("active");
		}else if(currScrollTop < topArr[2]){
			$nav_a.removeClass("active");
			$nav_a.eq(2).addClass("active");
		}else if(currScrollTop < topArr[3]){
			$nav_a.removeClass("active");
			$nav_a.eq(3).addClass("active");
		}else if(currScrollTop < topArr[4]){
			$nav_a.removeClass("active");
			$nav_a.eq(4).addClass("active");
		}else if(currScrollTop < topArr[5]){
			$nav_a.removeClass("active");
			$nav_a.eq(5).addClass("active");
		}else if(currScrollTop < topArr[6]){
			$nav_a.removeClass("active");
			$nav_a.eq(6).addClass("active");
		}else if(currScrollTop < topArr[7]){
			$nav_a.removeClass("active");
			$nav_a.eq(7).addClass("active");
		}else {
			
		}
		if(currScrollTop < topArr[0] - 50){
			$(".back-top").fadeOut(500);
		}else {
			$(".back-top").fadeIn(500);
		}
	},
	ctrlbar_fix: function(){
		var w = document.body.clientWidth;
		var h = $(window).height();
		$(".back-top").css(
			{
				"left":w - (w - 1050)/2 + 10 + "px",
				"top": h - 100 + "px"
			}
		);
		//$(".back-top").fadeIn(2000);
	},
	scrollTop : function(){
		$('html,body').animate({scrollTop: '0px'}, 800);
	},
	scrollDown : function(){
		$('html,body').animate({scrollTop: '11110px'}, 800);
	}
});
