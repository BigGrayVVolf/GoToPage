JSB.newAddon = function(mainPath) {
    const KEY = 'GoToPage.Offsets';

    let pageNoOffsets = {};
    let currentDocmd5;

    //MARK - Addon Class definition
    var newAddonClass= JSB.defineClass('GoToPage : JSExtension', {
        //Mark: - Instance Method Definitions
        // Window initialize
        sceneWillConnect: function() {
            if (NSUserDefaults.standardUserDefaults().objectForKey(KEY)) {
                pageNoOffsets = NSUserDefaults.standardUserDefaults().objectForKey(KEY);
            }
            self.checked = false
            // JSB.log('🌈🌈🌈 MNLOG pageNoOffsets keys: %@', Object.keys(pageNoOffsets).toString());
        },
        // Window disconnect
        sceneDidDisconnect: function() {
        },
        // Window resign active
        sceneWillResignActive: function() {
        },
        // Window become active
        sceneDidBecomeActive: function() {
        },
        //MARK: MN behaviors
        notebookWillOpen: function(notebookid) {
        },
        notebookWillClose: function(notebookid) {
        },
        documentDidOpen: function(docmd5) {
            currentDocmd5 = docmd5
        },
        docmentWillClose: function(docmd5) {
            currentDocmd5 = ''
        },
        controllerWillLayoutSubviews: function(controller) {
        },
        queryAddonCommandStatus: function() {
            return {
                image: 'GoToPage.png',
                object: self,
                selector: "toggleGoToPage:",
                checked: self.checked 
            };
        },
        // Add-On Switch
        toggleGoToPage: function(sender) {
            JSB.log('🌈🌈🌈 MNLOG toggleGoToPage');
            let app = Application.sharedInstance();

            self.checked = true;
            app.studyController(self.window).refreshAddonCommands();
            
            if (app.queryCommandWithKeyFlagsInWindow("p", 0x100000, self.window).disabled) { return }

            var title = "Page Offset nil!"
            if (pageNoOffsets[currentDocmd5]) {
                title = 'Page Offset: ' + pageNoOffsets[currentDocmd5];
            }
            JSB.log('🌈🌈🌈 MNLOG title: %@', title);  
            let message = 'Ex: Set Offset(2) and Page(10): "2@10"\nSet Page(10): "10"\nSet Offset(2): "2@"'
            UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(title, message, 2, "Go", [], function(alert) {
                JSB.log('🌈🌈🌈 MNLOG tapBlock: arg1: %@', alert);
                let text = alert.textFieldAtIndex(0).text;
                JSB.log('🌈🌈🌈 MNLOG settingAlert text: %@', text);
                let texts = text.split('@');
        
                var realPageNo;
                if (texts.length == 2) {
                    if (!isNaN(parseInt(texts[0]))) {
                        pageNoOffsets[currentDocmd5] = parseInt(texts[0]);
                        JSB.log('🌈🌈🌈 MNLOG pageNoOffsets keys: %@', Object.keys(pageNoOffsets).toString());
                        NSUserDefaults.standardUserDefaults().setObjectForKey(pageNoOffsets, KEY);
                    }
                    if (!isNaN(parseInt(texts[1]))) {
                        realPageNo = parseInt(texts[1]);
                    }
                } else if (texts.length == 1) {
                    if (!isNaN(parseInt(texts[0]))) {
                        realPageNo = parseInt(texts[0]);
                    }
                }
        
                let fsbc = app.studyController(self.window);
                if (!isNaN(realPageNo)) {
                    let gotoAlert = UIAlertView.makeWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles("Go To Page", "", fsbc, "Real Go", []);
                    gotoAlert.alertViewStyle = 2;
                    gotoAlert.show();
                    let tf = gotoAlert.textFieldAtIndex(0);
                    let offset = !isNaN(pageNoOffsets[currentDocmd5]) ? pageNoOffsets[currentDocmd5] : 0;
                    tf.text = (realPageNo + offset).toString();

                    timeoutCount = 20;
                    NSTimer.scheduledTimerWithTimeInterval(0.5, true, function(timer) {
                        timeoutCount -= 1;
                        if (app.osType === 2 || app.focusWindow.subviews.length === 1 || timeoutCount <= 0) {
                            self.checked = false;
                            fsbc.refreshAddonCommands();
                            timer.invalidate();
                            JSB.log('🌈🌈🌈 MNLOG timer invalidate, timeoutCount: %@', timeoutCount);
                            return
                        }
                    });
                } else {
                    self.checked = false;
                    fsbc.refreshAddonCommands();
                }
            });
        },
    }, /*Class members*/ {
        //MARK: - Class Method Definitions
        addonDidConnect: function() {
        },
        addonWillDisconnect: function() {
        },
        applicationWillEnterForeground: function() {
        },
        applicationDidEnterBackground: function() {
        },
        applicationDidReceiveLocalNotification: function(notify) {
        },
    });
    return newAddonClass;
};
