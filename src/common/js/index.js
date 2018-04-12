import {pageInfo} from './pageInfo';
import {menuInit} from './menuInit';
import {browserCheck} from './browserCheck';
import getDOMSelectors from './modules/GetDOMSelectors';
import {getVolumeInst} from './getVolumeInst';
import {getVolumeControllerInst} from './getVolumeControllerInst';
import {getAJAX} from './getAJAX';
import {Effects} from './modules/Effects';
import {textInit} from './textInit';
import {loadStates} from './loadStates';
import {playOnLoad} from './playOnLoad';
import {hoverTouchUnstick} from './hoverTouchUnstick';
import 'jquery-touch-events';
import './animateCss';
import {visibilityChangeInit} from './visibilityChangeInit';

$(window).on('load', async () => {
    if (browserCheck() === false) return;

    const DOMSelectors = getDOMSelectors();
    const $body = $('body');

    const textAJAX = await getAJAX(`/page-0.html`);
    const dataJSON = await getAJAX(`/page-0.json`);

    pageInfo(dataJSON.pageInfo);

    $('.text-wrapper').html(textAJAX);

    //инитим громкость
    const VolumeInst = getVolumeInst();

    //инициализируем контроллер управления эффектами
    const EffectsController = new Effects({
        VolumeInst,
        effects: dataJSON.effects
    });

    //инитим управление громкостью
    const VolumeControllerInst = getVolumeControllerInst({
        VolumeInst,
        EffectsController
    });

    visibilityChangeInit(VolumeInst, VolumeControllerInst);


    playOnLoad({effects: dataJSON.effects, EffectsController});
    textInit(EffectsController);
    menuInit({VolumeInst, VolumeControllerInst, pageInfo: dataJSON.pageInfo});

    if (dataJSON.pageInfo.current === 0) {
        $(DOMSelectors.menu).addClass('hide');
    } else {
        $(DOMSelectors.menu).removeClass('hide');
    }

    //событие перехода на другую страницу
    $(window).on('changePage', async (e, pageNum) => {
        $body.addClass('loading');

        EffectsController.stopAll({
            target: 'all',
            unload: true
        });

        const textAJAX = await getAJAX(`/page-${pageNum}.html`);
        const dataJSON = await getAJAX(`/page-${pageNum}.json`);

        pageInfo(dataJSON.pageInfo);

        $('.text-wrapper').html(textAJAX);

        EffectsController.setEffects(dataJSON.effects);

        //устанавливаем плейсхолдеры для input-ов
        $('.js-page-number').find('input').attr('placeholder', `${pageInfo().current} из ${pageInfo().length}`);
        $('.js-page-input').attr('placeholder', pageInfo().current);

        playOnLoad({effects: dataJSON.effects, EffectsController});

        textInit(EffectsController);

        if (dataJSON.pageInfo.current === 0) {
            $(DOMSelectors.menu).addClass('hide');
        } else {
            $(DOMSelectors.menu).removeClass('hide');
        }

        $body.removeClass('loading');
    });

    $body.removeClass('loading');

    //стрелка вперёд = след. страница,
    //стрелка назад = пред. страница
    $(document).on('keydown', (e) => {
        if (e.which === 37) {
            $('.js-page-prev').trigger('click');
        } else if (e.which === 39) {
            $('.js-page-next').trigger('click');
        } else if (e.which === 38 || e.which === 40) {

        }
    });

    $(DOMSelectors.page).swiperight(() => {
        $('.js-page-prev').trigger('click');
    });

    $(DOMSelectors.page).swipeleft(() => {
        $('.js-page-next').trigger('click');
    });

    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });

    hoverTouchUnstick();

    //загружаем значения настроек
    loadStates();

    //add content init
    $(DOMSelectors.addContentClose).on('click', () => {
        $(DOMSelectors.addContent).fadeOut();
    });

    $(DOMSelectors.addContentFullSize).on('click', () => {
        const children = $(DOMSelectors.addContentInner).children();

        let src;
        const video = children.filter('video');
        const img = children.filter('img');

        if (img.length > 0) {
            src = img.attr('src');
        }

        //todo: video

        $(DOMSelectors.addContentClose).trigger('click');

        window.open(`${window.location.origin}/${src}`, '_blank');
    });

    $(DOMSelectors.text).focus();
});