/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class ConstsDOM {
    constructor () {

    }

    static get () {
        return {
            $text: $('.text')
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ConstsDOM;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ConstsDOM__ = __webpack_require__(0);
/**
 * управляем отображением поповеров
 */

class PopoverControl {
    constructor () {

    }

    /**
     *
     * @param $popoversParents[] {object}
     */
    static init ($popoversParents) {
        $popoversParents.each(function (index, popoverParent) {
            $(popoverParent).find('.obj-img__wrapper').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let $triggerButton = $(this);
                let $popover = $(popoverParent).find('.add-settings');

                /**
                 * скрываем все поповеры,
                 * кроме актуальной
                 */
                PopoverControl._closeAllOtherPopovers($('.add-settings.active'), $popover);

                /**
                 * деактивируем все триггер-кнопки,
                 * кроме той, по которой щас кликнули
                 */
                PopoverControl._closeAllOtherTriggerButtons($('.obj-img__wrapper.active'), $triggerButton);

                $popover.toggleClass('active');
                $triggerButton.toggleClass('active');

                /**
                 * позиционируем поповер
                 */
                PopoverControl._positioning($triggerButton, $popover);

                /**
                 * навешиваем дополнительные события
                 * (для скрытия попапа и т.д.)
                 */
                PopoverControl._additionalEvents($triggerButton, $popover);
            });
        });
    }

    /**
     *
     * @param $popovers[] {object}
     * @param $popoverActual {object}
     * @private
     */
    static _closeAllOtherPopovers ($popovers, $popoverActual) {
        $popovers.each(function () {
            if ($(this)[0] !== $popoverActual[0]) $(this).removeClass('active');
        });
    }

    /**
     *
     * @param $triggerButtons[] {object}
     * @param $triggerButtonActual {object}
     * @private
     */
    static _closeAllOtherTriggerButtons ($triggerButtons, $triggerButtonActual) {
        $triggerButtons.each(function () {
            if ($(this)[0] !== $triggerButtonActual[0]) $(this).removeClass('active');
        });
    }

    /**
     *
     * @param $triggerButton {object}
     * @param $popover {object}
     * @private
     */
    static _additionalEvents ($triggerButton, $popover) {
        /**
         * убираем всплытие события клик у поповера,
         * чтобы он не закрывался при нём
         */
        setTimeout(function () {
            $popover.on('click', function (e) {
                e.stopPropagation();
            });
        }, 0);

        /**
         * клик в любом месте документа,
         * кроме самого этого элемента
         * скроет поповер
         */
        setTimeout(function () {
            $(document).one('click', function () {
                $popover.removeClass('active');
                $popover.off('click');
                $triggerButton.removeClass('active');
            });
        }, 0);
    }

    /**
     *
     * @param $triggerButton {object}
     * @param $popover {object}
     * @private
     */
    static _positioning ($triggerButton, $popover) {
        /**
         * сбрасываем все изменения,
         * чтобы позиционирование сработало нормально.
         * скрываем элемент на время позиционирования.
         *
         */
        PopoverControl._positioningBefore($popover);

        /**
         *
         * получаем координаты всех нужных объектов
         */
        let coords = PopoverControl._getCoords($triggerButton, $popover);

        /**
         *
         * transform работает гораздо быстрее всяких margin,
         * потому что браузер не перерисовывает DOM-дерево
         */

        let top = Math.abs(parseInt(coords.$popoverBottom.bottom - coords.$popover.top));

        $popover.css({'transform' : 'translateY(-' + top + 'px)'});

        /**
         * если правая точка поповера заходит
         * на край блока с текстом, двигаем его назад + небольшой отступ.
         * аналогично с левой точкой
         */
        if (coords.$popover.right >= coords.$text.right) {
            let right = Math.abs(parseInt(coords.$popover.right - coords.$text.right + 10 /*padding-right*/));

            $popover.css({'transform' : 'translate(-' + right + 'px, ' + '-' + top + 'px)'});
        } else if (coords.$popover.left <= coords.$text.left) {
            let left = Math.abs(parseInt(coords.$popover.left - coords.$text.left + 10 /*padding-left*/));

            $popover.css({'transform' : 'translate(' + left + 'px, ' + '-' + top + 'px)'});
        }

        /**
         *
         * после того как поповер был сдвинут,
         * координаты его нижней части были измененеы,
         * их нужно актуализировать, ещё раз получив их
         */
        coords.$popoverBottom = $popover.find('.add-settings__bottom')[0].getBoundingClientRect();

        /**
         * зеркалим нижнюю часть поповера,
         * если триггер-кнопка правее его
         */
        let $addSettingsBottom = $popover.find('.add-settings__bottom');

        if ((coords.$popoverBottom.left - parseInt($addSettingsBottom.css('left'))) < coords.$triggerButton.left) {
            $addSettingsBottom.addClass('revert');
        }

        /**
         * когда позиционирование было завершено,
         * проявляем элемент
         */
        PopoverControl._positioningAfter($popover);
    }

    /**
     *
     * @param $popover {object}
     * @private
     */
    static _positioningBefore ($popover) {
        $popover.css({
            'transform' : 'translate(0, 0)',
            'opacity' : '0'
        });

        let $addSettingsBottom = $popover.find('.add-settings__bottom');
        $addSettingsBottom.removeClass('revert');
    }

    /**
     *
     * @param $triggerButton {object}
     * @param $popover {object}
     * @private
     */
    static _getCoords ($triggerButton, $popover) {
        const constsDom = __WEBPACK_IMPORTED_MODULE_0__ConstsDOM__["a" /* default */].get();

        return {
            $popover: $popover[0].getBoundingClientRect(),
            $triggerButton: $triggerButton[0].getBoundingClientRect(),
            $text: constsDom.$text[0].getBoundingClientRect(),
            //$text: $('.text')[0].getBoundingClientRect(),
            $popoverBottom: $popover.find('.add-settings__bottom')[0].getBoundingClientRect()
        };
    }

    /**
     *
     * @param $popover {object}
     * @private
     */
    static _positioningAfter ($popover) {
        $popover.css({
            'opacity' : ''
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = PopoverControl;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ConstsDOM__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__PopoverControl__ = __webpack_require__(1);



$(window).load(function () {
    const constDom = __WEBPACK_IMPORTED_MODULE_0__ConstsDOM__["a" /* default */].get();

    //customScrollBar
    constDom.$text.mCustomScrollbar({
        theme: 'activeBook-default',
        autoDraggerLength: true,
        mouseWheel: {scrollAmount: 75}
    });

    //ionRangeSlider
    $('.js-range-slider').ionRangeSlider({
        min: 0,
        max: 100,
        from: 50,
        hide_min_max: true,
        hide_from_to: true
    });

    //отображаем доп. меню для элементов с поповером
    __WEBPACK_IMPORTED_MODULE_1__PopoverControl__["a" /* default */].init($('.menu__item').has('.add-settings'));

    $('.add-settings__item__toggle__item').on('click', function () {
       let $parent = $(this).closest('.add-settings__item__toggle');

       if (!$(this).hasClass('active')) {
           $parent.find('.add-settings__item__toggle__item').removeClass('active');
           $(this).addClass('active');
       }
    });

    $('.add-settings__item__theme-option').on('click', function () {
        let $parent = $(this).closest('.add-settings__item.theme-options');

        if (!$(this).hasClass('active')) {
            $parent.find('.add-settings__item__theme-option').removeClass('active');
            $(this).addClass('active');
        }
    });
});

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map