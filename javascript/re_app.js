/**
 * Created by Ryanchill on 2016/9/1.
 */

$(function () {
    //暂存对象
    var arr = {}, time;

    //init
    $(function () {
        //use localStorage
        //if (localStorage.html) {
        //    local();
        //}

        bind();
    });

    function bind() {

        //可拖拽
        $('html').bind({
            dragover: false,
            drop: function (e) {
                if (e.target.type != 'file') {
                    return false;
                }
            }
        });

        //文件读取
        $('#file').on('change', function (e) {
            filereader(e);
        });

        //开始游戏
        $('form').on('submit', function () {
            localStorage.name = arr.name = $('#name').val();
            localStorage.level = arr.level = $('#difficult').val();
            $('#start').fadeOut(1000);
            start();
        });

        //重启游戏
        $('.btn-restart-click').on('click', function () {
            $('#start').fadeIn(300);
            $('#end').fadeOut(300);

            //清除所有缓存
            clear();


            setTimeout(function () {
                $('.img').css('backgroundImage', '');
                $('#file').val('');
            }, 200)
        });

        //暂停游戏
        $('btn-pause').on('click', function () {
            if ($(this).html() == 'Pause') {
                //暂停游戏
                $(this).html('Resume');
                clearInterval(time);
                $('#puzzleContainer>*').fadeOut(300);
            } else {
                //继续游戏
                $(this).html('Pause');
                clock(); //计时
                $('#puzzleContainer>*').fadeIn(300);
            }
        });

    }

    //上传文件转为base64

    function filereader(e) {
        console.log(e.target);
        var file = e.target.files[0];
        var reader = new FileReader();

        if (!file) return false;

        //过滤格式
        //image/jpg | image/jpeg
        if (!(/image\/(jpg|jpeg)/.test(file.type))) {
            alert('JPG format only');
            return false;
        }

        reader.readAsDataURL(file);
        reader.onload = function () {
            localStorage.img = arr.img = this.result;
            $('#drop').find('.img').css('backgroundImage', 'url(' + this.result + ')');
        }
    }

    function start() {
        $("#start,#end").fadeOut(300);
        $('#puzzleContainer>*').fadeIn(300);
        //if (!localStorage.html) {
        //    create();
        //}
        create();
        localStorage.img = arr.img;
        $('#player').html(arr.name);
        move();
        clock();
    }

    function create() {
        var from = '', to = '', drag, bg, left, top, deg, n = 0,
            lev = arr.level, size = 500 / lev;
        console.log(arr.level);
        console.log(lev);
        for (var i = 0; i < lev * lev; i++) {
            //图片偏移量
            left = i % lev * size;
            top = n * size;
            deg = Math.ceil(Math.random() * 3) * 90;

            bg = '<div class="bg img" style="left:-' + left + 'px;top:-' + top + 'px;background-image:url(' + arr.img + ')"></div>';
            drag = '<div class="drag" gid="' + (i + 1) + '" deg="' + deg + '" rot="' + deg + '" style="transform:rotate(' + deg + 'deg)">' + bg + '</div>';
            from += '<div class="undone" style="width:' + size + 'px; height:' + size + 'px">' + drag + '</div>';
            to += '<div class="done" gid="' + (i + 1) + '" style="width:' + size + 'px;height:' + size + 'px;"></div>';

            if (i % lev == lev - 1) {
                n++;
            }

        }

        //打乱
        var sort = $(from).sort(function(){ return 0.5-Math.random() });
        console.log("sort:",sort);
        $('#puzzle').html(sort);
        $('#puzzleDestination').html(to).css('background-image', 'url(' + arr.img + ')');
    }

    function move() {
        $('.undone .drag').draggable({
            revert: 'invalid', //不满足条件复原
            snap: '.done', //接受的容器
            start: function () {
                toggle($(this));
            },
            stop: function (e, ui) {
                var rot = $('.active').attr('rot');
                //判断
                if (ui.helper.parent().attr('class') == 'undone') {
                    $('.active').css('transform', 'rotate(' + rot + 'deg)').attr('deg', rot).removeClass('active');
                }
            }
        }).click(function () {
            toggle($(this));
        });


        $('.done').droppable({
            accept: function () {
                var act = $('.active');
                //判断是否可以放置
                if (act.attr('deg' % 360 == 0 && $(this).attr('gid') == act.attr('gid'))) {
                    return true;
                }
            },
            drop: function (e, ui) {
                //console.log(ui)
                ui.draggable.removeClass('active').removeAttr('style').unbind('click').draggable('disable').hide();
                $(this).append(ui.draggable.fadeIn(300));

                //判断是否满足胜利条件
                over();
            }
        });

        window.addEventListener('keydown', function (e) {
            //alert("lalalla");
            var deg = $('.active').attr('deg') * 1;
            switch (e.keyCode) {
                case 37:
                    deg += -90;
                    break;
                case 39:
                    deg += 90;
                    break;
            }
            $('.active').css('transform', 'rotate(' + deg + 'deg) scale(1.1)').attr('deg', deg);
        }, false);
    }

    //切换
    function toggle(obj){
        var old = $('.active'),
            deg = obj.attr('deg');
        console.log(deg);
        old.removeClass('active').css('transform','rotate('+ old.attr('deg') +'deg)');
        obj.addClass('active').css('transform','rotate('+ deg +'deg) scale(1.1)');
    }

    //游戏结束
    function over(){
        if($('.done .drag').length == $('.done').length){
            table();
            $('#end').delay(500).show(500);
            clear();
        }
    }

    //生成排名数据
    function table(){
        $.ajax({
            type:'POST',
            url:'server.php',
            data:{
                level:arr.level,
                name:arr.name,
                time:localStorage.time * 1
            },

            success:function(res){
                $('table tbody').html(res);
            },
            error: function () {
                $('table tbody').html('');
            }
        });
    }

    //本地缓存方式获取游戏排序
    function tableLocalStorage(){
        var json = [];
        var table ={
            num:1,
            level:$('select option[value='+arr.level+']').html(),
            name:arr.name,
            time:localStorage.time*1
        };

        if(localStorage.table){
            json = JSON.parse(localStorage.table);
            table.num = json[json.length-1].num*1 + 1;
        }

        //存进对象数组
        json.push(table);
        //转成JSON字符串
        localStorage.table = JSON.stringify(json);

        var str = '';
        json.filter(function(v,i){
            return(v.level == table.level);
        }).sort(function(a,b){
            return (a.time*1 > b.time*1);
        }).filter(function(v,i){
            v.pos = i + 1;
            return (i<3 || table.num == v.num);
        }).forEach(function(v,i){
            var date = new Date(v.time*1);
            var me = '';
            if(table.num == v.num){me = 'class="me"';}
            str += '<tr '+me+'>\
					<td>'+v.pos+'</td>\
					<td>'+v.level+'</td>\
					<td>'+v.name+'</td>\
					<td>'+format(Math.floor(v.time/1000/60))+':'+format(date.getSeconds())+'</td>\
				</tr>';
        });

        $('table tbody').html(str);
    }

    //计时
    function clock(){
        time_fun();
        //声明为全局变量
        time = setInterval(time_fun,1000);
        function time_fun(){
            //获取新计时 或者 缓存计时
            var t = calc();
            $('#timer').html(t.m + ':' + t.s);

            //保存这一秒状态
            //console.log($('#puzzleContainer'));
            var $html = $('#puzzleContainer').clone();
            $html.find('.img').css('backgroundImage','');
            localStorage.html = $html.html();
        }
    }

    //获取时间
    function calc(){
        var t = 0;
       /* if(localStorage.time){
            t = localStorage.time*1;
        }*/

        var date = new Date(t+=1000);
        //保存在本地缓存
        //localStorage.time =t;
        return {m:format(date.getMinutes()),s:format(date.getSeconds())};
    }

    //格式化时间
    function format(v){
        if(v < 10){ v = '0'+v;}
        return v;
    }

    //使用本地缓存
    //function local(){
    //    arr.name = localStorage.name;
    //    arr.level = localStorage.level;
    //    arr.img = localStorage.img;
    //
    //    $('#puzzleContainer').html(localStorage.html)
    //        .find('.img').css('backgroundImage','url('+arr.img+')');
    //    start();
    //}

    function clear(){
        var tab = localStorage.table;
        clearInterval(time);
        localStorage.clear();
        if(tab){ localStorage.table = tab; }
    }


});