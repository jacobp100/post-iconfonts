import { extname } from 'path';
import postIconfonts from '../src';

const input = document.getElementsByClassName('input')[0];
const generate = document.getElementsByClassName('generate')[0];
const download = document.getElementsByClassName('download')[0];

const inputTypes = {
  '.css': 'css',
  '.otf': 'font',
  '.ttf': 'font',
  '.woff': 'font',
  '.eot': 'font',
};

const loadFileHandlers = {
  css: 'readAsText',
  font: 'readAsArrayBuffer',
};

const state = {
  css: null,
  font: null,
};

const updateUi = () => {
  input.classList.toggle('has-css', Boolean(state.css));
  input.classList.toggle('has-font', Boolean(state.font));

  if (state.css && state.font) {
    generate.removeAttribute('disabled');
  }
};

const fileType = file => inputTypes[extname(file.name)];

const loadFile = file => new Promise(res => {
  const type = fileType(file);
  const fileReader = new FileReader();
  fileReader.onload = () => res(fileReader.result);
  fileReader[loadFileHandlers[type]](file);
});

document.addEventListener('dragenter', e => {
  document.body.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('dragover', e => {
  e.preventDefault();
});

document.addEventListener('drop', e => {
  e.preventDefault();

  document.body.classList.remove('dragging');

  const filesArray = [].slice.call(e.dataTransfer.files);

  const readFilesAndUpdateState = [
    filesArray.find(file => fileType(file) === 'css'),
    filesArray.find(file => fileType(file) === 'font'),
  ].reduce((promise, file) => {
    if (!file) return promise;

    return promise
      .then(() => loadFile(file))
      .then(contents => {
        state[fileType(file)] = contents;
      });
  }, Promise.resolve());

  readFilesAndUpdateState
    .then(() => {
      updateUi();
    });
});

generate.addEventListener('click', () => {
  const svg = postIconfonts(state.css, state.font);
  download.classList.remove('disabled');
  download.setAttribute('href', `data:image/svg+xml;utf8,${svg}`);
});
