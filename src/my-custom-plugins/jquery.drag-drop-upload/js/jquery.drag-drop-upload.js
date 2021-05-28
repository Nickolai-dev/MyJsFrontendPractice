
//require("regenerator-runtime/runtime");
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
  let dragDropUpload = (function() {
    let defaults = {
      simulateError: false,
      xhrSender: function (file, simulateError = false) {
        // just upload simulation
        return new Promise(async (resolve, reject) => {
          if (simulateError) {
            file.error = 'error';
            reject('error');
            return;
          }
          let sleep = function (ms) {return new Promise(resolve => setTimeout(resolve, ms))};
          async function stubSend() {
            let rand = 0.5 + Math.random() * 0.5;
            rand*=rand*rand*rand*10;
            file.setProgress(file.progress + rand > 100 ? 100 : file.progress + rand);
            if (file.progress + rand < 100 && !file.stopped) {
              await sleep(100/rand).then(stubSend);
            } else {
              file.uploaded = true;
            }
          }
          await sleep(1000).then(stubSend);
          resolve('sent');
        });
      }
    };
    return {
      init: function (options) {
        options = $.extend({}, defaults, options || {});
        $(this).each(function (i, b) {
          let this_ = $(b), input, dataAction, form;
          if (this_.is('form')) {
            form = this_;
            input = form.find('input');
            dataAction = form.attr('action');
          } else if (this_.is('input')) {
            input = this_;
            dataAction = input.attr('data-action');
            input.wrap('<form class="drag-drop-upload__form"></form>');
            form = input.parents('.drag-drop-upload__form');
          } else {
            console.error('incorrect drag-drop-upload element. Element must be designed as a form or input');
            return;
          }
          form.addClass('drag-drop-upload__form').removeClass('drag-drop-upload')
            .attr({enctype: 'multipart/form-data', method: 'POST', action: dataAction})
            .wrap('<div class="drag-drop-upload"></div>');
          input.addClass('drag-drop-upload__input').removeClass('drag-drop-upload')
            .attr({'type': 'file', 'multiple': '', 'title': ''}).val('')
            .after('<div class="drag-drop-upload__container"></div>')
            .wrap('<div class="drag-drop-upload__input-wrap"></div>');
          let submit = form.find('button[type="submit"]');
          if (submit.length === 0) {
            input.after('<button type="submit">Submit</button>');
            submit = form.find('button[type="submit"]');
          }
          submit.addClass('drag-drop-upload__submit');
          let block = input.parents('.drag-drop-upload'),
              container = block.find('.drag-drop-upload__container');
          if (window.FileReader === undefined) {
            console.error('FileReader is not supported');
            return;
          }
          input.data('store', []);
          let addFilesIntoPull = function(files) {
            for (let i = 0; i < files.length; i++) {
              let f = files[i], fileBlock = createFileBlock(f);
              fileBlock.elem.appendTo(container);
              $.extend(f, {stopped: false, uploaded: false, progress: 0, elements: fileBlock,
                setProgress: function (progress) {
                  f.progress = progress;
                  fileBlock.progressBar.css('width', '' + progress + '%');
                }, stopUpload: function () {
                  f.stopped = true;
                }
              });
              input.data('store').push(f);
              f.elements.cancel.on('click', (ev) => removeFile(f));
              options.xhrSender(f, options.simulateError).catch(reason => {
                fileBlock.progressBar.fadeOut();
                fileBlock.error.fadeIn();
              }).then(value => {
                if (!f.uploaded) {
                  return;
                }
                fileBlock.progressBar.fadeOut();
                fileBlock.success.fadeIn();
                fileBlock.cancel.css('display', 'none');
              });
            }
          }
          let createFileBlock = function(file) {
            let block = $('<div class="drag-drop-file"><div class="drag-drop-file__preview"></div><div class="drag-drop-file__line"><div class="drag-drop-file__size"><span class="drag-drop-file__size-value"></span><span class="drag-drop-file__size-postfix"></span></div></div><div class="drag-drop-file__line"><div class="drag-drop-file__name"></div></div><div class="drag-drop-file__progress"><div class="drag-drop-file__progress-bar" style="width: 0%"></div></div><div class="drag-drop-file__cancel"><i class="fa fa-close"></i></div><div class="drag-drop-file__error"><i class="fa fa-close"></i></div><div class="drag-drop-file__success"><i class="fa fa-check"></i></div></div>'),
                preview = block.find('.drag-drop-file__preview'), name = block.find('.drag-drop-file__name'),
                sizeElem = block.find('.drag-drop-file__size'), sizeVal = block.find('.drag-drop-file__size-value'),
                sizePostfix = block.find('.drag-drop-file__size-postfix'),
                progress = block.find('.drag-drop-file__progress'), progressBar = block.find('.drag-drop-file__progress-bar'),
                success = block.find('.drag-drop-file__success'), cancel = block.find('.drag-drop-file__cancel'), error = block.find('.drag-drop-file__error');
            name.text(file.name || file.fileName);
            success.hide();
            error.hide();
            let fileSize = file.size || file.fileSize, postfixes = ['B', 'KB', 'MB', 'GB'], postfix = 'B';
            (function getSize(i) {
              if (fileSize < 1024 || postfixes.length <= i) {
                return;
              } else {
                fileSize = fileSize / 1024;
                postfix = postfixes[i+1];
                getSize(i+1);
              }
            })(0);
            sizeVal.text(Math.round(fileSize * 10) / 10);
            sizePostfix.text(postfix);
            let reader = new FileReader();
            reader.onload = function (ev) {
              preview.css({'background': 'url("' + ev.target.result + '") 100% 100% no-repeat',
                            'background-size': 'cover'});
            }
            reader.readAsDataURL(file);
            return {elem: block, name: name, sizeValue: sizeVal, sizePostfix: sizePostfix, progressBar: progressBar,
                    success: success, cancel: cancel, error: error};
          }
          let removeFile = function(file) {
            let store = input.data('store'), del = store.filter(f => (f.name || f.fileName) === (file.name || file.fileName));
            input.data('store', store.filter(f => (f.name || f.fileName) !== (file.name || file.fileName)));
            for (let i = 0; i < del.length; i++) {
              del[i].stopUpload();
              del[i].elements.elem.remove();
            }
          };
          input.on('change', function (ev) {
            addFilesIntoPull(input[0].files);
          });
          container.on('dragenter', function (ev) {
            block.addClass('drag-drop-upload_drag-hover');
          }).on('mouseenter', function (ev) {
            block.addClass('drag-drop-upload_hover');
          });
          input.on('dragleave mouseup drop', function (ev) {
            block.removeClass('drag-drop-upload_drag-hover');
          }).on('mouseleave', function (ev) {
            block.removeClass('drag-drop-upload_hover');
          });
        });
      },
      getAllFilesList: function() {
        return $(this).data('store');
      }
    }
  }());
  $.fn.extend({
    dragDropUpload: dragDropUpload.init,
    getAllFilesList: dragDropUpload.getAllFilesList
  });
}));

