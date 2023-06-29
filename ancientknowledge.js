var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this.zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this.zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this.zoomLevels[this.zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this.zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this.zoomLevels[this.zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this.zoomLevels[0]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var BgaHelpButton = /** @class */ (function () {
    function BgaHelpButton() {
    }
    return BgaHelpButton;
}());
var BgaHelpPopinButton = /** @class */ (function (_super) {
    __extends(BgaHelpPopinButton, _super);
    function BgaHelpPopinButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpPopinButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var button = document.createElement('button');
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_popin-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "?";
        if (this.settings.buttonBackground) {
            button.style.setProperty('--background', this.settings.buttonBackground);
        }
        if (this.settings.buttonColor) {
            button.style.setProperty('--color', this.settings.buttonColor);
        }
        toElement.appendChild(button);
        button.addEventListener('click', function () { return _this.showHelp(); });
    };
    BgaHelpPopinButton.prototype.showHelp = function () {
        var _a, _b, _c;
        var popinDialog = new window.ebg.popindialog();
        popinDialog.create('bgaHelpDialog');
        popinDialog.setTitle(this.settings.title);
        popinDialog.setContent("<div id=\"help-dialog-content\">".concat((_a = this.settings.html) !== null && _a !== void 0 ? _a : '', "</div>"));
        (_c = (_b = this.settings).onPopinCreated) === null || _c === void 0 ? void 0 : _c.call(_b, document.getElementById('help-dialog-content'));
        popinDialog.show();
    };
    return BgaHelpPopinButton;
}(BgaHelpButton));
var BgaHelpExpandableButton = /** @class */ (function (_super) {
    __extends(BgaHelpExpandableButton, _super);
    function BgaHelpExpandableButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpExpandableButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var folded = (_b = this.settings.defaultFolded) !== null && _b !== void 0 ? _b : true;
        if (this.settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(this.settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        var button = document.createElement('button');
        button.dataset.folded = folded.toString();
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_expandable-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "\n            <div class=\"bga-help_folded-content ".concat(((_c = this.settings.foldedContentExtraClasses) !== null && _c !== void 0 ? _c : '').split(/\s+/g), "\">").concat((_d = this.settings.foldedHtml) !== null && _d !== void 0 ? _d : '', "</div>\n            <div class=\"bga-help_unfolded-content  ").concat(((_e = this.settings.unfoldedContentExtraClasses) !== null && _e !== void 0 ? _e : '').split(/\s+/g), "\">").concat((_f = this.settings.unfoldedHtml) !== null && _f !== void 0 ? _f : '', "</div>\n        ");
        button.style.setProperty('--expanded-width', (_g = this.settings.expandedWidth) !== null && _g !== void 0 ? _g : 'auto');
        button.style.setProperty('--expanded-height', (_h = this.settings.expandedHeight) !== null && _h !== void 0 ? _h : 'auto');
        button.style.setProperty('--expanded-radius', (_j = this.settings.expandedRadius) !== null && _j !== void 0 ? _j : '10px');
        toElement.appendChild(button);
        button.addEventListener('click', function () {
            button.dataset.folded = button.dataset.folded == 'true' ? 'false' : 'true';
            if (_this.settings.localStorageFoldedKey) {
                localStorage.setItem(_this.settings.localStorageFoldedKey, button.dataset.folded);
            }
        });
    };
    return BgaHelpExpandableButton;
}(BgaHelpButton));
var HelpManager = /** @class */ (function () {
    function HelpManager(game, settings) {
        this.game = game;
        if (!(settings === null || settings === void 0 ? void 0 : settings.buttons)) {
            throw new Error('HelpManager need a `buttons` list in the settings.');
        }
        var leftSide = document.getElementById('left-side');
        var buttons = document.createElement('div');
        buttons.id = "bga-help_buttons";
        leftSide.appendChild(buttons);
        settings.buttons.forEach(function (button) { return button.add(buttons); });
    }
    return HelpManager;
}());
/**
 * Jump to entry.
 */
var JumpToEntry = /** @class */ (function () {
    function JumpToEntry(
    /**
     * Label shown on the entry. For players, it's player name.
     */
    label, 
    /**
     * HTML Element id, to scroll into view when clicked.
     */
    targetId, 
    /**
     * Any element that is useful to customize the link.
     * Basic ones are 'color' and 'colorback'.
     */
    data) {
        if (data === void 0) { data = {}; }
        this.label = label;
        this.targetId = targetId;
        this.data = data;
    }
    return JumpToEntry;
}());
var JumpToManager = /** @class */ (function () {
    function JumpToManager(game, settings) {
        var _a, _b, _c;
        this.game = game;
        this.settings = settings;
        var entries = __spreadArray(__spreadArray([], ((_a = settings === null || settings === void 0 ? void 0 : settings.topEntries) !== null && _a !== void 0 ? _a : []), true), ((_b = settings === null || settings === void 0 ? void 0 : settings.playersEntries) !== null && _b !== void 0 ? _b : this.createEntries(Object.values(game.gamedatas.players))), true);
        this.createPlayerJumps(entries);
        var folded = (_c = settings === null || settings === void 0 ? void 0 : settings.defaultFolded) !== null && _c !== void 0 ? _c : false;
        if (settings === null || settings === void 0 ? void 0 : settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        document.getElementById('bga-jump-to_controls').classList.toggle('folded', folded);
    }
    JumpToManager.prototype.createPlayerJumps = function (entries) {
        var _this = this;
        var _a, _b, _c, _d;
        document.getElementById("game_play_area_wrap").insertAdjacentHTML('afterend', "\n        <div id=\"bga-jump-to_controls\">        \n            <div id=\"bga-jump-to_toggle\" class=\"bga-jump-to_link ".concat((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', " toggle\" style=\"--color: ").concat((_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.toggleColor) !== null && _d !== void 0 ? _d : 'black', "\">\n                \u21D4\n            </div>\n        </div>"));
        document.getElementById("bga-jump-to_toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        entries.forEach(function (entry) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var html = "<div id=\"bga-jump-to_".concat(entry.targetId, "\" class=\"bga-jump-to_link ").concat((_b = (_a = _this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', "\">");
            if ((_d = (_c = _this.settings) === null || _c === void 0 ? void 0 : _c.showEye) !== null && _d !== void 0 ? _d : true) {
                html += "<div class=\"eye\"></div>";
            }
            if (((_f = (_e = _this.settings) === null || _e === void 0 ? void 0 : _e.showAvatar) !== null && _f !== void 0 ? _f : true) && ((_g = entry.data) === null || _g === void 0 ? void 0 : _g.id)) {
                var cssUrl = (_h = entry.data) === null || _h === void 0 ? void 0 : _h.avatarUrl;
                if (!cssUrl) {
                    var img = document.getElementById("avatar_".concat(entry.data.id));
                    var url = img === null || img === void 0 ? void 0 : img.src;
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    if (url) {
                        cssUrl = "url('".concat(url, "')");
                    }
                }
                if (cssUrl) {
                    html += "<div class=\"bga-jump-to_avatar\" style=\"--avatar-url: ".concat(cssUrl, ";\"></div>");
                }
            }
            html += "\n                <span class=\"bga-jump-to_label\">".concat(entry.label, "</span>\n            </div>");
            //
            document.getElementById("bga-jump-to_controls").insertAdjacentHTML('beforeend', html);
            var entryDiv = document.getElementById("bga-jump-to_".concat(entry.targetId));
            Object.getOwnPropertyNames((_j = entry.data) !== null && _j !== void 0 ? _j : []).forEach(function (key) {
                entryDiv.dataset[key] = entry.data[key];
                entryDiv.style.setProperty("--".concat(key), entry.data[key]);
            });
            entryDiv.addEventListener('click', function () { return _this.jumpTo(entry.targetId); });
        });
        var jumpDiv = document.getElementById("bga-jump-to_controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    JumpToManager.prototype.jumpToggle = function () {
        var _a;
        var jumpControls = document.getElementById('bga-jump-to_controls');
        jumpControls.classList.toggle('folded');
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.localStorageFoldedKey) {
            localStorage.setItem(this.settings.localStorageFoldedKey, jumpControls.classList.contains('folded').toString());
        }
    };
    JumpToManager.prototype.jumpTo = function (targetId) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    JumpToManager.prototype.getOrderedPlayers = function (unorderedPlayers) {
        var _this = this;
        var players = unorderedPlayers.sort(function (a, b) { return Number(a.playerNo) - Number(b.playerNo); });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.game.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    JumpToManager.prototype.createEntries = function (players) {
        var orderedPlayers = this.getOrderedPlayers(players);
        return orderedPlayers.map(function (player) { return new JumpToEntry(player.name, "player-table-".concat(player.id), {
            'color': '#' + player.color,
            'colorback': player.color_back ? '#' + player.color_back : null,
            'id': player.id,
        }); });
    };
    return JumpToManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg) scale(").concat((_d = settings.scale) !== null && _d !== void 0 ? _d : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_d = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _d !== void 0 ? _d : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_e = (_d = this.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : 500, scale: (_g = (_f = this.zoomManager) === null || _f === void 0 ? void 0 : _f.zoom) !== null && _g !== void 0 ? _g : undefined });
                        _m = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _m.result = _o.sent();
                        (_j = (_h = animation.settings).animationEnd) === null || _j === void 0 ? void 0 : _j.call(_h, animation);
                        (_k = settings.element) === null || _k === void 0 ? void 0 : _k.classList.remove((_l = settings.animationClass) !== null && _l !== void 0 ? _l : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (animatedCardsMax, fakeCardSetter) {
        if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    return Deck;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function (result) {
                _this.removeCard(card);
                return result;
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--shift', (_a = settings.shift) !== null && _a !== void 0 ? _a : '3px');
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
    };
    return AllVisibleDeck;
}(CardStock));
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
var CARDS_DATA = { "C1_Osirion": { "number": 1, "name": "Osirion", "text": ["Built for King Seti I of the 19th Dynasty, Abydos is the holy city of the god Osiris."], "country": "Egypt", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have 3 <ANCIENT> or 4 <ANCIENT>, gain 4 <VP>.", "or, if you have 5 <ANCIENT> or more, gain 7 <VP>."], "implemented": true }, "C2_AbuGorab": { "number": 2, "name": "Abu Gorab", "text": ["Located 15 km south of Cairo, it houses the solar temple of King Nyuserre Ini."], "country": "Egypt", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have 3 <SECRET> or 4 <SECRET>, gain 4 <VP>.", "or, if you have 5 <SECRET> or more, gain 7 <VP>."], "implemented": true }, "C3_GobekliTepe": { "number": 3, "name": "G\u00f6bekli Tepe", "text": ["Built around 10,000 BC, this temple challenged our historical chronology."], "country": "T\u00fcrkiye", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 4, "victoryPoint": 0, "discard": 2, "locked": false, "activation": "endgame", "effect": ["Choose 1 type of monument (<CITY>, <MEGALITH> ou <PYRAMID> ). Gain 1 <VP> for each monument of this type in your Past."], "implemented": true }, "C4_Byblos": { "number": 4, "name": "Byblos", "text": ["The Greeks named it so because papyrus was imported into Greece from Gebal."], "country": "Liban", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 1, "discard": 2, "locked": false, "activation": "endgame", "effect": ["Gain 2 <VP> for each set of 3 different types of monuments (<CITY>, <MEGALITH> and <PYRAMID>) in your Past."], "implemented": true }, "C5_ElloraCaves": { "number": 5, "name": "Ellora Caves", "text": ["400 million kg of stone were dug out of the mountain. It is twice the size of the Parthenon in Athens."], "country": "India", "startingHand": 1, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 0, "discard": 2, "locked": false, "activation": "endgame", "effect": ["Gain 1 <VP> for each <CITY> in your Past."], "implemented": true }, "C6_Ollantaytambo": { "number": 6, "name": "Ollantaytambo", "text": ["At this former Inca fortress, there is the famous wall of 6 monoliths made of red porphyry, each more than 3 m high."], "country": "Peru", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card."], "implemented": true }, "C7_LuxorTemple": { "number": 7, "name": "Luxor Temple", "text": ["This Egyptian temple dedicated to the worship of Amun is one of the best preserved buildings from the New Kingdom."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 10, "victoryPoint": 7, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If this monument is adjacent to at least 2 <PYRAMID>, discard 3 <KNOWLEDGE> from this monument."], "implemented": true }, "C8_Mohenjodaro": { "number": 8, "name": "Mohenjo-daro", "text": ["The remains of one of the largest cities of the Indian Bronze Age are found here."], "country": "Pakistan", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 9, "victoryPoint": 5, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If this monument is adjacent to at least 2 monuments of the same type (2 <CITY>, 2 <MEGALITH> or 2 <PYRAMID>), discard 2 <KNOWLEDGE> from this monument."], "implemented": true }, "C9_Petra": { "number": 9, "name": "Petra", "text": ["Its monumental facades were carved directly into the rock, but its construction date is still debated."], "country": "Jordan", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have 2 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, draw 1 card."], "implemented": true }, "C10_Parthenon": { "number": 10, "name": "Parthenon", "text": ["Made entirely of Pentelic marble, the Parthenon is a temple dedicated to the goddess Athena."], "country": "Greece", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have at least 11 <KNOWLEDGE> in your Timeline, discard up to 2 <KNOWLEDGE> from one or several of your monuments."], "implemented": true }, "C11_Warangal": { "number": 11, "name": "Warangal", "text": ["This city has many Hindu temple, including the famous temple of a thousand pillars."], "country": "India", "startingHand": 3, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Each time you LEARN 1 <SECRET> :", "\u2022 discard 1 <KNOWLEDGE> from any of your monuments;", "\u2022 and draw 1 card."], "implemented": false }, "C12_Timbuktu": { "number": 12, "name": "Timbuktu", "text": ["Nicknamed \"The City of 333 Saints\" or \"The Pearl of the Desert.\""], "country": "Mali", "startingHand": 0, "startingSpace": 1, "initialKnowledge": 2, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Discard 1 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "C13_LopburiTemple": { "number": 13, "name": "Lopburi Temple", "text": ["This temple has three towers connected to each other by a corridor, on a north-south axis."], "country": "Thailand", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Swap this monument with another monument of your Timeline."], "implemented": false }, "C14_Bagan": { "number": 14, "name": "Bagan", "text": ["There are 2834 monuments found on this 50 square km site, many of which are in ruins."], "country": "Myanmar", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Swap this monument with another monument of your Timeline."], "implemented": false }, "C15_AjantaCaves": { "number": 15, "name": "Ajanta Caves", "text": ["Carved into the steep face of the ravine, the structures range from ten to forty meters in height."], "country": "India", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Move another monument to an available space in your Timeline."], "implemented": false }, "C16_Heracleion": { "number": 16, "name": "Heracleion", "text": ["It was discovered in 20001, submerged in the bay of Aboukir, during underwater archaeological excavations."], "country": "Egypt", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 2, "discard": 2, "locked": false, "activation": "decline", "effect": ["Draw 4 cards."], "implemented": true }, "C17_Jericho": { "number": 17, "name": "Jericho", "text": ["It is sometimes considered one of the oldest cities in the world."], "country": "Palestine", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "decline", "effect": ["Draw 6 cards."], "implemented": true }, "C18_AngkorWat": { "number": 18, "name": "Angkor Wat", "text": ["Angkor is the largest temple and largest religious monument in the world."], "country": "Cambodia", "startingHand": 0, "startingSpace": 6, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "anytime", "effect": ["If you have at least 1 <CITY> in your Past, your other <CITY> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "C19_Derinkuyu": { "number": 19, "name": "Derinkuyu", "text": ["This 13-story underground city could accommodate up to 20,000 people."], "country": "T\u00fcrkiye", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Discard 4 <KNOWLEDGE> from any of your <CITY> with at least 6 <KNOWLEDGE>."], "implemented": true }, "C20_Tiwanaku": { "number": 20, "name": "Tiwanaku", "text": ["Its two most famous monuments are the seven-step pyramid of Akapana and the famous Gate of the Sun."], "country": "Bolivia", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from each of the other <CITY> in your Timeline."], "implemented": true }, "C21_Mycenae": { "number": 21, "name": "Mycenae", "text": ["Mycenae is said to have been founded by Perseus after the accidental homicide of Acrisios, king of Argos."], "country": "Greece", "startingHand": 0, "startingSpace": 6, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "decline", "effect": ["Discard a total of 7 <KNOWLEDGE> or less from one or several of your other monuments."], "implemented": true }, "C22_Baalbek": { "number": 22, "name": "Baalbek", "text": ["The temple of Bacchus, one of the best preserved temples of the Greco-Roman world, is located here."], "country": "Lebanon", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 6, "victoryPoint": 4, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 3 <CITY> in your Past, this monument enters play with 5 <KNOWLEDGE> less."], "implemented": true }, "C23_Sacsayhuaman": { "number": 23, "name": "Sacsayhuam\u00c1n", "text": ["This fortress is shaped like a puma's head, a sacred animal in Inca tradition."], "country": "Peru", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 8, "victoryPoint": 6, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 3 <CITY> in your Past, this monument enters play with 6 <KNOWLEDGE> less."], "implemented": true }, "C24_EasterIsland": { "number": 24, "name": "Easter Island", "text": ["The first inhabitants called it Rapa Nui, which means \"the navel of the world.\""], "country": "Chile", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Your other <CITY> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "C25_Llaqtapata": { "number": 25, "name": "Llaqtapata", "text": ["This was a rest stop on the Inca Trail."], "country": "Peru", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 6, "victoryPoint": 6, "discard": 0, "locked": false, "activation": "decline", "effect": ["If this monument has at least 1 <KNOWLEDGE>, discard this card immediately."], "implemented": true }, "C26_MachuPicchu": { "number": 26, "name": "Machu Picchu", "text": ["Its name comes from Quechua (machu: old and pikchu: mountain, summit)."], "country": "Peru", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 7, "victoryPoint": 7, "discard": 0, "locked": false, "activation": "decline", "effect": ["If this monument has at least 1 <KNOWLEDGE>, discard this card immediately."], "implemented": true }, "C27_KarnakTemple": { "number": 27, "name": "Karnak Temple", "text": ["Constructed over 2,000 years by successive pharaohs, it extends more than two square km, and is made up of three enclosures."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 8, "victoryPoint": 8, "discard": 0, "locked": false, "activation": "decline", "effect": ["If this monument has at least 1 <KNOWLEDGE>, discard this card immediately."], "implemented": true }, "C28_Babylon": { "number": 28, "name": "Babylon", "text": ["It was undoubtedly the first city to have over 200,000 inhabitants."], "country": "Iraq", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 9, "victoryPoint": 10, "discard": 0, "locked": false, "activation": "decline", "effect": ["If this monument has at least 1 <KNOWLEDGE>, discard this card immediately."], "implemented": true }, "C29_Atlantis": { "number": 29, "name": "Atlantis", "text": ["The story of Atlantis originates from two of Athenian philospher Plato's Dialogues. Its existence has never been proven."], "country": "Unknown", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 10, "victoryPoint": 12, "discard": 0, "locked": false, "activation": "decline", "effect": ["If this monument has at least 1 <KNOWLEDGE>, discard this card immediately."], "implemented": true }, "C30_PotalaPalace": { "number": 30, "name": "Potala Palace", "text": ["It was the main residence of successive Dalai Lamas and housed the Tibetan government until the flight of the 14th Dalai Lama to India."], "country": "China", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 8, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Skip your DECLINE PHASE this turn."], "implemented": false }, "C31_Philae": { "number": 31, "name": "Philae", "text": ["This is one of the major shrines of the goddess Isis in Egypt."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 4 <CITY> in your Timeline, choose 2 <CITY> and discard 3 <KNOWLEDGE> from them."], "implemented": false }, "C32_Persepolis": { "number": 32, "name": "Persepolis", "text": ["This former capital of the Persian Achaemenid Empire was built in 521 BC."], "country": "Iran", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 3, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may take an ARCHIVE action."], "implemented": true }, "C33_Inwa": { "number": 33, "name": "Inwa", "text": ["It was formerly called Ava or Ratanapura: the City of Gems."], "country": "Myanmar", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 6, "victoryPoint": 4, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 3 <SECRET>,this monument enters play with 5 <KNOWLEDGE> less."], "implemented": true }, "C34_TempleOfKomOmbo": { "number": 34, "name": "Temple Of Kom Ombo", "text": ["This temple was dedicated to worshipping two deities venerated on equal footing: Horus, the hawk-headed god and Sobek, the crocodile god."], "country": "Egypt", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Your <PYRAMID> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "C35_Tulum": { "number": 35, "name": "Tulum", "text": ["As a trader fort, it seems to have been a major Mayan site dedicated to worshipping the Diving god."], "country": "Mexico", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 6, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 card from your hand."], "implemented": true }, "C36_Cyrene": { "number": 36, "name": "Cyrene", "text": ["Cyrene was founded by Greeks from Thera following the advice of the Oracle of Delphi."], "country": "Libya", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 8, "victoryPoint": 7, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have at least 4 <CITY> in your Past, discard 2 <KNOWLEDGE> from this monument."], "implemented": true }, "M1_Stonehenge": { "number": 1, "name": "Stonehenge", "text": ["Astronomical calendar, observatory, or temple dedicated to worshipping the sun? Its function is still debated."], "country": "England", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["Gain 2 <VP> for each set of 3 different types of Technology (<ANCIENT>, <WRITING> and <SECRET>) you have."], "implemented": true }, "M2_MenhirDiMonteCorruTundu": { "number": 2, "name": "Menhir Di Monte Corru Tundu", "text": ["Located in Locmariaquer, this menhir was 18.5 m high when erected. Its mass is estimated at 280 tons."], "country": "Italy", "startingHand": 4, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have at least 15 <LOST_KNOWLEDGE> on your board, gain 9 <VP>."], "implemented": true }, "M3_AswanObelisk": { "number": 3, "name": "Aswan Obelisk", "text": ["Almost 42 meters long, it is cut on three sides. Its weight is estimated at around 1200 tons."], "country": "Egypt", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 2, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["Gain 1 <VP> for each <PYRAMID> in your past."], "implemented": true }, "M4_SulawesiMegaliths": { "number": 4, "name": "Sulawesi Megaliths", "text": ["Discovered in 1908 in the Bada Valley, the dating of these megaliths remains unknown."], "country": "Indonesia", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have at least 7 <MEGALITH> in your Past, gain 6 <VP>."], "implemented": true }, "M5_Moron": { "number": 5, "name": "M\u00d6r\u00d6n", "text": ["The stones of this megalithic site present strange indecipherable engravings."], "country": "Mongolie", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["\u2022 If you have 3 <ANCIENT> or 4 <ANCIENT>, gain 4 <VP>.\n\u2022 or, if you have 5 <ANCIENT> or more, gain 7 <VP>."], "implemented": true }, "M6_DolmenOfGanghwa": { "number": 6, "name": "Dolmen Of Ganghwa", "text": ["Korea contains about 40% of the world's dolmens. Most of them are concentrated at the Ganghwa site."], "country": "South Korea", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["\u2022 If you have 3 <WRITING> or 4 <WRITING>, gain 4 <VP>.\n\u2022 or, if you have 5 <WRITING> or more, gain 7 <VP>."], "implemented": true }, "M7_CirclesOfMpumalanga": { "number": 7, "name": "Circles Of Mpumalanga", "text": ["Controversial researcher Michael Tellinger has unearthed hundreds of such constructions. Their functions remain unknown."], "country": "South Africa", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 0, "discard": 2, "locked": false, "activation": "endgame", "effect": ["Gain 1 <VP> for each <MEGALITH> in your past."], "implemented": true }, "M8_DolmenOfGochang": { "number": 8, "name": "Dolmen Of Gochang", "text": ["In the largest sizes, the cover slabs measure between 1m and 5.8 meters and can weigh from 10 to 30 tons."], "country": "Cor\u00e9e du Sud", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["If you have 5 <MEGALITH> in your Past, discard 7 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "M9_AramuMuru": { "number": 9, "name": "Aramu Muru", "text": ["This abandoned Inca construction is nicknamed \"The Gate of the Gods.\""], "country": "Peru", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 2, "discard": 1, "locked": false, "activation": "decline", "effect": ["Each of your opponents must discard 2 cards from their hand. If an opponent has less than 2 cards in hand, they discard as many as they can."], "implemented": false }, "M10_TheFairiesRock": { "number": 10, "name": "The Fairies\u2019 Rock", "text": ["This dolmen is made up of more than forty stones forming a corridor oriented north-northwest \u2013 south-southeast."], "country": "France", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Each of your opponents must discard 1 card from their hand."], "implemented": false }, "M11_MenhirsOfMonteneuf": { "number": 11, "name": "Menhirs Of Monteneuf", "text": ["The site consists of more than 400 menhirs made of purple schist."], "country": "France", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "decline", "effect": ["You may CREATE 1 monument."], "implemented": true }, "M12_StatuesOfRamesses": { "number": 12, "name": "Statues Of Ramesses II", "text": ["This 10 meter tall colossus located in the Luxor Temple has impressive facial symmetry."], "country": "Egypt", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 2, "discard": 2, "locked": false, "activation": "decline", "effect": ["Draw 4 cards."], "implemented": true }, "M13_CarnacStandingStones": { "number": 13, "name": "Carnac Standing Stones", "text": ["This alignment is made up of over 4,000 raised stones over a length of more than one kilometer."], "country": "France", "startingHand": 0, "startingSpace": 6, "initialKnowledge": 3, "victoryPoint": 0, "discard": 4, "locked": false, "activation": "decline", "effect": ["If you have at least 20 <LOST_KNOWLEDGE> on your board, discard 15 <LOST_KNOWLEDGE>."], "implemented": true }, "M14_MenhirOfKerloas": { "number": 14, "name": "Menhir Of Kerloas", "text": ["It is considered the tallest menhir currently standing at 9.50 meters above ground."], "country": "France", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Look at one of your opponents\u2019 hands and take 1 card of your choice from them."], "implemented": false }, "M15_BarabarCaves": { "number": 15, "name": "Barabar Caves", "text": ["They are the oldest man-made caves in India, dating back to the Maurya Empire. Their interiors are perfectly polished."], "country": "India", "startingHand": 0, "startingSpace": 6, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Choose 1 monument in one of your opponents\u2019 Timelines and place up to 3 <LOST_KNOWLEDGE> from your board onto it."], "implemented": false }, "M16_DiquisStoneSpheres": { "number": 16, "name": "Diqu\u00cds Stone Spheres", "text": ["How were these spheres moved across the country and what is their significance? Scientists continue to wonder..."], "country": "Costa Rica", "startingHand": 2, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may CREATE 1 <ARTEFACT>."], "implemented": true }, "M17_FortSamaipata": { "number": 17, "name": "Fort Samaipata", "text": ["This fort is an immense tabular rock, with basins and canals dug into the rock, accompanied by two feline figures."], "country": "Bolivia", "startingHand": 4, "startingSpace": 2, "initialKnowledge": 6, "victoryPoint": 4, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 3 <MEGALITH> in your Past, this monument comes into play with 5 <KNOWLEDGE> less."], "implemented": true }, "M18_DolmenOfMenga": { "number": 18, "name": "Dolmen Of Menga", "text": ["This dolmen measures 25 meters long and 4 meters high with a covered gallery. The roof is made up of five slabs, the largest weighing 180 tons."], "country": "Spain", "startingHand": 1, "startingSpace": 6, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may CREATE an extra monument."], "implemented": true }, "M19_DolmenOfFontanaccia": { "number": 19, "name": "Dolmen Of Fontanaccia", "text": ["Located in Corsica, it is made up of six standing stones, three of which came from the same cracked slab."], "country": "France", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have at least 10 <LOST_KNOWLEDGE> on your board, gain 4 <VP>."], "implemented": true }, "M20_ColossiOfMemnon": { "number": 20, "name": "Colossi Of Memnon", "text": ["These are the last vestiges of the gigantic temple of Amenhotep III. Each colossus weighs more than 1300 tons."], "country": "Egypt", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Your other <MEGALITH> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "M21_BaalbekTrilithon": { "number": 21, "name": "Baalbek Trilithon", "text": ["The Stone of the Pregnant Woman is one of the largest monoliths ever cut and transported by man."], "country": "Lebanon", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 7, "victoryPoint": 5, "discard": 0, "locked": false, "activation": "immediate", "effect": ["If you have at least 4 <MEGALITH> in your Past, this monument enters play with 6 <KNOWLEDGE> less."], "implemented": true }, "M22_HireBenakal": { "number": 22, "name": "Hire Benakal", "text": ["Made up of more than 400 funerary monuments, the highest dolmen is 3 meters high."], "country": "India", "startingHand": 3, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Each time you LEARN 1 <WRITING> : \n\u2022 discard 1 <KNOWLEDGE> from any of your monuments;\n\u2022 and draw 1 card."], "implemented": false }, "M23_StandingStonesOfStenness": { "number": 23, "name": "Standing Stones Of Stenness", "text": ["Originally made up of a circle of 12 stones, only four remain, the largest with a 6 meter diameter."], "country": "Scotland", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 2, "discard": 1, "locked": false, "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from each of your other <MEGALITH>."], "implemented": true }, "M24_TlalocsStatue": { "number": 24, "name": "Tlaloc\u2019s Statue", "text": ["Representing the god of water, this monolith measures about 7 meters and weighs around 165 tons."], "country": "Mexico", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Add 3 <KNOWLEDGE> from the reserve to any monument in each of your opponents\u2019 Timelines."], "implemented": false }, "M25_GreatSphinxOfGiza": { "number": 25, "name": "Great Sphinx Of Giza", "text": ["This is the largest monolithic monumental sculpture in the world at 73 meters long, 14 meters wide, and 20 meters high."], "country": "Egypt", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Add 2 <KNOWLEDGE> from the reserve to any monument in each of your opponents\u2019 Timelines."], "implemented": false }, "M26_ChabolaDeLaHechicera": { "number": 26, "name": "Chabola De La Hechicera", "text": ["One of the most important dolmens in the Basque Country, its chamber is made up of 9 rough stones that form a polygonal figure"], "country": "Spain", "startingHand": 2, "startingSpace": 6, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Each time you CREATE 1 <ARTEFACT> :\n\u2022 discard 1 <KNOWLEDGE> from any of your monuments;\n\u2022 and draw 1 card."], "implemented": false }, "M27_MasudaIwafune": { "number": 27, "name": "Masuda Iwafune", "text": ["The origin and function of this 900 ton monolith are unknown."], "country": "Japan", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may CREATE 1 <MEGALITH>."], "implemented": true }, "M28_MegalithsOfCauria": { "number": 28, "name": "Megaliths Of Cauria", "text": ["These Corsican statue-menhirs are considered a particularity within Neolithic anthropomorphic art."], "country": "France", "startingHand": 0, "startingSpace": 1, "initialKnowledge": 2, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Add 1 <KNOWLEDGE> from the reserve to any monument in each of your opponents\u2019 Timelines."], "implemented": false }, "M29_IshibutaiKofun": { "number": 29, "name": "Ishibutai Kofun", "text": ["At 54 meters long and composed of 30 stones, this is the largest known megalithic structure in Japan."], "country": "Japan", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have at least 5 <LOST_KNOWLEDGE> on your board, discard 1 <LOST_KNOWLEDGE>"], "implemented": true }, "M30_LeshanGiantBuddha": { "number": 30, "name": "Leshan Giant Buddha", "text": ["According to legend, it was created by a Buddhist monk who wanted to protect sailors traveling along the perilous confluence of 3 rivers."], "country": "China", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have at least 3 <MEGALITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "M31_HagarQim": { "number": 31, "name": "\u0126a\u0120ar Qim", "text": ["This is a huge complex made up of four temples built over a period of a thousand years."], "country": "Malta", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "M32_GiantsTomb": { "number": 32, "name": "Giants\u2019 Tomb", "text": ["Funeral monument made up of collective burials belonging to the Nuragic culture present in Sardinia."], "country": "Italy", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 1, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have at least 20 <LOST_KNOWLEDGE> on your board, gain 12 <VP>."], "implemented": true }, "M33_MerchantsTable": { "number": 33, "name": "Merchants\u2019 Table", "text": ["With a north-south orientation, this monument has a length of about 12 meters, while the corridor measures 7 meters long and 2.5 meters high."], "country": "France", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 2, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["Gain 1 extra <VP> for each monument still in your Timeline."], "implemented": true }, "M34_MontguyonDolmen": { "number": 34, "name": "Montguyon Dolmen", "text": ["The largest capstone weighs more than 30 tons and was extracted from a quarry located more than 2.5 kilometers from the site."], "country": "France", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 0, "discard": 3, "locked": false, "activation": "decline", "effect": ["You may LEARN 1 Technology without fulfilling the requirements."], "implemented": true }, "M35_Ggantija": { "number": 35, "name": "\u0120gantija", "text": ["Made up of 2 megalithic temples, this complex is known for its impressive area (50 \u00d7 35 meters)."], "country": "Malta", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 1, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card."], "implemented": true }, "M36_PoulnabroneDolmen": { "number": 36, "name": "Poulnabrone Dolmen", "text": ["The rectangular shape of the top table is particularly rare and is said to weigh several tons."], "country": "Ireland", "startingHand": 0, "startingSpace": 6, "initialKnowledge": 0, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "anytime", "effect": ["If you have at least 11 cards in your Past when you CREATE a monument, you may CREATE 2 instead."], "implemented": false }, "P1_PyramidOfKhafre": { "number": 1, "name": "Pyramid Of Khafre", "text": ["Second largest pyramid in Egypt, it would have been built for the son of Khufu."], "country": "Egypt", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 0, "discard": 2, "locked": false, "activation": "endgame", "effect": ["\u2022 If you have between 8 and 11 Technologies, gain 5 <VP>.\n\u2022 or, if you have 12 or more Technologies, gain 12 <VP>."], "implemented": true }, "P2_PyramidOfPepi": { "number": 2, "name": "Pyramid Of Pepi Ii", "text": ["Full of Pyramid Texts, it is the last pyramidal complex of the Old Kingdom."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["If you have at least 7 <CITY> in your Past, gain 6 <VP> "], "implemented": true }, "P3_MeidumPyramid": { "number": 3, "name": "Meidum Pyramid", "text": ["Attributed to Sneferu, it was transformed into the first Egyptian smooth-faced pyramid."], "country": "Egypt", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["\u2022 If you have 3 <SECRET> or 4 <SECRET>, gain 4 <VP>;\n\u2022 or, if you have 5 <SECRET> or more, gain 7 <VP>."], "implemented": true }, "P4_Palenque": { "number": 4, "name": "Palenque", "text": ["Made up of several temples and pyramids, it is one of the most impressive sites of Mayan culture."], "country": "Mexico", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "endgame", "effect": ["\u2022 If you have 3 <WRITING> or 4 <WRITING>, gain 4 <VP>;\n\u2022 or, if you have 5 <WRITING> or more, gain 7 <VP>."], "implemented": true }, "P5_CahuachiPyramids": { "number": 5, "name": "Cahuachi Pyramids", "text": ["This is the largest site ever discovered dating from the Nazca civilization. Less than 5% of the ruins have been excavated."], "country": "Peru", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["Gain 2 <VP> for each set of 3 different types of Technology (<ANCIENT>, <WRITING> and <SECRET>) you have."], "implemented": true }, "P6_GreatZigguratOfUr": { "number": 6, "name": "Great Ziggurat Of Ur", "text": ["One of the four ziggurats that were built in the main religious centers of the land of Sumer."], "country": "Iraq", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 1, "discard": 2, "locked": false, "activation": "endgame", "effect": ["Gain 2 <VP> for each set of 3 different types of monuments (<CITY>, <MEGALITH> et <PYRAMID>) in your Past."], "implemented": true }, "P7_PyramidOfTheNiches": { "number": 7, "name": "Pyramid Of The Niches", "text": ["At 18 meters high, this pyramid covers an earlier construction that had similar architecture."], "country": "Mexico", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Secretly look at the top 7 Technology [II] cards of the deck:\n\u2022 LEARN1 if you fulfill its requirements;\n\u2022 and put the remaining cards on the bottom of the deck, in any order."], "implemented": false }, "P8_PyramidOfUserkaf": { "number": 8, "name": "Pyramid Of Userkaf", "text": ["Pyramid from the Fifth Dynasty, it demonstrates a change of ideas in the construction of royal funerary monuments."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Each of your opponents must discard 1 <ARTEFACT> from their board."], "implemented": false }, "P9_Caral": { "number": 9, "name": "Caral", "text": ["Estimated to be around 5,000 years old, whereas urban development  in the rest of the Americas began 1,500 years later."], "country": "Peru", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 2, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "decline", "effect": ["You may LEARN 1 Technology if you fulfill its requirements."], "implemented": true }, "P10_Teotihuacan": { "number": 10, "name": "Teotihuacan", "text": ["This site includes some of the largest Mesoamerican pyramids ever built. The Pyramid of the Sun is 65 meters high."], "country": "Mexique", "startingHand": 3, "startingSpace": 6, "initialKnowledge": 2, "victoryPoint": 0, "discard": 1, "locked": false, "activation": "decline", "effect": ["You may LEARN up to 2 Technologies if you fulfill their requirements."], "implemented": true }, "P11_PyramidOfCoba": { "number": 11, "name": "Pyramid Of Coba", "text": ["At 42 meters high, the temple of Nohoch Mul is one of the tallest pyramids in the entire Maya region."], "country": "Mexique", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["If you have at least 3 <MEGALITH> in your Past, discard up to 4 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "P12_GunungPadang": { "number": 12, "name": "Gunung Padang", "text": ["The geologist Natawidjaja revealed the presence of chambers within it using radar."], "country": "Indonesia", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "decline", "effect": ["Move 1 another monument in your Timeline to any other available space."], "implemented": false }, "P13_Yonaguni": { "number": 13, "name": "Yonaguni", "text": ["Gigantic underwater pyramid or natural formation?"], "country": "Japan", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 14, "victoryPoint": 8, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may discard as many <ARTEFACT> from your board as you wish. Discard 4 <KNOWLEDGE> from this monument for each <ARTEFACT> you discard."], "implemented": false }, "P14_TikalTempleI": { "number": 14, "name": "Tikal Temple I", "text": ["One of the largest archaeological sites and urban centers of the pre-Columbian Maya civilization."], "country": "Guatemala", "startingHand": 3, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may LEARN 1 Technology if you fulfill its requirements."], "implemented": true }, "P15_XixiaWangling": { "number": 15, "name": "Xixia Wangling", "text": ["The Western Xia Tombs is a mortuary site with an area of 50 square kilometers."], "country": "China", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Discard 3 <KNOWLEDGE> or less from a monument adjacent to this one."], "implemented": false }, "P16_NubianPyramids": { "number": 16, "name": "Nubian Pyramids", "text": ["This is a complex of 220 pyramids in total, which serve as tombs for the kings and queens of Napata and Meroe."], "country": "Sudan", "startingHand": 4, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["You may CREATE 1 <ARTEFACT>."], "implemented": true }, "P17_TheQueensPyramids": { "number": 17, "name": "The Queen\u2019s Pyramids", "text": ["The pyramid built for Queen Meritites measures 31 meters high."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 5, "victoryPoint": 4, "discard": 0, "locked": false, "activation": "immediate", "effect": ["This monument enters play with 1 <KNOWLEDGE> less for each <PYRAMID> in your Past."], "implemented": true }, "P18_PyramideDeNice": { "number": 18, "name": "Pyramide De Nice", "text": ["It was destroyed in the 1970s to build a road interchange. It was over 200 meters long and 50 meters high."], "country": "France", "startingHand": 1, "startingSpace": 1, "initialKnowledge": 2, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from any of your monuments."], "implemented": true }, "P19_CandiSukuh": { "number": 19, "name": "Candi Sukuh", "text": ["One of the 5 terraced pyramids of Indonesia. Its base is trapezoidal."], "country": "Indonesia", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "anytime", "effect": ["When you LEARN, you may reduce one of the values of the Technology requirements by 1 (to a minimum of 0)."], "implemented": false }, "P20_BorobudurTemple": { "number": 20, "name": "Borobudur Temple", "text": ["The temple is lined with 72 stupas which have openwork stone bells housing bodhisattvas."], "country": "Indonesia", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Each time you CREATE 1 <ARTEFACT> , you may LEARN 1 Technology if you fulfill its requirements."], "implemented": false }, "P21_Phimeanakas": { "number": 21, "name": "Phimeanakas", "text": ["It is the royal Hindu temple within the grounds of the royal palace of the ancient city Angkor Thom in Angkor."], "country": "Cambodia", "startingHand": 3, "startingSpace": 5, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Each time you LEARN 1 <ANCIENT> :\n\u2022 discard 1 <KNOWLEDGE> from any of your monuments;\n\u2022 and draw 1 card."], "implemented": false }, "P22_SneferusPyramid": { "number": 22, "name": "Sneferu\u2019s Pyramid", "text": ["Its particular shape deems it a failed attempt at a pyramid with smooth faces, the final stage in the evolution of pyramids."], "country": "Egypt", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "anytime", "effect": ["Your other <CITY> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "P23_PyramidsOfXian": { "number": 23, "name": "Pyramids Of Xi\u2019an", "text": ["Made of only clay and earth, they measure between 25 and 100 meters high."], "country": "China", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 1, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Swap this monument with another monument of your Timeline."], "implemented": false }, "P24_PyramidOfTazumal": { "number": 24, "name": "Pyramid Of Tazumal", "text": ["The main pyramid of the complex has a base that is 73 by 87 meters wide."], "country": "El Salvador", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have at least 11 <KNOWLEDGE> in your Timeline, discard up to 2 <KNOWLEDGE> from one or several of your monuments."], "implemented": true }, "P25_ChichenItza": { "number": 25, "name": "Chich\u00c9n Itz\u00c1", "text": ["The rays of the morning and afternoon sun form a snake of shadow and light that ascends the staircase of the pyramid of El Castillo."], "country": "Mexico", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <MEGALITH> adjacent to this card."], "implemented": true }, "P26_Uxmal": { "number": 26, "name": "Uxmal", "text": ["The levels of the Pyramid of the Magician are unusual: they are oval rather than rectangular or square."], "country": "Mexico", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 1, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <MEGALITH> adjacent to this card."], "implemented": true }, "P27_DahshurPyramid": { "number": 27, "name": "Dahshur Pyramid", "text": ["The construction of the Dahshur pyramids was an extremely important learning experience for the Egyptians."], "country": "Egypt", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 1, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card."], "implemented": true }, "P28_PyramidOfMenkaure": { "number": 28, "name": "Pyramid Of Menkaure", "text": ["It is the smallest of the three great pyramids on the Giza plateau at 63 meters high."], "country": "Egypt", "startingHand": 0, "startingSpace": 3, "initialKnowledge": 2, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card."], "implemented": true }, "P29_PyramidOfDjoser": { "number": 29, "name": "Pyramid Of Djoser", "text": ["In the history of Egyptian architecture, this is the second work built out of cut stone."], "country": "Egypt", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 3, "victoryPoint": 2, "discard": 0, "locked": false, "activation": "timeline", "effect": ["If you have 4 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, discard 1 <KNOWLEDGE> from any of your monument."], "implemented": true }, "P30_PyramidOfNeferirkare": { "number": 30, "name": "Pyramid Of Neferirkare", "text": ["It seems that the premature death of King Neferirkare put a stop to the project and his successors completed the funerary complex."], "country": "Egypt", "startingHand": 0, "startingSpace": 5, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Discard 1 <KNOWLEDGE> from any other monument."], "implemented": true }, "P31_Tonina": { "number": 31, "name": "Tonin\u00c1", "text": ["This complex consists of 7 terraces for a total height of about 80 meters, flanked by 13 temples and 8 palaces."], "country": "Mexico", "startingHand": 1, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "timeline", "effect": ["Draw 1 card."], "implemented": true }, "P32_ComalcalcoTemple": { "number": 32, "name": "Comalcalco Temple", "text": ["The biggest pyramid of the site is called the \"House of the Comales.\" The entire complex is oriented according to the cardinal points."], "country": "Mexico", "startingHand": 0, "startingSpace": 4, "initialKnowledge": 4, "victoryPoint": 1, "discard": 1, "locked": false, "activation": "endgame", "effect": ["Gain 1 <VP> for each monument with a <VP> activation in your Past."], "implemented": true }, "P33_Calakmul": { "number": 33, "name": "Calakmul", "text": ["This mighty Mayan city was inhabited for more than a millennium, before being being abandonned and swallowed up by the jungle."], "country": "Mexico", "startingHand": 0, "startingSpace": 1, "initialKnowledge": 1, "victoryPoint": 1, "discard": 2, "locked": false, "activation": "decline", "effect": ["Draw cards until you reveal 2 <CITY>. \n\u2022 add the 2 <CITY> to your hand;\n\u2022 and discard the other revealed cards."], "implemented": false }, "P34_PyramidsOfPlaineMagnien": { "number": 34, "name": "Pyramids Of Plaine Magnien", "text": ["Measuring less than 12 meters high, there are 7 of them on the island. Simple heaps of stones or thoughtful constructions?"], "country": "Mauritius", "startingHand": 2, "startingSpace": 2, "initialKnowledge": 0, "victoryPoint": 0, "discard": 0, "locked": false, "activation": "decline", "effect": ["Secretly look at the top 8 cards of the Builder deck:\n\u2022 add 1 to your hand;\n\u2022 and discard the other 7 cards."], "implemented": false }, "P35_CandiKethek": { "number": 35, "name": "Candi Kethek", "text": ["The temple has 7 west-facing terraces."], "country": "Indonesia", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "immediate", "effect": ["Choose 2 available Technologies and put them on the bottom of their respective deck(s)."], "implemented": false }, "P36_Janggunchong": { "number": 36, "name": "Janggun-chong", "text": ["Nicknamed the \"Tomb of the General,\" this ancient Korean pyramid is 75 meter high and 11 meters wide."], "country": "China", "startingHand": 0, "startingSpace": 2, "initialKnowledge": 3, "victoryPoint": 1, "discard": 0, "locked": false, "activation": "endgame", "effect": ["If you have at least 3 monuments in your Timeline, gain 6 <VP>."], "implemented": true }, "A1_DiskOfSabu": { "number": 1, "name": "Disk Of Sabu", "text": ["Discovered in the tomb of Sabu, its function and meaning remain unknown."], "country": "Egypt", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have at least 4 <MEGALITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "A2_SarcophagusOfSaqqara": { "number": 2, "name": "Sarcophagus Of Saqqara", "text": ["Built in honor of the god Apis, the serapeum contained more than 20 granite sarcophagi."], "country": "Egypt", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have at least 3 <CITY> in your Timeline:\n\u2022 discard 1 <KNOWLEDGE> from any of your monument;\n\u2022 and draw 1 card."], "implemented": false }, "A3_PlanetaryStone": { "number": 3, "name": "Planetary Stone", "text": ["Discovered in 1984, this stone has the contours of a world map."], "country": "Ecuador", "startingHand": 2, "discard": 0, "activation": "timeline", "effect": ["You may discard 2 cards from your hand. If you do, discard up to 3 <KNOWLEDGE> from one or several of your monuments."], "implemented": true }, "A4_DisksOfBayanKaraUla": { "number": 4, "name": "Disks Of Bayan Kara Ula", "text": ["These stone discs have scriptures telling the story of beings crashing on Earth 12,000 years ago."], "country": "China", "startingHand": 1, "discard": 0, "activation": "timeline", "effect": ["If you have at least 1 monument of each type in your Timeline (<CITY>, <MEGALITH> and <PYRAMID>), discard 1 <KNOWLEDGE> from any of your monuments."], "implemented": false }, "A5_IcaStones": { "number": 5, "name": "Ica Stones", "text": ["Discovered in 1964, they constitute a collection of over 15,000 engraved andesite pebbles."], "country": "Peru", "startingHand": 2, "discard": 0, "activation": "timeline", "effect": ["If you have at least 3 <ARTEFACT> on your board, draw 1 card."], "implemented": true }, "A6_AntikytheraMechanism": { "number": 6, "name": "Antikythera Mechanism", "text": ["This mechanism is considered the first astronomical position calculator."], "country": "Greece", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If one of your monuments in the [n\u00b01] space of your Timeline has at least 4 <KNOWLEDGE>, move it to [n\u00b03] if possible. Otherwise nothing happens."], "implemented": false }, "A7_MoaiStatue": { "number": 7, "name": "Moai Statue", "text": ["Discovered in Colombia, this statue is strangely reminiscent of the Moai statues of Easter Island."], "country": "Chile", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["You may discard 2 <ARTEFACT> from your hand. If you do, draw 4 cards."], "implemented": true }, "A8_LaManAPyramid": { "number": 8, "name": "La Man\u00c1 Pyramid", "text": ["Strangely resembling the pyramid on the US dollar, its outlines shimmer under black light."], "country": "Ecuador", "startingHand": 1, "discard": 0, "activation": "timeline", "effect": ["You may discard 1 card from your hand. If you do, draw 1 card."], "implemented": true }, "A9_Tzolkin": { "number": 9, "name": "Tzolk\u2019in", "text": ["This ritual calendar of 260 days is shared by all the pre-Columbian civilizations of Mesoamerica."], "country": "Mexique", "startingHand": 2, "discard": 0, "activation": "timeline", "effect": ["If you have 3 or less <LOST_KNOWLEDGE> on your board and at least 1 monument in your Past, you may discard 1 <KNOWLEDGE> from any of your monuments."], "implemented": true }, "A10_IncahuasiQuipus": { "number": 10, "name": "Incahuasi Quipus", "text": ["Never translated, the quipus served the Incas as a communication and counting system."], "country": "Peru", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have 3 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, draw 1 card."], "implemented": true }, "A11_ParacasCandelabra": { "number": 11, "name": "Paracas Candelabra", "text": ["The function of this geoglyph remains unknown. It is almost oriented North-South at 180 meters long and 70 meters wide."], "country": "Peru", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have at least 3 <PYRAMID> in your Timeline, discard up to 2 <KNOWLEDGE> from one or several of your monuments."], "implemented": false }, "A12_PachamamaMonolith": { "number": 12, "name": "Pachamama Monolith", "text": ["Discovered in Tiwanaku, it represents a red stone giant. At 7.30 meters high, it is the largest monolith on the site"], "country": "Bolivia", "startingHand": 0, "discard": 3, "activation": "timeline", "effect": ["If you have at least 5 <PYRAMID> in your Past, you may LEARN 1 Technology if you fulfill its requirements."], "implemented": true }, "A13_PiriReisMap": { "number": 13, "name": "Piri Reis Map", "text": ["It was drawn by the pirate Piri Reis in 1513. The continent at the bottom of the map could be Antarctica."], "country": "T\u00fcrkiye", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["You may move a monument in your Timeline with 0 <KNOWLEDGE> to any other available space."], "implemented": false }, "A14_KlerksdorpSpheres": { "number": 14, "name": "Klerksdorp Spheres", "text": ["3 billion years old, these spheres are the source of several debates. Are their polished forms and aesthetic aspects natural?"], "country": "South Africa", "startingHand": 4, "discard": 0, "activation": "timeline", "effect": ["If you have at least 5 <LOST_KNOWLEDGE> on your board, draw 1 card."], "implemented": true }, "A15_LudditeFlute": { "number": 15, "name": "Luddite Flute", "text": ["The sound vibration from these stone flutes is exactly the same as our brain waves."], "country": "Bolivia", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["You may discard this card from your board. If you do, straighten up to 4 monuments from your Past."], "implemented": false }, "A16_CrystalSkull": { "number": 16, "name": "Crystal Skull", "text": ["The pre-Columbian origin of crystal skulls is often questioned."], "country": "Belize", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you rotate at least 3 monuments during an EXCAVATE action, LEARN 1 Technology if you fulfill its requirements."], "implemented": false }, "A17_GlozelArtifacts": { "number": 17, "name": "Glozel Artifacts", "text": ["Covered with indecipherable signs, these tablets radically challenge chronology. Emile Fradin was accused of coutnerfeiting their existance after discovering them in 1924."], "country": "France", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you LEARN 1 <WRITING>, draw 2 cards."], "implemented": false }, "A18_DogonMythology": { "number": 18, "name": "Dogon Mythology", "text": ["Suspected of having discovered the white dwarf Sirius B, the Dogons of Mali have their own astronomical legends."], "country": "Mali", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you LEARN 1 <ANCIENT>, draw 2 cards."], "implemented": false }, "A19_VoynichManuscript": { "number": 19, "name": "Voynich Manuscript", "text": ["Written in an undeciphered script and an unidentified language, it is one of the most famous documents in the history of cryptography."], "country": "Italy", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you LEARN 1 <SECRET>, draw 2 cards."], "implemented": false }, "A20_SumerianTablets": { "number": 20, "name": "Sumerian Tablets", "text": ["Some tablets tell the story of a race of gods from another world, the Annunaki, who brought advanced knowledge to the planet."], "country": "Iraq", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you LEARN 1 Technology (<WRITING>, <ANCIENT> or |secret]), draw 1 card."], "implemented": false }, "A21_BaghdadBattery": { "number": 21, "name": "Baghdad Battery", "text": ["Made of an iron rod and copper cylinder, they could have served as batteries. With reconstructions, researchers obtained very low electrical voltages."], "country": "Iraq", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["You may discard this card from your board. If you do, discard up to 4 <KNOWLEDGE> from one or several of your monuments."], "implemented": false }, "A22_NazcaLines": { "number": 22, "name": "Nazca Lines", "text": ["These stylized animals or simple lines (that go on for several kilometers) are only visible from the sky."], "country": "Peru", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you CREATE  1 <PYRAMID>, draw 1 card."], "implemented": false }, "A23_OlmecHeads": { "number": 23, "name": "Olmec Heads", "text": ["Carved in basalt, the African features of these statues unleashed passions."], "country": "Mexico", "startingHand": 4, "discard": 0, "activation": "anytime", "effect": ["Each time you CREATE 1 <MEGALITH>, draw 1 card."], "implemented": false }, "A24_GeneticDisk": { "number": 24, "name": "Genetic Disk", "text": ["This disc represents genetic elements only visible under a microscope."], "country": "Colombia", "startingHand": 3, "discard": 0, "activation": "anytime", "effect": ["Each time you play a monument on space [n\u00b05] or [n\u00b06], you may discard up to 2 <KNOWLEDGE> from one or several of your monuments."], "implemented": false }, "A25_KensingtonRunestone": { "number": 25, "name": "Kensington Runestone", "text": ["This stone suggests that Scandinavian explorers reached the center of North America in the 14th century."], "country": "United States", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["When you EXCAVATE, if you rotate exactly 2 cards in your Past, you may discard up to 6 <KNOWLEDGE> from one or several of your monuments, instead of drawing cards."], "implemented": false }, "A26_NebraSkyDisc": { "number": 26, "name": "Nebra Sky Disc", "text": ["This disc is considered the oldest known representation of the celestial vault. Its perimeter is 1 meter around."], "country": "Germany", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Your <MEGALITH> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "A27_IronPillarOfDelhi": { "number": 27, "name": "Iron Pillar Of Delhi", "text": ["It is known for having a strong resistance to rust, due to a uniform layer of crystalline iron hydrogen phosphate which protects it from environmental effects."], "country": "India", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have 2 monuments in space [n\u00b01]:\n\u2022 Discard 1 <KNOWLEDGE> from any of your monument;\n\u2022 and draw 1 card."], "implemented": false }, "A28_DogUFigurines": { "number": 28, "name": "Dog\u016a Figurines", "text": ["The function of these enigmatic statuettes from the J\u014dmon period remains unknown."], "country": "Japan", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Your <CITY> enter play with 1 <KNOWLEDGE> less."], "implemented": true }, "A29_PhaistosDisc": { "number": 29, "name": "Phaistos Disc", "text": ["Both sides of the disc show 241 signs. Its use, meaning, and even origin are hotly debated."], "country": "Greece", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Each time you rotate a card during an EXCAVATE action, draw 3 cards instead of 2."], "implemented": false }, "A30_NimrudLens": { "number": 30, "name": "Nimrud Lens", "text": ["It may be the oldest optical lens ever discovered, but its use continues to be debated."], "country": "Iraq", "startingHand": 0, "discard": 1, "activation": "anytime", "effect": ["Each time you LEARN a Technology (<ANCIENT>, <WRITING>, <SECRET>), you may discard 1 <KNOWLEDGE> from any of your monuments."], "implemented": false }, "A31_SaqqaraVases": { "number": 31, "name": "Saqqara Vases", "text": ["Thousands of vases and containers were unearthed under the pyramid of Saqqara. Made of very hard stone, some are only a few centimeters high."], "country": "Egypt", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["You may discard this card from your board. If you do, move one monument to another available space."], "implemented": false }, "A32_ElongatedSkulls": { "number": 32, "name": "Elongated Skulls", "text": ["The atypical shape of the skull comes from mechanical stress processes combining wooden frames and fabric or leather. This practice is customary in many countries around the world."], "country": "Peru", "startingHand": 4, "discard": 0, "activation": "anytime", "effect": ["For each set of 3 <KNOWLEDGE> becoming <LOST_KNOWLEDGE> during your DECLINE PHASE this turn, draw 2 cards."], "implemented": false }, "A33_MichauxStone": { "number": 33, "name": "Michaux Stone", "text": ["Written in the Babylonian language using cuneiform signs, the text describes a contract for the gift of agricultural land from a father to his daughter."], "country": "Iraq", "startingHand": 0, "discard": 3, "activation": "timeline", "effect": ["If you have at least 17 <LOST_KNOWLEDGE> on your board, you may LEARN 1 Technology if you fulfill its requirements."], "implemented": false }, "A34_OronceFinEsMap": { "number": 34, "name": "Oronce Fin\u00c9\u2019s Map", "text": ["They are distinctive elements of the sculptural tradition of the southern Maya cultural area. The precise use of these carvings is unknown."], "country": "France", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["When you EXCAVATE, if you rotate exactly 3 cards, each of your opponents must discard up to 2 cards from their hands."], "implemented": false }, "A35_AssurbanipalsTablet": { "number": 35, "name": "Assurbanipal\u2019s Tablet", "text": ["The disc represents a celestial planisphere showing the position of the constellations observed at night from January 3 to 4, 650."], "country": "Iraq", "startingHand": 0, "discard": 0, "activation": "timeline", "effect": ["If you have 0 or 1 card in your hand, draw 1 card."], "implemented": true }, "A36_KhufusSolarBarque": { "number": 36, "name": "Khufu\u2019s Solar Barque", "text": ["A symbolic object of Egyptian mythology, it is stored disassembled in a pit at the foot of the Pyramid of Khufu."], "country": "Egypt", "startingHand": 0, "discard": 0, "activation": "anytime", "effect": ["Your <PYRAMID> enter play with 1 <KNOWLEDGE> less."], "implemented": true } };
var TECHS_DATA = { "T1_Anaximenes": { "number": 1, "name": "Anaximenes", "type": "ancient", "level": 1, "requirement": ["3 <ARTEFACT> on your board."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T2_Aristotle": { "number": 2, "name": "Aristotle", "type": "ancient", "level": 1, "requirement": ["2 <PYRAMID> in your past."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T3_HermesTrismegistus": { "number": 3, "name": "Hermes Trismegistus", "type": "ancient", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Reveal the top 5 cards of the deck:\n\u2022 each player chooses 1, going clockwise;\n\u2022 take a second card, then discard any remaining cards."], "implemented": false }, "T4_Thales": { "number": 4, "name": "Thales", "type": "ancient", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Look at the top 8 cards of the deck:\n\u2022 take 1;\n\u2022 and discard the remaining cards."], "implemented": false }, "T5_NicolasFlammel": { "number": 5, "name": "Nicolas Flammel", "type": "ancient", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard 1 <LOST_KNOWLEDGE> from your board and draw 1 card."], "implemented": true }, "T6_Anaximander": { "number": 6, "name": "Anaximander", "type": "ancient", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from each <PYRAMID> in your Timeline."], "implemented": true }, "T7_Melchizedek": { "number": 7, "name": "Melchizedek", "type": "ancient", "level": 1, "requirement": ["1 <CITY>, 1 <MEGALITH>, 1 <PYRAMID> in your past."], "activation": "immediate", "effect": ["Draw 4 cards."], "implemented": true }, "T8_Ptolemy": { "number": 8, "name": "Ptolemy", "type": "ancient", "level": 1, "requirement": ["0 or 1 card in your hand."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T9_Mercury": { "number": 9, "name": "Mercury", "type": "ancient", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard 2 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "T10_PlanetaryGrid": { "number": 10, "name": "Planetary Grid", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Move 1 monument in your Timeline to any other available space."], "implemented": false }, "T11_TheNumberPi": { "number": 11, "name": "The Number Pi", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from each <CITY> in your Timeline."], "implemented": true }, "T12_Mummification": { "number": 12, "name": "Mummification", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard as many <KNOWLEDGE> from your Timeline as the number of <ARTEFACT> on your board."], "implemented": true }, "T13_MysterySchool": { "number": 13, "name": "Mystery School", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Draw 1 card for each <CITY> in your Timeline."], "implemented": true }, "T14_LanguageOfTheBirds": { "number": 14, "name": "Language Of The Birds", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Choose 1 monument in your Timeline with at least 5 <KNOWLEDGE>. Discard 3 <KNOWLEDGE> from it."], "implemented": false }, "T15_FlowerOfLife": { "number": 15, "name": "Flower Of Life", "type": "secret", "level": 1, "requirement": ["2 <CITY> in your past."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T16_SatorSquare": { "number": 16, "name": "Sator Square", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Swap 2 monuments in your Timeline."], "implemented": false }, "T17_EarthquakeEngineering": { "number": 17, "name": "Earthquake Engineering", "type": "secret", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard up to 3 cards, then draw 1 card for each discarded card."], "implemented": false }, "T18_Astronomy": { "number": 18, "name": "Astronomy", "type": "secret", "level": 1, "requirement": ["1 <CITY>, 1 <PYRAMID> in your past."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T19_RunicAlphabet": { "number": 19, "name": "Runic Alphabet", "type": "writing", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Straighten 2 rotated monuments in your Past."], "implemented": false }, "T20_RongorongoGlyphs": { "number": 20, "name": "Rongorongo Glyphs", "type": "writing", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Discard 1 <KNOWLEDGE> from each <MEGALITH> in your Timeline."], "implemented": true }, "T21_AncientHebrew": { "number": 21, "name": "Ancient Hebrew", "type": "writing", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Choose 1 monument in each of your opponents\u2019 Timelines and add 1 <KNOWLEDGE> to each. Draw 1 card."], "implemented": false }, "T22_AncientGreek": { "number": 22, "name": "Ancient Greek", "type": "writing", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Draw the top 10 cards of the deck:\n\u2022 choose and CREATE 1 <ARTEFACT>;\n\u2022 and discard the remaining cards."], "implemented": false }, "T23_ArabicNumerals": { "number": 23, "name": "Arabic Numerals", "type": "writing", "level": 1, "requirement": ["5 <LOST_KNOWLEDGE> on your board."], "activation": "immediate", "effect": ["Discard 3 <LOST_KNOWLEDGE> from your board."], "implemented": true }, "T24_Protowriting": { "number": 24, "name": "Proto-writing", "type": "writing", "level": 1, "requirement": ["4 monuments in your Past."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T25_CopticAlphabet": { "number": 25, "name": "Coptic Alphabet", "type": "writing", "level": 1, "requirement": ["2 <MEGALITH> in your Past."], "activation": "immediate", "effect": ["Draw 3 cards."], "implemented": true }, "T26_CretanHieroglyphs": { "number": 26, "name": "Cretan Hieroglyphs", "type": "writing", "level": 1, "requirement": [], "activation": "immediate", "effect": ["Each of your opponents discards 1 card from their hand."], "implemented": false }, "T27_LatinAlphabet": { "number": 27, "name": "Latin Alphabet", "type": "writing", "level": 1, "requirement": ["5 monuments in your Past."], "activation": "immediate", "effect": ["Choose 1 Technology [II], and put it on the bottom of the corresponding deck."], "implemented": false }, "T28_Imhotep": { "number": 28, "name": "Imhotep", "type": "ancient", "level": 2, "requirement": ["4 <ARTEFACT> on your board."], "activation": "endgame", "effect": ["3 <VP>"], "implemented": true }, "T29_Plato": { "number": 29, "name": "Plato", "type": "ancient", "level": 2, "requirement": ["7 monuments of the same type in your Past."], "activation": "endgame", "effect": ["4 <VP>"], "implemented": true }, "T30_Thoth": { "number": 30, "name": "Thoth", "type": "ancient", "level": 2, "requirement": ["9 <LOST_KNOWLEDGE> on your board."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T31_Pythagoras": { "number": 31, "name": "Pythagoras", "type": "ancient", "level": 2, "requirement": ["3 monuments with <VP> activation in your Past."], "activation": "endgame", "effect": ["3 <VP>"], "implemented": true }, "T32_Akhenaten": { "number": 32, "name": "Akhenaten", "type": "ancient", "level": 2, "requirement": ["4 <PYRAMID> in your past."], "activation": "endgame", "effect": ["3 <VP>"], "implemented": true }, "T33_PlinyTheElder": { "number": 33, "name": "Pliny The Elder", "type": "ancient", "level": 2, "requirement": ["3 <ANCIENT> in your collection."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T34_GoldenMean": { "number": 34, "name": "Golden Mean", "type": "secret", "level": 2, "requirement": ["3 <CITY> in your past."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T35_RoyalCubit": { "number": 35, "name": "Royal Cubit", "type": "secret", "level": 2, "requirement": ["3 <SECRET> in your collection."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T36_Astrology": { "number": 36, "name": "Astrology", "type": "secret", "level": 2, "requirement": ["10 cards in your hand."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T37_Alchemy": { "number": 37, "name": "Alchemy", "type": "secret", "level": 2, "requirement": ["\u2022 7 monuments in your past.\n\u2022 3 <LOST_KNOWLEDGE> or less on your board."], "activation": "endgame", "effect": ["4 <VP>"], "implemented": true }, "T38_Hermeticism": { "number": 38, "name": "Hermeticism", "type": "secret", "level": 2, "requirement": ["5 <CITY> in your past."], "activation": "endgame", "effect": ["3 <VP>"], "implemented": true }, "T39_Arikat": { "number": 39, "name": "Ari-kat", "type": "secret", "level": 2, "requirement": ["3 <CITY>, 3 <MEGALITH>, 3 <PYRAMID> in your past."], "activation": "endgame", "effect": ["5 <VP>"], "implemented": true }, "T40_ChineseAlphabet": { "number": 40, "name": "Chinese Alphabet", "type": "writing", "level": 2, "requirement": ["3 <MEGALITH> in your past."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T41_EmeraldTablet": { "number": 41, "name": "Emerald Tablet", "type": "writing", "level": 2, "requirement": ["3 <WRITING> in your collection."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T42_SumerianCuneiforms": { "number": 42, "name": "Sumerian Cuneiforms", "type": "writing", "level": 2, "requirement": ["6 Technology cards (<ANCIENT>,<WRITING> ou <SECRET>)."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T43_MayaScript": { "number": 43, "name": "Maya Script", "type": "writing", "level": 2, "requirement": ["10 monuments in your past."], "activation": "endgame", "effect": ["2 <VP>"], "implemented": true }, "T44_PhoenicianAlphabet": { "number": 44, "name": "Phoenician Alphabet", "type": "writing", "level": 2, "requirement": ["15 <LOST_KNOWLEDGE> on your board."], "activation": "endgame", "effect": ["4 <VP>"], "implemented": true }, "T45_Hieroglyphs": { "number": 45, "name": "Hieroglyphs", "type": "writing", "level": 2, "requirement": ["5 <MEGALITH> in your past."], "activation": "endgame", "effect": ["4 <VP>"], "implemented": true } };
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/<KNOWLEDGE>/ig, '<span class="icon knowledge"></span>')
        .replace(/<LOST_KNOWLEDGE>/ig, '<span class="icon lost-knowledge"></span>')
        .replace(/<VP>/ig, '<span class="icon vp"></span>')
        .replace(/<CITY>/ig, '<span class="icon city"></span>')
        .replace(/<MEGALITH>/ig, '<span class="icon megalith"></span>')
        .replace(/<PYRAMID>/ig, '<span class="icon pyramid"></span>')
        .replace(/<ARTIFACT>/ig, '<span class="icon artifact"></span>')
        .replace(/<ANCIENT>/ig, '<span class="icon ancient"></span>')
        .replace(/<WRITING>/ig, '<span class="icon writing"></span>')
        .replace(/<SECRET>/ig, '<span class="icon secret"></span>')
        .replace(/\[n°(\d)\]/ig, function (fullMatch, number) { return "<span class=\"icon starting-space\">".concat(number, "</span>"); });
}
var CARD_COLORS = {
    'A': '#734073',
    'C': '#d66b2a',
    'M': '#4a82a3',
    'P': '#87a04f',
};
//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));
var BuilderCardsManager = /** @class */ (function (_super) {
    __extends(BuilderCardsManager, _super);
    function BuilderCardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "builder-card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('builder-card');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            isCardVisible: function (card) { return Boolean(card.number); },
            cardWidth: 163,
            cardHeight: 228,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    BuilderCardsManager.prototype.setupFrontDiv = function (card, div, ignoreTooltip) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (ignoreTooltip === void 0) { ignoreTooltip = false; }
        var typeLetter = card.id.substring(0, 1);
        div.style.setProperty('--card-color', CARD_COLORS[typeLetter]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        var backgroundPositionX = ((card.number - 1) % 6) * 100 / 5;
        var backgroundPositionY = Math.floor((card.number - 1) / 6) * 100 / 5;
        var html = "\n        <div id=\"".concat(card.id, "-tokens\" class=\"background\" data-type=\"").concat(typeLetter, "\" style=\"background-position: ").concat(backgroundPositionX, "% ").concat(backgroundPositionY, "%\"></div>\n        <div class=\"type-box\" data-type=\"").concat(typeLetter, "\">\n            <div class=\"type\" data-type=\"").concat(typeLetter, "\">\n                <div class=\"type-icon\"></div>\n            </div>\n        ");
        if (card.startingSpace) {
            html += "<div class=\"starting-space\">".concat(card.startingSpace, "</div>");
        }
        html += "</div>";
        // TODO TEMP
        html += "<div class=\"implemented\" data-implemented=\"".concat((_b = (_a = card.implemented) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'false', "\"></div>");
        if (card.discard) {
            html += "\n            <div class=\"discard\">\n                <div class=\"discard-text\">".concat(card.discard, "</div>\n                <div class=\"discard-icon\"></div>\n            </div>");
        }
        else if (card.locked) {
            html += "\n            <div class=\"discard\">\n                <div class=\"lock-icon\"></div>\n            </div>";
        }
        html += "\n        <div class=\"center-box\">\n            <div class=\"activation-box\"></div>\n            <div class=\"line bottom\"></div>\n            <div class=\"line top\"></div>\n            <div class=\"line middle\"></div>";
        if (typeLetter != 'A') {
            html += "\n            <div class=\"center-zone\">\n                <div class=\"initial-knowledge\">".concat((_c = card.initialKnowledge) !== null && _c !== void 0 ? _c : '', "</div>\n                <div class=\"knowledge-icon\"></div>\n                <div class=\"victory-point\">").concat((_d = card.victoryPoint) !== null && _d !== void 0 ? _d : '', "</div>\n                <div class=\"vp-icon\"></div>\n            </div>\n            ");
        }
        html += "\n            <div class=\"activation\" data-type=\"".concat(card.activation, "\"></div>\n        </div>\n        <div class=\"name-box\">\n            <div class=\"name\">\n                ").concat((_e = card.name) !== null && _e !== void 0 ? _e : '', "\n                <div class=\"country\">").concat((_f = card.country) !== null && _f !== void 0 ? _f : '', "</div>\n            </div>\n        </div>\n        <div class=\"effect\">").concat((_h = (_g = card.effect) === null || _g === void 0 ? void 0 : _g.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _h !== void 0 ? _h : '', "</div>\n        ");
        div.innerHTML = html;
        if (!ignoreTooltip) {
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    };
    BuilderCardsManager.prototype.getType = function (cardId) {
        var typeLetter = cardId.substring(0, 1);
        switch (typeLetter) {
            case 'C': return _('City');
            case 'M': return _('Megalith');
            case 'P': return _('Pyramid');
            case 'A': return _('Artifact');
        }
    };
    BuilderCardsManager.prototype.getTooltip = function (card) {
        var _a, _b;
        var typeLetter = card.id.substring(0, 1);
        var message = "\n        <strong>".concat(card.name, "</strong>\n        <br>\n        <i>").concat(card.country, "</i>\n        <br>\n        <br>\n        <strong>").concat(_("Type:"), "</strong> ").concat(this.getType(card.id), "\n        ");
        if (card.startingSpace) {
            message += "\n            <br>\n            <strong>".concat(_("Starting space:"), "</strong> ").concat(card.startingSpace, "\n            ");
        }
        if (card.discard) {
            message += "\n            <br>\n            <strong>".concat(_("Discard cards:"), "</strong> ").concat(card.discard, "\n            ");
        }
        if (card.locked) {
            message += "\n            <br>\n            <strong>".concat(_("Locked card"), "</strong>\n            ");
        }
        if (typeLetter != 'A') {
            message += "\n            <br>\n            <strong>".concat(_("Initial knowledge:"), "</strong> ").concat(card.initialKnowledge, "\n            <br>\n            <strong>").concat(_("Victory point:"), "</strong> ").concat(card.victoryPoint, "\n            ");
        }
        message += "\n        <br>\n        <strong>".concat(_("Activation:"), "</strong> ").concat(this.game.getTooltipActivation(card.activation), "\n        <br>\n        <br>\n        <strong>").concat(_("Effect:"), "</strong> ").concat((_b = (_a = card.effect) === null || _a === void 0 ? void 0 : _a.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _b !== void 0 ? _b : '', "\n        ");
        return message;
    };
    BuilderCardsManager.prototype.getFullCard = function (card) {
        return __assign(__assign({}, CARDS_DATA[card.id]), { id: card.id, location: card.location, knowledge: card.knowledge });
    };
    BuilderCardsManager.prototype.getFullCards = function (cards) {
        var _this = this;
        return cards.map(function (card) { return _this.getFullCard(card); });
    };
    BuilderCardsManager.prototype.getFullCardById = function (id) {
        return __assign(__assign({}, CARDS_DATA[id]), { id: id });
    };
    BuilderCardsManager.prototype.getFullCardsByIds = function (ids) {
        var _this = this;
        return ids.map(function (id) { return _this.getFullCardById(id); });
    };
    return BuilderCardsManager;
}(CardManager));
var TILE_COLORS = {
    'ancient': '#3c857f',
    'secret': '#b8a222',
    'writing': '#633c37',
};
var TechnologyTilesManager = /** @class */ (function (_super) {
    __extends(TechnologyTilesManager, _super);
    function TechnologyTilesManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "technology-tile-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('technology-tile');
                div.dataset.level = '' + card.level;
            },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            isCardVisible: function (card) { return Boolean(card.type); },
            cardWidth: 221,
            cardHeight: 120,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    TechnologyTilesManager.prototype.setupFrontDiv = function (card, div, ignoreTooltip) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (ignoreTooltip === void 0) { ignoreTooltip = false; }
        var type = card.type;
        var requirement = ((_a = card.requirement) === null || _a === void 0 ? void 0 : _a.length) > 0;
        div.dataset.requirement = requirement.toString();
        div.style.setProperty('--card-color', TILE_COLORS[type]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        var backgroundPositionX = ((card.number - 1) % 9) * 100 / 8;
        var backgroundPositionY = Math.floor((card.number - 1) / 9) * 100 / 4;
        var html = "\n        <div class=\"background\" data-type=\"".concat(type, "\" style=\"background-position: ").concat(backgroundPositionX, "% ").concat(backgroundPositionY, "%\"></div>\n        <div class=\"type-box\" data-type=\"").concat(type, "\">\n            <div class=\"type\" data-type=\"").concat(type, "\">\n                <div class=\"type-icon\"></div>\n            </div>\n        </div>\n        <div class=\"level-box\">\n            <div class=\"level-icon\" data-level=\"").concat(card.level, "\"></div>\n        </div>");
        // TODO TEMP
        html += "<div class=\"implemented\" data-implemented=\"".concat((_c = (_b = card.implemented) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : 'false', "\"></div>");
        if (requirement) {
            html += "<div class=\"requirement\">".concat((_d = card.requirement.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _d !== void 0 ? _d : '', "</div>");
        }
        html += "<div class=\"name-box\">\n            <div class=\"name\">\n                ".concat((_e = card.name) !== null && _e !== void 0 ? _e : '', "\n            </div>\n        </div>\n        <div class=\"center-box\">\n            <div class=\"activation-box\"></div>\n            <div class=\"line left\"></div>\n            <div class=\"line right\"></div>\n            <div class=\"line middle\"></div>\n            <div class=\"activation\" data-type=\"").concat(card.activation, "\"></div>\n        </div>");
        html += "<div class=\"effect\">".concat((_g = (_f = card.effect) === null || _f === void 0 ? void 0 : _f.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _g !== void 0 ? _g : '', "</div>\n        ");
        div.innerHTML = html;
        if (!ignoreTooltip) {
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    };
    TechnologyTilesManager.prototype.getType = function (type) {
        switch (type) {
            case 'ancient': return _('Ancient');
            case 'writing': return _('Writing');
            case 'secret': return _('Secret');
        }
    };
    TechnologyTilesManager.prototype.getTooltip = function (card) {
        var _a, _b, _c;
        var message = "\n        <strong>".concat(card.name, "</strong>\n        <br>\n        <br>\n        <strong>").concat(_("Type:"), "</strong> ").concat(this.getType(card.type), "\n        <br>\n        <strong>").concat(_("Level:"), "</strong> ").concat(card.level + 1, "\n        <br>\n        <strong>").concat(_("Activation:"), "</strong> ").concat(this.game.getTooltipActivation(card.activation), "\n        ");
        if (card.requirement) {
            message += "\n            <br><br>\n            <strong>".concat(_("Requirement:"), "</strong> ").concat((_a = card.requirement.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _a !== void 0 ? _a : '', "\n            ");
        }
        message += "\n        <br>\n        <br>\n        <strong>".concat(_("Effect:"), "</strong> ").concat((_c = (_b = card.effect) === null || _b === void 0 ? void 0 : _b.map(function (text) { return formatTextIcons(text); }).join("<br>")) !== null && _c !== void 0 ? _c : '', "\n        ");
        return message;
    };
    TechnologyTilesManager.prototype.setForHelp = function (card, divId) {
        var div = document.getElementById(divId);
        div.classList.add('card', 'technology-tile');
        div.dataset.side = 'front';
        div.innerHTML = "\n        <div class=\"card-sides\">\n            <div class=\"card-side front\">\n            </div>\n            <div class=\"card-side back\">\n            </div>\n        </div>";
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    };
    TechnologyTilesManager.prototype.getFullCard = function (tile) {
        return __assign(__assign({}, TECHS_DATA[tile.id]), { id: tile.id });
    };
    TechnologyTilesManager.prototype.getFullCards = function (tiles) {
        var _this = this;
        return tiles.map(function (tile) { return _this.getFullCard(tile); });
    };
    TechnologyTilesManager.prototype.getFullCardById = function (id) {
        return __assign(__assign({}, TECHS_DATA[id]), { id: id });
    };
    TechnologyTilesManager.prototype.getFullCardsByIds = function (ids) {
        var _this = this;
        return ids.map(function (id) { return _this.getFullCardById(id); });
    };
    return TechnologyTilesManager;
}(CardManager));
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.technologyTilesDecks = [];
        this.technologyTilesStocks = [];
        [1, 2].forEach(function (level) {
            _this.technologyTilesDecks[level] = new Deck(game.technologyTilesManager, document.getElementById("technology-deck-".concat(level)), {
            // TODO cardNumber: gamedatas.centerDestinationsDeckCount[level],
            // TODO topCard: gamedatas.centerDestinationsDeckTop[level],
            // TODO counter: {},
            });
        });
        [1, 2, 3].forEach(function (number) {
            _this.technologyTilesStocks[number] = new LineStock(game.technologyTilesManager, document.getElementById("table-technology-tiles-".concat(number)), {
                //this.technologyTilesStocks[number] = new SlotStock<TechnologyTile>(game.technologyTilesManager, document.getElementById(`table-technology-tiles-${number}`), {
                //slotsIds: [1, 2, 3],
                center: false,
            });
            _this.technologyTilesStocks[number].onCardClick = function (tile) { return _this.game.onTableTechnologyTileClick(tile); };
        });
        this.refreshTechnologyTiles(gamedatas.techs);
        var cardDeckDiv = document.getElementById("builder-deck");
        this.cardDeck = new Deck(game.builderCardsManager, cardDeckDiv, {
        // TODO cardNumber: gamedatas.cardDeckCount,
        // TODO topCard: gamedatas.cardDeckTop,
        // TODO counter: { counterId: 'deck-counter', },
        });
    }
    TableCenter.prototype.setTechnologyTilesSelectable = function (selectable, selectableCards) {
        var _this = this;
        if (selectableCards === void 0) { selectableCards = null; }
        [1, 2, 3].forEach(function (number) {
            _this.technologyTilesStocks[number].setSelectionMode(selectable ? 'single' : 'none');
            _this.technologyTilesStocks[number].setSelectableCards(selectableCards);
        });
    };
    TableCenter.prototype.refreshTechnologyTiles = function (techs) {
        var _this = this;
        [1, 2, 3].forEach(function (number) {
            var tiles = _this.game.technologyTilesManager.getFullCards(techs.filter(function (tile) { return tile.location == "board_".concat(number); }));
            _this.technologyTilesStocks[number].addCards(tiles);
        });
    };
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var timelineSlotsIds = [];
[1, 0].forEach(function (line) { return [1, 2, 3, 4, 5, 6].forEach(function (space) { return timelineSlotsIds.push("timeline-".concat(space, "-").concat(line)); }); });
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.technologyTilesDecks = [];
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" style=\"--player-color: #").concat(player.color, ";\">\n            <div id=\"player-table-").concat(this.playerId, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n        ");
        if (this.currentPlayer) {
            html += "\n            <div class=\"block-with-text hand-wrapper\">\n                <div class=\"block-label\">".concat(_('Your hand'), "</div>\n                <div id=\"player-table-").concat(this.playerId, "-hand\" class=\"hand cards\"></div>\n            </div>");
        }
        html += "\n            <div id=\"player-table-".concat(this.playerId, "-timeline\" class=\"timeline\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-board\" class=\"player-board\" data-color=\"").concat(player.color, "\">                \n                <div id=\"player-table-").concat(this.playerId, "-past\" class=\"past\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-artifacts\" class=\"artifacts\"></div>\n                <div class=\"technology-tiles-decks\">");
        ['ancient', 'writing', 'secret'].forEach(function (type) {
            html += "\n                    <div id=\"player-table-".concat(_this.playerId, "-technology-tiles-deck-").concat(type, "\" class=\"technology-tiles-deck\" data-type=\"").concat(type, "\"></div>\n                    ");
        });
        html += "\n            </div>\n            </div>\n        </div>\n        ";
        dojo.place(html, document.getElementById('tables'));
        if (this.currentPlayer) {
            this.hand = new LineStock(this.game.builderCardsManager, document.getElementById("player-table-".concat(this.playerId, "-hand")), {
                sort: function (a, b) { return a.id[0] == b.id[0] ? a.number - b.number : a.id.charCodeAt(0) - b.id.charCodeAt(0); },
            });
            this.hand.onCardClick = function (card) { return _this.game.onHandCardClick(card); };
            this.hand.onSelectionChange = function (selection) { return _this.game.onHandCardSelectionChange(selection); };
            this.refreshHand(player.hand);
        }
        var timelineDiv = document.getElementById("player-table-".concat(this.playerId, "-timeline"));
        this.timeline = new SlotStock(this.game.builderCardsManager, timelineDiv, {
            slotsIds: timelineSlotsIds,
            mapCardToSlot: function (card) { return card.location; },
        });
        player.timeline.forEach(function (card) { return _this.createTimelineCard(_this.game.builderCardsManager.getFullCard(card)); });
        timelineSlotsIds.map(function (slotId) { return timelineDiv.querySelector("[data-slot-id=\"".concat(slotId, "\"]")); }).forEach(function (element) { return element.addEventListener('click', function () {
            if (element.classList.contains('selectable')) {
                _this.game.onTimelineSlotClick(element.dataset.slotId);
            }
        }); });
        var artifactsSlotsIds = [];
        [0, 1, 2, 3, 4].forEach(function (space) { return artifactsSlotsIds.push("artefact-".concat(space)); }); // TODO artifact ?
        var artifactsDiv = document.getElementById("player-table-".concat(this.playerId, "-artifacts"));
        this.artifacts = new SlotStock(this.game.builderCardsManager, artifactsDiv, {
            slotsIds: artifactsSlotsIds,
            mapCardToSlot: function (card) { return card.location; },
            gap: '36px',
        });
        // TODO this.artifacts.addCards(player.artifacts);
        var pastDiv = document.getElementById("player-table-".concat(this.playerId, "-past"));
        this.past = new AllVisibleDeck(this.game.builderCardsManager, pastDiv, {});
        this.past.addCards(this.game.builderCardsManager.getFullCards(player.past));
        ['ancient', 'writing', 'secret'].forEach(function (type) {
            var technologyTilesDeckDiv = document.getElementById("player-table-".concat(_this.playerId, "-technology-tiles-deck-").concat(type));
            _this.technologyTilesDecks[type] = new AllVisibleDeck(_this.game.technologyTilesManager, technologyTilesDeckDiv, {});
            var tiles = _this.game.technologyTilesManager.getFullCards(player.techs).filter(function (tile) { return tile.type == type; });
            _this.technologyTilesDecks[type].addCards(tiles);
        });
    }
    PlayerTable.prototype.setHandSelectable = function (selectionMode, selectableCards, stockState, reinitSelection) {
        if (selectableCards === void 0) { selectableCards = null; }
        if (stockState === void 0) { stockState = ''; }
        if (reinitSelection === void 0) { reinitSelection = false; }
        this.hand.setSelectionMode(selectionMode);
        if (selectableCards) {
            this.hand.setSelectableCards(selectableCards);
        }
        document.getElementById("player-table-".concat(this.playerId, "-hand")).dataset.state = stockState;
        if (reinitSelection) {
            this.hand.unselectAll();
        }
    };
    PlayerTable.prototype.setInitialSelection = function (cards) {
        this.hand.addCards(cards);
        this.setHandSelectable('multiple', null, 'initial-selection');
    };
    PlayerTable.prototype.endInitialSelection = function () {
        this.setHandSelectable('none');
    };
    PlayerTable.prototype.createCard = function (card) {
        if (card.id[0] == 'A') {
            return this.artifacts.addCard(card);
        }
        else {
            this.game.builderCardsManager.updateCardInformations(card); // in case card is already on timeline, to update location
            return this.createTimelineCard(card);
        }
    };
    PlayerTable.prototype.createTimelineCard = function (card) {
        var promise = this.timeline.addCard(card);
        this.setCardKnowledge(card.id, card.knowledge);
        return promise;
    };
    PlayerTable.prototype.addTechnologyTile = function (card) {
        return this.technologyTilesDecks[card.type].addCard(card);
    };
    PlayerTable.prototype.refreshHand = function (hand) {
        this.hand.removeAll();
        return this.hand.addCards(this.game.builderCardsManager.getFullCards(hand));
    };
    PlayerTable.prototype.setCardKnowledge = function (cardId, knowledge) {
        var golden = Math.floor(knowledge / 5);
        var basic = knowledge % 5;
        var stockDiv = document.getElementById("".concat(cardId, "-tokens"));
        while (stockDiv.childElementCount > (golden + basic)) {
            stockDiv.removeChild(stockDiv.lastChild);
        }
        while (stockDiv.childElementCount < (golden + basic)) {
            stockDiv.insertAdjacentHTML('beforeend', "<div class=\"knowledge-token\"></div>");
        }
        for (var i = 0; i < (golden + basic); i++) {
            stockDiv.children[i].classList.toggle('golden', i < golden);
        }
    };
    PlayerTable.prototype.setTimelineSelectable = function (selectable, slotIds) {
        if (slotIds === void 0) { slotIds = []; }
        document.getElementById("player-table-".concat(this.playerId, "-timeline")).querySelectorAll(".slot").forEach(function (slot) {
            return slot.classList.toggle('selectable', selectable && slotIds.includes(slot.dataset.slotId));
        });
    };
    PlayerTable.prototype.declineCard = function (card) {
        return this.past.addCard(this.game.builderCardsManager.getFullCard(card));
    };
    PlayerTable.prototype.declineSlideLeft = function () {
        var shiftedCards = this.timeline.getCards().map(function (card) { return (__assign(__assign({}, card), { location: card.location.replace(/(\d)/, function (a) { return "".concat(Number(a) - 1); }) })); });
        return this.timeline.addCards(shiftedCards);
    };
    return PlayerTable;
}());
var FrontState = /** @class */ (function () {
    function FrontState(name, onEntering, onLeaving) {
        if (onLeaving === void 0) { onLeaving = function () { }; }
        this.name = name;
        this.onEntering = onEntering;
        this.onLeaving = onLeaving;
    }
    return FrontState;
}());
var FrontEngine = /** @class */ (function () {
    function FrontEngine(game, states) {
        this.game = game;
        this.states = states;
    }
    FrontEngine.prototype.leaveState = function () {
        var _this = this;
        var _a;
        (_a = this.states.find(function (state) { return state.name == _this.currentState; })) === null || _a === void 0 ? void 0 : _a.onLeaving(this);
    };
    FrontEngine.prototype.enterState = function (name) {
        this.currentState = name;
        this.states.find(function (state) { return state.name == name; }).onEntering(this);
    };
    FrontEngine.prototype.nextState = function (name) {
        this.leaveState();
        this.enterState(name);
    };
    return FrontEngine;
}());
var CreateEngineData = /** @class */ (function () {
    function CreateEngineData(selectedCard, selectedSlot, discardCards) {
        if (selectedCard === void 0) { selectedCard = null; }
        if (selectedSlot === void 0) { selectedSlot = null; }
        if (discardCards === void 0) { discardCards = []; }
        this.selectedCard = selectedCard;
        this.selectedSlot = selectedSlot;
        this.discardCards = discardCards;
    }
    return CreateEngineData;
}());
var CreateEngine = /** @class */ (function (_super) {
    __extends(CreateEngine, _super);
    function CreateEngine(game, possibleCards) {
        var _this = _super.call(this, game, [
            new FrontState('init', function (engine) {
                var _a;
                _this.game.changePageTitle(null);
                if (engine.data.selectedCard) {
                    (_a = _this.game.builderCardsManager.getCardElement(engine.data.selectedCard)) === null || _a === void 0 ? void 0 : _a.classList.remove('created-card');
                    _this.game.getCurrentPlayerTable().hand.addCard(engine.data.selectedCard);
                }
                engine.data.selectedCard = null;
                engine.data.selectedSlot = null;
                engine.data.discardCards = [];
                var selectableCards = Object.keys(_this.possibleCards).map(function (id) { return _this.game.builderCardsManager.getFullCardById(id); });
                _this.game.getCurrentPlayerTable().setHandSelectable('single', selectableCards, 'create-init', true);
            }, function () {
                _this.game.getCurrentPlayerTable().setHandSelectable('none');
            }),
            new FrontState('slot', function (engine) {
                var card = engine.data.selectedCard;
                if (card.id[0] == 'A' || card.locked) {
                    _this.data.selectedSlot = Object.keys(_this.possibleCards[card.id])[0];
                    var stock = card.id[0] == 'A' ?
                        _this.game.getCurrentPlayerTable().artifacts :
                        _this.game.getCurrentPlayerTable().timeline;
                    stock.addCard(_this.data.selectedCard, undefined, {
                        slot: _this.data.selectedSlot,
                    });
                    engine.nextState('discard');
                    return;
                }
                _this.game.changePageTitle("SelectSlot", true);
                engine.data.selectedSlot = null;
                engine.data.discardCards = [];
                _this.addCancel();
                _this.game.getCurrentPlayerTable().setTimelineSelectable(true, Object.keys(_this.possibleCards[card.id]));
            }, function () {
                _this.game.getCurrentPlayerTable().setTimelineSelectable(false);
                _this.removeCancel();
            }),
            new FrontState('discard', function (engine) {
                var discardCount = _this.getDiscardCount();
                if (!discardCount) {
                    _this.nextState('confirm');
                    return;
                }
                _this.game.gamedatas.gamestate.args.discard_number = discardCount;
                _this.game.changePageTitle("SelectDiscard", true);
                engine.data.discardCards = [];
                _this.game.getCurrentPlayerTable().setHandSelectable('multiple', null, 'create-discard', true);
                _this.addConfirmDiscardSelection();
                _this.addCancel();
            }, function () {
                _this.removeConfirmDiscardSelection();
                _this.game.getCurrentPlayerTable().setHandSelectable('none');
                _this.removeCancel();
            }),
            new FrontState('confirm', function (engine) {
                engine.data.discardCards.forEach(function (card) { var _a; return (_a = _this.game.builderCardsManager.getCardElement(card)) === null || _a === void 0 ? void 0 : _a.classList.add('discarded-card'); });
                _this.game.changePageTitle("Confirm", true);
                var card = engine.data.selectedCard;
                var artifact = card.id[0] == 'A';
                var discardedCardsCount = engine.data.discardCards.length;
                var label = '';
                if (artifact) {
                    label = _('Confirm creation of Artifact ${card_name}');
                }
                else {
                    label = discardedCardsCount ?
                        _('Confirm creation of Monument ${card_name} with ${number} discarded cards').replace('${number}', discardedCardsCount) :
                        _('Confirm creation of Monument ${card_name}');
                }
                label = label.replace('${card_name}', card.name);
                _this.game.addPrimaryActionButton('confirmCreate_btn', label, function () { return _this.game.onCreateCardConfirm(engine.data); });
                _this.addCancel();
            }, function (engine) {
                var _a;
                engine.data.discardCards.forEach(function (card) { var _a; return (_a = _this.game.builderCardsManager.getCardElement(card)) === null || _a === void 0 ? void 0 : _a.classList.remove('discarded-card'); });
                _this.removeCancel();
                (_a = document.getElementById('confirmCreate_btn')) === null || _a === void 0 ? void 0 : _a.remove();
            }),
        ]) || this;
        _this.game = game;
        _this.possibleCards = possibleCards;
        _this.data = new CreateEngineData();
        _this.enterState('init');
        return _this;
    }
    CreateEngine.prototype.cardSelectionChange = function (selection) {
        if (this.currentState == 'init') {
            if (selection.length == 1) {
                this.selectCard(selection[0]);
            }
        }
        else if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    };
    CreateEngine.prototype.selectCard = function (card) {
        var _a;
        this.data.selectedCard = card;
        (_a = this.game.builderCardsManager.getCardElement(card)) === null || _a === void 0 ? void 0 : _a.classList.add('created-card');
        this.game.getCurrentPlayerTable().hand.unselectCard(card);
        this.nextState('slot');
    };
    CreateEngine.prototype.selectSlot = function (slotId) {
        this.data.selectedSlot = slotId;
        this.game.getCurrentPlayerTable().timeline.addCard(this.data.selectedCard, undefined, {
            slot: slotId,
        });
        this.nextState('discard');
    };
    CreateEngine.prototype.addCancel = function () {
        var _this = this;
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), function () { return _this.nextState('init'); });
    };
    CreateEngine.prototype.removeCancel = function () {
        var _a;
        (_a = document.getElementById('restartCardCreation_btn')) === null || _a === void 0 ? void 0 : _a.remove();
    };
    CreateEngine.prototype.addConfirmDiscardSelection = function () {
        var _this = this;
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), function () { return _this.nextState('confirm'); });
        this.setConfirmDiscardSelectionState();
    };
    CreateEngine.prototype.removeConfirmDiscardSelection = function () {
        var _a;
        (_a = document.getElementById('confirmDiscardSelection_btn')) === null || _a === void 0 ? void 0 : _a.remove();
    };
    CreateEngine.prototype.setConfirmDiscardSelectionState = function () {
        var _a;
        var discardCount = this.getDiscardCount();
        (_a = document.getElementById('confirmDiscardSelection_btn')) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', discardCount != this.data.discardCards.length);
    };
    CreateEngine.prototype.getDiscardCount = function () {
        var card = this.data.selectedCard;
        if (!card) {
            return null;
        }
        var slot = card.id[0] == 'A' || card.locked ?
            Object.keys(this.possibleCards[card.id])[0] :
            this.data.selectedSlot;
        return this.possibleCards[card.id][slot];
    };
    return CreateEngine;
}(FrontEngine));
var ANIMATION_MS = 500;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_ZOOM_KEY = 'AncientKnowledge-zoom';
var LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'AncientKnowledge-jump-to-folded';
var AncientKnowledge = /** @class */ (function () {
    function AncientKnowledge() {
        this.playersTables = [];
        this.handCounters = [];
        this.lostKnowledgeCounters = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        this._notif_uid_to_log_id = [];
        this._notif_uid_to_mobile_log_id = [];
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    AncientKnowledge.prototype.setup = function (gamedatas) {
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        // TODO TEMP
        Object.values(gamedatas.players).forEach(function (player, index) {
            //const playerId = Number(player.id);
            //if (playerId == this.getPlayerId()) {
            //    player.hand = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId);
            //}
            //player.handCount = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId).length;
        });
        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.builderCardsManager = new BuilderCardsManager(this);
        this.technologyTilesManager = new TechnologyTilesManager(this);
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#224757' })
            ],
            entryClasses: 'round-point',
            defaultFolded: true,
        });
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.zoomManager = new ZoomManager({
            element: document.getElementById('table'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onDimensionsChange: function () {
                var tablesAndCenter = document.getElementById('tables-and-center');
                var clientWidth = tablesAndCenter.clientWidth;
                tablesAndCenter.classList.toggle('double-column', clientWidth > 2478); // TODO player board size + table size
            },
        });
        new HelpManager(this, {
            buttons: [
                new BgaHelpPopinButton({
                    title: _("Card help").toUpperCase(),
                    html: this.getHelpHtml(),
                    onPopinCreated: function () { return _this.populateHelp(); },
                    buttonBackground: '#87a04f',
                }),
            ]
        });
        this.setupNotifications();
        this.setupPreferences();
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    AncientKnowledge.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        var _a, _b, _c, _d;
        log('Entering state: ' + stateName, args.args);
        if (args.args && args.args.descSuffix) {
            this.changePageTitle(args.args.descSuffix);
        }
        if (args.args && args.args.optionalAction) {
            var base = args.args.descSuffix ? args.args.descSuffix : '';
            this.changePageTitle(base + 'skippable');
        }
        // TODO? if (this._activeStates.includes(stateName) && !this.isCurrentPlayerActive()) return;
        if (args.args && args.args.optionalAction && !args.args.automaticAction) {
            this.addSecondaryActionButton('btnPassAction', _('Pass'), function () { return _this.takeAction('actPassOptionalAction'); }, 'restartAction');
        }
        // Undo last steps
        (_b = (_a = args.args) === null || _a === void 0 ? void 0 : _a.previousSteps) === null || _b === void 0 ? void 0 : _b.forEach(function (stepId) {
            var logEntry = $('logs').querySelector(".log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
            if (logEntry) {
                _this.onClick(logEntry, function () { return _this.undoToStep(stepId); });
            }
            logEntry = document.querySelector(".chatwindowlogs_zone .log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
            if (logEntry) {
                _this.onClick(logEntry, function () { return _this.undoToStep(stepId); });
            }
        });
        // Restart turn button
        if (((_c = args.args) === null || _c === void 0 ? void 0 : _c.previousEngineChoices) >= 1 && !args.args.automaticAction) {
            if ((_d = args.args) === null || _d === void 0 ? void 0 : _d.previousSteps) {
                var lastStep_1 = Math.max.apply(Math, args.args.previousSteps);
                if (lastStep_1 > 0)
                    this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), function () { return _this.undoToStep(lastStep_1); }, 'restartAction');
            }
            // Restart whole turn
            this.addDangerActionButton('btnRestartTurn', _('Restart turn'), function () {
                _this.stopActionTimer();
                _this.takeAction('actRestart');
            }, 'restartAction');
        }
        /* TODO? if (this.isCurrentPlayerActive() && args.args) {
            // Anytime buttons
            args.args.anytimeActions?.forEach((action, i) => {
                let msg = action.desc;
                msg = msg.log ? this.fsr(msg.log, msg.args) : _(msg);
                msg = this.formatString(msg);

                this.addPrimaryActionButton(
                'btnAnytimeAction' + i,
                msg,
                () => this.takeAction('actAnytimeAction', { id: i }, false),
                'anytimeActions'
                );
            });
        }*/
        switch (stateName) {
            case 'create':
                this.onEnteringCreate(args.args);
                break;
            case 'learn':
                this.onEnteringLearn(args.args);
                break;
        }
    };
    /*
     * Add a blue/grey button if it doesn't already exists
     */
    AncientKnowledge.prototype.addPrimaryActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'blue');
    };
    AncientKnowledge.prototype.addSecondaryActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'gray');
    };
    AncientKnowledge.prototype.addDangerActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'red');
    };
    AncientKnowledge.prototype.changePageTitle = function (suffix, save) {
        if (suffix === void 0) { suffix = null; }
        if (save === void 0) { save = false; }
        if (suffix == null) {
            suffix = 'generic';
        }
        if (!this.gamedatas.gamestate['descriptionmyturn' + suffix]) {
            return;
        }
        if (save) {
            this.gamedatas.gamestate.descriptionmyturngeneric = this.gamedatas.gamestate.descriptionmyturn;
            this.gamedatas.gamestate.descriptiongeneric = this.gamedatas.gamestate.description;
        }
        this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate['descriptionmyturn' + suffix];
        if (this.gamedatas.gamestate['description' + suffix])
            this.gamedatas.gamestate.description = this.gamedatas.gamestate['description' + suffix];
        this.updatePageTitle();
    };
    AncientKnowledge.prototype.onEnteringInitialSelection = function (args) {
        var cards = this.builderCardsManager.getFullCardsByIds(args._private.cards);
        this.getCurrentPlayerTable().setInitialSelection(cards);
    };
    AncientKnowledge.prototype.onEnteringCreate = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.createEngine = new CreateEngine(this, args._private.cards);
        }
    };
    AncientKnowledge.prototype.onEnteringLearn = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.tableCenter.setTechnologyTilesSelectable(true /*, args.techs*/);
        }
    };
    AncientKnowledge.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        this.removeActionButtons();
        document.getElementById('customActions').innerHTML = '';
        document.getElementById('restartAction').innerHTML = '';
        switch (stateName) {
            case 'initialSelection':
                this.onLeavingInitialSelection();
                break;
            case 'create':
                this.onLeavingCreate();
                break;
            case 'learn':
                this.onLeavingLearn();
                break;
        }
    };
    AncientKnowledge.prototype.onLeavingInitialSelection = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.endInitialSelection();
    };
    AncientKnowledge.prototype.onLeavingCreate = function () {
        this.createEngine.leaveState();
        this.createEngine = null;
    };
    AncientKnowledge.prototype.onLeavingLearn = function () {
        this.tableCenter.setTechnologyTilesSelectable(false);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    AncientKnowledge.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'initialSelection':
                    //const initialSelectionArgs = args as EnteringInitialSelectionArgs;
                    this.onEnteringInitialSelection(args);
                    this.addActionButton("actSelectCardsToDiscard_button", _('Keep selected cards'), function () { return _this.actSelectCardsToDiscard(); });
                    document.getElementById('actSelectCardsToDiscard_button').classList.add('disabled');
                    break;
                case 'chooseAction':
                    [
                        ['create', _('Create')],
                        ['learn', _('Learn')],
                        ['excavate', _('Excavate')],
                        ['archive', _('Archive')],
                        ['search', _('Search')],
                    ].forEach(function (codeAndLabel) {
                        return _this.addActionButton("actChooseAction_".concat(codeAndLabel[0], "_button"), "<div class=\"action-icon ".concat(codeAndLabel[0], "\"></div> ").concat(codeAndLabel[1]), function () { return _this.takeAtomicAction('actChooseAction', [codeAndLabel[0]]); });
                    });
                    //(this as any).addActionButton(`actRestart_button`, _("Restart"), () => this.actRestart(), null, null, 'gray');
                    break;
                case 'confirmTurn':
                    this.addActionButton("actConfirmTurn_button", _("Confirm turn"), function () { return _this.actConfirmTurn(); });
                //(this as any).addActionButton(`actRestart_button`, _("Restart"), () => this.actRestart(), null, null, 'gray');
            }
        }
        else {
            switch (stateName) {
                case 'initialSelection':
                    this.addActionButton("actCancelSelection_button", _('Cancel'), function () { return _this.actCancelSelection(); }, null, null, 'gray');
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    AncientKnowledge.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    AncientKnowledge.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    };
    AncientKnowledge.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    AncientKnowledge.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    AncientKnowledge.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    AncientKnowledge.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
    };
    AncientKnowledge.prototype.getGameStateName = function () {
        return this.gamedatas.gamestate.name;
    };
    AncientKnowledge.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
    };
    AncientKnowledge.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    AncientKnowledge.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            document.getElementById("player_score_".concat(player.id)).insertAdjacentHTML('beforebegin', "<div class=\"vp icon\"></div>");
            document.getElementById("icon_point_".concat(player.id)).remove();
            /**/
            var html = "<div class=\"counters\">\n                <div id=\"playerhand-counter-wrapper-".concat(player.id, "\" class=\"playerhand-counter\">\n                    <div class=\"player-hand-card\"></div> \n                    <span id=\"playerhand-counter-").concat(player.id, "\"></span>\n                </div>\n            \n                <div id=\"lost-knowledge-counter-wrapper-").concat(player.id, "\" class=\"lost-knowledge-counter\">\n                    <div class=\"lost-knowledge icon\"></div>\n                    <span id=\"lost-knowledge-counter-").concat(player.id, "\"></span>\n                </div>\n\n            </div><div class=\"counters\">\n            \n                <div id=\"recruit-counter-wrapper-").concat(player.id, "\" class=\"recruit-counter\">\n                    <div class=\"recruit icon\"></div>\n                    <span id=\"recruit-counter-").concat(player.id, "\"></span>\n                </div>\n            \n                <div id=\"bracelet-counter-wrapper-").concat(player.id, "\" class=\"bracelet-counter\">\n                    <div class=\"bracelet icon\"></div>\n                    <span id=\"bracelet-counter-").concat(player.id, "\"></span>\n                </div>\n                \n            </div>\n            <div>").concat(playerId == gamedatas.firstPlayerId ? "<div id=\"first-player\">".concat(_('First player'), "</div>") : '', "</div>");
            dojo.place(html, "player_board_".concat(player.id));
            var handCounter = new ebg.counter();
            handCounter.create("playerhand-counter-".concat(playerId));
            handCounter.setValue(player.handCount);
            _this.handCounters[playerId] = handCounter;
            _this.lostKnowledgeCounters[playerId] = new ebg.counter();
            _this.lostKnowledgeCounters[playerId].create("lost-knowledge-counter-".concat(playerId));
            _this.lostKnowledgeCounters[playerId].setValue(player.lostKnowledge);
        });
        this.setTooltipToClass('lost-knowledge-counter', _('Lost knowledge'));
    };
    AncientKnowledge.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    AncientKnowledge.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    };
    AncientKnowledge.prototype.updateGains = function (playerId, gains) {
        Object.entries(gains).forEach(function (entry) {
            var type = Number(entry[0]);
            var amount = entry[1];
            if (amount != 0) {
                switch (type) {
                    /*case VP:
                        this.setScore(playerId, (this as any).scoreCtrl[playerId].getValue() + amount);
                        break;
                    case BRACELET:
                        this.setBracelets(playerId, this.braceletCounters[playerId].getValue() + amount);
                        break;
                    case RECRUIT:
                        this.setRecruits(playerId, this.recruitCounters[playerId].getValue() + amount);
                        break;
                    case REPUTATION:
                        this.setReputation(playerId, this.tableCenter.getReputation(playerId) + amount);
                        break;*/
                }
            }
        });
    };
    AncientKnowledge.prototype.setScore = function (playerId, score) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
        this.tableCenter.setScore(playerId, score);
    };
    AncientKnowledge.prototype.setReputation = function (playerId, count) {
        this.lostKnowledgeCounters[playerId].toValue(count);
        this.tableCenter.setReputation(playerId, count);
    };
    AncientKnowledge.prototype.setRecruits = function (playerId, count) {
        this.recruitCounters[playerId].toValue(count);
        this.getPlayerTable(playerId).updateCounter('recruits', count);
    };
    AncientKnowledge.prototype.setBracelets = function (playerId, count) {
        this.braceletCounters[playerId].toValue(count);
        this.getPlayerTable(playerId).updateCounter('bracelets', count);
    };
    AncientKnowledge.prototype.getHelpHtml = function () {
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_("Assets"), "</h2>\n            <div class=\"help-section\">\n                <div class=\"icon vp\"></div>\n                <div class=\"help-label\">").concat(_("Gain 1 <strong>Victory Point</strong>. The player moves their token forward 1 space on the Score Track."), "</div>\n            </div>\n            <div class=\"help-section\">\n                <div class=\"icon recruit\"></div>\n                <div class=\"help-label\">").concat(_("Gain 1 <strong>Recruit</strong>: The player adds 1 Recruit token to their ship."), " ").concat(_("It is not possible to have more than 3."), " ").concat(_("A recruit allows a player to draw the Viking card of their choice when Recruiting or replaces a Viking card during Exploration."), "</div>\n            </div>\n            <div class=\"help-section\">\n                <div class=\"icon bracelet\"></div>\n                <div class=\"help-label\">").concat(_("Gain 1 <strong>Silver Bracelet</strong>: The player adds 1 Silver Bracelet token to their ship."), " ").concat(_("It is not possible to have more than 3."), " ").concat(_("They are used for Trading."), "</div>\n            </div>\n            <div class=\"help-section\">\n                <div class=\"icon reputation\"></div>\n                <div class=\"help-label\">").concat(_("Gain 1 <strong>Reputation Point</strong>: The player moves their token forward 1 space on the Reputation Track."), "</div>\n            </div>\n            <div class=\"help-section\">\n                <div class=\"icon take-card\"></div>\n                <div class=\"help-label\">").concat(_("Draw <strong>the first Viking card</strong> from the deck: It is placed in the player’s Crew Zone (without taking any assets)."), "</div>\n            </div>\n\n            <h1>").concat(_("Powers of the artifacts (variant option)"), "</h1>\n        ");
        for (var i = 1; i <= 7; i++) {
            html += "\n            <div class=\"help-section\">\n                <div id=\"help-artifact-".concat(i, "\"></div>\n                <div>").concat(this.technologyTilesManager.getTooltip(i), "</div>\n            </div> ");
        }
        html += "</div>";
        return html;
    };
    AncientKnowledge.prototype.populateHelp = function () {
        for (var i = 1; i <= 7; i++) {
            this.technologyTilesManager.setForHelp(i, "help-artifact-".concat(i));
        }
    };
    AncientKnowledge.prototype.onTableTechnologyTileClick = function (tile) {
        if (this.gamedatas.gamestate.name == 'learn') {
            this.takeAtomicAction('actLearn', [
                tile.id,
            ]);
        }
    };
    AncientKnowledge.prototype.onHandCardClick = function (card) {
        if (this.gamedatas.gamestate.name == 'create') {
            /*this.takeAtomicAction('actCreate', [
                card.id,
                card.id[0] == 'A' ? `artefact-0` : `timeline-${card.startingSpace}-0`, // TODO space to build
                [], // TODO cards to discard
            ]);*/
        }
    };
    /*public updateCreatePageTitle() {
        if (this.selectedCard) {
            // TODO
        } else {
            this.changePageTitle(null);
        }
    }*/
    AncientKnowledge.prototype.onHandCardSelectionChange = function (selection) {
        var _a;
        if (this.gamedatas.gamestate.name == 'initialSelection') {
            document.getElementById('actSelectCardsToDiscard_button').classList.toggle('disabled', selection.length != 6);
        }
        else if (this.gamedatas.gamestate.name == 'create') {
            (_a = this.createEngine) === null || _a === void 0 ? void 0 : _a.cardSelectionChange(selection);
        }
    };
    AncientKnowledge.prototype.onTimelineSlotClick = function (slotId) {
        this.createEngine.selectSlot(slotId);
    };
    AncientKnowledge.prototype.onCreateCardConfirm = function (data) {
        this.takeAtomicAction('actCreate', [
            data.selectedCard.id,
            data.selectedSlot,
            data.discardCards.map(function (card) { return card.id; }),
        ]);
    };
    AncientKnowledge.prototype.onTableCardClick = function (card) {
        /*if (this.gamedatas.gamestate.name == 'discardTableCard') {
            this.discardTableCard(card.id);
        } else {
            this.chooseNewCard(card.id);
        }*/
    };
    AncientKnowledge.prototype.onPlayedCardClick = function (card) {
        /*if (this.gamedatas.gamestate.name == 'discardCard') {
            this.discardCard(card.id);
        } else {
            this.setPayDestinationLabelAndState();
        }*/
    };
    AncientKnowledge.prototype.actSelectCardsToDiscard = function () {
        if (!this.checkAction('actSelectCardsToDiscard')) {
            return;
        }
        var selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        var discardCards = this.getCurrentPlayerTable().hand.getCards().filter(function (card) { return !selectedCards.some(function (sc) { return sc.id == card.id; }); });
        this.takeAction('actSelectCardsToDiscard', {
            cardIds: JSON.stringify(discardCards.map(function (card) { return card.id; })),
        });
    };
    AncientKnowledge.prototype.actCancelSelection = function () {
        this.takeAction('actCancelSelection');
    };
    AncientKnowledge.prototype.actConfirmTurn = function () {
        if (!this.checkAction('actConfirmTurn')) {
            return;
        }
        this.takeAction('actConfirmTurn');
    };
    AncientKnowledge.prototype.actConfirmPartialTurn = function () {
        if (!this.checkAction('actConfirmPartialTurn')) {
            return;
        }
        this.takeAction('actConfirmPartialTurn');
    };
    AncientKnowledge.prototype.actRestart = function () {
        if (!this.checkAction('actRestart')) {
            return;
        }
        this.takeAction('actRestart');
    };
    AncientKnowledge.prototype.takeAtomicAction = function (action, args, warning) {
        if (args === void 0) { args = {}; }
        if (warning === void 0) { warning = false; }
        if (!this.checkAction(action))
            return false;
        //(this as any).askConfirmation(warning, () =>
        this.takeAction('actTakeAtomicAction', { actionName: action, actionArgs: JSON.stringify(args) } /*, false*/);
        //);
    };
    AncientKnowledge.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/ancientknowledge/ancientknowledge/".concat(action, ".html"), data, this, function () { });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    AncientKnowledge.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        dojo.connect(this.notifqueue, 'addToLog', function () {
            _this.addLogClass();
        });
        var notifs = [
            ['pDrawCards', undefined],
            ['pDiscardCards', undefined],
            ['createCard', undefined],
            ['fillPool', undefined],
            ['discardLostKnowledge', 1],
            ['learnTech', undefined],
            ['clearTurn', 1],
            ['refreshUI', 1],
            ['refreshHand', 1],
            ['declineCard', undefined],
            ['declineSlideLeft', undefined],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, function (notifDetails) {
                log("notif_".concat(notif[0]), notifDetails.args);
                var promise = _this["notif_".concat(notif[0])](notifDetails.args);
                // tell the UI notification ends, if the function returned a promise
                promise === null || promise === void 0 ? void 0 : promise.then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
            });
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
        if (isDebug) {
            notifs.forEach(function (notif) {
                if (!_this["notif_".concat(notif[0])]) {
                    console.warn("notif_".concat(notif[0], " function is not declared, but listed in setupNotifications"));
                }
            });
            Object.getOwnPropertyNames(AncientKnowledge.prototype).filter(function (item) { return item.startsWith('notif_'); }).map(function (item) { return item.slice(6); }).forEach(function (item) {
                if (!notifs.some(function (notif) { return notif[0] == item; })) {
                    console.warn("notif_".concat(item, " function is declared, but not listed in setupNotifications"));
                }
            });
        }
    };
    AncientKnowledge.prototype.notif_pDrawCards = function (args) {
        return this.getPlayerTable(args.player_id).hand.addCards(this.builderCardsManager.getFullCards(args.cards));
    };
    AncientKnowledge.prototype.notif_pDiscardCards = function (args) {
        this.getPlayerTable(args.player_id).hand.removeCards(args.cards);
        return Promise.resolve(true);
    };
    AncientKnowledge.prototype.notif_createCard = function (args) {
        if (args.card.id[0] == 'T') {
            var tile = this.technologyTilesManager.getFullCard(args.card);
            return this.getPlayerTable(args.player_id).addTechnologyTile(tile);
        }
        else {
            var card = this.builderCardsManager.getFullCard(args.card);
            return this.getPlayerTable(args.player_id).createCard(card);
        }
    };
    AncientKnowledge.prototype.notif_fillPool = function (args) {
        var _this = this;
        var tiles = Object.values(args.cards);
        var promises = [1, 2, 3].map(function (number) {
            var numberTilesId = tiles.filter(function (tile) { return tile.location == "board_".concat(number); }).map(function (tile) { return tile.id; });
            var numberTiles = _this.technologyTilesManager.getFullCardsByIds(numberTilesId);
            return _this.tableCenter.technologyTilesStocks[number].addCards(numberTiles);
        });
        return Promise.all(promises);
    };
    AncientKnowledge.prototype.notif_discardLostKnowledge = function (args) {
        //  TODO
    };
    AncientKnowledge.prototype.notif_learnTech = function (args) {
        return this.getPlayerTable(args.player_id).addTechnologyTile(args.card);
    };
    AncientKnowledge.prototype.notif_clearTurn = function (args) {
        this.cancelLogs(args.notifIds);
    };
    AncientKnowledge.prototype.notif_refreshUI = function (args) {
        //  TODO refresh cards ?
        //  TODO refresh players
        this.tableCenter.refreshTechnologyTiles(args.datas.techs);
    };
    AncientKnowledge.prototype.notif_refreshHand = function (args) {
        return this.getPlayerTable(args.player_id).refreshHand(args.hand);
    };
    AncientKnowledge.prototype.notif_declineCard = function (args) {
        return this.getPlayerTable(args.player_id).declineCard(args.card);
    };
    AncientKnowledge.prototype.notif_declineSlideLeft = function (args) {
        return this.getPlayerTable(args.player_id).declineSlideLeft();
    };
    /*
pour REMOVE_KNOWLEDGE, il faudra gérer plusieurs comportements en fonction du champs 'type'
je t'envoie une liste d'ids de carte, un entier n, et type qui est soit OR/XOR/SEQ
SEQ ça veut dire qu'il faut enlever $n knowledge de chaque carte => c'est automatique donc rien à faire pour toi
XOR ça veut dire qu'il faut enlever $n knowledge d'exactement une carte parmis celles des args
OR c'est le cas "normal" où tu répartis les $n comme tu veux parmis les cartes des args
et pour actRemoveKnowleldge j'attends un tableau associatif : ['cardId' => n1, 'cardId2' => n2, ...]
    */
    /*
    * [Undocumented] Called by BGA framework on any notification message
    * Handle cancelling log messages for restart turn
    */
    /* @Override */
    AncientKnowledge.prototype.onPlaceLogOnChannel = function (msg) {
        var currentLogId = this.notifqueue.next_log_id;
        var currentMobileLogId = this.next_log_id;
        var res = this.inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
        this._last_notif = {
            logId: currentLogId,
            mobileLogId: currentMobileLogId,
            msg: msg,
        };
        return res;
    };
    AncientKnowledge.prototype.cancelLogs = function (notifIds) {
        var _this = this;
        notifIds.forEach(function (uid) {
            if (_this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                var logId = _this._notif_uid_to_log_id[uid];
                if ($('log_' + logId)) {
                    dojo.addClass('log_' + logId, 'cancel');
                }
            }
            if (_this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
                var mobileLogId = _this._notif_uid_to_mobile_log_id[uid];
                if ($('dockedlog_' + mobileLogId)) {
                    dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
                }
            }
        });
    };
    AncientKnowledge.prototype.addLogClass = function () {
        var _a;
        if (this._last_notif == null) {
            return;
        }
        var notif = this._last_notif;
        var type = notif.msg.type;
        if (type == 'history_history') {
            type = notif.msg.args.originalType;
        }
        if ($('log_' + notif.logId)) {
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
            var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
            (_a = this[methodName]) === null || _a === void 0 ? void 0 : _a.call(this, notif);
        }
        if ($('dockedlog_' + notif.mobileLogId)) {
            dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
        }
    };
    AncientKnowledge.prototype.onClick = function (elem, callback) {
        elem.addEventListener('click', callback);
    };
    AncientKnowledge.prototype.onAddingNewUndoableStepToLog = function (notif) {
        var _this = this;
        var _a, _b, _c, _d;
        if (!$("log_".concat(notif.logId))) {
            return;
        }
        var stepId = notif.msg.args.stepId;
        $("log_".concat(notif.logId)).dataset.step = stepId;
        if ($("dockedlog_".concat(notif.mobileLogId))) {
            $("dockedlog_".concat(notif.mobileLogId)).dataset.step = stepId;
        }
        if ((_d = (_c = (_b = (_a = this.gamedatas) === null || _a === void 0 ? void 0 : _a.gamestate) === null || _b === void 0 ? void 0 : _b.args) === null || _c === void 0 ? void 0 : _c.previousSteps) === null || _d === void 0 ? void 0 : _d.includes(parseInt(stepId))) {
            this.onClick($("log_".concat(notif.logId)), function () { return _this.undoToStep(stepId); });
            if ($("dockedlog_".concat(notif.mobileLogId))) {
                this.onClick($("dockedlog_".concat(notif.mobileLogId)), function () { return _this.undoToStep(stepId); });
            }
        }
    };
    AncientKnowledge.prototype.undoToStep = function (stepId) {
        this.stopActionTimer();
        this.checkAction('actRestart');
        this.takeAction('actUndoToStep', { stepId: stepId } /*, false*/);
    };
    AncientKnowledge.prototype.stopActionTimer = function () {
        console.warn('TODO');
    };
    AncientKnowledge.prototype.getGain = function (type) {
        switch (type) {
            case 1: return _("Victory Point");
            case 2: return _("Bracelet");
            case 3: return _("Recruit");
            case 4: return _("Reputation");
            case 5: return _("Card");
        }
    };
    AncientKnowledge.prototype.getTooltipActivation = function (activation) {
        switch (activation) {
            case 'anytime': return _("Ongoing (with conditions)");
            case 'decline': return _("Decline Phase");
            case 'immediate': return _("Immediate");
            case 'timeline': return _("Timeline Phase");
            case 'endgame': return _("Final Scoring");
        }
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    AncientKnowledge.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                for (var property in args) {
                    /*if (['card_names'].includes(property) && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }*/
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return AncientKnowledge;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.ancientknowledge", ebg.core.gamegui, new AncientKnowledge());
});
