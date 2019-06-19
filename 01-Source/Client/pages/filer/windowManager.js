/**
 * ダイアログとして動作するウィンドウを管理します。
 */
function WindowManager() {
    this.convertWindow = null;  // 変換ダイアログ
}


WindowManager._instance = null;

Object.defineProperty(WindowManager, 'instance', {
    enumerable: true,
    configurable: true,
    get: function(){
        if (WindowManager._instance === null) WindowManager._instance = new WindowManager();
        return WindowManager._instance;
    },
});


WindowManager.openStableDialog = function(url, name, width, height) {
    var browser = window.navigator;
    var top = window.screenY + window.outerWidth / 4;
    var left = window.screenX + window.outerHeight / 1.5;
    if (browser.userAgent.indexOf('Trident') < 0) {
        return window.open(url, name, 'innerWidth=' + width + ',innerHeight=' + height + ',top=' + top + ',left=' + left + ',menubar=no,location=no,status=no,scrollbars=no,directories=no,dialog=yes');
    } else {
        width += 8;
        height += 30;
        return window.open(url, name, 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',menubar=no,location=no,status=no,scrollbars=no,directories=no,dialog=yes');
    }
}

WindowManager.openDialog = function(url, name, width, height) {
    return window.open(url, name, 'innerWidth=' + width + ',innerHeight=' + height + ',menubar=no,location=no,dependent=yes,status=no,scrollbars=no');
}

/**
 * 変換ダイアログを表示します。
 */
WindowManager.prototype.openConvertWindow = function(docId) {
    if ((this.convertWindow === null) || (this.convertWindow.closed)) {
        this.convertWindow = WindowManager.openDialog('./dialog/convert/?doc_id=' + docId, 'CONVERT_DIALOG', 900, 600);
    };

    this.convertWindow.focus();
};

/**
 *
 */
WindowManager.prototype.closeConvertWindow = function() {
    if (this.convertWindow !== null) this.convertWindow.close();
};
