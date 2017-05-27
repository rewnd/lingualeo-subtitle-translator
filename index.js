'use strict';

const copypaste = require('copy-paste'),
      notifier = require('node-notifier');

const LinguaLeo = require('./lleo-api.js');

const authConfig = require('./auth-config.js');

//checking if --nodict argument is set

let noDict = process.argv.some((elem) => {
        return elem === '--nodict';
    });

if(noDict) {
    console.log('Установлен параметр --nodict, только показ переводов без добавления в словарь');
}

//clipboard
let clipboard = "";
copypaste.copy(clipboard);

let lingualeo = new LinguaLeo(authConfig.username, authConfig.password);

lingualeo.auth(listenClipboard);

function listenClipboard() {
    let clipboardNew = copypaste.paste();

    if (clipboardNew !== clipboard && clipboardNew.indexOf(" ") === -1 && clipboardNew) {
        clipboard = clipboardNew;
        lingualeo.getTranslations(clipboard, displayTranslations);
    }
    setTimeout(listenClipboard, 300);
}

//functions

function displayTranslations (respJson) {
    let translationError = checkTranslations(respJson);

    if (translationError) {
        displayNotification(isTranslationError);
        return false;
    }

    let notification = {
        title: `${clipboard} [${checkDict(respJson, noDict)}]`,
        message: getTranslationsList(respJson)
    };

    displayNotification(notification);
}

function checkDict(respJson, noDict = true) {
    if(respJson.is_user) {
        return 'Есть в словаре';
    }
    if(!noDict) {
        lingualeo.addWord(clipboard, respJson.translate[0].value);
    }
    return 'Новое слово';
}

function getTranslationsList(respJson) {
    let translations = respJson.translate;
    let translationsList = '';

    translations.forEach((elem) => {
        translationsList += '- ' + elem.value + '\n';
    });

    return translationsList;
}

function checkTranslations(respJson) {
    if(respJson.word_forms === undefined) {
            return {
                title: 'Ошибка при поиске перевода',
                message: respJson.error_msg
            };
        }
    return false;
}

function displayNotification(notification) {
        notifier.notify({
            title: notification.title,
            message: notification.message
        });
}