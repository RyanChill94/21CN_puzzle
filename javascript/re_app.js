/**
 * Created by Ryanchill on 2016/9/1.
 */

;
$(function () {

    //暂存对象
    var arr = {}, time;

    //init
    $(function () {
        //use localStorage
        if (localStorage.html) {
            local();
        }

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
            localStorage.level = arr.level = $('difficult').val();
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
        var file = e.target.file[0];
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
        $('#start,#end').fadeOut(300);
        $('#pizzleContainer>*').fadeIn(300);
        if (!localStorage.html) {
            create();
        }
        localStorage.img = arr.img;
        $('#player').html(arr.name);
        move();
        clock();
    }

    function create() {
        var from = '', to = '', drag, bg, left, top, deg, n = 0,
            lev = arr.level, size = 500 / lev;

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
        var sort = $(from).sort(function () {
            return 0.5 - Math.random()
        });
        $('#puzzle').html(sort);
        $('#puzzleDestination').html(to).css('background-image', 'url(' + arr.img + ')');
    }

    function move() {
        $('.undone .drag').draggable({
            revert: 'invaild', //不满足条件复原
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
                ui.draggable.removeClass('active').removeAttr('style').unind('click').draggable('disable').hide();
                $(this).append(ui.draggable.fadeIn(300));

                //判断是否满足胜利条件
                over();
            }
        });

        window.addEventListener('keydown', function (e) {
            var deg = $('active').attr('deg') * 1;
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
    };

    //切换
    function toggle(obj){
        var old = $('.active'),
            deg = obj.attr('deg');
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





});