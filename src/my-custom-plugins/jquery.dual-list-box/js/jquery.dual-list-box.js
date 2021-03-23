

;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
  let dualListBox = (function() {
    let defaults = {
      leftSelect: undefined,
      rightSelect: undefined
    };
    return {
      init: function (options) {
        options = $.extend({}, defaults, options || {});
        let this_ = $(this), select1, select2;
        if (options.leftSelect !== undefined && options.rightSelect !== undefined) {
          select1 = $(options.leftSelect);
          select2 = $(options.rightSelect);
        } else {
          select1 = $(this_.find('select[multiple]')[0]);
          select2 = $(this_.find('select[multiple]')[1]);
        }
        if (select2.is(select1)) {
          throw new Error('You must select 2 different select lists; lists must be multiple');
        }
        select1.hide();
        select2.hide();
        let list1 = {block: $('<div class="dual-list-box"><div class="dual-list-box__comment"></div><div class="dual-list-box__filter"><input type="text" class="dual-list-box__filter-input"></div><div class="dual-list-box__list-wrapper"><div class="dual-list-box__move-all"></div><div class="dual-list-box__list-container"></div></div></div>')},
            list2 = {block: list1.block.clone()}, doc = $(document), selection = {first: undefined, last: undefined, selection: undefined};
        let createOption = function(optionNative) {
          let option = $('<div class="dual-list-box__option"></div>');
          option.attr('value', optionNative.value).text(optionNative.innerHTML);
          return option;
        }
        let createNativeOption = function(option) {
          let optionNative = $('<option></option>');
          optionNative.attr({'selected': '', value: option.attr('value')}).text(option.text());
          return optionNative;
        }
        let updateForward = function() {
          let payload = [];
          this.optionsNative = this.selectNative.find('option');
          for (let i = 0; i < this.optionsNative.length; i++) {
            let option = createOption(this.optionsNative[i]);
            payload.push(option);
          }
          list.options = payload;
          list.container.empty().append(payload);
        }
        let updateReverse = function() {
          let payload = [];
          for (let i = 0; i < this.options.length; i++) {
            let option = createNativeOption(this.options[i]);
            payload.push(option);
          }
          list.selectNative.empty().append(payload);
        }
        let createSelection = function() {
          if (selection.first === undefined) {
            return;
          }
          let sel;
          if (selection.last === undefined || (selection.first.index() < selection.last.index())) {
            sel = selection.first.nextUntil(selection.last).add(selection.first).add(selection.last);
          } else if (selection.first.index() === selection.last.index()) {
            sel = selection.first.nextUntil(selection.first.next()).add(selection.first);
          } else {
            first = selection.last;
            last = selection.first;
            sel = selection.last.nextUntil(selection.first).add(selection.last).add(selection.first);
          }

          list1.container.add(list2.container).children('.dual-list-box__option').removeClass('dual-list-box__option_selected')
          sel.addClass('dual-list-box__option_selected');
          selection.selection = sel;
        }
        let preDrag = function(ev) {
          let elem = $(ev.target);
          if (elem.is('.dual-list-box__option')) {
            selection.first = selection.last = elem;
          }
          createSelection();
        }
        let onDrag = function (ev) {
          let elem = $(ev.target);
          if (elem.is('.dual-list-box__option')) {
            selection.last = elem;
          }
          createSelection();
        }
        let dragEnd = function (ev) {
          selection.last = selection.first = undefined;
          move.call(this);
        }
        let move = function() {
          let another = [list1, list2].filter(l => l !== this)[0];
          selection.selection.appendTo(another.container);
          updateReverse.call(another);
          selection.selection.removeClass('dual-list-box__option_selected');
        }
        let insertOptions = function (options) {

        }
        for (let i = 0; i < 2; i++) {
          let list = [list1, list2][i];
          list.selectNative = [select1, select2][i];
          list.comment = list.block.find('.dual-list-box__comment');
          list.filterInput = list.block.find('.dual-list-box__filter input');
          list.moveAllBtn = list.block.find('.dual-list-box__move-all');
          list.moveAllBtn.append('<i class="fa ' + ['fa-caret-right', 'fa-caret-left'][i] + '"></i><i class="fa ' + ['fa-caret-right', 'fa-caret-left'][i] + '"></i>');
          list.container = list.block.find('.dual-list-box__list-container');
          list.block.insertAfter(list.selectNative);
          updateForward.call(list);
          list.container.on('mousedown', ev => {
            preDrag.call(list, ev);
            doc.on('mousemove.dualListBoxDrag', e => onDrag.call(list, e));
            doc.on('mouseup.dualListBoxDrag', e => {
              doc.off('mousemove.dualListBoxDrag mouseup.dualListBoxDrag');
              dragEnd.call(list, ev);
            });
          });
        }
      }, addOptions: function (options) {

      }
    }
  }());
  $.fn.extend({
    dualListBox: dualListBox.init,
    addListOptions: dualListBox.addOptions
  });
}));
