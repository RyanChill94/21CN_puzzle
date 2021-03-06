$(document).ready(function () {

    //判断有没有本地缓存
    $(function () {
        //if (localStorage.html) {
        //    useLocal();
        //}
        checkIn();
    });

    //创建空的寄存对象
    var box = {};

    //模态框
    function checkIn() {
        //可以重写
        //拖拽上传
        var area = $('.drag-place').eq(0);
        area.bind({
            //prevent browser drag-over default action
            dragover: function (e) {
                e.preventDefault();
            },
            drop: function (e) {
                e.preventDefault();
                e.stopPropagation();
                //fix e.dataTransfer undefined
                var dtf = e.originalEvent.dataTransfer;
                var file = dtf.files[0];

                var reader = new FileReader();
                reader.onload = function () {
                    //console.log(reader);
                    var url = box.url = this.result;
                    setImageUrl(url);
                };
                reader.readAsDataURL(file);
            }
        });

        //点击上传
        $('input[type = file]').change(function () {
            var file = this.files[0];

            var reader = new FileReader();
            reader.onload = function () {
                //console.log(reader);
                var url = box.url = this.result;
                setImageUrl(url);
            };
            reader.readAsDataURL(file);
        });

        /*
         * 表单验证
         * 可以使用h5的require重写 需要包裹在form里面
         * 监听submit事件
         * */
        $(".btn-start").click(function () {
            var flag = true;
            var diff = $('#input-diff').val();
            var name = $('#input-name').val();
            //check vaild

            if (!diff || !name) {
                alert("有空字段未填写");
                flag = false;
            } else if (!$('#pic').attr('src')) {
                alert("未上传图片");
                flag = false;
            }

            if (flag) {
                box.diff = diff;
                box.name = name;
                start();
            }
        });
    }

    function start(){
        //初始化游戏
        //if(!localStorage.html){
        //    initPuzzle(box.name, box.diff);
        //}
        initPuzzle(box.name, box.diff);

        $('.model-container').fadeOut(500);
        $('.wrap').removeClass("black-wrap");
        $('.main-container').fadeIn(500);
        //绑定事件
        bindEvent();
        //计时
        clock();
        alert('开始游戏');
    }


    function setImageUrl(url) {
        //update preview pic src
        $('#pic')[0].src = url;
    }

    //初始化游戏
    function initPuzzle(name, diff) {
        //初始化玩家
        $(".userinfo .username").eq(0).text(name);
        //初始化拼图
        var str = '', str2 = '';
        var map = $('.zone-puzzle');
        var match = $('.zone-match');
        var arrPos = [];
        var step = Math.sqrt(diff);
        for (var i = 0; i < diff; i++) {
            str  += "<div class='part'  id='pid" + i + "'></div>";
            str2 += "<div class='match' id='mid" + i + "'></div>";
        }
        //console.log(str);
        for (i = 0; i < step; i++) {
            for (var j = 0; j < step; j++) {
                var arr = [i, j];
                arrPos.push(arr);
            }
        }
        map.append(str);
        match.append(str2).css('background-image', 'url(' + box.url + ')');
        //初始化拼图区
        $('.part').css({
            "width": 100 / step + '%',
            "height": 100 / step + '%',
            "background": "url(" + box.url + ")"
        }).each(function (index, elem) {
            var randomDeg = Math.floor(Math.random() * 4) * 90;
            var w = $(this).parent().width() / step;
            $(elem).css({
                //转化成百分比
                "background-position": arrPos[index][0] * 100 + "% " + arrPos[index][1] * 100 + "%",
                //任意角度
                "transform": 'rotate(' + randomDeg + 'deg)',
                //偏移量
                "left": arrPos[index][0] * w + 'px',
                "top": arrPos[index][1] * w + 'px'
            }).attr({
                "deg": randomDeg,
                "rot": randomDeg
            })
        });

        //初始化匹配区域
        $(".match").css({
            "width": 100 / step + '%',
            "height": 100 / step + '%'
        }).each(function (index, elem) {
            var w = $(this).parent().width() / step;
            $(elem).css({
                //转化成百分比
                "background-position": arrPos[index][0] * 100 + "% " + arrPos[index][1] * 100 + "%",
                //偏移量
                "left": arrPos[index][0] * w + 'px',
                "top": arrPos[index][1] * w + 'px'
            })
        });

        //var sort = $(form).sort(function(){ return 0.5-Math.random() });
        //map.html(sort);

    }

    function bindEvent() {
        //绑定键盘事件
        $('.part').click(function (e) {
            var _this = this;
            var deg = $(this).attr('deg') * 1;
            $(this).toggleClass('selected')
                .css('transform', 'rotate(' + deg + 'deg)')
                .siblings()
                .removeClass("selected");

            $(document).keydown(function (e) {
                var piece = $(_this);
                if(piece.hasClass('selected')){
                    switch (e.keyCode) {
                        //左键
                        case 37:
                            deg += -90;
                            break;
                        //右键
                        case 39:
                            deg += 90;
                            break;
                    }
                    piece.css('transform', 'rotate(' + deg + 'deg)').attr('deg', deg);
                }
            });
        });

        //map绑定拖拽事件
        $('.zone-puzzle').find('div').draggable({
            snap: '.zone-match',
            revert: "invalid",
            //相当于点击事件
            start: function () {
            },
            stop: function (event, elem) {
                var rot = $(this).attr('rot');
                //alert("trigger:"+ elem.helper.parent().hasClass('zone-match') );
                //如果放置不成功 恢复原样
                if (!elem.helper.parent().hasClass('match')) {
                    $(this).css('transform', 'rotate(' + rot + 'deg)').attr('deg', rot).removeClass('.selected');
                }
            }
        });

        //match绑定放置事件
        $('.zone-match').find('.match').droppable({
            accept: function () {
                var act = $('.selected');
                if (act.attr('deg') % 360 == 0 && $(this).attr('id').charAt(3) == act.attr('id').charAt(3)) {
                    return true;
                }
            },
            drop: function (event, elem) {
                elem.draggable.removeClass('selected').css('transform','').unbind('click').draggable('disable');
                $(this).append(elem.draggable.fadeIn(300));
                over();
            }
        })
    }

    //判断是否满足结束条件
    function over() {
        if ($(".zone-match .part").length == $(".match").length) {

            //向后台传送游戏数据
            //sendScore();
            $('.model-end-container').delay(500).show(500);
            //停止计时
            clear();

            alert("success");
        }
    }

    //计时模块 每秒更新缓存的状态
    function clock(){
        countingTime();
        time = setInterval(countingTime,1000);
        function countingTime(){
            var t = calc();
            console.log(t.m+':'+t.s);
            $('.timer').html(t.m+':'+t.s);
            //alert("counting time");
            //var html = $('.zone-wrap').clone();
            //localStorage.html = html.html();
        }
    }

    //返回事件
    function calc(){
        var t = 0;
        if(localStorage.time){
            t = localStorage.time*1;
        }
        var date = new Date(t+=1000);
        localStorage.time = t;
        return {m:format(Math.floor(t/1000/60)),s:format(date.getSeconds())};
    }

    //格式化函数
    function format(v){
        if(v < 10){ v = '0'+v; }
        return v;
    }

    //使用本地缓存
    function useLocal(){
        box.name = localStorage.name;
        box.diff = localStorage.diff;
        box.url = localStorage.url;
        $('.zone-wrap').html(localStorage.html);
        $('.zone-match').css('background','url('+box.url+')');
        start();
    }

    //停止计时
    function clear(){
        alert(time);
        clearInterval(time);
        localStorage.clear();
        if(tab){ localStorage.table = tab; }
    }
});

