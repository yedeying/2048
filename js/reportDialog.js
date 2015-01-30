/*
 * reportDialog可以展示四种类型, 其中三种分别对应原生弹框函数alert, confirm, prompt, 第四种为自定义弹框model
 * 本弹框position为fixed, 故高度过大的model不可以使用本弹框
 * @author: yedeying
 * @notice: 本组件包括reportDialog.js reportDialog.css 及 三个png文件, png文件请放在与css文件夹同目录的images里
 */
!function(window) {
    var dialog = null;
    // 设置reportDialog.css的路径
    var linkUrl = './css/reportDialog.css';
    function init(userConfig) {
        // 提供短参数形式调用
        // 调用方式：window.showDialog(type, title, text, confirmHandle || cancelHandle, infoType)
        // 当且仅当type = alert时第四个参数被视为calcelHandle
        if(typeof userConfig !== 'object') {
            // 用type暂存第一个参数
            var type = userConfig;
            var handle = type === 'alert' ? 'cancelHandle' : 'confirmHandle';
            userConfig = {};
            typeof type === 'string' && (userConfig.type = type);
            typeof arguments[1] === 'string' && (userConfig.title = arguments[1]);
            typeof arguments[2] === 'string' && (userConfig.text = arguments[2]);
            typeof arguments[3] === 'function' && (userConfig[handle] = arguments[3]);
            typeof arguments[4] === 'number' && (userConfig.infoType = arguments[4]);
        }
        var config = {
            type: 'alert', // type为此列表中一项 ['alert', 'confirm', 'prompt', 'model']
            title: '', // 显示在对话框的标题
            text: '', // 展示在对话框里的内容或输入框的提示
            confirmText: '确定', // 确定按钮的文字
            cancelText: '取消', // 取消按钮的文字
            /**
             * 当用户执行有效操作时被调用, 以下为具体说明
             * 当type = alert 回调无效
             * 当type = confirm 回调在以任何手段关闭对话框时调用, 返回参数true(当点击确定) or false(其它)
             * 当type = prompt 回调在点击确定时被调用, 参数为里面填写的文字
             * 当type = model 回调在点击确定时被调用, 无参数
             */
            confirmHandle: null,
            /**
             * 当用户取消操作时被调用, 以下为具体说明
             * 当type = alert 在任意方法取消弹框后调用, 无参数
             * 当type = confirm 回调无效
             * 当type = prompt 回调在点击取消或关闭时被调用, 无参数
             * 当type = model 回调在点击取消或关闭时被调用, 无参数
             */
            cancelHandle: null,
            fontSize: 18, // 字体大小
            modelBody: '', // 当type = model时, 将以此内容作为model体的html
            infoType: 2, // 当type = alert || confirm时, 此属性为0时为文字添加成功图标, 此属性为1时为文字添加提示图标, 2时无图标
            width: 400, // 弹框的宽度
            top: 200 // 离顶部距离
        };
        // 合并选项
        for(var opt in userConfig) {
            config[opt] = userConfig[opt];
        }
        // 不在选项内的选项默认化
        if(config.type !== 'confirm' && config.type !== 'prompt' && config.type !== 'model') config.type = 'alert';
        if(config.type !== 'model') config.modelBody = '';
        if(config.type !== 'alert' && config.type !== 'confirm') config.infoType = '';
        if(config.infoType !== 0 && config.infoType !== 1) config.infoType = 2;
        config.infoType = ['success', 'info', ''][config.infoType];
        clearLayout();
        generateLayout(config);
        bindEvents(config);
    }

    // 清除已存在的框
    function clearLayout() {
        var covers = document.querySelectorAll('.dialog-cover');
        if(covers.length !== 0) {
            for(var i = 0, len = covers.length; i < len; i++) {
                var cover = covers[i];
                cover.remove();
                cover = null;
            }
        }
    }

    // 生成对话框
    function generateLayout(config) {
        dialog = document.createElement('div');
        dialog.classList.add('dialog-cover');
        // html模板
        var htmlArr = [
            '<div class="dialog dialog_type_{type}">',
                '<div class="dialog_header">',
                    '<span class="dialog_title">{title}</span>',
                    '<span class="dialog_close"></span>',
                '</div>',
                '<div class="dialog_cnt">',
                '</div>',
                '<div class="dialog_footer">',
                    '<button class="dialog_confirm">{confirmText}</button>',
                '</div>',
            '</div>'
        ];
        // 根据类型添加不同的html
        if(config.type === 'alert') {
            htmlArr.splice(6, 0, '<div class="dialog_info {infoType}">{text}</div>');
        } else if(config.type === 'confirm') {
            htmlArr.splice(9, 0, '<button class="dialog_cancel">{cancelText}</button>');
            htmlArr.splice(6, 0, '<div class="dialog_info {infoType}">{text}</div>');
        } else if(config.type === 'prompt') {
            htmlArr.splice(9, 0, '<button class="dialog_cancel">{cancelText}</button>');
            htmlArr.splice(6, 0, '<textarea class="dialog_text" id="reason"></textarea>');
            htmlArr.splice(6, 0, '<div class="dialog_info">{text}</div>');
        } else if(config.type === 'model') {
            htmlArr.splice(9, 0, '<button class="dialog_cancel">{cancelText}</button>');
            htmlArr.splice(6, 0, '<div class="dialog_info {infoType}">{modelBody}</div>');
        }
        var template = htmlArr.join('');
        ['title' ,'text', 'type' ,'confirmText' ,'cancelText' ,'infoType', 'modelBody'].forEach(function(cfg) {
            template = template.replace('{' + cfg + '}', config[cfg]);
        });
        dialog.innerHTML = template;
        document.body.appendChild(dialog);
        if(config.text.length > 6 && (config.type === 'alert' || config.type === 'confirm')) {
            dialog.querySelector('.dialog_info').style.fontSize = '16px';
        }
    }

    // 绑定事件
    function bindEvents(config) {
        // 在dialog下查寻元素
        function $(selector) {
            return dialog.querySelector(selector);
        }
        // 绑定事件函数
        function _click(ele, handle) {
            if(!ele) return;
            if(window.addEventListener) {
                ele.addEventListener('click', handle, false);
            } else if(window.attachEvent) {
                ele.attachEvent('onclick', handle);
            }
        }
        // 确定行为
        function _confirm(param) {
            var fun = config.confirmHandle;
            typeof fun === 'function' && fun.call(window, param);
        }
        // 取消行为
        function _cancel(param) {
            var fun = config.cancelHandle;
            typeof fun === 'function' && fun.call(window, param);
        }
        // 关闭弹框, 并分析用户行为
        function _remove(e) {
            var type = config.type;
            var check = e.target.classList.contains('dialog_confirm');
            type === 'alert' && _cancel();
            type === 'confirm' && _confirm(!!check);
            type === 'prompt' && check && _confirm($('.dialog_text').value);
            type === 'prompt' && !check && _cancel();
            type === 'model' && check && _confirm();
            type === 'model' && !check && _cancel();
            dialog.remove();
        }
        // 取消冒泡
        function _stopBubble(e) {
            e.stopPropagation && e.stopPropagation() || (window.event.cancelBubble = false);
        }

        var model = $('.dialog');
        var close = $('.dialog_close');
        var cancel = $('.dialog_cancel');
        var confirm = $('.dialog_confirm');
        _click(dialog, _remove);
        _click(close, _remove);
        _click(cancel, _remove);
        _click(confirm, _remove);
        _click(model, _stopBubble);
    }

    // 添加样式及生成HTML
    document.querySelector('head').innerHTML += '<link rel="stylesheet" href="' + linkUrl + '">';
    // 添加外部接口
    window.showDialog = init;
}(window);