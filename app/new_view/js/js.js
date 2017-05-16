$(window).load(function () {
    //customScrollBar
    $('.text').mCustomScrollbar({
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
    $('.menu__item').has('.add-settings').each(function (index, item) {
        $(item).find('.obj-img__wrapper').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            let $objImgWrapper = $(this);
            let $addSettings = $(item).find('.add-settings');

            $('.add-settings.active').removeClass('active');
            $('.obj-img__wrapper.active').removeClass('active');

            $addSettings.toggleClass('active');
            $objImgWrapper.toggleClass('active');

            addSettingsPositioning($objImgWrapper, $addSettings);

            /**
             * убираем всплытие события клик у поповера,
             * чтобы он не закрывался при нём
             */
            setTimeout(function () {
                $addSettings.on('click', function (e) {
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
                    $addSettings.removeClass('active');
                    $addSettings.off('click');
                    $objImgWrapper.removeClass('active');
                });
            }, 0);
        });
    });

    /**
     *
     * @param $clickedItem {object}
     * @param $addSettings {object}
     */
    const addSettingsPositioning = ($clickedItem, $addSettings) => {
        $addSettings.css({
            'margin-top' : '',
            'margin-left' : '',
            'margin-right' : ''
        });

        let $addSettingsCoords = $addSettings[0].getBoundingClientRect();
        let $clickedItemCoords = $clickedItem[0].getBoundingClientRect();
        let $textCoords = $('.text')[0].getBoundingClientRect();

        let $addSettingsBottom = $addSettings.find('.add-settings__bottom');

        $addSettingsBottom.removeClass('revert');

        let $addSettingsBottomCoords = $addSettings.find('.add-settings__bottom')[0].getBoundingClientRect();

        //todo: применять трансформ транлейт вместо margin-ов

        $addSettings.css({'margin-top' : '-' + Math.abs(parseInt($addSettingsBottomCoords.bottom - $clickedItemCoords.top)) + 'px'});

        if ($addSettingsCoords.right >= $textCoords.right) {
            $addSettings.css({'margin-left' : '-' + Math.abs(parseInt($addSettingsCoords.right - $textCoords.right + 10 /*padding-right*/)) + 'px'});
        } else if ($addSettingsCoords.left <= $textCoords.left) {
            $addSettings.css({'margin-right' : '-' + Math.abs(parseInt($addSettingsCoords.left - $textCoords.left + 10 /*padding-right*/)) + 'px'});
        }

        /**
         *
         * после того как поповер был сдвинут,
         * координаты его нижней части были измененеы,
         * их нужно актуализировать, ещё раз получив их
         */
        $addSettingsBottomCoords = $addSettings.find('.add-settings__bottom')[0].getBoundingClientRect();

        if (($addSettingsBottomCoords.left - parseInt($addSettingsBottom.css('left'))) < $clickedItemCoords.left) {
            $addSettingsBottom.addClass('revert');
        }
    }
});