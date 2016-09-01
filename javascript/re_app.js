/**
 * Created by Ryanchill on 2016/9/1.
 */

;
$(function () {

    //�ݴ����
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

        //����ק
        $('html').bind({
            dragover: false,
            drop: function (e) {
                if (e.target.type != 'file') {
                    return false;
                }
            }
        });

        //�ļ���ȡ
        $('#file').on('change', function (e) {
            filereader(e);
        });

        //��ʼ��Ϸ
        $('form').on('submit', function () {
            localStorage.name = arr.name = $('#name').val();
            localStorage.level = arr.level = $('difficult').val();
            $('#start').fadeOut(1000);
            start();
        });

        //������Ϸ
        $('.btn-restart-click').on('click', function () {
            $('#start').fadeIn(300);
            $('#end').fadeOut(300);

            //������л���
            clear();


            setTimeout(function () {
                $('.img').css('backgroundImage', '');
                $('#file').val('');
            }, 200)
        });

        //��ͣ��Ϸ
        $('btn-pause').on('click', function () {
            if ($(this).html() == 'Pause') {
                //��ͣ��Ϸ
                $(this).html('Resume');
                clearInterval(time);
                $('#puzzleContainer>*').fadeOut(300);
            } else {
                //������Ϸ
                $(this).html('Pause');
                clock(); //��ʱ
                $('#puzzleContainer>*').fadeIn(300);
            }
        });

    }

    //�ϴ��ļ�תΪbase64

    function filereader(e) {
        var file = e.target.file[0];
        var reader = new FileReader();

        if (!file) return false;

        //���˸�ʽ
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
            //ͼƬƫ����
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

        //����
        var sort = $(from).sort(function () {
            return 0.5 - Math.random()
        });
        $('#puzzle').html(sort);
        $('#puzzleDestination').html(to).css('background-image', 'url(' + arr.img + ')');
    }

    function move() {
        $('.undone .drag').draggable({
            revert: 'invaild', //������������ԭ
            snap: '.done', //���ܵ�����
            start: function () {
                toggle($(this));
            },
            stop: function (e, ui) {
                var rot = $('.active').attr('rot');
                //�ж�
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
                //�ж��Ƿ���Է���
                if (act.attr('deg' % 360 == 0 && $(this).attr('gid') == act.attr('gid'))) {
                    return true;
                }
            },
            drop: function (e, ui) {
                //console.log(ui)
                ui.draggable.removeClass('active').removeAttr('style').unind('click').draggable('disable').hide();
                $(this).append(ui.draggable.fadeIn(300));

                //�ж��Ƿ�����ʤ������
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

    //�л�
    function toggle(obj){
        var old = $('.active'),
            deg = obj.attr('deg');
        old.removeClass('active').css('transform','rotate('+ old.attr('deg') +'deg)');
        obj.addClass('active').css('transform','rotate('+ deg +'deg) scale(1.1)');
    }

    //��Ϸ����
    function over(){
        if($('.done .drag').length == $('.done').length){
            table();
            $('#end').delay(500).show(500);
            clear();
        }
    }

    //������������
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