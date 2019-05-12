import {effectsInst} from '../effects/Effects';
import LocalStorage from '../states/LocalStorage';
import {GoToPage} from '../menu/Menu';
import {pageInfo} from '../forAppInit/pageInfo';
import {getIsMobile} from '../helpers/getIsMobile.js';
import get from 'lodash-es/get.js';

export class GoToPageBtn {
  static getPageToGo(goTo) {
    if (goTo === 'pageForResumeReading') {
      const pageForResumeReading = LocalStorage.read({key: 'pageForResumeReading'});
      const pageToGo = pageForResumeReading === 'credits' ? null : pageForResumeReading;

      return pageToGo ? pageToGo : 1;
    } else if (goTo === 'main') {
      return 0;
    }
  }

  constructor() {
    this.$goToPage = $('.go-to-page');
    this.EffectsController = effectsInst();
    this.pageToGo = GoToPageBtn.getPageToGo(this.$goToPage.attr('data-go-to'));
  }

  init() {
    if (this.$goToPage.length === 0) return;

    const textForGoToPage = this.getTextForStartReadingButton();

    this.$goToPage.text(textForGoToPage);

    this.$goToPage.on('click', this.goToPageClickHandler);
  }

  goToPageClickHandler() {
    // if this is not mobile app - just go
    if (getIsMobile() === false) {
      this.go();
    } else {
      // if app has asked about flashlight then go. if not - show modal
      if (LocalStorage.read({key: 'askedAboutFlashlight'}) === true) {
        this.go();

        this.playFlashlightGreetingEffect();
      } else {
        this.setHandlersForConfirmButtons();

        this.askAboutFlashlight();
      }
    }
  }

  getTextForStartReadingButton() {
    const pageCurNum = pageInfo.pageCurNum;

    if (pageCurNum === 0) {
      if (this.pageToGo !== 1) return 'Продолжить читать';

      return 'Начать читать';
    }
  }

  go() {
    setTimeout(() => {
      GoToPage.go({val: this.pageToGo});

      this.$goToPage.off('click');
    }, 500);
  }

  askAboutFlashlight() {
    this.EffectsController.play('confirm-flashlight');
  }

  setHandlersForConfirmButtons() {
    this.EffectsController.modalContentInst.setConfirmButtonsHandlers(() => {
        this.requestCameraPermission()
          .then(() => {
            this.go();
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            LocalStorage.write({key: 'askedAboutFlashlight', val: true});
          });
      }, () => {
        LocalStorage.write({key: 'askedAboutFlashlight', val: true});
      }
    );
  }

  requestCameraPermission() {
    return new Promise((resolve, reject) => {
      const permissions = get(window, 'cordova.plugins.permissions');

      permissions.requestPermission(permissions.CAMERA, (status) => {
        if (status.hasPermission) {
          this.EffectsController.flashLightEffectsInst.play({duration: 50});

          resolve();
        } else {
          reject('Camera permission is not turned on');
        }
      });
    });
  }

  playFlashlightGreetingEffect() {
    this.EffectsController.flashLightEffectsInst.play({duration: 50});
  }
}