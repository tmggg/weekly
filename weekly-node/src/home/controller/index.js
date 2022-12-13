'use strict';
const Base = require('./base');
import { AuthenticationClient } from 'authing-js-sdk';
const authing = new AuthenticationClient({
  appId: '638571c2c32b42b731183076',
  appHost: 'https://sxw1n2ru4tzb7w2p.authing.cn',
  secret: '5c9aae81e3fba5367f415b9597fa0efe',
  redirectUri: 'http://localhost:8362/user/callBack?',
});
module.exports = class extends Base {
  /*获取登入和登出列表*/
  async indexAction() {
    var url = authing.buildAuthorizeUrl({
      scope: 'openid profile offline_access',
      tenantId: '63918150b9636f665c244ab5',
    });
    this.ctx.status = 302;
    this.ctx.redirect(url);
    return this.success;
  }
};
