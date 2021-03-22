var $ = require("jquery/dist/jquery");
var Popper = require("popper.js/dist/popper").default;
require("bootstrap/js/src/util");
require("bootstrap/js/src/dropdown");
require("bootstrap/js/src/modal");
require("bootstrap/js/src/button");
require("bootstrap/js/src/tab");
require("bootstrap/js/src/collapse");
require("jquery-knob/js/jquery.knob");
require("ion-rangeslider/js/ion.rangeSlider.min");
require("jquery-mask-plugin/dist/jquery.mask.min");
require("bootstrap-datepicker/dist/js/bootstrap-datepicker.min");
require("jquery-colpick/js/colpick");
require("../my-custom-plugins/jquery.drag-drop-upload/js/jquery.drag-drop-upload");
require("tinymce/tinymce");
require("tinymce/themes/silver/theme");
require("tinymce/icons/default/icons");
// if css-loader does not work use this hack: https://github.com/parcel-bundler/parcel/issues/2936#issuecomment-504583339
// (you need to modify node files anyway)

window.jQuery = window.$ = $;


let getActualSizes = function (s, b=undefined) {
  let elem = typeof s === 'string' ? $(s) : s,
      blockingBlock = b ? (typeof b === 'string' ? $(b) : b) : elem, previousCss  = blockingBlock.attr("style");
  blockingBlock.css({//position: 'absolute', wtf?
    visibility: 'hidden', display: 'block'});
  let result = {outerHeight: elem.outerHeight(), innerHeight: elem.innerHeight(),
                outerWidth: elem.outerWidth(), innerWidth: elem.innerWidth()};
  blockingBlock.attr("style", previousCss ? previousCss : "");
  return result;
}
let adjustModal = function(b) {
  let button = typeof b === 'string' ? $(b) : b, attachedModal = $(button.attr('data-target')),
      attachedDialog = attachedModal.find('.modal-dialog'),
      dialogContent = attachedModal.find('.modal-content'),
      rules = button.attr('adjust-offset').split(' '),
      align = rules[0],
      relative1axis = rules[1] ? rules[1].split(':')[0] : undefined,
      relative2axis = rules[2] ? rules[2].split(':')[0] : undefined,
      offset1axis = rules[1] ? parseInt(rules[1].split(':')[1]) : undefined,
      offset2axis = rules[2] ? parseInt(rules[2].split(':')[1]) : undefined,
      top = button.offset().top + button.outerHeight()/2, left = button.offset().left + button.outerWidth()/2,
      actualWH = getActualSizes(dialogContent, attachedModal),
      dialogWidth = actualWH.outerWidth, dialogHeight = actualWH.outerHeight;
    switch (align) {
      case 'top-left':
        break;
      case 'top-center':
        left-=dialogWidth/2;
        break;
      case 'top-right':
        left-=dialogWidth;
        break;
      case 'middle-left':
        top-=dialogHeight/2;
        break;
      case 'middle-center':
        top-=dialogHeight/2;
        left-=dialogWidth/2;
        break;
      case 'middle-right':
        top-=dialogHeight/2;
        left-=dialogWidth;
        break;
      case 'bottom-left':
        top-=dialogHeight;
        break;
      case 'bottom-center':
        top-=dialogHeight;
        left-=dialogWidth/2;
        break;
      case 'bottom-right':
        top-=dialogHeight;
        left-=dialogWidth;
        break;
    }
    switch (relative1axis) {
      case 'y':
        top+=offset1axis;
        break;
      case 'x':
        left+=offset1axis;
        break;
    }
    switch (relative2axis) {
      case 'y':
        top+=offset2axis;
        break;
      case 'x':
        left+=offset2axis;
        break;
    }
    attachedDialog.css({
      width: 'max-content', height: 'max-content', margin: 0, top: top, left: left});
}
var popovers = new Set();
$(document).on('click', function (ev) {
    let x = ev.pageX, y = ev.pageY;
    popovers.forEach(function (value, value2, set) {
      let sizes = getActualSizes(value), offset = value.offset(), parent = value.data('parent'),
          pOffset = parent ? parent.offset() : undefined, pSizes = parent ? getActualSizes(parent) : undefined,
          isIn = ((x >= offset.left && x <= offset.left + sizes.outerWidth) && (y > offset.top && y < offset.top + sizes.outerHeight))
                 || ((parent !== undefined) && ((x >= pOffset.left && x <= pOffset.left + pSizes.outerWidth) && (y > pOffset.top && y < pOffset.top + pSizes.outerHeight)))
      ;
      if (!isIn) {
        popovers.delete(value);
        value.hide();
        value.trigger('mypopups.hide');
      }
    });
  });
$(function () {
  const scrollSensitivity = 24;
  const componentPath = $('<li class="current-path__entity"><a href="#" class="current-path__text"></a><span class="current-path__divider">/</span></li>');
  $('.responsive-scrollbar').each(function(i, s) {
    let scrollbar = $(s), container = $(scrollbar.attr('data-container')),
        content = container.children(':first-child'),
        wrapper = container.parent(),
        scrollArea = scrollbar.find('.responsive-scrollbar__scroll-area'),
        scroller = scrollbar.find('.responsive-scrollbar__scroller');
    content.css('transition', 'transform 0.6s cubic-bezier(0.25, 0.05, 0.53, 0.99) 0s').data('position', 0).data('scroll', function (delta) {
      if (!scrollbar.data('update')()) {
        content.css('transform', 'translateY(' + 0 + 'px)');
        return;
      }
      let position = content.data('position'),
          newPosition = position - delta * scrollSensitivity,
          max = content.data('max'), min = content.data('min');
      newPosition = newPosition > max ? max : (newPosition < min ? min : newPosition);
      content.data('position', newPosition).css('transform', 'translateY(' + newPosition + 'px)');
    });
    scrollbar.css('transition', 'opacity .2s ease-in-out, background-color .2s ease-in-out, ' +
      'transform 0.6s cubic-bezier(0.25, 0.05, 0.53, 0.99) 0s').data('update', function () {
      let contentHeight = content.outerHeight(), containerHeight = container.innerHeight();
      if (contentHeight < containerHeight) {
        scroller.css({'transform': 'translateY(' + 0 + 'px)'});
        return false;
      }
      let max = 0, min = - (contentHeight - containerHeight),
          position = content.data('position'),
          scrollbarValue = (position - max)/(min - max),
          scrollAreaHeight = scrollArea.innerHeight(),
          scrollerMinHeight = 20, scrollerMaxHeight = scrollAreaHeight,
          scrollerHeight = containerHeight/contentHeight*scrollAreaHeight,
          scrollerPosition = scrollbarValue*(scrollAreaHeight - scrollerHeight);
      scrollerHeight = scrollerHeight < scrollerMinHeight ? scrollerMinHeight : (scrollerHeight > scrollerMaxHeight ? scrollerMaxHeight : scrollerHeight);
      scroller.css({'height': scrollerHeight+'px', 'transform': 'translateY(' + scrollerPosition + 'px)'});
      content.data('min', min).data('max', max);
      return true;
    });
    wrapper.on('DOMMouseScroll mousewheel', function(ev) {
      ev.preventDefault();
      let delta = ev.originalEvent.detail || -ev.originalEvent.wheelDelta / 40;
      content.data('scroll')(delta);
      scrollbar.data('update')();
    }).on('mouseenter', function (ev) {
      if (!scrollbar.data('update')()) {
        return;
      }
      scrollbar.delay(50).queue(function () {
        scrollbar.addClass('responsive-scrollbar_show');
        $(this).dequeue();
      });
    }).on('mouseleave', function (ev) {
      scrollbar.delay(50).queue(function () {
        scrollbar.removeClass('responsive-scrollbar_show');
        $(this).dequeue();
      });
    });
  });
  $('.modal').on('click', function(ev) {
    let x = ev.originalEvent.clientX, y = ev.originalEvent.clientY,
        modalContent = $(this).find('.modal-content'), offset = modalContent.offset(),
        width = modalContent.outerWidth(), height = modalContent.outerHeight();
    let isIn = (x >= offset.left && x <= offset.left + width) && (y > offset.top && y < offset.top + height);
    if (!isIn) {$(this).modal('hide');}
  });
  $('.adjust-attached-modal').on('click', function (ev) {
    adjustModal($(this));
  });
  $('.search-field__input').on('focusin focusout', function (ev) {
    $(this).parents('.search-field').toggleClass('search-field_active');
  });
  $('.current-path').each(function (i, b) {
    let path = /\S+(?:\s*\S+)*/g.exec($('#currentPath').text())[0],
        items = path.split('/'), block = $(b).find('.current-path__display');
    for (let i = 0; i < items.length; i++) {
      let component = componentPath.clone();
      component.find('.current-path__text').text(items[i].split(':')[0]);
      component.find('.current-path__text').attr('href', items[i].split(':')[1]);
      if (i === items.length - 1) {
        component.find('.current-path__divider').addClass('d-none');
      }
      block.append(component);
    }
  });
  $('.basic-login-form__checkbox').each(function (i, b) {
    let block = $(b), input = block.find('input:checkbox'), id = input.attr('id'),
        associatedLabel = $('label[for="' + id + '"]');
    block.data('check', function (justUpdate=false) {
      let originalCheckbox = block.find('input:checkbox'),
          cachedValue = originalCheckbox.prop('checked'),
          preChecked = (originalCheckbox.attr('checked') !== undefined), value = preChecked;
      if (!justUpdate) {
        if (block.data('disabled')) { return; }
        value = !cachedValue; }
      if (value) { block.addClass('basic-login-form__checkbox_checked'); }
      else { block.removeClass('basic-login-form__checkbox_checked'); }
      originalCheckbox.prop('checked', value);
    }).data('toggleActivity', function (enableDisable) {
      if (enableDisable) {
        input.removeAttr('disabled');
        block.removeClass('basic-login-form__checkbox_disabled').data('disabled', false);
      } else {
        input.attr('disabled', '');
        block.addClass('basic-login-form__checkbox_disabled').data('disabled', true);
      }
    });
    block.data('check')(true);
    if (input.attr('disabled') !== undefined) { block.data('toggleActivity')(false); }
    associatedLabel.add(block).on('mouseenter mouseleave', function (ev) {
      if (block.data('disabled')) {return;}
      block.toggleClass('basic-login-form__checkbox_hover');
    }).on('click', (ev)=>{block.data('check')();});
  });
  $('.basic-login-form__radio').each(function (i, b) {
    let block = $(b), input = block.find('input:radio'), id = input.attr('id'),
        associatedLabel = $('label[for="' + id + '"]');
    block.data('check', function () {
      let name = input.attr('name'), group = $('input[type="radio"][name="'+name+'"]').filter('[value!="'+input.attr('value')+'"]');
      if (block.data('disabled')) { return; }
      group.prop('checked', false).parents('.basic-login-form__radio').removeClass('basic-login-form__radio_checked');
      block.addClass('basic-login-form__radio_checked');
      input.prop('checked', true);
    }).data('toggleActivity', function (enableDisable) {
      if (enableDisable) {
        input.removeAttr('disabled');
        block.removeClass('basic-login-form__radio_disabled').data('disabled', false); }
      else {
        input.attr('disabled', '');
        block.addClass('basic-login-form__radio_disabled').data('disabled', true); }
    });
    if (input.attr('checked') !== undefined) {
      block.data('check')(); }
    if (input.attr('disabled') !== undefined) { block.data('toggleActivity')(false); }
    associatedLabel.add(block).on('mouseenter mouseleave', function (ev) {
      if (block.data('disabled')) {return;}
      block.toggleClass('basic-login-form__radio_hover');
    }).on('click', (ev)=>{block.data('check')();});
  });
  /*$('#pop').click(function (ev) {
    ev.stopPropagation();
    let popper = $('#t');
    popper.show();
    let obj = new Popper(this, popper, {placement: 'bottom', modifiers:{}});
    popovers.add(popper);
  });*/
  $(".dial").knob({'change' : function (v) {}});
  $(".range-slider").ionRangeSlider();
  $(".range-slider-price").ionRangeSlider({
    grid: true,
    type: 'double',
    prefix: '$',
    max_postfix: '+'
  });
  $(".range-slider-carats").ionRangeSlider({
    grid: true,
    postfix: ' carats',
    grid_num: 4,
    step: .5
  });
  $(".range-slider-temperature").ionRangeSlider({
    grid: true,
    postfix: '°'
  });
  $(".range-slider-date").ionRangeSlider({
    grid: true,
    values: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  });
  $('.my-custom-select').each(function (i, b) {
    let block = $(b), drop = block.find('.my-custom-select__drop'), scroll = block.find('.my-custom-select__scroll'),
      searchInput = block.find('.my-custom-select__search-input'), container = block.find('.my-custom-select__container'),
      menu = block.find('.my-custom-select__menu'), placeholder = block.find('.my-custom-select__placeholder'),
      nativeSelect = block.find('select'), nativeOptions = nativeSelect.find('option'),
      badge = $('<span class="my-custom-select__badge"></span>'), btnClose = $('<span class="btn close p-0">&times;</span>');
    let change = function(option) {
      placeholder.text(option.text());
      nativeSelect.val(option.attr('value'));
      drop.trigger('mypopups.hide');
    };
    let addOption = function(option) {
      let b = badge.clone(), cl = btnClose.clone(), nativeOption = nativeOptions.filter(function(i, op) {return op.value === option.attr('data-value')});
      nativeOption.prop('selected', true);
      b.text(option.text());
      b.on('click', ev => ev.stopPropagation()).append(cl);
      cl.on('click', (ev) => {ev.stopPropagation(); removeOption(b, nativeOption)});
      option.hide();
      container.append(b);
      updatePlaceholder();
    };
    let removeOption = function(badge, nativeOption) {
      nativeOption.prop('selected', false);
      badge.remove();
      updatePlaceholder();
      search();
    };
    let updateScroll = function() {
      if (menu.outerHeight > 240) {
        scroll.css('overflow-y', 'scroll');
      } else {
        scroll.css('overflow-y', 'auto');
      }
    };
    let updatePlaceholder = function() {
      if (container.has('.my-custom-select__badge').length === 0) {
        placeholder.show();
      } else {
        placeholder.hide();
      }
    }
    let search = function () {
      let searchValue = searchInput.val(), filteredOptions = nativeOptions.filter(function (i, op) {
            return new RegExp(searchValue + '.*', 'gi').test(op.innerHTML);
          }), listToShow = $([]), clonableObject = $('<li class="list-group-item list-group-item-action my-custom-select__option">option</li>');
      filteredOptions.each(function(i, op) {
        let obj = clonableObject.clone();
        obj.text(op.innerHTML);
        if ($(op).prop('selected') !== true) {
          listToShow = listToShow.add(obj);
        }
      });
      if (listToShow.length === 0) {
        listToShow = $('<li class="list-group-item list-group-item-action my-custom-select__option disabled">Nothing to show</li>');
      }
      menu.empty().append(listToShow);
      updateScroll();
    };
    drop.hide();
    drop.on('mypopups.hide', function (ev) {
      block.removeClass('my-custom-select_open');
      drop.hide();
    });
    block.on('click', function (ev) {
      block.addClass('my-custom-select_open');
      drop.show();
      searchInput.focus();
      popovers.add(drop.data('parent', block));
      updateScroll();
    });
    searchInput.on('keyup', search);
    let onMenuClickSingle = function (ev) {
      let target = $(ev.target);
      if (target.hasClass('my-custom-select__option') && !target.hasClass('disabled')) {
        change(target);
      }
    };
    let onMenuClickMultiple = function(ev) {
      let target = $(ev.target);
      if (target.hasClass('my-custom-select__option') && !target.hasClass('disabled')) {
        addOption(target);
      }
    };
    menu.on('click', (block.hasClass('my-custom-select_multiple') ? onMenuClickMultiple : onMenuClickSingle));
  });
  let inputmasks = {
    'ISBN-1': {mask: '000-00-000-0000-0', options: {placeholder: '___-__-___-____-_', translation: {}, reverse: false}},
    'ISBN-2': {mask: '000 00 000 0000 0', options: {placeholder: '___ __ ___ ____ _', translation: {}, reverse: false}},
    'ISBN-3': {mask: '000/00/000/0000/0', options: {placeholder: '___/__/___/____/_', translation: {}, reverse: false}},
    'IPv4': {mask: '0ZZ.0ZZ.0ZZ.0ZZ', options: {placeholder: '___.___.___.___', translation: {'Z': {
      pattern: /[0-9]/, optional: true}}, reverse: false}},
    'Tax ID': {mask: '00-0000000', options: {placeholder: '__-_______', translation: {}, reverse: false}},
    'Phone': {mask: '(000) 000-0000', options: {placeholder: '(___) ___-____', translation: {}, reverse: false}},
    'Currency': {mask: '$ 000,000,000.00', options: {placeholder: '$ ___,___,___.__', translation: {}, reverse: false}},
    'Date': {mask: 'd0/m0/y000', options: {placeholder: '__/__/__', translation: {
          'd': {pattern: /[1-3]/, optional: true},
          'm': {pattern: /1/, optional: true},
          'y': {pattern: /[12]/, optional: false},
        }, reverse: false}},
    'Postal Code': {mask: '99999', options: {placeholder: '_____', translation: {}, reverse: false}},
  };
  $('input[data-inputMask]').each(function(i, b) {
    let input = $(b), mask = input.attr('data-inputMask');
    delete inputmasks[mask].options.placeholder;
    inputmasks[mask].options.clearIfNotMatch = true;
    inputmasks[mask].options.selectOnFocus = true;
    input.mask(inputmasks[mask].mask, inputmasks[mask].options);
  });
  $('.stripped-slider').each(function(i, b) {
    let block = $(b), scrollArea = block.find('.stripped-slider__slide-area'),
        handleLeft = block.find('.stripped-slider__fa-handle, .stripped-slider__handle'),
        handleRight = block.find('.stripped-slider__fa-handle-right, .stripped-slider__handle-right'),
        progress = block.find('.stripped-slider__progress'), doc = $(document),
        inputLeft = block.find('input.stripped-slider__input-left'),
        inputRight = block.find('input.stripped-slider__input-right'),
        background = block.find('.stripped-slider__background'),
        container = block.find('.stripped-slider__container'),
        tooltipLeft = block.find('.stripped-slider__fa-handle .stripped-slider__tooltip'),
        tooltipRight = block.find('.stripped-slider__fa-handle-right .stripped-slider__tooltip'),
        isDouble = block.is('.stripped-slider_double'),
        isVertical = block.is('.stripped-slider_vertical'),
        min = parseInt(inputLeft.attr('min')), max = parseInt(inputLeft.attr('max')), step = parseInt(inputLeft.attr('step')),
        dataPrefix = block.attr('data-prefix'), dataPostfix = block.attr('data-postfix'),
        scrollAreaWidth = scrollArea.innerWidth(),
        scrollAreaHeight = scrollArea.innerHeight(),
        currentXLeft = 0, currentXRight = 0,
        valueLeftPx, valueLeftRelative, valueLeft,
        valueRightPx, valueRightRelative, valueRight,
        lockDelay = 50, lock = false;
    let updatePositionL = function() {
      scrollAreaWidth = scrollArea.innerWidth();
      scrollAreaHeight = scrollArea.innerHeight();
      let scrollAreaLength = isVertical ? scrollAreaHeight : scrollAreaWidth;
      if (currentXLeft < currentXRight) {
        currentXRight = currentXLeft;
        updatePositionR();
      }
      valueLeftPx = currentXLeft < 0 ? 0 : (currentXLeft > scrollAreaLength ? scrollAreaLength : (currentXLeft < valueRightPx ? valueRightPx : currentXLeft));
      let stepRel = step / (max - min) * scrollAreaLength;
      valueLeftPx = Math.round(valueLeftPx / stepRel) * stepRel;
      valueLeftRelative = valueLeftPx / scrollAreaLength;
      valueLeft = Math.round(((max - min) * valueLeftRelative) / step) * step + min;
      handleLeft.css(isVertical ? 'bottom' : 'left', valueLeftPx + 'px');
      progress.css(isVertical ? 'height' : 'width', isDouble ? valueLeftPx - valueRightPx : valueLeftPx + 'px');
      inputLeft.val(dataPrefix + valueLeft + dataPostfix);
      tooltipLeft.text(valueLeft);
    };
    let updatePositionR = function() {
      scrollAreaWidth = scrollArea.innerWidth();
      scrollAreaHeight = scrollArea.innerHeight();
      let scrollAreaLength = isVertical ? scrollAreaHeight : scrollAreaWidth;
      if (currentXRight > currentXLeft) {
        currentXLeft = currentXRight;
        updatePositionL();
      }
      valueRightPx = currentXRight < 0 ? 0 : (currentXRight > scrollAreaLength ? scrollAreaLength : (currentXRight > valueLeftPx ? valueLeftPx : currentXRight));
      let stepRel = step / (max - min) * scrollAreaLength;
      valueRightPx = Math.round(valueRightPx / stepRel) * stepRel;
      valueRightRelative = valueRightPx / scrollAreaLength;
      valueRight = Math.round(((max - min) * valueRightRelative) / step) * step + min;
      handleRight.css(isVertical ? 'bottom' : 'left', valueRightPx + 'px');
      progress.css(isVertical ? 'bottom' : 'left', valueRightPx + 'px')
        .css(isVertical ? 'height' : 'width', (valueLeftPx - valueRightPx) + 'px');
      inputRight.val(dataPrefix + valueRight + dataPostfix);
      tooltipRight.text(valueRight);
    };
    let mouseMoveL = function(ev) {
      currentXLeft = isVertical ? -(ev.pageY - scrollArea.offset().top - scrollArea.innerHeight()) : ev.pageX - scrollArea.offset().left;
      if (!lock) {
        lock = true;
        setTimeout(()=>{lock=false;}, lockDelay);
        updatePositionL();
      }
    };
    let mouseMoveR = function(ev) {
      currentXRight = isVertical ? -(ev.pageY - scrollArea.offset().top - scrollArea.innerHeight()) : ev.pageX - scrollArea.offset().left;
      if (!lock) {
        lock = true;
        setTimeout(()=>{lock=false;}, lockDelay);
        updatePositionR();
      }
    };
    handleLeft.on('mousedown', function (ev) {
      ev.stopPropagation();
      handleRight.css('z-index', 1);
      handleLeft.css('z-index', 2);
      doc.on('mousemove.strippedSlider', mouseMoveL);});
    if (isDouble) {
    handleRight.on('mousedown', function (ev) {
      ev.stopPropagation();
      handleRight.css('z-index', 2);
      handleLeft.css('z-index', 1);
      doc.on('mousemove.strippedSlider', mouseMoveR);});}
    doc.on('mouseup', function (ev) {doc.off('mousemove.strippedSlider');});
    container.on('click', function (ev) {
      let i = isVertical ? -(ev.pageY - scrollArea.offset().top - scrollArea.innerHeight()) : ev.pageX - scrollArea.offset().left;
      if (isDouble) {
        if (Math.abs(currentXLeft - i) < Math.abs(currentXRight - i)) {
          currentXLeft = i;
          updatePositionL();
        } else {
          currentXRight = i;
          updatePositionR();
        }
      } else {
        currentXLeft = i;
        updatePositionL();
      }
    });
    let f1 = function (ev) {
      let val = /\d+/.exec(inputLeft.val());
      val = val == null ? 0 : parseInt(val[0]);
      currentXLeft = (val - min) / (max - min) * (isVertical ? scrollAreaHeight : scrollAreaWidth);
      updatePositionL();
    };
    inputLeft.on('blur', f1);
    let f2 = function (ev) {
      let val = /\d+/.exec(inputRight.val());
      val = val == null ? 0 : parseInt(val[0]);
      currentXRight = (val - min) / (max - min) * (isVertical ? scrollAreaHeight : scrollAreaWidth);
      updatePositionR();
    };
    inputRight.on('blur', f2);
    f1();
    f2();
    updatePositionL();
    if (isDouble) {updatePositionR();}
    container.on('update', updatePositionL);
    if (isDouble) {container.on('update', updatePositionR);}
  });
  $('.date-picker').each(function (i, b) {
    let block = $(b), range = (block.attr('data-range') === "true"), input = block.find('.date-picker__input'),
        startView = parseInt(block.attr('data-start-view')), endView = parseInt(block.attr('data-end-view'));
    if(!range) {
      input.datepicker({
        format: endView > 0 ? endView > 1 ? "yy" : "mm/yy" : "dd/mm/yy",
        startView: startView,
        minViewMode: endView,
        todayBtn: "linked",
        autoclose: true
      });
    } else {
      block.datepicker({
        format: "dd/mm/yy",
        todayBtn: "linked",
        autoclose: true
      });
    }
  });
  $('input.color-picker').each(function(i, b) {
    let input = $(b), dataType = input.attr('data-type');
    input.wrap('<div class="color-picker"><div class="input-group"></div></div>')
      .removeClass('color-picker').addClass('color-picker__input').after(
        '<div class="input-group-append">\n' +
          '<button class="color-picker__btn">\n' +
            '<span class="color-picker__preview"></span>\n' +
          '</button>\n' +
        '</div>').attr('onClick', 'this.setSelectionRange(0, this.value.length); document.execCommand(\'copy\');');
    let block = input.parents('.color-picker'), button = block.find('.color-picker__btn'),
        preview = block.find('.color-picker__preview');
    block.append('<i class="color-picker__copied-icon" style="display: none;"></i>');
    let copiedIcon = block.find('.color-picker__copied-icon');
    input.on('click', (ev)=>copiedIcon.fadeIn().delay(800).fadeOut());
    let picker, doc = $(document), alphaBar, currentX, handle, percentValue;
    let parseColor = function(str, change = false) {
      let col = '#000000', match = str.match(/(?<hex>\#(?<hex_val>[0-9a-fA-F]{6})(?<hex_a>[0-9a-fA-F]{2})?)|(?<rgb>rgba?\ ?\((?<rgb_r>\d{1,3}),\ ?(?<rgb_g>\d{1,3}),\ ?(?<rgb_b>\d{1,3})(:?,\ ?(?<rgb_a>\d(:?\.\d\d?)?)?\))?)|(?<hsb>hsb\ ?\((?<hsb_h>\d{1,3}),\ ?(?<hsb_s>\d{1,3}),\ ?(?<hsb_b>\d{1,3})(:?,\ ?(?<hsb_a>\d{1,3})\%)?\))/);
      if (match === null) {
        return col;
      }
      let groups = match.groups;
      if (groups.hex !== undefined) {
        col = groups.hex_val;
        if (change) {percentValue = Math.round(parseInt(groups.hex_a || 'ff', 16) / 255 * 100);}
      } else if (groups.rgb !== undefined) {
        col = {r: groups.rgb_r, g: groups.rgb_g, b: groups.rgb_b};
        if (change) {percentValue = groups.rgb_a === undefined ? 100 : Math.round(groups.rgb_a * 100);}
      } else if (groups.hsb !== undefined) {
        col = {h: groups.hsb_h, s: groups.hsb_s, b: groups.hsb_b};
        if (change) {percentValue = groups.hsb_a === undefined ? 100 : groups.hsb_a;}
      }
      return col;
    };
    let move = function(ev) {
      let barWidth = alphaBar.innerWidth();
      if (ev !== null) {
        currentX = ev.pageX - alphaBar.offset().left;
      } else {
        parseColor(input.val(), true);
        currentX = barWidth * percentValue / 100;
      }
      currentX = currentX > 0 ? currentX < barWidth ? Math.round(currentX / barWidth * 100) * barWidth / 100 : barWidth : 0;
      percentValue = Math.round(currentX / barWidth * 100);
      handle.css('left', currentX);
      button.colpickSetColor(parseColor(input.val()));
    };
    let extendPicker = function() {
      picker.css({
        height: '185px'
      }).append('<div class="colpick-alfa"><div class="colpick-alfa__handle"></div></div>')
        .find('.colpick_new_color, .colpick_hex_field').hide();
      alphaBar = picker.find('.colpick-alfa');
      handle = alphaBar.find('.colpick-alfa__handle');
      currentX = alphaBar.innerWidth();
      alphaBar.on('mousedown', function(ev) {
        ev.stopPropagation();
        move(ev);
        doc.on('mousemove.activeColorPickerAlphaBar', move)
          .on('mouseup.activeColorPickerAlphaBar',
            () => doc.off('mousemove.activeColorPickerAlphaBar mouseup.activeColorPickerAlphaBar'));
      });
    }
    button.colpick({
      submit: false,
      layout: 'hex',
      onChange: function(hsb, hex, rgb, el, setByColor) {
        let val = 0, pcol = 'rgb' + (percentValue < 100 ? 'a' : '') + '(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + (percentValue < 100 ? ', ' + percentValue / 100 : '') + ')',
            pcolSolid = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)',
            pcolAlpha = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)';
        switch (dataType) {
          case 'hex':
          case undefined:
            let al = Math.round(255 / 100 * percentValue).toString(16);
            val = '#' + hex + (percentValue < 100 ? (al.length < 2 ? al + '0' : al) : '');
            break;
          case 'rgb':
            val = pcol;
            break;
          case 'hsb':
            val = 'hsb(' + hsb.h + ', ' + hsb.s + ', ' + hsb.b + (percentValue < 100 ? ', ' + percentValue + '%' : '') + ')';
            break;
        }
        preview.css('background', 'linear-gradient(' + pcol + ', ' + pcol + '), ' + 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)');
        if (alphaBar !== undefined) { alphaBar.css({'background':
            'linear-gradient(90deg, ' + pcolAlpha + ', ' + pcolSolid + '), url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)'});}
        input.val(val);
      },
      onBeforeShow: function (b) {
        picker = $(b);
        if (picker.data('extended') === true) {
          return;
        }
        picker.data('extended', true);
        extendPicker();
        move(null);
      }
    }).colpickSetColor(parseColor(input.val(), true));
  });
  $('input.touch-spin').each(function (i, b) {
    let input = $(b), block = input.wrap('<div class="touch-spin"><div class="input-group"></div></div>')
          .removeClass('touch-spin').addClass('touch-spin__input').parents('.touch-spin'),
        isVertical = input.attr('data-vertical') !== undefined, dataPostfix = input.attr('data-postfix'),
        min = input.attr('min'), max = input.attr('max'), step = parseFloat(input.attr('step') || 1), doc = $(document),
        delayForSpinBegin = 800, minDelayBetweenTicks = 25, maxDelayBetweenTicks = 150, ticksAcceleration = 10;
    min = min === undefined ? undefined : parseInt(min);
    max = max === undefined ? undefined : parseInt(max);
    if (!isVertical) {
      input.before('<button class="touch-spin__larr"></button>').after('<button class="touch-spin__rarr"></button>');
    } else {
      input.after('<div class="touch-spin__rblock"><a class="touch-spin__rarr"></a><a class="touch-spin__larr"></a></div>');
    }
    if (dataPostfix !== undefined) {
      input.after('<span class="touch-spin__postfix">' + dataPostfix + '</span>');
    }
    let arrs = block.find('.touch-spin__larr, .touch-spin__rarr'), timer;
    let get = function() {
      return parseFloat(input.val()) || 0;
    };
    let set = function(v) {
      let val = (min === undefined || v >= min) ? (max === undefined || v <= max) ? v : max : min,
          normalizedVal = Math.round(val / step) * step;
      input.val(normalizedVal.toString().match(/\-?\d+(?:\.\d\d?)?/)[0]);
      return val === v;
    };
    let inc = function(a) {
      return set(get() + (a.is('.touch-spin__rarr') ? step : -step));
    };
    let timerFunc = function(ev, thisInc = undefined, delay = maxDelayBetweenTicks) {
      let lasts = true;
      if (thisInc === undefined) {
        lasts = false;
        thisInc = ()=>inc($(this));
      }
      if (thisInc()) {
        delay = delay - ticksAcceleration < minDelayBetweenTicks ? minDelayBetweenTicks : delay - ticksAcceleration;
        timer = setTimeout(() => timerFunc(ev, thisInc, delay), lasts ? delay : delayForSpinBegin);
      }
    };
    arrs.on('mousedown', timerFunc);
    doc.on('mouseup.spinToWin', () => clearInterval(timer));
  });
  $('.password-meter').each(function(i, b) {
    let block = $(b), onlyStrength = block.attr('data-onlyStrength') !== undefined,
        assocUsername = block.attr('data-username'), assocDate = block.attr('data-date'), assocPassword = block.attr('data-password');
    assocDate = assocDate === undefined ? undefined : $(assocDate);
    assocUsername = assocUsername === undefined ? undefined : $(assocUsername);
    assocPassword = assocPassword === undefined ? undefined : $(assocPassword);
    if (block.find('.password-meter__progress').length === 0) {
      block.append('<div class="password-meter__progress"></div>'); }
    let progress = block.find('.password-meter__progress');
    if (onlyStrength) {
      block.addClass('password-meter_only-strength');
    }
    const regSpecialSumbols = /[\!\"\#\$\%\&\'\(\)\*\+,\-\./\\\:;\<\=\>\?\@\[\]\^_\`\{\|\}\~]/g,
          regNumbers = /\d/g;
    let xIndex = function (str1, str2, variate = false) {
      if (variate) {
        for (let i = 0; i < str2.length; i++) {
          let reg = new RegExp(str2.substring(0, -2 + i) + '.?.?' + str2.substring(i, str2.length));
          if (str1.match(reg)) {
            return str2;
          }
        }
      } else {
        return str1.match(str2) === null ? 0 : 1;
      }
    };
    let calcStrength = function () {
      let val = assocPassword.val(), name = assocUsername === undefined ? undefined : assocUsername.val(),
          date = assocDate === undefined ? undefined : assocDate.val(),
          specNum = val.match(regSpecialSumbols), numNum = val.match(regNumbers);
      specNum = specNum === null ? 0 : specNum.length;
      numNum = numNum === null ? 0 : numNum.length;
      let strength = val.length / 20 * 100 +
        (specNum > 0 ? specNum > 1 ? specNum > 2 ? 30 : 20 : 10 : 0) +
        (numNum > 0 ? numNum > 1 ? 20 : 10 : 0);
      if (date !== undefined) {
        for (let i = 0, dp = date.split('/'); i < dp.length; i++) {
          strength -= xIndex(val, dp[i]) * 20;
        }
      }
      if (name !== undefined) {
        strength -= xIndex(val, name, false) * 50;
      }
      return strength;
    };
    let setState = function (state) {
      let states = ['weak', 'normal', 'medium', 'strong', 'very-strong'];
      for (let i = 0; i < states.length; i++) {
        block.removeClass('password-meter_' + states[i]);
      }
      block.addClass('password-meter_' + state);
    };
    let updateVerdict = function () {
      let strength = calcStrength(), val = strength >= 0 ? strength <= 100 ? strength : 100 : 0;
      progress.css('width', val + '%');
      if (strength <= 25) {
        setState('very-weak');
      } else if (strength < 35) {
        setState('weak');
      } else if (strength < 55) {
        setState('normal');
      } else if (strength < 80) {
        setState('medium');
      } else if (strength < 100) {
        setState('strong')
      } else if (strength >= 100) {
        setState('very-strong');
      }
    };
    updateVerdict();
    assocPassword.on('keyup', (ev) => updateVerdict());
    if (assocUsername !== undefined) {
      assocUsername.on('change', (ev) => updateVerdict());
    }
    if (assocDate !== undefined) {
      assocDate.on('change', (ev) => updateVerdict());
    }
  });
});
