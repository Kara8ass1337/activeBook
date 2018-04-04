/**
 * Created by K on 11.06.2017.
 */

import getDOMSelectors from './GetDOMSelectors';
import find from 'lodash-es/find';

const Howler = require('howler');

export class Effects {
    /**
     *
     * @param VolumeInst {object}; inst volumeInst Class
     * @param effects[] {object}; effects description from JSON
     */
    constructor({VolumeInst, effects} = {}) {
        this.soundEffectsInst = new SoundEffects({
            loops: {},
            oneShots: {},
        });
        this.volume = {
            global: VolumeInst.global,
            hints: VolumeInst.hints,
            loops: VolumeInst.loops
        };
        this.effects = effects;
    }

    /**
     *
     * @param id {string} jquery
     */
    play(id) {
        const soundEffectsInst = this.soundEffectsInst;
        const effectCur = find(this.effects, {id});

        //todo: инициализировать все звуки на странице сразу, а не по требованию

        const type = effectCur.type;

        if (type === 'oneShot') {
            this.checkAndSetNewOneShot({id, src: effectCur.src});

            soundEffectsInst.playOneShot(id);
        } else if (type === 'loop') {
            this.checkAndSetNewLoop({id, src: effectCur.src});

            soundEffectsInst.playLoop(id);
        } else if (type === 'add-content') {
            ImageEffects.setAddContent({target});
        }

        //todo: video, text, etc.
    }

    stop(id) {
        const soundEffectsInst = this.soundEffectsInst;
        const effectCur = find(this.effects, {id});
        const type = effectCur.type;

        if (type === 'oneShot') {
            soundEffectsInst.stopOneShot(id);
        } else if (type === 'loop') {
            soundEffectsInst.stopLoop(id);
        }
    }

    stopAll(target) {
        const soundEffectsInst = this.soundEffectsInst;

        soundEffectsInst.stopAll(target);
    }

    /**
     *
     * @param id {string}
     * @param src {string}
     */
    checkAndSetNewOneShot({id, src}) {
        const soundEffectsInst = this.soundEffectsInst;
        if (!soundEffectsInst.oneShots[id]) {
            soundEffectsInst.oneShots[id] = SoundEffects.newHowlOneShot({
                src,
                volume: this.volume.hints
            });
        }
    }

    /**
     *
     * @param id {string}
     * @param src {string}
     */
    checkAndSetNewLoop({id, src}) {
        const soundEffectsInst = this.soundEffectsInst;
        if (!soundEffectsInst.loops[id]) {
            soundEffectsInst.loops[id] = SoundEffects.newHowlLoop({
                src,
                volume: this.volume.loops
            });
        }
    }
}

class SoundEffects {
    /**
     *
     * @param loops {object}
     * @param oneShots {object}
     */
    constructor({loops, oneShots} = {}) {
        this.loops = loops;
        this.oneShots = oneShots;
    }

    /**
     *
     * @param target {string}; oneShots || loops || all;
     * @param [fadeOutSpeed] {number};
     */
    stopAll(target, fadeOutSpeed = 1000) {
        if (target === 'oneShots') {
            Object.keys(this.oneShots).forEach((item) => {
                const oneShotCur = this.oneShots[item];

                SoundEffects.fadeOut(oneShotCur, fadeOutSpeed);
            });
            //todo: bgSound, bgMusic, all
        } else if (target === 'loops') {
            Object.keys(this.loops).forEach((item) => {
                const loopCur = this.loops[item];

                SoundEffects.fadeOut(loopCur, fadeOutSpeed);
            });
        } else if (target === 'all') {
            this.stopAll('oneShots', fadeOutSpeed);
            this.stopAll('loops', fadeOutSpeed);
        }
    }

    /**
     *
     * @param target {object}; howler inst sound;
     * @param [fadeOutSpeed] {number};
     */
    static fadeOut(target, fadeOutSpeed = 1000) {
        target.once('fade', () => {
            target.stop();
        });

        //некорректное поведение, если задавать fadeOutSpeed = 0;
        target.fade(0.5, 0, fadeOutSpeed > 0 ? fadeOutSpeed : 1);
    }

    /**
     *
     * @param target {object}; howler inst sound;
     * @param [fadeInSpeed] {number};
     */
    static fadeIn(target, fadeInSpeed = 1000) {
        target.play();
        //некорректное поведение, если задавать fadeOutSpeed = 0;
        target.fade(0, 0.5, fadeInSpeed > 0 ? fadeInSpeed : 1);
    }

    /**
     *
     * @param id {string}
     * @param fadeOutSpeed {number}
     */
    stopOneShot(id, fadeOutSpeed = 1000) {
        const oneShot = this.oneShots[id];

        SoundEffects.fadeOut(oneShot, fadeOutSpeed);
    }

    /**
     *
     * @param id {string}
     * @param fadeInSpeed {number}
     */
    playOneShot(id, fadeInSpeed = 0) {
        const oneShots = this.oneShots;

        if (oneShots[id].playing() === true) {
            this.stopAll('oneShots');
        }

        SoundEffects.fadeIn(oneShots[id], fadeInSpeed);
    }

    /**
     *
     * @param id {string}
     * @param fadeOutSpeed {number}
     */
    stopLoop(id, fadeOutSpeed = 1000) {
        const loop = this.loops[id];

        SoundEffects.fadeOut(loop, fadeOutSpeed);
    }

    /**
     *
     * @param id {string}
     * @param type {string}
     */
    unload({id, type}) {
        const sound = this[`${type}s`][id];

        if (SoundEffects.tryCatchHowlUnload(sound)) {
            sound.unload();
        }
    }

    //Unload and destroy a Howl object.
    //This will immediately stop all sounds attached to this sound and remove it from the cache.
    static tryCatchHowlUnload(obj) {
        try {
            obj.unload();
        } catch (err) {
            return false;
        }

        return true;
    }

    /**
     *
     * @param id {object}
     * @param [fadeInSpeed {number}]
     * @param [stopBy {object}]
     */
    playLoop(id, fadeInSpeed = 1000, stopBy) {
        const loops = this.loops;

        loops[id].fade(0, 0.5, fadeInSpeed);

        if (stopBy) {
            setTimeout(() => {
                this.stopLoop(this.loops[id], stopBy.fadeOutSpeed);
            }, stopBy.duration);
        }
    }

    /**
     *
     * @param src
     */
    static newHowlLoop({src} = {}) {
        return new Howl({
            src,
            autoplay: true,
            loop: true,
            volume: 0
        });
    }

    /**
     *
     * @param src {string}
     * @param volume {number}
     */
    static newHowlOneShot({src, volume} = {}) {
        return new Howl({
            src,
            autoplay: false,
            loop: false,
            volume
        });
    }
}

class VideoEffects {
    constructor() {

    }
}

class TextEffects {
    constructor() {

    }
}

class ImageEffects {
    constructor() {

    }

    /**
     *
     * @param target
     */
    static setAddContent({target} = {}) {
        const contents = target.contents();
        const $addContent = $(getDOMSelectors().addContent);
        const $addContentInner = $(getDOMSelectors().addContentInner);

        //jquery использует абсолютные пути, поэтому сравниваем таким образом
        /*if ($addContent.css('background-image').indexOf(img.attr('src').replace('../', '')) !== -1) return;

        $addContent.addClass('fadeOut');
        $addContent.one('transitionend', () => {
            $addContent.css({'background-image': `url(${ img.attr('src') })`});
            $addContent.removeClass('fadeOut');
        });*/

        $addContentInner.append(contents);
        $addContent.fadeIn();
        //todo: слайдер, если несколько
    }
}