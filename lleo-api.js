'use strict';

//TODO Use HTTPS

const client = require('bhttp'),
      querystring = require('querystring');

class LinguaLeo {

    constructor(email, password) {
        this._email = email;
        this._password = password;
        this._session = client.session();
    }

    _errorHandler(error, isCritical = false) {
        console.log(error);
        if(isCritical) process.exit(0);
    }

    auth(callback) {
        let authParams = querystring.stringify({
                'email': this._email, 
                'password': this._password, 
                'type': 'login'});

        this._session.get(`${LinguaLeo.apiParams.host}${LinguaLeo.apiParams.auth}?${authParams}`, {},
            (err) => {
                if(err) this._errorHandler(err, true);
                this.checkAuth(callback);
            });
    }

    checkAuth(callback) {
        this._session.get(`${LinguaLeo.apiParams.host}${LinguaLeo.apiParams.checkAuth}`, {},
            (err, resp) => {
                if(err) this._errorHandler(err, true);

                if(resp.body.is_authorized) {
                    console.log('Успешная авторизация в lingualeo');
                    console.log('Нажмите Ctrl+C для выхода'); 
                    callback();
                } else {
                    console.error('Ошибка авторизации, пожалуйста, проверьте e-mail и пароль в файле auth-config.js');
                    process.exit(0);
                }
        });
    }

    getTranslations(word, callback) {
        this._session.get(`${LinguaLeo.apiParams.host}${LinguaLeo.apiParams.getTranslate}?word=${word}`, {},
            (err, resp) => {
                if(err) this._errorHandler(err);

                let respJson = resp.body;

                callback(respJson);
            }
        );
    }

    addWord(word, tword) {
        this._session.get(`${LinguaLeo.apiParams.host}${LinguaLeo.apiParams.addWord}?word=${word}&tword${tword}`, {},
            (err, resp) => {
                if(err) this._errorHandler(err);
            });
        }
}


LinguaLeo.apiParams = {
    host: 'http://api.lingualeo.com',
    auth: '/api/login',
    checkAuth: '/isauthorized',
    getTranslate: '/gettranslates',
    addWord: '/addword'
};

module.exports = LinguaLeo;