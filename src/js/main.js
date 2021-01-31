var $ = require("jquery/dist/jquery");
require("popper.js/dist/popper");
require("bootstrap/js/src/util");
require("bootstrap/js/src/dropdown");
require("bootstrap/js/src/modal");
require("bootstrap/js/src/button");
require("bootstrap/js/src/tab");
require("bootstrap/js/src/collapse");
window.jQuery = window.$ = $;


let getActualSizes = function (s, b=undefined) {
  let elem = typeof s === 'string' ? $(s) : s,
      blockingBlock = b ? (typeof b === 'string' ? $(b) : b) : elem, previousCss  = blockingBlock.attr("style");
  blockingBlock.css({position: 'absolute', visibility: 'hidden', display: 'block'});
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
$(function () {
  const scrollSensitivity = 24;
  const componentPath = $('<li class="current-path__entity"><a href="#" class="current-path__text"></a><span class="current-path__divider">/</span></li>')
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
});
