

var arr = {},time;

$(function(){
	//if(localStorage.html){
	//	local();
	//}
	bind();
});

function bind(){
	$('html').bind({
		dragover:false,
		drop:function(e){
			if(e.target.type != 'file'){ return false; }
		}
	});
	
	$('#file').change(function(e){
		filereader(e);
	});
	
	$('form').submit(function(){
		localStorage.name = arr.name = $('#name').val();
		localStorage.level = arr.level = $('#difficult').val();
		$('#start').fadeOut(1000);
		start();
	});
	
	$('.J-btn-restart').click(function(){
		$('#start').fadeIn(300);
		$('#end').fadeOut(300);
		clear();
		setTimeout(function(){
			$('.img').css('background-image','');
			$('#file').val('');
		},200);
	});
	
	$('.btn-pause').click(function(){
		if($(this).html() == 'PAUSE'){
			$(this).html('RESUME');
			clearInterval(time);
			$('#puzzleContainer>*').fadeOut(300);
		}else{
			$(this).html('PAUSE');
			clock();
			$('#puzzleContainer>*').fadeIn(300);
		}
	});
}

function filereader(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	if(!file){ return false; }
	if(!/image\/(jpg|jpeg)/.test(file.type)){
		alert('JPG format only');
		return false;
	}
	reader.readAsDataURL(file);
	reader.onload = function(){
		localStorage.img = arr.img = this.result;
		$('#drop .img').css('background-image','url('+this.result+')');
	}
}

function start(){
	$('#start,#end').fadeOut(300);
	$('#puzzleContainer>*').fadeIn(300);
	if(!localStorage.html){
		create();
	}
	localStorage.img = arr.img;
	$('#playername').html(arr.name);
	move();
	clock();
}

function create(){
	var form='',to='',drag,bg,left,top,deg,n=0,lev=arr.level,size=500/lev;
	
	for(var i=0;i<lev*lev;i++){
		left = i%lev * size;
		top = n * size;
		deg = Math.ceil(Math.random()*3)*90;
		
		bg = '<div class="bg img" style="left:-'+left+'px;top:-'+top+'px;background-image:url('+arr.img+')"></div>';
		drag = '<div class="drag" gid="'+(i+1)+'" deg="'+deg+'" rot="'+deg+'" style="transform:rotate('+deg+'deg)">'+bg+'</div>';
		form += '<div class="undone" style="width:'+size+'px;height:'+size+'px;">'+drag+'</div>';
		to += '<div class="done" gid="'+(i+1)+'" style="width:'+size+'px;height:'+size+'px;"></div>';
		
		if(i%lev == lev-1){ n++; }
	}
	var sort = $(form).sort(function(){ return 0.5-Math.random() });
	$('#puzzle').html(sort);
	$('#puzzleDestination').html(to).css('background-image','url('+arr.img+')');
}

function move(){
	$('.undone .drag').draggable({ revert:'invalid', snap:'.done',
		start:function(){ toggle($(this)); },
		stop:function(event,ui){
			var rot = $('.active').attr('rot');
			if(ui.helper.parent().attr('class') == 'undone'){
				$('.active').css('transform','rotate('+rot+'deg)').attr('deg',rot).removeClass('active');
			}
		}
	}).click(function(){ toggle($(this)); });
	
	$('.done').droppable({
		accept:function(){
			var act = $('.active');
			if(act.attr('deg')%360 == 0 && $(this).attr('gid') == act.attr('gid')){ return true; }
		},
		drop:function(event,ui){
			console.log(ui);
			ui.draggable.removeClass('active').removeAttr('style').unbind('click').draggable('disable').hide();
			$(this).append(ui.draggable.fadeIn(300));
			over();
		}
	});
	
	window.onkeydown = function(e){
		var deg = $('.active').attr('deg')*1;
		switch (e.keyCode){
			case 37: deg += -90; break;
			case 39: deg += 90; break;
		}
		$('.active').css('transform','rotate('+deg+'deg) scale(1.1)').attr('deg',deg);
	}
}

function toggle(obj){
	var old = $('.active'),
		deg = obj.attr('deg');
	old.removeClass('active').css('transform','rotate('+old.attr('deg')+'deg)');
	obj.addClass('active').css('transform','rotate('+deg+'deg) scale(1.1)');
}

function over(){
	if($('.done .drag').length == $('.done').length){
		table();
		$('#end').delay(500).show(500);
		clear();
	}
}
// 后台接口方式获取游戏排序
function table(){
	$.ajax({
        type: 'POST',
        url: 'service.php',
        data: {
            level: arr.level,
            name: arr.name,
            time:localStorage.time*1
        },
        success: function(res){
            $('table tbody').html(res);
        },
        error: function(){
        	$('table tbody').html('');
        }
    });
}
// 本地缓存方式获取游戏排序
function tableLocalStorage(){
	var json = [];
	var table = {
		num:1,
		level:$('select option[value='+arr.level+']').html(),
		name:arr.name,
		time:localStorage.time*1
	};
	
	if(localStorage.table){
		json = JSON.parse(localStorage.table);
		table.num = json[json.length-1].num*1+1;
	}
	json.push(table);
	localStorage.table = JSON.stringify(json);
	
	var str = '';
	json.filter(function(v,i){
		return (v.level == table.level);
	}).sort(function(a,b){
		return (a.time*1 > b.time*1);
	}).filter(function(v,i){
		v.pos = i+1;
		return (i < 3 || table.num == v.num);
	}).forEach(function(v,i){
		var date = new Date(v.time*1);
		var me = '';
		if(table.num == v.num){ me = 'class="me"'; }
		str += '<tr '+me+'>\
					<td>'+v.pos+'</td>\
					<td>'+v.level+'</td>\
					<td>'+v.name+'</td>\
					<td>'+format(Math.floor(v.time/1000/60))+':'+format(date.getSeconds())+'</td>\
				</tr>';
	});
	$('table tbody').html(str);
}

function clock(){
	time_fun();
	time = setInterval(time_fun,1000);
	function time_fun(){
		var t = calc();
		$('#timer').html(t.m+':'+t.s);
		var html = $('#puzzleContainer').clone();
		html.find('.img').css('background-image','');
		localStorage.html = html.html();
	}
}

function calc(){
	var t = 0;
	if(localStorage.time){
		t = localStorage.time*1;
	}
	var date = new Date(t+=1000);
	localStorage.time = t;
	return {m:format(Math.floor(t/1000/60)),s:format(date.getSeconds())};
}

function format(v){
	if(v < 10){ v = '0'+v; }
	return v;
}

function local(){
	arr.name = localStorage.name;
	arr.level = localStorage.level;
	arr.img = localStorage.img;
	$('#puzzleContainer').html(localStorage.html);
	$('#puzzleContainer .img').css('background-image','url('+arr.img+')');
	start();
}

function clear(){
	var tab = localStorage.table;
	clearInterval(time);
	localStorage.clear();
	if(tab){ localStorage.table = tab; }
}



